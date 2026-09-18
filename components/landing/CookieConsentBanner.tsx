import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2 } from 'lucide-react';

interface CookieConsentBannerProps {
    onOpenPolicy: (tab: 'cookies' | 'terms' | 'privacy') => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPolicy }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Always true and locked
        functional: true,
        analytics: true,
    });

    useEffect(() => {
        const stored = localStorage.getItem('raphamis_cookie_consent');
        if (!stored) {
            // Small delay for clean page entry
            const timer = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (prefs: { essential: boolean; functional: boolean; analytics: boolean }) => {
        localStorage.setItem('raphamis_cookie_consent', JSON.stringify({
            ...prefs,
            timestamp: new Date().toISOString(),
            operator: 'Saaslink Technologies Ltd'
        }));
        setIsVisible(false);
    };

    const handleAcceptAll = () => {
        saveConsent({ essential: true, functional: true, analytics: true });
    };

    const handleEssentialOnly = () => {
        saveConsent({ essential: true, functional: false, analytics: false });
    };

    const handleSaveCustom = () => {
        saveConsent(preferences);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-300">
                {!showCustomizer ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Cookie className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Cookie Notice & Healthcare Data Safeguards
                                    </h4>
                                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        Saaslink Technologies Ltd
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    RaphaMIS uses strictly necessary authentication cookies and encrypted performance telemetry to ensure secure hospital operations and 99.9% uptime. 
                                    <strong className="text-slate-800"> We never deploy advertising cookies or track Protected Health Information (PHI).</strong>
                                </p>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => onOpenPolicy('cookies')}
                                        className="text-teal-700 hover:text-teal-800 underline font-medium"
                                    >
                                        Read Cookie Policy
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={() => onOpenPolicy('privacy')}
                                        className="text-teal-700 hover:text-teal-800 underline font-medium"
                                    >
                                        Privacy Policy
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={() => onOpenPolicy('terms')}
                                        className="text-teal-700 hover:text-teal-800 underline font-medium"
                                    >
                                        Terms of Service
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <button
                                onClick={() => setShowCustomizer(true)}
                                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <Settings2 className="w-3.5 h-3.5" />
                                Customize
                            </button>
                            <button
                                onClick={handleEssentialOnly}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Essential Only
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Accept All
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Detailed Customizer View */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    Granular Cookie Preferences
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Configure which data telemetry categories you permit during this session.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCustomizer(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            {/* Essential */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">Strictly Necessary</span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">
                                        Required
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                    Authentication, security tokens, CSRF protection, and load balancing. Cannot be disabled.
                                </p>
                            </div>

                            {/* Functional */}
                            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">Preferences</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.functional}
                                        onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-600">
                                    Remembers your currency display (USD, KES, EUR), ward view filters, and UI density.
                                </p>
                            </div>

                            {/* Analytics */}
                            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">System Telemetry</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-600">
                                    Anonymized load time and network diagnostic metrics for infrastructure tuning.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setShowCustomizer(false)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSaveCustom}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
