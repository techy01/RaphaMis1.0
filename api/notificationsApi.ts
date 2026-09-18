import {
    InterDepartmentNotification,
    DischargeGatepass,
    HospitalDepartment,
    NotificationPriority,
    NotificationCategory,
} from '../packages/shared/types';

const NOTIFICATIONS_STORAGE_KEY = 'raphamis_interdept_notifications_v1';
const GATEPASSES_STORAGE_KEY = 'raphamis_discharge_gatepasses_v1';

export const INITIAL_NOTIFICATIONS: InterDepartmentNotification[] = [
    {
        id: 'notif_001',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
        sourceDepartment: 'Triage',
        targetDepartment: 'Consultation / OPD',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMrn: 'MRN-48201',
        priority: 'CRITICAL_STAT',
        category: 'TRIAGE_ESCALATION',
        title: 'Emergency Triage Escalation: ESI Level 2',
        message: 'Patient presenting with acute retrosternal chest pain (radiating to left arm), SpO2 91%, BP 184/102. Graduated directly to Resuscitation Bay 1 / Dr. Lin.',
        read: false,
        actionUrl: '/patients',
        actionLabel: 'Open Patient Chart',
        metadata: {
            acuityLevel: 2,
            wardBed: 'Emergency Bay 01',
        },
    },
    {
        id: 'notif_002',
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        sourceDepartment: 'Laboratory',
        targetDepartment: 'Inpatient Ward',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-84920',
        priority: 'CRITICAL_STAT',
        category: 'PANIC_VALUE_ALERT',
        title: 'Critical Lab Panic Value: Serum Potassium 6.4 mmol/L',
        message: 'Analyte K+ exceeds upper critical threshold (> 6.0 mmol/L). Cardiac arrhythmia risk. Immediate verbal readback notification initiated with Ward 3B Charge Nurse.',
        read: false,
        actionUrl: '/laboratory',
        actionLabel: 'Review Lab Panic Sheet',
        metadata: {
            panicValue: 'K+ 6.4 mmol/L',
            wardBed: 'Bed 304',
        },
    },
    {
        id: 'notif_003',
        timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        sourceDepartment: 'Consultation / OPD',
        targetDepartment: 'Pharmacy',
        patientId: 'pat_003',
        patientName: 'Maria Rodriguez',
        patientMrn: 'MRN-39104',
        priority: 'URGENT',
        category: 'ORDER_TRANSMITTED',
        title: 'STAT CPOE Prescription Transmitted',
        message: 'Dr. Evelyn Kariuki ordered IV Ceftriaxone 2g STAT + IV Paracetamol 1g for acute pyelonephritis. Please dispense to Day Ward Nursing.',
        read: false,
        actionUrl: '/pharmacy',
        actionLabel: 'Dispense Meds',
        metadata: {
            orderId: 'rx_cpoe_88192',
        },
    },
    {
        id: 'notif_004',
        timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
        sourceDepartment: 'Pharmacy',
        targetDepartment: 'Billing / Cashier',
        patientId: 'pat_10492',
        patientName: 'Beatrice Wanjiku',
        patientMrn: 'MRN-10492',
        priority: 'ROUTINE',
        category: 'CHARGE_POSTED',
        title: 'Pharmacy Dispense Completed: Charge Dispatched to Folio',
        message: 'Post-op oxytocin infusion and antibiotic pack dispensed. Automated itemized charge of KES 32,500 ($250.00) posted to Patient Folio BILL-2026-0841.',
        read: true,
        actionUrl: '/billing',
        actionLabel: 'View Patient Folio',
        metadata: {
            billId: 'bill_001',
            amount: 250,
        },
    },
    {
        id: 'notif_005',
        timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        sourceDepartment: 'Inpatient Ward',
        targetDepartment: 'Billing / Cashier',
        patientId: 'pat_10492',
        patientName: 'Beatrice Wanjiku',
        patientMrn: 'MRN-10492',
        priority: 'DISCHARGE_CLEARANCE',
        category: 'DISCHARGE_REQUESTED',
        title: 'Clinical Discharge Signed: Final Financial Audit Requested',
        message: 'Dr. Evelyn Kariuki signed off the clinical discharge summary for Maternity Suite Bed 03. Please reconcile SHA insurance co-pay and prepare discharge gatepass.',
        read: true,
        actionUrl: '/billing',
        actionLabel: 'Audit Bill & Clearance',
        metadata: {
            wardBed: 'Private Post-Partum Suite 03',
        },
    },
    {
        id: 'notif_006',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        sourceDepartment: 'Billing / Cashier',
        targetDepartment: 'Security / Gatepass',
        patientId: 'pat_10492',
        patientName: 'Beatrice Wanjiku',
        patientMrn: 'MRN-10492',
        priority: 'DISCHARGE_CLEARANCE',
        category: 'GATEPASS_ISSUED',
        title: 'Discharge Gatepass GP-2026-0941 Issued & Cleared',
        message: 'Account settled in full via SHA Scheme + M-Pesa (Ref: QHX99182LA). Security Gatepass authorized for discharge via Vehicle KDD 842P.',
        read: true,
        actionUrl: '/billing',
        actionLabel: 'View Security Gatepass',
        metadata: {
            gatepassNumber: 'GP-2026-0941',
        },
    },
    {
        id: 'notif_007',
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        sourceDepartment: 'Security / Gatepass',
        targetDepartment: 'Reception',
        patientId: 'pat_004',
        patientName: 'Samuel Kamau',
        patientMrn: 'MRN-20491',
        priority: 'ROUTINE',
        category: 'GATE_CLEARED',
        title: 'Security Gatepass Cleared: Patient Exited Facility',
        message: 'Gatepass GP-2026-0899 scanned and verified at Main Perimeter Gate 1 by Officer Otieno. Patient officially exited premises.',
        read: true,
        actionUrl: '/patients',
        actionLabel: 'Patient History',
        metadata: {
            gatepassNumber: 'GP-2026-0899',
        },
    },
];

