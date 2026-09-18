import React from 'react';
import {
    Printer,
    Download,
    CheckCircle2,
    Shield,
    Smartphone,
    Banknote,
    CreditCard,
    Building2,
    FileText,
    Calendar,
    User,
    Hospital,
    Clock,
    X,
    QrCode,
} from 'lucide-react';
import { HospitalPatientBill, PaymentTender } from '../../packages/shared/types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ItemizedBillReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: HospitalPatientBill | null;
}

export const ItemizedBillReceiptModal: React.FC<ItemizedBillReceiptModalProps> = ({
    isOpen,
    onClose,
    bill,
}) => {
    const { currentCurrency, convertAndFormat, format: formatCurrency } = useCurrency();

    if (!isOpen || !bill) return null;

    const handlePrint = () => {
        window.print();
    };

    const getTenderIcon = (type: PaymentTender['type']) => {
        switch (type) {
            case 'insurance':
                return <Shield className="w-4 h-4 text-blue-600" />;
            case 'mobile_money':
                return <Smartphone className="w-4 h-4 text-emerald-600" />;
            case 'cash':
                return <Banknote className="w-4 h-4 text-teal-600" />;
            case 'card':
                return <CreditCard className="w-4 h-4 text-purple-600" />;
            case 'waiver':
            case 'bank_transfer':
                return <Building2 className="w-4 h-4 text-amber-600" />;
            default:
                return <CreditCard className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
                {/* Control Top Bar (Hidden on print) */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white print:hidden">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                            <span className="font-bold text-sm">Official Patient Multi-Tender Receipt</span>
                            <span className="text-xs text-gray-400 ml-2">({bill.billNumber})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Receipt
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Receipt Paper Container */}
                <div className="p-8 overflow-y-auto printable-report bg-white text-gray-800 text-sm">
                    {/* Hospital Branding Header */}
                    <div className="border-b-2 border-gray-900 pb-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-700 text-white rounded-lg">
                                        <Hospital className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black text-gray-900 tracking-tight">
                                            {bill.tenantName || 'RaphaMIS Health System'}
                                        </h1>
                                        <p className="text-xs font-medium text-gray-500">
                                            {bill.department} • Clinical Billing & Patient Revenue Desk
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                                    <p>Healthcare Lic. No: MOH-MED/2026/8940 • Tax PIN: P051289190K</p>
                                    <p>Attending: <span className="text-gray-800 font-semibold">{bill.primaryDoctor}</span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Receipt Number</span>
                                    <span className="text-base font-black text-gray-900">{bill.billNumber}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Date: {new Date(bill.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <p>Time: {new Date(bill.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient & Encounter Demographics Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 mb-6 text-xs">
                        <div>
                            <span className="text-gray-400 font-medium block">Patient Name</span>
                            <span className="font-bold text-gray-900 text-sm">{bill.patientName}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 font-medium block">Medical Record (MRN)</span>
                            <span className="font-mono font-bold text-gray-900">{bill.patientMrn}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 font-medium block">Encounter Type</span>
                            <span className="font-semibold text-gray-800">{bill.encounterType}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 font-medium block">Admission / Service</span>
                            <span className="text-gray-700">
                                {new Date(bill.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {bill.dischargeDate && ` - ${new Date(bill.dischargeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </span>
                        </div>
                    </div>

                    {/* Clinical Itemized Charges Table */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Itemized Healthcare Services & Consumables</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-3">Service Code & Description</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        <th className="py-2.5 px-3 text-center">Qty</th>
                                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {bill.lineItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60">
                                            <td className="py-2 px-3">
                                                <div className="font-semibold text-gray-900">{item.description}</div>
                                                {item.code && <div className="text-[10px] font-mono text-gray-400">{item.code}</div>}
                                            </td>
                                            <td className="py-2 px-3">
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-center font-medium">{item.quantity}</td>
                                            <td className="py-2 px-3 text-right font-mono text-gray-600">
                                                {formatCurrency(item.unitPrice, bill.currency)}
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold font-mono text-gray-900">
                                                {formatCurrency(item.total, bill.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MULTI-TENDER SPLIT PAYMENT BREAKDOWN SECTION */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                                <span>Multi-Tender Payment Breakdown</span>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                                    {bill.tenders.length} Tender{bill.tenders.length === 1 ? '' : 's'} Applied
                                </span>
                            </h3>
                            <span className="text-[11px] text-gray-500">Official Settlement Ledger</span>
                        </div>

                        {bill.tenders.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500 bg-gray-50">
                                No payments recorded yet. Bill is currently Unpaid.
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100 font-semibold">
                                        <tr>
                                            <th className="py-2.5 px-3">Tender Method</th>
                                            <th className="py-2.5 px-3">Reference / Auth Code</th>
                                            <th className="py-2.5 px-3">Payment Details</th>
                                            <th className="py-2.5 px-3 text-right">Tendered</th>
                                            <th className="py-2.5 px-3 text-right">Settled Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {bill.tenders.map((tender) => {
                                            const pct = bill.totalAmount > 0 ? Math.round((tender.convertedAmount / bill.totalAmount) * 100) : 0;
                                            return (
                                                <tr key={tender.id} className="hover:bg-gray-50/60">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            {getTenderIcon(tender.type)}
                                                            <div>
                                                                <span className="font-bold text-gray-900">{tender.label}</span>
                                                                <span className="text-[10px] text-gray-400 block uppercase">
                                                                    {tender.type === 'insurance' ? 'Primary Health Insurer' : tender.type === 'mobile_money' ? 'Mobile Money (Daraja)' : tender.type === 'cash' ? 'Cashier Drawer' : 'Electronic POS'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">
                                                        {tender.referenceNumber || 'N/A'}
                                                        <span className="text-[10px] text-gray-400 font-normal block">
                                                            {new Date(tender.processedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-xs text-gray-600">
                                                        {tender.insuranceDetails && (
                                                            <div>
                                                                <span className="font-medium text-gray-800">{tender.insuranceDetails.provider}</span>
                                                                <span className="text-[10px] text-gray-400 block">Policy: {tender.insuranceDetails.policyNumber}</span>
                                                            </div>
                                                        )}
                                                        {tender.mobileMoneyDetails && (
                                                            <div>
                                                                <span className="font-medium text-gray-800">{tender.mobileMoneyDetails.phoneNumber}</span>
                                                                <span className="text-[10px] text-emerald-600 font-semibold block">STK Push Verified</span>
                                                            </div>
                                                        )}
                                                        {tender.cashDetails && (
                                                            <div>
                                                                <span>Tendered: {formatCurrency(tender.cashDetails.tendered, tender.currency)}</span>
                                                                {tender.cashDetails.change > 0 && (
                                                                    <span className="text-[10px] text-emerald-700 font-semibold block">Change returned: {formatCurrency(tender.cashDetails.change, tender.currency)}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {tender.cardDetails && (
                                                            <div>
                                                                <span className="font-medium text-gray-800">{tender.cardDetails.cardBrand} •••• {tender.cardDetails.last4}</span>
                                                                <span className="text-[10px] text-gray-400 block">Auth: {tender.cardDetails.authCode}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                                                        {formatCurrency(tender.amount, tender.currency)}
                                                        <span className="text-[10px] text-gray-400 block font-sans">({pct}% of bill)</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-black text-gray-900 text-sm">
                                                        {formatCurrency(tender.convertedAmount, bill.currency)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Financial Summary Calculation Panel */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-5 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Settlement Status:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                    bill.status === 'Paid in Full'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : bill.status === 'Partially Paid'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                }`}>
                                    {bill.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 max-w-sm">
                                {bill.notes || 'All transactions recorded in compliance with healthcare revenue cycle and tax auditing regulations.'}
                            </p>
                        </div>

                        <div className="w-full sm:w-72 space-y-1.5 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Gross Medical Subtotal:</span>
                                <span className="font-mono font-semibold">{formatCurrency(bill.subtotal, bill.currency)}</span>
                            </div>
                            {bill.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Authorized Discount / Subsidy:</span>
                                    <span className="font-mono font-semibold">-{formatCurrency(bill.discount, bill.currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-1.5">
                                <span>Total Bill Obligation:</span>
                                <span className="font-mono text-sm">{formatCurrency(bill.totalAmount, bill.currency)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Total Paid (Across Tenders):</span>
                                <span className="font-mono text-sm">-{formatCurrency(bill.totalPaid, bill.currency)}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 font-black border-t-2 border-gray-900 pt-1.5 text-sm">
                                <span>Patient Due Balance:</span>
                                <span className={`font-mono text-base ${bill.remainingBalance <= 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatCurrency(bill.remainingBalance, bill.currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Official Sign-off & Verification Footer */}
                    <div className="border-t border-gray-200 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                            <div className="p-2 border border-gray-200 rounded-lg">
                                <QrCode className="w-10 h-10 text-gray-800" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-700">Audit Verification Code</p>
                                <p className="font-mono text-[10px] text-gray-400">VER-SHA256-{bill.id.toUpperCase()}-{bill.billNumber}</p>
                                <p className="text-[10px]">Scan to verify authenticity on RaphaMIS Health Network</p>
                            </div>
                        </div>
                        <div className="text-center sm:text-right">
                            <div className="h-10 border-b border-gray-300 w-48 mb-1"></div>
                            <p className="font-semibold text-gray-700">Authorized Cashier Stamp & Signature</p>
                            <p className="text-[10px]">Revenue Cycle Management Unit</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
