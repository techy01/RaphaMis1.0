import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Stethoscope,
    DollarSign,
    Building2,
    Sparkles,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
} from 'lucide-react';
import { AnalyticsTimeRange } from '../../packages/shared/types';
import { getAnalyticsOverview } from '../../api/analyticsApi';
import { getTenants } from '../../api/tenantsApi';
import { AnalyticsHeader } from '../analytics/AnalyticsHeader';
import { ExecutiveKpiGrid } from '../analytics/ExecutiveKpiGrid';
import { ExecutiveOverviewTab } from '../analytics/ExecutiveOverviewTab';
import { ClinicalOperationsTab } from '../analytics/ClinicalOperationsTab';
import { FinancialBillingTab } from '../analytics/FinancialBillingTab';
import { FacilityBenchmarkingTab } from '../analytics/FacilityBenchmarkingTab';
import { PredictiveForecastTab } from '../analytics/PredictiveForecastTab';
import { ExecutiveReportModal } from '../analytics/ExecutiveReportModal';

type AnalyticsTab = 'executive' | 'clinical' | 'financial' | 'benchmarking' | 'predictive';

export const AnalyticsView: React.FC = () => {
    const queryClient = useQueryClient();
    const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');
    const [selectedTenant, setSelectedTenant] = useState<string>('ALL');
    const [activeTab, setActiveTab] = useState<AnalyticsTab>('executive');
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Fetch tenant list for scope selector
    const { data: tenantsData = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const tenants = useMemo(() => {
        return tenantsData.map((t) => ({
            id: t.id,
            name: t.name,
            status: t.status,
        }));
    }, [tenantsData]);

    // Fetch Analytics Data
    const {
        data: analyticsData,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['analytics', timeRange, selectedTenant],
        queryFn: () => getAnalyticsOverview(timeRange, selectedTenant),
        staleTime: 30000,
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ['analytics'] });
        await refetch();
        triggerToast('Real-time telemetry and clinical indicators refreshed');
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        if (!analyticsData) return;

        const { kpis, departmentCensus, facilityBenchmarks, clinicalQuality } = analyticsData;

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'RAPHAMIS HEALTH INTELLIGENCE EXPORT\n';
        csvContent += `Scope: ${selectedTenant === 'ALL' ? 'All Facilities' : selectedTenant}, Period: ${timeRange.toUpperCase()}, Date: ${new Date().toISOString()}\n\n`;

        // KPIs
        csvContent += '--- EXECUTIVE METRICS ---\n';
        csvContent += 'Metric,Value,Variance,Benchmark\n';
        csvContent += `Gross Revenue,$${kpis.totalRevenue},${kpis.revenueChange}%,Target Met\n`;
        csvContent += `Patient Volume,${kpis.patientVolume},${kpis.patientVolumeChange}%,Throughput Normal\n`;
        csvContent += `Bed Occupancy Rate,${kpis.bedOccupancyRate}%,${kpis.occupancyChange}%,Optimal 75-85%\n`;
        csvContent += `Avg Length of Stay,${kpis.avgLengthOfStay} days,${kpis.alosChange}d,< 4.8 days\n`;
        csvContent += `30-Day Readmission Rate,${kpis.readmissionRate30d}%,${kpis.readmissionChange}%,CMS < 7.2%\n`;
        csvContent += `ER Door to Doctor,${kpis.erAverageWaitTime} min,${kpis.waitChange} min,< 30 min\n`;
        csvContent += `Clean Claim Rate,${kpis.cleanClaimRate}%,${kpis.claimRateChange}%,> 95%\n\n`;

        // Departments
        csvContent += '--- DEPARTMENT CENSUS ---\n';
        csvContent += 'Department,Occupied Beds,Capacity,Utilization %,Wait Time (min),Staffing Ratio,Status\n';
        departmentCensus.forEach((d) => {
            csvContent += `"${d.department}",${d.occupied},${d.capacity},${d.utilizationRate}%,${d.avgWaitMinutes},"${d.staffRatio}","${d.status}"\n`;
        });
        csvContent += '\n';

        // Facilities
        csvContent += '--- FACILITY BENCHMARKS ---\n';
        csvContent += 'Facility,Tier,Monthly Revenue,Active Patients,Occupancy %,ALOS,Quality Rating,Status\n';
        facilityBenchmarks.forEach((f) => {
            csvContent += `"${f.tenantName}","${f.tier}",$${f.monthlyRevenue},${f.activePatients},${f.bedOccupancyRate}%,${f.avgLengthOfStay}d,${f.qualityScore}/5.0,"${f.status}"\n`;
        });
        csvContent += '\n';

        // Quality
        csvContent += '--- CLINICAL QUALITY INDICATORS ---\n';
        csvContent += 'Indicator,Category,Current Value,Target,Benchmark,Status\n';
        clinicalQuality.forEach((q) => {
            csvContent += `"${q.name}","${q.category}",${q.currentValue} ${q.unit},${q.targetValue} ${q.unit},"${q.benchmark}","${q.status}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raphamis_analytics_${selectedTenant}_${timeRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        triggerToast('Analytics dataset downloaded as CSV');
    };

    const currentFacilityName = useMemo(() => {
        if (selectedTenant === 'ALL') return 'All Network Health Centers';
        return tenants.find((t) => t.id === selectedTenant)?.name || selectedTenant;
    }, [selectedTenant, tenants]);

    const tabConfig: { id: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
        {
            id: 'executive',
            label: 'Executive Overview',
            icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
            id: 'clinical',
            label: 'Clinical & Operations',
            icon: <Stethoscope className="w-4 h-4" />,
        },
        {
            id: 'financial',
            label: 'Financial & Billing',
            icon: <DollarSign className="w-4 h-4" />,
        },
        {
            id: 'benchmarking',
            label: 'Facility Benchmarking',
            icon: <Building2 className="w-4 h-4" />,
        },
        {
            id: 'predictive',
            label: 'Predictive Forecasts',
            icon: <Sparkles className="w-4 h-4 text-teal-600" />,
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header & Controls */}
            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                selectedTenant={selectedTenant}
                onTenantChange={setSelectedTenant}
                tenants={tenants}
                onRefresh={handleRefresh}
                isRefreshing={isFetching}
                onOpenReport={() => setIsReportModalOpen(true)}
                onExportCSV={handleExportCSV}
            />

            {/* Loading Skeleton */}
            {isLoading && (
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 p-4" />
                        ))}
                    </div>
                    <div className="h-80 bg-white rounded-xl border border-gray-200" />
                </div>
            )}

            {/* Error State */}
            {isError && !isLoading && (
                <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">Failed to Load Analytics</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                        An error occurred while aggregating health intelligence telemetry. Please try refreshing or check your connection.
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
                    >
                        Retry Aggregation
                    </button>
                </div>
            )}

            {/* Data Content */}
            {!isLoading && !isError && analyticsData && (
                <>
                    {/* Executive KPI Metric Cards */}
                    <ExecutiveKpiGrid kpis={analyticsData.kpis} />

                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto" aria-label="Analytics Tabs">
                            {tabConfig.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
                                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                        {tab.id === 'predictive' && (
                                            <span className="text-[10px] uppercase font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full">
                                                AI
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Active Tab View */}
                    <div className="transition-all duration-200">
                        {activeTab === 'executive' && <ExecutiveOverviewTab data={analyticsData} />}
                        {activeTab === 'clinical' && <ClinicalOperationsTab data={analyticsData} />}
                        {activeTab === 'financial' && <FinancialBillingTab data={analyticsData} />}
                        {activeTab === 'benchmarking' && <FacilityBenchmarkingTab data={analyticsData} />}
                        {activeTab === 'predictive' && <PredictiveForecastTab data={analyticsData} />}
                    </div>
                </>
            )}

            {/* Executive Dossier Report Modal */}
            {analyticsData && (
                <ExecutiveReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    data={analyticsData}
                    timeRange={timeRange}
                    facilityName={currentFacilityName}
                />
            )}
        </div>
    );
};
