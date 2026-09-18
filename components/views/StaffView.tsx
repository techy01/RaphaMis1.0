import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    DollarSign,
    Calendar,
    FileCheck,
    Sliders,
    Building2,
    ShieldCheck,
    Clock,
    Plus,
} from 'lucide-react';
import {
    StaffMember,
    StaffPayrollEntry,
    PayrollRunSummary,
    StandardPayrollParameters,
    ShiftRosterEntry,
    LeaveRequest,
} from '../../src/types/staffPayrollTypes';
import {
    getStaffMembers,
    saveStaffMember,
    deleteStaffMember,
    getPayrollParameters,
    savePayrollParameters,
    resetPayrollParametersToOfficialDefaults,
    calculatePayrollForPeriod,
    disbursePayroll,
    getRosters,
    saveRosterEntry,
    getLeaveRequests,
    saveLeaveRequest,
    updateLeaveStatus,
} from '../../src/api/staffPayrollApi';
import { StaffDirectoryTab } from '../../src/components/staff/StaffDirectoryTab';
import { PayrollManagementTab } from '../../src/components/staff/PayrollManagementTab';
import { StaffRosterTab } from '../../src/components/staff/StaffRosterTab';
import { StaffLeaveTab } from '../../src/components/staff/StaffLeaveTab';
import { PayslipModal } from '../../src/components/staff/PayslipModal';
import { TaxParametersModal } from '../../src/components/staff/TaxParametersModal';
import { StaffEditModal } from '../../src/components/staff/StaffEditModal';

