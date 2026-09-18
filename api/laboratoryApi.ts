import {
    LabOrder,
    LabOrderStatus,
    LabUrgency,
    LabTestCategory,
    LabSpecimenType,
    LabTestParameter,
    LabCatalogTest,
    LabStats,
    LabAnalyzerDevice,
    AnalyzerDeviceStatus,
    AnalyzerRawMessage,
    LabQualityControl,
    LabQCRun,
    SpecimenTube,
    SpecimenTubeStatus,
    SpecimenRack,
    CriticalPanicAlert,
    WestgardRule,
} from '../packages/shared/types';
import { getStoredPatients } from './mockPatientData';

// Catalog of standard clinical laboratory test panels
export const LAB_CATALOG: LabCatalogTest[] = [
    {
        id: 'cat_cbc',
        name: 'Complete Blood Count (CBC) with Differential',
        category: 'Hematology',
        defaultSpecimen: 'Venous Whole Blood',
        turnaroundHours: 1.5,
        description: 'Comprehensive analysis of red blood cells, white blood cells, and platelets.',
        parameters: [
            { name: 'White Blood Cell (WBC)', unit: '10^3/µL', referenceRange: '4.5 - 11.0', refLow: 4.5, refHigh: 11.0, criticalLow: 2.0, criticalHigh: 30.0 },
            { name: 'Red Blood Cell (RBC)', unit: '10^6/µL', referenceRange: '4.20 - 5.80', refLow: 4.20, refHigh: 5.80, criticalLow: 2.0, criticalHigh: 7.0 },
            { name: 'Hemoglobin (Hgb)', unit: 'g/dL', referenceRange: '13.5 - 17.5', refLow: 13.5, refHigh: 17.5, criticalLow: 7.0, criticalHigh: 20.0 },
            { name: 'Hematocrit (Hct)', unit: '%', referenceRange: '40.0 - 52.0', refLow: 40.0, refHigh: 52.0, criticalLow: 21.0, criticalHigh: 60.0 },
            { name: 'Mean Corpuscular Volume (MCV)', unit: 'fL', referenceRange: '80.0 - 100.0', refLow: 80.0, refHigh: 100.0 },
            { name: 'Platelet Count', unit: '10^3/µL', referenceRange: '150 - 450', refLow: 150, refHigh: 450, criticalLow: 40, criticalHigh: 1000 },
            { name: 'Absolute Neutrophil Count', unit: '10^3/µL', referenceRange: '1.8 - 7.5', refLow: 1.8, refHigh: 7.5, criticalLow: 0.5 },
            { name: 'Absolute Lymphocyte Count', unit: '10^3/µL', referenceRange: '1.0 - 4.0', refLow: 1.0, refHigh: 4.0 },
        ],
    },
    {
        id: 'cat_cmp',
        name: 'Comprehensive Metabolic Panel (CMP)',
        category: 'Clinical Chemistry',
        defaultSpecimen: 'Serum',
        turnaroundHours: 2.0,
        description: 'Assessment of renal function, electrolytes, hepatic status, and glucose regulation.',
        parameters: [
            { name: 'Sodium', unit: 'mmol/L', referenceRange: '135 - 145', refLow: 135, refHigh: 145, criticalLow: 120, criticalHigh: 160 },
            { name: 'Potassium', unit: 'mmol/L', referenceRange: '3.5 - 5.1', refLow: 3.5, refHigh: 5.1, criticalLow: 2.8, criticalHigh: 6.2 },
            { name: 'Chloride', unit: 'mmol/L', referenceRange: '96 - 106', refLow: 96, refHigh: 106 },
            { name: 'Carbon Dioxide (CO2)', unit: 'mmol/L', referenceRange: '22 - 29', refLow: 22, refHigh: 29, criticalLow: 10, criticalHigh: 40 },
            { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', referenceRange: '7 - 20', refLow: 7, refHigh: 20, criticalHigh: 100 },
            { name: 'Serum Creatinine', unit: 'mg/dL', referenceRange: '0.6 - 1.3', refLow: 0.6, refHigh: 1.3, criticalHigh: 4.0 },
            { name: 'Glucose (Fasting)', unit: 'mg/dL', referenceRange: '70 - 99', refLow: 70, refHigh: 99, criticalLow: 50, criticalHigh: 400 },
            { name: 'Calcium', unit: 'mg/dL', referenceRange: '8.6 - 10.3', refLow: 8.6, refHigh: 10.3, criticalLow: 6.5, criticalHigh: 13.0 },
            { name: 'Total Protein', unit: 'g/dL', referenceRange: '6.4 - 8.3', refLow: 6.4, refHigh: 8.3 },
            { name: 'Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.0', refLow: 3.5, refHigh: 5.0 },
            { name: 'Bilirubin (Total)', unit: 'mg/dL', referenceRange: '0.2 - 1.2', refLow: 0.2, refHigh: 1.2, criticalHigh: 15.0 },
            { name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRange: '44 - 147', refLow: 44, refHigh: 147 },
            { name: 'Aspartate Aminotransferase (AST)', unit: 'U/L', referenceRange: '10 - 40', refLow: 10, refHigh: 40 },
            { name: 'Alanine Aminotransferase (ALT)', unit: 'U/L', referenceRange: '7 - 56', refLow: 7, refHigh: 56 },
            { name: 'eGFR (Calculated)', unit: 'mL/min/1.73m²', referenceRange: '> 60', refLow: 60 },
        ],
    },
    {
        id: 'cat_trop',
        name: 'High-Sensitivity Cardiac Troponin I',
        category: 'Clinical Chemistry',
        defaultSpecimen: 'Plasma',
        turnaroundHours: 0.75,
        description: 'Gold-standard biomarker for evaluating acute myocardial infarction and cardiac injury.',
        parameters: [
            { name: 'Troponin I (High-Sensitivity)', unit: 'ng/mL', referenceRange: '< 0.04', refHigh: 0.04, criticalHigh: 0.40 },
            { name: 'CK-MB Isoenzyme', unit: 'ng/mL', referenceRange: '0.0 - 5.0', refLow: 0.0, refHigh: 5.0 },
            { name: 'Myoglobin', unit: 'ng/mL', referenceRange: '25 - 72', refLow: 25, refHigh: 72 },
        ],
    },
    {
        id: 'cat_coag',
        name: 'Coagulation Panel (PT/INR & aPTT)',
        category: 'Coagulation',
        defaultSpecimen: 'Plasma',
        turnaroundHours: 1.0,
        description: 'Prothrombin time, International Normalized Ratio, and activated partial thromboplastin time.',
        parameters: [
            { name: 'Prothrombin Time (PT)', unit: 'seconds', referenceRange: '11.0 - 13.5', refLow: 11.0, refHigh: 13.5 },
            { name: 'International Normalized Ratio (INR)', unit: 'ratio', referenceRange: '0.8 - 1.2', refLow: 0.8, refHigh: 1.2, criticalHigh: 4.5 },
            { name: 'Activated PTT (aPTT)', unit: 'seconds', referenceRange: '25.0 - 36.5', refLow: 25.0, refHigh: 36.5, criticalHigh: 90.0 },
            { name: 'Fibrinogen', unit: 'mg/dL', referenceRange: '200 - 400', refLow: 200, refHigh: 400, criticalLow: 100 },
        ],
    },
    {
        id: 'cat_abg',
        name: 'Arterial Blood Gas (ABG) Analysis',
        category: 'Clinical Chemistry',
        defaultSpecimen: 'Venous Whole Blood',
        turnaroundHours: 0.5,
        description: 'Assesses respiratory and metabolic acid-base balance and systemic oxygenation.',
        parameters: [
            { name: 'pH', unit: 'pH units', referenceRange: '7.35 - 7.45', refLow: 7.35, refHigh: 7.45, criticalLow: 7.20, criticalHigh: 7.60 },
            { name: 'pCO2 (Partial Pressure CO2)', unit: 'mmHg', referenceRange: '35 - 45', refLow: 35, refHigh: 45, criticalLow: 20, criticalHigh: 70 },
            { name: 'pO2 (Partial Pressure O2)', unit: 'mmHg', referenceRange: '80 - 100', refLow: 80, refHigh: 100, criticalLow: 50 },
            { name: 'Bicarbonate (HCO3-)', unit: 'mmol/L', referenceRange: '22 - 26', refLow: 22, refHigh: 26, criticalLow: 12, criticalHigh: 40 },
            { name: 'Base Excess', unit: 'mmol/L', referenceRange: '-2 to +2', refLow: -2, refHigh: 2 },
            { name: 'O2 Saturation (Arterial)', unit: '%', referenceRange: '95 - 100', refLow: 95, criticalLow: 85 },
        ],
    },
    {
        id: 'cat_urinalysis',
        name: 'Urinalysis with Microscopic Examination',
        category: 'Urinalysis',
        defaultSpecimen: 'Urine',
        turnaroundHours: 1.0,
        description: 'Physical, chemical, and microscopic examination for renal or urinary tract disorders.',
        parameters: [
            { name: 'Color / Appearance', unit: 'visual', referenceRange: 'Pale Yellow / Clear' },
            { name: 'Specific Gravity', unit: 'ratio', referenceRange: '1.005 - 1.030', refLow: 1.005, refHigh: 1.030 },
            { name: 'pH', unit: 'pH units', referenceRange: '5.0 - 8.0', refLow: 5.0, refHigh: 8.0 },
            { name: 'Protein', unit: 'mg/dL', referenceRange: 'Negative (< 10)' },
            { name: 'Glucose', unit: 'mg/dL', referenceRange: 'Negative (< 15)' },
            { name: 'Ketones', unit: 'mg/dL', referenceRange: 'Negative' },
            { name: 'Leukocyte Esterase', unit: 'qualitative', referenceRange: 'Negative' },
            { name: 'Nitrite', unit: 'qualitative', referenceRange: 'Negative' },
            { name: 'White Blood Cells (Urine)', unit: '/HPF', referenceRange: '0 - 5', refHigh: 5 },
            { name: 'Red Blood Cells (Urine)', unit: '/HPF', referenceRange: '0 - 3', refHigh: 3 },
        ],
    },
    {
        id: 'cat_tsh',
        name: 'Thyroid Stimulating Hormone (TSH) with Reflex Free T4',
        category: 'Immunology',
        defaultSpecimen: 'Serum',
        turnaroundHours: 3.0,
        description: 'Sensitive screening for hypothyroidism, hyperthyroidism, and anterior pituitary axis.',
        parameters: [
            { name: 'TSH (Thyrotropin)', unit: 'µIU/mL', referenceRange: '0.40 - 4.50', refLow: 0.40, refHigh: 4.50, criticalLow: 0.05, criticalHigh: 20.0 },
            { name: 'Free Thyroxine (Free T4)', unit: 'ng/dL', referenceRange: '0.8 - 1.8', refLow: 0.8, refHigh: 1.8 },
        ],
    },
    {
        id: 'cat_blood_culture',
        name: 'Blood Culture & Antimicrobial Susceptibility (2 Sets)',
        category: 'Microbiology',
        defaultSpecimen: 'Venous Whole Blood',
        turnaroundHours: 24.0,
        description: 'Aerobic and anaerobic blood bottles incubated for bacteremia and fungemia identification.',
        parameters: [
            { name: 'Gram Stain Preliminary', unit: 'microscopic', referenceRange: 'No Organisms Observed' },
            { name: 'Aerobic Bottle (Set 1)', unit: 'incubation', referenceRange: 'No Growth at 48 hrs' },
            { name: 'Anaerobic Bottle (Set 1)', unit: 'incubation', referenceRange: 'No Growth at 48 hrs' },
            { name: 'Final Organism Identification', unit: 'isolated', referenceRange: 'No Bacterial or Fungal Growth' },
        ],
    },
];

export const calculateParameterFlag = (
    val: string | number | null,
    param: { refLow?: number; refHigh?: number; criticalLow?: number; criticalHigh?: number }
): 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low' => {
    if (val === null || val === undefined || val === '') return 'Normal';
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return 'Normal';

    if (param.criticalHigh !== undefined && num >= param.criticalHigh) return 'Critical High';
    if (param.criticalLow !== undefined && num <= param.criticalLow) return 'Critical Low';
    if (param.refHigh !== undefined && num > param.refHigh) return 'High';
    if (param.refLow !== undefined && num < param.refLow) return 'Low';

    return 'Normal';
};

