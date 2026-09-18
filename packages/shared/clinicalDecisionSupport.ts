/**
 * RaphaMIS Clinical Decision Support System (CDSS)
 * Module: NEWS2 (National Early Warning Score) & Pharmacological Safety Engine
 * 
 * Compliant with:
 * - Royal College of Physicians (RCP) National Early Warning Score (NEWS) 2 Guidelines
 * - WHO Patient Safety Pharmacological Standards
 */

export interface NEWS2Input {
    respiratoryRate: number;      // breaths per minute
    oxygenSaturation: number;     // SpO2 %
    onSupplementalOxygen: boolean;// Room air (false) vs Oxygen therapy (true)
    systolicBp: number;           // mmHg
    heartRate: number;            // beats per minute
    temperature: number;          // Celsius (if > 45, automatically converted from Fahrenheit)
    consciousness: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive' | 'Confusion';
    isHypercapnicRespiratoryFailure?: boolean; // Scale 2 target (88-92%) e.g. COPD
}

export interface NEWS2Breakdown {
    respiratoryRateScore: number;
    oxygenSaturationScore: number;
    supplementalOxygenScore: number;
    systolicBpScore: number;
    heartRateScore: number;
    temperatureScore: number;
    consciousnessScore: number;
}

export type NEWS2RiskLevel = 'Low' | 'Low-Medium' | 'Medium' | 'High';

export interface NEWS2Result {
    totalScore: number;
    riskLevel: NEWS2RiskLevel;
    breakdown: NEWS2Breakdown;
    hasIndividualScoreOfThree: boolean;
    clinicalAction: string;
    monitoringFrequency: string;
    escalationRecommended: boolean;
    badgeColor: 'emerald' | 'amber' | 'orange' | 'rose';
}

/**
 * Normalizes temperature to Celsius
 */
export function normalizeTemperatureToCelsius(temp: number): number {
    if (temp > 45) {
        // Likely Fahrenheit (e.g. 98.6°F -> 37.0°C)
        return parseFloat((((temp - 32) * 5) / 9).toFixed(1));
    }
    return parseFloat(temp.toFixed(1));
}

/**
 * Parse Blood Pressure string (e.g. '120/80') into systolic and diastolic numbers
 */
export function parseBloodPressure(bp: string): { systolic: number; diastolic: number } {
    if (!bp) return { systolic: 120, diastolic: 80 };
    const parts = bp.trim().split('/');
    const systolic = parseInt(parts[0], 10) || 120;
    const diastolic = parseInt(parts[1], 10) || 80;
    return { systolic, diastolic };
}

/**
 * Calculate Royal College of Physicians NEWS2 Score
 */
