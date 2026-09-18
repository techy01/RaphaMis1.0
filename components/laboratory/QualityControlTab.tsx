import React, { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Plus,
    ShieldAlert,
    TrendingUp,
    HelpCircle,
    Info,
    Calendar,
    User,
    Check,
    X,
    Filter,
} from 'lucide-react';
import { LabQualityControl, LabQCRun, WestgardRule } from '../../packages/shared/types';
import { recordLabQCRun, resolveQCViolation } from '../../api/laboratoryApi';

interface QualityControlTabProps {
    qcList: LabQualityControl[];
    onRefresh: () => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const QualityControlTab: React.FC<QualityControlTabProps> = ({
    qcList,
    onRefresh,
    showToast,
}) => {
    const [selectedQcId, setSelectedQcId] = useState<string>(qcList[0]?.id || '');
    const [isAddRunModalOpen, setIsAddRunModalOpen] = useState(false);
    const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);
    const [selectedRunForCorrection, setSelectedRunForCorrection] = useState<LabQCRun | null>(null);

    // Form inputs for new run
    const [newValue, setNewValue] = useState('');
    const [technicianName, setTechnicianName] = useState('Jane Wambui, MLT');
    const [analyzerInstrument, setAnalyzerInstrument] = useState('');
    const [correctiveText, setCorrectiveText] = useState('');

    const activeQC = qcList.find((q) => q.id === selectedQcId) || qcList[0];

