import { PatientStatusEnum } from "./patient.entity";
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import {
  calculateNEWS2,
  parseBloodPressure,
  evaluatePrescriptionSafety,
} from './clinical-decision-support';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(tenantId?: string): Promise<Patient[]> {
    const query = this.patientsRepository.createQueryBuilder('patient');
    if (tenantId) {
      query.where('patient.tenantId = :tenantId', { tenantId });
    }
    query.orderBy('patient.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }
    return patient;
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Patient';
    const mrn = data.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const patient = this.patientsRepository.create({
      ...data,
      name: fullName,
      mrn,
    });
    return this.patientsRepository.save(patient);
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const patient = await this.findOne(id);
    const updated = Object.assign(patient, data);
    return this.patientsRepository.save(updated);
  }

  async updateVitals(id: string, vitals: any): Promise<Patient> {
    const patient = await this.findOne(id);

    // Compute standardized NEWS2 score automatically
    const bp = parseBloodPressure(vitals.bloodPressure || '120/80');
    const systolicBp = Number(vitals.systolicBp || bp.systolic || 120);
    const respiratoryRate = Number(vitals.respiratoryRate || 16);
    const oxygenSaturation = Number(vitals.oxygenSaturation || 98);
    const heartRate = Number(vitals.heartRate || 72);
    const temperature = Number(vitals.temperature || 37.0);
    const consciousness = vitals.consciousness || 'Alert';
    const onSupplementalOxygen = Boolean(vitals.onSupplementalOxygen);

    const news2 = calculateNEWS2({
      respiratoryRate,
      oxygenSaturation,
      onSupplementalOxygen,
      systolicBp,
      heartRate,
      temperature,
      consciousness,
      isHypercapnicRespiratoryFailure: Boolean(vitals.isHypercapnicRespiratoryFailure),
    });

    const enrichedVitals = {
      ...vitals,
      systolicBp,
      diastolicBp: bp.diastolic,
      consciousness,
      onSupplementalOxygen,
      news2Score: news2.totalScore,
      news2RiskLevel: news2.riskLevel,
      news2ClinicalAction: news2.clinicalAction,
      news2MonitoringFrequency: news2.monitoringFrequency,
      recordedAt: vitals.recordedAt || new Date().toISOString(),
    };

    patient.vitals = enrichedVitals;

    // Automatic clinical escalation if High Risk (NEWS2 >= 7) and currently routine
    if (news2.totalScore >= 7 && patient.status !== PatientStatusEnum.Emergency) {
      patient.status = 'CRITICAL' as any;
    }

    return this.patientsRepository.save(patient);
  }

  async evaluatePrescription(id: string, proposedMedication: string) {
    const patient = await this.findOne(id);
    const activePrescriptions = Array.isArray((patient as any).prescriptions)
      ? (patient as any).prescriptions
      : [];
    const patientAllergies = Array.isArray(patient.allergies) ? patient.allergies : [];

    const alerts = evaluatePrescriptionSafety(
      proposedMedication,
      activePrescriptions,
      patientAllergies,
    );

    return {
      proposedMedication,
      alerts,
      hasSevereAlerts: alerts.some((a) => a.requiresOverride),
      patientAllergies,
    };
  }

  async addNote(id: string, note: any): Promise<Patient> {
    const patient = await this.findOne(id);
    const notes = Array.isArray((patient as any).notes) ? (patient as any).notes : [];
    notes.unshift({
      id: `nt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...note,
    });
    (patient as any).notes = notes;
    return this.patientsRepository.save(patient);
  }

  async addPrescription(id: string, prescription: any): Promise<Patient> {
    const patient = await this.findOne(id);
    const prescriptions = Array.isArray((patient as any).prescriptions) ? (patient as any).prescriptions : [];
    const patientAllergies = Array.isArray(patient.allergies) ? patient.allergies : [];

    // Pharmacological Safety & Allergy Pre-Check
    const safetyAlerts = evaluatePrescriptionSafety(
      prescription.medication,
      prescriptions,
      patientAllergies,
    );

    const hasSevereAlert = safetyAlerts.some((a) => a.requiresOverride);

    // Enforce clinical override justification for severe contraindicated interactions or allergy conflicts
    if (hasSevereAlert && !prescription.clinicalOverrideReason?.trim()) {
      throw new BadRequestException({
        message: 'Prescription blocked by Patient Safety Engine: High-risk drug interaction or allergy conflict detected. A clinical override justification is required.',
        safetyAlerts,
      });
    }

    prescriptions.unshift({
      id: `rx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...prescription,
      safetyAlerts: safetyAlerts.map((a) => `${a.title}: ${a.clinicalEffect}`),
      interactionWarningAcknowledged: Boolean(prescription.clinicalOverrideReason),
    });
    (patient as any).prescriptions = prescriptions;
    return this.patientsRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }
  }

  async count(): Promise<number> {
    return this.patientsRepository.count();
  }

  async getStats(tenantId?: string) {
    const totalPatients = await this.patientsRepository.count(tenantId ? { where: { tenantId } } : {});
    const admittedPatients = await this.patientsRepository.count({
      where: tenantId ? { tenantId, status: PatientStatusEnum.Inpatient } : { status: PatientStatusEnum.Inpatient },
    });
    const dischargedPatients = await this.patientsRepository.count({
      where: tenantId ? { tenantId, status: PatientStatusEnum.Discharged } : { status: PatientStatusEnum.Discharged },
    });
    const criticalPatients = await this.patientsRepository.count({
      where: tenantId ? { tenantId, status: PatientStatusEnum.Emergency } : { status: PatientStatusEnum.Emergency },
    });
    const activePatients = Math.max(0, totalPatients - dischargedPatients);

    return {
      totalPatients,
      activePatients,
      admittedPatients,
      dischargedPatients,
      criticalPatients,
    };
  }
}
