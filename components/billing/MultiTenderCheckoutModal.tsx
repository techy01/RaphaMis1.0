import React, { useState, useEffect } from 'react';
import {
    Shield,
    Smartphone,
    Banknote,
    CreditCard,
    Building2,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    Send,
    Loader2,
    Sparkles,
    Check,
    X,
    Receipt,
} from 'lucide-react';
import { HospitalPatientBill, PaymentTender, PaymentTenderType } from '../../packages/shared/types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { simulateMpesaStkPush, simulateInsuranceAuth } from '../../api/patientBillingApi';

interface DraftTender {
    id: string;
    type: PaymentTenderType;
    label: string;
    amount: number;
    currency: string;
    referenceNumber: string;
    // Insurance
    insuranceProvider: string;
    insurancePolicyNumber: string;
    insurancePreAuthCode: string;
    insuranceStatus: 'Approved' | 'Pending Adjudication' | 'Rejected';
    isVerifyingInsurance: boolean;
    // M-Pesa
    mobile_moneyPhone: string;
    mobile_moneyTxCode: string;
    isSendingStk: boolean;
    stkCompleted: boolean;
    // Cash
    cashTendered: number;
    cashDrawerId: string;
    // Card
    cardBrand: 'Visa' | 'Mastercard' | 'Amex' | 'Verve';
    cardLast4: string;
    cardAuthCode: string;
    cardTerminal: string;
    // Waiver
    waiverAuthorizedBy: string;
    waiverReason: string;
}

interface MultiTenderCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: HospitalPatientBill | null;
    onPaymentCompleted: (updatedBill: HospitalPatientBill) => void;
}

const INSURANCE_PROVIDERS = [
    'Social Health Authority (SHA / NHIF)',
    'Jubilee Health Insurance',
    'Aetna International Health',
    'Cigna Global Healthcare',
    'Blue Cross Blue Shield',
    'Britam Health Insurance',
    'UAP Old Mutual Healthcare',
    'Allianz Care Global',
];

