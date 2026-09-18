import {
    InventoryItem,
    StockMovement,
    PurchaseOrder,
    InventoryStats,
    InventoryCategory,
    InventoryStockStatus,
    StockMovementType,
    PurchaseOrderStatus,
} from '../packages/shared/types';

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
    {
        id: 'inv_001',
        sku: 'MED-SOL-102',
        name: '0.9% Sodium Chloride IV Infusion (1000mL Bags)',
        category: 'Pharmaceuticals & Solutions',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        storageLocation: 'Central Store - Aisle 2 / Shelf B',
        quantityOnHand: 850,
        unitOfMeasure: 'Bags',
        reorderLevel: 300,
        targetMaxStock: 1200,
        unitCost: 3.20,
        status: 'In Stock',
        lotNumber: 'LOT-SAL-9941',
        expirationDate: '2027-12-31',
        supplierName: 'Baxter Healthcare Inc.',
        lastRestockedAt: '2026-09-08T10:30:00.000Z',
        notes: 'Primary crystalloid fluid for trauma, surgical units, and inpatient wards.',
    },
    {
        id: 'inv_002',
        sku: 'PPE-RESP-204',
        name: 'N95 Particulate Respirator Masks (Box/20)',
        category: 'PPE & Infection Control',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        storageLocation: 'Infection Control Supply Room - Bin 04',
        quantityOnHand: 14,
        unitOfMeasure: 'Boxes',
        reorderLevel: 40,
        targetMaxStock: 200,
        unitCost: 28.50,
        status: 'Low Stock',
        lotNumber: 'LOT-3M-882',
        expirationDate: '2028-05-15',
        supplierName: '3M Medical Solutions',
        lastRestockedAt: '2026-08-20T14:15:00.000Z',
        notes: 'NIOSH-approved respirators. Critical par level reached; replenishment PO queued.',
    },
    {
        id: 'inv_003',
        sku: 'SURG-VIC-301',
        name: 'Vicryl Polyglactin 3-0 Suture w/ SH Needle (Box/36)',
        category: 'Surgical & Wound Care',
        tenantId: 'tnt_004',
        tenantName: 'Apex Orthopedic Institute',
        storageLocation: 'OR Sterile Storage - Rack 7',
        quantityOnHand: 62,
        unitOfMeasure: 'Boxes',
        reorderLevel: 25,
        targetMaxStock: 100,
        unitCost: 112.00,
        status: 'In Stock',
        lotNumber: 'LOT-ETH-4019',
        expirationDate: '2028-01-10',
        supplierName: 'Ethicon / Johnson & Johnson',
        lastRestockedAt: '2026-09-02T08:00:00.000Z',
        notes: 'Coated synthetic braided absorbable surgical suture.',
    },
    {
        id: 'inv_004',
        sku: 'SURG-ETT-750',
        name: 'Endotracheal Tubes 7.5mm Cuffed (Box/10)',
        category: 'Surgical & Wound Care',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        storageLocation: 'Airway Crash Cart Reserve - Bay 3',
        quantityOnHand: 0,
        unitOfMeasure: 'Boxes',
        reorderLevel: 15,
        targetMaxStock: 60,
        unitCost: 44.00,
        status: 'Out of Stock',
        lotNumber: 'LOT-MDT-112',
        expirationDate: '2027-09-30',
        supplierName: 'Medtronic Respiratory',
        lastRestockedAt: '2026-08-10T11:00:00.000Z',
        notes: 'Urgent stockout alert: PO-2026-0812 expedited with vendor.',
    },
    {
        id: 'inv_005',
        sku: 'DIAG-ABG-500',
        name: 'Arterial Blood Gas (ABG) Sensor Cartridges (Pack/25)',
        category: 'Diagnostic & Lab Reagents',
        tenantId: 'tnt_002',
        tenantName: "Mercy Children's Clinic",
        storageLocation: 'Lab Reagent Cold Storage (4°C)',
        quantityOnHand: 8,
        unitOfMeasure: 'Packs',
        reorderLevel: 12,
        targetMaxStock: 35,
        unitCost: 185.00,
        status: 'Low Stock',
        lotNumber: 'LOT-RAD-3004',
        expirationDate: '2026-11-20',
        supplierName: 'Radiometer Medical',
        lastRestockedAt: '2026-08-15T09:40:00.000Z',
        notes: 'Refrigerated storage required. Calibrated for ABL90 FLEX analyzer.',
    },
    {
        id: 'inv_006',
        sku: 'EQUIP-PUMP-10',
        name: 'Volumetric Infusion Pump Administration Tubing Sets',
        category: 'Biomedical Equipment',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        storageLocation: 'Central Store - Aisle 4 / Shelf D',
        quantityOnHand: 340,
        unitOfMeasure: 'Units',
        reorderLevel: 100,
        targetMaxStock: 500,
        unitCost: 14.50,
        status: 'In Stock',
        lotNumber: 'LOT-BBR-551',
        expirationDate: '2029-03-31',
        supplierName: 'B. Braun Medical',
        lastRestockedAt: '2026-09-04T13:20:00.000Z',
        notes: 'Infusomat Space compatible primary IV set with 15-micron filter.',
    },
    {
        id: 'inv_007',
        sku: 'PPE-GLV-MED',
        name: 'Nitrile Examination Gloves - Powder-Free (Medium, Box/100)',
        category: 'PPE & Infection Control',
        tenantId: 'tnt_003',
        tenantName: 'Northwest Community Medical',
        storageLocation: 'Warehouse Bay 8 / Pallet 4',
        quantityOnHand: 420,
        unitOfMeasure: 'Boxes',
        reorderLevel: 150,
        targetMaxStock: 600,
        unitCost: 8.75,
        status: 'In Stock',
        lotNumber: 'LOT-KC-901',
        expirationDate: '2029-08-10',
        supplierName: 'Kimberly-Clark Professional',
        lastRestockedAt: '2026-09-05T15:00:00.000Z',
        notes: 'Chemotherapy drug tested, non-sterile nitrile exam gloves.',
    },
    {
        id: 'inv_008',
        sku: 'PHARM-CEFT-1G',
        name: 'Ceftriaxone Sodium 1g Injection Vials (Pack/10)',
        category: 'Pharmaceuticals & Solutions',
        tenantId: 'tnt_003',
        tenantName: 'Northwest Community Medical',
        storageLocation: 'Pharmacy Vault A - Shelf 3',
        quantityOnHand: 18,
        unitOfMeasure: 'Packs',
        reorderLevel: 30,
        targetMaxStock: 80,
        unitCost: 42.00,
        status: 'Expiring Soon',
        lotNumber: 'LOT-PFZ-0021',
        expirationDate: '2026-10-15',
        supplierName: 'Pfizer Hospital Solutions',
        lastRestockedAt: '2026-07-12T16:00:00.000Z',
        notes: 'Batch expires in 35 days. Recommend prioritizing for acute inpatient dispensations.',
    },
];

