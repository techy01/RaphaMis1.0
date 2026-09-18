import React, { useState } from 'react';
import {
    Activity,
    PhoneCall,
    Building2,
    Shield,
    CheckCircle2,
    ArrowLeft,
    Clock,
    Lock,
    ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SubscriptionCheckoutModal } from '../subscription/SubscriptionCheckoutModal';
import { SubscriptionTier, BillingCycle } from '../../packages/shared/types';

export const SubscriptionCheckoutView: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('Starter Clinic');
    const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('Annually');
    const [modalOpen, setModalOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
            {/* Navigation Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-base text-slate-900 tracking-tight">
                            Rapha<span className="text-teal-600">MIS</span>
                        </span>
                        <span className="text-[11px] text-slate-500 block -mt-1 font-medium">
                            School & Hospital Subscription Portal
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-3 text-xs">
                    <a
                        href="tel:+1 800 555 1234"
                        className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-teal-600 font-semibold"
                    >
                        <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                        <span>Support: +1 800 555 1234</span>
                    </a>
                    <button
                        onClick={() => navigate('/')}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Home</span>
                    </button>
                </div>
            </header>

            {/* Main Content / Re-open Modal */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xs border border-slate-200 p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Institutional Subscription & Onboarding
                        </h2>
                        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                            Setup RaphaMIS for your school, clinic, or healthcare facility with Mobile Money STK Push, Card, or Wire Transfer.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                            <span>Open Subscription Checkout</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Embedded Modal */}
            <SubscriptionCheckoutModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialTier={selectedTier}
                initialBillingCycle={selectedCycle}
                onSuccess={(tenant) => {
                    // Stay on screen or navigate to login
                }}
            />

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
                RaphaMIS Hospital & School Health Information System • Saaslink Technologies Limited, New York, USA • Call +1 800 555 1234
            </footer>
        </div>
    );
};
