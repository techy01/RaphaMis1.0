export enum UserRole {
    Superadmin = 'Superadmin',
    TenantAdmin = 'Tenant-Admin',
    Doctor = 'Doctor',
    Nurse = 'Nurse',
    Billing = 'Billing',
    Pharmacist = 'Pharmacist',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export enum TenantStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Suspended = 'Suspended',
    Trial = 'Trial',
}

export interface TenantBranding {
    logoUrl?: string; // Data URL or Image URL
    primaryColor: string; // Hex color e.g. '#0d9488'
    accentColor: string; // Hex color e.g. '#0284c7'
    secondaryColor?: string; // Hex color e.g. '#0f172a'
    hospitalMotto?: string; // e.g. 'Excellence in Compassionate Care'
    headerBgStyle?: 'white' | 'tint' | 'dark'; // Surface style for headers
    facilityCode?: string; // e.g. 'STJ-001'
    supportEmail?: string;
    supportPhone?: string;
    portalBannerText?: string;
    letterheadFooter?: string;
    lastUpdated?: string;
}

export interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: TenantStatus;
    subscriptionPlan: string;
    paymentStatus?: 'Paid' | 'Pending' | 'Failed';
    activationStatus?: 'Active' | 'Pending Activation';
    paymentMethodType?: 'mobile_money' | 'card' | 'wire' | 'ach';
    paymentReference?: string;
    wireTransferInvoiceNumber?: string;
    initialCredentialsSent?: boolean;
    temporaryPassword?: string;
    institutionType?: string;
    branding?: TenantBranding;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStats {
    totalTenants: number;
    activeTenants: number;
    totalPatients: number;
    totalRevenue: number;
}

export enum InvoiceStatus {
    Paid = 'Paid',
    Pending = 'Pending',
    Overdue = 'Overdue',
    Cancelled = 'Cancelled',
}

export interface Invoice {
    id: string;
    tenantId: string;
    tenant: Tenant; // Relation loaded from backend
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: InvoiceStatus;
    createdAt: string;
}

// ============================================================================
// Multi-Tender Split Billing & Clinical Co-pay Payment Data Models
// ============================================================================

export type PaymentTenderType =
    | 'insurance'
    | 'mobile_money'
    | 'cash'
    | 'card'
    | 'bank_transfer'
    | 'waiver';

export interface PaymentTender {
    id: string;
    type: PaymentTenderType;
    label: string;
    amount: number;
    currency: string;
    convertedAmount: number; // Normalized to the bill's currency
    exchangeRateUsed: number;
    referenceNumber: string;
    processedAt: string;
    cashierName: string;
    status: 'Settled' | 'Pending Clearance' | 'Authorized';
    insuranceDetails?: {
        provider: string;
        policyNumber: string;
        preAuthCode: string;
        claimStatus: 'Approved' | 'Pending Adjudication' | 'Rejected';
        copayRequired?: number;
    };
    mobileMoneyDetails?: {
        phoneNumber: string;
        transactionCode: string;
        receiptNumber: string;
        stkPushStatus: 'Success' | 'Pending' | 'Failed';
    };
    cardDetails?: {
        cardBrand: 'Visa' | 'Mastercard' | 'Amex' | 'Verve';
        last4: string;
        authCode: string;
        posTerminalId: string;
    };
    cashDetails?: {
        tendered: number;
        change: number;
        cashDrawerId: string;
    };
    waiverDetails?: {
        authorizedBy: string;
        reason: string;
        approvalDocRef: string;
    };
    notes?: string;
}

export interface BillLineItem {
    id: string;
    description: string;
    category:
        | 'Bed/Room'
        | 'Surgical'
        | 'Consultation'
        | 'Pharmacy'
        | 'Laboratory'
        | 'Radiology'
        | 'Nursing'
        | 'Equipment';
    quantity: number;
    unitPrice: number;
    total: number;
    code?: string;
}

export type PatientBillStatus =
    | 'Paid in Full'
    | 'Partially Paid'
    | 'Pending Insurance'
    | 'Unpaid'
    | 'Disputed';

