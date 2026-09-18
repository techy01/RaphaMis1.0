import {
    RadiologyStudy,
    RadiologyStatus,
    RadiologyModality,
    RadiologyUrgency,
    RadiologyBodyRegion,
    RadiologyCatalogProcedure,
    RadiologyStats,
} from '../packages/shared/types';
import { getStoredPatients } from './mockPatientData';

// Standard clinical imaging catalog across all diagnostic modalities
export const RADIOLOGY_CATALOG: RadiologyCatalogProcedure[] = [
    {
        id: 'proc_cxr',
        name: 'Chest X-Ray 2-View (PA & Lateral)',
        modality: 'X-Ray (CR/DR)',
        bodyRegion: 'Chest',
        standardDurationMinutes: 10,
        requiresContrast: false,
        preparationInstructions: 'Remove jewelry, metal zippers, and breast piercings before positioning.',
        description: 'Standard diagnostic evaluation of cardiopulmonary parenchyma, mediastinal contours, and pleural spaces.',
    },
    {
        id: 'proc_cta_pe',
        name: 'CT Angiography Pulmonary Arteries (PE Protocol)',
        modality: 'Computed Tomography (CT)',
        bodyRegion: 'Chest',
        standardDurationMinutes: 20,
        requiresContrast: true,
        defaultContrastType: 'Isovue-370 (Omnipaque) 80 mL @ 4.5 mL/s IV with saline chaser',
        preparationInstructions: 'NPO 2 hours prior; verify IV 18G/20G in antecubital fossa; eGFR > 45 mL/min.',
        description: 'Rapid helical volumetric acquisition timed to peak pulmonary arterial enhancement for pulmonary embolism.',
    },
    {
        id: 'proc_ct_abdpel',
        name: 'CT Abdomen & Pelvis with IV & Oral Contrast',
        modality: 'Computed Tomography (CT)',
        bodyRegion: 'Abdomen & Pelvis',
        standardDurationMinutes: 30,
        requiresContrast: true,
        defaultContrastType: 'Omnipaque 350 IV + Dilute Oral Barium',
        preparationInstructions: 'Oral barium cocktail 60 mins prior to scan. Fasting 4 hours.',
        description: 'Multiphasic evaluation for abdominal pain, bowel pathology, appendicitis, and organ lacerations.',
    },
    {
        id: 'proc_mri_brain',
        name: 'MRI Brain without IV Contrast (Stroke / Headache Protocol)',
        modality: 'Magnetic Resonance Imaging (MRI)',
        bodyRegion: 'Brain / Head',
        standardDurationMinutes: 35,
        requiresContrast: false,
        preparationInstructions: 'Complete MRI safety screening (pacemakers, aneurysm clips, metal foreign bodies).',
        description: 'High-resolution volumetric sequences (T1, T2, FLAIR, DWI/ADC, SWI) for ischemia, mass, or demyelination.',
    },
    {
        id: 'proc_mri_lumbar',
        name: 'MRI Lumbar Spine without Contrast',
        modality: 'Magnetic Resonance Imaging (MRI)',
        bodyRegion: 'Spine',
        standardDurationMinutes: 30,
        requiresContrast: false,
        preparationInstructions: 'Comfortable cotton gown. Remove all metallic items.',
        description: 'Multiplanar assessment of the lumbosacral disc levels, neural foramina, thecal sac, and cauda equina.',
    },
    {
        id: 'proc_us_abdo',
        name: 'Ultrasound Abdomen Complete (Liver, Gallbladder, Kidneys, Spleen)',
        modality: 'Ultrasound (US)',
        bodyRegion: 'Abdomen & Pelvis',
        standardDurationMinutes: 25,
        requiresContrast: false,
        preparationInstructions: 'Strict NPO for 6 hours prior to ensure gallbladder distension and reduce bowel gas.',
        description: 'Real-time sonographic evaluation of hepatobiliary architecture, gallstones, biliary duct dilation, and renal parenchyma.',
    },
    {
        id: 'proc_xr_knee',
        name: 'X-Ray Right Knee 3-View (AP, Lateral, Sunrise)',
        modality: 'X-Ray (CR/DR)',
        bodyRegion: 'Musculoskeletal / Extremity',
        standardDurationMinutes: 15,
        requiresContrast: false,
        preparationInstructions: 'Weight-bearing views as clinically tolerated.',
        description: 'Assessment of tibiofemoral joint space narrowing, patellofemoral tracking, osteophytes, and subchondral sclerosis.',
    },
    {
        id: 'proc_mammo',
        name: 'Diagnostic Digital Breast Tomosynthesis (Mammography Bilateral)',
        modality: 'Mammography',
        bodyRegion: 'Chest',
        standardDurationMinutes: 20,
        requiresContrast: false,
        preparationInstructions: 'Do not apply deodorant, antiperspirant, powder, or lotions on torso before exam.',
        description: '3D tomosynthesis screening and spot compression for microcalcifications or focal architectural distortion.',
    },
];