// Initial realistic laboratory orders across hospital tenants
const INITIAL_LAB_ORDERS: LabOrder[] = [
    {
        id: 'lab_001',
        orderNumber: 'LAB-2026-1049',
        accessionNumber: 'ACC-89104-TRO',
        barcode: 'BC89104TRO',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 70,
        patientGender: 'Female',
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        testPanelName: 'High-Sensitivity Cardiac Troponin I',
        category: 'Clinical Chemistry',
        specimenType: 'Plasma',
        urgency: 'STAT',
        status: 'Critical Alert',
        orderedAt: '2026-09-10T07:15:00.000Z',
        collectedAt: '2026-09-10T07:22:00.000Z',
        receivedInLabAt: '2026-09-10T07:30:00.000Z',
        analyzedAt: '2026-09-10T07:50:00.000Z',
        completedAt: '2026-09-10T07:52:00.000Z',
        orderingPhysicianName: 'Dr. Sarah Lin, MD',
        orderingPhysicianDepartment: 'Cardiology',
        clinicalIndication: 'Acute chest pain radiating to left jaw, ST depression in leads V3-V6.',
        parameters: [
            {
                id: 'p_trop1',
                name: 'Troponin I (High-Sensitivity)',
                value: 0.84,
                unit: 'ng/mL',
                referenceRange: '< 0.04',
                refHigh: 0.04,
                criticalHigh: 0.40,
                flag: 'Critical High',
                interpretation: 'Markedly elevated biomarker consistent with acute myocardial necrosis.',
            },
            {
                id: 'p_ckmb',
                name: 'CK-MB Isoenzyme',
                value: 12.4,
                unit: 'ng/mL',
                referenceRange: '0.0 - 5.0',
                refLow: 0.0,
                refHigh: 5.0,
                flag: 'High',
            },
            {
                id: 'p_myo',
                name: 'Myoglobin',
                value: 114,
                unit: 'ng/mL',
                referenceRange: '25 - 72',
                refLow: 25,
                refHigh: 72,
                flag: 'High',
            },
        ],
        analyzerInstrument: 'Roche Cobas 8000 (e801 module)',
        technicianNotes: 'Repeat run performed on separate aliquot to verify panic value. Confirmed 0.84 ng/mL.',
        pathologistNotes: 'Critical panic value called immediately to RN Jessica Alba at 07:54 AM.',
        verifiedBy: 'Dr. Marcus Vance, MD, FCAP (Pathologist)',
        hasCriticalAlert: true,
        criticalAlertAcknowledgedBy: 'Dr. Sarah Lin, MD (Attending Cardiologist)',
        criticalAlertAcknowledgedAt: '2026-09-10T07:58:00.000Z',
    },
    {
        id: 'lab_002',
        orderNumber: 'LAB-2026-1050',
        accessionNumber: 'ACC-89105-CBC',
        barcode: 'BC89105CBC',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMRN: 'MRN-19348',
        patientAge: 48,
        patientGender: 'Male',
        patientLocation: 'Emergency Bay 4',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        testPanelName: 'Complete Blood Count (CBC) with Differential',
        category: 'Hematology',
        urgency: 'STAT',
        specimenType: 'Venous Whole Blood',
        status: 'Completed',
        orderedAt: '2026-09-10T06:30:00.000Z',
        collectedAt: '2026-09-10T06:40:00.000Z',
        receivedInLabAt: '2026-09-10T06:50:00.000Z',
        analyzedAt: '2026-09-10T07:15:00.000Z',
        completedAt: '2026-09-10T07:18:00.000Z',
        orderingPhysicianName: 'Dr. Christopher Bell, MD',
        orderingPhysicianDepartment: 'Emergency Medicine',
        clinicalIndication: 'High-grade fever (103.2°F), productive cough, suspected severe community-acquired pneumonia.',
        parameters: [
            {
                id: 'p_cbc_wbc',
                name: 'White Blood Cell (WBC)',
                value: 18.6,
                unit: '10^3/µL',
                referenceRange: '4.5 - 11.0',
                refLow: 4.5,
                refHigh: 11.0,
                criticalLow: 2.0,
                criticalHigh: 30.0,
                flag: 'High',
                interpretation: 'Marked leukocytosis with left shift.',
            },
            {
                id: 'p_cbc_rbc',
                name: 'Red Blood Cell (RBC)',
                value: 4.65,
                unit: '10^6/µL',
                referenceRange: '4.20 - 5.80',
                refLow: 4.20,
                refHigh: 5.80,
                flag: 'Normal',
            },
            {
                id: 'p_cbc_hgb',
                name: 'Hemoglobin (Hgb)',
                value: 14.2,
                unit: 'g/dL',
                referenceRange: '13.5 - 17.5',
                refLow: 13.5,
                refHigh: 17.5,
                flag: 'Normal',
            },
            {
                id: 'p_cbc_hct',
                name: 'Hematocrit (Hct)',
                value: 42.8,
                unit: '%',
                referenceRange: '40.0 - 52.0',
                refLow: 40.0,
                refHigh: 52.0,
                flag: 'Normal',
            },
            {
                id: 'p_cbc_plt',
                name: 'Platelet Count',
                value: 290,
                unit: '10^3/µL',
                referenceRange: '150 - 450',
                refLow: 150,
                refHigh: 450,
                flag: 'Normal',
            },
            {
                id: 'p_cbc_anc',
                name: 'Absolute Neutrophil Count',
                value: 14.8,
                unit: '10^3/µL',
                referenceRange: '1.8 - 7.5',
                refLow: 1.8,
                refHigh: 7.5,
                flag: 'High',
            },
        ],
        analyzerInstrument: 'Sysmex XN-1000 Automated Hematology System',
        technicianNotes: 'Manual smear review performed. Toxic granulation and Döhle bodies noted.',
        verifiedBy: 'Dr. Rebecca Stern, MD, FCAP (Pathologist)',
        hasCriticalAlert: false,
    },
    {
        id: 'lab_003',
        orderNumber: 'LAB-2026-1051',
        accessionNumber: 'ACC-89106-CMP',
        barcode: 'BC89106CMP',
        patientId: 'pat_003',
        patientName: 'Chloe Nguyen',
        patientMRN: 'MRN-33419',
        patientAge: 29,
        patientGender: 'Female',
        patientLocation: 'Pediatric Observation - Bed 12',
        patientTenantId: 'tnt_002',
        patientTenantName: "Mercy Children's Clinic",
        testPanelName: 'Comprehensive Metabolic Panel (CMP)',
        category: 'Clinical Chemistry',
        urgency: 'Routine',
        specimenType: 'Serum',
        status: 'In Analysis',
        orderedAt: '2026-09-10T08:00:00.000Z',
        collectedAt: '2026-09-10T08:15:00.000Z',
        receivedInLabAt: '2026-09-10T08:35:00.000Z',
        orderingPhysicianName: 'Dr. Emily Watson, MD',
        orderingPhysicianDepartment: 'Pediatrics',
        clinicalIndication: 'Persistent vomiting and dehydration assessment.',
        parameters: [
            {
                id: 'p_cmp_na',
                name: 'Sodium',
                value: 136,
                unit: 'mmol/L',
                referenceRange: '135 - 145',
                refLow: 135,
                refHigh: 145,
                flag: 'Normal',
            },
            {
                id: 'p_cmp_k',
                name: 'Potassium',
                value: 3.2,
                unit: 'mmol/L',
                referenceRange: '3.5 - 5.1',
                refLow: 3.5,
                refHigh: 5.1,
                flag: 'Low',
                interpretation: 'Mild hypokalemia secondary to gastrointestinal loss.',
            },
            {
                id: 'p_cmp_cl',
                name: 'Chloride',
                value: 98,
                unit: 'mmol/L',
                referenceRange: '96 - 106',
                refLow: 96,
                refHigh: 106,
                flag: 'Normal',
            },
            {
                id: 'p_cmp_bun',
                name: 'Blood Urea Nitrogen (BUN)',
                value: 24,
                unit: 'mg/dL',
                referenceRange: '7 - 20',
                refLow: 7,
                refHigh: 20,
                flag: 'High',
            },
            {
                id: 'p_cmp_cr',
                name: 'Serum Creatinine',
                value: 0.9,
                unit: 'mg/dL',
                referenceRange: '0.6 - 1.3',
                refLow: 0.6,
                refHigh: 1.3,
                flag: 'Normal',
            },
            {
                id: 'p_cmp_glu',
                name: 'Glucose (Fasting)',
                value: 88,
                unit: 'mg/dL',
                referenceRange: '70 - 99',
                refLow: 70,
                refHigh: 99,
                flag: 'Normal',
            },
        ],
        analyzerInstrument: 'Beckman Coulter DxC 700 AU Chemistry Analyzer',
        technicianNotes: 'Serum index check: no hemolysis, icterus, or lipemia detected.',
        hasCriticalAlert: false,
    },
    {
        id: 'lab_004',
        orderNumber: 'LAB-2026-1052',
        accessionNumber: 'ACC-89107-ABG',
        barcode: 'BC89107ABG',
        patientId: 'pat_004',
        patientName: 'Liam Washington',
        patientMRN: 'MRN-77821',
        patientAge: 62,
        patientGender: 'Male',
        patientLocation: 'ICU Bed 02',
        patientTenantId: 'tnt_003',
        patientTenantName: 'Northwest Community Medical',
        testPanelName: 'Arterial Blood Gas (ABG) Analysis',
        category: 'Clinical Chemistry',
        urgency: 'STAT',
        specimenType: 'Venous Whole Blood',
        status: 'Sample Collected',
        orderedAt: '2026-09-10T08:30:00.000Z',
        collectedAt: '2026-09-10T08:42:00.000Z',
        orderingPhysicianName: 'Dr. James Martinez, MD',
        orderingPhysicianDepartment: 'Critical Care / Pulmonology',
        clinicalIndication: 'Mechanical ventilator weaning protocol evaluation; SpO2 dipping to 91% on FiO2 40%.',
        parameters: [
            { id: 'p_abg_ph', name: 'pH', value: null, unit: 'pH units', referenceRange: '7.35 - 7.45', refLow: 7.35, refHigh: 7.45, criticalLow: 7.20, criticalHigh: 7.60 },
            { id: 'p_abg_pco2', name: 'pCO2', value: null, unit: 'mmHg', referenceRange: '35 - 45', refLow: 35, refHigh: 45, criticalLow: 20, criticalHigh: 70 },
            { id: 'p_abg_po2', name: 'pO2', value: null, unit: 'mmHg', referenceRange: '80 - 100', refLow: 80, refHigh: 100, criticalLow: 50 },
            { id: 'p_abg_hco3', name: 'Bicarbonate (HCO3-)', value: null, unit: 'mmol/L', referenceRange: '22 - 26', refLow: 22, refHigh: 26 },
            { id: 'p_abg_sato2', name: 'O2 Saturation (Arterial)', value: null, unit: '%', referenceRange: '95 - 100', refLow: 95 },
        ],
        technicianNotes: 'Heparinized syringe received on wet ice slurry.',
        hasCriticalAlert: false,
    },
    {
        id: 'lab_005',
        orderNumber: 'LAB-2026-1053',
        accessionNumber: 'ACC-89108-COA',
        barcode: 'BC89108COA',
        patientId: 'pat_005',
        patientName: 'Sophia Patel',
        patientMRN: 'MRN-55201',
        patientAge: 55,
        patientGender: 'Female',
        patientLocation: 'Surgical Prep Unit - Room 4',
        patientTenantId: 'tnt_004',
        patientTenantName: 'Apex Orthopedic Institute',
        testPanelName: 'Coagulation Panel (PT/INR & aPTT)',
        category: 'Coagulation',
        urgency: 'Urgent',
        specimenType: 'Plasma',
        status: 'Completed',
        orderedAt: '2026-09-10T06:00:00.000Z',
        collectedAt: '2026-09-10T06:15:00.000Z',
        receivedInLabAt: '2026-09-10T06:30:00.000Z',
        analyzedAt: '2026-09-10T07:05:00.000Z',
        completedAt: '2026-09-10T07:10:00.000Z',
        orderingPhysicianName: 'Dr. Gregory House, MD',
        orderingPhysicianDepartment: 'Orthopedic Surgery',
        clinicalIndication: 'Preoperative screening prior to total knee arthroplasty; history of oral anticoagulant use.',
        parameters: [
            {
                id: 'p_coa_pt',
                name: 'Prothrombin Time (PT)',
                value: 12.1,
                unit: 'seconds',
                referenceRange: '11.0 - 13.5',
                refLow: 11.0,
                refHigh: 13.5,
                flag: 'Normal',
            },
            {
                id: 'p_coa_inr',
                name: 'International Normalized Ratio (INR)',
                value: 1.05,
                unit: 'ratio',
                referenceRange: '0.8 - 1.2',
                refLow: 0.8,
                refHigh: 1.2,
                flag: 'Normal',
            },
            {
                id: 'p_coa_aptt',
                name: 'Activated PTT (aPTT)',
                value: 29.4,
                unit: 'seconds',
                referenceRange: '25.0 - 36.5',
                refLow: 25.0,
                refHigh: 36.5,
                flag: 'Normal',
            },
            {
                id: 'p_coa_fib',
                name: 'Fibrinogen',
                value: 340,
                unit: 'mg/dL',
                referenceRange: '200 - 400',
                refLow: 200,
                refHigh: 400,
                flag: 'Normal',
            },
        ],
        analyzerInstrument: 'Stago STA-R Max Coagulation Analyzer',
        verifiedBy: 'Dr. Marcus Vance, MD, FCAP (Pathologist)',
        hasCriticalAlert: false,
    },
    {
        id: 'lab_006',
        orderNumber: 'LAB-2026-1054',
        accessionNumber: 'ACC-89109-URI',
        barcode: 'BC89109URI',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 70,
        patientGender: 'Female',
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        testPanelName: 'Urinalysis with Microscopic Examination',
        category: 'Urinalysis',
        urgency: 'Routine',
        specimenType: 'Urine',
        status: 'Ordered',
        orderedAt: '2026-09-10T08:50:00.000Z',
        orderingPhysicianName: 'Dr. Sarah Lin, MD',
        orderingPhysicianDepartment: 'Cardiology',
        clinicalIndication: 'Routine admission renal screen and rule out asymptomatic urinary tract infection.',
        parameters: [
            { id: 'p_uri_col', name: 'Color / Appearance', value: null, unit: 'visual', referenceRange: 'Pale Yellow / Clear' },
            { id: 'p_uri_sg', name: 'Specific Gravity', value: null, unit: 'ratio', referenceRange: '1.005 - 1.030', refLow: 1.005, refHigh: 1.030 },
            { id: 'p_uri_ph', name: 'pH', value: null, unit: 'pH units', referenceRange: '5.0 - 8.0', refLow: 5.0, refHigh: 8.0 },
            { id: 'p_uri_pro', name: 'Protein', value: null, unit: 'mg/dL', referenceRange: 'Negative (< 10)' },
            { id: 'p_uri_glu', name: 'Glucose', value: null, unit: 'mg/dL', referenceRange: 'Negative (< 15)' },
            { id: 'p_uri_leuk', name: 'Leukocyte Esterase', value: null, unit: 'qualitative', referenceRange: 'Negative' },
            { id: 'p_uri_nit', name: 'Nitrite', value: null, unit: 'qualitative', referenceRange: 'Negative' },
        ],
        hasCriticalAlert: false,
    },
    {
        id: 'lab_007',
        orderNumber: 'LAB-2026-1055',
        accessionNumber: 'ACC-89110-TSH',
        barcode: 'BC89110TSH',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMRN: 'MRN-19348',
        patientAge: 48,
        patientGender: 'Male',
        patientLocation: 'Emergency Bay 4',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        testPanelName: 'Thyroid Stimulating Hormone (TSH) with Reflex Free T4',
        category: 'Immunology',
        urgency: 'Routine',
        specimenType: 'Serum',
        status: 'Sample Collected',
        orderedAt: '2026-09-10T07:40:00.000Z',
        collectedAt: '2026-09-10T08:10:00.000Z',
        orderingPhysicianName: 'Dr. Christopher Bell, MD',
        orderingPhysicianDepartment: 'Emergency Medicine',
        clinicalIndication: 'Assessment of unexplained fatigue and sinus tachycardia.',
        parameters: [
            { id: 'p_tsh_val', name: 'TSH (Thyrotropin)', value: null, unit: 'µIU/mL', referenceRange: '0.40 - 4.50', refLow: 0.40, refHigh: 4.50, criticalLow: 0.05, criticalHigh: 20.0 },
            { id: 'p_tsh_ft4', name: 'Free Thyroxine (Free T4)', value: null, unit: 'ng/dL', referenceRange: '0.8 - 1.8', refLow: 0.8, refHigh: 1.8 },
        ],
        hasCriticalAlert: false,
    },
];

