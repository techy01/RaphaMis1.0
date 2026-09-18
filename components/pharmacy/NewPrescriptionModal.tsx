import React, { useState } from 'react';
import { X, Pill, Stethoscope, AlertCircle, Plus } from 'lucide-react';
import {
    PharmacyOrder,
    PharmacyTriageUrgency,
    PharmacyOrderRoute,
} from '../../packages/shared/types';
import { getStoredPatients } from '../../api/mockPatientData';

interface NewPrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<PharmacyOrder>) => Promise<void>;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const patients = getStoredPatients();

    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat_001');
    const [medicationName, setMedicationName] = useState<string>('Amoxicillin Clavulanate');
    const [genericName, setGenericName] = useState<string>('Augmentin');
    const [dose, setDose] = useState<string>('875mg / 125mg');
    const [route, setRoute] = useState<PharmacyOrderRoute>('Oral Solid');
    const [frequency, setFrequency] = useState<string>('Every 12 hours with meals');
    const [durationDays, setDurationDays] = useState<number>(7);
    const [quantityOrdered, setQuantityOrdered] = useState<number>(14);
    const [urgency, setUrgency] = useState<PharmacyTriageUrgency>('Routine');
    const [prescriberName, setPrescriberName] = useState<string>('Dr. Sarah Lin, MD');
    const [prescriberDepartment, setPrescriberDepartment] = useState<string>('Internal Medicine');
    const [instructions, setInstructions] = useState<string>('Take 1 tablet by mouth twice daily with meals for 7 days.');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicationName.trim()) {
            setError('Please enter medication name.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                patientId: selectedPatient.id,
                patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                patientMRN: selectedPatient.mrn,
                patientAge: 45,
                patientGender: selectedPatient.gender,
                patientTenantId: selectedPatient.tenantId,
                patientTenantName: selectedPatient.tenantName || 'St. Jude General Hospital',
                patientDiagnosis: 'Bacterial Sinusitis',
                patientAllergies: selectedPatient.allergies || [],
                medicationName,
                genericName,
                dose,
                strength: dose,
                route,
                frequency,
                durationDays,
                quantityOrdered,
                urgency,
                prescriberName,
                prescriberDepartment,
                instructions,
                status: 'Pending Verification',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit prescription order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral">New Prescription Order</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Enter medication details and route to pharmacy triage queue.
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

                        {/* Patient Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Patient (Select Registered Patient)
                            </label>
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName} — MRN: {p.mrn} ({p.assignedDepartment || 'General Medicine'})
                                    </option>
                                ))}
                            </select>
                            {selectedPatient && selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                                <p className="text-[11px] text-red-600 mt-1">
                                    Patient Allergies: {selectedPatient.allergies.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Medication Details (2-Column) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Medication Brand / Trade Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={medicationName}
                                    onChange={(e) => setMedicationName(e.target.value)}
                                    placeholder="e.g. Amoxicillin Clavulanate"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Generic Name
                                </label>
                                <input
                                    type="text"
                                    value={genericName}
                                    onChange={(e) => setGenericName(e.target.value)}
                                    placeholder="e.g. Augmentin"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Dose, Route & Frequency */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Dose / Strength
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={dose}
                                    onChange={(e) => setDose(e.target.value)}
                                    placeholder="e.g. 875mg"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Administration Route
                                </label>
                                <select
                                    value={route}
                                    onChange={(e) => setRoute(e.target.value as PharmacyOrderRoute)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Oral Solid">Oral Solid</option>
                                    <option value="Oral Liquid">Oral Liquid</option>
                                    <option value="IV Piggyback">IV Piggyback</option>
                                    <option value="IV Push">IV Push</option>
                                    <option value="Continuous Infusion">Continuous Infusion</option>
                                    <option value="Subcutaneous">Subcutaneous</option>
                                    <option value="Inhalation">Inhalation</option>
                                    <option value="Topical">Topical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Frequency
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    placeholder="e.g. Every 12 hours"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Duration, Quantity & Urgency */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantityOrdered}
                                    onChange={(e) => setQuantityOrdered(Number(e.target.value))}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Acuity / Urgency
                                </label>
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value as PharmacyTriageUrgency)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Routine">Routine</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="STAT">STAT / Critical</option>
                                    <option value="Discharge">Discharge</option>
                                </select>
                            </div>
                        </div>

                        {/* Prescribing Physician */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Prescribing Doctor
                                </label>
                                <input
                                    type="text"
                                    value={prescriberName}
                                    onChange={(e) => setPrescriberName(e.target.value)}
                                    placeholder="e.g. Dr. Sarah Lin, MD"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={prescriberDepartment}
                                    onChange={(e) => setPrescriberDepartment(e.target.value)}
                                    placeholder="e.g. Internal Medicine"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Instructions for Patient / Nurse Administration
                            </label>
                            <textarea
                                rows={2}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Specific administration guidelines or meal restrictions..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            {isSubmitting ? 'Creating Order...' : 'Create Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
