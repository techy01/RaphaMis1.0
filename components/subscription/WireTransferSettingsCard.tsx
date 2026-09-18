import React, { useState, useEffect } from 'react';
import {
    Landmark,
    Save,
    Check,
    AlertCircle,
    Building,
    Phone,
    Mail,
    FileText,
    RefreshCw,
    CheckCircle2,
} from 'lucide-react';
import { WireTransferSettings } from '../../packages/shared/types';
import { getWireTransferSettings, saveWireTransferSettings } from '../../api/wireTransferApi';

interface WireTransferSettingsCardProps {
    onSaveSuccess?: () => void;
}

export const WireTransferSettingsCard: React.FC<WireTransferSettingsCardProps> = ({ onSaveSuccess }) => {
    const [settings, setSettings] = useState<WireTransferSettings>(getWireTransferSettings());
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleUpdated = (e: any) => {
            if (e.detail) {
                setSettings(e.detail);
            }
        };
        window.addEventListener('wire-settings-updated', handleUpdated);
        return () => window.removeEventListener('wire-settings-updated', handleUpdated);
    }, []);

    const handleChange = (field: keyof WireTransferSettings, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
        setSaved(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            saveWireTransferSettings(settings);
            setSaved(true);
            setError(null);
            if (onSaveSuccess) onSaveSuccess();
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError('Failed to update bank wire settings.');
        }
    };

    const resetToDefaults = () => {
        const defaultSettings = saveWireTransferSettings({
            bankName: 'Global Standard Bank',
            accountName: 'Saaslink Technologies Limited - RaphaMIS Treasury',
            accountNumber: '1289 4092 1104',
            swiftBic: 'KCBLKENX',
            branchName: 'Global Central Branch',
            branchCode: '01089',
            currency: 'KES',
            routingNumber: '01089-KCB',
            paymentInstructions: 'Please quote your School/Institution Name and Invoice Number in the payment narration. Once wired, email the bank slip to billing@saaslink.co.ke or call 0720935895 for instant clearance.',
            supportPhone: '0720935895',
            supportEmail: 'billing@saaslink.co.ke',
        });
        setSettings(defaultSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-white">Super Admin Bank Wire Transfer Details</h3>
                        <p className="text-xs text-slate-300">
                            These bank credentials are automatically embedded in generated customer invoices for wire transfer subscriptions.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={resetToDefaults}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors"
                    title="Reset to default Global bank details"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Defaults</span>
                </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
                {saved && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                            Bank wire transfer settings updated successfully! All new invoices generated will pick up these details.
                        </span>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Bank Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={settings.bankName}
                            onChange={(e) => handleChange('bankName', e.target.value)}
                            placeholder="e.g. Global Standard Bank"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Account Name / Beneficiary *
                        </label>
                        <input
                            type="text"
                            required
                            value={settings.accountName}
                            onChange={(e) => handleChange('accountName', e.target.value)}
                            placeholder="e.g. Saaslink Technologies Limited - RaphaMIS Treasury"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Account Number / IBAN */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Account Number / IBAN *
                        </label>
                        <input
                            type="text"
                            required
                            value={settings.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            placeholder="e.g. 1289 4092 1104"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                        />
                    </div>

                    {/* SWIFT / BIC */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            SWIFT / BIC Code *
                        </label>
                        <input
                            type="text"
                            required
                            value={settings.swiftBic}
                            onChange={(e) => handleChange('swiftBic', e.target.value)}
                            placeholder="e.g. KCBLKENX"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono uppercase"
                        />
                    </div>

                    {/* Branch Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Branch Name
                        </label>
                        <input
                            type="text"
                            value={settings.branchName}
                            onChange={(e) => handleChange('branchName', e.target.value)}
                            placeholder="e.g. Global Central Branch"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Branch Code / Clearing */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Branch Clearing Code / Routing
                        </label>
                        <input
                            type="text"
                            value={settings.branchCode}
                            onChange={(e) => handleChange('branchCode', e.target.value)}
                            placeholder="e.g. 01089"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Default Wire Settlement Currency
                        </label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-semibold"
                        >
                            <option value="KES">KES - Kenyan Shillings</option>
                            <option value="USD">USD - US Dollars</option>
                            <option value="EUR">EUR - Euros</option>
                            <option value="GBP">GBP - British Pounds</option>
                        </select>
                    </div>

                    {/* Support Contact Phone */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Billing Department Hotline
                        </label>
                        <input
                            type="text"
                            value={settings.supportPhone}
                            onChange={(e) => handleChange('supportPhone', e.target.value)}
                            placeholder="e.g. 0720935895"
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Instructions Textarea */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Invoice Wire Instructions & Payment Notes
                    </label>
                    <textarea
                        rows={3}
                        value={settings.paymentInstructions}
                        onChange={(e) => handleChange('paymentInstructions', e.target.value)}
                        placeholder="Instructions displayed on generated payment invoices..."
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                        Subscribers will see these exact wire instructions on their payment invoices when opting for bank wire transfer.
                    </p>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                        Last updated: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'System Default'}
                    </span>
                    <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Wire Transfer Settings</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
