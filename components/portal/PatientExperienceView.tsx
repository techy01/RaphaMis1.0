import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    Calendar,
    MessageSquare,
    Pill,
    FileText,
    CreditCard,
    Video,
    UserCheck,
    Clock,
    CheckCircle2,
    Shield,
    Download,
    ExternalLink,
    AlertCircle,
    ArrowRight,
    Lock,
    Sparkles,
    Eye,
} from 'lucide-react';
import {
    PortalAppointmentBooking,
    PortalSecureMessage,
    PortalRefillRequest,
    PortalUserAccount,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';

interface PatientExperienceViewProps {
    currentUser: PortalUserAccount;
    appointments: PortalAppointmentBooking[];
    messages: PortalSecureMessage[];
    refills: PortalRefillRequest[];
    onOpenBookModal: () => void;
    onOpenRefillModal: () => void;
    onOpenMessageThread: (msg: PortalSecureMessage) => void;
    onCancelAppointment: (id: string) => void;
    onSwitchPatient: (user: PortalUserAccount) => void;
    allUsers: PortalUserAccount[];
}

export const PatientExperienceView: React.FC<PatientExperienceViewProps> = ({
    currentUser,
    appointments,
    messages,
    refills,
    onOpenBookModal,
    onOpenRefillModal,
    onOpenMessageThread,
    onCancelAppointment,
    onSwitchPatient,
    allUsers,
}) => {
    const [activeSection, setActiveSection] = useState<'appointments' | 'records' | 'meds' | 'messages' | 'billing'>('appointments');
    const [paidBills, setPaidBills] = useState<Record<string, boolean>>({});

    const patientAppointments = appointments.filter(
        (a) => a.patientId === currentUser.patientId || a.patientMrn === currentUser.patientMrn
    );
    const patientMessages = messages.filter(
        (m) => m.patientId === currentUser.patientId || m.patientMrn === currentUser.patientMrn
    );
    const patientRefills = refills.filter(
        (r) => r.patientId === currentUser.patientId || r.patientMrn === currentUser.patientMrn
    );

    const handlePayBill = (id: string) => {
        setPaidBills((prev) => ({ ...prev, [id]: true }));
    };

    return (
        <div className="space-y-6">
            {/* Top Patient Welcome Banner */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white p-6 rounded-2xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-teal-600/60 text-teal-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Live Patient Experience Mode
                            </span>
                            <span className="text-teal-200 text-xs">Viewing as:</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome back, {currentUser.patientName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100/80 mt-1">
                            <span>MRN: <strong className="text-white font-mono">{currentUser.patientMrn}</strong></span>
                            <span>•</span>
                            <span>{currentUser.tenantName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" /> 2FA Verified Account
                            </span>
                        </div>
                    </div>

                    {/* Switch Demo Patient Selector */}
                    <div className="bg-teal-950/40 p-2.5 rounded-xl border border-teal-600/40 flex items-center gap-2">
                        <span className="text-xs text-teal-200 shrink-0">Switch Patient:</span>
                        <select
                            value={currentUser.id}
                            onChange={(e) => {
                                const found = allUsers.find((u) => u.id === e.target.value);
                                if (found) onSwitchPatient(found);
                            }}
                            className="text-xs py-1.5 px-2.5 rounded-lg bg-teal-900 text-white border border-teal-600/60 focus:outline-none"
                        >
                            {allUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.patientName} ({u.patientMrn})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quick Patient Action Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <button
                        onClick={onOpenBookModal}
                        className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/15 flex items-center gap-2.5 text-left text-xs font-semibold text-white"
                    >
                        <Calendar className="h-4 w-4 text-teal-200" />
                        <div>
                            <p className="leading-tight">Schedule Visit</p>
                            <p className="text-[10px] text-teal-200/80 font-normal">Find doctor & slot</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveSection('messages')}
                        className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/15 flex items-center gap-2.5 text-left text-xs font-semibold text-white"
                    >
                        <MessageSquare className="h-4 w-4 text-teal-200" />
                        <div>
                            <p className="leading-tight">Message Team</p>
                            <p className="text-[10px] text-teal-200/80 font-normal">HIPAA secure chat</p>
                        </div>
                    </button>

                    <button
                        onClick={onOpenRefillModal}
                        className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/15 flex items-center gap-2.5 text-left text-xs font-semibold text-white"
                    >
                        <Pill className="h-4 w-4 text-teal-200" />
                        <div>
                            <p className="leading-tight">Refill Rx</p>
                            <p className="text-[10px] text-teal-200/80 font-normal">Direct e-refill</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveSection('billing')}
                        className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/15 flex items-center gap-2.5 text-left text-xs font-semibold text-white"
                    >
                        <CreditCard className="h-4 w-4 text-teal-200" />
                        <div>
                            <p className="leading-tight">Pay Bills</p>
                            <p className="text-[10px] text-teal-200/80 font-normal">Invoices & copay</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex overflow-x-auto">
                <button
                    onClick={() => setActiveSection('appointments')}
                    className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                        activeSection === 'appointments'
                            ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Calendar className="h-4 w-4" />
                    My Appointments ({patientAppointments.length})
                </button>

                <button
                    onClick={() => setActiveSection('records')}
                    className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                        activeSection === 'records'
                            ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Medical Records & Test Results
                </button>

                <button
                    onClick={() => setActiveSection('meds')}
                    className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                        activeSection === 'meds'
                            ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Pill className="h-4 w-4" />
                    Prescriptions & Refills ({patientRefills.length})
                </button>

                <button
                    onClick={() => setActiveSection('messages')}
                    className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                        activeSection === 'messages'
                            ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <MessageSquare className="h-4 w-4" />
                    Secure Messages ({patientMessages.length})
                </button>

                <button
                    onClick={() => setActiveSection('billing')}
                    className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                        activeSection === 'billing'
                            ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <CreditCard className="h-4 w-4" />
                    Billing & Invoices
                </button>
            </div>

            {/* SECTION 1: APPOINTMENTS */}
            {activeSection === 'appointments' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-neutral">Scheduled Clinical Appointments</h3>
                        <button
                            onClick={onOpenBookModal}
                            className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition flex items-center gap-1.5"
                        >
                            <Calendar className="h-4 w-4" />
                            + Book New Appointment
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patientAppointments.length === 0 && (
                            <div className="col-span-2 bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 text-xs">
                                No appointments scheduled currently. Click &quot;Book New Appointment&quot; above.
                            </div>
                        )}

                        {patientAppointments.map((app) => {
                            const isTelemedicine = app.appointmentType === 'Video Telemedicine';
                            return (
                                <div
                                    key={app.id}
                                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
                                                {app.specialty}
                                            </span>
                                            <h4 className="text-base font-bold text-gray-900 mt-0.5">
                                                {app.providerName}
                                            </h4>
                                        </div>
                                        <StatusBadge status={app.status} size="sm" />
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-3.5 w-3.5 text-teal-600" />
                                            <span><strong>{app.requestedDate}</strong> at {app.requestedTimeSlot}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            {isTelemedicine ? (
                                                <Video className="h-3.5 w-3.5 text-indigo-600" />
                                            ) : (
                                                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                            )}
                                            <span>{app.appointmentType}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600">
                                        <span className="font-semibold text-gray-800">Reason:</span> {app.reasonForVisit}
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                                        {isTelemedicine ? (
                                            <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                                <Video className="h-3.5 w-3.5" /> Video Link Enabled
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Facility: {app.tenantName}</span>
                                        )}

                                        {app.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => onCancelAppointment(app.id)}
                                                className="text-red-600 hover:text-red-700 font-medium text-xs hover:underline"
                                            >
                                                Cancel Visit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SECTION 2: RECORDS & RESULTS */}
            {activeSection === 'records' && (
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-neutral">Available Diagnostic & Lab Reports</h3>
                                <p className="text-xs text-gray-500">Official authenticated clinical documents released by your care team.</p>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 text-xs">
                            {/* Record 1 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">Comprehensive Metabolic Panel (CMP-14)</p>
                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                            Normal
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-[11px] mt-0.5">
                                        Performed: Sept 8, 2026 • Verified by: Dr. Marcus Vance, MD (Laboratory Medicine)
                                    </p>
                                </div>
                                <button
                                    onClick={() => alert('Official PDF Diagnostic Report downloaded successfully.')}
                                    className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <Download className="h-3.5 w-3.5" /> Download Report PDF
                                </button>
                            </div>

                            {/* Record 2 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">Digital Chest Radiography (PA & Lateral X-Ray)</p>
                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                            Clear Lung Fields
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-[11px] mt-0.5">
                                        Performed: Sept 4, 2026 • Radiologist: Dr. Helena Cross, MD
                                    </p>
                                </div>
                                <button
                                    onClick={() => alert('Official DICOM Radiology Summary & Key Images downloaded.')}
                                    className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <Download className="h-3.5 w-3.5" /> View Radiology Summary
                                </button>
                            </div>

                            {/* Record 3 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">Lipid Cardiovascular Risk Panel</p>
                                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                            Mild Elevation (LDL)
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-[11px] mt-0.5">
                                        Performed: Aug 18, 2026 • Ordered by: Dr. Sarah Jenkins, MD
                                    </p>
                                </div>
                                <button
                                    onClick={() => alert('Official PDF Diagnostic Report downloaded successfully.')}
                                    className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <Download className="h-3.5 w-3.5" /> Download Report PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 3: PRESCRIPTIONS & REFILLS */}
            {activeSection === 'meds' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-neutral">Active Prescriptions & Refill Requests</h3>
                        <button
                            onClick={onOpenRefillModal}
                            className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition flex items-center gap-1.5"
                        >
                            <Pill className="h-4 w-4" />
                            + Request Refill
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3.5">Medication & Dosage</th>
                                    <th className="px-4 py-3.5">Designated Pharmacy</th>
                                    <th className="px-4 py-3.5">Request Date</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patientRefills.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400">
                                            No refill requests found. Click &quot;Request Refill&quot; to order maintenance medications.
                                        </td>
                                    </tr>
                                )}

                                {patientRefills.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-gray-50/70 transition">
                                        <td className="px-5 py-3.5">
                                            <p className="font-bold text-gray-900">{ref.medicationName}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{ref.dosage}</p>
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-gray-800">
                                            {ref.preferredPharmacy}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">
                                            {format(new Date(ref.requestDate), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={ref.status} size="sm" />
                                        </td>
                                        <td className="px-4 py-3.5 text-[11px] text-gray-600 max-w-xs">
                                            {ref.notes || 'Standard 90-day maintenance supply.'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION 4: MESSAGES */}
            {activeSection === 'messages' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-neutral">Secure Care Team Conversations</h3>
                            <p className="text-xs text-gray-500">Direct, encrypted two-way communication with your assigned doctors and nurses.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
                        {patientMessages.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                No message threads found.
                            </div>
                        )}

                        {patientMessages.map((msg) => {
                            const lastThreadItem = msg.thread[msg.thread.length - 1];
                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => onOpenMessageThread(msg)}
                                    className="p-4 hover:bg-teal-50/40 transition cursor-pointer flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-xs">{msg.subject}</h4>
                                                <StatusBadge status={msg.status} size="sm" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {lastThreadItem ? lastThreadItem.content : 'Open thread to read message...'}
                                            </p>
                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                Physician: <strong>{msg.providerName}</strong> • {msg.category}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-xs text-teal-600 font-semibold flex items-center gap-1 shrink-0">
                                        Open Chat <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SECTION 5: BILLING & INVOICES */}
            {activeSection === 'billing' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Current Due Balance</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">$50.00</p>
                            <p className="text-[11px] text-teal-600 mt-1">Specialist Consultation Copay</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Insurance Primary</span>
                            <p className="text-sm font-bold text-gray-900 mt-1">BlueCross BlueShield Premier PPO</p>
                            <p className="text-[11px] text-gray-500 mt-1">Policy: BCBS-99104820</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Payment Security</span>
                            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                                <Lock className="h-4 w-4" /> 256-bit Encrypted Card Processing
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">Visa, Mastercard, HSA/FSA accepted</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
                        <h4 className="text-sm font-bold text-neutral">Recent Patient Statements</h4>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">Invoice #INV-2026-9041 — Outpatient Cardiology Consult</p>
                                    <p className="text-gray-500 text-[11px]">Due Date: Sept 25, 2026 • St. Jude General Hospital</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900">$50.00</span>
                                    {paidBills['inv-9041'] ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Paid & Settled
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handlePayBill('inv-9041')}
                                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
                                        >
                                            <CreditCard className="h-3.5 w-3.5" /> Pay $50.00 Online
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">Invoice #INV-2026-8812 — Routine Diagnostic Lab Chemistry</p>
                                    <p className="text-gray-500 text-[11px]">Settled: Aug 20, 2026 • Direct Debit</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-400 line-through">$25.00</span>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
