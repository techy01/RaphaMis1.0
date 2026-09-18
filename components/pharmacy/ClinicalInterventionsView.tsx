import React, { useState, useMemo } from 'react';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    HeartPulse,
    Search,
    PlusCircle,
    X,
    UserCheck,
    FileCheck,
} from 'lucide-react';
import { ClinicalIntervention } from '../../packages/shared/types';
import { createClinicalIntervention } from '../../api/pharmacyApi';

interface ClinicalInterventionsViewProps {
    interventions: ClinicalIntervention[];
    onRefresh: () => void;
    onTriggerToast: (msg: string) => void;
}

export const ClinicalInterventionsView: React.FC<ClinicalInterventionsViewProps> = ({
    interventions,
    onRefresh,
    onTriggerToast,
}) => {
    const [search, setSearch] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    // Form state for logging intervention
    const [patientName, setPatientName] = useState('');
    const [mrn, setMrn] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [physicianName, setPhysicianName] = useState('Dr. Sarah Lin, MD');
    const [pharmacistName, setPharmacistName] = useState('PharmD. Alex Chen, BCPS');
    const [category, setCategory] = useState<ClinicalIntervention['category']>('Renal Dose Adjustment');
    const [severity, setSeverity] = useState<ClinicalIntervention['severity']>('Major Safety Hazard');
    const [actionTaken, setActionTaken] = useState('');
    const [physicianResponse, setPhysicianResponse] = useState<ClinicalIntervention['physicianResponse']>('Accepted & Modified');
    const [preventedAdverseEvent, setPreventedAdverseEvent] = useState(true);
    const [costSavingsEst, setCostSavingsEst] = useState(4500);

    const filtered = useMemo(() => {
        if (!search.trim()) return interventions;
        const q = search.toLowerCase();
        return interventions.filter(
            (i) =>
                i.patientName.toLowerCase().includes(q) ||
                i.mrn.toLowerCase().includes(q) ||
                i.orderNumber.toLowerCase().includes(q) ||
                i.actionTaken.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
        );
    }, [interventions, search]);

    // Metrics
    const metrics = useMemo(() => {
        const total = interventions.length;
        const preventedAdes = interventions.filter((i) => i.preventedAdverseEvent).length;
        const totalSavings = interventions.reduce((acc, i) => acc + (i.costSavingsEst || 0), 0);
        const acceptedCount = interventions.filter((i) =>
            i.physicianResponse.startsWith('Accepted')
        ).length;
        const acceptanceRate = total > 0 ? Math.round((acceptedCount / total) * 100) : 100;

        return {
            total,
            preventedAdes,
            totalSavings,
            acceptanceRate,
        };
    }, [interventions]);

    const handleSubmitIntervention = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName.trim() || !actionTaken.trim()) return;

        await createClinicalIntervention({
            patientId: 'pat_001',
            patientName,
            mrn: mrn || 'MRN-84920',
            orderNumber: orderNumber || 'RX-2026-9041',
            pharmacistName,
            physicianName,
            category,
            severity,
            actionTaken,
            physicianResponse,
            preventedAdverseEvent,
            costSavingsEst: Number(costSavingsEst) || 0,
        });

        onTriggerToast('Clinical intervention documented and synced to patient EHR safety log.');
        setIsCreateOpen(false);
        // Reset form
        setPatientName('');
        setActionTaken('');
        onRefresh();
    };

    return (
        <div className="space-y-4">
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Total Safety Interventions
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-gray-900">{metrics.total}</span>
                        <span className="text-xs text-gray-500">Documented this Month</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Prevented Adverse Drug Events
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-rose-600">{metrics.preventedAdes}</span>
                        <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <HeartPulse className="w-3.5 h-3.5" />
                            Severe ADEs Averted
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Estimated Cost Avoidance
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-600">
                            ${metrics.totalSavings.toLocaleString()}
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold">
                            ICU & Readmission Savings
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Physician Acceptance Rate
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-teal-700">{metrics.acceptanceRate}%</span>
                        <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            Clinical Consensus
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter & Action Header */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search patient, MRN, Rx, clinical issue..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Clinical Intervention</span>
                </button>
            </div>

            {/* Interventions Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Patient & Order</th>
                                <th className="py-3 px-4">Intervention Category</th>
                                <th className="py-3 px-4">Severity & Hazard</th>
                                <th className="py-3 px-4">Action Taken & Pharmacist Recommendation</th>
                                <th className="py-3 px-4">Physician Response</th>
                                <th className="py-3 px-4">Savings & Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/70 transition">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-gray-900 text-xs">
                                            {item.patientName}
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-mono">
                                            {item.mrn} · {item.orderNumber}
                                        </div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                                            {item.category}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                item.severity === 'Critical / Life-Threatening'
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    : item.severity === 'Major Safety Hazard'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : 'bg-blue-50 text-blue-800'
                                            }`}
                                        >
                                            {item.severity}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 max-w-md">
                                        <p className="text-xs text-gray-800 leading-relaxed font-medium">
                                            {item.actionTaken}
                                        </p>
                                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                                            Logged by: {item.pharmacistName} → {item.physicianName}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {item.physicianResponse}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="font-bold text-emerald-700 text-xs">
                                            +${item.costSavingsEst.toLocaleString()} saved
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Intervention Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Log Pharmacist Clinical Safety Intervention
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Document adverse drug event (ADE) prevention and prescriber consensus
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitIntervention} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Patient Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="e.g. Eleanor Vance"
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Patient MRN
                                    </label>
                                    <input
                                        type="text"
                                        value={mrn}
                                        onChange={(e) => setMrn(e.target.value)}
                                        placeholder="e.g. MRN-84920"
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white"
                                    >
                                        <option value="Renal Dose Adjustment">Renal Dose Adjustment</option>
                                        <option value="Allergy Interception">Allergy Interception</option>
                                        <option value="Drug Interaction">Drug Interaction (DDI)</option>
                                        <option value="IV to PO Conversion">IV to PO Conversion</option>
                                        <option value="Therapeutic Drug Monitoring">Therapeutic Drug Monitoring</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Severity
                                    </label>
                                    <select
                                        value={severity}
                                        onChange={(e) => setSeverity(e.target.value as any)}
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white"
                                    >
                                        <option value="Critical / Life-Threatening">Critical / Life-Threatening</option>
                                        <option value="Major Safety Hazard">Major Safety Hazard</option>
                                        <option value="Moderate Optimization">Moderate Optimization</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Clinical Recommendation & Action Taken
                                </label>
                                <textarea
                                    required
                                    value={actionTaken}
                                    onChange={(e) => setActionTaken(e.target.value)}
                                    rows={3}
                                    placeholder="Describe clinical situation, lab values, pharmacological rationale, and physician agreement..."
                                    className="w-full p-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Physician Response
                                    </label>
                                    <select
                                        value={physicianResponse}
                                        onChange={(e) => setPhysicianResponse(e.target.value as any)}
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white"
                                    >
                                        <option value="Accepted & Modified">Accepted & Modified</option>
                                        <option value="Accepted - Order Cancelled">Accepted - Order Cancelled</option>
                                        <option value="Discussed & Overridden">Discussed & Overridden</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                        Est. Cost Savings ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={costSavingsEst}
                                        onChange={(e) => setCostSavingsEst(parseInt(e.target.value) || 0)}
                                        className="w-full p-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                                >
                                    Commit to Safety Ledger
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