const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
    {
        id: 'mov_001',
        itemId: 'inv_001',
        itemSku: 'MED-SOL-102',
        itemName: '0.9% Sodium Chloride IV Infusion (1000mL Bags)',
        type: 'Receipt / Procurement',
        quantityDelta: 400,
        quantityBefore: 450,
        quantityAfter: 850,
        performedBy: 'Marcus Henderson (Supply Chain Coordinator)',
        destinationDepartment: 'Central Warehouse',
        timestamp: '2026-09-08T10:30:00.000Z',
        reason: 'Goods received under PO-2026-0813 from Baxter Healthcare.',
        poNumber: 'PO-2026-0813',
    },
    {
        id: 'mov_002',
        itemId: 'inv_002',
        itemSku: 'PPE-RESP-204',
        itemName: 'N95 Particulate Respirator Masks (Box/20)',
        type: 'Department Transfer',
        quantityDelta: -16,
        quantityBefore: 30,
        quantityAfter: 14,
        performedBy: 'Sarah Jenkins, RN',
        destinationDepartment: 'ICU & Isolation Unit',
        timestamp: '2026-09-09T14:15:00.000Z',
        reason: 'Monthly department stock replenishment for respiratory isolation ward.',
    },
    {
        id: 'mov_003',
        itemId: 'inv_004',
        itemSku: 'SURG-ETT-750',
        itemName: 'Endotracheal Tubes 7.5mm Cuffed (Box/10)',
        type: 'Clinical Dispense',
        quantityDelta: -5,
        quantityBefore: 5,
        quantityAfter: 0,
        performedBy: 'Dr. Christopher Bell, MD',
        destinationDepartment: 'Emergency Trauma Bay',
        timestamp: '2026-09-10T02:40:00.000Z',
        reason: 'Urgent airway stabilization across acute multi-trauma admissions.',
    },
    {
        id: 'mov_004',
        itemId: 'inv_003',
        itemSku: 'SURG-VIC-301',
        itemName: 'Vicryl Polyglactin 3-0 Suture w/ SH Needle (Box/36)',
        type: 'Cycle Count Adjustment',
        quantityDelta: 2,
        quantityBefore: 60,
        quantityAfter: 62,
        performedBy: 'Elena Rostova (Inventory Auditor)',
        destinationDepartment: 'OR Sterile Storage',
        timestamp: '2026-09-09T18:00:00.000Z',
        reason: 'Physical shelf cycle count reconciliation found 2 unrecorded boxes.',
    },
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'po_001',
        poNumber: 'PO-2026-0811',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        supplierName: '3M Medical Solutions',
        supplierContact: 'orders@mmm-health.com',
        itemId: 'inv_002',
        itemName: 'N95 Particulate Respirator Masks (Box/20)',
        itemSku: 'PPE-RESP-204',
        quantity: 50,
        unitCost: 28.50,
        totalAmount: 1425.00,
        status: 'Dispatched',
        orderedAt: '2026-09-09T09:00:00.000Z',
        expectedDeliveryDate: '2026-09-12',
        approvedBy: 'Director of Procurement (Dr. V. Vance)',
        notes: 'Expedited shipping approved due to critical par drop.',
    },
    {
        id: 'po_002',
        poNumber: 'PO-2026-0812',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        supplierName: 'Medtronic Respiratory',
        supplierContact: 'logistics@medtronic.com',
        itemId: 'inv_004',
        itemName: 'Endotracheal Tubes 7.5mm Cuffed (Box/10)',
        itemSku: 'SURG-ETT-750',
        quantity: 25,
        unitCost: 44.00,
        totalAmount: 1100.00,
        status: 'Pending Approval',
        orderedAt: '2026-09-10T03:15:00.000Z',
        expectedDeliveryDate: '2026-09-13',
        notes: 'Stockout emergency requisition generated automatically.',
    },
    {
        id: 'po_003',
        poNumber: 'PO-2026-0813',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        supplierName: 'Baxter Healthcare Inc.',
        supplierContact: 'supply@baxter.com',
        itemId: 'inv_001',
        itemName: '0.9% Sodium Chloride IV Infusion (1000mL Bags)',
        itemSku: 'MED-SOL-102',
        quantity: 400,
        unitCost: 3.20,
        totalAmount: 1280.00,
        status: 'Received',
        orderedAt: '2026-09-05T11:00:00.000Z',
        receivedAt: '2026-09-08T10:30:00.000Z',
        approvedBy: 'Chief Financial Officer',
        notes: 'Delivered in good condition and stocked to Central Warehouse.',
    },
];

