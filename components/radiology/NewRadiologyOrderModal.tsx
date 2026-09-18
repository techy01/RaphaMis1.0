import React, { useState } from 'react';
import { X, Film, Plus, AlertCircle } from 'lucide-react';
import {
    RadiologyStudy,
    RadiologyUrgency,
    RadiologyModality,
    RadiologyBodyRegion,
} from '../../packages/shared/types';
import { getStoredPatients } from '../../api/mockPatientData';
import { getRadiologyCatalog } from '../../api/radiologyApi';

interface NewRadiologyOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<RadiologyStudy>) => Promise<void>;
}

export const NewRadiologyOrderModal: React.FC<NewRadiologyOrderModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const patients = getStoredPatients();
    const catalog = getRadiologyCatalog();

    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat_001');
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>(catalog[0]?.id || 'proc_cxr');
    const [urgency, setUrgency] = useState<RadiologyUrgency>('Routine');
    const [contrastUsed, setContrastUsed] = useState<boolean>(catalog[0]?.requiresContrast || false);
    const [orderingPhysicianName, setOrderingPhysicianName] = useState<string>('Dr. Sarah Lin, MD');
    const [orderingPhysicianDepartment, setOrderingPhysicianDepartment] = useState<string>('Cardiology');
    const [clinicalIndication, setClinicalIndication] = useState<string>('Diagnostic imaging workup and clinical evaluation.');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const selectedCatalogItem = catalog.find((c) => c.id === selectedCatalogId) || catalog[0];

    const handleCatalogChange = (newCatalogId: string) => {
        setSelectedCatalogId(newCatalogId);
        const item = catalog.find((c) => c.id === newCatalogId);
        if (item) {
            setContrastUsed(item.requiresContrast);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                patientId: selectedPatient.id,
                patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                patientMRN: selectedPatient.mrn,
                patientAge: 52,
                patientGender: selectedPatient.gender,
                patientLocation: selectedPatient.roomNumber || selectedPatient.assignedDepartment || 'Ward Bed 01',
                patientTenantId: selectedPatient.tenantId,
                patientTenantName: selectedPatient.tenantName || 'St. Jude General Hospital',
                procedureName: selectedCatalogItem.name,
                modality: selectedCatalogItem.modality,
                bodyRegion: selectedCatalogItem.bodyRegion,
                urgency,
                contrastUsed,
                contrastType: contrastUsed ? selectedCatalogItem.defaultContrastType || 'IV Contrast' : undefined,
                orderingPhysicianName,
                orderingPhysicianDepartment,
                clinicalIndication,
                status: 'Requested',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate radiology requisition.');
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
                            <Film className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral">New Radiology Requisition</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Order diagnostic imaging, CT, MRI, Ultrasound, or X-Ray examinations.
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

                        {/* Patient */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Patient Selection
                            </label>
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName} — MRN: {p.mrn} ({p.tenantName || 'Hospital'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Procedure Catalog */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Imaging Examination / Procedure
                            </label>
                            <select
                                value={selectedCatalogId}
                                onChange={(e) => handleCatalogChange(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                {catalog.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — [{c.modality}] ({c.standardDurationMinutes} mins)
                                    </option>
                                ))}
                            </select>
                            {selectedCatalogItem && (
                                <p className="text-[11px] text-gray-500 mt-1">
                                    {selectedCatalogItem.description}
                                </p>
                            )}
                        </div>

                        {/* Priority and Contrast */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Acuity / Priority Level
                                </label>
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value as RadiologyUrgency)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Routine">Routine (Standard Scheduling)</option>
                                    <option value="Urgent">Urgent (&lt; 4 Hours)</option>
                                    <option value="STAT">STAT / Emergency (&lt; 30 Mins)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Contrast Administration
                                </label>
                                <div className="flex items-center gap-3 pt-2">
                                    <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contrast"
                                            checked={!contrastUsed}
                                            onChange={() => setContrastUsed(false)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Non-contrast</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contrast"
                                            checked={contrastUsed}
                                            onChange={() => setContrastUsed(true)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>With Contrast</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Ordering Doctor & Department */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Ordering Clinician
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={orderingPhysicianName}
                                    onChange={(e) => setOrderingPhysicianName(e.target.value)}
                                    placeholder="e.g. Dr. Sarah Lin, MD"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Ordering Department
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={orderingPhysicianDepartment}
                                    onChange={(e) => setOrderingPhysicianDepartment(e.target.value)}
                                    placeholder="e.g. Cardiology, Emergency, Neurology"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Clinical Indication */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Clinical History & Diagnostic Question
                            </label>
                            <textarea
                                rows={2}
                                value={clinicalIndication}
                                onChange={(e) => setClinicalIndication(e.target.value)}
                                placeholder="Specify symptoms, signs, and differential diagnosis to guide protocoling..."
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
                            {isSubmitting ? 'Submitting Order...' : 'Requisition Imaging Study'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
