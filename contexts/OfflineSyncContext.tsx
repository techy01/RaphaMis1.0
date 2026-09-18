import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { offlineSyncService, SyncState } from '../services/offlineSyncService';
import { getOutboxItems, OutboxItem, clearOutboxQueue } from '../services/offlineDb';

interface OfflineSyncContextValue extends SyncState {
    syncNow: () => Promise<{ synced: number; failed: number }>;
    checkConnectivity: () => Promise<boolean>;
    outboxItems: OutboxItem[];
    refreshOutbox: () => Promise<void>;
    clearFailedQueue: () => Promise<void>;
    isSyncModalOpen: boolean;
    setIsSyncModalOpen: (open: boolean) => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SyncState>(offlineSyncService.getState());
    const [outboxItems, setOutboxItems] = useState<OutboxItem[]>([]);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    const refreshOutbox = async () => {
        const items = await getOutboxItems();
        setOutboxItems(items);
    };

    useEffect(() => {
        const unsubscribe = offlineSyncService.subscribe((newState) => {
            setState(newState);
            refreshOutbox();
        });

        refreshOutbox();

        const handleSyncCompleted = () => {
            refreshOutbox();
        };

        window.addEventListener('raphamis:sync_completed', handleSyncCompleted);

        return () => {
            unsubscribe();
            window.removeEventListener('raphamis:sync_completed', handleSyncCompleted);
        };
    }, []);

    const clearFailedQueue = async () => {
        await clearOutboxQueue();
        await refreshOutbox();
    };

    const value = useMemo(
        () => ({
            ...state,
            syncNow: () => offlineSyncService.syncNow(),
            checkConnectivity: () => offlineSyncService.checkConnectivityAndSync(),
            outboxItems,
            refreshOutbox,
            clearFailedQueue,
            isSyncModalOpen,
            setIsSyncModalOpen,
        }),
        [state, outboxItems, isSyncModalOpen]
    );

    return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
};

export const useOfflineSync = (): OfflineSyncContextValue => {
    const context = useContext(OfflineSyncContext);
    if (!context) {
        throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
    }
    return context;
};
