import React from 'react';
import {
    Video,
    Plus,
    Search,
    Building2,
    ShieldCheck,
    Radio,
    Wifi,
    Sparkles,
    Calendar,
    Filter,
} from 'lucide-react';
import { TelemedicineStatus } from '../../packages/shared/types';

interface TelemedicineHeaderProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    selectedTenant: string;
    onTenantChange: (tenant: string) => void;
    tenants: Array<{ id: string; name: string }>;
    onNewConsultation: () => void;
    onQuickAdmit: () => void;
    waitingCount: number;
}

export const TelemedicineHeader: React.FC<TelemedicineHeaderProps> = ({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    selectedTenant,
    onTenantChange,
    tenants,
    onNewConsultation,
    onQuickAdmit,
    waitingCount,
}) => {
    const statusTabs = [
        { id: 'All', label: 'All Encounters' },
        { id: 'Waiting', label: 'Waiting Queue' },
        { id: 'In Consultation', label: 'Live Active' },
        { id: 'Scheduled', label: 'Upcoming Today' },
        { id: 'Completed', label: 'Completed History' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
            {/* Top Bar: Title & Telemedicine Protocol Badges */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-700 border border-teal-200">
                            <Video className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Telemedicine & Virtual Care Center
                        </h2>
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            WebRTC 4K P2P Live
                        </span>
                        <span className="hidden sm:flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Ambient AI Scribe Ready
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                        High-fidelity teleconsultation portal featuring continuous Remote Patient Monitoring (RPM) telemetry, real-time diagnostic clinical decision support, and ambient automated SOAP note documentation.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {waitingCount > 0 && (
                        <button
                            onClick={onQuickAdmit}
                            className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs transition flex items-center gap-1.5"
                        >
                            <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                            <span>Admit Next Patient ({waitingCount})</span>
                        </button>
                    )}

                    <button
                        onClick={onNewConsultation}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Telehealth Visit</span>
                    </button>
                </div>
            </div>

            {/* Middle Bar: Search and Facility Scope */}
            <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search patient, MRN, complaint, room..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                    />
                </div>

                {/* Facility Scope */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Hospital Facility:</span>
                    </div>
                    <select
                        value={selectedTenant}
                        onChange={(e) => onTenantChange(e.target.value)}
                        className="w-full md:w-60 py-1.5 px-2.5 text-xs rounded-lg border border-gray-300 bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                    >
                        <option value="ALL">All Network Hospitals</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                {statusTabs.map((tab) => {
                    const isActive = statusFilter === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onStatusFilterChange(tab.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                                isActive
                                    ? 'bg-teal-600 text-white shadow-2xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
