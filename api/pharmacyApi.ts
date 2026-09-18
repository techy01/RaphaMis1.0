import {
    PharmacyOrder,
    PharmacyTriageStatus,
    PharmacyTriageUrgency,
    PharmacyFormularyItem,
    ClinicalIntervention,
    PharmacyStats,
    PharmacySafetyAlert,
} from '../packages/shared/types';
import { getStoredPatients } from './mockPatientData';

const ORDERS_KEY = 'raphamis_mock_pharmacy_orders_v2';
const INVENTORY_KEY = 'raphamis_mock_pharmacy_inventory_v2';
const INTERVENTIONS_KEY = 'raphamis_mock_pharmacy_interventions_v2';

// ----------------------------------------------------
// Initial Seed Data: Realistic 21st-Century Hospital Rx Orders
// ----------------------------------------------------
const initialOrders: PharmacyOrder[] = [
    {
        id: 'rx_001',
        orderNumber: 'RX-2026-9041',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 68,
        patientGender: 'Female',
        patientWeightKg: 64.5,
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Acute Heart Failure exacerbation, Atrial Fibrillation with RVR',
        patientAllergies: ['Penicillin', 'Sulfa Drugs'],
        eGFR: 28,
        serumCreatinine: 2.1,
        medicationName: 'Piperacillin / Tazobactam (Zosyn)',
        genericName: 'Piperacillin-Tazobactam IV',
        ndc: '00206-8821-44',
        strength: '3.375g / 100mL D5W',
        dose: '3.375g',
        route: 'IV Piggyback',
        frequency: 'Every 8 hours',
        durationDays: 7,
        quantityOrdered: 21,
        instructions: 'Infuse IV over 4 hours extended infusion via secondary smart pump.',
        prescriberName: 'Dr. Sarah Lin, MD',
        prescriberNPI: '1948201948',
        prescriberDepartment: 'Cardiology & CCU',
        prescribedAt: '2026-09-10T08:42:00.000Z',
        urgency: 'STAT',
        status: 'Clinical Hold',
        isHighAlert: false,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_01_allergy',
                type: 'Drug-Allergy',
                severity: 'Contraindicated',
                title: 'Severe Anaphylactic Risk: Documented Penicillin Allergy',
                description: 'Piperacillin is a broad-spectrum ureidopenicillin. Patient record specifies documented severe Penicillin allergy (urticaria & bronchospasm). High risk of cross-reactivity.',
                recommendation: 'WITHHOLD. Contact Dr. Sarah Lin immediately. Recommend alternative non-beta-lactam coverage (e.g. Aztreonam 1g IV q8h or Ciprofloxacin + Vancomycin).',
                overridden: false,
            },
            {
                id: 'alert_01_renal',
                type: 'Renal Dose Adjustment',
                severity: 'Major',
                title: 'Impaired Renal Clearance (eGFR 28 mL/min)',
                description: 'Standard dose 3.375g q8h exceeds clearance threshold for severe renal impairment. Risk of drug accumulation and neurotoxicity.',
                recommendation: 'Adjust dose to 2.25g IV q8h or 3.375g IV q12h based on CrCl < 50 mL/min.',
                overridden: false,
            },
        ],
        barcode: 'NDC-00206-8821-44-RX9041',
        assignedDispenser: 'Central Cleanroom Hood IV-A',
        deliveryMethod: 'Pneumatic Tube',
        tubeStationCode: 'ST-ICU-42',
        clinicalNotes: 'Flagged on automated triage intake. Needs urgent physician consult before compounding.',
    },
    {
        id: 'rx_002',
        orderNumber: 'RX-2026-9042',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 68,
        patientGender: 'Female',
        patientWeightKg: 64.5,
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Atrial Fibrillation, Deep Vein Thrombosis Prophylaxis',
        patientAllergies: ['Penicillin', 'Sulfa Drugs'],
        eGFR: 28,
        serumCreatinine: 2.1,
        medicationName: 'Enoxaparin Sodium (Lovenox)',
        genericName: 'Enoxaparin Sodium',
        ndc: '00075-0621-30',
        strength: '40mg / 0.4mL Pre-filled Syringe',
        dose: '40mg',
        route: 'Subcutaneous',
        frequency: 'Once Daily',
        durationDays: 5,
        quantityOrdered: 5,
        instructions: 'Inject subcutaneously into anterolateral abdominal wall. Rotate sites.',
        prescriberName: 'Dr. Sarah Lin, MD',
        prescriberNPI: '1948201948',
        prescriberDepartment: 'Cardiology',
        prescribedAt: '2026-09-10T08:15:00.000Z',
        urgency: 'Urgent',
        status: 'Barcode Verification',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_02_renal',
                type: 'Renal Dose Adjustment',
                severity: 'Moderate',
                title: 'Renal Dose Monitoring Required (CrCl < 30 mL/min)',
                description: 'Enoxaparin eliminated primarily via kidneys. Increased bleeding hazard in severe renal impairment.',
                recommendation: 'Standard 40mg daily accepted; monitor anti-Xa levels if prolonged therapy exceeds 72 hours.',
                overridden: true,
                overrideReason: 'Pharmacist reviewed anti-Xa monitoring protocol in place with attending cardiologist.',
                overriddenBy: 'PharmD. Alex Chen, BCPS',
            },
        ],
        barcode: 'NDC-00075-0621-30-SYR849',
        assignedDispenser: 'Pyxis MedStation 3000 - Unit 3 East',
        deliveryMethod: 'Bedside Cart Delivery',
        clinicalNotes: 'Cleared for barcode verification scan at bedside nursing depot.',
    },
    {
        id: 'rx_003',
        orderNumber: 'RX-2026-9043',
        patientId: 'pat_004',
        patientName: 'Marcus Sterling',
        patientMRN: 'MRN-77319',
        patientAge: 52,
        patientGender: 'Male',
        patientWeightKg: 88.0,
        patientLocation: 'Intensive Care Unit - Bed 12',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Septic Shock, Severe Hypotension, Community Acquired Pneumonia',
        patientAllergies: [],
        eGFR: 62,
        serumCreatinine: 1.2,
        medicationName: 'Norepinephrine Bitartrate (Levophed)',
        genericName: 'Norepinephrine Infusion',
        ndc: '00409-1443-04',
        strength: '4mg in 250mL D5W (16 mcg/mL)',
        dose: '2 - 30 mcg/min titrated',
        route: 'Continuous Infusion',
        frequency: 'Continuous Titration',
        durationDays: 2,
        quantityOrdered: 2,
        instructions: 'Central line only. Titrate continuously to maintain MAP >= 65 mmHg. Double clinician sign-off.',
        prescriberName: 'Dr. James Rodriguez, MD',
        prescriberNPI: '1482093847',
        prescriberDepartment: 'Critical Care Medicine',
        prescribedAt: '2026-09-10T09:02:00.000Z',
        urgency: 'STAT',
        status: 'Ready for Delivery',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_03_highalert',
                type: 'High-Alert Med',
                severity: 'Major',
                title: 'Vasoactive High-Alert Infusion',
                description: 'Risk of peripheral extravasation and severe tissue necrosis if administered through peripheral line.',
                recommendation: 'Administer exclusively through verified central venous catheter with in-line smart pump guardrails.',
                overridden: true,
                overrideReason: 'Central venous line insertion verified in ICU flow sheet.',
                overriddenBy: 'PharmD. Maya Patel',
            },
        ],
        barcode: 'NDC-00409-1443-04-LEV9043',
        assignedDispenser: 'Robotic IV Compounder Station 1',
        deliveryMethod: 'Pneumatic Tube',
        tubeStationCode: 'TUBE-ICU-08',
        clinicalNotes: 'Compounding completed under laminar flow hood. Carrier loaded into tube station 08 for immediate launch.',
    },
    {
        id: 'rx_004',
        orderNumber: 'RX-2026-9044',
        patientId: 'pat_002',
        patientName: 'Liam Montgomery',
        patientMRN: 'MRN-33104',
        patientAge: 9,
        patientGender: 'Male',
        patientWeightKg: 31.2,
        patientLocation: 'Pediatric Clinic - Exam 3',
        patientTenantId: 'tnt_002',
        patientTenantName: "Mercy Children's Clinic",
        patientDiagnosis: 'Severe Acute Asthma Exacerbation, Bronchospasm',
        patientAllergies: ['Peanuts'],
        eGFR: 105,
        serumCreatinine: 0.5,
        medicationName: 'Methylprednisolone Sodium Succinate (Solu-Medrol)',
        genericName: 'Methylprednisolone Injection',
        ndc: '00009-0047-22',
        strength: '40mg Single-Dose Vial',
        dose: '30mg (1 mg/kg)',
        route: 'IV Push',
        frequency: 'Every 6 hours x 4 doses',
        durationDays: 1,
        quantityOrdered: 4,
        instructions: 'Reconstitute with bacteriostatic water. Administer slow IV push over 3 minutes.',
        prescriberName: 'Dr. Marcus Vance, FAAP',
        prescriberNPI: '1392019482',
        prescriberDepartment: 'Pediatric Pulmonology',
        prescribedAt: '2026-09-10T09:08:00.000Z',
        urgency: 'Urgent',
        status: 'Pending Verification',
        isHighAlert: false,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_04_peds',
                type: 'Therapeutic Duplication',
                severity: 'Minor',
                title: 'Weight-Based Pediatric Dose Verification',
                description: 'Dose calculated at 0.96 mg/kg based on recorded weight 31.2 kg. Matches pediatric emergency guidelines (1-2 mg/kg/day).',
                recommendation: 'Dosing mathematically optimal for acute status asthmaticus.',
                overridden: false,
            },
        ],
        barcode: 'NDC-00009-0047-22-SOLU9044',
        assignedDispenser: 'Pediatric Satellite Dispenser B',
        deliveryMethod: 'Nurse Station Pickup',
        clinicalNotes: 'Awaiting primary pharmacist verification queue.',
    },
    {
        id: 'rx_005',
        orderNumber: 'RX-2026-9045',
        patientId: 'pat_003',
        patientName: 'Sophia Chen',
        patientMRN: 'MRN-55291',
        patientAge: 34,
        patientGender: 'Female',
        patientWeightKg: 58.0,
        patientLocation: 'Surgical Stepdown - Room 218',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Status-Post Laparoscopic Cholecystectomy, Acute Postoperative Pain',
        patientAllergies: ['Codeine'],
        eGFR: 98,
        serumCreatinine: 0.7,
        medicationName: 'Hydromorphone HCl (Dilaudid)',
        genericName: 'Hydromorphone Injection',
        ndc: '00409-1312-30',
        strength: '2mg / 1mL Carpuject Ampoule',
        dose: '0.5mg',
        route: 'IV Push',
        frequency: 'Every 3 hours PRN severe breakthrough pain (VAS >= 7)',
        durationDays: 2,
        quantityOrdered: 6,
        instructions: 'Dilute with 5mL sterile saline. Inject slowly over 2-3 minutes. Monitor continuous SpO2 and RR.',
        prescriberName: 'Dr. Eric Thorne, MD',
        prescriberNPI: '1849201859',
        prescriberDepartment: 'General Surgery & Trauma',
        prescribedAt: '2026-09-10T08:50:00.000Z',
        urgency: 'Urgent',
        status: 'In Dispensing',
        isHighAlert: true,
        isControlledSubstance: true,
        scheduleLevel: 'Schedule II',
        safetyAlerts: [
            {
                id: 'alert_05_opioid',
                type: 'High-Alert Med',
                severity: 'Major',
                title: 'Schedule II Narcotic - Dual Witness Required',
                description: 'Controlled substance Schedule II. Patient has history of opioid naivety and documented Codeine nausea/intolerance.',
                recommendation: 'Verify dual nurse electronic witness in Pyxis prior to vault drawer unlatching.',
                overridden: true,
                overrideReason: 'Dose conservative at 0.5mg (1/4 standard carpuject). Waste protocol enforced.',
                overriddenBy: 'PharmD. Alex Chen, BCPS',
            },
        ],
        barcode: 'NDC-00409-1312-30-DIL9045',
        assignedDispenser: 'Automated Controlled Substance Vault #1',
        deliveryMethod: 'Bedside Cart Delivery',
        clinicalNotes: 'Narcotic electronic vault unlatched for safe dispensing with perpetual inventory tracking.',
    },
    {
        id: 'rx_006',
        orderNumber: 'RX-2026-9046',
        patientId: 'pat_005',
        patientName: 'Arthur Pendelton',
        patientMRN: 'MRN-99402',
        patientAge: 74,
        patientGender: 'Male',
        patientWeightKg: 79.4,
        patientLocation: 'Orthopedic Inpatient Wing - Bed 402',
        patientTenantId: 'tnt_004',
        patientTenantName: 'Apex Orthopedic Institute',
        patientDiagnosis: 'Left Total Knee Arthroplasty (Post-Op Day 2), Discharge Planning',
        patientAllergies: ['Aspirin'],
        eGFR: 55,
        serumCreatinine: 1.3,
        medicationName: 'Apixaban (Eliquis)',
        genericName: 'Apixaban Oral Film-Coated Tablets',
        ndc: '00069-0897-60',
        strength: '2.5mg Tablet',
        dose: '2.5mg',
        route: 'Oral Solid',
        frequency: 'Twice Daily (12 hours apart)',
        durationDays: 14,
        quantityOrdered: 28,
        instructions: 'Take 1 tablet by mouth twice daily with or without food. Discharge deep vein thrombosis thromboprophylaxis.',
        prescriberName: 'Dr. David Kim, FAAOS',
        prescriberNPI: '1749201940',
        prescriberDepartment: 'Orthopedic Surgery',
        prescribedAt: '2026-09-10T07:30:00.000Z',
        urgency: 'Discharge',
        status: 'Dispensed',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [],
        barcode: 'NDC-00069-0897-60-ELI9046',
        assignedDispenser: 'Outpatient Bedside Discharge Robot',
        deliveryMethod: 'Bedside Cart Delivery',
        dispensedAt: '2026-09-10T08:35:00.000Z',
        verifiedBy: 'PharmD. Maya Patel',
        clinicalNotes: 'Discharge counseling packet generated. Medication delivered to bedside nurse for final patient discharge teach-back.',
    },
    {
        id: 'rx_007',
        orderNumber: 'RX-2026-9047',
        patientId: 'pat_006',
        patientName: 'Grace Hopper',
        patientMRN: 'MRN-10294',
        patientAge: 61,
        patientGender: 'Female',
        patientWeightKg: 71.0,
        patientLocation: 'Oncology Day Infusion Unit - Chair 6',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Metastatic Non-Small Cell Lung Cancer (PD-L1 Expression > 50%)',
        patientAllergies: [],
        eGFR: 84,
        serumCreatinine: 0.9,
        medicationName: 'Pembrolizumab (Keytruda)',
        genericName: 'Pembrolizumab Injection for Intravenous Use',
        ndc: '00006-3026-02',
        strength: '100mg / 4mL Single-Dose Vial (Total 200mg)',
        dose: '200mg',
        route: 'Continuous Infusion',
        frequency: 'Every 3 weeks',
        durationDays: 1,
        quantityOrdered: 2,
        instructions: 'Dilute in 100mL 0.9% Sodium Chloride (concentration 1-10 mg/mL). Infuse over 30 minutes through sterile low-protein binding 0.2-micron in-line filter.',
        prescriberName: 'Dr. Helena Rostova, MD, PhD',
        prescriberNPI: '1648201941',
        prescriberDepartment: 'Medical Oncology',
        prescribedAt: '2026-09-10T08:20:00.000Z',
        urgency: 'STAT',
        status: 'In Dispensing',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_07_immuno',
                type: 'Black Box Warning',
                severity: 'Major',
                title: 'Immune-Mediated Adverse Reactions Warning',
                description: 'Monoclonal antibody checkpoint inhibitor. Risk of immune pneumonitis, colitis, hepatitis, and endocrinopathies.',
                recommendation: 'Verify baseline LFTs, TSH, and clear chest CT before infusion release.',
                overridden: true,
                overrideReason: 'Pre-infusion labs checked: AST 22, ALT 24, TSH 2.1 mIU/L within normal limits.',
                overriddenBy: 'PharmD. Alex Chen, BCPS',
            },
        ],
        barcode: 'NDC-00006-3026-02-KEY9047',
        assignedDispenser: 'Hazardous Chemotherapy Compounding Hood C-3',
        deliveryMethod: 'Bedside Cart Delivery',
        clinicalNotes: 'Sterile biologic compounding in progress under negative-pressure ISO Class 5 cleanroom buffer.',
    },
    {
        id: 'rx_008',
        orderNumber: 'RX-2026-9048',
        patientId: 'pat_007',
        patientName: 'Devon Walker',
        patientMRN: 'MRN-44910',
        patientAge: 45,
        patientGender: 'Male',
        patientWeightKg: 82.3,
        patientLocation: 'Emergency Department - Trauma Bay 2',
        patientTenantId: 'tnt_003',
        patientTenantName: 'Northwest Community Medical Center',
        patientDiagnosis: 'Severe Poly-Trauma, Open Tibia Fracture, Hypovolemic Shock',
        patientAllergies: ['Sulfa Drugs'],
        eGFR: 78,
        serumCreatinine: 1.1,
        medicationName: 'Tranexamic Acid (TXA)',
        genericName: 'Tranexamic Acid Injection',
        ndc: '00641-6188-10',
        strength: '1,000mg / 100mL 0.9% NaCl',
        dose: '1,000mg',
        route: 'IV Piggyback',
        frequency: 'Once STAT, then 1g infusion over 8 hrs',
        durationDays: 1,
        quantityOrdered: 1,
        instructions: 'CRASH-2 protocol. Administer 1g IV loading dose over 10 minutes within 3 hours of trauma injury.',
        prescriberName: 'Dr. Alan Bradley, MD',
        prescriberNPI: '1582910482',
        prescriberDepartment: 'Emergency Medicine & Trauma',
        prescribedAt: '2026-09-10T09:11:00.000Z',
        urgency: 'STAT',
        status: 'Pending Verification',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_08_txa',
                type: 'High-Alert Med',
                severity: 'Moderate',
                title: 'Antifibrinolytic Protocol Window Verification',
                description: 'Mortality benefit proven only within 3 hours of injury onset. Rapid administration may precipitate transient hypotension.',
                recommendation: 'Verify time of injury with trauma lead. Infuse over no less than 10 minutes.',
                overridden: false,
            },
        ],
        barcode: 'NDC-00641-6188-10-TXA9048',
        assignedDispenser: 'ED Fast-Track Automated Dispenser Pyxis-01',
        deliveryMethod: 'Pneumatic Tube',
        tubeStationCode: 'TUBE-ED-01',
        clinicalNotes: 'Top-of-queue priority STAT triage. Trauma bay holding for arrival.',
    },
    {
        id: 'rx_009',
        orderNumber: 'RX-2026-9049',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 68,
        patientGender: 'Female',
        patientWeightKg: 64.5,
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Hypertension, Left Ventricular Hypertrophy',
        patientAllergies: ['Penicillin', 'Sulfa Drugs'],
        eGFR: 28,
        serumCreatinine: 2.1,
        medicationName: 'Metoprolol Tartrate',
        genericName: 'Metoprolol Tartrate Tablets',
        ndc: '00182-0198-01',
        strength: '25mg Tablet',
        dose: '25mg',
        route: 'Oral Solid',
        frequency: 'Twice Daily with meals',
        durationDays: 30,
        quantityOrdered: 60,
        instructions: 'Hold dose if apical heart rate is below 55 bpm or systolic BP is below 100 mmHg.',
        prescriberName: 'Dr. Sarah Lin, MD',
        prescriberNPI: '1948201948',
        prescriberDepartment: 'Cardiology',
        prescribedAt: '2026-09-10T07:15:00.000Z',
        urgency: 'Routine',
        status: 'Ready for Delivery',
        isHighAlert: false,
        isControlledSubstance: false,
        safetyAlerts: [],
        barcode: 'NDC-00182-0198-01-MET9049',
        assignedDispenser: 'Automated Oral Solid Packager Carousel-A',
        deliveryMethod: 'Bedside Cart Delivery',
        clinicalNotes: 'Individually unit-dosed barcoded pouch packaged and ready for morning nursing cart pass.',
    },
    {
        id: 'rx_010',
        orderNumber: 'RX-2026-9050',
        patientId: 'pat_008',
        patientName: 'Raymond Chandler',
        patientMRN: 'MRN-62810',
        patientAge: 59,
        patientGender: 'Male',
        patientWeightKg: 91.0,
        patientLocation: 'Outpatient Specialty Pavilion',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Type 2 Diabetes Mellitus, Neuropathy',
        patientAllergies: [],
        eGFR: 74,
        serumCreatinine: 1.0,
        medicationName: 'Insulin Glargine (Lantus SoloStar)',
        genericName: 'Insulin Glargine Recombinant',
        ndc: '00088-2219-05',
        strength: '100 units/mL (3mL Disposable Pen x 5)',
        dose: '24 units',
        route: 'Subcutaneous',
        frequency: 'Once Daily at bedtime',
        durationDays: 30,
        quantityOrdered: 1,
        instructions: 'Inject 24 units subcutaneously every night. Keep unopened pens refrigerated at 2°C to 8°C. Do not freeze.',
        prescriberName: 'Dr. Rachel Green, MD',
        prescriberNPI: '1492049281',
        prescriberDepartment: 'Endocrinology & Metabolism',
        prescribedAt: '2026-09-10T08:00:00.000Z',
        urgency: 'Routine',
        status: 'Ready for Delivery',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_10_cold',
                type: 'High-Alert Med',
                severity: 'Moderate',
                title: 'Cold-Chain IoT Verification (3.8°C Logged)',
                description: 'High-alert insulin formulation requires strict temperature maintenance within 2-8°C refrigerated boundaries.',
                recommendation: 'Dispense in insulated thermal pouch with cold indicator tab.',
                overridden: true,
                overrideReason: 'Automated IoT cold-storage vault verified continuously at 3.8°C.',
                overriddenBy: 'PharmD. Alex Chen, BCPS',
            },
        ],
        barcode: 'NDC-00088-2219-05-LAN9050',
        assignedDispenser: 'IoT Smart Refrigerated Pickup Locker #4',
        deliveryMethod: 'Outpatient Locker',
        tubeStationCode: 'LOCKER-OUT-04',
        clinicalNotes: 'Placed in climate-controlled temperature monitored locker #4 with automated SMS patient pickup QR token dispatched.',
    },
    {
        id: 'rx_011',
        orderNumber: 'RX-2026-9051',
        patientId: 'pat_004',
        patientName: 'Marcus Sterling',
        patientMRN: 'MRN-77319',
        patientAge: 52,
        patientGender: 'Male',
        patientWeightKg: 88.0,
        patientLocation: 'Intensive Care Unit - Bed 12',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Severe Sepsis, Acute MRSA Bacteremia',
        patientAllergies: [],
        eGFR: 62,
        serumCreatinine: 1.2,
        medicationName: 'Vancomycin HCl in Dextrose',
        genericName: 'Vancomycin Injection',
        ndc: '00409-4328-11',
        strength: '1,500mg in 300mL D5W',
        dose: '1,500mg (17 mg/kg)',
        route: 'IV Piggyback',
        frequency: 'Every 12 hours',
        durationDays: 10,
        quantityOrdered: 20,
        instructions: 'Infuse over at least 90-120 minutes to prevent Red Man Syndrome. Draw trough level prior to 4th dose.',
        prescriberName: 'Dr. James Rodriguez, MD',
        prescriberNPI: '1482093847',
        prescriberDepartment: 'Infectious Disease & Critical Care',
        prescribedAt: '2026-09-10T07:45:00.000Z',
        urgency: 'STAT',
        status: 'In Dispensing',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_11_tdm',
                type: 'High-Alert Med',
                severity: 'Moderate',
                title: 'Therapeutic Drug Monitoring (TDM) Order Required',
                description: 'Narrow therapeutic index glycopeptide antibiotic with nephrotoxic potential. Target AUC/MIC ratio 400-600.',
                recommendation: 'Ensure pharmacy pharmacokinetic consult order is active for 4th dose trough draw.',
                overridden: true,
                overrideReason: 'Clinical pharmacokinetics protocol co-ordered; trough scheduled for 20:00.',
                overriddenBy: 'PharmD. Maya Patel',
            },
        ],
        barcode: 'NDC-00409-4328-11-VAN9051',
        assignedDispenser: 'Robotic IV Compounder Station 2',
        deliveryMethod: 'Pneumatic Tube',
        tubeStationCode: 'TUBE-ICU-08',
        clinicalNotes: 'Automated gravimetric compounding verification passed (+0.4% tolerance). Primed for secondary barcode check.',
    },
    {
        id: 'rx_012',
        orderNumber: 'RX-2026-9052',
        patientId: 'pat_009',
        patientName: 'Beatrice Lawson',
        patientMRN: 'MRN-77192',
        patientAge: 71,
        patientGender: 'Female',
        patientWeightKg: 62.0,
        patientLocation: 'Stepdown Ward - Room 314',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        patientDiagnosis: 'Persistent Atrial Flutter, Ventricular Arrhythmia Prevention',
        patientAllergies: [],
        eGFR: 51,
        serumCreatinine: 1.4,
        medicationName: 'Warfarin Sodium (Coumadin)',
        genericName: 'Warfarin Tablets',
        ndc: '00056-0170-70',
        strength: '5mg Tablet',
        dose: '5mg',
        route: 'Oral Solid',
        frequency: 'Once daily at 17:00',
        durationDays: 30,
        quantityOrdered: 30,
        instructions: 'Take once daily in evening. Monitor PT/INR twice weekly until therapeutic (target 2.0-3.0).',
        prescriberName: 'Dr. Sarah Lin, MD',
        prescriberNPI: '1948201948',
        prescriberDepartment: 'Cardiology',
        prescribedAt: '2026-09-10T09:05:00.000Z',
        urgency: 'Routine',
        status: 'Clinical Hold',
        isHighAlert: true,
        isControlledSubstance: false,
        safetyAlerts: [
            {
                id: 'alert_12_ddi',
                type: 'Drug-Drug Interaction',
                severity: 'Contraindicated',
                title: 'Major DDI: Concomitant Amiodarone + Warfarin',
                description: 'Amiodarone potently inhibits CYP2C9 and CYP3A4, dramatically impairing Warfarin clearance. INR can spike 2-3x baseline within 3-5 days, triggering catastrophic bleeding.',
                recommendation: 'Recommend empiric 30-50% Warfarin dose reduction (initiate at 2.5mg daily instead of 5mg). Daily INR monitoring until steady state.',
                overridden: false,
            },
        ],
        barcode: 'NDC-00056-0170-70-WAR9052',
        assignedDispenser: 'Oral Solid Packager Carousel-A',
        deliveryMethod: 'Nurse Station Pickup',
        clinicalNotes: 'Held for clinical pharmacist dose reduction recommendation to Dr. Lin.',
    },
];

