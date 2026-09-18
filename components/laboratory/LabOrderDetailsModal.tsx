import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    TestTube,
    User,
    Stethoscope,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    Activity,
    Printer,
    Edit3,
    ArrowRight,
    Microscope,
    ShieldAlert,
} from 'lucide-react';
import {
    LabOrder,
    LabOrderStatus,
    LabTestParameter,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';

interface LabOrderDetailsModalProps {
    order: LabOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenResultEntry: (order: LabOrder) => void;
    onAdvanceStatus: (orderId: string, nextStatus: LabOrderStatus) => Promise<void>;
    onAcknowledgePanic: (orderId: string) => Promise<void>;
}

export const LabOrderDetailsModal: React.FC<LabOrderDetailsModalProps> = ({
    order,
    isOpen,
    onClose,
    onOpenResultEntry,
    onAdvanceStatus,
    onAcknowledgePanic,
}) => {
    if (!isOpen || !order) return null;

    const [isUpdating, setIsUpdating] = useState(false);

    const handleAdvance = async (nextStatus: LabOrderStatus) => {
        setIsUpdating(true);
        try {
            await onAdvanceStatus(order.id, nextStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAcknowledge = async () => {
        setIsUpdating(true);
        try {
            await onAcknowledgePanic(order.id);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    let formattedOrderedAt = 'N/A';
    try {
        formattedOrderedAt = format(new Date(order.orderedAt), 'MMM d, yyyy HH:mm');
    } catch {
        formattedOrderedAt = String(order.orderedAt);
    }

    let formattedCompletedAt = 'In Progress';
    if (order.completedAt) {
        try {
            formattedCompletedAt = format(new Date(order.completedAt), 'MMM d, yyyy HH:mm');
        } catch {
            formattedCompletedAt = String(order.completedAt);
        }
    }

    const urgencyBadgeColor = {
        STAT: 'bg-red-100 text-red-800 border-red-200',
        Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
        Routine: 'bg-gray-100 text-gray-700 border-gray-200',
    }[order.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <TestTube className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-neutral">
                                    Laboratory Report: {order.orderNumber}
                                </h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${urgencyBadgeColor}`}>
                                    {order.urgency}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Accession #{order.accessionNumber} • {order.patientTenantName}
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

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Critical Panic Value Alert Box if present */}
                    {order.hasCriticalAlert && (
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50/80 text-red-900 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                                            Critical Panic Laboratory Value Alert
                                        </h4>
                                        <p className="text-xs text-red-700 mt-0.5">
                                            One or more tested analytes exceed the critical panic threshold requiring immediate clinical intervention and verbal provider notification.
                                        </p>
                                    </div>
                                </div>
                                {!order.criticalAlertAcknowledgedBy ? (
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={handleAcknowledge}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition shrink-0 shadow-xs"
                                    >
                                        Acknowledge & Record Call
                                    </button>
                                ) : (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold shrink-0">
                                        Acknowledged by Provider
                                    </span>
                                )}
                            </div>
                            {order.criticalAlertAcknowledgedBy && (
                                <p className="text-[11px] text-red-700 bg-white/70 p-2 rounded border border-red-200 mt-2">
                                    <strong>Readback Confirmed:</strong> {order.criticalAlertAcknowledgedBy} at{' '}
                                    {order.criticalAlertAcknowledgedAt
                                        ? format(new Date(order.criticalAlertAcknowledgedAt), 'MMM d, yyyy HH:mm')
                                        : 'Recorded'}
                                </p>
                            )}
                        </div>
                    )}

                    {/* 2-Column Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                <User className="h-4 w-4 text-teal-600" />
                                Patient Demographics
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Patient Name:</span>
                                    <span className="font-semibold text-gray-900">{order.patientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Medical Record Number:</span>
                                    <span className="font-mono font-medium text-gray-700">{order.patientMRN}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Age & Gender:</span>
                                    <span className="text-gray-800">
                                        {order.patientAge} years • {order.patientGender}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Care Location / Bed:</span>
                                    <span className="text-gray-800 font-medium">{order.patientLocation}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2">
                                    <span className="text-gray-500">Hospital Facility:</span>
                                    <span className="text-gray-800">{order.patientTenantName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order & Specimen Specifications */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                <Stethoscope className="h-4 w-4 text-teal-600" />
                                Prescriber & Specimen Chain
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ordering Clinician:</span>
                                    <span className="font-semibold text-gray-900">{order.orderingPhysicianName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Department:</span>
                                    <span className="text-gray-800">{order.orderingPhysicianDepartment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Specimen Type:</span>
                                    <span className="text-gray-800 font-medium">{order.specimenType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Barcode Accession:</span>
                                    <span className="font-mono text-gray-700">{order.barcode}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2">
                                    <span className="text-gray-500">Status:</span>
                                    <StatusBadge status={order.status} size="sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Indication */}
                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-200 text-xs">
                        <span className="text-gray-500 font-medium">Clinical Indication / Diagnosis: </span>
                        <span className="text-gray-800">{order.clinicalIndication}</span>
                    </div>

                    {/* Test Results Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-teal-600" />
                                    {order.testPanelName}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Discipline: {order.category} • Instrument: {order.analyzerInstrument || 'Automated Line'}
                                </p>
                            </div>
                            <div className="text-right text-[11px] text-gray-500">
                                <div>Ordered: {formattedOrderedAt}</div>
                                {order.completedAt && <div>Completed: {formattedCompletedAt}</div>}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/80 text-gray-600 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2.5">Analyte / Component</th>
                                        <th className="px-3 py-2.5">Result</th>
                                        <th className="px-3 py-2.5">Flag</th>
                                        <th className="px-3 py-2.5">Reference Range</th>
                                        <th className="px-3 py-2.5">Units</th>
                                        <th className="px-4 py-2.5">Clinical Note / Interpretation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.parameters.map((param) => {
                                        const isCritical =
                                            param.flag === 'Critical High' || param.flag === 'Critical Low';
                                        const isAbnormal =
                                            param.flag === 'High' || param.flag === 'Low';

                                        return (
                                            <tr
                                                key={param.id}
                                                className={`hover:bg-teal-50/30 transition ${
                                                    isCritical
                                                        ? 'bg-red-50/40'
                                                        : isAbnormal
                                                        ? 'bg-amber-50/25'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                                    {param.name}
                                                </td>
                                                <td className="px-3 py-2.5 font-bold">
                                                    {param.value !== null && param.value !== undefined ? (
                                                        <span
                                                            className={
                                                                isCritical
                                                                    ? 'text-red-700 font-mono text-sm'
                                                                    : isAbnormal
                                                                    ? 'text-amber-800 font-mono'
                                                                    : 'text-gray-900 font-mono'
                                                            }
                                                        >
                                                            {param.value}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[11px]">
                                                            Pending measurement
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5">
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
                                                    ) : param.value !== null ? (
                                                        <span className="text-emerald-600 text-xs font-medium">
                                                            Normal
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 font-mono text-gray-600">
                                                    {param.referenceRange}
                                                </td>
                                                <td className="px-3 py-2.5 text-gray-500 font-mono">
                                                    {param.unit}
                                                </td>
                                                <td className="px-4 py-2.5 text-gray-500 text-[11px]">
                                                    {param.interpretation || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Laboratory Verification & Pathologist Sign-Off */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                Pathologist Review & Quality Verification
                            </span>
                            <span className="text-gray-500 font-mono text-[11px]">
                                {order.verifiedBy || 'Pending Laboratory Director Release'}
                            </span>
                        </div>
                        {order.technicianNotes && (
                            <p className="text-gray-600 text-[11px]">
                                <strong>Bench Tech Observation:</strong> {order.technicianNotes}
                            </p>
                        )}
                        {order.pathologistNotes && (
                            <p className="text-gray-600 text-[11px]">
                                <strong>Pathologist Remark:</strong> {order.pathologistNotes}
                            </p>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        >
                            <Printer className="h-3.5 w-3.5 text-gray-500" />
                            Print LIS Report
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {order.status === 'Ordered' && (
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvance('Sample Collected')}
                                className="px-3.5 py-2 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Clock className="h-3.5 w-3.5 text-sky-600" />
                                Record Sample Collected
                            </button>
                        )}

                        {order.status === 'Sample Collected' && (
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvance('In Analysis')}
                                className="px-3.5 py-2 text-xs font-medium text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Microscope className="h-3.5 w-3.5 text-indigo-600" />
                                Begin Bench Analysis
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenResultEntry(order);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            {order.status === 'Completed' || order.status === 'Critical Alert'
                                ? 'Edit / Validate Results'
                                : 'Enter Test Results'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
