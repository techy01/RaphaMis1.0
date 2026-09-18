import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle2,
    AlertCircle,
    Video,
    RefreshCw,
} from 'lucide-react';
import {
    TelemedicineAppointment,
    TelemedicineStatus,
} from '../../packages/shared/types';
import {
    getTelemedicineAppointments,
    getTelemedicineStats,
    createAppointment,
    updateAppointmentStatus,
} from '../../api/telemedicineApi';
import { getTenants } from '../../api/tenantsApi';
import { TelemedicineHeader } from '../telemedicine/TelemedicineHeader';
import { TelemedicineStatsCards } from '../telemedicine/TelemedicineStatsCards';
import { ConsultationQueueTable } from '../telemedicine/ConsultationQueueTable';
import { ScheduleConsultationModal } from '../telemedicine/ScheduleConsultationModal';
import { ConsultationDetailModal } from '../telemedicine/ConsultationDetailModal';
import { ActiveConsultationRoom } from '../telemedicine/ActiveConsultationRoom';

export const TelemedicineView: React.FC = () => {
    const queryClient = useQueryClient();

    // Filters and State
    const [search, setSearch] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [selectedTenant, setSelectedTenant] = useState<string>('ALL');

    // Modals and Active Call State
    const [activeConsultation, setActiveConsultation] = useState<TelemedicineAppointment | null>(null);
    const [detailAppointment, setDetailAppointment] = useState<TelemedicineAppointment | null>(null);
    const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Tenants Query
    const { data: tenantsData = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const tenants = useMemo(() => {
        return tenantsData.map((t) => ({ id: t.id, name: t.name }));
    }, [tenantsData]);

    // Appointments Query
    const {
        data: appointments = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['telemedicine-appointments', statusFilter, selectedTenant, search],
        queryFn: () =>
            getTelemedicineAppointments({
                status: statusFilter,
                tenantId: selectedTenant,
                search,
            }),
        staleTime: 10000,
    });

    // Stats Query
    const { data: stats } = useQuery({
        queryKey: ['telemedicine-stats', selectedTenant],
        queryFn: () => getTelemedicineStats(selectedTenant),
        staleTime: 10000,
    });

    // Waiting queue count
    const waitingPatients = useMemo(() => {
        return appointments.filter((a) => a.status === 'Waiting');
    }, [appointments]);

    // Actions
    const handleEnterConsultation = async (appointment: TelemedicineAppointment) => {
        if (appointment.status === 'Waiting') {
            await updateAppointmentStatus(appointment.id, 'In Consultation');
            await queryClient.invalidateQueries({ queryKey: ['telemedicine-appointments'] });
            await queryClient.invalidateQueries({ queryKey: ['telemedicine-stats'] });
        }
        setActiveConsultation(appointment);
    };

    const handleQuickAdmit = async () => {
        if (waitingPatients.length > 0) {
            const nextPatient = waitingPatients[0];
            await updateAppointmentStatus(nextPatient.id, 'In Consultation');
            await queryClient.invalidateQueries({ queryKey: ['telemedicine-appointments'] });
            await queryClient.invalidateQueries({ queryKey: ['telemedicine-stats'] });
            setActiveConsultation(nextPatient);
            triggerToast(`Admitted ${nextPatient.patientName} from the waiting queue`);
        }
    };

    const handleScheduleSubmit = async (payload: any) => {
        await createAppointment(payload);
        await queryClient.invalidateQueries({ queryKey: ['telemedicine-appointments'] });
        await queryClient.invalidateQueries({ queryKey: ['telemedicine-stats'] });
        triggerToast('Virtual consultation successfully scheduled');
    };

    const handleEndCall = async () => {
        setActiveConsultation(null);
        await queryClient.invalidateQueries({ queryKey: ['telemedicine-appointments'] });
        await queryClient.invalidateQueries({ queryKey: ['telemedicine-stats'] });
        triggerToast('Consultation concluded. Ambient SOAP notes & e-prescriptions synced to patient EHR.');
    };

    // If clinician is inside the active video consultation room, render the full-screen suite
    if (activeConsultation) {
        return (
            <ActiveConsultationRoom
                appointment={activeConsultation}
                onEndCall={handleEndCall}
            />
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header Controls */}
            <TelemedicineHeader
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                selectedTenant={selectedTenant}
                onTenantChange={setSelectedTenant}
                tenants={tenants}
                onNewConsultation={() => setIsScheduleOpen(true)}
                onQuickAdmit={handleQuickAdmit}
                waitingCount={waitingPatients.length}
            />

            {/* Stats Metrics Cards */}
            {stats && <TelemedicineStatsCards stats={stats} />}

            {/* Loading & Error States */}
            {isLoading && (
                <div className="space-y-3 animate-pulse">
                    <div className="h-16 bg-white rounded-xl border border-gray-200" />
                    <div className="h-64 bg-white rounded-xl border border-gray-200" />
                </div>
            )}

            {isError && !isLoading && (
                <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">Unable to Load Telemedicine Queue</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                        An error occurred while communicating with the virtual care signaling server.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Appointments Queue Table */}
            {!isLoading && !isError && (
                <ConsultationQueueTable
                    appointments={appointments}
                    onEnterConsultation={handleEnterConsultation}
                    onViewDetails={(appt) => setDetailAppointment(appt)}
                />
            )}

            {/* Schedule Appointment Modal */}
            <ScheduleConsultationModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onSubmit={handleScheduleSubmit}
                tenants={tenants}
            />

            {/* Appointment Detail / Encounter Summary Modal */}
            <ConsultationDetailModal
                appointment={detailAppointment}
                isOpen={!!detailAppointment}
                onClose={() => setDetailAppointment(null)}
                onStartCall={(appt) => handleEnterConsultation(appt)}
            />
        </div>
    );
};
