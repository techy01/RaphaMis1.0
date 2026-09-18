import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Activity, ArrowLeft, Shield, Building2, 
    Lock, CheckCircle2, AlertTriangle, Eye, 
    EyeOff, RefreshCw, KeyRound, Clock, ShieldCheck 
} from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../../api/authApi';
import { checkResetRequestRateLimit } from '../../services/securityService';

export const ForgotPasswordView: React.FC = () => {
    const navigate = useNavigate();

    // Steps: 1 = Enter Email, 2 = Verify Code & Set New Password, 3 = Completed
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Form states
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Operational states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [previewCode, setPreviewCode] = useState<string | null>(null);

    // Resend cooldown timer
    const [resendCooldown, setResendCooldown] = useState(0);

    // Password strength rules
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

    // Cooldown interval
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Step 1: Submit email to request code
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setError('Please enter your registered account email.');
            return;
        }

        // Rate limit verification
        const rateCheck = checkResetRequestRateLimit(cleanEmail);
        if (!rateCheck.allowed) {
            setError(rateCheck.message || 'Too many reset attempts. Please wait before trying again.');
            return;
        }

        setLoading(true);
        try {
            const res = await requestPasswordReset(cleanEmail);
            if (res.success) {
                if (res.code) {
                    setPreviewCode(res.code);
                }
                setSuccessMessage(`A 6-digit security code has been generated for ${cleanEmail.replace(/(?<=.).(?=.*@)/g, '*')}.`);
                setStep(2);
                setResendCooldown(60); // 60-second cooldown for next request
            } else {
                setError(res.error || 'Failed to dispatch password reset code.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Unable to request password reset. Please try again later.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Resend code handler
    const handleResendCode = async () => {
        if (resendCooldown > 0 || loading) return;
        setError(null);
        setLoading(true);
        try {
            const res = await requestPasswordReset(email.trim().toLowerCase());
            if (res.success) {
                if (res.code) {
                    setPreviewCode(res.code);
                }
                setSuccessMessage('A new verification code has been dispatched.');
                setResendCooldown(60);
            } else {
                setError(res.error || 'Failed to resend code.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Resend rate limited. Please wait.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Submit verification code and commit new password
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!code || code.trim().length !== 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        if (!isPasswordValid) {
            setError('Please ensure your new password satisfies all security requirements.');
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
            if (res.success) {
                setStep(3);
                // Auto redirect after 4 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: { passwordResetSuccess: true, resetEmail: email.trim().toLowerCase() },
                    });
                }, 4000);
            } else {
                setError(res.error || 'Failed to reset password. Please check the code.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
            
            {/* Top Navigation */}
            <div className="w-full max-w-md mb-4 flex items-center justify-between">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                </Link>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-teal-600" />
                    <span>Rate Limited & Encrypted</span>
                </div>
            </div>

            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200">
                
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-sm">
                        <KeyRound className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Rapha<span className="text-teal-600">MIS</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Clinical Credential Recovery
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-2 pt-1">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-teal-600' : 'w-4 bg-teal-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-teal-600' : 'w-4 bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-emerald-600' : 'w-4 bg-slate-200'}`} />
                </div>

                {/* STEP 1: Request Reset Code */}
                {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <div className="text-center space-y-1">
                            <h2 className="text-sm font-bold text-slate-800">Reset Account Password</h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Enter your registered hospital or admin account email. We will generate a secure one-time verification code.
                            </p>
                        </div>

                        <div className="space-y-1 text-xs">
                            <label htmlFor="reset-email" className="block font-semibold text-slate-700">
                                Registered Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter registered email address"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-xs"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                <span>Brute-Force & Rate Limit Guard</span>
                            </div>
                            <p className="text-slate-500 leading-normal">
                                Password reset requests are limited to 3 attempts every 15 minutes to prevent automated abuse.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-xs disabled:bg-slate-400"
                        >
                            {loading ? 'Verifying & Generating Code...' : 'Send Security Verification Code'}
                        </button>
                    </form>
                )}

                {/* STEP 2: Enter Code & New Password */}
                {step === 2 && (
                    <form onSubmit={handleResetSubmit} className="space-y-4">
                        <div className="text-center space-y-1">
                            <h2 className="text-sm font-bold text-slate-800">Verify Code & Set Password</h2>
                            <p className="text-xs text-slate-500">
                                Enter the 6-digit code dispatched for <strong className="text-slate-700">{email}</strong>
                            </p>
                        </div>

                        {/* Preview Sandbox Notification */}
                        {previewCode && (
                            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-teal-900 flex items-center gap-1">
                                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                                        One-Time Security OTP
                                    </span>
                                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md">
                                        Valid 10 Mins
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] text-teal-700">Sandbox Code:</p>
                                    <span className="text-base font-mono font-extrabold tracking-widest text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                                        {previewCode}
                                    </span>
                                </div>
                            </div>
                        )}

                        {successMessage && !previewCode && (
                            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* 6-Digit Code Input */}
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                                <label htmlFor="otp-code" className="font-semibold text-slate-700">
                                    6-Digit Verification Code
                                </label>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 disabled:text-slate-400 flex items-center gap-1"
                                >
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                    <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
                                </button>
                            </div>
                            <input
                                id="otp-code"
                                type="text"
                                maxLength={6}
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-mono text-center tracking-widest text-base font-bold"
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1 text-xs">
                            <label htmlFor="new-password" className="block font-semibold text-slate-700">
                                New Security Password
                            </label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-xs pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1 text-xs">
                            <label htmlFor="confirm-password" className="block font-semibold text-slate-700">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-xs pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Checklist */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1.5">
                            <p className="font-semibold text-slate-700">Password Requirements:</p>
                            <div className="grid grid-cols-2 gap-1 text-slate-600">
                                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                    <span>8+ characters</span>
                                </div>
                                <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-700 font-semibold' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hasUpper ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                    <span>Uppercase (A-Z)</span>
                                </div>
                                <div className={`flex items-center gap-1 ${hasLower ? 'text-emerald-700 font-semibold' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hasLower ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                    <span>Lowercase (a-z)</span>
                                </div>
                                <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                    <span>Number (0-9)</span>
                                </div>
                            </div>
                            {newPassword.length > 0 && confirmPassword.length > 0 && (
                                <div className={`pt-1 flex items-center gap-1.5 font-medium ${passwordsMatch ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {passwordsMatch ? (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Passwords match perfectly</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                            <span>Passwords do not match</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || code.length !== 6}
                            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-xs disabled:bg-slate-400 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying & Updating Password...' : 'Save New Password & Secure Account'}
                        </button>
                    </form>
                )}

                {/* STEP 3: Success Confirmation */}
                {step === 3 && (
                    <div className="text-center space-y-4 py-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-extrabold text-slate-900">
                                Password Reset Complete
                            </h2>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                                Your account password has been successfully updated. All active lockouts have been cleared.
                            </p>
                        </div>

                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span>Redirecting to Sign In page automatically...</span>
                        </div>

                        <Link
                            to="/login"
                            state={{ passwordResetSuccess: true, resetEmail: email.trim().toLowerCase() }}
                            className="inline-block w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
                        >
                            Sign In Now With New Password
                        </Link>
                    </div>
                )}

                {/* Corporate Footer */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Proprietary SaaS by <strong>Saaslink Technologies Ltd</strong></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Link to="/terms" className="hover:text-teal-700 underline">Terms of Service</Link>
                        <span>•</span>
                        <Link to="/privacy" className="hover:text-teal-700 underline">Privacy Policy</Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