export const INITIAL_GATEPASSES: DischargeGatepass[] = [
    {
        id: 'gp_001',
        gatepassNumber: 'GP-2026-0941',
        patientId: 'pat_10492',
        patientName: 'Beatrice Wanjiku',
        patientMrn: 'MRN-10492',
        gender: 'Female',
        age: 29,
        admittedDate: '2026-09-06T08:30:00.000Z',
        dischargeDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Evelyn Kariuki, MD (OB/GYN)',
        physicianLicenseNumber: 'KMPDC/2014/9082',
        department: 'Maternity & Obstetrics',
        wardRoom: 'Private Post-Partum Suite - Room 03',
        admittingDiagnosis: 'Full-Term Pregnancy (39 wks) with Prior C-Section',
        finalDischargeDiagnosis: 'Elective Repeat Cesarean Section; Healthy Live Infant; Post-Op Recovery Uncomplicated',
        clinicalDischargeCleared: true,
        clinicalDischargeClearedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        clinicalDischargeClearedBy: 'Dr. Evelyn Kariuki, MD',
        financialClearanceStatus: 'CLEARED',
        billId: 'bill_001',
        totalBillAmount: 2450.0,
        patientSettledAmount: 2450.0,
        currency: 'USD',
        receiptNumber: 'RCP-2026-0841',
        cashierName: 'Jane Mwangi (Cash Desk #2)',
        cashierSignedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        authorizedEscortName: 'James Kariuki',
        authorizedEscortPhone: '+254 722 401 928',
        authorizedEscortRelation: 'Spouse',
        transportMode: 'Private Vehicle',
        vehiclePlateNumber: 'KDD 842P',
        securityGateStatus: 'PENDING_EXIT',
        securityOfficerName: 'Sergeant Otieno (Main Gate 1)',
        securityGateNumber: 'Gate 01 - North Perimeter',
        qrVerificationHash: 'SHA256-VERIFIED-GATEPASS-GP-2026-0941-RAPHAMIS',
    },
    {
        id: 'gp_002',
        gatepassNumber: 'GP-2026-0899',
        patientId: 'pat_004',
        patientName: 'Samuel Kamau',
        patientMrn: 'MRN-20491',
        gender: 'Male',
        age: 44,
        admittedDate: '2026-09-08T10:15:00.000Z',
        dischargeDate: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Sarah Lin, MD (Internal Medicine)',
        physicianLicenseNumber: 'KMPDC/2011/4412',
        department: 'General Medical Ward',
        wardRoom: 'Medical Ward B - Bed 14',
        admittingDiagnosis: 'Bacterial Lobar Pneumonia',
        finalDischargeDiagnosis: 'Resolved Right Middle Lobe Pneumonia; Completed IV Antibiotic Course; Oral Step-Down Prescribed',
        clinicalDischargeCleared: true,
        clinicalDischargeClearedAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
        clinicalDischargeClearedBy: 'Dr. Sarah Lin, MD',
        financialClearanceStatus: 'CLEARED',
        billId: 'bill_004',
        totalBillAmount: 1120.0,
        patientSettledAmount: 1120.0,
        currency: 'USD',
        receiptNumber: 'RCP-2026-0802',
        cashierName: 'Peter Omondi (Cash Desk #1)',
        cashierSignedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        authorizedEscortName: 'Grace Kamau',
        authorizedEscortPhone: '+254 733 118 492',
        authorizedEscortRelation: 'Sister',
        transportMode: 'Taxi / Ride-hail',
        vehiclePlateNumber: 'KBZ 194M (Uber Ride)',
        securityGateStatus: 'CLEARED_EXIT',
        securityOfficerName: 'Officer Kiprono (Main Gate 1)',
        securityGateNumber: 'Gate 01 - North Perimeter',
        securityVerifiedAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
        securityNotes: 'Physical barcode scanned. Verified photo ID and zero balance clearance slip.',
        qrVerificationHash: 'SHA256-VERIFIED-GATEPASS-GP-2026-0899-RAPHAMIS',
    },
];

