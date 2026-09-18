import apiClient from './apiClient';
import { Patient, PatientStatus, PatientStats, PatientVital, ClinicalNote, Prescription } from '../packages/shared/types';
import {
    cachePatients,
    getCachedPatients,
    getCachedPatientById,
    updateCachedPatient,
    addOutboxItem,
} from '../services/offlineDb';
import {
    calculateNEWS2,
    parseBloodPressure,
    normalizeTemperatureToCelsius,
    evaluatePrescriptionSafety,
} from '../packages/shared/clinicalDecisionSupport';

export interface PatientFilters {
    search?: string;
    tenantId?: string;
    status?: string;
    department?: string;
    bloodType?: string;
}

export const getPatients = async (filters?: PatientFilters): Promise<Patient[]> => {
    try {
        const response = await apiClient.get<Patient[]>('/patients', { params: filters });
        if (Array.isArray(response.data)) {
            // Asynchronously populate offline IndexedDB cache
            cachePatients(response.data).catch((e) => console.warn('Cache write failed:', e));
        }
        return response.data;
    } catch (err: any) {
        // Fallback to IndexedDB cache when disconnected or offline
        console.info('[Offline-Resilience] Network unavailable, querying IndexedDB cache...');
        const cached = await getCachedPatients();
        if (cached && cached.length > 0) {
            let filtered = cached;
            if (filters?.search) {
                const q = filters.search.toLowerCase();
                filtered = filtered.filter(
                    (p) =>
                        p.name.toLowerCase().includes(q) ||
                        p.id.toLowerCase().includes(q) ||
                        (p.phone && p.phone.includes(q))
                );
            }
            if (filters?.status) {
                filtered = filtered.filter((p) => p.status === filters.status);
            }
            if (filters?.department) {
                filtered = filtered.filter((p) => p.assignedDepartment === filters.department);
            }
            return filtered;
        }
        throw err;
    }
};

export const getPatientById = async (id: string): Promise<Patient> => {
    try {
        const response = await apiClient.get<Patient>(`/patients/${id}`);
        if (response.data) {
            updateCachedPatient(response.data).catch((e) => console.warn('Cache update failed:', e));
        }
        return response.data;
    } catch (err: any) {
        const cached = await getCachedPatientById(id);
        if (cached) {
            console.info(`[Offline-Resilience] Loaded patient ${id} from IndexedDB cache.`);
            return cached;
        }
        throw err;
    }
};

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
    try {
        const response = await apiClient.post<Patient>('/patients', data);
        if (response.data) {
            await updateCachedPatient(response.data);
        }
        return response.data;
    } catch (err: any) {
        // Offline registration
        const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const offlinePatient: Patient = {
            id: tempId,
            mrn: data.mrn || `MRN-OFF-${Date.now().toString().slice(-4)}`,
            firstName: data.firstName || (data.name ? data.name.split(' ')[0] : 'Patient'),
            lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : 'Offline'),
            name: data.name || `${data.firstName || 'Patient'} ${data.lastName || 'Offline'}`,
            tenantId: data.tenantId || 'tenant_default',
            tenantName: data.tenantName || 'Facility',
            dateOfBirth: data.dateOfBirth || '1990-01-01',
            gender: data.gender || 'Other',
            phone: data.phone || 'N/A',
            email: data.email || 'patient@offline.local',
            address: data.address || '',
            emergencyContact: data.emergencyContact || {
                name: 'Emergency Contact',
                relationship: 'Next of Kin',
                phone: data.phone || 'N/A',
            },
            bloodType: data.bloodType || 'Unknown',
            status: data.status || PatientStatus.Outpatient,
            primaryPhysician: data.primaryPhysician || 'Dr. On-Duty',
            assignedDepartment: data.assignedDepartment || 'Outpatient (OPD)',
            roomNumber: data.roomNumber,
            allergies: data.allergies || [],
            chronicConditions: data.chronicConditions || [],
            insuranceProvider: data.insuranceProvider || 'Cash / Self-Pay',
            insurancePolicyNumber: data.insurancePolicyNumber || 'N/A',
            admissionDate: data.admissionDate || new Date().toISOString(),
            dischargeDate: null,
            vitals: data.vitals || {
                bloodPressure: '120/80',
                heartRate: 75,
                temperature: 36.6,
                respiratoryRate: 16,
                oxygenSaturation: 98,
                recordedAt: new Date().toISOString(),
            },
            notes: [],
            prescriptions: [],
            labResults: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await updateCachedPatient(offlinePatient);
        await addOutboxItem({
            action: 'REGISTER_PATIENT',
            patientId: tempId,
            patientName: offlinePatient.name,
            payload: data,
        });

        return offlinePatient;
    }
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
    try {
        const response = await apiClient.put<Patient>(`/patients/${id}`, data);
        if (response.data) {
            await updateCachedPatient(response.data);
        }
        return response.data;
    } catch (err: any) {
        const existing = await getCachedPatientById(id);
        if (existing) {
            const updated: Patient = {
                ...existing,
                ...data,
                updatedAt: new Date().toISOString(),
            };
            await updateCachedPatient(updated);
            await addOutboxItem({
                action: 'UPDATE_PATIENT',
                patientId: id,
                patientName: existing.name,
                payload: data,
            });
            return updated;
        }
        throw err;
    }
};

export const deletePatient = async (id: string): Promise<{ success: boolean; id: string }> => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
};

