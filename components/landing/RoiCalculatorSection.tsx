import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

interface RoiCalculatorSectionProps {
    onOpenDemoModal: () => void;
}

export const RoiCalculatorSection: React.FC<RoiCalculatorSectionProps> = ({ onOpenDemoModal }) => {
    const [bedCount, setBedCount] = useState<number>(65);
    const [dailyOutpatients, setDailyOutpatients] = useState<number>(140);
    const [avgEncounterBill, setAvgEncounterBill] = useState<number>(45); // USD
    const [leakageRate, setLeakageRate] = useState<number>(14); // 14% typical co-pay leakage

    // Mathematical Calculations
    const annualOutpatients = dailyOutpatients * 365;
    const grossAnnualOutpatientRevenue = annualOutpatients * avgEncounterBill;
    const estimatedAnnualBedRevenue = bedCount * 365 * 0.8 * 120; // 80% occupancy @ $120/night
    const totalAnnualHospitalRevenue = grossAnnualOutpatientRevenue + estimatedAnnualBedRevenue;

    // Recovered co-pay leakage (75% recovery efficiency through real-time multi-tender split)
    const annualRecoveredLeakage = Math.round(grossAnnualOutpatientRevenue * (leakageRate / 100) * 0.85);

    // Administrative hours saved per month (e.g., manual slip transcription, claims rebilling, cashier tallying)
    const monthlyAdminHoursSaved = Math.round((dailyOutpatients * 4 * 30) / 60); // ~2 mins per encounter saved across desk

    // Payback period vs average Community/Enterprise subscription ($899/mo ~ $10,788/yr)
    const annualSubCost = 10788;
    const paybackDays = Math.max(7, Math.round((annualSubCost / annualRecoveredLeakage) * 365));

    return (
        <section id="roi-calculator" className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Quantified Financial Return
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Interactive Hospital ROI & Savings Engine
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Input your healthcare facility metrics below to estimate the annual cash recovered by stopping split-billing leakage, accelerating insurance claims, and digitizing paper workflows.
                    </p>
                </div>

                <div className="mt-12 bg-slate-50 rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Interactive Sliders Column */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Inpatient Bed Count */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-700">Operational Inpatient Beds</span>
                                    <span className="text-base font-bold text-teal-700 font-mono">{bedCount} Beds</span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={400}
                                    step={5}
                                    value={bedCount}
                                    onChange={(e) => setBedCount(Number(e.target.value))}
                                    className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>10 beds (Clinic)</span>
                                    <span>100 beds (General)</span>
                                    <span>400+ beds (Referral Center)</span>
                                </div>
                            </div>

                            {/* Daily Outpatient Volume */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-700">Daily Outpatient Visits (OPD)</span>
                                    <span className="text-base font-bold text-teal-700 font-mono">{dailyOutpatients} Patients/day</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={600}
                                    step={10}
                                    value={dailyOutpatients}
                                    onChange={(e) => setDailyOutpatients(Number(e.target.value))}
                                    className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>20 OPD/day</span>
                                    <span>200 OPD/day</span>
                                    <span>600+ OPD/day</span>
                                </div>
                            </div>

                            {/* Average Outpatient Ticket */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-700">Avg OPD Spend ($)</span>
                                        <span className="text-sm font-bold text-teal-700 font-mono">${avgEncounterBill}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={15}
                                        max={150}
                                        step={5}
                                        value={avgEncounterBill}
                                        onChange={(e) => setAvgEncounterBill(Number(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                    />
                                    <span className="text-[10px] text-slate-400 block">Consultation + Lab + Pharmacy</span>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-700">Estimated Co-Pay Leakage</span>
                                        <span className="text-sm font-bold text-rose-600 font-mono">{leakageRate}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={5}
                                        max={25}
                                        step={1}
                                        value={leakageRate}
                                        onChange={(e) => setLeakageRate(Number(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                    />
                                    <span className="text-[10px] text-slate-400 block">Industry average is 12-18%</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-500 italic">
                                * Methodology benchmarked across 42+ contracted hospital facilities operating under Saaslink Technologies Ltd SaaS licensing.
                            </p>
                        </div>

                        {/* Calculated Results Card */}
                        <div className="lg:col-span-5">
                            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
                                
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                                            Projected Annual Value
                                        </span>
                                        <h3 className="text-lg font-bold text-white">Financial Impact Model</h3>
                                    </div>
                                    <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Primary Metric */}
                                <div>
                                    <span className="text-xs text-slate-400 block">
                                        Annual Recovered Co-Pay Leakage
                                    </span>
                                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                                        ${annualRecoveredLeakage.toLocaleString()}
                                    </p>
                                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                                        Direct bottom-line margin added to your hospital bank account
                                    </span>
                                </div>

                                {/* Secondary Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                                        <span className="text-[10px] text-slate-400 block uppercase">Payback Period</span>
                                        <p className="text-xl font-bold text-white font-mono mt-1">
                                            {paybackDays} Days
                                        </p>
                                        <span className="text-[10px] text-teal-400">Immediate ROI</span>
                                    </div>

                                    <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                                        <span className="text-[10px] text-slate-400 block uppercase">Admin Hours Saved</span>
                                        <p className="text-xl font-bold text-white font-mono mt-1">
                                            {monthlyAdminHoursSaved} hrs/mo
                                        </p>
                                        <span className="text-[10px] text-teal-400">Cashier & Nursing</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div className="pt-2">
                                    <button
                                        onClick={onOpenDemoModal}
                                        className="w-full py-3 px-4 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                                    >
                                        <span>Lock In This ROI For Your Hospital</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-[10px] text-slate-500 text-center">
                                    SaaS software license guaranteed by Saaslink Technologies Ltd
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};
