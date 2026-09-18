import React, { useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    UserCheck,
    Award,
    Building2,
    Edit3,
    Trash2,
    ShieldCheck,
    Phone,
    Mail,
    FileSpreadsheet,
} from 'lucide-react';
import { StaffMember, StaffDepartment } from '../../types/staffPayrollTypes';

interface StaffDirectoryTabProps {
    staffList: StaffMember[];
    onAddStaff: () => void;
    onEditStaff: (staff: StaffMember) => void;
    onDeleteStaff: (staffId: string) => void;
}

export const StaffDirectoryTab: React.FC<StaffDirectoryTabProps> = ({
    staffList,
    onAddStaff,
    onEditStaff,
    onDeleteStaff,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');

    const filtered = staffList.filter((s) => {
        const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
        const matchesSearch =
            s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.kraPin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const formatKes = (amount: number) => {
        return `KES ${amount.toLocaleString()}`;
    };

    const getCouncilBadge = (council: string, license: string, status: string) => {
        if (council === 'None / Administrative') {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Administrative Staff
                </span>
            );
        }
        return (
            <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>{council} Reg</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">{license}</span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-xs block font-medium">Total Active Healthcare Staff</span>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">{staffList.length} Personnel</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% KRA & Statutory Registered</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-xs block font-medium">Licensed Clinicians & Specialists</span>
                    <span className="text-2xl font-bold text-teal-700 mt-1 block">
                        {staffList.filter((s) => s.professionalCouncil !== 'None / Administrative').length} Credentialed
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">KMPDC, NCK, PPB, KMLTTB, RRBK</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-xs block font-medium">Active Hospital Departments</span>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {new Set(staffList.map((s) => s.department)).size} Clinical Wings
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Full 24/7 Coverage</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-xs block font-medium">Monthly Gross Pay Exposure</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
                        {formatKes(
                            staffList.reduce(
                                (acc, s) =>
                                    acc +
                                    s.compensation.basicSalary +
                                    s.compensation.houseAllowance +
                                    s.compensation.commuterAllowance +
                                    s.compensation.medicalAllowance +
                                    s.compensation.callDutyAllowance +
                                    s.compensation.riskAllowance,
                                0
                            )
                        )}
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold mt-0.5 block">Calculated pre-statutory deductions</span>
                </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search personnel by name, staff ID, job title, KRA PIN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none focus:bg-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                        <option value="ALL">All Departments ({staffList.length})</option>
                        {Array.from(new Set(staffList.map((s) => s.department))).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <button
                        onClick={onAddStaff}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Enroll Staff Member</span>
                    </button>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="py-3 px-4">Staff Member & ID</th>
                                <th className="py-3 px-4">Department & Designation</th>
                                <th className="py-3 px-4">Council License & Status</th>
                                <th className="py-3 px-4">Kenyan Statutory IDs</th>
                                <th className="py-3 px-4 text-right">Basic Pay</th>
                                <th className="py-3 px-4">Payment Channel</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        No staff members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {staff.firstName[0]}{staff.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">
                                                        {staff.firstName} {staff.lastName}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-slate-500">
                                                        {staff.employeeNumber} • {staff.employmentType}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                        <span>{staff.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{staff.jobTitle}</div>
                                            <div className="text-[11px] text-teal-700 font-medium">{staff.department}</div>
                                        </td>

                                        <td className="py-3 px-4">
                                            {getCouncilBadge(staff.professionalCouncil, staff.licenseNumber, staff.retentionStatus)}
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-mono text-[11px] text-slate-700">
                                                PIN: <strong className="text-slate-900">{staff.kraPin}</strong>
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-500">
                                                NSSF: {staff.nssfNumber} • SHIF: {staff.healthInsuranceNumber}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <div className="font-mono font-bold text-slate-900">
                                                {formatKes(staff.compensation.basicSalary)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                + Allowances: {formatKes(
                                                    staff.compensation.houseAllowance +
                                                    staff.compensation.commuterAllowance +
                                                    staff.compensation.medicalAllowance +
                                                    staff.compensation.callDutyAllowance +
                                                    staff.compensation.riskAllowance
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span className="font-medium text-slate-800 block text-[11px]">
                                                {staff.paymentMethod === 'Bank Transfer' ? staff.bankName : 'Digital Wallet'}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 block">
                                                {staff.paymentMethod === 'Bank Transfer' ? `A/C: ${staff.bankAccountNumber}` : `Tel: ${staff.mpesaNumber}`}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onEditStaff(staff)}
                                                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Edit Staff Member"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to deactivate ${staff.firstName} ${staff.lastName}?`)) {
                                                            onDeleteStaff(staff.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Staff Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