export interface HospitalPatientBill {
    id: string;
    billNumber: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    patientPhone?: string;
    tenantId: string;
    tenantName: string;
    department: string;
    primaryDoctor: string;
    encounterType:
        | 'Inpatient Stay'
        | 'Emergency Care'
        | 'Outpatient Surgery'
        | 'Specialist Clinic'
        | 'Maternity / Delivery';
    admissionDate: string;
    dischargeDate?: string | null;
    status: PatientBillStatus;
    currency: string;
    lineItems: BillLineItem[];
    subtotal: number;
    discount: number;
    tax: number;
    totalAmount: number;
    totalPaid: number;
    remainingBalance: number;
    tenders: PaymentTender[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLog {
    id: string;
    user: string;
    details: string;
    timestamp: string;
}

export interface RecentActivity {
    logs: AuditLog[];
}

export enum PatientStatus {
    Admitted = 'Admitted',
    Outpatient = 'Outpatient',
    InTreatment = 'In Treatment',
    Discharged = 'Discharged',
    Critical = 'Critical',
}

export type HospitalDepartment =
    | 'Reception'
    | 'Triage'
    | 'Consultation / OPD'
    | 'Inpatient Ward'
    | 'Laboratory'
    | 'Radiology'
    | 'Pharmacy'
    | 'Billing / Cashier'
    | 'Security / Gatepass';

export type NotificationPriority = 'CRITICAL_STAT' | 'URGENT' | 'ROUTINE' | 'DISCHARGE_CLEARANCE';

export type NotificationCategory =
    | 'TRIAGE_ESCALATION'
    | 'ORDER_TRANSMITTED'
    | 'PANIC_VALUE_ALERT'
    | 'DISPENSE_COMPLETED'
    | 'CHARGE_POSTED'
    | 'DISCHARGE_REQUESTED'
    | 'GATEPASS_ISSUED'
    | 'GATE_CLEARED'
    | 'GENERAL_TRANSFER';

export interface InterDepartmentNotification {
    id: string;
    timestamp: string;
    sourceDepartment: HospitalDepartment;
    targetDepartment: HospitalDepartment;
    patientId: string;
    patientName: string;
    patientMrn: string;
    priority: NotificationPriority;
    category: NotificationCategory;
    title: string;
    message: string;
    read: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: {
        acuityLevel?: number; // ESI 1-5
        orderId?: string;
        billId?: string;
        gatepassNumber?: string;
        panicValue?: string;
        wardBed?: string;
        amount?: number;
    };
}

export interface DischargeGatepass {
    id: string;
    gatepassNumber: string; // e.g. "GP-2026-0941"
    patientId: string;
    patientName: string;
    patientMrn: string;
    gender: string;
    age?: number;
    admittedDate: string;
    dischargeDate: string;
    attendingPhysician: string;
    physicianLicenseNumber: string;
    department: string;
    wardRoom: string;
    admittingDiagnosis: string;
    finalDischargeDiagnosis: string;
    clinicalDischargeCleared: boolean;
    clinicalDischargeClearedAt: string;
    clinicalDischargeClearedBy: string;
    financialClearanceStatus: 'CLEARED' | 'PENDING' | 'CORPORATE_GUARANTEE';
    billId: string;
    totalBillAmount: number;
    patientSettledAmount: number;
    currency: string;
    receiptNumber: string;
    cashierName: string;
    cashierSignedAt: string;
    authorizedEscortName: string;
    authorizedEscortPhone: string;
    authorizedEscortRelation: string;
    transportMode: 'Private Vehicle' | 'Ambulance Transfer' | 'Taxi / Ride-hail' | 'Pedestrian Walkout';
    vehiclePlateNumber?: string;
    securityGateStatus: 'PENDING_EXIT' | 'CLEARED_EXIT' | 'FLAGGED_STOP';
    securityOfficerName?: string;
    securityGateNumber?: string;
    securityVerifiedAt?: string;
    securityNotes?: string;
    qrVerificationHash: string;
}

export interface PatientVital {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    recordedAt: string;
    // Clinical Decision Support / NEWS2 Fields
    systolicBp?: number;
    diastolicBp?: number;
    consciousness?: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive' | 'Confusion';
    onSupplementalOxygen?: boolean;
    news2Score?: number;
    news2RiskLevel?: 'Low' | 'Low-Medium' | 'Medium' | 'High';
    news2ClinicalAction?: string;
    news2MonitoringFrequency?: string;
}

export interface ClinicalNote {
    id: string;
    author: string;
    role: string;
    category: 'General' | 'Consultation' | 'Nursing' | 'Discharge';
    content: string;
    createdAt: string;
}

export interface Prescription {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    startDate: string;
    status: 'Active' | 'Completed' | 'Discontinued';
    // Clinical Decision Support / Patient Safety Fields
    clinicalOverrideReason?: string;
    interactionWarningAcknowledged?: boolean;
    safetyAlerts?: string[];
}

export interface LabResult {
    id: string;
    testName: string;
    orderedDate: string;
    result: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Pending';
}

export interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodType: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
    tenantId: string;
    tenantName: string;
    status: PatientStatus;
    primaryPhysician: string;
    assignedDepartment: string;
    roomNumber?: string;
    allergies: string[];
    chronicConditions: string[];
    insuranceProvider: string;
    insurancePolicyNumber: string;
    admissionDate?: string;
    dischargeDate?: string | null;
    vitals: PatientVital;
    notes: ClinicalNote[];
    prescriptions: Prescription[];
    labResults: LabResult[];
    createdAt: string;
    updatedAt: string;
}

export interface PatientStats {
    totalPatients: number;
    admittedCount: number;
    outpatientCount: number;
    criticalCount: number;
    dischargedCount: number;
    newLast30Days: number;
}

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | 'ytd' | '1y';

export interface AnalyticsKpiSummary {
    totalRevenue: number;
    revenueChange: number;
    patientVolume: number;
    patientVolumeChange: number;
    bedOccupancyRate: number;
    occupancyChange: number;
    avgLengthOfStay: number;
    alosChange: number;
    readmissionRate30d: number;
    readmissionChange: number;
    patientSatisfaction: number;
    csatChange: number;
    erAverageWaitTime: number;
    waitChange: number;
    cleanClaimRate: number;
    claimRateChange: number;
}

export interface RevenueTrendPoint {
    period: string;
    inpatient: number;
    outpatient: number;
    pharmacy: number;
    diagnostics: number;
    total: number;
    target: number;
}

export interface DepartmentCensus {
    department: string;
    occupied: number;
    capacity: number;
    utilizationRate: number;
    avgWaitMinutes: number;
    staffRatio: string;
    status: 'Normal' | 'Near Capacity' | 'Critical';
}

export interface FacilityBenchmark {
    tenantId: string;
    tenantName: string;
    tier: string;
    activePatients: number;
    bedOccupancyRate: number;
    monthlyRevenue: number;
    avgLengthOfStay: number;
    qualityScore: number;
    readmissionRate: number;
    status: string;
}

export interface ClinicalQualityMetric {
    id: string;
    name: string;
    category: 'Safety' | 'Efficiency' | 'Care Quality' | 'Compliance';
    currentValue: number;
    targetValue: number;
    unit: string;
    benchmark: string;
    status: 'optimal' | 'warning' | 'alert';
    description: string;
}

export interface PredictiveCapacityPoint {
    date: string;
    dayName: string;
    isForecast: boolean;
    predictedAdmissions: number;
    confidenceLower: number;
    confidenceUpper: number;
    erSurgeIndex: number;
    bedOccupancyForecast: number;
    staffDeficit: number;
}

export interface PayerMixPoint {
    payer: string;
    percentage: number;
    revenue: number;
    claimsCount: number;
    color: string;
}

export interface AnalyticsDataPayload {
    kpis: AnalyticsKpiSummary;
    revenueTrends: RevenueTrendPoint[];
    departmentCensus: DepartmentCensus[];
    facilityBenchmarks: FacilityBenchmark[];
    clinicalQuality: ClinicalQualityMetric[];
    predictiveForecast: PredictiveCapacityPoint[];
    payerMix: PayerMixPoint[];
    acuityDistribution: {
        name: string;
        value: number;
        color: string;
        percentage: number;
    }[];
}

export type TelemedicineStatus = 'Waiting' | 'In Consultation' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Missed';
export type TelemedicineUrgency = 'Urgent' | 'Routine' | 'Follow-up' | 'Post-Op';

export interface TelemedicineAppointment {
    id: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientPhone: string;
    tenantId: string;
    tenantName: string;
    providerId: string;
    providerName: string;
    providerSpecialty: string;
    scheduledTime: string;
    durationMinutes: number;
    status: TelemedicineStatus;
    urgency: TelemedicineUrgency;
    chiefComplaint: string;
    roomCode: string;
    rpmVitals: {
        heartRate: number;
        bloodPressure: string;
        spO2: number;
        respiratoryRate: number;
        temperature: number;
        ecgStatus: string;
    };
    soapNotes?: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    prescriptions?: Array<{
        medication: string;
        dosage: string;
        frequency: string;
        instructions: string;
    }>;
    diagnosis?: string;
    allergies?: string[];
    createdAt: string;
}

export interface ConsultationTranscriptItem {
    id: string;
    speaker: 'Physician' | 'Patient' | 'AI Copilot';
    text: string;
    timestamp: string;
}

export interface DiagnosticSuggestion {
    icd10: string;
    condition: string;
    probability: number;
    supportingFindings: string[];
    contraindications: string[];
}

export interface TelemedicineStats {
    activeConsultations: number;
    waitingQueue: number;
    scheduledToday: number;
    avgConsultationTime: number;
    satisfactionScore: number;
    rpmDevicesConnected: number;
}

// ==========================================
// 21st-Century Pharmacy Data Models & Types
// ==========================================

export type PharmacyTriageStatus =
    | 'Pending Verification'
    | 'In Dispensing'
    | 'Barcode Verification'
    | 'Ready for Delivery'
    | 'Dispensed'
    | 'Clinical Hold';

export type PharmacyTriageUrgency = 'STAT' | 'Urgent' | 'Routine' | 'Discharge';

export type PharmacyOrderRoute =
    | 'IV Piggyback'
    | 'IV Push'
    | 'Continuous Infusion'
    | 'Oral Solid'
    | 'Oral Liquid'
    | 'Subcutaneous'
    | 'Inhalation'
    | 'Topical';

export interface PharmacySafetyAlert {
    id: string;
    type:
        | 'Drug-Allergy'
        | 'Drug-Drug Interaction'
        | 'Renal Dose Adjustment'
        | 'Hepatic Dose Adjustment'
        | 'Therapeutic Duplication'
        | 'High-Alert Med'
        | 'Black Box Warning';
    severity: 'Contraindicated' | 'Major' | 'Moderate' | 'Minor';
    title: string;
    description: string;
    recommendation: string;
    overridden?: boolean;
    overrideReason?: string;
    overriddenBy?: string;
}

export interface PharmacyOrder {
    id: string;
    orderNumber: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientWeightKg: number;
    patientLocation: string;
    patientTenantId: string;
    patientTenantName: string;
    patientDiagnosis: string;
    patientAllergies: string[];
    eGFR: number; // mL/min/1.73m²
    serumCreatinine: number; // mg/dL
    medicationName: string;
    genericName: string;
    ndc: string;
    strength: string;
    dose: string;
    route: PharmacyOrderRoute;
    frequency: string;
    durationDays: number;
    quantityOrdered: number;
    dispensedQuantity?: number;
    instructions: string;
    prescriberName: string;
    prescriberNPI: string;
    prescriberDepartment: string;
    prescribedAt: string;
    urgency: PharmacyTriageUrgency;
    status: PharmacyTriageStatus;
    isHighAlert: boolean;
    isControlledSubstance: boolean;
    scheduleLevel?: 'Schedule II' | 'Schedule III' | 'Schedule IV' | 'Schedule V';
    safetyAlerts: PharmacySafetyAlert[];
    barcode: string;
    assignedDispenser: string;
    deliveryMethod: 'Pneumatic Tube' | 'Bedside Cart Delivery' | 'Nurse Station Pickup' | 'Outpatient Locker';
    tubeStationCode?: string;
    dispensedAt?: string;
    verifiedBy?: string;
    clinicalNotes?: string;
}

export interface PharmacyFormularyItem {
    id: string;
    name: string;
    genericName: string;
    ndc: string;
    category:
        | 'Antimicrobial'
        | 'Cardiovascular'
        | 'Analgesic'
        | 'Emergency / Code'
        | 'Oncology'
        | 'Endocrine'
        | 'Respiratory'
        | 'Neurology';
    formulation: string;
    strength: string;
    stockOnHand: number;
    parLevel: number;
    reorderPoint: number;
    unit: string;
    location: string;
    lotNumber: string;
    expirationDate: string;
    storageTemperature: 'Ambient (15-25°C)' | 'Refrigerated (2-8°C)' | 'Frozen (-20°C)';
    currentTempCelsius?: number;
    isControlled: boolean;
    isHighAlert: boolean;
    unitCost: number;
    tenantId: string;
}

export interface ClinicalIntervention {
    id: string;
    patientId: string;
    patientName: string;
    mrn: string;
    orderNumber: string;
    pharmacistName: string;
    physicianName: string;
    category:
        | 'Renal Dose Adjustment'
        | 'Allergy Interception'
        | 'Drug Interaction'
        | 'IV to PO Conversion'
        | 'Therapeutic Drug Monitoring';
    severity: 'Critical / Life-Threatening' | 'Major Safety Hazard' | 'Moderate Optimization';
    actionTaken: string;
    physicianResponse: 'Accepted & Modified' | 'Accepted - Order Cancelled' | 'Discussed & Overridden' | 'Pending Response';
    preventedAdverseEvent: boolean;
    costSavingsEst: number;
    timestamp: string;
}

export interface PharmacyStats {
    totalOrdersToday: number;
    pendingTriageCount: number;
    statOrdersCount: number;
    inDispensingCount: number;
    barcodePendingCount: number;
    completedTodayCount: number;
    clinicalHoldsCount: number;
    avgStatTurnaroundMinutes: number;
    highAlertInterceptions: number;
    coldChainComplianceRate: number;
    roboticDispensingUptimeRate: number;
}

// ==========================================
// Laboratory Information System (LIS) Types
// ==========================================

export type LabOrderStatus =
    | 'Ordered'
    | 'Sample Collected'
    | 'In Analysis'
    | 'Completed'
    | 'Critical Alert'
    | 'Cancelled';

export type LabUrgency = 'STAT' | 'Urgent' | 'Routine';

export type LabTestCategory =
    | 'Hematology'
    | 'Clinical Chemistry'
    | 'Microbiology'
    | 'Immunology'
    | 'Urinalysis'
    | 'Coagulation'
    | 'Molecular Pathology';

export type LabSpecimenType =
    | 'Venous Whole Blood'
    | 'Serum'
    | 'Plasma'
    | 'Urine'
    | 'CSF'
    | 'Nasopharyngeal Swab'
    | 'Stool'
    | 'Sputum';

export interface LabTestParameter {
    id: string;
    name: string;
    value: string | number | null;
    unit: string;
    referenceRange: string;
    refLow?: number;
    refHigh?: number;
    criticalLow?: number;
    criticalHigh?: number;
    flag?: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low';
    interpretation?: string;
}

export interface LabOrder {
    id: string;
    orderNumber: string;
    accessionNumber: string;
    barcode: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientLocation: string;
    patientTenantId: string;
    patientTenantName: string;
    testPanelName: string;
    category: LabTestCategory;
    specimenType: LabSpecimenType;
    urgency: LabUrgency;
    status: LabOrderStatus;
    orderedAt: string;
    collectedAt?: string;
    receivedInLabAt?: string;
    analyzedAt?: string;
    completedAt?: string;
    orderingPhysicianName: string;
    orderingPhysicianDepartment: string;
    clinicalIndication: string;
    parameters: LabTestParameter[];
    analyzerInstrument?: string;
    technicianNotes?: string;
    pathologistNotes?: string;
    verifiedBy?: string;
    hasCriticalAlert: boolean;
    criticalAlertAcknowledgedBy?: string;
    criticalAlertAcknowledgedAt?: string;
}

export interface LabCatalogTest {
    id: string;
    name: string;
    category: LabTestCategory;
    defaultSpecimen: LabSpecimenType;
    turnaroundHours: number;
    description: string;
    parameters: Array<{
        name: string;
        unit: string;
        referenceRange: string;
        refLow?: number;
        refHigh?: number;
        criticalLow?: number;
        criticalHigh?: number;
    }>;
}

export interface LabStats {
    totalOrdersToday: number;
    pendingCollectionCount: number;
    inTestingCount: number;
    completedTodayCount: number;
    criticalAlertsCount: number;
    avgTurnaroundHours: number;
    statAvgTurnaroundMinutes: number;
}

// ============================================================================
// Phase 5: LIS Analyzer Interfacing, Quality Control (QC) & Pathology Automation
// ============================================================================

export type AnalyzerProtocol = 'ASTM_1394' | 'HL7_V2' | 'SERIAL_RS232' | 'REST_DICOM_LIS';
export type AnalyzerDeviceStatus = 'ONLINE' | 'STANDBY' | 'TRANSMITTING' | 'ERROR' | 'OFFLINE';

export interface LabAnalyzerDevice {
    id: string;
    name: string;
    manufacturer: string;
    model: string;
    protocol: AnalyzerProtocol;
    ipAddress: string;
    port: number;
    status: AnalyzerDeviceStatus;
    supportedDisciplines: LabTestCategory[];
    lastHandshakeAt: string;
    lastPingMs: number;
    totalResultsTransmitted: number;
    errorCount: number;
    isBidirectional: boolean;
    tenantId: string;
    tenantName?: string;
}

export interface AnalyzerRawMessage {
    id: string;
    analyzerId: string;
    analyzerName: string;
    direction: 'INBOUND' | 'OUTBOUND';
    protocol: AnalyzerProtocol;
    rawPayload: string;
    timestamp: string;
    status: 'PARSED_SUCCESS' | 'CHECKSUM_ERROR' | 'UNMATCHED_ORDER';
    orderAccessionMatched?: string;
    parsedParametersCount?: number;
}

export type WestgardRule =
    | 'IN_CONTROL'
    | 'WARNING_1_2S'
    | 'REJECT_1_3S'
    | 'REJECT_2_2S'
    | 'REJECT_R_4S'
    | 'REJECT_4_1S'
    | 'REJECT_10X';

export interface LabQCRun {
    runId: string;
    runNumber: number;
    timestamp: string;
    measuredValue: number;
    zScore: number;
    status: WestgardRule;
    technician: string;
    analyzerInstrument: string;
    correctiveActionTaken?: string;
}

export interface LabQualityControl {
    id: string;
    testParameterName: string;
    category: LabTestCategory;
    controlLevel: 'LEVEL_1_LOW' | 'LEVEL_2_NORMAL' | 'LEVEL_3_HIGH';
    lotNumber: string;
    expirationDate: string;
    targetMean: number;
    standardDeviation: number;
    unit: string;
    runs: LabQCRun[];
    activeStatus: 'IN_CONTROL' | 'OUT_OF_CONTROL' | 'WARNING';
    analyzerName: string;
}

export type SpecimenTubeStatus =
    | 'COLLECTED'
    | 'CENTRIFUGED'
    | 'IN_ANALYZER'
    | 'TESTED'
    | 'ARCHIVED_COLD_STORE'
    | 'DISPOSED';

export type SpecimenCapColor =
    | 'LAVENDER_EDTA'
    | 'RED_SERUM'
    | 'LIGHT_BLUE_CITRATE'
    | 'GREEN_HEPARIN'
    | 'GREY_FLUORIDE'
    | 'YELLOW_SST';

export interface SpecimenTube {
    id: string;
    barcode: string;
    patientMRN: string;
    patientName: string;
    accessionNumber: string;
    orderId: string;
    testPanelName: string;
    tubeColor: SpecimenCapColor;
    specimenType: LabSpecimenType;
    collectionTimestamp: string;
    rackId: string;
    rackSlotPosition: string; // e.g. 'A1', 'B5', 'E10'
    status: SpecimenTubeStatus;
    temperature: string;
    chainOfCustody: Array<{
        action: string;
        performedBy: string;
        timestamp: string;
        notes?: string;
    }>;
}

export interface SpecimenRack {
    id: string;
    code: string;
    name: string;
    totalSlots: number;
    columns: number;
    rows: number;
    department: string;
    temperatureZone: string;
    tubes: SpecimenTube[];
}

export interface CriticalPanicAlert {
    id: string;
    orderId: string;
    orderNumber: string;
    accessionNumber: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    testPanelName: string;
    parameterName: string;
    criticalValue: string | number;
    criticalLimit: string;
    unit: string;
    flag: 'Critical High' | 'Critical Low';
    orderingPhysicianName: string;
    physicianPhone: string;
    smsDispatchStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
    verbalReadbackConfirmed: boolean;
    verbalReadbackBy?: string;
    verbalReadbackAt?: string;
    clinicalActionLogged?: string;
    createdAt: string;
}

// ==========================================
// Radiology Information System (RIS & PACS) Types
// ==========================================

export type RadiologyModality =
    | 'X-Ray (CR/DR)'
    | 'Computed Tomography (CT)'
    | 'Magnetic Resonance Imaging (MRI)'
    | 'Ultrasound (US)'
    | 'Fluoroscopy'
    | 'Mammography'
    | 'Nuclear Medicine';

export type RadiologyStatus =
    | 'Requested'
    | 'Scheduled'
    | 'In Progress'
    | 'Under Review'
    | 'Reported'
    | 'Critical Finding'
    | 'Cancelled';

export type RadiologyUrgency = 'STAT' | 'Urgent' | 'Routine';

export type RadiologyBodyRegion =
    | 'Chest'
    | 'Brain / Head'
    | 'Abdomen & Pelvis'
    | 'Spine'
    | 'Musculoskeletal / Extremity'
    | 'Neck / Soft Tissue'
    | 'Cardiac'
    | 'Vascular';

export interface RadiologyKeyImage {
    title: string;
    description: string;
    sliceInfo: string;
    svgType: 'chest-xray' | 'brain-ct' | 'spine-mri' | 'abdominal-us' | 'knee-xray';
    imageUrl?: string;
}

export interface RadiologyStudy {
    id: string;
    accessionNumber: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientLocation: string;
    patientTenantId: string;
    patientTenantName: string;
    tenantId?: string;
    modality: RadiologyModality;
    procedureName: string;
    bodyRegion: RadiologyBodyRegion;
    urgency: RadiologyUrgency;
    status: RadiologyStatus;
    studyDate?: string;
    studyTime?: string;
    requestedAt: string;
    createdAt?: string;
    scheduledFor?: string;
    performedAt?: string;
    reportedAt?: string;
    orderingPhysicianName: string;
    orderingPhysicianDepartment: string;
    clinicalIndication: string;
    contrastUsed: boolean;
    contrastType?: string;
    technologistNotes?: string;
    radiologistName?: string;
    techniqueDescription?: string;
    findings?: string;
    impression?: string;
    recommendations?: string;
    criticalFindingAlert: boolean;
    criticalFindingAcknowledgedBy?: string;
    criticalFindingAcknowledgedAt?: string;
    imageSeriesCount: number;
    totalImageInstances: number;
    keyImages: RadiologyKeyImage[];
}

export interface RadiologyCatalogProcedure {
    id: string;
    name: string;
    modality: RadiologyModality;
    bodyRegion: RadiologyBodyRegion;
    standardDurationMinutes: number;
    requiresContrast: boolean;
    defaultContrastType?: string;
    preparationInstructions: string;
    description: string;
}

export interface RadiologyStats {
    totalStudiesToday: number;
    pendingAcquisitionCount: number;
    unreportedCount: number;
    completedCount: number;
    criticalFindingsCount: number;
    modalityUtilizationRate: number;
    avgReportTurnaroundMinutes: number;
}

// ==========================================
// Enterprise DICOM & PACS Imaging Types
// ==========================================

export type PacsServerType = 'ORTHANC' | 'DICOMWEB' | 'DCM4CHEE' | 'GENERIC_DIMSE' | 'LOCAL_ARCHIVE';

export interface PacsServerConfig {
    id: string;
    name: string;
    type: PacsServerType;
    aeTitle: string;
    host: string;
    port: number;
    dicomwebUrl?: string;
    username?: string;
    password?: string;
    isDefault: boolean;
    status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
    lastEchoTime?: string;
    lastLatencyMs?: number;
    tenantId?: string;
}

export interface DicomInstance {
    id: string;
    sopInstanceUid: string;
    seriesInstanceUid: string;
    instanceNumber: number;
    rows: number;
    columns: number;
    bitsAllocated: number;
    windowCenter?: number;
    windowWidth?: number;
    rescaleIntercept?: number;
    rescaleSlope?: number;
    photometricInterpretation: 'MONOCHROME1' | 'MONOCHROME2' | 'RGB';
    sliceLocation?: number;
    sliceThickness?: number;
    pixelSpacing?: [number, number]; // [row spacing, col spacing] in mm
    frameTime?: number;
    numberOfFrames?: number;
    imageUrl: string;
    dicomFileUrl?: string;
    metadataTags?: Record<string, any>;
}

export interface DicomSeries {
    id: string;
    seriesInstanceUid: string;
    studyInstanceUid: string;
    seriesNumber: number;
    seriesDescription: string;
    modality: string;
    bodyPartExamined: string;
    numberOfInstances: number;
    sliceThickness?: number;
    pixelSpacing?: [number, number];
    instances: DicomInstance[];
}

export interface DicomStudy {
    id: string;
    studyInstanceUid: string;
    accessionNumber: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientBirthDate?: string;
    patientSex?: string;
    studyDate: string;
    studyTime?: string;
    studyDescription: string;
    modality: RadiologyModality | string;
    modalitiesInStudy: string[];
    seriesCount: number;
    instanceCount: number;
    institutionName?: string;
    pacsServerId?: string;
    pacsServerName?: string;
    series: DicomSeries[];
    previewThumbnailUrl?: string;
    status: 'ONLINE' | 'ARCHIVED' | 'NEARLINE' | 'LOCAL';
    tenantId: string;
    storagePath?: string;
    createdAt: string;
}

export interface DicomMeasurement {
    id: string;
    type: 'RULER' | 'ANGLE' | 'ELLIPSE_ROI' | 'RECT_ROI' | 'ARROW' | 'CTR';
    points: Array<{ x: number; y: number }>;
    label: string;
    value: string;
    color: string;
    unit?: string;
}

// ==========================================
// Inventory & Supply Chain Management Types
// ==========================================

export type InventoryCategory =
    | 'Surgical & Wound Care'
    | 'Pharmaceuticals & Solutions'
    | 'Diagnostic & Lab Reagents'
    | 'PPE & Infection Control'
    | 'Biomedical Equipment'
    | 'General Medical Consumables';

export type InventoryStockStatus =
    | 'In Stock'
    | 'Low Stock'
    | 'Out of Stock'
    | 'Expiring Soon'
    | 'Overstocked';

export type StockMovementType =
    | 'Receipt / Procurement'
    | 'Department Transfer'
    | 'Clinical Dispense'
    | 'Cycle Count Adjustment'
    | 'Return / Write-Off';

export interface StockMovement {
    id: string;
    itemId: string;
    itemSku: string;
    itemName: string;
    type: StockMovementType;
    quantityDelta: number;
    quantityBefore: number;
    quantityAfter: number;
    performedBy: string;
    destinationDepartment?: string;
    timestamp: string;
    reason: string;
    poNumber?: string;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    category: InventoryCategory;
    tenantId: string;
    tenantName: string;
    storageLocation: string;
    quantityOnHand: number;
    unitOfMeasure: string;
    reorderLevel: number;
    targetMaxStock: number;
    unitCost: number;
    status: InventoryStockStatus;
    lotNumber?: string;
    expirationDate?: string;
    supplierName: string;
    lastRestockedAt?: string;
    notes?: string;
}

export type PurchaseOrderStatus =
    | 'Draft'
    | 'Pending Approval'
    | 'Dispatched'
    | 'Received'
    | 'Cancelled';

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    tenantId: string;
    tenantName: string;
    supplierName: string;
    supplierContact?: string;
    itemId: string;
    itemName: string;
    itemSku: string;
    quantity: number;
    unitCost: number;
    totalAmount: number;
    status: PurchaseOrderStatus;
    orderedAt: string;
    expectedDeliveryDate?: string;
    receivedAt?: string;
    approvedBy?: string;
    notes?: string;
}

