import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Plus,
    FileText,
    UserCheck,
    AlertCircle,
} from 'lucide-react';
import { LeaveRequest, StaffMember } from '../../types/staffPayrollTypes';

interface StaffLeaveTabProps {
    leaveRequests: LeaveRequest[];
    staffList: StaffMember[];
    onSaveLeave: (req: LeaveRequest) => void;
    onUpdateStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

export const StaffLeaveTab: React.FC<StaffLeaveTabProps> = ({
    leaveRequests,
    staffList,
    onSaveLeave,
    onUpdateStatus,
}) => {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
    const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Annual Leave');
    const [startDate, setStartDate] = useState('2026-09-25');
    const [endDate, setEndDate] = useState('2026-10-02');
    const [totalDays, setTotalDays] = useState(7);
    const [reason, setReason] = useState('');
    const [relieverStaffName, setRelieverStaffName] = useState('');

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        const staff = staffList.find((s) => s.id === selectedStaffId);
        if (!staff) return;

        const newReq: LeaveRequest = {
            id: `lv-${Date.now().toString().slice(-4)}`,
            staffId: staff.id,
            staffName: `${staff.firstName} ${staff.lastName}`,
            department: staff.department,
            jobTitle: staff.jobTitle,
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason,
            relieverStaffName: relieverStaffName || 'Assigned by HOD',
            status: 'Pending HOD Approval',
            appliedAt: new Date().toISOString(),
        };

        onSaveLeave(newReq);
        setIsApplyModalOpen(false);
        setReason('');
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3 text-xs">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                        Staff Leave Management & Medical CME Tracking
                    </h3>
                    <p className="text-slate-500 text-xs">
                        Tracks annual leaves, sick leaves, and KMPDC/NCK continuing medical education credits.
                    </p>
                </div>

                <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Apply for Leave</span>
                </button>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4">Leave Category</th>
                                <th className="py-3 px-4">Duration & Dates</th>
                                <th className="py-3 px-4">Designated Reliever</th>
                                <th className="py-3 px-4">Approval Status</th>
                                <th className="py-3 px-4 text-right">HOD Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        No active leave applications on file.
                                    </td>
                                </tr>
                            ) : (
                                leaveRequests.map((l) => (
                                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900">{l.staffName}</div>
                                            <div className="text-[11px] text-slate-500">{l.jobTitle}</div>
                                        </td>

                                        <td className="py-3 px-4 text-teal-700 font-medium">
                                            {l.department}
                                        </td>

                                        <td className="py-3 px-4">
                                            <span className="font-semibold text-slate-800">{l.leaveType}</span>
                                            {l.reason && (
                                                <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                                    {l.reason}
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{l.totalDays} Days</div>
                                            <div className="text-[10px] font-mono text-slate-500">
                                                {l.startDate} to {l.endDate}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-slate-700 font-medium">
                                            {l.relieverStaffName}
                                        </td>

                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    l.status === 'Approved'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : l.status === 'Rejected'
                                                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}
                                            >
                                                {l.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {l.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                                                {l.status === 'Pending HOD Approval' && <Clock className="w-3 h-3 text-amber-600" />}
                                                <span>{l.status}</span>
                                            </span>
                                            {l.approvedBy && (
                                                <div className="text-[9px] text-slate-400 mt-0.5">
                                                    By {l.approvedBy}
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            {l.status === 'Pending HOD Approval' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => onUpdateStatus(l.id, 'Approved')}
                                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateStatus(l.id, 'Rejected')}
                                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-200"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="font-bold text-slate-900 text-sm">Submit Staff Leave Request</h3>
                            <button
                                onClick={() => setIsApplyModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleApply} className="space-y-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Applicant *</label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                                >
                                    {staffList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} ({s.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                                >
                                    <option value="Annual Leave">Annual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Paternity Leave">Paternity Leave</option>
                                    <option value="CME / Study Leave">CME / Study Leave</option>
                                    <option value="Compassionate Leave">Compassionate Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Working Days Count</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={totalDays}
                                        onChange={(e) => setTotalDays(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Reliever Staff Member</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Kevin Ochieng"
                                        value={relieverStaffName}
                                        onChange={(e) => setRelieverStaffName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                                <textarea
                                    rows={2}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Brief note for HOD & Medical Director approval..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="px-3 py-2 text-slate-600 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
