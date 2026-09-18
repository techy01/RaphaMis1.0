import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInvoices } from '../../api/billingApi';
import { getPatientBills } from '../../api/patientBillingApi';
import { InvoiceStatus, HospitalPatientBill } from '../../packages/shared/types';
import { format as formatDate } from 'date-fns';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Globe,
    ArrowRightLeft,
    RefreshCw,
    Download,
    FileText,
    Plus,
    Filter,
    Shield,
    Smartphone,
    Banknote,
    Building2,
    Receipt,
    Search,
    ChevronRight,
    QrCode,
    Sparkles,
    Check,
    Mail,
    Landmark,
    Key,
    Send,
    ShieldCheck,
    Briefcase,
    Building,
    CheckCheck,
} from 'lucide-react';
import { MultiTenderCheckoutModal } from '../billing/MultiTenderCheckoutModal';
import { ItemizedBillReceiptModal } from '../billing/ItemizedBillReceiptModal';
import { ClaimsAdjudicationTab } from '../billing/ClaimsAdjudicationTab';
import { DischargeGatepassTab } from '../billing/DischargeGatepassTab';
import { DepartmentChargesFeedTab } from '../billing/DepartmentChargesFeedTab';
import { DischargeGatepassModal } from '../billing/DischargeGatepassModal';
import { ManualWireActivationModal } from '../subscription/ManualWireActivationModal';
import { WireTransferSettingsCard } from '../subscription/WireTransferSettingsCard';
import { DispatchedEmailsAuditModal } from '../subscription/DispatchedEmailsAuditModal';
import { SubscriptionCheckoutModal } from '../subscription/SubscriptionCheckoutModal';
import { getDispatchedEmails } from '../../api/subscriptionCheckoutApi';
import { Tenant, TenantStatus, DischargeGatepass } from '../../packages/shared/types';
import { getTenants } from '../../api/tenantsApi';
import { getStoredGatepasses, createDischargeGatepass } from '../../api/notificationsApi';
import { useDepartmentNotifications } from '../../contexts/DepartmentNotificationContext';