export function calculateNEWS2(input: NEWS2Input): NEWS2Result {
    const tempC = normalizeTemperatureToCelsius(input.temperature);
    const breakdown: NEWS2Breakdown = {
        respiratoryRateScore: 0,
        oxygenSaturationScore: 0,
        supplementalOxygenScore: 0,
        systolicBpScore: 0,
        heartRateScore: 0,
        temperatureScore: 0,
        consciousnessScore: 0,
    };

    // 1. Respiration Rate (breaths/min)
    if (input.respiratoryRate <= 8) {
        breakdown.respiratoryRateScore = 3;
    } else if (input.respiratoryRate >= 9 && input.respiratoryRate <= 11) {
        breakdown.respiratoryRateScore = 1;
    } else if (input.respiratoryRate >= 12 && input.respiratoryRate <= 20) {
        breakdown.respiratoryRateScore = 0;
    } else if (input.respiratoryRate >= 21 && input.respiratoryRate <= 24) {
        breakdown.respiratoryRateScore = 2;
    } else if (input.respiratoryRate >= 25) {
        breakdown.respiratoryRateScore = 3;
    }

    // 2. Oxygen Saturation (SpO2)
    if (input.isHypercapnicRespiratoryFailure) {
        // Scale 2 for COPD / Hypercapnic failure (Target 88-92%)
        if (input.oxygenSaturation <= 83) {
            breakdown.oxygenSaturationScore = 3;
        } else if (input.oxygenSaturation >= 84 && input.oxygenSaturation <= 85) {
            breakdown.oxygenSaturationScore = 2;
        } else if (input.oxygenSaturation >= 86 && input.oxygenSaturation <= 87) {
            breakdown.oxygenSaturationScore = 1;
        } else if (input.oxygenSaturation >= 88 && input.oxygenSaturation <= 92) {
            breakdown.oxygenSaturationScore = 0;
        } else if (input.oxygenSaturation >= 93 && input.oxygenSaturation <= 94) {
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 1 : 0;
        } else if (input.oxygenSaturation >= 95 && input.oxygenSaturation <= 96) {
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 2 : 0;
        } else if (input.oxygenSaturation >= 97) {
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 3 : 0;
        }
    } else {
        // Standard Scale 1
        if (input.oxygenSaturation <= 91) {
            breakdown.oxygenSaturationScore = 3;
        } else if (input.oxygenSaturation >= 92 && input.oxygenSaturation <= 93) {
            breakdown.oxygenSaturationScore = 2;
        } else if (input.oxygenSaturation >= 94 && input.oxygenSaturation <= 95) {
            breakdown.oxygenSaturationScore = 1;
        } else {
            breakdown.oxygenSaturationScore = 0;
        }
    }

    // 3. Supplemental Oxygen
    breakdown.supplementalOxygenScore = input.onSupplementalOxygen ? 2 : 0;

    // 4. Systolic Blood Pressure (mmHg)
    if (input.systolicBp <= 90) {
        breakdown.systolicBpScore = 3;
    } else if (input.systolicBp >= 91 && input.systolicBp <= 100) {
        breakdown.systolicBpScore = 2;
    } else if (input.systolicBp >= 101 && input.systolicBp <= 110) {
        breakdown.systolicBpScore = 1;
    } else if (input.systolicBp >= 111 && input.systolicBp <= 219) {
        breakdown.systolicBpScore = 0;
    } else if (input.systolicBp >= 220) {
        breakdown.systolicBpScore = 3;
    }

    // 5. Heart Rate (bpm)
    if (input.heartRate <= 40) {
        breakdown.heartRateScore = 3;
    } else if (input.heartRate >= 41 && input.heartRate <= 50) {
        breakdown.heartRateScore = 1;
    } else if (input.heartRate >= 51 && input.heartRate <= 90) {
        breakdown.heartRateScore = 0;
    } else if (input.heartRate >= 91 && input.heartRate <= 110) {
        breakdown.heartRateScore = 1;
    } else if (input.heartRate >= 111 && input.heartRate <= 130) {
        breakdown.heartRateScore = 2;
    } else if (input.heartRate >= 131) {
        breakdown.heartRateScore = 3;
    }

    // 6. Consciousness (AVPU)
    if (input.consciousness === 'Alert') {
        breakdown.consciousnessScore = 0;
    } else {
        // New confusion, Voice, Pain, Unresponsive
        breakdown.consciousnessScore = 3;
    }

    // 7. Temperature (°C)
    if (tempC <= 35.0) {
        breakdown.temperatureScore = 3;
    } else if (tempC >= 35.1 && tempC <= 36.0) {
        breakdown.temperatureScore = 1;
    } else if (tempC >= 36.1 && tempC <= 38.0) {
        breakdown.temperatureScore = 0;
    } else if (tempC >= 38.1 && tempC <= 39.0) {
        breakdown.temperatureScore = 1;
    } else if (tempC >= 39.1) {
        breakdown.temperatureScore = 2;
    }

    const totalScore =
        breakdown.respiratoryRateScore +
        breakdown.oxygenSaturationScore +
        breakdown.supplementalOxygenScore +
        breakdown.systolicBpScore +
        breakdown.heartRateScore +
        breakdown.consciousnessScore +
        breakdown.temperatureScore;

    const hasIndividualScoreOfThree = Object.values(breakdown).some((score) => score >= 3);

    // Determine Risk Level according to Royal College of Physicians guidelines
    let riskLevel: NEWS2RiskLevel = 'Low';
    let clinicalAction = 'Routine ward-based clinical monitoring.';
    let monitoringFrequency = 'Minimum 12-hourly monitoring.';
    let escalationRecommended = false;
    let badgeColor: 'emerald' | 'amber' | 'orange' | 'rose' = 'emerald';

    if (totalScore >= 7) {
        riskLevel = 'High';
        clinicalAction =
            'EMERGENCY RESPONSE: Immediate assessment by critical care / Medical Emergency Team (MET). Consider ICU/HDU admission and continuous monitoring.';
        monitoringFrequency = 'Continuous monitoring of vital signs.';
        escalationRecommended = true;
        badgeColor = 'rose';
    } else if (totalScore >= 5) {
        riskLevel = 'Medium';
        clinicalAction =
            'URGENT REVIEW: Urgent bedside clinical assessment by treating physician or specialist team within 1 hour. Sepsis screen recommended.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
        badgeColor = 'orange';
    } else if (hasIndividualScoreOfThree) {
        riskLevel = 'Low-Medium';
        clinicalAction =
            'URGENT WARD RESPONSE: Score of 3 in a single parameter. Urgent review by ward nurse and inform duty physician.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
        badgeColor = 'amber';
    } else if (totalScore >= 1) {
        riskLevel = 'Low';
        clinicalAction = 'Ward-based review. Inform registered nurse who will assess monitoring frequency.';
        monitoringFrequency = '4 to 6-hourly monitoring.';
        escalationRecommended = false;
        badgeColor = 'emerald';
    }

    return {
        totalScore,
        riskLevel,
        breakdown,
        hasIndividualScoreOfThree,
        clinicalAction,
        monitoringFrequency,
        escalationRecommended,
        badgeColor,
    };
}

