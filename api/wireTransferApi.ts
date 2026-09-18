import { WireTransferSettings } from '../packages/shared/types';

const WIRE_SETTINGS_STORAGE_KEY = 'raphamis_superadmin_wire_settings_v1';

export const DEFAULT_WIRE_TRANSFER_SETTINGS: WireTransferSettings = {
    bankName: 'KCB Bank Kenya Limited',
    accountName: 'Saaslink Technologies Limited - RaphaMIS Treasury',
    accountNumber: '1289 4092 1104',
    swiftBic: 'KCBLKENX',
    branchName: 'Nairobi West Corporate Branch',
    branchCode: '01089',
    currency: 'KES',
    routingNumber: '01089-KCB',
    paymentInstructions: 'Please quote your School/Institution Name and Invoice Number in the payment narration. Once wired, email the bank slip to billing@saaslink.co.ke or call 0720935895 for instant clearance.',
    supportPhone: '0720935895',
    supportEmail: 'billing@saaslink.co.ke',
    updatedAt: new Date().toISOString(),
};

export const getWireTransferSettings = (): WireTransferSettings => {
    try {
        const stored = localStorage.getItem(WIRE_SETTINGS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.bankName && parsed.accountNumber) {
                return { ...DEFAULT_WIRE_TRANSFER_SETTINGS, ...parsed };
            }
        }
    } catch {
        // fallback
    }
    return DEFAULT_WIRE_TRANSFER_SETTINGS;
};

export const saveWireTransferSettings = (settings: Partial<WireTransferSettings>): WireTransferSettings => {
    const current = getWireTransferSettings();
    const updated: WireTransferSettings = {
        ...current,
        ...settings,
        updatedAt: new Date().toISOString(),
    };
    try {
        localStorage.setItem(WIRE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('wire-settings-updated', { detail: updated }));
    } catch (err) {
        console.error('Failed to save wire transfer settings:', err);
    }
    return updated;
};