export interface InventoryStats {
    totalValuation: number;
    totalSKUs: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    pendingPOCount: number;
}

// ==========================================
// Patient Portal Types
// ==========================================

export type PortalAccountStatus = 'Active' | 'Invited' | 'Pending Verification' | 'Suspended';

export interface PortalUserAccount {
    id: string;
    patientId: string;
    patientMrn: string;
    patientName: string;
    email: string;
    phone: string;
    tenantId: string;
    tenantName: string;
    status: PortalAccountStatus;
    mfaEnabled: boolean;
    lastLoginAt?: string;
    registeredAt: string;
}

export type PortalAppointmentType =
    | 'In-Person Consultation'
    | 'Video Telemedicine'
    | 'Follow-up'
    | 'Routine Checkup';

export type PortalAppointmentStatus = 'Confirmed' | 'Pending Approval' | 'Cancelled' | 'Completed';

export interface PortalAppointmentBooking {
    id: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    tenantId: string;
    tenantName: string;
    providerName: string;
    specialty: string;
    appointmentType: PortalAppointmentType;
    requestedDate: string;
    requestedTimeSlot: string;
    reasonForVisit: string;
    status: PortalAppointmentStatus;
    createdAt: string;
    notes?: string;
}

export type PortalMessageCategory =
    | 'General Medical Question'
    | 'Prescription Refill Inquiry'
    | 'Lab Result Clarification'
    | 'Billing & Insurance Question'
    | 'Appointment Inquiry';