const INITIAL_RADIOLOGY_STUDIES: RadiologyStudy[] = [
    {
        id: 'rad_001',
        accessionNumber: 'ACC-RAD-2026-9201',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMRN: 'MRN-84920',
        patientAge: 70,
        patientGender: 'Female',
        patientLocation: 'Cardiac Care - Bed 304',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        modality: 'Computed Tomography (CT)',
        procedureName: 'CT Angiography Pulmonary Arteries (PE Protocol)',
        bodyRegion: 'Chest',
        urgency: 'STAT',
        status: 'Critical Finding',
        requestedAt: '2026-09-10T06:15:00.000Z',
        scheduledFor: '2026-09-10T06:25:00.000Z',
        performedAt: '2026-09-10T06:45:00.000Z',
        reportedAt: '2026-09-10T07:05:00.000Z',
        orderingPhysicianName: 'Dr. Sarah Lin, MD',
        orderingPhysicianDepartment: 'Cardiology',
        clinicalIndication: 'Sudden onset pleuritic chest pain and acute dyspnea; elevated D-dimer and tachycardia.',
        contrastUsed: true,
        contrastType: 'Omnipaque 350 (85 mL @ 4.0 mL/s)',
        technologistNotes: 'Scan timed using bolus tracking over main pulmonary artery trunk. Excellent opacification without motion artifact.',
        radiologistName: 'Dr. David Aris, MD (Board Certified Radiologist)',
        techniqueDescription: 'Axial multi-detector volumetric CT angiography of the chest performed with 85 mL of non-ionic IV contrast during peak pulmonary arterial opacification. Coronal and sagittal reformations reviewed.',
        findings: 'VASCULAR: There is an extensive saddle pulmonary embolus straddling the main pulmonary bifurcation with occlusive clot propagating into the right interlobar artery and the anterior/posterior segmental branches of the right lower lobe. Additional non-occlusive filling defects noted in the left lower lobe subsegmental branches. The right ventricle is visibly enlarged relative to the left ventricle with an RV/LV ratio of approximately 1.35, and slight flattening of the interventricular septum, indicating acute right ventricular strain.\n\nLUNGS: Small wedge-shaped peripheral density in the right lower lobe periphery suspicious for early pulmonary infarction. No pneumothorax.\n\nPLEURA & MEDIASTINUM: Trace right pleural effusion. Normal aortic dimensions.',
        impression: '1. ACUTE SADDLE PULMONARY EMBOLISM extending into bilateral lower lobe pulmonary arteries.\n2. CT EVIDENCE OF ACUTE RIGHT HEART STRAIN (RV/LV diameter ratio 1.35 with interventricular septal flattening).\n3. SMALL RIGHT LOWER LOBE PULMONARY INFARCT.',
        recommendations: 'Immediate therapeutic anticoagulation or pulmonary embolism response team (PERT) consultation recommended.',
        criticalFindingAlert: true,
        criticalFindingAcknowledgedBy: 'Dr. Sarah Lin, MD (Attending Cardiologist)',
        criticalFindingAcknowledgedAt: '2026-09-10T07:12:00.000Z',
        imageSeriesCount: 4,
        totalImageInstances: 384,
        keyImages: [
            {
                title: 'Axial CTA Pulmonary Trunk - Saddle Clot',
                description: 'Prominent hypodense filling defect straddling the pulmonary artery bifurcation.',
                sliceInfo: 'Series 3, Slice 142 of 384 (WL: 100, WW: 700)',
                svgType: 'chest-xray',
            },
        ],
    },
    {
        id: 'rad_002',
        accessionNumber: 'ACC-RAD-2026-9202',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMRN: 'MRN-19348',
        patientAge: 48,
        patientGender: 'Male',
        patientLocation: 'Emergency Bay 4',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        modality: 'X-Ray (CR/DR)',
        procedureName: 'Chest X-Ray 2-View (PA & Lateral)',
        bodyRegion: 'Chest',
        urgency: 'STAT',
        status: 'Reported',
        requestedAt: '2026-09-10T07:00:00.000Z',
        scheduledFor: '2026-09-10T07:10:00.000Z',
        performedAt: '2026-09-10T07:18:00.000Z',
        reportedAt: '2026-09-10T07:35:00.000Z',
        orderingPhysicianName: 'Dr. Christopher Bell, MD',
        orderingPhysicianDepartment: 'Emergency Medicine',
        clinicalIndication: 'Fever (103.2°F), productive purulent cough, and right basilar crackles. Evaluate for pneumonia.',
        contrastUsed: false,
        technologistNotes: 'Upright PA and left lateral views obtained in dedicated radiography suite. Patient tolerated well.',
        radiologistName: 'Dr. David Aris, MD (Board Certified Radiologist)',
        techniqueDescription: 'Posteroanterior and lateral projections of the chest obtained in full inspiration.',
        findings: 'LUNGS: Dense airspace consolidation with visible air bronchograms is present in the right lower lobe, obscuring the right hemidiaphragmatic contour. The left lung is clear without focal infiltration or consolidation. No pneumothorax.\n\nHEART & MEDIASTINUM: Cardiothoracic ratio is normal (< 0.50). Mediastinal contours and hila are within normal limits.\n\nPLEURA: Minimal blunting of the right costophrenic angle consistent with a small sympathetic reactive effusion.',
        impression: '1. RIGHT LOWER LOBE AIRSPACE CONSOLIDATION COMPATIBLE WITH ACUTE BACTERIAL PNEUMONIA.\n2. MINIMAL ASSOCIATED REACTIVE PARAPNEUMONIC EFFUSION.',
        recommendations: 'Clinical correlation and follow-up radiograph in 6-8 weeks following completion of antimicrobial therapy.',
        criticalFindingAlert: false,
        imageSeriesCount: 2,
        totalImageInstances: 2,
        keyImages: [
            {
                title: 'PA Chest Projection',
                description: 'Focal right lower lobe dense opacity with air bronchograms.',
                sliceInfo: 'View 1 of 2 (Full Field DR)',
                svgType: 'chest-xray',
            },
        ],
    },
    {
        id: 'rad_003',
        accessionNumber: 'ACC-RAD-2026-9203',
        patientId: 'pat_003',
        patientName: 'Chloe Nguyen',
        patientMRN: 'MRN-33419',
        patientAge: 29,
        patientGender: 'Female',
        patientLocation: 'Pediatric Observation - Bed 12',
        patientTenantId: 'tnt_002',
        patientTenantName: "Mercy Children's Clinic",
        modality: 'Magnetic Resonance Imaging (MRI)',
        procedureName: 'MRI Brain without IV Contrast (Stroke / Headache Protocol)',
        bodyRegion: 'Brain / Head',
        urgency: 'Urgent',
        status: 'Under Review',
        requestedAt: '2026-09-10T07:45:00.000Z',
        scheduledFor: '2026-09-10T08:15:00.000Z',
        performedAt: '2026-09-10T08:50:00.000Z',
        orderingPhysicianName: 'Dr. Emily Watson, MD',
        orderingPhysicianDepartment: 'Pediatrics / Neurology',
        clinicalIndication: 'Severe refractory intractable migraines with transient visual auras and left facial paresthesia.',
        contrastUsed: false,
        technologistNotes: '3T Skyra MRI unit utilized. 32-channel head coil. Complete sequences acquired without motion artifact.',
        radiologistName: 'Dr. Helen Keller-Sloane, MD (Neuroradiologist)',
        techniqueDescription: 'Multiplanar, multisequence noncontrast brain MRI including axial T1, T2, FLAIR, sagittal T1, 3D volumetric T2, and axial Diffusion Weighted Imaging (DWI/ADC).',
        findings: 'Preliminary review indicates symmetrical cerebral parenchyma with normal grey-white matter differentiation. No acute restricted diffusion on DWI to suggest acute cortical infarction. Ventricles and basal cisterns unremarkable. Dictation underway.',
        impression: 'Preliminary: No acute territorial ischemia or intracranial mass effect. Final report being transcribed.',
        criticalFindingAlert: false,
        imageSeriesCount: 8,
        totalImageInstances: 240,
        keyImages: [
            {
                title: 'Axial T2 / FLAIR Brain Slices',
                description: 'Normal cerebral sulcal topology and intact grey-white junction.',
                sliceInfo: 'Series 4, Slice 18 of 32',
                svgType: 'brain-ct',
            },
        ],
    },
    {
        id: 'rad_004',
        accessionNumber: 'ACC-RAD-2026-9204',
        patientId: 'pat_004',
        patientName: 'Liam Washington',
        patientMRN: 'MRN-77821',
        patientAge: 62,
        patientGender: 'Male',
        patientLocation: 'ICU Bed 02',
        patientTenantId: 'tnt_003',
        patientTenantName: 'Northwest Community Medical',
        modality: 'Ultrasound (US)',
        procedureName: 'Ultrasound Abdomen Complete (Liver, Gallbladder, Kidneys, Spleen)',
        bodyRegion: 'Abdomen & Pelvis',
        urgency: 'Routine',
        status: 'Scheduled',
        requestedAt: '2026-09-10T08:20:00.000Z',
        scheduledFor: '2026-09-10T10:30:00.000Z',
        orderingPhysicianName: 'Dr. James Martinez, MD',
        orderingPhysicianDepartment: 'Critical Care / Internal Medicine',
        clinicalIndication: 'Elevated alkaline phosphatase and mild right upper quadrant discomfort. Rule out cholelithiasis.',
        contrastUsed: false,
        technologistNotes: 'Patient kept fasting since 04:00 AM. Sonographer assigned for 10:30 AM portable ultrasound slot.',
        criticalFindingAlert: false,
        imageSeriesCount: 0,
        totalImageInstances: 0,
        keyImages: [
            {
                title: 'Abdominal Sonogram Protocol',
                description: 'Transducer sagittal and transverse views of gallbladder fundus.',
                sliceInfo: 'Awaiting acquisition',
                svgType: 'abdominal-us',
            },
        ],
    },
    {
        id: 'rad_005',
        accessionNumber: 'ACC-RAD-2026-9205',
        patientId: 'pat_005',
        patientName: 'Sophia Patel',
        patientMRN: 'MRN-55201',
        patientAge: 55,
        patientGender: 'Female',
        patientLocation: 'Surgical Prep Unit - Room 4',
        patientTenantId: 'tnt_004',
        patientTenantName: 'Apex Orthopedic Institute',
        modality: 'Magnetic Resonance Imaging (MRI)',
        procedureName: 'MRI Lumbar Spine without Contrast',
        bodyRegion: 'Spine',
        urgency: 'Routine',
        status: 'Reported',
        requestedAt: '2026-09-09T14:00:00.000Z',
        scheduledFor: '2026-09-10T07:00:00.000Z',
        performedAt: '2026-09-10T07:35:00.000Z',
        reportedAt: '2026-09-10T08:15:00.000Z',
        orderingPhysicianName: 'Dr. Gregory House, MD',
        orderingPhysicianDepartment: 'Orthopedic Spine Surgery',
        clinicalIndication: 'Severe progressive left L5 radiculopathy and numbness radiating down lateral calf to hallux.',
        contrastUsed: false,
        technologistNotes: 'High-resolution spine matrix coil. Exam completed without incident.',
        radiologistName: 'Dr. Helen Keller-Sloane, MD (Neuroradiologist)',
        techniqueDescription: 'Sagittal T1, T2, and axial T2 fast spin-echo images of the lumbar spine from T12 to the sacrum.',
        findings: 'L1-L2 through L3-L4: Well maintained disc heights without canal stenosis.\n\nL4-L5: Moderately reduced intervertebral disc height with disc desiccation. There is a prominent 6 mm left subarticular/paracentral focal disc extrusion with superior migration. This severely effaces the left lateral recess and displaces the descending left L5 nerve root posteriorly with apparent nerve compression.\n\nL5-S1: Mild symmetric disc bulge with facet arthropathy, no neural foraminal compromise.\n\nConus medullaris terminates normally at L1-L2.',
        impression: '1. LARGE L4-L5 LEFT PARACENTRAL DISC EXTRUSION CAUSING SEVERE LEFT LATERAL RECESS STENOSIS AND COMPRESSION OF THE DESCENDING LEFT L5 NERVE ROOT.\n2. NO SIGNIFICANT CANAL STENOSIS AT OTHER LUMBAR LEVELS.',
        recommendations: 'Correlation with physical exam findings; neurosurgical or orthopedic spine evaluation advised.',
        criticalFindingAlert: false,
        imageSeriesCount: 5,
        totalImageInstances: 110,
        keyImages: [
            {
                title: 'Sagittal & Axial T2 MRI Lumbar Spine',
                description: 'L4-L5 disc extrusion impinging the thecal sac and lateral recess.',
                sliceInfo: 'Series 2, Slice 11 of 24',
                svgType: 'spine-mri',
            },
        ],
    },
    {
        id: 'rad_006',
        accessionNumber: 'ACC-RAD-2026-9206',
        patientId: 'pat_005',
        patientName: 'Sophia Patel',
        patientMRN: 'MRN-55201',
        patientAge: 55,
        patientGender: 'Female',
        patientLocation: 'Surgical Prep Unit - Room 4',
        patientTenantId: 'tnt_004',
        patientTenantName: 'Apex Orthopedic Institute',
        modality: 'X-Ray (CR/DR)',
        procedureName: 'X-Ray Right Knee 3-View (AP, Lateral, Sunrise)',
        bodyRegion: 'Musculoskeletal / Extremity',
        urgency: 'Routine',
        status: 'In Progress',
        requestedAt: '2026-09-10T08:30:00.000Z',
        scheduledFor: '2026-09-10T08:45:00.000Z',
        orderingPhysicianName: 'Dr. Gregory House, MD',
        orderingPhysicianDepartment: 'Orthopedic Surgery',
        clinicalIndication: 'Preoperative planning and baseline assessment for right total knee arthroplasty.',
        contrastUsed: false,
        technologistNotes: 'Patient currently positioned in Radiography Room 2.',
        criticalFindingAlert: false,
        imageSeriesCount: 0,
        totalImageInstances: 0,
        keyImages: [
            {
                title: 'AP Weight-Bearing Knee',
                description: 'Medial compartment joint space assessment.',
                sliceInfo: 'Acquisition active',
                svgType: 'knee-xray',
            },
        ],
    },
    {
        id: 'rad_007',
        accessionNumber: 'ACC-RAD-2026-9207',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMRN: 'MRN-19348',
        patientAge: 48,
        patientGender: 'Male',
        patientLocation: 'Emergency Bay 4',
        patientTenantId: 'tnt_001',
        patientTenantName: 'St. Jude General Hospital',
        modality: 'Computed Tomography (CT)',
        procedureName: 'CT Abdomen & Pelvis with IV & Oral Contrast',
        bodyRegion: 'Abdomen & Pelvis',
        urgency: 'Urgent',
        status: 'Requested',
        requestedAt: '2026-09-10T09:00:00.000Z',
        orderingPhysicianName: 'Dr. Christopher Bell, MD',
        orderingPhysicianDepartment: 'Emergency Medicine',
        clinicalIndication: 'Right lower quadrant abdominal pain, rebound tenderness, leukocytosis; rule out acute appendicitis.',
        contrastUsed: true,
        contrastType: 'Omnipaque 350 IV + Oral Contrast',
        criticalFindingAlert: false,
        imageSeriesCount: 0,
        totalImageInstances: 0,
        keyImages: [
            {
                title: 'Abdomen & Pelvis CT Protocol',
                description: 'Scheduled post oral contrast transit.',
                sliceInfo: 'Requested',
                svgType: 'chest-xray',
            },
        ],
    },
];