// ----------------------------------------------------
// Initial Seed Data: Hospital Smart Formulary & IoT Cold-Chain Inventory
// ----------------------------------------------------
const initialInventory: PharmacyFormularyItem[] = [
    {
        id: 'form_001',
        name: 'Norepinephrine Bitartrate (Levophed)',
        genericName: 'Norepinephrine',
        ndc: '00409-1443-04',
        category: 'Emergency / Code',
        formulation: '4mg/250mL D5W Infusion Bag',
        strength: '16 mcg/mL',
        stockOnHand: 48,
        parLevel: 60,
        reorderPoint: 20,
        unit: 'Bags',
        location: 'ICU Satellite Pyxis Vault & Central Cleanroom',
        lotNumber: 'LOT-NE-2026A',
        expirationDate: '2027-04-30',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.4,
        isControlled: false,
        isHighAlert: true,
        unitCost: 38.5,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_002',
        name: 'Insulin Glargine (Lantus SoloStar)',
        genericName: 'Insulin Glargine Recombinant',
        ndc: '00088-2219-05',
        category: 'Endocrine',
        formulation: '100 units/mL (3mL Disposable Pen)',
        strength: '100 units/mL',
        stockOnHand: 142,
        parLevel: 150,
        reorderPoint: 50,
        unit: 'Pens',
        location: 'Central Cold Storage Refrigerator #2',
        lotNumber: 'LOT-INS-9811',
        expirationDate: '2027-01-15',
        storageTemperature: 'Refrigerated (2-8°C)',
        currentTempCelsius: 3.8,
        isControlled: false,
        isHighAlert: true,
        unitCost: 52.0,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_003',
        name: 'Hydromorphone HCl (Dilaudid)',
        genericName: 'Hydromorphone Injection',
        ndc: '00409-1312-30',
        category: 'Analgesic',
        formulation: '2mg/1mL Carpuject Ampoule',
        strength: '2mg / mL',
        stockOnHand: 84,
        parLevel: 100,
        reorderPoint: 30,
        unit: 'Ampoules',
        location: 'Main Narcotic Safe - Shelf C (Biometric Access)',
        lotNumber: 'LOT-C2-DIL-402',
        expirationDate: '2026-12-31',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 20.8,
        isControlled: true,
        isHighAlert: true,
        unitCost: 14.25,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_004',
        name: 'Vancomycin HCl',
        genericName: 'Vancomycin Hydrochloride',
        ndc: '00409-4328-11',
        category: 'Antimicrobial',
        formulation: '1g Lyophilized Powder for Reconstitution',
        strength: '1,000mg',
        stockOnHand: 215,
        parLevel: 250,
        reorderPoint: 75,
        unit: 'Vials',
        location: 'Central Cleanroom Staging Shelf 4',
        lotNumber: 'LOT-VANC-774',
        expirationDate: '2027-08-20',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.0,
        isControlled: false,
        isHighAlert: true,
        unitCost: 22.8,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_005',
        name: 'Piperacillin / Tazobactam (Zosyn)',
        genericName: 'Piperacillin-Tazobactam',
        ndc: '00206-8821-44',
        category: 'Antimicrobial',
        formulation: '3.375g Powder for IV Injection',
        strength: '3.375g',
        stockOnHand: 118,
        parLevel: 150,
        reorderPoint: 40,
        unit: 'Vials',
        location: 'Cleanroom Buffer Area - Shelf 2',
        lotNumber: 'LOT-ZOS-3301',
        expirationDate: '2027-05-18',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.2,
        isControlled: false,
        isHighAlert: false,
        unitCost: 29.5,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_006',
        name: 'Enoxaparin Sodium (Lovenox)',
        genericName: 'Enoxaparin Sodium',
        ndc: '00075-0621-30',
        category: 'Cardiovascular',
        formulation: '40mg / 0.4mL Pre-filled Syringe',
        strength: '40mg',
        stockOnHand: 180,
        parLevel: 200,
        reorderPoint: 60,
        unit: 'Syringes',
        location: 'Automated Dispensing Carousel Station 1',
        lotNumber: 'LOT-ENOX-410',
        expirationDate: '2027-03-31',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.5,
        isControlled: false,
        isHighAlert: true,
        unitCost: 31.0,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_007',
        name: 'Pembrolizumab (Keytruda)',
        genericName: 'Pembrolizumab Injection',
        ndc: '00006-3026-02',
        category: 'Oncology',
        formulation: '100mg / 4mL Single-Dose Glass Vial',
        strength: '100mg/4mL',
        stockOnHand: 16,
        parLevel: 20,
        reorderPoint: 6,
        unit: 'Vials',
        location: 'Oncology Cold Storage Unit #1 (2-8°C)',
        lotNumber: 'LOT-KEY-BIO-90',
        expirationDate: '2026-11-30',
        storageTemperature: 'Refrigerated (2-8°C)',
        currentTempCelsius: 4.2,
        isControlled: false,
        isHighAlert: true,
        unitCost: 4850.0,
        tenantId: 'tnt_001',
    },
    {
        id: 'form_008',
        name: 'Tranexamic Acid (TXA)',
        genericName: 'Tranexamic Acid',
        ndc: '00641-6188-10',
        category: 'Emergency / Code',
        formulation: '1,000mg / 10mL Vial',
        strength: '100mg / mL',
        stockOnHand: 95,
        parLevel: 100,
        reorderPoint: 30,
        unit: 'Vials',
        location: 'Trauma Bay Pyxis MedStation & Code Carts',
        lotNumber: 'LOT-TXA-8812',
        expirationDate: '2027-10-15',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.1,
        isControlled: false,
        isHighAlert: true,
        unitCost: 18.0,
        tenantId: 'tnt_003',
    },
    {
        id: 'form_009',
        name: 'Apixaban (Eliquis)',
        genericName: 'Apixaban Film-Coated Tablets',
        ndc: '00069-0897-60',
        category: 'Cardiovascular',
        formulation: '5mg Oral Tablet',
        strength: '5mg',
        stockOnHand: 340,
        parLevel: 400,
        reorderPoint: 100,
        unit: 'Tabs',
        location: 'Solid Unit-Dose Robot Packager - Hopper 14',
        lotNumber: 'LOT-ELI-6602',
        expirationDate: '2027-09-01',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 21.6,
        isControlled: false,
        isHighAlert: true,
        unitCost: 9.8,
        tenantId: 'tnt_004',
    },
    {
        id: 'form_010',
        name: 'Epinephrine Auto-Injector (EpiPen Jr)',
        genericName: 'Epinephrine Injection',
        ndc: '49502-0501-02',
        category: 'Emergency / Code',
        formulation: '0.15mg Auto-Injector (Pediatric)',
        strength: '0.15mg',
        stockOnHand: 32,
        parLevel: 40,
        reorderPoint: 12,
        unit: 'Injectors',
        location: 'Pediatric Crash Carts & Urgent Pyxis',
        lotNumber: 'LOT-EPI-015',
        expirationDate: '2026-10-31',
        storageTemperature: 'Ambient (15-25°C)',
        currentTempCelsius: 22.0,
        isControlled: false,
        isHighAlert: true,
        unitCost: 145.0,
        tenantId: 'tnt_002',
    },
];

