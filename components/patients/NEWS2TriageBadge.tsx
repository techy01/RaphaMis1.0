import React from 'react';
import { AlertTriangle, ShieldCheck, Activity, AlertCircle } from 'lucide-react';
import { NEWS2RiskLevel } from '../../packages/shared/clinicalDecisionSupport';

interface NEWS2TriageBadgeProps {
    score?: number;
    riskLevel?: NEWS2RiskLevel;
    clinicalAction?: string;
    monitoringFrequency?: string;
    showDetails?: boolean;
    compact?: boolean;
}

export const NEWS2TriageBadge: React.FC<NEWS2TriageBadgeProps> = ({
    score = 0,
    riskLevel = 'Low',
    clinicalAction,
    monitoringFrequency,
    showDetails = false,
    compact = false,
}) => {
    const getBadgeConfig = () => {
        if (score >= 7 || riskLevel === 'High') {
            return {
                bg: 'bg-rose-50 text-rose-800 border-rose-200',
                pill: 'bg-rose-600 text-white',
                border: 'border-rose-300',
                icon: AlertTriangle,
                label: 'High Clinical Risk',
                urgency: 'Emergency Medical Team Escalation',
            };
        }
        if (score >= 5 || riskLevel === 'Medium') {
            return {
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                pill: 'bg-amber-600 text-white',
                border: 'border-amber-300',
                icon: AlertCircle,
                label: 'Medium Clinical Risk',
                urgency: 'Urgent Physician Review (< 1h)',
            };
        }
        if (riskLevel === 'Low-Medium') {
            return {
                bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                pill: 'bg-yellow-600 text-white',
                border: 'border-yellow-300',
                icon: AlertCircle,
                label: 'Low-Medium Risk',
                urgency: 'Urgent Ward Review (Param = 3)',
            };
        }
        return {
            bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            pill: 'bg-emerald-600 text-white',
            border: 'border-emerald-300',
            icon: ShieldCheck,
            label: 'Low Clinical Risk',
            urgency: 'Routine Ward Monitoring',
        };
    };

    const config = getBadgeConfig();
    const Icon = config.icon;

    if (compact) {
        return (
            <div
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg}`}
                title={`NEWS2 Score: ${score} - ${config.label}. Action: ${clinicalAction || config.urgency}`}
            >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[9px] ${config.pill}`}>
                    {score}
                </span>
                <span>{config.label.replace(' Clinical', '')}</span>
            </div>
        );
    }

    if (!showDetails) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${config.pill}`}>
                    {score}
                </span>
                <span>NEWS2: {config.label}</span>
            </div>
        );
    }

    return (
        <div className={`p-3 rounded-lg border ${config.bg} space-y-1.5`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold">NEWS2 Score: {score} &bull; {config.label}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 border border-current">
                    {config.urgency}
                </span>
            </div>
            {clinicalAction && (
                <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="font-semibold text-gray-900">Protocol:</strong> {clinicalAction}
                </p>
            )}
            {monitoringFrequency && (
                <p className="text-xs text-gray-600">
                    <strong className="font-semibold text-gray-800">Frequency:</strong> {monitoringFrequency}
                </p>
            )}
        </div>
    );
};
