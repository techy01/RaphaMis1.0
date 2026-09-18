import React, { useState, useMemo } from 'react';
import {
    Boxes,
    Search,
    AlertTriangle,
    ThermometerSnowflake,
    Lock,
    PlusCircle,
    CheckCircle2,
    RefreshCw,
    TrendingDown,
    DollarSign,
    Layers,
    X,
} from 'lucide-react';
import { PharmacyFormularyItem } from '../../packages/shared/types';
import { restockFormularyItem } from '../../api/pharmacyApi';

interface SmartFormularyViewProps {
    inventory: PharmacyFormularyItem[];
    onRefresh: () => void;
    onTriggerToast: (msg: string) => void;
}

export const SmartFormularyView: React.FC<SmartFormularyViewProps> = ({
    inventory,
    onRefresh,
    onTriggerToast,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [search, setSearch] = useState<string>('');
    const [restockingItem, setRestockingItem] = useState<PharmacyFormularyItem | null>(null);
    const [restockAmount, setRestockAmount] = useState<number>(50);
    const [isRestocking, setIsRestocking] = useState<boolean>(false);

    const categories = [
        'All',
        'Emergency / Code',
        'Antimicrobial',
        'Cardiovascular',
        'Analgesic',
        'Oncology',
        'Endocrine',
    ];

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch =
                !search.trim() ||
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.genericName.toLowerCase().includes(search.toLowerCase()) ||
                item.ndc.toLowerCase().includes(search.toLowerCase()) ||
                item.lotNumber.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [inventory, selectedCategory, search]);

    // Inventory KPIs
    const kpis = useMemo(() => {
        const totalItems = inventory.length;
        const lowStockCount = inventory.filter((i) => i.stockOnHand <= i.reorderPoint).length;
        const coldChainCount = inventory.filter((i) => i.storageTemperature === 'Refrigerated (2-8°C)').length;
        const totalValue = inventory.reduce((acc, i) => acc + i.stockOnHand * i.unitCost, 0);

        return {
            totalItems,
            lowStockCount,
            coldChainCount,
            totalValue,
        };
    }, [inventory]);

    const handleConfirmRestock = async () => {
        if (!restockingItem || restockAmount <= 0) return;
        setIsRestocking(true);
        try {
            await restockFormularyItem(restockingItem.id, Number(restockAmount));
            onTriggerToast(`Successfully restocked ${restockAmount} units of ${restockingItem.name}`);
            setRestockingItem(null);
            onRefresh();
        } finally {
            setIsRestocking(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Inventory KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Hospital Formulary SKUs
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-gray-900">{kpis.totalItems}</span>
                        <span className="text-xs text-gray-500">Active Formulations</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Low Stock Reorder Alerts
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-2xl font-black ${kpis.lowStockCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                            {kpis.lowStockCount}
                        </span>
                        <span className="text-xs text-amber-600 font-semibold">Below Par Level</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        IoT Cold-Chain Telemetry
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-teal-700">{kpis.coldChainCount}</span>
                        <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                            <ThermometerSnowflake className="w-3.5 h-3.5" />
                            Active 2-8°C Probes
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Total Stock Valuation
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-gray-900">
                            ${kpis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs text-gray-500">On-Hand Assets</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                                selectedCategory === cat
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search formulary drug, NDC, lot..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                </div>
            </div>

            {/* Formulary Inventory Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Medication & Formulary NDC</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Stock on Hand / Par Level</th>
                                <th className="py-3 px-4">Storage & IoT Temp</th>
                                <th className="py-3 px-4">Lot & Expiration</th>
                                <th className="py-3 px-4">Storage Location</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInventory.map((item) => {
                                const fillPercentage = Math.min(100, Math.round((item.stockOnHand / item.parLevel) * 100));
                                const isLowStock = item.stockOnHand <= item.reorderPoint;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/70 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-gray-900 text-xs">
                                                    {item.name}
                                                </div>
                                                {item.isHighAlert && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        HIGH-ALERT
                                                    </span>
                                                )}
                                                {item.isControlled && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                                                        <Lock className="w-2.5 h-2.5" />
                                                        C-II
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                NDC: {item.ndc} · {item.formulation}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                                                {item.category}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-1">
                                                <span>
                                                    {item.stockOnHand} {item.unit}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-normal">
                                                    Par: {item.parLevel}
                                                </span>
                                            </div>
                                            <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isLowStock
                                                            ? 'bg-amber-500'
                                                            : fillPercentage > 80
                                                            ? 'bg-emerald-500'
                                                            : 'bg-teal-500'
                                                    }`}
                                                    style={{ width: `${fillPercentage}%` }}
                                                />
                                            </div>
                                            {isLowStock && (
                                                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Reorder Required (Par &lt; {item.reorderPoint})
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            {item.storageTemperature === 'Refrigerated (2-8°C)' ? (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 w-fit">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span>{item.currentTempCelsius ?? 3.8}°C</span>
                                                    <span className="text-[10px] text-teal-600 font-normal">(2-8°C Target)</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-600">
                                                    {item.storageTemperature}
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-mono text-gray-700 text-xs">
                                                {item.lotNumber}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Exp: {item.expirationDate}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-gray-600 text-xs">
                                            {item.location}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setRestockingItem(item)}
                                                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition shadow-2xs"
                                            >
                                                Restock
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Restock Modal */}
            {restockingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Restock Formulary Item
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {restockingItem.name} ({restockingItem.unit})
                                </p>
                            </div>
                            <button
                                onClick={() => setRestockingItem(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Current Stock:</span>
                                <span className="font-bold text-gray-900">{restockingItem.stockOnHand} {restockingItem.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Par Level Goal:</span>
                                <span className="font-bold text-gray-900">{restockingItem.parLevel} {restockingItem.unit}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Restock Quantity ({restockingItem.unit}):
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setRestockingItem(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRestock}
                                disabled={isRestocking || restockAmount <= 0}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                            >
                                {isRestocking ? 'Restocking...' : `Add +${restockAmount} ${restockingItem.unit}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