// ==============================================================================
// PHARMACOLOGICAL SAFETY: DRUG-DRUG & DRUG-ALLERGY INTERACTION ENGINE
// ==============================================================================

export type DrugInteractionSeverity = 'contraindicated' | 'major' | 'moderate';

export interface DrugInteractionRule {
    drugA: string[]; // Generic keywords or brands
    drugB: string[];
    severity: DrugInteractionSeverity;
    title: string;
    clinicalEffect: string;
    recommendation: string;
}

export interface AllergyCrossRule {
    allergyKeywords: string[];
    medicationKeywords: string[];
    severity: 'fatal_anaphylaxis_risk' | 'severe_reaction';
    title: string;
    clinicalEffect: string;
    recommendation: string;
}

export interface ClinicalSafetyAlert {
    type: 'drug_interaction' | 'allergy_warning';
    severity: DrugInteractionSeverity | 'fatal_anaphylaxis_risk' | 'severe_reaction';
    offendingItem: string;
    conflictingWith: string;
    title: string;
    clinicalEffect: string;
    recommendation: string;
    requiresOverride: boolean;
}

/**
 * Curated Clinical Evidence Base of High-Risk Pharmacological Interactions
 */
export const HIGH_RISK_DRUG_INTERACTIONS: DrugInteractionRule[] = [
    {
        drugA: ['warfarin', 'coumadin', 'acenocoumarol'],
        drugB: ['ciprofloxacin', 'levofloxacin', 'metronidazole', 'fluconazole', 'bactrim', 'cotrimoxazole'],
        severity: 'contraindicated',
        title: 'Severe Bleeding & Critical INR Elevation',
        clinicalEffect: 'Inhibition of CYP2C9 metabolism of Warfarin dramatically increases bleeding risk and hemorrhagic stroke.',
        recommendation: 'Avoid combination if possible, or reduce Warfarin dose by 30-50% with daily INR monitoring.',
    },
    {
        drugA: ['warfarin', 'coumadin', 'dabigatran', 'rivaroxaban', 'apixaban'],
        drugB: ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'ketorolac', 'meloxicam'],
        severity: 'major',
        title: 'Synergistic Gastrointestinal Bleeding Risk',
        clinicalEffect: 'Co-administration of anticoagulants with NSAIDs inhibits platelet aggregation and causes gastric mucosal injury.',
        recommendation: 'Add PPI co-prescription (e.g. Pantoprazole) or switch analgesic to Paracetamol.',
    },
    {
        drugA: ['enalapril', 'lisinopril', 'ramipril', 'losartan', 'valsartan', 'candesartan'],
        drugB: ['spironolactone', 'eplerenone', 'potassium chloride', 'k-dur'],
        severity: 'major',
        title: 'Severe Life-Threatening Hyperkalemia',
        clinicalEffect: 'Concurrent RAAS blockade and potassium-sparing diuretics may lead to fatal cardiac arrhythmias and asystole.',
        recommendation: 'Check serum potassium prior to starting, monitor electrolytes within 48-72 hours.',
    },
    {
        drugA: ['tramadol', 'pethidine', 'meperidine', 'fentanyl'],
        drugB: ['fluoxetine', 'sertraline', 'citalopram', 'escitalopram', 'paroxetine', 'venlafaxine', 'duloxetine', 'selegiline'],
        severity: 'contraindicated',
        title: 'Risk of Serotonin Syndrome & Seizures',
        clinicalEffect: 'Excessive synaptic serotonin causing autonomic instability, hyperthermia, neuromuscular rigidity, and delirium.',
        recommendation: 'Contraindicated. Choose non-serotonergic opioid (e.g., low-dose Morphine) or taper antidepressant.',
    },
    {
        drugA: ['methotrexate'],
        drugB: ['ibuprofen', 'diclofenac', 'naproxen', 'ketorolac'],
        severity: 'contraindicated',
        title: 'Severe Methotrexate Toxicity & Bone Marrow Aplasia',
        clinicalEffect: 'NSAIDs reduce renal clearance of Methotrexate, causing profound pancytopenia and acute tubular necrosis.',
        recommendation: 'Do not administer NSAIDs with high-dose methotrexate; monitor CBC and renal markers closely.',
    },
    {
        drugA: ['sildenafil', 'tadalafil', 'vardenafil', 'viagra', 'cialis'],
        drugB: ['nitroglycerin', 'isosorbide dinitrate', 'isosorbide mononitrate', 'glyceryl trinitrate'],
        severity: 'contraindicated',
        title: 'Fatal Refractory Hypotension & Cardiovascular Collapse',
        clinicalEffect: 'PDE-5 inhibitors potentiate nitric oxide/cGMP signaling, causing catastrophic drop in systemic vascular resistance.',
        recommendation: 'Strictly contraindicated. Must not be co-administered within 24 to 48 hours of each other.',
    },
    {
        drugA: ['amiodarone', 'cordarone'],
        drugB: ['simvastatin', 'atorvastatin', 'lovastatin'],
        severity: 'major',
        title: 'Risk of Severe Rhabdomyolysis',
        clinicalEffect: 'Amiodarone inhibits CYP3A4, causing dangerous accumulation of statin metabolites and skeletal muscle necrosis.',
        recommendation: 'Limit Simvastatin to maximum 20mg/day, or switch to Rosuvastatin / Pravastatin.',
    },
    {
        drugA: ['gentamicin', 'amikacin', 'tobramycin'],
        drugB: ['furosemide', 'lasix', 'vancomycin'],
        severity: 'major',
        title: 'Dual Ototoxicity and Acute Tubular Nephrotoxicity',
        clinicalEffect: 'Additive cochlear/vestibular damage and synergistic proximal tubular injury.',
        recommendation: 'Ensure therapeutic drug monitoring (TDM) trough levels and daily creatinine checks.',
    },
    {
        drugA: ['digoxin', 'lanoxin'],
        drugB: ['amiodarone', 'verapamil', 'clarithromycin'],
        severity: 'major',
        title: 'Digoxin Toxicity & Complete Heart Block',
        clinicalEffect: 'Reduced renal and non-renal clearance causing nausea, visual xanthopsia, and life-threatening ventricular arrhythmias.',
        recommendation: 'Reduce Digoxin dose by 50% upon initiating inhibitor and monitor serum digoxin levels.',
    },
    {
        drugA: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'erythromycin', 'clarithromycin', 'haloperidol'],
        drugB: ['ondansetron', 'amiodarone', 'sotalol', 'fluconazole', 'quetiapine'],
        severity: 'major',
        title: 'Additive QT Prolongation & Torsades de Pointes',
        clinicalEffect: 'Combined blockade of cardiac IKr channels can precipitate polymorphic ventricular tachycardia.',
        recommendation: 'Obtain baseline 12-lead ECG, verify QTc < 500ms, and correct hypokalemia/hypomagnesemia.',
    },
    {
        drugA: ['clopidogrel', 'plavix'],
        drugB: ['omeprazole', 'esomeprazole'],
        severity: 'moderate',
        title: 'Reduced Antiplatelet Activation',
        clinicalEffect: 'Inhibition of CYP2C19 prevents bioactivation of Clopidogrel, potentially increasing recurrent ischemic events.',
        recommendation: 'Substitute Omeprazole with Pantoprazole or H2-receptor antagonist (Famotidine).',
    },
];

