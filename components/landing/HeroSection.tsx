import React from 'react';
import { 
    ArrowRight, PhoneCall, MessageSquare, ShieldCheck, 
    CheckCircle2, Users, CreditCard, Pill, Activity, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
    onOpenDemoModal: () => void;
    onScrollToModules?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
    onOpenDemoModal
}) => {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Hero Header Area */}
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    
                    {/* Location & Product Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                        <span>Hospital Management System • Based in Nairobi, Kenya</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                        Simple, Complete Hospital & Clinic Software for Kenya
                    </h1>

                    {/* Subheading */}
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                        Manage patient registrations, doctor consultations, instant M-Pesa and insurance billing, pharmacy stock, and lab tests in one reliable cloud system. Built for Kenyan healthcare facilities, with on-site setup and local support right here in Nairobi.
                    </p>

                    {/* Primary Contact & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            onClick={onOpenDemoModal}
                            className="px-6 py-3.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                        >
                            <span>Book a Free Demo</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <a
                            href="tel:0720935895"
                            className="px-5 py-3.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <PhoneCall className="w-4 h-4 text-teal-600" />
                            <span>Call 0720935895</span>
                        </a>

                        <a
                            href="https://wa.me/254720935895"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-3.5 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>WhatsApp Us</span>
                        </a>

                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-3.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Staff Portal Sign In
                        </button>
                    </div>

                    {/* Quick Trust Highlights */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Direct Safaricom Daraja M-Pesa
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            SHA, NHIF & Private Insurance
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            Kenya Data Protection Act 2019 Compliant
                        </span>
                    </div>

                </div>

                {/* Minimalist Overview Cards: How RaphaMIS Connects Your Facility */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">
                            Registration & Triage
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Fast patient file creation with National ID or phone search, digital vitals recording, and organized doctor queues.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">
                            Doctor Consultation & EMR
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Structured clinical notes (SOAP), diagnosis with ICD-10 search, digital prescriptions, and one-click lab requests.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">
                            M-Pesa & Insurance Billing
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Send direct M-Pesa STK prompts to patient phones, verify insurance pre-auth, and issue clear itemized receipts.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                            <Pill className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">
                            Pharmacy & Stock Alerts
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Dispense doctor prescriptions directly, track stock counts in real time, and receive automatic expiry date warnings.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
};
