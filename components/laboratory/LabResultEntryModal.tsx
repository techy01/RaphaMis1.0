import React, { useState } from 'react';
import {
    X,
    Edit3,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Wand2,
    Microscope,
} from 'lucide-react';
import {
    LabOrder,
    LabTestParameter,
} from '../../packages/shared/types';
import { calculateParameterFlag } from '../../api/laboratoryApi';

interface LabResultEntryModalProps {
    order: LabOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmitResults: (
        orderId: string,
        parameters: LabTestParameter[],
        options?: {
            analyzerInstrument?: string;
            technicianNotes?: string;
            pathologistNotes?: string;
            verifiedBy?: string;
        }
    ) => Promise<void>;
}

export const LabResultEntryModal: React.FC<LabResultEntryModalProps> = ({
    order,
    isOpen,
    onClose,
    onSubmitResults,
}) => {
    if (!isOpen || !order) return null;

    const [parameters, setParameters] = useState<LabTestParameter[]>(() => {
        return order.parameters.map((p) => ({ ...p }));
    });

    const [instrument, setInstrument] = useState(
        order.analyzerInstrument || 'Roche Cobas 8000 (Integrated Chemistry/Immunoassay)'
    );
    const [technicianNotes, setTechnicianNotes] = useState(order.technicianNotes || '');
    const [pathologistNotes, setPathologistNotes] = useState(order.pathologistNotes || '');
    const [verifiedBy, setVerifiedBy] = useState(
        order.verifiedBy || 'Dr. Marcus Vance, MD, FCAP (Pathologist)'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValueChange = (index: number, rawVal: string) => {
        setParameters((prev) => {
            const next = [...prev];
            const target = { ...next[index] };
            const numVal = rawVal.trim() === '' ? null : isNaN(Number(rawVal)) ? rawVal : Number(rawVal);
            target.value = numVal;
            target.flag = calculateParameterFlag(numVal, target);
            next[index] = target;
            return next;
        });
    };

    // Quick Fill Typical Normal Values (clinically safe midpoints)
    const handleQuickFillNormal = () => {
        setParameters((prev) =>
            prev.map((p) => {
                let midVal: number | string = '';
                if (p.refLow !== undefined && p.refHigh !== undefined) {
                    midVal = parseFloat(((p.refLow + p.refHigh) / 2).toFixed(1));
                } else if (p.refLow !== undefined) {
                    midVal = parseFloat((p.refLow * 1.2).toFixed(1));
                } else if (p.refHigh !== undefined) {
                    midVal = parseFloat((p.refHigh * 0.5).toFixed(2));
                } else {
                    midVal = 'Negative / Clear';
                }

                return {
                    ...p,
                    value: midVal,
                    flag: 'Normal',
                };
            })
        );
        if (!technicianNotes) {
            setTechnicianNotes('Calibration verified. All internal QC checks within +/- 2 SD.');
        }
    };

    const hasAnyPanic = parameters.some(
        (p) => p.flag === 'Critical High' || p.flag === 'Critical Low'
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmitResults(order.id, parameters, {
                analyzerInstrument: instrument,
                technicianNotes,
                pathologistNotes,
                verifiedBy,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Edit3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral">
                                Enter Laboratory Results: {order.orderNumber}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {order.testPanelName} • Patient: {order.patientName} (MRN: {order.patientMRN})
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

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                        {/* Quick fill toolbar */}
                        <div className="flex items-center justify-between bg-teal-50/60 p-3 rounded-lg border border-teal-100">
                            <div className="text-xs text-teal-900">
                                <strong>Automatic Reference Evaluation:</strong> Flags update dynamically in real-time as measured values are typed.
                            </div>
                            <button
                                type="button"
                                onClick={handleQuickFillNormal}
                                className="px-3 py-1.5 bg-white text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 shrink-0"
                            >
                                <Wand2 className="h-3.5 w-3.5 text-teal-600" />
                                Pre-fill Normal Benchmark
                            </button>
                        </div>

                        {/* Critical Warning if any value flags as panic */}
                        {hasAnyPanic && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                                <div>
                                    <span className="font-bold">CRITICAL PANIC VALUE DETECTED: </span>
                                    Submitting will flag this report as a Critical Alert and initiate immediate verbal telephone notification protocol.
                                </div>
                            </div>
                        )}

                        {/* Analytes Input Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2.5">Analyte Component</th>
                                        <th className="px-4 py-2.5 w-36">Measured Value</th>
                                        <th className="px-3 py-2.5">Flag</th>
                                        <th className="px-3 py-2.5">Ref. Range</th>
                                        <th className="px-3 py-2.5">Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {parameters.map((param, idx) => {
                                        const isCritical =
                                            param.flag === 'Critical High' || param.flag === 'Critical Low';
                                        const isAbnormal =
                                            param.flag === 'High' || param.flag === 'Low';

                                        return (
                                            <tr
                                                key={param.id || idx}
                                                className={`hover:bg-gray-50/80 transition ${
                                                    isCritical
                                                        ? 'bg-red-50/40'
                                                        : isAbnormal
                                                        ? 'bg-amber-50/20'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-4 py-2 font-medium text-gray-900">
                                                    {param.name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={param.value ?? ''}
                                                        onChange={(e) => handleValueChange(idx, e.target.value)}
                                                        placeholder="Enter value..."
                                                        className={`w-full px-2.5 py-1.5 text-xs rounded border font-mono ${
                                                            isCritical
                                                                ? 'border-red-400 bg-red-50/50 text-red-900 font-bold focus:ring-red-500'
                                                                : isAbnormal
                                                                ? 'border-amber-400 bg-amber-50/30 text-amber-900 font-semibold focus:ring-amber-500'
                                                                : 'border-gray-300 focus:ring-teal-500'
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    {param.flag && param.flag !== 'Normal' ? (
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                                isCritical
                                                                    ? 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                                                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                                            }`}
                                                        >
                                                            {param.flag}
                                                        </span>
                                                    ) : param.value !== null && param.value !== '' ? (
                                                        <span className="text-emerald-700 text-xs font-semibold">
                                                            Normal
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-gray-600">
                                                    {param.referenceRange}
                                                </td>
                                                <td className="px-3 py-2 text-gray-500 font-mono">
                                                    {param.unit}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Analyzer Instrument & Pathologist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <Microscope className="h-3.5 w-3.5 text-teal-600" />
                                    Analyzer Instrument
                                </label>
                                <input
                                    type="text"
                                    value={instrument}
                                    onChange={(e) => setInstrument(e.target.value)}
                                    placeholder="e.g. Roche Cobas 8000, Sysmex XN-1000"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pathologist Digital Signature
                                </label>
                                <input
                                    type="text"
                                    value={verifiedBy}
                                    onChange={(e) => setVerifiedBy(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Bench Notes */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Medical Laboratory Technologist (MLT) Bench Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={technicianNotes}
                                    onChange={(e) => setTechnicianNotes(e.target.value)}
                                    placeholder="e.g. Sample non-hemolyzed, non-lipemic. Control run passed within allowable CV limits."
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pathologist Interpretive Consultation (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={pathologistNotes}
                                    onChange={(e) => setPathologistNotes(e.target.value)}
                                    placeholder="e.g. Correlate with clinical presentation and repeat troponin in 3-6 hours."
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
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
                            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                                hasAnyPanic
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isSubmitting ? 'Validating & Releasing...' : 'Validate & Release LIS Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