/**
 * Drug-Allergy Cross-Reactivity Rules
 */
export const ALLERGY_RULES: AllergyCrossRule[] = [
    {
        allergyKeywords: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin'],
        medicationKeywords: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'cloxacillin', 'piperacillin', 'tazobactam'],
        severity: 'fatal_anaphylaxis_risk',
        title: 'Severe Penicillin Anaphylaxis Alert',
        clinicalEffect: 'Documented beta-lactam hypersensitivity. Administration risks immediate IgE-mediated anaphylactic shock.',
        recommendation: 'Do not administer. Select alternative non-beta-lactam antibiotic (e.g., Macrolide, Fluoroquinolone).',
    },
    {
        allergyKeywords: ['penicillin', 'amoxicillin'],
        medicationKeywords: ['ceftriaxone', 'cefuroxime', 'cephalexin', 'cefepime', 'cefixime'],
        severity: 'severe_reaction',
        title: 'Potential Cephalosporin Cross-Reactivity (1-3%)',
        clinicalEffect: 'Shared beta-lactam ring structure can cause allergic reaction in patients with severe penicillin allergy history.',
        recommendation: 'If patient had true anaphylaxis/angioedema to Penicillin, avoid cephalosporins or administer under close observation.',
    },
    {
        allergyKeywords: ['sulfa', 'sulfonamide', 'bactrim', 'cotrimoxazole'],
        medicationKeywords: ['bactrim', 'cotrimoxazole', 'sulfamethoxazole', 'sulfadiazine', 'dapsone'],
        severity: 'fatal_anaphylaxis_risk',
        title: 'Sulfonamide Hypersensitivity Alert',
        clinicalEffect: 'Risk of severe cutaneous adverse reactions (SCAR), Stevens-Johnson Syndrome (SJS), and toxic epidermal necrolysis.',
        recommendation: 'Contraindicated. Choose non-sulfonamide antimicrobial regimen.',
    },
    {
        allergyKeywords: ['aspirin', 'nsaid', 'ibuprofen', 'diclofenac'],
        medicationKeywords: ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib'],
        severity: 'severe_reaction',
        title: 'NSAID / Aspirin Exacerbated Respiratory Disease',
        clinicalEffect: 'Inhibition of COX-1 can trigger severe bronchospasm, urticaria, or anaphylactoid reaction.',
        recommendation: 'Contraindicated if patient has history of NSAID-induced asthma or angioedema. Use Paracetamol or Opioids.',
    },
    {
        allergyKeywords: ['codeine', 'morphine', 'tramadol', 'opioid'],
        medicationKeywords: ['codeine', 'morphine', 'tramadol', 'oxycodone', 'pethidine', 'fentanyl'],
        severity: 'severe_reaction',
        title: 'Opioid Hypersensitivity Alert',
        clinicalEffect: 'Known allergy to opioid class analgesics risking histamine release, hypotension, and anaphylaxis.',
        recommendation: 'Confirm true allergy vs nausea/constipation intolerance. If true allergy, utilize non-opioid multimodal analgesia.',
    },
];

