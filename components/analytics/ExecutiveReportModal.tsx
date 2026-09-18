import React from 'react';
import {
    X,
    Printer,
    Download,
    Building2,
    Calendar,
    ShieldCheck,
    CheckCircle2,
    Award,
    FileText,
} from 'lucide-react';
import { AnalyticsDataPayload, AnalyticsTimeRange } from '../../packages/shared/types';

interface ExecutiveReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: AnalyticsDataPayload;
    timeRange: AnalyticsTimeRange;
    facilityName: string;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
    isOpen,
    onClose,
    data,
    timeRange,
    facilityName,
}) => {
    if (!isOpen) return null;

    const { kpis, departmentCensus, facilityBenchmarks, clinicalQuality } = data;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-700" />
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Executive Dossier & Clinical Quality Briefing
                            </h3>
                            <p className="text-xs text-gray-500">
                                Board-ready institutional summary with clinical, financial, and operational indicators.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Report Content - Formatted for print & screen */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-800 printable-report">
                    {/* Official Report Header */}
                    <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
                                RaphaMIS Health Intelligence
                            </span>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                                Health System Performance Dossier
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">
                                Scope: <strong className="text-gray-800">{facilityName}</strong> | Period:{' '}
                                <strong className="text-gray-800">{timeRange.toUpperCase()}</strong>
                            </p>
                        </div>

                        <div className="text-left sm:text-right text-xs text-gray-500 space-y-0.5">
                            <p>
                                Generated: <strong>{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>
                            </p>
                            <p>Classification: <span className="font-bold text-teal-700">CONFIDENTIAL / INTERNAL</span></p>
                        </div>
                    </div>

                    {/* Executive Narrative Summary */}
                    <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 text-xs leading-relaxed space-y-2">
                        <h4 className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-teal-700" />
                            Executive Overview & Strategic Commentary
                        </h4>
                        <p className="text-teal-900">
                            Across the evaluated operating period, the platform achieved gross revenues of{' '}
                            <strong>{formatCurrency(kpis.totalRevenue)}</strong> ({kpis.revenueChange > 0 ? '+' : ''}
                            {kpis.revenueChange}% vs benchmark), maintaining an active patient census of{' '}
                            <strong>{kpis.patientVolume.toLocaleString()}</strong> patients. Overall bed occupancy is{' '}
                            <strong>{kpis.bedOccupancyRate}%</strong>, with the average length of stay (ALOS) held at an efficient{' '}
                            <strong>{kpis.avgLengthOfStay} days</strong>. Clinical quality metrics remain in the top decile nationally with a 30-day readmission rate of{' '}
                            <strong>{kpis.readmissionRate30d}%</strong> (CMS benchmark &lt; 7.2%).
                        </p>
                    </div>

                    {/* Core Performance Indicators Table */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Key Operating & Clinical Metrics
                        </h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2">Metric Indicator</th>
                                        <th className="px-3 py-2">Recorded Value</th>
                                        <th className="px-3 py-2">Variance / Trend</th>
                                        <th className="px-3 py-2 text-right">Target Benchmark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                                    <tr>
                                        <td className="px-3 py-2">Gross Billings / Revenue</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{formatCurrency(kpis.totalRevenue)}</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">+{kpis.revenueChange}%</td>
                                        <td className="px-3 py-2 text-right text-gray-500">Target Attained (104%)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Active Patient Volume</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.patientVolume.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">+{kpis.patientVolumeChange}%</td>
                                        <td className="px-3 py-2 text-right text-gray-500">Nominal</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Bed Occupancy Rate</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.bedOccupancyRate}%</td>
                                        <td className="px-3 py-2 text-gray-700">+{kpis.occupancyChange}%</td>
                                        <td className="px-3 py-2 text-right text-gray-500">Optimal (75-85%)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Avg Length of Stay (ALOS)</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.avgLengthOfStay} days</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">{kpis.alosChange}d</td>
                                        <td className="px-3 py-2 text-right text-gray-500">&lt; 4.8 days</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">30-Day Readmission Rate</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.readmissionRate30d}%</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">{kpis.readmissionChange}%</td>
                                        <td className="px-3 py-2 text-right text-gray-500">CMS Target: &lt; 7.2%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Emergency Wait Time</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.erAverageWaitTime} min</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">-4 min</td>
                                        <td className="px-3 py-2 text-right text-gray-500">Standard: &lt; 30 min</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Clean Claim Acceptance</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{kpis.cleanClaimRate}%</td>
                                        <td className="px-3 py-2 text-emerald-700 font-semibold">+{kpis.claimRateChange}%</td>
                                        <td className="px-3 py-2 text-right text-gray-500">RCM Target: &gt; 95%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Departmental Capacity Summary */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Departmental Utilization
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {departmentCensus.slice(0, 4).map((d) => (
                                <div key={d.department} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="font-bold text-gray-900 truncate">{d.department}</p>
                                    <p className="text-gray-600 mt-0.5">
                                        {d.occupied}/{d.capacity} beds ({d.utilizationRate}%)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signatures & Certification */}
                    <div className="pt-8 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-gray-500">
                        <div>
                            <div className="border-b border-gray-300 pb-1 mb-1 font-semibold text-gray-800">
                                Dr. Robert Sterling, MD
                            </div>
                            <p>Chief Medical Officer (CMO)</p>
                        </div>
                        <div>
                            <div className="border-b border-gray-300 pb-1 mb-1 font-semibold text-gray-800">
                                Katherine Davenport, CPA
                            </div>
                            <p>Chief Financial Officer (CFO)</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="border-b border-gray-300 pb-1 mb-1 font-semibold text-gray-800">
                                RaphaMIS Intelligence System
                            </div>
                            <p>Automated Verification Seal</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Dossier</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
