import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';

export const SyncStatusBadge: React.FC = () => {
    const { isOnline, syncStatus, pendingCount, syncNow, setIsSyncModalOpen } = useOfflineSync();

    const handleSyncClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOnline && pendingCount > 0 && syncStatus !== 'SYNCING') {
            syncNow();
        } else {
            setIsSyncModalOpen(true);
        }
    };

    if (!isOnline) {
        return (
            <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                title="Application is operating in offline mode. Click to open Sync Center."
            >
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Offline</span>
                {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                        {pendingCount} queued
                    </span>
                )}
            </button>
        );
    }

    if (syncStatus === 'SYNCING') {
        return (
            <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-300 transition cursor-pointer"
                title="Synchronizing queued clinical records with VPS backend..."
            >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>Syncing ({pendingCount})...</span>
            </button>
        );
    }

    if (pendingCount > 0) {
        return (
            <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-300 rounded-full px-2 py-0.5 text-xs">
                <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="flex items-center gap-1 text-yellow-800 font-semibold hover:underline"
                >
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                    <span>{pendingCount} Queued</span>
                </button>
                <button
                    onClick={handleSyncClick}
                    className="ml-1 px-2 py-0.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-full text-[10px] transition"
                >
                    Sync
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
            title="Online & Synchronized with VPS MySQL Database. Click to view Sync Center."
        >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <Wifi className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">VPS Synced</span>
        </button>
    );
};
