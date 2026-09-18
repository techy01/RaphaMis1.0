import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Activity, PhoneCall, Menu, X, ArrowRight, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LandingNavbarProps {
    onOpenDemoModal: () => void;
    onOpenPolicyModal: (tab: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa') => void;
    onOpenSubscriptionCheckout?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ 
    onOpenDemoModal,
    onOpenPolicyModal,
    onOpenSubscriptionCheckout,
}) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
            {/* Top Contact & Location Bar */}
            <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="font-medium text-slate-200">Hospital & Clinic Management Information System</span>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-slate-400 hidden sm:inline">Nairobi, Kenya</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] sm:text-xs">
                        <span className="text-slate-400 hidden md:inline">Contact / Support:</span>
                        <a 
                            href="tel:0720935895" 
                            className="hover:text-teal-300 flex items-center gap-1.5 font-bold text-teal-400 tracking-wide"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>0720935895</span>
                        </a>
                        <a 
                            href="https://wa.me/254720935895" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                                        Rapha<span className="text-teal-600">MIS</span>
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 -mt-1 font-medium">
                                    by Saaslink Technologies • Nairobi
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
                        <button
                            onClick={() => scrollToSection('modules')}
                            className="hover:text-teal-600 transition-colors py-2"
                        >
                            Core Modules
                        </button>
                        <button
                            onClick={() => scrollToSection('why-us')}
                            className="hover:text-teal-600 transition-colors py-2"
                        >
                            Why RaphaMIS
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="hover:text-teal-600 transition-colors py-2"
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => scrollToSection('faq')}
                            className="hover:text-teal-600 transition-colors py-2"
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="hover:text-teal-600 transition-colors py-2"
                        >
                            Contact Us
                        </button>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden sm:flex items-center gap-3">
                        <a
                            href="tel:0720935895"
                            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                            <span>0720935895</span>
                        </a>

                        <button
                            onClick={onOpenDemoModal}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Book a Demo
                        </button>

                        <button
                            onClick={() => {
                                if (onOpenSubscriptionCheckout) {
                                    onOpenSubscriptionCheckout();
                                } else {
                                    navigate('/subscribe');
                                }
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
                        >
                            Subscribe
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {isAuthenticated ? 'Staff Console' : 'Sign In'}
                        </button>
                    </div>

                    {/* Mobile Hamburger Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <a
                            href="tel:0720935895"
                            className="p-2 text-teal-600 bg-teal-50 rounded-lg border border-teal-200"
                            title="Call 0720935895"
                        >
                            <PhoneCall className="w-4 h-4" />
                        </a>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Slide-down Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
                    <div className="grid gap-2 text-sm font-medium text-slate-700">
                        <button
                            onClick={() => scrollToSection('modules')}
                            className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                        >
                            Core Modules
                        </button>
                        <button
                            onClick={() => scrollToSection('why-us')}
                            className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                        >
                            Why RaphaMIS (Kenya)
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => scrollToSection('faq')}
                            className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                        >
                            Contact
                        </button>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <a
                            href="tel:0720935895"
                            className="w-full py-2.5 px-4 text-xs font-bold text-center text-teal-800 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-center gap-2"
                        >
                            <PhoneCall className="w-4 h-4 text-teal-600" />
                            <span>Call 0720935895</span>
                        </a>
                        <a
                            href="https://wa.me/254720935895"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 text-xs font-bold text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>WhatsApp: 0720935895</span>
                        </a>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onOpenDemoModal();
                            }}
                            className="w-full py-2.5 px-4 text-xs font-bold text-center text-white bg-teal-600 rounded-lg"
                        >
                            Book a Demo
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                navigate('/login');
                            }}
                            className="w-full py-2.5 px-4 text-xs font-semibold text-center text-slate-700 bg-slate-100 rounded-lg"
                        >
                            Staff Login
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};
