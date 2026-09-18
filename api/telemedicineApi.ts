import {
    TelemedicineAppointment,
    TelemedicineStatus,
    TelemedicineUrgency,
    TelemedicineStats,
    ConsultationTranscriptItem,
    DiagnosticSuggestion,
} from '../packages/shared/types';
import { getStoredPatients } from './mockPatientData';
import { addPatientNote, addPatientPrescription, updatePatientVitals } from './patientsApi';

const STORAGE_KEY = 'raphamis_mock_telemedicine_v1';

const initialAppointments: TelemedicineAppointment[] = [
    {
        id: 'tele_001',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 68,
        patientGender: 'Female',
        patientPhone: '+1 (555) 345-6789',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        providerId: 'usr_doc_01',
        providerName: 'Dr. Sarah Lin, MD',
        providerSpecialty: 'Cardiovascular Medicine',
        scheduledTime: '2026-09-10T09:15:00.000Z',
        durationMinutes: 25,
        status: 'Waiting',
        urgency: 'Urgent',
        chiefComplaint: 'Recurrent morning palpitations and dizziness following ACE-inhibitor dosage titration.',
        roomCode: 'CARDIO-ROOM-882',
        rpmVitals: {
            heartRate: 88,
            bloodPressure: '142/90',
            spO2: 97,
            respiratoryRate: 18,
            temperature: 98.8,
            ecgStatus: 'Sinus Tachycardia / Trace PVCs',
        },
        allergies: ['Penicillin', 'Sulfa Drugs'],
        createdAt: '2026-09-10T08:00:00.000Z',
    },
    {
        id: 'tele_002',
        patientId: 'pat_002',
        patientName: 'Liam Montgomery',
        patientMRN: 'MRN-33104',
        patientAge: 9,
        patientGender: 'Male',
        patientPhone: '+1 (555) 456-7890',
        tenantId: 'tnt_002',
        tenantName: "Mercy Children's Clinic",
        providerId: 'usr_doc_02',
        providerName: 'Dr. Marcus Vance, FAAP',
        providerSpecialty: 'Pediatric Pulmonology',
        scheduledTime: '2026-09-10T09:00:00.000Z',
        durationMinutes: 30,
        status: 'In Consultation',
        urgency: 'Routine',
        chiefComplaint: 'Bimonthly asthma control evaluation, peak flow meter review, and school physical clearance.',
        roomCode: 'PEDS-AIR-412',
        rpmVitals: {
            heartRate: 92,
            bloodPressure: '106/68',
            spO2: 99,
            respiratoryRate: 20,
            temperature: 98.4,
            ecgStatus: 'Normal Sinus Rhythm',
        },
        allergies: ['Peanuts', 'Tree Nuts'],
        createdAt: '2026-09-10T07:30:00.000Z',
    },
    {
        id: 'tele_003',
        patientId: 'pat_003',
        patientName: 'Sarah Jenkins',
        patientMRN: 'MRN-19402',
        patientAge: 42,
        patientGender: 'Female',
        patientPhone: '+1 (555) 678-1234',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        providerId: 'usr_doc_01',
        providerName: 'Dr. Sarah Lin, MD',
        providerSpecialty: 'Internal Medicine',
        scheduledTime: '2026-09-10T10:00:00.000Z',
        durationMinutes: 20,
        status: 'Waiting',
        urgency: 'Urgent',
        chiefComplaint: 'Acute migraine with visual aura and persistent nausea non-responsive to sumatriptan.',
        roomCode: 'NEURO-EXP-109',
        rpmVitals: {
            heartRate: 84,
            bloodPressure: '130/84',
            spO2: 98,
            respiratoryRate: 16,
            temperature: 99.1,
            ecgStatus: 'Normal Sinus Rhythm',
        },
        allergies: ['Aspirin', 'Codeine'],
        createdAt: '2026-09-10T08:30:00.000Z',
    },
    {
        id: 'tele_004',
        patientId: 'pat_004',
        patientName: 'David Brooks',
        patientMRN: 'MRN-58210',
        patientAge: 55,
        patientGender: 'Male',
        patientPhone: '+1 (555) 901-2345',
        tenantId: 'tnt_004',
        tenantName: 'Apex Orthopedic Institute',
        providerId: 'usr_doc_04',
        providerName: 'Dr. Arthur Pendelton, MD',
        providerSpecialty: 'Orthopedic Surgery',
        scheduledTime: '2026-09-10T08:30:00.000Z',
        durationMinutes: 20,
        status: 'Completed',
        urgency: 'Post-Op',
        chiefComplaint: 'Post-operative total knee arthroplasty (Day 14) wound healing assessment and flexion range test.',
        roomCode: 'ORTHO-REC-014',
        rpmVitals: {
            heartRate: 74,
            bloodPressure: '124/78',
            spO2: 99,
            respiratoryRate: 15,
            temperature: 98.6,
            ecgStatus: 'Normal Sinus Rhythm',
        },
        soapNotes: {
            subjective: 'Patient reports well-managed post-surgical pain (3/10 on numerical scale). Able to ambulate with single cane.',
            objective: 'Right knee surgical incision clean, well-approximated, no erythema or purulent drainage. Active flexion 105 degrees.',
            assessment: 'Uncomplicated post-operative recovery following right total knee replacement.',
            plan: 'Continue outpatient physical therapy 3x/week. Wean off acetaminophen. Follow-up in clinic in 4 weeks with weight-bearing AP/Lateral X-rays.',
        },
        prescriptions: [
            {
                medication: 'Acetaminophen Extra Strength',
                dosage: '500mg',
                frequency: 'Q6H PRN pain',
                instructions: 'Do not exceed 3000mg in 24 hours.',
            },
        ],
        diagnosis: 'Z96.651 - Presence of right artificial knee joint',
        allergies: ['Latex'],
        createdAt: '2026-09-10T07:00:00.000Z',
    },
    {
        id: 'tele_005',
        patientId: 'pat_005',
        patientName: 'Emily Rodriguez',
        patientMRN: 'MRN-72019',
        patientAge: 31,
        patientGender: 'Female',
        patientPhone: '+1 (555) 234-9876',
        tenantId: 'tnt_003',
        tenantName: 'Northwest Community Medical',
        providerId: 'usr_doc_05',
        providerName: 'Dr. Elena Rostova, PsyD',
        providerSpecialty: 'Tele-Psychiatry & Behavioral Health',
        scheduledTime: '2026-09-10T11:30:00.000Z',
        durationMinutes: 45,
        status: 'Scheduled',
        urgency: 'Routine',
        chiefComplaint: 'Generalized anxiety management, sleep architecture review, and cognitive reframing check-in.',
        roomCode: 'MIND-CARE-771',
        rpmVitals: {
            heartRate: 76,
            bloodPressure: '118/74',
            spO2: 99,
            respiratoryRate: 14,
            temperature: 98.5,
            ecgStatus: 'Normal Sinus Rhythm',
        },
        allergies: [],
        createdAt: '2026-09-10T08:15:00.000Z',
    },
    {
        id: 'tele_006',
        patientId: 'pat_006',
        patientName: 'Robert Langdon',
        patientMRN: 'MRN-44912',
        patientAge: 62,
        patientGender: 'Male',
        patientPhone: '+1 (555) 345-0987',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        providerId: 'usr_doc_01',
        providerName: 'Dr. Sarah Lin, MD',
        providerSpecialty: 'Cardiovascular Medicine',
        scheduledTime: '2026-09-10T14:00:00.000Z',
        durationMinutes: 20,
        status: 'Scheduled',
        urgency: 'Follow-up',
        chiefComplaint: 'Quarterly lipid panel review and lifestyle risk factor consultation.',
        roomCode: 'LIPID-CARD-302',
        rpmVitals: {
            heartRate: 70,
            bloodPressure: '126/82',
            spO2: 98,
            respiratoryRate: 16,
            temperature: 98.6,
            ecgStatus: 'Normal Sinus Rhythm',
        },
        allergies: ['Shellfish'],
        createdAt: '2026-09-10T08:45:00.000Z',
    },
];

