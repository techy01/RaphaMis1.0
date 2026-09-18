import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTenants,
    updateTenantBranding,
    resetTenantBranding,
    PRESET_MEDICAL_LOGOS,
    DEFAULT_TENANT_BRANDING,
    ACTIVE_TENANT_BRANDING_KEY
} from '../../api/tenantsApi';
import { Tenant, TenantBranding, TenantStatus } from '../../packages/shared/types';
import {
    Palette,
    Upload,
    Image as ImageIcon,
    Sparkles,
    CheckCircle2,
    Building2,
    Eye,
    RefreshCw,
    FileText,
    Layout,
    Trash2,
    Check,
    Sliders,
    HelpCircle,
    Copy,
    Download
} from 'lucide-react';

const HEALTHCARE_PALETTES = [
    {
        name: 'Clinical Teal & Sky',
        description: 'Standard modern clinical look with calm teal and sky blue accents.',
        primary: '#0d9488',
        accent: '#0284c7',
        secondary: '#0f172a'
    },
    {
        name: 'Academic Royal Navy',
        description: 'Prestigious university medical center with high-contrast royal navy.',
        primary: '#1e40af',
        accent: '#3b82f6',
        secondary: '#172554'
    },
    {
        name: 'Emergency Trauma Ruby',
        description: 'High-visibility vibrant ruby red for rapid-response trauma centers.',
        primary: '#b91c1c',
        accent: '#f43f5e',
        secondary: '#450a0a'
    },
    {
        name: 'Pediatric Mint & Forest',
        description: 'Friendly, warm greens reassuring pediatric patients and families.',
        primary: '#059669',
        accent: '#10b981',
        secondary: '#064e3b'
    },
    {
        name: 'Orthopedic & Neuro Violet',
        description: 'Distinctive amethyst violet for surgical and specialist institutions.',
        primary: '#7c3aed',
        accent: '#a855f7',
        secondary: '#2e1065'
    },
    {
        name: 'Executive Slate Minimal',
        description: 'Subtle corporate grayscale with neutral accents for private healthcare networks.',
        primary: '#334155',
        accent: '#64748b',
        secondary: '#0f172a'
    }
];

