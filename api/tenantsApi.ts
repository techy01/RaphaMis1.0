import apiClient from './apiClient';
import { Tenant, TenantStatus, TenantBranding } from '../packages/shared/types';

export const MOCK_TENANTS_STORAGE_KEY = 'raphamis_mock_tenants';
export const ACTIVE_TENANT_BRANDING_KEY = 'raphamis_active_tenant_branding';

export const DEFAULT_TENANT_BRANDING: TenantBranding = {
    primaryColor: '#0d9488', // Teal 600
    accentColor: '#0284c7',  // Sky 600
    secondaryColor: '#0f172a',
    hospitalMotto: 'Compassionate Healing, Advanced Clinical Medicine',
    headerBgStyle: 'white',
    facilityCode: 'STJ-ACAD-01',
    supportEmail: 'care@stjude-hospital.org',
    supportPhone: '+254 700 112 233',
    portalBannerText: 'Welcome to the Hospital Patient Portal. 24/7 Virtual Emergency Triage is active.',
    letterheadFooter: 'Certified Tertiary Referral Facility • MOH License #HL-0891-2026 • ISO 15189'
};

// Curated SVG Preset Logos encoded as lightweight SVG Data URLs
export const PRESET_MEDICAL_LOGOS = [
    {
        id: 'cross_shield',
        name: 'Clinical Cross Shield',
        category: 'Hospital General',
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230d9488"/><path d="M50 15L80 28V52C80 70 50 85 50 85C50 85 20 70 20 52V28L50 15Z" fill="white" opacity="0.95"/><path d="M43 38H57V46H65V56H57V64H43V56H35V46H43V38Z" fill="%230d9488"/></svg>`
    },
    {
        id: 'caduceus_crest',
        name: 'Academic Caduceus',
        category: 'University & Research',
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%231e40af"/><circle cx="50" cy="50" r="38" stroke="white" stroke-width="3" stroke-dasharray="4 2"/><path d="M50 20V80" stroke="white" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="20" r="5" fill="%23facc15"/><path d="M30 38C40 32 60 32 70 38C65 50 35 50 30 62C38 70 62 70 70 62" stroke="%23facc15" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`
    },
    {
        id: 'pediatric_heart',
        name: 'Pediatric Heart & Sun',
        category: 'Maternity & Children',
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23059669"/><path d="M50 78C50 78 24 62 24 42C24 32 32 25 41 25C46 25 50 29 50 29C50 29 54 25 59 25C68 25 76 32 76 42C76 62 50 78 50 78Z" fill="white"/><circle cx="50" cy="46" r="12" fill="%23f59e0b"/><path d="M50 38V34M50 58V54M38 46H34M58 46H62M42 40L39 37M58 52L61 55M42 52L39 55M58 40L61 37" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    {
        id: 'ecg_pulse',
        name: 'Cardiac Vital Pulse',
        category: 'Cardiology & Emergency',
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23b91c1c"/><circle cx="50" cy="50" r="36" stroke="white" stroke-width="3"/><path d="M22 50H36L42 32L49 68L56 42L61 55L65 50H78" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    {
        id: 'ortho_spine',
        name: 'Orthopedic Biomech',
        category: 'Surgical & Orthopedics',
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%237c3aed"/><circle cx="50" cy="24" r="8" fill="white"/><rect x="42" y="36" width="16" height="8" rx="4" fill="white"/><rect x="38" y="48" width="24" height="8" rx="4" fill="white"/><rect x="42" y="60" width="16" height="8" rx="4" fill="white"/><circle cx="50" cy="76" r="6" fill="%23c084fc"/></svg>`
    }
];