export type PortalMessageStatus = 'Unread' | 'In Review' | 'Replied' | 'Resolved';

export interface PortalMessageThreadItem {
    id: string;
    sender: 'patient' | 'provider';
    senderName: string;
    content: string;
    timestamp: string;
    attachmentName?: string;
}

export interface PortalSecureMessage {
    id: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    providerId?: string;
    providerName: string;
    tenantId: string;
    tenantName: string;
    subject: string;
    category: PortalMessageCategory;
    priority: 'Routine' | 'Urgent';
    status: PortalMessageStatus;
    lastMessageAt: string;
    thread: PortalMessageThreadItem[];
}

export type PortalRefillStatus = 'Pending Review' | 'Approved & Sent' | 'Denied';

export interface PortalRefillRequest {
    id: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    tenantId: string;
    tenantName: string;
    medicationName: string;
    dosage: string;
    preferredPharmacy: string;
    requestDate: string;
    status: PortalRefillStatus;
    reviewedBy?: string;
    notes?: string;
}

export interface PortalEngagementStats {
    activePortalUsers: number;
    onlineAppointmentsBooked: number;
    secureMessagesCount: number;
    pendingRefillRequests: number;
    onlinePaymentsTotal: number;
}

// -------------------------------------------------------------
// Super Admin & World-Class Subscription Module Interfaces
// -------------------------------------------------------------

