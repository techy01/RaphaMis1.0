import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Users,
    Calendar,
    MessageSquare,
    Pill,
    UserPlus,
    Search,
    Filter,
    Shield,
    CheckCircle2,
    Clock,
    UserCheck,
    Video,
    Eye,
    ChevronRight,
    ArrowUpDown,
    Check,
    X,
    ExternalLink,
    AlertCircle,
    Smartphone,
} from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { getTenants } from '../../api/tenantsApi';
import {
    getPortalUsers,
    getPortalAppointments,
    getPortalMessages,
    getPortalRefills,
    getPortalStats,
    bookPortalAppointment,
    updatePortalAppointmentStatus,
    sendPortalMessageReply,
    createPortalRefill,
    updatePortalRefillStatus,
    invitePatientToPortal,
} from '../../api/patientPortalApi';
import {
    PortalUserAccount,
    PortalAppointmentBooking,
    PortalSecureMessage,
    PortalRefillRequest,
} from '../../packages/shared/types';
import { PatientMessageThreadModal } from '../portal/PatientMessageThreadModal';
import { BookAppointmentModal } from '../portal/BookAppointmentModal';
import { RequestRefillModal } from '../portal/RequestRefillModal';
import { InvitePatientModal } from '../portal/InvitePatientModal';
import { PatientExperienceView } from '../portal/PatientExperienceView';