const RIS_STORAGE_KEY = 'raphamis_radiology_studies_v1';

export const getStoredRadiologyStudies = (): RadiologyStudy[] => {
    try {
        const stored = localStorage.getItem(RIS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // fallback
    }
    try {
        localStorage.setItem(RIS_STORAGE_KEY, JSON.stringify(INITIAL_RADIOLOGY_STUDIES));
    } catch {
        // ignore
    }
    return INITIAL_RADIOLOGY_STUDIES;
};

export const saveStoredRadiologyStudies = (studies: RadiologyStudy[]) => {
    try {
        localStorage.setItem(RIS_STORAGE_KEY, JSON.stringify(studies));
    } catch {
        // ignore
    }
};

// API: Get studies with filters
export const getRadiologyStudies = async (filters?: {
    tenantId?: string;
    search?: string;
    status?: string;
    modality?: string;
    urgency?: string;
}): Promise<RadiologyStudy[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let studies = getStoredRadiologyStudies();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        studies = studies.filter((s) => s.patientTenantId === filters.tenantId);
    }

    if (filters?.status && filters.status !== 'ALL') {
        studies = studies.filter((s) => s.status === filters.status);
    }

    if (filters?.modality && filters.modality !== 'ALL') {
        studies = studies.filter((s) => s.modality === filters.modality);
    }

    if (filters?.urgency && filters.urgency !== 'ALL') {
        studies = studies.filter((s) => s.urgency === filters.urgency);
    }

    if (filters?.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        studies = studies.filter(
            (s) =>
                s.accessionNumber.toLowerCase().includes(query) ||
                s.procedureName.toLowerCase().includes(query) ||
                s.patientName.toLowerCase().includes(query) ||
                s.patientMRN.toLowerCase().includes(query) ||
                s.orderingPhysicianName.toLowerCase().includes(query) ||
                (s.radiologistName && s.radiologistName.toLowerCase().includes(query))
        );
    }

    return studies;
};

