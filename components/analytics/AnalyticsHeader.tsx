import React from 'react';
import {
    Calendar,
    Building2,
    RefreshCw,
    Download,
    FileText,
    FileSpreadsheet,
    Printer,
    SlidersHorizontal,
} from 'lucide-react';
import { AnalyticsTimeRange } from '../../packages/shared/types';

interface AnalyticsHeaderProps {
    timeRange: AnalyticsTimeRange;
    onTimeRangeChange: (range: AnalyticsTimeRange) => void;
    selectedTenant: string;
    onTenantChange: (tenantId: string) => void;
    tenants: Array<{ id: string; name: string; status: string }>;
    onRefresh: () => void;
    isRefreshing: boolean;
    onOpenReport: () => void;
    onExportCSV: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
    timeRange,
    onTimeRangeChange,
    selectedTenant,
    onTenantChange,
    tenants,
    onRefresh,
    isRefreshing,
    onOpenReport,
    onExportCSV,
}) => {
    const timeRangeLabels: { value: AnalyticsTimeRange; label: string }[] = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: 'ytd', label: 'Year to Date' },
        { value: '1y', label: 'Full Year' },
    ];

    const currentTenantName =
        selectedTenant === 'ALL'
            ? 'All Health System Facilities'
            : tenants.find((t) => t.id === selectedTenant)?.name || 'Facility';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
            {/* Top row: Title and primary export actions */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Health Intelligence & Clinical Analytics
                        </h2>
                        <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Enterprise Telemetry
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                        Aggregated clinical performance metrics, cross-tenant hospital operational benchmarks, financial revenue cycle modeling, and predictive patient capacity forecasting.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Refresh real-time data"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : 'text-gray-500'}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={onExportCSV}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Export filtered raw analytics dataset"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Export CSV</span>
                    </button>

                    <button
                        onClick={onOpenReport}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Executive Dossier</span>
                    </button>
                </div>
            </div>

            {/* Bottom row: Facility picker and Time-range pills */}
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Facility Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        <Building2 className="h-4 w-4 text-teal-600" />
                        <span>Facility Scope:</span>
                    </div>
                    <select
                        value={selectedTenant}
                        onChange={(e) => onTenantChange(e.target.value)}
                        className="w-full sm:w-64 py-1.5 px-2.5 text-xs rounded-lg border border-gray-300 bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                    >
                        <option value="ALL">All Network Facilities (Aggregated)</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.status})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-stretch sm:self-auto overflow-x-auto">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 ml-1.5 mr-0.5 hidden sm:inline-block" />
                    {timeRangeLabels.map((t) => {
                        const isActive = timeRange === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => onTimeRangeChange(t.value)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-teal-800 shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                                }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
