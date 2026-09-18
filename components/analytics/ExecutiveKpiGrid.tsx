import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Bed,
    Clock,
    HeartPulse,
    ShieldCheck,
    CheckCircle2,
    Smile,
} from 'lucide-react';
import { AnalyticsKpiSummary } from '../../packages/shared/types';

interface ExecutiveKpiGridProps {
    kpis: AnalyticsKpiSummary;
}

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = ({ kpis }) => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const cards = [
        {
            id: 'kpi-revenue',
            title: 'Platform Gross Revenue',
            value: formatCurrency(kpis.totalRevenue),
            change: `${kpis.revenueChange > 0 ? '+' : ''}${kpis.revenueChange}%`,
            changeType: kpis.revenueChange >= 0 ? 'positive' : 'negative',
            benchmark: 'Target attainment 104.2%',
            icon: <DollarSign className="w-4 h-4 text-teal-700" />,
            iconBg: 'bg-teal-50 border border-teal-100',
        },
        {
            id: 'kpi-volume',
            title: 'Patient Volume / Census',
            value: kpis.patientVolume.toLocaleString(),
            change: `${kpis.patientVolumeChange > 0 ? '+' : ''}${kpis.patientVolumeChange}%`,
            changeType: 'positive',
            benchmark: 'Throughput capacity optimal',
            icon: <Users className="w-4 h-4 text-blue-700" />,
            iconBg: 'bg-blue-50 border border-blue-100',
        },
        {
            id: 'kpi-occupancy',
            title: 'Bed Occupancy Rate',
            value: `${kpis.bedOccupancyRate}%`,
            change: `${kpis.occupancyChange > 0 ? '+' : ''}${kpis.occupancyChange}%`,
            changeType: kpis.bedOccupancyRate > 90 ? 'negative' : 'positive',
            benchmark: kpis.bedOccupancyRate > 85 ? 'High Bed Utilization' : 'Optimal Capacity (75-85%)',
            icon: <Bed className="w-4 h-4 text-indigo-700" />,
            iconBg: 'bg-indigo-50 border border-indigo-100',
        },
        {
            id: 'kpi-alos',
            title: 'Avg. Length of Stay (ALOS)',
            value: `${kpis.avgLengthOfStay} days`,
            change: `${kpis.alosChange}d`,
            changeType: kpis.alosChange <= 0 ? 'positive' : 'negative',
            benchmark: 'Target: < 4.8 days',
            icon: <Clock className="w-4 h-4 text-purple-700" />,
            iconBg: 'bg-purple-50 border border-purple-100',
        },
        {
            id: 'kpi-readmission',
            title: '30-Day Readmission Rate',
            value: `${kpis.readmissionRate30d}%`,
            change: `${kpis.readmissionChange}%`,
            changeType: kpis.readmissionChange <= 0 ? 'positive' : 'negative',
            benchmark: 'National CMS avg: 7.2%',
            icon: <HeartPulse className="w-4 h-4 text-emerald-700" />,
            iconBg: 'bg-emerald-50 border border-emerald-100',
        },
        {
            id: 'kpi-er-wait',
            title: 'ER Door-to-Doctor Time',
            value: `${kpis.erAverageWaitTime} min`,
            change: `${kpis.waitChange} min`,
            changeType: kpis.waitChange <= 0 ? 'positive' : 'negative',
            benchmark: 'Quality benchmark: < 30 min',
            icon: <Clock className="w-4 h-4 text-amber-700" />,
            iconBg: 'bg-amber-50 border border-amber-100',
        },
        {
            id: 'kpi-claim-rate',
            title: 'Clean Claim Rate',
            value: `${kpis.cleanClaimRate}%`,
            change: `+${kpis.claimRateChange}%`,
            changeType: 'positive',
            benchmark: 'First-pass acceptance high',
            icon: <ShieldCheck className="w-4 h-4 text-cyan-700" />,
            iconBg: 'bg-cyan-50 border border-cyan-100',
        },
        {
            id: 'kpi-satisfaction',
            title: 'Patient CSAT Rating',
            value: `${kpis.patientSatisfaction} / 5.0`,
            change: `+${kpis.csatChange}`,
            changeType: 'positive',
            benchmark: 'Top decile national rating',
            icon: <Smile className="w-4 h-4 text-pink-700" />,
            iconBg: 'bg-pink-50 border border-pink-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const isPositive = card.changeType === 'positive';
                return (
                    <div
                        key={card.id}
                        id={card.id}
                        className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-500 tracking-tight">
                                {card.title}
                            </span>
                            <div className={`p-2 rounded-lg ${card.iconBg} shrink-0`}>
                                {card.icon}
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                {card.value}
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs">
                                <div
                                    className={`flex items-center gap-1 font-semibold ${
                                        isPositive ? 'text-emerald-700' : 'text-rose-700'
                                    }`}
                                >
                                    {isPositive ? (
                                        <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5" />
                                    )}
                                    <span>{card.change}</span>
                                    <span className="text-gray-400 font-normal">vs prev</span>
                                </div>

                                <span className="text-[11px] text-gray-400 font-medium truncate max-w-[120px]" title={card.benchmark}>
                                    {card.benchmark}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
