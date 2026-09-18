import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    Pill,
    User,
    Building,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    ShieldAlert,
    Stethoscope,
    Activity,
    Check,
} from 'lucide-react';
import { PharmacyOrder, PharmacyTriageStatus } from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';

interface PharmacyOrderDetailsModalProps {
    order: PharmacyOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (
        orderId: string,
        status: PharmacyTriageStatus,
        details?: {
            verifiedBy?: string;
            clinicalNotes?: string;
        }
    ) => Promise<void>;
    onOverrideAlert: (orderId: string, alertId: string, reason: string) => Promise<void>;
}

export const PharmacyOrderDetailsModal: React.FC<PharmacyOrderDetailsModalProps> = ({
    order,
    isOpen,
    onClose,
    onUpdateStatus,
    onOverrideAlert,
}) => {
    if (!isOpen || !order) return null;

    const [pharmacistNotes, setPharmacistNotes] = useState(order.clinicalNotes || '');
    const [overrideReason, setOverrideReason] = useState('');
    const [selectedAlertToOverride, setSelectedAlertToOverride] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async () => {
        setIsSubmitting(true);
        try {
            await onUpdateStatus(order.id, 'In Dispensing', {
                verifiedBy: 'PharmD. Alex Chen, BCPS',
                clinicalNotes: pharmacistNotes,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispense = async () => {
        setIsSubmitting(true);
        try {
            await onUpdateStatus(order.id, 'Dispensed', {
                verifiedBy: 'PharmD. Alex Chen, BCPS',
                clinicalNotes: pharmacistNotes,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHold = async () => {
        setIsSubmitting(true);
        try {
            await onUpdateStatus(order.id, 'Clinical Hold', {
                verifiedBy: 'PharmD. Alex Chen, BCPS',
                clinicalNotes: pharmacistNotes || 'Order placed on clinical hold pending prescriber review.',
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmOverride = async (alertId: string) => {
        if (!overrideReason.trim()) return;
        setIsSubmitting(true);
        try {
            await onOverrideAlert(order.id, alertId, overrideReason);
            setSelectedAlertToOverride(null);
            setOverrideReason('');
        } finally {
            setIsSubmitting(false);
        }
    };

    let formattedDate = 'N/A';
    try {
        formattedDate = format(new Date(order.prescribedAt), 'MMM d, yyyy HH:mm');
    } catch {
        formattedDate = String(order.prescribedAt);
    }

    const urgencyColor = {
        STAT: 'bg-red-100 text-red-800 border-red-200',
        Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
        Routine: 'bg-gray-100 text-gray-700 border-gray-200',
        Discharge: 'bg-blue-100 text-blue-800 border-blue-200',
    }[order.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-neutral">
                                    Prescription Order: {order.orderNumber}
                                </h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${urgencyColor}`}>
                                    {order.urgency}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Prescribed on {formattedDate} • {order.patientTenantName}
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

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Safety Alerts Banner if any */}
                    {order.safetyAlerts && order.safetyAlerts.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Clinical Safety Alerts & Contraindications
                            </h4>
                            {order.safetyAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                                        alert.overridden
                                            ? 'bg-gray-50 border-gray-200 text-gray-700'
                                            : alert.severity === 'Contraindicated'
                                            ? 'bg-red-50 border-red-200 text-red-900'
                                            : 'bg-amber-50 border-amber-200 text-amber-900'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{alert.title}</span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                        alert.overridden
                                                            ? 'bg-gray-200 text-gray-700'
                                                            : alert.severity === 'Contraindicated'
                                                            ? 'bg-red-200 text-red-800'
                                                            : 'bg-amber-200 text-amber-800'
                                                    }`}
                                                >
                                                    {alert.severity}
                                                </span>
                                                {alert.overridden && (
                                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                                        Overridden by Pharmacist
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-gray-600">{alert.description}</p>
                                            <p className="mt-1 text-gray-500 italic">Recommendation: {alert.recommendation}</p>
                                        </div>
                                    </div>

                                    {alert.overridden ? (
                                        <div className="text-[11px] text-gray-500 bg-white p-2 rounded border border-gray-200 mt-2">
                                            <strong>Override Reason:</strong> {alert.overrideReason} ({alert.overriddenBy})
                                        </div>
                                    ) : (
                                        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                                            {selectedAlertToOverride === alert.id ? (
                                                <div className="w-full space-y-2">
                                                    <input
                                                        type="text"
                                                        value={overrideReason}
                                                        onChange={(e) => setOverrideReason(e.target.value)}
                                                        placeholder="Provide clinical rationale for overriding alert..."
                                                        className="w-full p-2 text-xs border border-gray-300 rounded bg-white"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedAlertToOverride(null)}
                                                            className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={!overrideReason.trim() || isSubmitting}
                                                            onClick={() => handleConfirmOverride(alert.id)}
                                                            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                                                        >
                                                            Confirm Override
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAlertToOverride(alert.id)}
                                                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                                                >
                                                    Document Clinical Override
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2-Column Grid: Patient Info & Medication Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                <User className="h-4 w-4 text-teal-600" />
                                Patient Information
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Full Name:</span>
                                    <span className="font-semibold text-gray-900">{order.patientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">MRN:</span>
                                    <span className="font-mono font-medium text-gray-700">{order.patientMRN}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Age & Gender:</span>
                                    <span className="text-gray-800">{order.patientAge} yrs • {order.patientGender}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location / Room:</span>
                                    <span className="text-gray-800">{order.patientLocation}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Diagnosis:</span>
                                    <span className="text-gray-800">{order.patientDiagnosis}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Known Allergies:</span>
                                    <span className="font-medium text-red-600">
                                        {order.patientAllergies?.length > 0 ? order.patientAllergies.join(', ') : 'No Known Drug Allergies'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2">
                                    <span className="text-gray-500">Renal Clearance:</span>
                                    <span className="text-gray-700">eGFR {order.eGFR} mL/min • Cr {order.serumCreatinine} mg/dL</span>
                                </div>
                            </div>
                        </div>

                        {/* Prescriber & Order Specifications */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                <Stethoscope className="h-4 w-4 text-teal-600" />
                                Prescriber & Order Status
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Prescribing Physician:</span>
                                    <span className="font-semibold text-gray-900">{order.prescriberName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Department:</span>
                                    <span className="text-gray-800">{order.prescriberDepartment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">NPI Identifier:</span>
                                    <span className="font-mono text-gray-700">{order.prescriberNPI}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Order Status:</span>
                                    <StatusBadge status={order.status} size="sm" />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Verified By:</span>
                                    <span className="text-gray-800">{order.verifiedBy || 'Pending Pharmacist Review'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery Route:</span>
                                    <span className="text-gray-800">{order.deliveryMethod}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2">
                                    <span className="text-gray-500">Barcode / NDC:</span>
                                    <span className="font-mono text-gray-600">{order.barcode || order.ndc}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medication Detail Panel */}
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                            <Pill className="h-4 w-4 text-teal-600" />
                            Prescription Details & Administration Instructions
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <p className="text-gray-500">Medication</p>
                                <p className="font-bold text-gray-900 text-sm mt-0.5">{order.medicationName}</p>
                                <p className="text-[11px] text-gray-500">{order.genericName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Dose & Route</p>
                                <p className="font-semibold text-gray-800 mt-0.5">{order.dose} • {order.route}</p>
                                <p className="text-[11px] text-gray-500">{order.strength}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Frequency & Duration</p>
                                <p className="font-semibold text-gray-800 mt-0.5">{order.frequency}</p>
                                <p className="text-[11px] text-gray-500">{order.durationDays} days treatment</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Quantity Ordered</p>
                                <p className="font-semibold text-gray-800 mt-0.5">{order.quantityOrdered} units</p>
                                <p className="text-[11px] text-gray-500">Dispensed: {order.dispensedQuantity || 0}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                            <span className="text-gray-500">Administration Instructions: </span>
                            <span className="text-gray-800 font-medium">{order.instructions}</span>
                        </div>
                    </div>

                    {/* Pharmacist Notes / Clinical Documentation */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-gray-500" />
                            Pharmacist Clinical Notes & Verification Remarks
                        </label>
                        <textarea
                            value={pharmacistNotes}
                            onChange={(e) => setPharmacistNotes(e.target.value)}
                            placeholder="Add notes on dosage verification, patient counseling, or prescriber communication..."
                            rows={3}
                            className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-2">
                        {order.status !== 'Clinical Hold' && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleHold}
                                className="px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                Place on Clinical Hold
                            </button>
                        )}

                        {order.status !== 'Dispensed' && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleVerify}
                                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verify & Approve
                            </button>
                        )}

                        {order.status !== 'Dispensed' && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleDispense}
                                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Mark as Dispensed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
