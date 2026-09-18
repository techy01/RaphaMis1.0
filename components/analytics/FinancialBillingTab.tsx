import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
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
    DollarSign,
    CreditCard,
    PieChart as PieIcon,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileSpreadsheet,
} from 'lucide-react';
import { AnalyticsDataPayload } from '../../packages/shared/types';

interface FinancialBillingTabProps {
    data: AnalyticsDataPayload;
}

export const FinancialBillingTab: React.FC<FinancialBillingTabProps> = ({ data }) => {
    const { revenueTrends, payerMix, kpis } = data;

    const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;
    const formatFullCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const agingReceivables = [
        { bracket: '0-30 Days (Current)', amount: 164200, percentage: 68.0, status: 'Healthy' },
        { bracket: '31-60 Days', amount: 48500, percentage: 20.1, status: 'Standard' },
        { bracket: '61-90 Days', amount: 19800, percentage: 8.2, status: 'Attention' },
        { bracket: '90+ Days (Delinquent)', amount: 8900, percentage: 3.7, status: 'Escalated' },
    ];

    return (
        <div className="space-y-6">
            {/* Top Row: Stacked Revenue by Stream & Payer Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Streams Breakdown (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-teal-600" />
                                <span>Multi-Stream Revenue Breakdown</span>
                            </h3>
                            <p className="text-xs text-gray-500">
                                Inpatient admissions, outpatient clinics, pharmacy formulary, and diagnostic labs.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                <span className="w-2.5 h-2.5 bg-[#0D9488] rounded-xs inline-block" /> Inpatient
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-xs inline-block" /> Outpatient
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                <span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-xs inline-block" /> Pharmacy
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-xs inline-block" /> Diagnostics
                            </span>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                                        name.charAt(0).toUpperCase() + name.slice(1),
                                    ]}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="inpatient" stackId="rev" fill="#0D9488" name="inpatient" />
                                <Bar dataKey="outpatient" stackId="rev" fill="#2563EB" name="outpatient" />
                                <Bar dataKey="pharmacy" stackId="rev" fill="#8B5CF6" name="pharmacy" />
                                <Bar dataKey="diagnostics" stackId="rev" fill="#F59E0B" name="diagnostics" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payer Mix Pie Chart (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-teal-600" />
                            <span>Payer Mix & Reimbursement</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Distribution of billings by insurance carrier and self-pay.
                        </p>

                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={payerMix}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={68}
                                        paddingAngle={3}
                                        dataKey="percentage"
                                    >
                                        {payerMix.map((entry) => (
                                            <Cell key={entry.payer} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => [`${val}% of gross`, 'Share']}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-2 mt-2 pt-3 border-t border-gray-100">
                        {payerMix.map((p) => (
                            <div key={p.payer} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                    <span className="text-gray-700 font-medium truncate max-w-[140px]" title={p.payer}>
                                        {p.payer}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{formatFullCurrency(p.revenue)}</span>
                                    <span className="text-gray-400 text-[11px] w-8 text-right font-medium">
                                        {p.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Revenue Cycle Metrics & Aging Receivables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Cycle Performance Metrics (6 cols) */}
                <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-teal-600" />
                        <span>Revenue Cycle Management (RCM) Key Indicators</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/60">
                            <span className="text-[11px] text-gray-500 font-medium">Clean Claim Rate</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">96.4%</span>
                                <span className="text-xs text-emerald-700 font-semibold">+2.1%</span>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-medium">Target: &gt; 95.0%</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/60">
                            <span className="text-[11px] text-gray-500 font-medium">Days in AR (DAR)</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">31.2 days</span>
                                <span className="text-xs text-emerald-700 font-semibold">-3.4d</span>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-medium">Industry Best: &lt; 35d</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/60">
                            <span className="text-[11px] text-gray-500 font-medium">First-Pass Denial Rate</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">3.6%</span>
                                <span className="text-xs text-emerald-700 font-semibold">-0.8%</span>
                            </div>
                            <span className="text-[11px] text-gray-500">Benchmark: &lt; 5.0%</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/60">
                            <span className="text-[11px] text-gray-500 font-medium">Net Collection Rate</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">98.1%</span>
                                <span className="text-xs text-emerald-700 font-semibold">+0.5%</span>
                            </div>
                            <span className="text-[11px] text-gray-500">Target: &gt; 97.0%</span>
                        </div>
                    </div>
                </div>

                {/* Aging Receivables Breakdown (6 cols) */}
                <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>Aging Accounts Receivable (AR) Breakdown</span>
                    </h3>

                    <div className="space-y-3">
                        {agingReceivables.map((ar) => (
                            <div key={ar.bracket} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                                    <span>{ar.bracket}</span>
                                    <span className="text-gray-900 font-bold">{formatFullCurrency(ar.amount)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            ar.status === 'Healthy'
                                                ? 'bg-teal-600'
                                                : ar.status === 'Standard'
                                                ? 'bg-blue-500'
                                                : ar.status === 'Attention'
                                                ? 'bg-amber-500'
                                                : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${ar.percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                                    <span>{ar.percentage}% of outstanding AR</span>
                                    <span className={`font-semibold ${ar.status === 'Healthy' ? 'text-teal-700' : ar.status === 'Escalated' ? 'text-rose-700' : 'text-gray-700'}`}>
                                        {ar.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
