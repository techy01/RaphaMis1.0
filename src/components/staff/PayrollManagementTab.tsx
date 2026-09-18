import React, { useState } from 'react';
import {
    Calendar,
    DollarSign,
    FileSpreadsheet,
    Download,
    Send,
    RefreshCw,
    Sliders,
    Eye,
    CheckCircle2,
    Building2,
    Scale,
    CreditCard,
    AlertCircle,
    CheckCheck,
    Smartphone,
    Landmark,
    FileText,
} from 'lucide-react';
import {
    StaffPayrollEntry,
    PayrollRunSummary,
    StandardPayrollParameters,
} from '../../types/staffPayrollTypes';

interface PayrollManagementTabProps {
    period: string;
    onPeriodChange: (period: string) => void;
    summary: PayrollRunSummary;
    entries: StaffPayrollEntry[];
    params: StandardPayrollParameters;
    onRecalculate: () => void;
    onOpenTaxConfig: () => void;
    onOpenPayslip: (entry: StaffPayrollEntry) => void;
    onDisburse: () => void;
}

export const PayrollManagementTab: React.FC<PayrollManagementTabProps> = ({
    period,
    onPeriodChange,
    summary,
    entries,
    params,
    onRecalculate,
    onOpenTaxConfig,
    onOpenPayslip,
    onDisburse,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [disburseSuccess, setDisburseSuccess] = useState(false);

    const formatKes = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const filteredEntries = entries.filter((e) => {
        const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
        const matchesSearch =
            e.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.kraPin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const handleDisburseClick = () => {
        if (summary.status === 'Disbursed') {
            alert('This monthly payroll has already been disbursed to bank accounts and Digital Wallet channels.');
            return;
        }
        if (window.confirm(`Authorize electronic disbursement of ${formatKes(summary.totalNetSalaryPayout)} to ${entries.length} staff accounts via Standard Bank EFT and Digital Wallet Bulk?`)) {
            onDisburse();
            setDisburseSuccess(true);
            setTimeout(() => setDisburseSuccess(false), 4000);
        }
    };

    const handleExportKraP10 = () => {
        // Generate CSV of KRA P10 statutory return
        const headers = [
            'Employee PIN',
            'Employee Name',
            'Basic Salary',
            'Housing Allowance',
            'Other Allowances',
            'Gross Pay',
            'NSSF (Employee)',
            'SHIF (Employee)',
            'Affordable Housing Levy',
            'Taxable Pay',
            'Gross PAYE',
            'Personal Relief',
            'Insurance Relief',
            'Housing Relief',
            'Net PAYE Tax',
        ];

        const rows = entries.map((e) => [
            e.kraPin,
            `"${e.staffName}"`,
            e.basicSalary,
            e.houseAllowance,
            e.commuterAllowance + e.medicalAllowance + e.callDutyAllowance + e.riskAllowance + e.overtimePay,
            e.grossSalary,
            e.totalNssfEmployee,
            e.healthInsuranceEmployee,
            e.housingLevyEmployee,
            e.taxableNetPay,
            e.grossTaxPaye,
            e.personalRelief,
            e.insuranceRelief,
            e.housingRelief,
            e.netTaxPaye,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `KRA_P10_Schedule_${period.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportBankDisbursement = () => {
        const headers = [
            'Employee Number',
            'Beneficiary Name',
            'Payment Method',
            'Bank Name',
            'Account / Wallet Number',
            'Net Amount KES',
            'Payment Reference',
        ];

        const rows = entries.map((e) => [
            e.employeeNumber,
            `"${e.staffName}"`,
            e.paymentMethod,
            e.paymentMethod === 'Bank Transfer' ? e.bankName : 'Digital Wallet B2C',
            e.paymentMethod === 'Bank Transfer' ? `'${e.bankAccountNumber}'` : `'${e.mpesaNumber}'`,
            e.netSalary,
            `SALARY-${period.toUpperCase()}-${e.employeeNumber}`,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Hospital_Bank_Disbursement_Batch_${period.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Top Period Selector & Action Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            STATUTORY FINANCE COMPLIANT
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">
                            Hospital Payroll & Statutory Remittances
                        </h3>
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                summary.status === 'Disbursed'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-900 border border-amber-300 animate-pulse'
                            }`}
                        >
                            {summary.status === 'Disbursed' ? '✓ Disbursed to Accounts' : 'Pending Authorization'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Automated graduated KRA PAYE computation, NSSF Tier I & II, SHIF (2.75%), Affordable Housing Levy (1.5%), and healthcare SACCO check-offs.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Period Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <select
                            value={period}
                            onChange={(e) => onPeriodChange(e.target.value)}
                            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="September 2026">September 2026 (Active)</option>
                            <option value="August 2026">August 2026</option>
                            <option value="July 2026">July 2026</option>
                        </select>
                    </div>

                    {/* Configure Tax Parameters Trigger */}
                    <button
                        type="button"
                        onClick={onOpenTaxConfig}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                        title="Modify KRA PAYE bands, SHIF, NSSF and Relief rates"
                    >
                        <Sliders className="w-3.5 h-3.5 text-teal-600" />
                        <span>Tax Parameters</span>
                    </button>

                    {/* Recalculate Payroll */}
                    <button
                        type="button"
                        onClick={onRecalculate}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Recalculate</span>
                    </button>

                    {/* Export KRA P10 Return */}
                    <button
                        type="button"
                        onClick={handleExportKraP10}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                        title="Download official KRA iTax P10 CSV schedule"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>KRA P10 CSV</span>
                    </button>

                    {/* Export Bank File */}
                    <button
                        type="button"
                        onClick={handleExportBankDisbursement}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                        title="Export Bank EFT / Digital Wallet B2C batch format"
                    >
                        <Landmark className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bank File</span>
                    </button>

                    {/* Disburse Payroll */}
                    <button
                        type="button"
                        onClick={handleDisburseClick}
                        className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                            summary.status === 'Disbursed'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>{summary.status === 'Disbursed' ? 'Payroll Disbursed' : 'Authorize & Disburse'}</span>
                    </button>
                </div>
            </div>

            {/* Success Banner */}
            {disburseSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-semibold animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                        <div className="font-bold">Salaries Successfully Disbursed for {period}!</div>
                        <div className="text-emerald-700 font-normal">
                            Electronic bank transfers dispatched to Standard Bank, National Bank, and Digital Wallet bulk channels.
                        </div>
                    </div>
                </div>
            )}

            {/* Statutory Remittance & Financial KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Gross Payroll</span>
                    <span className="text-sm font-black text-slate-900 mt-1 block font-mono">
                        {formatKes(summary.totalGrossPayroll)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{summary.totalEmployeesCount} Staff</span>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 shadow-2xs">
                    <span className="text-teal-800 text-[10px] uppercase font-bold block">Net Salary Payout</span>
                    <span className="text-sm font-black text-teal-950 mt-1 block font-mono">
                        {formatKes(summary.totalNetSalaryPayout)}
                    </span>
                    <span className="text-[10px] text-teal-700 block">Take-home total</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">KRA PAYE Remittance</span>
                    <span className="text-sm font-black text-rose-700 mt-1 block font-mono">
                        {formatKes(summary.totalKraPayePayable)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Net tax to KRA iTax</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">NSSF (Total)</span>
                    <span className="text-sm font-black text-slate-900 mt-1 block font-mono">
                        {formatKes(summary.totalNssfRemittance)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">EE: {formatKes(summary.totalNssfEmployee)} • ER: {formatKes(summary.totalNssfEmployer)}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">SHIF (2.75%)</span>
                    <span className="text-sm font-black text-slate-900 mt-1 block font-mono">
                        {formatKes(summary.totalShifRemittance)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Social Health Fund</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Housing Levy (AHL)</span>
                    <span className="text-sm font-black text-slate-900 mt-1 block font-mono">
                        {formatKes(summary.totalHousingLevyRemittance)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">EE: 1.5% • ER: 1.5%</span>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-2xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Hospital CTC</span>
                    <span className="text-sm font-black text-white mt-1 block font-mono">
                        {formatKes(summary.totalHospitalCost)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Gross + ER Match</span>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <input
                    type="text"
                    placeholder="Search payroll sheet by staff name, KRA PIN, staff number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                />

                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none"
                >
                    <option value="ALL">All Clinical & Support Wings</option>
                    {Array.from(new Set(entries.map((e) => e.department))).map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Complete Itemized Kenyan Payroll Ledger */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-3">Employee & KRA PIN</th>
                                <th className="py-3 px-3 text-right">Basic (KES)</th>
                                <th className="py-3 px-3 text-right">Allowances</th>
                                <th className="py-3 px-3 text-right">Gross Pay</th>
                                <th className="py-3 px-3 text-right">NSSF (EE)</th>
                                <th className="py-3 px-3 text-right">SHIF (2.75%)</th>
                                <th className="py-3 px-3 text-right">AHL (1.5%)</th>
                                <th className="py-3 px-3 text-right">Taxable Pay</th>
                                <th className="py-3 px-3 text-right">Reliefs</th>
                                <th className="py-3 px-3 text-right">KRA PAYE</th>
                                <th className="py-3 px-3 text-right">SACCO/Loans</th>
                                <th className="py-3 px-3 text-right bg-teal-50/50 text-teal-900">Net Salary</th>
                                <th className="py-3 px-3 text-center">Payslip</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="py-8 text-center text-slate-400 font-sans">
                                        No staff records found for this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredEntries.map((e) => {
                                    const allowances =
                                        e.houseAllowance +
                                        e.commuterAllowance +
                                        e.medicalAllowance +
                                        e.callDutyAllowance +
                                        e.riskAllowance +
                                        e.overtimePay;

                                    return (
                                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 px-3 font-sans">
                                                <div className="font-bold text-slate-900">{e.staffName}</div>
                                                <div className="text-[10px] font-mono text-slate-500">
                                                    {e.employeeNumber} • PIN: <strong className="text-slate-700">{e.kraPin}</strong>
                                                </div>
                                                <div className="text-[10px] text-teal-700">{e.jobTitle}</div>
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-700">
                                                {e.basicSalary.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-600" title={`House: ${e.houseAllowance}, Commuter: ${e.commuterAllowance}, Call: ${e.callDutyAllowance}`}>
                                                {allowances.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                {e.grossSalary.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-600">
                                                {e.totalNssfEmployee.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-600">
                                                {e.healthInsuranceEmployee.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-600">
                                                {e.housingLevyEmployee.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-700">
                                                {e.taxableNetPay.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-emerald-700">
                                                -{e.totalReliefs.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                                                {e.netTaxPaye.toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right text-slate-500">
                                                {(e.saccoDeduction + e.staffLoanDeduction + e.voluntaryPensionEmployee).toLocaleString()}
                                            </td>

                                            <td className="py-2.5 px-3 text-right font-bold text-teal-950 bg-teal-50/50 text-xs">
                                                {formatKes(e.netSalary)}
                                            </td>

                                            <td className="py-2.5 px-3 text-center font-sans">
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenPayslip(e)}
                                                    className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                                                    title="View, download or print official Kenyan payslip"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    <span>Payslip</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
