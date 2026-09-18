import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Search, Globe, RefreshCw, ChevronDown, Check, ArrowRightLeft, Sparkles, ShieldCheck } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
    const {
        currentCurrency,
        baseCurrency,
        currencyInfo,
        rates,
        allCurrencies,
        popularCurrencies,
        setCurrency,
        refreshRates,
        isRefreshing,
        exchangeMeta,
        openExchangeModal
    } = useCurrency();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Filter currencies
    const filteredCurrencies = allCurrencies.filter(c => {
        const matchesQuery =
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.country.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;

        return matchesQuery && matchesRegion;
    });

    const activeRate = currentCurrency === baseCurrency ? 1.0 : (rates[currentCurrency] || 1.0);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Currency Button in Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                title="Change active currency or view exchange rates standard"
            >
                <span className="text-base leading-none">{currencyInfo.flag}</span>
                <span className="font-mono font-bold text-gray-900">{currencyInfo.code}</span>
                <span className="hidden md:inline text-xs text-gray-500 font-medium">({currencyInfo.symbol})</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Header */}
                    <div className="p-3.5 bg-gradient-to-r from-gray-900 via-gray-800 to-primary/90 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                                    Multi-Currency Standard
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {exchangeMeta.isLive ? 'ECB Live' : 'Standard'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        refreshRates();
                                    }}
                                    disabled={isRefreshing}
                                    title="Synchronize live exchange rates online"
                                    className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Current Exchange Benchmark */}
                        <div className="mt-2.5 p-2 bg-white/10 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-gray-200">
                                <span className="font-medium">Active Benchmark:</span>
                                <span className="font-mono text-white font-bold">1 {baseCurrency}</span>
                                <span>=</span>
                                <span className="font-mono text-emerald-300 font-bold">
                                    {activeRate < 1 ? activeRate.toFixed(4) : activeRate.toFixed(2)} {currentCurrency}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-400">Mid-Market</span>
                        </div>
                    </div>

                    {/* Search & Region Filter */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50/70 space-y-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search 160+ currencies (e.g. USD, KES, EUR, Yen)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        {/* Quick Region Selector */}
                        <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                            {['ALL', 'Major', 'Africa', 'Europe', 'Americas', 'Asia & Pacific', 'Middle East'].map(region => (
                                <button
                                    key={region}
                                    type="button"
                                    onClick={() => setSelectedRegion(region)}
                                    className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                                        selectedRegion === region
                                            ? 'bg-gray-900 text-white font-semibold'
                                            : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Major Quick Select Chips (Shown when not searching) */}
                    {!searchQuery && selectedRegion === 'ALL' && (
                        <div className="p-2.5 border-b border-gray-100 bg-white">
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Popular Health System Currencies
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {popularCurrencies.slice(0, 12).map(c => {
                                    const isSelected = c.code === currentCurrency;
                                    return (
                                        <button
                                            key={c.code}
                                            onClick={() => {
                                                setCurrency(c.code);
                                                setIsOpen(false);
                                            }}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all ${
                                                isSelected
                                                    ? 'bg-primary text-white font-bold shadow-sm'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200/60'
                                            }`}
                                        >
                                            <span className="flex items-center gap-1">
                                                <span>{c.flag}</span>
                                                <span className="font-mono">{c.code}</span>
                                            </span>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Currency List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                        {filteredCurrencies.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">
                                No currency found matching "{searchQuery}"
                            </div>
                        ) : (
                            filteredCurrencies.map(c => {
                                const isSelected = c.code === currentCurrency;
                                const rate = rates[c.code] || c.standardRate;
                                return (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            setCurrency(c.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                                            isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-lg leading-none flex-shrink-0">{c.flag}</span>
                                            <div className="truncate">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-bold text-gray-900">{c.code}</span>
                                                    <span className="text-gray-500 font-medium">({c.symbol})</span>
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                                        {c.country}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 truncate">{c.name}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 text-right">
                                            <div className="font-mono text-[11px] text-gray-600">
                                                {rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer / Open Full FX Matrix */}
                    <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ISO 4217 Standard</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                openExchangeModal();
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dark hover:underline text-xs"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Exchange Rates & FX Matrix
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
