import React, { useState } from 'react';
import {
    X,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    Pill,
    Building2,
    Activity,
    FileText,
    Bot,
    Send,
    Edit3,
    Check,
    Lock,
    Printer,
    PhoneCall,
    Flame,
    Zap,
} from 'lucide-react';
import {
    PharmacyOrder,
    PharmacyTriageStatus,
    PharmacyTriageUrgency,
} from '../../packages/shared/types';

interface ClinicalTriageModalProps {
    order: PharmacyOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (
        orderId: string,
        status: PharmacyTriageStatus,
        details?: {
            verifiedBy?: string;
            deliveryMethod?: PharmacyOrder['deliveryMethod'];
            tubeStationCode?: string;
            clinicalNotes?: string;
        }
    ) => Promise<void>;
    onOverrideAlert: (orderId: string, alertId: string, reason: string) => Promise<void>;
    onLogIntervention: (order: PharmacyOrder, reason: string) => void;
}

export const ClinicalTriageModal: React.FC<ClinicalTriageModalProps> = ({
    order,
    isOpen,
    onClose,
    onUpdateStatus,
    onOverrideAlert,
    onLogIntervention,
}) => {
    if (!isOpen || !order) return null;

    // Editing / Local Verification State
    const [selectedStatus, setSelectedStatus] = useState<PharmacyTriageStatus>(order.status);
    const [selectedUrgency, setSelectedUrgency] = useState<PharmacyTriageUrgency>(order.urgency);
    const [assignedDispenser, setAssignedDispenser] = useState<string>(order.assignedDispenser);
    const [deliveryMethod, setDeliveryMethod] = useState<PharmacyOrder['deliveryMethod']>(order.deliveryMethod);
    const [tubeStationCode, setTubeStationCode] = useState<string>(order.tubeStationCode || 'TUBE-ICU-08');
    const [clinicalNote, setClinicalNote] = useState<string>(order.clinicalNotes || '');
    const [isOverridingAlert, setIsOverridingAlert] = useState<string | null>(null);
    const [overrideReason, setOverrideReason] = useState<string>('');
    const [pharmacistName, setPharmacistName] = useState<string>('PharmD. Alex Chen, BCPS');
    const [isPrintingLabel, setIsPrintingLabel] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Check if any non-overridden contraindicated alert exists
    const hasUnresolvedContraindications = order.safetyAlerts.some(
        (a) => a.severity === 'Contraindicated' && !a.overridden
    );

    const handleSaveStatus = async (targetStatus: PharmacyTriageStatus) => {
        setIsSaving(true);
        try {
            await onUpdateStatus(order.id, targetStatus, {
                verifiedBy: pharmacistName,
                deliveryMethod,
                tubeStationCode: deliveryMethod === 'Pneumatic Tube' ? tubeStationCode : undefined,
                clinicalNotes: clinicalNote,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmOverride = async (alertId: string) => {
        if (!overrideReason.trim()) return;
        await onOverrideAlert(order.id, alertId, overrideReason);
        setIsOverridingAlert(null);
        setOverrideReason('');
    };

    const handlePrintLabel = () => {
        setIsPrintingLabel(true);
        setTimeout(() => setIsPrintingLabel(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
            <div className="bg-white w-full max-w-5xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="bg-gray-900 text-white p-5 px-6 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                            <Pill className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-base font-bold text-white tracking-tight">
                                    Clinical Pharmacist Verification & CDSS Workspace
                                </h2>
                                <span className="font-mono text-xs text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800 font-semibold">
                                    {order.orderNumber}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                <span>Facility: {order.patientTenantName}</span>
                                <span>•</span>
                                <span>Prescribed: {new Date(order.prescribedAt).toLocaleString()}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {order.urgency === 'STAT' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-xs animate-pulse">
                                <Flame className="w-3.5 h-3.5" />
                                STAT Priority Order
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area: Split Pane */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gray-50/50">
                    {/* LEFT PANEL: Comprehensive Patient Clinical Telemetry (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Patient Identification Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-base font-black text-gray-900">{order.patientName}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                                        <span>MRN: {order.patientMRN}</span>
                                        <span>•</span>
                                        <span>DOB / Age: {order.patientAge} yrs ({order.patientGender})</span>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                                    {order.patientLocation}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                                <div className="bg-gray-50 p-2 rounded-xl">
                                    <span className="text-gray-400 text-[10px] uppercase font-bold block">
                                        Patient Weight
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {order.patientWeightKg} kg
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-xl">
                                    <span className="text-gray-400 text-[10px] uppercase font-bold block">
                                        Clinical Diagnosis
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800 line-clamp-1" title={order.patientDiagnosis}>
                                        {order.patientDiagnosis}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Renal & Laboratory Biomarkers Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                                    Renal & Organ Clearance Telemetry
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Real-Time LIS Feed</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className={`p-3 rounded-xl border ${
                                        order.eGFR < 30
                                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                                            : order.eGFR < 60
                                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    }`}
                                >
                                    <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-75">
                                        eGFR Clearance
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-xl font-black">{order.eGFR}</span>
                                        <span className="text-[10px] font-medium">mL/min/1.73m²</span>
                                    </div>
                                    <span className="text-[10px] font-bold block mt-1">
                                        {order.eGFR < 30
                                            ? 'Severe Renal Impairment (Stage 4)'
                                            : order.eGFR < 60
                                            ? 'Moderate Renal Impairment'
                                            : 'Preserved Renal Function'}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800">
                                    <span className="text-[10px] uppercase font-extrabold tracking-wider block text-gray-400">
                                        Serum Creatinine
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-xl font-black">{order.serumCreatinine}</span>
                                        <span className="text-[10px] font-medium text-gray-500">mg/dL</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 block mt-1">
                                        Ref: 0.6 - 1.2 mg/dL
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Documented Allergies Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                Documented Adverse Drug Reactions & Allergies
                            </h4>

                            {order.patientAllergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {order.patientAllergies.map((allergy, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"
                                        >
                                            <ShieldAlert className="w-3 h-3" />
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">No known drug allergies (NKDA) recorded.</p>
                            )}
                        </div>

                        {/* Prescribing Clinician Details */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2 text-xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                Prescribing Physician Information
                            </h4>
                            <div className="space-y-1 text-gray-700">
                                <p className="font-bold text-gray-900">{order.prescriberName}</p>
                                <p className="text-gray-500">
                                    Department: {order.prescriberDepartment} · NPI: {order.prescriberNPI}
                                </p>
                                <div className="pt-2 flex items-center gap-2">
                                    <button
                                        onClick={() => onLogIntervention(order, 'Prescriber consultation initiated regarding medication verification.')}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition flex items-center gap-1.5"
                                    >
                                        <PhoneCall className="w-3 h-3" />
                                        <span>Consult Prescriber / Log SBAR</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Order Specifications & CDSS Safety Engine (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Medication Order Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                                        Electronic Medication Order
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 mt-0.5">
                                        {order.medicationName}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Generic: {order.genericName} · NDC: {order.ndc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {order.isHighAlert && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                            HIGH-ALERT
                                        </span>
                                    )}
                                    {order.isControlledSubstance && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            {order.scheduleLevel || 'C-II'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Administration Parameters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 text-xs">
                                <div className="bg-gray-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Dose</span>
                                    <span className="text-sm font-bold text-gray-900">{order.dose}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Route</span>
                                    <span className="text-sm font-bold text-gray-900">{order.route}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Frequency</span>
                                    <span className="text-xs font-bold text-gray-900">{order.frequency}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Duration</span>
                                    <span className="text-sm font-bold text-gray-900">{order.durationDays} Days</span>
                                </div>
                            </div>

                            {/* Clinical Instructions */}
                            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs text-blue-900">
                                <span className="font-bold block text-[11px] text-blue-800">
                                    Prescriber Instructions / Smart Pump Guardrails:
                                </span>
                                <p className="mt-0.5 text-blue-950 font-medium">{order.instructions}</p>
                            </div>
                        </div>

                        {/* Algorithmic CDSS Clinical Decision Support Warnings */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                                    CDSS Real-Time Safety Guardrails & Alerts
                                </h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {order.safetyAlerts.length} Flagged Check(s)
                                </span>
                            </div>

                            {order.safetyAlerts.length === 0 ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>All algorithmic safety checks passed (Allergies, DDI, Renal Clearance, Dose Range).</span>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {order.safetyAlerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                                                alert.severity === 'Contraindicated'
                                                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                                                    : alert.severity === 'Major'
                                                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                                                    : 'bg-blue-50 border-blue-200 text-blue-950'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                                            alert.severity === 'Contraindicated'
                                                                ? 'bg-rose-600 text-white'
                                                                : 'bg-amber-600 text-white'
                                                        }`}
                                                    >
                                                        {alert.severity}
                                                    </span>
                                                    <h5 className="font-bold text-xs">{alert.title}</h5>
                                                </div>

                                                {alert.overridden ? (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Overridden by {alert.overriddenBy}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsOverridingAlert(alert.id)}
                                                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 transition shadow-2xs"
                                                    >
                                                        Document Clinical Override
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-[11px] text-gray-700 leading-relaxed">
                                                {alert.description}
                                            </p>

                                            <div className="p-2 rounded-lg bg-white/80 border border-current/20 text-[11px]">
                                                <span className="font-bold">Recommendation: </span>
                                                <span>{alert.recommendation}</span>
                                            </div>

                                            {/* Inline Override Form */}
                                            {isOverridingAlert === alert.id && (
                                                <div className="pt-2 mt-2 border-t border-current/20 space-y-2 bg-white p-3 rounded-xl border border-gray-300 shadow-xs">
                                                    <h6 className="font-bold text-xs text-gray-900">
                                                        Document Pharmacist Clinical Override Rationale
                                                    </h6>
                                                    <textarea
                                                        value={overrideReason}
                                                        onChange={(e) => setOverrideReason(e.target.value)}
                                                        placeholder="State clinical justification (e.g., patient cleared by allergy consult, lab monitoring protocol in place)..."
                                                        className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        rows={2}
                                                    />
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setIsOverridingAlert(null)}
                                                            className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmOverride(alert.id)}
                                                            disabled={!overrideReason.trim()}
                                                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                                                        >
                                                            Sign & Apply Override
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dispensing Routing & Delivery Logistics */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 text-xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Bot className="w-4 h-4 text-teal-600" />
                                Automated Dispensing Routing & Delivery Logistics
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Assigned Dispenser Unit
                                    </label>
                                    <select
                                        value={assignedDispenser}
                                        onChange={(e) => setAssignedDispenser(e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
                                    >
                                        <option value="Central Cleanroom Hood IV-A">Central Cleanroom Hood IV-A</option>
                                        <option value="Automated Robot Carousel A">Automated Robot Carousel A</option>
                                        <option value="Automated Controlled Substance Vault #1">
                                            Automated Controlled Substance Vault #1 (C-II)
                                        </option>
                                        <option value="Pyxis MedStation 3000 - Unit 3 East">
                                            Pyxis MedStation 3000 - Unit 3 East
                                        </option>
                                        <option value="Hazardous Chemotherapy Compounding Hood C-3">
                                            Hazardous Chemotherapy Compounding Hood C-3
                                        </option>
                                        <option value="IoT Smart Refrigerated Pickup Locker #4">
                                            IoT Smart Refrigerated Pickup Locker #4
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Delivery Dispatch Method
                                    </label>
                                    <select
                                        value={deliveryMethod}
                                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                                        className="w-full p-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
                                    >
                                        <option value="Pneumatic Tube">Pneumatic Tube Dispatch</option>
                                        <option value="Bedside Cart Delivery">Bedside Nursing Cart Pass</option>
                                        <option value="Nurse Station Pickup">Nurse Station Window Pickup</option>
                                        <option value="Outpatient Locker">Outpatient Climate Smart Locker</option>
                                    </select>
                                </div>
                            </div>

                            {deliveryMethod === 'Pneumatic Tube' && (
                                <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-teal-900">
                                        Destination Tube Station Terminal:
                                    </span>
                                    <input
                                        type="text"
                                        value={tubeStationCode}
                                        onChange={(e) => setTubeStationCode(e.target.value)}
                                        className="w-36 text-xs font-mono font-bold px-2 py-1 bg-white border border-teal-300 rounded-lg text-teal-800 text-center"
                                        placeholder="e.g. TUBE-ICU-08"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Pharmacist Clinical Verification Note
                                </label>
                                <input
                                    type="text"
                                    value={clinicalNote}
                                    onChange={(e) => setClinicalNote(e.target.value)}
                                    placeholder="Add clinical pharmacokinetic notes or dispensing instructions..."
                                    className="w-full p-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Controls */}
                <div className="bg-white border-t border-gray-200 p-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrintLabel}
                            className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5 text-gray-500" />
                            <span>{isPrintingLabel ? 'Printing 2D Barcode...' : 'Print Dispensing Label'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSaveStatus('Clinical Hold')}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Place on Clinical Hold</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSaveStatus('In Dispensing')}
                            disabled={hasUnresolvedContraindications || isSaving}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-xs"
                            title={
                                hasUnresolvedContraindications
                                    ? 'Cannot approve: contraindicated safety alert must be overridden with documented clinical rationale first.'
                                    : 'Approve order and route to automated robotics carousel or compounding cleanroom'
                            }
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Route to Dispensing</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSaveStatus('Ready for Delivery')}
                            disabled={hasUnresolvedContraindications || isSaving}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-xs"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Verify & Ready for Delivery</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