export const getStoredAppointments = (): TelemedicineAppointment[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Fallback
    }
    saveStoredAppointments(initialAppointments);
    return initialAppointments;
};

export const saveStoredAppointments = (appointments: TelemedicineAppointment[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {
        // Ignore write failures
    }
};

export interface TelemedicineFilters {
    status?: string;
    urgency?: string;
    tenantId?: string;
    search?: string;
}

export const getTelemedicineAppointments = async (
    filters?: TelemedicineFilters
): Promise<TelemedicineAppointment[]> => {
    let items = getStoredAppointments();

    if (filters?.status && filters.status !== 'All') {
        items = items.filter((a) => a.status === filters.status);
    }
    if (filters?.urgency && filters.urgency !== 'All') {
        items = items.filter((a) => a.urgency === filters.urgency);
    }
    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        items = items.filter((a) => a.tenantId === filters.tenantId);
    }
    if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(
            (a) =>
                a.patientName.toLowerCase().includes(q) ||
                a.patientMRN.toLowerCase().includes(q) ||
                a.chiefComplaint.toLowerCase().includes(q) ||
                a.providerName.toLowerCase().includes(q) ||
                a.roomCode.toLowerCase().includes(q)
        );
    }

    return items;
};

export const getAppointmentById = async (id: string): Promise<TelemedicineAppointment | undefined> => {
    const list = getStoredAppointments();
    return list.find((a) => a.id === id);
};

