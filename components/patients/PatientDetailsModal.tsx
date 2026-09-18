import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
    X,
    HeartPulse,
    Activity,
    Thermometer,
    Wind,
    Droplets,
    AlertCircle,
    FileText,
    Pill,
    FlaskConical,
    Phone,
    User,
    Calendar,
    ShieldAlert,
    Building,
    CheckCircle2,
    Plus,
    Clock,
    Stethoscope,
    Edit,
    AlertTriangle,
    WifiOff,
    MessageSquare,
} from 'lucide-react';
import { Patient, PatientStatus, PatientVital } from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { updatePatientVitals, addPatientNote, addPatientPrescription, updatePatient } from '../../api/patientsApi';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import {
    calculateNEWS2,
    parseBloodPressure,
    evaluatePrescriptionSafety,
} from '../../packages/shared/clinicalDecisionSupport';
import { NEWS2TriageBadge } from './NEWS2TriageBadge';
import { PrescriptionSafetyAlerts } from './PrescriptionSafetyAlerts';
import { QuickMessageModal } from '../communication/QuickMessageModal';

interface PatientDetailsModalProps {
    patient: Patient | null;
    isOpen: boolean;
    onClose: () => void;
    onPatientUpdated: (updated: Patient) => void;
    onEditPatient: (patient: Patient) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
    patient,
    isOpen,
    onClose,
    onPatientUpdated,
    onEditPatient,
}) => {
    const { isOnline, outboxItems } = useOfflineSync();
    const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'prescriptions' | 'labs'>('overview');

    const hasPendingPatientSync = useMemo(() => {
        return Boolean(patient && outboxItems.some((i) => i.patientId === patient.id && (i.status === 'PENDING' || i.status === 'SYNCING')));
    }, [patient, outboxItems]);

    // Inline Vitals Edit State
    const [isUpdatingVitals, setIsUpdatingVitals] = useState(false);
    const [vitalForm, setVitalForm] = useState<PatientVital>({
        bloodPressure: '',
        heartRate: 72,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        recordedAt: '',
        consciousness: 'Alert',
        onSupplementalOxygen: false,
    });

    // Inline Note Form State
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteCategory, setNoteCategory] = useState<'General' | 'Consultation' | 'Nursing' | 'Discharge'>('Consultation');
    const [noteContent, setNoteContent] = useState('');
    const [noteAuthor, setNoteAuthor] = useState('Super Admin');
    const [noteRole, setNoteRole] = useState('Attending Physician');

    // Inline Prescription Form State & CDSS safety states
    const [isAddingRx, setIsAddingRx] = useState(false);
    const [rxMedication, setRxMedication] = useState('');
    const [rxDosage, setRxDosage] = useState('');
    const [rxFrequency, setRxFrequency] = useState('');
    const [rxPrescriber, setRxPrescriber] = useState('Super Admin, MD');
    const [rxOverrideReason, setRxOverrideReason] = useState('');
    const [rxAcknowledged, setRxAcknowledged] = useState(false);
    const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clinicalError, setClinicalError] = useState<string | null>(null);

    // Live NEWS2 calculation during vitals edit
    const liveNEWS2 = useMemo(() => {
        const bp = parseBloodPressure(vitalForm.bloodPressure || '120/80');
        return calculateNEWS2({
            respiratoryRate: Number(vitalForm.respiratoryRate) || 16,
            oxygenSaturation: Number(vitalForm.oxygenSaturation) || 98,
            onSupplementalOxygen: Boolean(vitalForm.onSupplementalOxygen),
            systolicBp: bp.systolic || 120,
            heartRate: Number(vitalForm.heartRate) || 72,
            temperature: Number(vitalForm.temperature) || 37.0,
            consciousness: vitalForm.consciousness || 'Alert',
        });
    }, [vitalForm]);

    // Live Drug Interaction & Allergy safety analysis
    const liveSafetyAlerts = useMemo(() => {
        if (!rxMedication.trim() || !patient) return [];
        return evaluatePrescriptionSafety(
            rxMedication,
            patient.prescriptions || [],
            patient.allergies || []
        );
    }, [rxMedication, patient]);

    const hasSevereSafetyAlerts = useMemo(() => {
        return liveSafetyAlerts.some((a) => a.requiresOverride);
    }, [liveSafetyAlerts]);

    if (!isOpen || !patient) return null;

    const startUpdateVitals = () => {
        setVitalForm({
            bloodPressure: patient.vitals?.bloodPressure || '120/80',
            heartRate: patient.vitals?.heartRate || 72,
            temperature: patient.vitals?.temperature || 98.6,
            respiratoryRate: patient.vitals?.respiratoryRate || 16,
            oxygenSaturation: patient.vitals?.oxygenSaturation || 98,
            consciousness: patient.vitals?.consciousness || 'Alert',
            onSupplementalOxygen: Boolean(patient.vitals?.onSupplementalOxygen),
            recordedAt: new Date().toISOString(),
        });
        setIsUpdatingVitals(true);
    };

    const handleSaveVitals = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setClinicalError(null);
            const bp = parseBloodPressure(vitalForm.bloodPressure || '120/80');
            const payload: PatientVital = {
                ...vitalForm,
                systolicBp: bp.systolic,
                diastolicBp: bp.diastolic,
                news2Score: liveNEWS2.totalScore,
                news2RiskLevel: liveNEWS2.riskLevel,
                news2ClinicalAction: liveNEWS2.clinicalAction,
                news2MonitoringFrequency: liveNEWS2.monitoringFrequency,
                recordedAt: new Date().toISOString(),
            };
            const updated = await updatePatientVitals(patient.id, payload);
            onPatientUpdated(updated);
            setIsUpdatingVitals(false);
        } catch (error: any) {
            console.error('Failed to update vitals:', error);
            setClinicalError(error?.response?.data?.message || 'Failed to update vitals');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim()) return;
        try {
            setIsSubmitting(true);
            const updated = await addPatientNote(patient.id, {
                author: noteAuthor,
                role: noteRole,
                category: noteCategory,
                content: noteContent,
            });
            onPatientUpdated(updated);
            setNoteContent('');
            setIsAddingNote(false);
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddPrescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rxMedication.trim() || !rxDosage.trim()) return;

        if (hasSevereSafetyAlerts) {
            if (!rxAcknowledged) {
                setClinicalError('Safety violation: You must acknowledge the contraindicated/high-risk warning to proceed.');
                return;
            }
            if (!rxOverrideReason.trim()) {
                setClinicalError('Safety violation: A mandatory Clinical Override Justification is required for this prescription.');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            setClinicalError(null);
            const updated = await addPatientPrescription(patient.id, {
                medication: rxMedication,
                dosage: rxDosage,
                frequency: rxFrequency || 'As directed',
                prescribedBy: rxPrescriber,
                startDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                clinicalOverrideReason: rxOverrideReason.trim() || undefined,
                interactionWarningAcknowledged: rxAcknowledged,
                safetyAlerts: liveSafetyAlerts.map((a) => `${a.title}: ${a.clinicalEffect}`),
            });
            onPatientUpdated(updated);
            setRxMedication('');
            setRxDosage('');
            setRxFrequency('');
            setRxOverrideReason('');
            setRxAcknowledged(false);
            setIsAddingRx(false);
        } catch (error: any) {
            console.error('Failed to add prescription:', error);
            setClinicalError(
                error?.response?.data?.message || 'Failed to order prescription due to clinical safety restriction'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleDischarge = async () => {
        try {
            setIsSubmitting(true);
            const isCurrentlyDischarged = patient.status === PatientStatus.Discharged;
            const newStatus = isCurrentlyDischarged ? PatientStatus.Admitted : PatientStatus.Discharged;
            const updated = await updatePatient(patient.id, {
                status: newStatus,
                dischargeDate: isCurrentlyDischarged ? null : new Date().toISOString(),
                roomNumber: isCurrentlyDischarged ? 'General Ward - Bed 1' : 'Discharged',
            });
            onPatientUpdated(updated);
        } catch (error) {
            console.error('Failed to toggle patient status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateAge = (dob: string) => {
        try {
            const birthDate = new Date(dob);
            const ageDiff = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDiff);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        } catch {
            return 'N/A';
        }
    };

    const formatDateSafe = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
                {/* Header Dossier */}
                <div className="bg-neutral-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-2xl border-2 border-teal-400/40 shadow-inner flex-shrink-0">
                            {patient.firstName.charAt(0)}
                            {patient.lastName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-white">{patient.name}</h2>
                                <span className="bg-gray-800 text-teal-300 font-mono text-xs px-2.5 py-0.5 rounded border border-gray-700">
                                    {patient.mrn}
                                </span>
                                <StatusBadge status={patient.status} />
                                {!isOnline && (
                                    <span className="bg-amber-500/20 text-amber-300 font-medium text-xs px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                                        <WifiOff className="w-3 h-3" /> Offline Mode
                                    </span>
                                )}
                                {hasPendingPatientSync && (
                                    <span className="bg-teal-500/20 text-teal-300 font-medium text-xs px-2 py-0.5 rounded border border-teal-500/40 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Local Updates Queued
                                    </span>
                                )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                                <span>Age: <strong>{calculateAge(patient.dateOfBirth)} yrs</strong> ({patient.dateOfBirth})</span>
                                <span>Gender: <strong>{patient.gender}</strong></span>
                                <span>Blood: <strong className="text-rose-400">{patient.bloodType}</strong></span>
                                <span className="flex items-center gap-1 text-teal-400">
                                    <Building className="h-3.5 w-3.5" />
                                    {patient.tenantName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                            onClick={() => setIsCommunicationModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 transition shadow-xs"
                            title="Dispatch direct SMS or WhatsApp message to patient"
                        >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-300" />
                            Send SMS / WhatsApp
                        </button>

                        <button
                            onClick={handleToggleDischarge}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                patient.status === PatientStatus.Discharged
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600'
                            }`}
                        >
                            {patient.status === PatientStatus.Discharged ? 'Readmit Patient' : 'Discharge Patient'}
                        </button>

                        <button
                            onClick={() => onEditPatient(patient)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition shadow-xs"
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Edit EHR
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50 px-6 gap-6 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'overview'
                                ? 'border-teal-600 text-teal-700 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Activity className="h-4 w-4" />
                        Overview & Vitals
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'notes'
                                ? 'border-teal-600 text-teal-700 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        Clinical Notes ({patient.notes?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'prescriptions'
                                ? 'border-teal-600 text-teal-700 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Pill className="h-4 w-4" />
                        Prescriptions ({patient.prescriptions?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('labs')}
                        className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'labs'
                                ? 'border-teal-600 text-teal-700 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <FlaskConical className="h-4 w-4" />
                        Lab Results ({patient.labResults?.length || 0})
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* OVERVIEW & VITALS TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Vitals Summary Strip */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <HeartPulse className="h-5 w-5 text-teal-600" />
                                            Latest Clinical Vitals
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Recorded {formatDateSafe(patient.vitals?.recordedAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={startUpdateVitals}
                                        className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-1.5 rounded-lg border border-teal-200 transition"
                                    >
                                        Log Fresh Vitals
                                    </button>
                                </div>

                                {clinicalError && (
                                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                        <span>{clinicalError}</span>
                                    </div>
                                )}

                                {/* CDSS NEWS2 Triage Risk Panel */}
                                {patient.vitals && !isUpdatingVitals && (
                                    <div className="mb-4">
                                        <NEWS2TriageBadge
                                            score={patient.vitals.news2Score ?? 0}
                                            riskLevel={patient.vitals.news2RiskLevel ?? 'Low'}
                                            clinicalAction={patient.vitals.news2ClinicalAction}
                                            monitoringFrequency={patient.vitals.news2MonitoringFrequency}
                                            showDetails={true}
                                        />
                                    </div>
                                )}

                                {isUpdatingVitals ? (
                                    <form onSubmit={handleSaveVitals} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Record Vitals & Clinical Observation</h4>
                                            <span className="text-[11px] font-mono text-gray-500">NEWS2 Protocol</span>
                                        </div>

                                        {/* Live Score Preview in Form */}
                                        <NEWS2TriageBadge
                                            score={liveNEWS2.totalScore}
                                            riskLevel={liveNEWS2.riskLevel}
                                            clinicalAction={liveNEWS2.clinicalAction}
                                            monitoringFrequency={liveNEWS2.monitoringFrequency}
                                            showDetails={true}
                                        />

                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Pressure</label>
                                                <input
                                                    type="text"
                                                    value={vitalForm.bloodPressure}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, bloodPressure: e.target.value })}
                                                    placeholder="120/80"
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Heart Rate (BPM)</label>
                                                <input
                                                    type="number"
                                                    value={vitalForm.heartRate}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, heartRate: Number(e.target.value) })}
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Temp (°C / °F)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={vitalForm.temperature}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, temperature: Number(e.target.value) })}
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Resp Rate (/min)</label>
                                                <input
                                                    type="number"
                                                    value={vitalForm.respiratoryRate}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: Number(e.target.value) })}
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">SpO2 (%)</label>
                                                <input
                                                    type="number"
                                                    value={vitalForm.oxygenSaturation}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: Number(e.target.value) })}
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">AVPU Consciousness</label>
                                                <select
                                                    value={vitalForm.consciousness || 'Alert'}
                                                    onChange={(e) => setVitalForm({ ...vitalForm, consciousness: e.target.value as any })}
                                                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                                >
                                                    <option value="Alert">Alert (A)</option>
                                                    <option value="Voice">Voice (V)</option>
                                                    <option value="Pain">Pain (P)</option>
                                                    <option value="Unresponsive">Unresponsive (U)</option>
                                                    <option value="Confusion">New Confusion (C)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-200">
                                            <input
                                                type="checkbox"
                                                id="vitalOnOxygen"
                                                checked={Boolean(vitalForm.onSupplementalOxygen)}
                                                onChange={(e) => setVitalForm({ ...vitalForm, onSupplementalOxygen: e.target.checked })}
                                                className="rounded text-teal-600 focus:ring-teal-500"
                                            />
                                            <label htmlFor="vitalOnOxygen" className="text-xs font-medium text-gray-700 cursor-pointer">
                                                Patient is on Supplemental Oxygen Therapy (O₂)
                                            </label>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsUpdatingVitals(false)}
                                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-1 text-xs bg-teal-600 text-white rounded font-medium hover:bg-teal-700 transition"
                                            >
                                                Save Vitals & Triage
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <HeartPulse className="h-3.5 w-3.5 text-rose-500 mr-1" />
                                                Blood Pressure
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.bloodPressure || 'N/A'}</div>
                                            <div className="text-[10px] text-gray-400">mmHg</div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <Activity className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                Heart Rate
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.heartRate || 'N/A'}</div>
                                            <div className="text-[10px] text-gray-400">beats / min</div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <Thermometer className="h-3.5 w-3.5 text-amber-500 mr-1" />
                                                Temperature
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.temperature || 'N/A'}°</div>
                                            <div className="text-[10px] text-gray-400">Core Body</div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <Wind className="h-3.5 w-3.5 text-blue-500 mr-1" />
                                                Resp. Rate
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.respiratoryRate || 'N/A'}</div>
                                            <div className="text-[10px] text-gray-400">breaths / min</div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <Droplets className="h-3.5 w-3.5 text-cyan-500 mr-1" />
                                                SpO2
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.oxygenSaturation || 'N/A'}%</div>
                                            <div className="text-[10px] text-gray-400">{patient.vitals?.onSupplementalOxygen ? 'On O₂' : 'Room Air'}</div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <User className="h-3.5 w-3.5 text-indigo-500 mr-1" />
                                                Consciousness
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{patient.vitals?.consciousness || 'Alert'}</div>
                                            <div className="text-[10px] text-gray-400">AVPU Scale</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Medical Flags: Allergies & Chronic Conditions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <AlertCircle className="h-4 w-4 text-rose-600" />
                                        Documented Allergies
                                    </h4>
                                    {patient.allergies && patient.allergies.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {patient.allergies.map((allergy, idx) => (
                                                <span key={idx} className="bg-rose-100 text-rose-900 border border-rose-300 text-xs px-2.5 py-1 rounded-full font-medium">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No known drug or environmental allergies reported (NKDA).</p>
                                    )}
                                </div>

                                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                                        Chronic Clinical Conditions
                                    </h4>
                                    {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {patient.chronicConditions.map((cond, idx) => (
                                                <span key={idx} className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
                                                    {cond}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No chronic pre-existing medical conditions recorded.</p>
                                    )}
                                </div>
                            </div>

                            {/* Two-Column EHR Information Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Demographics & Contact */}
                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-2 flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-teal-600" />
                                        Contact & Demographics
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Phone Number:</span>
                                            <span className="font-semibold text-gray-800">{patient.phone}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Email Address:</span>
                                            <span className="font-semibold text-gray-800">{patient.email}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Residential Address:</span>
                                            <span className="font-semibold text-gray-800 text-right max-w-[240px]">{patient.address}</span>
                                        </div>
                                        <div className="flex justify-between py-1 pt-2">
                                            <span className="text-gray-500">Emergency Contact:</span>
                                            <span className="font-semibold text-gray-800 text-right">
                                                {patient.emergencyContact?.name} ({patient.emergencyContact?.relationship}) <br />
                                                <a href={`tel:${patient.emergencyContact?.phone}`} className="text-teal-600 hover:underline inline-flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {patient.emergencyContact?.phone}
                                                </a>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Assignment & Insurance */}
                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-2 flex items-center gap-1.5">
                                        <Stethoscope className="h-4 w-4 text-teal-600" />
                                        Hospital Assignment & Coverage
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Department:</span>
                                            <span className="font-semibold text-gray-800">{patient.assignedDepartment}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Attending Physician:</span>
                                            <span className="font-semibold text-teal-700">{patient.primaryPhysician}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Room / Bed Assignment:</span>
                                            <span className="font-semibold text-gray-800">{patient.roomNumber || 'Outpatient / None'}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Admitted Date:</span>
                                            <span className="font-semibold text-gray-800">{formatDateSafe(patient.admissionDate)}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500">Insurance Carrier:</span>
                                            <span className="font-semibold text-gray-800 text-right">
                                                {patient.insuranceProvider} <br />
                                                <span className="text-[10px] text-gray-500 font-mono">Pol: {patient.insurancePolicyNumber}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-900">Clinical Consultation & Nursing Notes</h3>
                                <button
                                    onClick={() => setIsAddingNote(!isAddingNote)}
                                    className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    {isAddingNote ? 'Cancel Note' : 'Add Clinical Note'}
                                </button>
                            </div>

                            {isAddingNote && (
                                <form onSubmit={handleAddNote} className="bg-gray-50 border border-teal-200 rounded-xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">New EHR Note Entry</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                value={noteCategory}
                                                onChange={(e) => setNoteCategory(e.target.value as any)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                            >
                                                <option value="Consultation">Consultation</option>
                                                <option value="Nursing">Nursing</option>
                                                <option value="General">General</option>
                                                <option value="Discharge">Discharge</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Author Name</label>
                                            <input
                                                type="text"
                                                value={noteAuthor}
                                                onChange={(e) => setNoteAuthor(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Staff Role</label>
                                            <input
                                                type="text"
                                                value={noteRole}
                                                onChange={(e) => setNoteRole(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Assessment / Findings</label>
                                        <textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            rows={3}
                                            placeholder="Enter SOAP note findings, progress, treatment plan..."
                                            className="w-full text-xs p-2.5 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNote(false)}
                                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded font-medium transition"
                                        >
                                            Publish Note
                                        </button>
                                    </div>
                                </form>
                            )}

                            {patient.notes && patient.notes.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.notes.map((note) => (
                                        <div key={note.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                                            <div className="flex items-center justify-between border-b pb-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">{note.author}</span>
                                                    <span className="text-xs text-gray-500">({note.role})</span>
                                                    <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                                                        {note.category}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateSafe(note.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                                    No clinical notes recorded yet. Use the button above to add the first assessment.
                                </div>
                            )}
                        </div>
                    )}

                    {/* PRESCRIPTIONS TAB */}
                    {activeTab === 'prescriptions' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-900">Current & Past Medication Orders</h3>
                                <button
                                    onClick={() => setIsAddingRx(!isAddingRx)}
                                    className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    {isAddingRx ? 'Cancel Prescription' : 'Prescribe Medication'}
                                </button>
                            </div>

                            {clinicalError && activeTab === 'prescriptions' && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                    <span>{clinicalError}</span>
                                </div>
                            )}

                            {isAddingRx && (
                                <form onSubmit={handleAddPrescription} className="bg-gray-50 border border-teal-200 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">New Medication Order & CDSS Analysis</h4>
                                        <span className="text-[11px] font-mono text-gray-500">Real-Time DDI & Allergy Verification</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Medication Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Warfarin, Ciprofloxacin, Ibuprofen..."
                                                value={rxMedication}
                                                onChange={(e) => setRxMedication(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 500mg"
                                                value={rxDosage}
                                                onChange={(e) => setRxDosage(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Frequency / Regimen</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. PO Q8H with food"
                                                value={rxFrequency}
                                                onChange={(e) => setRxFrequency(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Prescribing Physician</label>
                                            <input
                                                type="text"
                                                value={rxPrescriber}
                                                onChange={(e) => setRxPrescriber(e.target.value)}
                                                className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Real-time CDSS Safety Analysis & Clinical Override */}
                                    {rxMedication.trim() && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <PrescriptionSafetyAlerts
                                                alerts={liveSafetyAlerts}
                                                overrideReason={rxOverrideReason}
                                                onOverrideReasonChange={setRxOverrideReason}
                                                acknowledged={rxAcknowledged}
                                                onAcknowledgeChange={setRxAcknowledged}
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingRx(false);
                                                setRxMedication('');
                                                setRxDosage('');
                                                setRxFrequency('');
                                                setRxOverrideReason('');
                                                setRxAcknowledged(false);
                                                setClinicalError(null);
                                            }}
                                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || (hasSevereSafetyAlerts && (!rxAcknowledged || !rxOverrideReason.trim()))}
                                            className={`px-4 py-1.5 text-xs font-medium text-white rounded transition ${
                                                hasSevereSafetyAlerts && (!rxAcknowledged || !rxOverrideReason.trim())
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : hasSevereSafetyAlerts
                                                    ? 'bg-rose-600 hover:bg-rose-700'
                                                    : 'bg-teal-600 hover:bg-teal-700'
                                            }`}
                                        >
                                            {isSubmitting
                                                ? 'Processing...'
                                                : hasSevereSafetyAlerts
                                                ? 'Sign & Override Order'
                                                : 'Confirm Medication Order'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {patient.prescriptions && patient.prescriptions.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Medication & Strength</th>
                                                <th className="px-4 py-3 text-left">Dosage & Frequency</th>
                                                <th className="px-4 py-3 text-left">Prescribed By</th>
                                                <th className="px-4 py-3 text-left">CDSS Safety Status</th>
                                                <th className="px-4 py-3 text-left">Start Date</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {patient.prescriptions.map((rx) => (
                                                <tr key={rx.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-bold text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Pill className="h-4 w-4 text-teal-600 shrink-0" />
                                                            <span>{rx.medication}</span>
                                                        </div>
                                                        {rx.clinicalOverrideReason && (
                                                            <div className="mt-1 text-[11px] font-normal text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                                                                <strong>Override Note:</strong> {rx.clinicalOverrideReason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">
                                                        <span className="font-semibold">{rx.dosage}</span> • {rx.frequency}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{rx.prescribedBy}</td>
                                                    <td className="px-4 py-3">
                                                        {rx.safetyAlerts && rx.safetyAlerts.length > 0 ? (
                                                            <div className="space-y-1">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                                                                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                                                                    Alerts Documented ({rx.safetyAlerts.length})
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                Verified Safe
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">{rx.startDate}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                                rx.status === 'Active'
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                                            }`}
                                                        >
                                                            {rx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                                    No active prescriptions ordered for this patient.
                                </div>
                            )}
                        </div>
                    )}

                    {/* LAB RESULTS TAB */}
                    {activeTab === 'labs' && (
                        <div className="space-y-6">
                            <h3 className="text-base font-bold text-gray-900">Diagnostic Laboratory & Pathology Reports</h3>

                            {patient.labResults && patient.labResults.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Test Description</th>
                                                <th className="px-4 py-3 text-left">Observed Value / Report</th>
                                                <th className="px-4 py-3 text-left">Reference Interval</th>
                                                <th className="px-4 py-3 text-left">Ordered Date</th>
                                                <th className="px-4 py-3 text-left">Flag</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {patient.labResults.map((lab) => (
                                                <tr key={lab.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                                                        <FlaskConical className="h-4 w-4 text-purple-600" />
                                                        {lab.testName}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">{lab.result}</td>
                                                    <td className="px-4 py-3 text-gray-500 font-mono">{lab.referenceRange}</td>
                                                    <td className="px-4 py-3 text-gray-500">{formatDateSafe(lab.orderedDate)}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                                lab.status === 'Normal'
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                                    : lab.status === 'Abnormal'
                                                                    ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
                                                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                                            }`}
                                                        >
                                                            {lab.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                                    No laboratory or diagnostic pathology panels on record.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Patient ID: <span className="font-mono text-gray-700">{patient.id}</span> • Registered {formatDateSafe(patient.createdAt)}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition"
                    >
                        Close Dossier
                    </button>
                </div>

                {/* Direct Omnichannel Clinical Dispatch Modal */}
                <QuickMessageModal
                    isOpen={isCommunicationModalOpen}
                    onClose={() => setIsCommunicationModalOpen(false)}
                    patientId={patient.id}
                    patientName={patient.name}
                    patientPhone={patient.phone}
                    defaultCategory="GENERAL_BROADCAST"
                    defaultPriority="NORMAL"
                />
            </div>
        </div>
    );
};
