import React from 'react';
import {
    Video,
    Clock,
    Calendar,
    Activity,
    Smile,
    Radio,
    ShieldCheck,
} from 'lucide-react';
import { TelemedicineStats } from '../../packages/shared/types';

interface TelemedicineStatsCardsProps {
    stats: TelemedicineStats;
}

export const TelemedicineStatsCards: React.FC<TelemedicineStatsCardsProps> = ({ stats }) => {
    const cards = [
        {
            id: 'stat-active-consultations',
            title: 'Live Consultations',
            value: stats.activeConsultations.toString(),
            subtext: 'Encounters in progress',
            icon: <Video className="w-4 h-4 text-emerald-700" />,
            iconBg: 'bg-emerald-50 border border-emerald-100',
            indicator: 'bg-emerald-500 animate-pulse',
        },
        {
            id: 'stat-waiting-queue',
            title: 'Virtual Waiting Queue',
            value: `${stats.waitingQueue} patients`,
            subtext: 'Avg wait: 4.2 minutes',
            icon: <Clock className="w-4 h-4 text-amber-700" />,
            iconBg: 'bg-amber-50 border border-amber-100',
            indicator: stats.waitingQueue > 0 ? 'bg-amber-500' : 'bg-gray-300',
        },
        {
            id: 'stat-scheduled-today',
            title: 'Scheduled Today',
            value: stats.scheduledToday.toString(),
            subtext: 'Virtual appointments',
            icon: <Calendar className="w-4 h-4 text-blue-700" />,
            iconBg: 'bg-blue-50 border border-blue-100',
        },
        {
            id: 'stat-rpm-devices',
            title: 'Active RPM Sensors',
            value: `${stats.rpmDevicesConnected} devices`,
            subtext: 'Continuous vitals telemetry',
            icon: <Activity className="w-4 h-4 text-teal-700" />,
            iconBg: 'bg-teal-50 border border-teal-100',
        },
        {
            id: 'stat-satisfaction',
            title: 'Patient CSAT Rating',
            value: `${stats.satisfactionScore} / 5.0`,
            subtext: 'Post-consultation feedback',
            icon: <Smile className="w-4 h-4 text-purple-700" />,
            iconBg: 'bg-purple-50 border border-purple-100',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {cards.map((card) => (
                <div
                    key={card.id}
                    id={card.id}
                    className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-gray-500 tracking-tight">
                            {card.title}
                        </span>
                        <div className={`p-2 rounded-lg ${card.iconBg} shrink-0`}>
                            {card.icon}
                        </div>
                    </div>

                    <div className="mt-2.5">
                        <div className="flex items-center gap-2">
                            {card.indicator && (
                                <span className={`w-2 h-2 rounded-full ${card.indicator}`} />
                            )}
                            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                {card.value}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                            {card.subtext}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
