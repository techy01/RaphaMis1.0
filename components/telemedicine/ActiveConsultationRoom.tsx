import React, { useState, useEffect, useRef } from 'react';
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    PhoneOff,
    ScreenShare,
    Sparkles,
    Activity,
    Heart,
    FileText,
    Pill,
    Stethoscope,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Maximize2,
    Minimize2,
    ShieldCheck,
    Send,
    Plus,
    X,
    Image,
    Layers,
    Clock,
    User,
} from 'lucide-react';
import {
    TelemedicineAppointment,
    ConsultationTranscriptItem,
    DiagnosticSuggestion,
} from '../../packages/shared/types';
import { completeConsultation } from '../../api/telemedicineApi';

interface ActiveConsultationRoomProps {
    appointment: TelemedicineAppointment;
    onEndCall: () => void;
}

export const ActiveConsultationRoom: React.FC<ActiveConsultationRoomProps> = ({
    appointment,
    onEndCall,
}) => {
    // Media Controls State
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
    const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
    const [useRealWebcam, setUseRealWebcam] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [activeRightTab, setActiveRightTab] = useState<'scribe' | 'cdss' | 'rx' | 'chat' | 'imaging'>('scribe');

    // Call duration timer
    const [callSeconds, setCallSeconds] = useState<number>(142); // starts at ~2:22 for realism
    useEffect(() => {
        const timer = setInterval(() => {
            setCallSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimer = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Video references for webcam
    const videoRef = useRef<HTMLVideoElement | null>(null);
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (useRealWebcam && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((s) => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                })
                .catch(() => {
                    setUseRealWebcam(false);
                });
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [useRealWebcam]);

    // Live Dynamic Vitals
    const [currentVitals, setCurrentVitals] = useState(appointment.rpmVitals);
    useEffect(() => {
        const vitalsInterval = setInterval(() => {
            setCurrentVitals((prev) => ({
                ...prev,
                heartRate: Math.min(110, Math.max(65, prev.heartRate + (Math.floor(Math.random() * 3) - 1))),
                spO2: Math.min(100, Math.max(96, prev.spO2 + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
            }));
        }, 2500);
        return () => clearInterval(vitalsInterval);
    }, []);

    // Ambient Transcript State
    const [transcript, setTranscript] = useState<ConsultationTranscriptItem[]>([
        {
            id: 'tr_1',
            speaker: 'Physician',
            text: `Good morning, ${appointment.patientName.split(' ')[0]}. I'm reviewing your continuous telemetry here on our secure terminal. How are you feeling today?`,
            timestamp: '00:08',
        },
        {
            id: 'tr_2',
            speaker: 'Patient',
            text: `Thank you, Doctor. Over the past few mornings I've been noticing lightheadedness about an hour after taking my morning pills, and my heart felt like it was racing for a few minutes.`,
            timestamp: '00:24',
        },
        {
            id: 'tr_3',
            speaker: 'AI Copilot',
            text: `[Telemetry Analysis] Automated ECG rhythm strip recorded trace premature ventricular contractions (PVCs). Blood pressure cuff recorded 142/90 mmHg at 08:30.`,
            timestamp: '00:45',
        },
        {
            id: 'tr_4',
            speaker: 'Physician',
            text: `I can see that right here on your connected cuff. Have you experienced any shortness of breath, chest tightness, or ankle swelling along with the dizziness?`,
            timestamp: '01:10',
        },
        {
            id: 'tr_5',
            speaker: 'Patient',
            text: `No chest pain or swelling, just the dizzy sensation when standing up quickly.`,
            timestamp: '01:28',
        },
    ]);

    // New simulated dialogue generator
    const handleAddSimulatedSpeech = () => {
        const lines: ConsultationTranscriptItem[] = [
            {
                id: `tr_${Date.now()}`,
                speaker: 'Physician',
                text: 'Your lung sounds and oxygen saturation (98%) are completely normal. We should adjust your antihypertensive regimen to smooth out the absorption curve.',
                timestamp: formatTimer(callSeconds),
            },
            {
                id: `tr_${Date.now() + 1}`,
                speaker: 'Patient',
                text: 'That sounds great. Should I continue monitoring my blood pressure every morning on the app?',
                timestamp: formatTimer(callSeconds + 4),
            },
            {
                id: `tr_${Date.now() + 2}`,
                speaker: 'AI Copilot',
                text: '[Prescriptive Suggestion] Recommends switching Lisinopril administration to evening dosing or adding low-dose Amlodipine 2.5mg. Allergy check: No contraindications found.',
                timestamp: formatTimer(callSeconds + 7),
            },
        ];
        setTranscript((prev) => [...prev, ...lines]);
    };

    // Live AI SOAP Notes
    const [soapNotes, setSoapNotes] = useState({
        subjective:
            appointment.soapNotes?.subjective ||
            `${appointment.patientAge}-year-old presenting for virtual cardiology follow-up. Reports episodic morning dizziness and palpitations occurring approximately 1 hour post-ingestion of morning antihypertensives. Denies syncope, angina, or dyspnea.`,
        objective:
            appointment.soapNotes?.objective ||
            `RPM Vitals: BP ${currentVitals.bloodPressure} mmHg, HR ${currentVitals.heartRate} bpm (sinus tachycardia with trace PVCs), SpO2 ${currentVitals.spO2}% on room air. Telemetry demonstrates alert, articulate demeanor without respiratory distress.`,
        assessment:
            appointment.soapNotes?.assessment ||
            '1. Essential Hypertension with suspected mild post-dose orthostatic hypotension.\n2. Benign episodic premature ventricular complexes (PVCs).',
        plan:
            appointment.soapNotes?.plan ||
            '1. Titrate Lisinopril to evening administration.\n2. Maintain continuous daily RPM cuff telemetry.\n3. Prescribe low-dose Amlodipine 2.5mg daily.\n4. Virtual telemetry check-in in 2 weeks.',
    });

    // Diagnostic Suggestions
    const diagnosticSuggestions: DiagnosticSuggestion[] = [
        {
            icd10: 'I10',
            condition: 'Essential (Primary) Hypertension',
            probability: 94,
            supportingFindings: ['Repeated systolic > 140 mmHg', 'Known hypertensive history', 'ACE-inhibitor titration'],
            contraindications: ['Avoid NSAIDs'],
        },
        {
            icd10: 'I49.3',
            condition: 'Ventricular Premature Depolarization',
            probability: 78,
            supportingFindings: ['Trace PVCs on telemetry', 'Patient reported palpitations'],
            contraindications: ['Limit excessive caffeine intake'],
        },
        {
            icd10: 'I95.1',
            condition: 'Orthostatic Hypotension',
            probability: 68,
            supportingFindings: ['Post-ingestion lightheadedness', 'Positional dizziness'],
            contraindications: ['Avoid abrupt position shifts'],
        },
    ];

    // Prescriptions State
    const [prescriptions, setPrescriptions] = useState<
        Array<{ medication: string; dosage: string; frequency: string; instructions: string }>
    >([
        {
            medication: 'Amlodipine Besylate',
            dosage: '2.5mg',
            frequency: 'Once daily PO at bedtime',
            instructions: 'Monitor blood pressure 30 minutes after waking.',
        },
    ]);

    const [newMedName, setNewMedName] = useState<string>('Metoprolol Tartrate');
    const [newMedDosage, setNewMedDosage] = useState<string>('25mg');
    const [newMedFreq, setNewMedFreq] = useState<string>('Twice daily PO');

    // Drug Allergy Check
    const [allergyWarning, setAllergyWarning] = useState<string | null>(null);
    useEffect(() => {
        if (appointment.allergies?.some((a) => a.toLowerCase().includes('penicillin')) && newMedName.toLowerCase().includes('amoxicillin')) {
            setAllergyWarning('CRITICAL CONTRAINDICATION: Patient has documented Penicillin allergy!');
        } else {
            setAllergyWarning(null);
        }
    }, [newMedName, appointment.allergies]);

    const handleAddPrescription = () => {
        if (!newMedName) return;
        setPrescriptions((prev) => [
            ...prev,
            {
                medication: newMedName,
                dosage: newMedDosage,
                frequency: newMedFreq,
                instructions: 'Take with food and full glass of water.',
            },
        ]);
        setNewMedName('');
    };

    // In-Call Chat Messages
    const [chatMessages, setChatMessages] = useState([
        { sender: 'Patient', text: 'Dr. Lin, I uploaded my latest blood pressure log from this morning.', time: '09:12' },
        { sender: 'Dr. Sarah Lin', text: 'Received Eleanor, reviewing your data in the RPM HUD now.', time: '09:13' },
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        setChatMessages((prev) => [
            ...prev,
            {
                sender: 'Dr. Sarah Lin',
                text: chatInput,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
        setChatInput('');
    };

    // Conclude and Sync Modal
    const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
    const [isSubmittingEHR, setIsSubmittingEHR] = useState<boolean>(false);

    const handleCompleteAndSync = async () => {
        setIsSubmittingEHR(true);
        try {
            await completeConsultation(appointment.id, {
                soapNotes,
                prescriptions,
                diagnosis: 'I10 - Essential Hypertension & Benign Palpitations',
                vitals: currentVitals,
            });
            onEndCall();
        } catch {
            onEndCall();
        } finally {
            setIsSubmittingEHR(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none">
            {/* Top Bar: Telemedicine Header & Encryption */}
            <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-bold text-sm tracking-tight text-white">
                            {appointment.roomCode}
                        </span>
                    </div>
                    <span className="text-slate-500">|</span>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200">
                            {appointment.patientName}
                        </span>
                        <span className="text-[11px] text-slate-400">({appointment.patientMRN})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {appointment.urgency}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Call Duration */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs font-mono font-semibold text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimer(callSeconds)}</span>
                    </div>

                    {/* Security Protocol */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-teal-300/90 bg-teal-950/40 px-2.5 py-1 rounded-full border border-teal-800/50">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>256-Bit E2E Encrypted</span>
                    </div>

                    {/* End Call Button */}
                    <button
                        onClick={() => setIsReviewOpen(true)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-900/30"
                    >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>End & Sync EHR</span>
                    </button>
                </div>
            </div>

            {/* Main Stage: Left Video + RPM HUD, Right Interactive Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Side: Video Canvas & RPM HUD */}
                <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
                    {/* Primary Patient Video Stream */}
                    <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden">
                        {/* If real webcam toggled and not video off */}
                        {useRealWebcam && !isVideoOff ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            /* Simulated 21st-Century HD Clinical Feed */
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Subtle Clinical Background Simulation */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:16px_16px]" />

                                {/* Avatar & Audio Waves */}
                                <div className="text-center z-10 space-y-4">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 border-4 border-teal-400/40 shadow-2xl flex items-center justify-center text-4xl font-extrabold text-white">
                                            {appointment.patientName
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px]">
                                            ✓
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-wide">
                                            {appointment.patientName}
                                        </h3>
                                        <p className="text-xs text-teal-300 font-medium mt-0.5">
                                            Remote Patient Audio/Video Active • 4K HDR 60fps
                                        </p>
                                    </div>

                                    {/* Audio Speaking Equalizer Waveform */}
                                    <div className="flex items-center justify-center gap-1 h-5 pt-1">
                                        {[40, 70, 90, 60, 100, 75, 45, 80, 50].map((h, i) => (
                                            <span
                                                key={i}
                                                className="w-1 bg-teal-400 rounded-full animate-pulse"
                                                style={{
                                                    height: `${h}%`,
                                                    animationDelay: `${i * 120}ms`,
                                                    animationDuration: '600ms',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top-Right Clinician PiP (Picture-in-Picture) */}
                        <div className="absolute top-4 right-4 w-40 sm:w-52 aspect-video bg-slate-900/90 rounded-xl border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-md z-20">
                            <div className="w-full h-full flex flex-col justify-between p-2 relative bg-slate-800/80">
                                <div className="flex items-center justify-between text-[10px] text-slate-300">
                                    <span className="font-bold truncate">{appointment.providerName}</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>

                                <div className="text-center my-auto">
                                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">
                                        Dr.
                                    </div>
                                    <span className="text-[10px] text-slate-400">Host Clinician Feed</span>
                                </div>

                                <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-700/60 pt-1">
                                    <span>Mic: {isMuted ? 'Muted' : 'Live'}</span>
                                    <span>1080p 60fps</span>
                                </div>
                            </div>
                        </div>

                        {/* Top-Left Telemetry Indicator Tag */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                                <span className="font-semibold text-slate-200">RPM Continuous Stream</span>
                                <span className="text-emerald-400 font-mono text-[11px]">Synced (12ms)</span>
                            </div>
                        </div>

                        {/* Bottom Continuous RPM Telemetry HUD Overlay */}
                        <div className="absolute bottom-20 inset-x-4 z-20">
                            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                                {/* Heart Rate with pulsing icon */}
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30 text-rose-400">
                                        <Heart className="w-4 h-4 animate-bounce" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Heart Rate</span>
                                        <span className="text-base font-extrabold text-white font-mono">
                                            {currentVitals.heartRate}{' '}
                                            <span className="text-xs font-normal text-slate-400">bpm</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Blood Pressure */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Continuous BP</span>
                                    <span className="text-base font-extrabold text-white font-mono">
                                        {currentVitals.bloodPressure}{' '}
                                        <span className="text-xs font-normal text-slate-400">mmHg</span>
                                    </span>
                                </div>

                                {/* Pulse Oximeter SpO2 */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2 Oxygen</span>
                                    <span className="text-base font-extrabold text-teal-400 font-mono">
                                        {currentVitals.spO2}%
                                    </span>
                                </div>

                                {/* Respiratory Rate */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Resp. Rate</span>
                                    <span className="text-base font-extrabold text-white font-mono">
                                        {currentVitals.respiratoryRate}{' '}
                                        <span className="text-xs font-normal text-slate-400">rpm</span>
                                    </span>
                                </div>

                                {/* Animated ECG Rhythm Wave */}
                                <div className="col-span-2 sm:col-span-1 bg-black/50 rounded-lg p-2 border border-slate-700/60 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                        <span>LEAD II ECG</span>
                                        <span className="text-emerald-400">SR Normal</span>
                                    </div>
                                    <div className="h-6 w-full flex items-center overflow-hidden">
                                        <svg className="w-full h-full text-emerald-400" viewBox="0 0 200 30" fill="none">
                                            <path
                                                d="M0 15 L20 15 L30 15 L35 8 L42 22 L48 2 L54 28 L60 15 L70 15 L90 15 L100 15 L105 8 L112 22 L118 2 L124 28 L130 15 L140 15 L160 15 L170 15 L175 8 L182 22 L188 2 L194 28 L200 15"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Media Controls Toolbar */}
                    <div className="h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
                        {/* Left: Device Toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setUseRealWebcam(!useRealWebcam)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                                    useRealWebcam
                                        ? 'bg-teal-600 text-white border-teal-500'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                }`}
                                title="Toggle between local device webcam and high-definition clinical simulator"
                            >
                                <VideoIcon className="w-3.5 h-3.5" />
                                <span>{useRealWebcam ? 'Local Webcam' : 'Clinical Sim Feed'}</span>
                            </button>
                        </div>

                        {/* Center: Core Call Controls */}
                        <div className="flex items-center gap-3">
                            {/* Mute Button */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3 rounded-full transition shadow-md ${
                                    isMuted
                                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {/* Video Button */}
                            <button
                                onClick={() => setIsVideoOff(!isVideoOff)}
                                className={`p-3 rounded-full transition shadow-md ${
                                    isVideoOff
                                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                                title={isVideoOff ? 'Turn video on' : 'Turn video off'}
                            >
                                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                            </button>

                            {/* Screen Share */}
                            <button
                                onClick={() => setIsScreenSharing(!isScreenSharing)}
                                className={`p-3 rounded-full transition shadow-md ${
                                    isScreenSharing
                                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                                title="Share Screen / Diagnostic Studies"
                            >
                                <ScreenShare className="w-5 h-5" />
                            </button>

                            {/* Complete Encounter Button */}
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-950/40"
                            >
                                <PhoneOff className="w-4 h-4" />
                                <span>End & Document</span>
                            </button>
                        </div>

                        {/* Right: Dialogue Simulator Helper */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddSimulatedSpeech}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                                title="Simulate real-time conversation progress"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                                <span>Simulate Dialogue</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: 21st-Century Interactive Clinical Workspace */}
                <div className="w-full lg:w-[460px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
                    {/* Tabs Header */}
                    <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto bg-slate-950/60">
                        <button
                            onClick={() => setActiveRightTab('scribe')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                activeRightTab === 'scribe'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                            <span>Ambient Scribe</span>
                        </button>

                        <button
                            onClick={() => setActiveRightTab('cdss')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                activeRightTab === 'cdss'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                            <span>CDSS AI</span>
                        </button>

                        <button
                            onClick={() => setActiveRightTab('rx')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                activeRightTab === 'rx'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Pill className="w-3.5 h-3.5 text-purple-400" />
                            <span>E-Prescribe ({prescriptions.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveRightTab('chat')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                activeRightTab === 'chat'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Chat</span>
                        </button>

                        <button
                            onClick={() => setActiveRightTab('imaging')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                activeRightTab === 'imaging'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Image className="w-3.5 h-3.5 text-amber-400" />
                            <span>Studies</span>
                        </button>
                    </div>

                    {/* Workspace Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                        {/* TAB 1: AMBIENT SCRIBE & LIVE TRANSCRIPT */}
                        {activeRightTab === 'scribe' && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-start gap-2.5">
                                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-teal-200">Ambient AI Clinical Scribe Active</p>
                                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                            Synthesizing audio stream into structured EHR documentation in real-time. Review or edit sections below.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Transcript Feed */}
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                        Live Dialogue Stream
                                    </span>
                                    <div className="space-y-2 max-h-48 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                        {transcript.map((item) => (
                                            <div key={item.id} className="text-xs space-y-0.5">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span
                                                        className={`font-bold ${
                                                            item.speaker === 'Physician'
                                                                ? 'text-teal-400'
                                                                : item.speaker === 'AI Copilot'
                                                                ? 'text-purple-400 font-mono'
                                                                : 'text-blue-300'
                                                        }`}
                                                    >
                                                        {item.speaker}
                                                    </span>
                                                    <span className="text-slate-500 font-mono">{item.timestamp}</span>
                                                </div>
                                                <p className="text-slate-200 leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto-Synthesized SOAP Notes */}
                                <div className="space-y-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                        Generated SOAP Note Draft
                                    </span>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-teal-400">Subjective (S)</label>
                                        <textarea
                                            rows={2}
                                            value={soapNotes.subjective}
                                            onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-teal-500 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-teal-400">Objective (O)</label>
                                        <textarea
                                            rows={2}
                                            value={soapNotes.objective}
                                            onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-teal-500 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-teal-400">Assessment (A)</label>
                                        <textarea
                                            rows={2}
                                            value={soapNotes.assessment}
                                            onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-teal-500 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-teal-400">Plan (P)</label>
                                        <textarea
                                            rows={2}
                                            value={soapNotes.plan}
                                            onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-teal-500 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CDSS & DIAGNOSTIC AI */}
                        {activeRightTab === 'cdss' && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-start gap-2.5">
                                    <Stethoscope className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-200">Clinical Decision Support System</p>
                                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                            Real-time ICD-10 differential diagnosis, symptom correlation, and evidence-based clinical guidelines.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {diagnosticSuggestions.map((item) => (
                                        <div
                                            key={item.icd10}
                                            className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-xs">{item.condition}</span>
                                                    <code className="px-1.5 py-0.2 bg-blue-900/40 text-blue-300 rounded text-[10px] font-mono">
                                                        {item.icd10}
                                                    </code>
                                                </div>
                                                <span className="text-emerald-400 font-bold text-xs">
                                                    {item.probability}% match
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                                    Detected Clinical Markers:
                                                </span>
                                                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                                                    {item.supportingFindings.map((f, idx) => (
                                                        <li key={idx}>{f}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {item.contraindications.length > 0 && (
                                                <div className="p-2 bg-rose-950/30 rounded border border-rose-900/40 flex items-center gap-1.5 text-rose-300 text-[10px]">
                                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{item.contraindications[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: E-PRESCRIBING */}
                        {activeRightTab === 'rx' && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-start gap-2.5">
                                    <Pill className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-purple-200">Electronic Prescriptions Dispatch</p>
                                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                            Prescribe directly during the encounter with automated drug-allergy cross-referencing.
                                        </p>
                                    </div>
                                </div>

                                {allergyWarning && (
                                    <div className="p-3 bg-rose-950/60 border border-rose-700 text-rose-200 rounded-xl flex items-center gap-2 font-bold text-xs animate-bounce">
                                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                                        <span>{allergyWarning}</span>
                                    </div>
                                )}

                                {/* Add New Medication */}
                                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                        Formulary Quick-Prescribe
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-0.5">Medication</label>
                                            <input
                                                type="text"
                                                value={newMedName}
                                                onChange={(e) => setNewMedName(e.target.value)}
                                                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                                                placeholder="e.g. Lisinopril"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-0.5">Dosage</label>
                                            <input
                                                type="text"
                                                value={newMedDosage}
                                                onChange={(e) => setNewMedDosage(e.target.value)}
                                                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                                                placeholder="e.g. 10mg"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-0.5">Frequency / Sig</label>
                                        <input
                                            type="text"
                                            value={newMedFreq}
                                            onChange={(e) => setNewMedFreq(e.target.value)}
                                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                                            placeholder="e.g. Once daily PO"
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddPrescription}
                                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add to Prescription Order</span>
                                    </button>
                                </div>

                                {/* Current Prescriptions */}
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                        Ordered for Transmission ({prescriptions.length})
                                    </span>
                                    {prescriptions.map((rx, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-bold text-white text-xs">{rx.medication} - {rx.dosage}</p>
                                                <p className="text-slate-400 text-[11px] mt-0.5">{rx.frequency}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                                Ready
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: IN-CALL SECURE CHAT */}
                        {activeRightTab === 'chat' && (
                            <div className="flex flex-col h-[400px] justify-between">
                                <div className="space-y-2 overflow-y-auto p-2">
                                    {chatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-2.5 rounded-lg max-w-[85%] text-xs space-y-1 ${
                                                msg.sender === 'Dr. Sarah Lin'
                                                    ? 'bg-teal-700 text-white ml-auto'
                                                    : 'bg-slate-800 text-slate-200 mr-auto'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                                                <span className="font-bold">{msg.sender}</span>
                                                <span>{msg.time}</span>
                                            </div>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type secure message..."
                                        className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: DIAGNOSTIC STUDIES & IMAGING */}
                        {activeRightTab === 'imaging' && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-2.5">
                                    <Image className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-200">Diagnostic Studies Visualizer</p>
                                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                            Interactive viewer for patient imaging, rhythm strips, and lab panels.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* 12-Lead Rhythm Strip */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-white text-xs">Continuous Rhythm Strip (Lead II)</span>
                                            <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
                                        </div>
                                        <div className="h-20 bg-black rounded-lg border border-slate-800 p-2 flex items-center justify-center">
                                            <svg className="w-full h-full text-emerald-400" viewBox="0 0 400 40" fill="none">
                                                <path
                                                    d="M0 20 L40 20 L50 20 L55 8 L62 32 L68 4 L74 36 L80 20 L110 20 L130 20 L140 20 L145 8 L152 32 L158 4 L164 36 L170 20 L200 20 L220 20 L230 20 L235 8 L242 32 L248 4 L254 36 L260 20 L290 20 L310 20 L320 20 L325 8 L332 32 L338 4 L344 36 L350 20 L400 20"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Chest Radiograph Simulation */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-white text-xs">Recent Chest Radiograph (PA View)</span>
                                            <span className="text-[10px] text-slate-400">Recorded 2026-09-08</span>
                                        </div>
                                        <div className="h-36 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                                            <div className="text-center space-y-1">
                                                <Layers className="w-8 h-8 text-teal-500 mx-auto" />
                                                <p className="font-medium text-slate-300">Cardiothoracic Ratio: 0.48 (Normal)</p>
                                                <p className="text-[10px] text-slate-500">Lungs clear, no pulmonary edema.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Complete Encounter & EHR Sync Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white text-gray-900 rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Finalize Virtual Encounter & Sync EHR
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Review electronic documentation before signing and committing to patient record.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReviewOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[70vh] overflow-y-auto">
                            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg space-y-1">
                                <span className="text-[10px] font-bold uppercase text-teal-800 block">Patient Details</span>
                                <p className="font-bold text-gray-900 text-sm">{appointment.patientName} ({appointment.patientMRN})</p>
                                <p className="text-gray-600">Encounter Duration: {formatTimer(callSeconds)} • Attending: {appointment.providerName}</p>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold text-gray-900 uppercase block mb-1">
                                    EHR Clinical Note Summary
                                </span>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1 text-gray-700">
                                    <p><strong>Subjective:</strong> {soapNotes.subjective}</p>
                                    <p><strong>Objective:</strong> {soapNotes.objective}</p>
                                    <p><strong>Assessment:</strong> {soapNotes.assessment}</p>
                                    <p><strong>Plan:</strong> {soapNotes.plan}</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold text-gray-900 uppercase block mb-1">
                                    E-Prescriptions ({prescriptions.length})
                                </span>
                                <div className="space-y-1.5">
                                    {prescriptions.map((rx, idx) => (
                                        <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                                            <span><strong>{rx.medication}</strong> {rx.dosage} - {rx.frequency}</span>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                Dispatched
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                            <button
                                onClick={() => setIsReviewOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition"
                            >
                                Return to Call
                            </button>
                            <button
                                onClick={handleCompleteAndSync}
                                disabled={isSubmittingEHR}
                                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isSubmittingEHR ? 'Committing to EHR...' : 'Electronically Sign & Close'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
