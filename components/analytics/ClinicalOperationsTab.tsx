import React, { useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import {
    Stethoscope,
    ShieldCheck,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Activity,
    Filter,
} from 'lucide-react';
import { AnalyticsDataPayload, DepartmentCensus } from '../../packages/shared/types';

interface ClinicalOperationsTabProps {
    data: AnalyticsDataPayload;
}

export const ClinicalOperationsTab: React.FC<ClinicalOperationsTabProps> = ({ data }) => {
    const { departmentCensus, clinicalQuality } = data;
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', 'Safety', 'Efficiency', 'Care Quality', 'Compliance'];

    const filteredQuality =
        selectedCategory === 'All'
            ? clinicalQuality
            : clinicalQuality.filter((q) => q.category === selectedCategory);

    // Prepare data for bar chart
    const chartData = departmentCensus.map((d) => ({
        name: d.department.length > 14 ? d.department.substring(0, 12) + '...' : d.department,
        fullName: d.department,
        occupied: d.occupied,
        available: Math.max(0, d.capacity - d.occupied),
        capacity: d.capacity,
        utilizationRate: d.utilizationRate,
        avgWaitMinutes: d.avgWaitMinutes,
    }));

    return (
        <div className="space-y-6">
            {/* Department Bed Census & Capacity Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>Departmental Bed Census & Capacity Utilization</span>
                        </h3>
                        <p className="text-xs text-gray-500">
                            Occupied inpatient beds versus available capacity across clinical care units.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" />
                            Occupied Beds
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-3 h-3 rounded-xs bg-gray-200 inline-block" />
                            Available Reserve
                        </span>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#475569' }}
                                interval={0}
                                angle={-20}
                                textAnchor="end"
                                height={45}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748B' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1">
                                                <p className="font-bold text-gray-900">{item.fullName}</p>
                                                <p className="text-teal-700">
                                                    Occupied: <span className="font-semibold">{item.occupied} beds</span>
                                                </p>
                                                <p className="text-gray-500">
                                                    Available: <span className="font-semibold">{item.available} beds</span>
                                                </p>
                                                <p className="text-gray-700">
                                                    Utilization: <span className="font-semibold">{item.utilizationRate}%</span>
                                                </p>
                                                <p className="text-gray-700">
                                                    Avg Wait: <span className="font-semibold">{item.avgWaitMinutes} min</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="occupied" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="available" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Departmental Census Roster</h3>
                        <p className="text-xs text-gray-500">Live operational status, bed occupancy, and nursing coverage.</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {departmentCensus.length} Units Monitored
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-[11px] tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Department Name</th>
                                <th className="px-4 py-3">Beds (Occupied / Total)</th>
                                <th className="px-4 py-3">Utilization %</th>
                                <th className="px-4 py-3">Avg. Wait Time</th>
                                <th className="px-4 py-3">Staffing Ratio</th>
                                <th className="px-4 py-3 text-right">Unit Acuity Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {departmentCensus.map((dept) => {
                                const statusColor =
                                    dept.status === 'Critical'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : dept.status === 'Near Capacity'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                                return (
                                    <tr key={dept.department} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-teal-600" />
                                            {dept.department}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            <span className="font-semibold text-gray-900">{dept.occupied}</span> / {dept.capacity} beds
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${
                                                            dept.utilizationRate > 90
                                                                ? 'bg-rose-600'
                                                                : dept.utilizationRate > 80
                                                                ? 'bg-amber-500'
                                                                : 'bg-teal-600'
                                                        }`}
                                                        style={{ width: `${Math.min(100, dept.utilizationRate)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-gray-900">{dept.utilizationRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{dept.avgWaitMinutes} mins</td>
                                        <td className="px-4 py-3 text-gray-700">{dept.staffRatio}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColor}`}>
                                                {dept.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Clinical Quality & Safety Scorecard */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            <span>Clinical Quality & Patient Safety Scorecard</span>
                        </h3>
                        <p className="text-xs text-gray-500">
                            Validated healthcare metrics aligned with CMS, Joint Commission, and WHO standards.
                        </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 hidden sm:inline-block" />
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                    selectedCategory === cat
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuality.map((metric) => {
                        const isOptimal = metric.status === 'optimal';
                        const isWarning = metric.status === 'warning';

                        return (
                            <div
                                key={metric.id}
                                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-xs transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                                            {metric.category}
                                        </span>
                                        {isOptimal ? (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                <CheckCircle className="w-3 h-3" /> Target Met
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                <AlertCircle className="w-3 h-3" /> Review
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-bold text-gray-900 mt-2.5">{metric.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{metric.description}</p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-200/80">
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-extrabold text-gray-900">
                                                {metric.currentValue}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">{metric.unit}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Target: <span className="font-semibold text-gray-800">{metric.targetValue}</span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1 font-medium italic">
                                        {metric.benchmark}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
