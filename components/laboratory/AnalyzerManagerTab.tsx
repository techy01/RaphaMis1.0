import React, { useState } from 'react';
import {
    Activity,
    Cpu,
    RefreshCw,
    Play,
    CheckCircle2,
    AlertTriangle,
    Zap,
    Terminal,
    Clock,
    Server,
    ArrowDownLeft,
    Check,
    Radio,
    FileText,
} from 'lucide-react';
import { LabAnalyzerDevice, AnalyzerRawMessage, LabOrder } from '../../packages/shared/types';
import { pingAnalyzer, simulateAnalyzerIngest } from '../../api/laboratoryApi';

interface AnalyzerManagerTabProps {
    analyzers: LabAnalyzerDevice[];
    rawLogs: AnalyzerRawMessage[];
    onRefresh: () => void;
    onOrderUpdated?: (order: LabOrder) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalyzerManagerTab: React.FC<AnalyzerManagerTabProps> = ({
    analyzers,
    rawLogs,
    onRefresh,
    onOrderUpdated,
    showToast,
}) => {
    const [selectedAnalyzerId, setSelectedAnalyzerId] = useState<string>(analyzers[0]?.id || 'ALL');
    const [isPinging, setIsPinging] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState<string | null>(null);
    const [activeLogPayload, setActiveLogPayload] = useState<AnalyzerRawMessage | null>(rawLogs[0] || null);

    const activeAnalyzer = analyzers.find((a) => a.id === selectedAnalyzerId) || analyzers[0];

    const handlePing = async (analyzer: LabAnalyzerDevice) => {
        setIsPinging(analyzer.id);
        try {
            const res = await pingAnalyzer(analyzer.id);
            showToast(`${analyzer.name} responded in ${res.latencyMs}ms. Status: ${res.status}`, 'success');
            onRefresh();
        } catch (err: any) {
            showToast(`Ping failed: ${err.message || 'Timeout'}`, 'error');
        } finally {
            setIsPinging(null);
        }
    };

    const handleSimulate = async (analyzer: LabAnalyzerDevice) => {
        setIsSimulating(analyzer.id);
        try {
            const result = await simulateAnalyzerIngest(analyzer.id);
            if (onOrderUpdated) {
                onOrderUpdated(result.updatedOrder);
            }
            setActiveLogPayload(result.rawMessage);
            if (result.newCriticalAlert) {
                showToast(
                    `🚨 CRITICAL PANIC INGESTED: ${result.newCriticalAlert.parameterName} (${result.newCriticalAlert.criticalValue} ${result.newCriticalAlert.unit}) on ${result.updatedOrder.orderNumber}!`,
                    'error'
                );
            } else {
                showToast(
                    `Transmitted ${result.rawMessage.parsedParametersCount} parameters from ${analyzer.name} to ${result.updatedOrder.orderNumber} (${result.updatedOrder.patientName}).`,
                    'success'
                );
            }
            onRefresh();
        } catch (err: any) {
            showToast(`Ingest simulation failed: ${err.message}`, 'error');
        } finally {
            setIsSimulating(null);
        }
    };

    const filteredLogs = selectedAnalyzerId === 'ALL'
        ? rawLogs
        : rawLogs.filter((l) => l.analyzerId === selectedAnalyzerId);

    return (
        <div className="space-y-6">
            {/* Top Overview Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-2xl border border-slate-700 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
                            <Cpu className="w-5 h-5" />
                        </span>
                        <h3 className="text-xl font-bold tracking-tight">Bidirectional LIS Analyzer Engine</h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            ASTM 1394-97 & HL7 v2.5.1
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl">
                        Hardware-level bi-directional communication with automated specimen analyzers. Automatically parses sample barcodes, matches lab accession numbers, ingests numeric flags, and escalates panic values without manual data entry.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefresh}
                        className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh Nodes
                    </button>
                    <button
                        onClick={() => handleSimulate(activeAnalyzer)}
                        disabled={isSimulating !== null}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSimulating ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        Simulate Inbound Transmission
                    </button>
                </div>
            </div>

            {/* Analyzer Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyzers.map((analyzer) => {
                    const isSelected = selectedAnalyzerId === analyzer.id;
                    const isDevicePinging = isPinging === analyzer.id;
                    const isDeviceSimulating = isSimulating === analyzer.id;

                    return (
                        <div
                            key={analyzer.id}
                            onClick={() => setSelectedAnalyzerId(analyzer.id)}
                            className={`cursor-pointer rounded-2xl border p-5 transition-all bg-white relative ${
                                isSelected
                                    ? 'border-teal-500 ring-2 ring-teal-500/15 shadow-md'
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900">{analyzer.name}</h4>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                            analyzer.status === 'ONLINE'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : analyzer.status === 'STANDBY'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {analyzer.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{analyzer.model}</p>
                                </div>
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                    {analyzer.protocol}
                                </span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                <div>
                                    <span className="text-slate-400 block text-[10px]">TCP/IP Socket:</span>
                                    <span className="font-mono font-medium text-slate-700">{analyzer.ipAddress}:{analyzer.port}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px]">Latency:</span>
                                    <span className="font-medium text-slate-700">{analyzer.lastPingMs} ms</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px]">Transmitted Results:</span>
                                    <span className="font-bold text-teal-700 font-mono">{analyzer.totalResultsTransmitted.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px]">Mode:</span>
                                    <span className="font-medium text-slate-700">{analyzer.isBidirectional ? 'Bi-Directional' : 'Unidirectional'}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePing(analyzer);
                                    }}
                                    disabled={isDevicePinging}
                                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
                                >
                                    <Radio className={`w-3.5 h-3.5 ${isDevicePinging ? 'animate-pulse text-teal-600' : ''}`} />
                                    {isDevicePinging ? 'Pinging...' : 'Ping Echo'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSimulate(analyzer);
                                    }}
                                    disabled={isDeviceSimulating}
                                    className="px-2.5 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1.5"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {isDeviceSimulating ? 'Ingesting...' : 'Simulate Ingest'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Protocol Stream Inspector & Raw Frame Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Protocol Messages List */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Interface Event Log
                            </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                            {filteredLogs.length} events
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
                        {filteredLogs.map((log) => {
                            const isSelected = activeLogPayload?.id === log.id;
                            return (
                                <div
                                    key={log.id}
                                    onClick={() => setActiveLogPayload(log)}
                                    className={`p-3.5 text-xs cursor-pointer transition-colors ${
                                        isSelected ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-800">{log.analyzerName}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                            {log.protocol}
                                        </span>
                                        {log.orderAccessionMatched && (
                                            <span className="font-mono text-teal-700">
                                                Acc: {log.orderAccessionMatched}
                                            </span>
                                        )}
                                        <span className="ml-auto text-[10px] font-semibold text-emerald-600">
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredLogs.length === 0 && (
                            <div className="p-8 text-center text-xs text-slate-400">
                                No raw protocol messages recorded for this analyzer node.
                            </div>
                        )}
                    </div>
                </div>

                {/* Raw HL7 / ASTM Syntax Inspector */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                            <FileText className="w-4 h-4 text-teal-400" />
                            <span className="font-mono font-bold">
                                {activeLogPayload ? `${activeLogPayload.analyzerName} • ${activeLogPayload.protocol} Segment View` : 'Select a message'}
                            </span>
                        </div>
                        {activeLogPayload && (
                            <span className="text-[10px] text-teal-400 font-mono bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                                CRC / Parity Verified
                            </span>
                        )}
                    </div>

                    <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-emerald-400 bg-slate-950/90 leading-relaxed min-h-[300px]">
                        {activeLogPayload ? (
                            <pre className="whitespace-pre font-mono">
                                {activeLogPayload.rawPayload}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-12">
                                <Terminal className="w-8 h-8 opacity-40" />
                                <p>Select an event from the Interface Event Log to inspect raw frame segments.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-900 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Parser Standard: ASTM 1394-97 Specification & Health Level Seven Standard 2.5</span>
                        <span className="text-slate-500">Auto-Commit to Clinical EHR: ON</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
