"use strict";
/**
 * RaphaMIS Clinical Decision Support System (CDSS)
 * Backend Module: NEWS2 & Pharmacological Safety Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIGH_RISK_DRUG_INTERACTIONS = void 0;
exports.normalizeTemperatureToCelsius = normalizeTemperatureToCelsius;
exports.parseBloodPressure = parseBloodPressure;
exports.calculateNEWS2 = calculateNEWS2;
exports.evaluatePrescriptionSafety = evaluatePrescriptionSafety;
function normalizeTemperatureToCelsius(temp) {
    if (temp > 45) {
        return parseFloat((((temp - 32) * 5) / 9).toFixed(1));
    }
    return parseFloat(temp.toFixed(1));
}
function parseBloodPressure(bp) {
    if (!bp)
        return { systolic: 120, diastolic: 80 };
    var parts = bp.trim().split('/');
    var systolic = parseInt(parts[0], 10) || 120;
    var diastolic = parseInt(parts[1], 10) || 80;
    return { systolic: systolic, diastolic: diastolic };
}
function calculateNEWS2(input) {
    var tempC = normalizeTemperatureToCelsius(input.temperature);
    var breakdown = {
        respiratoryRateScore: 0,
        oxygenSaturationScore: 0,
        supplementalOxygenScore: 0,
        systolicBpScore: 0,
        heartRateScore: 0,
        temperatureScore: 0,
        consciousnessScore: 0,
    };
    if (input.respiratoryRate <= 8)
        breakdown.respiratoryRateScore = 3;
    else if (input.respiratoryRate >= 9 && input.respiratoryRate <= 11)
        breakdown.respiratoryRateScore = 1;
    else if (input.respiratoryRate >= 12 && input.respiratoryRate <= 20)
        breakdown.respiratoryRateScore = 0;
    else if (input.respiratoryRate >= 21 && input.respiratoryRate <= 24)
        breakdown.respiratoryRateScore = 2;
    else if (input.respiratoryRate >= 25)
        breakdown.respiratoryRateScore = 3;
    if (input.isHypercapnicRespiratoryFailure) {
        if (input.oxygenSaturation <= 83)
            breakdown.oxygenSaturationScore = 3;
        else if (input.oxygenSaturation >= 84 && input.oxygenSaturation <= 85)
            breakdown.oxygenSaturationScore = 2;
        else if (input.oxygenSaturation >= 86 && input.oxygenSaturation <= 87)
            breakdown.oxygenSaturationScore = 1;
        else if (input.oxygenSaturation >= 88 && input.oxygenSaturation <= 92)
            breakdown.oxygenSaturationScore = 0;
        else if (input.oxygenSaturation >= 93 && input.oxygenSaturation <= 94)
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 1 : 0;
        else if (input.oxygenSaturation >= 95 && input.oxygenSaturation <= 96)
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 2 : 0;
        else if (input.oxygenSaturation >= 97)
            breakdown.oxygenSaturationScore = input.onSupplementalOxygen ? 3 : 0;
    }
    else {
        if (input.oxygenSaturation <= 91)
            breakdown.oxygenSaturationScore = 3;
        else if (input.oxygenSaturation >= 92 && input.oxygenSaturation <= 93)
            breakdown.oxygenSaturationScore = 2;
        else if (input.oxygenSaturation >= 94 && input.oxygenSaturation <= 95)
            breakdown.oxygenSaturationScore = 1;
        else
            breakdown.oxygenSaturationScore = 0;
    }
    breakdown.supplementalOxygenScore = input.onSupplementalOxygen ? 2 : 0;
    if (input.systolicBp <= 90)
        breakdown.systolicBpScore = 3;
    else if (input.systolicBp >= 91 && input.systolicBp <= 100)
        breakdown.systolicBpScore = 2;
    else if (input.systolicBp >= 101 && input.systolicBp <= 110)
        breakdown.systolicBpScore = 1;
    else if (input.systolicBp >= 111 && input.systolicBp <= 219)
        breakdown.systolicBpScore = 0;
    else if (input.systolicBp >= 220)
        breakdown.systolicBpScore = 3;
    if (input.heartRate <= 40)
        breakdown.heartRateScore = 3;
    else if (input.heartRate >= 41 && input.heartRate <= 50)
        breakdown.heartRateScore = 1;
    else if (input.heartRate >= 51 && input.heartRate <= 90)
        breakdown.heartRateScore = 0;
    else if (input.heartRate >= 91 && input.heartRate <= 110)
        breakdown.heartRateScore = 1;
    else if (input.heartRate >= 111 && input.heartRate <= 130)
        breakdown.heartRateScore = 2;
    else if (input.heartRate >= 131)
        breakdown.heartRateScore = 3;
    if (input.consciousness === 'Alert')
        breakdown.consciousnessScore = 0;
    else
        breakdown.consciousnessScore = 3;
    if (tempC <= 35.0)
        breakdown.temperatureScore = 3;
    else if (tempC >= 35.1 && tempC <= 36.0)
        breakdown.temperatureScore = 1;
    else if (tempC >= 36.1 && tempC <= 38.0)
        breakdown.temperatureScore = 0;
    else if (tempC >= 38.1 && tempC <= 39.0)
        breakdown.temperatureScore = 1;
    else if (tempC >= 39.1)
        breakdown.temperatureScore = 2;
    var totalScore = breakdown.respiratoryRateScore +
        breakdown.oxygenSaturationScore +
        breakdown.supplementalOxygenScore +
        breakdown.systolicBpScore +
        breakdown.heartRateScore +
        breakdown.consciousnessScore +
        breakdown.temperatureScore;
    var hasIndividualScoreOfThree = Object.values(breakdown).some(function (score) { return score >= 3; });
    var riskLevel = 'Low';
    var clinicalAction = 'Routine ward-based clinical monitoring.';
    var monitoringFrequency = 'Minimum 12-hourly monitoring.';
    var escalationRecommended = false;
    if (totalScore >= 7) {
        riskLevel = 'High';
        clinicalAction =
            'EMERGENCY RESPONSE: Immediate assessment by critical care / Medical Emergency Team (MET). Consider ICU/HDU admission and continuous monitoring.';
        monitoringFrequency = 'Continuous monitoring of vital signs.';
        escalationRecommended = true;
    }
    else if (totalScore >= 5) {
        riskLevel = 'Medium';
        clinicalAction =
            'URGENT REVIEW: Urgent bedside clinical assessment by treating physician or specialist team within 1 hour. Sepsis screen recommended.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
    }
    else if (hasIndividualScoreOfThree) {
        riskLevel = 'Low-Medium';
        clinicalAction =
            'URGENT WARD RESPONSE: Score of 3 in a single parameter. Urgent review by ward nurse and inform duty physician.';
        monitoringFrequency = 'Minimum 1-hourly monitoring.';
        escalationRecommended = true;
    }
    else if (totalScore >= 1) {
        riskLevel = 'Low';
        clinicalAction = 'Ward-based review. Inform registered nurse who will assess monitoring frequency.';
        monitoringFrequency = '4 to 6-hourly monitoring.';
    }
    return {
        totalScore: totalScore,
        riskLevel: riskLevel,
        breakdown: breakdown,
        hasIndividualScoreOfThree: hasIndividualScoreOfThree,
        clinicalAction: clinicalAction,
        monitoringFrequency: monitoringFrequency,
        escalationRecommended: escalationRecommended,
    };
}
exports.HIGH_RISK_DRUG_INTERACTIONS = [
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
function evaluatePrescriptionSafety(proposedMedication, activePrescriptions, patientAllergies) {
    if (patientAllergies === void 0) { patientAllergies = []; }
    var alerts = [];
    var proposed = proposedMedication.toLowerCase().trim();
    if (!proposed)
        return alerts;
    var normalizedAllergies = patientAllergies.map(function (a) { return a.toLowerCase().trim(); }).filter(Boolean);
    // Allergy check
    if (normalizedAllergies.some(function (a) { return a.includes('penicillin') || a.includes('amoxicillin'); }) &&
        (proposed.includes('penicillin') || proposed.includes('amoxicillin') || proposed.includes('ampicillin') || proposed.includes('augmentin'))) {
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
    var activeMeds = activePrescriptions
        .filter(function (p) { return !p.status || p.status === 'Active'; })
        .map(function (p) { return p.medication.toLowerCase().trim(); });
    var _loop_1 = function (rule) {
        var proposedIsA = rule.drugA.some(function (kw) { return proposed.includes(kw); });
        var proposedIsB = rule.drugB.some(function (kw) { return proposed.includes(kw); });
        if (proposedIsA) {
            var conflicting = activeMeds.find(function (am) { return rule.drugB.some(function (kw) { return am.includes(kw); }); });
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
        else if (proposedIsB) {
            var conflicting = activeMeds.find(function (am) { return rule.drugA.some(function (kw) { return am.includes(kw); }); });
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
    };
    for (var _i = 0, HIGH_RISK_DRUG_INTERACTIONS_1 = exports.HIGH_RISK_DRUG_INTERACTIONS; _i < HIGH_RISK_DRUG_INTERACTIONS_1.length; _i++) {
        var rule = HIGH_RISK_DRUG_INTERACTIONS_1[_i];
        _loop_1(rule);
    }
    return alerts;
}