// API: Get study by ID
export const getRadiologyStudyById = async (id: string): Promise<RadiologyStudy | null> => {
    const studies = getStoredRadiologyStudies();
    return studies.find((s) => s.id === id) || null;
};

// API: Create new imaging study requisition
export const createRadiologyStudy = async (
    payload: Partial<RadiologyStudy>
): Promise<RadiologyStudy> => {
    const studies = getStoredRadiologyStudies();
    const count = studies.length + 9208;
    const randomAccession = `ACC-RAD-2026-${count}`;

    const catalogMatch = RADIOLOGY_CATALOG.find((c) => c.name === payload.procedureName);

    const newStudy: RadiologyStudy = {
        id: `rad_${Date.now()}`,
        accessionNumber: payload.accessionNumber || randomAccession,
        patientId: payload.patientId || 'pat_001',
        patientName: payload.patientName || 'Eleanor Vance',
        patientMRN: payload.patientMRN || 'MRN-84920',
        patientAge: payload.patientAge || 70,
        patientGender: payload.patientGender || 'Female',
        patientLocation: payload.patientLocation || 'Radiology Unit',
        patientTenantId: payload.patientTenantId || 'tnt_001',
        patientTenantName: payload.patientTenantName || 'St. Jude General Hospital',
        modality: payload.modality || catalogMatch?.modality || 'X-Ray (CR/DR)',
        procedureName: payload.procedureName || 'Chest X-Ray 2-View (PA & Lateral)',
        bodyRegion: payload.bodyRegion || catalogMatch?.bodyRegion || 'Chest',
        urgency: payload.urgency || 'Routine',
        status: payload.status || 'Requested',
        requestedAt: new Date().toISOString(),
        orderingPhysicianName: payload.orderingPhysicianName || 'Dr. Sarah Lin, MD',
        orderingPhysicianDepartment: payload.orderingPhysicianDepartment || 'Internal Medicine',
        clinicalIndication: payload.clinicalIndication || 'Diagnostic imaging requisition.',
        contrastUsed: payload.contrastUsed ?? catalogMatch?.requiresContrast ?? false,
        contrastType: payload.contrastType || catalogMatch?.defaultContrastType,
        criticalFindingAlert: false,
        imageSeriesCount: 0,
        totalImageInstances: 0,
        keyImages: [
            {
                title: `${payload.procedureName || 'Imaging Study'} Series`,
                description: 'Study requisitioned; pending technologist scan execution.',
                sliceInfo: 'Requisition queued',
                svgType:
                    catalogMatch?.modality === 'Computed Tomography (CT)'
                        ? 'chest-xray'
                        : catalogMatch?.modality === 'Magnetic Resonance Imaging (MRI)'
                        ? 'spine-mri'
                        : catalogMatch?.modality === 'Ultrasound (US)'
                        ? 'abdominal-us'
                        : 'chest-xray',
            },
        ],
    };

    const updated = [newStudy, ...studies];
    saveStoredRadiologyStudies(updated);
    return newStudy;
};

