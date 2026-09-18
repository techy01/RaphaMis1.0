import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldX, ArrowLeft, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { rbac, getRoleDefaultRoute } from '../../config/rbac';
import { UserRole } from '../../packages/shared/types';

interface AccessRestrictedViewProps {
    requiredRoleDesc?: string;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({ requiredRoleDesc }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = (user?.role as UserRole) || UserRole.Superadmin;
    const roleConfig = rbac[userRole];
    const defaultRoute = getRoleDefaultRoute(userRole);

    const isSuperAdmin = userRole === UserRole.Superadmin;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 max-w-2xl mx-auto">
            <div className="w-full bg-white rounded-2xl border-2 border-red-200 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-red-500 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-xl">
                            <ShieldX className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight">
                                Access Restricted: Role-Based Isolation Boundary
                            </h1>
                            <p className="text-xs text-red-100">
                                GDPR & HIPAA PHI Protection
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-red-600/80 rounded-full font-bold uppercase tracking-wider">
                        403 Forbidden
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-5 text-slate-700">
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-slate-900">
                            {isSuperAdmin 
                                ? 'Clinical Data Isolation Barrier Active' 
                                : 'Permission Insufficient for Current Account'
                            }
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {isSuperAdmin ? (
                                <>
                                    You are authenticated as <strong>{user?.name}</strong> (<span className="text-purple-700 font-semibold">{roleConfig?.label || 'Platform Superadmin'}</span>). 
                                    By regulatory design under the GDPR and HIPAA, SaaS Platform Superadmins are 
                                    strictly isolated from Protected Health Information (PHI), patient charts, radiology images, pharmacy records, and hospital payroll.
                                </>
                            ) : (
                                <>
                                    Your account role (<span className="text-teal-700 font-semibold">{roleConfig?.label || user?.role}</span>) does not possess clinical or administrative clearance to access the path <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-700 font-mono text-[11px]">{location.pathname}</code>.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Role & Scope Context Card */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-200">
                            <span>Your Active Role:</span>
                            <span className="font-bold text-slate-800">{roleConfig?.label || user?.role}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-600">Authorized Module Scope:</span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                {roleConfig?.scopeDescription || 'Authorized internal operational modules.'}
                            </p>
                        </div>
                    </div>

                    {/* Clinical Compliance Note */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="font-semibold text-amber-900 text-[11px]">Audit & Security Logging Notice</p>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                Unauthorized access attempts across tenant or privilege boundaries are cryptographically stamped into the system's tamper-evident audit ledger.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(defaultRoute)}
                            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Authorized Dashboard</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <UserCheck className="w-4 h-4 text-slate-500" />
                            <span>Switch Account / Sign In as Different Role</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
