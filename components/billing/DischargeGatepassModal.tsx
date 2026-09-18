import React, { useState } from 'react';
import { DischargeGatepass } from '../../packages/shared/types';
import {
    ShieldCheck,
    Printer,
    Download,
    X,
    CheckCircle2,
    Clock,
    User,
    Car,
    FileText,
    QrCode,
    AlertCircle,
    Building,
    Check,
} from 'lucide-react';
import { verifyAndReleaseGatepass } from '../../api/notificationsApi';

interface DischargeGatepassModalProps {
    gatepass: DischargeGatepass | null;
    isOpen: boolean;
    onClose: () => void;
    onGatepassUpdated?: (updated: DischargeGatepass) => void;
}

export const DischargeGatepassModal: React.FC<DischargeGatepassModalProps> = ({
    gatepass,
    isOpen,
    onClose,
    onGatepassUpdated,
}) => {
    const [currentPass, setCurrentPass] = useState<DischargeGatepass | null>(gatepass);
    const [officerName, setOfficerName] = useState('Officer Otieno (Gate 1)');
    const [gateNumber, setGateNumber] = useState('North Perimeter Gate 01');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

    React.useEffect(() => {
        setCurrentPass(gatepass);
    }, [gatepass]);

    if (!isOpen || !currentPass) return null;

    const handleSecurityRelease = () => {
        setIsVerifying(true);
        setTimeout(() => {
            try {
                const updated = verifyAndReleaseGatepass(currentPass.id, officerName, gateNumber);
                setCurrentPass(updated);
                setIsVerifiedSuccess(true);
                if (onGatepassUpdated) {
                    onGatepassUpdated(updated);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsVerifying(false);
            }
        }, 800);
    };

    const handlePrint = () => {
        window.print();
    };

    const isReleased = currentPass.securityGateStatus === 'CLEARED_EXIT';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
                {/* Top Action Bar (hidden in print) */}
                <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white print:hidden">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-sm tracking-tight">Official Hospital Exit Clearance & Security Gatepass</span>
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                                isReleased ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                        >
                            {isReleased ? 'EXIT VERIFIED' : 'PENDING PERIMETER SCAN'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                        >
                            <Printer className="w-3.5 h-3.5 text-teal-400" />
                            <span>Print Gatepass</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Gatepass Document Body */}
                <div className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-4 print:space-y-4">
                    {/* Header with Hospital Brand & Barcode */}
                    <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded bg-slate-900 text-white font-black text-xs tracking-wider">
                                    RAPHAMIS
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-950 tracking-tight uppercase">
                                        St. Jude General Hospital & Academic Medical Center
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Hospital Registration No: MED-KEN-401928 • Ministry of Health Level 5 Facility
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Inpatient & Day Surgery Discharge Gatepass Voucher
                            </div>
                        </div>

                        {/* Gatepass Serial & QR Simulation */}
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gatepass Serial</span>
                                <span className="text-lg font-black font-mono text-slate-950 tracking-wider">
                                    {currentPass.gatepassNumber}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                                    ✓ Cryptographically Sealed
                                </span>
                            </div>
                            <div className="w-14 h-14 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                                <QrCode className="w-full h-full text-slate-900" />
                            </div>
                        </div>
                    </div>

                    {/* Patient & Admission Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                            <span className="text-sm font-black text-slate-900">{currentPass.patientName}</span>
                            <span className="text-[11px] text-slate-500 block">{currentPass.gender} • {currentPass.age || 35} yrs</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Medical Record No</span>
                            <span className="text-sm font-black font-mono text-slate-900">{currentPass.patientMrn}</span>
                            <span className="text-[11px] text-slate-500 block">Bill Ref: {currentPass.billId}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Admission Date</span>
                            <span className="font-semibold text-slate-800">
                                {new Date(currentPass.admittedDate).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                                {new Date(currentPass.admittedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Discharge Authorized</span>
                            <span className="font-semibold text-slate-800">
                                {new Date(currentPass.dischargeDate).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                                {new Date(currentPass.dischargeDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Department, Room & Clinical Diagnoses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 border border-slate-200 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Clinical Location & Admitting Team
                            </span>
                            <div className="font-bold text-slate-900">{currentPass.department}</div>
                            <div className="text-slate-600 mt-0.5">{currentPass.wardRoom}</div>
                            <div className="text-slate-500 mt-2 text-[11px]">
                                <span className="font-semibold text-slate-700">Admitting Diagnosis: </span>
                                {currentPass.admittingDiagnosis}
                            </div>
                        </div>

                        <div className="p-3.5 border border-slate-200 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Final Clinical Discharge Diagnosis
                            </span>
                            <div className="font-bold text-slate-900 leading-snug">
                                {currentPass.finalDischargeDiagnosis}
                            </div>
                            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                                <span>Physician: <strong>{currentPass.attendingPhysician}</strong></span>
                                <span className="font-mono text-[10px] text-slate-400">{currentPass.physicianLicenseNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dual Stamped Clearances: Medical Signoff + Financial Settlement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Medical Doctor Signoff Box */}
                        <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl relative overflow-hidden">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>1. Medical Discharge Authorization</span>
                            </div>
                            <p className="text-xs text-slate-700">
                                The patient has reached clinical criteria for safe ambulatory or escorted discharge. Discharge summary, post-care prescriptions, and follow-up consultation dispatched.
                            </p>
                            <div className="mt-3 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                                <div>
                                    <span className="text-slate-500 block text-[10px]">Signed By Doctor</span>
                                    <span className="font-bold text-slate-900">{currentPass.clinicalDischargeClearedBy}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-500 block text-[10px]">Clinical Stamp Time</span>
                                    <span className="font-mono text-slate-700">
                                        {new Date(currentPass.clinicalDischargeClearedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Cashier Signoff Box */}
                        <div className="p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl relative overflow-hidden">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                <span>2. Central Cashier Financial Clearance</span>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">Total Envisaged Bill:</span>
                                <span className="font-bold text-slate-900">
                                    {currentPass.currency} {currentPass.totalBillAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">Patient Settled / Insurer Claim:</span>
                                <span className="font-bold text-emerald-700">
                                    {currentPass.currency} {currentPass.patientSettledAmount.toLocaleString()} (Paid in Full)
                                </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px]">
                                <div>
                                    <span className="text-slate-500 block text-[10px]">Cleared By Cashier</span>
                                    <span className="font-bold text-slate-900">{currentPass.cashierName}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-500 block text-[10px]">Receipt Voucher</span>
                                    <span className="font-mono text-slate-900 font-bold">{currentPass.receiptNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exit Logistics & Escort Information */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2.5 flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-600" />
                            <span>Authorized Departure Logistics & Escort</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Escort Name</span>
                                <span className="font-semibold text-slate-900">{currentPass.authorizedEscortName}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Relationship</span>
                                <span className="font-semibold text-slate-900">{currentPass.authorizedEscortRelation}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                                <span className="font-mono text-slate-900">{currentPass.authorizedEscortPhone}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mode & Vehicle Plate</span>
                                <span className="font-bold text-primary">
                                    {currentPass.transportMode} {currentPass.vehiclePlateNumber ? `(${currentPass.vehiclePlateNumber})` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Security Perimeter Gate Section */}
                    <div
                        className={`p-4 rounded-xl border-2 text-xs transition-colors ${
                            isReleased
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-slate-100 border-slate-300'
                        }`}
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck
                                        className={`w-5 h-5 ${
                                            isReleased ? 'text-emerald-600' : 'text-slate-500'
                                        }`}
                                    />
                                    <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                                        Hospital Perimeter Security Gate Log
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                    {isReleased
                                        ? `Verified and exited through ${currentPass.securityGateNumber} by ${currentPass.securityOfficerName} at ${new Date(
                                              currentPass.securityVerifiedAt || ''
                                          ).toLocaleTimeString()}.`
                                        : 'Awaiting barcode scanning by Hospital Security Officer at the exit barrier.'}
                                </p>
                            </div>

                            {/* Verification action (hidden in print) */}
                            {!isReleased && (
                                <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
                                    <button
                                        type="button"
                                        disabled={isVerifying}
                                        onClick={handleSecurityRelease}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                                    >
                                        {isVerifying ? (
                                            <span>Scanning QR Code...</span>
                                        ) : (
                                            <>
                                                <QrCode className="w-4 h-4" />
                                                <span>Scan & Authorize Exit</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {isReleased && (
                                <div className="px-3 py-1.5 bg-emerald-600 text-white font-black rounded-lg text-xs flex items-center gap-1.5">
                                    <Check className="w-4 h-4" />
                                    <span>PHYSICALLY RELEASED</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legal Notice */}
                    <div className="text-[10px] text-slate-400 text-center leading-relaxed pt-2 border-t border-slate-200">
                        This digital discharge voucher certifies that the named patient has been officially released from medical care and all institutional financial liabilities have been settled or guaranteed. Security personnel must retain digital validation logs upon departure.
                    </div>
                </div>
            </div>
        </div>
    );
};
