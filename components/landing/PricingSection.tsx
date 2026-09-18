import React, { useState } from 'react';
import { Check, PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
    onOpenDemoModal: () => void;
    onOpenSubscriptionCheckout?: (tierName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
    onOpenDemoModal,
    onOpenSubscriptionCheckout,
}) => {
    const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');

    const tiers = [
        {
            name: 'Clinic Starter',
            badge: 'Outpatient Focus',
            target: 'Dispensaries, Specialized Medical Centers, Polyclinics',
            kesPrice: '25,000',
            usdPrice: '199',
            description: 'Everything a busy outpatient clinic needs to run paperless consultations and collect payments instantly.',
            features: [
                'Outpatient (OPD) Registration & Triage queue',
                'Doctor EMR & SOAP Clinical Notes',
                'Billing with direct Safaricom M-Pesa STK push',
                'Pharmacy dispensing & real-time stock counts',
                'Laboratory test requisitions and result entry',
                'Up to 10 staff accounts',
                'Encrypted cloud backup',
                'Dedicated phone & WhatsApp support (0720935895)'
            ],
            popular: false
        },
        {
            name: 'Hospital Standard',
            badge: 'Most Popular',
            target: 'Inpatient Facilities, Maternity & Nursing Homes, Level 4 Hospitals',
            kesPrice: '65,000',
            usdPrice: '499',
            description: 'Complete hospital workflow coverage from emergency reception to inpatient bed discharge and insurance claims.',
            features: [
                'All Clinic Starter features included',
                'Inpatient Wards (IPD) & Bed Occupancy management',
                'Nursing vital charts and daily ward rounds',
                'Multi-tender split billing (SHA, NHIF, Insurance + M-Pesa)',
                'Integrated LIS diagnostic laboratory reports',
                'FEFO pharmacy inventory with expiry date alerts',
                'Up to 35 staff accounts',
                'On-site staff training in Nairobi & priority support'
            ],
            popular: true
        },
        {
            name: 'Enterprise Network',
            badge: 'Large Facilities',
            target: 'Multi-Branch Hospital Chains, Surgical Centers, Referral Hospitals',
            kesPrice: 'Custom',
            usdPrice: 'Custom',
            description: 'Customized deployment for high-volume healthcare institutions and multi-branch hospital networks.',
            features: [
                'All Hospital Standard capabilities',
                'Centralized multi-facility administration & reporting',
                'Inter-branch patient medical records transfer',
                'Custom laboratory analyzer & PACS/DICOM interfacing',
                'Unlimited doctor, nurse, and cashier accounts',
                'Dedicated Technical Account Manager',
                'Tailored on-site implementation & SLAs'
            ],
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        Clear & Transparent
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Simple Monthly Subscription Plans
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Predictable pricing with no hidden server or maintenance fees. Includes continuous cloud hosting, automatic updates, and local support.
                    </p>

                    {/* Currency Toggle */}
                    <div className="pt-2 flex items-center justify-center">
                        <div className="inline-flex items-center p-1 bg-white rounded-lg border border-slate-200 text-xs font-bold">
                            <button
                                onClick={() => setCurrency('KES')}
                                className={`px-3 py-1.5 rounded-md transition-all ${
                                    currency === 'KES'
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                KES (Kenyan Shillings)
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`px-3 py-1.5 rounded-md transition-all ${
                                    currency === 'USD'
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                USD ($)
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3 Pricing Cards */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {tiers.map((tier, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                                tier.popular
                                    ? 'bg-white border-2 border-teal-600 shadow-md relative'
                                    : 'bg-white border border-slate-200 shadow-xs'
                            }`}
                        >
                            {tier.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-teal-600 text-white shadow-xs">
                                    {tier.badge}
                                </span>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {tier.name}
                                    </h3>
                                    {!tier.popular && (
                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            {tier.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="text-[11px] text-teal-700 font-medium mb-3">
                                    {tier.target}
                                </p>

                                <div className="mb-4">
                                    {tier.kesPrice === 'Custom' ? (
                                        <div className="text-3xl font-extrabold text-slate-900">
                                            Custom Quote
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-slate-500 font-medium">
                                                {currency === 'KES' ? 'KES' : '$'}
                                            </span>
                                            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                                {currency === 'KES' ? tier.kesPrice : tier.usdPrice}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                / month
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                                    {tier.description}
                                </p>

                                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Included Features:
                                    </p>
                                    <ul className="space-y-2 text-xs text-slate-600">
                                        {tier.features.map((feat, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-2">
                                                <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                                <button
                                    onClick={() => {
                                        if (onOpenSubscriptionCheckout) {
                                            onOpenSubscriptionCheckout(tier.name);
                                        } else {
                                            onOpenDemoModal();
                                        }
                                    }}
                                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                                        tier.popular
                                            ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                                    }`}
                                >
                                    <span>Get Started with {tier.name}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>

                                <a
                                    href="tel:0720935895"
                                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 text-center"
                                >
                                    <PhoneCall className="w-3 h-3 text-teal-600" />
                                    <span>Or call 0720935895 to discuss</span>
                                </a>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Footnote on Onboarding */}
                <div className="mt-10 text-center text-xs text-slate-500 max-w-xl mx-auto space-y-1">
                    <p className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Free staff onboarding and initial setup assistance included for all plans.
                    </p>
                    <p>
                        Need an on-site demonstration at your clinic in Nairobi? Call us directly at <strong className="text-slate-800 font-bold">0720935895</strong>.
                    </p>
                </div>

            </div>
        </section>
    );
};