export const StaffView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'roster' | 'leave'>('payroll');
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [params, setParams] = useState<StandardPayrollParameters>(getPayrollParameters());
    const [period, setPeriod] = useState('September 2026');

    // Payroll Calculation State
    const [payrollSummary, setPayrollSummary] = useState<PayrollRunSummary | null>(null);
    const [payrollEntries, setPayrollEntries] = useState<StaffPayrollEntry[]>([]);

    // Shift Rosters & Leaves
    const [rosters, setRosters] = useState<ShiftRosterEntry[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    // Modals
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [selectedPayslipEntry, setSelectedPayslipEntry] = useState<StaffPayrollEntry | null>(null);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [isStaffEditModalOpen, setIsStaffEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    // Initial Load & Computation
    const refreshData = useCallback(() => {
        const staff = getStaffMembers();
        setStaffList(staff);
        setRosters(getRosters());
        setLeaveRequests(getLeaveRequests());
        setParams(getPayrollParameters());

        const { summary, entries } = calculatePayrollForPeriod(period);
        setPayrollSummary(summary);
        setPayrollEntries(entries);
    }, [period]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Handle Staff Actions
    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsStaffEditModalOpen(true);
    };

    const handleEditStaff = (staff: StaffMember) => {
        setEditingStaff(staff);
        setIsStaffEditModalOpen(true);
    };

    const handleSaveStaff = (savedStaff: StaffMember) => {
        saveStaffMember(savedStaff);
        refreshData();
    };

    const handleDeleteStaff = (staffId: string) => {
        deleteStaffMember(staffId);
        refreshData();
    };

    // Handle Tax Parameters Update
    const handleSaveTaxParams = (updatedParams: StandardPayrollParameters) => {
        savePayrollParameters(updatedParams);
        setParams(updatedParams);
        refreshData();
    };

    const handleResetTaxParams = () => {
        const defaults = resetPayrollParametersToOfficialDefaults();
        setParams(defaults);
        refreshData();
    };

    // Handle Payroll Actions
    const handleRecalculatePayroll = () => {
        const { summary, entries } = calculatePayrollForPeriod(period);
        setPayrollSummary(summary);
        setPayrollEntries(entries);
    };

    const handleDisburse = () => {
        const updatedSummary = disbursePayroll(period);
        setPayrollSummary(updatedSummary);
        const { entries } = calculatePayrollForPeriod(period);
        setPayrollEntries(entries);
    };

    const handleOpenPayslip = (entry: StaffPayrollEntry) => {
        setSelectedPayslipEntry(entry);
        setIsPayslipModalOpen(true);
    };

    // Handle Roster & Leave
    const handleSaveRoster = (entry: ShiftRosterEntry) => {
        saveRosterEntry(entry);
        setRosters(getRosters());
    };

    const handleSaveLeave = (req: LeaveRequest) => {
        saveLeaveRequest(req);
        setLeaveRequests(getLeaveRequests());
    };

    const handleUpdateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
        updateLeaveStatus(id, status);
        setLeaveRequests(getLeaveRequests());
    };

    return (
        <div className="space-y-6">
            {/* Header Console */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                Healthcare Human Resources & Kenyan Statutory Payroll
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                St. Jude Medical HR Console
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            End-to-end clinical personnel management, medical council credentialing (National Medical Boards), and modifiable payroll compliant to the Standard Labor and Tax Regulations.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsTaxModalOpen(true)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
                        >
                            <Sliders className="w-4 h-4 text-teal-600" />
                            <span>KRA Tax Parameters</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleAddStaff}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Enroll Staff Member</span>
                        </button>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs font-semibold overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'payroll'
                                ? 'border-teal-600 text-teal-700 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        <span>Kenyan Statutory Payroll & Remittances</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono">
                            {payrollEntries.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'directory'
                                ? 'border-teal-600 text-teal-700 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>Staff Directory & Credentialing</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                            {staffList.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('roster')}
                        className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'roster'
                                ? 'border-teal-600 text-teal-700 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Clinical Shift Rostering & On-Call</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                            {rosters.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('leave')}
                        className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'leave'
                                ? 'border-teal-600 text-teal-700 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileCheck className="w-4 h-4 text-slate-500" />
                        <span>Leave Approvals & CME Credits</span>
                        {leaveRequests.filter((l) => l.status === 'Pending HOD Approval').length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold font-mono">
                                {leaveRequests.filter((l) => l.status === 'Pending HOD Approval').length} Pending
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* TAB CONTENT PANELS */}
            {activeTab === 'payroll' && payrollSummary && (
                <PayrollManagementTab
                    period={period}
                    onPeriodChange={(p) => setPeriod(p)}
                    summary={payrollSummary}
                    entries={payrollEntries}
                    params={params}
                    onRecalculate={handleRecalculatePayroll}
                    onOpenTaxConfig={() => setIsTaxModalOpen(true)}
                    onOpenPayslip={handleOpenPayslip}
                    onDisburse={handleDisburse}
                />
            )}

            {activeTab === 'directory' && (
                <StaffDirectoryTab
                    staffList={staffList}
                    onAddStaff={handleAddStaff}
                    onEditStaff={handleEditStaff}
                    onDeleteStaff={handleDeleteStaff}
                />
            )}

            {activeTab === 'roster' && (
                <StaffRosterTab
                    rosters={rosters}
                    staffList={staffList}
                    onSaveRoster={handleSaveRoster}
                />
            )}

            {activeTab === 'leave' && (
                <StaffLeaveTab
                    leaveRequests={leaveRequests}
                    staffList={staffList}
                    onSaveLeave={handleSaveLeave}
                    onUpdateStatus={handleUpdateLeaveStatus}
                />
            )}

            {/* MODALS */}
            <PayslipModal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                entry={selectedPayslipEntry}
            />

            <TaxParametersModal
                isOpen={isTaxModalOpen}
                onClose={() => setIsTaxModalOpen(false)}
                currentParams={params}
                onSave={handleSaveTaxParams}
                onResetToOfficialDefaults={handleResetTaxParams}
            />

            <StaffEditModal
                isOpen={isStaffEditModalOpen}
                onClose={() => setIsStaffEditModalOpen(false)}
                staff={editingStaff}
                onSave={handleSaveStaff}
            />
        </div>
    );
};