// ----------------------------------------------------
// Initial Seed Data: Pharmacist Clinical Interventions Log
// ----------------------------------------------------
const initialInterventions: ClinicalIntervention[] = [
    {
        id: 'int_001',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        mrn: 'MRN-84920',
        orderNumber: 'RX-2026-9041',
        pharmacistName: 'PharmD. Alex Chen, BCPS',
        physicianName: 'Dr. Sarah Lin, MD',
        category: 'Allergy Interception',
        severity: 'Critical / Life-Threatening',
        actionTaken: 'Intercepted Zosyn in patient with documented anaphylaxis to Penicillin. Reached Dr. Lin by priority hospital VoIP phone; converted to Aztreonam 1g IV q8h + Vancomycin with renal adjustment.',
        physicianResponse: 'Accepted & Modified',
        preventedAdverseEvent: true,
        costSavingsEst: 14500,
        timestamp: '2026-09-10T08:52:00.000Z',
    },
    {
        id: 'int_002',
        patientId: 'pat_009',
        patientName: 'Beatrice Lawson',
        mrn: 'MRN-77192',
        orderNumber: 'RX-2026-9052',
        pharmacistName: 'PharmD. Maya Patel',
        physicianName: 'Dr. Sarah Lin, MD',
        category: 'Drug Interaction',
        severity: 'Major Safety Hazard',
        actionTaken: 'Flagged major CYP2C9 inhibition between new Warfarin 5mg order and active Amiodarone. Prevented supratherapeutic INR coagulopathy. Recommended 50% dose reduction (2.5mg daily).',
        physicianResponse: 'Accepted & Modified',
        preventedAdverseEvent: true,
        costSavingsEst: 8200,
        timestamp: '2026-09-10T09:12:00.000Z',
    },
    {
        id: 'int_003',
        patientId: 'pat_004',
        patientName: 'Marcus Sterling',
        mrn: 'MRN-77319',
        orderNumber: 'RX-2026-8992',
        pharmacistName: 'PharmD. Alex Chen, BCPS',
        physicianName: 'Dr. James Rodriguez, MD',
        category: 'Therapeutic Drug Monitoring',
        severity: 'Moderate Optimization',
        actionTaken: 'Calculated 2-point vancomycin pharmacokinetic AUC (540 mg*h/L target). Optimized interval from q12h to q8h to prevent therapeutic failure in hyperdynamic septic patient.',
        physicianResponse: 'Accepted & Modified',
        preventedAdverseEvent: false,
        costSavingsEst: 2400,
        timestamp: '2026-09-09T18:30:00.000Z',
    },
];