const INVENTORY_STORAGE_KEY = 'raphamis_inventory_items_v1';
const MOVEMENTS_STORAGE_KEY = 'raphamis_stock_movements_v1';
const PO_STORAGE_KEY = 'raphamis_purchase_orders_v1';

export const getStoredInventoryItems = (): InventoryItem[] => {
    try {
        const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    } catch {}
    return INITIAL_INVENTORY_ITEMS;
};

export const saveStoredInventoryItems = (items: InventoryItem[]) => {
    try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {}
};

export const getStoredMovements = (): StockMovement[] => {
    try {
        const stored = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(INITIAL_STOCK_MOVEMENTS));
    } catch {}
    return INITIAL_STOCK_MOVEMENTS;
};

export const saveStoredMovements = (movements: StockMovement[]) => {
    try {
        localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    } catch {}
};

export const getStoredPurchaseOrders = (): PurchaseOrder[] => {
    try {
        const stored = localStorage.getItem(PO_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(INITIAL_PURCHASE_ORDERS));
    } catch {}
    return INITIAL_PURCHASE_ORDERS;
};

export const saveStoredPurchaseOrders = (pos: PurchaseOrder[]) => {
    try {
        localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(pos));
    } catch {}
};

// Helper: Calculate item stock status
export const calculateStockStatus = (
    quantityOnHand: number,
    reorderLevel: number,
    targetMaxStock: number,
    expirationDate?: string
): InventoryStockStatus => {
    if (quantityOnHand <= 0) return 'Out of Stock';

    if (expirationDate) {
        const expTime = new Date(expirationDate).getTime();
        const now = Date.now();
        const daysDiff = (expTime - now) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 45 && daysDiff >= 0) {
            return 'Expiring Soon';
        }
    }

    if (quantityOnHand <= reorderLevel) return 'Low Stock';
    if (quantityOnHand > targetMaxStock) return 'Overstocked';
    return 'In Stock';
};

