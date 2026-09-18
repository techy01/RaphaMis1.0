import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartmentNotifications } from '../../contexts/DepartmentNotificationContext';
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    FileText,
    ArrowRight,
    X,
    ShieldCheck,
    FlaskConical,
    Pill,
    Stethoscope,
    DollarSign,
} from 'lucide-react';
import { HospitalDepartment } from '../../packages/shared/types';

export const DepartmentNotificationToast: React.FC = () => {
    const { activeToast, dismissToast, markAsRead } = useDepartmentNotifications();
    const navigate = useNavigate();

    if (!activeToast) return null;

    const getDeptIcon = (dept: HospitalDepartment) => {
        switch (dept) {
            case 'Triage':
            case 'Reception':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'Consultation / OPD':
            case 'Inpatient Ward':
                return <Stethoscope className="w-4 h-4 text-blue-500" />;
            case 'Laboratory':
                return <FlaskConical className="w-4 h-4 text-purple-500" />;
            case 'Pharmacy':
                return <Pill className="w-4 h-4 text-emerald-500" />;
            case 'Billing / Cashier':
                return <DollarSign className="w-4 h-4 text-teal-500" />;
            case 'Security / Gatepass':
                return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
            default:
                return <Bell className="w-4 h-4 text-slate-500" />;
        }
    };

    const isCritical = activeToast.priority === 'CRITICAL_STAT';

    const handleAction = () => {
        markAsRead(activeToast.id);
        dismissToast();
        if (activeToast.actionUrl) {
            navigate(activeToast.actionUrl);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
            <div
                className={`rounded-xl border p-4 bg-white ${
                    isCritical
                        ? 'border-red-500 ring-2 ring-red-400/30'
                        : 'border-slate-200 ring-1 ring-slate-900/5'
                }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg ${
                                isCritical ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {getDeptIcon(activeToast.targetDepartment)}
                        </span>
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                <span className="text-slate-600">{activeToast.sourceDepartment}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-primary font-bold">{activeToast.targetDepartment}</span>
                            </div>
                            <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase ${
                                    isCritical
                                        ? 'bg-red-100 text-red-700'
                                        : activeToast.priority === 'URGENT'
                                        ? 'bg-amber-100 text-amber-800'
                                        : activeToast.priority === 'DISCHARGE_CLEARANCE'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {activeToast.priority.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={dismissToast}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-2.5">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{activeToast.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeToast.message}</p>
                </div>

                {activeToast.patientName && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-slate-500 font-medium">
                            <span>Patient: </span>
                            <span className="font-bold text-slate-900">{activeToast.patientName}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({activeToast.patientMrn})</span>
                        </div>

                        {activeToast.actionUrl && (
                            <button
                                onClick={handleAction}
                                className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded"
                            >
                                <span>{activeToast.actionLabel || 'Open Record'}</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
