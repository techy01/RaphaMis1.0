import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Activity, ArrowLeft, Shield, Building2, 
    Lock, AlertTriangle, CheckCircle2, Eye, 
    EyeOff, ShieldAlert, ShieldCheck, Smartphone, 
    KeyRound, RefreshCw, ArrowRight
} from 'lucide-react';
import { 
    getLoginLockoutStatus, 
    LockoutStatus
} from '../../services/securityService';
import { getRoleDefaultRoute } from '../../config/rbac';

export const LoginView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 2FA Challenge State
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    
    // Security & Rate Limiting state
    const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
        isLocked: false,
        remainingSeconds: 0,
        failedAttempts: 0,
        remainingAttempts: 5,
        lockoutUntil: null,
    });

    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Success message if redirected from password reset
    const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.passwordResetSuccess) {
            setResetSuccessMessage('Your password has been successfully updated. Please log in with your new credentials.');
            if (location.state?.resetEmail) {
                setEmail(location.state.resetEmail);
            }
        }
    }, [location.state]);

    // Periodically update lockout countdown timer
    useEffect(() => {
        const updateStatus = () => {
            const status = getLoginLockoutStatus(requires2FA ? pendingEmail : email);
            setLockoutStatus(status);
        };

        updateStatus();
        const interval = setInterval(updateStatus, 1000);
        return () => clearInterval(interval);
    }, [email, pendingEmail, requires2FA]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResetSuccessMessage(null);
        auth.clearSessionNotice();

        // Check rate limiting before calling backend
        const currentLockout = getLoginLockoutStatus(email);
        if (currentLockout.isLocked) {
            const mins = Math.floor(currentLockout.remainingSeconds / 60);
            const secs = currentLockout.remainingSeconds % 60;
            setError(`Security lockout active. Please wait ${mins}:${secs < 10 ? '0' : ''}${secs} before attempting to sign in.`);
            setLockoutStatus(currentLockout);
            return;
        }

        setLoading(true);
        try {
            const result = await auth.login({ email: email.trim(), password });
            if (result?.requires2FA) {
                setRequires2FA(true);
                setPendingEmail(email.trim());
                setTwoFactorCode('');
                return;
            }
            const destination = getRoleDefaultRoute(result?.user?.role);
            navigate(destination);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Invalid credentials. Please verify your email and password.';
            setError(message);
            const updatedStatus = getLoginLockoutStatus(email);
            setLockoutStatus(updatedStatus);
        } finally {
            setLoading(false);
        }
    };

    const handle2FAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!twoFactorCode.trim()) {
            setError('Please enter your 6-digit authenticator code or emergency backup code.');
            return;
        }

        setLoading(true);
        try {
            const result = await auth.verify2FA(pendingEmail, twoFactorCode.trim());
            const destination = getRoleDefaultRoute(result?.user?.role);
            navigate(destination);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Invalid authenticator code.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (auth.isAuthenticated) {
        return <Navigate to={getRoleDefaultRoute(auth.user?.role)} />;
    }

    const formatRemainingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
            
            {/* Top Navigation Back to Landing Page */}
            <div className="w-full max-w-md mb-4 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Public Website</span>
                </Link>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-teal-600" />
                    <span>Rate Limited & 256-bit Encrypted</span>
                </div>
            </div>

            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200">
                
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-sm">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Rapha<span className="text-teal-600">MIS</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Granular Healthcare & SaaS Platform Security
                        </p>
                    </div>
                </div>

                {/* Idle Session Inactivity Timeout Alert */}
                {auth.sessionNotice && (
                    <div className="p-3 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-2 animate-in fade-in">
                        <div className="flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{auth.sessionNotice}</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={auth.clearSessionNotice}
                            className="text-amber-500 hover:text-amber-800 text-xs font-bold shrink-0 cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Password Reset Notification */}
                {resetSuccessMessage && (
                    <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{resetSuccessMessage}</span>
                    </div>
                )}

                {/* Security Lockout Banner */}
                {lockoutStatus.isLocked && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center gap-2 text-red-800 font-bold">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Account Temporarily Locked</span>
                        </div>
                        <p className="text-[11px] text-red-700 leading-relaxed">
                            Too many failed authentication attempts detected. To safeguard patient records and clinical access, this account is locked for 15 minutes.
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-red-200 text-red-900 font-mono font-bold text-[11px]">
                            <span>Lockout Cooldown:</span>
                            <span>{formatRemainingTime(lockoutStatus.remainingSeconds)}</span>
                        </div>
                    </div>
                )}

                {/* Remaining Attempts Warning */}
                {!lockoutStatus.isLocked && lockoutStatus.failedAttempts > 0 && lockoutStatus.remainingAttempts <= 2 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Security Alert: </span>
                            <span>Only {lockoutStatus.remainingAttempts} attempt(s) remaining before a 15-minute lockout.</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                {requires2FA ? (
                    /* STEP 2: 2FA TOTP CHALLENGE */
                    <form className="space-y-4" onSubmit={handle2FAVerify}>
                        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold text-teal-900">
                                <span className="flex items-center gap-1.5">
                                    <Smartphone className="w-4 h-4 text-teal-700" />
                                    Two-Factor Security Verification
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200 text-teal-900 font-bold uppercase">TOTP 2FA</span>
                            </div>
                            <p className="text-[11px] text-teal-800 leading-relaxed">
                                Enter the 6-digit code from your Authenticator App for <strong>{pendingEmail}</strong>.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setRequires2FA(false);
                                    setTwoFactorCode('');
                                    setError(null);
                                }}
                                className="text-[11px] text-teal-700 hover:text-teal-900 underline font-semibold cursor-pointer"
                            >
                                Switch to another account
                            </button>
                        </div>

                        <div>
                            <label htmlFor="2fa-code" className="block text-xs font-semibold text-slate-700 mb-1">
                                6-Digit Authenticator Code or Backup Code
                            </label>
                            <input
                                id="2fa-code"
                                name="twoFactorCode"
                                type="text"
                                autoFocus
                                required
                                disabled={lockoutStatus.isLocked || loading}
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-center font-mono font-extrabold text-xl tracking-widest disabled:bg-slate-100"
                                placeholder="123456"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.trim())}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                You can also enter an emergency backup code (e.g. RPH-XXXX-XXXX).
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <button
                                type="submit"
                                disabled={loading || !twoFactorCode.trim() || lockoutStatus.isLocked}
                                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-xs disabled:bg-slate-400 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying Code...' : 'Verify & Complete Sign In'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRequires2FA(false);
                                    setTwoFactorCode('');
                                    setError(null);
                                }}
                                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                                ← Cancel & Return to Password Sign In
                            </button>
                        </div>
                    </form>
                ) : (
                    /* STEP 1: USERNAME & PASSWORD */
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3 text-xs">
                            <div>
                                <label htmlFor="email-address" className="block font-semibold text-slate-700 mb-1">
                                    Clinical / Admin Account Email
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    disabled={lockoutStatus.isLocked || loading}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                                    placeholder="Enter registered email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="font-semibold text-slate-700">
                                        Security Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        disabled={lockoutStatus.isLocked || loading}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-xs pr-10 disabled:bg-slate-100 disabled:text-slate-400"
                                        placeholder="Enter security password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={lockoutStatus.isLocked}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 disabled:opacity-40 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || lockoutStatus.isLocked}
                            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-xs disabled:bg-slate-400 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {lockoutStatus.isLocked 
                                ? `Locked Out (${formatRemainingTime(lockoutStatus.remainingSeconds)})` 
                                : loading 
                                    ? 'Authenticating Credentials...' 
                                    : 'Authenticate Clinical Session'
                            }
                        </button>
                    </form>
                )}

                {/* Security Assurance Badge */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>HIPAA & GDPR Compliant</span>
                    </div>
                    <span className="text-slate-400">Max 5 Attempts</span>
                </div>

                {/* Legal & Corporate Attribution */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Proprietary SaaS by <strong>Saaslink Technologies Ltd</strong></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Link to="/terms" className="hover:text-teal-700 underline">Terms of Service</Link>
                        <span>•</span>
                        <Link to="/privacy" className="hover:text-teal-700 underline">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/cookies" className="hover:text-teal-700 underline">Cookies</Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

