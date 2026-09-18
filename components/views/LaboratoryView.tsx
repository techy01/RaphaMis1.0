import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    TestTube,
    Search,
    RefreshCw,
    Plus,
    FileSpreadsheet,
    X,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Eye,
    Edit3,
    Microscope,
    Activity,
    ShieldAlert,
    Cpu,
    Boxes,
    Radio,
    Terminal,
} from 'lucide-react';
import {
    getLabOrders,
    getLabStats,
    updateLabOrderStatus,
    recordLabResults,
    acknowledgeCriticalAlert,
    createLabOrder,
    getLabAnalyzers,
    getAnalyzerRawMessages,
    getLabQualityControls,
    getSpecimenRacks,
    getCriticalPanicAlerts,
} from '../../api/laboratoryApi';
import { getTenants } from '../../api/tenantsApi';
import {
    LabOrder,
    LabOrderStatus,
    LabTestParameter,
    LabAnalyzerDevice,
    AnalyzerRawMessage,
    LabQualityControl,
    SpecimenRack,
    CriticalPanicAlert,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Toast } from '../shared/Toast';
import { LabOrderDetailsModal } from '../laboratory/LabOrderDetailsModal';
import { LabResultEntryModal } from '../laboratory/LabResultEntryModal';
import { NewLabOrderModal } from '../laboratory/NewLabOrderModal';
import { AnalyzerManagerTab } from '../laboratory/AnalyzerManagerTab';
import { QualityControlTab } from '../laboratory/QualityControlTab';
import { SpecimenRackTab } from '../laboratory/SpecimenRackTab';
import { CriticalPanicAlertsTab } from '../laboratory/CriticalPanicAlertsTab';