export const MultiTenderCheckoutModal: React.FC<MultiTenderCheckoutModalProps> = ({
    isOpen,
    onClose,
    bill,
    onPaymentCompleted,
}) => {
    const { currentCurrency, format: formatCurrency, convert, convertAndFormat } = useCurrency();

    const [tenders, setTenders] = useState<DraftTender[]>([]);
    const [cashierNotes, setCashierNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Initialize or reset draft tenders when modal opens
    useEffect(() => {
        if (isOpen && bill) {
            const initialBalance = bill.remainingBalance > 0 ? bill.remainingBalance : bill.totalAmount;
            // Default smart starting draft:
            // If patient has a registered phone, add an M-Pesa tender pre-allocated for part of the bill or full
            setTenders([
                {
                    id: `draft_${Date.now()}_1`,
                    type: 'insurance',
                    label: 'Primary Health Insurance',
                    amount: Math.round(initialBalance * 0.7), // e.g. 70% typical insurance coverage
                    currency: bill.currency || 'USD',
                    referenceNumber: '',
                    insuranceProvider: 'Social Health Authority (SHA / NHIF)',
                    insurancePolicyNumber: 'SHA-089124-B',
                    insurancePreAuthCode: 'AUTH-SHA-2026-8812',
                    insuranceStatus: 'Approved',
                    isVerifyingInsurance: false,
                    mobile_moneyPhone: bill.patientPhone || '+254 712 345 678',
                    mobile_moneyTxCode: '',
                    isSendingStk: false,
                    stkCompleted: false,
                    cashTendered: 0,
                    cashDrawerId: 'DRAWER-MAIN-01',
                    cardBrand: 'Visa',
                    cardLast4: '4192',
                    cardAuthCode: 'AUTH-789012',
                    cardTerminal: 'POS-TERM-01',
                    waiverAuthorizedBy: 'Dr. Medical Director',
                    waiverReason: 'Clinical benevolence waiver',
                },
                {
                    id: `draft_${Date.now()}_2`,
                    type: 'mobile_money',
                    label: 'Safaricom M-Pesa (Patient Co-pay)',
                    amount: Math.round(initialBalance * 0.3), // Remaining 30% copay via M-Pesa
                    currency: bill.currency || 'USD',
                    referenceNumber: '',
                    insuranceProvider: 'Jubilee Health Insurance',
                    insurancePolicyNumber: '',
                    insurancePreAuthCode: '',
                    insuranceStatus: 'Approved',
                    isVerifyingInsurance: false,
                    mobile_moneyPhone: bill.patientPhone || '+254 712 345 678',
                    mobile_moneyTxCode: '',
                    isSendingStk: false,
                    stkCompleted: false,
                    cashTendered: 0,
                    cashDrawerId: 'DRAWER-MAIN-01',
                    cardBrand: 'Visa',
                    cardLast4: '',
                    cardAuthCode: '',
                    cardTerminal: 'POS-TERM-01',
                    waiverAuthorizedBy: '',
                    waiverReason: '',
                },
            ]);
            setCashierNotes('');
            setErrorMessage(null);
        }
    }, [isOpen, bill]);

    if (!isOpen || !bill) return null;

    const remainingDue = bill.remainingBalance > 0 ? bill.remainingBalance : bill.totalAmount;
    const totalAllocated = tenders.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const balanceAfterTenders = remainingDue - totalAllocated;

    const addTender = (type: PaymentTenderType) => {
        const remainingToAllocate = Math.max(0, balanceAfterTenders);
        const newTender: DraftTender = {
            id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type,
            label:
                type === 'insurance'
                    ? 'Health Insurance Claim'
                    : type === 'mobile_money'
                    ? 'Safaricom M-Pesa'
                    : type === 'cash'
                    ? 'Physical Cash Tender'
                    : type === 'card'
                    ? 'Credit / Debit POS Card'
                    : 'Hospital Waiver / Corporate',
            amount: remainingToAllocate,
            currency: bill.currency || 'USD',
            referenceNumber: '',
            insuranceProvider: 'Social Health Authority (SHA / NHIF)',
            insurancePolicyNumber: 'POL-9021-X',
            insurancePreAuthCode: 'AUTH-PRE-99120',
            insuranceStatus: 'Approved',
            isVerifyingInsurance: false,
            mobile_moneyPhone: bill.patientPhone || '+254 712 345 678',
            mobile_moneyTxCode: '',
            isSendingStk: false,
            stkCompleted: false,
            cashTendered: remainingToAllocate,
            cashDrawerId: 'DRAWER-MAIN-01',
            cardBrand: 'Visa',
            cardLast4: '1092',
            cardAuthCode: 'AUTH-554109',
            cardTerminal: 'POS-MAIN-01',
            waiverAuthorizedBy: 'Dr. Executive Director',
            waiverReason: 'Compassionate care discount',
        };
        setTenders([...tenders, newTender]);
    };

    const removeTender = (id: string) => {
        setTenders(tenders.filter((t) => t.id !== id));
    };

    const updateTender = (id: string, updates: Partial<DraftTender>) => {
        setTenders(
            tenders.map((t) => {
                if (t.id !== id) return t;
                return { ...t, ...updates };
            })
        );
    };

    const handleSendStkPush = async (tenderId: string, phone: string, amount: number) => {
        updateTender(tenderId, { isSendingStk: true });
        try {
            // Amount in KES approx for M-Pesa standard (or base amount)
            const kesAmount = Math.round(amount * 130);
            const res = await simulateMpesaStkPush(phone, kesAmount);
            updateTender(tenderId, {
                isSendingStk: false,
                stkCompleted: true,
                mobile_moneyTxCode: res.transactionCode,
                referenceNumber: res.transactionCode,
            });
        } catch {
            updateTender(tenderId, { isSendingStk: false });
        }
    };

    const handleVerifyInsurance = async (tenderId: string, provider: string, amount: number) => {
        updateTender(tenderId, { isVerifyingInsurance: true });
        try {
            const res = await simulateInsuranceAuth(provider, 'POL-VERIFIED', amount);
            updateTender(tenderId, {
                isVerifyingInsurance: false,
                insurancePreAuthCode: res.preAuthCode,
                referenceNumber: res.preAuthCode,
                insuranceStatus: 'Approved',
            });
        } catch {
            updateTender(tenderId, { isVerifyingInsurance: false });
        }
    };

    const handleProcessSettlement = async () => {
        if (tenders.length === 0) {
            setErrorMessage('Please add at least one payment tender.');
            return;
        }

        if (totalAllocated <= 0) {
            setErrorMessage('Total allocated payment must be greater than zero.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const formattedTenders: PaymentTender[] = tenders.map((t) => {
                let refNum = t.referenceNumber;
                if (t.type === 'insurance') refNum = t.insurancePreAuthCode || `AUTH-INS-${Date.now()}`;
                if (t.type === 'mobile_money') refNum = t.mobile_moneyTxCode || `MPESA-${Date.now()}`;
                if (t.type === 'cash') refNum = `CSH-REC-${Math.floor(1000 + Math.random() * 9000)}`;
                if (t.type === 'card') refNum = `POS-${t.cardBrand}-${t.cardAuthCode || 'AUTH-01'}`;
                if (t.type === 'waiver') refNum = `WAIVER-${Math.floor(1000 + Math.random() * 9000)}`;

                return {
                    id: `tnd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                    type: t.type,
                    label: t.label,
                    amount: t.amount,
                    currency: t.currency,
                    convertedAmount: t.amount, // Normalized
                    exchangeRateUsed: 1.0,
                    referenceNumber: refNum,
                    processedAt: new Date().toISOString(),
                    cashierName: 'Jane Mwangi (Cashier Desk #1)',
                    status: 'Settled',
                    insuranceDetails:
                        t.type === 'insurance'
                            ? {
                                  provider: t.insuranceProvider,
                                  policyNumber: t.insurancePolicyNumber,
                                  preAuthCode: refNum,
                                  claimStatus: t.insuranceStatus,
                                  copayRequired: Math.max(0, bill.totalAmount - t.amount),
                              }
                            : undefined,
                    mobile_moneyDetails:
                        t.type === 'mobile_money'
                            ? {
                                  phoneNumber: t.mobile_moneyPhone,
                                  transactionCode: refNum,
                                  receiptNumber: `REC-MP-${Math.floor(10000 + Math.random() * 90000)}`,
                                  stkPushStatus: 'Success',
                              }
                            : undefined,
                    cashDetails:
                        t.type === 'cash'
                            ? {
                                  tendered: t.cashTendered || t.amount,
                                  change: Math.max(0, (t.cashTendered || t.amount) - t.amount),
                                  cashDrawerId: t.cashDrawerId,
                              }
                            : undefined,
                    cardDetails:
                        t.type === 'card'
                            ? {
                                  cardBrand: t.cardBrand,
                                  last4: t.cardLast4 || '0000',
                                  authCode: t.cardAuthCode || 'AUTH-99',
                                  posTerminalId: t.cardTerminal,
                              }
                            : undefined,
                    waiverDetails:
                        t.type === 'waiver'
                            ? {
                                  authorizedBy: t.waiverAuthorizedBy,
                                  reason: t.waiverReason,
                                  approvalDocRef: refNum,
                              }
                            : undefined,
                };
            });

            // Dynamically import and run recordSplitPayment to ensure persistence
            const { recordSplitPayment } = await import('../../api/patientBillingApi');
            const updated = await recordSplitPayment({
                billId: bill.id,
                newTenders: formattedTenders,
                cashierNotes,
            });

            onPaymentCompleted(updated);
            onClose();
        } catch (err: any) {
            setErrorMessage(err?.message || 'Failed to process split payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-emerald-950 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight">Multi-Tender Split Payment Checkout</h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                        Point of Sale (POS)
                                    </span>
                                </div>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    Split clinical encounter bill across Insurance, Safaricom M-Pesa, Cash, and Card tenders.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Patient & Bill Metrics Card */}
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs">
                        <div>
                            <span className="text-gray-400 block text-[11px]">Patient / MRN</span>
                            <span className="font-bold text-white text-sm">{bill.patientName}</span>
                            <span className="text-emerald-300 font-mono text-[10px] block">{bill.patientMrn}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Encounter & Dept</span>
                            <span className="font-semibold text-white">{bill.department}</span>
                            <span className="text-gray-300 text-[10px] block">{bill.encounterType}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Total Medical Bill</span>
                            <span className="font-bold text-white text-base font-mono">
                                {formatCurrency(bill.totalAmount, bill.currency)}
                            </span>
                            {bill.totalPaid > 0 && (
                                <span className="text-gray-300 text-[10px] block">
                                    Paid: {formatCurrency(bill.totalPaid, bill.currency)}
                                </span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Active Due Balance</span>
                            <span className="font-black text-rose-400 text-lg font-mono">
                                {formatCurrency(remainingDue, bill.currency)}
                            </span>
                            <span className="text-amber-300 text-[10px] block">Requires Allocation</span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Visual Payment Allocation Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                                Payment Allocation Matrix ({totalAllocated >= remainingDue ? '100% Covered' : `${Math.round((totalAllocated / remainingDue) * 100)}% Covered`})
                            </span>
                            <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-gray-500">Allocated: <strong className="text-gray-900 font-mono">{formatCurrency(totalAllocated, bill.currency)}</strong></span>
                                <span className={`${balanceAfterTenders <= 0.009 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}`}>
                                    Remaining: <span className="font-mono">{formatCurrency(Math.max(0, balanceAfterTenders), bill.currency)}</span>
                                </span>
                            </div>
                        </div>

                        {/* Visual stacked bar */}
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex border border-gray-200">
                            {tenders.map((t, idx) => {
                                const widthPct = remainingDue > 0 ? (t.amount / remainingDue) * 100 : 0;
                                const colorClass =
                                    t.type === 'insurance'
                                        ? 'bg-blue-500'
                                        : t.type === 'mobile_money'
                                        ? 'bg-emerald-500'
                                        : t.type === 'cash'
                                        ? 'bg-teal-500'
                                        : t.type === 'card'
                                        ? 'bg-purple-500'
                                        : 'bg-amber-500';
                                return (
                                    <div
                                        key={t.id}
                                        style={{ width: `${Math.min(100, widthPct)}%` }}
                                        className={`${colorClass} h-full transition-all duration-300 relative group`}
                                        title={`${t.label}: ${formatCurrency(t.amount, bill.currency)} (${Math.round(widthPct)}%)`}
                                    />
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Insurance</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> M-Pesa Mobile</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Physical Cash</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> POS Card</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Waiver / Sponsor</span>
                        </div>
                    </div>

                    {/* DRAFT TENDERS LIST */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Payment Tenders ({tenders.length})
                            </h3>
                            {/* Quick Add Tender Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Add Tender:</span>
                                <button
                                    type="button"
                                    onClick={() => addTender('insurance')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    + Insurance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addTender('mobile_money')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                                >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    + M-Pesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addTender('cash')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                                >
                                    <Banknote className="w-3.5 h-3.5" />
                                    + Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addTender('card')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    + Card
                                </button>
                            </div>
                        </div>

                        {/* Tender Cards */}
                        {tenders.map((tender, index) => {
                            return (
                                <div
                                    key={tender.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                        tender.type === 'insurance'
                                            ? 'bg-blue-50/40 border-blue-200'
                                            : tender.type === 'mobile_money'
                                            ? 'bg-emerald-50/40 border-emerald-200'
                                            : tender.type === 'cash'
                                            ? 'bg-teal-50/40 border-teal-200'
                                            : 'bg-purple-50/40 border-purple-200'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-200/80">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`p-2 rounded-lg text-white ${
                                                    tender.type === 'insurance'
                                                        ? 'bg-blue-600'
                                                        : tender.type === 'mobile_money'
                                                        ? 'bg-emerald-600'
                                                        : tender.type === 'cash'
                                                        ? 'bg-teal-600'
                                                        : 'bg-purple-600'
                                                }`}
                                            >
                                                {tender.type === 'insurance' && <Shield className="w-4 h-4" />}
                                                {tender.type === 'mobile_money' && <Smartphone className="w-4 h-4" />}
                                                {tender.type === 'cash' && <Banknote className="w-4 h-4" />}
                                                {tender.type === 'card' && <CreditCard className="w-4 h-4" />}
                                                {tender.type === 'waiver' && <Building2 className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        Tender #{index + 1}: {tender.label}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-gray-200 text-gray-700">
                                                        {tender.type}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-gray-500">
                                                    {tender.type === 'insurance' && 'Direct Payer Claims Adjudication'}
                                                    {tender.type === 'mobile_money' && 'Instant STK Push / Mobile Wallet Settlement'}
                                                    {tender.type === 'cash' && 'Hospital Cashier Register Drawer'}
                                                    {tender.type === 'card' && 'EMV Chip & PIN POS Terminal'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-semibold text-gray-600">Amount:</span>
                                                <div className="relative">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                                                        $
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={tender.amount || ''}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, {
                                                                amount: Math.max(0, parseFloat(e.target.value) || 0),
                                                            })
                                                        }
                                                        className="w-28 pl-6 pr-2 py-1 text-sm font-bold font-mono text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const otherTenders = tenders
                                                            .filter((t) => t.id !== tender.id)
                                                            .reduce((acc, t) => acc + t.amount, 0);
                                                        const remainingForThis = Math.max(0, remainingDue - otherTenders);
                                                        updateTender(tender.id, { amount: remainingForThis });
                                                    }}
                                                    title="Fill with remaining unallocated balance"
                                                    className="px-2 py-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    Max Balance
                                                </button>
                                            </div>

                                            {tenders.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTender(tender.id)}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                                                    title="Remove tender"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTEXTUAL METHOD-SPECIFIC FORM FIELDS */}
                                    <div className="pt-3">
                                        {/* 1. Insurance Fields */}
                                        {tender.type === 'insurance' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Insurance Provider
                                                    </label>
                                                    <select
                                                        value={tender.insuranceProvider}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { insuranceProvider: e.target.value })
                                                        }
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-xs"
                                                    >
                                                        {INSURANCE_PROVIDERS.map((p) => (
                                                            <option key={p} value={p}>
                                                                {p}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Policy / Member Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tender.insurancePolicyNumber}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { insurancePolicyNumber: e.target.value })
                                                        }
                                                        placeholder="e.g. SHA-908129-C"
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Pre-Authorization Code
                                                    </label>
                                                    <div className="flex gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={tender.insurancePreAuthCode}
                                                            onChange={(e) =>
                                                                updateTender(tender.id, {
                                                                    insurancePreAuthCode: e.target.value,
                                                                    referenceNumber: e.target.value,
                                                                })
                                                            }
                                                            placeholder="AUTH-SHA-2026..."
                                                            className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={tender.isVerifyingInsurance}
                                                            onClick={() =>
                                                                handleVerifyInsurance(
                                                                    tender.id,
                                                                    tender.insuranceProvider,
                                                                    tender.amount
                                                                )
                                                            }
                                                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs whitespace-nowrap flex items-center gap-1"
                                                        >
                                                            {tender.isVerifyingInsurance ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5" />
                                                            )}
                                                            Verify
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. M-Pesa Mobile Money Fields */}
                                        {tender.type === 'mobile_money' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Patient Mobile Number (STK Push)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tender.mobile_moneyPhone}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { mobile_moneyPhone: e.target.value })
                                                        }
                                                        placeholder="+254 7XX XXX XXX"
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        M-Pesa Transaction Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tender.mobile_moneyTxCode}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, {
                                                                mobile_moneyTxCode: e.target.value,
                                                                referenceNumber: e.target.value,
                                                            })
                                                        }
                                                        placeholder="e.g. QHK89412LA"
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono font-bold text-emerald-800 text-xs uppercase"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        disabled={tender.isSendingStk || !tender.amount}
                                                        onClick={() =>
                                                            handleSendStkPush(tender.id, tender.mobile_moneyPhone, tender.amount)
                                                        }
                                                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                                    >
                                                        {tender.isSendingStk ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                Prompting Handset...
                                                            </>
                                                        ) : tender.stkCompleted ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                                                STK Confirmed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-3.5 h-3.5" />
                                                                Initiate STK Push
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. Cash Tender Fields */}
                                        {tender.type === 'cash' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Cash Tendered by Patient
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                                            $
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={tender.cashTendered || ''}
                                                            onChange={(e) =>
                                                                updateTender(tender.id, {
                                                                    cashTendered: parseFloat(e.target.value) || 0,
                                                                })
                                                            }
                                                            placeholder="0.00"
                                                            className="w-full pl-6 pr-2 py-2 bg-white border border-gray-300 rounded-lg font-mono font-bold text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Change to Return
                                                    </label>
                                                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900 font-mono font-black text-sm flex items-center justify-between">
                                                        <span>Return Change:</span>
                                                        <span>
                                                            {formatCurrency(
                                                                Math.max(0, (tender.cashTendered || tender.amount) - tender.amount),
                                                                bill.currency
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Active Cash Drawer Till
                                                    </label>
                                                    <select
                                                        value={tender.cashDrawerId}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { cashDrawerId: e.target.value })
                                                        }
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                                                    >
                                                        <option value="DRAWER-MAIN-01">Till #1 - Central Reception</option>
                                                        <option value="DRAWER-ER-02">Till #2 - Emergency Triage</option>
                                                        <option value="DRAWER-PHARM-03">Till #3 - Inpatient Pharmacy</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* 4. POS Card Fields */}
                                        {tender.type === 'card' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Card Network
                                                    </label>
                                                    <select
                                                        value={tender.cardBrand}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, {
                                                                cardBrand: e.target.value as any,
                                                            })
                                                        }
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                                                    >
                                                        <option value="Visa">Visa Debit/Credit</option>
                                                        <option value="Mastercard">Mastercard</option>
                                                        <option value="Amex">American Express</option>
                                                        <option value="Verve">Verve Interswitch</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Last 4 Digits
                                                    </label>
                                                    <input
                                                        type="text"
                                                        maxLength={4}
                                                        value={tender.cardLast4}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { cardLast4: e.target.value })
                                                        }
                                                        placeholder="4192"
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        Terminal Slip Auth
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tender.cardAuthCode}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, {
                                                                cardAuthCode: e.target.value,
                                                                referenceNumber: e.target.value,
                                                            })
                                                        }
                                                        placeholder="AUTH-99120"
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-700 block mb-1">
                                                        POS Terminal ID
                                                    </label>
                                                    <select
                                                        value={tender.cardTerminal}
                                                        onChange={(e) =>
                                                            updateTender(tender.id, { cardTerminal: e.target.value })
                                                        }
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                                                    >
                                                        <option value="POS-TERM-01">KCB Merchant POS #1</option>
                                                        <option value="POS-TERM-02">Stanbic Wireless POS #2</option>
                                                        <option value="POS-TERM-03">Equity Paybill POS #3</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Cashier Notes & Comments */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                            Cashier Notes & Audit Trail
                        </label>
                        <input
                            type="text"
                            value={cashierNotes}
                            onChange={(e) => setCashierNotes(e.target.value)}
                            placeholder="e.g. Patient cleared 70% via SHA insurance, copay settled via M-Pesa STK push and cash change returned."
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="text-xs">
                            <span className="text-gray-500 block">Total Billed: <strong>{formatCurrency(bill.totalAmount, bill.currency)}</strong></span>
                            <span className="text-gray-500 block">
                                Newly Tendered: <strong className="text-gray-900">{formatCurrency(totalAllocated, bill.currency)}</strong>
                            </span>
                        </div>
                        <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                        <div>
                            {balanceAfterTenders <= 0.009 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Exact Settlement: Bill Paid in Full
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Partial Settlement: {formatCurrency(balanceAfterTenders, bill.currency)} active co-pay remains
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting || tenders.length === 0}
                            onClick={handleProcessSettlement}
                            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Settling {tenders.length} Tenders...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-4 h-4" />
                                    Confirm & Process Settlement ({tenders.length} Tenders)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
