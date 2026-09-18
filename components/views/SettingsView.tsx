import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatorModal } from '../security/AuthenticatorModal';
import { WireTransferSettingsCard } from '../subscription/WireTransferSettingsCard';
import { TenantBrandSettingsSection } from '../settings/TenantBrandSettingsSection';
import { getTwoFactorStatus } from '../../api/authApi';
import {
    Globe,
    RefreshCw,
    ShieldCheck,
    ArrowRightLeft,
    Sliders,
    Sparkles,
    CheckCircle2,
    DollarSign,
    Lock,
    Key,
    Smartphone,
    CreditCard,
    Layers,
    Save,
    ShieldAlert,
    QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsSection: React.FC<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4 mb-5">
                {icon && <div className="text-primary">{icon}</div>}
                <div>
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const TextInput: React.FC<{ label: string; id: string; value: string; type?: string; readOnly?: boolean }> = ({
    label,
    id,
    value,
    type = 'text',
    readOnly = false
}) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
            <div className="flex rounded-lg shadow-sm">
                <input
                    type={isPassword && !revealed ? 'password' : 'text'}
                    id={id}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    readOnly={readOnly}
                    className="flex-1 block w-full px-3 py-2 text-xs sm:text-sm font-mono border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isPassword) {
                            setRevealed(!revealed);
                        } else {
                            alert(`Settings for ${label} saved.`);
                        }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-xs font-semibold rounded-r-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                >
                    {isPassword ? (revealed ? 'Hide' : 'Reveal') : 'Save'}
                </button>
            </div>
        </div>
    );
};

