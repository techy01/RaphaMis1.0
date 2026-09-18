import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingView } from './components/views/LandingView';
import { LegalPoliciesView } from './components/views/LegalPoliciesView';
import { LoginView } from './components/views/LoginView';
import { ForgotPasswordView } from './components/views/ForgotPasswordView';
import { DashboardView } from './components/views/DashboardView';
import { TenantsView } from './components/views/TenantsView';
import { PatientsView } from './components/views/PatientsView';
import { BillingView } from './components/views/BillingView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { TelemedicineView } from './components/views/TelemedicineView';
import { PharmacyView } from './components/views/PharmacyView';
import { LaboratoryView } from './components/views/LaboratoryView';
import { RadiologyView } from './components/views/RadiologyView';
import { InventoryView } from './components/views/InventoryView';
import { StaffView } from './components/views/StaffView';
import { PatientPortalView } from './components/views/PatientPortalView';
import { SubscriptionsView } from './components/views/SubscriptionsView';
import { SubscriptionCheckoutView } from './components/views/SubscriptionCheckoutView';
import { CommunicationView } from './components/views/CommunicationView';
import { useAuth } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { isRouteAllowedForRole } from './config/rbac';
import { AccessRestrictedView } from './components/security/AccessRestrictedView';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return (
        <LayoutProvider>
            <MainLayout />
        </LayoutProvider>
    );
};

const RoleGuardedRoute: React.FC<{ path: string; element: React.ReactElement }> = ({ path, element }) => {
    const { user } = useAuth();
    if (!isRouteAllowedForRole(user?.role, path)) {
        return <AccessRestrictedView />;
    }
    return element;
};

const App: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Customer-Facing Landing Page & Legal Policies */}
            <Route path="/" element={<LandingView />} />
            <Route path="/landing" element={<LandingView />} />
            <Route path="/subscribe" element={<SubscriptionCheckoutView />} />
            <Route path="/checkout" element={<SubscriptionCheckoutView />} />
            <Route path="/policies" element={<LegalPoliciesView />} />
            <Route path="/terms" element={<LegalPoliciesView initialTab="terms" />} />
            <Route path="/privacy" element={<LegalPoliciesView initialTab="privacy" />} />
            <Route path="/cookies" element={<LegalPoliciesView initialTab="cookies" />} />
            <Route path="/disclaimer" element={<LegalPoliciesView initialTab="disclaimer" />} />
            <Route path="/baa" element={<LegalPoliciesView initialTab="baa" />} />

            {/* Authentication & Security */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/reset-password" element={<ForgotPasswordView />} />
            
            {/* Super Admin & Clinical Management Console */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<RoleGuardedRoute path="/dashboard" element={<DashboardView />} />} />
                <Route path="/subscriptions" element={<RoleGuardedRoute path="/subscriptions" element={<SubscriptionsView />} />} />
                <Route path="/tenants" element={<RoleGuardedRoute path="/tenants" element={<TenantsView />} />} />
                <Route path="/patients" element={<RoleGuardedRoute path="/patients" element={<PatientsView />} />} />
                <Route path="/communication" element={<RoleGuardedRoute path="/communication" element={<CommunicationView />} />} />
                <Route path="/billing" element={<RoleGuardedRoute path="/billing" element={<BillingView />} />} />
                <Route path="/analytics" element={<RoleGuardedRoute path="/analytics" element={<AnalyticsView />} />} />
                <Route path="/settings" element={<RoleGuardedRoute path="/settings" element={<SettingsView />} />} />
                <Route path="/telemedicine" element={<RoleGuardedRoute path="/telemedicine" element={<TelemedicineView />} />} />
                <Route path="/pharmacy" element={<RoleGuardedRoute path="/pharmacy" element={<PharmacyView />} />} />
                <Route path="/laboratory" element={<RoleGuardedRoute path="/laboratory" element={<LaboratoryView />} />} />
                <Route path="/radiology" element={<RoleGuardedRoute path="/radiology" element={<RadiologyView />} />} />
                <Route path="/inventory" element={<RoleGuardedRoute path="/inventory" element={<InventoryView />} />} />
                <Route path="/staff" element={<RoleGuardedRoute path="/staff" element={<StaffView />} />} />
                <Route path="/patient-portal" element={<RoleGuardedRoute path="/patient-portal" element={<PatientPortalView />} />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;