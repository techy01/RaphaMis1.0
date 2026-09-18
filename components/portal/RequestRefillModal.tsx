import React, { useState } from 'react';
import { X, Pill, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PortalRefillRequest } from '../../packages/shared/types';

interface RequestRefillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<PortalRefillRequest>) => Promise<void>;
    patientName?: string;
    patientMrn?: string;
    tenantName?: string;
}

export const RequestRefillModal: React.FC<RequestRefillModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    patientName = 'Eleanor Vance',
    patientMrn = 'MRN-10023',
    tenantName = 'St. Jude General Hospital',
}) => {
    if (!isOpen) return null;

    const [medicationName, setMedicationName] = useState('Atorvastatin Calcium');
    const [dosage, setDosage] = useState('40mg Oral Tablet (90-day supply)');
    const [pharmacy, setPharmacy] = useState('CVS Pharmacy #4921 (Main St)');
    const [notes, setNotes] = useState('Running low on current supply; 5 tablets remaining.');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!medicationName.trim()) {
            setError('Please provide the medication name.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                patientName,
                patientMrn,
                tenantName,
                medicationName: medicationName.trim(),
                dosage: dosage.trim(),
                preferredPharmacy: pharmacy.trim(),
                notes: notes.trim(),
                status: 'Pending Review',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit refill request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Request Prescription Refill
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Electronic refill requisition forwarded to attending physician and pharmacy.
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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Patient info */}
                        <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                            <span className="text-gray-600">Patient: <strong>{patientName}</strong> ({patientMrn})</span>
                            <span className="text-teal-800 font-medium">{tenantName}</span>
                        </div>

                        {/* Medication */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Prescribed Medication Name
                            </label>
                            <input
                                type="text"
                                required
                                value={medicationName}
                                onChange={(e) => setMedicationName(e.target.value)}
                                placeholder="e.g. Lisinopril, Metformin, Atorvastatin"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Dosage */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Strength & Dosage Instructions
                            </label>
                            <input
                                type="text"
                                required
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                placeholder="e.g. 20mg Oral Daily (90-day supply)"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Preferred Pharmacy */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Preferred Pharmacy for E-Transmission
                            </label>
                            <input
                                type="text"
                                required
                                value={pharmacy}
                                onChange={(e) => setPharmacy(e.target.value)}
                                placeholder="e.g. Walgreens, CVS, Hospital Outpatient Pharmacy"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Patient Notes / Current Pill Count
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Indicate how many days of medication remain or any tolerability notes..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
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
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                            <Pill className="h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Refill Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