// API: Get items with filtering
export const getInventoryItems = async (filters?: {
    tenantId?: string;
    search?: string;
    category?: string;
    status?: string;
}): Promise<InventoryItem[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let items = getStoredInventoryItems();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        items = items.filter((item) => item.tenantId === filters.tenantId);
    }

    if (filters?.category && filters.category !== 'ALL') {
        items = items.filter((item) => item.category === filters.category);
    }

    if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((item) => item.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(
            (item) =>
                item.name.toLowerCase().includes(q) ||
                item.sku.toLowerCase().includes(q) ||
                item.storageLocation.toLowerCase().includes(q) ||
                item.supplierName.toLowerCase().includes(q) ||
                (item.lotNumber && item.lotNumber.toLowerCase().includes(q))
        );
    }

    return items;
};

// API: Get item by ID
export const getInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
    const items = getStoredInventoryItems();
    return items.find((i) => i.id === id) || null;
};

// API: Create new inventory catalog item
export const createInventoryItem = async (
    payload: Partial<InventoryItem>
): Promise<InventoryItem> => {
    const items = getStoredInventoryItems();
    const count = items.length + 109;
    const generatedSku = payload.sku || `MED-SUP-${count}`;

    const qty = payload.quantityOnHand || 0;
    const reorder = payload.reorderLevel || 20;
    const max = payload.targetMaxStock || 100;
    const status = calculateStockStatus(qty, reorder, max, payload.expirationDate);

    const newItem: InventoryItem = {
        id: `inv_${Date.now()}`,
        sku: generatedSku,
        name: payload.name || 'Standard Medical Supply Consumable',
        category: payload.category || 'General Medical Consumables',
        tenantId: payload.tenantId || 'tnt_001',
        tenantName: payload.tenantName || 'St. Jude General Hospital',
        storageLocation: payload.storageLocation || 'Central Store - Bin A1',
        quantityOnHand: qty,
        unitOfMeasure: payload.unitOfMeasure || 'Units',
        reorderLevel: reorder,
        targetMaxStock: max,
        unitCost: payload.unitCost || 10.0,
        status,
        lotNumber: payload.lotNumber || `LOT-${Date.now().toString().slice(-4)}`,
        expirationDate: payload.expirationDate,
        supplierName: payload.supplierName || 'General Hospital Medical Supplies',
        lastRestockedAt: qty > 0 ? new Date().toISOString() : undefined,
        notes: payload.notes,
    };

    const updated = [newItem, ...items];
    saveStoredInventoryItems(updated);

    if (qty > 0) {
        // Log initial stock creation movement
        const movements = getStoredMovements();
        const initialMovement: StockMovement = {
            id: `mov_${Date.now()}`,
            itemId: newItem.id,
            itemSku: newItem.sku,
            itemName: newItem.name,
            type: 'Receipt / Procurement',
            quantityDelta: qty,
            quantityBefore: 0,
            quantityAfter: qty,
            performedBy: 'Procurement Clerk',
            destinationDepartment: newItem.storageLocation,
            timestamp: new Date().toISOString(),
            reason: 'Initial stock intake upon item catalog registration.',
        };
        saveStoredMovements([initialMovement, ...movements]);
    }

    return newItem;
};

