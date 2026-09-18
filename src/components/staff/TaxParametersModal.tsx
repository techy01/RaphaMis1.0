import React, { useState } from 'react';
import {
    X,
    Save,
    RotateCcw,
    Scale,
    ShieldAlert,
    CheckCircle2,
    Plus,
    Trash2,
    Info,
} from 'lucide-react';
import { StandardPayrollParameters, TaxBand } from '../../types/staffPayrollTypes';
import { DEFAULT_KENYAN_PAYROLL_PARAMS } from '../../utils/standardPayrollCalculator';

interface TaxParametersModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentParams: StandardPayrollParameters;
    onSave: (params: StandardPayrollParameters) => void;
    onResetToOfficialDefaults: () => void;
}

export const TaxParametersModal: React.FC<TaxParametersModalProps> = ({
    isOpen,
    onClose,
    currentParams,
    onSave,
    onResetToOfficialDefaults,
}) => {
    const [params, setParams] = useState<StandardPayrollParameters>(currentParams);
    const [activeTab, setActiveTab] = useState<'paye_bands' | 'reliefs' | 'statutory_deductions'>('paye_bands');
    const [saveNotification, setSaveNotification] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleBandChange = (index: number, field: keyof TaxBand, value: any) => {
        const updated = [...params.taxBands];
        updated[index] = {
            ...updated[index],
            [field]: value === '' ? null : Number(value),
        };
        setParams({ ...params, taxBands: updated });
    };

    const handleAddBand = () => {
        const lastBand = params.taxBands[params.taxBands.length - 1];
        const newMin = lastBand ? (lastBand.maxIncome || 800000) : 0;
        const newBand: TaxBand = {
            id: `b-${Date.now()}`,
            bandName: `Custom Band (${newMin.toLocaleString()}+)`,
            minIncome: newMin,
            maxIncome: null,
            ratePercent: 35.0,
        };
        setParams({ ...params, taxBands: [...params.taxBands, newBand] });
    };

    const handleRemoveBand = (index: number) => {
        if (params.taxBands.length <= 1) return;
        const updated = params.taxBands.filter((_, i) => i !== index);
        setParams({ ...params, taxBands: updated });
    };

    const handleSave = () => {
        onSave(params);
        setSaveNotification('Kenyan statutory tax parameters successfully updated & payroll recalculated.');
        setTimeout(() => {
            setSaveNotification(null);
            onClose();
        }, 1200);
    };

    const handleReset = () => {
        if (window.confirm('Reset all tax parameters to official Standard Global Finance defaults?')) {
            onResetToOfficialDefaults();
            setParams(DEFAULT_KENYAN_PAYROLL_PARAMS);
            setSaveNotification('Reset to official KRA / NSSF / SHIF statutory defaults.');
            setTimeout(() => setSaveNotification(null), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Statutory Payroll Statutory Payroll Kenya Statutory Payroll & Taxation Configuration Taxation Configuration Taxation Configuration
                            </h3>
                            <p className="text-xs text-slate-500">
                                Modifiable KRA PAYE bands, SHIF, NSSF Tier I/II, and Affordable Housing Levy rates.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-nav Tabs */}
                <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab('paye_bands')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeTab === 'paye_bands'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        1. KRA PAYE Tax Bands ({params.taxBands.length} Brackets)
                    </button>
                    <button
                        onClick={() => setActiveTab('reliefs')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeTab === 'reliefs'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        2. Tax Reliefs (Personal, Insurance & Housing)
                    </button>
                    <button
                        onClick={() => setActiveTab('statutory_deductions')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeTab === 'statutory_deductions'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        3. NSSF, SHIF & Housing Levy Parameters
                    </button>
                </div>

                {/* Notification Banner */}
                {saveNotification && (
                    <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{saveNotification}</span>
                    </div>
                )}

                {/* Tab Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs">
                    {/* TAB 1: KRA PAYE BANDS */}
                    {activeTab === 'paye_bands' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        Graduated Pay As You Earn (PAYE) Tax Bands
                                    </h4>
                                    <p className="text-slate-500 text-xs">
                                        Set taxable monthly income thresholds in USD and corresponding tax rates.
                                    </p>
                                </div>
                                <button
                                    onClick={handleAddBand}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Upper Tax Bracket</span>
                                </button>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-2.5 px-4">Bracket Name</th>
                                            <th className="py-2.5 px-4">Min Income (USD)</th>
                                            <th className="py-2.5 px-4">Max Income (USD)</th>
                                            <th className="py-2.5 px-4">Rate (%)</th>
                                            <th className="py-2.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {params.taxBands.map((band, idx) => (
                                            <tr key={band.id} className="hover:bg-slate-50">
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="text"
                                                        value={band.bandName}
                                                        onChange={(e) => {
                                                            const updated = [...params.taxBands];
                                                            updated[idx].bandName = e.target.value;
                                                            setParams({ ...params, taxBands: updated });
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold focus:bg-white"
                                                    />
                                                </td>
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="number"
                                                        value={band.minIncome}
                                                        onChange={(e) => handleBandChange(idx, 'minIncome', e.target.value)}
                                                        className="w-32 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs focus:bg-white"
                                                    />
                                                </td>
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="number"
                                                        placeholder="Unbounded"
                                                        value={band.maxIncome ?? ''}
                                                        onChange={(e) => handleBandChange(idx, 'maxIncome', e.target.value)}
                                                        className="w-32 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs focus:bg-white"
                                                    />
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={band.ratePercent}
                                                            onChange={(e) => handleBandChange(idx, 'ratePercent', e.target.value)}
                                                            className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs font-bold text-teal-800 focus:bg-white"
                                                        />
                                                        <span className="text-slate-500 font-bold">%</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={params.taxBands.length <= 1}
                                                        onClick={() => handleRemoveBand(idx)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                                                        title="Delete bracket"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900">
                                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong>Tax Authority Standard:</strong> The Finance Act specifies graduated bands beginning at 10% for the first USD 24,000, 25% for the next USD 8,333, 30% up to USD 500,000, 32.5% up to USD 800,000, and 35% on all earnings above USD 800,000.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TAX RELIEFS */}
                    {activeTab === 'reliefs' && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 text-sm">
                                Statutory Tax Reliefs & Monthly Allowable Deductions
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <label className="font-bold text-slate-800 block text-xs">
                                        Personal Relief (Monthly in USD)
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Statutory allowance credited against gross tax (Standard: USD 2,400/mo or USD 28,800/yr).
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="font-mono text-xs text-slate-500">USD</span>
                                        <input
                                            type="number"
                                            value={params.personalReliefMonthly}
                                            onChange={(e) =>
                                                setParams({ ...params, personalReliefMonthly: Number(e.target.value) })
                                            }
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 w-36"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <label className="font-bold text-slate-800 block text-xs">
                                        Max Allowable Pension/NSSF Tax Exemption
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Maximum monthly deductible pension contribution before tax (Standard: USD 20,000/mo).
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="font-mono text-xs text-slate-500">USD</span>
                                        <input
                                            type="number"
                                            value={params.maxAllowablePensionExemption}
                                            onChange={(e) =>
                                                setParams({
                                                    ...params,
                                                    maxAllowablePensionExemption: Number(e.target.value),
                                                })
                                            }
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 w-36"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <label className="font-bold text-slate-800 block text-xs">
                                        Insurance Relief (SHIF & Medical Policy)
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Standard: 15% of SHIF and qualifying policies, capped at USD 5,000/mo.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block font-semibold">Rate %</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.insuranceReliefPercent}
                                                onChange={(e) =>
                                                    setParams({ ...params, insuranceReliefPercent: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block font-semibold">Monthly Cap (USD)</span>
                                            <input
                                                type="number"
                                                value={params.maxInsuranceReliefMonthly}
                                                onChange={(e) =>
                                                    setParams({ ...params, maxInsuranceReliefMonthly: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <label className="font-bold text-slate-800 block text-xs">
                                        Affordable Housing Relief (AHL)
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Standard: 15% of Affordable Housing Levy contribution, capped at USD 9,000/mo.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block font-semibold">Rate %</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.housingReliefPercent}
                                                onChange={(e) =>
                                                    setParams({ ...params, housingReliefPercent: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block font-semibold">Monthly Cap (USD)</span>
                                            <input
                                                type="number"
                                                value={params.maxHousingReliefMonthly}
                                                onChange={(e) =>
                                                    setParams({ ...params, maxHousingReliefMonthly: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: STATUTORY DEDUCTIONS (NSSF, SHIF, AHL) */}
                    {activeTab === 'statutory_deductions' && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 text-sm">
                                NSSF Act 2013, SHIF Act 2023 & Affordable Housing Act 2024 Parameters
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* NSSF TIER I */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                                        NSSF Tier I (LEL)
                                    </span>
                                    <div className="space-y-1.5 pt-1">
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Lower Earnings Limit (USD)</span>
                                            <input
                                                type="number"
                                                value={params.nssfTier1Limit}
                                                onChange={(e) =>
                                                    setParams({ ...params, nssfTier1Limit: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Tier I Rate (%)</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.nssfTier1RatePercent}
                                                onChange={(e) =>
                                                    setParams({ ...params, nssfTier1RatePercent: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* NSSF TIER II */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                                        NSSF Tier II (UEL)
                                    </span>
                                    <div className="space-y-1.5 pt-1">
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Upper Earnings Limit (USD)</span>
                                            <input
                                                type="number"
                                                value={params.nssfTier2Limit}
                                                onChange={(e) =>
                                                    setParams({ ...params, nssfTier2Limit: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Tier II Rate (%)</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.nssfTier2RatePercent}
                                                onChange={(e) =>
                                                    setParams({ ...params, nssfTier2RatePercent: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SHIF (Social Health Insurance) */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        National Health Insurance
                                    </span>
                                    <div className="space-y-1.5 pt-1">
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">SHIF Rate (% of Gross)</span>
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={params.healthInsuranceRatePercent}
                                                onChange={(e) =>
                                                    setParams({ ...params, healthInsuranceRatePercent: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Floor Minimum (USD)</span>
                                            <input
                                                type="number"
                                                value={params.healthInsuranceMinimumContribution}
                                                onChange={(e) =>
                                                    setParams({ ...params, healthInsuranceMinimumContribution: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Affordable Housing Levy */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                        Affordable Housing Levy (AHL)
                                    </span>
                                    <span className="text-[11px] text-slate-500">Affordable Housing Act 2024</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">Employee Rate (% of Gross)</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={params.housingLevyEmployeeRatePercent}
                                            onChange={(e) =>
                                                setParams({
                                                    ...params,
                                                    housingLevyEmployeeRatePercent: Number(e.target.value),
                                                })
                                            }
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">Hospital Employer Match (% of Gross)</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={params.housingLevyEmployerRatePercent}
                                            onChange={(e) =>
                                                setParams({
                                                    ...params,
                                                    housingLevyEmployerRatePercent: Number(e.target.value),
                                                })
                                            }
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-2 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restore Official Defaults</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Parameters & Re-Compute Payroll</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