export const INITIAL_DEFAULT_TENANTS: Tenant[] = [
    {
        id: 'tnt_001',
        name: 'St. Jude General Hospital & Academic Medical Center',
        email: 'admin@stjude-hospital.org',
        phone: '+254 712 345 678',
        address: 'Hospital Hill Road, P.O. Box 40100, Nairobi, Kenya',
        status: TenantStatus.Active,
        subscriptionPlan: 'Enterprise Tier',
        activationStatus: 'Active',
        paymentStatus: 'Paid',
        institutionType: 'Tertiary Academic Referral Center',
        branding: {
            logoUrl: PRESET_MEDICAL_LOGOS[0].dataUrl,
            primaryColor: '#0d9488',
            accentColor: '#0284c7',
            secondaryColor: '#0f172a',
            hospitalMotto: 'Compassionate Healing, Advanced Clinical Medicine',
            facilityCode: 'STJ-ACAD-01',
            headerBgStyle: 'white',
            supportEmail: 'care@stjude-hospital.org',
            supportPhone: '+254 700 112 233',
            portalBannerText: 'Welcome to the St. Jude Patient Portal. 24/7 Virtual Emergency Triage is active.',
            letterheadFooter: 'Certified Tertiary Referral Facility • MOH License #HL-0891-2026 • ISO 15189'
        },
        createdAt: '2024-01-15T08:00:00.000Z',
        updatedAt: '2026-09-12T10:00:00.000Z'
    },
    {
        id: 'tnt_002',
        name: "Mercy Children's Clinic",
        email: 'care@mercychildren.ke',
        phone: '+254 722 987 654',
        address: 'Kenyatta Avenue, Nairobi, Kenya',
        status: TenantStatus.Active,
        subscriptionPlan: 'Professional Tier',
        activationStatus: 'Active',
        paymentStatus: 'Paid',
        institutionType: 'Pediatric Specialty Center',
        branding: {
            logoUrl: PRESET_MEDICAL_LOGOS[2].dataUrl,
            primaryColor: '#059669',
            accentColor: '#10b981',
            secondaryColor: '#064e3b',
            hospitalMotto: 'Gentle Care for Growing Lives',
            facilityCode: 'MCC-PED-02',
            headerBgStyle: 'tint',
            supportEmail: 'help@mercychildren.ke',
            supportPhone: '+254 722 987 654',
            portalBannerText: 'Pediatric tele-triage available daily from 7:00 AM to 9:00 PM.',
            letterheadFooter: 'Specialized Children & Adolescent Clinic • Kenya Pediatric Society Accredited'
        },
        createdAt: '2024-03-10T09:30:00.000Z',
        updatedAt: '2026-09-10T14:20:00.000Z'
    },
    {
        id: 'tnt_003',
        name: 'Northwest Community Medical',
        email: 'info@northwestmed.org',
        phone: '+254 733 456 789',
        address: 'Main Street, Eldoret, Kenya',
        status: TenantStatus.Trial,
        subscriptionPlan: 'Standard Tier',
        activationStatus: 'Pending Activation',
        paymentStatus: 'Pending',
        institutionType: 'Community Sub-County Hospital',
        branding: {
            logoUrl: PRESET_MEDICAL_LOGOS[1].dataUrl,
            primaryColor: '#1e40af',
            accentColor: '#3b82f6',
            secondaryColor: '#172554',
            hospitalMotto: 'Trusted Quality Care for Every Family',
            facilityCode: 'NCM-COMM-03',
            headerBgStyle: 'white',
            supportEmail: 'support@northwestmed.org',
            supportPhone: '+254 733 456 789',
            portalBannerText: 'Outpatient clinic walk-ins open Mon-Sat. Book specialist clinics online.',
            letterheadFooter: 'Community Healthcare Level 4 Facility • NHIF / SHA Contracted Provider'
        },
        createdAt: '2024-06-01T11:15:00.000Z',
        updatedAt: '2026-08-25T16:40:00.000Z'
    },
    {
        id: 'tnt_004',
        name: 'Apex Orthopedic Institute',
        email: 'ortho@apexhealth.ke',
        phone: '+254 744 567 890',
        address: 'Parklands Avenue, Nairobi, Kenya',
        status: TenantStatus.Suspended,
        subscriptionPlan: 'Enterprise Tier',
        activationStatus: 'Active',
        paymentStatus: 'Paid',
        institutionType: 'Surgical & Sports Medicine Specialty',
        branding: {
            logoUrl: PRESET_MEDICAL_LOGOS[4].dataUrl,
            primaryColor: '#7c3aed',
            accentColor: '#a855f7',
            secondaryColor: '#2e1065',
            hospitalMotto: 'Restoring Mobility, Strength & Quality of Life',
            facilityCode: 'AOI-SPEC-04',
            headerBgStyle: 'dark',
            supportEmail: 'reception@apexhealth.ke',
            supportPhone: '+254 744 567 890',
            portalBannerText: 'Pre-operative physical therapy consults available via Telemedicine.',
            letterheadFooter: 'Regional Center of Excellence in Joint Replacement & Arthroscopy'
        },
        createdAt: '2024-02-20T13:00:00.000Z',
        updatedAt: '2026-09-01T09:10:00.000Z'
    }
];

// Helper to safely fetch local storage tenants
export const getStoredTenants = (): Tenant[] => {
    try {
        const raw = localStorage.getItem(MOCK_TENANTS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('[tenantsApi] Failed to parse local storage tenants:', e);
    }
    // Initialize default seed
    try {
        localStorage.setItem(MOCK_TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_TENANTS));
    } catch {
        // ignore
    }
    return INITIAL_DEFAULT_TENANTS;
};