// Helper functions for local storage management
function getStoredOrders(): PharmacyOrder[] {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(initialOrders));
        return initialOrders;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return initialOrders;
    }
}

function saveOrders(orders: PharmacyOrder[]) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getStoredInventory(): PharmacyFormularyItem[] {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInventory));
        return initialInventory;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return initialInventory;
    }
}

function saveInventory(inventory: PharmacyFormularyItem[]) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

function getStoredInterventions(): ClinicalIntervention[] {
    const raw = localStorage.getItem(INTERVENTIONS_KEY);
    if (!raw) {
        localStorage.setItem(INTERVENTIONS_KEY, JSON.stringify(initialInterventions));
        return initialInterventions;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return initialInterventions;
    }
}

function saveInterventions(interventions: ClinicalIntervention[]) {
    localStorage.setItem(INTERVENTIONS_KEY, JSON.stringify(interventions));
}

// ----------------------------------------------------
// Exported API Functions
// ----------------------------------------------------

export interface PharmacyOrderFilters {
    status?: string;
    urgency?: string;
    tenantId?: string;
    search?: string;
}

export async function getPharmacyOrders(filters?: PharmacyOrderFilters): Promise<PharmacyOrder[]> {
    await new Promise((r) => setTimeout(r, 120));
    let list = getStoredOrders();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        list = list.filter((o) => o.patientTenantId === filters.tenantId);
    }

    if (filters?.status && filters.status !== 'All') {
        list = list.filter((o) => o.status === filters.status);
    }

    if (filters?.urgency && filters.urgency !== 'All') {
        list = list.filter((o) => o.urgency === filters.urgency);
    }

    if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        list = list.filter(
            (o) =>
                o.orderNumber.toLowerCase().includes(q) ||
                o.patientName.toLowerCase().includes(q) ||
                o.patientMRN.toLowerCase().includes(q) ||
                o.medicationName.toLowerCase().includes(q) ||
                o.genericName.toLowerCase().includes(q) ||
                o.patientLocation.toLowerCase().includes(q) ||
                o.prescriberName.toLowerCase().includes(q)
        );
    }

    // Sort order: STAT first, then Urgent, then Routine, then Discharge; and by order timestamp descending
    const urgencyWeight: Record<PharmacyTriageUrgency, number> = {
        STAT: 4,
        Urgent: 3,
        Routine: 2,
        Discharge: 1,
    };

    return list.sort((a, b) => {
        // Clinical Holds and STAT pending get highest priority
        if (a.status === 'Clinical Hold' && b.status !== 'Clinical Hold') return -1;
        if (b.status === 'Clinical Hold' && a.status !== 'Clinical Hold') return 1;

        const weightDiff = (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime();
    });
}

