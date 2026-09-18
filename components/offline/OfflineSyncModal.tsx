import React from 'react';
import {
    X,
    Wifi,
    WifiOff,
    RefreshCw,
    Database,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Shield,
    HardDrive,
    Trash2,
} from 'lucide-react';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';

export const OfflineSyncModal: React.FC = () => {
    const {
        isOnline,
        syncStatus,
        pendingCount,
        lastSyncTime,
        lastError,
        outboxItems,
        syncNow,
        checkConnectivity,
        clearFailedQueue,
        isSyncModalOpen,
        setIsSyncModalOpen,
    } = useOfflineSync();

    if (!isSyncModalOpen) return null;

    const formatTimestamp = (ts: string | null) => {
        if (!ts) return 'Never';
        try {
            return new Date(ts).toLocaleString();
        } catch {
            return ts;
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'UPDATE_VITALS':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Vitals & NEWS2</span>;
            case 'ADD_PRESCRIPTION':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Medication Order</span>;
            case 'ADD_CLINICAL_NOTE':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Clinical Note</span>;
            case 'REGISTER_PATIENT':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">Patient Intake</span>;
            case 'UPDATE_PATIENT':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Patient Update</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">{action}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                Offline Resilience & Sync Center
                            </h2>
                            <p className="text-xs text-gray-500">
                                Phase 2: Intermittent Connectivity Engine & Client-Side Outbox
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSyncModalOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                    {/* Status Overview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                            <span className="text-gray-500 font-medium block mb-1">Network Connection</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-sm font-bold text-gray-900">
                                    {isOnline ? 'Connected to VPS' : 'Operating Offline'}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                                {isOnline ? 'Direct wire to MySQL Backend' : 'Client IndexedDB storage active'}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                            <span className="text-gray-500 font-medium block mb-1">Pending Outbox Queue</span>
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-teal-600" />
                                <span className="text-sm font-bold text-gray-900">{pendingCount} Changes Queued</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                                Guaranteed sequential FIFO replay
                            </span>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                            <span className="text-gray-500 font-medium block mb-1">Last Full Synchronization</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-800">{formatTimestamp(lastSyncTime)}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                                Auto-syncs every 30s when online
                            </span>
                        </div>
                    </div>

                    {lastError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                            <span>{lastError}</span>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => checkConnectivity()}
                                className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Ping Connection
                            </button>
                            {outboxItems.some((i) => i.status === 'FAILED') && (
                                <button
                                    onClick={clearFailedQueue}
                                    className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear Failed Items
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => syncNow()}
                            disabled={!isOnline || syncStatus === 'SYNCING' || pendingCount === 0}
                            className={`px-4 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 shadow-xs ${
                                !isOnline || syncStatus === 'SYNCING' || pendingCount === 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                            {syncStatus === 'SYNCING' ? 'Synchronizing...' : 'Sync Outbox Now'}
                        </button>
                    </div>

                    {/* Outbox Queue Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                                <HardDrive className="w-4 h-4 text-teal-600" />
                                Local Outbox Changes ({outboxItems.length})
                            </h3>
                            <span className="text-[11px] text-gray-500 font-mono">IndexedDB Store: outbox_queue</span>
                        </div>

                        {outboxItems.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                                <p className="font-medium text-gray-700">Outbox Queue is Empty</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    All clinical vitals, prescriptions, and notes are fully persisted to the VPS MySQL database.
                                </p>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold text-[11px]">
                                        <tr>
                                            <th className="px-3.5 py-2.5">Action</th>
                                            <th className="px-3.5 py-2.5">Patient Reference</th>
                                            <th className="px-3.5 py-2.5">Queued At</th>
                                            <th className="px-3.5 py-2.5">Sync Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {outboxItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/70">
                                                <td className="px-3.5 py-2.5">{getActionBadge(item.action)}</td>
                                                <td className="px-3.5 py-2.5 font-medium text-gray-800">
                                                    {item.patientName || item.patientId}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-gray-500">
                                                    {formatTimestamp(item.createdAt)}
                                                </td>
                                                <td className="px-3.5 py-2.5">
                                                    {item.status === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            Pending Replay
                                                        </span>
                                                    )}
                                                    {item.status === 'SYNCING' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                                                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                            Sending...
                                                        </span>
                                                    )}
                                                    {item.status === 'FAILED' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={item.error}>
                                                            <AlertTriangle className="w-2.5 h-2.5" />
                                                            Retry Failed ({item.retryCount})
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Offline Architecture Banner */}
                    <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3.5 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-teal-900 text-xs">Rural & Field Resilience Architecture</h4>
                            <p className="text-[11px] text-teal-800 leading-relaxed mt-0.5">
                                Designed specifically for intermittent internet, outreach safaris, and emergency clinics. Patient dossiers remain readable offline, and new clinical actions are queued safely into IndexedDB. Once connectivity is detected, RaphaMIS replays all transactions to the VPS MySQL database in chronological order without clinical collision.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={() => setIsSyncModalOpen(false)}
                        className="px-4 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