const LAB_STORAGE_KEY = 'raphamis_lab_orders_v1';

export const getStoredLabOrders = (): LabOrder[] => {
    try {
        const stored = localStorage.getItem(LAB_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // fallback to initial
    }
    try {
        localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(INITIAL_LAB_ORDERS));
    } catch {
        // ignore
    }
    return INITIAL_LAB_ORDERS;
};

export const saveStoredLabOrders = (orders: LabOrder[]) => {
    try {
        localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(orders));
    } catch {
        // ignore
    }
};

// API: Get orders with optional filters
export const getLabOrders = async (filters?: {
    tenantId?: string;
    search?: string;
    status?: string;
    category?: string;
}): Promise<LabOrder[]> => {
    // slight delay to emulate realistic responsive network
    await new Promise((r) => setTimeout(r, 40));

    let orders = getStoredLabOrders();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        orders = orders.filter((o) => o.patientTenantId === filters.tenantId);
    }

    if (filters?.status && filters.status !== 'ALL') {
        orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters?.category && filters.category !== 'ALL') {
        orders = orders.filter((o) => o.category === filters.category);
    }

    if (filters?.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        orders = orders.filter(
            (o) =>
                o.orderNumber.toLowerCase().includes(query) ||
                o.accessionNumber.toLowerCase().includes(query) ||
                o.testPanelName.toLowerCase().includes(query) ||
                o.patientName.toLowerCase().includes(query) ||
                o.patientMRN.toLowerCase().includes(query) ||
                o.orderingPhysicianName.toLowerCase().includes(query)
        );
    }

    return orders;
};

