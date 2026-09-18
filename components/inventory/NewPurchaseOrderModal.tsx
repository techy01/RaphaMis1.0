import React, { useState } from 'react';
import { X, ShoppingCart, Plus, AlertCircle, DollarSign } from 'lucide-react';
import { InventoryItem, PurchaseOrder } from '../../packages/shared/types';

interface NewPurchaseOrderModalProps {
    items: InventoryItem[];
    defaultItem?: InventoryItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<PurchaseOrder>) => Promise<void>;
}

export const NewPurchaseOrderModal: React.FC<NewPurchaseOrderModalProps> = ({
    items,
    defaultItem,
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const initialItem = defaultItem || items[0];

    const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || '');
    const [quantity, setQuantity] = useState<number>(50);
    const [unitCost, setUnitCost] = useState<number>(initialItem?.unitCost || 10);
    const [supplierName, setSupplierName] = useState<string>(initialItem?.supplierName || 'Medical Supplier Inc.');
    const [expectedDate, setExpectedDate] = useState<string>('2026-09-20');
    const [notes, setNotes] = useState<string>('Replenishment purchase order for clinical stock.');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const currentItem = items.find((i) => i.id === selectedItemId) || initialItem;

    const handleItemChange = (itemId: string) => {
        setSelectedItemId(itemId);
        const item = items.find((i) => i.id === itemId);
        if (item) {
            setUnitCost(item.unitCost);
            setSupplierName(item.supplierName);
        }
    };

    const totalAmount = (quantity || 0) * (unitCost || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!currentItem) {
            setError('Please select an item.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                tenantId: currentItem.tenantId,
                tenantName: currentItem.tenantName,
                itemId: currentItem.id,
                itemName: currentItem.name,
                itemSku: currentItem.sku,
                supplierName,
                quantity,
                unitCost,
                totalAmount,
                expectedDeliveryDate: expectedDate,
                status: 'Pending Approval',
                notes,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate purchase order.');
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
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Create Supply Purchase Order
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Requisition restocking items from medical manufacturers and vendors.
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

                        {/* Item selector */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Catalog Item to Requisition
                            </label>
                            <select
                                value={selectedItemId}
                                onChange={(e) => handleItemChange(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                {items.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.name} ({i.sku}) — Current: {i.quantityOnHand} {i.unitOfMeasure}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Medical Supplier / Vendor
                            </label>
                            <input
                                type="text"
                                required
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Quantity and Unit Cost */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Quantity ({currentItem?.unitOfMeasure || 'Units'})
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Contract Unit Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={unitCost}
                                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Total valuation block */}
                        <div className="bg-teal-50/70 p-3 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                            <span className="text-teal-900 font-medium">Estimated Purchase Order Total:</span>
                            <span className="text-base font-bold text-teal-800">
                                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Expected Delivery Date */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Anticipated Warehouse Delivery Date
                            </label>
                            <input
                                type="date"
                                required
                                value={expectedDate}
                                onChange={(e) => setExpectedDate(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Justification & Special Handling
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Cold-chain requirements, emergency shipment instructions..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
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
                            <Plus className="h-4 w-4" />
                            {isSubmitting ? 'Issuing Order...' : 'Generate Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
