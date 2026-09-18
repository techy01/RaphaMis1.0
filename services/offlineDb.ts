import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Patient, PatientVital, ClinicalNote, Prescription } from '../packages/shared/types';

export interface OutboxItem {
    id: string;
    action:
        | 'UPDATE_VITALS'
        | 'ADD_PRESCRIPTION'
        | 'ADD_CLINICAL_NOTE'
        | 'REGISTER_PATIENT'
        | 'UPDATE_PATIENT'
        | 'SEND_COMMUNICATION';
    patientId: string;
    patientName?: string;
    payload: any;
    createdAt: string;
    retryCount: number;
    status: 'PENDING' | 'SYNCING' | 'FAILED';
    error?: string;
}

interface RaphaMISDB extends DBSchema {
    patients_cache: {
        key: string;
        value: Patient;
        indexes: { 'by-name': string; 'by-status': string };
    };
    outbox_queue: {
        key: string;
        value: OutboxItem;
        indexes: { 'by-status': string; 'by-created': string };
    };
    sync_metadata: {
        key: string;
        value: {
            key: string;
            value: any;
            updatedAt: string;
        };
    };
}

const DB_NAME = 'raphamis_offline_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RaphaMISDB>> | null = null;

export const getOfflineDb = (): Promise<IDBPDatabase<RaphaMISDB>> => {
    if (!dbPromise) {
        dbPromise = openDB<RaphaMISDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Patient Cache Store
                if (!db.objectStoreNames.contains('patients_cache')) {
                    const patientStore = db.createObjectStore('patients_cache', { keyPath: 'id' });
                    patientStore.createIndex('by-name', 'name');
                    patientStore.createIndex('by-status', 'status');
                }

                // Outbox Queue Store
                if (!db.objectStoreNames.contains('outbox_queue')) {
                    const outboxStore = db.createObjectStore('outbox_queue', { keyPath: 'id' });
                    outboxStore.createIndex('by-status', 'status');
                    outboxStore.createIndex('by-created', 'createdAt');
                }

                // Sync Metadata Store
                if (!db.objectStoreNames.contains('sync_metadata')) {
                    db.createObjectStore('sync_metadata', { keyPath: 'key' });
                }
            },
        });
    }
    return dbPromise;
};

// --- Patient Cache Helpers ---

export const cachePatients = async (patients: Patient[]): Promise<void> => {
    try {
        const db = await getOfflineDb();
        const tx = db.transaction('patients_cache', 'readwrite');
        for (const patient of patients) {
            await tx.store.put(patient);
        }
        await tx.done;
        await setSyncMetadata('last_patients_cached_at', new Date().toISOString());
    } catch (err) {
        console.warn('[OfflineDB] Failed to bulk cache patients:', err);
    }
};

export const getCachedPatients = async (): Promise<Patient[]> => {
    try {
        const db = await getOfflineDb();
        return await db.getAll('patients_cache');
    } catch (err) {
        console.warn('[OfflineDB] Failed to retrieve cached patients:', err);
        return [];
    }
};

export const getCachedPatientById = async (id: string): Promise<Patient | undefined> => {
    try {
        const db = await getOfflineDb();
        return await db.get('patients_cache', id);
    } catch (err) {
        console.warn(`[OfflineDB] Failed to retrieve patient ${id}:`, err);
        return undefined;
    }
};

export const updateCachedPatient = async (patient: Patient): Promise<void> => {
    try {
        const db = await getOfflineDb();
        await db.put('patients_cache', patient);
    } catch (err) {
        console.warn(`[OfflineDB] Failed to update cached patient ${patient.id}:`, err);
    }
};

// --- Outbox Queue Helpers ---

export const addOutboxItem = async (
    item: Omit<OutboxItem, 'id' | 'createdAt' | 'status' | 'retryCount'>
): Promise<OutboxItem> => {
    const db = await getOfflineDb();
    const fullItem: OutboxItem = {
        ...item,
        id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0,
    };
    await db.put('outbox_queue', fullItem);
    return fullItem;
};

export const getOutboxItems = async (): Promise<OutboxItem[]> => {
    try {
        const db = await getOfflineDb();
        return await db.getAll('outbox_queue');
    } catch (err) {
        console.warn('[OfflineDB] Failed to get outbox items:', err);
        return [];
    }
};

export const getPendingOutboxCount = async (): Promise<number> => {
    try {
        const db = await getOfflineDb();
        const items = await db.getAll('outbox_queue');
        return items.filter((item) => item.status === 'PENDING' || item.status === 'FAILED').length;
    } catch (err) {
        return 0;
    }
};

export const updateOutboxItem = async (item: OutboxItem): Promise<void> => {
    try {
        const db = await getOfflineDb();
        await db.put('outbox_queue', item);
    } catch (err) {
        console.warn(`[OfflineDB] Failed to update outbox item ${item.id}:`, err);
    }
};

export const removeOutboxItem = async (id: string): Promise<void> => {
    try {
        const db = await getOfflineDb();
        await db.delete('outbox_queue', id);
    } catch (err) {
        console.warn(`[OfflineDB] Failed to remove outbox item ${id}:`, err);
    }
};

export const clearOutboxQueue = async (): Promise<void> => {
    try {
        const db = await getOfflineDb();
        await db.clear('outbox_queue');
    } catch (err) {
        console.warn('[OfflineDB] Failed to clear outbox queue:', err);
    }
};

// --- Metadata Helpers ---

export const setSyncMetadata = async (key: string, value: any): Promise<void> => {
    try {
        const db = await getOfflineDb();
        await db.put('sync_metadata', {
            key,
            value,
            updatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.warn(`[OfflineDB] Failed to set metadata ${key}:`, err);
    }
};

export const getSyncMetadata = async (key: string): Promise<any> => {
    try {
        const db = await getOfflineDb();
        const entry = await db.get('sync_metadata', key);
        return entry ? entry.value : null;
    } catch (err) {
        return null;
    }
};
