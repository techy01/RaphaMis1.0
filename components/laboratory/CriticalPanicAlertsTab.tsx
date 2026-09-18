import React, { useState } from 'react';
import {
    AlertTriangle,
    ShieldAlert,
    PhoneCall,
    MessageSquare,
    CheckCircle2,
    Clock,
    User,
    Check,
    X,
    Send,
    FileText,
    ExternalLink,
} from 'lucide-react';
import { CriticalPanicAlert } from '../../packages/shared/types';
import { dispatchCriticalPanicSMS, recordVerbalReadback } from '../../api/laboratoryApi';

interface CriticalPanicAlertsTabProps {
    alerts: CriticalPanicAlert[];
    onRefresh: () => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CriticalPanicAlertsTab: React.FC<CriticalPanicAlertsTabProps> = ({
    alerts,
    onRefresh,
    showToast,
}) => {
    const [selectedAlertForReadback, setSelectedAlertForReadback] = useState<CriticalPanicAlert | null>(null);
    const [physicianNameInput, setPhysicianNameInput] = useState('');
    const [actionLoggedInput, setActionLoggedInput] = useState('');
    const [isDispatching, setIsDispatching] = useState<string | null>(null);

    const handleDispatchSMS = async (alert: CriticalPanicAlert) => {
        setIsDispatching(alert.id);
        try {
            await dispatchCriticalPanicSMS(alert.id);
            showToast(
                `Urgent STAT SMS dispatched to ${alert.orderingPhysicianName} (${alert.physicianPhone}): Critical Panic ${alert.parameterName} (${alert.criticalValue} ${alert.unit}).`,
                'success'
            );
            onRefresh();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setIsDispatching(null);
        }
    };

    const handleSaveReadback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlertForReadback || !physicianNameInput.trim() || !actionLoggedInput.trim()) return;

        try {
            await recordVerbalReadback(
                selectedAlertForReadback.id,
                physicianNameInput.trim(),
                actionLoggedInput.trim()
            );
            showToast('Verbal readback logged. CAP / CLIA compliance documentation complete.', 'success');
            setSelectedAlertForReadback(null);
            setPhysicianNameInput('');
            setActionLoggedInput('');
            onRefresh();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const pendingCount = alerts.filter((a) => !a.verbalReadbackConfirmed).length;

    return (
        <div className="space-y-6">
            {/* Header Alert Banner */}
            <div className={`p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                pendingCount > 0
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-lg border ${
                            pendingCount > 0
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                            <ShieldAlert className="w-5 h-5" />
                        </span>
                        <h3 className="text-xl font-bold">Critical Panic Value Escalation Hub</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            pendingCount > 0
                                ? 'bg-rose-200 text-rose-900 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                            {pendingCount} Pending Readbacks
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl">
                        Mandated panic notification protocol (ISO 15189 / CAP). Requires verified telephone or digital verbal readback acknowledgment within 15 minutes of result validation.
                    </p>
                </div>
            </div>

            {/* Panic Cards Grid */}
            <div className="space-y-4">
                {alerts.map((alert) => {
                    const isConfirmed = alert.verbalReadbackConfirmed;
                    const isDispatchingThis = isDispatching === alert.id;

                    return (
                        <div
                            key={alert.id}
                            className={`p-5 rounded-2xl border transition-all bg-white ${
                                !isConfirmed
                                    ? 'border-rose-300 shadow-md ring-2 ring-rose-500/10'
                                    : 'border-slate-200 shadow-xs'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 font-mono">
                                            <AlertTriangle className="w-3 h-3" />
                                            {alert.flag.toUpperCase()} ({alert.criticalLimit})
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            Requisition: {alert.orderNumber} ({alert.accessionNumber})
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-3 pt-1">
                                        <h4 className="text-base font-black text-slate-900">
                                            {alert.parameterName}:
                                        </h4>
                                        <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                                            {alert.criticalValue} <span className="text-sm font-semibold text-rose-500">{alert.unit}</span>
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            for patient <strong className="text-slate-900">{alert.patientName}</strong> (MRN: {alert.patientMRN})
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                                        <span>Ordering Clinician: <strong className="text-slate-800">{alert.orderingPhysicianName}</strong></span>
                                        <span>Phone: <strong className="text-slate-800 font-mono">{alert.physicianPhone}</strong></span>
                                        <span>Result Time: {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                {/* Actions & Status */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* SMS Status */}
                                    <button
                                        onClick={() => handleDispatchSMS(alert)}
                                        disabled={isDispatchingThis || alert.smsDispatchStatus === 'DELIVERED'}
                                        className={`px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border ${
                                            alert.smsDispatchStatus === 'DELIVERED'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                                        }`}
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {alert.smsDispatchStatus === 'DELIVERED'
                                            ? 'SMS Dispatched (Phase 3)'
                                            : isDispatchingThis
                                            ? 'Sending SMS...'
                                            : 'Dispatch STAT SMS'}
                                    </button>

                                    {/* Verbal Readback Action */}
                                    {isConfirmed ? (
                                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                            <div className="flex items-center gap-1 font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Verbal Readback Acknowledged
                                            </div>
                                            <p className="text-[11px] text-emerald-700 mt-0.5">
                                                By {alert.verbalReadbackBy} at {new Date(alert.verbalReadbackAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedAlertForReadback(alert);
                                                setPhysicianNameInput(alert.orderingPhysicianName);
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-sm flex items-center gap-1.5"
                                        >
                                            <PhoneCall className="w-3.5 h-3.5" />
                                            Log Verbal Readback
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Clinical Action Display */}
                            {alert.clinicalActionLogged && (
                                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
                                    <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-slate-900 font-semibold">Immediate Clinical Intervention: </strong>
                                        {alert.clinicalActionLogged}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {alerts.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-semibold text-slate-700">All Panic Values Documented</p>
                        <p className="text-xs text-slate-400">No active or unacknowledged critical panic results in the queue.</p>
                    </div>
                )}
            </div>

            {/* Log Verbal Readback Modal */}
            {selectedAlertForReadback && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <PhoneCall className="w-5 h-5 text-rose-600" />
                                Record Verbal Panic Readback
                            </h3>
                            <button onClick={() => setSelectedAlertForReadback(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-rose-900">
                                {selectedAlertForReadback.parameterName}: {selectedAlertForReadback.criticalValue} {selectedAlertForReadback.unit}
                            </p>
                            <p className="text-rose-700">
                                Patient: {selectedAlertForReadback.patientName} (MRN: {selectedAlertForReadback.patientMRN})
                            </p>
                        </div>

                        <form onSubmit={handleSaveReadback} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Recipient Clinician Name (Verbal Readback Received By) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={physicianNameInput}
                                    onChange={(e) => setPhysicianNameInput(e.target.value)}
                                    placeholder="e.g. Dr. Sarah Lin, MD"
                                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Immediate Clinical Intervention / Action Documented *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={actionLoggedInput}
                                    onChange={(e) => setActionLoggedInput(e.target.value)}
                                    placeholder="e.g. Attending notified; ordered immediate IV calcium gluconate and stat repeating test in 2 hours."
                                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAlertForReadback(null)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-sm"
                                >
                                    Confirm Readback & Certify
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
