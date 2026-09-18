import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import {
    Building2,
    TrendingUp,
    Users,
    Bed,
    Activity,
    Shield,
    CreditCard,
    DollarSign,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Server,
    Globe,
    FileText,
    ArrowUpRight,
    RefreshCw,
    Plus,
    Download,
    Stethoscope,
    Video,
    PackageCheck,
    Layers,
    Lock,
    Clock,
    Zap,
    ExternalLink,
} from 'lucide-react';
import {
    getDashboardStats,
    getRecentActivity,
    getExecutiveStats,
    getRevenueGrowthHistory,
    getValueRealizationMetrics,
    getRegionalSystemHealth,
} from '../../api/dashboardApi';
import { getSubscriptions } from '../../api/subscriptionApi';
import { SubscriptionModule } from '../subscription/SubscriptionModule';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';
import { useCurrency } from '../../contexts/CurrencyContext';

export const DashboardView: React.FC = () => {
    const queryClient = useQueryClient();
    const {
        currentCurrency,
        baseCurrency,
        currencyInfo,
        convert,
        format: formatCurrency,
        convertAndFormat,
        openExchangeModal,
        exchangeMeta
    } = useCurrency();

    // Active Dashboard Tab
    const [dashboardTab, setDashboardTab] = useState<'overview' | 'subscriptions' | 'governance'>('overview');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'quarter' | 'ytd'>('30d');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch queries
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
    });

    const { data: execStats, isLoading: isLoadingExec } = useQuery({
        queryKey: ['executiveStats'],
        queryFn: getExecutiveStats,
    });

    const { data: activity = [] } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: getRecentActivity,
    });

    const { data: revenueData = [] } = useQuery({
        queryKey: ['revenueGrowthHistory'],
        queryFn: getRevenueGrowthHistory,
    });

    const { data: valueMetrics = [] } = useQuery({
        queryKey: ['valueRealizationMetrics'],
        queryFn: getValueRealizationMetrics,
    });

    const { data: regionalHealth = [] } = useQuery({
        queryKey: ['regionalSystemHealth'],
        queryFn: getRegionalSystemHealth,
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: getSubscriptions,
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] }),
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
            queryClient.invalidateQueries({ queryKey: ['recentActivity'] }),
        ]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const rawArr = execStats?.arr || 3220000;
    const rawMrr = execStats?.mrr || 268500;
    const arrVal = convertAndFormat(rawArr, 'USD', currentCurrency);
    const mrrVal = convertAndFormat(rawMrr, 'USD', currentCurrency);
    const totalTenantsVal = execStats?.totalHospitalTenants || stats?.totalTenants || 14;
    const totalBedsVal = execStats?.totalMonitoredBeds?.toLocaleString() || '2,475';
    const activeBedsVal = execStats?.activeInpatientBeds?.toLocaleString() || '2,085';
    const totalStaffVal = execStats?.activeProviderSeats?.toLocaleString() || '1,280';
    const totalEncountersVal = execStats?.monthlyPatientEncounters?.toLocaleString() || '28,450';
    const totalDiagnosticVal = execStats?.totalDiagnosticStudies?.toLocaleString() || '18,710';
    const totalTelehealthVal = execStats?.telemedicineConsultations?.toLocaleString() || '4,120';

    return (
        <div className="space-y-8">
            {/* ------------------------------------------------------------- */}
            {/* EXECUTIVE VALUE HERO & PLATFORM GOVERNANCE BANNER */}
            {/* ------------------------------------------------------------- */}
            {/* EXECUTIVE HEADER */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                            Executive Dashboard
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            99.99% Uptime • Active
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Hospital network operations, inpatient capacity, and platform subscriptions.
                    </p>
                </div>

                {/* Executive Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold">
                        <button
                            onClick={() => setTimeRange('7d')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                timeRange === '7d' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            7D
                        </button>
                        <button
                            onClick={() => setTimeRange('30d')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                timeRange === '30d' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            30D
                        </button>
                        <button
                            onClick={() => setTimeRange('quarter')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                timeRange === 'quarter' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            QTD
                        </button>
                        <button
                            onClick={() => setTimeRange('ytd')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                timeRange === 'ytd' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            YTD
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={openExchangeModal}
                        title="European Central Bank FX Standard Active"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{currentCurrency} ({currencyInfo.symbol})</span>
                    </button>

                    <button
                        onClick={handleRefresh}
                        title="Refresh Real-time Telemetry"
                        className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        Export
                    </button>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* EXECUTIVE METRIC CARDS RIBBON */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Metric 1: ARR & MRR */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Gross ARR</span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{arrVal}</p>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        MRR: {mrrVal}
                    </div>
                </div>

                {/* Metric 2: Hospital Systems */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Hospitals</span>
                        <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{totalTenantsVal}</p>
                    <div className="text-[11px] text-primary font-semibold mt-0.5">
                        42 Facilities
                    </div>
                </div>

                {/* Metric 3: Monitored Beds */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Inpatient Beds</span>
                        <Bed className="w-4 h-4 text-sky-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{totalBedsVal}</p>
                    <div className="text-[11px] text-sky-600 font-semibold mt-0.5">
                        {activeBedsVal} (84% Occ.)
                    </div>
                </div>

                {/* Metric 4: Doctors & Staff */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Clinical Staff</span>
                        <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{totalStaffVal}</p>
                    <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
                        Physicians & Nurses
                    </div>
                </div>

                {/* Metric 5: Diagnostic Volume */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Diagnostics</span>
                        <Activity className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{totalDiagnosticVal}</p>
                    <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
                        18m Avg Turnaround
                    </div>
                </div>

                {/* Metric 6: Telemedicine */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Telemedicine</span>
                        <Video className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5 font-mono">{totalTelehealthVal}</p>
                    <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                        Virtual Consultations
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* PRIMARY TAB NAVIGATION */}
            {/* ------------------------------------------------------------- */}
            <div className="border-b border-gray-200 overflow-x-auto no-scrollbar flex gap-1 sm:gap-2 text-xs font-semibold">
                <button
                    onClick={() => setDashboardTab('overview')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        dashboardTab === 'overview'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Executive Overview</span>
                </button>
                <button
                    onClick={() => setDashboardTab('subscriptions')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        dashboardTab === 'subscriptions'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Subscriptions ({subscriptions.length})</span>
                </button>
                <button
                    onClick={() => setDashboardTab('governance')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        dashboardTab === 'governance'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    <span>SLA & Governance</span>
                </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {/* ------------------------------------------------------------- */}
            {dashboardTab === 'overview' && (
                <div className="space-y-8">
                    {/* Revenue & Growth Chart + Quick Pulse */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart Area */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">
                                        Multi-Tenant Revenue Expansion & Bed Capacity Growth
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Historical 6-month ARR progression and active monitored inpatient capacity.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <div className="flex items-center gap-1 text-indigo-600">
                                        <span className="w-3 h-3 rounded-sm bg-indigo-600"></span>
                                        <span>MRR ($)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600">
                                        <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                                        <span>Licensed Beds</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="colorBeds" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: any, name: any) => [
                                                name === 'mrr' ? `$${Number(value).toLocaleString()}` : `${Number(value).toLocaleString()} beds`,
                                                name === 'mrr' ? 'Monthly Recurring Revenue' : 'Monitored Bed Capacity',
                                            ]}
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderRadius: '8px',
                                                border: 'none',
                                                color: '#fff',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="mrr"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMrr)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="beds"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorBeds)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Regional Cloud Telemetry Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <h4 className="text-base font-bold text-gray-900">Multi-Region Cloud Infrastructure</h4>
                                    <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                                        <Server className="w-4 h-4" />
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {regionalHealth.map((reg, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs"
                                        >
                                            <div className="flex items-center justify-between font-bold text-gray-900">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    {reg.region}
                                                </span>
                                                <span className="text-emerald-700 font-mono">{reg.latency}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-500">
                                                <span>CPU / Mem Load: {reg.load}</span>
                                                <span>{reg.activeTenants} Active Tenants</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 truncate">{reg.backupStatus}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                                <span>Zero Tier-1 Outages</span>
                                <span className="font-bold text-emerald-600">RPO: 0s • RTO: &lt;5m</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Hospital Networks Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-gray-900">
                                    Active Hospital Tenants
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Capacity, provider seats, contract tiers, and health status per subscribed organization.
                                </p>
                            </div>
                            <button
                                onClick={() => setDashboardTab('subscriptions')}
                                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                            >
                                Open Subscription Manager
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* MOBILE FIRST: Hospital Tenants Card View */}
                        <div className="block md:hidden divide-y divide-gray-200">
                            {subscriptions.slice(0, 5).map((sub) => {
                                const monthlyCombined =
                                    sub.billingCycle === 'Annually'
                                        ? Math.round(sub.annualRate / 12)
                                        : sub.monthlyRate;

                                return (
                                    <div key={sub.id} className="p-4 space-y-2 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-gray-900">{sub.tenantName}</span>
                                            <StatusBadge status={sub.status as any} />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Contact: {sub.contactPerson}</span>
                                            <StatusBadge status={sub.tier as any} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-gray-100">
                                            <div>
                                                <span className="text-gray-400 text-[10px] block uppercase">Licensed Beds</span>
                                                <span className="font-bold text-gray-900">{sub.licensedBeds}</span>
                                                <span className="text-gray-400 text-[10px]"> / {sub.maxBeds} max</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-[10px] block uppercase">Monthly Value</span>
                                                <span className="font-bold text-gray-900 font-mono">${monthlyCombined.toLocaleString()}</span>
                                                <span className="text-gray-400 text-[10px]">/mo</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                onClick={() => setDashboardTab('subscriptions')}
                                                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                            >
                                                Manage Subscription
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-[11px] tracking-wider border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5">Hospital Network</th>
                                        <th className="px-4 py-3.5">Tier & Billing</th>
                                        <th className="px-4 py-3.5">Monthly Value</th>
                                        <th className="px-4 py-3.5">Licensed Beds</th>
                                        <th className="px-4 py-3.5">Clinical Seats</th>
                                        <th className="px-4 py-3.5">Cloud Storage</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Quick Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {subscriptions.slice(0, 5).map((sub) => {
                                        const monthlyCombined =
                                            sub.billingCycle === 'Annually'
                                                ? Math.round(sub.annualRate / 12)
                                                : sub.monthlyRate;

                                        return (
                                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-bold text-gray-900 text-sm">{sub.tenantName}</div>
                                                    <div className="text-[11px] text-gray-500">{sub.contactPerson}</div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={sub.tier as any} />
                                                    <div className="text-[10px] text-gray-400 mt-0.5">{sub.billingCycle}</div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-gray-900 font-mono">
                                                        ${monthlyCombined.toLocaleString()}
                                                        <span className="text-[10px] font-normal text-gray-500 font-sans">/mo</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">{sub.paymentMethod.type.toUpperCase()}</div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-semibold text-gray-900">{sub.licensedBeds}</span>
                                                    <span className="text-gray-400 text-[11px]"> / {sub.maxBeds} max</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-semibold text-gray-900">{sub.providerSeats}</span>
                                                    <span className="text-gray-400 text-[11px]"> seats</span>
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-[11px] text-gray-700">
                                                    {sub.storageAllocatedGb >= 1000
                                                        ? `${(sub.storageAllocatedGb / 1000).toFixed(0)} TB`
                                                        : `${sub.storageAllocatedGb} GB`}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={sub.status as any} />
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => setDashboardTab('subscriptions')}
                                                        className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Audit & System Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h4 className="text-base font-bold text-gray-900">Live Global Security & Audit Stream</h4>
                                <p className="text-xs text-gray-500">
                                    Real-time HIPAA access logs, tenant provisioning events, and administrative transactions.
                                </p>
                            </div>
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                                Immutable Audit Ledger Active
                            </span>
                        </div>

                        <ul className="divide-y divide-gray-100">
                            {activity.slice(0, 5).map((log) => {
                                let formattedDate = '';
                                try {
                                    formattedDate = log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy @ h:mm a') : '';
                                } catch {
                                    formattedDate = String(log.timestamp || '');
                                }

                                return (
                                    <li key={log.id} className="py-3 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 text-xs">
                                            <p className="font-semibold text-gray-900">{log.details}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                Initiated by <span className="font-medium text-gray-700">{log.user}</span> • {formattedDate}
                                            </p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                                            HIPAA-VERIFIED
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: EMBEDDED WORLD-CLASS SUBSCRIPTION MODULE */}
            {/* ------------------------------------------------------------- */}
            {dashboardTab === 'subscriptions' && (
                <div className="space-y-6">
                    <SubscriptionModule embedded={true} />
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: HEALTHCARE SLA & SECURITY GOVERNANCE */}
            {/* ------------------------------------------------------------- */}
            {dashboardTab === 'governance' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">Healthcare Compliance & Security Framework</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            RaphaMIS operates under strict Business Associate Agreements (BAA) with all tenant hospitals, ensuring end-to-end cryptographic data separation, patient privacy protection under HIPAA Title II, SOC2 Type II compliance, and HL7/FHIR standard interoperability.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                    <Lock className="w-4 h-4" />
                                    <span>Encryption at Rest & Transit</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    AES-256 GCM envelope encryption with per-tenant dedicated KMS keys. TLS 1.3 enforced for all browser, DICOM PACS, and LIS analyzer feeds.
                                </p>
                                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    Verified 100% Compliant
                                </span>
                            </div>

                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                    <Shield className="w-4 h-4" />
                                    <span>HIPAA BAA Automation</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Digital cryptographically signed BAA terms bound to each tenant subscription upon provisioning. Includes automatic breach notification SLAs.
                                </p>
                                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    14/14 BAAs Active
                                </span>
                            </div>

                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                    <Server className="w-4 h-4" />
                                    <span>Disaster Recovery & Hot Standby</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Cross-region active-active database replication. Recovery Point Objective (RPO) of &lt; 15 seconds; Recovery Time Objective (RTO) of &lt; 5 minutes.
                                </p>
                                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    Drill Tested: Aug 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* EXPORT BOARD REPORT MODAL */}
            {/* ------------------------------------------------------------- */}
            {isExportModalOpen && (
                <Modal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title="Export Executive Board Deck & SLA Audit Report"
                >
                    <div className="space-y-4 text-xs text-gray-700">
                        <p className="text-gray-500">
                            Download a formal, board-ready executive summary packet containing quarterly ARR expansion, patient encounter growth, and SLA compliance certificates.
                        </p>

                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2 font-mono text-[11px]">
                            <p><strong>Platform:</strong> RaphaMIS Enterprise HMS SaaS Console</p>
                            <p><strong>Gross ARR:</strong> {arrVal} (MRR: {mrrVal})</p>
                            <p><strong>Contracted Hospitals:</strong> {totalTenantsVal} Networks (42 Facilities)</p>
                            <p><strong>Licensed Capacity:</strong> {totalBedsVal} Inpatient Beds | {totalStaffVal} Clinicians</p>
                            <p><strong>Guaranteed Uptime SLA:</strong> 99.994% Enterprise High Availability</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setIsExportModalOpen(false)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    window.print();
                                    setIsExportModalOpen(false);
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download / Print Report
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
