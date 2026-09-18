import React from 'react';
import { Star, Quote, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            quote: 'Before RaphaMIS, our hospital was leaking over 17% in uncollected co-pays between NHIF/SHA pre-auth and patient cash. RaphaMIS’s multi-tender split billing forced automated reconciliation before the patient walked out. We recovered $72,000 in lost margin in the very first quarter.',
            author: 'Beatrice Wangari, MBA',
            title: 'Chief Financial Officer & Head of Revenue Cycle',
            hospital: 'St. Luke Specialized Medical Center',
            details: '85 Inpatient Beds • Nairobi',
            stat: '+18.4% Revenue Recovered'
        },
        {
            quote: 'Our surgeons and physicians were previously exhausted from waiting 4 hours for paper laboratory results and chasing physical X-ray films. With RaphaMIS, lab analyzers feed results directly into the doctor’s screen in under 18 minutes. It fundamentally transformed our clinical speed.',
            author: 'Dr. Andrew Kiprono, M.D., FCS',
            title: 'Medical Director & Chief of Surgery',
            hospital: 'Metropolitan Referral Hospital',
            details: '160 Inpatient Beds • Level 5',
            stat: '18 min Diagnostic Turnaround'
        },
        {
            quote: 'Managing 4 satellite polyclinics and a main referral hospital on fragmented local servers was an operational nightmare. Saaslink Technologies Ltd migrated our entire network to RaphaMIS in 3 weeks with zero downtime. Centralized patient records now move seamlessly across branches.',
            author: 'Eng. Patrick Omondi',
            title: 'Group Chief Technology Officer',
            hospital: 'Apex Healthcare Network',
            details: '4 Multi-Branch Hospitals • 320 Total Beds',
            stat: '99.99% Cloud Reliability'
        }
    ];

    return (
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        Operational Turnarounds
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Trusted by 42+ Medical Directors & Hospital CFOs
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Read how healthcare executives eliminated revenue leakage, streamlined emergency wards, and digitized paper records with RaphaMIS.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {testimonials.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                        {item.stat}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                                    "{item.quote}"
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-1">
                                <h4 className="font-bold text-sm text-slate-900">{item.author}</h4>
                                <p className="text-xs text-teal-700 font-medium">{item.title}</p>
                                <div className="text-[11px] text-slate-500 pt-0.5 flex items-center justify-between">
                                    <span>{item.hospital}</span>
                                    <span>{item.details}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};