export const PatientPortalView: React.FC = () => {
    const queryClient = useQueryClient();

    // Mode Toggle: Staff Administration vs Live Patient Mode
    const [viewMode, setViewMode] = useState<'admin' | 'patient'>('admin');
    const [activeTab, setActiveTab] = useState<'users' | 'appointments' | 'messages' | 'refills'>('users');
    const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Selected Patient context for "Live Patient Experience"
    const [selectedPatientUser, setSelectedPatientUser] = useState<PortalUserAccount | null>(null);

    // Modals
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [activeMessage, setActiveMessage] = useState<PortalSecureMessage | null>(null);
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Queries
    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: stats } = useQuery({
        queryKey: ['portal-stats', selectedTenantId],
        queryFn: () => getPortalStats(selectedTenantId),
    });

    const { data: users = [], isLoading: isLoadingUsers } = useQuery({
        queryKey: ['portal-users', selectedTenantId, searchQuery],
        queryFn: () => getPortalUsers({ tenantId: selectedTenantId, search: searchQuery }),
    });

    const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
        queryKey: ['portal-appointments', selectedTenantId],
        queryFn: () => getPortalAppointments({ tenantId: selectedTenantId }),
    });

    const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ['portal-messages', selectedTenantId],
        queryFn: () => getPortalMessages({ tenantId: selectedTenantId }),
    });

    const { data: refills = [], isLoading: isLoadingRefills } = useQuery({
        queryKey: ['portal-refills', selectedTenantId],
        queryFn: () => getPortalRefills({ tenantId: selectedTenantId }),
    });

    // Automatically set default patient for patient mode
    React.useEffect(() => {
        if (!selectedPatientUser && users.length > 0) {
            setSelectedPatientUser(users[0]);
        }
    }, [users, selectedPatientUser]);

    // Mutations
    const bookAppointmentMutation = useMutation({
        mutationFn: bookPortalAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
        },
    });

    const updateAppointmentStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            updatePortalAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-appointments'] });
        },
    });

    const sendReplyMutation = useMutation({
        mutationFn: ({
            messageId,
            replyText,
            sender,
            senderName,
        }: {
            messageId: string;
            replyText: string;
            sender: 'patient' | 'provider';
            senderName: string;
        }) => sendPortalMessageReply(messageId, replyText, sender, senderName),
        onSuccess: (updatedMsg) => {
            queryClient.invalidateQueries({ queryKey: ['portal-messages'] });
            setActiveMessage(updatedMsg);
        },
    });

    const createRefillMutation = useMutation({
        mutationFn: createPortalRefill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-refills'] });
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
        },
    });

    const updateRefillStatusMutation = useMutation({
        mutationFn: ({ id, status, reviewer }: { id: string; status: any; reviewer: string }) =>
            updatePortalRefillStatus(id, status, reviewer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-refills'] });
        },
    });

    const inviteUserMutation = useMutation({
        mutationFn: invitePatientToPortal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-users'] });
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
        },
    });

    // Handlers
    const handleSwitchToPatientMode = (user: PortalUserAccount) => {
        setSelectedPatientUser(user);
        setViewMode('patient');
    };

    const handleOpenThread = (msg: PortalSecureMessage) => {
        setActiveMessage(msg);
        setIsMessageModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header with Mode Switch */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral">Patient Portal Engagement</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Comprehensive patient engagement console managing online bookings, secure HIPAA messaging, and pharmacy refills.
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex items-center self-start sm:self-auto shadow-2xs">
                    <button
                        onClick={() => setViewMode('admin')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            viewMode === 'admin'
                                ? 'bg-white text-teal-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Shield className="h-3.5 w-3.5 text-teal-600" />
                        Clinical Oversight Console
                    </button>
                    <button
                        onClick={() => setViewMode('patient')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            viewMode === 'patient'
                                ? 'bg-white text-teal-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Smartphone className="h-3.5 w-3.5 text-teal-600" />
                        Live Patient View
                    </button>
                </div>
            </div>

            {/* IF PATIENT VIEW MODE IS ACTIVE */}
            {viewMode === 'patient' ? (
                selectedPatientUser ? (
                    <PatientExperienceView
                        currentUser={selectedPatientUser}
                        appointments={appointments}
                        messages={messages}
                        refills={refills}
                        onOpenBookModal={() => setIsBookModalOpen(true)}
                        onOpenRefillModal={() => setIsRefillModalOpen(true)}
                        onOpenMessageThread={handleOpenThread}
                        onCancelAppointment={(id) =>
                            updateAppointmentStatusMutation.mutate({ id, status: 'Cancelled' })
                        }
                        onSwitchPatient={(user) => setSelectedPatientUser(user)}
                        allUsers={users}
                    />
                ) : (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                        Loading patient profile...
                    </div>
                )
            ) : (
                /* CLINICAL / STAFF OVERSIGHT CONSOLE */
                <div className="space-y-6">
                    {/* KPI Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card
                            title="Active Portal Patients"
                            value={(stats?.activePortalUsers || 2150).toLocaleString()}
                            icon={<Users className="h-6 w-6 text-teal-600" />}
                        />
                        <Card
                            title="Online Appointments"
                            value={(stats?.onlineAppointmentsBooked || 890).toLocaleString()}
                            icon={<Calendar className="h-6 w-6 text-indigo-600" />}
                        />
                        <Card
                            title="Secure Inquiries Sent"
                            value={(stats?.secureMessagesCount || 1230).toLocaleString()}
                            icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
                        />
                        <Card
                            title="Pending Refill Inquiries"
                            value={(stats?.pendingRefillRequests || 14).toLocaleString()}
                            icon={<Pill className="h-6 w-6 text-amber-600" />}
                        />
                    </div>

                    {/* Filter and Action Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-64">
                                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name, MRN, email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            {/* Tenant Selector */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedTenantId}
                                    onChange={(e) => setSelectedTenantId(e.target.value)}
                                    className="text-xs p-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                                >
                                    <option value="ALL">All Hospital Facilities</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button
                                onClick={() => setIsBookModalOpen(true)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
                            >
                                <Calendar className="h-3.5 w-3.5" /> Book Visit
                            </button>
                            <button
                                onClick={() => setIsRefillModalOpen(true)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
                            >
                                <Pill className="h-3.5 w-3.5" /> Request Refill
                            </button>
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
                            >
                                <UserPlus className="h-3.5 w-3.5" /> + Enroll Patient
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                                activeTab === 'users'
                                    ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Portal User Accounts ({users.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                                activeTab === 'appointments'
                                    ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Online Bookings ({appointments.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                                activeTab === 'messages'
                                    ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Secure Provider Messages ({messages.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('refills')}
                            className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                                activeTab === 'refills'
                                    ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Pill className="h-4 w-4" />
                            Rx Refill Requisitions ({refills.length})
                        </button>
                    </div>

                    {/* TAB 1: PORTAL USER ACCOUNTS */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5">Patient Details</th>
                                        <th className="px-4 py-3.5">Contact Credentials</th>
                                        <th className="px-4 py-3.5">Facility Tenant</th>
                                        <th className="px-4 py-3.5">Security / 2FA</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                                No patient portal accounts found matching criteria.
                                            </td>
                                        </tr>
                                    )}

                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-5 py-3.5">
                                                <p className="font-bold text-gray-900">{user.patientName}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    {user.patientMrn}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-gray-800 font-medium">{user.email}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">{user.phone}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-700">
                                                {user.tenantName}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {user.mfaEnabled ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        SMS 2FA Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                        Standard
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={user.status} size="sm" />
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleSwitchToPatientMode(user)}
                                                    className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold border border-teal-200 transition inline-flex items-center gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View as Patient
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 2: ONLINE APPOINTMENTS */}
                    {activeTab === 'appointments' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5">Patient</th>
                                        <th className="px-4 py-3.5">Physician & Specialty</th>
                                        <th className="px-4 py-3.5">Format & Date</th>
                                        <th className="px-4 py-3.5">Reason for Visit</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Review Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                                No online appointment requisitions found.
                                            </td>
                                        </tr>
                                    )}

                                    {appointments.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-5 py-3.5">
                                                <p className="font-bold text-gray-900">{app.patientName}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    {app.patientMrn}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-gray-800">{app.providerName}</p>
                                                <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                                                    {app.specialty}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                                    {app.appointmentType === 'Video Telemedicine' ? (
                                                        <Video className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                                    ) : (
                                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                    )}
                                                    <span>{app.appointmentType}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                                                    {app.requestedDate} • {app.requestedTimeSlot}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5 max-w-xs truncate text-gray-600">
                                                {app.reasonForVisit}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={app.status} size="sm" />
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                {app.status === 'Pending Approval' ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateAppointmentStatusMutation.mutate({
                                                                    id: app.id,
                                                                    status: 'Confirmed',
                                                                })
                                                            }
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateAppointmentStatusMutation.mutate({
                                                                    id: app.id,
                                                                    status: 'Cancelled',
                                                                })
                                                            }
                                                            className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs font-semibold transition"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        Processed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 3: SECURE PROVIDER MESSAGES */}
                    {activeTab === 'messages' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5">Patient & MRN</th>
                                        <th className="px-4 py-3.5">Subject & Preview</th>
                                        <th className="px-4 py-3.5">Category & Care Team</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Last Message</th>
                                        <th className="px-4 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {messages.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                                No secure message threads available.
                                            </td>
                                        </tr>
                                    )}

                                    {messages.map((msg) => {
                                        const lastItem = msg.thread[msg.thread.length - 1];
                                        return (
                                            <tr key={msg.id} className="hover:bg-gray-50/70 transition">
                                                <td className="px-5 py-3.5">
                                                    <p className="font-bold text-gray-900">{msg.patientName}</p>
                                                    <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                        {msg.patientMrn}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5 max-w-sm">
                                                    <p className="font-bold text-gray-900 line-clamp-1">{msg.subject}</p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                                        {lastItem ? lastItem.content : 'No messages'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-medium text-teal-800">{msg.category}</p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">{msg.providerName}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={msg.status} size="sm" />
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">
                                                    {format(new Date(msg.lastMessageAt), 'MMM d, h:mm a')}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <button
                                                        onClick={() => handleOpenThread(msg)}
                                                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold border border-teal-200 transition inline-flex items-center gap-1"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        Open Thread
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 4: RX REFILL REQUISITIONS */}
                    {activeTab === 'refills' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5">Patient</th>
                                        <th className="px-4 py-3.5">Prescription & Strength</th>
                                        <th className="px-4 py-3.5">Destination Pharmacy</th>
                                        <th className="px-4 py-3.5">Date Requested</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Physician Review</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {refills.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                                No prescription refill requisitions found.
                                            </td>
                                        </tr>
                                    )}

                                    {refills.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-5 py-3.5">
                                                <p className="font-bold text-gray-900">{ref.patientName}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    {ref.patientMrn}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-gray-900">{ref.medicationName}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">{ref.dosage}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-800 font-medium">
                                                {ref.preferredPharmacy}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">
                                                {format(new Date(ref.requestDate), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={ref.status} size="sm" />
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                {ref.status === 'Pending Review' ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateRefillStatusMutation.mutate({
                                                                    id: ref.id,
                                                                    status: 'Approved & Sent',
                                                                    reviewer: 'Dr. Sarah Jenkins, MD',
                                                                })
                                                            }
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                                                        >
                                                            Approve & Transmit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateRefillStatusMutation.mutate({
                                                                    id: ref.id,
                                                                    status: 'Denied',
                                                                    reviewer: 'Dr. Sarah Jenkins, MD',
                                                                })
                                                            }
                                                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold transition"
                                                        >
                                                            Deny
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        Reviewed by {ref.reviewedBy || 'Attending'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <PatientMessageThreadModal
                isOpen={isMessageModalOpen}
                message={activeMessage}
                onClose={() => setIsMessageModalOpen(false)}
                onReply={async (messageId, replyText, sender, senderName) => {
                    await sendReplyMutation.mutateAsync({
                        messageId,
                        replyText,
                        sender,
                        senderName,
                    });
                }}
                userMode={viewMode === 'patient' ? 'patient' : 'staff'}
            />

            <BookAppointmentModal
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                onSubmit={async (payload) => {
                    await bookAppointmentMutation.mutateAsync(payload);
                }}
                patientName={selectedPatientUser?.patientName}
                patientMrn={selectedPatientUser?.patientMrn}
                tenantName={selectedPatientUser?.tenantName}
            />

            <RequestRefillModal
                isOpen={isRefillModalOpen}
                onClose={() => setIsRefillModalOpen(false)}
                onSubmit={async (payload) => {
                    await createRefillMutation.mutateAsync(payload);
                }}
                patientName={selectedPatientUser?.patientName}
                patientMrn={selectedPatientUser?.patientMrn}
                tenantName={selectedPatientUser?.tenantName}
            />

            <InvitePatientModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={async (payload) => {
                    await inviteUserMutation.mutateAsync(payload);
                }}
            />
        </div>
    );
};
