import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    Clock,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCcw,
    Layers,
    FileSpreadsheet,
} from 'lucide-react';
import { StockMovement, StockMovementType } from '../../packages/shared/types';

interface StockMovementsHistoryModalProps {
    movements: StockMovement[];
    isOpen: boolean;
    onClose: () => void;
}

export const StockMovementsHistoryModal: React.FC<StockMovementsHistoryModalProps> = ({
    movements,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    const filtered = movements.filter((m) => {
        const matchesTerm =
            !searchTerm ||
            m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.destinationDepartment && m.destinationDepartment.toLowerCase().includes(searchTerm.toLowerCase())) ||
            m.reason.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'ALL' || m.type === selectedType;
        return matchesTerm && matchesType;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-4xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Stock Movements & Chain-of-Custody Audit Log
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Real-time ledger of inbound deliveries, ward transfers, clinical dispenses, and cycle adjustments.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by SKU, item, staff, or department..."
                                className="w-full py-2 pl-8 pr-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Action Types</option>
                            <option value="Receipt / Procurement">Receipt / Procurement</option>
                            <option value="Department Transfer">Department Transfer</option>
                            <option value="Clinical Dispense">Clinical Dispense</option>
                            <option value="Cycle Count Adjustment">Cycle Count Adjustment</option>
                            <option value="Return / Write-Off">Return / Write-Off</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3">Item & SKU</th>
                                    <th className="px-4 py-3">Action Type</th>
                                    <th className="px-4 py-3 text-center">Change</th>
                                    <th className="px-4 py-3">Balance</th>
                                    <th className="px-4 py-3">Location / Staff</th>
                                    <th className="px-4 py-3">Clinical Justification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-400">
                                            No stock movement records match your search criteria.
                                        </td>
                                    </tr>
                                )}

                                {filtered.map((m) => {
                                    const isPositive = m.quantityDelta > 0;
                                    let formattedTime = 'N/A';
                                    try {
                                        formattedTime = format(new Date(m.timestamp), 'MMM d, yyyy HH:mm');
                                    } catch {
                                        formattedTime = m.timestamp;
                                    }

                                    return (
                                        <tr key={m.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                                                {formattedTime}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-gray-900">{m.itemName}</p>
                                                <p className="text-[10px] font-mono text-gray-500">{m.itemSku}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold font-mono">
                                                <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                                                    {isPositive ? `+${m.quantityDelta}` : m.quantityDelta}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] font-mono text-gray-600">
                                                {m.quantityBefore} → <strong>{m.quantityAfter}</strong>
                                            </td>
                                            <td className="px-4 py-3 text-[11px]">
                                                <p className="font-medium text-gray-800">{m.destinationDepartment || 'Central Store'}</p>
                                                <p className="text-gray-400">{m.performedBy}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-gray-600 max-w-xs">
                                                {m.reason}
                                                {m.poNumber && (
                                                    <span className="block font-mono text-[10px] text-teal-700">Ref: {m.poNumber}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {filtered.length} audited movements</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                    >
                        Close Ledger
                    </button>
                </div>
            </div>
        </div>
    );
};