export const SettingsView: React.FC = () => {
    const {
        currentCurrency,
        baseCurrency,
        setCurrency,
        setBaseCurrency,
        allCurrencies,
        currencyInfo,
        rates,
        exchangeMeta,
        refreshRates,
        isRefreshing,
        lastRefreshedAt,
        fxSpread,
        setFxSpread,
        openExchangeModal,
        convertAndFormat
    } = useCurrency();

    const [allowTenantMultiCurrency, setAllowTenantMultiCurrency] = useState(true);
    const [autoSyncDaily, setAutoSyncDaily] = useState(true);
    const [savedNotice, setSavedNotice] = useState(false);

    // 2FA Authenticator App State
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [twoFactorActive, setTwoFactorActive] = useState(false);
    const [backupCodesCount, setBackupCodesCount] = useState(0);

    const currentUserEmail = user?.email || 'superadmin@raphamis.com';

    useEffect(() => {
        const check2FA = async () => {
            try {
                const status = await getTwoFactorStatus(currentUserEmail);
                setTwoFactorActive(status.twoFactorEnabled);
                setBackupCodesCount(status.backupCodesCount);
            } catch {
                // ignore
            }
        };
        check2FA();
    }, [currentUserEmail]);

    const handleSaveMultiCurrencySettings = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Platform System Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure global internationalization, multi-currency exchange standard, healthcare integrations, and security policies.
                    </p>
                </div>
            </div>

            {/* SECTION 1: GLOBAL MULTI-CURRENCY & EXCHANGE STANDARD */}
            <SettingsSection
                title="Global Multi-Currency & FX Exchange Standards"
                description="Manage standard currency benchmarks, European Central Bank (ECB) reference rate feeds, and hospital settlement margins."
                icon={<Globe className="w-5 h-5" />}
            >
                {/* Online Status Banner */}
                <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-primary/90 text-white rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                {exchangeMeta.isLive ? 'ECB Online Live Feed' : 'Standard Baseline Active'}
                            </span>
                            <span className="text-xs text-gray-300">ISO 4217 Compliant</span>
                        </div>
                        <p className="text-xs text-gray-300">
                            Connected Standard: <strong>European Central Bank & Global Forex Mid-Market Benchmarks</strong> ({allCurrencies.length} world currencies indexed)
                        </p>
                        <p className="text-[11px] text-gray-400">
                            Last synchronized: {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : 'N/A'} • Next sync: Scheduled automatic rollover
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refreshRates()}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Synchronizing...' : 'Force Refresh Rates'}
                        </button>
                        <button
                            type="button"
                            onClick={openExchangeModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg shadow transition-colors"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Open FX Matrix
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Platform Accounting Base Currency */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Default Accounting Base Currency (All System Balances & Consolidated ARR)
                        </label>
                        <select
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            {allCurrencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code} - {c.name} ({c.country})
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-500">
                            Base currency used for cross-hospital consolidated ledgers, global audits, and system financial statistics.
                        </p>
                    </div>

                    {/* Active User Display Currency */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Active Admin Console Display Currency
                        </label>
                        <select
                            value={currentCurrency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            {allCurrencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code} - {c.name} ({c.symbol})
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-500">
                            Amounts across Billing, Subscriptions, and Analytics convert dynamically to this currency at live ECB rates.
                        </p>
                    </div>
                </div>

                {/* Institutional FX Settlement Spread Configuration */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-gray-900 block">Institutional FX Settlement Spread Buffer</span>
                            <span className="text-[11px] text-gray-500">
                                Surcharge buffer applied to patient and international hospital invoices to offset interbank forex fees.
                            </span>
                        </div>
                        <span className="font-mono font-bold text-primary text-sm bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                            +{fxSpread.toFixed(2)}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.25"
                        value={fxSpread}
                        onChange={(e) => setFxSpread(parseFloat(e.target.value))}
                        className="w-full accent-primary"
                    />

                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>0.0% (Pure Mid-Market ECB)</span>
                        <span>1.0% (Interbank Wire / Fedwire)</span>
                        <span>2.5% (Credit Card / Visa-Mastercard)</span>
                        <span>5.0% (Cross-Border Retail / Mobile)</span>
                    </div>
                </div>

                {/* Multi-Currency Governance Toggles */}
                <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allowTenantMultiCurrency}
                            onChange={(e) => setAllowTenantMultiCurrency(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 mt-0.5"
                        />
                        <div>
                            <span className="text-xs font-semibold text-gray-800 block">
                                Allow Hospital Tenants to bill patients in regional local currencies
                            </span>
                            <span className="text-[11px] text-gray-500">
                                When enabled, Global hospitals can bill in KES (via Mobile Money), European clinics in EUR, UK trusts in GBP, and Nigerian facilities in NGN, while automatically normalizing to platform base currency.
                            </span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoSyncDaily}
                            onChange={(e) => setAutoSyncDaily(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 mt-0.5"
                        />
                        <div>
                            <span className="text-xs font-semibold text-gray-800 block">
                                Automatic 24-hour rate synchronization with European Central Bank standard
                            </span>
                            <span className="text-[11px] text-gray-500">
                                Automatically queries official reference rates every business day at 16:00 CET and caches locally.
                            </span>
                        </div>
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    {savedNotice ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Multi-currency settings saved successfully!
                        </span>
                    ) : <div></div>}

                    <button
                        type="button"
                        onClick={handleSaveMultiCurrencySettings}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow transition-colors"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save Multi-Currency Configuration
                    </button>
                </div>
            </SettingsSection>

            {/* SECTION 2: HOSPITAL INSTANCE BRAND SETTINGS & IDENTITY */}
            <TenantBrandSettingsSection />

            {/* SECTION 3: HEALTHCARE PAYMENT GATEWAYS */}
            <SettingsSection
                title="Regional Healthcare Payment Integrations"
                description="Configure Mobile Money Gateways for Africa, SEPA for Europe, and Stripe/Fedwire for North America."
                icon={<CreditCard className="w-5 h-5" />}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                        <span><strong>Mobile Money Sandbox/Production Active:</strong> Mobile money billing enabled for Kenyan clinical facilities.</span>
                        <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">KES Enabled</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextInput label="Mobile Money Key" id="consumer-key" value="DARAJA_CONSUMER_KEY_SECURE" type="password" />
                        <TextInput label="Mobile Money Secret" id="consumer-secret" value="DARAJA_CONSUMER_SECRET_SECURE" type="password" />
                        <TextInput label="Business Shortcode / Paybill" id="shortcode" value="174379" />
                        <TextInput label="Daraja Online Passkey" id="passkey" value="DARAJA_PASSKEY_SECURE_TOKEN" type="password" />
                    </div>
                </div>
            </SettingsSection>

            {/* SECTION 3: SUBSCRIPTION TIERS IN MULTI-CURRENCY */}
            <SettingsSection
                title="Hospital Subscription Tiers (Live Multi-Currency Pricing)"
                description="Active platform subscription pricing converted automatically into your chosen display currency."
                icon={<Layers className="w-5 h-5" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 p-4 rounded-xl bg-gray-50/60 space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Starter Clinic</span>
                        <div className="font-mono text-xl font-extrabold text-gray-900">
                            {convertAndFormat(1000, 'USD', currentCurrency)}<span className="text-xs font-normal text-gray-500">/mo</span>
                        </div>
                        {currentCurrency !== 'USD' && (
                            <p className="text-[11px] font-mono text-gray-400">Base: $1,000 USD/mo</p>
                        )}
                        <p className="text-xs text-gray-600">Up to 50 beds, patient registry, outpatient EMR, basic billing.</p>
                    </div>

                    <div className="border-2 border-primary/40 p-4 rounded-xl bg-primary/5 space-y-2 relative">
                        <span className="absolute -top-2.5 right-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Most Popular
                        </span>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Community Hospital</span>
                        <div className="font-mono text-xl font-extrabold text-gray-900">
                            {convertAndFormat(2500, 'USD', currentCurrency)}<span className="text-xs font-normal text-gray-500">/mo</span>
                        </div>
                        {currentCurrency !== 'USD' && (
                            <p className="text-[11px] font-mono text-gray-400">Base: $2,500 USD/mo</p>
                        )}
                        <p className="text-xs text-gray-600">Up to 150 beds, inpatient wards, LIS, RIS PACS, pharmacy dispensary.</p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-xl bg-gray-50/60 space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enterprise Health</span>
                        <div className="font-mono text-xl font-extrabold text-gray-900">
                            {convertAndFormat(6000, 'USD', currentCurrency)}<span className="text-xs font-normal text-gray-500">/mo</span>
                        </div>
                        {currentCurrency !== 'USD' && (
                            <p className="text-[11px] font-mono text-gray-400">Base: $6,000 USD/mo</p>
                        )}
                        <p className="text-xs text-gray-600">Up to 500 beds, multi-facility routing, FHIR R4 API, DICOM archive.</p>
                    </div>
                </div>

                <div className="pt-2 text-right">
                    <Link
                        to="/subscriptions"
                        className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                        Manage All Contracts & Add-ons in Subscriptions Module →
                    </Link>
                </div>
            </SettingsSection>

            {/* SECTION 4: TWO-FACTOR AUTHENTICATION (AUTHENTICATOR APPS) */}
            <SettingsSection
                title="Two-Factor Authentication (Authenticator App)"
                description="Secure your clinical operations using standard RFC 6238 TOTP authenticator applications without SMS dependencies."
                icon={<Smartphone className="w-5 h-5 text-teal-600" />}
            >
                <div className="space-y-4">
                    {/* Status and Action Banner */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                twoFactorActive ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {twoFactorActive ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">
                                        Authenticator App (TOTP)
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        twoFactorActive 
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}>
                                        {twoFactorActive ? 'Active & Enforced' : 'Not Configured'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                                    {twoFactorActive
                                        ? `Your account (${currentUserEmail}) is protected with software 2FA. ${backupCodesCount} single-use backup recovery codes are available.`
                                        : 'Protect your account using Google Authenticator, Microsoft Authenticator, Apple Keychain, Authy, 1Password, or Bitwarden. 100% offline with zero SMS costs.'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => setIsAuthModalOpen(true)}
                                className={`w-full md:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                                    twoFactorActive
                                        ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <QrCode className="w-4 h-4" />
                                <span>{twoFactorActive ? 'Manage Authenticator / Backup Codes' : 'Set Up Authenticator App'}</span>
                            </button>
                        </div>
                    </div>

                    {/* App compatibility list */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                        <span className="font-semibold text-slate-700 block">
                            Compatible Authenticator Applications (RFC 6238 Standard):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                            {[
                                { name: 'Google Authenticator', tag: 'Android / iOS' },
                                { name: 'Microsoft Authenticator', tag: 'Android / iOS' },
                                { name: 'Apple Keychain', tag: 'iOS / macOS' },
                                { name: 'Twilio Authy', tag: 'Multi-Device' },
                                { name: '1Password', tag: 'Enterprise' },
                                { name: 'Bitwarden', tag: 'Open Source' },
                            ].map((app) => (
                                <div key={app.name} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="font-bold text-slate-800 text-[11px] truncate">{app.name}</div>
                                    <div className="text-[10px] text-slate-400">{app.tag}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsSection>

            {/* SECTION 5: SECURITY & RBAC */}
            <SettingsSection
                title="Security, Audit Logging & Access Control"
                description="RBAC governance for Superadmin, Tenant Admin, Medical Staff, and Treasury Officers."
                icon={<ShieldCheck className="w-5 h-5" />}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                        { role: 'Superadmin', desc: 'Full multi-tenant platform & treasury access' },
                        { role: 'Treasury Admin', desc: 'Multi-currency rates, invoicing & FX overrides' },
                        { role: 'Tenant Admin', desc: 'Hospital-level configuration & staff roster' },
                        { role: 'Physician / Doctor', desc: 'Clinical orders, encounters & EMR records' },
                        { role: 'Charge Nurse', desc: 'Bed assignments & medication administration' },
                        { role: 'Billing Officer', desc: 'Patient invoices, claims & Mobile Money receipts' }
                    ].map(r => (
                        <div key={r.role} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="font-bold text-gray-900 block">{r.role}</span>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">{r.desc}</span>
                        </div>
                    ))}
                </div>
            </SettingsSection>

            {/* SECTION 6: SUPER ADMIN WIRE TRANSFER BANK SETTLEMENT */}
            <WireTransferSettingsCard />

            {/* Authenticator Setup & Management Modal */}
            <AuthenticatorModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                userEmail={currentUserEmail}
                onStatusChange={(enabled) => setTwoFactorActive(enabled)}
            />
        </div>
    );
};
