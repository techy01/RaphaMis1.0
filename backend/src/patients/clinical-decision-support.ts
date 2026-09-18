/**
 * RaphaMIS Clinical Decision Support System (CDSS)
 * Backend Module: NEWS2 & Pharmacological Safety Engine
 */

export interface NEWS2Input {
    respiratoryRate: number;
    oxygenSaturation: number;
    onSupplementalOxygen: boolean;
    systolicBp: number;
    heartRate: number;
    temperature: number;
    consciousness: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive' | 'Confusion';
    isHypercapnicRespiratoryFailure?: boolean;
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
}

export function normalizeTemperatureToCelsius(temp: number): number {
    if (temp > 45) {
        return parseFloat((((temp - 32) * 5) / 9).toFixed(1));
    }
    return parseFloat(temp.toFixed(1));
}

export function parseBloodPressure(bp: string): { systolic: number; diastolic: number } {
    if (!bp) return { systolic: 120, diastolic: 80 };
    const parts = bp.trim().split('/');
    const systolic = parseInt(parts[0], 10) || 120;
    const diastolic = parseInt(parts[1], 10) || 80;
    return { systolic, diastolic };
}

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

    if (input.respiratoryRate <= 8) breakdown.respiratoryRateScore = 3;
    else if (input.respiratoryRate >= 9 && input.respiratoryRate <= 11) breakdown.respiratoryRateScore = 1;
    else if (input.respiratoryRate >= 12 && input.respiratoryRate <= 20) breakdown.respiratoryRateScore = 0;
    else if (input.respiratoryRate >= 21 && input.respiratoryRate <= 24) breakdown.respiratoryRateScore = 2;
    else if (input.respiratoryRate >= 25) breakdown.respiratoryRateScore = 3;

    if (input.isHypercapnicRespiratoryFailure) {
        if (input.oxygenSaturation <= 83) breakdown.oxygenSaturationScore = 3;
        else if (input.oxygenSaturation >= 84 && input.oxygenSaturation <= 85) breakdown.oxygenSaturationScore = 2;
        else if (input.oxygenSaturation >= 86 && input.oxygenSaturation <= 87) breakdown.oxygenSaturationScore = 1;
        else if (input.oxygenSaturation >= 88 && input.oxygenSaturation <= 92) breakdown.oxygenSaturationScore = 0;
        else if (input.oxygenSaturation >= 93 && input.oxygenSaturation <= 94) breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 1 : 0;
        else if (input.oxygenSaturation >= 95 && input.oxygenSaturation <= 96) breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 2 : 0;
        else if (input.oxygenSaturation >= 97) breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 3 : 0;
    } else {
        if (input.oxygenSaturation <= 91) breakdown.oxygenSaturationScore = 3;
        else if (input.oxygenSaturation >= 92 && input.oxygenSaturation <= 93) breakdown.oxygenSaturationScore = 2;
        else if (input.oxygenSaturation >= 94 && input.oxygenSaturation <= 95) breakdown.oxygenSaturationScore = 1;
        else breakdown.oxygenSaturationScore = 0;
    }

    breakdown.supplementalOxygenScore = input.onSupplementalOxygen ? 2 : 0;

    if (input.systolicBp <= 90) breakdown.systolicBpScore = 3;
    else if (input.systolicBp >= 91 && input.systolicBp <= 100) breakdown.systolicBpScore = 2;
    else if (input.systolicBp >= 101 && input.systolicBp <= 110) breakdown.systolicBpScore = 1;
    else if (input.systolicBp >= 111 && input.systolicBp <= 219) breakdown.systolicBpScore = 0;
    else if (input.systolicBp >= 220) breakdown.systolicBpScore = 3;

    if (input.heartRate <= 40) breakdown.heartRateScore = 3;
    else if (input.heartRate >= 41 && input.heartRate <= 50) breakdown.heartRateScore = 1;
    else if (input.heartRate >= 51 && input.heartRate <= 90) breakdown.heartRateScore = 0;
    else if (input.heartRate >= 91 && input.heartRate <= 110) breakdown.heartRateScore = 1;
    else if (input.heartRate >= 111 && input.heartRate <= 130) breakdown.heartRateScore = 2;
    else if (input.heartRate >= 131) breakdown.heartRateScore = 3;

    if (input.consciousness === 'Alert') breakdown.consciousnessScore = 0;
    else breakdown.consciousnessScore = 3;

    if (tempC <= 35.0) breakdown.temperatureScore = 3;
    else if (tempC >= 35.1 && tempC <= 36.0) breakdown.temperatureScore = 1;
    else if (tempC >= 36.1 && tempC <= 38.0) breakdown.temperatureScore = 0;
    else if (tempC >= 38.1 && tempC <= 39.0) breakdown.temperatureScore = 1;
    else if (tempC >= 39.1) breakdown.temperatureScore = 2;

    const totalScore =
        breakdown.respiratoryRateScore +
        breakdown.oxygenSaturationScore +
        breakdown.supplementalOxygenScore +
        breakdown.systolicBpScore +
        breakdown.heartRateScore +
        breakdown.consciousnessScore +
        breakdown.temperatureScore;

    const hasIndividualScoreOfThree = Object.values(breakdown).some((score) => score >= 3);

    let riskLevel: NEWS2RiskLevel = 'Low';
    let clinicalAction = 'Routine ward-based clinical monitoring.';
    let monitoringFrequency = 'Minimum 12-hourly monitoring.';
    let escalationRecommended = false;

    if (totalScore >= 7) {
        riskLevel = 'High';
        clinicalAction =
            'EMERGENCY RESPONSE: Immediate assessment by critical care / Medical Emergency Team (MET). Consider ICU/HDU admission and continuous monitoring.';
        monitoringFrequency = 'Continuous monitoring of vital signs.';
        escalationRecommended = true;
    } else if (totalScore >= 5) {
        riskLevel = 'Medium';
        clinicalAction =
            'URGENT REVIEW: Urgent bedside clinical assessment by treating physician or specialist team within 1 hour. Sepsis screen recommended.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
    } else if (hasIndividualScoreOfThree) {
        riskLevel = 'Low-Medium';
        clinicalAction =
            'URGENT WARD RESPONSE: Score of 3 in a single parameter. Urgent review by ward nurse and inform duty physician.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
    } else if (totalScore >= 1) {
        riskLevel = 'Low';
        clinicalAction = 'Ward-based review. Inform registered nurse who will assess monitoring frequency.';
        monitoringFrequency = '4 to 6-hourly monitoring.';
    }

    return {
        totalScore,
        riskLevel,
        breakdown,
        hasIndividualScoreOfThree,
        clinicalAction,
        monitoringFrequency,
        escalationRecommended,
    };
}

