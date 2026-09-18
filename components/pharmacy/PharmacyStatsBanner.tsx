import React from 'react';
import {
    Clock,
    Zap,
    ShieldAlert,
    ThermometerSnowflake,
    Bot,
    CheckCircle2,
    Send,
    AlertTriangle,
} from 'lucide-react';
import { PharmacyStats } from '../../packages/shared/types';

interface PharmacyStatsBannerProps {
    stats: PharmacyStats;
}

export const PharmacyStatsBanner: React.FC<PharmacyStatsBannerProps> = ({ stats }) => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: STAT Turnaround Time */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs flex flex-col justify-between hover:border-teal-200 transition">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            STAT Turnaround Time (TAT)
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                {stats.avgStatTurnaroundMinutes}m
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                44% faster than SLA (15m)
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-medium text-gray-700">{stats.statOrdersCount} STAT in pipeline</span>
                    </div>
                    <span className="text-[11px] text-gray-400">98.2% on-time</span>
                </div>
            </div>

            {/* Card 2: Active Triage & Verification Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs flex flex-col justify-between hover:border-teal-200 transition">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Active Triage & Dispensing
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                {stats.pendingTriageCount + stats.inDispensingCount + stats.barcodePendingCount}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                                active in pipeline
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5" />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {stats.pendingTriageCount} Verification
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {stats.inDispensingCount} Robotics
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {stats.barcodePendingCount} Barcode Scan
                    </span>
                </div>
            </div>

            {/* Card 3: Clinical Safety & Interceptions */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs flex flex-col justify-between hover:border-teal-200 transition">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            CDSS Safety Interceptions
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                {stats.highAlertInterceptions}
                            </span>
                            <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                                <ShieldAlert className="w-3 h-3" />
                                0 Adverse Events
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="text-gray-700 font-medium">
                        {stats.clinicalHoldsCount > 0 ? `${stats.clinicalHoldsCount} Active Clinical Holds` : 'No Critical Holds'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">100% Intercepted</span>
                </div>
            </div>

            {/* Card 4: IoT Cold-Chain & Automation */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs flex flex-col justify-between hover:border-teal-200 transition">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            IoT Cold-Chain & Tube Dispatch
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                {stats.coldChainComplianceRate}%
                            </span>
                            <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5">
                                <ThermometerSnowflake className="w-3 h-3" />
                                2-8°C Target
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5" />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="text-gray-700 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Robotics: {stats.roboticDispensingUptimeRate}%
                    </span>
                    <span className="text-[11px] text-gray-400">Pneumatic Tube Active</span>
                </div>
            </div>
        </section>
    );
};