export type SubscriptionTier = 'Starter Clinic' | 'Community Hospital' | 'Enterprise Health System' | 'Sovereign Cloud';

export type BillingCycle = 'Monthly' | 'Annually';

export type SubscriptionStatus = 'Active' | 'Trial' | 'Past Due' | 'Suspended' | 'Renewing Soon';

export interface SubscriptionPlanFeature {
    id: string;
    name: string;
    description: string;
    included: boolean;
}

export interface SubscriptionPlan {
    id: string;
    tier: SubscriptionTier;
    tagline: string;
    badge?: string;
    monthlyPrice: number;
    annualPrice: number; // per month when paid annually
    maxBeds: number;
    maxProviderSeats: number;
    includedStorageGb: number;
    highlightFeatures: string[];
    allFeatures: {
        category: string;
        items: { name: string; included: boolean; note?: string }[];
    }[];
}

export interface SubscriptionAddon {
    id: string;
    name: string;
    description: string;
    category: 'AI & Diagnostics' | 'Storage & Archiving' | 'Integrations' | 'Patient Experience';
    monthlyPrice: number;
    annualPrice: number;
    unitLabel?: string;
    enabled?: boolean;
}

export interface TenantSubscription {
    id: string;
    tenantId: string;
    tenantName: string;
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
    status: SubscriptionStatus;
    monthlyRate: number;
    annualRate: number;
    licensedBeds: number;
    maxBeds: number;
    providerSeats: number;
    maxProviderSeats: number;
    storageAllocatedGb: number;
    storageUsedGb: number;
    startDate: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    renewalDate: string;
    autoRenew: boolean;
    paymentMethod: {
        type: 'card' | 'ach' | 'wire' | 'mobile_money' | 'invoice_net30';
        brand?: string;
        last4?: string;
        expiry?: string;
        institutionName?: string;
        phoneNumber?: string;
        transactionCode?: string;
        invoiceNumber?: string;
    };
    activeAddons: {
        addonId: string;
        name: string;
        monthlyPrice: number;
        enabled: boolean;
    }[];
    contactPerson: string;
    contactEmail: string;
    region: 'US-East (N. Virginia)' | 'US-West (Oregon)' | 'EU-Central (Frankfurt)' | 'APAC (Singapore)';
    baaSigned: boolean;
    fhirEnabled: boolean;
    dicomArchiveTier: string;
    notes?: string;
    activationStatus?: 'Active' | 'Pending Activation';
    paymentStatus?: 'Paid' | 'Pending' | 'Failed';
    paymentReference?: string;
    temporaryPassword?: string;
    credentialsSentAt?: string;
}

