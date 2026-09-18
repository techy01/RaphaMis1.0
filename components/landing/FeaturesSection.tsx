import React from 'react';
import { 
    CreditCard, Users, Bed, Activity, Pill, 
    BarChart3, CheckCircle2, PhoneCall, ArrowRight, Shield
} from 'lucide-react';

interface FeaturesSectionProps {
    onOpenDemoModal: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onOpenDemoModal }) => {
    const modules = [
        {
            icon: Users,
            title: 'Patient Registration & Triage',
            description: 'Fast, organized patient reception for busy outpatient clinics and hospitals.',
            points: [
                'Search by Kenyan National ID, phone number, or MRN in under 2 seconds',
                'Digital vitals entry: Blood Pressure, Pulse, Temperature, SpO2, and Weight',
                'Automated triage level categorization and doctor consultation queue',
                'Patient visit history with instant access to past encounters'
            ]
        },
        {
            icon: Activity,
            title: 'Doctor Workstation & Digital EMR',
            description: 'Paperless clinical documentation designed to keep doctors focused on patient care.',
            points: [
                'Structured SOAP notes: Subjective, Objective, Assessment, and Plan',
                'ICD-10 clinical diagnosis search and custom clinic disease favorites',
                'Instant electronic prescriptions sent directly to the hospital pharmacy',
                'One-click laboratory and radiology investigation ordering'
            ]
        },
        {
            icon: CreditCard,
            title: 'Billing & Split-Tender POS',
            description: 'Fast co-pay collection with direct Safaricom M-Pesa and insurance validation.',
            points: [
                'Direct Safaricom Daraja M-Pesa STK push directly to patient mobile phones',
                'Support for SHA (Social Health Authority), NHIF, and private insurance schemes',
                'Flexible bill splitting: easily split an invoice across Insurance, M-Pesa, and Cash',
                'Official itemized invoices and receipt printing with cashier audit logs'
            ]
        },
        {
            icon: Pill,
            title: 'Pharmacy & Stock Inventory',
            description: 'Complete medication dispensing and real-time inventory tracking.',
            points: [
                'Automatic doctor prescription routing directly to pharmacy dispensary screen',
                'Real-time stock level counters with automatic reorder threshold notifications',
                'Batch number and expiry date tracking to prevent expired drug losses',
                'Detailed medicine pricing and daily sales reconciliation'
            ]
        },
        {
            icon: Activity,
            title: 'Laboratory & Diagnostics (LIS)',
            description: 'Direct communication between doctors and the diagnostic laboratory.',
            points: [
                'Digital test requests appear instantly in the lab technician worklist',
                'Direct result entry with standard biological reference range flags',
                'Critical panic-value alerts highlighted for urgent clinician review',
                'Clean printable laboratory investigation reports with doctor sign-off'
            ]
        },
        {
            icon: Bed,
            title: 'Inpatient Wards & Bed Management',
            description: 'Clear visibility over hospital beds, admissions, and ward transfers.',
            points: [
                'Live ward occupancy view across General, Maternity, Pediatric, and ICU beds',
                'Daily nursing rounds, vital signs monitoring charts, and medication schedules',
                'Automated daily bed charges and consolidated inpatient billing',
                'Standardized discharge summaries and patient clearance verification'
            ]
        }
    ];

    return (
        <section id="modules" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        System Modules
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Everything Your Clinic or Hospital Needs
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        RaphaMIS connects every department in your medical facility into a single, straightforward platform so information flows seamlessly from reception to discharge.
                    </p>
                </div>

                {/* 6 Clean Module Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mb-4">
                                    <mod.icon className="w-5 h-5" />
                                </div>
                                
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                                    {mod.title}
                                </h3>
                                
                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                    {mod.description}
                                </p>

                                <ul className="space-y-2 text-xs text-slate-600">
                                    {mod.points.map((pt, pIdx) => (
                                        <li key={pIdx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                                            <span>{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Direct Action Strip */}
                <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-sm text-slate-900">
                            Want to see these modules in action for your facility?
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                            We can demonstrate RaphaMIS in 20 minutes online or on-site in Nairobi.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <a
                            href="tel:0720935895"
                            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                            <span>0720935895</span>
                        </a>

                        <button
                            onClick={onOpenDemoModal}
                            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            <span>Book Demo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};
