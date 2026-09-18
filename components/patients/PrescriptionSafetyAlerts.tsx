import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ClinicalSafetyAlert } from '../../packages/shared/clinicalDecisionSupport';

interface PrescriptionSafetyAlertsProps {
    alerts: ClinicalSafetyAlert[];
    overrideReason: string;
    onOverrideReasonChange: (val: string) => void;
    acknowledged: boolean;
    onAcknowledgeChange: (val: boolean) => void;
}

export const PrescriptionSafetyAlerts: React.FC<PrescriptionSafetyAlertsProps> = ({
    alerts,
    overrideReason,
    onOverrideReasonChange,
    acknowledged,
    onAcknowledgeChange,
}) => {
    if (alerts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>CDSS Verified:</strong> No high-risk drug-drug interactions or allergy conflicts detected for this patient.</span>
            </div>
        );
    }

    const hasSevere = alerts.some((a) => a.requiresOverride);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                    <strong>Clinical Safety Warning:</strong> {alerts.length} safety alert{alerts.length > 1 ? 's' : ''} detected. Review before prescribing.
                </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {alerts.map((alert, idx) => {
                    const isSevere = alert.severity === 'contraindicated' || alert.severity === 'fatal_anaphylaxis_risk';
                    const isMajor = alert.severity === 'major' || alert.severity === 'severe_reaction';

                    const borderClass = isSevere
                        ? 'border-rose-400 bg-rose-50/70 text-rose-950'
                        : isMajor
                        ? 'border-orange-400 bg-orange-50/70 text-orange-950'
                        : 'border-yellow-300 bg-yellow-50/70 text-yellow-950';

                    const Icon = isSevere ? AlertOctagon : AlertTriangle;

                    return (
                        <div key={idx} className={`p-3 rounded-lg border ${borderClass} text-xs space-y-1`}>
                            <div className="flex items-center justify-between font-bold">
                                <div className="flex items-center gap-1.5">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{alert.title}</span>
                                </div>
                                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/80 border border-current">
                                    {alert.severity.replace('_', ' ')}
                                </span>
                            </div>

                            <p className="text-gray-800 leading-normal">
                                <span className="font-semibold text-gray-950">Conflict: </span>
                                {alert.offendingItem} &harr; {alert.conflictingWith}
                            </p>

                            <p className="text-gray-700 leading-normal">
                                <span className="font-semibold text-gray-950">Adverse Risk: </span>
                                {alert.clinicalEffect}
                            </p>

                            <p className="text-gray-800 bg-white/80 p-1.5 rounded border border-black/5 font-mono text-[11px]">
                                <strong>Recommendation:</strong> {alert.recommendation}
                            </p>
                        </div>
                    );
                })}
            </div>

            {hasSevere && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs space-y-2.5">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => onAcknowledgeChange(e.target.checked)}
                            className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-medium text-rose-900 leading-tight">
                            I have evaluated the clinical risks above and confirm that patient necessity justifies this medication.
                        </span>
                    </label>

                    <div>
                        <label className="block text-[11px] font-bold text-rose-950 mb-1">
                            Clinical Override Justification <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                            value={overrideReason}
                            onChange={(e) => onOverrideReasonChange(e.target.value)}
                            placeholder="State therapeutic indication, risk mitigation plan, or monitored dosing justification..."
                            className="w-full text-xs p-2 rounded border border-rose-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            rows={2}
                            required
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
