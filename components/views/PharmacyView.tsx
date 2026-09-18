import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Pill,
    Search,
    RefreshCw,
    Plus,
    FileSpreadsheet,
    X,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Check,
    Eye,
    Building,
    User,
    ChevronRight,
} from 'lucide-react';
import {
    getPharmacyOrders,
    getPharmacyStats,
    updateOrderStatus,
    overrideSafetyAlert,
    createPharmacyOrder,
} from '../../api/pharmacyApi';
import { getTenants } from '../../api/tenantsApi';
import { PharmacyOrder, PharmacyTriageStatus } from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Toast } from '../shared/Toast';
import { PharmacyOrderDetailsModal } from '../pharmacy/PharmacyOrderDetailsModal';
import { NewPrescriptionModal } from '../pharmacy/NewPrescriptionModal';

export const PharmacyView: React.FC = () => {
    const queryClient = useQueryClient();

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedUrgency, setSelectedUrgency] = useState('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'urgency' | 'patient' | 'medication'>('recent');

    // Modals
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<PharmacyOrder | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    // Queries
    const {
        data: ordersData = [],
        isLoading,
        isRefetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ['pharmacyOrders', selectedTenant, searchTerm],
        queryFn: () => getPharmacyOrders({ tenantId: selectedTenant, search: searchTerm }),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: statsData } = useQuery({
        queryKey: ['pharmacyStats', selectedTenant],
        queryFn: () => getPharmacyStats(selectedTenant),
    });

    const orderList: PharmacyOrder[] = Array.isArray(ordersData) ? ordersData : [];
    const tenantList = Array.isArray(tenantsData) ? tenantsData : [];

    // Aggregated Metrics
    const metrics = useMemo(() => {
        const total = orderList.length;
        const pendingTriage = orderList.filter(
            (o) => o.status === 'Pending Verification' || o.status === 'Clinical Hold'
        ).length;
        const dispensed = orderList.filter((o) => o.status === 'Dispensed').length;
        const statCount = orderList.filter(
            (o) => o.urgency === 'STAT' && o.status !== 'Dispensed'
        ).length;

        return {
            total: statsData?.totalOrdersToday || total,
            pendingTriage: statsData?.pendingTriageCount ?? pendingTriage,
            dispensed: statsData?.completedTodayCount ?? dispensed,
            statCount: statsData?.statOrdersCount ?? statCount,
        };
    }, [orderList, statsData]);

    // Filter and Sort Pipeline
    const filteredOrders = useMemo(() => {
        return orderList
            .filter((order) => {
                const term = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    !term ||
                    order.orderNumber.toLowerCase().includes(term) ||
                    order.medicationName.toLowerCase().includes(term) ||
                    order.patientName.toLowerCase().includes(term) ||
                    order.patientMRN.toLowerCase().includes(term) ||
                    order.prescriberName.toLowerCase().includes(term);

                const matchesTenant =
                    selectedTenant === 'ALL' || order.patientTenantId === selectedTenant;

                const matchesStatus =
                    selectedStatus === 'ALL' || order.status === selectedStatus;

                const matchesUrgency =
                    selectedUrgency === 'ALL' || order.urgency === selectedUrgency;

                return matchesSearch && matchesTenant && matchesStatus && matchesUrgency;
            })
            .sort((a, b) => {
                if (sortBy === 'urgency') {
                    const weight: Record<string, number> = { STAT: 3, Urgent: 2, Routine: 1, Discharge: 0 };
                    return (weight[b.urgency] || 0) - (weight[a.urgency] || 0);
                }
                if (sortBy === 'patient') {
                    return a.patientName.localeCompare(b.patientName);
                }
                if (sortBy === 'medication') {
                    return a.medicationName.localeCompare(b.medicationName);
                }
                // default: recent
                return new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime();
            });
    }, [orderList, searchTerm, selectedTenant, selectedStatus, selectedUrgency, sortBy]);

    // Handlers
    const handleOpenDetails = (order: PharmacyOrder) => {
        setSelectedOrderForDetails(order);
        setIsDetailsModalOpen(true);
    };

    const handleUpdateStatus = async (
        orderId: string,
        status: PharmacyTriageStatus,
        details?: {
            verifiedBy?: string;
            clinicalNotes?: string;
        }
    ) => {
        await updateOrderStatus(orderId, status, details);
        queryClient.invalidateQueries({ queryKey: ['pharmacyOrders'] });
        queryClient.invalidateQueries({ queryKey: ['pharmacyStats'] });
        showToast(`Order status updated to "${status}".`, 'success');
    };

    const handleOverrideAlert = async (orderId: string, alertId: string, reason: string) => {
        const updated = await overrideSafetyAlert(orderId, alertId, reason, 'PharmD. Alex Chen, BCPS');
        setSelectedOrderForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['pharmacyOrders'] });
        queryClient.invalidateQueries({ queryKey: ['pharmacyStats'] });
        showToast('Clinical safety alert override documented with signature.', 'info');
    };

    const handleCreatePrescription = async (payload: Partial<PharmacyOrder>) => {
        const newOrder = await createPharmacyOrder(payload);
        queryClient.invalidateQueries({ queryKey: ['pharmacyOrders'] });
        queryClient.invalidateQueries({ queryKey: ['pharmacyStats'] });
        showToast(`Prescription ${newOrder.orderNumber} successfully registered.`, 'success');
    };

    const handleExportCSV = () => {
        if (filteredOrders.length === 0) {
            showToast('No prescription records to export.', 'info');
            return;
        }

        const headers = [
            'Order Number',
            'Patient Name',
            'MRN',
            'Medication Name',
            'Dose',
            'Route',
            'Frequency',
            'Urgency',
            'Status',
            'Prescriber',
            'Facility',
            'Prescribed At',
        ];

        const rows = filteredOrders.map((o) => [
            o.orderNumber,
            `"${o.patientName}"`,
            o.patientMRN,
            `"${o.medicationName}"`,
            `"${o.dose}"`,
            `"${o.route}"`,
            `"${o.frequency}"`,
            o.urgency,
            o.status,
            `"${o.prescriberName}"`,
            `"${o.patientTenantName}"`,
            o.prescribedAt ? format(new Date(o.prescribedAt), 'yyyy-MM-dd HH:mm') : '',
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `raphamis_pharmacy_orders_${format(new Date(), 'yyyy-MM-dd')}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredOrders.length} prescription records to CSV.`);
    };

    return (
        <div className="space-y-6">
            {toastMessage && (
                <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-neutral">Pharmacy & Medication Management</h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Prescription Orders
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Centralized prescription orders, pharmacist clinical review, dispensing workflow, and hospital medication fulfillment.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading || isRefetching}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Refresh orders"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-teal-600' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Export Orders
                    </button>

                    <button
                        onClick={() => setIsNewOrderOpen(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        New Prescription
                    </button>
                </div>
            </div>

            {/* Statistical Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Orders */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Prescriptions</p>
                        <p className="text-2xl font-bold text-neutral mt-1">{metrics.total.toLocaleString()}</p>
                        <p className="text-[11px] text-teal-600 font-medium mt-1">Active across network</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <Pill className="h-6 w-6" />
                    </div>
                </div>

                {/* 2. Pending Verification */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Review</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.pendingTriage}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Awaiting pharmacist verification</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Clock className="h-6 w-6" />
                    </div>
                </div>

                {/* 3. Dispensed & Fulfilled */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Dispensed & Fulfilled</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{metrics.dispensed}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Completed today</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                </div>

                {/* 4. STAT / Urgent Priority */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">STAT / Urgent Priority</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-red-600">{metrics.statCount}</p>
                            {metrics.statCount > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-red-600 font-medium mt-1">Emergency & ICU priority</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Rx#, Medication, Patient, MRN, Prescriber..."
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Facility / Tenant Filter */}
                    <div>
                        <select
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Hospital Facilities</option>
                            {tenantList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Order Statuses</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="In Dispensing">In Dispensing</option>
                            <option value="Dispensed">Dispensed</option>
                            <option value="Clinical Hold">Clinical Hold</option>
                        </select>
                    </div>

                    {/* Urgency & Sort */}
                    <div className="flex gap-2">
                        <select
                            value={selectedUrgency}
                            onChange={(e) => setSelectedUrgency(e.target.value)}
                            className="w-full py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Urgencies</option>
                            <option value="STAT">STAT</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Routine">Routine</option>
                            <option value="Discharge">Discharge</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-32 py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="recent">Recent</option>
                            <option value="urgency">Urgency</option>
                            <option value="patient">Patient</option>
                            <option value="medication">Medication</option>
                        </select>
                    </div>
                </div>

                {/* Filter tags & active result count */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div>
                        Showing <strong>{filteredOrders.length}</strong> of <strong>{orderList.length}</strong> prescription orders
                        {(selectedTenant !== 'ALL' || selectedStatus !== 'ALL' || selectedUrgency !== 'ALL' || searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTenant('ALL');
                                    setSelectedStatus('ALL');
                                    setSelectedUrgency('ALL');
                                }}
                                className="ml-3 text-teal-600 hover:underline font-semibold"
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span> STAT / Critical
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Pending Review
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Dispensed
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders Table (Desktop) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-5 py-3.5">Rx & Medication</th>
                                <th scope="col" className="px-4 py-3.5">Patient Details</th>
                                <th scope="col" className="px-4 py-3.5">Hospital & Prescriber</th>
                                <th scope="col" className="px-4 py-3.5">Urgency</th>
                                <th scope="col" className="px-4 py-3.5">Status</th>
                                <th scope="col" className="px-4 py-3.5">Prescribed</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                                            <span>Loading pharmacy prescriptions...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-red-500">
                                        Error loading pharmacy orders. Please refresh the page.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        <Pill className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="font-semibold text-gray-700">No matching prescription orders found</p>
                                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                            Try adjusting your filter settings or create a new prescription order.
                                        </p>
                                        <button
                                            onClick={() => setIsNewOrderOpen(true)}
                                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                                        >
                                            + New Prescription
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {filteredOrders.map((order) => {
                                const isStat = order.urgency === 'STAT';
                                const isHold = order.status === 'Clinical Hold';

                                let formattedDate = 'N/A';
                                try {
                                    formattedDate = format(new Date(order.prescribedAt), 'MMM d, yyyy HH:mm');
                                } catch {
                                    formattedDate = String(order.prescribedAt);
                                }

                                const urgencyBadgeClass = {
                                    STAT: 'bg-red-100 text-red-800 border-red-200 font-semibold',
                                    Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
                                    Routine: 'bg-gray-100 text-gray-700 border-gray-200',
                                    Discharge: 'bg-blue-100 text-blue-800 border-blue-200',
                                }[order.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-teal-50/40 transition ${
                                            isStat ? 'bg-red-50/30' : isHold ? 'bg-amber-50/20' : 'bg-white'
                                        }`}
                                    >
                                        {/* Medication & Rx Number */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200">
                                                    <Pill className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleOpenDetails(order)}
                                                        className="font-semibold text-gray-900 hover:text-teal-700 text-left"
                                                    >
                                                        {order.medicationName}
                                                    </button>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                        <span className="font-mono">{order.orderNumber}</span>
                                                        <span>•</span>
                                                        <span>{order.dose} ({order.route})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Patient Info */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.patientName}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    MRN: {order.patientMRN}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {order.patientAge}y • {order.patientGender} • {order.patientLocation}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Facility & Prescriber */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-gray-900 font-medium">{order.patientTenantName}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {order.prescriberName} ({order.prescriberDepartment})
                                                </p>
                                            </div>
                                        </td>

                                        {/* Urgency */}
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${urgencyBadgeClass}`}>
                                                {order.urgency === 'STAT' && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
                                                )}
                                                {order.urgency}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={order.status} size="sm" />
                                        </td>

                                        {/* Prescribed Time */}
                                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                                            {formattedDate}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenDetails(order)}
                                                    className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Details
                                                </button>

                                                {order.status === 'Pending Verification' && (
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateStatus(order.id, 'In Dispensing', {
                                                                verifiedBy: 'PharmD. Alex Chen, BCPS',
                                                            })
                                                        }
                                                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
                                                        title="Quick Verify"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        Verify
                                                    </button>
                                                )}

                                                {order.status === 'In Dispensing' && (
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateStatus(order.id, 'Dispensed', {
                                                                verifiedBy: 'PharmD. Alex Chen, BCPS',
                                                            })
                                                        }
                                                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1"
                                                        title="Mark as Dispensed"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Dispense
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-neutral text-sm">{order.medicationName}</p>
                                    <p className="text-xs font-mono text-gray-500">{order.orderNumber} • {order.patientName}</p>
                                </div>
                                <StatusBadge status={order.status} size="sm" />
                            </div>
                            <div className="text-xs text-gray-600 flex justify-between">
                                <span>{order.dose} • {order.route}</span>
                                <span className="font-semibold text-red-600">{order.urgency}</span>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => handleOpenDetails(order)}
                                    className="px-3 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg"
                                >
                                    Review Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <PharmacyOrderDetailsModal
                order={selectedOrderForDetails}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onUpdateStatus={handleUpdateStatus}
                onOverrideAlert={handleOverrideAlert}
            />

            <NewPrescriptionModal
                isOpen={isNewOrderOpen}
                onClose={() => setIsNewOrderOpen(false)}
                onSubmit={handleCreatePrescription}
            />
        </div>
    );
};