// API: Get order by ID
export const getLabOrderById = async (id: string): Promise<LabOrder | null> => {
    const orders = getStoredLabOrders();
    return orders.find((o) => o.id === id) || null;
};

// API: Create a new lab order
export const createLabOrder = async (payload: Partial<LabOrder>): Promise<LabOrder> => {
    const orders = getStoredLabOrders();
    const count = orders.length + 1056;
    const randomAccession = Math.floor(10000 + Math.random() * 90000);

    const catalogMatch = LAB_CATALOG.find((c) => c.name === payload.testPanelName);

    const parameters: LabTestParameter[] =
        payload.parameters && payload.parameters.length > 0
            ? payload.parameters
            : (catalogMatch?.parameters || []).map((p, idx) => ({
                  id: `param_${Date.now()}_${idx}`,
                  name: p.name,
                  value: null,
                  unit: p.unit,
                  referenceRange: p.referenceRange,
                  refLow: p.refLow,
                  refHigh: p.refHigh,
                  criticalLow: p.criticalLow,
                  criticalHigh: p.criticalHigh,
                  flag: 'Normal',
              }));

    const newOrder: LabOrder = {
        id: `lab_${Date.now()}`,
        orderNumber: payload.orderNumber || `LAB-2026-${count}`,
        accessionNumber: payload.accessionNumber || `ACC-${randomAccession}-${catalogMatch?.category.slice(0, 3).toUpperCase() || 'GEN'}`,
        barcode: payload.barcode || `BC${randomAccession}`,
        patientId: payload.patientId || 'pat_001',
        patientName: payload.patientName || 'Eleanor Vance',
        patientMRN: payload.patientMRN || 'MRN-84920',
        patientAge: payload.patientAge || 70,
        patientGender: payload.patientGender || 'Female',
        patientLocation: payload.patientLocation || 'Hospital Bed',
        patientTenantId: payload.patientTenantId || 'tnt_001',
        patientTenantName: payload.patientTenantName || 'St. Jude General Hospital',
        testPanelName: payload.testPanelName || 'Complete Blood Count (CBC) with Differential',
        category: payload.category || catalogMatch?.category || 'Hematology',
        specimenType: payload.specimenType || catalogMatch?.defaultSpecimen || 'Venous Whole Blood',
        urgency: payload.urgency || 'Routine',
        status: payload.status || 'Ordered',
        orderedAt: new Date().toISOString(),
        orderingPhysicianName: payload.orderingPhysicianName || 'Dr. Sarah Lin, MD',
        orderingPhysicianDepartment: payload.orderingPhysicianDepartment || 'Internal Medicine',
        clinicalIndication: payload.clinicalIndication || 'Clinical evaluation.',
        parameters,
        hasCriticalAlert: false,
    };

    const updated = [newOrder, ...orders];
    saveStoredLabOrders(updated);
    return newOrder;
};

// API: Update order status (Advance workflow: Ordered -> Sample Collected -> In Analysis -> Completed)
export const updateLabOrderStatus = async (
    orderId: string,
    newStatus: LabOrderStatus,
    updates?: Partial<LabOrder>
): Promise<LabOrder> => {
    const orders = getStoredLabOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Lab order not found');

    const now = new Date().toISOString();
    const current = orders[idx];

    const updatedOrder: LabOrder = {
        ...current,
        ...updates,
        status: newStatus,
        collectedAt:
            newStatus === 'Sample Collected' && !current.collectedAt
                ? now
                : current.collectedAt,
        receivedInLabAt:
            newStatus === 'In Analysis' && !current.receivedInLabAt
                ? now
                : current.receivedInLabAt,
        analyzedAt:
            newStatus === 'Completed' && !current.analyzedAt ? now : current.analyzedAt,
        completedAt: newStatus === 'Completed' ? now : current.completedAt,
    };

    orders[idx] = updatedOrder;
    saveStoredLabOrders(orders);
    return updatedOrder;
};

// API: Record / Validate Lab Test Results
export const recordLabResults = async (
    orderId: string,
    updatedParameters: LabTestParameter[],
    options?: {
        analyzerInstrument?: string;
        technicianNotes?: string;
        pathologistNotes?: string;
        verifiedBy?: string;
    }
): Promise<LabOrder> => {
    const orders = getStoredLabOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Lab order not found');

    const current = orders[idx];
    const now = new Date().toISOString();

    // Recalculate flags for each parameter
    let hasPanic = false;
    const computedParams: LabTestParameter[] = updatedParameters.map((p) => {
        const flag = calculateParameterFlag(p.value, p);
        if (flag === 'Critical High' || flag === 'Critical Low') {
            hasPanic = true;
        }
        return {
            ...p,
            flag,
        };
    });

    const finalStatus: LabOrderStatus = hasPanic ? 'Critical Alert' : 'Completed';

    const updatedOrder: LabOrder = {
        ...current,
        parameters: computedParams,
        status: finalStatus,
        hasCriticalAlert: hasPanic,
        analyzedAt: current.analyzedAt || now,
        completedAt: now,
        analyzerInstrument: options?.analyzerInstrument || current.analyzerInstrument || 'Automated Laboratory Analyzer',
        technicianNotes: options?.technicianNotes ?? current.technicianNotes,
        pathologistNotes: options?.pathologistNotes ?? current.pathologistNotes,
        verifiedBy: options?.verifiedBy || 'Dr. Marcus Vance, MD, FCAP (Pathologist)',
    };

    orders[idx] = updatedOrder;
    saveStoredLabOrders(orders);
    return updatedOrder;
};

// API: Acknowledge Critical Panic Alert
export const acknowledgeCriticalAlert = async (
    orderId: string,
    acknowledgedBy: string
): Promise<LabOrder> => {
    const orders = getStoredLabOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Lab order not found');

    const now = new Date().toISOString();
    orders[idx] = {
        ...orders[idx],
        criticalAlertAcknowledgedBy: acknowledgedBy,
        criticalAlertAcknowledgedAt: now,
    };

    saveStoredLabOrders(orders);
    return orders[idx];
};

// API: Get Lab Statistics
export const getLabStats = async (tenantId?: string): Promise<LabStats> => {
    let orders = getStoredLabOrders();
    if (tenantId && tenantId !== 'ALL') {
        orders = orders.filter((o) => o.patientTenantId === tenantId);
    }

    const totalOrdersToday = orders.length;
    const pendingCollectionCount = orders.filter(
        (o) => o.status === 'Ordered' || o.status === 'Sample Collected'
    ).length;
    const inTestingCount = orders.filter((o) => o.status === 'In Analysis').length;
    const completedTodayCount = orders.filter((o) => o.status === 'Completed').length;
    const criticalAlertsCount = orders.filter(
        (o) => o.status === 'Critical Alert' || o.hasCriticalAlert
    ).length;

    return {
        totalOrdersToday,
        pendingCollectionCount,
        inTestingCount,
        completedTodayCount,
        criticalAlertsCount,
        avgTurnaroundHours: 2.4,
        statAvgTurnaroundMinutes: 38,
    };
};

