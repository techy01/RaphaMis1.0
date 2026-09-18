import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    UserCheck,
    Building2,
    Plus,
    CheckCircle2,
    AlertCircle,
    ArrowRightLeft,
    Shield,
} from 'lucide-react';
import { ShiftRosterEntry, StaffMember, StaffDepartment } from '../../types/staffPayrollTypes';

interface StaffRosterTabProps {
    rosters: ShiftRosterEntry[];
    staffList: StaffMember[];
    onSaveRoster: (entry: ShiftRosterEntry) => void;
}

export const StaffRosterTab: React.FC<StaffRosterTabProps> = ({
    rosters,
    staffList,
    onSaveRoster,
}) => {
    const [selectedDate, setSelectedDate] = useState('2026-09-12');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New shift form state
    const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
    const [shiftType, setShiftType] = useState<ShiftRosterEntry['shiftType']>('Morning (07:00-15:00)');
    const [assignedStation, setAssignedStation] = useState('Emergency Triage & Resus');

    const filtered = rosters.filter((r) => {
        const matchesDate = r.date === selectedDate;
        const matchesDept = deptFilter === 'ALL' || r.department === deptFilter;
        return matchesDate && matchesDept;
    });

    const handleCreateShift = (e: React.FormEvent) => {
        e.preventDefault();
        const staff = staffList.find((s) => s.id === selectedStaffId);
        if (!staff) return;

        const newEntry: ShiftRosterEntry = {
            id: `rst-${Date.now().toString().slice(-4)}`,
            staffId: staff.id,
            staffName: `${staff.firstName} ${staff.lastName}`,
            staffRole: staff.jobTitle,
            department: staff.department,
            date: selectedDate,
            shiftType,
            assignedStation,
            status: 'Scheduled',
        };

        onSaveRoster(newEntry);
        setIsAddModalOpen(false);
    };

    const handleToggleStatus = (entry: ShiftRosterEntry) => {
        const nextStatus: ShiftRosterEntry['status'] =
            entry.status === 'Scheduled'
                ? 'On Duty'
                : entry.status === 'On Duty'
                ? 'Completed'
                : 'Scheduled';

        onSaveRoster({ ...entry, status: nextStatus });
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500 text-[11px]">Roster Date:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent font-bold text-slate-800 focus:outline-none"
                        />
                    </div>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none"
                    >
                        <option value="ALL">All Clinical Wings</option>
                        {Array.from(new Set(staffList.map((s) => s.department))).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Duty Shift</span>
                </button>
            </div>

            {/* Shift Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                        No staff scheduled for {selectedDate}. Click "Schedule Duty Shift" to assign clinicians.
                    </div>
                ) : (
                    filtered.map((r) => (
                        <div
                            key={r.id}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-300 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-bold text-slate-900 text-sm block">
                                        {r.staffName}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                        {r.staffRole}
                                    </span>
                                    <span className="text-[10px] font-semibold text-teal-700 block mt-0.5">
                                        {r.department}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleToggleStatus(r)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                        r.status === 'On Duty'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : r.status === 'Completed'
                                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                                            : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                    title="Click to cycle status: Scheduled -> On Duty -> Completed"
                                >
                                    ● {r.status}
                                </button>
                            </div>

                            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-semibold">{r.shiftType}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>Station: <strong className="text-slate-800">{r.assignedStation}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal to assign shift */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="font-bold text-slate-900 text-sm">Assign Staff Duty Shift</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateShift} className="space-y-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Staff Member *</label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                                >
                                    {staffList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} ({s.jobTitle} - {s.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Shift Type *</label>
                                <select
                                    value={shiftType}
                                    onChange={(e) => setShiftType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                                >
                                    <option value="Morning (07:00-15:00)">Morning (07:00 - 15:00)</option>
                                    <option value="Evening (14:00-22:00)">Evening (14:00 - 22:00)</option>
                                    <option value="Night (20:00-08:00)">Night (20:00 - 08:00)</option>
                                    <option value="On-Call 24hr">On-Call 24hr</option>
                                    <option value="Off Duty">Off Duty</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Assigned Station / Ward / Bench *</label>
                                <input
                                    type="text"
                                    required
                                    value={assignedStation}
                                    onChange={(e) => setAssignedStation(e.target.value)}
                                    placeholder="e.g. ICU Bed 1-4, Central Pharmacy, Theatre 2"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-3 py-2 text-slate-600 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                                >
                                    Assign Shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
