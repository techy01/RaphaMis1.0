import React, { useState } from 'react';
import {
    X,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { InventoryItem, StockMovementType } from '../../packages/shared/types';

interface AdjustStockModalProps {
    item: InventoryItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        itemId: string;
        type: StockMovementType;
        quantityDelta: number;
        performedBy: string;
        destinationDepartment?: string;
        reason: string;
        poNumber?: string;
    }) => Promise<void>;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
    item,
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen || !item) return null;

    const [movementType, setMovementType] = useState<StockMovementType>('Department Transfer');
    const [quantityInput, setQuantityInput] = useState<number>(10);
    const [department, setDepartment] = useState<string>('Emergency Department');
    const [performedBy, setPerformedBy] = useState<string>('Charge Nurse / Inventory Officer');
    const [reason, setReason] = useState<string>('Department restocking for clinical operations.');
    const [poNumber, setPoNumber] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Determine if delta is positive or negative based on movement type
    const isAdding = movementType === 'Receipt / Procurement';
    const isCycleCount = movementType === 'Cycle Count Adjustment';

    const actualDelta = isAdding
        ? Math.abs(quantityInput)
        : isCycleCount
        ? quantityInput
        : -Math.abs(quantityInput);

    const projectedQuantity = Math.max(0, item.quantityOnHand + actualDelta);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (quantityInput === 0 && !isCycleCount) {
            setError('Quantity must be greater than zero.');
            return;
        }

        if (!isAdding && actualDelta < 0 && Math.abs(actualDelta) > item.quantityOnHand) {
            setError(`Cannot deduct ${Math.abs(actualDelta)} ${item.unitOfMeasure}. Only ${item.quantityOnHand} currently on hand.`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                itemId: item.id,
                type: movementType,
                quantityDelta: actualDelta,
                performedBy,
                destinationDepartment: department,
                reason,
                poNumber: poNumber || undefined,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to record stock movement.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Adjust Stock / Record Movement
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {item.name} ({item.sku})
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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Current vs Projected Level Preview Card */}
                        <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100 grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                                <span className="text-gray-500 block text-[11px]">Current On-Hand</span>
                                <span className="text-base font-bold text-gray-900">
                                    {item.quantityOnHand} {item.unitOfMeasure}
                                </span>
                            </div>
                            <div className="border-x border-teal-200">
                                <span className="text-gray-500 block text-[11px]">Change Delta</span>
                                <span className={`text-base font-bold ${actualDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {actualDelta >= 0 ? `+${actualDelta}` : actualDelta}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Projected Stock</span>
                                <span className="text-base font-bold text-teal-900">
                                    {projectedQuantity} {item.unitOfMeasure}
                                </span>
                            </div>
                        </div>

                        {/* Movement Type */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Stock Movement Action
                            </label>
                            <select
                                value={movementType}
                                onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                <option value="Department Transfer">Department Transfer (Transfer to ward/unit)</option>
                                <option value="Clinical Dispense">Clinical Dispense (Bedside patient usage)</option>
                                <option value="Receipt / Procurement">Receipt / Inbound Stock Intake (+)</option>
                                <option value="Cycle Count Adjustment">Physical Cycle Count Reconciliation (+/-)</option>
                                <option value="Return / Write-Off">Damaged / Expired Write-Off (-)</option>
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Quantity to {isAdding ? 'Add' : 'Deduct'} ({item.unitOfMeasure})
                            </label>
                            <input
                                type="number"
                                required
                                min={isCycleCount ? -item.quantityOnHand : 1}
                                max={!isAdding && !isCycleCount ? item.quantityOnHand : 10000}
                                value={quantityInput}
                                onChange={(e) => setQuantityInput(parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                            {item.reorderLevel > 0 && (
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Par Reorder Level is <strong>{item.reorderLevel} {item.unitOfMeasure}</strong>. Maximum capacity is <strong>{item.targetMaxStock}</strong>.
                                </p>
                            )}
                        </div>

                        {/* Destination / Department */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Target Department / Clinical Station
                            </label>
                            <input
                                type="text"
                                required
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. ICU Bay 4, Operating Room 2, Central Pharmacy"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Performed By */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Authorized Clinician / Staff Name
                            </label>
                            <input
                                type="text"
                                required
                                value={performedBy}
                                onChange={(e) => setPerformedBy(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Reason / Clinical Justification */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Operational Reason / Notes
                            </label>
                            <textarea
                                rows={2}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Specify purpose of movement for supply chain audit log..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Optional Reference PO */}
                        {isAdding && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Purchase Order Reference # (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={poNumber}
                                    onChange={(e) => setPoNumber(e.target.value)}
                                    placeholder="e.g. PO-2026-0814"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isSubmitting ? 'Recording Movement...' : 'Confirm Stock Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
