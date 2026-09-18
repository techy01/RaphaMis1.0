import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    CreditCard,
    Shield,
    Check,
    X,
    Sparkles,
    Building2,
    Sliders,
    Zap,
    Download,
    Plus,
    Search,
    Filter,
    Calendar,
    ArrowUpRight,
    RefreshCw,
    Server,
    Users,
    Bed,
    Database,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Lock,
    Globe,
    FileText,
    TrendingUp,
} from 'lucide-react';
import {
    TenantSubscription,
    SubscriptionPlan,
    SubscriptionAddon,
    SubscriptionTier,
    BillingCycle,
    SubscriptionStatus,
} from '../../packages/shared/types';
import {
    getSubscriptions,
    getSubscriptionPlans,
    getSubscriptionAddons,
    upgradeOrChangePlan,
    toggleAddon,
    adjustCapacity,
    renewSubscription,
    createSubscription,
    updateSubscriptionStatus,
} from '../../api/subscriptionApi';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';
import { useCurrency } from '../../contexts/CurrencyContext';

interface SubscriptionModuleProps {
    embedded?: boolean;
    onViewChange?: (tab: string) => void;
}

export const SubscriptionModule: React.FC<SubscriptionModuleProps> = ({ embedded = false }) => {
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

    // Query data
    const { data: subscriptions = [], isLoading: isLoadingSubs } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: getSubscriptions,
    });

    const { data: plans = [] } = useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: getSubscriptionPlans,
    });

    const { data: addons = [] } = useQuery({
        queryKey: ['subscriptionAddons'],
        queryFn: getSubscriptionAddons,
    });

    // Local filters & state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
    const [billingCycleToggle, setBillingCycleToggle] = useState<BillingCycle>('Annually');
    const [activeSubTab, setActiveSubTab] = useState<'plans' | 'contracts' | 'addons'>('contracts');

    // Modals state
    const [selectedSubForUpgrade, setSelectedSubForUpgrade] = useState<TenantSubscription | null>(null);
    const [selectedSubForCapacity, setSelectedSubForCapacity] = useState<TenantSubscription | null>(null);
    const [selectedSubForAddons, setSelectedSubForAddons] = useState<TenantSubscription | null>(null);
    const [selectedSubForAgreement, setSelectedSubForAgreement] = useState<TenantSubscription | null>(null);
    const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);

    // Upgrade modal local state
    const [upgradeTier, setUpgradeTier] = useState<SubscriptionTier>('Enterprise Health System');
    const [upgradeBillingCycle, setUpgradeBillingCycle] = useState<BillingCycle>('Annually');

    // Capacity modal local state
    const [capacityBeds, setCapacityBeds] = useState<number>(450);
    const [capacitySeats, setCapacitySeats] = useState<number>(100);

    // New Subscription Wizard state
    const [newSubStep, setNewSubStep] = useState(1);
    const [newSubForm, setNewSubForm] = useState({
        tenantName: '',
        contactPerson: '',
        contactEmail: '',
        tier: 'Community Hospital' as SubscriptionTier,
        billingCycle: 'Annually' as BillingCycle,
        licensedBeds: 150,
        providerSeats: 40,
        region: 'US-East (N. Virginia)' as const,
        paymentType: 'ach' as 'ach' | 'card' | 'wire' | 'invoice_net30',
        institutionName: 'Regional Health System Treasury',
        notes: '',
        selectedAddonIds: ['addon_ai_scribe'],
    });

    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const showNotification = (msg: string) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(null), 4000);
    };

    // Mutations
    const upgradeMutation = useMutation({
        mutationFn: ({ subId, tier, cycle }: { subId: string; tier: SubscriptionTier; cycle: BillingCycle }) =>
            upgradeOrChangePlan(subId, tier, cycle),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] });
            setSelectedSubForUpgrade(null);
            showNotification(`Successfully modified plan for ${updated.tenantName} to ${updated.tier} (${updated.billingCycle})`);
        },
    });

    const capacityMutation = useMutation({
        mutationFn: ({ subId, beds, seats }: { subId: string; beds: number; seats: number }) =>
            adjustCapacity(subId, beds, seats),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] });
            setSelectedSubForCapacity(null);
            showNotification(`Updated licensed capacity for ${updated.tenantName}: ${updated.licensedBeds} beds & ${updated.providerSeats} providers.`);
        },
    });

    const addonMutation = useMutation({
        mutationFn: ({ subId, addonId, enabled }: { subId: string; addonId: string; enabled: boolean }) =>
            toggleAddon(subId, addonId, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] });
            showNotification('Add-on configuration updated successfully.');
        },
    });

    const renewMutation = useMutation({
        mutationFn: (subId: string) => renewSubscription(subId),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] });
            showNotification(`Subscription renewed for ${updated.tenantName}. Next renewal date: ${format(new Date(updated.renewalDate), 'MMM d, yyyy')}`);
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ subId, status }: { subId: string; status: SubscriptionStatus }) =>
            updateSubscriptionStatus(subId, status),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            showNotification(`Updated status for ${updated.tenantName} to ${updated.status}`);
        },
    });

    const createSubMutation = useMutation({
        mutationFn: (payload: any) => createSubscription(payload),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['executiveStats'] });
            setIsNewSubModalOpen(false);
            setNewSubStep(1);
            showNotification(`New subscription provisioned for ${created.tenantName} (${created.tier})`);
        },
    });

    // Calculations
    const filteredSubscriptions = subscriptions.filter((sub) => {
        const matchesSearch =
            sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = selectedTierFilter === 'All' || sub.tier === selectedTierFilter;
        const matchesStatus = selectedStatusFilter === 'All' || sub.status === selectedStatusFilter;
        return matchesSearch && matchesTier && matchesStatus;
    });

    const totalMrr = subscriptions.reduce((acc, sub) => {
        const base = sub.billingCycle === 'Annually' ? Math.round(sub.annualRate / 12) : sub.monthlyRate;
        const addonsCost = sub.activeAddons.reduce((aAcc, a) => a.enabled ? aAcc + a.monthlyPrice : aAcc, 0);
        return acc + base + addonsCost;
    }, 0);

    const totalBeds = subscriptions.reduce((acc, s) => acc + (s.licensedBeds || 0), 0);
    const totalProviders = subscriptions.reduce((acc, s) => acc + (s.providerSeats || 0), 0);

    return (
        <div className="space-y-6">
            {/* Action notification toast */}
            {actionMessage && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-900 text-emerald-100 px-5 py-3 rounded-lg shadow-xl border border-emerald-700 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium">{actionMessage}</span>
                    <button onClick={() => setActionMessage(null)} className="ml-2 text-emerald-300 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Sub-navigation & Header Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Hospital Subscriptions & Licensing Engine</h3>
                            <p className="text-xs text-gray-500">
                                Enterprise SaaS tier provisioning, capacity meters, multi-tenant billing, and contract governance.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-semibold">
                        <button
                            onClick={() => setActiveSubTab('contracts')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                activeSubTab === 'contracts'
                                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Active Contracts ({subscriptions.length})
                        </button>
                        <button
                            onClick={() => setActiveSubTab('plans')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                activeSubTab === 'plans'
                                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Plans & Pricing Matrix
                        </button>
                        <button
                            onClick={() => setActiveSubTab('addons')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                activeSubTab === 'addons'
                                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Enterprise Add-ons ({addons.length})
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setNewSubStep(1);
                            setIsNewSubModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Provision Hospital
                    </button>
                </div>
            </div>

            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Platform MRR</p>
                        <button
                            type="button"
                            onClick={openExchangeModal}
                            className="text-[10px] font-bold text-primary hover:underline"
                            title="View ECB Exchange Standards"
                        >
                            {currentCurrency}
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {convertAndFormat(totalMrr, 'USD', currentCurrency)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{convertAndFormat(totalMrr * 12, 'USD', currentCurrency)} Run-Rate ARR</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Hospital Tenants</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</p>
                    <p className="text-xs text-gray-500 mt-1">0% Monthly Churn • 100% Retention</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Licensed Inpatient Beds</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{totalBeds.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Across all subscribed hospital tiers</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Licensed Doctors & Staff</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{totalProviders.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Active authenticated provider seats</p>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW 1: ACTIVE CONTRACTS & TENANT SUBSCRIPTIONS TABLE */}
            {/* ------------------------------------------------------------- */}
            {activeSubTab === 'contracts' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Search & Filter Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search hospital name, contact person, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Filter className="w-3.5 h-3.5 text-gray-400" />
                                <span>Tier:</span>
                                <select
                                    value={selectedTierFilter}
                                    onChange={(e) => setSelectedTierFilter(e.target.value)}
                                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="All">All Tiers</option>
                                    <option value="Starter Clinic">Starter Clinic</option>
                                    <option value="Community Hospital">Community Hospital</option>
                                    <option value="Enterprise Health System">Enterprise Health System</option>
                                    <option value="Sovereign Cloud">Sovereign Cloud</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-2">
                                <span>Status:</span>
                                <select
                                    value={selectedStatusFilter}
                                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Renewing Soon">Renewing Soon</option>
                                    <option value="Trial">Trial</option>
                                    <option value="Past Due">Past Due</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="bg-gray-100/75 text-gray-700 uppercase font-semibold text-[11px] tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3.5">Hospital Network & Region</th>
                                    <th className="px-4 py-3.5">Current Tier</th>
                                    <th className="px-4 py-3.5">Rate & Cadence</th>
                                    <th className="px-4 py-3.5">Capacity (Beds / Seats)</th>
                                    <th className="px-4 py-3.5">Active Add-Ons</th>
                                    <th className="px-4 py-3.5">Renewal Date</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoadingSubs && (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-gray-500">
                                            Loading hospital subscriptions...
                                        </td>
                                    </tr>
                                )}
                                {!isLoadingSubs && filteredSubscriptions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-gray-500">
                                            No subscriptions matched your search and filter criteria.
                                        </td>
                                    </tr>
                                )}
                                {filteredSubscriptions.map((sub) => {
                                    const effectiveMonthly =
                                        sub.billingCycle === 'Annually'
                                            ? Math.round(sub.annualRate / 12)
                                            : sub.monthlyRate;
                                    const addonsMonthly = sub.activeAddons.reduce(
                                        (sum, a) => (a.enabled ? sum + a.monthlyPrice : sum),
                                        0
                                    );
                                    const totalMonthlyCombined = effectiveMonthly + addonsMonthly;

                                    return (
                                        <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Hospital Name & Info */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{sub.tenantName}</p>
                                                        <p className="text-gray-500 text-[11px]">{sub.contactPerson}</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                                                <Globe className="w-2.5 h-2.5" />
                                                                {sub.region}
                                                            </span>
                                                            {sub.baaSigned && (
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                                                    <Shield className="w-2.5 h-2.5" />
                                                                    BAA Signed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tier */}
                                            <td className="px-4 py-4">
                                                <StatusBadge status={sub.tier as any} />
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    {sub.billingCycle} billing
                                                </p>
                                            </td>

                                            {/* Rate */}
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {convertAndFormat(totalMonthlyCombined, 'USD', currentCurrency)}
                                                    <span className="text-[11px] font-normal text-gray-500">/mo</span>
                                                </p>
                                                {sub.billingCycle === 'Annually' ? (
                                                    <p className="text-[11px] text-emerald-600 font-medium">
                                                        Billed {convertAndFormat(sub.annualRate, 'USD', currentCurrency)}/yr
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] text-gray-500">Monthly invoice</p>
                                                )}
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    Method: {sub.paymentMethod.type.toUpperCase()}
                                                    {sub.paymentMethod.last4 ? ` •••• ${sub.paymentMethod.last4}` : ''}
                                                </p>
                                            </td>

                                            {/* Capacity */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <Bed className="w-3 h-3 text-indigo-500" /> Beds:
                                                        </span>
                                                        <span className="font-semibold text-gray-900">
                                                            {sub.licensedBeds} / {sub.maxBeds}
                                                        </span>
                                                    </div>
                                                    <div className="w-28 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-indigo-600 h-1.5 rounded-full"
                                                            style={{
                                                                width: `${Math.min(100, (sub.licensedBeds / sub.maxBeds) * 100)}%`,
                                                            }}
                                                        ></div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <Users className="w-3 h-3 text-emerald-500" /> Seats:
                                                        </span>
                                                        <span className="font-semibold text-gray-900">
                                                            {sub.providerSeats} / {sub.maxProviderSeats}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Active Addons */}
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[170px]">
                                                    {sub.activeAddons.filter((a) => a.enabled).length === 0 ? (
                                                        <span className="text-[11px] text-gray-400 italic">None active</span>
                                                    ) : (
                                                        sub.activeAddons
                                                            .filter((a) => a.enabled)
                                                            .map((addon) => (
                                                                <span
                                                                    key={addon.addonId}
                                                                    className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100"
                                                                >
                                                                    {addon.name.split(' ')[0]} +${addon.monthlyPrice}
                                                                </span>
                                                            ))
                                                    )}
                                                </div>
                                            </td>

                                            {/* Renewal Date */}
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {format(new Date(sub.renewalDate), 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    Auto-renew: {sub.autoRenew ? 'Enabled' : 'Manual'}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <StatusBadge status={sub.status as any} />
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSubForUpgrade(sub);
                                                            setUpgradeTier(sub.tier);
                                                            setUpgradeBillingCycle(sub.billingCycle);
                                                        }}
                                                        title="Change Tier or Billing Cycle"
                                                        className="px-2 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 border border-indigo-100 transition-colors"
                                                    >
                                                        Change Plan
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSubForCapacity(sub);
                                                            setCapacityBeds(sub.licensedBeds);
                                                            setCapacitySeats(sub.providerSeats);
                                                        }}
                                                        title="Adjust Licensed Beds & Doctor Seats"
                                                        className="px-2 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 border border-gray-200 transition-colors"
                                                    >
                                                        <Sliders className="w-3.5 h-3.5 inline mr-0.5" />
                                                        Capacity
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedSubForAddons(sub)}
                                                        title="Manage Add-on modules"
                                                        className="px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 rounded hover:bg-purple-100 border border-purple-100 transition-colors"
                                                    >
                                                        Add-ons
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedSubForAgreement(sub)}
                                                        title="View & Download SLA Agreement"
                                                        className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 2: PLANS & PRICING COMPARISON MATRIX */}
            {/* ------------------------------------------------------------- */}
            {activeSubTab === 'plans' && (
                <div className="space-y-6">
                    {/* Billing Toggle Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">RaphaMIS Multi-Tenant Plan Architecture</h4>
                            <p className="text-xs text-gray-500">
                                Transparent pricing designed for independent medical centers, regional hospital systems, and state health networks.
                            </p>
                        </div>

                        {/* Monthly vs Annual Toggle with 20% discount */}
                        <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                            <button
                                onClick={() => setBillingCycleToggle('Monthly')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                    billingCycleToggle === 'Monthly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Monthly Invoicing
                            </button>
                            <button
                                onClick={() => setBillingCycleToggle('Annually')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                    billingCycleToggle === 'Annually'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>Annual Billing</span>
                                <span className="bg-emerald-400 text-emerald-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                                    Save 20%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* 4-Tier Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {plans.map((plan) => {
                            const isEnterprise = plan.tier === 'Enterprise Health System';
                            const price = billingCycleToggle === 'Annually' ? plan.annualPrice : plan.monthlyPrice;

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col justify-between bg-white rounded-2xl p-6 transition-all duration-200 ${
                                        isEnterprise
                                            ? 'border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-50'
                                            : 'border border-gray-200 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {plan.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase ${
                                                    isEnterprise
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-emerald-600 text-white shadow-sm'
                                                }`}
                                            >
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        <h5 className="text-lg font-bold text-gray-900">{plan.tier}</h5>
                                        <p className="text-xs text-gray-500 mt-1.5 min-h-[36px]">{plan.tagline}</p>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold text-gray-900">
                                                    {convertAndFormat(price, 'USD', currentCurrency)}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">/ month</span>
                                            </div>
                                            {currentCurrency !== 'USD' && (
                                                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                                    Base: ${price.toLocaleString()} USD (ECB standard)
                                                </p>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {billingCycleToggle === 'Annually'
                                                    ? `Billed annually (${convertAndFormat(price * 12, 'USD', currentCurrency)}/year)`
                                                    : 'Billed monthly on the 1st'}
                                            </p>
                                        </div>

                                        {/* Capacity Limits */}
                                        <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100 text-xs">
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span className="flex items-center gap-1">
                                                    <Bed className="w-3.5 h-3.5 text-indigo-500" />
                                                    Max Inpatient Beds:
                                                </span>
                                                <span className="font-bold">{plan.maxBeds} beds</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                                                    Staff Seats:
                                                </span>
                                                <span className="font-bold">{plan.maxProviderSeats} seats</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span className="flex items-center gap-1">
                                                    <Database className="w-3.5 h-3.5 text-purple-500" />
                                                    Included PACS:
                                                </span>
                                                <span className="font-bold">{plan.includedStorageGb >= 1000 ? `${plan.includedStorageGb / 1000}TB` : `${plan.includedStorageGb}GB`}</span>
                                            </div>
                                        </div>

                                        {/* Highlight Features */}
                                        <div className="mt-5 space-y-2.5">
                                            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                                Included Capabilities
                                            </p>
                                            <ul className="space-y-2 text-xs text-gray-600">
                                                {plan.highlightFeatures.map((feat, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setNewSubForm((prev) => ({
                                                    ...prev,
                                                    tier: plan.tier,
                                                    billingCycle: billingCycleToggle,
                                                    licensedBeds: plan.maxBeds,
                                                    providerSeats: plan.maxProviderSeats,
                                                }));
                                                setNewSubStep(1);
                                                setIsNewSubModalOpen(true);
                                            }}
                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                                                isEnterprise
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            Provision on {plan.tier}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 3: ENTERPRISE ADD-ONS CATALOG */}
            {/* ------------------------------------------------------------- */}
            {activeSubTab === 'addons' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900">Hospital Platform Extension Modules & Add-ons</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Modular AI diagnostics, cloud storage expansions, and enterprise interoperability bridges activated per facility or health network.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addons.map((addon) => {
                            const enrolledCount = subscriptions.filter((s) =>
                                s.activeAddons.some((a) => a.addonId === addon.id && a.enabled)
                            ).length;

                            return (
                                <div
                                    key={addon.id}
                                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                                {addon.category}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {enrolledCount} {enrolledCount === 1 ? 'Hospital' : 'Hospitals'} using
                                            </span>
                                        </div>

                                        <h5 className="text-base font-bold text-gray-900 mt-3">{addon.name}</h5>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {addon.description}
                                        </p>

                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline gap-1">
                                            <span className="text-2xl font-extrabold text-gray-900">
                                                {convertAndFormat(addon.monthlyPrice, 'USD', currentCurrency)}
                                            </span>
                                            <span className="text-xs text-gray-500">{addon.unitLabel || '/mo'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Instant Activation
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (subscriptions.length > 0) {
                                                    setSelectedSubForAddons(subscriptions[0]);
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            Configure Tenants
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 1: CHANGE / UPGRADE PLAN */}
            {/* ------------------------------------------------------------- */}
            {selectedSubForUpgrade && (
                <Modal
                    isOpen={!!selectedSubForUpgrade}
                    onClose={() => setSelectedSubForUpgrade(null)}
                    title={`Change Plan: ${selectedSubForUpgrade.tenantName}`}
                >
                    <div className="space-y-4 text-xs text-gray-700">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <p className="font-semibold text-indigo-900">Current Subscription:</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="font-bold text-gray-900">{selectedSubForUpgrade.tier}</span>
                                <span className="text-indigo-700 font-bold">
                                    ${selectedSubForUpgrade.monthlyRate.toLocaleString()}/mo ({selectedSubForUpgrade.billingCycle})
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Select New Tier:</label>
                            <select
                                value={upgradeTier}
                                onChange={(e) => setUpgradeTier(e.target.value as SubscriptionTier)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                            >
                                <option value="Starter Clinic">Starter Clinic ($1,499/mo | $1,199/mo Annually)</option>
                                <option value="Community Hospital">Community Hospital ($3,499/mo | $2,799/mo Annually)</option>
                                <option value="Enterprise Health System">Enterprise Health System ($7,999/mo | $6,399/mo Annually)</option>
                                <option value="Sovereign Cloud">Sovereign Cloud ($14,999/mo | $11,999/mo Annually)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Billing Frequency:</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setUpgradeBillingCycle('Annually')}
                                    className={`p-2.5 rounded-lg border text-center font-bold ${
                                        upgradeBillingCycle === 'Annually'
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    Annually (20% Savings)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUpgradeBillingCycle('Monthly')}
                                    className={`p-2.5 rounded-lg border text-center font-bold ${
                                        upgradeBillingCycle === 'Monthly'
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    Monthly Invoicing
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
                            <p className="font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Prorated Billing Adjustment:
                            </p>
                            <p className="mt-0.5">
                                Your next billing invoice will automatically calculate prorated credits for unused days in the current period. Upgrades take effect immediately with zero downtime.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedSubForUpgrade(null)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    upgradeMutation.mutate({
                                        subId: selectedSubForUpgrade.id,
                                        tier: upgradeTier,
                                        cycle: upgradeBillingCycle,
                                    })
                                }
                                disabled={upgradeMutation.isPending}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {upgradeMutation.isPending ? 'Applying...' : 'Confirm Plan Modification'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 2: CAPACITY & LICENSE SIZER */}
            {/* ------------------------------------------------------------- */}
            {selectedSubForCapacity && (
                <Modal
                    isOpen={!!selectedSubForCapacity}
                    onClose={() => setSelectedSubForCapacity(null)}
                    title={`Adjust Capacity: ${selectedSubForCapacity.tenantName}`}
                >
                    <div className="space-y-4 text-xs text-gray-700">
                        <p className="text-gray-500">
                            Dynamically scale inpatient bed monitoring thresholds and clinical staff seat licensing.
                        </p>

                        {/* Bed Slider */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                    <Bed className="w-4 h-4 text-indigo-600" />
                                    Licensed Inpatient Beds:
                                </span>
                                <span className="text-base font-extrabold text-indigo-700">{capacityBeds} Beds</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max={selectedSubForCapacity.maxBeds || 1000}
                                step="10"
                                value={capacityBeds}
                                onChange={(e) => setCapacityBeds(Number(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>Min: 20</span>
                                <span>Max on {selectedSubForCapacity.tier}: {selectedSubForCapacity.maxBeds}</span>
                            </div>
                        </div>

                        {/* Staff Seat Slider */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    Doctor & Clinical Staff Seats:
                                </span>
                                <span className="text-base font-extrabold text-emerald-700">{capacitySeats} Seats</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max={selectedSubForCapacity.maxProviderSeats || 300}
                                step="5"
                                value={capacitySeats}
                                onChange={(e) => setCapacitySeats(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>Min: 10</span>
                                <span>Max on {selectedSubForCapacity.tier}: {selectedSubForCapacity.maxProviderSeats}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedSubForCapacity(null)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    capacityMutation.mutate({
                                        subId: selectedSubForCapacity.id,
                                        beds: capacityBeds,
                                        seats: capacitySeats,
                                    })
                                }
                                disabled={capacityMutation.isPending}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {capacityMutation.isPending ? 'Saving...' : 'Save Capacity Limits'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 3: MANAGE ADD-ONS */}
            {/* ------------------------------------------------------------- */}
            {selectedSubForAddons && (
                <Modal
                    isOpen={!!selectedSubForAddons}
                    onClose={() => setSelectedSubForAddons(null)}
                    title={`Enterprise Add-Ons: ${selectedSubForAddons.tenantName}`}
                >
                    <div className="space-y-4 text-xs text-gray-700">
                        <p className="text-gray-500">
                            Enable or disable high-performance add-on services for this healthcare network.
                        </p>

                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {addons.map((addon) => {
                                const isEnabled = selectedSubForAddons.activeAddons.some(
                                    (a) => a.addonId === addon.id && a.enabled
                                );

                                return (
                                    <div
                                        key={addon.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="pr-3">
                                            <p className="font-bold text-gray-900">{addon.name}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{addon.description}</p>
                                            <p className="text-indigo-600 font-bold text-xs mt-1">
                                                +${addon.monthlyPrice}/mo
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                addonMutation.mutate({
                                                    subId: selectedSubForAddons.id,
                                                    addonId: addon.id,
                                                    enabled: !isEnabled,
                                                })
                                            }
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                isEnabled
                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            {isEnabled ? 'Active' : 'Enable'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedSubForAddons(null)}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 4: FORMAL SLA AGREEMENT & RECEIPT */}
            {/* ------------------------------------------------------------- */}
            {selectedSubForAgreement && (
                <Modal
                    isOpen={!!selectedSubForAgreement}
                    onClose={() => setSelectedSubForAgreement(null)}
                    title="Enterprise Healthcare SLA & Master Agreement"
                >
                    <div className="space-y-4 text-xs text-gray-700 max-h-[480px] overflow-y-auto pr-1">
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-bold text-gray-900 text-sm">RAPHAMIS HEALTHCARE CLOUD MSA</span>
                                <span className="text-indigo-600 font-bold">DOC-{selectedSubForAgreement.id.toUpperCase()}</span>
                            </div>
                            <p><strong>Tenant:</strong> {selectedSubForAgreement.tenantName}</p>
                            <p><strong>Primary Contact:</strong> {selectedSubForAgreement.contactPerson} ({selectedSubForAgreement.contactEmail})</p>
                            <p><strong>Plan Tier:</strong> {selectedSubForAgreement.tier} ({selectedSubForAgreement.billingCycle})</p>
                            <p><strong>Guaranteed Uptime SLA:</strong> 99.99% Multi-AZ High Availability</p>
                            <p><strong>HIPAA Business Associate Agreement (BAA):</strong> Executed & Active</p>
                            <p><strong>Data Center Region:</strong> {selectedSubForAgreement.region}</p>
                            <p><strong>Current Period:</strong> {format(new Date(selectedSubForAgreement.currentPeriodStart), 'yyyy-MM-dd')} to {format(new Date(selectedSubForAgreement.currentPeriodEnd), 'yyyy-MM-dd')}</p>
                            <p><strong>Licensed Limits:</strong> {selectedSubForAgreement.licensedBeds} Inpatient Beds | {selectedSubForAgreement.providerSeats} Staff Seats</p>
                            <p><strong>Storage Tier:</strong> {selectedSubForAgreement.dicomArchiveTier}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-gray-400 text-[11px]">Authorized Digital Cryptographic Signature</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Print / PDF
                                </button>
                                <button
                                    onClick={() => setSelectedSubForAgreement(null)}
                                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 5: NEW HOSPITAL TENANT PROVISIONING WIZARD */}
            {/* ------------------------------------------------------------- */}
            {isNewSubModalOpen && (
                <Modal
                    isOpen={isNewSubModalOpen}
                    onClose={() => setIsNewSubModalOpen(false)}
                    title="Provision New Hospital Network Subscription"
                >
                    <div className="space-y-4 text-xs text-gray-700">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <span className={`font-bold ${newSubStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                1. Hospital Profile
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <span className={`font-bold ${newSubStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                2. Plan & Sizing
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <span className={`font-bold ${newSubStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                3. Payment & Provision
                            </span>
                        </div>

                        {/* Step 1: Organization Details */}
                        {newSubStep === 1 && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Hospital / Healthcare Network Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Johns Hopkins Regional Health, Vanderbilt Clinic"
                                        value={newSubForm.tenantName}
                                        onChange={(e) => setNewSubForm({ ...newSubForm, tenantName: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Lead Medical Officer / Contact</label>
                                        <input
                                            type="text"
                                            placeholder="Dr. Jordan Mitchell"
                                            value={newSubForm.contactPerson}
                                            onChange={(e) => setNewSubForm({ ...newSubForm, contactPerson: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Administrative Email *</label>
                                        <input
                                            type="email"
                                            placeholder="Enter administrative email address"
                                            value={newSubForm.contactEmail}
                                            onChange={(e) => setNewSubForm({ ...newSubForm, contactEmail: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Target Cloud Region</label>
                                    <select
                                        value={newSubForm.region}
                                        onChange={(e) => setNewSubForm({ ...newSubForm, region: e.target.value as any })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                                    >
                                        <option value="US-East (N. Virginia)">US-East (N. Virginia) • Low Latency</option>
                                        <option value="US-West (Oregon)">US-West (Oregon) • Hot Failover</option>
                                        <option value="EU-Central (Frankfurt)">EU-Central (Frankfurt) • GDPR Sovereign</option>
                                        <option value="APAC (Singapore)">APAC (Singapore) • Asia-Pacific Gateway</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Plan & Sizing */}
                        {newSubStep === 2 && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Select SaaS Plan Tier</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {plans.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() =>
                                                    setNewSubForm({
                                                        ...newSubForm,
                                                        tier: p.tier,
                                                        licensedBeds: p.maxBeds,
                                                        providerSeats: p.maxProviderSeats,
                                                    })
                                                }
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    newSubForm.tier === p.tier
                                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <p className="font-bold text-gray-900">{p.tier}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">${p.annualPrice}/mo billed annually</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Licensed Inpatient Beds</label>
                                        <input
                                            type="number"
                                            value={newSubForm.licensedBeds}
                                            onChange={(e) => setNewSubForm({ ...newSubForm, licensedBeds: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Provider & Staff Seats</label>
                                        <input
                                            type="number"
                                            value={newSubForm.providerSeats}
                                            onChange={(e) => setNewSubForm({ ...newSubForm, providerSeats: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment & Final Review */}
                        {newSubStep === 3 && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Billing Frequency</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewSubForm({ ...newSubForm, billingCycle: 'Annually' })}
                                            className={`p-2.5 rounded-lg border text-center font-bold ${
                                                newSubForm.billingCycle === 'Annually'
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                                    : 'border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            Annual (20% Savings)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewSubForm({ ...newSubForm, billingCycle: 'Monthly' })}
                                            className={`p-2.5 rounded-lg border text-center font-bold ${
                                                newSubForm.billingCycle === 'Monthly'
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                                    : 'border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            Monthly Invoicing
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={newSubForm.paymentType}
                                        onChange={(e) => setNewSubForm({ ...newSubForm, paymentType: e.target.value as any })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                                    >
                                        <option value="ach">ACH Commercial Direct Debit (Preferred for Hospital Networks)</option>
                                        <option value="wire">Institutional Fedwire Bank Transfer</option>
                                        <option value="card">Corporate Healthcare Purchasing Card</option>
                                        <option value="invoice_net30">Formal Purchase Order (NET-30 Terms)</option>
                                    </select>
                                </div>

                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                                    <p className="font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Automatic Onboarding Provisioning:
                                    </p>
                                    <p>
                                        Will deploy dedicated database schema, generate administrative credentials, execute HIPAA BAA agreement, and configure HL7/FHIR endpoints.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="flex justify-between pt-3 border-t border-gray-100">
                            {newSubStep > 1 ? (
                                <button
                                    onClick={() => setNewSubStep(newSubStep - 1)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {newSubStep < 3 ? (
                                <button
                                    onClick={() => {
                                        if (newSubStep === 1 && !newSubForm.tenantName) {
                                            alert('Please specify the Hospital or Healthcare Network name.');
                                            return;
                                        }
                                        setNewSubStep(newSubStep + 1);
                                    }}
                                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                >
                                    Next: {newSubStep === 1 ? 'Plan & Sizing' : 'Payment'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        createSubMutation.mutate({
                                            tenantName: newSubForm.tenantName,
                                            contactPerson: newSubForm.contactPerson || 'Hospital Administrator',
                                            contactEmail: newSubForm.contactEmail || 'admin@hospital.org',
                                            tier: newSubForm.tier,
                                            billingCycle: newSubForm.billingCycle,
                                            licensedBeds: newSubForm.licensedBeds,
                                            providerSeats: newSubForm.providerSeats,
                                            region: newSubForm.region,
                                            paymentMethod: {
                                                type: newSubForm.paymentType,
                                                institutionName: newSubForm.institutionName,
                                            },
                                        });
                                    }}
                                    disabled={createSubMutation.isPending}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {createSubMutation.isPending ? 'Provisioning Tenant...' : 'Activate & Provision Tenant'}
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
