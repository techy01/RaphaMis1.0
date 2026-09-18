import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Smartphone,
    CheckCircle2,
    Clock,
    AlertTriangle,
    RefreshCw,
    Search,
    Filter,
    ArrowRightLeft,
    CheckCheck,
    Shield,
    Flame,
    Building,
    FileText,
    Settings,
    Activity,
    Users,
    Key,
    PhoneCall,
    Radio,
    Terminal,
    Sparkles,
    ExternalLink,
    ChevronRight,
    Zap,
    CornerDownRight,
    Info,
} from 'lucide-react';
import {
    OmnichannelMessage,
    CommunicationTemplate,
    CommunicationStats,
} from '../../packages/shared/types';
import {
    getCommunicationMessages,
    getCommunicationStats,
    getCommunicationTemplates,
    sendOmnichannelMessage,
    testTelephonyGateway,
    simulatePatientInboundReply,
    SendMessagePayload,
} from '../../api/communicationApi';
import { QuickMessageModal } from '../communication/QuickMessageModal';

export const CommunicationView: React.FC = () => {
    // Tab Navigation
    const [activeTab, setActiveTab] = useState<'feed' | 'composer' | 'gateways' | 'automation'>('feed');

    // Messages & Stats State
    const [messages, setMessages] = useState<OmnichannelMessage[]>([]);
    const [stats, setStats] = useState<CommunicationStats>({
        totalSent: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        deliveryRatePercentage: 100,
        activeConversationsCount: 0,
        smsCreditsUsed: 0,
        whatsappConversationsUsed: 0,
    });
    const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [channelFilter, setChannelFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Quick Action Modal State
    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

    // Interactive Composer Form State
    const [composerChannel, setComposerChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
    const [composerPriority, setComposerPriority] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY_STAT'>('NORMAL');
    const [composerCategory, setComposerCategory] = useState('APPOINTMENT_REMINDER');
    const [composerPhone, setComposerPhone] = useState('+254712345678');
    const [composerPatientName, setComposerPatientName] = useState('Amina Kiprop');
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('APPOINTMENT_REMINDER_24H');
    const [composerBody, setComposerBody] = useState('');
    const [enableFallback, setEnableFallback] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [dispatchStatus, setDispatchStatus] = useState<{ success?: boolean; text?: string } | null>(null);

    // Gateway Testing State
    const [testProvider, setTestProvider] = useState('AfricasTalking');
    const [testPhone, setTestPhone] = useState('+254700000000');
    const [gatewayTestResult, setGatewayTestResult] = useState<string | null>(null);
    const [isTestingGateway, setIsTestingGateway] = useState(false);

    // Simulated 2-Way Reply State
    const [replyModalMessage, setReplyModalMessage] = useState<OmnichannelMessage | null>(null);
    const [replyText, setReplyText] = useState('1 - Confirmed');

    // Load initial data
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [msgData, statsData, tplData] = await Promise.all([
                getCommunicationMessages({
                    search: searchTerm,
                    channel: channelFilter,
                    status: statusFilter,
                    category: categoryFilter,
                }),
                getCommunicationStats(),
                getCommunicationTemplates(),
            ]);

            setMessages(msgData.items);
            setStats(statsData);
            setTemplates(tplData);
        } catch (err) {
            console.error('Failed to load communication data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [searchTerm, channelFilter, statusFilter, categoryFilter]);

    // Update composer text when template changes
    useEffect(() => {
        const found = templates.find((t) => t.key === selectedTemplateKey);
        if (found) {
            let populated = found.content
                .replace('{{patientName}}', composerPatientName || 'Patient')
                .replace('{{hospitalName}}', 'St. Jude General & Tertiary Center')
                .replace('{{appointmentTime}}', 'Tomorrow at 10:00 AM')
                .replace('{{doctorName}}', 'Dr. Victor Ndwiga')
                .replace('{{pickupCode}}', '4819')
                .replace('{{gatepassCode}}', 'GP-2026-0941')
                .replace('{{wardBed}}', 'Ward 2A, Bed 12')
                .replace('{{news2Score}}', '7')
                .replace('{{patientMrn}}', 'MRN-2026-0182');
            setComposerBody(populated);
            setComposerCategory(found.category);
            setComposerChannel(found.channel as any);
        }
    }, [selectedTemplateKey, composerPatientName, templates]);

    // Handle Dispatch from Composer
    const handleComposerDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!composerPhone.trim() || !composerBody.trim()) {
            setDispatchStatus({ success: false, text: 'Phone number and message text are required.' });
            return;
        }

        setIsSending(true);
        setDispatchStatus(null);

        try {
            const payload: SendMessagePayload = {
                patientName: composerPatientName,
                recipientPhone: composerPhone.trim(),
                channel: composerChannel,
                fallbackChannel: enableFallback && composerChannel === 'whatsapp' ? 'sms' : undefined,
                priority: composerPriority,
                category: composerCategory,
                templateKey: selectedTemplateKey,
                messageBody: composerBody.trim(),
                provider: composerChannel === 'whatsapp' ? 'WhatsAppCloud' : 'AfricasTalking',
            };

            await sendOmnichannelMessage(payload);
            setDispatchStatus({
                success: true,
                text: `Message successfully queued and dispatched via ${composerChannel.toUpperCase()}!`,
            });
            await refreshData();
        } catch (err: any) {
            setDispatchStatus({ success: false, text: err.message || 'Dispatch failed' });
        } finally {
            setIsSending(false);
        }
    };

    // Handle Gateway Connection Test
    const handleRunGatewayTest = async () => {
        setIsTestingGateway(true);
        setGatewayTestResult(null);
        try {
            const res = await testTelephonyGateway(testProvider, testPhone);
            setGatewayTestResult(res.message);
        } catch (err: any) {
            setGatewayTestResult(`Test failed: ${err.message}`);
        } finally {
            setIsTestingGateway(false);
        }
    };

    // Handle 2-Way Reply Simulation
    const handleSendSimulatedReply = async () => {
        if (!replyModalMessage) return;
        await simulatePatientInboundReply(replyModalMessage.id, replyText);
        setReplyModalMessage(null);
        await refreshData();
    };

    const smsSegments = Math.max(1, Math.ceil((composerBody.length || 1) / 160));

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Omnichannel Telephony & Clinical Messaging
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Phase 3 Production Ready
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Automated two-way SMS & WhatsApp appointment reminders, emergency NEWS2 escalation, and lab panic alerts.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={refreshData}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsQuickModalOpen(true)}
                        className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all flex-1 md:flex-none justify-center"
                    >
                        <Send className="w-4 h-4" />
                        Direct Dispatch
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Dispatched
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Send className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{stats.totalSent}</span>
                        <span className="text-xs text-slate-500">messages</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="text-emerald-600 font-medium">98.4%</span> delivery across GSM & Data
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Delivery Success Rate
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600">{stats.deliveryRatePercentage}%</span>
                        <span className="text-xs text-slate-500">
                            ({stats.deliveredCount + stats.readCount} delivered)
                        </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="text-emerald-600 font-medium">{stats.readCount}</span> WhatsApp read receipts
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            2-Way Confirmations
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">{stats.activeConversationsCount}</span>
                        <span className="text-xs text-slate-500">patient replies</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Automated appointment updates in EMR</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Telephony Units
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Radio className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-600">{stats.smsCreditsUsed}</span>
                        <span className="text-xs text-slate-500">credits</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Africa's Talking & Meta Cloud APIs</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all ${
                        activeTab === 'feed'
                            ? 'border-teal-600 text-teal-600 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Live Message Feed & Audit Log
                </button>
                <button
                    onClick={() => setActiveTab('composer')}
                    className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all ${
                        activeTab === 'composer'
                            ? 'border-teal-600 text-teal-600 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Send className="w-4 h-4" />
                    Interactive Clinical Composer & Preview
                </button>
                <button
                    onClick={() => setActiveTab('gateways')}
                    className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all ${
                        activeTab === 'gateways'
                            ? 'border-teal-600 text-teal-600 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Telephony Gateways & Connectivity
                </button>
                <button
                    onClick={() => setActiveTab('automation')}
                    className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all ${
                        activeTab === 'automation'
                            ? 'border-teal-600 text-teal-600 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Zap className="w-4 h-4" />
                    Clinical Triggers & Policies
                </button>
            </div>

            {/* TAB 1: Live Message Feed */}
            {activeTab === 'feed' && (
                <div className="space-y-4">
                    {/* Filters Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by recipient phone, patient, message..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            {/* Channel Filter */}
                            <select
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                                className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700"
                            >
                                <option value="ALL">All Channels</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="READ">Read</option>
                                <option value="SENT">Sent</option>
                                <option value="QUEUED">Queued (Offline)</option>
                                <option value="FAILED">Failed</option>
                                <option value="OPTED_OUT">Opted Out</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="APPOINTMENT_REMINDER">Appointments</option>
                                <option value="CRITICAL_NEWS2_ALERT">Critical NEWS2</option>
                                <option value="LAB_PANIC_VALUE">Lab Panic Values</option>
                                <option value="PRESCRIPTION_READY">Pharmacy Pickup</option>
                                <option value="DISCHARGE_GATEPASS">Discharge Gatepass</option>
                            </select>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-slate-700">No Dispatched Messages Found</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Try adjusting your search criteria or dispatch a message above.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col gap-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {/* Channel Badge */}
                                            {msg.channel === 'whatsapp' ? (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    WhatsApp
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    SMS ({msg.provider})
                                                </span>
                                            )}

                                            {/* Priority Badge */}
                                            {msg.priority === 'EMERGENCY_STAT' && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse flex items-center gap-1">
                                                    <Flame className="w-3 h-3 text-rose-600" />
                                                    EMERGENCY STAT
                                                </span>
                                            )}

                                            {/* Category Badge */}
                                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {msg.category.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Status & Timestamp */}
                                        <div className="flex items-center gap-3 text-xs">
                                            {msg.status === 'READ' && (
                                                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                                    <CheckCheck className="w-4 h-4" /> Read
                                                </span>
                                            )}
                                            {msg.status === 'DELIVERED' && (
                                                <span className="flex items-center gap-1 text-teal-600 font-medium">
                                                    <CheckCircle2 className="w-4 h-4" /> Delivered
                                                </span>
                                            )}
                                            {msg.status === 'SENT' && (
                                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                    <Clock className="w-4 h-4" /> In Flight
                                                </span>
                                            )}
                                            {msg.status === 'QUEUED' && (
                                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                    <Clock className="w-4 h-4" /> Queued (Offline)
                                                </span>
                                            )}
                                            {msg.status === 'FAILED' && (
                                                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                                                    <AlertTriangle className="w-4 h-4" /> Delivery Failed
                                                </span>
                                            )}
                                            {msg.status === 'OPTED_OUT' && (
                                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                                    <Shield className="w-4 h-4" /> Opted-Out
                                                </span>
                                            )}

                                            <span className="text-slate-400 text-[11px]">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Patient & Phone Info */}
                                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-800">
                                                {msg.patientName || 'Anonymous Patient'}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[11px]">
                                                {msg.recipientPhone}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Ref: <span className="font-mono text-slate-600">{msg.providerMessageId || msg.id}</span>
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                        {msg.messageBody}
                                    </p>

                                    {/* Inbound 2-Way Patient Response Thread */}
                                    {msg.patientResponse ? (
                                        <div className="mt-1 p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                                                    <CornerDownRight className="w-3.5 h-3.5 text-teal-600" />
                                                    Patient Reply Received
                                                </span>
                                                <span className="text-[10px] text-teal-600">
                                                    {new Date(msg.patientResponse.receivedAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-teal-800 font-medium italic">
                                                "{msg.patientResponse.replyText}"
                                            </p>
                                            {msg.patientResponse.actionTaken && (
                                                <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1 pt-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                                    EMR Action: {msg.patientResponse.actionTaken}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => {
                                                    setReplyModalMessage(msg);
                                                    setReplyText('1 - Confirmed');
                                                }}
                                                className="text-[11px] text-slate-500 hover:text-teal-600 font-medium flex items-center gap-1 hover:underline"
                                            >
                                                <ArrowRightLeft className="w-3 h-3" /> Simulate Patient Inbound Reply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: Interactive Clinical Composer & Mobile Simulator */}
            {activeTab === 'composer' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Form Column (7 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Dispatch Clinical Notification</h3>
                                <p className="text-xs text-slate-500">
                                    Compose automated SMS/WhatsApp alerts with dynamic tokens.
                                </p>
                            </div>
                            <span className="text-xs font-mono bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md border border-teal-200">
                                Cost: ~KES {composerChannel === 'whatsapp' ? '0.50' : (0.8 * smsSegments).toFixed(2)}
                            </span>
                        </div>

                        {dispatchStatus && (
                            <div
                                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                                    dispatchStatus.success
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                                }`}
                            >
                                {dispatchStatus.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                                <span>{dispatchStatus.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleComposerDispatch} className="space-y-4">
                            {/* Channel Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Primary Channel
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setComposerChannel('whatsapp')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                            composerChannel === 'whatsapp'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold ring-2 ring-emerald-500/20'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                        WhatsApp Business
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setComposerChannel('sms')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                            composerChannel === 'sms'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/20'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                        Direct GSM SMS
                                    </button>
                                </div>
                            </div>

                            {/* Template Preset Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pre-Approved Clinical Template
                                </label>
                                <select
                                    value={selectedTemplateKey}
                                    onChange={(e) => setSelectedTemplateKey(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                                >
                                    {templates.map((tpl) => (
                                        <option key={tpl.key} value={tpl.key}>
                                            {tpl.name} ({tpl.channel.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Patient Name & Recipient Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Patient Name
                                    </label>
                                    <input
                                        type="text"
                                        value={composerPatientName}
                                        onChange={(e) => setComposerPatientName(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800"
                                        placeholder="e.g. Amina Kiprop"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Recipient Mobile Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={composerPhone}
                                        onChange={(e) => setComposerPhone(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 font-mono"
                                        placeholder="+254712345678"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Message Body */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Message Content
                                    </label>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {composerBody.length} characters • {smsSegments} segment(s)
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    value={composerBody}
                                    onChange={(e) => setComposerBody(e.target.value)}
                                    className="w-full p-3 text-xs rounded-xl border border-slate-200 text-slate-800 font-sans"
                                    required
                                />
                            </div>

                            {/* Automatic SMS Fallback Toggle */}
                            {composerChannel === 'whatsapp' && (
                                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="composer-fallback"
                                        checked={enableFallback}
                                        onChange={(e) => setEnableFallback(e.target.checked)}
                                        className="w-4 h-4 text-teal-600 rounded-sm border-slate-300"
                                    />
                                    <label htmlFor="composer-fallback" className="text-xs text-slate-700 cursor-pointer">
                                        <span className="font-semibold">Automatic SMS Fallback:</span> If patient does not have WhatsApp or message fails, automatically route via Africa's Talking SMS.
                                    </label>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={isSending}
                                className={`w-full py-2.5 text-xs font-semibold rounded-xl text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
                                    composerChannel === 'whatsapp'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-teal-600 hover:bg-teal-700'
                                } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? 'Dispatching...' : 'Dispatch Omnichannel Alert Now'}
                            </button>
                        </form>
                    </div>

                    {/* Live Mobile Simulator Preview Column (5 cols) */}
                    <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-5 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto w-full">
                        {/* Mobile Bezel & Status Bar */}
                        <div className="flex items-center justify-between text-slate-400 text-[10px] px-2 mb-3">
                            <span>09:41</span>
                            <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto"></div>
                            <span>5G • 100%</span>
                        </div>

                        {/* App Header */}
                        <div className="bg-slate-800 text-white p-3 rounded-2xl flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-xs">
                                RM
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-semibold leading-tight">
                                    {composerChannel === 'whatsapp' ? 'St. Jude Hospital (Verified)' : 'RAPHAMIS'}
                                </h4>
                                <span className="text-[10px] text-teal-400">
                                    {composerChannel === 'whatsapp' ? 'Business Account' : 'Direct SMS'}
                                </span>
                            </div>
                        </div>

                        {/* Chat / Message Bubble */}
                        <div className="space-y-3 min-h-[260px] flex flex-col justify-end p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                            <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-xs max-w-[85%] text-xs leading-relaxed shadow-sm border border-slate-700 space-y-2">
                                <p>{composerBody || 'Enter message text to preview on device...'}</p>
                                <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
                                    <span>Just now</span>
                                    {composerChannel === 'whatsapp' ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
                                    ) : (
                                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            {/* Simulated Quick Action Buttons for WhatsApp */}
                            {composerChannel === 'whatsapp' && (
                                <div className="space-y-1.5 pt-2">
                                    <button
                                        type="button"
                                        className="w-full py-1.5 bg-slate-800/80 hover:bg-slate-700 text-teal-300 text-[11px] rounded-xl border border-slate-700 font-medium transition-colors"
                                    >
                                        Reply: 1 to Confirm
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] rounded-xl border border-slate-700 font-medium transition-colors"
                                    >
                                        Reply: 2 to Reschedule
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-[10px] text-slate-400 text-center mt-4">
                            Simulated recipient screen on mobile handset.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB 3: Telephony Gateways & Multi-Provider Settings */}
            {activeTab === 'gateways' && (
                <div className="space-y-6">
                    {/* Gateway Testing Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <Terminal className="w-5 h-5 text-teal-600" />
                            <h3 className="text-sm font-bold text-slate-800">Telephony Gateway Diagnostics & Test Ping</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Verify outbound wire routes to Africa's Talking, Twilio, Meta Cloud, or Local GSM modem.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Provider to Test
                                </label>
                                <select
                                    value={testProvider}
                                    onChange={(e) => setTestProvider(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                                >
                                    <option value="AfricasTalking">Africa's Talking (Global)</option>
                                    <option value="Twilio">Twilio Programmable SMS (US / UK / Global)</option>
                                    <option value="WhatsAppCloud">WhatsApp Business Cloud API (Meta)</option>
                                    <option value="LocalGsmGateway">Local GSM Hardware Modem (USB / IP)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Destination Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 font-mono"
                                    placeholder="+254700000000"
                                />
                            </div>
                            <div>
                                <button
                                    onClick={handleRunGatewayTest}
                                    disabled={isTestingGateway}
                                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                                    {isTestingGateway ? 'Testing Route...' : 'Send Test Ping'}
                                </button>
                            </div>
                        </div>

                        {gatewayTestResult && (
                            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700">
                                {gatewayTestResult}
                            </div>
                        )}
                    </div>

                    {/* Providers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Africa's Talking Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                                        AT
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Africa's Talking</h4>
                                        <p className="text-[11px] text-slate-500">Primary for Global Coverage</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Active / Wire Connected
                                </span>
                            </div>

                            <div className="space-y-2 text-xs pt-2">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Alphanumeric Sender ID:</span>
                                    <span className="font-mono font-semibold text-slate-800">RAPHAMIS</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Default Currency:</span>
                                    <span className="font-mono text-slate-800">KES (~0.80 per SMS)</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Two-Way Shortcode:</span>
                                    <span className="font-mono text-slate-800">22144 (USSD & Inbound)</span>
                                </div>
                            </div>
                        </div>

                        {/* Twilio Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                                        TW
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Twilio Messaging</h4>
                                        <p className="text-[11px] text-slate-500">Primary for US, UK, EU, Global routes</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    10DLC Ready
                                </span>
                            </div>

                            <div className="space-y-2 text-xs pt-2">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Compliance:</span>
                                    <span className="text-slate-800 font-medium">HIPAA BAA & TCPA Opt-out</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">SMS Outbound:</span>
                                    <span className="font-mono text-slate-800">+1 (800) 555-0199</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">WhatsApp Sandbox:</span>
                                    <span className="font-mono text-slate-800">whatsapp:+14155238886</span>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Cloud API Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                        WA
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">WhatsApp Business Cloud API</h4>
                                        <p className="text-[11px] text-slate-500">Direct Meta Graph API integration</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Verified Green Badge
                                </span>
                            </div>

                            <div className="space-y-2 text-xs pt-2">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Messaging Window:</span>
                                    <span className="text-slate-800 font-medium">24-Hour Interactive Session</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Templates:</span>
                                    <span className="text-slate-800 font-medium">Meta Pre-Approved Tier 2</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Webhooks:</span>
                                    <span className="font-mono text-slate-800">/api/communication/webhook/*</span>
                                </div>
                            </div>
                        </div>

                        {/* Local GSM Gateway Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                        GSM
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Local GSM Hardware Modem</h4>
                                        <p className="text-[11px] text-slate-500">Offline & Remote Field Clinic Support</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    Hardware Fallback
                                </span>
                            </div>

                            <div className="space-y-2 text-xs pt-2">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Device Protocol:</span>
                                    <span className="font-mono text-slate-800">AT+CMGS (USB Serial / IP)</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Signal RSSI:</span>
                                    <span className="text-slate-800 font-medium">28 (Excellent - 4G/LTE)</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">SIM Card Pool:</span>
                                    <span className="text-slate-800 font-medium">Dual SIM Failover</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: Automation Triggers & Clinical Rules */}
            {activeTab === 'automation' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Automated Clinical Telephony Rules</h3>
                        <p className="text-xs text-slate-500">
                            High-priority automated alerts dispatched by clinical events in RaphaMIS.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <Flame className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">Emergency NEWS2 Triage Escalation Alert</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                        Active
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    When patient NEWS2 Score is calculated &gt;= 7 (High Acuity), instantly dispatch SMS & WhatsApp alert with bed number and vitals to the on-call physician and ward charge nurse.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">24-Hour Consultation Reminder & 2-Way Confirmation</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                        Active
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    Sends interactive WhatsApp message with doctor name and time. Inbound patient reply "1" confirms attendance in EMR; "2" routes reschedule request to reception queue.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">Pharmacy Dispensation & Pickup Locker Token</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                        Active
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    When pharmacist marks prescription as "Dispensed", patient receives secure pickup locker token code and dosage instructions directly on their mobile phone.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">Discharge Digital Gatepass Code</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                        Active
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    Upon cashier financial clearance, sends digital gatepass number via SMS to patient or next-of-kin for presentation at hospital security exit checkpoint.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Action Modal */}
            <QuickMessageModal
                isOpen={isQuickModalOpen}
                onClose={() => setIsQuickModalOpen(false)}
                onMessageSent={refreshData}
            />

            {/* 2-Way Reply Simulation Modal */}
            {replyModalMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                                <h4 className="text-sm font-semibold">Simulate Inbound Patient Reply</h4>
                            </div>
                            <button
                                onClick={() => setReplyModalMessage(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <p className="text-slate-600">
                                Simulate an inbound SMS or WhatsApp webhook response from{' '}
                                <strong className="text-slate-800">{replyModalMessage.recipientPhone}</strong>:
                            </p>

                            <div className="space-y-2">
                                <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                                    Preset Responses
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setReplyText('1 - Confirmed')}
                                        className="p-2 border rounded-xl hover:bg-slate-50 text-left font-medium text-slate-700"
                                    >
                                        1 - Confirmed
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReplyText('2 - Please reschedule to 3PM')}
                                        className="p-2 border rounded-xl hover:bg-slate-50 text-left font-medium text-slate-700"
                                    >
                                        2 - Reschedule
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReplyText('STOP')}
                                        className="p-2 border rounded-xl hover:bg-slate-50 text-left font-medium text-rose-700 col-span-2"
                                    >
                                        STOP (Opt-Out)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                                    Custom Reply Text
                                </label>
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-slate-800"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    onClick={() => setReplyModalMessage(null)}
                                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendSimulatedReply}
                                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                                >
                                    Post Simulated Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
