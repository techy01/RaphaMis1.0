import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { CurrencySelector } from '../currency/CurrencySelector';
import { NotificationBellDropdown } from '../notifications/NotificationBellDropdown';
import { SyncStatusBadge } from '../offline/SyncStatusBadge';
import { ExternalLink, Globe } from 'lucide-react';
import { getActiveTenantBranding, ACTIVE_TENANT_BRANDING_KEY } from '../../api/tenantsApi';
import { TenantBranding } from '../../packages/shared/types';

export const Header: React.FC = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const { toggleSidebar } = useLayout();
    const [activeBranding, setActiveBranding] = useState<TenantBranding>(() => getActiveTenantBranding());
    const [hospitalTitle, setHospitalTitle] = useState<string>('St. Jude General & Academic Medical Center');

    useEffect(() => {
        const updateFromStorage = () => {
            try {
                const stored = localStorage.getItem(ACTIVE_TENANT_BRANDING_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setActiveBranding(parsed);
                    if (parsed.tenantName) {
                        setHospitalTitle(parsed.tenantName);
                    }
                } else {
                    setActiveBranding(getActiveTenantBranding());
                }
            } catch {
                // ignore
            }
        };

        updateFromStorage();
        window.addEventListener('raphamis_brand_updated', updateFromStorage);
        window.addEventListener('raphamis_tenants_updated', updateFromStorage);
        window.addEventListener('storage', updateFromStorage);

        return () => {
            window.removeEventListener('raphamis_brand_updated', updateFromStorage);
            window.removeEventListener('raphamis_tenants_updated', updateFromStorage);
            window.removeEventListener('storage', updateFromStorage);
        };
    }, []);

    return (
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shadow-xs">
            <div className="flex items-center gap-3">
                <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="hidden sm:flex items-center gap-2.5 text-xs text-gray-500 font-medium">
                    {activeBranding?.logoUrl ? (
                        <img
                            src={activeBranding.logoUrl}
                            alt="Hospital Logo"
                            className="w-5 h-5 object-contain rounded-md shrink-0 border border-gray-200"
                        />
                    ) : (
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                            style={{ backgroundColor: activeBranding?.primaryColor || '#0d9488' }}
                        />
                    )}
                    <span className="font-semibold text-slate-700">RaphaMIS</span>
                    <span className="text-gray-300">•</span>
                    <span
                        className="font-bold truncate max-w-[240px] md:max-w-md transition-colors"
                        style={{ color: activeBranding?.primaryColor || '#0f766e' }}
                        title={hospitalTitle}
                    >
                        {hospitalTitle}
                    </span>
                    {activeBranding?.facilityCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {activeBranding.facilityCode}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Offline-First Intermittent Connectivity & Sync Status */}
                <SyncStatusBadge />

                {/* Cross-Department Notification System & Clinical Handoff Comms */}
                <NotificationBellDropdown />

                {/* Link to Public Landing Page */}
                <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                    title="View public landing page"
                >
                    <Globe className="w-3.5 h-3.5 text-teal-600" />
                    <span>Public Portal</span>
                    <ExternalLink className="w-3 h-3 text-teal-500" />
                </Link>

                {/* Global Multi-Currency Standard Selector */}
                <CurrencySelector />

                <div className="h-5 w-px bg-gray-200"></div>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        className="relative z-10 flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
                    >
                        <div className="h-8 w-8 overflow-hidden rounded-full shadow-sm border border-gray-200">
                            <img className="object-cover w-full h-full" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=0D9488&color=fff`} alt="Your avatar" />
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10 w-full h-full"></div>
                    )}

                    {isDropdownOpen && (
                        <div className="absolute right-0 z-20 w-52 py-2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100">
                            <div className="block px-4 py-2 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link
                                to="/"
                                className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Open Public Landing Page
                            </Link>
                            <Link
                                to="/policies"
                                className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Legal Policies & BAA
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={() => logout()} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
