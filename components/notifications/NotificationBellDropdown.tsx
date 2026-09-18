import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartmentNotifications } from '../../contexts/DepartmentNotificationContext';
import {
    Bell,
    Volume2,
    VolumeX,
    CheckCheck,
    Send,
    ArrowRight,
    AlertCircle,
    X,
    Radio,
    Clock,
    Filter,
} from 'lucide-react';
import { HospitalDepartment } from '../../packages/shared/types';

export const NotificationBellDropdown: React.FC = () => {
    const {
        notifications,
        unreadCount,
        criticalCount,
        activeDepartmentFilter,
        setActiveDepartmentFilter,
        markAsRead,
        markAllAsRead,
        isMuted,
        toggleMute,
        openHandoffModal,
    } = useDepartmentNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const departments: (HospitalDepartment | 'ALL')[] = [
        'ALL',
        'Triage',
        'Consultation / OPD',
        'Laboratory',
        'Pharmacy',
        'Billing / Cashier',
        'Security / Gatepass',
    ];

    const filtered = notifications.filter((n) => {
        if (activeDepartmentFilter === 'ALL') return true;
        return n.targetDepartment === activeDepartmentFilter || n.sourceDepartment === activeDepartmentFilter;
    });

    const formatTimeAgo = (isoString: string) => {
        const diffMs = Date.now() - new Date(isoString).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const handleOpenItem = (item: typeof notifications[0]) => {
        markAsRead(item.id);
        if (item.actionUrl) {
            navigate(item.actionUrl);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg border transition-all focus:outline-none ${
                    isOpen
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : criticalCount > 0
                        ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="Hospital Inter-Department Dispatch & Notifications"
            >
                <Bell className="w-4 h-4" />

                {/* Badge Count */}
                {unreadCount > 0 && (
                    <span
                        className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white ${
                            criticalCount > 0 ? 'bg-red-600 ring-2 ring-white' : 'bg-primary'
                        }`}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 sm:w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header Bar */}
                    <div className="bg-slate-900 px-4 py-3.5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                            <h4 className="text-sm font-bold tracking-tight">Inter-Departmental Comms</h4>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Chime Sound Mute Toggle */}
                            <button
                                type="button"
                                onClick={toggleMute}
                                className={`p-1.5 rounded-lg text-xs transition-colors ${
                                    isMuted ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-800 text-teal-400 hover:bg-slate-700'
                                }`}
                                title={isMuted ? 'Sound muted (click to unmute)' : 'Sound active (click to mute)'}
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            {/* Trigger Cross-Department Handoff Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    openHandoffModal();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                                title="Send record to another department"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Handoff</span>
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Department Filter Pills */}
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {departments.map((dept) => {
                            const count =
                                dept === 'ALL'
                                    ? notifications.length
                                    : notifications.filter(
                                          (n) => n.targetDepartment === dept || n.sourceDepartment === dept
                                      ).length;
                            return (
                                <button
                                    key={dept}
                                    type="button"
                                    onClick={() => setActiveDepartmentFilter(dept)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                                        activeDepartmentFilter === dept
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span>{dept === 'ALL' ? 'All Stations' : dept.split(' ')[0]}</span>
                                    <span className="opacity-70 text-[10px]">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Bar (Mark all read) */}
                    <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {filtered.length} cross-department transmissions</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-[11px]"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-semibold text-slate-600">No active transmissions in this department</p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Click "Send Handoff" to simulate a cross-station transfer.
                                </p>
                            </div>
                        ) : (
                            filtered.map((item) => {
                                const isCritical = item.priority === 'CRITICAL_STAT';
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-3.5 hover:bg-slate-50 transition-colors text-xs cursor-pointer ${
                                            !item.read ? 'bg-primary/5' : 'bg-white'
                                        }`}
                                        onClick={() => handleOpenItem(item)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            {/* Department Route Badge */}
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                    {item.sourceDepartment.split(' ')[0]}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                                                    {item.targetDepartment.split(' ')[0]}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-shrink-0">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTimeAgo(item.timestamp)}</span>
                                                {!item.read && (
                                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-1.5">
                                            <div className="flex items-center gap-2">
                                                <h5
                                                    className={`font-bold text-xs ${
                                                        isCritical ? 'text-red-700' : 'text-slate-900'
                                                    }`}
                                                >
                                                    {item.title}
                                                </h5>
                                                <span
                                                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                                                        isCritical
                                                            ? 'bg-red-100 text-red-700'
                                                            : item.priority === 'URGENT'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : item.priority === 'DISCHARGE_CLEARANCE'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {item.priority.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>
                                        </div>

                                        {/* Patient Footnote */}
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                                            <div>
                                                <span className="font-semibold text-slate-800">{item.patientName}</span>
                                                <span className="text-slate-400 ml-1">({item.patientMrn})</span>
                                            </div>

                                            <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:underline">
                                                <span>{item.actionLabel || 'View Record'}</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Quick Launcher */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
                            Cross-department events sync in real-time
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                openHandoffModal();
                            }}
                            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            <Send className="w-3 h-3" />
                            <span>Dispatch Clinical Transfer</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