// API: Update inventory item details
export const updateInventoryItem = async (
    id: string,
    updates: Partial<InventoryItem>
): Promise<InventoryItem> => {
    const items = getStoredInventoryItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Inventory item not found');

    const current = items[idx];
    const qty = updates.quantityOnHand !== undefined ? updates.quantityOnHand : current.quantityOnHand;
    const reorder = updates.reorderLevel !== undefined ? updates.reorderLevel : current.reorderLevel;
    const max = updates.targetMaxStock !== undefined ? updates.targetMaxStock : current.targetMaxStock;
    const exp = updates.expirationDate !== undefined ? updates.expirationDate : current.expirationDate;

    const recalculatedStatus = calculateStockStatus(qty, reorder, max, exp);

    const updatedItem: InventoryItem = {
        ...current,
        ...updates,
        status: recalculatedStatus,
    };

    items[idx] = updatedItem;
    saveStoredInventoryItems(items);
    return updatedItem;
};

// API: Log a stock movement and automatically adjust quantity and status
export const logStockMovement = async (payload: {
    itemId: string;
    type: StockMovementType;
    quantityDelta: number; // positive for receipt, negative for dispense/transfer
    performedBy: string;
    destinationDepartment?: string;
    reason: string;
    poNumber?: string;
}): Promise<StockMovement> => {
    const items = getStoredInventoryItems();
    const idx = items.findIndex((i) => i.id === payload.itemId);
    if (idx === -1) throw new Error('Inventory item not found');

    const item = items[idx];
    const before = item.quantityOnHand;
    const after = Math.max(0, before + payload.quantityDelta);

    const updatedStatus = calculateStockStatus(
        after,
        item.reorderLevel,
        item.targetMaxStock,
        item.expirationDate
    );

    items[idx] = {
        ...item,
        quantityOnHand: after,
        status: updatedStatus,
        lastRestockedAt: payload.quantityDelta > 0 ? new Date().toISOString() : item.lastRestockedAt,
    };
    saveStoredInventoryItems(items);

    const movement: StockMovement = {
        id: `mov_${Date.now()}`,
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        type: payload.type,
        quantityDelta: payload.quantityDelta,
        quantityBefore: before,
        quantityAfter: after,
        performedBy: payload.performedBy,
        destinationDepartment: payload.destinationDepartment || 'General Inventory',
        timestamp: new Date().toISOString(),
        reason: payload.reason,
        poNumber: payload.poNumber,
    };

    const movements = getStoredMovements();
    saveStoredMovements([movement, ...movements]);

    return movement;
};

// API: Get stock movements
export const getStockMovements = async (itemId?: string, tenantId?: string): Promise<StockMovement[]> => {
    await new Promise((r) => setTimeout(r, 30));
    let movements = getStoredMovements();
    if (itemId && itemId !== 'ALL') {
        movements = movements.filter((m) => m.itemId === itemId);
    }
    return movements;
};

