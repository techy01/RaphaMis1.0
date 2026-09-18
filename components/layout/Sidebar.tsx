import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { rbac } from '../../config/rbac';
import { UserRole } from '../../packages/shared/types';
import { useEffect } from 'react';

// Icons for sidebar items
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const TenantsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PatientsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BillingIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h.01M4 12h1.72c.56 0 1.054.224 1.414.586l1.292 1.292a1 1 0 001.414 0l1.292-1.292A2 2 0 0114.28 12H20M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6m-16 0h16" /></svg>;
const AnalyticsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const SettingsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TelemedicineIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const PharmacyIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v4.517a2 2 0 01-1 1.732l-2 1.155a2 2 0 01-2 0l-2-1.155a2 2 0 01-1-1.732V5L8 4z" /></svg>;
const LabIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v4.517a2 2 0 01-1 1.732l-2 1.155a2 2 0 01-2 0l-2-1.155a2 2 0 01-1-1.732V5L8 4z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const RadiologyIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const InventoryIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const StaffIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PatientPortalIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const SubscriptionsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const CommunicationIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

interface NavItem {
    path: string;
    name: string;
    icon: JSX.Element;
}

const navItems: NavItem[] = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/subscriptions', name: 'Subscriptions', icon: <SubscriptionsIcon /> },
    { path: '/tenants', name: 'Tenants', icon: <TenantsIcon /> },
    { path: '/patients', name: 'Patients', icon: <PatientsIcon /> },
    { path: '/communication', name: 'Communications', icon: <CommunicationIcon /> },
    { path: '/billing', name: 'Billing', icon: <BillingIcon /> },
    { path: '/analytics', name: 'Analytics', icon: <AnalyticsIcon /> },
    { path: '/telemedicine', name: 'Telemedicine', icon: <TelemedicineIcon /> },
    { path: '/pharmacy', name: 'Pharmacy', icon: <PharmacyIcon /> },
    { path: '/laboratory', name: 'Laboratory', icon: <LabIcon /> },
    { path: '/radiology', name: 'Radiology', icon: <RadiologyIcon /> },
    { path: '/inventory', name: 'Inventory', icon: <InventoryIcon /> },
    { path: '/staff', name: 'Staff', icon: <StaffIcon /> },
    { path: '/patient-portal', name: 'Patient Portal', icon: <PatientPortalIcon /> },
];

const settingsItem: NavItem = { path: '/settings', name: 'Settings', icon: <SettingsIcon /> };


export const Sidebar: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useLayout();
    const { user, logout } = useAuth();
    const location = useLocation();
    
    // Close sidebar on navigation on smaller screens
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location, setIsSidebarOpen]);

    const userRole = (user?.role as UserRole) || UserRole.Superadmin;
    const roleConfig = rbac[userRole];
    const allowedRoutes = roleConfig?.canView || [];

    const activeClass = "flex items-center px-3.5 py-2 text-white bg-teal-600 font-medium rounded-xl shadow-xs transition-colors";
    const inactiveClass = "flex items-center px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl transition-colors";

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-20 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex flex-col h-full p-4">
                    {/* Brand Header */}
                    <div className="px-2 py-1 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">RaphaMIS</h1>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Healthcare ERP & Clinical EHR</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-md">
                            v2.4
                        </span>
                    </div>

                    {/* Active User & Strict Role Badge */}
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Role</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                userRole === UserRole.Superadmin
                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                    : userRole === UserRole.TenantAdmin
                                    ? 'bg-teal-100 text-teal-800 border-teal-200'
                                    : userRole === UserRole.Doctor
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : userRole === UserRole.Nurse
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : userRole === UserRole.Pharmacist
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                                {roleConfig?.label || userRole}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate" title={user?.name || ''}>
                            {user?.name || 'Authorized User'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate" title={user?.email || ''}>
                            {user?.email || ''}
                        </p>
                    </div>
                    
                    <nav className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
                        <div>
                            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Modules</p>
                            <div className="mt-1.5 space-y-0.5">
                                {navItems.filter(item => allowedRoutes.includes(item.path)).map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => isActive ? activeClass : inactiveClass}
                                    >
                                        <div className="shrink-0">{item.icon}</div>
                                        <span className="mx-3 text-xs">{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {allowedRoutes.includes(settingsItem.path) && (
                            <div>
                                <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Governance</p>
                                <div className="mt-1.5 space-y-0.5">
                                    <NavLink
                                        to={settingsItem.path}
                                        className={({ isActive }) => isActive ? activeClass : inactiveClass}
                                    >
                                        <div className="shrink-0">{settingsItem.icon}</div>
                                        <span className="mx-3 text-xs">{settingsItem.name}</span>
                                    </NavLink>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portals & Policy</p>
                            <div className="mt-1.5 space-y-0.5">
                                <a
                                    href="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl text-xs transition-colors"
                                >
                                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="mx-3">Public Landing</span>
                                </a>
                                <NavLink
                                    to="/policies"
                                    className={({ isActive }) => isActive ? activeClass : inactiveClass}
                                >
                                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="mx-3 text-xs">Legal Policies & BAA</span>
                                </NavLink>
                            </div>
                        </div>
                    </nav>

                    {/* Bottom Security & Logout Footer */}
                    <div className="pt-3 mt-auto border-t border-slate-200 space-y-2">
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                        <div className="text-center text-[10px] text-slate-400">
                            <p className="font-semibold text-slate-500">Saaslink Cloud Infrastructure</p>
                            <p>HIPAA & GDPR Compliant</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
