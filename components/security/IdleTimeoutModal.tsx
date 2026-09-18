import React from 'react';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

interface IdleTimeoutModalProps {
    isOpen: boolean;
    remainingSeconds: number;
    onExtendSession: () => void;
    onLogout: () => void;
    userEmail?: string;
}

export const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({
    isOpen,
    remainingSeconds,
    onExtendSession,
    onLogout,
    userEmail,
}) => {
    if (!isOpen) return null;

    const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / 60) * 100));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="idle-modal-title"
            >
                {/* Visual Header */}
                <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-600 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 id="idle-modal-title" className="text-sm font-bold tracking-tight">
                                Inactivity Security Warning
                            </h2>
                            <p className="text-[11px] text-amber-100">
                                Automatic Logoff Mandate (HIPAA § 164.312)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-600/80 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-100" />
                        <span>{remainingSeconds}s</span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>Time remaining before auto-logout</span>
                            <span className="font-bold text-amber-700">{remainingSeconds} seconds</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${
                                    remainingSeconds <= 15 ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <p className="font-semibold text-slate-800">
                            Your clinical session has been idle for nearly 15 minutes.
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Under the Global Data Privacy Regulations (e.g., GDPR) and healthcare confidentiality standards, clinical sessions with unmonitored screens are automatically closed to prevent unauthorized viewing of patient health information.
                        </p>
                        {userEmail && (
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                                Active session account: <strong className="text-slate-600">{userEmail}</strong>
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onExtendSession}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>I'm Still Here (Extend Session)</span>
                        </button>

                        <button
                            type="button"
                            onClick={onLogout}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