// API: Get Purchase Orders
export const getPurchaseOrders = async (tenantId?: string): Promise<PurchaseOrder[]> => {
    await new Promise((r) => setTimeout(r, 30));
    let pos = getStoredPurchaseOrders();
    if (tenantId && tenantId !== 'ALL') {
        pos = pos.filter((p) => p.tenantId === tenantId);
    }
    return pos;
};

// API: Create new Purchase Order
export const createPurchaseOrder = async (
    payload: Partial<PurchaseOrder>
): Promise<PurchaseOrder> => {
    const pos = getStoredPurchaseOrders();
    const randomPoNumber = `PO-2026-0${814 + pos.length}`;

    const newPO: PurchaseOrder = {
        id: `po_${Date.now()}`,
        poNumber: payload.poNumber || randomPoNumber,
        tenantId: payload.tenantId || 'tnt_001',
        tenantName: payload.tenantName || 'St. Jude General Hospital',
        supplierName: payload.supplierName || 'Medical Supplies Direct',
        supplierContact: payload.supplierContact || 'dispatch@medsupplier.com',
        itemId: payload.itemId || 'inv_001',
        itemName: payload.itemName || 'Medical Consumables',
        itemSku: payload.itemSku || 'MED-GEN-01',
        quantity: payload.quantity || 50,
        unitCost: payload.unitCost || 20.0,
        totalAmount: (payload.quantity || 50) * (payload.unitCost || 20.0),
        status: payload.status || 'Pending Approval',
        orderedAt: new Date().toISOString(),
        expectedDeliveryDate: payload.expectedDeliveryDate || '2026-09-18',
        notes: payload.notes,
    };

    const updated = [newPO, ...pos];
    saveStoredPurchaseOrders(updated);
    return newPO;
};

// API: Receive Purchase Order and update stock
export const receivePurchaseOrder = async (
    poId: string,
    receivedBy: string
): Promise<PurchaseOrder> => {
    const pos = getStoredPurchaseOrders();
    const idx = pos.findIndex((p) => p.id === poId);
    if (idx === -1) throw new Error('Purchase order not found');

    const po = pos[idx];
    const now = new Date().toISOString();

    pos[idx] = {
        ...po,
        status: 'Received',
        receivedAt: now,
    };
    saveStoredPurchaseOrders(pos);

    // Automatically increase inventory stock
    await logStockMovement({
        itemId: po.itemId,
        type: 'Receipt / Procurement',
        quantityDelta: po.quantity,
        performedBy: receivedBy,
        destinationDepartment: 'Central Supply Warehouse',
        reason: `Full delivery received for Purchase Order #${po.poNumber}`,
        poNumber: po.poNumber,
    });

    return pos[idx];
};

// API: Get Inventory Analytics & Summary KPIs
export const getInventoryStats = async (tenantId?: string): Promise<InventoryStats> => {
    let items = getStoredInventoryItems();
    let pos = getStoredPurchaseOrders();

    if (tenantId && tenantId !== 'ALL') {
        items = items.filter((i) => i.tenantId === tenantId);
        pos = pos.filter((p) => p.tenantId === tenantId);
    }

    const totalValuation = items.reduce((sum, item) => sum + item.quantityOnHand * item.unitCost, 0);
    const totalSKUs = items.length;
    const lowStockCount = items.filter((i) => i.status === 'Low Stock').length;
    const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length;
    const expiringSoonCount = items.filter((i) => i.status === 'Expiring Soon').length;
    const pendingPOCount = pos.filter((p) => p.status === 'Pending Approval' || p.status === 'Dispatched').length;

    return {
        totalValuation,
        totalSKUs,
        lowStockCount,
        outOfStockCount,
        expiringSoonCount,
        pendingPOCount,
    };
};
