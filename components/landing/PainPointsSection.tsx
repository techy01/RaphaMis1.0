import React, { useState } from 'react';
import { 
    AlertOctagon, CheckCircle2, TrendingDown, TrendingUp, DollarSign, 
    Layers, Bed, Pill, ShieldAlert, FileX, Zap, ArrowRight 
} from 'lucide-react';

interface PainPointsSectionProps {
    onOpenDemoModal: () => void;
}

export const PainPointsSection: React.FC<PainPointsSectionProps> = ({ onOpenDemoModal }) => {
    const [activeComparison, setActiveComparison] = useState<'all' | 'billing' | 'clinical' | 'pharmacy'>('all');

    const painPoints = [
        {
            category: 'billing',
            icon: DollarSign,
            color: 'rose',
            title: 'Multi-Tender Revenue Leakage & Co-Pay Walkouts',
            metric: '18% to 28% Revenue Lost',
            problem: 'Patients arrive with insurance covering only 70-80% of costs. Disconnected cashier desks fail to split the bill between insurer pre-auth, M-Pesa STK prompts, and cash in real time. Patients leave with uncollected co-pays, creating unrecoverable accounts receivable.',
            solution: 'RaphaMIS multi-tender POS reconciles primary insurer pre-authorization, Daraja M-Pesa STK push, and card terminals within a single encounter. Encounters cannot be discharged without 100% balance reconciliation, eliminating revenue leakage.',
            quantifiedImpact: 'Zero uncollected co-pays • Days in A/R cut from 64 to 12 days'
        },
        {
            category: 'clinical',
            icon: Layers,
            color: 'amber',
            title: 'Siloed Diagnostic Islands & 5-Hour Turnarounds',
            metric: '4 to 8 Hour Delays',
            problem: 'Laboratory (LIS), Radiology (PACS), and Inpatient wards operate on separate legacy software or manual slips. Doctors waste hours chasing paper lab reports or calling radiology desks for DICOM scans while patients wait in crowded corridors.',
            solution: 'Unified clinical workstation feeds bidirectional LIS analyzers and cloud DICOM imaging directly to the attending physician’s screen. Critical alert thresholds trigger instant notifications on nurse tablets.',
            quantifiedImpact: 'Diagnostic turnaround slashed to under 18 minutes'
        },
        {
            category: 'clinical',
            icon: Bed,
            color: 'blue',
            title: 'Inpatient Bed Blindspots & Emergency Boarding',
            metric: '22% Unused Capacity',
            problem: 'Charge nurses and clinical executives rely on whiteboard tallies to track bed occupancy. Cleaned beds remain unassigned for hours while emergency room patients board in hallways awaiting ward admission.',
            solution: 'Real-time graphical ward map with live telemetry across ICU, HDU, Pediatric, and General wards. Automated housekeeping notification loops and predicted discharge schedules accelerate bed turnover.',
            quantifiedImpact: 'Bed turnover velocity increased by 38% without physical expansion'
        },
        {
            category: 'pharmacy',
            icon: Pill,
            color: 'purple',
            title: 'Pharmacy Stockouts & Expiry Wastage',
            metric: '12% Inventory Expired',
            problem: 'High-value medications expire on back shelves unnoticed while essential emergency drugs stock out. Manual paper dispensing causes drug interaction omissions and stock pilferage.',
            solution: 'Smart First-Expired, First-Out (FEFO) algorithm prioritizes expiring batches, triggers automated supplier reorders at threshold buffers, and flags drug-drug interactions before the nurse dispenses.',
            quantifiedImpact: 'Drug expiry losses dropped to 0.4% • Zero stockouts of life-saving drugs'
        },
        {
            category: 'billing',
            icon: ShieldAlert,
            color: 'emerald',
            title: 'Regulatory Exposure & Illegible Medical Records',
            metric: 'Millions at Risk',
            problem: 'Paper charts, unencrypted spreadsheets, and untracked record alterations create catastrophic liability under HIPAA and data protection acts, leaving hospitals defenseless in malpractice disputes.',
            solution: 'Immutable cryptographic audit trails, 256-bit AES encryption at rest, role-based access control, and master legal compliance agreements backed by Saaslink Technologies Ltd.',
            quantifiedImpact: '100% audit-ready compliance with zero data breach penalties'
        }
    ];

    const filtered = activeComparison === 'all' 
        ? painPoints 
        : painPoints.filter(p => p.category === activeComparison);

    return (
        <section id="pain-points" className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                        Operational Reality Check
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        The 5 Silent Profit Traps Draining Modern Hospitals
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Healthcare providers don't fail because of poor medicine—they struggle because of disjointed legacy software. Here is how RaphaMIS replaces manual bottlenecks with automated precision.
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="flex justify-center gap-2 mt-8 mb-10 overflow-x-auto no-scrollbar py-1">
                    <button
                        onClick={() => setActiveComparison('all')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                            activeComparison === 'all' 
                                ? 'bg-slate-900 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All Operational Traps ({painPoints.length})
                    </button>
                    <button
                        onClick={() => setActiveComparison('billing')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                            activeComparison === 'billing' 
                                ? 'bg-slate-900 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Billing & Multi-Tender Revenue
                    </button>
                    <button
                        onClick={() => setActiveComparison('clinical')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                            activeComparison === 'clinical' 
                                ? 'bg-slate-900 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Clinical EHR, Beds & Diagnostics
                    </button>
                    <button
                        onClick={() => setActiveComparison('pharmacy')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                            activeComparison === 'pharmacy' 
                                ? 'bg-slate-900 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Pharmacy & Supply Chain
                    </button>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all shadow-xs"
                        >
                            {/* Card Top Title & Metric */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                        <item.icon className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base text-slate-900">
                                            {item.title}
                                        </h3>
                                        <span className="text-xs font-semibold text-rose-600">
                                            {item.metric}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Before vs After Box */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                
                                {/* The Problem (Legacy Hospital) */}
                                <div className="p-3.5 bg-white rounded-xl border border-rose-100 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
                                        <FileX className="w-3.5 h-3.5" />
                                        <span>Legacy Trap</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {item.problem}
                                    </p>
                                </div>

                                {/* The Solution (RaphaMIS by Saaslink) */}
                                <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                        <span>RaphaMIS Advantage</span>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        {item.solution}
                                    </p>
                                </div>

                            </div>

                            {/* Bottom Quantified Outcome */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span>{item.quantifiedImpact}</span>
                                </div>
                                <button
                                    onClick={onOpenDemoModal}
                                    className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                                >
                                    <span>See live</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Banner Strip */}
                <div className="mt-12 p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
                    <div className="space-y-1 text-center md:text-left">
                        <h4 className="text-base sm:text-lg font-bold text-white">
                            Ready to audit and eliminate revenue leakage at your hospital?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Our clinical systems team conducts an obligation-free 30-minute operational analysis for hospital leaders.
                        </p>
                    </div>
                    <button
                        onClick={onOpenDemoModal}
                        className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                    >
                        Schedule Free Hospital Systems Audit
                    </button>
                </div>

            </div>
        </section>
    );
};