// API: Advance study status (Requested -> Scheduled -> In Progress -> Under Review -> Reported)
export const updateRadiologyStudyStatus = async (
    studyId: string,
    nextStatus: RadiologyStatus,
    updates?: Partial<RadiologyStudy>
): Promise<RadiologyStudy> => {
    const studies = getStoredRadiologyStudies();
    const idx = studies.findIndex((s) => s.id === studyId);
    if (idx === -1) throw new Error('Radiology study not found');

    const now = new Date().toISOString();
    const current = studies[idx];

    const updatedStudy: RadiologyStudy = {
        ...current,
        ...updates,
        status: nextStatus,
        scheduledFor:
            nextStatus === 'Scheduled' && !current.scheduledFor ? now : current.scheduledFor,
        performedAt:
            (nextStatus === 'In Progress' || nextStatus === 'Under Review') && !current.performedAt
                ? now
                : current.performedAt,
        reportedAt: nextStatus === 'Reported' ? now : current.reportedAt,
        imageSeriesCount:
            nextStatus === 'Under Review' && current.imageSeriesCount === 0
                ? 3
                : current.imageSeriesCount,
        totalImageInstances:
            nextStatus === 'Under Review' && current.totalImageInstances === 0
                ? 120
                : current.totalImageInstances,
    };

    studies[idx] = updatedStudy;
    saveStoredRadiologyStudies(studies);
    return updatedStudy;
};

