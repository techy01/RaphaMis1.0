import React, { useState } from 'react';
import { 
    PhoneCall, MessageSquare, Mail, MapPin, 
    CheckCircle2, Send, Clock, Building2 
} from 'lucide-react';

export const ContactSection: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        facilityName: '',
        phone: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="contact" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        Get In Touch
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        We’re Based in Nairobi, Kenya
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Ready to digitize your clinic or hospital? Call us directly, send a WhatsApp message, or leave your details below for a quick demonstration.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Info Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Direct Phone Card */}
                        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Direct Phone Support</p>
                                    <a 
                                        href="tel:0720935895" 
                                        className="text-lg font-extrabold text-slate-900 hover:text-teal-600 transition-colors"
                                    >
                                        0720935895
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Available Monday to Saturday, 8:00 AM – 6:00 PM EAT for inquiries, consultations, and support.
                            </p>
                            <div className="pt-2 flex gap-2">
                                <a
                                    href="tel:0720935895"
                                    className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>Call Now</span>
                                </a>
                                <a
                                    href="https://wa.me/254720935895"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        {/* Location & Entity Card */}
                        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Headquarters</p>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Nairobi, Kenya
                                    </h4>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                <strong>Saaslink Technologies Ltd</strong><br />
                                Providing modern healthcare software and on-site implementation across Kenya.
                            </p>
                        </div>

                        {/* Email Card */}
                        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Email Inquiries</p>
                                    <a 
                                        href="mailto:info@saaslink.tech" 
                                        className="text-sm font-bold text-slate-900 hover:text-teal-600"
                                    >
                                        info@saaslink.tech
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Form */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">
                                        Request a Demonstration
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Fill in your details and our Nairobi team will get back to you promptly.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Dr. John / Administrator"
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Clinic / Hospital Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.facilityName}
                                            onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                                            placeholder="e.g. Nairobi Medical Center"
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Phone Number (WhatsApp preferred) *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="e.g. 0720935895"
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Brief Note or Questions (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Tell us about your facility (e.g. number of beds, outpatient only, or current software)..."
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <p className="text-[11px] text-slate-400">
                                        Or call directly: <strong className="text-slate-700">0720935895</strong>
                                    </p>

                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Submit Request</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">
                                    Thank you, {form.name || 'Doctor'}!
                                </h4>
                                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                    We have received your request for <strong>{form.facilityName || 'your facility'}</strong>. A member of our Nairobi team will reach out on <strong className="text-slate-900">{form.phone || 'your number'}</strong> shortly.
                                </p>
                                <div className="pt-3">
                                    <a
                                        href="https://wa.me/254720935895"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                                    >
                                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                                        <span>Message us immediately on WhatsApp (0720935895)</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </section>
    );
};
