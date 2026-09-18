import React from 'react';
import { Shield, Lock, CheckCircle2, Server, FileText, KeyRound, EyeOff, Building2 } from 'lucide-react';

interface TrustSecuritySectionProps {
    onOpenPolicyModal: (tab: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa') => void;
}

export const TrustSecuritySection: React.FC<TrustSecuritySectionProps> = ({ onOpenPolicyModal }) => {
    const certifications = [
        {
            title: 'HIPAA & HITECH Compliant',
            description: 'Strict administrative, physical, and technical safeguards. Business Associate Agreements (BAA) signed with every hospital tenant.',
            tag: 'Health Privacy Standard'
        },
        {
            title: 'Kenya Data Protection Act 2019',
            description: 'Fully aligned with Office of the Data Protection Commissioner (ODPC) guidelines for clinical data sovereignty and patient rights.',
            tag: 'National Legislation'
        },
        {
            title: 'ISO/IEC 27001 & SOC 2 Type II',
            description: 'Hosted in certified tier-3 data centers with continuous third-party penetration testing and 24/7 SIEM monitoring.',
            tag: 'Infrastructure Security'
        },
        {
            title: 'HL7 & FHIR R4 Interoperability',
            description: 'Standardized healthcare data schemas for seamless communication with national disease registries and insurance portals.',
            tag: 'Clinical Interoperability'
        },
        {
            title: 'AES-256 & TLS 1.3 Cryptography',
            description: 'Every database record and DICOM radiograph is encrypted at rest using AES-256 and in transit via TLS 1.3 cryptographic ciphers.',
            tag: 'Cryptographic Protection'
        },
        {
            title: 'Multi-Tenant Logical Isolation',
            description: 'Row-level security enforcement guarantees that no hospital facility can access, view, or query data belonging to another tenant.',
            tag: 'Tenant Guard'
        }
    ];

    return (
        <section id="compliance" className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        Zero Compromise Healthcare Security
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Bank-Grade Encryption & Legal Protection for Hospital Data
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Medical data is the most sensitive asset on earth. <strong>Saaslink Technologies Ltd</strong> shields your hospital from regulatory penalties, unauthorized breaches, and clinical liabilities.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {certifications.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    {item.tag}
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>

                            <h3 className="font-bold text-base text-slate-900">
                                {item.title}
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Legal & Corporate Liability Box */}
                <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-base sm:text-lg font-bold text-white">
                                    Statutory Protection for Saaslink Technologies Ltd & Subscribing Tenants
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Clear demarcation of clinical responsibility, full limitation of liability, and mutual indemnification.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => onOpenPolicyModal('terms')}
                                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                            >
                                Master SaaS Terms
                            </button>
                            <button
                                onClick={() => onOpenPolicyModal('privacy')}
                                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => onOpenPolicyModal('baa')}
                                className="px-3.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-xs"
                            >
                                Review BAA Addendum
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
                        <div className="space-y-1">
                            <span className="font-bold text-teal-400 block">Zero Medical Malpractice Liability</span>
                            <p className="text-[11px] text-slate-400">
                                Licensed clinicians retain 100% sole responsibility for clinical diagnosis and prescriptions. Saaslink Technologies Ltd disclaims medical outcome liability.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="font-bold text-teal-400 block">Strict Limitation of Liability</span>
                            <p className="text-[11px] text-slate-400">
                                Commercial liability is contractually capped at 3 months of paid fees or $1,000 USD, completely excluding indirect or consequential damages.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="font-bold text-teal-400 block">Tenant Data Ownership</span>
                            <p className="text-[11px] text-slate-400">
                                You own 100% of your hospital records. Saaslink Technologies Ltd never sells, accesses for advertising, or withholds patient charts.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
