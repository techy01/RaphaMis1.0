import React from 'react';
import {
    Pill,
    Search,
    Zap,
    ScanLine,
    PlusCircle,
    Building2,
    ShieldAlert,
    Boxes,
    GitBranch,
} from 'lucide-react';

interface PharmacyHeaderProps {
    search: string;
    onSearchChange: (val: string) => void;
    activeTab: 'triage' | 'formulary' | 'interventions';
    onTabChange: (tab: 'triage' | 'formulary' | 'interventions') => void;
    selectedTenant: string;
    onTenantChange: (tenantId: string) => void;
    tenants: Array<{ id: string; name: string }>;
    onNewPrescription: () => void;
    onOpenScanner: () => void;
    onQuickTriageNextStat: () => void;
    statOrdersCount: number;
    pendingTriageCount: number;
    clinicalHoldsCount: number;
}

export const PharmacyHeader: React.FC<PharmacyHeaderProps> = ({
    search,
    onSearchChange,
    activeTab,
    onTabChange,
    selectedTenant,
    onTenantChange,
    tenants,
    onNewPrescription,
    onOpenScanner,
    onQuickTriageNextStat,
    statOrdersCount,
    pendingTriageCount,
    clinicalHoldsCount,
}) => {
    return (
        <header className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
            {/* Top Bar: Title, Facility Switcher & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                Pharmacy & Closed-Loop Medication System
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                21st-Century CDSS Active
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Automated clinical verification, multi-tier acuity triaging, 5-rights barcode scanning, and IoT cold-chain telemetry.
                        </p>
                    </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Facility Selector */}
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-500">Facility:</span>
                        <select
                            id="pharmacy-facility-select"
                            value={selectedTenant}
                            onChange={(e) => onTenantChange(e.target.value)}
                            className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer pr-1"
                        >
                            <option value="ALL">All Network Facilities</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Triage Next STAT Button */}
                    <button
                        id="quick-triage-stat-btn"
                        onClick={onQuickTriageNextStat}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                            statOrdersCount > 0
                                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={statOrdersCount > 0 ? `${statOrdersCount} STAT order(s) awaiting urgent review` : 'No STAT orders pending'}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Triage Next STAT</span>
                        {statOrdersCount > 0 && (
                            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">
                                {statOrdersCount}
                            </span>
                        )}
                    </button>

                    {/* Barcode Scanner Trigger */}
                    <button
                        id="open-barcode-scanner-btn"
                        onClick={onOpenScanner}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition flex items-center gap-2 shadow-xs"
                    >
                        <ScanLine className="w-3.5 h-3.5 text-teal-600" />
                        <span>Barcode Scan (BCMA)</span>
                    </button>

                    {/* New Prescription Order Button */}
                    <button
                        id="new-prescription-btn"
                        onClick={onNewPrescription}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-1.5 shadow-xs"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>New Rx Order</span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Navigation Tabs & Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
                {/* Mode Tabs */}
                <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 self-start sm:self-auto overflow-x-auto max-w-full">
                    <button
                        id="tab-triage-pipeline"
                        onClick={() => onTabChange('triage')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'triage'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                        <span>Triage & Dispensing Queue</span>
                        {pendingTriageCount > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                {pendingTriageCount}
                            </span>
                        )}
                        {clinicalHoldsCount > 0 && (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                {clinicalHoldsCount} Holds
                            </span>
                        )}
                    </button>

                    <button
                        id="tab-smart-formulary"
                        onClick={() => onTabChange('formulary')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'formulary'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Boxes className="w-3.5 h-3.5 text-teal-600" />
                        <span>Smart Formulary & Inventory</span>
                    </button>

                    <button
                        id="tab-clinical-interventions"
                        onClick={() => onTabChange('interventions')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'interventions'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
                        <span>Clinical CDSS & Interventions</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        id="pharmacy-search-input"
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search Rx #, patient, drug, room..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-gray-900 placeholder:text-gray-400"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