export async function getPharmacyOrderById(orderId: string): Promise<PharmacyOrder | null> {
    const list = getStoredOrders();
    return list.find((o) => o.id === orderId) || null;
}

export async function updateOrderTriageStatus(
    orderId: string,
    status: PharmacyTriageStatus,
    details?: {
        verifiedBy?: string;
        deliveryMethod?: PharmacyOrder['deliveryMethod'];
        tubeStationCode?: string;
        clinicalNotes?: string;
        dispensedQuantity?: number;
    }
): Promise<PharmacyOrder> {
    const list = getStoredOrders();
    const index = list.findIndex((o) => o.id === orderId);
    if (index === -1) {
        throw new Error(`Order ${orderId} not found`);
    }

    const updated: PharmacyOrder = {
        ...list[index],
        status,
        ...(details?.verifiedBy ? { verifiedBy: details.verifiedBy } : {}),
        ...(details?.deliveryMethod ? { deliveryMethod: details.deliveryMethod } : {}),
        ...(details?.tubeStationCode ? { tubeStationCode: details.tubeStationCode } : {}),
        ...(details?.clinicalNotes ? { clinicalNotes: details.clinicalNotes } : {}),
        ...(details?.dispensedQuantity !== undefined ? { dispensedQuantity: details.dispensedQuantity } : {}),
        ...(status === 'Dispensed' ? { dispensedAt: new Date().toISOString() } : {}),
    };

    list[index] = updated;
    saveOrders(list);
    return updated;
}

