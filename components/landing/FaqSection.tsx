import React, { useState } from 'react';
import { ChevronDown, PhoneCall, HelpCircle } from 'lucide-react';

interface FaqSectionProps {
    onOpenPolicyModal: (tab: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa') => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenPolicyModal }) => {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs = [
        {
            q: 'How quickly can RaphaMIS be deployed in our clinic or hospital?',
            a: 'Standard setup and staff training typically takes 2 to 4 business days. Our Nairobi-based team helps you import your patient master list, configure your pharmacy inventory and prices, and train your receptionists, cashiers, nurses, and doctors.'
        },
        {
            q: 'How does M-Pesa payment collection work in RaphaMIS?',
            a: 'RaphaMIS integrates directly with Safaricom Daraja APIs. When a patient arrives at the cashier or pharmacy desk, the cashier simply enters the amount and clicks Send STK. The patient instantly receives an official M-Pesa prompt on their mobile phone, enters their PIN, and the receipt is automatically validated and printed.'
        },
        {
            q: 'Can we bill Social Health Authority (SHA), NHIF, and private insurance?',
            a: 'Yes. RaphaMIS allows you to attach patient insurance details, record pre-authorization amounts, and split the bill so that any remaining co-pay can be paid via M-Pesa or cash before discharge.'
        },
        {
            q: 'Where is your company and support team based?',
            a: 'We are proudly based in Nairobi, Kenya. You can call or WhatsApp our local support team directly on 0720935895 anytime during clinic operating hours for swift technical assistance, on-site visits, or additional staff training.'
        },
        {
            q: 'Do we need to buy expensive servers or specialized computers?',
            a: 'No. RaphaMIS is a secure cloud-based software. It works on any desktop computer, laptop, or tablet with an internet connection. There is no need to purchase, maintain, or replace costly local server hardware.'
        },
        {
            q: 'How is our clinic and patient data protected?',
            a: 'Your medical facility retains 100% legal ownership of your data. All records are encrypted with 256-bit encryption and protected in compliance with the Kenya Data Protection Act 2019.'
        }
    ];

    const toggle = (idx: number) => {
        setOpenIdx(openIdx === idx ? null : idx);
    };

    return (
        <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        Common Inquiries
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Clear answers to how RaphaMIS fits into your clinic’s everyday operations.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="mt-12 space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <div
                                key={idx}
                                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-100/70 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180 text-teal-600' : ''
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Extra Support Question */}
                <div className="mt-10 p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                        Have a specific question not covered here?
                    </p>
                    <a
                        href="tel:0720935895"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call our Nairobi team directly at 0720935895</span>
                    </a>
                </div>

            </div>
        </section>
    );
};