// API: Submit official Radiologist Diagnostic Report
export const submitRadiologyReport = async (
    studyId: string,
    reportData: {
        techniqueDescription?: string;
        findings: string;
        impression: string;
        recommendations?: string;
        radiologistName: string;
        criticalFindingAlert?: boolean;
    }
): Promise<RadiologyStudy> => {
    const studies = getStoredRadiologyStudies();
    const idx = studies.findIndex((s) => s.id === studyId);
    if (idx === -1) throw new Error('Radiology study not found');

    const current = studies[idx];
    const now = new Date().toISOString();
    const isCritical = reportData.criticalFindingAlert || false;

    const updatedStudy: RadiologyStudy = {
        ...current,
        status: isCritical ? 'Critical Finding' : 'Reported',
        techniqueDescription:
            reportData.techniqueDescription || current.techniqueDescription || 'Standard multiplanar protocol.',
        findings: reportData.findings,
        impression: reportData.impression,
        recommendations: reportData.recommendations,
        radiologistName: reportData.radiologistName || 'Dr. David Aris, MD (Board Certified Radiologist)',
        reportedAt: now,
        criticalFindingAlert: isCritical,
    };

    studies[idx] = updatedStudy;
    saveStoredRadiologyStudies(studies);
    return updatedStudy;
};

