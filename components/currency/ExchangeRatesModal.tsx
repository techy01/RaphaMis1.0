import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Modal } from '../shared/Modal';
import {
    Search,
    RefreshCw,
    ArrowRightLeft,
    Check,
    Globe,
    ShieldCheck,
    TrendingUp,
    Sliders,
    Info,
    Edit3,
    RotateCcw,
    DollarSign,
    Calculator,
    Zap,
    ExternalLink
} from 'lucide-react';
import { CurrencyInfo, getCurrencyInfo } from '../../config/currencies';

export const ExchangeRatesModal: React.FC = () => {
    const {
        isExchangeModalOpen,
        closeExchangeModal,
        currentCurrency,
        baseCurrency,
        setCurrency,
        setBaseCurrency,
        rates,
        allCurrencies,
        exchangeMeta,
        refreshRates,
        isRefreshing,
        lastRefreshedAt,
        fxSpread,
        setFxSpread,
        customOverrides,
        setCustomOverride,
        convert,
        format
    } = useCurrency();

    // Active tab in modal: 'matrix' | 'converter' | 'settings'
    const [activeTab, setActiveTab] = useState<'matrix' | 'converter' | 'settings'>('matrix');

    // Filter & Search states for Matrix
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

    // Calculator states
    const [calcAmount, setCalcAmount] = useState<number>(1000);
    const [calcFrom, setCalcFrom] = useState<string>(baseCurrency);
    const [calcTo, setCalcTo] = useState<string>(currentCurrency);
    const [calcIncludeSpread, setCalcIncludeSpread] = useState<boolean>(false);

    // Override edit state
    const [editingOverrideCurrency, setEditingOverrideCurrency] = useState<CurrencyInfo | null>(null);
    const [overrideValue, setOverrideValue] = useState<string>('');

    // Filter currencies
    const filteredCurrencies = useMemo(() => {
        return allCurrencies.filter(c => {
            const matchesQuery =
                c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.country.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;

            return matchesQuery && matchesRegion;
        });
    }, [allCurrencies, searchQuery, selectedRegion]);

    // Calculation result
    const calcResult = useMemo(() => {
        return convert(calcAmount, calcFrom, calcTo, calcIncludeSpread);
    }, [calcAmount, calcFrom, calcTo, calcIncludeSpread, convert]);

    const handleSwapCurrencies = () => {
        setCalcFrom(calcTo);
        setCalcTo(calcFrom);
    };

    const handleSaveOverride = () => {
        if (!editingOverrideCurrency) return;
        const num = parseFloat(overrideValue);
        if (!isNaN(num) && num > 0) {
            setCustomOverride(editingOverrideCurrency.code, num);
        } else {
            setCustomOverride(editingOverrideCurrency.code, null);
        }
        setEditingOverrideCurrency(null);
        setOverrideValue('');
    };

    return (
        <Modal
            isOpen={isExchangeModalOpen}
            onClose={closeExchangeModal}
            title=""
            maxWidth="2xl"
        >
            <div className="-m-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary/95 text-white p-6 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                <Globe className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight">Multi-Currency & Exchange Standard</h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        {exchangeMeta.isLive ? 'ECB Online Live' : 'Standard Baseline'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    European Central Bank (ECB) Reference Standard & Global Forex Mid-Market Benchmarks
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => refreshRates()}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg border border-white/20 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Synchronizing...' : 'Refresh Online Rates'}
                            </button>
                        </div>
                    </div>

                    {/* Standard Telemetry Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
                        <div>
                            <span className="text-gray-400 block text-[11px]">System Base:</span>
                            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                                {getCurrencyInfo(baseCurrency).flag} {baseCurrency} (${getCurrencyInfo(baseCurrency).name})
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Standard Provider:</span>
                            <span className="font-medium text-gray-200 truncate block mt-0.5" title={exchangeMeta.provider}>
                                European Central Bank / Forex
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Currencies Indexed:</span>
                            <span className="font-bold text-emerald-300 block mt-0.5">
                                {allCurrencies.length} ISO 4217 Currencies
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px]">Active Spread:</span>
                            <span className="font-bold text-white block mt-0.5">
                                {fxSpread === 0 ? '0.00% (Mid-Market)' : `+${fxSpread.toFixed(2)}% (Bank Spread)`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2">
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'matrix'
                                ? 'border-primary text-primary bg-white rounded-t-lg'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Globe className="w-4 h-4" />
                        Live Exchange Rates Matrix ({allCurrencies.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('converter')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'converter'
                                ? 'border-primary text-primary bg-white rounded-t-lg'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Calculator className="w-4 h-4" />
                        FX Currency Converter
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'settings'
                                ? 'border-primary text-primary bg-white rounded-t-lg'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        FX Standards & Margins
                    </button>
                </div>

                {/* Tab 1: Live Exchange Rates Matrix */}
                {activeTab === 'matrix' && (
                    <div className="p-6 space-y-4">
                        {/* Search & Region Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Filter by code, currency name, or country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-1 overflow-x-auto text-xs pb-1">
                                {['ALL', 'Major', 'Africa', 'Europe', 'Americas', 'Asia & Pacific', 'Middle East'].map(region => (
                                    <button
                                        key={region}
                                        type="button"
                                        onClick={() => setSelectedRegion(region)}
                                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                                            selectedRegion === region
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Overrides notice if active */}
                        {Object.keys(customOverrides).length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                <div className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-amber-600" />
                                    <span>
                                        <strong>{Object.keys(customOverrides).length} Custom Contract Overrides Active:</strong> Fixed rates locked for specific hospital agreements.
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        Object.keys(customOverrides).forEach(c => setCustomOverride(c, null));
                                    }}
                                    className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
                                >
                                    Reset All to ECB Standard
                                </button>
                            </div>
                        )}

                        {/* Rates Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px] tracking-wider z-10">
                                        <tr>
                                            <th className="px-4 py-3">Currency</th>
                                            <th className="px-4 py-3">Country / Territory</th>
                                            <th className="px-4 py-3 text-right">Standard Rate (1 {baseCurrency})</th>
                                            <th className="px-4 py-3 text-right">Inverse Rate (1 Target)</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredCurrencies.map(c => {
                                            const hasOverride = customOverrides[c.code] !== undefined;
                                            const rate = rates[c.code] || c.standardRate;
                                            const inverse = rate > 0 ? (1 / rate) : 0;
                                            const isCurrent = c.code === currentCurrency;
                                            const isBase = c.code === baseCurrency;

                                            return (
                                                <tr
                                                    key={c.code}
                                                    className={`hover:bg-gray-50/80 transition-colors ${
                                                        isCurrent ? 'bg-primary/5 font-medium' : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-xl leading-none">{c.flag}</span>
                                                            <div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono font-bold text-gray-900">{c.code}</span>
                                                                    <span className="text-gray-500 font-medium">({c.symbol})</span>
                                                                    {c.isPopular && (
                                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                                                            Major
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-gray-500">{c.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-600">
                                                        <div>{c.country}</div>
                                                        <span className="text-[10px] text-gray-400">{c.region}</span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-mono">
                                                        <div className="font-bold text-gray-900">
                                                            {rate < 1 ? rate.toFixed(5) : rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                                        </div>
                                                        {hasOverride && (
                                                            <span className="text-[10px] text-amber-600 font-sans font-medium">
                                                                Custom Contract Override
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-mono text-gray-600">
                                                        {inverse < 0.0001 ? inverse.toExponential(3) : inverse.toFixed(5)} {baseCurrency}
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        {isBase ? (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800">
                                                                Base Standard
                                                            </span>
                                                        ) : hasOverride ? (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                                                Contract Locked
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                                Live Benchmark
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isCurrent ? (
                                                                <span className="inline-flex items-center gap-1 text-xs text-primary font-bold px-2 py-1 bg-primary/10 rounded-md">
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCurrency(c.code)}
                                                                    className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors"
                                                                >
                                                                    Set Display
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingOverrideCurrency(c);
                                                                    setOverrideValue(rate.toString());
                                                                }}
                                                                title="Set custom contract exchange rate override"
                                                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Interactive FX Currency Converter */}
                {activeTab === 'converter' && (
                    <div className="p-6 space-y-6">
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" />
                                Instant Global Medical FX Currency Converter
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                                {/* Amount input */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Amount to Convert
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={calcAmount}
                                            onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="any"
                                            className="w-full px-3 py-2.5 text-base font-bold font-mono text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* From Currency */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        From Currency
                                    </label>
                                    <select
                                        value={calcFrom}
                                        onChange={(e) => setCalcFrom(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        {allCurrencies.map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {c.code} - {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Swap Button */}
                                <div className="md:col-span-1 flex justify-center pt-5">
                                    <button
                                        type="button"
                                        onClick={handleSwapCurrencies}
                                        className="p-2.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl shadow-sm text-gray-700 hover:text-primary transition-all active:scale-95"
                                        title="Swap from and to currencies"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* To Currency */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        To Currency
                                    </label>
                                    <select
                                        value={calcTo}
                                        onChange={(e) => setCalcTo(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        {allCurrencies.map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {c.code} - {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Spread Toggle */}
                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-200/60 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={calcIncludeSpread}
                                        onChange={(e) => setCalcIncludeSpread(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span>Apply Institutional FX Settlement Spread (+{fxSpread.toFixed(2)}%)</span>
                                </label>
                                <span className="text-gray-500">
                                    Exchange Standard: <strong>European Central Bank Mid-Market</strong>
                                </span>
                            </div>

                            {/* Converted Output Card */}
                            <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-500">
                                        {calcAmount.toLocaleString()} {calcFrom} =
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono mt-0.5">
                                        {format(calcResult, calcTo, { showCode: true })}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span>
                                            1 {calcFrom} = {(calcResult / (calcAmount || 1)).toFixed(4)} {calcTo}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            1 {calcTo} = {((calcAmount || 1) / (calcResult || 1)).toFixed(4)} {calcFrom}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrency(calcTo)}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow transition-colors whitespace-nowrap"
                                >
                                    Apply {calcTo} as System Display Currency
                                </button>
                            </div>
                        </div>

                        {/* Common Multi-Currency Equivalents */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Global Benchmark Equivalents for {calcAmount.toLocaleString()} {calcFrom}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['USD', 'EUR', 'GBP', 'KES', 'NGN', 'INR', 'AED', 'CAD'].map(code => {
                                    const conv = convert(calcAmount, calcFrom, code);
                                    const info = getCurrencyInfo(code);
                                    return (
                                        <div key={code} className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center gap-1 font-semibold text-gray-700">
                                                    {info.flag} {code}
                                                </span>
                                                <span>{info.symbol}</span>
                                            </div>
                                            <div className="text-sm font-bold font-mono text-gray-900 mt-1">
                                                {format(conv, code)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: FX Standards & Margins */}
                {activeTab === 'settings' && (
                    <div className="p-6 space-y-6">
                        {/* Standard Specifications */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Exchange Rates Standard Specification</h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        RaphaMIS utilizes the <strong>European Central Bank (ECB) Reference Rates Standard</strong> and Open Forex Mid-Market Specification (ISO 4217). Real-time interbank reference feeds are synchronized automatically for 160+ world currencies with sub-millisecond precision.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-700 block mb-1">Standard Reference Base</span>
                                    <p className="text-gray-500 mb-2">
                                        All cross-currency valuations are calculated via standard triangulated interbank mid-market equations:
                                    </p>
                                    <code className="text-[11px] bg-gray-200/80 px-2 py-1 rounded block text-gray-800 font-mono">
                                        Rate(A → B) = Rate(USD → B) / Rate(USD → A)
                                    </code>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-700 block mb-1">Fail-safe & Offline Resilience</span>
                                    <p className="text-gray-500">
                                        The system implements a 3-tier fallback architecture: primary live central bank feed, browser local storage cache (1h TTL), and an embedded offline authoritative standard catalog guaranteeing 100% platform uptime.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Base Currency Selection */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Default Platform Accounting Base Currency</h4>
                            <p className="text-xs text-gray-600 mb-4">
                                The system-wide base currency used for consolidated financial reporting, ARR/MRR balance sheets, and global medical inventory valuation.
                            </p>
                            <div className="max-w-xs">
                                <select
                                    value={baseCurrency}
                                    onChange={(e) => setBaseCurrency(e.target.value)}
                                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    {allCurrencies.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.flag} {c.code} - {c.name} ({c.country})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Institutional FX Spread Slider */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Institutional FX Spread / Settlement Buffer</h4>
                                <p className="text-xs text-gray-600 mt-1">
                                    When billing patients or hospital networks internationally, payment gateways (Stripe, Safaricom M-Pesa, Swift wire) apply currency conversion fees. Adjust the institutional spread to account for these costs.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-700">Settlement Spread:</span>
                                    <span className="font-mono font-bold text-primary text-sm">
                                        +{fxSpread.toFixed(2)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.25"
                                    value={fxSpread}
                                    onChange={(e) => setFxSpread(parseFloat(e.target.value))}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>0.0% (Pure Mid-Market)</span>
                                    <span>1.0% (Interbank Wire)</span>
                                    <span>2.5% (Credit Card)</span>
                                    <span>5.0% (Cross-Border Retail)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 flex items-center justify-between text-xs">
                    <div className="text-gray-500 text-[11px]">
                        Last synchronized: {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : 'N/A'} • Reference: ISO 4217
                    </div>
                    <button
                        type="button"
                        onClick={closeExchangeModal}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Custom Override Sub-Modal */}
            {editingOverrideCurrency && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{editingOverrideCurrency.flag}</span>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Contract Rate Override for {editingOverrideCurrency.code}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Set fixed rate for 1 {baseCurrency} in {editingOverrideCurrency.code}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Custom Fixed Exchange Rate (1 {baseCurrency} =)
                            </label>
                            <input
                                type="number"
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                placeholder="e.g. 130.00"
                                step="any"
                                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                autoFocus
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                                Leave empty or enter 0 to restore the live ECB standard benchmark rate.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingOverrideCurrency(null)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveOverride}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow"
                            >
                                Save Contract Rate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
