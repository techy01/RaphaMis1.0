import React, { useState, useEffect } from 'react';
import {
    X,
    ScanLine,
    CheckCircle2,
    AlertCircle,
    Send,
    Volume2,
    VolumeX,
    User,
    Pill,
    ShieldCheck,
    RotateCcw,
    Zap,
} from 'lucide-react';
import { PharmacyOrder } from '../../packages/shared/types';
import { executeBarcodeVerification } from '../../api/pharmacyApi';

interface BarcodeVerificationModalProps {
    order: PharmacyOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onVerificationSuccess: (updatedOrder: PharmacyOrder) => void;
}

export const BarcodeVerificationModal: React.FC<BarcodeVerificationModalProps> = ({
    order,
    isOpen,
    onClose,
    onVerificationSuccess,
}) => {
    if (!isOpen || !order) return null;

    const [scannedInput, setScannedInput] = useState<string>('');
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'matched' | 'mismatch'>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
    const [isTubeLaunching, setIsTubeLaunching] = useState<boolean>(false);

    // Audio Feedback using Web Audio API
    const playSound = (type: 'success' | 'error') => {
        if (!isAudioEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (type === 'success') {
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc1.frequency.value = 880; // A5
                osc2.frequency.value = 1320; // E6
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc1.start();
                osc2.start(ctx.currentTime + 0.08);
                osc1.stop(ctx.currentTime + 0.35);
                osc2.stop(ctx.currentTime + 0.35);
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = 150;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            }
        } catch {
            // Audio context silently ignored if not supported
        }
    };

    const handleRunVerification = async (barcodeToTest: string) => {
        setScanState('scanning');
        setStatusMessage('Optical scanner reading GS1 DataMatrix 2D barcode...');

        setTimeout(async () => {
            const result = await executeBarcodeVerification(
                order.id,
                barcodeToTest,
                'PharmD. Alex Chen, BCPS'
            );

            if (result.success) {
                setScanState('matched');
                setStatusMessage(result.message);
                playSound('success');
                onVerificationSuccess(result.order);
            } else {
                setScanState('mismatch');
                setStatusMessage(result.message);
                playSound('error');
            }
        }, 600);
    };

    const handleSimulateMatch = () => {
        setScannedInput(order.barcode);
        handleRunVerification(order.barcode);
    };

    const handleSimulateMismatch = () => {
        const fakeBarcode = 'NDC-99999-0000-00-WRONG';
        setScannedInput(fakeBarcode);
        handleRunVerification(fakeBarcode);
    };

    const handleManualScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scannedInput.trim()) return;
        handleRunVerification(scannedInput);
    };

    const handleLaunchTube = () => {
        setIsTubeLaunching(true);
        setTimeout(() => {
            setIsTubeLaunching(false);
            onClose();
        }, 2200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="bg-gray-900 text-white p-5 px-6 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <ScanLine className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">
                                21st-Century Barcode Verification (BCMA)
                            </h2>
                            <p className="text-xs text-gray-400">
                                5-Rights Patient Safety Verification & Tube Station Dispatch
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
                            title={isAudioEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
                        >
                            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Patient & Rx Target Box */}
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Target Patient & Location
                            </span>
                            <span className="font-bold text-gray-900 text-sm block">
                                {order.patientName}
                            </span>
                            <span className="text-gray-500 font-mono text-[11px]">
                                {order.patientMRN} · {order.patientLocation}
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Prescribed Medication
                            </span>
                            <span className="font-bold text-gray-900 text-sm block">
                                {order.medicationName}
                            </span>
                            <span className="text-teal-700 font-semibold text-[11px]">
                                Dose: {order.dose} · {order.route}
                            </span>
                        </div>
                    </div>

                    {/* Laser Scanner Visual HUD */}
                    <div className="relative bg-gray-950 rounded-2xl p-6 text-center text-white overflow-hidden border border-gray-800 shadow-inner flex flex-col items-center justify-center min-h-[190px]">
                        {/* Animated Laser Beam */}
                        <div className="absolute inset-x-8 top-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-[bounce_2s_infinite] opacity-85" />

                        {/* Scanner Target Crosshairs */}
                        <div className="relative z-10 w-48 h-24 border-2 border-dashed border-teal-500/50 rounded-xl flex flex-col items-center justify-center p-2 bg-teal-950/20 backdrop-blur-xs">
                            <ScanLine className="w-8 h-8 text-teal-400 animate-pulse mb-1" />
                            <span className="font-mono text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
                                2D DataMatrix Aim Reticle
                            </span>
                        </div>

                        {/* Status Label in HUD */}
                        <div className="mt-4">
                            <span className="text-xs font-mono text-gray-400 block">Target NDC Barcode:</span>
                            <span className="font-mono text-sm font-bold text-teal-300 tracking-wider">
                                {order.barcode}
                            </span>
                        </div>

                        {scanState === 'matched' && (
                            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400 p-4 animate-in zoom-in-95">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                                <h3 className="text-base font-black text-white">5-RIGHTS VERIFIED MATCH</h3>
                                <p className="text-xs text-emerald-200 mt-1 max-w-md text-center">
                                    {statusMessage}
                                </p>
                            </div>
                        )}

                        {scanState === 'mismatch' && (
                            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-rose-400 p-4 animate-in zoom-in-95">
                                <AlertCircle className="w-12 h-12 text-rose-400 mb-2" />
                                <h3 className="text-base font-black text-white">BARCODE MISMATCH HALT</h3>
                                <p className="text-xs text-rose-200 mt-1 max-w-md text-center">
                                    {statusMessage}
                                </p>
                                <button
                                    onClick={() => setScanState('idle')}
                                    className="mt-3 px-3 py-1 bg-white text-gray-900 rounded-lg text-xs font-bold"
                                >
                                    Reset Scanner
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 5-Rights Patient Safety Checklist */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            5-Rights Clinical Safety Verification
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${scanState === 'matched' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="font-semibold text-gray-800">Right Patient</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${scanState === 'matched' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="font-semibold text-gray-800">Right Drug</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${scanState === 'matched' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="font-semibold text-gray-800">Right Dose</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${scanState === 'matched' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="font-semibold text-gray-800">Right Route</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${scanState === 'matched' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="font-semibold text-gray-800">Right Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Scan Controls & Simulator */}
                    <div className="space-y-3">
                        <form onSubmit={handleManualScanSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={scannedInput}
                                onChange={(e) => setScannedInput(e.target.value)}
                                placeholder="Scan barcode with hardware scanner or enter manually..."
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                            >
                                Verify Tag
                            </button>
                        </form>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] text-gray-400 font-medium">Quick Simulator:</span>
                            <button
                                type="button"
                                onClick={handleSimulateMatch}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Simulate Valid Barcode Scan (Match)</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSimulateMismatch}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 shadow-2xs"
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Simulate Wrong Medication Tag (Error)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-gray-50 border-t border-gray-200 p-4 px-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition"
                    >
                        Close
                    </button>

                    {scanState === 'matched' && (
                        <div className="flex items-center gap-2">
                            {order.deliveryMethod === 'Pneumatic Tube' && (
                                <button
                                    type="button"
                                    onClick={handleLaunchTube}
                                    disabled={isTubeLaunching}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>
                                        {isTubeLaunching
                                            ? `Pressurizing Tube ${order.tubeStationCode || 'Station'}...`
                                            : `Launch Carrier via Pneumatic Tube (${order.tubeStationCode || 'ICU'})`}
                                    </span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                                Complete & Return to Queue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
