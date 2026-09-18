import React, { useState } from 'react';
import { X, Package, Plus, AlertCircle } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../packages/shared/types';
import { getTenants } from '../../api/tenantsApi';
import { useQuery } from '@tanstack/react-query';

interface NewInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<InventoryItem>) => Promise<void>;
}

export const NewInventoryItemModal: React.FC<NewInventoryItemModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState<InventoryCategory>('General Medical Consumables');
    const [tenantId, setTenantId] = useState(tenants[0]?.id || 'tnt_001');
    const [storageLocation, setStorageLocation] = useState('Central Store - Aisle 1 / Shelf A');
    const [quantityOnHand, setQuantityOnHand] = useState(50);
    const [unitOfMeasure, setUnitOfMeasure] = useState('Boxes');
    const [reorderLevel, setReorderLevel] = useState(20);
    const [targetMaxStock, setTargetMaxStock] = useState(100);
    const [unitCost, setUnitCost] = useState(15.0);
    const [lotNumber, setLotNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [supplierName, setSupplierName] = useState('Medline Industries');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const selectedTenant = tenants.find((t) => t.id === tenantId) || tenants[0];

        try {
            await onSubmit({
                sku: sku.trim() || undefined,
                name: name.trim(),
                category,
                tenantId,
                tenantName: selectedTenant?.name || 'St. Jude General Hospital',
                storageLocation: storageLocation.trim(),
                quantityOnHand,
                unitOfMeasure: unitOfMeasure.trim(),
                reorderLevel,
                targetMaxStock,
                unitCost,
                lotNumber: lotNumber.trim() || undefined,
                expirationDate: expirationDate || undefined,
                supplierName: supplierName.trim(),
                notes: notes.trim() || undefined,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to add inventory item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Register New Inventory Item
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Add medical supplies, drugs, surgical consumables, or equipment to catalog.
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

                        {/* Name and SKU */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Item Name & Specification
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sterile Latex Surgical Gloves Size 7.5"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    SKU / Barcode (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="Auto-generated if blank"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-mono"
                                />
                            </div>
                        </div>

                        {/* Category & Facility */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Supply Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Surgical & Wound Care">Surgical & Wound Care</option>
                                    <option value="Pharmaceuticals & Solutions">Pharmaceuticals & Solutions</option>
                                    <option value="Diagnostic & Lab Reagents">Diagnostic & Lab Reagents</option>
                                    <option value="PPE & Infection Control">PPE & Infection Control</option>
                                    <option value="Biomedical Equipment">Biomedical Equipment</option>
                                    <option value="General Medical Consumables">General Medical Consumables</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Hospital Facility (Tenant)
                                </label>
                                <select
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Storage Location & Unit of Measure */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Storage Bin / Warehouse Location
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={storageLocation}
                                    onChange={(e) => setStorageLocation(e.target.value)}
                                    placeholder="e.g. Central Store - Aisle 3 / Bin 12"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Unit of Measure
                                </label>
                                <select
                                    value={unitOfMeasure}
                                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Boxes">Boxes</option>
                                    <option value="Bags">Bags</option>
                                    <option value="Units">Units / Pieces</option>
                                    <option value="Vials">Vials</option>
                                    <option value="Packs">Packs</option>
                                    <option value="Rolls">Rolls</option>
                                </select>
                            </div>
                        </div>

                        {/* Initial Quantity, Reorder Level, Target Max */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Initial Stock Qty
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={quantityOnHand}
                                    onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Par Reorder Level
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={reorderLevel}
                                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 1)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Max Stock Capacity
                                </label>
                                <input
                                    type="number"
                                    min={reorderLevel}
                                    value={targetMaxStock}
                                    onChange={(e) => setTargetMaxStock(parseInt(e.target.value) || 100)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Unit Cost & Supplier */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Unit Purchase Cost ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={unitCost}
                                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Primary Supplier / Vendor
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    placeholder="e.g. Medline, Cardinal Health, Baxter"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Lot & Expiration */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Lot / Batch Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={lotNumber}
                                    onChange={(e) => setLotNumber(e.target.value)}
                                    placeholder="e.g. LOT-2026-99"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Expiration Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Clinical Usage Notes / Specifications
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Storage temperature conditions, sterilization method, sterile field instructions..."
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
                            {isSubmitting ? 'Registering Item...' : 'Add Item to Inventory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
