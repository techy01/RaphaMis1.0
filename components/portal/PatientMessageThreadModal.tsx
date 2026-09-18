import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    Send,
    MessageSquare,
    User,
    Stethoscope,
    Clock,
    CheckCircle2,
    Shield,
} from 'lucide-react';
import { PortalSecureMessage } from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';

interface PatientMessageThreadModalProps {
    message: PortalSecureMessage | null;
    isOpen: boolean;
    onClose: () => void;
    onReply: (messageId: string, replyText: string, sender: 'patient' | 'provider', senderName: string) => Promise<void>;
    userMode?: 'staff' | 'patient';
}

export const PatientMessageThreadModal: React.FC<PatientMessageThreadModalProps> = ({
    message,
    isOpen,
    onClose,
    onReply,
    userMode = 'staff',
}) => {
    if (!isOpen || !message) return null;

    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        try {
            const sender = userMode === 'patient' ? 'patient' : 'provider';
            const senderName = userMode === 'patient' ? message.patientName : 'Dr. Sarah Jenkins, MD';
            await onReply(message.id, replyText.trim(), sender, senderName);
            setReplyText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-neutral">{message.subject}</h3>
                                <StatusBadge status={message.status} size="sm" />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Patient: <strong>{message.patientName}</strong> ({message.patientMrn}) • Care Team: {message.providerName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Message Thread Body */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50/30">
                    <div className="text-center">
                        <span className="text-[11px] bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                            <Shield className="h-3 w-3 text-teal-600" />
                            End-to-End Encrypted HIPAA Compliant Thread
                        </span>
                    </div>

                    {message.thread.map((item) => {
                        const isPatient = item.sender === 'patient';
                        let timeStr = item.timestamp;
                        try {
                            timeStr = format(new Date(item.timestamp), 'MMM d, h:mm a');
                        } catch {}

                        return (
                            <div
                                key={item.id}
                                className={`flex gap-3 ${isPatient ? 'justify-start' : 'justify-end'}`}
                            >
                                {isPatient && (
                                    <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[75%] rounded-2xl p-3.5 shadow-2xs text-xs ${
                                        isPatient
                                            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs'
                                            : 'bg-teal-600 text-white rounded-tr-xs'
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-between gap-3 text-[10px] mb-1.5 font-medium ${
                                            isPatient ? 'text-gray-400' : 'text-teal-100'
                                        }`}
                                    >
                                        <span>{item.senderName}</span>
                                        <span>{timeStr}</span>
                                    </div>
                                    <p className="leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                </div>

                                {!isPatient && (
                                    <div className="h-8 w-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                        <Stethoscope className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            required
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={
                                userMode === 'patient'
                                    ? 'Type a message to your clinical care team...'
                                    : `Reply as ${message.providerName}...`
                            }
                            className="flex-1 text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !replyText.trim()}
                            className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition flex items-center gap-1.5 shrink-0"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
