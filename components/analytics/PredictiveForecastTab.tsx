import React from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import {
    Sparkles,
    AlertTriangle,
    Bed,
    Users,
    Calendar,
    BrainCircuit,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { AnalyticsDataPayload, PredictiveCapacityPoint } from '../../packages/shared/types';

interface PredictiveForecastTabProps {
    data: AnalyticsDataPayload;
}

export const PredictiveForecastTab: React.FC<PredictiveForecastTabProps> = ({ data }) => {
    const { predictiveForecast, kpis } = data;

    // Days with high surge risk (> 85% occupancy)
    const surgeRiskDays = predictiveForecast.filter((p) => p.bedOccupancyForecast > 88);

    return (
        <div className="space-y-6">
            {/* Top Info Banner */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-xl p-5 text-white shadow-md flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-teal-500/20 rounded-lg border border-teal-400/30">
                            <Sparkles className="w-4 h-4 text-teal-300" />
                        </div>
                        <h3 className="text-base font-bold tracking-tight">
                            Predictive Inpatient Intake & Bed Deficit Early Warning
                        </h3>
                    </div>
                    <p className="text-xs text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                        Continuous neural network time-series forecasting analyzing emergency intake rates, seasonal epidemiological curves, and scheduled surgical admissions.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 backdrop-blur-xs">
                        <span className="text-teal-200 block text-[10px] uppercase font-semibold">Forecast Horizon</span>
                        <span className="font-bold text-white">7-Day Lookahead</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 backdrop-blur-xs">
                        <span className="text-teal-200 block text-[10px] uppercase font-semibold">Validation Accuracy</span>
                        <span className="font-bold text-emerald-300">94.8% MAPE</span>
                    </div>
                </div>
            </div>

            {/* Projection Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <div>
                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-teal-600" />
                            <span>Inpatient Admissions: Observed vs. Projected Confidence Band</span>
                        </h4>
                        <p className="text-xs text-gray-500">
                            Confidence interval (95% CI) showing expected daily admissions alongside ER surge index.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                            <span className="w-3 h-0.5 bg-teal-700 inline-block" /> Expected Admissions
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                            <span className="w-3 h-3 bg-teal-100/60 border border-teal-300 rounded-xs inline-block" /> 95% Confidence Band
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                            <span className="w-3 h-0.5 bg-rose-500 inline-block" /> ER Surge Index
                        </span>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={predictiveForecast} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="dayName"
                                tick={{ fontSize: 11, fill: '#475569' }}
                                axisLine={{ stroke: '#E2E8F0' }}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 11, fill: '#64748B' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: '#E11D48' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const p: PredictiveCapacityPoint = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1.5">
                                                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1">
                                                    <span className="font-bold text-gray-900">{p.dayName}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.isForecast ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {p.isForecast ? 'Forecast' : 'Historical'}
                                                    </span>
                                                </div>
                                                <p className="text-teal-800">
                                                    Expected Admissions: <span className="font-bold">{p.predictedAdmissions} patients</span>
                                                </p>
                                                {p.isForecast && (
                                                    <p className="text-gray-500">
                                                        Confidence Range: <span className="font-medium">{p.confidenceLower} - {p.confidenceUpper} pts</span>
                                                    </p>
                                                )}
                                                <p className="text-gray-700">
                                                    Projected Bed Occupancy: <span className="font-bold">{p.bedOccupancyForecast}%</span>
                                                </p>
                                                <p className="text-rose-600">
                                                    ER Surge Risk Index: <span className="font-bold">{p.erSurgeIndex} / 100</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Confidence area */}
                            <Area
                                yAxisId="left"
                                dataKey="confidenceUpper"
                                fill="#0D9488"
                                fillOpacity={0.12}
                                stroke="none"
                                name="Upper Bound"
                            />
                            <Area
                                yAxisId="left"
                                dataKey="confidenceLower"
                                fill="#FFFFFF"
                                fillOpacity={1}
                                stroke="none"
                                name="Lower Bound"
                            />
                            {/* Forecast Admissions Line */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="predictedAdmissions"
                                stroke="#0D9488"
                                strokeWidth={2.5}
                                dot={{ fill: '#0D9488', r: 4 }}
                                name="Admissions"
                            />
                            {/* ER Surge Index Line */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="erSurgeIndex"
                                stroke="#E11D48"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                dot={{ fill: '#E11D48', r: 3 }}
                                name="ER Surge Index"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bed Deficit & Staffing Mitigation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Early Warning Bed Deficit Alerts */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>High Bed Deficit Alert Schedule</span>
                        </h4>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            {surgeRiskDays.length} Surge Windows Detected
                        </span>
                    </div>

                    <div className="space-y-3">
                        {surgeRiskDays.map((day) => (
                            <div
                                key={day.date}
                                className="p-3.5 rounded-lg border border-amber-200/80 bg-amber-50/40 flex items-start justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-xs">{day.dayName}</span>
                                        <span className="text-[11px] font-semibold text-rose-700">
                                            {day.bedOccupancyForecast}% Occupancy Projected
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Estimated admissions: <span className="font-semibold">{day.predictedAdmissions}</span> patients. Emergency influx peak expected in evening hours.
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="text-[11px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded border border-amber-300">
                                        Surge Protocol
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prescriptive Staffing Recommendations */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-teal-600" />
                            <span>Prescriptive Staffing Recommendations</span>
                        </h4>
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            Automated Balancing
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg text-teal-700 shrink-0 mt-0.5">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-gray-900">Add 4 RN Shifts on Saturday (Night)</h5>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Mitigate high ER surge index (88/100). Allocate 2 nurses to Emergency Triage and 2 to Inpatient Cardiac Monitoring.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-700 shrink-0 mt-0.5">
                                <Bed className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-gray-900">Accelerate Friday Morning Discharges</h5>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Initiating round-table discharge clearances by 10:00 AM will free 12 beds ahead of the weekend surgical influx.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-700 shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-gray-900">On-Call Hospitalist Activation</h5>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Put 1 additional attending physician on second-line call for Saturday 18:00 to Sunday 06:00.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
