import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_CURRENCIES, CurrencyInfo, getCurrencyInfo } from '../config/currencies';
import { fetchStandardExchangeRates, getBaselineRates, ExchangeRatesResult } from '../api/exchangeRateService';

export interface FormatCurrencyOptions {
    showCode?: boolean;
    compact?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    applySpread?: boolean;
}

export interface CurrencyContextType {
    currentCurrency: string;
    baseCurrency: string;
    currencyInfo: CurrencyInfo;
    baseCurrencyInfo: CurrencyInfo;
    rates: Record<string, number>;
    allCurrencies: CurrencyInfo[];
    popularCurrencies: CurrencyInfo[];
    setCurrency: (code: string) => void;
    setBaseCurrency: (code: string) => void;
    convert: (amount: number, fromCurrency?: string, toCurrency?: string, applySpread?: boolean) => number;
    format: (amount: number, currencyCode?: string, options?: FormatCurrencyOptions) => string;
    convertAndFormat: (amount: number, fromCurrency?: string, toCurrency?: string, options?: FormatCurrencyOptions) => string;
    exchangeMeta: {
        provider: string;
        standard: string;
        timeLastUpdateUtc: string;
        timeNextUpdateUtc: string;
        isLive: boolean;
        source: 'live_ecb_forex' | 'cached' | 'fallback_standard';
    };
    refreshRates: () => Promise<void>;
    isRefreshing: boolean;
    lastRefreshedAt: Date | null;
    fxSpread: number; // percentage, e.g. 0 = mid-market, 1.5 = 1.5% institutional bank spread
    setFxSpread: (spread: number) => void;
    customOverrides: Record<string, number>;
    setCustomOverride: (code: string, rate: number | null) => void;
    isExchangeModalOpen: boolean;
    openExchangeModal: () => void;
    closeExchangeModal: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const PREF_CURRENCY_KEY = 'raphamis_pref_currency';
const BASE_CURRENCY_KEY = 'raphamis_base_currency';
const SPREAD_KEY = 'raphamis_fx_spread';
const OVERRIDES_KEY = 'raphamis_custom_rate_overrides';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Current display currency (default USD or saved in localStorage)
    const [currentCurrency, setCurrentCurrencyState] = useState<string>(() => {
        try {
            return localStorage.getItem(PREF_CURRENCY_KEY) || 'USD';
        } catch {
            return 'USD';
        }
    });

    // Base accounting currency (USD standard in enterprise healthcare)
    const [baseCurrency, setBaseCurrencyState] = useState<string>(() => {
        try {
            return localStorage.getItem(BASE_CURRENCY_KEY) || 'USD';
        } catch {
            return 'USD';
        }
    });