    if (!activeQC) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                No Quality Control configurations available.
            </div>
        );
    }

    const { targetMean, standardDeviation, runs, testParameterName, unit } = activeQC;

    // Levey-Jennings calculation limits
    const plus3SD = targetMean + 3 * standardDeviation;
    const plus2SD = targetMean + 2 * standardDeviation;
    const plus1SD = targetMean + 1 * standardDeviation;
    const minus1SD = targetMean - 1 * standardDeviation;
    const minus2SD = targetMean - 2 * standardDeviation;
    const minus3SD = targetMean - 3 * standardDeviation;

    // SVG Chart Geometry
    const chartHeight = 260;
    const chartWidth = 720;
    const padding = { top: 24, right: 30, bottom: 35, left: 65 };

    const yMin = minus3SD - standardDeviation * 0.5;
    const yMax = plus3SD + standardDeviation * 0.5;
    const yRange = yMax - yMin;

    const getY = (val: number) => {
        const normalized = (val - yMin) / yRange;
        return chartHeight - padding.bottom - normalized * (chartHeight - padding.top - padding.bottom);
    };

    const getX = (index: number, total: number) => {
        if (total <= 1) return padding.left + (chartWidth - padding.left - padding.right) / 2;
        const usableWidth = chartWidth - padding.left - padding.right;
        return padding.left + (index / (total - 1)) * usableWidth;
    };

    const handleCreateRun = async (e: React.FormEvent) => {
        e.preventDefault();
        const numVal = parseFloat(newValue);
        if (isNaN(numVal)) {
            showToast('Please enter a valid numeric value', 'error');
            return;
        }

        try {
            const res = await recordLabQCRun(
                activeQC.id,
                numVal,
                technicianName,
                analyzerInstrument || activeQC.analyzerName
            );

            if (res.newRun.status === 'IN_CONTROL') {
                showToast(`QC Run #${res.newRun.runNumber} recorded: In Control (Z: ${res.newRun.zScore}).`, 'success');
            } else if (res.newRun.status === 'WARNING_1_2S') {
                showToast(`⚠️ QC Warning: 1-2s violation (Z: ${res.newRun.zScore}). Inspect system drift.`, 'info');
            } else {
                showToast(`🚨 QC REJECTION: ${res.newRun.status} triggered! Patient testing halted.`, 'error');
            }

            setIsAddRunModalOpen(false);
            setNewValue('');
            onRefresh();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleSaveCorrection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRunForCorrection || !correctiveText.trim()) return;

        try {
            await resolveQCViolation(activeQC.id, selectedRunForCorrection.runId, correctiveText.trim());
            showToast('Corrective action recorded and QC lot returned to In-Control status.', 'success');
            setIsCorrectiveModalOpen(false);
            setSelectedRunForCorrection(null);
            setCorrectiveText('');
            onRefresh();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Parameter Switcher */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                            <Activity className="w-5 h-5" />
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">Levey-Jennings Quality Control</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            activeQC.activeStatus === 'IN_CONTROL'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : activeQC.activeStatus === 'WARNING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                            {activeQC.activeStatus.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Statistical process control adhering to ISO 15189, CAP, and Westgard Multi-Rule rejection algorithms.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* QC Lot Selector */}
                    <select
                        value={selectedQcId}
                        onChange={(e) => setSelectedQcId(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
                    >
                        {qcList.map((q) => (
                            <option key={q.id} value={q.id}>
                                {q.testParameterName} ({q.analyzerName})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setIsAddRunModalOpen(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Log QC Run
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Target Mean (x̄)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">
                        {targetMean} <span className="text-xs font-normal text-slate-500">{unit}</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Std Deviation (1s)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">
                        ±{standardDeviation} <span className="text-xs font-normal text-slate-500">{unit}</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Coefficient of Variation</span>
                    <span className="text-lg font-bold text-teal-700 font-mono">
                        {((standardDeviation / targetMean) * 100).toFixed(2)}%
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Lot Number</span>
                    <span className="text-xs font-bold text-slate-700 font-mono truncate block mt-1" title={activeQC.lotNumber}>
                        {activeQC.lotNumber}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Runs</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">
                        {runs.length}
                    </span>
                </div>
            </div>

            {/* Interactive Levey-Jennings Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">
                            {testParameterName} — Daily Control Observations
                        </h4>
                        <p className="text-xs text-slate-400">
                            Mean represented as solid emerald line; ±2s warning bounds; ±3s action rejection bounds.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> In Control
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 1-2s Warning
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Out-of-Control (Reject)
                        </span>
                    </div>
                </div>

                <div className="relative min-w-[700px]">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                        {/* Background Guide Grid */}
                        {/* +3s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(plus3SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(plus3SD)}
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                        />
                        <text x={padding.left - 8} y={getY(plus3SD) + 4} textAnchor="end" className="text-[10px] fill-rose-600 font-mono">
                            +3s ({plus3SD.toFixed(2)})
                        </text>

                        {/* +2s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(plus2SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(plus2SD)}
                            stroke="#f59e0b"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                        <text x={padding.left - 8} y={getY(plus2SD) + 4} textAnchor="end" className="text-[10px] fill-amber-600 font-mono">
                            +2s ({plus2SD.toFixed(2)})
                        </text>

                        {/* +1s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(plus1SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(plus1SD)}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                        />
                        <text x={padding.left - 8} y={getY(plus1SD) + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                            +1s ({plus1SD.toFixed(2)})
                        </text>

                        {/* Mean Line (x̄) */}
                        <line
                            x1={padding.left}
                            y1={getY(targetMean)}
                            x2={chartWidth - padding.right}
                            y2={getY(targetMean)}
                            stroke="#059669"
                            strokeWidth="2"
                        />
                        <text x={padding.left - 8} y={getY(targetMean) + 4} textAnchor="end" className="text-[10px] font-bold fill-emerald-700 font-mono">
                            Mean ({targetMean.toFixed(2)})
                        </text>

                        {/* -1s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(minus1SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(minus1SD)}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                        />
                        <text x={padding.left - 8} y={getY(minus1SD) + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                            -1s ({minus1SD.toFixed(2)})
                        </text>

                        {/* -2s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(minus2SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(minus2SD)}
                            stroke="#f59e0b"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                        <text x={padding.left - 8} y={getY(minus2SD) + 4} textAnchor="end" className="text-[10px] fill-amber-600 font-mono">
                            -2s ({minus2SD.toFixed(2)})
                        </text>

                        {/* -3s Line */}
                        <line
                            x1={padding.left}
                            y1={getY(minus3SD)}
                            x2={chartWidth - padding.right}
                            y2={getY(minus3SD)}
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                        />
                        <text x={padding.left - 8} y={getY(minus3SD) + 4} textAnchor="end" className="text-[10px] fill-rose-600 font-mono">
                            -3s ({minus3SD.toFixed(2)})
                        </text>

                        {/* Connecting Observation Polyline */}
                        {runs.length > 1 && (
                            <polyline
                                fill="none"
                                stroke="#0d9488"
                                strokeWidth="2"
                                points={runs
                                    .map((r, i) => `${getX(i, runs.length)},${getY(r.measuredValue)}`)
                                    .join(' ')}
                            />
                        )}

                        {/* Observation Data Points */}
                        {runs.map((r, i) => {
                            const cx = getX(i, runs.length);
                            const cy = getY(r.measuredValue);
                            const isReject = r.status.startsWith('REJECT');
                            const isWarning = r.status === 'WARNING_1_2S';

                            const fill = isReject ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';

                            return (
                                <g key={r.runId} className="cursor-pointer group">
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={isReject ? 6 : 4.5}
                                        fill={fill}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        className="transition-transform group-hover:scale-125"
                                    />
                                    {/* X-axis run number */}
                                    <text
                                        x={cx}
                                        y={chartHeight - 12}
                                        textAnchor="middle"
                                        className="text-[9px] fill-slate-400 font-mono"
                                    >
                                        #{r.runNumber}
                                    </text>

                                    {/* Tooltip on hover */}
                                    <title>
                                        {`Run #${r.runNumber}: ${r.measuredValue} ${unit} (Z: ${r.zScore})\nStatus: ${r.status}\nOperator: ${r.technician}\nDate: ${new Date(r.timestamp).toLocaleDateString()}`}
                                    </title>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Westgard Rules Guide & Historical Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Westgard Rule Definitions Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        Westgard Multi-Rule Criteria
                    </h4>
                    <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-amber-700 block">1₂ₛ (Warning)</span>
                            <span className="text-slate-600 text-[11px]">1 control value exceeds mean ± 2s. Initiate visual inspection.</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-rose-700 block">1₃ₛ (Rejection)</span>
                            <span className="text-slate-600 text-[11px]">1 control value exceeds mean ± 3s. Rejection: random error.</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-rose-700 block">2₂ₛ (Rejection)</span>
                            <span className="text-slate-600 text-[11px]">2 consecutive values exceed +2s or -2s. Rejection: systematic error.</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-rose-700 block">R₄ₛ (Rejection)</span>
                            <span className="text-slate-600 text-[11px]">1 run exceeds +2s and next exceeds -2s (range 4s). Random error.</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-rose-700 block">4₁ₛ / 10ₓ (Systematic Shift)</span>
                            <span className="text-slate-600 text-[11px]">4 runs exceed 1s or 10 consecutive runs on same side of mean. Rejection.</span>
                        </div>
                    </div>
                </div>

                {/* Runs Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Observation Run Ledger
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                            {runs.length} Recorded Runs
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
                        {runs.slice().reverse().map((run) => {
                            const isOut = run.status.startsWith('REJECT');
                            const isWarn = run.status === 'WARNING_1_2S';

                            return (
                                <div key={run.runId} className="p-3.5 text-xs flex items-center justify-between hover:bg-slate-50 transition">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 font-mono">Run #{run.runNumber}</span>
                                            <span className="text-slate-400">•</span>
                                            <span className="font-semibold text-slate-700">{run.measuredValue} {unit}</span>
                                            <span className="text-[10px] font-mono text-slate-500">(Z: {run.zScore > 0 ? `+${run.zScore}` : run.zScore})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                            <span>{new Date(run.timestamp).toLocaleDateString()} {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>•</span>
                                            <span>{run.technician}</span>
                                            <span>•</span>
                                            <span>{run.analyzerInstrument}</span>
                                        </div>
                                        {run.correctiveActionTaken && (
                                            <p className="text-[11px] text-teal-700 font-medium mt-1 bg-teal-50 px-2 py-0.5 rounded inline-block">
                                                Action: {run.correctiveActionTaken}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            isOut
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : isWarn
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {run.status.replace('REJECT_', '').replace('WARNING_', '')}
                                        </span>

                                        {isOut && !run.correctiveActionTaken && (
                                            <button
                                                onClick={() => {
                                                    setSelectedRunForCorrection(run);
                                                    setIsCorrectiveModalOpen(true);
                                                }}
                                                className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                                            >
                                                Log Correction
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Log New QC Run Modal */}
            {isAddRunModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Record Quality Control Run</h3>
                            <button onClick={() => setIsAddRunModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRun} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Measured Value ({unit}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    required
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder={`Target: ${targetMean}`}
                                    className="w-full text-sm font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Target Mean: {targetMean} ± {standardDeviation} 1s
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Performing Technician
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={technicianName}
                                    onChange={(e) => setTechnicianName(e.target.value)}
                                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Analyzer Instrument
                                </label>
                                <input
                                    type="text"
                                    value={analyzerInstrument || activeQC.analyzerName}
                                    onChange={(e) => setAnalyzerInstrument(e.target.value)}
                                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddRunModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm"
                                >
                                    Evaluate & Commit Run
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Corrective Action Modal */}
            {isCorrectiveModalOpen && selectedRunForCorrection && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                QC Corrective Action Documentation
                            </h3>
                            <button onClick={() => setIsCorrectiveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600">
                            Run #{selectedRunForCorrection.runNumber} triggered violation: <strong className="text-rose-700">{selectedRunForCorrection.status}</strong> with measured value {selectedRunForCorrection.measuredValue} {unit} (Z-score: {selectedRunForCorrection.zScore}).
                        </p>

                        <form onSubmit={handleSaveCorrection} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Corrective Action Taken *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={correctiveText}
                                    onChange={(e) => setCorrectiveText(e.target.value)}
                                    placeholder="e.g. Recalibrated ISE electrodes; freshly reconstituted new control vial lot; repeated test with passed result."
                                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCorrectiveModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm"
                                >
                                    Submit & Clear Hold
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