export const updateOrderStatus = updateOrderTriageStatus;

export async function overrideSafetyAlert(
    orderId: string,
    alertId: string,
    reason: string,
    pharmacistName: string
): Promise<PharmacyOrder> {
    const list = getStoredOrders();
    const index = list.findIndex((o) => o.id === orderId);
    if (index === -1) {
        throw new Error(`Order ${orderId} not found`);
    }

    const order = list[index];
    const updatedAlerts = order.safetyAlerts.map((a) => {
        if (a.id === alertId) {
            return {
                ...a,
                overridden: true,
                overrideReason: reason,
                overriddenBy: pharmacistName,
            };
        }
        return a;
    });

    const updated: PharmacyOrder = {
        ...order,
        safetyAlerts: updatedAlerts,
    };

    list[index] = updated;
    saveOrders(list);
    return updated;
}

export async function executeBarcodeVerification(
    orderId: string,
    scannedBarcode: string,
    verifiedBy: string
): Promise<{ success: boolean; order: PharmacyOrder; message: string }> {
    const list = getStoredOrders();
    const index = list.findIndex((o) => o.id === orderId);
    if (index === -1) {
        throw new Error(`Order ${orderId} not found`);
    }

    const order = list[index];
    // Compare barcode or normalized NDC
    const isMatch =
        scannedBarcode.trim() === order.barcode.trim() ||
        scannedBarcode.replace(/[^a-zA-Z0-9]/g, '') === order.barcode.replace(/[^a-zA-Z0-9]/g, '');

    if (!isMatch) {
        return {
            success: false,
            order,
            message: `Barcode mismatch: scanned "${scannedBarcode}" does not match package tag "${order.barcode}". Dispensing halted for patient safety!`,
        };
    }

    // Advance order to Ready for Delivery
    const updated: PharmacyOrder = {
        ...order,
        status: 'Ready for Delivery',
        verifiedBy,
        dispensedQuantity: order.quantityOrdered,
        clinicalNotes: `${order.clinicalNotes ? order.clinicalNotes + ' | ' : ''}5-Rights Barcode verification matched 100% by ${verifiedBy} at ${new Date().toLocaleTimeString()}`,
    };

    list[index] = updated;
    saveOrders(list);

    return {
        success: true,
        order: updated,
        message: `Barcode verified successfully! 5-Rights confirmed (Right Patient, Right Drug, Right Dose, Right Route, Right Time).`,
    };
}

