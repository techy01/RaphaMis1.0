import React, { useState, useEffect } from 'react';
import {
    Mail,
    X,
    CheckCircle2,
    Clock,
    Search,
    FileText,
    Copy,
    Check,
    Send,
    Lock,
    ExternalLink,
} from 'lucide-react';
import { getDispatchedEmails, DispatchedEmailLog } from '../../api/subscriptionCheckoutApi';

interface DispatchedEmailsAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DispatchedEmailsAuditModal: React.FC<DispatchedEmailsAuditModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [emails, setEmails] = useState<DispatchedEmailLog[]>([]);
    const [search, setSearch] = useState('');
    const [selectedEmail, setSelectedEmail] = useState<DispatchedEmailLog | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEmails(getDispatchedEmails());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = emails.filter((item) =>
        item.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
        item.details.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase())
    );

    const copyBody = (em: DispatchedEmailLog) => {
        const text = `To: ${em.recipientName} <${em.recipientEmail}>\nSubject: ${em.subject}\nSent At: ${new Date(em.sentAt).toLocaleString()}\nTenant: ${em.details.tenantName}\nTier: ${em.details.planTier}\nPayment Reference: ${em.details.transactionReference}\nTemporary Password: ${em.details.temporaryPassword || 'N/A'}\nLogin URL: ${window.location.origin}/login`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-white">Automated Subscriber Email Audit Log</h3>
                            <p className="text-xs text-slate-400">
                                Dispatched payment receipts, wire transfer invoices, and initial login credentials
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

                {/* Search Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by school name, recipient email, or subject..."
                            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                        {filtered.length} Dispatched Log{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Content split */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1 overflow-hidden">
                    {/* List */}
                    <div className="overflow-y-auto p-4 space-y-2.5 max-h-[500px]">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-xs font-medium">No dispatched emails logged yet.</p>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Emails are logged whenever an Mobile Money/Card receipt or wire activation takes place.
                                </p>
                            </div>
                        ) : (
                            filtered.map((item) => {
                                const isSelected = selectedEmail?.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedEmail(item)}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-teal-50/80 border-teal-500 shadow-xs'
                                                : 'bg-white hover:bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <span
                                                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-1 ${
                                                        item.type === 'receipt_instant'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : item.type === 'activation_credentials'
                                                            ? 'bg-indigo-100 text-indigo-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {item.type === 'receipt_instant'
                                                        ? 'Instant Receipt'
                                                        : item.type === 'activation_credentials'
                                                        ? 'Initial Credentials'
                                                        : 'Wire Request Invoice'}
                                                </span>
                                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                                    {item.details.tenantName}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    To: {item.recipientEmail}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                {new Date(item.sentAt).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Detail Preview */}
                    <div className="p-5 overflow-y-auto max-h-[500px] bg-slate-50/50">
                        {selectedEmail ? (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{selectedEmail.subject}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Sent on {new Date(selectedEmail.sentAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyBody(selectedEmail)}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copied ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-2xs">
                                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Recipient</span>
                                            <span className="font-semibold text-slate-800">
                                                {selectedEmail.recipientName} ({selectedEmail.recipientEmail})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Facility / School</span>
                                            <span className="font-semibold text-slate-800">
                                                {selectedEmail.details.tenantName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Plan Tier</span>
                                            <span className="font-semibold text-slate-800">
                                                {selectedEmail.details.planTier}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Payment Reference</span>
                                            <span className="font-mono font-semibold text-slate-800">
                                                {selectedEmail.details.transactionReference}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedEmail.details.temporaryPassword && (
                                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                                            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                                <Lock className="w-3.5 h-3.5" /> Initial Account Login Credentials
                                            </span>
                                            <p className="text-xs text-amber-900">
                                                Username: <strong>{selectedEmail.recipientEmail}</strong>
                                            </p>
                                            <p className="text-xs text-amber-900 font-mono">
                                                Password: <strong className="text-amber-950 font-bold">{selectedEmail.details.temporaryPassword}</strong>
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-[11px] text-slate-500 pt-2">
                                        Status: <span className="text-emerald-600 font-bold">Successfully Delivered via SMTP Mail Gateway</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">Select an email log from the list to preview details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