export const updatePatientVitals = async (id: string, vitals: PatientVital): Promise<Patient> => {
    try {
        const response = await apiClient.post<Patient>(`/patients/${id}/vitals`, vitals);
        if (response.data) {
            await updateCachedPatient(response.data);
        }
        return response.data;
    } catch (err: any) {
        // Compute NEWS2 locally in offline mode
        const bp = parseBloodPressure(vitals.bloodPressure);
        const celsiusTemp = normalizeTemperatureToCelsius(vitals.temperature);
        const news2 = calculateNEWS2({
            respiratoryRate: vitals.respiratoryRate,
            oxygenSaturation: vitals.oxygenSaturation,
            onSupplementalOxygen: Boolean(vitals.onSupplementalOxygen),
            systolicBp: bp.systolic,
            heartRate: vitals.heartRate,
            temperature: celsiusTemp,
            consciousness: vitals.consciousness || 'Alert',
        });

        const completeVitals: PatientVital = {
            ...vitals,
            systolicBp: bp.systolic,
            diastolicBp: bp.diastolic,
            news2Score: news2.totalScore,
            news2RiskLevel: news2.riskLevel,
            news2ClinicalAction: news2.clinicalAction,
            news2MonitoringFrequency: news2.monitoringFrequency,
            recordedAt: new Date().toISOString(),
        };

        const existing = await getCachedPatientById(id);
        if (existing) {
            const updated: Patient = {
                ...existing,
                vitals: completeVitals,
                status: news2.totalScore >= 7 ? PatientStatus.Critical : existing.status,
                updatedAt: new Date().toISOString(),
            };
            await updateCachedPatient(updated);
            await addOutboxItem({
                action: 'UPDATE_VITALS',
                patientId: id,
                patientName: existing.name,
                payload: completeVitals,
            });
            return updated;
        }
        throw err;
    }
};

export const addPatientNote = async (
    id: string,
    note: Omit<ClinicalNote, 'id' | 'createdAt'>
): Promise<Patient> => {
    try {
        const response = await apiClient.post<Patient>(`/patients/${id}/notes`, note);
        if (response.data) {
            await updateCachedPatient(response.data);
        }
        return response.data;
    } catch (err: any) {
        const existing = await getCachedPatientById(id);
        if (existing) {
            const fullNote: ClinicalNote = {
                ...note,
                id: `note_off_${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            const updated: Patient = {
                ...existing,
                notes: [fullNote, ...(existing.notes || [])],
                updatedAt: new Date().toISOString(),
            };
            await updateCachedPatient(updated);
            await addOutboxItem({
                action: 'ADD_CLINICAL_NOTE',
                patientId: id,
                patientName: existing.name,
                payload: note,
            });
            return updated;
        }
        throw err;
    }
};

export const addPatientPrescription = async (
    id: string,
    prescription: Omit<Prescription, 'id'>
): Promise<Patient> => {
    try {
        const response = await apiClient.post<Patient>(`/patients/${id}/prescriptions`, prescription);
        if (response.data) {
            await updateCachedPatient(response.data);
        }
        return response.data;
    } catch (err: any) {
        const existing = await getCachedPatientById(id);
        if (existing) {
            const fullRx: Prescription = {
                ...prescription,
                id: `rx_off_${Date.now()}`,
            };
            const updated: Patient = {
                ...existing,
                prescriptions: [fullRx, ...(existing.prescriptions || [])],
                updatedAt: new Date().toISOString(),
            };
            await updateCachedPatient(updated);
            await addOutboxItem({
                action: 'ADD_PRESCRIPTION',
                patientId: id,
                patientName: existing.name,
                payload: prescription,
            });
            return updated;
        }
        throw err;
    }
};

export const getPatientStats = async (tenantId?: string): Promise<PatientStats> => {
    try {
        const response = await apiClient.get<PatientStats>('/patients/stats', { params: { tenantId } });
        return response.data;
    } catch (err: any) {
        // Derive stats from local cache
        const cached = await getCachedPatients();
        const admittedCount = cached.filter((p) => p.status === PatientStatus.Admitted).length;
        const outpatientCount = cached.filter((p) => p.status === PatientStatus.Outpatient).length;
        const criticalCount = cached.filter((p) => p.status === PatientStatus.Critical).length;
        const dischargedCount = cached.filter((p) => p.status === PatientStatus.Discharged).length;
        return {
            totalPatients: cached.length,
            admittedCount,
            outpatientCount,
            criticalCount,
            dischargedCount,
            newLast30Days: cached.length,
        };
    }
};

export const evaluatePrescriptionSafetyApi = async (
    id: string,
    medication: string
): Promise<{
    proposedMedication: string;
    alerts: Array<{
        type: string;
        severity: string;
        title: string;
        clinicalEffect: string;
        recommendation: string;
        requiresOverride: boolean;
    }>;
    hasSevereAlerts: boolean;
    patientAllergies: string[];
}> => {
    try {
        const response = await apiClient.post(`/patients/${id}/evaluate-prescription`, { medication });
        return response.data;
    } catch (err: any) {
        // In offline mode, run the CDSS safety check on the client using local cache!
        const patient = await getCachedPatientById(id);
        const existingMeds = (patient?.prescriptions || [])
            .filter((p) => p.status === 'Active')
            .map((p) => ({ medication: p.medication, status: p.status }));
        const allergies = patient?.allergies || [];

        const alerts = evaluatePrescriptionSafety(medication, existingMeds, allergies);
        const hasSevereAlerts = alerts.some((a) => a.severity === 'contraindicated' || a.severity === 'major');
        return {
            proposedMedication: medication,
            alerts,
            hasSevereAlerts,
            patientAllergies: allergies,
        };
    }
};


