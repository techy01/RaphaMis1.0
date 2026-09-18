import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Smartphone,
    Landmark,
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    FileText,
    Download,
    Printer,
    ArrowRight,
    Lock,
    Copy,
    Check,
    Building2,
    Mail,
    Phone,
    MapPin,
    Sparkles,
    Calendar,
    ChevronRight,
    Send,
    ExternalLink,
} from 'lucide-react';
import {
    SubscriptionTier,
    BillingCycle,
    SubscriptionPaymentChannel,
    SubscriptionReceipt,
    WireTransferInvoice,
    Tenant,
} from '../../packages/shared/types';
import {
    processSubscriptionCheckout,
    getPlanPricing,
} from '../../api/subscriptionCheckoutApi';
import { getWireTransferSettings } from '../../api/wireTransferApi';
import { useNavigate } from 'react-router-dom';

interface SubscriptionCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTier?: SubscriptionTier;
    initialBillingCycle?: BillingCycle;
    onSuccess?: (tenant: Tenant) => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
    isOpen,
    onClose,
    initialTier = 'Starter Clinic',
    initialBillingCycle = 'Annually',
    onSuccess,
}) => {
    const navigate = useNavigate();

    // Step management: 'details' | 'payment' | 'stk_phone_prompt' | 'success'
    const [step, setStep] = useState<'details' | 'payment' | 'stk_phone_prompt' | 'success'>('details');

    // Institution Form
    const [tier, setTier] = useState<SubscriptionTier>(initialTier);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialBillingCycle);
    const [tenantName, setTenantName] = useState('');
    const [institutionType, setInstitutionType] = useState<
        'School / Academy / University' | 'Outpatient Clinic / Medical Center' | 'Hospital / Inpatient Facility' | 'Health Network'
    >('School / Academy / University');
    const [contactPerson, setContactPerson] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('0720935895');
    const [address, setAddress] = useState('New York, USA');

    // Payment channel selection: 'mobile_money' | 'card' | 'wire'
    const [paymentChannel, setPaymentChannel] = useState<SubscriptionPaymentChannel>('mobile_money');

    // Mobile Money state
    const [mobileMoneyPhone, setMpesaPhone] = useState('0720935895');
    const [stkSimulating, setStkSimulating] = useState(false);
    const [stkPin, setStkPin] = useState('');
    const [stkError, setStkError] = useState<string | null>(null);

    // Card (Stripe) state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [cardZip, setCardZip] = useState('00100');
    const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');

    // Processing & Outcomes
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<SubscriptionReceipt | null>(null);
    const [wireInvoice, setWireInvoice] = useState<WireTransferInvoice | null>(null);
    const [initialCredentials, setInitialCredentials] = useState<{
        loginEmail: string;
        temporaryPassword?: string;
        loginUrl: string;
    } | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [copiedCredentials, setCopiedCredentials] = useState(false);

    // Calculate pricing
    const pricing = getPlanPricing(tier, billingCycle);

    useEffect(() => {
        if (isOpen) {
            setTier(initialTier);
            setBillingCycle(initialBillingCycle);
            setStep('details');
            setReceipt(null);
            setWireInvoice(null);
            setInitialCredentials(null);
            setCheckoutError(null);
        }
    }, [isOpen, initialTier, initialBillingCycle]);

    if (!isOpen) return null;

    // Detect card brand
    const handleCardNumberChange = (val: string) => {
        const clean = val.replace(/\D/g, '').slice(0, 16);
        const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
        if (clean.startsWith('4')) setCardBrand('Visa');
        else if (clean.startsWith('5')) setCardBrand('Mastercard');
        else if (clean.startsWith('3')) setCardBrand('Amex');
    };

    const fillStripeTestCard = () => {
        setCardNumber('4242 4242 4242 4242');
        setCardExpiry('12/28');
        setCardCvc('884');
        setCardholderName(contactPerson || 'School Principal / Administrator');
        setCardZip('00100');
        setCardBrand('Visa');
    };

    // Step 1: Validate details and move to Payment Step
    const handleProceedToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantName.trim() || !contactPerson.trim() || !contactEmail.trim() || !contactPhone.trim()) {
            setCheckoutError('Please fill in all required institutional profile fields.');
            return;
        }
        setCheckoutError(null);
        setStep('payment');
    };

    // Step 2: Handle Mobile Money STK Trigger
    const handleTriggerMpesaStk = () => {
        if (!mobileMoneyPhone.trim()) {
            setCheckoutError('Please enter a valid Mobile Money phone number for STK Push.');
            return;
        }
        setStkSimulating(true);
        setStkError(null);
        setStkPin('');
        setStep('stk_phone_prompt');
    };

    // Confirm STK Push on simulated phone prompt
    const handleAuthorizeStkPrompt = async () => {
        if (!stkPin || stkPin.length < 4) {
            setStkError('Please enter your 4-digit Mobile Money PIN.');
            return;
        }
        setIsProcessing(true);
        setStkError(null);

        try {
            const res = await processSubscriptionCheckout({
                tenantName,
                institutionType,
                contactPerson,
                contactEmail,
                contactPhone,
                address,
                tier,
                billingCycle,
                paymentMethod: 'mobile_money',
                mobileMoneyPhone,
            });

            setReceipt(res.receipt || null);
            setInitialCredentials(res.initialCredentials || null);
            setStatusMessage(res.statusMessage);
            setStep('success');
            if (onSuccess) onSuccess(res.tenant);
        } catch (err: any) {
            setStkError(err.message || 'Mobile Money payment verification failed. Please try again.');
        } finally {
            setIsProcessing(false);
            setStkSimulating(false);
        }
    };

    // Step 2: Handle Card (Stripe) Payment
    const handleProcessCardPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cardNumber.replace(/\s/g, '').length < 16) {
            setCheckoutError('Please enter a valid 16-digit card number.');
            return;
        }
        if (!cardExpiry.includes('/')) {
            setCheckoutError('Please enter card expiry in MM/YY format.');
            return;
        }

        setIsProcessing(true);
        setCheckoutError(null);
        try {
            const res = await processSubscriptionCheckout({
                tenantName,
                institutionType,
                contactPerson,
                contactEmail,
                contactPhone,
                address,
                tier,
                billingCycle,
                paymentMethod: 'card',
                cardDetails: {
                    cardNumber,
                    cardExpMonth: cardExpiry.split('/')[0],
                    cardExpYear: cardExpiry.split('/')[1],
                    cardCvc,
                    cardholderName,
                    postalCode: cardZip,
                    brand: cardBrand,
                    last4: cardNumber.replace(/\s/g, '').slice(-4),
                },
            });

            setReceipt(res.receipt || null);
            setInitialCredentials(res.initialCredentials || null);
            setStatusMessage(res.statusMessage);
            setStep('success');
            if (onSuccess) onSuccess(res.tenant);
        } catch (err: any) {
            setCheckoutError(err.message || 'Card authorization failed. Please verify details.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Step 2: Handle Wire Transfer
    const handleProcessWireTransfer = async () => {
        setIsProcessing(true);
        setCheckoutError(null);
        try {
            const res = await processSubscriptionCheckout({
                tenantName,
                institutionType,
                contactPerson,
                contactEmail,
                contactPhone,
                address,
                tier,
                billingCycle,
                paymentMethod: 'wire',
            });

            setWireInvoice(res.wireInvoice || null);
            setStatusMessage(res.statusMessage);
            setStep('success');
            if (onSuccess) onSuccess(res.tenant);
        } catch (err: any) {
            setCheckoutError(err.message || 'Failed to submit wire transfer subscription request.');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyCredentials = () => {
        if (!initialCredentials) return;
        const text = `RaphaMIS Login Details:\nPortal: ${window.location.origin}/login\nUsername: ${initialCredentials.loginEmail}\nPassword: ${initialCredentials.temporaryPassword}`;
        navigator.clipboard.writeText(text);
        setCopiedCredentials(true);
        setTimeout(() => setCopiedCredentials(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-auto">
                {/* Modal Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-white">
                                {step === 'success'
                                    ? paymentChannel === 'wire'
                                        ? 'Subscription Request Submitted'
                                        : 'Account Activated Successfully!'
                                    : 'Subscribe to RaphaMIS'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                Institutional Onboarding • Multi-Channel Billing
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Indicators */}
                {step !== 'success' && (
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                    step === 'details'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                }`}
                            >
                                1
                            </span>
                            <span className={step === 'details' ? 'font-bold text-slate-900' : 'text-slate-500'}>
                                Institution Profile & Plan
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                    step === 'payment' || step === 'stk_phone_prompt'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                                2
                            </span>
                            <span
                                className={
                                    step === 'payment' || step === 'stk_phone_prompt'
                                        ? 'font-bold text-slate-900'
                                        : 'text-slate-500'
                                }
                            >
                                Payment Channel
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                                3
                            </span>
                            <span className="text-slate-500">Receipt / Activation</span>
                        </div>
                    </div>
                )}

                {/* STEP 1: Details & Plan Selection */}
                {step === 'details' && (
                    <form onSubmit={handleProceedToPayment} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                        {checkoutError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{checkoutError}</span>
                            </div>
                        )}

                        {/* Plan & Cycle Picker */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Select Subscription Tier
                                    </h4>
                                    <p className="text-[11px] text-slate-500">
                                        Tailored for schools, clinics, and hospital networks.
                                    </p>
                                </div>
                                {/* Billing cycle toggle */}
                                <div className="inline-flex bg-white rounded-lg p-1 border border-slate-200 shadow-2xs self-start sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('Monthly')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                            billingCycle === 'Monthly'
                                                ? 'bg-teal-600 text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('Annually')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                                            billingCycle === 'Annually'
                                                ? 'bg-teal-600 text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>Annual</span>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                            Save 20%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    {
                                        tier: 'Starter Clinic' as SubscriptionTier,
                                        label: 'Starter / School Clinic',
                                        kes: billingCycle === 'Annually' ? 'KES 22,000 /mo' : 'KES 25,000 /mo',
                                        usd: billingCycle === 'Annually' ? '$179 /mo' : '$199 /mo',
                                        beds: 'Up to 50 beds / 15 staff',
                                    },
                                    {
                                        tier: 'Community Hospital' as SubscriptionTier,
                                        label: 'Standard / Academy',
                                        kes: billingCycle === 'Annually' ? 'KES 58,000 /mo' : 'KES 65,000 /mo',
                                        usd: billingCycle === 'Annually' ? '$449 /mo' : '$499 /mo',
                                        beds: 'Up to 250 beds / 60 staff',
                                        badge: 'Popular',
                                    },
                                    {
                                        tier: 'Enterprise Health System' as SubscriptionTier,
                                        label: 'Enterprise Network',
                                        kes: billingCycle === 'Annually' ? 'KES 130,000 /mo' : 'KES 150,000 /mo',
                                        usd: billingCycle === 'Annually' ? '$999 /mo' : '$1,199 /mo',
                                        beds: 'Up to 800 beds / 200 staff',
                                    },
                                ].map((p) => (
                                    <div
                                        key={p.tier}
                                        onClick={() => setTier(p.tier)}
                                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                                            tier === p.tier
                                                ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        {p.badge && (
                                            <span className="absolute -top-2 right-3 text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase">
                                                {p.badge}
                                            </span>
                                        )}
                                        <p className="font-bold text-xs text-slate-900">{p.label}</p>
                                        <p className="text-sm font-extrabold text-teal-700 mt-1">{p.kes}</p>
                                        <p className="text-[11px] text-slate-500">{p.usd}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                                            {p.beds}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Institutional Profile Fields */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Institutional Profile & Administrator
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        School / Institution Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={tenantName}
                                        onChange={(e) => setTenantName(e.target.value)}
                                        placeholder="e.g. St. Mary's Academy & Infirmary"
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Institution Category *
                                    </label>
                                    <select
                                        value={institutionType}
                                        onChange={(e: any) => setInstitutionType(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
                                    >
                                        <option value="School / Academy / University">School / Academy / University</option>
                                        <option value="Outpatient Clinic / Medical Center">Outpatient Clinic / Medical Center</option>
                                        <option value="Hospital / Inpatient Facility">Hospital / Inpatient Facility</option>
                                        <option value="Health Network">Health Network / Education Trust</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Principal / Administrator Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="e.g. Dr. Peter Kamau"
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Official Administrator Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="e.g. admin@stmarysacademy.ac.ke"
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Receipts, invoices, and login credentials will be delivered here.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Official Contact Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="e.g. 0720935895"
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Campus Physical Address / Location
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. Ngong Road, Nairobi"
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <span className="text-xs text-slate-500 font-medium">
                                Total: <strong className="text-slate-900 font-bold">KES {pricing.totalKes.toLocaleString()}</strong> ({pricing.totalUsd.toLocaleString()} USD)
                            </span>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                            >
                                <span>Continue to Payment Options</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 2: Payment Option Selection */}
                {step === 'payment' && (
                    <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                        {checkoutError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{checkoutError}</span>
                            </div>
                        )}

                        {/* Order Summary banner */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                                <span className="text-[11px] text-teal-700 font-semibold uppercase tracking-wider">
                                    {institutionType}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{tenantName}</h4>
                                <p className="text-slate-500 text-[11px]">
                                    {tier} • {billingCycle} Billing • {contactEmail}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Amount Due</p>
                                <p className="text-base font-extrabold text-teal-700">
                                    KES {pricing.totalKes.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-400">${pricing.totalUsd} USD</p>
                            </div>
                        </div>

                        {/* Channel Selection Tabs */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                                Select Payment Method:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Mobile Money Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentChannel('mobile_money')}
                                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                        paymentChannel === 'mobile_money'
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                            <Smartphone className="w-4 h-4" />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                            Instant
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900">Mobile Money STK Push</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Direct Telecom Provider prompt on phone. Instant account activation.
                                    </p>
                                </button>

                                {/* Card / Stripe Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentChannel('card')}
                                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                        paymentChannel === 'card'
                                            ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-400'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                            <CreditCard className="w-4 h-4" />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                                            Stripe / Card
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900">Credit / Debit Card</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Visa, Mastercard, Amex. Instant account activation.
                                    </p>
                                </button>

                                {/* Wire Transfer Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentChannel('wire')}
                                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                        paymentChannel === 'wire'
                                            ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-400'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                                            <Landmark className="w-4 h-4" />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                            Invoice / EFT
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900">Bank Wire Transfer</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Generates official invoice. Super Admin verifies & activates.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Channel Specific Forms */}

                        {/* 1. Mobile Money Form */}
                        {paymentChannel === 'mobile_money' && (
                            <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-200 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-900">Mobile Money Express (STK Push)</h5>
                                        <p className="text-[11px] text-slate-600">
                                            Amount: <strong>KES {pricing.totalKes.toLocaleString()}</strong> to Paybill <strong>174379</strong>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mobile Number for STK Push *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={mobileMoneyPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="e.g. 0720935895 or 254720935895"
                                            className="w-full pl-3 pr-20 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600">
                                            Telecom Provider
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Upon clicking, you will receive a prompt on your phone screen to enter your Mobile Money PIN.
                                    </p>
                                </div>

                                <div className="p-3 bg-emerald-100/50 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Instant Activation Guarantee:</strong> As soon as you enter your PIN, the account is activated immediately and a formal receipt with credentials is sent to <strong>{contactEmail}</strong>.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTriggerMpesaStk}
                                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span>Send Mobile Money STK Push Prompt (KES {pricing.totalKes.toLocaleString()})</span>
                                </button>
                            </div>
                        )}

                        {/* 2. Stripe / Card Form */}
                        {paymentChannel === 'card' && (
                            <form onSubmit={handleProcessCardPayment} className="bg-indigo-50/40 rounded-xl p-5 border border-indigo-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <CreditCard className="w-5 h-5 text-indigo-600" />
                                        <span className="text-xs font-bold text-slate-900">Stripe Card Processing</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={fillStripeTestCard}
                                        className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-md transition-colors"
                                    >
                                        Auto-Fill Test Card
                                    </button>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Card Number *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={cardNumber}
                                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                                placeholder="4242 4242 4242 4242"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-indigo-600 uppercase">
                                                {cardBrand}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Expiry (MM/YY) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                placeholder="12/28"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">CVC / CVV *</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={4}
                                                value={cardCvc}
                                                onChange={(e) => setCardCvc(e.target.value)}
                                                placeholder="884"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Postal / ZIP *</label>
                                            <input
                                                type="text"
                                                required
                                                value={cardZip}
                                                onChange={(e) => setCardZip(e.target.value)}
                                                placeholder="00100"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Cardholder Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={cardholderName}
                                            onChange={(e) => setCardholderName(e.target.value)}
                                            placeholder="Principal / Administrator Name"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-indigo-100/50 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
                                    <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <span>
                                        256-bit SSL encrypted. Card payment triggers <strong>instant account activation</strong> and sends an official payment receipt to <strong>{contactEmail}</strong>.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>
                                        {isProcessing
                                            ? 'Authorizing Card...'
                                            : `Pay $${pricing.totalUsd} USD (KES ${pricing.totalKes.toLocaleString()}) & Activate Instantly`}
                                    </span>
                                </button>
                            </form>
                        )}

                        {/* 3. Wire Transfer Form */}
                        {paymentChannel === 'wire' && (
                            <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-2xs">
                                        <Landmark className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-900">Bank Wire Transfer / EFT Settlement</h5>
                                        <p className="text-[11px] text-slate-600">
                                            Official payment invoice generated using Super Admin bank account details.
                                        </p>
                                    </div>
                                </div>

                                {/* Super Admin Wire Transfer Bank Details Preview */}
                                <div className="bg-white rounded-xl p-4 border border-amber-200/80 space-y-2 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-sm">
                                        Designated Super Admin Bank Details
                                    </span>
                                    {(() => {
                                        const adminBank = getWireTransferSettings();
                                        return (
                                            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                                                <div>
                                                    <span className="text-slate-400 text-[10px] block">Bank Name</span>
                                                    <span className="font-semibold text-slate-800">{adminBank.bankName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] block">Account Number</span>
                                                    <span className="font-bold text-slate-900">{adminBank.accountNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] block">Account Name</span>
                                                    <span className="font-semibold text-slate-800">{adminBank.accountName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] block">SWIFT / BIC Code</span>
                                                    <span className="font-bold text-slate-900">{adminBank.swiftBic}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Important Wire Notice per prompt instructions */}
                                <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                        <Clock className="w-4 h-4 text-amber-700" />
                                        Subscription Request Submission Flow:
                                    </p>
                                    <p className="text-[11px] leading-relaxed">
                                        Upon clicking below, a formal payment invoice will be generated. The system will display the confirmation:
                                    </p>
                                    <p className="p-2 bg-white/80 rounded-md font-bold text-amber-900 border border-amber-300 text-center">
                                        "Subscription request submitted. Wait for an activation email."
                                    </p>
                                    <p className="text-[11px] leading-relaxed text-amber-800">
                                        When you pay as per the wire transfer details in the invoice, the Super Admin will manually verify funds and activate the account, and your initial login email and password details will be sent to <strong>{contactEmail}</strong>.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleProcessWireTransfer}
                                    disabled={isProcessing}
                                    className="w-full py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>
                                        {isProcessing
                                            ? 'Generating Payment Invoice...'
                                            : `Generate Payment Invoice for KES ${pricing.totalKes.toLocaleString()}`}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Back button */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                ← Back to Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2.5: Realistic Mobile Money Phone Screen Simulator Modal */}
                {step === 'stk_phone_prompt' && (
                    <div className="p-6 flex flex-col items-center justify-center space-y-4">
                        <div className="text-center">
                            <h4 className="font-bold text-base text-slate-900">Telecom Provider SIM Toolkit Prompt</h4>
                            <p className="text-xs text-slate-500">
                                Check your phone screen for the Mobile Money STK Push notification
                            </p>
                        </div>

                        {/* Phone Screen Mockup */}
                        <div className="w-full max-w-xs bg-slate-900 rounded-3xl p-3 shadow-2xl border-4 border-slate-800">
                            {/* Screen */}
                            <div className="bg-slate-100 rounded-2xl p-4 text-slate-900 space-y-3 font-sans shadow-inner">
                                <div className="text-center pb-2 border-b border-slate-300">
                                    <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
                                        M-PESA
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <p className="font-medium text-slate-800 text-[11px] leading-snug">
                                        Do you want to pay <strong>KES {pricing.totalKes.toLocaleString()}</strong> to{' '}
                                        <strong>Saaslink Technologies Ltd</strong> Paybill <strong>174379</strong> for{' '}
                                        <strong>{tenantName}</strong>?
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Enter Mobile Money PIN:
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        autoFocus
                                        value={stkPin}
                                        onChange={(e) => setStkPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••"
                                        className="w-full text-center text-lg tracking-widest px-3 py-1.5 border-2 border-emerald-500 rounded-lg bg-white font-mono"
                                    />
                                    <p className="text-[10px] text-slate-400 text-center mt-1">
                                        Simulated phone handset: enter any 4 digits (e.g. 1234)
                                    </p>
                                </div>

                                {stkError && (
                                    <div className="p-2 bg-rose-100 border border-rose-300 rounded text-[11px] text-rose-800 text-center">
                                        {stkError}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep('payment')}
                                        className="py-1.5 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={handleAuthorizeStkPrompt}
                                        className="py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Verifying...' : 'Authorize'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Push dispatched to: <strong className="text-slate-800 font-mono">{mobileMoneyPhone}</strong>
                        </p>
                    </div>
                )}

                {/* STEP 3: Outcome / Confirmation */}
                {step === 'success' && (
                    <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                        {/* A. Instant Activation (Mobile Money or Card) */}
                        {receipt && (
                            <div className="space-y-4">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Payment Verified & Account Activated!</h3>
                                    <p className="text-xs text-slate-600 max-w-lg mx-auto">
                                        {statusMessage}
                                    </p>
                                </div>

                                {/* Printable Payment Receipt Card */}
                                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                                        <div>
                                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-sm">
                                                Official Payment Receipt
                                            </span>
                                            <h4 className="font-bold text-base text-slate-900 mt-1">{receipt.tenantName}</h4>
                                            <p className="text-xs text-slate-500">Receipt #{receipt.receiptNumber} • Invoice #{receipt.invoiceNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-slate-400 block">Total Settled</span>
                                            <span className="text-lg font-black text-emerald-700">
                                                {receipt.currency} {receipt.amountPaid.toLocaleString()}
                                            </span>
                                            <span className="block text-[10px] text-slate-400">
                                                Ref: {receipt.transactionReference}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-400 text-[11px] block">Payment Channel</span>
                                            <span className="font-semibold text-slate-800 uppercase">
                                                {receipt.paymentMethod === 'mobile_money' ? 'Mobile Money STK Push' : 'Credit / Debit Card'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px] block">Subscribed Tier</span>
                                            <span className="font-semibold text-slate-800">{receipt.planTier}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px] block">Billing Cycle</span>
                                            <span className="font-semibold text-slate-800">{receipt.billingCycle}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px] block">Account Status</span>
                                            <span className="font-bold text-emerald-600">Active (Instant)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Initial Credentials Card */}
                                {initialCredentials && (
                                    <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                                                <Lock className="w-3.5 h-3.5" />
                                                Initial System Login Credentials
                                            </span>
                                            <button
                                                onClick={copyCredentials}
                                                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md"
                                            >
                                                {copiedCredentials ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-emerald-400">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 text-[11px] block">Staff / Admin Login Email</span>
                                                <span className="font-mono text-white font-semibold">{initialCredentials.loginEmail}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-[11px] block">Temporary Initial Password</span>
                                                <span className="font-mono text-amber-300 font-bold">{initialCredentials.temporaryPassword}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email dispatch note */}
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                        Official receipt and credentials copy dispatched to <strong>{receipt.subscriberEmail}</strong>.
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <button
                                        onClick={handlePrint}
                                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Print Receipt</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                navigate('/login');
                                            }}
                                            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5"
                                        >
                                            <span>Proceed to Login</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* B. Wire Transfer - Mandatory Alert Banner & Invoice */}
                        {wireInvoice && (
                            <div className="space-y-4">
                                {/* Mandatory Message from User Prompt */}
                                <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-md text-center space-y-1">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                                        Subscription request submitted. Wait for an activation email.
                                    </h3>
                                    <p className="text-xs text-amber-100 max-w-lg mx-auto">
                                        Your subscription request has been received with Invoice #{wireInvoice.invoiceNumber}. Please remit funds as per the Super Admin wire transfer details below.
                                    </p>
                                </div>

                                {/* Formal Printable Payment Invoice Card */}
                                <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
                                    {/* Invoice Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-sm">
                                                Official Payment Invoice
                                            </span>
                                            <h4 className="text-base font-bold text-slate-900 mt-1">{wireInvoice.tenantName}</h4>
                                            <p className="text-xs text-slate-500">
                                                Invoice #{wireInvoice.invoiceNumber} • Date: {wireInvoice.invoiceDate} • Due: {wireInvoice.dueDate}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <span className="text-xs text-slate-400 block">Total Amount Due</span>
                                            <span className="text-xl font-black text-amber-700">
                                                KES {wireInvoice.amountDue.toLocaleString()}
                                            </span>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                Awaiting Wire Transfer
                                            </span>
                                        </div>
                                    </div>

                                    {/* Wire Transfer Details (Picked dynamically from Super Admin) */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <Landmark className="w-4 h-4 text-teal-600" />
                                                Super Admin Bank Wire Settlement Coordinates
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-500">
                                                Reference: <strong>{wireInvoice.paymentReference}</strong>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">Bank Name</span>
                                                <span className="font-bold text-slate-900">{wireInvoice.wireTransferDetails.bankName}</span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">Account Name / Beneficiary</span>
                                                <span className="font-bold text-slate-900">{wireInvoice.wireTransferDetails.accountName}</span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">Account Number / IBAN</span>
                                                <span className="font-mono font-black text-slate-900 text-sm">
                                                    {wireInvoice.wireTransferDetails.accountNumber}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">SWIFT / BIC Code</span>
                                                <span className="font-mono font-bold text-slate-900">
                                                    {wireInvoice.wireTransferDetails.swiftBic}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">Branch & Clearing Code</span>
                                                <span className="font-medium text-slate-800">
                                                    {wireInvoice.wireTransferDetails.branchName} ({wireInvoice.wireTransferDetails.branchCode})
                                                </span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 text-[10px] block">Payment Narration / Reference</span>
                                                <span className="font-mono font-bold text-teal-700">
                                                    {wireInvoice.paymentReference}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                                            <strong>Payment Instructions:</strong> {wireInvoice.wireTransferDetails.paymentInstructions}
                                        </p>
                                    </div>

                                    {/* Workflow Explanation */}
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
                                        <p className="font-bold text-teal-950 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                            What Happens Next:
                                        </p>
                                        <ol className="list-decimal list-inside space-y-1 text-[11px] text-teal-800/90 pl-1">
                                            <li>Execute the wire transfer with your bank using the invoice coordinates above.</li>
                                            <li>Once the payment reflects, the <strong>Super Admin will manually activate your account</strong>.</li>
                                            <li>The <strong>initial email and password details will be sent to {wireInvoice.subscriberEmail}</strong> immediately upon activation.</li>
                                            <li>For rapid clearance, you may call our billing department at <strong>{wireInvoice.wireTransferDetails.supportPhone}</strong>.</li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Print Invoice</span>
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                                    >
                                        Acknowledge & Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