export const getStoredNotifications = (): InterDepartmentNotification[] => {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
        const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
            return INITIAL_NOTIFICATIONS;
        }
        return JSON.parse(raw);
    } catch {
        return INITIAL_NOTIFICATIONS;
    }
};

export const saveStoredNotifications = (notifs: InterDepartmentNotification[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch (e) {
        console.warn('Failed to save notifications', e);
    }
};

export const getStoredGatepasses = (): DischargeGatepass[] => {
    if (typeof window === 'undefined') return INITIAL_GATEPASSES;
    try {
        const raw = localStorage.getItem(GATEPASSES_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(GATEPASSES_STORAGE_KEY, JSON.stringify(INITIAL_GATEPASSES));
            return INITIAL_GATEPASSES;
        }
        return JSON.parse(raw);
    } catch {
        return INITIAL_GATEPASSES;
    }
};

export const saveStoredGatepasses = (passes: DischargeGatepass[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GATEPASSES_STORAGE_KEY, JSON.stringify(passes));
    } catch (e) {
        console.warn('Failed to save gatepasses', e);
    }
};

export const createDischargeGatepass = (
    pass: Omit<DischargeGatepass, 'id' | 'gatepassNumber' | 'qrVerificationHash'>
): DischargeGatepass => {
    const list = getStoredGatepasses();
    const num = `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPass: DischargeGatepass = {
        ...pass,
        id: `gp_${Date.now()}`,
        gatepassNumber: num,
        qrVerificationHash: `SHA256-VERIFIED-${num}-${Date.now()}`,
    };
    const updated = [newPass, ...list];
    saveStoredGatepasses(updated);

    // Also auto-dispatch an interdepartmental notification to Security & Ward
    const notifs = getStoredNotifications();
    const newNotif: InterDepartmentNotification = {
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sourceDepartment: 'Billing / Cashier',
        targetDepartment: 'Security / Gatepass',
        patientId: pass.patientId,
        patientName: pass.patientName,
        patientMrn: pass.patientMrn,
        priority: 'DISCHARGE_CLEARANCE',
        category: 'GATEPASS_ISSUED',
        title: `Official Discharge Gatepass ${num} Authorized`,
        message: `Patient ${pass.patientName} (${pass.patientMrn}) cleared for exit. Escort: ${pass.authorizedEscortName}. Mode: ${pass.transportMode} (${pass.vehiclePlateNumber || 'N/A'}).`,
        read: false,
        actionUrl: '/billing',
        actionLabel: 'Verify Gatepass',
        metadata: {
            gatepassNumber: num,
            billId: pass.billId,
        },
    };
    saveStoredNotifications([newNotif, ...notifs]);

    return newPass;
};

export const verifyAndReleaseGatepass = (
    gatepassId: string,
    officerName: string,
    gateNumber: string
): DischargeGatepass => {
    const list = getStoredGatepasses();
    const idx = list.findIndex((g) => g.id === gatepassId);
    if (idx === -1) throw new Error('Gatepass not found');

    const updatedPass: DischargeGatepass = {
        ...list[idx],
        securityGateStatus: 'CLEARED_EXIT',
        securityOfficerName: officerName,
        securityGateNumber: gateNumber,
        securityVerifiedAt: new Date().toISOString(),
        securityNotes: `Physical verification confirmed by Officer ${officerName} at ${gateNumber}. Exit barcode invalidated.`,
    };

    list[idx] = updatedPass;
    saveStoredGatepasses(list);

    // Auto-dispatch notification to Reception/Administration
    const notifs = getStoredNotifications();
    const exitNotif: InterDepartmentNotification = {
        id: `notif_exit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sourceDepartment: 'Security / Gatepass',
        targetDepartment: 'Reception',
        patientId: updatedPass.patientId,
        patientName: updatedPass.patientName,
        patientMrn: updatedPass.patientMrn,
        priority: 'ROUTINE',
        category: 'GATE_CLEARED',
        title: `Patient Exit Verified: Gatepass ${updatedPass.gatepassNumber}`,
        message: `Patient ${updatedPass.patientName} has physically departed through ${gateNumber}. Verified by ${officerName}. Lifecycle complete.`,
        read: false,
        actionUrl: '/billing',
        actionLabel: 'View Closed Folio',
        metadata: {
            gatepassNumber: updatedPass.gatepassNumber,
        },
    };
    saveStoredNotifications([exitNotif, ...notifs]);

    return updatedPass;
};
