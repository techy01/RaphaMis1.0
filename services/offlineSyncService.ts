import apiClient from '../api/apiClient';
import {
    getOutboxItems,
    removeOutboxItem,
    updateOutboxItem,
    getPendingOutboxCount,
    setSyncMetadata,
    getSyncMetadata,
    updateCachedPatient,
    OutboxItem,
} from './offlineDb';

export type SyncStatus = 'IDLE' | 'SYNCING' | 'OFFLINE' | 'ERROR';

export interface SyncState {
    isOnline: boolean;
    syncStatus: SyncStatus;
    pendingCount: number;
    lastSyncTime: string | null;
    lastError: string | null;
    syncingItemId: string | null;
}

type SyncListener = (state: SyncState) => void;

class OfflineSyncService {
    private listeners: Set<SyncListener> = new Set();
    private isSyncing = false;
    private state: SyncState = {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        syncStatus: 'IDLE',
        pendingCount: 0,
        lastSyncTime: null,
        lastError: null,
        syncingItemId: null,
    };
    private heartbeatTimer: any = null;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleNetworkChange(true));
            window.addEventListener('offline', () => this.handleNetworkChange(false));

            // Initial state load
            this.init();
        }
    }

    private async init() {
        const lastSync = await getSyncMetadata('last_sync_completed_at');
        const count = await getPendingOutboxCount();
        this.updateState({
            pendingCount: count,
            lastSyncTime: lastSync || null,
            isOnline: navigator.onLine,
            syncStatus: navigator.onLine ? 'IDLE' : 'OFFLINE',
        });

        // Periodic check every 30s to verify actual connection and flush queue if online
        this.heartbeatTimer = setInterval(() => {
            this.checkConnectivityAndSync();
        }, 30000);

        // If online on start and pending items exist, trigger auto-sync
        if (navigator.onLine && count > 0) {
            this.syncNow();
        }
    }

    public subscribe(listener: SyncListener): () => void {
        this.listeners.add(listener);
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    public getState(): SyncState {
        return { ...this.state };
    }

    private updateState(partial: Partial<SyncState>) {
        this.state = { ...this.state, ...partial };
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    private handleNetworkChange(online: boolean) {
        this.updateState({
            isOnline: online,
            syncStatus: online ? 'IDLE' : 'OFFLINE',
        });

        if (online) {
            // Automatically flush queued items upon reconnection
            this.syncNow();
        }
    }

    public async checkConnectivityAndSync(): Promise<boolean> {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            this.updateState({ isOnline: false, syncStatus: 'OFFLINE' });
            return false;
        }

        try {
            // Test actual reachability to backend API
            await apiClient.get('/health', { timeout: 4000 });
            this.updateState({ isOnline: true });
            
            // If there are pending items, sync them
            const count = await getPendingOutboxCount();
            this.updateState({ pendingCount: count });
            if (count > 0 && !this.isSyncing) {
                await this.syncNow();
            }
            return true;
        } catch (err: any) {
            // Network is disconnected or backend is temporarily unreachable
            const isNetErr = !err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network');
            if (isNetErr) {
                this.updateState({ isOnline: false, syncStatus: 'OFFLINE' });
                return false;
            }
            return true;
        }
    }

    public async syncNow(): Promise<{ synced: number; failed: number }> {
        if (this.isSyncing) {
            return { synced: 0, failed: 0 };
        }

        this.isSyncing = true;
        this.updateState({ syncStatus: 'SYNCING', lastError: null });

        let syncedCount = 0;
        let failedCount = 0;

        try {
            const items = await getOutboxItems();
            const pendingItems = items.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');

            this.updateState({ pendingCount: pendingItems.length });

            for (const item of pendingItems) {
                this.updateState({ syncingItemId: item.id });
                try {
                    await this.syncSingleItem(item);
                    await removeOutboxItem(item.id);
                    syncedCount++;
                } catch (err: any) {
                    const isNetworkFailure = !err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network');
                    if (isNetworkFailure) {
                        // Pause sync if network went down during processing
                        this.updateState({
                            isOnline: false,
                            syncStatus: 'OFFLINE',
                            lastError: 'Network interrupted during sync. Progress saved.',
                        });
                        break;
                    } else {
                        // Server rejected specific item (e.g., 400, 409 conflict)
                        failedCount++;
                        item.status = 'FAILED';
                        item.retryCount += 1;
                        item.error = err.response?.data?.message || err.message || 'Server processing error';
                        await updateOutboxItem(item);
                    }
                }
            }

            const remaining = await getPendingOutboxCount();
            const now = new Date().toISOString();
            await setSyncMetadata('last_sync_completed_at', now);

            this.updateState({
                pendingCount: remaining,
                lastSyncTime: now,
                syncStatus: remaining > 0 ? 'ERROR' : 'IDLE',
                syncingItemId: null,
            });

            // Dispatch global event for components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('raphamis:sync_completed', {
                    detail: { synced: syncedCount, failed: failedCount }
                }));
            }
        } catch (globalErr: any) {
            this.updateState({
                syncStatus: 'ERROR',
                lastError: globalErr.message || 'Failed to complete synchronization',
                syncingItemId: null,
            });
        } finally {
            this.isSyncing = false;
        }

        return { synced: syncedCount, failed: failedCount };
    }

    private async syncSingleItem(item: OutboxItem): Promise<void> {
        let response;
        switch (item.action) {
            case 'UPDATE_VITALS':
                response = await apiClient.post(`/patients/${item.patientId}/vitals`, item.payload);
                break;
            case 'ADD_PRESCRIPTION':
                response = await apiClient.post(`/patients/${item.patientId}/prescriptions`, item.payload);
                break;
            case 'ADD_CLINICAL_NOTE':
                response = await apiClient.post(`/patients/${item.patientId}/notes`, item.payload);
                break;
            case 'REGISTER_PATIENT':
                response = await apiClient.post('/patients', item.payload);
                break;
            case 'UPDATE_PATIENT':
                response = await apiClient.put(`/patients/${item.patientId}`, item.payload);
                break;
            case 'SEND_COMMUNICATION':
                response = await apiClient.post('/communication/send', item.payload);
                break;
            default:
                throw new Error(`Unknown outbox action: ${(item as any).action}`);
        }

        if (response && response.data) {
            await updateCachedPatient(response.data);
        }
    }
}

export const offlineSyncService = new OfflineSyncService();