export type DrugInteractionSeverity = 'contraindicated' | 'major' | 'moderate';

export interface DrugInteractionRule {
    drugA: string[];
    drugB: string[];
    severity: DrugInteractionSeverity;
    title: string;
    clinicalEffect: string;
    recommendation: string;
}

export const HIGH_RISK_DRUG_INTERACTIONS: DrugInteractionRule[] = [
    {
        drugA: ['warfarin', 'coumadin'],
        drugB: ['ciprofloxacin', 'levofloxacin', 'metronidazole', 'fluconazole', 'bactrim', 'cotrimoxazole'],
        severity: 'contraindicated',
        title: 'Severe Bleeding & Critical INR Elevation',
        clinicalEffect: 'Inhibition of CYP2C9 metabolism of Warfarin dramatically increases bleeding risk.',
        recommendation: 'Avoid combination if possible, or reduce Warfarin dose with daily INR monitoring.',
    },
    {
        drugA: ['warfarin', 'coumadin', 'dabigatran', 'rivaroxaban', 'apixaban'],
        drugB: ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'ketorolac'],
        severity: 'major',
        title: 'Synergistic Gastrointestinal Bleeding Risk',
        clinicalEffect: 'Co-administration of anticoagulants with NSAIDs inhibits platelet aggregation and causes gastric mucosal injury.',
        recommendation: 'Add PPI co-prescription (e.g. Pantoprazole) or switch analgesic to Paracetamol.',
    },
    {
        drugA: ['enalapril', 'lisinopril', 'ramipril', 'losartan', 'valsartan'],
        drugB: ['spironolactone', 'eplerenone', 'potassium chloride'],
        severity: 'major',
        title: 'Severe Life-Threatening Hyperkalemia',
        clinicalEffect: 'Concurrent RAAS blockade and potassium-sparing diuretics may lead to fatal cardiac arrhythmias.',
        recommendation: 'Check serum potassium prior to starting, monitor electrolytes within 48-72 hours.',
    },
    {
        drugA: ['tramadol', 'pethidine', 'meperidine', 'fentanyl'],
        drugB: ['fluoxetine', 'sertraline', 'citalopram', 'escitalopram', 'paroxetine', 'venlafaxine', 'duloxetine'],
        severity: 'contraindicated',
        title: 'Risk of Serotonin Syndrome & Seizures',
        clinicalEffect: 'Excessive synaptic serotonin causing autonomic instability, hyperthermia, and delirium.',
        recommendation: 'Contraindicated. Choose non-serotonergic opioid or taper antidepressant.',
    },
    {
        drugA: ['sildenafil', 'tadalafil', 'viagra'],
        drugB: ['nitroglycerin', 'isosorbide dinitrate', 'isosorbide mononitrate'],
        severity: 'contraindicated',
        title: 'Fatal Refractory Hypotension & Cardiovascular Collapse',
        clinicalEffect: 'PDE-5 inhibitors potentiate nitric oxide signaling causing catastrophic blood pressure drop.',
        recommendation: 'Strictly contraindicated. Must not be co-administered within 24-48 hours.',
    },
    {
        drugA: ['methotrexate'],
        drugB: ['ibuprofen', 'diclofenac', 'naproxen', 'ketorolac'],
        severity: 'contraindicated',
        title: 'Severe Methotrexate Toxicity & Bone Marrow Aplasia',
        clinicalEffect: 'NSAIDs reduce renal clearance of Methotrexate, causing profound pancytopenia.',
        recommendation: 'Do not administer NSAIDs with methotrexate; monitor CBC and renal function.',
    },
];

