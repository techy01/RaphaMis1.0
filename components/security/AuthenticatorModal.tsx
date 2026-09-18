import React, { useState, useEffect } from 'react';
import { 
    Shield, ShieldCheck, QrCode, Smartphone, Copy, 
    Check, RefreshCw, Key, AlertTriangle, X, Lock, 
    Download, ShieldAlert, Sparkles, HelpCircle 
} from 'lucide-react';
import { 
    setupTwoFactor, 
    activateTwoFactor, 
    disableTwoFactor, 
    getTwoFactorStatus, 
    TwoFactorSetupData, 
    TwoFactorStatusData 
} from '../../api/authApi';
import { getLiveTotpCode } from '../../services/securityService';

interface AuthenticatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    onStatusChange?: (enabled: boolean) => void;
}

export const AuthenticatorModal: React.FC<AuthenticatorModalProps> = ({
    isOpen,
    onClose,
    userEmail,
    onStatusChange,
}) => {
    const [status, setStatus] = useState<TwoFactorStatusData | null>(null);
    const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [showManualKey, setShowManualKey] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisableForm, setShowDisableForm] = useState(false);
    
    // Live sandbox code helper for in-preview testing
    const [liveSandboxCode, setLiveSandboxCode] = useState<{ code: string; secondsRemaining: number }>({
        code: '------',
        secondsRemaining: 30,
    });

    const loadStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentStatus = await getTwoFactorStatus(userEmail);
            setStatus(currentStatus);
            if (!currentStatus.twoFactorEnabled) {
                const setup = await setupTwoFactor(userEmail);
                setSetupData(setup);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load security profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadStatus();
        } else {
            setCode('');
            setError(null);
            setSuccessMessage(null);
            setShowDisableForm(false);
            setDisablePassword('');
        }
    }, [isOpen, userEmail]);

    // Live preview code refresher
    useEffect(() => {
        if (!setupData?.secret) return;
        const updateLiveCode = () => {
            const live = getLiveTotpCode(setupData.secret);
            setLiveSandboxCode(live);
        };
        updateLiveCode();
        const interval = setInterval(updateLiveCode, 1000);
        return () => clearInterval(interval);
    }, [setupData?.secret]);

    if (!isOpen) return null;

    const handleCopySecret = () => {
        if (!setupData?.secret) return;
        navigator.clipboard.writeText(setupData.secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2500);
    };

    const handleCopyBackupCodes = () => {
        if (!setupData?.backupCodes) return;
        const text = `RaphaMIS Healthcare 2FA Emergency Backup Codes:\n${setupData.backupCodes.join('\n')}\nKeep these single-use codes stored securely.`;
        navigator.clipboard.writeText(text);
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2500);
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!code.trim()) {
            setError('Please enter the 6-digit code from your authenticator app.');
            return;
        }

        setLoading(true);
        try {
            const result = await activateTwoFactor(userEmail, code.trim());
            if (result.success) {
                setSuccessMessage('Authenticator app successfully linked and activated! Your account is now secured with TOTP 2FA.');
                setStatus({
                    email: userEmail,
                    twoFactorEnabled: true,
                    backupCodesCount: result.backupCodes?.length || 8,
                    hasTotpSecret: true,
                });
                setSetupData(null);
                setCode('');
                if (onStatusChange) onStatusChange(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!disablePassword) {
            setError('Please enter your account password to confirm.');
            return;
        }

        setLoading(true);
        try {
            await disableTwoFactor(userEmail, disablePassword);
            setSuccessMessage('Two-factor authentication has been disabled.');
            setShowDisableForm(false);
            setDisablePassword('');
            setStatus({
                email: userEmail,
                twoFactorEnabled: false,
                backupCodesCount: 0,
                hasTotpSecret: false,
            });
            if (onStatusChange) onStatusChange(false);
            // Load new setup for next time
            const setup = await setupTwoFactor(userEmail);
            setSetupData(setup);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to disable 2FA. Verify your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Authenticator App 2FA</h3>
                            <p className="text-xs text-slate-400">RFC 6238 TOTP Standard (No SMS Required)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-5 overflow-y-auto">

                    {error && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* VIEW A: 2FA ALREADY ENABLED */}
                    {status?.twoFactorEnabled ? (
                        <div className="space-y-5">
                            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-teal-900">Status: Active & Enforced</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">Protected</span>
                                    </div>
                                    <p className="text-xs text-teal-800 leading-relaxed">
                                        Your RaphaMIS user account is secured with standard Time-based One-Time Passwords. Every sign-in requires your phone or password manager authenticator app.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                    <span className="font-semibold text-slate-500 block text-[11px]">Primary Mechanism</span>
                                    <span className="font-bold text-slate-900">Software TOTP App</span>
                                    <span className="text-[11px] text-slate-500 block">Google, Microsoft, Apple, Authy</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                    <span className="font-semibold text-slate-500 block text-[11px]">Emergency Recovery</span>
                                    <span className="font-bold text-slate-900">{status.backupCodesCount} Backup Codes Available</span>
                                    <span className="text-[11px] text-slate-500 block">Single-use emergency keys</span>
                                </div>
                            </div>

                            {/* Why No SMS is Safer callout */}
                            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1 text-indigo-900">
                                <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>High Security Compliance Benefit</span>
                                </div>
                                <p className="text-[11px] text-indigo-700 leading-relaxed">
                                    Unlike SMS OTPs which are susceptible to SIM-swapping, mobile network delays, and telco outages, software authenticator apps work completely offline and follow strict NIST SP 800-63B standards.
                                </p>
                            </div>

                            {/* Disable 2FA Accordion / Confirmation */}
                            {!showDisableForm ? (
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Need to transfer or remove this authenticator?</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowDisableForm(true)}
                                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                                    >
                                        Disable 2FA Protection
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleDisable} className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                                        <ShieldAlert className="w-4 h-4 text-red-600" />
                                        <span>Confirm Disabling Two-Factor Authentication</span>
                                    </div>
                                    <p className="text-[11px] text-red-700">
                                        Disabling 2FA will lower your account security posture. Please enter your account password to confirm:
                                    </p>
                                    <input
                                        type="password"
                                        required
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        placeholder="Enter account security password"
                                        className="w-full text-xs px-3 py-2 bg-white border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDisableForm(false);
                                                setDisablePassword('');
                                            }}
                                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 cursor-pointer"
                                        >
                                            {loading ? 'Disabling...' : 'Confirm & Disable'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* VIEW B: SETUP WIZARD (NOT ENABLED YET) */
                        <div className="space-y-5">
                            
                            {/* Explanation Banner */}
                            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
                                <span className="font-bold block">No SMS Needed: 100% Offline Authenticator Apps</span>
                                <p className="text-[11px] text-teal-700 leading-relaxed">
                                    Link any standard 2FA app on your phone (Google Authenticator, Microsoft Authenticator, Authy, Apple Keychain, 1Password). It generates time-based 6-digit codes even without cellular reception or mobile data.
                                </p>
                            </div>

                            {/* Step 1: Scan QR Code */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                                        Scan QR Code with your Authenticator App
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-mono">Issuer: RaphaMIS</span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
                                    {setupData?.qrCodeDataUrl ? (
                                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                                            <img
                                                src={setupData.qrCodeDataUrl}
                                                alt="RaphaMIS 2FA TOTP QR Code"
                                                className="w-44 h-44 rounded-lg block"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-44 h-44 bg-slate-200 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-500">
                                            Generating QR...
                                        </div>
                                    )}

                                    <div className="space-y-3 text-xs w-full max-w-xs">
                                        <p className="text-slate-600 text-[11px] leading-relaxed">
                                            Open your app, tap <strong>(+) Add Account</strong>, and point your camera at the QR code.
                                        </p>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setShowManualKey(!showManualKey)}
                                                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Key className="w-3 h-3" />
                                                <span>{showManualKey ? 'Hide manual entry key' : 'Cannot scan? Enter manual secret key'}</span>
                                            </button>

                                            {showManualKey && setupData && (
                                                <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded-lg space-y-1.5">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Base32 Secret Key</span>
                                                    <div className="font-mono text-[11px] font-bold text-slate-900 break-all select-all">
                                                        {setupData.formattedSecret}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopySecret}
                                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                                                    >
                                                        {copiedSecret ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                        <span>{copiedSecret ? 'Secret Copied!' : 'Copy Key'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sandbox Live Code Helper */}
                                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] space-y-1">
                                            <div className="flex items-center justify-between text-amber-900 font-bold">
                                                <span>Interactive Sandbox TOTP:</span>
                                                <span className="font-mono text-xs text-amber-700">{liveSandboxCode.secondsRemaining}s</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-sm font-extrabold tracking-widest text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                                                    {liveSandboxCode.code}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCode(liveSandboxCode.code)}
                                                    className="px-2 py-1 text-[10px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded transition-colors cursor-pointer"
                                                >
                                                    Auto-Fill Code
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Emergency Backup Recovery Codes */}
                            {setupData?.backupCodes && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
                                            Save Emergency Backup Recovery Codes
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyBackupCodes}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                                        >
                                            {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedCodes ? 'Codes Copied!' : 'Copy All Codes'}</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        If you lose your phone or authenticator app, each of these codes can be used once to log in:
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                                        {setupData.backupCodes.map((c, i) => (
                                            <div key={i} className="p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono text-[11px] font-bold text-slate-800 select-all shadow-2xs">
                                                {c}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Verify and Activate */}
                            <form onSubmit={handleActivate} className="p-4 bg-teal-50/40 border border-teal-200 rounded-2xl space-y-3">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                                    Enter 6-Digit Verification Code to Confirm
                                </span>
                                
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="123456"
                                        className="flex-1 text-center font-mono font-bold tracking-widest text-lg px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || code.trim().length !== 6}
                                        className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:bg-slate-300 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Activating...' : 'Activate Authenticator 2FA'}
                                    </button>
                                </div>
                            </form>

                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-teal-600" />
                        <span>HIPAA, GDPR & GDPR Compliant 2FA</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};