export const LaboratoryView: React.FC = () => {
    const queryClient = useQueryClient();

    // Filters and search states
    const [activeTab, setActiveTab] = useState<'worklist' | 'analyzers' | 'qc' | 'racks' | 'panics'>('worklist');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedUrgency, setSelectedUrgency] = useState('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'urgency' | 'patient' | 'test'>('recent');

    // Modals
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<LabOrder | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [selectedOrderForResultEntry, setSelectedOrderForResultEntry] = useState<LabOrder | null>(null);
    const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);

    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

    // Toast notifications
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
        queryKey: ['labOrders', selectedTenant, searchTerm, selectedStatus, selectedCategory],
        queryFn: () =>
            getLabOrders({
                tenantId: selectedTenant,
                search: searchTerm,
                status: selectedStatus,
                category: selectedCategory,
            }),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: statsData } = useQuery({
        queryKey: ['labStats', selectedTenant],
        queryFn: () => getLabStats(selectedTenant),
    });

    // Phase 5 Queries
    const { data: analyzersData = [], refetch: refetchAnalyzers } = useQuery({
        queryKey: ['labAnalyzers'],
        queryFn: getLabAnalyzers,
    });

    const { data: analyzerLogsData = [], refetch: refetchLogs } = useQuery({
        queryKey: ['analyzerRawMessages'],
        queryFn: () => getAnalyzerRawMessages(),
    });

    const { data: qcData = [], refetch: refetchQC } = useQuery({
        queryKey: ['labQualityControls'],
        queryFn: getLabQualityControls,
    });

    const { data: racksData = [], refetch: refetchRacks } = useQuery({
        queryKey: ['specimenRacks'],
        queryFn: getSpecimenRacks,
    });

    const { data: panicAlertsData = [], refetch: refetchPanics } = useQuery({
        queryKey: ['criticalPanicAlerts'],
        queryFn: getCriticalPanicAlerts,
    });

    const orderList: LabOrder[] = Array.isArray(ordersData) ? ordersData : [];
    const tenantList = Array.isArray(tenantsData) ? tenantsData : [];
    const analyzerList: LabAnalyzerDevice[] = Array.isArray(analyzersData) ? analyzersData : [];
    const rawLogsList: AnalyzerRawMessage[] = Array.isArray(analyzerLogsData) ? analyzerLogsData : [];
    const qcList: LabQualityControl[] = Array.isArray(qcData) ? qcData : [];
    const rackList: SpecimenRack[] = Array.isArray(racksData) ? racksData : [];
    const panicList: CriticalPanicAlert[] = Array.isArray(panicAlertsData) ? panicAlertsData : [];

    const handleRefreshAllPhase5 = () => {
        refetch();
        refetchAnalyzers();
        refetchLogs();
        refetchQC();
        refetchRacks();
        refetchPanics();
    };

    // Aggregated Metrics
    const metrics = useMemo(() => {
        const total = orderList.length;
        const pendingCollection = orderList.filter(
            (o) => o.status === 'Ordered' || o.status === 'Sample Collected'
        ).length;
        const inAnalysis = orderList.filter((o) => o.status === 'In Analysis').length;
        const criticalAlerts = orderList.filter(
            (o) => o.status === 'Critical Alert' || o.hasCriticalAlert
        ).length;

        return {
            total: statsData?.totalOrdersToday ?? total,
            pendingCollection: statsData?.pendingCollectionCount ?? pendingCollection,
            inAnalysis: statsData?.inTestingCount ?? inAnalysis,
            criticalAlerts: statsData?.criticalAlertsCount ?? criticalAlerts,
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
                    order.accessionNumber.toLowerCase().includes(term) ||
                    order.testPanelName.toLowerCase().includes(term) ||
                    order.patientName.toLowerCase().includes(term) ||
                    order.patientMRN.toLowerCase().includes(term) ||
                    order.orderingPhysicianName.toLowerCase().includes(term);

                const matchesTenant =
                    selectedTenant === 'ALL' || order.patientTenantId === selectedTenant;

                const matchesCategory =
                    selectedCategory === 'ALL' || order.category === selectedCategory;

                const matchesStatus =
                    selectedStatus === 'ALL' || order.status === selectedStatus;

                const matchesUrgency =
                    selectedUrgency === 'ALL' || order.urgency === selectedUrgency;

                return matchesSearch && matchesTenant && matchesCategory && matchesStatus && matchesUrgency;
            })
            .sort((a, b) => {
                if (sortBy === 'urgency') {
                    const weight: Record<string, number> = { STAT: 3, Urgent: 2, Routine: 1 };
                    return (weight[b.urgency] || 0) - (weight[a.urgency] || 0);
                }
                if (sortBy === 'patient') {
                    return a.patientName.localeCompare(b.patientName);
                }
                if (sortBy === 'test') {
                    return a.testPanelName.localeCompare(b.testPanelName);
                }
                // default: recent
                return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
            });
    }, [orderList, searchTerm, selectedTenant, selectedCategory, selectedStatus, selectedUrgency, sortBy]);

    // Handlers
    const handleOpenDetails = (order: LabOrder) => {
        setSelectedOrderForDetails(order);
        setIsDetailsOpen(true);
    };

    const handleOpenResultEntry = (order: LabOrder) => {
        setSelectedOrderForResultEntry(order);
        setIsResultEntryOpen(true);
    };

    const handleAdvanceStatus = async (orderId: string, nextStatus: LabOrderStatus) => {
        const updated = await updateLabOrderStatus(orderId, nextStatus);
        setSelectedOrderForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['labOrders'] });
        queryClient.invalidateQueries({ queryKey: ['labStats'] });
        showToast(`Order status transitioned to "${nextStatus}".`, 'success');
    };

    const handleRecordResults = async (
        orderId: string,
        parameters: LabTestParameter[],
        options?: {
            analyzerInstrument?: string;
            technicianNotes?: string;
            pathologistNotes?: string;
            verifiedBy?: string;
        }
    ) => {
        const updated = await recordLabResults(orderId, parameters, options);
        setSelectedOrderForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['labOrders'] });
        queryClient.invalidateQueries({ queryKey: ['labStats'] });

        if (updated.hasCriticalAlert) {
            showToast('CRITICAL PANIC VALUE RECORDED. Verbal notification protocol initiated.', 'error');
        } else {
            showToast(`Results validated and released for ${updated.orderNumber}.`, 'success');
        }
    };

    const handleAcknowledgePanic = async (orderId: string) => {
        const updated = await acknowledgeCriticalAlert(
            orderId,
            'Dr. Sarah Lin, MD (Attending Physician)'
        );
        setSelectedOrderForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['labOrders'] });
        queryClient.invalidateQueries({ queryKey: ['labStats'] });
        showToast('Critical panic readback acknowledged and logged.', 'info');
    };

    const handleCreateOrder = async (payload: Partial<LabOrder>) => {
        const created = await createLabOrder(payload);
        queryClient.invalidateQueries({ queryKey: ['labOrders'] });
        queryClient.invalidateQueries({ queryKey: ['labStats'] });
        showToast(`Lab requisition ${created.orderNumber} created with Accession #${created.accessionNumber}.`, 'success');
    };

    const handleExportCSV = () => {
        if (filteredOrders.length === 0) {
            showToast('No lab records to export.', 'info');
            return;
        }

        const headers = [
            'Order Number',
            'Accession Number',
            'Patient Name',
            'MRN',
            'Test Panel',
            'Discipline',
            'Specimen',
            'Urgency',
            'Status',
            'Ordering Physician',
            'Facility',
            'Ordered At',
            'Completed At',
            'Critical Alert',
        ];

        const rows = filteredOrders.map((o) => [
            o.orderNumber,
            o.accessionNumber,
            `"${o.patientName}"`,
            o.patientMRN,
            `"${o.testPanelName}"`,
            o.category,
            `"${o.specimenType}"`,
            o.urgency,
            o.status,
            `"${o.orderingPhysicianName}"`,
            `"${o.patientTenantName}"`,
            o.orderedAt ? format(new Date(o.orderedAt), 'yyyy-MM-dd HH:mm') : '',
            o.completedAt ? format(new Date(o.completedAt), 'yyyy-MM-dd HH:mm') : '',
            o.hasCriticalAlert ? 'YES' : 'NO',
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raphamis_laboratory_orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredOrders.length} laboratory records to CSV.`);
    };

    return (
        <div className="space-y-6">
            {toastMessage && (
                <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-neutral">Laboratory Information System (LIS)</h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Diagnostic Services
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Phase 5 Production Ready
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Centralized specimen requisition, bench analyzer tracking, result validation, and clinical critical alert management.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleRefreshAllPhase5}
                        disabled={isLoading || isRefetching}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Refresh all LIS systems"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-teal-600' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Export LIS Log
                    </button>

                    <button
                        onClick={() => setIsNewOrderOpen(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        New Lab Order
                    </button>
                </div>
            </div>

            {/* LIS Navigation Tabs (Phase 5 Integrated) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 text-xs font-medium">
                <button
                    onClick={() => setActiveTab('worklist')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                        activeTab === 'worklist'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <TestTube className="w-4 h-4" />
                    Requisitions & Worklist
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeTab === 'worklist' ? 'bg-teal-700 text-teal-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {orderList.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('analyzers')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                        activeTab === 'analyzers'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    Analyzer Interfacing (ASTM/HL7)
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                        {analyzerList.filter((a) => a.status === 'ONLINE').length} Online
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('qc')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                        activeTab === 'qc'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Quality Control (Levey-Jennings)
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </button>

                <button
                    onClick={() => setActiveTab('racks')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                        activeTab === 'racks'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Boxes className="w-4 h-4" />
                    Specimen Barcoding & Racks
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeTab === 'racks' ? 'bg-teal-700 text-teal-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {rackList.length} Racks
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('panics')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                        activeTab === 'panics'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                    }`}
                >
                    <ShieldAlert className="w-4 h-4" />
                    Critical Panic Escalation
                    {panicList.filter((p) => !p.verbalReadbackConfirmed).length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                            {panicList.filter((p) => !p.verbalReadbackConfirmed).length} Urgent
                        </span>
                    )}
                </button>
            </div>

            {/* Statistical Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Orders */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Tests Today</p>
                        <p className="text-2xl font-bold text-neutral mt-1">{metrics.total.toLocaleString()}</p>
                        <p className="text-[11px] text-teal-600 font-medium mt-1">Active hospital network</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <TestTube className="h-6 w-6" />
                    </div>
                </div>

                {/* 2. Pending Collection / Transit */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Collection</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.pendingCollection}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Requisitioned & en route</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Clock className="h-6 w-6" />
                    </div>
                </div>

                {/* 3. In Bench Analysis */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">In Bench Analysis</p>
                        <p className="text-2xl font-bold text-indigo-700 mt-1">{metrics.inAnalysis}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Instrument processing</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Microscope className="h-6 w-6" />
                    </div>
                </div>

                {/* 4. Critical Panic Alerts */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Critical / Panic Values</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</p>
                            {metrics.criticalAlerts > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-red-600 font-medium mt-1">Immediate notification required</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Tab Content: 1. Requisitions & Worklist */}
            {activeTab === 'worklist' && (
                <>
                    {/* Filter and Search Toolbar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Order#, Accession, Test, Patient, MRN..."
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
                            <option value="ALL">All Facilities</option>
                            {tenantList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Discipline / Category Filter */}
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Disciplines</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Clinical Chemistry">Clinical Chemistry</option>
                            <option value="Coagulation">Coagulation</option>
                            <option value="Urinalysis">Urinalysis</option>
                            <option value="Immunology">Immunology</option>
                            <option value="Microbiology">Microbiology</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="In Analysis">In Analysis</option>
                            <option value="Completed">Completed</option>
                            <option value="Critical Alert">Critical Alert</option>
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
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-32 py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="recent">Recent</option>
                            <option value="urgency">Urgency</option>
                            <option value="patient">Patient</option>
                            <option value="test">Test</option>
                        </select>
                    </div>
                </div>

                {/* Filter tags & active result count */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div>
                        Showing <strong>{filteredOrders.length}</strong> of <strong>{orderList.length}</strong> laboratory orders
                        {(selectedTenant !== 'ALL' ||
                            selectedCategory !== 'ALL' ||
                            selectedStatus !== 'ALL' ||
                            selectedUrgency !== 'ALL' ||
                            searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTenant('ALL');
                                    setSelectedCategory('ALL');
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
                            <span className="h-2 w-2 rounded-full bg-red-500"></span> STAT / Critical Panic
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-indigo-500"></span> In Bench Analysis
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Completed
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
                                <th scope="col" className="px-5 py-3.5">Order & Diagnostic Panel</th>
                                <th scope="col" className="px-4 py-3.5">Patient Details</th>
                                <th scope="col" className="px-4 py-3.5">Specimen & Source</th>
                                <th scope="col" className="px-4 py-3.5">Urgency</th>
                                <th scope="col" className="px-4 py-3.5">Status</th>
                                <th scope="col" className="px-4 py-3.5">Ordering Physician</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                                            <span>Loading laboratory orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-red-500">
                                        Error loading laboratory requisitions. Please refresh.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        <TestTube className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="font-semibold text-gray-700">No matching laboratory orders found</p>
                                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                            Try adjusting your search criteria or register a new laboratory requisition.
                                        </p>
                                        <button
                                            onClick={() => setIsNewOrderOpen(true)}
                                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                                        >
                                            + New Lab Order
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {filteredOrders.map((order) => {
                                const isPanic = order.status === 'Critical Alert' || order.hasCriticalAlert;
                                const isStat = order.urgency === 'STAT';

                                const urgencyBadgeClass = {
                                    STAT: 'bg-red-100 text-red-800 border-red-200 font-semibold',
                                    Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
                                    Routine: 'bg-gray-100 text-gray-700 border-gray-200',
                                }[order.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-teal-50/40 transition ${
                                            isPanic ? 'bg-red-50/30' : isStat ? 'bg-amber-50/20' : 'bg-white'
                                        }`}
                                    >
                                        {/* Order & Panel */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs shrink-0 border ${
                                                        isPanic
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-200'
                                                    }`}
                                                >
                                                    {isPanic ? (
                                                        <ShieldAlert className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <TestTube className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleOpenDetails(order)}
                                                        className="font-semibold text-gray-900 hover:text-teal-700 text-left"
                                                    >
                                                        {order.testPanelName}
                                                    </button>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                        <span className="font-mono">{order.orderNumber}</span>
                                                        <span>•</span>
                                                        <span className="text-teal-700 font-medium">
                                                            {order.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Patient Details */}
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

                                        {/* Specimen Info */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-gray-900 font-medium">{order.specimenType}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    Acc: {order.accessionNumber}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Urgency */}
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${urgencyBadgeClass}`}
                                            >
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

                                        {/* Physician & Facility */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-gray-900 font-medium">{order.orderingPhysicianName}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {order.patientTenantName}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenDetails(order)}
                                                    className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Report
                                                </button>

                                                <button
                                                    onClick={() => handleOpenResultEntry(order)}
                                                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1"
                                                    title="Enter / Edit Results"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5 text-gray-600" />
                                                    Results
                                                </button>
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
                                    <p className="font-bold text-neutral text-sm">{order.testPanelName}</p>
                                    <p className="text-xs font-mono text-gray-500">
                                        {order.orderNumber} • {order.patientName}
                                    </p>
                                </div>
                                <StatusBadge status={order.status} size="sm" />
                            </div>
                            <div className="text-xs text-gray-600 flex justify-between">
                                <span>{order.specimenType}</span>
                                <span className="font-semibold text-red-600">{order.urgency}</span>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenResultEntry(order)}
                                    className="px-3 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded-lg"
                                >
                                    Enter Results
                                </button>
                                <button
                                    onClick={() => handleOpenDetails(order)}
                                    className="px-3 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg"
                                >
                                    View Report
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </>
            )}

            {/* Tab Content: 2. Analyzer Interfacing (Phase 5) */}
            {activeTab === 'analyzers' && (
                <AnalyzerManagerTab
                    analyzers={analyzerList}
                    rawLogs={rawLogsList}
                    onRefresh={handleRefreshAllPhase5}
                    onOrderUpdated={(order) => {
                        queryClient.invalidateQueries({ queryKey: ['labOrders'] });
                        queryClient.invalidateQueries({ queryKey: ['labStats'] });
                        showToast(`Analyzer result synchronized with requisition ${order.orderNumber}.`, 'success');
                    }}
                    showToast={showToast}
                />
            )}

            {/* Tab Content: 3. Quality Control (Levey-Jennings) (Phase 5) */}
            {activeTab === 'qc' && (
                <QualityControlTab
                    qcList={qcList}
                    onRefresh={handleRefreshAllPhase5}
                    showToast={showToast}
                />
            )}

            {/* Tab Content: 4. Specimen Barcoding & Racks (Phase 5) */}
            {activeTab === 'racks' && (
                <SpecimenRackTab
                    racks={rackList}
                    onRefresh={handleRefreshAllPhase5}
                    showToast={showToast}
                />
            )}

            {/* Tab Content: 5. Critical Panic Escalation (Phase 5) */}
            {activeTab === 'panics' && (
                <CriticalPanicAlertsTab
                    alerts={panicList}
                    onRefresh={handleRefreshAllPhase5}
                    showToast={showToast}
                />
            )}

            {/* Modals */}
            <LabOrderDetailsModal
                order={selectedOrderForDetails}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onOpenResultEntry={(order) => {
                    setSelectedOrderForResultEntry(order);
                    setIsResultEntryOpen(true);
                }}
                onAdvanceStatus={handleAdvanceStatus}
                onAcknowledgePanic={handleAcknowledgePanic}
            />

            <LabResultEntryModal
                order={selectedOrderForResultEntry}
                isOpen={isResultEntryOpen}
                onClose={() => setIsResultEntryOpen(false)}
                onSubmitResults={handleRecordResults}
            />

            <NewLabOrderModal
                isOpen={isNewOrderOpen}
                onClose={() => setIsNewOrderOpen(false)}
                onSubmit={handleCreateOrder}
            />
        </div>
    );
};
