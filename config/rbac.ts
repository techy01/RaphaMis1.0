import { UserRole } from "../packages/shared/types";

// Strict Role-Based Access Control (RBAC) definitions
// Enforces granular separation of duties, tenant isolation, and HIPAA/GDPR data privacy
export type Permissions = {
    [key in UserRole]?: {
        canView: string[];
        label: string;
        scopeDescription: string;
    }
};

export const rbac: Permissions = {
    // SaaS Platform Superadmin: Only sees platform governance, tenant management, SaaS subscription billing, platform analytics, and security settings.
    // Strictly barred from Protected Health Information (PHI), patient records, hospital clinical charts, and internal hospital staff payroll.
    [UserRole.Superadmin]: {
        label: 'SaaS Platform Superadmin',
        scopeDescription: 'SaaS Multi-Tenant Operations & System Governance (HIPAA PHI Isolated)',
        canView: [
            '/dashboard',
            '/tenants',
            '/subscriptions',
            '/analytics',
            '/settings',
            '/communication',
        ]
    },

    // Tenant / Hospital Medical Director & Executive Administrator:
    // Full operational jurisdiction within their specific hospital tenant.
    [UserRole.TenantAdmin]: {
        label: 'Hospital Medical Director & Admin',
        scopeDescription: 'Facility Operations, Clinical Departments, Staffing & Local Billing',
        canView: [
            '/dashboard',
            '/patients',
            '/billing',
            '/analytics',
            '/settings',
            '/telemedicine',
            '/pharmacy',
            '/laboratory',
            '/radiology',
            '/inventory',
            '/staff',
            '/patient-portal',
            '/communication'
        ]
    },

    // Physician / Consultant:
    // Focused on patient care, clinical notes, consultations, prescriptions, and diagnostic requests.
    [UserRole.Doctor]: {
        label: 'Consultant Physician / Medical Officer',
        scopeDescription: 'Clinical Patient Records, Consultations, Telemedicine & Diagnostics',
        canView: [
            '/dashboard',
            '/patients',
            '/telemedicine',
            '/pharmacy',
            '/laboratory',
            '/radiology',
            '/patient-portal',
            '/communication'
        ]
    },

    // Inpatient & Triage Nursing Sister:
    // Triage scoring, vitals monitoring, medication administration, and specimen handling.
    [UserRole.Nurse]: {
        label: 'Triage & Inpatient Ward Sister',
        scopeDescription: 'Triage Queue, Vitals Recording, Inpatient Nursing & Med Admin',
        canView: [
            '/dashboard',
            '/patients',
            '/telemedicine',
            '/pharmacy',
            '/laboratory',
            '/radiology',
            '/communication'
        ]
    },

    // Hospital Pharmacist:
    // Medication dispensing, formulary management, stock batches, and Rx auditing.
    [UserRole.Pharmacist]: {
        label: 'Lead Hospital Pharmacist',
        scopeDescription: 'Prescription Dispensing, Formulary & Pharmaceutical Inventory',
        canView: [
            '/dashboard',
            '/pharmacy',
            '/inventory',
            '/patients',
            '/communication'
        ]
    },

    // Hospital Cashier & Billing Officer:
    // Invoicing, insurance Public/Private Insurance claims, Mobile Payment receipts, and financial billing clearance.
    [UserRole.Billing]: {
        label: 'Hospital Cashier & Billing Officer',
        scopeDescription: 'Patient Invoicing, Claims Processing, Cashier Shifts & Revenue',
        canView: [
            '/dashboard',
            '/billing',
            '/analytics',
            '/patients',
            '/communication'
        ]
    },
};

/**
 * Validates whether a specific role has authorization to access a given URL path
 */
export const isRouteAllowedForRole = (role?: UserRole | string, path?: string): boolean => {
    if (!role || !path) return false;
    const cleanPath = path.split('?')[0]; // Strip query parameters
    const rolePermissions = rbac[role as UserRole];
    if (!rolePermissions) return false;
    return rolePermissions.canView.some(allowed => cleanPath === allowed || cleanPath.startsWith(`${allowed}/`));
};

/**
 * Returns the default home landing route for a specific user role
 */
export const getRoleDefaultRoute = (role?: UserRole | string): string => {
    switch (role) {
        case UserRole.Superadmin:
            return '/dashboard';
        case UserRole.TenantAdmin:
            return '/dashboard';
        case UserRole.Doctor:
            return '/dashboard';
        case UserRole.Nurse:
            return '/dashboard';
        case UserRole.Pharmacist:
            return '/pharmacy';
        case UserRole.Billing:
            return '/billing';
        default:
            return '/dashboard';
    }
};

