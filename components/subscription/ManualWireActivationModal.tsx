import React, { useState } from 'react';
import {
    Building2,
    CheckCircle2,
    Shield,
    X,
    FileText,
    Copy,
    Check,
    Lock,
    ExternalLink,
    Landmark,
    AlertCircle,
    Send,
} from 'lucide-react';
import { Tenant, TenantSubscription } from '../../packages/shared/types';
import { activatePendingWireSubscription } from '../../api/subscriptionCheckoutApi';

interface ManualWireActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant;
    subscription?: TenantSubscription;
    onSuccess: () => void;
}

export const ManualWireActivationModal: React.FC<ManualWireActivationModalProps> = ({
    isOpen,
    onClose,
    tenant,
    subscription,
    onSuccess,
}) => {
    const [wireReference, setWireReference] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activationResult, setActivationResult] = useState<{
        loginEmail: string;
        temporaryPassword: string;
        loginUrl: string;
        sentAt: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await activatePendingWireSubscription(
                tenant.id,
                wireReference || `WIRE-${Date.now()}`,
                adminNotes
            );
            setActivationResult({
                loginEmail: result.initialCredentials.loginEmail,
                temporaryPassword: result.initialCredentials.temporaryPassword,
                loginUrl: result.initialCredentials.loginUrl,
                sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to activate tenant account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyCredentials = () => {
        if (!activationResult) return;
        const text = `RaphaMIS Access Credentials for ${tenant.name}:\nPortal: ${window.location.origin}${activationResult.loginUrl}\nUsername/Email: ${activationResult.loginEmail}\nTemporary Password: ${activationResult.temporaryPassword}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-white">Manual Wire Transfer Activation</h3>
                            <p className="text-xs text-slate-400">Super Admin Bank Verification & Account Provisioning</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!activationResult ? (
                    <form onSubmit={handleActivate} className="p-6 space-y-5">
                        {/* Tenant & Invoice Summary Card */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider bg-teal-100/60 px-2 py-0.5 rounded-sm">
                                        {tenant.institutionType || 'Educational Institution / Healthcare'}
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-base mt-1">{tenant.name}</h4>
                                    <p className="text-xs text-slate-500">{tenant.email} • {tenant.phone}</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    Pending Activation
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                                <div>
                                    <p className="text-slate-500 text-[11px]">Selected Plan</p>
                                    <p className="font-semibold text-slate-800">{tenant.subscriptionPlan}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[11px]">Invoice Number</p>
                                    <p className="font-mono font-bold text-slate-900">
                                        {tenant.wireTransferInvoiceNumber || subscription?.paymentMethod?.invoiceNumber || 'INV-PENDING'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[11px]">Wire Reference</p>
                                    <p className="font-mono font-medium text-slate-700">
                                        {tenant.paymentReference || 'WIRE-PENDING'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Admin verification input */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Bank Wire Transaction Code / Clearing Reference *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={wireReference}
                                    onChange={(e) => setWireReference(e.target.value)}
                                    placeholder="e.g. KCB-EFT-994821 or SWIFT-ACK-2026"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Enter the bank settlement code from your company bank statement.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Super Admin Verification Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="e.g. Funds verified in Global Standard Bank account. Paid via RTGS."
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>

                        {/* Instruction Alert */}
                        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-teal-800">
                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                <span>Automated Actions Upon Activation:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-teal-800/90 pl-1 text-[11px]">
                                <li>Account status updated to <strong>Active</strong> instantly.</li>
                                <li>Invoice status updated to <strong>Paid</strong> with today's settlement date.</li>
                                <li>Initial secure temporary password auto-generated.</li>
                                <li>Welcome email containing login URL, username, and password dispatched to <strong>{tenant.email}</strong>.</li>
                            </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>Processing Activation...</>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Verify Wire & Activate Account</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Activation Success & Credentials View */
                    <div className="p-6 space-y-5">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Account Successfully Activated!</h3>
                            <p className="text-xs text-slate-600 max-w-md mx-auto">
                                The institutional account for <strong>{tenant.name}</strong> is now live. An activation email with the credentials below has been sent to <strong>{tenant.email}</strong>.
                            </p>
                        </div>

                        {/* Generated Credentials Card */}
                        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    Initial Subscriber Credentials
                                </span>
                                <button
                                    onClick={copyCredentials}
                                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Credentials</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-slate-400 text-[11px] block">Login Portal URL</span>
                                    <span className="font-mono text-teal-300 break-all">{window.location.origin}/login</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Admin Email / Username</span>
                                        <span className="font-mono text-white font-semibold">{activationResult.loginEmail}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Initial Temporary Password</span>
                                        <span className="font-mono text-amber-300 font-bold tracking-wider">{activationResult.temporaryPassword}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Dispatch Notice */}
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                            <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                                Activation & credentials email dispatched at {activationResult.sentAt}. The subscriber has been prompted to change their password upon first sign-in.
                            </span>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                            >
                                Done & Return to List
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
