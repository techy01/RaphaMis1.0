import React from 'react';
import { 
    MapPin, PhoneCall, ShieldCheck, Zap, 
    CheckCircle2, Laptop, MessageSquare, ArrowRight 
} from 'lucide-react';

interface WhyUsSectionProps {
    onOpenDemoModal: () => void;
}

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({ onOpenDemoModal }) => {
    return (
        <section id="why-us" className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        Local Advantage
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Why Clinics & Hospitals Choose RaphaMIS
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Healthcare software should make your staff's work easier, not complicated. We combine modern cloud technology with dedicated on-the-ground support right here in Nairobi.
                    </p>
                </div>

                {/* 4 Pillars Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Pillar 1: Nairobi Support */}
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-base text-slate-900">
                                Based in Nairobi with Local Support
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Our development and technical support team is located right here in Nairobi, Kenya. When you need help, you speak directly with our team at <strong className="text-slate-900 font-bold">0720935895</strong>. We provide on-site staff training and deployment support so your team is confident from day one.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Kenyan Healthcare Integrations */}
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-base text-slate-900">
                                Native M-Pesa & Local Insurance Workflows
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Stop cashier delays and uncollected co-pays. RaphaMIS triggers instant Safaricom M-Pesa STK prompts to patient phones, manages SHA and NHIF claim documentation, and splits bills across insurance, mobile money, and cash without accounting confusion.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: No Expensive Servers */}
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Laptop className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-base text-slate-900">
                                Zero Server Hardware Headaches
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                No need to invest hundreds of thousands of shillings in noisy physical server towers, local databases, or dedicated IT technicians. RaphaMIS runs securely in the cloud on any desktop, laptop, or tablet with a standard internet connection.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 4: Privacy & Kenya DPA 2019 */}
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-base text-slate-900">
                                Encrypted & Kenya Data Protection Compliant
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Your patient medical records and financial books belong 100% to your facility. Patient data is encrypted at rest and in transit, with role-based access control ensuring doctors, cashiers, and nurses only see the data they need.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Local Contact Banner */}
                <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-teal-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-lg sm:text-xl font-bold">
                            Speak Directly with Our Team in Nairobi
                        </h3>
                        <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
                            Have questions about setting up RaphaMIS in your clinic or hospital? We are available to discuss your workflow and schedule a walk-through.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="tel:0720935895"
                            className="px-5 py-3 text-xs font-bold text-teal-950 bg-white hover:bg-teal-50 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <PhoneCall className="w-4 h-4 text-teal-700" />
                            <span>0720935895</span>
                        </a>

                        <a
                            href="https://wa.me/254720935895"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Chat on WhatsApp</span>
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
};
