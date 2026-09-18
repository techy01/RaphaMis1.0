import React, { useState } from 'react';
import { X, Calendar, Clock, Video, UserCheck, AlertCircle } from 'lucide-react';
import {
    PortalAppointmentBooking,
    PortalAppointmentType,
} from '../../packages/shared/types';

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<PortalAppointmentBooking>) => Promise<void>;
    patientName?: string;
    patientMrn?: string;
    tenantName?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    patientName = 'Eleanor Vance',
    patientMrn = 'MRN-10023',
    tenantName = 'St. Jude General Hospital',
}) => {
    if (!isOpen) return null;

    const [providerName, setProviderName] = useState('Dr. Sarah Jenkins, MD');
    const [specialty, setSpecialty] = useState('Cardiology');
    const [appointmentType, setAppointmentType] =
        useState<PortalAppointmentType>('In-Person Consultation');
    const [requestedDate, setRequestedDate] = useState('2026-09-18');
    const [requestedTimeSlot, setRequestedTimeSlot] = useState('10:00 AM');
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!reasonForVisit.trim()) {
            setError('Please provide a brief reason for your visit.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                patientName,
                patientMrn,
                tenantName,
                providerName,
                specialty,
                appointmentType,
                requestedDate,
                requestedTimeSlot,
                reasonForVisit: reasonForVisit.trim(),
                status: 'Confirmed',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to book appointment.');
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
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Schedule Patient Appointment
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Select clinician, consultation format, date, and preferred time window.
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

                        {/* Patient context card */}
                        <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                            <div>
                                <span className="text-gray-500 block text-[11px]">Scheduling For Patient:</span>
                                <span className="font-bold text-gray-900">{patientName} ({patientMrn})</span>
                            </div>
                            <span className="text-teal-800 font-medium">{tenantName}</span>
                        </div>

                        {/* Provider & Specialty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Attending Physician
                                </label>
                                <select
                                    value={providerName}
                                    onChange={(e) => {
                                        setProviderName(e.target.value);
                                        if (e.target.value.includes('Sarah')) setSpecialty('Cardiology');
                                        else if (e.target.value.includes('Christopher')) setSpecialty('Internal Medicine');
                                        else if (e.target.value.includes('Julian')) setSpecialty('Orthopedic Surgery');
                                        else setSpecialty('Pediatrics');
                                    }}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="Dr. Sarah Jenkins, MD">Dr. Sarah Jenkins, MD</option>
                                    <option value="Dr. Christopher Bell, MD">Dr. Christopher Bell, MD</option>
                                    <option value="Dr. Julian Thorne, MD">Dr. Julian Thorne, MD</option>
                                    <option value="Dr. Maya Lin, MD">Dr. Maya Lin, MD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Clinical Specialty
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={specialty}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Consultation Format */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Consultation Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {(
                                    [
                                        'In-Person Consultation',
                                        'Video Telemedicine',
                                        'Follow-up',
                                        'Routine Checkup',
                                    ] as PortalAppointmentType[]
                                ).map((type) => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setAppointmentType(type)}
                                        className={`p-2 text-xs rounded-lg border text-left flex items-center gap-2 transition ${
                                            appointmentType === type
                                                ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        {type === 'Video Telemedicine' ? (
                                            <Video className="h-4 w-4 text-teal-600 shrink-0" />
                                        ) : (
                                            <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
                                        )}
                                        <span className="truncate">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date and Time Slot */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Appointment Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={requestedDate}
                                    onChange={(e) => setRequestedDate(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Time Slot
                                </label>
                                <select
                                    value={requestedTimeSlot}
                                    onChange={(e) => setRequestedTimeSlot(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    <option value="09:00 AM">09:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="10:30 AM">10:30 AM</option>
                                    <option value="11:15 AM">11:15 AM</option>
                                    <option value="01:30 PM">01:30 PM</option>
                                    <option value="02:00 PM">02:00 PM</option>
                                    <option value="03:30 PM">03:30 PM</option>
                                </select>
                            </div>
                        </div>

                        {/* Reason for visit */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Primary Reason for Visit / Symptoms
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={reasonForVisit}
                                onChange={(e) => setReasonForVisit(e.target.value)}
                                placeholder="Describe current symptoms, recent changes, or goals for this consultation..."
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
                            <Calendar className="h-4 w-4" />
                            {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