export interface ExecutiveDashboardData {
    arr: number;
    mrr: number;
    mrrGrowthMoM: number;
    expansionRevenueMoM: number;
    netDollarRetention: number;
    totalHospitalTenants: number;
    totalClinicalFacilities: number;
    activeInpatientBeds: number;
    totalMonitoredBeds: number;
    activeProviderSeats: number;
    monthlyPatientEncounters: number;
    totalDiagnosticStudies: number;
    telemedicineConsultations: number;
    averageDischargeSpeedupPercent: number;
    smartInventorySavingsTotal: number;
    cleanClaimsRate: number;
    averageLabTurnaroundMinutes: number;
    slaUptimePercent: number;
    avgPlatformLatencyMs: number;
}

// ============================================================================
// School / Institutional Subscription & Multi-Channel Payment Types
// ============================================================================

export type SubscriptionPaymentChannel = 'mobile_money' | 'card' | 'wire';

export interface WireTransferSettings {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftBic: string;
    branchName: string;
    branchCode: string;
    currency: string;
    routingNumber?: string;
    paymentInstructions: string;
    supportPhone: string;
    supportEmail: string;
    updatedAt?: string;
}

export interface SubscriptionCheckoutPayload {
    tenantName: string;
    institutionType: 'School / Academy / University' | 'Outpatient Clinic / Medical Center' | 'Hospital / Inpatient Facility' | 'Health Network';
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
    paymentMethod: SubscriptionPaymentChannel;
    // Specific channel inputs
    mobileMoneyPhone?: string;
    cardDetails?: {
        cardNumber: string;
        cardExpMonth: string;
        cardExpYear: string;
        cardCvc: string;
        cardholderName: string;
        postalCode: string;
        brand?: string;
        last4?: string;
    };
    notes?: string;
}

