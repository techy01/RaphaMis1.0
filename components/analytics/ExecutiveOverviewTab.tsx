import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    Bed,
    ArrowUpRight,
    TrendingUp,
    HeartPulse,
} from 'lucide-react';
import { AnalyticsDataPayload } from '../../packages/shared/types';

interface ExecutiveOverviewTabProps {
    data: AnalyticsDataPayload;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({ data }) => {
    const { revenueTrends, acuityDistribution, kpis, departmentCensus } = data;

    const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;

    // System capacity metrics
    const totalBedsOccupied = departmentCensus.reduce((acc, curr) => acc + curr.occupied, 0);
    const totalBedsCapacity = departmentCensus.reduce((acc, curr) => acc + curr.capacity, 0);
    const overallBedPct = Math.round((totalBedsOccupied / Math.max(1, totalBedsCapacity)) * 100);

    const icuDept = departmentCensus.find((d) => d.department.includes('ICU')) || departmentCensus[2];
    const erDept = departmentCensus.find((d) => d.department.includes('Emergency')) || departmentCensus[1];

    return (
        <div className="space-y-6">
            {/* Top Row: Revenue Trajectory & Acuity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Trajectory Chart (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-teal-600" />
                                <span>Revenue Trajectory & Operating Target</span>
                            </h3>
                            <p className="text-xs text-gray-500">
                                Longitudinal gross billings comparison across inpatient, outpatient, and specialized services.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
                                Gross Revenue
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                <span className="w-3 h-0.5 bg-gray-400 border border-dashed border-gray-600 inline-block" />
                                Operating Target
                            </span>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 11, fill: '#64748B' }}
                                    axisLine={{ stroke: '#E2E8F0' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={formatCurrency}
                                    tick={{ fontSize: 11, fill: '#64748B' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => [
                                        `$${Number(value).toLocaleString()}`,
                                        name === 'total' ? 'Actual Revenue' : 'Operating Target',
                                    ]}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#0D9488"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#revenueGrad)"
                                    name="total"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#94A3B8"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    fill="none"
                                    name="target"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[11px] text-gray-500 font-medium">Inpatient Share</p>
                            <p className="text-sm font-bold text-gray-800">44.0%</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[11px] text-gray-500 font-medium">Outpatient Share</p>
                            <p className="text-sm font-bold text-gray-800">28.0%</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[11px] text-gray-500 font-medium">Diagnostics & Rx</p>
                            <p className="text-sm font-bold text-gray-800">28.0%</p>
                        </div>
                    </div>
                </div>

                {/* Patient Acuity Distribution (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-rose-600" />
                            <span>Patient Acuity Distribution</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Real-time patient census categorization across clinical urgency tiers.
                        </p>

                        <div className="h-48 w-full mt-2 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={acuityDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={74}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {acuityDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any, name: any) => [`${val} patients`, name]}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-gray-900">{kpis.patientVolume.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                        {acuityDistribution.map((tier) => (
                            <div key={tier.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tier.color }}
                                    />
                                    <span className="text-gray-700 font-medium truncate max-w-[150px]">
                                        {tier.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{tier.value}</span>
                                    <span className="text-gray-400 text-[11px] w-8 text-right">
                                        {tier.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle Row: Operational Health Indicators & Hospital Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: System Bed Capacity Meter */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Bed Occupancy Pulse
                        </span>
                        <Bed className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{overallBedPct}%</span>
                        <span className="text-xs text-gray-500">
                            ({totalBedsOccupied} / {totalBedsCapacity} beds)
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                overallBedPct > 90
                                    ? 'bg-rose-500'
                                    : overallBedPct > 80
                                    ? 'bg-amber-500'
                                    : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, overallBedPct)}%` }}
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-2.5">
                        {overallBedPct > 85
                            ? 'High hospital utilization. Overflow ward protocol ready.'
                            : 'Normal operating bed reserve maintained across standard units.'}
                    </p>
                </div>

                {/* Card 2: ICU & Critical Care Load */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            ICU & Critical Saturation
                        </span>
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{icuDept.utilizationRate}%</span>
                        <span className="text-xs text-gray-500">
                            ({icuDept.occupied} / {icuDept.capacity} beds)
                        </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
                        <div
                            className="h-2.5 rounded-full bg-rose-600"
                            style={{ width: `${icuDept.utilizationRate}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2.5">
                        <span className="text-gray-500">Staff-to-Patient:</span>
                        <span className="font-semibold text-gray-800">{icuDept.staffRatio} (Dedicated)</span>
                    </div>
                </div>

                {/* Card 3: Emergency Throughput */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Emergency Throughput
                        </span>
                        <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{kpis.erAverageWaitTime} min</span>
                        <span className="text-xs text-emerald-700 font-semibold">-4 min improvement</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
                        <div className="h-2.5 rounded-full bg-teal-500" style={{ width: '62%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2.5">
                        <span className="text-gray-500">Current ER Census:</span>
                        <span className="font-semibold text-gray-800">{erDept.occupied} active patients</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Actionable Clinical Intelligence & Safety Notices */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Real-Time Clinical Telemetry & Safety Alerts</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-emerald-900">Zero Sentinel Events</h4>
                            <p className="text-xs text-emerald-800/80 mt-0.5">
                                No adverse sentinel events recorded across all active clinical departments in the last 48 hours.
                            </p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-amber-900">ICU Bed Threshold Warning</h4>
                            <p className="text-xs text-amber-800/80 mt-0.5">
                                Intensive Care occupancy is at 92.0%. High-risk transfer protocol standing by for contingency.
                            </p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 flex items-start gap-3">
                        <HeartPulse className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-blue-900">Joint Commission Ready</h4>
                            <p className="text-xs text-blue-800/80 mt-0.5">
                                Discharge medication reconciliation audit score is at 98.4%, exceeding the national threshold.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