export const getLabCatalog = (): LabCatalogTest[] => LAB_CATALOG;

// ============================================================================
// Phase 5: LIS Analyzer Interfacing, QC & Pathology Automation Engine
// ============================================================================

const STORAGE_KEY_ANALYZERS = 'raphamis_lab_analyzers_v1';
const STORAGE_KEY_ANALYZER_LOGS = 'raphamis_lab_raw_logs_v1';
const STORAGE_KEY_QC = 'raphamis_lab_qc_v1';
const STORAGE_KEY_SPECIMEN_RACKS = 'raphamis_lab_specimen_racks_v1';
const STORAGE_KEY_PANIC_ALERTS = 'raphamis_lab_panic_alerts_v1';

// Seed Analyzers
const DEFAULT_ANALYZERS: LabAnalyzerDevice[] = [
    {
        id: 'ana_sysmex_xn1000',
        name: 'Sysmex XN-1000',
        manufacturer: 'Sysmex Corporation',
        model: 'XN-1000 Hematology System',
        protocol: 'ASTM_1394',
        ipAddress: '192.168.10.45',
        port: 5100,
        status: 'ONLINE',
        supportedDisciplines: ['Hematology', 'Coagulation'],
        lastHandshakeAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        lastPingMs: 14,
        totalResultsTransmitted: 1420,
        errorCount: 0,
        isBidirectional: true,
        tenantId: 'ALL',
        tenantName: 'Central Pathology Laboratory',
    },
    {
        id: 'ana_mindray_bs480',
        name: 'Mindray BS-480',
        manufacturer: 'Mindray Medical International',
        model: 'BS-480 Clinical Chemistry Auto-Analyzer',
        protocol: 'HL7_V2',
        ipAddress: '192.168.10.52',
        port: 5200,
        status: 'ONLINE',
        supportedDisciplines: ['Clinical Chemistry'],
        lastHandshakeAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        lastPingMs: 8,
        totalResultsTransmitted: 3890,
        errorCount: 1,
        isBidirectional: true,
        tenantId: 'ALL',
        tenantName: 'Central Pathology Laboratory',
    },
    {
        id: 'ana_roche_cobas6000',
        name: 'Roche Cobas 6000 (e601)',
        manufacturer: 'Roche Diagnostics',
        model: 'Cobas 6000 Immuno-Chemistry Core',
        protocol: 'HL7_V2',
        ipAddress: '192.168.10.60',
        port: 5300,
        status: 'ONLINE',
        supportedDisciplines: ['Immunology', 'Clinical Chemistry'],
        lastHandshakeAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        lastPingMs: 22,
        totalResultsTransmitted: 2110,
        errorCount: 0,
        isBidirectional: true,
        tenantId: 'ALL',
        tenantName: 'Central Pathology Laboratory',
    },
    {
        id: 'ana_beckman_access2',
        name: 'Beckman Coulter Access 2',
        manufacturer: 'Beckman Coulter',
        model: 'Access 2 Chemiluminescence Immunoassay',
        protocol: 'SERIAL_RS232',
        ipAddress: '192.168.10.74',
        port: 9600,
        status: 'STANDBY',
        supportedDisciplines: ['Immunology'],
        lastHandshakeAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        lastPingMs: 45,
        totalResultsTransmitted: 850,
        errorCount: 0,
        isBidirectional: false,
        tenantId: 'ALL',
        tenantName: 'Immunology Suite',
    },
    {
        id: 'ana_genexpert_iv',
        name: 'GeneXpert IV',
        manufacturer: 'Cepheid',
        model: 'GeneXpert IV Real-Time PCR Module',
        protocol: 'ASTM_1394',
        ipAddress: '192.168.10.88',
        port: 5400,
        status: 'ONLINE',
        supportedDisciplines: ['Molecular Pathology', 'Microbiology'],
        lastHandshakeAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        lastPingMs: 12,
        totalResultsTransmitted: 310,
        errorCount: 0,
        isBidirectional: true,
        tenantId: 'ALL',
        tenantName: 'Molecular Diagnostics Lab',
    },
];

// Seed Protocol Raw Logs
const DEFAULT_RAW_LOGS: AnalyzerRawMessage[] = [
    {
        id: 'raw_01',
        analyzerId: 'ana_mindray_bs480',
        analyzerName: 'Mindray BS-480',
        direction: 'INBOUND',
        protocol: 'HL7_V2',
        rawPayload: 'MSH|^~\\&|MINDRAY_BS480|LAB|RAPHAMIS|CLINIC|20260915081522||ORU^R01|MSG0098231|P|2.5\nPID|1||MRN-778234||KAMAU^DAVID||19820412|M\nOBR|1|ORD-2026-9041|ACC-984210|CMP^Comprehensive Metabolic Panel\nOBX|1|NM|NA^Sodium||141|mmol/L|135-145|N|||F\nOBX|2|NM|K^Potassium||6.4|mmol/L|3.5-5.1|CH|||F\nOBX|3|NM|GLU^Glucose||92|mg/dL|70-99|N|||F',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'PARSED_SUCCESS',
        orderAccessionMatched: 'ACC-984210',
        parsedParametersCount: 3,
    },
    {
        id: 'raw_02',
        analyzerId: 'ana_sysmex_xn1000',
        analyzerName: 'Sysmex XN-1000',
        direction: 'INBOUND',
        protocol: 'ASTM_1394',
        rawPayload: 'H|\\^&|||Sysmex^XN-1000|||||||P|1394-97|20260915082400\nP|1||MRN-102948||ODHIAMBO^MERCY||19940718|F\nO|1|ACC-552109||^^^CBC^Complete Blood Count|R||||||A\nR|1|^^^WBC|7.8|10^3/uL|4.5-11.0|N||F\nR|2|^^^HGB|14.2|g/dL|12.0-16.0|N||F\nR|3|^^^PLT|220|10^3/uL|150-450|N||F\nL|1|N',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        status: 'PARSED_SUCCESS',
        orderAccessionMatched: 'ACC-552109',
        parsedParametersCount: 3,
    },
];

// Helper: Calculate Westgard Rule Status
export const evaluateWestgardRule = (
    value: number,
    mean: number,
    sd: number,
    previousRuns: LabQCRun[]
): { zScore: number; status: WestgardRule } => {
    const zScore = parseFloat(((value - mean) / sd).toFixed(2));
    const absZ = Math.abs(zScore);

    // 1-3s Rule: Single value > 3 SD (Rejection)
    if (absZ > 3.0) {
        return { zScore, status: 'REJECT_1_3S' };
    }

    if (previousRuns.length > 0) {
        const lastRun = previousRuns[previousRuns.length - 1];
        const lastZ = lastRun.zScore;

        // 2-2s Rule: Two consecutive runs > 2 SD on same side
        if (absZ > 2.0 && Math.abs(lastZ) > 2.0 && Math.sign(zScore) === Math.sign(lastZ)) {
            return { zScore, status: 'REJECT_2_2S' };
        }

        // R-4s Rule: Difference between two consecutive runs in same group exceeds 4 SD
        if (Math.abs(zScore - lastZ) > 4.0) {
            return { zScore, status: 'REJECT_R_4S' };
        }
    }

    // 4-1s Rule: 4 consecutive runs on same side exceeding 1 SD
    if (previousRuns.length >= 3) {
        const last3 = previousRuns.slice(-3);
        const all4Exceed1SD =
            absZ > 1.0 &&
            last3.every((r) => Math.abs(r.zScore) > 1.0 && Math.sign(r.zScore) === Math.sign(zScore));
        if (all4Exceed1SD) {
            return { zScore, status: 'REJECT_4_1S' };
        }
    }

    // 10x Rule: 10 consecutive runs falling on the same side of the Mean
    if (previousRuns.length >= 9) {
        const last9 = previousRuns.slice(-9);
        const all10SameSide =
            last9.every((r) => Math.sign(r.zScore) === Math.sign(zScore)) && zScore !== 0;
        if (all10SameSide) {
            return { zScore, status: 'REJECT_10X' };
        }
    }

    // 1-2s Rule: Warning when 1 value exceeds 2 SD
    if (absZ > 2.0) {
        return { zScore, status: 'WARNING_1_2S' };
    }

    return { zScore, status: 'IN_CONTROL' };
};

