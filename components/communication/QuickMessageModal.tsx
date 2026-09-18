import React, { useState } from 'react';
import {
    MessageSquare,
    Send,
    X,
    Smartphone,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Clock,
    Flame,
} from 'lucide-react';
import { sendOmnichannelMessage, SendMessagePayload } from '../../api/communicationApi';

interface QuickMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    defaultCategory?: string;
    defaultPriority?: 'EMERGENCY_STAT' | 'HIGH' | 'NORMAL';
    defaultMessage?: string;
    onMessageSent?: () => void;
}

export const QuickMessageModal: React.FC<QuickMessageModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName = 'Patient',
    patientPhone = '',
    defaultCategory = 'GENERAL_BROADCAST',
    defaultPriority = 'NORMAL',
    defaultMessage = '',
    onMessageSent,
}) => {
    const [phone, setPhone] = useState(patientPhone || '');
    const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
    const [priority, setPriority] = useState<'EMERGENCY_STAT' | 'HIGH' | 'NORMAL'>(defaultPriority);
    const [category, setCategory] = useState(defaultCategory);
    const [message, setMessage] = useState(defaultMessage);
    const [enableFallback, setEnableFallback] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Sync default props when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setPhone(patientPhone || '');
            setPriority(defaultPriority);
            setCategory(defaultCategory);
            if (defaultMessage) setMessage(defaultMessage);
            setSuccessMessage(null);
            setErrorMessage(null);
        }
    }, [isOpen, patientPhone, defaultPriority, defaultCategory, defaultMessage]);

    if (!isOpen) return null;

    const segmentCount = Math.max(1, Math.ceil((message.length || 1) / 160));

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) {
            setErrorMessage('Recipient mobile phone number is required.');
            return;
        }
        if (!message.trim()) {
            setErrorMessage('Message content cannot be empty.');
            return;
        }

        setIsSending(true);
        setErrorMessage(null);

        try {
            const payload: SendMessagePayload = {
                patientId,
                patientName,
                recipientPhone: phone.trim(),
                channel,
                fallbackChannel: enableFallback && channel === 'whatsapp' ? 'sms' : undefined,
                priority,
                category,
                messageBody: message.trim(),
                provider: channel === 'whatsapp' ? 'WhatsAppCloud' : 'AfricasTalking',
            };

            await sendOmnichannelMessage(payload);
            setSuccessMessage(`Dispatched successfully via ${channel.toUpperCase()}!`);
            if (onMessageSent) onMessageSent();

            setTimeout(() => {
                setIsSending(false);
                onClose();
            }, 1200);
        } catch (err: any) {
            setIsSending(false);
            setErrorMessage(err.message || 'Failed to dispatch communication.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base text-white">Direct Clinical Dispatch</h3>
                            <p className="text-xs text-slate-300">
                                Contact {patientName} via SMS or WhatsApp
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSend} className="p-6 space-y-4">
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Channel Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Communication Channel
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setChannel('whatsapp')}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                    channel === 'whatsapp'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold shadow-xs ring-2 ring-emerald-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                WhatsApp Business
                            </button>
                            <button
                                type="button"
                                onClick={() => setChannel('sms')}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                    channel === 'sms'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-xs ring-2 ring-blue-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                Direct GSM SMS
                            </button>
                        </div>
                    </div>

                    {/* Priority & Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Priority Level
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                            >
                                <option value="NORMAL">Normal Priority</option>
                                <option value="HIGH">High Priority</option>
                                <option value="EMERGENCY_STAT">EMERGENCY STAT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Alert Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                            >
                                <option value="GENERAL_BROADCAST">General Communication</option>
                                <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
                                <option value="CRITICAL_NEWS2_ALERT">Critical NEWS2 Escalation</option>
                                <option value="LAB_PANIC_VALUE">Lab Panic Value</option>
                                <option value="PRESCRIPTION_READY">Prescription Pickup</option>
                                <option value="DISCHARGE_GATEPASS">Discharge Gatepass</option>
                            </select>
                        </div>
                    </div>

                    {/* Recipient Phone */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Recipient Mobile Number
                        </label>
                        <div className="relative">
                            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+254712345678 or 0712345678"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Supported: Africa's Talking (East/West Africa) and Twilio (International).
                        </p>
                    </div>

                    {/* Message Body */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Message Text
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">
                                {message.length} chars ({segmentCount} {segmentCount === 1 ? 'segment' : 'segments'})
                            </span>
                        </div>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter clinical notice or instructions..."
                            className="w-full p-3 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 font-sans"
                            required
                        />
                    </div>

                    {/* Fallback Option */}
                    {channel === 'whatsapp' && (
                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <input
                                type="checkbox"
                                id="modal-fallback"
                                checked={enableFallback}
                                onChange={(e) => setEnableFallback(e.target.checked)}
                                className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                            />
                            <label htmlFor="modal-fallback" className="text-xs text-slate-700 cursor-pointer">
                                Auto-fallback to SMS if WhatsApp delivery times out or fails
                            </label>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className={`px-5 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-2 shadow-sm transition-all ${
                                priority === 'EMERGENCY_STAT'
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : channel === 'whatsapp'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            {isSending ? 'Dispatching...' : 'Dispatch Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
