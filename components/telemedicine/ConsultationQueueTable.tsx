import React, { useState } from 'react';
import {
    Video,
    Clock,
    User,
    Calendar,
    Activity,
    ExternalLink,
    Copy,
    Check,
    FileText,
    HeartPulse,
    ShieldAlert,
    ChevronRight,
} from 'lucide-react';
import { TelemedicineAppointment, TelemedicineStatus } from '../../packages/shared/types';

interface ConsultationQueueTableProps {
    appointments: TelemedicineAppointment[];
    onEnterConsultation: (appointment: TelemedicineAppointment) => void;
    onViewDetails: (appointment: TelemedicineAppointment) => void;
}

export const ConsultationQueueTable: React.FC<ConsultationQueueTableProps> = ({
    appointments,
    onEnterConsultation,
    onViewDetails,
}) => {
    const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);

    const handleCopyLink = (appt: TelemedicineAppointment, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `https://telehealth.raphamis.health/room/${appt.roomCode}`;
        navigator.clipboard.writeText(url);
        setCopiedRoomId(appt.id);
        setTimeout(() => setCopiedRoomId(null), 2500);
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'Urgent':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Post-Op':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Follow-up':
                return 'bg-teal-50 text-teal-700 border-teal-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getStatusBadge = (status: TelemedicineStatus) => {
        switch (status) {
            case 'In Consultation':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        In Session
                    </span>
                );
            case 'Waiting':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                        In Waiting Room
                    </span>
                );
            case 'Scheduled':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Scheduled Today
                    </span>
                );
            case 'Completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        Completed & Synced
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
                        {status}
                    </span>
                );
        }
    };

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-gray-800">No Virtual Consultations Found</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    There are currently no telemedicine appointments matching your current search or filter criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-[11px] tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3.5">Patient Details</th>
                            <th className="px-4 py-3.5">Chief Complaint & Urgency</th>
                            <th className="px-4 py-3.5">Assigned Clinician</th>
                            <th className="px-4 py-3.5">Schedule / Room</th>
                            <th className="px-4 py-3.5">Live RPM Vitals HUD</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                        {appointments.map((appt) => {
                            const isLive = appt.status === 'In Consultation' || appt.status === 'Waiting';

                            return (
                                <tr
                                    key={appt.id}
                                    onClick={() => onViewDetails(appt)}
                                    className="hover:bg-gray-50/80 transition cursor-pointer"
                                >
                                    {/* Patient Details */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200">
                                                {appt.patientName
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block text-sm hover:text-teal-700">
                                                    {appt.patientName}
                                                </span>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-normal mt-0.5">
                                                    <span>{appt.patientMRN}</span>
                                                    <span>•</span>
                                                    <span>{appt.patientAge}y {appt.patientGender}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Chief Complaint & Urgency */}
                                    <td className="px-4 py-4 max-w-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getUrgencyBadge(
                                                    appt.urgency
                                                )}`}
                                            >
                                                {appt.urgency}
                                            </span>
                                            {appt.allergies && appt.allergies.length > 0 && (
                                                <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                                    Allergy: {appt.allergies[0]}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-normal">
                                            {appt.chiefComplaint}
                                        </p>
                                    </td>

                                    {/* Assigned Clinician */}
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-gray-900">{appt.providerName}</p>
                                        <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                                            {appt.providerSpecialty}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{appt.tenantName}</p>
                                    </td>

                                    {/* Schedule & Encrypted Room */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-800 font-semibold">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>
                                                {new Date(appt.scheduledTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            <span className="text-gray-400 font-normal text-[11px]">
                                                ({appt.durationMinutes}m)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <code className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">
                                                {appt.roomCode}
                                            </code>
                                            <button
                                                onClick={(e) => handleCopyLink(appt, e)}
                                                className="p-1 text-gray-400 hover:text-teal-700 transition"
                                                title="Copy secure link"
                                            >
                                                {copiedRoomId === appt.id ? (
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>
                                    </td>

                                    {/* Live RPM Vitals HUD */}
                                    <td className="px-4 py-4">
                                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] space-y-1 min-w-[140px]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <HeartPulse className="w-3 h-3 text-rose-500" /> HR:
                                                </span>
                                                <span className="font-bold text-gray-900">{appt.rpmVitals.heartRate} bpm</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">BP:</span>
                                                <span className="font-bold text-gray-900">{appt.rpmVitals.bloodPressure}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">SpO2:</span>
                                                <span className="font-bold text-teal-700">{appt.rpmVitals.spO2}%</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-4 py-4">{getStatusBadge(appt.status)}</td>

                                    {/* Actions */}
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {isLive ? (
                                                <button
                                                    onClick={() => onEnterConsultation(appt)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                                                >
                                                    <Video className="w-3.5 h-3.5" />
                                                    <span>Enter Call</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onViewDetails(appt)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                    <span>Encounter</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
