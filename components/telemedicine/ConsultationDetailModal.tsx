import React from 'react';
import {
    X,
    Video,
    FileText,
    Printer,
    HeartPulse,
    Pill,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    Building2,
    ShieldCheck,
} from 'lucide-react';
import { TelemedicineAppointment } from '../../packages/shared/types';

interface ConsultationDetailModalProps {
    appointment: TelemedicineAppointment | null;
    isOpen: boolean;
    onClose: () => void;
    onStartCall: (appointment: TelemedicineAppointment) => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
    appointment,
    isOpen,
    onClose,
    onStartCall,
}) => {
    if (!isOpen || !appointment) return null;

    const isLiveOrWaiting = appointment.status === 'Waiting' || appointment.status === 'In Consultation';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Virtual Encounter Record: {appointment.patientName}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {appointment.patientMRN} • {appointment.tenantName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition"
                            title="Print Record"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-800">
                    {/* Status & Timing Banner */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Encounter Status</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-gray-900 text-sm">{appointment.status}</span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                                    {appointment.urgency}
                                </span>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Scheduled Time</span>
                            <p className="font-semibold text-gray-900">
                                {new Date(appointment.scheduledTime).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </p>
                            <p className="text-[11px] text-gray-500">Encrypted Room: {appointment.roomCode}</p>
                        </div>
                    </div>

                    {/* Clinician & Chief Complaint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Attending Clinician</span>
                            <p className="font-bold text-gray-900">{appointment.providerName}</p>
                            <p className="text-teal-700 font-medium">{appointment.providerSpecialty}</p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Allergies & Cautions</span>
                            {appointment.allergies && appointment.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {appointment.allergies.map((a) => (
                                        <span key={a} className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No known drug allergies (NKDA)</p>
                            )}
                        </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Chief Complaint</span>
                        <p className="text-gray-900 text-xs leading-relaxed">{appointment.chiefComplaint}</p>
                    </div>

                    {/* Recorded RPM Telemetry */}
                    <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                        <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                            <HeartPulse className="w-4 h-4 text-rose-500" />
                            <span>Remote Patient Monitoring (RPM) Recorded Vitals</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div className="p-2 bg-white rounded-lg border border-teal-100">
                                <span className="text-gray-500 text-[10px] block">Heart Rate</span>
                                <span className="font-bold text-gray-900 text-sm">{appointment.rpmVitals.heartRate} bpm</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-teal-100">
                                <span className="text-gray-500 text-[10px] block">Blood Pressure</span>
                                <span className="font-bold text-gray-900 text-sm">{appointment.rpmVitals.bloodPressure}</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-teal-100">
                                <span className="text-gray-500 text-[10px] block">Oxygen (SpO2)</span>
                                <span className="font-bold text-teal-700 text-sm">{appointment.rpmVitals.spO2}%</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-teal-100">
                                <span className="text-gray-500 text-[10px] block">Rhythm Strip</span>
                                <span className="font-bold text-gray-900 text-[11px] truncate block">
                                    {appointment.rpmVitals.ecgStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SOAP Notes if completed */}
                    {appointment.soapNotes ? (
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                                Ambient AI Generated Clinical SOAP Documentation
                            </h4>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <strong className="text-teal-800 block text-[11px]">Subjective (S):</strong>
                                    <p className="text-gray-700 mt-0.5">{appointment.soapNotes.subjective}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <strong className="text-teal-800 block text-[11px]">Objective (O):</strong>
                                    <p className="text-gray-700 mt-0.5">{appointment.soapNotes.objective}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <strong className="text-teal-800 block text-[11px]">Assessment (A):</strong>
                                    <p className="text-gray-700 mt-0.5">{appointment.soapNotes.assessment}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <strong className="text-teal-800 block text-[11px]">Plan (P):</strong>
                                    <p className="text-gray-700 mt-0.5">{appointment.soapNotes.plan}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                            SOAP documentation and clinical transcription will populate during or after the live consultation.
                        </div>
                    )}

                    {/* Prescriptions if any */}
                    {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Pill className="w-4 h-4 text-teal-600" />
                                <span>Electronic Prescriptions Transmitted</span>
                            </h4>
                            <div className="space-y-2">
                                {appointment.prescriptions.map((rx, idx) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{rx.medication} - {rx.dosage}</p>
                                            <p className="text-gray-600 text-[11px] mt-0.5">{rx.frequency}</p>
                                            {rx.instructions && (
                                                <p className="text-gray-500 text-[10px] mt-0.5">Instructions: {rx.instructions}</p>
                                            )}
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 shrink-0">
                                            Dispatched to Pharmacy
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Close
                    </button>

                    {isLiveOrWaiting && (
                        <button
                            onClick={() => {
                                onClose();
                                onStartCall(appointment);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                        >
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch Consultation Suite</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