export function evaluatePrescriptionSafety(
    proposedMedication: string,
    activePrescriptions: Array<{ medication: string; status?: string }>,
    patientAllergies: string[] = []
): Array<{
    type: string;
    severity: string;
    title: string;
    clinicalEffect: string;
    recommendation: string;
    requiresOverride: boolean;
}> {
    const alerts: any[] = [];
    const proposed = proposedMedication.toLowerCase().trim();
    if (!proposed) return alerts;

    const normalizedAllergies = patientAllergies.map((a) => a.toLowerCase().trim()).filter(Boolean);

    // Allergy check
    if (
        normalizedAllergies.some((a) => a.includes('penicillin') || a.includes('amoxicillin')) &&
        (proposed.includes('penicillin') || proposed.includes('amoxicillin') || proposed.includes('ampicillin') || proposed.includes('augmentin'))
    ) {
        alerts.push({
            type: 'allergy_warning',
            severity: 'fatal_anaphylaxis_risk',
            title: 'Severe Penicillin Anaphylaxis Alert',
            clinicalEffect: 'Documented beta-lactam hypersensitivity. Risks immediate IgE-mediated anaphylactic shock.',
            recommendation: 'Do not administer. Select alternative non-beta-lactam antibiotic.',
            requiresOverride: true,
        });
    }

    // Drug-Drug check
    const activeMeds = activePrescriptions
        .filter((p) => !p.status || p.status === 'Active')
        .map((p) => p.medication.toLowerCase().trim());

    for (const rule of HIGH_RISK_DRUG_INTERACTIONS) {
        const proposedIsA = rule.drugA.some((kw) => proposed.includes(kw));
        const proposedIsB = rule.drugB.some((kw) => proposed.includes(kw));

        if (proposedIsA) {
            const conflicting = activeMeds.find((am) => rule.drugB.some((kw) => am.includes(kw)));
            if (conflicting) {
                alerts.push({
                    type: 'drug_interaction',
                    severity: rule.severity,
                    title: rule.title,
                    clinicalEffect: rule.clinicalEffect,
                    recommendation: rule.recommendation,
                    requiresOverride: rule.severity === 'contraindicated' || rule.severity === 'major',
                });
            }
        } else if (proposedIsB) {
            const conflicting = activeMeds.find((am) => rule.drugA.some((kw) => am.includes(kw)));
            if (conflicting) {
                alerts.push({
                    type: 'drug_interaction',
                    severity: rule.severity,
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