// Seed Quality Control Sets
const DEFAULT_QC_DATA: LabQualityControl[] = [
    {
        id: 'qc_potassium',
        testParameterName: 'Serum Potassium (K+)',
        category: 'Clinical Chemistry',
        controlLevel: 'LEVEL_2_NORMAL',
        lotNumber: 'BIO-RAD-K2026-B',
        expirationDate: '2026-12-31',
        targetMean: 4.2,
        standardDeviation: 0.15,
        unit: 'mmol/L',
        activeStatus: 'IN_CONTROL',
        analyzerName: 'Mindray BS-480',
        runs: [
            { runId: 'r1', runNumber: 1, timestamp: '2026-09-01T07:30:00Z', measuredValue: 4.18, zScore: -0.13, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r2', runNumber: 2, timestamp: '2026-09-02T07:35:00Z', measuredValue: 4.22, zScore: 0.13, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r3', runNumber: 3, timestamp: '2026-09-03T07:28:00Z', measuredValue: 4.31, zScore: 0.73, status: 'IN_CONTROL', technician: 'Otieno Kennedy, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r4', runNumber: 4, timestamp: '2026-09-04T07:40:00Z', measuredValue: 4.15, zScore: -0.33, status: 'IN_CONTROL', technician: 'Otieno Kennedy, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r5', runNumber: 5, timestamp: '2026-09-05T07:32:00Z', measuredValue: 4.26, zScore: 0.40, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r6', runNumber: 6, timestamp: '2026-09-06T07:45:00Z', measuredValue: 4.21, zScore: 0.07, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r7', runNumber: 7, timestamp: '2026-09-07T07:30:00Z', measuredValue: 4.52, zScore: 2.13, status: 'WARNING_1_2S', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Mindray BS-480', correctiveActionTaken: 'ISE electrode buffer recalibrated, repeat passed.' },
            { runId: 'r8', runNumber: 8, timestamp: '2026-09-08T07:34:00Z', measuredValue: 4.24, zScore: 0.27, status: 'IN_CONTROL', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r9', runNumber: 9, timestamp: '2026-09-09T07:29:00Z', measuredValue: 4.19, zScore: -0.07, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r10', runNumber: 10, timestamp: '2026-09-10T07:33:00Z', measuredValue: 4.20, zScore: 0.00, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r11', runNumber: 11, timestamp: '2026-09-11T07:30:00Z', measuredValue: 4.23, zScore: 0.20, status: 'IN_CONTROL', technician: 'Otieno Kennedy, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r12', runNumber: 12, timestamp: '2026-09-12T07:35:00Z', measuredValue: 4.25, zScore: 0.33, status: 'IN_CONTROL', technician: 'Otieno Kennedy, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r13', runNumber: 13, timestamp: '2026-09-13T07:31:00Z', measuredValue: 4.17, zScore: -0.20, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r14', runNumber: 14, timestamp: '2026-09-14T07:36:00Z', measuredValue: 4.21, zScore: 0.07, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
            { runId: 'r15', runNumber: 15, timestamp: '2026-09-15T07:30:00Z', measuredValue: 4.22, zScore: 0.13, status: 'IN_CONTROL', technician: 'Jane Wambui, MLT', analyzerInstrument: 'Mindray BS-480' },
        ],
    },
    {
        id: 'qc_hemoglobin',
        testParameterName: 'Hemoglobin (Hgb)',
        category: 'Hematology',
        controlLevel: 'LEVEL_2_NORMAL',
        lotNumber: 'SYSMEX-EIGHTCHECK-26',
        expirationDate: '2026-11-15',
        targetMean: 13.8,
        standardDeviation: 0.30,
        unit: 'g/dL',
        activeStatus: 'IN_CONTROL',
        analyzerName: 'Sysmex XN-1000',
        runs: [
            { runId: 'h1', runNumber: 1, timestamp: '2026-09-08T07:15:00Z', measuredValue: 13.75, zScore: -0.17, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h2', runNumber: 2, timestamp: '2026-09-09T07:20:00Z', measuredValue: 13.82, zScore: 0.07, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h3', runNumber: 3, timestamp: '2026-09-10T07:18:00Z', measuredValue: 13.91, zScore: 0.37, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h4', runNumber: 4, timestamp: '2026-09-11T07:25:00Z', measuredValue: 13.78, zScore: -0.07, status: 'IN_CONTROL', technician: 'Mary Achieng, MLS', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h5', runNumber: 5, timestamp: '2026-09-12T07:14:00Z', measuredValue: 13.84, zScore: 0.13, status: 'IN_CONTROL', technician: 'Mary Achieng, MLS', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h6', runNumber: 6, timestamp: '2026-09-13T07:19:00Z', measuredValue: 13.80, zScore: 0.00, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h7', runNumber: 7, timestamp: '2026-09-14T07:22:00Z', measuredValue: 13.86, zScore: 0.20, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
            { runId: 'h8', runNumber: 8, timestamp: '2026-09-15T07:16:00Z', measuredValue: 13.79, zScore: -0.03, status: 'IN_CONTROL', technician: 'Caleb Kiprono, MLT', analyzerInstrument: 'Sysmex XN-1000' },
        ],
    },
    {
        id: 'qc_troponin',
        testParameterName: 'High-Sensitivity Troponin I',
        category: 'Clinical Chemistry',
        controlLevel: 'LEVEL_1_LOW',
        lotNumber: 'ROCHE-CARDIAC-CTRL-1',
        expirationDate: '2026-10-30',
        targetMean: 0.025,
        standardDeviation: 0.003,
        unit: 'ng/mL',
        activeStatus: 'IN_CONTROL',
        analyzerName: 'Roche Cobas 6000 (e601)',
        runs: [
            { runId: 't1', runNumber: 1, timestamp: '2026-09-12T08:00:00Z', measuredValue: 0.024, zScore: -0.33, status: 'IN_CONTROL', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Roche Cobas 6000' },
            { runId: 't2', runNumber: 2, timestamp: '2026-09-13T08:10:00Z', measuredValue: 0.026, zScore: 0.33, status: 'IN_CONTROL', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Roche Cobas 6000' },
            { runId: 't3', runNumber: 3, timestamp: '2026-09-14T08:05:00Z', measuredValue: 0.025, zScore: 0.00, status: 'IN_CONTROL', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Roche Cobas 6000' },
            { runId: 't4', runNumber: 4, timestamp: '2026-09-15T08:02:00Z', measuredValue: 0.025, zScore: 0.00, status: 'IN_CONTROL', technician: 'Faith Mutua, MLS', analyzerInstrument: 'Roche Cobas 6000' },
        ],
    },
];

// Seed Specimen Racks & Tubes
const DEFAULT_SPECIMEN_RACKS: SpecimenRack[] = [
    {
        id: 'rack_hem_01',
        code: 'RACK-HEM-01',
        name: 'Hematology Active Analyzer Rack 01',
        department: 'Hematology',
        temperatureZone: 'Ambient (20-25°C)',
        totalSlots: 50,
        columns: 10,
        rows: 5,
        tubes: [
            {
                id: 'tube_01',
                barcode: 'TUBE-9918231',
                patientMRN: 'MRN-102948',
                patientName: 'Mercy Odhiambo',
                accessionNumber: 'ACC-552109',
                orderId: 'lab_ord_01',
                testPanelName: 'Complete Blood Count (CBC)',
                tubeColor: 'LAVENDER_EDTA',
                specimenType: 'Venous Whole Blood',
                collectionTimestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                rackId: 'rack_hem_01',
                rackSlotPosition: 'A1',
                status: 'IN_ANALYZER',
                temperature: 'Ambient 22°C',
                chainOfCustody: [
                    { action: 'Phlebotomy Sample Collected', performedBy: 'Nurse Sharon Koech', timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
                    { action: 'Accessioned & Barcode Affixed', performedBy: 'Lab Tech Caleb Kiprono', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
                    { action: 'Loaded to Sysmex Rack Position A1', performedBy: 'Lab Tech Caleb Kiprono', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
                ],
            },
            {
                id: 'tube_02',
                barcode: 'TUBE-9918232',
                patientMRN: 'MRN-204918',
                patientName: 'Joseph Njoroge',
                accessionNumber: 'ACC-552110',
                orderId: 'lab_ord_02',
                testPanelName: 'Complete Blood Count (CBC)',
                tubeColor: 'LAVENDER_EDTA',
                specimenType: 'Venous Whole Blood',
                collectionTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                rackId: 'rack_hem_01',
                rackSlotPosition: 'A2',
                status: 'COLLECTED',
                temperature: 'Ambient 22°C',
                chainOfCustody: [
                    { action: 'Phlebotomy Sample Collected', performedBy: 'Nurse Sharon Koech', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
                ],
            },
            {
                id: 'tube_03',
                barcode: 'TUBE-9918233',
                patientMRN: 'MRN-334102',
                patientName: 'Amina Hassan',
                accessionNumber: 'ACC-552111',
                orderId: 'lab_ord_03',
                testPanelName: 'Coagulation Panel (PT/INR)',
                tubeColor: 'LIGHT_BLUE_CITRATE',
                specimenType: 'Plasma',
                collectionTimestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                rackId: 'rack_hem_01',
                rackSlotPosition: 'B1',
                status: 'CENTRIFUGED',
                temperature: 'Ambient 22°C',
                chainOfCustody: [
                    { action: 'Phlebotomy Sample Collected', performedBy: 'Nurse Brian Ouma', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
                    { action: 'Centrifuged 1500g for 10 min', performedBy: 'Lab Tech Caleb Kiprono', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
                ],
            },
        ],
    },
    {
        id: 'rack_chem_01',
        code: 'RACK-CHEM-01',
        name: 'Chemistry Serum Rack 01',
        department: 'Clinical Chemistry',
        temperatureZone: 'Centrifuge & Storage (2-8°C)',
        totalSlots: 50,
        columns: 10,
        rows: 5,
        tubes: [
            {
                id: 'tube_04',
                barcode: 'TUBE-8827101',
                patientMRN: 'MRN-778234',
                patientName: 'David Kamau',
                accessionNumber: 'ACC-984210',
                orderId: 'lab_ord_04',
                testPanelName: 'Comprehensive Metabolic Panel (CMP)',
                tubeColor: 'YELLOW_SST',
                specimenType: 'Serum',
                collectionTimestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                rackId: 'rack_chem_01',
                rackSlotPosition: 'A1',
                status: 'TESTED',
                temperature: 'Cold Store 4°C',
                chainOfCustody: [
                    { action: 'Phlebotomy Sample Collected', performedBy: 'Nurse Kevin Maina', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
                    { action: 'Clot Retraction & Centrifugation 2000g', performedBy: 'Jane Wambui, MLT', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString() },
                    { action: 'Processed on Mindray BS-480', performedBy: 'Mindray BS-480 Auto-sampler', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
                ],
            },
            {
                id: 'tube_05',
                barcode: 'TUBE-8827102',
                patientMRN: 'MRN-881920',
                patientName: 'Fatuma Mohammed',
                accessionNumber: 'ACC-984211',
                orderId: 'lab_ord_05',
                testPanelName: 'High-Sensitivity Cardiac Troponin I',
                tubeColor: 'GREEN_HEPARIN',
                specimenType: 'Plasma',
                collectionTimestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
                rackId: 'rack_chem_01',
                rackSlotPosition: 'A3',
                status: 'IN_ANALYZER',
                temperature: 'Ambient 22°C',
                chainOfCustody: [
                    { action: 'STAT Emergency Collection (ER Bed 4)', performedBy: 'ER Nurse Patricia Adhiambo', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
                    { action: 'Rapid Stat Centrifuge 3 min', performedBy: 'Jane Wambui, MLT', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
                    { action: 'Loaded to Cobas e601 STAT lane', performedBy: 'Jane Wambui, MLT', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
                ],
            },
        ],
    },
];

// Seed Critical Panic Alerts
const DEFAULT_PANIC_ALERTS: CriticalPanicAlert[] = [
    {
        id: 'panic_01',
        orderId: 'lab_ord_04',
        orderNumber: 'ORD-2026-9041',
        accessionNumber: 'ACC-984210',
        patientId: 'pat_01',
        patientName: 'David Kamau',
        patientMRN: 'MRN-778234',
        testPanelName: 'Comprehensive Metabolic Panel (CMP)',
        parameterName: 'Serum Potassium (K+)',
        criticalValue: 6.4,
        criticalLimit: '> 6.2 mmol/L',
        unit: 'mmol/L',
        flag: 'Critical High',
        orderingPhysicianName: 'Dr. Sarah Lin, MD (Cardiology)',
        physicianPhone: '+254712345678',
        smsDispatchStatus: 'DELIVERED',
        verbalReadbackConfirmed: true,
        verbalReadbackBy: 'Dr. Sarah Lin, MD',
        verbalReadbackAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        clinicalActionLogged: 'Emergency 10% Calcium Gluconate IV + Insulin/Dextrose shift initiated. Continuous ECG monitoring attached.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
        id: 'panic_02',
        orderId: 'lab_ord_05',
        orderNumber: 'ORD-2026-9042',
        accessionNumber: 'ACC-984211',
        patientId: 'pat_02',
        patientName: 'Fatuma Mohammed',
        patientMRN: 'MRN-881920',
        testPanelName: 'High-Sensitivity Cardiac Troponin I',
        parameterName: 'High-Sensitivity Troponin I',
        criticalValue: 0.85,
        criticalLimit: '> 0.40 ng/mL',
        unit: 'ng/mL',
        flag: 'Critical High',
        orderingPhysicianName: 'Dr. Robert Mwangi, MD (Emergency Medicine)',
        physicianPhone: '+254722998877',
        smsDispatchStatus: 'QUEUED',
        verbalReadbackConfirmed: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
];

// LocalStorage helpers
export const getStoredLabAnalyzers = (): LabAnalyzerDevice[] => {
    try {
        const item = localStorage.getItem(STORAGE_KEY_ANALYZERS);
        return item ? JSON.parse(item) : DEFAULT_ANALYZERS;
    } catch {
        return DEFAULT_ANALYZERS;
    }
};

export const saveStoredLabAnalyzers = (analyzers: LabAnalyzerDevice[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_ANALYZERS, JSON.stringify(analyzers));
    } catch (e) {
        console.warn('Failed to save lab analyzers', e);
    }
};

export const getStoredAnalyzerLogs = (): AnalyzerRawMessage[] => {
    try {
        const item = localStorage.getItem(STORAGE_KEY_ANALYZER_LOGS);
        return item ? JSON.parse(item) : DEFAULT_RAW_LOGS;
    } catch {
        return DEFAULT_RAW_LOGS;
    }
};

export const saveStoredAnalyzerLogs = (logs: AnalyzerRawMessage[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_ANALYZER_LOGS, JSON.stringify(logs));
    } catch (e) {
        console.warn('Failed to save raw logs', e);
    }
};

export const getStoredLabQC = (): LabQualityControl[] => {
    try {
        const item = localStorage.getItem(STORAGE_KEY_QC);
        return item ? JSON.parse(item) : DEFAULT_QC_DATA;
    } catch {
        return DEFAULT_QC_DATA;
    }
};

export const saveStoredLabQC = (qc: LabQualityControl[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_QC, JSON.stringify(qc));
    } catch (e) {
        console.warn('Failed to save lab QC', e);
    }
};

export const getStoredSpecimenRacks = (): SpecimenRack[] => {
    try {
        const item = localStorage.getItem(STORAGE_KEY_SPECIMEN_RACKS);
        return item ? JSON.parse(item) : DEFAULT_SPECIMEN_RACKS;
    } catch {
        return DEFAULT_SPECIMEN_RACKS;
    }
};

export const saveStoredSpecimenRacks = (racks: SpecimenRack[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_SPECIMEN_RACKS, JSON.stringify(racks));
    } catch (e) {
        console.warn('Failed to save specimen racks', e);
    }
};

export const getStoredPanicAlerts = (): CriticalPanicAlert[] => {
    try {
        const item = localStorage.getItem(STORAGE_KEY_PANIC_ALERTS);
        return item ? JSON.parse(item) : DEFAULT_PANIC_ALERTS;
    } catch {
        return DEFAULT_PANIC_ALERTS;
    }
};

export const saveStoredPanicAlerts = (alerts: CriticalPanicAlert[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_PANIC_ALERTS, JSON.stringify(alerts));
    } catch (e) {
        console.warn('Failed to save panic alerts', e);
    }
};

// API: Get Analyzers
export const getLabAnalyzers = async (): Promise<LabAnalyzerDevice[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStoredLabAnalyzers();
};

// API: Ping Analyzer
export const pingAnalyzer = async (
    analyzerId: string
): Promise<{ success: boolean; latencyMs: number; status: AnalyzerDeviceStatus }> => {
    await new Promise((r) => setTimeout(r, 250));
    const analyzers = getStoredLabAnalyzers();
    const idx = analyzers.findIndex((a) => a.id === analyzerId);
    if (idx === -1) throw new Error('Analyzer device not found');

    const latencyMs = Math.floor(Math.random() * 20) + 6;
    analyzers[idx].lastHandshakeAt = new Date().toISOString();
    analyzers[idx].lastPingMs = latencyMs;
    analyzers[idx].status = 'ONLINE';
    saveStoredLabAnalyzers(analyzers);

    return { success: true, latencyMs, status: 'ONLINE' };
};

// API: Simulate Automated Ingest from Analyzer Machine
export const simulateAnalyzerIngest = async (
    analyzerId: string,
    targetOrderId?: string
): Promise<{
    updatedOrder: LabOrder;
    rawMessage: AnalyzerRawMessage;
    newCriticalAlert?: CriticalPanicAlert;
}> => {
    await new Promise((r) => setTimeout(r, 400));
    const analyzers = getStoredLabAnalyzers();
    const analyzer = analyzers.find((a) => a.id === analyzerId) || analyzers[0];

    const orders = getStoredLabOrders();
    let order: LabOrder | undefined;

    if (targetOrderId) {
        order = orders.find((o) => o.id === targetOrderId);
    }
    if (!order) {
        // Pick first pending or in-analysis order matching category
        order = orders.find(
            (o) =>
                o.status === 'In Analysis' ||
                o.status === 'Sample Collected' ||
                o.status === 'Ordered'
        );
    }
    if (!order) {
        order = orders[0];
    }
    if (!order) throw new Error('No laboratory order available for ingest.');

    // Populate realistic parameters based on order test panel
    let hasPanic = false;
    let panicParamName = '';
    let panicVal: number | string = 0;
    let panicLimit = '';

    const newParameters: LabTestParameter[] = order.parameters.map((p) => {
        let val: number;
        let flag: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low' = 'Normal';

        const low = p.refLow ?? 0;
        const high = p.refHigh ?? 100;

        // 30% chance of critical or high
        const rand = Math.random();
        if (p.name.includes('Potassium') && rand > 0.6) {
            val = 6.6;
            flag = 'Critical High';
            hasPanic = true;
            panicParamName = p.name;
            panicVal = val;
            panicLimit = '> 6.2 mmol/L';
        } else if (p.name.includes('Troponin') && rand > 0.5) {
            val = 0.88;
            flag = 'Critical High';
            hasPanic = true;
            panicParamName = p.name;
            panicVal = val;
            panicLimit = '> 0.40 ng/mL';
        } else if (p.name.includes('Platelet') && rand > 0.8) {
            val = 32;
            flag = 'Critical Low';
            hasPanic = true;
            panicParamName = p.name;
            panicVal = val;
            panicLimit = '< 40 10^3/µL';
        } else {
            // Normal within reference range
            val = parseFloat((low + Math.random() * (high - low)).toFixed(1));
            flag = 'Normal';
        }

        return {
            ...p,
            value: val,
            flag,
            interpretation: flag === 'Normal' ? 'Within normal physiological range' : `Automated flag by ${analyzer.name}`,
        };
    });

    const now = new Date().toISOString();
    const updatedOrder: LabOrder = {
        ...order,
        parameters: newParameters,
        status: hasPanic ? 'Critical Alert' : 'Completed',
        analyzedAt: now,
        completedAt: hasPanic ? undefined : now,
        analyzerInstrument: analyzer.name,
        technicianNotes: `Transmitted via ${analyzer.protocol} interface from ${analyzer.model}. Automated parity check passed.`,
        verifiedBy: 'Auto-Validated (LIS ASTM/HL7 Rule Engine)',
        hasCriticalAlert: hasPanic,
    };

    const orderIdx = orders.findIndex((o) => o.id === order!.id);
    if (orderIdx !== -1) {
        orders[orderIdx] = updatedOrder;
        saveStoredLabOrders(orders);
    }

    // Update analyzer stats
    analyzer.totalResultsTransmitted += 1;
    analyzer.lastHandshakeAt = now;
    analyzer.status = 'ONLINE';
    saveStoredLabAnalyzers(analyzers);

    // Create raw protocol message log
    let rawPayload = '';
    if (analyzer.protocol === 'HL7_V2') {
        rawPayload = `MSH|^~\\&|${analyzer.model.replace(/\s+/g, '_')}|LAB|RAPHAMIS|CLINIC|${now.replace(/[-:TZ.]/g, '').slice(0, 14)}||ORU^R01|MSG${Date.now().toString().slice(-6)}|P|2.5\n` +
            `PID|1||${updatedOrder.patientMRN}||${updatedOrder.patientName.replace(' ', '^')}||${updatedOrder.patientAge}|${updatedOrder.patientGender[0]}\n` +
            `OBR|1|${updatedOrder.orderNumber}|${updatedOrder.accessionNumber}|${updatedOrder.testPanelName}\n` +
            newParameters.slice(0, 4).map((p, i) => `OBX|${i + 1}|NM|${p.name}||${p.value}|${p.unit}|${p.referenceRange}|${p.flag === 'Normal' ? 'N' : 'CH'}|||F`).join('\n');
    } else {
        rawPayload = `H|\\^&|||${analyzer.manufacturer}^${analyzer.model}|||||||P|1394-97|${now}\n` +
            `P|1||${updatedOrder.patientMRN}||${updatedOrder.patientName.replace(' ', '^')}|||${updatedOrder.patientGender[0]}\n` +
            `O|1|${updatedOrder.accessionNumber}||^^^${updatedOrder.testPanelName}|R||||||A\n` +
            newParameters.slice(0, 4).map((p, i) => `R|${i + 1}|^^^${p.name}|${p.value}|${p.unit}|${p.referenceRange}|${p.flag === 'Normal' ? 'N' : 'CH'}||F`).join('\n') +
            `\nL|1|N`;
    }

    const rawMsg: AnalyzerRawMessage = {
        id: `raw_${Date.now()}`,
        analyzerId: analyzer.id,
        analyzerName: analyzer.name,
        direction: 'INBOUND',
        protocol: analyzer.protocol,
        rawPayload,
        timestamp: now,
        status: 'PARSED_SUCCESS',
        orderAccessionMatched: updatedOrder.accessionNumber,
        parsedParametersCount: newParameters.length,
    };

    const logs = getStoredAnalyzerLogs();
    logs.unshift(rawMsg);
    saveStoredAnalyzerLogs(logs.slice(0, 50));

    // Handle panic alert if generated
    let newCriticalAlert: CriticalPanicAlert | undefined;
    if (hasPanic) {
        newCriticalAlert = {
            id: `panic_${Date.now()}`,
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            accessionNumber: updatedOrder.accessionNumber,
            patientId: updatedOrder.patientId,
            patientName: updatedOrder.patientName,
            patientMRN: updatedOrder.patientMRN,
            testPanelName: updatedOrder.testPanelName,
            parameterName: panicParamName,
            criticalValue: panicVal,
            criticalLimit: panicLimit,
            unit: 'mmol/L',
            flag: 'Critical High',
            orderingPhysicianName: updatedOrder.orderingPhysicianName,
            physicianPhone: '+254712345678',
            smsDispatchStatus: 'QUEUED',
            verbalReadbackConfirmed: false,
            createdAt: now,
        };

        const alerts = getStoredPanicAlerts();
        alerts.unshift(newCriticalAlert);
        saveStoredPanicAlerts(alerts);
    }

    return { updatedOrder, rawMessage: rawMsg, newCriticalAlert };
};

// API: Get Raw Messages
export const getAnalyzerRawMessages = async (analyzerId?: string): Promise<AnalyzerRawMessage[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const logs = getStoredAnalyzerLogs();
    if (!analyzerId || analyzerId === 'ALL') return logs;
    return logs.filter((l) => l.analyzerId === analyzerId);
};

// API: Get Quality Control Sets
export const getLabQualityControls = async (): Promise<LabQualityControl[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStoredLabQC();
};

// API: Record a new QC Run
export const recordLabQCRun = async (
    qcId: string,
    measuredValue: number,
    technician: string,
    analyzerInstrument: string
): Promise<{ updatedQC: LabQualityControl; newRun: LabQCRun }> => {
    await new Promise((r) => setTimeout(r, 200));
    const allQC = getStoredLabQC();
    const idx = allQC.findIndex((q) => q.id === qcId);
    if (idx === -1) throw new Error('QC definition not found');

    const qc = allQC[idx];
    const { zScore, status } = evaluateWestgardRule(
        measuredValue,
        qc.targetMean,
        qc.standardDeviation,
        qc.runs
    );

    const now = new Date().toISOString();
    const newRun: LabQCRun = {
        runId: `run_${Date.now()}`,
        runNumber: qc.runs.length + 1,
        timestamp: now,
        measuredValue,
        zScore,
        status,
        technician,
        analyzerInstrument,
    };

    qc.runs.push(newRun);
    qc.activeStatus =
        status === 'IN_CONTROL'
            ? 'IN_CONTROL'
            : status === 'WARNING_1_2S'
            ? 'WARNING'
            : 'OUT_OF_CONTROL';

    allQC[idx] = qc;
    saveStoredLabQC(allQC);

    return { updatedQC: qc, newRun };
};

// API: Resolve QC Violation
export const resolveQCViolation = async (
    qcId: string,
    runId: string,
    correctiveAction: string
): Promise<LabQualityControl> => {
    const allQC = getStoredLabQC();
    const idx = allQC.findIndex((q) => q.id === qcId);
    if (idx === -1) throw new Error('QC definition not found');

    const qc = allQC[idx];
    const run = qc.runs.find((r) => r.runId === runId);
    if (run) {
        run.correctiveActionTaken = correctiveAction;
    }
    qc.activeStatus = 'IN_CONTROL';
    allQC[idx] = qc;
    saveStoredLabQC(allQC);
    return qc;
};

// API: Get Specimen Racks
export const getSpecimenRacks = async (): Promise<SpecimenRack[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStoredSpecimenRacks();
};

// API: Update Specimen Tube Status
export const updateSpecimenTubeStatus = async (
    rackId: string,
    tubeId: string,
    newStatus: SpecimenTubeStatus,
    performedBy: string = 'Lab Technician'
): Promise<SpecimenRack[]> => {
    const racks = getStoredSpecimenRacks();
    const rack = racks.find((r) => r.id === rackId);
    if (!rack) throw new Error('Rack not found');

    const tube = rack.tubes.find((t) => t.id === tubeId);
    if (!tube) throw new Error('Specimen tube not found');

    tube.status = newStatus;
    tube.chainOfCustody.push({
        action: `Status updated to ${newStatus}`,
        performedBy,
        timestamp: new Date().toISOString(),
    });

    saveStoredSpecimenRacks(racks);
    return racks;
};

// API: Get Critical Panic Alerts
export const getCriticalPanicAlerts = async (): Promise<CriticalPanicAlert[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStoredPanicAlerts();
};

// API: Dispatch Critical Panic SMS / WhatsApp (Leveraging Phase 3)
export const dispatchCriticalPanicSMS = async (
    alertId: string
): Promise<CriticalPanicAlert> => {
    await new Promise((r) => setTimeout(r, 300));
    const alerts = getStoredPanicAlerts();
    const idx = alerts.findIndex((a) => a.id === alertId);
    if (idx === -1) throw new Error('Alert not found');

    alerts[idx].smsDispatchStatus = 'DELIVERED';
    saveStoredPanicAlerts(alerts);
    return alerts[idx];
};

// API: Record Verbal Readback
export const recordVerbalReadback = async (
    alertId: string,
    physicianName: string,
    actionLogged: string
): Promise<CriticalPanicAlert> => {
    const alerts = getStoredPanicAlerts();
    const idx = alerts.findIndex((a) => a.id === alertId);
    if (idx === -1) throw new Error('Alert not found');

    alerts[idx].verbalReadbackConfirmed = true;
    alerts[idx].verbalReadbackBy = physicianName;
    alerts[idx].verbalReadbackAt = new Date().toISOString();
    alerts[idx].clinicalActionLogged = actionLogged;

    saveStoredPanicAlerts(alerts);
    return alerts[idx];
};

