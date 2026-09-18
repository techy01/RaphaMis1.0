import React, { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Building2,
    Stethoscope,
    Activity,
    AlertCircle,
    CheckCircle2,
    Radio,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../../api/patientsApi';
import { TelemedicineUrgency } from '../../packages/shared/types';

interface ScheduleConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void>;
    tenants: Array<{ id: string; name: string }>;
}

export const ScheduleConsultationModal: React.FC<ScheduleConsultationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    tenants,
}) => {
    if (!isOpen) return null;

    const { data: patientsList = [] } = useQuery({
        queryKey: ['patients-list-for-tele'],
        queryFn: () => getPatients(),
    });

    const [selectedPatientId, setSelectedPatientId] = useState<string>(
        patientsList[0]?.id || ''
    );
    const [customPatientName, setCustomPatientName] = useState<string>('');
    const [selectedTenantId, setSelectedTenantId] = useState<string>(
        tenants[0]?.id || 'tnt_001'
    );
    const [providerName, setProviderName] = useState<string>('Dr. Sarah Lin, MD');
    const [providerSpecialty, setProviderSpecialty] = useState<string>(
        'Cardiovascular Medicine'
    );
    const [scheduledDate, setScheduledDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [scheduledTime, setScheduledTime] = useState<string>('11:00');
    const [durationMinutes, setDurationMinutes] = useState<number>(20);
    const [urgency, setUrgency] = useState<TelemedicineUrgency>('Routine');
    const [chiefComplaint, setChiefComplaint] = useState<string>('');
    const [pairRpmSensors, setPairRpmSensors] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!chiefComplaint.trim()) {
            setErrorMsg('Please enter the patient’s chief complaint or clinical indication.');
            return;
        }

        setIsSubmitting(true);
        try {
            const chosenPatient = patientsList.find((p) => p.id === selectedPatientId);
            const tenantObj = tenants.find((t) => t.id === selectedTenantId);

            const payload = {
                patientId: chosenPatient?.id || `pat_guest_${Date.now()}`,
                patientName: chosenPatient?.name || customPatientName || 'Guest Patient',
                patientMRN: chosenPatient?.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
                patientAge: chosenPatient
                    ? new Date().getFullYear() - new Date(chosenPatient.dateOfBirth).getFullYear()
                    : 45,
                patientGender: chosenPatient?.gender || 'Other',
                patientPhone: chosenPatient?.phone || '+1 (555) 000-0000',
                tenantId: selectedTenantId,
                tenantName: tenantObj?.name || 'St. Jude General Hospital',
                providerId: 'usr_doc_clinician',
                providerName,
                providerSpecialty,
                scheduledTime: `${scheduledDate}T${scheduledTime}:00.000Z`,
                durationMinutes: Number(durationMinutes),
                status: 'Scheduled',
                urgency,
                chiefComplaint,
                rpmVitals: pairRpmSensors
                    ? {
                          heartRate: Math.floor(68 + Math.random() * 20),
                          bloodPressure: '120/80',
                          spO2: 98,
                          respiratoryRate: 16,
                          temperature: 98.6,
                          ecgStatus: 'Normal Sinus Rhythm',
                      }
                    : {
                          heartRate: 72,
                          bloodPressure: '120/80',
                          spO2: 98,
                          respiratoryRate: 16,
                          temperature: 98.6,
                          ecgStatus: 'Telemetry Pending',
                      },
                allergies: chosenPatient?.allergies || [],
            };

            await onSubmit(payload);
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to schedule consultation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Schedule Telehealth Consultation
                            </h3>
                            <p className="text-xs text-gray-500">
                                Create an encrypted virtual care encounter with remote patient monitoring.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Patient Selection */}
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">
                            Select Patient from Electronic Health Record (EHR)
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-900 focus:ring-1 focus:ring-teal-500"
                        >
                            {patientsList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.mrn}) - {p.tenantName}
                                </option>
                            ))}
                            <option value="custom">+ New Unregistered / Outpatient</option>
                        </select>
                    </div>

                    {selectedPatientId === 'custom' && (
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Patient Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={customPatientName}
                                onChange={(e) => setCustomPatientName(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 font-medium text-gray-900"
                            />
                        </div>
                    )}

                    {/* Facility & Clinician */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Hospital Facility</label>
                            <select
                                value={selectedTenantId}
                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-900"
                            >
                                {tenants.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Assigned Physician</label>
                            <select
                                value={providerName}
                                onChange={(e) => {
                                    setProviderName(e.target.value);
                                    if (e.target.value.includes('Sarah Lin')) setProviderSpecialty('Cardiovascular Medicine');
                                    else if (e.target.value.includes('Marcus Vance')) setProviderSpecialty('Pediatric Pulmonology');
                                    else if (e.target.value.includes('Arthur')) setProviderSpecialty('Orthopedic Surgery');
                                    else if (e.target.value.includes('Elena')) setProviderSpecialty('Tele-Psychiatry');
                                }}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-900"
                            >
                                <option value="Dr. Sarah Lin, MD">Dr. Sarah Lin, MD (Cardiology)</option>
                                <option value="Dr. Marcus Vance, FAAP">Dr. Marcus Vance, FAAP (Pediatrics)</option>
                                <option value="Dr. Arthur Pendelton, MD">Dr. Arthur Pendelton, MD (Orthopedics)</option>
                                <option value="Dr. Elena Rostova, PsyD">Dr. Elena Rostova, PsyD (Psychiatry)</option>
                            </select>
                        </div>
                    </div>

                    {/* Schedule Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Consultation Date</label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Appointment Time</label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Duration</label>
                            <select
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-900"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={20}>20 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </div>
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Clinical Urgency Tier</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['Urgent', 'Routine', 'Follow-up', 'Post-Op'] as TelemedicineUrgency[]).map((tier) => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setUrgency(tier)}
                                    className={`py-2 px-1 rounded-lg text-center font-bold text-xs border transition ${
                                        urgency === tier
                                            ? 'bg-teal-50 border-teal-600 text-teal-800'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chief Complaint */}
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">
                            Chief Complaint & Reason for Virtual Encounter
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Describe primary symptoms, recent vital fluctuations, or post-surgical milestones..."
                            value={chiefComplaint}
                            onChange={(e) => setChiefComplaint(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {/* Remote Patient Monitoring (RPM) Telemetry Toggle */}
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-teal-700 shrink-0" />
                            <div>
                                <p className="font-bold text-teal-950">Pair Remote Patient Monitoring (RPM) HUD</p>
                                <p className="text-[11px] text-teal-800">
                                    Enables live ECG strip, continuous SpO2, and automated cuff telemetry in-call.
                                </p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={pairRpmSensors}
                            onChange={(e) => setPairRpmSensors(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Creating Room...' : 'Confirm & Generate Link'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