export const saveStoredTenants = (tenants: Tenant[]): void => {
    try {
        localStorage.setItem(MOCK_TENANTS_STORAGE_KEY, JSON.stringify(tenants));
        window.dispatchEvent(new CustomEvent('raphamis_tenants_updated', { detail: tenants }));
    } catch (e) {
        console.error('[tenantsApi] Failed to persist tenants to localStorage:', e);
    }
};

export const getTenants = async (): Promise<Tenant[]> => {
    try {
        const response = await apiClient.get('/tenants');
        if (Array.isArray(response.data) && response.data.length > 0) {
            // Save to local storage for offline continuity
            saveStoredTenants(response.data);
            return response.data;
        }
    } catch (e) {
        // Fall back gracefully to resilient local mock store
    }
    return getStoredTenants();
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
    const list = await getTenants();
    return list.find((t) => t.id === id) || null;
};

export const createTenant = async (tenantData: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tenant> => {
    try {
        const response = await apiClient.post('/tenants', tenantData);
        if (response.data) {
            const current = getStoredTenants();
            saveStoredTenants([response.data, ...current]);
            return response.data;
        }
    } catch (e) {
        // Fall back to local creation
    }

    const newTenant: Tenant = {
        id: `tnt_${Date.now()}`,
        name: tenantData.name || 'New Hospital Tenant',
        email: tenantData.email || 'hospital@raphamis.health',
        phone: tenantData.phone || '+254 700 000 000',
        address: tenantData.address || 'Nairobi, Kenya',
        status: tenantData.status || TenantStatus.Active,
        subscriptionPlan: tenantData.subscriptionPlan || 'Community Hospital',
        branding: {
            ...DEFAULT_TENANT_BRANDING,
            ...(tenantData.branding || {})
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...tenantData,
    };

    const current = getStoredTenants();
    saveStoredTenants([newTenant, ...current]);
    return newTenant;
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<Tenant> => {
    try {
        await apiClient.put(`/tenants/${id}`, tenantData);
    } catch (e) {
        // Fall back to local updating
    }

    const current = getStoredTenants();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) {
        throw new Error(`Tenant with ID ${id} not found.`);
    }

    const updated: Tenant = {
        ...current[index],
        ...tenantData,
        updatedAt: new Date().toISOString(),
    };

    current[index] = updated;
    saveStoredTenants(current);

    // If updating active tenant, update the active tenant branding key
    try {
        const activeBrandingRaw = localStorage.getItem(ACTIVE_TENANT_BRANDING_KEY);
        if (activeBrandingRaw) {
            const active = JSON.parse(activeBrandingRaw);
            if (active.tenantId === id && updated.branding) {
                localStorage.setItem(ACTIVE_TENANT_BRANDING_KEY, JSON.stringify({
                    tenantId: id,
                    tenantName: updated.name,
                    ...updated.branding
                }));
                window.dispatchEvent(new CustomEvent('raphamis_brand_updated', { detail: updated.branding }));
            }
        }
    } catch {
        // ignore
    }

    return updated;
};

export const updateTenantBranding = async (tenantId: string, branding: Partial<TenantBranding>): Promise<Tenant> => {
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId} does not exist.`);
    }

    const mergedBranding: TenantBranding = {
        ...(tenant.branding || DEFAULT_TENANT_BRANDING),
        ...branding,
        lastUpdated: new Date().toISOString(),
    };

    const updated = await updateTenant(tenantId, {
        branding: mergedBranding
    });

    // Save as current active branding if default or matching
    try {
        localStorage.setItem(ACTIVE_TENANT_BRANDING_KEY, JSON.stringify({
            tenantId,
            tenantName: updated.name,
            ...mergedBranding
        }));
        window.dispatchEvent(new CustomEvent('raphamis_brand_updated', { detail: mergedBranding }));
    } catch {
        // ignore
    }

    return updated;
};

export const resetTenantBranding = async (tenantId: string): Promise<Tenant> => {
    return updateTenantBranding(tenantId, { ...DEFAULT_TENANT_BRANDING });
};

export const getActiveTenantBranding = (tenantId?: string): TenantBranding => {
    try {
        const stored = localStorage.getItem(ACTIVE_TENANT_BRANDING_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (!tenantId || parsed.tenantId === tenantId) {
                return parsed;
            }
        }
    } catch {
        // fallback
    }

    const tenants = getStoredTenants();
    const target = tenantId ? tenants.find(t => t.id === tenantId) : tenants[0];
    return target?.branding || DEFAULT_TENANT_BRANDING;
};

