import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Building, Stethoscope, Shield, HeartPulse } from 'lucide-react';
import { Patient, PatientStatus } from '../../packages/shared/types';
import { createPatient, updatePatient } from '../../api/patientsApi';
import { getTenants } from '../../api/tenantsApi';
import { useQuery } from '@tanstack/react-query';

interface PatientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientToEdit?: Patient | null;
    onSuccess: (patient: Patient) => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
    isOpen,
    onClose,
    patientToEdit,
    onSuccess,
}) => {
    const isEditMode = !!patientToEdit;

    const { data: tenants } = useQuery({ queryKey: ['tenants'], queryFn: getTenants });
    const tenantList = Array.isArray(tenants) ? tenants : [];

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '1990-01-01',
        gender: 'Female' as 'Male' | 'Female' | 'Other',
        bloodType: 'O+',
        phone: '',
        email: '',
        address: '',
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
        tenantId: '',
        assignedDepartment: 'General Medicine',
        primaryPhysician: 'Dr. Sarah Lin, MD',
        status: PatientStatus.Outpatient,
        roomNumber: '',
        allergies: '',
        chronicConditions: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (patientToEdit) {
            setFormData({
                firstName: patientToEdit.firstName || '',
                lastName: patientToEdit.lastName || '',
                dateOfBirth: patientToEdit.dateOfBirth || '1990-01-01',
                gender: patientToEdit.gender || 'Female',
                bloodType: patientToEdit.bloodType || 'O+',
                phone: patientToEdit.phone || '',
                email: patientToEdit.email || '',
                address: patientToEdit.address || '',
                emergencyName: patientToEdit.emergencyContact?.name || '',
                emergencyRelation: patientToEdit.emergencyContact?.relationship || '',
                emergencyPhone: patientToEdit.emergencyContact?.phone || '',
                tenantId: patientToEdit.tenantId || (tenantList[0]?.id || 'tnt_001'),
                assignedDepartment: patientToEdit.assignedDepartment || 'General Medicine',
                primaryPhysician: patientToEdit.primaryPhysician || '',
                status: patientToEdit.status || PatientStatus.Outpatient,
                roomNumber: patientToEdit.roomNumber || '',
                allergies: patientToEdit.allergies ? patientToEdit.allergies.join(', ') : '',
                chronicConditions: patientToEdit.chronicConditions ? patientToEdit.chronicConditions.join(', ') : '',
                insuranceProvider: patientToEdit.insuranceProvider || '',
                insurancePolicyNumber: patientToEdit.insurancePolicyNumber || '',
                bloodPressure: patientToEdit.vitals?.bloodPressure || '120/80',
                heartRate: patientToEdit.vitals?.heartRate || 72,
                temperature: patientToEdit.vitals?.temperature || 98.6,
                respiratoryRate: patientToEdit.vitals?.respiratoryRate || 16,
                oxygenSaturation: patientToEdit.vitals?.oxygenSaturation || 98,
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                dateOfBirth: '1990-01-01',
                gender: 'Female',
                bloodType: 'O+',
                phone: '',
                email: '',
                address: '',
                emergencyName: '',
                emergencyRelation: '',
                emergencyPhone: '',
                tenantId: tenantList[0]?.id || 'tnt_001',
                assignedDepartment: 'General Medicine',
                primaryPhysician: 'Dr. Sarah Lin, MD',
                status: PatientStatus.Outpatient,
                roomNumber: '',
                allergies: '',
                chronicConditions: '',
                insuranceProvider: 'Blue Cross Blue Shield',
                insurancePolicyNumber: 'POL-1029384',
                bloodPressure: '120/80',
                heartRate: 72,
                temperature: 98.6,
                respiratoryRate: 16,
                oxygenSaturation: 98,
            });
        }
        setError(null);
    }, [patientToEdit, isOpen, tenantList.length]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Please provide both first and last name.');
            return;
        }

        try {
            setIsSubmitting(true);

            const allergiesList = formData.allergies
                ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
            const conditionsList = formData.chronicConditions
                ? formData.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

            const selectedTenant = tenantList.find((t) => t.id === formData.tenantId) || tenantList[0];

            const payload: Partial<Patient> = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                bloodType: formData.bloodType,
                phone: formData.phone.trim() || '+1 (555) 000-0000',
                email: formData.email.trim() || 'patient@hospital.org',
                address: formData.address.trim() || 'General Community, USA',
                emergencyContact: {
                    name: formData.emergencyName.trim() || 'Next of Kin',
                    relationship: formData.emergencyRelation.trim() || 'Family',
                    phone: formData.emergencyPhone.trim() || formData.phone.trim(),
                },
                tenantId: formData.tenantId || (selectedTenant?.id || 'tnt_001'),
                tenantName: selectedTenant?.name || 'St. Jude General Hospital',
                assignedDepartment: formData.assignedDepartment,
                primaryPhysician: formData.primaryPhysician.trim() || 'Attending Staff, MD',
                status: formData.status,
                roomNumber: formData.roomNumber.trim() || undefined,
                allergies: allergiesList,
                chronicConditions: conditionsList,
                insuranceProvider: formData.insuranceProvider.trim() || 'Self-Pay',
                insurancePolicyNumber: formData.insurancePolicyNumber.trim() || 'N/A',
                vitals: {
                    bloodPressure: formData.bloodPressure,
                    heartRate: Number(formData.heartRate) || 72,
                    temperature: Number(formData.temperature) || 98.6,
                    respiratoryRate: Number(formData.respiratoryRate) || 16,
                    oxygenSaturation: Number(formData.oxygenSaturation) || 98,
                    recordedAt: new Date().toISOString(),
                },
            };

            let saved: Patient;
            if (isEditMode && patientToEdit) {
                saved = await updatePatient(patientToEdit.id, payload);
            } else {
                saved = await createPatient(payload);
            }

            onSuccess(saved);
            onClose();
        } catch (err: any) {
            console.error('Save patient failed:', err);
            setError(err.message || 'An error occurred while saving the patient record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
                {/* Modal Header */}
                <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                            {isEditMode ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditMode ? `Edit Patient Record: ${patientToEdit?.name}` : 'Register New Hospital Patient'}
                            </h2>
                            <p className="text-xs text-gray-400">
                                Complete cross-facility electronic health record intake
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Section 1: Demographics */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                            <Building className="h-4 w-4" />
                            1. Patient Identity & Facility Allocation
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    required
                                    placeholder="e.g. Eleanor"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    required
                                    placeholder="e.g. Vance"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hospital / Tenant *</label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    required
                                >
                                    {tenantList.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Biological Gender *</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                >
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other / Non-binary</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group *</label>
                                <select
                                    value={formData.bloodType}
                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-semibold text-teal-800"
                                >
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Clinical Status & Department */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                            <Stethoscope className="h-4 w-4" />
                            2. Clinical Classification & Staff
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Admission Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                >
                                    <option value={PatientStatus.Outpatient}>Outpatient</option>
                                    <option value={PatientStatus.Admitted}>Admitted (Inpatient)</option>
                                    <option value={PatientStatus.InTreatment}>In Treatment</option>
                                    <option value={PatientStatus.Critical}>Critical Care / ICU</option>
                                    <option value={PatientStatus.Discharged}>Discharged</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    value={formData.assignedDepartment}
                                    onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                >
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="General Surgery">General Surgery</option>
                                    <option value="ICU">Intensive Care Unit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Attending Physician</label>
                                <input
                                    type="text"
                                    value={formData.primaryPhysician}
                                    onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. Dr. Sarah Lin, MD"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Room / Bed Assignment</label>
                                <input
                                    type="text"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. Ward B - Bed 102"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Baseline Vitals */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                            <HeartPulse className="h-4 w-4" />
                            3. Baseline Vitals
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">BP (mmHg)</label>
                                <input
                                    type="text"
                                    value={formData.bloodPressure}
                                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                    placeholder="120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Heart Rate (bpm)</label>
                                <input
                                    type="number"
                                    value={formData.heartRate}
                                    onChange={(e) => setFormData({ ...formData, heartRate: Number(e.target.value) })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Temp (°F)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Resp Rate (/min)</label>
                                <input
                                    type="number"
                                    value={formData.respiratoryRate}
                                    onChange={(e) => setFormData({ ...formData, respiratoryRate: Number(e.target.value) })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">SpO2 (%)</label>
                                <input
                                    type="number"
                                    value={formData.oxygenSaturation}
                                    onChange={(e) => setFormData({ ...formData, oxygenSaturation: Number(e.target.value) })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Clinical History, Allergies & Insurance */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                            <Shield className="h-4 w-4" />
                            4. Medical History, Allergies & Insurance
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Allergies (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. Penicillin, Latex, Peanuts"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Chronic Conditions (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.chronicConditions}
                                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. Hypertension, Type 2 Diabetes"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Carrier</label>
                                <input
                                    type="text"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. Blue Cross Blue Shield"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Policy / Member ID</label>
                                <input
                                    type="text"
                                    value={formData.insurancePolicyNumber}
                                    onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="e.g. BCBS-9938421"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Contact & Emergency */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                            5. Patient Contact & Emergency Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="Enter patient email address"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Residential Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                    placeholder="123 Health Ave, Springfield"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    value={formData.emergencyName}
                                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                    placeholder="Contact person"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                                <input
                                    type="text"
                                    value={formData.emergencyRelation}
                                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                    placeholder="e.g. Spouse, Parent, Sibling"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Phone</label>
                                <input
                                    type="text"
                                    value={formData.emergencyPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-gray-300"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <span>Saving Record...</span>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>{isEditMode ? 'Save EHR Changes' : 'Complete Intake & Register'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
