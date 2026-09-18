import React, { useState } from 'react';
import { X, TestTube, Plus, AlertCircle, Sparkles } from 'lucide-react';
import {
    LabOrder,
    LabUrgency,
    LabSpecimenType,
    LabTestCategory,
} from '../../packages/shared/types';
import { getStoredPatients } from '../../api/mockPatientData';
import { getLabCatalog } from '../../api/laboratoryApi';

interface NewLabOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<LabOrder>) => Promise<void>;
}

export const NewLabOrderModal: React.FC<NewLabOrderModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const patients = getStoredPatients();
    const catalog = getLabCatalog();

    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat_001');
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>(catalog[0]?.id || 'cat_cbc');
    const [specimenType, setSpecimenType] = useState<LabSpecimenType>(
        catalog[0]?.defaultSpecimen || 'Venous Whole Blood'
    );
    const [urgency, setUrgency] = useState<LabUrgency>('Routine');
    const [orderingPhysicianName, setOrderingPhysicianName] = useState<string>('Dr. Sarah Lin, MD');
    const [orderingPhysicianDepartment, setOrderingPhysicianDepartment] = useState<string>('Cardiology');
    const [clinicalIndication, setClinicalIndication] = useState<string>('Diagnostic workup and clinical monitoring.');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const selectedCatalogItem = catalog.find((c) => c.id === selectedCatalogId) || catalog[0];

    const handleCatalogChange = (newCatalogId: string) => {
        setSelectedCatalogId(newCatalogId);
        const item = catalog.find((c) => c.id === newCatalogId);
        if (item) {
            setSpecimenType(item.defaultSpecimen);
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
                testPanelName: selectedCatalogItem.name,
                category: selectedCatalogItem.category,
                specimenType,
                urgency,
                orderingPhysicianName,
                orderingPhysicianDepartment,
                clinicalIndication,
                status: 'Ordered',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate laboratory order.');
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
                            <TestTube className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral">New Laboratory Order</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Select patient, diagnostic panel, and specimen requisition specifications.
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

                        {/* Patient Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Registered Patient
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

                        {/* Test Catalog Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Diagnostic Test Panel / Profile
                            </label>
                            <select
                                value={selectedCatalogId}
                                onChange={(e) => handleCatalogChange(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                            >
                                {catalog.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — [{c.category}] (Est. TAT: {c.turnaroundHours}h)
                                    </option>
                                ))}
                            </select>
                            {selectedCatalogItem && (
                                <p className="text-[11px] text-gray-500 mt-1">
                                    {selectedCatalogItem.description}
                                </p>
                            )}
                        </div>

                        {/* Specimen Type and Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Specimen Matrix / Source
                                </label>
                                <select
                                    value={specimenType}
                                    onChange={(e) => setSpecimenType(e.target.value as LabSpecimenType)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Venous Whole Blood">Venous Whole Blood (EDTA/Lavender)</option>
                                    <option value="Serum">Serum (SST/Gold Top)</option>
                                    <option value="Plasma">Plasma (Sodium Heparin/Green)</option>
                                    <option value="Urine">Urine (Midstream Clean Catch)</option>
                                    <option value="CSF">Cerebrospinal Fluid (CSF)</option>
                                    <option value="Nasopharyngeal Swab">Nasopharyngeal Swab</option>
                                    <option value="Stool">Stool Sample</option>
                                    <option value="Sputum">Induced Sputum</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Acuity / Processing Urgency
                                </label>
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value as LabUrgency)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Routine">Routine (Standard Queue)</option>
                                    <option value="Urgent">Urgent (Expedited)</option>
                                    <option value="STAT">STAT / Critical (Immediate Analysis &lt; 45m)</option>
                                </select>
                            </div>
                        </div>

                        {/* Prescribing Physician & Department */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Ordering Physician
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
                                    Department / Service
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={orderingPhysicianDepartment}
                                    onChange={(e) => setOrderingPhysicianDepartment(e.target.value)}
                                    placeholder="e.g. Cardiology, Emergency, ICU"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Clinical Indication */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Clinical Indication / Diagnostic Rationale
                            </label>
                            <textarea
                                rows={2}
                                value={clinicalIndication}
                                onChange={(e) => setClinicalIndication(e.target.value)}
                                placeholder="State symptoms, differential diagnoses, or reason for order..."
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
                            {isSubmitting ? 'Submitting Order...' : 'Generate Laboratory Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