export interface SubscriptionReceipt {
    receiptNumber: string;
    invoiceNumber: string;
    tenantId: string;
    tenantName: string;
    subscriberEmail: string;
    contactPerson: string;
    contactPhone: string;
    planTier: string;
    billingCycle: BillingCycle;
    amountPaid: number;
    currency: string;
    paymentMethod: SubscriptionPaymentChannel;
    transactionReference: string;
    paidAt: string;
    activationStatus: 'Active' | 'Pending Activation';
    accountLoginUrl: string;
    initialCredentials?: {
        loginEmail: string;
        temporaryPassword?: string;
        loginUrl: string;
    };
    sentReceiptEmail: boolean;
    notes?: string;
}

export interface WireTransferInvoice {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    tenantId: string;
    tenantName: string;
    subscriberEmail: string;
    contactPerson: string;
    contactPhone: string;
    institutionType: string;
    address: string;
    planTier: string;
    billingCycle: BillingCycle;
    amountDue: number;
    currency: string;
    paymentStatus: 'Pending' | 'Paid';
    activationStatus: 'Pending Activation' | 'Active';
    wireTransferDetails: WireTransferSettings;
    paymentReference: string;
    statusMessage: string;
}

// ============================================================================
// Phase 3: Omnichannel Communication (SMS / WhatsApp) Models
// ============================================================================

