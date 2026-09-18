import React from 'react';
import {
    X,
    Printer,
    Download,
    CheckCircle2,
    ShieldCheck,
    Building2,
    Landmark,
    FileText,
} from 'lucide-react';
import { StaffPayrollEntry } from '../../types/staffPayrollTypes';

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: StaffPayrollEntry | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, entry }) => {
    if (!isOpen || !entry) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatKes = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Modal Actions Bar (hidden in print) */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <h3 className="font-bold text-slate-800 text-sm">
                            Official Kenyan Payslip • {entry.period}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {entry.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Payslip</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Payslip Body */}
                <div className="p-8 space-y-6 text-slate-900 font-sans printable-report">
                    {/* Hospital Official Header */}
                    <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-lg">
                                    +
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                                        St. Jude General Hospital & Academic Medical Center
                                    </h1>
                                    <p className="text-xs text-slate-600 font-medium">
                                        P.O. Box 48102-00100, Argwings Kodhek Rd, New York, USA
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-500 font-mono space-x-3">
                                <span>KRA PIN: <strong className="text-slate-800">P051284910Z</strong></span>
                                <span>•</span>
                                <span>KMPDC Facility Reg: <strong className="text-slate-800">FAC-NRB-0481</strong></span>
                                <span>•</span>
                                <span>Tel: <strong className="text-slate-800">+1 (555) 790-2000</strong></span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="inline-block border border-slate-900 px-3 py-1 text-center rounded">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pay Advice</div>
                                <div className="text-sm font-black text-slate-900">{entry.period}</div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                                Ref: {entry.id}
                            </div>
                        </div>
                    </div>

                    {/* Employee & Statutory Identifiers */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Staff Name</span>
                            <span className="font-bold text-slate-900">{entry.staffName}</span>
                            <span className="text-[11px] text-slate-500 block font-mono">{entry.employeeNumber}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Designation / Dept</span>
                            <span className="font-bold text-slate-900">{entry.jobTitle}</span>
                            <span className="text-[11px] text-slate-500 block">{entry.department}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tax & Social Security</span>
                            <span className="font-mono text-slate-800 text-[11px] block">KRA PIN: <strong>{entry.kraPin}</strong></span>
                            <span className="font-mono text-slate-800 text-[11px] block">NSSF: <strong>{entry.nssfNumber}</strong></span>
                            <span className="font-mono text-slate-800 text-[11px] block">SHIF: <strong>{entry.healthInsuranceNumber}</strong></span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Disbursement Channel</span>
                            <span className="font-bold text-slate-900 text-[11px] block">{entry.bankName}</span>
                            <span className="font-mono text-slate-600 text-[11px] block">A/C: {entry.bankAccountNumber}</span>
                            <span className="text-[10px] text-teal-700 font-semibold block">{entry.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Dual Column: Earnings vs Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* EARNINGS */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                    Earnings (Allowances & Basic)
                                </h4>
                                <span className="text-[10px] text-slate-500">Amount (KES)</span>
                            </div>
                            <div className="p-4 space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">Basic Salary</span>
                                    <span className="font-mono font-semibold">{formatKes(entry.basicSalary)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">House Allowance</span>
                                    <span className="font-mono font-semibold">{formatKes(entry.houseAllowance)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">Commuter Allowance</span>
                                    <span className="font-mono font-semibold">{formatKes(entry.commuterAllowance)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">Medical Allowance</span>
                                    <span className="font-mono font-semibold">{formatKes(entry.medicalAllowance)}</span>
                                </div>
                                {entry.callDutyAllowance > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Doctor Call Duty Allowance</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.callDutyAllowance)}</span>
                                    </div>
                                )}
                                {entry.riskAllowance > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Clinical Risk Allowance</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.riskAllowance)}</span>
                                    </div>
                                )}
                                {entry.overtimePay > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Overtime Differential</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.overtimePay)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                                    <span>Total Gross Salary</span>
                                    <span className="font-mono text-teal-800">{formatKes(entry.grossSalary)}</span>
                                </div>
                            </div>
                        </div>

                        {/* DEDUCTIONS */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                    Statutory & Discretionary Deductions
                                </h4>
                                <span className="text-[10px] text-slate-500">Amount (KES)</span>
                            </div>
                            <div className="p-4 space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">
                                        NSSF Tier I (LEL 6%)
                                    </span>
                                    <span className="font-mono font-semibold">{formatKes(entry.nssfTier1Employee)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">
                                        NSSF Tier II (UEL 6%)
                                    </span>
                                    <span className="font-mono font-semibold">{formatKes(entry.nssfTier2Employee)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">
                                        SHIF (Social Health Insurance 2.75%)
                                    </span>
                                    <span className="font-mono font-semibold">{formatKes(entry.healthInsuranceEmployee)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">
                                        Affordable Housing Levy (AHL 1.5%)
                                    </span>
                                    <span className="font-mono font-semibold">{formatKes(entry.housingLevyEmployee)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">
                                        KRA PAYE Net Tax Payable
                                    </span>
                                    <span className="font-mono font-semibold text-rose-700">{formatKes(entry.netTaxPaye)}</span>
                                </div>
                                {entry.saccoDeduction > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Healthcare SACCO Check-off</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.saccoDeduction)}</span>
                                    </div>
                                )}
                                {entry.staffLoanDeduction > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Staff Loan Repayment</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.staffLoanDeduction)}</span>
                                    </div>
                                )}
                                {entry.voluntaryPensionEmployee > 0 && (
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Voluntary Staff Pension Scheme</span>
                                        <span className="font-mono font-semibold">{formatKes(entry.voluntaryPensionEmployee)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                                    <span>Total Deductions</span>
                                    <span className="font-mono text-rose-700">{formatKes(entry.totalDeductions)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KRA Tax Computation Card & Statutory Reliefs */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                                KRA PAYE Statutory Tax Computation (Finance Act Compliant)
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                                Taxable Pay: <strong>{formatKes(entry.taxableNetPay)}</strong> (after KES {entry.allowablePensionNssfExemption.toLocaleString()} allowable pension/NSSF)
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                            <div>
                                <span className="text-slate-500 block">Gross PAYE Tax:</span>
                                <span className="font-mono font-bold text-slate-800">{formatKes(entry.grossTaxPaye)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Personal Relief:</span>
                                <span className="font-mono font-semibold text-emerald-700">- {formatKes(entry.personalRelief)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Insurance Relief (SHIF):</span>
                                <span className="font-mono font-semibold text-emerald-700">- {formatKes(entry.insuranceRelief)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Housing Relief (15% AHL):</span>
                                <span className="font-mono font-semibold text-emerald-700">- {formatKes(entry.housingRelief)}</span>
                            </div>
                        </div>
                    </div>

                    {/* NET PAY SUMMARY DISPLAY */}
                    <div className="p-5 bg-teal-50 border-2 border-teal-600 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-teal-900">
                                Net Take-Home Salary (Disbursed)
                            </div>
                            <div className="text-xs text-teal-700 mt-0.5">
                                Deposited to {entry.bankName} • Ref: {entry.transactionReference || 'AUTOMATED-STJ-PAYROLL'}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-black text-teal-950 font-mono tracking-tight">
                                {formatKes(entry.netSalary)}
                            </div>
                            <div className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider mt-0.5">
                                Dollars Only
                            </div>
                        </div>
                    </div>

                    {/* Hospital Employer Statutory Contributions Notice */}
                    <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700">Hospital (Employer) Contributions on Your Behalf:</span>
                        <div className="space-x-4 font-mono">
                            <span>Employer NSSF Match: <strong>{formatKes(entry.totalNssfEmployer)}</strong></span>
                            <span>Employer Housing Levy Match: <strong>{formatKes(entry.housingLevyEmployer)}</strong></span>
                            <span>Total Hospital Cost: <strong>{formatKes(entry.totalEmployerCost)}</strong></span>
                        </div>
                    </div>

                    {/* Official Signatures & Verification Stamp */}
                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
                        <div>
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-6">
                                Prepared & Certified By (Finance & Payroll)
                            </div>
                            <div className="font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                                Faith Muthoni, CPA(K)
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Chief Hospital Accountant</div>
                        </div>

                        <div className="text-right">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-6">
                                Approved by Chief Executive / Medical Superintendent
                            </div>
                            <div className="font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                                Dr. Michael Chen, MD, MMed, FCSEEC
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Hospital Medical Superintendent</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
