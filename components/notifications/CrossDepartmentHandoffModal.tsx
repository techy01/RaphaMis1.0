import React, { useState } from 'react';
import { useDepartmentNotifications } from '../../contexts/DepartmentNotificationContext';
import {
    HospitalDepartment,
    NotificationPriority,
    NotificationCategory,
} from '../../packages/shared/types';
import { initialPatients } from '../../api/mockPatientData';
import {
    Send,
    X,
    AlertTriangle,
    ArrowRight,
    Stethoscope,
    FlaskConical,
    Pill,
    DollarSign,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';

export const CrossDepartmentHandoffModal: React.FC = () => {
    const { isHandoffModalOpen, closeHandoffModal, dispatchHandoff } = useDepartmentNotifications();

    const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0]?.id || 'pat_001');
    const [sourceDept, setSourceDept] = useState<HospitalDepartment>('Triage');
    const [targetDept, setTargetDept] = useState<HospitalDepartment>('Consultation / OPD');
    const [priority, setPriority] = useState<NotificationPriority>('URGENT');
    const [category, setCategory] = useState<NotificationCategory>('TRIAGE_ESCALATION');
    const [title, setTitle] = useState('Patient Vitals Evaluated: Escalated to Medical Officer');
    const [notes, setNotes] = useState(
        'Triage triage complete: ESI-3. Patient presents with high fever, dehydration, and productive cough. Handing over to General Medical Consultation Queue.'
    );
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isHandoffModalOpen) return null;

    const patient = initialPatients.find((p) => p.id === selectedPatientId) || initialPatients[0];

    const departments: HospitalDepartment[] = [
        'Reception',
        'Triage',
        'Consultation / OPD',
        'Inpatient Ward',
        'Laboratory',
        'Radiology',
        'Pharmacy',
        'Billing / Cashier',
        'Security / Gatepass',
    ];

    const handleCategoryChange = (cat: NotificationCategory) => {
        setCategory(cat);
        switch (cat) {
            case 'TRIAGE_ESCALATION':
                setSourceDept('Triage');
                setTargetDept('Consultation / OPD');
                setPriority('CRITICAL_STAT');
                setTitle(`Emergency Triage: ESI Level 2 Escalation`);
                setNotes(`Patient ${patient.name} (${patient.mrn}) exhibits unstable vital signs. Immediate physician bedside evaluation requested.`);
                break;
            case 'ORDER_TRANSMITTED':
                setSourceDept('Consultation / OPD');
                setTargetDept('Laboratory');
                setPriority('URGENT');
                setTitle(`STAT Laboratory Requisition Transmitted`);
                setNotes(`Urgent Full Blood Count, Electrolytes, and Blood Cultures ordered for ${patient.name}. Phlebotomist alert dispatched.`);
                break;
            case 'PANIC_VALUE_ALERT':
                setSourceDept('Laboratory');
                setTargetDept('Inpatient Ward');
                setPriority('CRITICAL_STAT');
                setTitle(`CRITICAL PANIC VALUE ALERT: Lab Findings`);
                setNotes(`Critical panic value flagged for ${patient.name}. Direct verbal provider readback protocol initiated.`);
                break;
            case 'DISPENSE_COMPLETED':
                setSourceDept('Pharmacy');
                setTargetDept('Billing / Cashier');
                setPriority('ROUTINE');
                setTitle(`Pharmacy Dispense Complete: Charges Posted to Folio`);
                setNotes(`Inpatient medications dispensed and verified by barcode. Bill charges dispatched to central cashier ledger.`);
                break;
            case 'DISCHARGE_REQUESTED':
                setSourceDept('Inpatient Ward');
                setTargetDept('Billing / Cashier');
                setPriority('DISCHARGE_CLEARANCE');
                setTitle(`Clinical Discharge Order Placed: Final Bill Audit Required`);
                setNotes(`Attending physician signed clinical release for ${patient.name}. Please audit bed days, pharmacy, and finalize insurance clearance.`);
                break;
            case 'GATEPASS_ISSUED':
                setSourceDept('Billing / Cashier');
                setTargetDept('Security / Gatepass');
                setPriority('DISCHARGE_CLEARANCE');
                setTitle(`Official Discharge Security Gatepass Issued`);
                setNotes(`Patient folio settled in full. Security gatepass authorized for discharge.`);
                break;
            case 'GATE_CLEARED':
                setSourceDept('Security / Gatepass');
                setTargetDept('Reception');
                setPriority('ROUTINE');
                setTitle(`Security Gate Clearance: Patient Exited Facility`);
                setNotes(`Gatepass scanned at North Perimeter Gate. Patient escorted off hospital grounds.`);
                break;
            default:
                break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        dispatchHandoff({
            sourceDepartment: sourceDept,
            targetDepartment: targetDept,
            patientId: patient.id,
            patientName: patient.name,
            patientMrn: patient.mrn,
            priority,
            category,
            title,
            message: notes,
            actionUrl:
                targetDept === 'Laboratory'
                    ? '/laboratory'
                    : targetDept === 'Pharmacy'
                    ? '/pharmacy'
                    : targetDept === 'Billing / Cashier'
                    ? '/billing'
                    : targetDept === 'Security / Gatepass'
                    ? '/billing'
                    : '/patients',
            actionLabel: `Open ${targetDept}`,
            metadata: {
                wardBed: patient.roomNumber,
            },
        });

        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            closeHandoffModal();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-teal-500/20 border border-teal-400/30 text-teal-400">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Inter-Department Record Handoff</h3>
                            <p className="text-xs text-slate-300">
                                Transmit clinical data, orders, panic values, or discharge clearances across hospital stations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeHandoffModal}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                    {/* Patient Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Select Patient / Medical Record (MRN)
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            {initialPatients.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.mrn} ({p.assignedDepartment || 'General'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Preset Transmission Categories */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Standard Handoff Workflow Presets
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {[
                                { id: 'TRIAGE_ESCALATION', label: 'Triage → Doctor' },
                                { id: 'ORDER_TRANSMITTED', label: 'Doctor → Lab/RIS' },
                                { id: 'PANIC_VALUE_ALERT', label: 'Lab → Panic Alert' },
                                { id: 'DISPENSE_COMPLETED', label: 'Pharmacy → Billing' },
                                { id: 'DISCHARGE_REQUESTED', label: 'Ward → Cashier Audit' },
                                { id: 'GATEPASS_ISSUED', label: 'Billing → Gatepass' },
                            ].map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(preset.id as NotificationCategory)}
                                    className={`px-2.5 py-2 rounded-lg border text-left font-semibold transition-all ${
                                        category === preset.id
                                            ? 'border-primary bg-primary/5 text-primary shadow-xs'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Source & Target Departments */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                                Transmitting Station
                            </label>
                            <select
                                value={sourceDept}
                                onChange={(e) => setSourceDept(e.target.value as HospitalDepartment)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                            >
                                {departments.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                                Receiving Department
                            </label>
                            <select
                                value={targetDept}
                                onChange={(e) => setTargetDept(e.target.value as HospitalDepartment)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                            >
                                {departments.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Urgency & Priority */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Clinical Priority / SLA
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'CRITICAL_STAT', label: 'STAT / ESI 1-2', color: 'border-red-400 text-red-700 bg-red-50' },
                                { id: 'URGENT', label: 'Urgent (<30m)', color: 'border-amber-400 text-amber-800 bg-amber-50' },
                                { id: 'ROUTINE', label: 'Routine Flow', color: 'border-blue-400 text-blue-700 bg-blue-50' },
                                { id: 'DISCHARGE_CLEARANCE', label: 'Discharge Pass', color: 'border-emerald-400 text-emerald-800 bg-emerald-50' },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPriority(p.id as NotificationPriority)}
                                    className={`py-2 px-2 text-center rounded-lg border font-bold text-[11px] transition-all ${
                                        priority === p.id ? `${p.color} ring-2 ring-offset-1` : 'border-slate-200 text-slate-600 bg-white'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alert Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Transmission Subject / Header
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    {/* Clinical Details / Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Clinical Notes / Handoff Payload / Orders
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Enter clinical handover notes, test orders, panic values, or discharge authorization..."
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={closeHandoffModal}
                            className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSuccess}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-all"
                        >
                            {isSuccess ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    <span>Handoff Dispatched!</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Transmit to {targetDept}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