export type CommunicationChannel = 'sms' | 'whatsapp' | 'email';

export type CommunicationPriority = 'EMERGENCY_STAT' | 'HIGH' | 'NORMAL';

export type CommunicationStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'OPTED_OUT';

export type CommunicationCategory =
    | 'APPOINTMENT_REMINDER'
    | 'CRITICAL_NEWS2_ALERT'
    | 'LAB_PANIC_VALUE'
    | 'PRESCRIPTION_READY'
    | 'DISCHARGE_GATEPASS'
    | 'TELEMEDICINE_INVITE'
    | 'BILLING_RECEIPT'
    | 'GENERAL_BROADCAST'
    | 'TWO_FACTOR_OTP';

export type TelephonyProvider =
    | 'AfricasTalking'
    | 'Twilio'
    | 'WhatsAppCloud'
    | 'LocalGsmGateway';

export interface OmnichannelMessage {
    id: string;
    tenantId: string;
    patientId?: string;
    patientName?: string;
    recipientPhone: string;
    channel: CommunicationChannel;
    fallbackChannel?: CommunicationChannel;
    priority: CommunicationPriority;
    category: CommunicationCategory;
    templateKey?: string;
    messageBody: string;
    mediaUrl?: string;
    status: CommunicationStatus;
    provider: TelephonyProvider;
    providerMessageId?: string;
    retryCount: number;
    maxRetries: number;
    errorMessage?: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    costEstimate?: number;
    currency?: string;
    smsSegments?: number;
    patientResponse?: {
        receivedAt: string;
        replyText: string;
        actionTaken?: string;
    };
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CommunicationTemplate {
    id: string;
    key: string;
    name: string;
    channel: CommunicationChannel;
    category: CommunicationCategory;
    content: string;
    variables: string[];
    isActive: boolean;
    whatsappApproved: boolean;
    description: string;
}

export interface TelephonyGatewayConfig {
    africasTalking: {
        enabled: boolean;
        username: string;
        apiKey: string;
        senderId: string;
        environment: 'sandbox' | 'live';
    };
    twilio: {
        enabled: boolean;
        accountSid: string;
        authToken: string;
        smsFromNumber: string;
        whatsappFromNumber: string;
    };
    whatsAppCloud: {
        enabled: boolean;
        phoneNumberId: string;
        businessAccountId: string;
        apiToken: string;
        webhookSecret: string;
    };
    localGsmGateway: {
        enabled: boolean;
        endpointUrl: string;
        apiKey: string;
        simSlot: number;
    };
    defaultSmsProvider: TelephonyProvider;
    defaultWhatsAppProvider: TelephonyProvider;
    enableAutoFallback: boolean;
}

export interface CommunicationStats {
    totalSent: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
    deliveryRatePercentage: number;
    activeConversationsCount: number;
    smsCreditsUsed: number;
    whatsappConversationsUsed: number;
}



