import React, { useState, useEffect, useMemo } from 'react';
import { X, HeartPulse, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Patient, PatientVital } from '../../packages/shared/types';
import { updatePatientVitals } from '../../api/patientsApi';
import { calculateNEWS2, parseBloodPressure, normalizeTemperatureToCelsius } from '../../packages/shared/clinicalDecisionSupport';
import { NEWS2TriageBadge } from './NEWS2TriageBadge';

interface PatientQuickVitalsModalProps {
    isOpen: boolean;
    patient: Patient | null;
    onClose: () => void;
    onVitalsSaved: (updatedPatient: Patient) => void;
}

export const PatientQuickVitalsModal: React.FC<PatientQuickVitalsModalProps> = ({
    isOpen,
    patient,
    onClose,
    onVitalsSaved,
}) => {
    const [vitals, setVitals] = useState<PatientVital>({
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        recordedAt: '',
        consciousness: 'Alert',
        onSupplementalOxygen: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (patient?.vitals) {
            setVitals({
                bloodPressure: patient.vitals.bloodPressure || '120/80',
                heartRate: patient.vitals.heartRate || 72,
                temperature: patient.vitals.temperature || 98.6,
                respiratoryRate: patient.vitals.respiratoryRate || 16,
                oxygenSaturation: patient.vitals.oxygenSaturation || 98,
                consciousness: patient.vitals.consciousness || 'Alert',
                onSupplementalOxygen: Boolean(patient.vitals.onSupplementalOxygen),
                recordedAt: new Date().toISOString(),
            });
        }
    }, [patient, isOpen]);

    // Live NEWS2 calculation as the clinician inputs triage parameters
    const liveNEWS2 = useMemo(() => {
        const bp = parseBloodPressure(vitals.bloodPressure);
        return calculateNEWS2({
            respiratoryRate: Number(vitals.respiratoryRate) || 16,
            oxygenSaturation: Number(vitals.oxygenSaturation) || 98,
            onSupplementalOxygen: Boolean(vitals.onSupplementalOxygen),
            systolicBp: bp.systolic || 120,
            heartRate: Number(vitals.heartRate) || 72,
            temperature: Number(vitals.temperature) || 37.0,
            consciousness: vitals.consciousness || 'Alert',
        });
    }, [vitals]);

    if (!isOpen || !patient) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const bp = parseBloodPressure(vitals.bloodPressure);
            const payload: PatientVital = {
                ...vitals,
                systolicBp: bp.systolic,
                diastolicBp: bp.diastolic,
                news2Score: liveNEWS2.totalScore,
                news2RiskLevel: liveNEWS2.riskLevel,
                news2ClinicalAction: liveNEWS2.clinicalAction,
                recordedAt: new Date().toISOString(),
            };
            const updated = await updatePatientVitals(patient.id, payload);
            onVitalsSaved(updated);
            onClose();
        } catch (error) {
            console.error('Failed to save vitals:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5" />
                        <div>
                            <h3 className="text-sm font-bold">Clinical Triage & Vitals Observation</h3>
                            <p className="text-xs text-teal-100">
                                {patient.name} ({patient.mrn})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-teal-200 hover:text-white p-1 rounded-md transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Live NEWS2 Triage Risk Score Card */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Automated NEWS2 Early Warning Score
                            </span>
                            <span className="text-xs font-mono text-gray-500">RCP Guideline</span>
                        </div>
                        <NEWS2TriageBadge
                            score={liveNEWS2.totalScore}
                            riskLevel={liveNEWS2.riskLevel}
                            clinicalAction={liveNEWS2.clinicalAction}
                            monitoringFrequency={liveNEWS2.monitoringFrequency}
                            showDetails={true}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Blood Pressure (mmHg)
                            </label>
                            <input
                                type="text"
                                value={vitals.bloodPressure}
                                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                                placeholder="120/80"
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Heart Rate (bpm)
                            </label>
                            <input
                                type="number"
                                value={vitals.heartRate}
                                onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Temperature (°C / °F)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={vitals.temperature}
                                onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Resp. Rate (breaths/min)
                            </label>
                            <input
                                type="number"
                                value={vitals.respiratoryRate}
                                onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Oxygen Saturation (%)
                            </label>
                            <input
                                type="number"
                                value={vitals.oxygenSaturation}
                                onChange={(e) => setVitals({ ...vitals, oxygenSaturation: Number(e.target.value) })}
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Consciousness (AVPU)
                            </label>
                            <select
                                value={vitals.consciousness || 'Alert'}
                                onChange={(e) => setVitals({ ...vitals, consciousness: e.target.value as any })}
                                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                <option value="Alert">Alert (A)</option>
                                <option value="Voice">Responds to Voice (V)</option>
                                <option value="Pain">Responds to Pain (P)</option>
                                <option value="Unresponsive">Unresponsive (U)</option>
                                <option value="Confusion">New Onset Confusion (C)</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="quickOnOxygen"
                                checked={Boolean(vitals.onSupplementalOxygen)}
                                onChange={(e) => setVitals({ ...vitals, onSupplementalOxygen: e.target.checked })}
                                className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <label htmlFor="quickOnOxygen" className="text-xs font-medium text-gray-700 cursor-pointer">
                                Patient is receiving Supplemental Oxygen (O₂ Therapy)
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition flex items-center gap-1.5 ${
                                liveNEWS2.totalScore >= 7
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? 'Recording...' : liveNEWS2.totalScore >= 7 ? 'Record & Escalate Triage' : 'Record Observation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