export async function createPharmacyOrder(payload: Partial<PharmacyOrder>): Promise<PharmacyOrder> {
    const list = getStoredOrders();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RX-2026-${randomNum}`;

    // Auto-detect safety alerts
    const alerts: PharmacySafetyAlert[] = [];
    const patientAllergies = payload.patientAllergies || [];
    const medName = (payload.medicationName || '').toLowerCase();

    if (patientAllergies.some((a) => a.toLowerCase().includes('penicillin')) && (medName.includes('cillin') || medName.includes('zosyn') || medName.includes('amoxicillin'))) {
        alerts.push({
            id: `alert_${Date.now()}_allergy`,
            type: 'Drug-Allergy',
            severity: 'Contraindicated',
            title: 'Critical Allergenic Cross-Reactivity',
            description: 'Patient has documented Penicillin allergy. Beta-lactam antibiotic ordered.',
            recommendation: 'Do not dispense without attending physician review and allergy desensitization or substitution.',
            overridden: false,
        });
    }

    if (patientAllergies.some((a) => a.toLowerCase().includes('sulfa')) && (medName.includes('bactrim') || medName.includes('sulfamethoxazole'))) {
        alerts.push({
            id: `alert_${Date.now()}_sulfa`,
            type: 'Drug-Allergy',
            severity: 'Contraindicated',
            title: 'Documented Sulfa Drug Allergy',
            description: 'Patient allergic to sulfonamides. High risk of Stevens-Johnson syndrome or anaphylaxis.',
            recommendation: 'Withhold and switch to alternative antimicrobial.',
            overridden: false,
        });
    }

    if ((payload.eGFR ?? 90) < 30 && (medName.includes('cefepime') || medName.includes('zosyn') || medName.includes('vancomycin'))) {
        alerts.push({
            id: `alert_${Date.now()}_renal`,
            type: 'Renal Dose Adjustment',
            severity: 'Major',
            title: `Renal Clearance Threshold Alert (eGFR ${payload.eGFR} mL/min)`,
            description: 'Severe renal impairment detected. Reduced drug excretion requires interval prolongation or dose reduction.',
            recommendation: 'Adjust dose or frequency according to renal pharmacokinetics guidelines.',
            overridden: false,
        });
    }

    const newOrder: PharmacyOrder = {
        id: `rx_${Date.now()}`,
        orderNumber,
        patientId: payload.patientId || 'pat_001',
        patientName: payload.patientName || 'Eleanor Vance',
        patientMRN: payload.patientMRN || 'MRN-84920',
        patientAge: payload.patientAge || 68,
        patientGender: payload.patientGender || 'Female',
        patientWeightKg: payload.patientWeightKg || 65.0,
        patientLocation: payload.patientLocation || 'Cardiac Care - Bed 304',
        patientTenantId: payload.patientTenantId || 'tnt_001',
        patientTenantName: payload.patientTenantName || 'St. Jude General Hospital',
        patientDiagnosis: payload.patientDiagnosis || 'Clinical Assessment',
        patientAllergies,
        eGFR: payload.eGFR ?? 65,
        serumCreatinine: payload.serumCreatinine ?? 1.1,
        medicationName: payload.medicationName || 'Ceftriaxone Sodium',
        genericName: payload.genericName || payload.medicationName || 'Ceftriaxone',
        ndc: payload.ndc || '00004-1965-02',
        strength: payload.strength || '1g Vial',
        dose: payload.dose || '1g',
        route: payload.route || 'IV Piggyback',
        frequency: payload.frequency || 'Every 24 hours',
        durationDays: payload.durationDays || 5,
        quantityOrdered: payload.quantityOrdered || 5,
        instructions: payload.instructions || 'Administer IV piggyback over 30 minutes.',
        prescriberName: payload.prescriberName || 'Dr. Sarah Lin, MD',
        prescriberNPI: payload.prescriberNPI || '1948201948',
        prescriberDepartment: payload.prescriberDepartment || 'Internal Medicine',
        prescribedAt: new Date().toISOString(),
        urgency: payload.urgency || 'Routine',
        status: alerts.some((a) => a.severity === 'Contraindicated') ? 'Clinical Hold' : 'Pending Verification',
        isHighAlert: payload.isHighAlert ?? false,
        isControlledSubstance: payload.isControlledSubstance ?? false,
        scheduleLevel: payload.scheduleLevel,
        safetyAlerts: alerts,
        barcode: `NDC-${payload.ndc || '00004-1965-02'}-${randomNum}`,
        assignedDispenser: payload.assignedDispenser || 'Central Automated Carousel A',
        deliveryMethod: payload.deliveryMethod || 'Pneumatic Tube',
        tubeStationCode: payload.tubeStationCode || 'TUBE-ICU-08',
        clinicalNotes: payload.clinicalNotes || 'New e-prescription submitted via clinical portal.',
    };

    list.unshift(newOrder);
    saveOrders(list);
    return newOrder;
}

export async function getPharmacyInventory(tenantId?: string): Promise<PharmacyFormularyItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    let inventory = getStoredInventory();
    if (tenantId && tenantId !== 'ALL') {
        inventory = inventory.filter((i) => i.tenantId === tenantId);
    }
    return inventory;
}

export async function restockFormularyItem(itemId: string, addQuantity: number): Promise<PharmacyFormularyItem> {
    const list = getStoredInventory();
    const index = list.findIndex((i) => i.id === itemId);
    if (index === -1) {
        throw new Error(`Formulary item ${itemId} not found`);
    }

    list[index].stockOnHand += addQuantity;
    saveInventory(list);
    return list[index];
}

export async function getClinicalInterventions(tenantId?: string): Promise<ClinicalIntervention[]> {
    await new Promise((r) => setTimeout(r, 80));
    return getStoredInterventions();
}

export async function createClinicalIntervention(data: Omit<ClinicalIntervention, 'id' | 'timestamp'>): Promise<ClinicalIntervention> {
    const list = getStoredInterventions();
    const newInt: ClinicalIntervention = {
        ...data,
        id: `int_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    list.unshift(newInt);
    saveInterventions(list);
    return newInt;
}