/**
 * Evaluates a proposed new medication against:
 * 1. The patient's active prescriptions (Drug-Drug Interactions)
 * 2. The patient's documented allergies (Drug-Allergy Cross-Reactivity)
 */
export function evaluatePrescriptionSafety(
    proposedMedication: string,
    activePrescriptions: Array<{ medication: string; status?: string }>,
    patientAllergies: string[] = []
): ClinicalSafetyAlert[] {
    const alerts: ClinicalSafetyAlert[] = [];
    const proposed = proposedMedication.toLowerCase().trim();

    if (!proposed) return alerts;

    // 1. Check Drug-Allergy Conflicts
    const normalizedAllergies = patientAllergies.map((a) => a.toLowerCase().trim()).filter(Boolean);

    for (const rule of ALLERGY_RULES) {
        const matchesAllergy = normalizedAllergies.some((userAllergy) =>
            rule.allergyKeywords.some((kw) => userAllergy.includes(kw) || kw.includes(userAllergy))
        );

        if (matchesAllergy) {
            const matchesMed = rule.medicationKeywords.some((kw) => proposed.includes(kw));
            if (matchesMed) {
                alerts.push({
                    type: 'allergy_warning',
                    severity: rule.severity,
                    offendingItem: proposedMedication,
                    conflictingWith: patientAllergies.join(', '),
                    title: rule.title,
                    clinicalEffect: rule.clinicalEffect,
                    recommendation: rule.recommendation,
                    requiresOverride: true,
                });
            }
        }
    }

    // 2. Check Drug-Drug Interactions with Active Prescriptions
    const activeMeds = activePrescriptions
        .filter((p) => !p.status || p.status === 'Active')
        .map((p) => p.medication.toLowerCase().trim());

    for (const rule of HIGH_RISK_DRUG_INTERACTIONS) {
        // Check if proposed med matches drugA and active med matches drugB (or vice-versa)
        const proposedIsA = rule.drugA.some((kw) => proposed.includes(kw));
        const proposedIsB = rule.drugB.some((kw) => proposed.includes(kw));

        if (proposedIsA) {
            const conflictingActive = activeMeds.find((activeMed) =>
                rule.drugB.some((kw) => activeMed.includes(kw))
            );
            if (conflictingActive) {
                alerts.push({
                    type: 'drug_interaction',
                    severity: rule.severity,
                    offendingItem: proposedMedication,
                    conflictingWith: conflictingActive,
                    title: rule.title,
                    clinicalEffect: rule.clinicalEffect,
                    recommendation: rule.recommendation,
                    requiresOverride: rule.severity === 'contraindicated' || rule.severity === 'major',
                });
            }
        } else if (proposedIsB) {
            const conflictingActive = activeMeds.find((activeMed) =>
                rule.drugA.some((kw) => activeMed.includes(kw))
            );
            if (conflictingActive) {
                alerts.push({
                    type: 'drug_interaction',
                    severity: rule.severity,
                    offendingItem: proposedMedication,
                    conflictingWith: conflictingActive,
                    title: rule.title,
                    clinicalEffect: rule.clinicalEffect,
                    recommendation: rule.recommendation,
                    requiresOverride: rule.severity === 'contraindicated' || rule.severity === 'major',
                });
            }
        }
    }

    return alerts;
}