export const BillingView: React.FC = () => {
    const queryClient = useQueryClient();
    const { openHandoffModal } = useDepartmentNotifications();

    const {
        currentCurrency,
        baseCurrency,
        currencyInfo,
        rates,
        convert,
        format: formatCurrency,
        convertAndFormat,
        setCurrency,
        openExchangeModal,
        exchangeMeta,
        popularCurrencies,
    } = useCurrency();

    // Navigation Sub-tabs
    const [activeTab, setActiveTab] = useState<
        'patient_split' | 'discharge_gatepass' | 'charges_feed' | 'claims' | 'saas_invoices' | 'facility_licensing' | 'channels'
    >('patient_split');

    // Selected Tenant filter
    const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');
    const [patientBillSearch, setPatientBillSearch] = useState('');
    const [patientBillStatusFilter, setPatientBillStatusFilter] = useState<string>('ALL');

    // SaaS Invoices Filter
    const [saasStatusFilter, setSaasStatusFilter] = useState<string>('ALL');

    // Modals state
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedBillForCheckout, setSelectedBillForCheckout] = useState<HospitalPatientBill | null>(null);
    const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<HospitalPatientBill | null>(null);

    // Gatepass Modal from Billing Row
    const [gatepassModalOpen, setGatepassModalOpen] = useState(false);
    const [selectedGatepass, setSelectedGatepass] = useState<DischargeGatepass | null>(null);

    // Subscription & Wire Transfer Admin Modals
    const [manualActivationModalOpen, setManualActivationModalOpen] = useState(false);
    const [selectedTenantForWireActivation, setSelectedTenantForWireActivation] = useState<Tenant | null>(null);
    const [emailAuditModalOpen, setEmailAuditModalOpen] = useState(false);
    const [subscriptionCheckoutModalOpen, setSubscriptionCheckoutModalOpen] = useState(false);
    const [showWireSettingsCard, setShowWireSettingsCard] = useState(false);

    // Queries
    const { data: tenantList = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: patientBills = [], isLoading: billsLoading } = useQuery({
        queryKey: ['patientBills', selectedTenantId],
        queryFn: () => getPatientBills(selectedTenantId),
    });

    const { data: saasInvoices = [], isLoading: saasLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: getInvoices,
    });

    const handleOpenCheckout = (bill: HospitalPatientBill) => {
        setSelectedBillForCheckout(bill);
        setCheckoutModalOpen(true);
    };

    const handleOpenReceipt = (bill: HospitalPatientBill) => {
        setSelectedBillForReceipt(bill);
        setReceiptModalOpen(true);
    };

    const handleOpenGatepassForBill = (bill: HospitalPatientBill) => {
        const storedPasses = getStoredGatepasses();
        const existing = storedPasses.find((g) => g.billId === bill.billNumber || g.patientMrn === bill.patientMrn);
        if (existing) {
            setSelectedGatepass(existing);
        } else {
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
                clinicalDischargeClearedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
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
            setSelectedGatepass(newPass);
        }
        setGatepassModalOpen(true);
    };

    const handlePaymentCompleted = (updatedBill: HospitalPatientBill) => {
        queryClient.invalidateQueries({ queryKey: ['patientBills'] });
        // Automatically open the official receipt modal so cashier/patient can view and print
        setSelectedBillForReceipt(updatedBill);
        setReceiptModalOpen(true);
    };

    // Filter patient bills
    const filteredPatientBills = patientBills.filter((bill) => {
        const matchesSearch =
            bill.patientName.toLowerCase().includes(patientBillSearch.toLowerCase()) ||
            bill.patientMrn.toLowerCase().includes(patientBillSearch.toLowerCase()) ||
            bill.billNumber.toLowerCase().includes(patientBillSearch.toLowerCase()) ||
            bill.department.toLowerCase().includes(patientBillSearch.toLowerCase());
        const matchesStatus =
            patientBillStatusFilter === 'ALL' || bill.status === patientBillStatusFilter;
        return matchesSearch && matchesStatus;
    });

    // Patient Financial Metrics (converted to selected active currency)
    const totalClinicalBilled = patientBills.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalClinicalPaid = patientBills.reduce((acc, b) => acc + b.totalPaid, 0);
    const totalClinicalPending = patientBills.reduce((acc, b) => acc + b.remainingBalance, 0);

    // Calculate Split Tender Breakdown percentages
    const allTenders = patientBills.flatMap((b) => b.tenders);
    const insuranceTotal = allTenders
        .filter((t) => t.type === 'insurance')
        .reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0);
    const mobile_moneyTotal = allTenders
        .filter((t) => t.type === 'mobile_money')
        .reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0);
    const cashTotal = allTenders
        .filter((t) => t.type === 'cash')
        .reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0);
    const cardTotal = allTenders
        .filter((t) => t.type === 'card')
        .reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0);

    const activeRate = currentCurrency === baseCurrency ? 1.0 : (rates[currentCurrency] || 1.0);
    const existingGatepasses = getStoredGatepasses();
    const pendingGateClearanceCount = existingGatepasses.filter((g) => g.securityGateStatus === 'PENDING_EXIT').length;

    return (
        <div className="space-y-6">
            {/* Top Level Hospital Facility & Cashier Shift Station Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                            RAPHAMIS RCM
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Hospital Revenue Cycle Management & Central Cashier POS
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Till 174379 Active</span>
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                        <span>Shift #04 (Morning Central Desk)</span>
                        <span className="text-slate-300">•</span>
                        <span>Senior Cashier: <strong>Jane Mwangi</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Facility: <strong>St. Jude General Hospital & Academic Medical Center</strong></span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Live Currency Standard Indicator */}
                    <button
                        type="button"
                        onClick={openExchangeModal}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View active exchange rate matrix"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>1 {baseCurrency} = {activeRate < 1 ? activeRate.toFixed(4) : activeRate.toFixed(2)} {currentCurrency}</span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Quick Trigger: Cross-Department Handoff */}
                    <button
                        type="button"
                        onClick={openHandoffModal}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                    >
                        <Send className="w-3.5 h-3.5 text-teal-600" />
                        <span>Send Handoff</span>
                    </button>

                    {/* Quick Trigger: POS Checkout */}
                    <button
                        type="button"
                        onClick={() => {
                            const unpaidOrPartial = patientBills.find((b) => b.status !== 'Paid in Full') || patientBills[0];
                            if (unpaidOrPartial) handleOpenCheckout(unpaidOrPartial);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-colors"
                    >
                        <Receipt className="w-4 h-4" />
                        <span>Cashier POS Checkout</span>
                    </button>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="border-b border-slate-200 overflow-x-auto no-scrollbar flex gap-1 sm:gap-2 text-xs font-semibold">
                <button
                    onClick={() => setActiveTab('patient_split')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'patient_split'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Receipt className="w-4 h-4" />
                    <span>Patient Folios & POS Desk</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {patientBills.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('discharge_gatepass')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'discharge_gatepass'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Discharge Clearance & Gatepasses</span>
                    {pendingGateClearanceCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                            {pendingGateClearanceCount} Pending Exit
                        </span>
                    ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                            {existingGatepasses.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('charges_feed')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'charges_feed'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Live Dept Charges Feed</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        CPOE Live
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('claims')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'claims'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    <span>SHA & Private Insurance Claims</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                        SHA / Private
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('saas_invoices')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'saas_invoices'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Institutional SaaS Invoices</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {saasInvoices.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('facility_licensing')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'facility_licensing'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Landmark className="w-4 h-4" />
                    <span>Hospital Network Subscriptions</span>
                    {tenantList.filter((t) => t.activationStatus === 'Pending Activation' || t.paymentStatus === 'Pending').length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                            {tenantList.filter((t) => t.activationStatus === 'Pending Activation' || t.paymentStatus === 'Pending').length} Pending Wire
                        </span>
                    ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                            {tenantList.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('channels')}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'channels'
                            ? 'border-primary text-primary font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Smartphone className="w-4 h-4" />
                    <span>Cashier Till & Gateways</span>
                </button>
            </div>

            {/* TAB 1: PATIENT MULTI-TENDER POS & SPLIT BILLING */}
            {activeTab === 'patient_split' && (
                <div className="space-y-6">
                    {/* Executive KPI Ribbon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                <span className="font-semibold uppercase tracking-wider">Total Billed</span>
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
                                {convertAndFormat(totalClinicalBilled, 'USD', currentCurrency)}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                                Across {patientBills.length} patient accounts
                            </span>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                <span className="font-semibold uppercase tracking-wider">Settled Tenders</span>
                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2 font-mono">
                                {convertAndFormat(totalClinicalPaid, 'USD', currentCurrency)}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 flex-wrap">
                                <span className="text-blue-600 font-semibold">Ins {Math.round((insuranceTotal / (totalClinicalPaid || 1)) * 100)}%</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold">Mobile Money {Math.round((mobile_moneyTotal / (totalClinicalPaid || 1)) * 100)}%</span>
                                <span>•</span>
                                <span className="text-gray-700 font-semibold">Cash/Card {Math.round(((cashTotal + cardTotal) / (totalClinicalPaid || 1)) * 100)}%</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                <span className="font-semibold uppercase tracking-wider">Pending Balance</span>
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-2 font-mono">
                                {convertAndFormat(totalClinicalPending, 'USD', currentCurrency)}
                            </p>
                            <span className="text-xs text-amber-700 font-medium mt-1 inline-block">
                                Uncollected patient co-pays & dues
                            </span>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                <span className="font-semibold uppercase tracking-wider">Mobile Money Volume</span>
                                <Smartphone className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
                                {convertAndFormat(mobile_moneyTotal, 'USD', currentCurrency)}
                            </p>
                            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
                                Instant Daraja STK Push Settlement
                            </span>
                        </div>
                    </div>

                    {/* Patient Bills Management Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        {/* Table Header Filter Toolbar */}
                        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                                <div className="relative flex-1 sm:max-w-xs">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={patientBillSearch}
                                        onChange={(e) => setPatientBillSearch(e.target.value)}
                                        placeholder="Search patient, MRN, bill #..."
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Status:</span>
                                    {['ALL', 'Paid in Full', 'Partially Paid', 'Unpaid'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => setPatientBillStatusFilter(st)}
                                            className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                                                patientBillStatusFilter === st
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                Showing {filteredPatientBills.length} of {patientBills.length} accounts
                            </div>
                        </div>

                        {/* MOBILE FIRST: Card List for Small Screens */}
                        <div className="block md:hidden divide-y divide-gray-200">
                            {filteredPatientBills.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500">
                                    No patient bills match your search criteria.
                                </div>
                            ) : (
                                filteredPatientBills.map((bill) => {
                                    const isFullyPaid = bill.status === 'Paid in Full';
                                    return (
                                        <div key={bill.id} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
                                            {/* Header Row: Bill # and Status */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-gray-900">
                                                        {bill.billNumber}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {new Date(bill.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                        isFullyPaid
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : bill.status === 'Partially Paid'
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {isFullyPaid && <CheckCircle2 className="w-3 h-3" />}
                                                    {bill.status === 'Partially Paid' && <Clock className="w-3 h-3" />}
                                                    {bill.status}
                                                </span>
                                            </div>

                                            {/* Patient & Dept Info */}
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{bill.patientName}</h4>
                                                <p className="text-xs text-gray-500">
                                                    MRN: <span className="font-mono text-gray-700">{bill.patientMrn}</span> • {bill.department} ({bill.encounterType})
                                                </p>
                                            </div>

                                            {/* Financial Overview Grid */}
                                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                                                <div>
                                                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Total</span>
                                                    <span className="font-mono font-bold text-gray-900">
                                                        {convertAndFormat(bill.totalAmount, bill.currency, currentCurrency)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Paid</span>
                                                    <span className="font-mono font-bold text-emerald-700">
                                                        {convertAndFormat(bill.totalPaid, bill.currency, currentCurrency)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Balance Due</span>
                                                    <span className={`font-mono font-bold ${bill.remainingBalance > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                                                        {convertAndFormat(bill.remainingBalance, bill.currency, currentCurrency)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Applied Tenders Chips */}
                                            {bill.tenders.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {bill.tenders.map((tender) => (
                                                        <span
                                                            key={tender.id}
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                                tender.type === 'insurance'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : tender.type === 'mobile_money'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : tender.type === 'cash'
                                                                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                                                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                                            }`}
                                                        >
                                                            {tender.type === 'insurance' && <Shield className="w-2.5 h-2.5" />}
                                                            {tender.type === 'mobile_money' && <Smartphone className="w-2.5 h-2.5" />}
                                                            {tender.type === 'cash' && <Banknote className="w-2.5 h-2.5" />}
                                                            {tender.type === 'card' && <CreditCard className="w-2.5 h-2.5" />}
                                                            <span>
                                                                {tender.type === 'insurance' ? 'Ins' : tender.type === 'mobile_money' ? 'Mobile Money' : tender.type === 'cash' ? 'Cash' : 'Card'} {convertAndFormat(tender.convertedAmount, bill.currency, currentCurrency)}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Mobile Action Buttons */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => handleOpenReceipt(bill)}
                                                    className="flex-1 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                    Receipt
                                                </button>
                                                <button
                                                    onClick={() => handleOpenCheckout(bill)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                                                        isFullyPaid
                                                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                            : 'bg-primary hover:bg-primary/90 text-white'
                                                    }`}
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                    {isFullyPaid ? 'Add Tender' : 'Collect POS'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* DESKTOP VIEW: Responsive Table for md+ Screens */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Bill # & Date</th>
                                        <th className="py-3 px-4">Patient & MRN</th>
                                        <th className="py-3 px-4">Department</th>
                                        <th className="py-3 px-4 text-right">Total Obligation</th>
                                        <th className="py-3 px-4 text-right">Paid & Remaining</th>
                                        <th className="py-3 px-4">Split Tenders</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {filteredPatientBills.map((bill) => {
                                        const isFullyPaid = bill.status === 'Paid in Full';
                                        const paidPct =
                                            bill.totalAmount > 0
                                                ? Math.round((bill.totalPaid / bill.totalAmount) * 100)
                                                : 0;

                                        return (
                                            <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-mono font-bold text-gray-900">
                                                        {bill.billNumber}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(bill.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-900">{bill.patientName}</div>
                                                    <div className="font-mono text-gray-400 text-[10px]">
                                                        {bill.patientMrn} {bill.patientPhone && `• ${bill.patientPhone}`}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-gray-800">{bill.department}</div>
                                                    <div className="text-gray-400 text-[10px]">{bill.encounterType}</div>
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 text-sm">
                                                    {convertAndFormat(bill.totalAmount, bill.currency, currentCurrency)}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="font-mono font-bold text-emerald-700">
                                                        {convertAndFormat(bill.totalPaid, bill.currency, currentCurrency)}
                                                    </div>
                                                    {bill.remainingBalance > 0 && (
                                                        <div className="font-mono font-bold text-rose-600 text-[11px]">
                                                            Due: {convertAndFormat(bill.remainingBalance, bill.currency, currentCurrency)}
                                                        </div>
                                                    )}
                                                    <div className="w-20 ml-auto mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${
                                                                isFullyPaid ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, paidPct)}%` }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Split Tenders Visual Stack */}
                                                <td className="py-3.5 px-4">
                                                    {bill.tenders.length === 0 ? (
                                                        <span className="text-[11px] text-gray-400 italic">
                                                            No tenders recorded
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {bill.tenders.map((tender) => (
                                                                <span
                                                                    key={tender.id}
                                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                                        tender.type === 'insurance'
                                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                            : tender.type === 'mobile_money'
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                            : tender.type === 'cash'
                                                                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                                                                            : 'bg-purple-50 text-purple-700 border-purple-200'
                                                                    }`}
                                                                    title={`${tender.label}: ${convertAndFormat(
                                                                        tender.convertedAmount,
                                                                        bill.currency,
                                                                        currentCurrency
                                                                    )}`}
                                                                >
                                                                    {tender.type === 'insurance' && (
                                                                        <Shield className="w-2.5 h-2.5" />
                                                                    )}
                                                                    {tender.type === 'mobile_money' && (
                                                                        <Smartphone className="w-2.5 h-2.5" />
                                                                    )}
                                                                    {tender.type === 'cash' && (
                                                                        <Banknote className="w-2.5 h-2.5" />
                                                                    )}
                                                                    {tender.type === 'card' && (
                                                                        <CreditCard className="w-2.5 h-2.5" />
                                                                    )}
                                                                    <span>
                                                                        {tender.type === 'insurance'
                                                                            ? 'Ins'
                                                                            : tender.type === 'mobile_money'
                                                                            ? 'Mobile Money'
                                                                            : tender.type === 'cash'
                                                                            ? 'Cash'
                                                                            : 'Card'}{' '}
                                                                        {convertAndFormat(
                                                                            tender.convertedAmount,
                                                                            bill.currency,
                                                                            currentCurrency
                                                                        )}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Settlement Status */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            bill.status === 'Paid in Full'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : bill.status === 'Partially Paid'
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}
                                                    >
                                                        {bill.status === 'Paid in Full' && (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        )}
                                                        {bill.status === 'Partially Paid' && (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {bill.status}
                                                    </span>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenReceipt(bill)}
                                                            className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-1"
                                                            title="Print or view itemized receipt"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                            Receipt
                                                        </button>

                                                        {isFullyPaid && (
                                                            <button
                                                                onClick={() => handleOpenGatepassForBill(bill)}
                                                                className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                                                                title="Issue or view official hospital discharge gatepass"
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>Gatepass</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleOpenCheckout(bill)}
                                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 ${
                                                                bill.status === 'Paid in Full'
                                                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                    : 'bg-primary hover:bg-primary/90 text-white'
                                                            }`}
                                                            title="Collect split payment"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5" />
                                                            {bill.status === 'Paid in Full' ? 'Add Tender' : 'Collect POS'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: DISCHARGE CLEARANCE & SECURITY GATEPASSES */}
            {activeTab === 'discharge_gatepass' && (
                <DischargeGatepassTab patientBills={patientBills} />
            )}

            {/* TAB 3: LIVE INTER-DEPARTMENT CHARGES FEED */}
            {activeTab === 'charges_feed' && (
                <DepartmentChargesFeedTab />
            )}

            {/* TAB 4: CLAIMS ADJUDICATION */}
            {activeTab === 'claims' && (
                <ClaimsAdjudicationTab
                    bills={patientBills}
                    onSelectBill={(bill) => handleOpenReceipt(bill)}
                />
            )}

            {/* TAB 3: HOSPITAL SAAS PLATFORM INVOICES */}
            {activeTab === 'saas_invoices' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">Hospital Licensing & B2B Invoices</h3>
                                <p className="text-xs text-gray-500">
                                    Quarterly and annual SaaS subscriptions for partner health systems.
                                </p>
                            </div>

                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                                {['ALL', InvoiceStatus.Paid, InvoiceStatus.Pending, InvoiceStatus.Overdue].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setSaasStatusFilter(st)}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                                            saasStatusFilter === st
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {st === 'ALL' ? 'All Invoices' : st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MOBILE FIRST: Invoice Cards for small screens */}
                        <div className="block md:hidden divide-y divide-gray-200">
                            {saasInvoices
                                .filter((inv) => saasStatusFilter === 'ALL' || inv.status === saasStatusFilter)
                                .map((inv) => (
                                    <div key={inv.id} className="p-4 space-y-2 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-xs text-gray-900">{inv.id}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    inv.status === InvoiceStatus.Paid
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : inv.status === InvoiceStatus.Pending
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                {inv.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{inv.tenant?.name || 'Healthcare Partner'}</h4>
                                                <span className="text-[11px] text-gray-500">
                                                    {inv.tenant?.subscriptionPlan || 'Enterprise Tier'} • Due: {formatDate(new Date(inv.dueDate), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-sm text-gray-900">
                                                    {convertAndFormat(inv.amount, 'USD', currentCurrency)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Invoice ID</th>
                                        <th className="py-3 px-4">Hospital Tenant</th>
                                        <th className="py-3 px-4">Plan Tier</th>
                                        <th className="py-3 px-4 text-right">Obligation ({currentCurrency})</th>
                                        <th className="py-3 px-4">Due Date</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {saasInvoices
                                        .filter((inv) => saasStatusFilter === 'ALL' || inv.status === saasStatusFilter)
                                        .map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 font-mono font-bold text-gray-900">
                                                    {inv.id}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-gray-900">
                                                    {inv.tenant?.name || 'Healthcare Partner'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                                                        {inv.tenant?.subscriptionPlan || 'Enterprise Tier'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 text-sm">
                                                    {convertAndFormat(inv.amount, 'USD', currentCurrency)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(new Date(inv.dueDate), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        inv.status === InvoiceStatus.Paid
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : inv.status === InvoiceStatus.Pending
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        Download PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: HEALTHCARE NETWORK LICENSING & FACILITY SUBSCRIPTIONS */}
            {activeTab === 'facility_licensing' && (
                <div className="space-y-6">
                    {/* Console Header & KPIs */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900">
                                        Hospital & Healthcare System Network Licensing
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                        Super Admin Desk
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Automated activation (Mobile Money STK / Card) and swift wire verification for clinics, ambulatory surgery centers, and regional hospital networks.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setEmailAuditModalOpen(true)}
                                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Dispatched Emails Audit</span>
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
                                        {getDispatchedEmails().length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setShowWireSettingsCard(!showWireSettingsCard)}
                                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                                >
                                    <Landmark className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{showWireSettingsCard ? 'Hide Wire Details' : 'Super Admin Bank Coordinates'}</span>
                                </button>

                                <button
                                    onClick={() => setSubscriptionCheckoutModalOpen(true)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>License New Medical Facility</span>
                                </button>
                            </div>
                        </div>

                        {/* Fast KPI Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-500 text-[11px] block">Total Subscribers</span>
                                <span className="text-lg font-bold text-slate-900">{tenantList.length}</span>
                            </div>
                            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                <span className="text-emerald-700 text-[11px] block">Active Accounts</span>
                                <span className="text-lg font-bold text-emerald-800">
                                    {tenantList.filter((t) => t.activationStatus === 'Active' || t.status === TenantStatus.Active).length}
                                </span>
                            </div>
                            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                                <span className="text-amber-800 text-[11px] block">Pending Wire Activation</span>
                                <span className="text-lg font-bold text-amber-900">
                                    {tenantList.filter((t) => t.activationStatus === 'Pending Activation' || t.paymentStatus === 'Pending').length}
                                </span>
                            </div>
                            <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                                <span className="text-teal-700 text-[11px] block">Instant Payment Channels</span>
                                <span className="text-sm font-bold text-teal-900 mt-1 block">Mobile Money STK & Stripe Card</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Wire Transfer Action Alert */}
                    {tenantList.some((t) => t.activationStatus === 'Pending Activation' || t.paymentStatus === 'Pending') && (
                        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl shadow-2xs space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-amber-950">
                                            Pending Wire Transfer Activation Request
                                        </h4>
                                        <p className="text-xs text-amber-800 mt-0.5">
                                            A subscriber has completed invoice generation and is awaiting manual bank verification. Per system policy: upon verifying bank receipt, activate the account to automatically dispatch initial login credentials.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {tenantList
                                    .filter((t) => t.activationStatus === 'Pending Activation' || t.paymentStatus === 'Pending')
                                    .map((pendingT) => (
                                        <div
                                            key={pendingT.id}
                                            className="bg-white rounded-lg p-3 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{pendingT.name}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                        Awaiting Wire Clearance
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] mt-0.5">
                                                    Plan: <strong>{pendingT.subscriptionPlan || 'Starter Clinic'}</strong> • Email: <strong>{pendingT.email}</strong> • Phone: {pendingT.phone}
                                                    {pendingT.paymentReference && (
                                                        <span> • Ref: <code className="text-amber-900 font-mono font-bold">{pendingT.paymentReference}</code></span>
                                                    )}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedTenantForWireActivation(pendingT);
                                                    setManualActivationModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Verify Wire & Manually Activate</span>
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Optional Wire Transfer Settings View */}
                    {showWireSettingsCard && (
                        <div>
                            <WireTransferSettingsCard />
                        </div>
                    )}

                    {/* Subscriptions Directory Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Registered Institutional Subscriptions</h4>
                                <p className="text-xs text-slate-500">
                                    Complete list of subscribed schools, academies, clinics, and hospital facilities.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                Total: {tenantList.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Institution / School</th>
                                        <th className="py-3 px-4">Contact / Administrator</th>
                                        <th className="py-3 px-4">Tier & Billing</th>
                                        <th className="py-3 px-4">Payment Channel</th>
                                        <th className="py-3 px-4">Payment Status</th>
                                        <th className="py-3 px-4">Activation Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {tenantList.map((t) => {
                                        const isPendingWire =
                                            t.activationStatus === 'Pending Activation' ||
                                            (t.paymentMethodType === 'wire' && t.paymentStatus === 'Pending');

                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900">{t.name}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {t.institutionType || 'Medical Facility'} • {t.address || 'New York, USA'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-medium text-slate-900">{t.email}</div>
                                                    <div className="text-[11px] text-slate-400">{t.phone}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                                                        {t.subscriptionPlan || 'Starter Clinic'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                        {(t as any).billingCycle || 'Annual'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {t.paymentMethodType === 'mobile_money' ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                                            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Mobile Money STK</span>
                                                        </span>
                                                    ) : t.paymentMethodType === 'card' ? (
                                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                                                            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                                            <span>Stripe Card</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold">
                                                            <Landmark className="w-3.5 h-3.5 text-amber-600" />
                                                            <span>Bank Wire</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            t.paymentStatus === 'Paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                        }`}
                                                    >
                                                        {t.paymentStatus === 'Paid' ? (
                                                            <>
                                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                                <span>Paid</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-2.5 h-2.5" />
                                                                <span>Pending Payment</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {isPendingWire ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                            <Clock className="w-3 h-3 text-amber-700" />
                                                            <span>Pending Activation</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>Active</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {isPendingWire ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTenantForWireActivation(t);
                                                                setManualActivationModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Activate</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEmailAuditModalOpen(true)}
                                                            className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium inline-flex items-center gap-1"
                                                        >
                                                            <Mail className="w-3 h-3 text-slate-500" />
                                                            <span>Audit Log</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: MOBILE MONEY & POS CHANNELS */}
            {activeTab === 'channels' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Mobile Payment Gateway</h4>
                                <p className="text-xs text-emerald-600 font-semibold">STK Push API v2.1 Connected</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            Direct integration with Mobile Payment Gateway API. Triggers instant USSD STK prompt to patient handset at cashier desk with automated transaction code verification.
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Active Paybill / Till:</span>
                                <span className="font-mono font-bold text-gray-800">174379</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Average Callback Latency:</span>
                                <span className="font-mono font-bold text-emerald-700">1.2 seconds</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Daily Clearing Volume:</span>
                                <span className="font-mono font-bold text-gray-800">KES 4,890,000</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">SHA & Private Insurance Clearinghouse</h4>
                                <p className="text-xs text-blue-600 font-semibold">EDI 837 / 835 Real-Time Gateway</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            Real-time pre-authorization validation and claims adjudication for Social Health Authority (National Health Insurance) and private insurers (Jubilee, Aetna, Cigna, BCBS).
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Claim Auto-Approval:</span>
                                <span className="font-mono font-bold text-emerald-700">92.4%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Connected Payers:</span>
                                <span className="font-mono font-bold text-gray-800">8 Health Funds</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payer Settlement Cycle:</span>
                                <span className="font-mono font-bold text-gray-800">Net 14 Days</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Hospital POS Merchant Terminals</h4>
                                <p className="text-xs text-purple-600 font-semibold">EMV Chip & Contactless Active</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            Integrated wireless credit and debit card terminals across central reception, emergency triage, and inpatient pharmacy cashier stations.
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Active Terminals:</span>
                                <span className="font-mono font-bold text-gray-800">6 Terminals Online</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Supported Cards:</span>
                                <span className="font-mono font-bold text-gray-800">Visa, MC, Amex, Verve</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">End-of-Day Auto Batch:</span>
                                <span className="font-mono font-bold text-emerald-700">Enabled (23:59 EAT)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: Multi-Tender Split POS Checkout Modal */}
            <MultiTenderCheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                bill={selectedBillForCheckout}
                onPaymentCompleted={handlePaymentCompleted}
            />

            {/* MODAL 2: Itemized Multi-Tender Patient Receipt & Tax Invoice */}
            <ItemizedBillReceiptModal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                bill={selectedBillForReceipt}
            />

            {/* MODAL 3: Super Admin Manual Wire Transfer Activation Modal */}
            <ManualWireActivationModal
                isOpen={manualActivationModalOpen}
                onClose={() => {
                    setManualActivationModalOpen(false);
                    setSelectedTenantForWireActivation(null);
                }}
                tenant={selectedTenantForWireActivation}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['tenants'] });
                }}
            />

            {/* MODAL 4: Dispatched Emails & Receipts Audit Log */}
            <DispatchedEmailsAuditModal
                isOpen={emailAuditModalOpen}
                onClose={() => setEmailAuditModalOpen(false)}
            />

            {/* MODAL 5: Subscribe New Healthcare Institution */}
            <SubscriptionCheckoutModal
                isOpen={subscriptionCheckoutModalOpen}
                onClose={() => setSubscriptionCheckoutModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['tenants'] });
                }}
            />

            {/* MODAL 6: Patient Discharge Clearance & Security Gatepass Modal */}
            <DischargeGatepassModal
                isOpen={gatepassModalOpen}
                gatepass={selectedGatepass}
                onClose={() => setGatepassModalOpen(false)}
            />
        </div>
    );
};