export const createAppointment = async (
    data: Omit<TelemedicineAppointment, 'id' | 'createdAt' | 'roomCode'>
): Promise<TelemedicineAppointment> => {
    const list = getStoredAppointments();
    const newAppointment: TelemedicineAppointment = {
        ...data,
        id: `tele_${Date.now()}`,
        roomCode: `CARE-ROOM-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
    };
    const updated = [newAppointment, ...list];
    saveStoredAppointments(updated);
    return newAppointment;
};

export const updateAppointmentStatus = async (
    id: string,
    status: TelemedicineStatus
): Promise<TelemedicineAppointment> => {
    const list = getStoredAppointments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
        throw new Error('Appointment not found');
    }
    list[index] = {
        ...list[index],
        status,
    };
    saveStoredAppointments(list);
    return list[index];
};

export const completeConsultation = async (
    id: string,
    payload: {
        soapNotes: {
            subjective: string;
            objective: string;
            assessment: string;
            plan: string;
        };
        prescriptions: Array<{
            medication: string;
            dosage: string;
            frequency: string;
            instructions: string;
        }>;
        diagnosis: string;
        vitals?: any;
    }
): Promise<TelemedicineAppointment> => {
    const list = getStoredAppointments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
        throw new Error('Appointment not found');
    }

    const appt = list[index];
    const updatedAppt: TelemedicineAppointment = {
        ...appt,
        status: 'Completed',
        soapNotes: payload.soapNotes,
        prescriptions: payload.prescriptions,
        diagnosis: payload.diagnosis,
        rpmVitals: payload.vitals || appt.rpmVitals,
    };

    list[index] = updatedAppt;
    saveStoredAppointments(list);

    // Synchronize to real Patient record in patientsApi / EHR
    try {
        if (appt.patientId) {
            // Add Clinical Note to Patient EHR
            const content = `[Telemedicine Consultation Encounter]\nChief Complaint: ${appt.chiefComplaint}\n\nSOAP NOTE:\n(S) ${payload.soapNotes.subjective}\n(O) ${payload.soapNotes.objective}\n(A) ${payload.soapNotes.assessment}\n(P) ${payload.soapNotes.plan}\n\nDiagnosis: ${payload.diagnosis}`;
            await addPatientNote(appt.patientId, {
                author: appt.providerName,
                role: appt.providerSpecialty,
                category: 'Consultation',
                content,
            });

            // Add Prescriptions to Patient EHR
            if (payload.prescriptions && payload.prescriptions.length > 0) {
                for (const rx of payload.prescriptions) {
                    await addPatientPrescription(appt.patientId, {
                        medication: rx.medication,
                        dosage: rx.dosage,
                        frequency: rx.frequency,
                        prescribedBy: appt.providerName,
                        startDate: new Date().toISOString().split('T')[0],
                        status: 'Active',
                    });
                }
            }

            // Update vitals
            if (payload.vitals) {
                await updatePatientVitals(appt.patientId, {
                    bloodPressure: payload.vitals.bloodPressure || '120/80',
                    heartRate: payload.vitals.heartRate || 72,
                    temperature: payload.vitals.temperature || 98.6,
                    respiratoryRate: payload.vitals.respiratoryRate || 16,
                    oxygenSaturation: payload.vitals.spO2 || 98,
                    recordedAt: new Date().toISOString(),
                });
            }
        }
    } catch {
        // Continue even if background EHR sync fails
    }

    return updatedAppt;
};

export const getTelemedicineStats = async (tenantId?: string): Promise<TelemedicineStats> => {
    const list = getStoredAppointments();
    const filtered = tenantId && tenantId !== 'ALL' ? list.filter((a) => a.tenantId === tenantId) : list;

    const active = filtered.filter((a) => a.status === 'In Consultation').length;
    const waiting = filtered.filter((a) => a.status === 'Waiting').length;
    const scheduled = filtered.filter((a) => a.status === 'Scheduled' || a.status === 'Waiting' || a.status === 'In Consultation').length;

    return {
        activeConsultations: active || 2,
        waitingQueue: waiting,
        scheduledToday: scheduled,
        avgConsultationTime: 18,
        satisfactionScore: 4.9,
        rpmDevicesConnected: 48,
    };
};