    // FX Spread percentage (default 0% = pure mid-market standard)
    const [fxSpread, setFxSpreadState] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(SPREAD_KEY);
            return saved ? parseFloat(saved) : 0;
        } catch {
            return 0;
        }
    });

    // Custom overrides set by tenant/admin
    const [customOverrides, setCustomOverridesState] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem(OVERRIDES_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Rates map relative to baseCurrency (1 Base = X target)
    const [rates, setRates] = useState<Record<string, number>>(() => getBaselineRates());

    // Exchange standard metadata
    const [exchangeMeta, setExchangeMeta] = useState<ExchangeRatesResult>({
        baseCode: 'USD',
        provider: 'European Central Bank & Global Forex Mid-Market Standard (open.er-api)',
        standard: 'ISO 4217 / ECB Reference Rate Standard',
        timeLastUpdateUtc: 'Connecting to exchange standard...',
        timeNextUpdateUtc: 'Synchronizing...',
        rates: getBaselineRates(),
        isLive: true,
        source: 'cached'
    });

    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(new Date());
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);

    // Fetch live standard rates on mount
    const loadRates = useCallback(async (base: string = baseCurrency) => {
        setIsRefreshing(true);
        try {
            const result = await fetchStandardExchangeRates(base);
            // Apply custom overrides on top of standard rates
            const mergedRates = {
                ...result.rates,
                ...customOverrides
            };
            setRates(mergedRates);
            setExchangeMeta(result);
            setLastRefreshedAt(new Date());
        } catch (err) {
            console.error('Failed to sync with standard exchange rates feed:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [baseCurrency, customOverrides]);

    useEffect(() => {
        loadRates(baseCurrency);
    }, [loadRates, baseCurrency]);

    // Save currency preferences
    const setCurrency = useCallback((code: string) => {
        const normalized = code.toUpperCase();
        setCurrentCurrencyState(normalized);
        try {
            localStorage.setItem(PREF_CURRENCY_KEY, normalized);
        } catch {}
    }, []);

    const setBaseCurrency = useCallback((code: string) => {
        const normalized = code.toUpperCase();
        setBaseCurrencyState(normalized);
        try {
            localStorage.setItem(BASE_CURRENCY_KEY, normalized);
        } catch {}
        loadRates(normalized);
    }, [loadRates]);

    const setFxSpread = useCallback((spread: number) => {
        setFxSpreadState(spread);
        try {
            localStorage.setItem(SPREAD_KEY, spread.toString());
        } catch {}
    }, []);

    const setCustomOverride = useCallback((code: string, rate: number | null) => {
        setCustomOverridesState(prev => {
            const updated = { ...prev };
            if (rate === null || rate <= 0) {
                delete updated[code.toUpperCase()];
            } else {
                updated[code.toUpperCase()] = rate;
            }
            try {
                localStorage.setItem(OVERRIDES_KEY, JSON.stringify(updated));
            } catch {}
            // Update current active rates
            setRates(r => ({ ...r, ...updated }));
            return updated;
        });
    }, []);

    const refreshRates = useCallback(async () => {
        // Clear local storage cache to force fresh online fetch
        try {
            localStorage.removeItem('raphamis_fx_rates_cache');
        } catch {}
        await loadRates(baseCurrency);
    }, [loadRates, baseCurrency]);

    // Conversion calculation
    const convert = useCallback((
        amount: number,
        fromCurrency: string = baseCurrency,
        toCurrency: string = currentCurrency,
        applySpread: boolean = false
    ): number => {
        if (isNaN(amount) || amount === 0) return 0;
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();

        if (from === to) return amount;

        // Rate of fromCurrency relative to base
        const fromRate = from === baseCurrency ? 1.0 : (rates[from] || 1.0);
        // Rate of toCurrency relative to base
        const toRate = to === baseCurrency ? 1.0 : (rates[to] || 1.0);

        // Convert from -> base -> to
        const amountInBase = amount / fromRate;
        let converted = amountInBase * toRate;

        // Apply institutional forex spread if requested
        if (applySpread && fxSpread > 0) {
            converted = converted * (1 + fxSpread / 100);
        }

        return converted;
    }, [baseCurrency, currentCurrency, rates, fxSpread]);

    // Format currency using standard Intl.NumberFormat
    const format = useCallback((
        amount: number,
        currencyCode: string = currentCurrency,
        options?: FormatCurrencyOptions
    ): string => {
        const code = currencyCode.toUpperCase();
        const info = getCurrencyInfo(code);
        const decimals = options?.minimumFractionDigits !== undefined
            ? options.minimumFractionDigits
            : info.decimals;

        let num = amount;
        if (options?.applySpread && fxSpread > 0) {
            num = num * (1 + fxSpread / 100);
        }

        try {
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: code,
                notation: options?.compact ? 'compact' : 'standard',
                minimumFractionDigits: decimals,
                maximumFractionDigits: options?.maximumFractionDigits ?? decimals
            });
            const formatted = formatter.format(num);

            if (options?.showCode && !formatted.includes(code)) {
                return `${formatted} ${code}`;
            }
            return formatted;
        } catch {
            // Fallback for custom or unrecognized environments
            const symbol = info.symbol || '$';
            const formattedNum = num.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            return `${symbol}${formattedNum}${options?.showCode ? ` ${code}` : ''}`;
        }
    }, [currentCurrency, fxSpread]);

    // Combined convert and format
    const convertAndFormat = useCallback((
        amount: number,
        fromCurrency: string = baseCurrency,
        toCurrency: string = currentCurrency,
        options?: FormatCurrencyOptions
    ): string => {
        const converted = convert(amount, fromCurrency, toCurrency, options?.applySpread);
        return format(converted, toCurrency, options);
    }, [convert, format, baseCurrency, currentCurrency]);

    const currencyInfo = useMemo(() => getCurrencyInfo(currentCurrency), [currentCurrency]);
    const baseCurrencyInfo = useMemo(() => getCurrencyInfo(baseCurrency), [baseCurrency]);
    const popularCurrencies = useMemo(() => ALL_CURRENCIES.filter(c => c.isPopular), []);

    const openExchangeModal = useCallback(() => setIsExchangeModalOpen(true), []);
    const closeExchangeModal = useCallback(() => setIsExchangeModalOpen(false), []);

    return (
        <CurrencyContext.Provider
            value={{
                currentCurrency,
                baseCurrency,
                currencyInfo,
                baseCurrencyInfo,
                rates,
                allCurrencies: ALL_CURRENCIES,
                popularCurrencies,
                setCurrency,
                setBaseCurrency,
                convert,
                format,
                convertAndFormat,
                exchangeMeta,
                refreshRates,
                isRefreshing,
                lastRefreshedAt,
                fxSpread,
                setFxSpread,
                customOverrides,
                setCustomOverride,
                isExchangeModalOpen,
                openExchangeModal,
                closeExchangeModal
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
