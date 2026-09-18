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
    Building2,
    Award,
    Bed,
    DollarSign,
    Users,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import { AnalyticsDataPayload, FacilityBenchmark } from '../../packages/shared/types';

interface FacilityBenchmarkingTabProps {
    data: AnalyticsDataPayload;
}

export const FacilityBenchmarkingTab: React.FC<FacilityBenchmarkingTabProps> = ({ data }) => {
    const { facilityBenchmarks } = data;
    const [sortField, setSortField] = useState<keyof FacilityBenchmark>('monthlyRevenue');
    const [sortAsc, setSortAsc] = useState<boolean>(false);

    const handleSort = (field: keyof FacilityBenchmark) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const sortedFacilities = [...facilityBenchmarks].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const chartData = facilityBenchmarks.map((f) => ({
        name: f.tenantName.replace('Hospital', 'Hosp.').replace('Community Medical', 'Comm.').replace('Institute', 'Inst.'),
        fullName: f.tenantName,
        revenue: f.monthlyRevenue,
        patients: f.activePatients,
        occupancy: f.bedOccupancyRate,
    }));

    return (
        <div className="space-y-6">
            {/* Top Row: Comparative Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-teal-600" />
                            <span>Cross-Facility Operational & Financial Comparison</span>
                        </h3>
                        <p className="text-xs text-gray-500">
                            Benchmarking monthly revenues and active patient censuses across all managed health networks.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" /> Monthly Revenue ($)
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" /> Active Patients (Census)
                        </span>
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#475569' }}
                                axisLine={{ stroke: '#E2E8F0' }}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                tick={{ fontSize: 11, fill: '#0D9488' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 11, fill: '#2563EB' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const p = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1">
                                                <p className="font-bold text-gray-900">{p.fullName}</p>
                                                <p className="text-teal-700">
                                                    Monthly Revenue: <span className="font-semibold">{formatCurrency(p.revenue)}</span>
                                                </p>
                                                <p className="text-blue-700">
                                                    Active Census: <span className="font-semibold">{p.patients} patients</span>
                                                </p>
                                                <p className="text-gray-600">
                                                    Bed Occupancy: <span className="font-semibold">{p.occupancy}%</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar yAxisId="left" dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} name="Monthly Revenue" />
                            <Bar yAxisId="right" dataKey="patients" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Active Patients" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Cross-Tenant Performance Scorecard Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Multi-Hospital Comparative Benchmarking Matrix</h3>
                        <p className="text-xs text-gray-500">
                            Click column headers to sort facilities by clinical and financial throughput.
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-200 self-start sm:self-auto">
                        {facilityBenchmarks.length} Active System Nodes
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-[11px] tracking-wider border-b border-gray-200">
                            <tr>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('tenantName')}
                                >
                                    Hospital Facility {sortField === 'tenantName' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('monthlyRevenue')}
                                >
                                    Monthly Revenue {sortField === 'monthlyRevenue' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('activePatients')}
                                >
                                    Active Census {sortField === 'activePatients' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('bedOccupancyRate')}
                                >
                                    Bed Occupancy {sortField === 'bedOccupancyRate' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('avgLengthOfStay')}
                                >
                                    ALOS {sortField === 'avgLengthOfStay' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('readmissionRate')}
                                >
                                    Readmission % {sortField === 'readmissionRate' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:text-teal-700"
                                    onClick={() => handleSort('qualityScore')}
                                >
                                    Quality Score {sortField === 'qualityScore' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th className="px-4 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {sortedFacilities.map((facility) => {
                                const isStJude = facility.tenantId === 'tnt_001';
                                return (
                                    <tr key={facility.tenantId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    {facility.tenantName}
                                                    {isStJude && (
                                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                                            Flagship
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-gray-400 font-normal">
                                                    {facility.tier}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-gray-900">
                                            {formatCurrency(facility.monthlyRevenue)}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-800">
                                            <span className="font-semibold text-gray-900">{facility.activePatients}</span> pts
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${
                                                            facility.bedOccupancyRate > 85 ? 'bg-amber-500' : 'bg-teal-600'
                                                        }`}
                                                        style={{ width: `${facility.bedOccupancyRate}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-gray-900">{facility.bedOccupancyRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-700">{facility.avgLengthOfStay}d</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`font-semibold ${facility.readmissionRate > 5.5 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                {facility.readmissionRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                                                <span>★</span>
                                                <span className="text-gray-900">{facility.qualityScore}</span>
                                                <span className="text-gray-400 font-normal text-[11px]">/ 5.0</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                    facility.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : facility.status === 'Trial'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}
                                            >
                                                {facility.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Accreditations & Quality Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex items-start gap-3">
                    <Award className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-teal-950">Top System Performer: St. Jude General Hospital</h4>
                        <p className="text-xs text-teal-800/80 mt-1 leading-relaxed">
                            Achieved highest clinical throughput ($148,500 monthly) with top patient satisfaction ratings (4.9/5.0).
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-blue-950">Shortest ALOS: Mercy Children's Clinic</h4>
                        <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                            Average length of stay of 2.8 days represents industry-leading pediatric discharge management and ambulatory recovery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