export const TenantBrandSettingsSection: React.FC = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch tenants from API / local storage
    const { data: tenants = [], isLoading, refetch } = useQuery<Tenant[]>({
        queryKey: ['tenants'],
        queryFn: getTenants
    });

    // Selected tenant ID
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [activePreviewTab, setActivePreviewTab] = useState<'portal' | 'rx' | 'nav'>('portal');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [urlInput, setUrlInput] = useState<string>('');
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

    // Current form branding draft
    const [draftBranding, setDraftBranding] = useState<TenantBranding>(DEFAULT_TENANT_BRANDING);
    const [hospitalName, setHospitalName] = useState<string>('');

    // Ensure selected tenant defaults to first available
    useEffect(() => {
        if (tenants.length > 0 && (!selectedTenantId || !tenants.some(t => t.id === selectedTenantId))) {
            setSelectedTenantId(tenants[0].id);
        }
    }, [tenants, selectedTenantId]);

    // When selected tenant changes, synchronize form state
    const currentTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];

    useEffect(() => {
        if (currentTenant) {
            setHospitalName(currentTenant.name);
            setDraftBranding({
                primaryColor: currentTenant.branding?.primaryColor || DEFAULT_TENANT_BRANDING.primaryColor,
                accentColor: currentTenant.branding?.accentColor || DEFAULT_TENANT_BRANDING.accentColor,
                secondaryColor: currentTenant.branding?.secondaryColor || DEFAULT_TENANT_BRANDING.secondaryColor,
                logoUrl: currentTenant.branding?.logoUrl || PRESET_MEDICAL_LOGOS[0].dataUrl,
                hospitalMotto: currentTenant.branding?.hospitalMotto || DEFAULT_TENANT_BRANDING.hospitalMotto,
                facilityCode: currentTenant.branding?.facilityCode || DEFAULT_TENANT_BRANDING.facilityCode,
                headerBgStyle: currentTenant.branding?.headerBgStyle || 'white',
                supportEmail: currentTenant.branding?.supportEmail || currentTenant.email || DEFAULT_TENANT_BRANDING.supportEmail,
                supportPhone: currentTenant.branding?.supportPhone || currentTenant.phone || DEFAULT_TENANT_BRANDING.supportPhone,
                portalBannerText: currentTenant.branding?.portalBannerText || DEFAULT_TENANT_BRANDING.portalBannerText,
                letterheadFooter: currentTenant.branding?.letterheadFooter || DEFAULT_TENANT_BRANDING.letterheadFooter,
            });
            setUrlInput('');
        }
    }, [selectedTenantId, currentTenant]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!selectedTenantId) return;
            return await updateTenantBranding(selectedTenantId, draftBranding);
        },
        onSuccess: (updatedTenant) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setSuccessMessage(`Branding successfully updated for ${updatedTenant?.name || 'hospital instance'}!`);
            setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (err: any) => {
            alert(`Failed to save branding: ${err.message || 'Unknown error'}`);
        }
    });

    // Reset mutation
    const resetMutation = useMutation({
        mutationFn: async () => {
            if (!selectedTenantId) return;
            return await resetTenantBranding(selectedTenantId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setDraftBranding(DEFAULT_TENANT_BRANDING);
            setSuccessMessage('Hospital branding reset to platform defaults.');
            setTimeout(() => setSuccessMessage(null), 3500);
        }
    });

    // File upload handler
    const handleFileUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (PNG, JPG, SVG, WebP).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image file size is too large (maximum 5MB recommended).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
                setDraftBranding(prev => ({ ...prev, logoUrl: dataUrl }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleApplyUrl = () => {
        if (!urlInput.trim()) return;
        setDraftBranding(prev => ({ ...prev, logoUrl: urlInput.trim() }));
        setShowUrlInput(false);
    };

    const handleSetActiveSession = () => {
        if (!currentTenant) return;
        try {
            localStorage.setItem(ACTIVE_TENANT_BRANDING_KEY, JSON.stringify({
                tenantId: currentTenant.id,
                tenantName: currentTenant.name,
                ...draftBranding
            }));
            window.dispatchEvent(new CustomEvent('raphamis_brand_updated', { detail: draftBranding }));
            setSuccessMessage(`Active application header updated to ${currentTenant.name}.`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleExportJson = () => {
        const config = {
            tenantId: currentTenant?.id,
            hospitalName: currentTenant?.name,
            branding: draftBranding,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTenant?.name.toLowerCase().replace(/\s+/g, '_')}_branding.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900">Hospital & Tenant Brand Settings</h3>
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                                White-Label Engine
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Upload a custom logo, define primary clinical branding colors, and tailor patient portal letterheads for each hospital instance.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-1.5 transition"
                        title="Reload tenant list"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                        Reload
                    </button>
                    <button
                        type="button"
                        onClick={handleExportJson}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
                        title="Export branding configuration"
                    >
                        <Download className="w-3.5 h-3.5 text-gray-500" />
                        Export Spec
                    </button>
                </div>
            </div>

            {/* Success Toast / Notification */}
            {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{successMessage}</span>
                </div>
            )}

            {/* Tenant / Hospital Instance Picker */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <label htmlFor="hospital-select" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-teal-600" />
                            Select Target Hospital Instance / Tenant
                        </label>
                        <p className="text-[11px] text-slate-500">
                            Customizations applied below will brand this facility's patient portal, reports, prescriptions, and navigation.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSetActiveSession}
                            className="text-[11px] font-semibold text-teal-700 bg-teal-100/80 hover:bg-teal-200/80 px-2.5 py-1 rounded-lg border border-teal-300 transition"
                            title="Set this hospital as the live active session brand"
                        >
                            Set as Active Session
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-2">
                        <select
                            id="hospital-select"
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none shadow-2xs"
                        >
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.id}) — {t.subscriptionPlan || 'Enterprise'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {currentTenant && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                            <div
                                className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-2xs"
                                style={{ backgroundColor: draftBranding.primaryColor }}
                            />
                            <div className="truncate">
                                <span className="text-slate-400 text-[10px] block font-mono">Plan & Code</span>
                                <span className="font-bold text-slate-800 text-[11px] truncate">
                                    {draftBranding.facilityCode || currentTenant.id} • {currentTenant.subscriptionPlan}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Configuration Grid: Logo & Colors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Logo & Branding Identity (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                    {/* SECTION 1: CUSTOM LOGO UPLOAD */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                    <ImageIcon className="w-4 h-4 text-teal-600" />
                                    1. Hospital Custom Logo
                                </h4>
                                <p className="text-[11px] text-gray-500">
                                    Appears on the patient portal, invoice receipts, and printable clinical notes.
                                </p>
                            </div>

                            {draftBranding.logoUrl && (
                                <button
                                    type="button"
                                    onClick={() => setDraftBranding(prev => ({ ...prev, logoUrl: PRESET_MEDICAL_LOGOS[0].dataUrl }))}
                                    className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition"
                                >
                                    <Trash2 className="w-3 h-3" /> Revert
                                </button>
                            )}
                        </div>

                        {/* Logo Preview & Upload Box */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Visual Logo Container */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 p-2 flex items-center justify-center bg-slate-50 relative group shrink-0 overflow-hidden shadow-2xs">
                                {draftBranding.logoUrl ? (
                                    <img
                                        src={draftBranding.logoUrl}
                                        alt="Hospital Logo"
                                        className="max-h-full max-w-full object-contain drop-shadow-xs"
                                    />
                                ) : (
                                    <div className="text-center p-2">
                                        <Building2 className="w-8 h-8 text-gray-400 mx-auto" />
                                        <span className="text-[10px] text-gray-400 block mt-1">No Logo</span>
                                    </div>
                                )}
                            </div>

                            {/* Drag-and-Drop / Browse Area */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`flex-1 w-full border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                                    isDragging
                                        ? 'border-teal-600 bg-teal-50/60'
                                        : 'border-gray-300 bg-gray-50/60 hover:bg-gray-100/80'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    aria-label="Upload Hospital Logo Image"
                                />

                                <Upload className="w-6 h-6 text-teal-600 mx-auto mb-1.5" />
                                <p className="text-xs font-bold text-gray-800">
                                    Click to upload logo or drag and drop
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    SVG, PNG, JPG or WebP (max. 5MB, square 1:1 or 2:1 recommended)
                                </p>
                            </div>
                        </div>

                        {/* Direct URL alternative */}
                        <div>
                            {!showUrlInput ? (
                                <button
                                    type="button"
                                    onClick={() => setShowUrlInput(true)}
                                    className="text-[11px] text-teal-700 hover:underline font-semibold"
                                >
                                    + Or specify an external image URL directly
                                </button>
                            ) : (
                                <div className="flex gap-2 items-center pt-1">
                                    <input
                                        type="url"
                                        placeholder="https://hospital.example.com/assets/logo.png"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyUrl}
                                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUrlInput(false)}
                                        className="px-2 py-1.5 text-gray-500 text-xs hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Preset Medical Logos Gallery */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <span className="text-[11px] font-bold text-gray-700 block">
                                Or choose a curated clinical preset icon:
                            </span>
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_MEDICAL_LOGOS.map((preset) => {
                                    const isSelected = draftBranding.logoUrl === preset.dataUrl;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setDraftBranding(prev => ({ ...prev, logoUrl: preset.dataUrl }))}
                                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                                isSelected
                                                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30 shadow-2xs'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            title={preset.name}
                                        >
                                            <img
                                                src={preset.dataUrl}
                                                alt={preset.name}
                                                className="w-8 h-8 rounded-lg object-contain shadow-2xs"
                                            />
                                            <span className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">
                                                {preset.name.split(' ')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: PRIMARY BRANDING COLORS */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <Palette className="w-4 h-4 text-teal-600" />
                                2. Primary Branding Colors & Theme
                            </h4>
                            <p className="text-[11px] text-gray-500">
                                Define the primary identity color and secondary accent tone for buttons, badges, and headers.
                            </p>
                        </div>

                        {/* Color Pickers & Hex Codes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Primary Color Picker */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="primary-color-input" className="text-xs font-bold text-gray-800">
                                        Primary Brand Color
                                    </label>
                                    <span
                                        className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                                        style={{ backgroundColor: draftBranding.primaryColor }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="primary-color-input"
                                        type="color"
                                        value={draftBranding.primaryColor}
                                        onChange={(e) => setDraftBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
                                        aria-label="Primary Brand Color Picker"
                                    />
                                    <input
                                        type="text"
                                        value={draftBranding.primaryColor}
                                        onChange={(e) => setDraftBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                        placeholder="#0D9488"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 block">
                                    Used for main action buttons, active navigation, and hospital badges.
                                </span>
                            </div>

                            {/* Secondary / Accent Color Picker */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="accent-color-input" className="text-xs font-bold text-gray-800">
                                        Secondary / Accent Color
                                    </label>
                                    <span
                                        className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                                        style={{ backgroundColor: draftBranding.accentColor }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="accent-color-input"
                                        type="color"
                                        value={draftBranding.accentColor}
                                        onChange={(e) => setDraftBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                                        className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
                                        aria-label="Accent Color Picker"
                                    />
                                    <input
                                        type="text"
                                        value={draftBranding.accentColor}
                                        onChange={(e) => setDraftBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                        placeholder="#0284C7"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 block">
                                    Used for secondary badges, subtle focus highlights, and border trims.
                                </span>
                            </div>
                        </div>

                        {/* Header Background Tone Selector */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-bold text-gray-800 block">
                                Patient Portal & Header Surface Tone
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'white', label: 'Crisp White', desc: 'Minimalist clean' },
                                    { id: 'tint', label: 'Branded Tint', desc: 'Soft 5% tone' },
                                    { id: 'dark', label: 'Navy Dark', desc: 'High authority' }
                                ].map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setDraftBranding(prev => ({ ...prev, headerBgStyle: style.id as any }))}
                                        className={`p-2.5 rounded-xl border text-left transition ${
                                            draftBranding.headerBgStyle === style.id
                                                ? 'border-teal-600 bg-teal-50/80 font-bold ring-2 ring-teal-600/20'
                                                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <span className="text-xs block font-bold text-gray-900">{style.label}</span>
                                        <span className="text-[10px] text-gray-500">{style.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 1-Click Healthcare Palettes */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <span className="text-[11px] font-bold text-gray-700 block">
                                Quick Clinical Color Presets:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {HEALTHCARE_PALETTES.map((palette) => {
                                    const isMatch = draftBranding.primaryColor === palette.primary && draftBranding.accentColor === palette.accent;
                                    return (
                                        <button
                                            key={palette.name}
                                            type="button"
                                            onClick={() => setDraftBranding(prev => ({
                                                ...prev,
                                                primaryColor: palette.primary,
                                                accentColor: palette.accent,
                                                secondaryColor: palette.secondary
                                            }))}
                                            className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                                                isMatch
                                                    ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div>
                                                <span className="text-xs font-bold text-gray-800 block truncate">{palette.name}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: palette.primary }} />
                                                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: palette.accent }} />
                                                    <span className="text-[10px] font-mono text-gray-400">{palette.primary}</span>
                                                </div>
                                            </div>
                                            {isMatch && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: HOSPITAL IDENTITY & LETTERHEAD METADATA */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <FileText className="w-4 h-4 text-teal-600" />
                                3. Clinical Letterhead & Portal Announcement
                            </h4>
                            <p className="text-[11px] text-gray-500">
                                Institutional slogan, licensing code, and portal greeting shown to patients and physicians.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                    Hospital Motto / Tagline
                                </label>
                                <input
                                    type="text"
                                    value={draftBranding.hospitalMotto || ''}
                                    onChange={(e) => setDraftBranding(prev => ({ ...prev, hospitalMotto: e.target.value }))}
                                    placeholder="Excellence in Compassionate Care"
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                    Facility Accreditation / Code
                                </label>
                                <input
                                    type="text"
                                    value={draftBranding.facilityCode || ''}
                                    onChange={(e) => setDraftBranding(prev => ({ ...prev, facilityCode: e.target.value }))}
                                    placeholder="STJ-ACAD-01"
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Patient Portal Live Banner Announcement
                            </label>
                            <input
                                type="text"
                                value={draftBranding.portalBannerText || ''}
                                onChange={(e) => setDraftBranding(prev => ({ ...prev, portalBannerText: e.target.value }))}
                                placeholder="Welcome to the Patient Portal. 24/7 Virtual Emergency Triage is active."
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Prescription & Report Letterhead Footer Note
                            </label>
                            <input
                                type="text"
                                value={draftBranding.letterheadFooter || ''}
                                onChange={(e) => setDraftBranding(prev => ({ ...prev, letterheadFooter: e.target.value }))}
                                placeholder="Certified Tertiary Facility • MOH License #HL-0891-2026 • ISO 15189"
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Interactive Live Brand Sandbox (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 sticky top-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4 text-teal-600" />
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Live Multi-Surface Preview
                                </h4>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-teal-800">
                                Real-Time Render
                            </span>
                        </div>

                        {/* Preview Surface Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('portal')}
                                className={`flex-1 py-1.5 rounded-md transition text-center ${
                                    activePreviewTab === 'portal'
                                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Patient Portal
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('rx')}
                                className={`flex-1 py-1.5 rounded-md transition text-center ${
                                    activePreviewTab === 'rx'
                                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Clinical Rx Slip
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('nav')}
                                className={`flex-1 py-1.5 rounded-md transition text-center ${
                                    activePreviewTab === 'nav'
                                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                System Topbar
                            </button>
                        </div>

                        {/* PREVIEW CONTAINER 1: PATIENT PORTAL */}
                        {activePreviewTab === 'portal' && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                {/* Simulated Browser / Device Bar */}
                                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    </div>
                                    <span className="font-mono text-slate-600 truncate">
                                        portal.{currentTenant?.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'hospital'}.raphamis.health
                                    </span>
                                    <span>SSL 256-bit</span>
                                </div>

                                {/* Branded Portal Header */}
                                <div
                                    className="p-4 transition-colors"
                                    style={{
                                        backgroundColor: draftBranding.headerBgStyle === 'dark'
                                            ? (draftBranding.secondaryColor || '#0f172a')
                                            : draftBranding.headerBgStyle === 'tint'
                                            ? `${draftBranding.primaryColor}12`
                                            : '#ffffff',
                                        borderBottom: `2px solid ${draftBranding.primaryColor}30`,
                                        color: draftBranding.headerBgStyle === 'dark' ? '#ffffff' : '#0f172a'
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            {draftBranding.logoUrl ? (
                                                <img
                                                    src={draftBranding.logoUrl}
                                                    alt="Logo"
                                                    className="w-9 h-9 object-contain rounded-lg shrink-0 shadow-2xs"
                                                />
                                            ) : (
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 font-bold"
                                                    style={{ backgroundColor: draftBranding.primaryColor }}
                                                >
                                                    {hospitalName.charAt(0) || 'H'}
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="font-bold text-xs truncate max-w-[180px]">
                                                    {hospitalName || 'Hospital Name'}
                                                </h5>
                                                <p className="text-[10px] opacity-75 truncate max-w-[180px]">
                                                    {draftBranding.hospitalMotto || 'Compassionate Healing'}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                                            style={{
                                                backgroundColor: `${draftBranding.accentColor}20`,
                                                color: draftBranding.headerBgStyle === 'dark' ? '#ffffff' : draftBranding.primaryColor,
                                                borderColor: `${draftBranding.accentColor}50`
                                            }}
                                        >
                                            {draftBranding.facilityCode || 'STJ-01'}
                                        </span>
                                    </div>
                                </div>

                                {/* Portal Content Mockup */}
                                <div className="p-4 space-y-3 bg-slate-50/50">
                                    {/* Portal Announcement Banner */}
                                    <div
                                        className="p-2 rounded-lg text-[11px] font-medium border flex items-center gap-2"
                                        style={{
                                            backgroundColor: `${draftBranding.primaryColor}10`,
                                            borderColor: `${draftBranding.primaryColor}30`,
                                            color: draftBranding.primaryColor
                                        }}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{draftBranding.portalBannerText || 'Welcome to the patient portal.'}</span>
                                    </div>

                                    {/* Patient Card Preview */}
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">Welcome, Jane Doe</span>
                                            <span className="text-[10px] font-mono text-slate-400">MRN: P-90821</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Upcoming Appointment: Tomorrow at 10:30 AM (Cardiology Clinic).
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold shadow-2xs transition"
                                                style={{ backgroundColor: draftBranding.primaryColor }}
                                            >
                                                Check-In Now
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition"
                                                style={{
                                                    color: draftBranding.accentColor,
                                                    borderColor: `${draftBranding.accentColor}60`,
                                                    backgroundColor: `${draftBranding.accentColor}08`
                                                }}
                                            >
                                                View Care Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PREVIEW CONTAINER 2: CLINICAL RX & LETTERHEAD */}
                        {activePreviewTab === 'rx' && (
                            <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs text-slate-800 space-y-3 font-sans">
                                {/* Letterhead Header Band */}
                                <div
                                    className="border-b-2 pb-3 flex items-center justify-between"
                                    style={{ borderColor: draftBranding.primaryColor }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {draftBranding.logoUrl ? (
                                            <img
                                                src={draftBranding.logoUrl}
                                                alt="Rx Logo"
                                                className="w-10 h-10 object-contain shrink-0"
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 font-bold"
                                                style={{ backgroundColor: draftBranding.primaryColor }}
                                            >
                                                Rx
                                            </div>
                                        )}
                                        <div>
                                            <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">
                                                {hospitalName || 'St. Jude General Hospital'}
                                            </h5>
                                            <p className="text-[10px] text-slate-500 italic">
                                                {draftBranding.hospitalMotto || 'Compassionate Healing, Advanced Clinical Medicine'}
                                            </p>
                                            <p className="text-[9px] font-mono text-slate-400">
                                                Accreditation: {draftBranding.facilityCode || 'STJ-ACAD-01'} • Tel: {draftBranding.supportPhone || '+1 (555) 000-0000'}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="text-right px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                                        style={{ backgroundColor: draftBranding.primaryColor }}
                                    >
                                        Official Rx
                                    </div>
                                </div>

                                {/* Patient & Rx Mock Details */}
                                <div className="text-[11px] space-y-2">
                                    <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-600">
                                        <span>Patient: <strong>David Mwangi (Age 42)</strong></span>
                                        <span>Date: <strong>Sept 15, 2026</strong></span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-lg font-mono text-[10px] space-y-1">
                                        <p className="font-bold text-slate-900">Rx: Amoxicillin / Clavulanate 625mg Tablets</p>
                                        <p className="text-slate-600">Sig: Take 1 tablet PO Q12H with meals for 7 days.</p>
                                        <p className="text-slate-500">Dispense: #14 (Fourteen) • Refills: 0 (Zero)</p>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 text-[10px]">
                                        <span className="text-slate-400">Signature: _______________________</span>
                                        <span className="font-bold" style={{ color: draftBranding.primaryColor }}>
                                            Dr. Sarah Jenkins, MD (Lic #MED-4421)
                                        </span>
                                    </div>
                                </div>

                                {/* Letterhead Footer */}
                                <div className="border-t border-slate-200 pt-2 text-center text-[9px] text-slate-400">
                                    {draftBranding.letterheadFooter || 'Certified Tertiary Healthcare Facility • MOH Accredited'}
                                </div>
                            </div>
                        )}

                        {/* PREVIEW CONTAINER 3: SYSTEM TOPBAR */}
                        {activePreviewTab === 'nav' && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {draftBranding.logoUrl ? (
                                            <img
                                                src={draftBranding.logoUrl}
                                                alt="Nav Logo"
                                                className="w-7 h-7 object-contain rounded-md shrink-0"
                                            />
                                        ) : (
                                            <span
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                style={{ backgroundColor: draftBranding.primaryColor }}
                                            >
                                                R
                                            </span>
                                        )}
                                        <span className="font-bold text-xs text-slate-800 truncate">
                                            {hospitalName}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                                            style={{ backgroundColor: draftBranding.primaryColor }}
                                        >
                                            Active
                                        </span>
                                        <div
                                            className="w-6 h-6 rounded-full border-2"
                                            style={{ borderColor: draftBranding.accentColor }}
                                        >
                                            <img
                                                src="https://ui-avatars.com/api/?name=Admin&background=0d9488&color=fff"
                                                alt="User"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 text-[11px] text-slate-500 bg-slate-50">
                                    Shows the main navigation appearance for physicians and nurses when logged into this hospital instance.
                                </div>
                            </div>
                        )}

                        {/* Action Buttons: Save & Reset */}
                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || isLoading}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: draftBranding.primaryColor }}
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Saving Branding Changes...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save Brand Configuration for {currentTenant?.name.split(' ')[0] || 'Hospital'}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(`Reset branding for ${currentTenant?.name} back to RaphaMIS default template?`)) {
                                        resetMutation.mutate();
                                    }
                                }}
                                disabled={resetMutation.isPending}
                                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 transition cursor-pointer"
                            >
                                Reset to Platform Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
