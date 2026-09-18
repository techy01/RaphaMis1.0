import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Package,
    Search,
    RefreshCw,
    Plus,
    FileSpreadsheet,
    X,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ShoppingCart,
    DollarSign,
    Layers,
    ShieldAlert,
    Truck,
    SlidersHorizontal,
    ArrowUpRight,
    ArrowDownLeft,
    Check,
} from 'lucide-react';
import {
    getInventoryItems,
    getPurchaseOrders,
    getInventoryStats,
    getStockMovements,
    createInventoryItem,
    logStockMovement,
    createPurchaseOrder,
    receivePurchaseOrder,
} from '../../api/inventoryApi';
import { getTenants } from '../../api/tenantsApi';
import {
    InventoryItem,
    PurchaseOrder,
    StockMovement,
    InventoryCategory,
    InventoryStockStatus,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Toast } from '../shared/Toast';
import { AdjustStockModal } from '../inventory/AdjustStockModal';
import { NewInventoryItemModal } from '../inventory/NewInventoryItemModal';
import { NewPurchaseOrderModal } from '../inventory/NewPurchaseOrderModal';
import { StockMovementsHistoryModal } from '../inventory/StockMovementsHistoryModal';

export const InventoryView: React.FC = () => {
    const queryClient = useQueryClient();

    // Active View Tab
    const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');

    // Filters and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'stock' | 'valuation' | 'status'>('name');

    // Modals
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);

    const [isNewItemOpen, setIsNewItemOpen] = useState(false);

    const [selectedItemForPO, setSelectedItemForPO] = useState<InventoryItem | null>(null);
    const [isNewPOOpen, setIsNewPOOpen] = useState(false);

    const [isMovementsOpen, setIsMovementsOpen] = useState(false);

    // Toast notifications
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    // Queries
    const {
        data: itemsData = [],
        isLoading: itemsLoading,
        isRefetching: itemsRefetching,
        error: itemsError,
        refetch: refetchItems,
    } = useQuery({
        queryKey: ['inventoryItems', selectedTenant, searchTerm, selectedCategory, selectedStatus],
        queryFn: () =>
            getInventoryItems({
                tenantId: selectedTenant,
                search: searchTerm,
                category: selectedCategory,
                status: selectedStatus,
            }),
    });

    const { data: purchaseOrdersData = [], refetch: refetchPOs } = useQuery({
        queryKey: ['purchaseOrders', selectedTenant],
        queryFn: () => getPurchaseOrders(selectedTenant),
    });

    const { data: movementsData = [] } = useQuery({
        queryKey: ['stockMovements'],
        queryFn: () => getStockMovements(),
    });

    const { data: statsData } = useQuery({
        queryKey: ['inventoryStats', selectedTenant],
        queryFn: () => getInventoryStats(selectedTenant),
    });

    const { data: tenantsData = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const items: InventoryItem[] = Array.isArray(itemsData) ? itemsData : [];
    const purchaseOrders: PurchaseOrder[] = Array.isArray(purchaseOrdersData) ? purchaseOrdersData : [];
    const movements: StockMovement[] = Array.isArray(movementsData) ? movementsData : [];
    const tenants = Array.isArray(tenantsData) ? tenantsData : [];

    // Aggregated Metrics
    const metrics = useMemo(() => {
        const totalVal = items.reduce((acc, i) => acc + i.quantityOnHand * i.unitCost, 0);
        const lowStock = items.filter((i) => i.status === 'Low Stock').length;
        const outOfStock = items.filter((i) => i.status === 'Out of Stock').length;
        const pendingPOs = purchaseOrders.filter((p) => p.status === 'Pending Approval' || p.status === 'Dispatched').length;

        return {
            valuation: statsData?.totalValuation ?? totalVal,
            lowStock: statsData?.lowStockCount ?? lowStock,
            outOfStock: statsData?.outOfStockCount ?? outOfStock,
            pendingPOs: statsData?.pendingPOCount ?? pendingPOs,
        };
    }, [items, purchaseOrders, statsData]);

    // Filter & Sort Pipeline
    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
                const term = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    !term ||
                    item.name.toLowerCase().includes(term) ||
                    item.sku.toLowerCase().includes(term) ||
                    item.storageLocation.toLowerCase().includes(term) ||
                    item.supplierName.toLowerCase().includes(term) ||
                    (item.lotNumber && item.lotNumber.toLowerCase().includes(term));

                const matchesTenant = selectedTenant === 'ALL' || item.tenantId === selectedTenant;
                const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
                const matchesStat = selectedStatus === 'ALL' || item.status === selectedStatus;

                return matchesSearch && matchesTenant && matchesCat && matchesStat;
            })
            .sort((a, b) => {
                if (sortBy === 'stock') return a.quantityOnHand - b.quantityOnHand;
                if (sortBy === 'valuation') return (b.quantityOnHand * b.unitCost) - (a.quantityOnHand * a.unitCost);
                if (sortBy === 'status') return a.status.localeCompare(b.status);
                return a.name.localeCompare(b.name);
            });
    }, [items, searchTerm, selectedTenant, selectedCategory, selectedStatus, sortBy]);

    // Actions
    const handleAdjustStock = async (payload: {
        itemId: string;
        type: any;
        quantityDelta: number;
        performedBy: string;
        destinationDepartment?: string;
        reason: string;
        poNumber?: string;
    }) => {
        await logStockMovement(payload);
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
        showToast(`Stock movement recorded successfully.`, 'success');
    };

    const handleCreateItem = async (payload: Partial<InventoryItem>) => {
        const created = await createInventoryItem(payload);
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
        showToast(`Item "${created.name}" registered to catalog.`, 'success');
    };

    const handleCreatePO = async (payload: Partial<PurchaseOrder>) => {
        const po = await createPurchaseOrder(payload);
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
        showToast(`Purchase order ${po.poNumber} issued successfully.`, 'success');
    };

    const handleReceivePO = async (poId: string) => {
        const received = await receivePurchaseOrder(poId, 'Receiving Dock Supervisor');
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
        showToast(`PO ${received.poNumber} received and added to inventory stock.`, 'success');
    };

    const handleExportCSV = () => {
        if (filteredItems.length === 0) {
            showToast('No inventory records to export.', 'info');
            return;
        }

        const headers = [
            'SKU',
            'Item Name',
            'Category',
            'Quantity On Hand',
            'Unit of Measure',
            'Par Reorder Level',
            'Target Max Stock',
            'Unit Cost ($)',
            'Total Valuation ($)',
            'Status',
            'Storage Location',
            'Supplier Name',
            'Facility',
            'Lot Number',
            'Expiration Date',
        ];

        const rows = filteredItems.map((i) => [
            i.sku,
            `"${i.name}"`,
            `"${i.category}"`,
            i.quantityOnHand,
            i.unitOfMeasure,
            i.reorderLevel,
            i.targetMaxStock,
            i.unitCost.toFixed(2),
            (i.quantityOnHand * i.unitCost).toFixed(2),
            i.status,
            `"${i.storageLocation}"`,
            `"${i.supplierName}"`,
            `"${i.tenantName}"`,
            i.lotNumber || '',
            i.expirationDate || '',
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raphamis_inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredItems.length} inventory records to CSV.`);
    };

    return (
        <div className="space-y-6">
            {toastMessage && (
                <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-neutral">Inventory & Medical Supply Chain</h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Supply Chain & Assets
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Multi-location stock monitoring, automated reorder par levels, purchase orders, and audit logging.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            refetchItems();
                            refetchPOs();
                        }}
                        disabled={itemsLoading || itemsRefetching}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <RefreshCw className={`h-4 w-4 ${itemsRefetching ? 'animate-spin text-teal-600' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setIsMovementsOpen(true)}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <Clock className="h-4 w-4 text-indigo-600" />
                        Movements Ledger
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Export CSV
                    </button>

                    <button
                        onClick={() => {
                            setSelectedItemForPO(null);
                            setIsNewPOOpen(true);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1.5"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Requisition PO
                    </button>

                    <button
                        onClick={() => setIsNewItemOpen(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        Add Catalog Item
                    </button>
                </div>
            </div>

            {/* 4 Statistical Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Valuation */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Stock Valuation</p>
                        <p className="text-2xl font-bold text-neutral mt-1">
                            ${metrics.valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-teal-600 font-medium mt-1">Across {items.length} active SKUs</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>

                {/* 2. Low Stock Alerts */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Items Below Par</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.lowStock}</p>
                        <p className="text-[11px] text-amber-600 font-medium mt-1">Reorder threshold reached</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                {/* 3. Out of Stock */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Critical Stockouts</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-red-600">{metrics.outOfStock}</p>
                            {metrics.outOfStock > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-red-600 font-medium mt-1">Zero balance items</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                </div>

                {/* 4. Active Purchase Orders */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-indigo-700 mt-1">{metrics.pendingPOs}</p>
                        <p className="text-[11px] text-indigo-600 font-medium mt-1">Awaiting vendor delivery</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Truck className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Tab Selector & Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`py-3 px-6 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                        activeTab === 'catalog'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Package className="h-4 w-4" />
                    Inventory Stock & Par Levels ({items.length})
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-3 px-6 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                        activeTab === 'orders'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <ShoppingCart className="h-4 w-4" />
                    Purchase Orders & Inbound Supply ({purchaseOrders.length})
                </button>
            </div>

            {/* TAB 1: Inventory Stock Catalog */}
            {activeTab === 'catalog' && (
                <>
                    {/* Filters Toolbar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by SKU, Name, Bin, Supplier, Lot..."
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

                            {/* Facility Filter */}
                            <div>
                                <select
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                    className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="ALL">All Facilities</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="ALL">All Categories</option>
                                    <option value="Surgical & Wound Care">Surgical & Wound Care</option>
                                    <option value="Pharmaceuticals & Solutions">Pharmaceuticals & Solutions</option>
                                    <option value="Diagnostic & Lab Reagents">Diagnostic & Lab Reagents</option>
                                    <option value="PPE & Infection Control">PPE & Infection Control</option>
                                    <option value="Biomedical Equipment">Biomedical Equipment</option>
                                    <option value="General Medical Consumables">General Consumables</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="ALL">All Stock Statuses</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Expiring Soon">Expiring Soon</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="stock">Sort by Stock Qty</option>
                                    <option value="valuation">Sort by Valuation</option>
                                    <option value="status">Sort by Status</option>
                                </select>
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                            <div>
                                Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> inventory items
                                {(selectedTenant !== 'ALL' ||
                                    selectedCategory !== 'ALL' ||
                                    selectedStatus !== 'ALL' ||
                                    searchTerm) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedTenant('ALL');
                                            setSelectedCategory('ALL');
                                            setSelectedStatus('ALL');
                                        }}
                                        className="ml-3 text-teal-600 hover:underline font-semibold"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Adequate Par
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Par Low
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-red-500"></span> Stockout
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5">Item & SKU</th>
                                        <th scope="col" className="px-4 py-3.5">Storage & Supplier</th>
                                        <th scope="col" className="px-4 py-3.5">Stock Par Gauge</th>
                                        <th scope="col" className="px-4 py-3.5">Unit Cost & Value</th>
                                        <th scope="col" className="px-4 py-3.5">Stock Status</th>
                                        <th scope="col" className="px-4 py-3.5">Facility</th>
                                        <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {itemsLoading && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-500">
                                                <div className="flex justify-center items-center gap-2">
                                                    <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                                                    <span>Loading inventory catalog...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!itemsLoading && filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-gray-500">
                                                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                <p className="font-semibold text-gray-700">No matching inventory items found</p>
                                                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                                    Check your filter settings or register a new medical supply item.
                                                </p>
                                                <button
                                                    onClick={() => setIsNewItemOpen(true)}
                                                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                                                >
                                                    + Add Catalog Item
                                                </button>
                                            </td>
                                        </tr>
                                    )}

                                    {filteredItems.map((item) => {
                                        const totalValue = item.quantityOnHand * item.unitCost;
                                        const pct = Math.min(
                                            100,
                                            Math.round((item.quantityOnHand / (item.targetMaxStock || 100)) * 100)
                                        );
                                        const isLow = item.quantityOnHand <= item.reorderLevel;
                                        const isZero = item.quantityOnHand === 0;

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-teal-50/40 transition ${
                                                    isZero ? 'bg-red-50/30' : isLow ? 'bg-amber-50/20' : 'bg-white'
                                                }`}
                                            >
                                                {/* Item & SKU */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs shrink-0 border ${
                                                                isZero
                                                                    ? 'bg-red-100 text-red-700 border-red-200'
                                                                    : isLow
                                                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                    : 'bg-teal-50 text-teal-700 border-teal-200'
                                                            }`}
                                                        >
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                                <span className="font-mono">{item.sku}</span>
                                                                <span>•</span>
                                                                <span className="text-teal-700 font-medium">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Location & Supplier */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.storageLocation}</p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5">{item.supplierName}</p>
                                                        {item.expirationDate && (
                                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                                Exp: {item.expirationDate}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Stock Level Progress */}
                                                <td className="px-4 py-3.5 min-w-[170px]">
                                                    <div>
                                                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                                                            <span className={isZero ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-gray-900'}>
                                                                {item.quantityOnHand} {item.unitOfMeasure}
                                                            </span>
                                                            <span className="text-gray-400 font-normal">
                                                                Par: {item.reorderLevel} | Max: {item.targetMaxStock}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full transition-all ${
                                                                    isZero
                                                                        ? 'bg-red-500'
                                                                        : isLow
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-teal-600'
                                                                }`}
                                                                style={{ width: `${Math.max(5, pct)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Valuation */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            ${item.unitCost.toFixed(2)} / {item.unitOfMeasure}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={item.status} size="sm" />
                                                </td>

                                                {/* Facility */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-gray-800 font-medium">{item.tenantName}</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItemForAdjust(item);
                                                                setIsAdjustOpen(true);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                                                        >
                                                            Adjust Stock
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedItemForPO(item);
                                                                setIsNewPOOpen(true);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1"
                                                            title="Create Purchase Order"
                                                        >
                                                            <ShoppingCart className="h-3.5 w-3.5 text-gray-500" />
                                                            Reorder
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <div key={item.id} className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-neutral text-sm">{item.name}</p>
                                            <p className="text-xs font-mono text-gray-500">
                                                {item.sku} • {item.storageLocation}
                                            </p>
                                        </div>
                                        <StatusBadge status={item.status} size="sm" />
                                    </div>
                                    <div className="text-xs text-gray-600 flex justify-between">
                                        <span>
                                            On Hand: <strong>{item.quantityOnHand} {item.unitOfMeasure}</strong>
                                        </span>
                                        <span>
                                            Value: <strong>${(item.quantityOnHand * item.unitCost).toFixed(2)}</strong>
                                        </span>
                                    </div>
                                    <div className="pt-2 flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedItemForAdjust(item);
                                                setIsAdjustOpen(true);
                                            }}
                                            className="px-3 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg"
                                        >
                                            Adjust Stock
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedItemForPO(item);
                                                setIsNewPOOpen(true);
                                            }}
                                            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded-lg"
                                        >
                                            Reorder
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* TAB 2: Purchase Orders & Procurement */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                        <div>
                            <h3 className="text-sm font-bold text-neutral">Active Purchase Orders</h3>
                            <p className="text-xs text-gray-500">
                                Direct procurement from medical suppliers. Click &quot;Receive Inbound&quot; to intake delivery into inventory.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedItemForPO(null);
                                setIsNewPOOpen(true);
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Issue Purchase Order
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        <table className="w-full text-xs text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3.5">PO Number & Item</th>
                                    <th className="px-4 py-3.5">Supplier / Vendor</th>
                                    <th className="px-4 py-3.5">Quantity</th>
                                    <th className="px-4 py-3.5">Total Amount</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Delivery Target</th>
                                    <th className="px-5 py-3.5 text-right">Intake Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchaseOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-400">
                                            No purchase orders found.
                                        </td>
                                    </tr>
                                )}

                                {purchaseOrders.map((po) => {
                                    const isReceived = po.status === 'Received';
                                    return (
                                        <tr key={po.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-5 py-3.5">
                                                <p className="font-bold text-gray-900 font-mono">{po.poNumber}</p>
                                                <p className="text-gray-700 font-medium mt-0.5">{po.itemName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{po.itemSku}</p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-medium text-gray-900">{po.supplierName}</p>
                                                <p className="text-[11px] text-gray-500">{po.tenantName}</p>
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-gray-800">
                                                {po.quantity} units
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-gray-900">
                                                ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={po.status} size="sm" />
                                            </td>
                                            <td className="px-4 py-3.5 text-[11px] text-gray-600">
                                                {po.expectedDeliveryDate || 'Standard Delivery'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                {!isReceived ? (
                                                    <button
                                                        onClick={() => handleReceivePO(po.id)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        Receive Delivery
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                                                        <CheckCircle2 className="h-4 w-4" /> Received & Stocked
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AdjustStockModal
                item={selectedItemForAdjust}
                isOpen={isAdjustOpen}
                onClose={() => setIsAdjustOpen(false)}
                onSubmit={handleAdjustStock}
            />

            <NewInventoryItemModal
                isOpen={isNewItemOpen}
                onClose={() => setIsNewItemOpen(false)}
                onSubmit={handleCreateItem}
            />

            <NewPurchaseOrderModal
                items={items}
                defaultItem={selectedItemForPO}
                isOpen={isNewPOOpen}
                onClose={() => setIsNewPOOpen(false)}
                onSubmit={handleCreatePO}
            />

            <StockMovementsHistoryModal
                movements={movements}
                isOpen={isMovementsOpen}
                onClose={() => setIsMovementsOpen(false)}
            />
        </div>
    );
};