// API: Acknowledge Critical Finding Verbal Readback
export const acknowledgeCriticalFinding = async (
    studyId: string,
    acknowledgedBy: string
): Promise<RadiologyStudy> => {
    const studies = getStoredRadiologyStudies();
    const idx = studies.findIndex((s) => s.id === studyId);
    if (idx === -1) throw new Error('Radiology study not found');

    const now = new Date().toISOString();
    studies[idx] = {
        ...studies[idx],
        criticalFindingAcknowledgedBy: acknowledgedBy,
        criticalFindingAcknowledgedAt: now,
    };

    saveStoredRadiologyStudies(studies);
    return studies[idx];
};

// API: Get RIS Aggregated Statistics
export const getRadiologyStats = async (tenantId?: string): Promise<RadiologyStats> => {
    let studies = getStoredRadiologyStudies();
    if (tenantId && tenantId !== 'ALL') {
        studies = studies.filter((s) => s.patientTenantId === tenantId);
    }

    const totalStudiesToday = studies.length;
    const pendingAcquisitionCount = studies.filter(
        (s) => s.status === 'Requested' || s.status === 'Scheduled' || s.status === 'In Progress'
    ).length;
    const unreportedCount = studies.filter((s) => s.status === 'Under Review').length;
    const completedCount = studies.filter((s) => s.status === 'Reported').length;
    const criticalFindingsCount = studies.filter(
        (s) => s.status === 'Critical Finding' || s.criticalFindingAlert
    ).length;

    return {
        totalStudiesToday,
        pendingAcquisitionCount,
        unreportedCount,
        completedCount,
        criticalFindingsCount,
        modalityUtilizationRate: 88,
        avgReportTurnaroundMinutes: 26,
    };
};

export const getRadiologyCatalog = (): RadiologyCatalogProcedure[] => RADIOLOGY_CATALOG;