export async function getPharmacyStats(tenantId?: string): Promise<PharmacyStats> {
    await new Promise((r) => setTimeout(r, 90));
    let orders = getStoredOrders();
    if (tenantId && tenantId !== 'ALL') {
        orders = orders.filter((o) => o.patientTenantId === tenantId);
    }

    const pendingTriageCount = orders.filter((o) => o.status === 'Pending Verification').length;
    const statOrdersCount = orders.filter((o) => o.urgency === 'STAT' && o.status !== 'Dispensed').length;
    const inDispensingCount = orders.filter((o) => o.status === 'In Dispensing').length;
    const barcodePendingCount = orders.filter((o) => o.status === 'Barcode Verification').length;
    const completedTodayCount = orders.filter((o) => o.status === 'Dispensed').length;
    const clinicalHoldsCount = orders.filter((o) => o.status === 'Clinical Hold').length;

    return {
        totalOrdersToday: orders.length + 84,
        pendingTriageCount,
        statOrdersCount,
        inDispensingCount,
        barcodePendingCount,
        completedTodayCount: completedTodayCount + 68,
        clinicalHoldsCount,
        avgStatTurnaroundMinutes: 8.4,
        highAlertInterceptions: 12,
        coldChainComplianceRate: 99.8,
        roboticDispensingUptimeRate: 99.4,
    };
}
