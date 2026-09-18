import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Phone, Mail, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        facilityName: '',
        facilityType: 'Outpatient Clinic / Medical Center',
        contactName: '',
        phone: '',
        email: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const handleReset = () => {
        setSubmitted(false);
        onClose();
    };

    const handleStaffLogin = () => {
        onClose();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
                
                {/* Modal Header */}
                <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                                Saaslink Technologies • Nairobi
                            </span>
                            <h3 className="text-base font-bold text-white">
                                Book a RaphaMIS Demonstration
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-5 sm:p-6">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                See how RaphaMIS handles patient consultations, M-Pesa billing, pharmacy stock, and lab tests for your healthcare facility.
                            </p>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        placeholder="e.g. Dr. John Kimani"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Clinic / Hospital Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.facilityName}
                                        onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                                        placeholder="e.g. Nairobi Health Clinic"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Phone / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0720935895"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Facility Type
                                        </label>
                                        <select
                                            value={formData.facilityType}
                                            onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white"
                                        >
                                            <option>Outpatient Clinic / Medical Center</option>
                                            <option>General Hospital (Inpatient Beds)</option>
                                            <option>Maternity & Nursing Home</option>
                                            <option>Specialized Surgical Center</option>
                                            <option>Multi-Branch Health Network</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Official Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter official email address"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <a
                                    href="tel:0720935895"
                                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>Call 0720935895 directly</span>
                                </a>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                    <span>Schedule Demo</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Submitted View */
                        <div className="py-6 text-center space-y-3">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900">
                                Request Received!
                            </h4>
                            <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                Thank you, <strong className="text-slate-900">{formData.contactName || 'Doctor'}</strong>. Our team at Saaslink Technologies in Nairobi will contact you on <strong className="text-slate-900">{formData.phone}</strong> to confirm your demonstration.
                            </p>

                            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                                <a
                                    href="https://wa.me/254720935895"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-1.5"
                                >
                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    <span>WhatsApp Us (0720935895)</span>
                                </a>
                                <button
                                    onClick={handleReset}
                                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Strip */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Helpline: 0720935895 • info@saaslink.tech</span>
                    <span>Nairobi, Kenya</span>
                </div>

            </div>
        </div>
    );
};
