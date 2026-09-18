import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Activity, PhoneCall, Mail, MapPin, 
    Shield, FileText, Lock, AlertTriangle, ArrowUpRight, MessageSquare 
} from 'lucide-react';

interface LandingFooterProps {
    onOpenPolicyModal: (tab: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa') => void;
    onOpenDemoModal: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
    onOpenPolicyModal,
    onOpenDemoModal
}) => {
    return (
        <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-900">
                    
                    {/* Brand & Nairobi Company Info */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-base text-white tracking-tight">
                                Rapha<span className="text-teal-500">MIS</span>
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                            The complete, cloud-based Hospital Management System engineered for clinics and hospitals across Kenya. Developed and supported by <strong>Saaslink Technologies Ltd</strong>, based in Nairobi, Kenya.
                        </p>

                        <div className="space-y-2 pt-1 text-xs">
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <span>Headquarters: Nairobi, Kenya</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <PhoneCall className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <span>Helpline / WhatsApp: </span>
                                <a href="tel:0720935895" className="text-teal-400 font-bold hover:underline">
                                    0720935895
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <span>Email: </span>
                                <a href="mailto:info@saaslink.tech" className="hover:text-white">
                                    info@saaslink.tech
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                            Navigation
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li>
                                <a href="#modules" className="hover:text-teal-400 transition-colors">
                                    Core System Modules
                                </a>
                            </li>
                            <li>
                                <a href="#why-us" className="hover:text-teal-400 transition-colors">
                                    Why RaphaMIS in Kenya
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="hover:text-teal-400 transition-colors">
                                    Subscription Plans & Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#faq" className="hover:text-teal-400 transition-colors">
                                    Frequently Asked Questions
                                </a>
                            </li>
                            <li>
                                <button onClick={onOpenDemoModal} className="hover:text-teal-400 transition-colors text-left">
                                    Book a Demonstration
                                </button>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                                    <span>Staff Console Sign In</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Statutory Legal Protection (Saaslink Technologies Ltd) */}
                    <div className="lg:col-span-4 space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-teal-400" />
                            <span>Legal & Statutory Compliance</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li>
                                <button
                                    onClick={() => onOpenPolicyModal('terms')}
                                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-left"
                                >
                                    <FileText className="w-3.5 h-3.5 text-teal-500" />
                                    <span>Master SaaS Terms of Service</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenPolicyModal('privacy')}
                                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-left"
                                >
                                    <Lock className="w-3.5 h-3.5 text-teal-500" />
                                    <span>Privacy & Kenya DPA 2019 Policy</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenPolicyModal('disclaimer')}
                                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Medical Practice Disclaimer</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenPolicyModal('baa')}
                                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-left"
                                >
                                    <Shield className="w-3.5 h-3.5 text-teal-500" />
                                    <span>Business Associate & Security Addendum</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenPolicyModal('cookies')}
                                    className="hover:text-teal-400 transition-colors text-left"
                                >
                                    <span>Cookies & Telemetry Policy</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Statutory Legal Disclaimer */}
                <div className="py-6 border-b border-slate-900 text-[11px] text-slate-500 leading-relaxed space-y-2">
                    <p>
                        <strong className="text-slate-400">Statutory Disclaimer:</strong> RaphaMIS is an administrative, clinical documentation, billing, and operational software application provided by <strong className="text-slate-300">Saaslink Technologies Ltd</strong> (Nairobi, Kenya). Saaslink Technologies Ltd is not a licensed healthcare provider, medical practice, pharmacy, or diagnostic laboratory. All patient diagnoses, medication prescriptions, therapeutic interventions, and clinical decisions remain the sole, independent responsibility of licensed healthcare practitioners. Saaslink Technologies Ltd disclaims liability for medical negligence or diagnostic interpretations in accordance with applicable laws.
                    </p>
                </div>

                {/* Bottom Strip */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div>
                        © {new Date().getFullYear()} <strong className="text-slate-300">Saaslink Technologies Ltd</strong>. All rights reserved. Nairobi, Kenya.
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <a 
                            href="tel:0720935895" 
                            className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 font-mono"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            0720935895
                        </a>
                        <span>•</span>
                        <a 
                            href="https://wa.me/254720935895" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
