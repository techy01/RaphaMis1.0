import React, { useState } from 'react';
import { DischargeGatepass, HospitalPatientBill } from '../../packages/shared/types';
import {
    getStoredGatepasses,
    createDischargeGatepass,
    verifyAndReleaseGatepass,
} from '../../api/notificationsApi';
import {
    ShieldCheck,
    QrCode,
    Printer,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Car,
    User,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Building2,
    FileCheck,
} from 'lucide-react';
import { DischargeGatepassModal } from './DischargeGatepassModal';
import { useDepartmentNotifications } from '../../contexts/DepartmentNotificationContext';

interface DischargeGatepassTabProps {
    patientBills: HospitalPatientBill[];
}

export const DischargeGatepassTab: React.FC<DischargeGatepassTabProps> = ({ patientBills }) => {
    const [gatepasses, setGatepasses] = useState<DischargeGatepass[]>(() => getStoredGatepasses());
    const [selectedGatepass, setSelectedGatepass] = useState<DischargeGatepass | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_EXIT' | 'CLEARED_EXIT'>('ALL');
    const { dispatchHandoff } = useDepartmentNotifications();

    const handleOpenModal = (pass: DischargeGatepass) => {
        setSelectedGatepass(pass);
        setIsModalOpen(true);
    };

    const handleCreateGatepassFromBill = (bill: HospitalPatientBill) => {
        const newPass = createDischargeGatepass({
            patientId: bill.patientId,
            patientName: bill.patientName,
            patientMrn: bill.patientMrn,
            gender: 'Female',
            age: 34,
            admittedDate: bill.admissionDate,
            dischargeDate: bill.dischargeDate || new Date().toISOString(),
            attendingPhysician: bill.primaryDoctor,
            physicianLicenseNumber: 'KMPDC/2014/8812',
            department: bill.department,
            wardRoom: bill.encounterType,
            admittingDiagnosis: 'Acute Inpatient Hospitalization',
            finalDischargeDiagnosis: 'Clinical condition stabilized, ambulatory discharge authorized with follow-up',
            clinicalDischargeCleared: true,
            clinicalDischargeClearedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            clinicalDischargeClearedBy: bill.primaryDoctor,
            financialClearanceStatus: 'CLEARED',
            billId: bill.billNumber,
            totalBillAmount: bill.totalAmount,
            patientSettledAmount: bill.totalPaid,
            currency: bill.currency,
            receiptNumber: bill.tenders[0]?.referenceNumber || 'RCP-2026-AUTO',
            cashierName: 'Jane Mwangi (Cash Desk #2)',
            cashierSignedAt: new Date().toISOString(),
            authorizedEscortName: 'Next of Kin / Relative',
            authorizedEscortPhone: bill.patientPhone,
            authorizedEscortRelation: 'Family Member',
            transportMode: 'Private Vehicle',
            vehiclePlateNumber: 'KDH 102M',
            securityGateStatus: 'PENDING_EXIT',
            securityOfficerName: 'Main Perimeter Security Team',
            securityGateNumber: 'Gate 01 - Main Exit',
        });

        const updated = getStoredGatepasses();
        setGatepasses(updated);
        setSelectedGatepass(newPass);
        setIsModalOpen(true);
    };

    const handleQuickScanRelease = (pass: DischargeGatepass) => {
        const updated = verifyAndReleaseGatepass(pass.id, 'Officer Otieno (Gate 1)', 'North Perimeter Gate 01');
        const list = getStoredGatepasses();
        setGatepasses(list);
    };

    const filtered = gatepasses.filter((g) => {
        const matchesSearch =
            g.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.gatepassNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.vehiclePlateNumber && g.vehiclePlateNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || g.securityGateStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Bills that are Paid in Full and have an admission date
    const paidInFullBills = patientBills.filter((b) => b.status === 'Paid in Full');
    const billsNeedingGatepass = paidInFullBills.filter(
        (b) => !gatepasses.some((g) => g.billId === b.billNumber || g.patientMrn === b.patientMrn)
    );

    return (
        <div className="space-y-6">
            {/* Top Workflow Explanation Bar */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold tracking-tight">
                                Hospital Discharge Clearance & Perimeter Gatepass Station
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                                Zero-Trust Clinical Release
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                            Ensures every departing patient has verified Doctor Clinical Authorization, 100% Cashier Zero-Balance Clearance, and an encrypted QR Gatepass before perimeter security barriers open.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <span className="text-[11px] text-slate-400 block font-medium">Pending Gate Clearance</span>
                        <span className="text-xl font-black text-amber-400">
                            {gatepasses.filter((g) => g.securityGateStatus === 'PENDING_EXIT').length} Patients
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Action: Ready for Gatepass Issuance */}
            {billsNeedingGatepass.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Accounts Financially Settled in Full — Awaiting Security Gatepass Issuance</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700">
                            {billsNeedingGatepass.length} ready
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {billsNeedingGatepass.map((bill) => (
                            <div
                                key={bill.id}
                                className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs flex items-center justify-between gap-2 text-xs"
                            >
                                <div>
                                    <div className="font-bold text-slate-900">{bill.patientName}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                        {bill.patientMrn} • {bill.department}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                        Settled: {bill.currency} {bill.totalPaid.toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCreateGatepassFromBill(bill)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Issue Gatepass</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search gatepasses by serial (GP-...), patient name, MRN, or vehicle plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                statusFilter === 'ALL'
                                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All ({gatepasses.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('PENDING_EXIT')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                statusFilter === 'PENDING_EXIT'
                                    ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Pending Gate Scan ({gatepasses.filter((g) => g.securityGateStatus === 'PENDING_EXIT').length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('CLEARED_EXIT')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                statusFilter === 'CLEARED_EXIT'
                                    ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Exited Premises ({gatepasses.filter((g) => g.securityGateStatus === 'CLEARED_EXIT').length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Gatepasses Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            <tr>
                                <th className="py-3.5 px-4">Gatepass Serial</th>
                                <th className="py-3.5 px-4">Patient Demographics</th>
                                <th className="py-3.5 px-4">Clinical Department & Team</th>
                                <th className="py-3.5 px-4">Clearance Statuses</th>
                                <th className="py-3.5 px-4">Escort & Vehicle</th>
                                <th className="py-3.5 px-4">Perimeter Gate Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400">
                                        No gatepasses matching your search query.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((pass) => {
                                    const isReleased = pass.securityGateStatus === 'CLEARED_EXIT';
                                    return (
                                        <tr key={pass.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-mono">
                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                    <QrCode className="w-4 h-4 text-slate-700" />
                                                    <span>{pass.gatepassNumber}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(pass.dischargeDate).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900">{pass.patientName}</div>
                                                <div className="text-[11px] font-mono text-slate-500">
                                                    {pass.patientMrn} • {pass.gender}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-800">{pass.department}</div>
                                                <div className="text-[11px] text-slate-500">{pass.wardRoom}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    Attending: {pass.attendingPhysician}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Doctor Clearance: Signed</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Financial Ledger: Zero Balance</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-slate-900">
                                                    {pass.authorizedEscortName} ({pass.authorizedEscortRelation})
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono">
                                                    {pass.authorizedEscortPhone}
                                                </div>
                                                <div className="text-[11px] font-bold text-primary mt-0.5 flex items-center gap-1">
                                                    <Car className="w-3 h-3" />
                                                    <span>{pass.vehiclePlateNumber || pass.transportMode}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        isReleased
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-900 border border-amber-300 animate-pulse'
                                                    }`}
                                                >
                                                    {isReleased ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Exited Facility</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                                                            <span>Pending Gate Scan</span>
                                                        </>
                                                    )}
                                                </span>
                                                {pass.securityVerifiedAt && (
                                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                                        Scanned:{' '}
                                                        {new Date(pass.securityVerifiedAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(pass)}
                                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                                                        title="View and print official gatepass"
                                                    >
                                                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>Print / View</span>
                                                    </button>

                                                    {!isReleased && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickScanRelease(pass)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                                                            title="Simulate security officer barcode scan at hospital exit gate"
                                                        >
                                                            <QrCode className="w-3.5 h-3.5" />
                                                            <span>Scan Release</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Discharge Gatepass Modal */}
            <DischargeGatepassModal
                isOpen={isModalOpen}
                gatepass={selectedGatepass}
                onClose={() => setIsModalOpen(false)}
                onGatepassUpdated={(updated) => {
                    const list = getStoredGatepasses();
                    setGatepasses(list);
                }}
            />
        </div>
    );
};
