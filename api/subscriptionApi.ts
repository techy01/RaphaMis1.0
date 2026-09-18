import {
    TenantSubscription,
    SubscriptionPlan,
    SubscriptionAddon,
    SubscriptionTier,
    BillingCycle,
    SubscriptionStatus,
    ExecutiveDashboardData,
} from '../packages/shared/types';
import {
    SUBSCRIPTION_PLANS,
    SUBSCRIPTION_ADDONS,
    INITIAL_TENANT_SUBSCRIPTIONS,
    EXECUTIVE_DASHBOARD_DATA,
} from './mockSubscriptionData';

const SUBSCRIPTION_STORAGE_KEY = 'raphamis_tenant_subscriptions_v1';

export const getStoredSubscriptions = (): TenantSubscription[] => {
    try {
        const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch {
        // fallback
    }
    return [];
};

export const saveStoredSubscriptions = (data: TenantSubscription[]): void => {
    try {
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save subscriptions to storage', e);
    }
};

export const getSubscriptions = async (): Promise<TenantSubscription[]> => {
    // Artificial slight micro-delay for realistic snappy feeling
    await new Promise((resolve) => setTimeout(resolve, 60));
    return getStoredSubscriptions();
};

export const getSubscriptionById = async (id: string): Promise<TenantSubscription | undefined> => {
    const list = getStoredSubscriptions();
    return list.find((s) => s.id === id || s.tenantId === id);
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    return SUBSCRIPTION_PLANS;
};

export const getSubscriptionAddons = async (): Promise<SubscriptionAddon[]> => {
    return SUBSCRIPTION_ADDONS;
};

export const getExecutiveDashboardData = async (): Promise<ExecutiveDashboardData> => {
    const subscriptions = getStoredSubscriptions();
    const activeSubs = subscriptions.filter((s) => s.status === 'Active' || s.status === 'Renewing Soon');
    
    // Dynamically calculate MRR and ARR from actual stored subscriptions
    const calculatedMrr = activeSubs.reduce((acc, sub) => {
        const baseRate = sub.billingCycle === 'Annually' ? Math.round(sub.annualRate / 12) : sub.monthlyRate;
        const addonsCost = sub.activeAddons.reduce((aAcc, a) => a.enabled ? aAcc + a.monthlyPrice : aAcc, 0);
        return acc + baseRate + addonsCost;
    }, 0);

    const calculatedArr = calculatedMrr * 12;
    const totalBeds = subscriptions.reduce((acc, s) => acc + (s.licensedBeds || 0), 0);
    const totalSeats = subscriptions.reduce((acc, s) => acc + (s.providerSeats || 0), 0);

    return {
        ...EXECUTIVE_DASHBOARD_DATA,
        mrr: calculatedMrr || EXECUTIVE_DASHBOARD_DATA.mrr,
        arr: calculatedArr || EXECUTIVE_DASHBOARD_DATA.arr,
        activeInpatientBeds: Math.round(totalBeds * 0.84),
        totalMonitoredBeds: totalBeds || EXECUTIVE_DASHBOARD_DATA.totalMonitoredBeds,
        activeProviderSeats: totalSeats || EXECUTIVE_DASHBOARD_DATA.activeProviderSeats,
        totalHospitalTenants: subscriptions.length,
    };
};

export const upgradeOrChangePlan = async (
    subscriptionId: string,
    newTier: SubscriptionTier,
    billingCycle: BillingCycle
): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === newTier);
    if (!plan) throw new Error(`Plan tier ${newTier} not recognized`);

    const updated = list.map((sub) => {
        if (sub.id === subscriptionId || sub.tenantId === subscriptionId) {
            const monthlyRate = billingCycle === 'Annually' ? plan.annualPrice : plan.monthlyPrice;
            const annualRate = plan.annualPrice * 12;

            return {
                ...sub,
                tier: newTier,
                billingCycle,
                monthlyRate,
                annualRate,
                maxBeds: plan.maxBeds,
                maxProviderSeats: plan.maxProviderSeats,
                storageAllocatedGb: plan.includedStorageGb,
                status: 'Active' as SubscriptionStatus,
                notes: `Plan modified to ${newTier} (${billingCycle}) on ${new Date().toLocaleDateString()}`,
            };
        }
        return sub;
    });

    saveStoredSubscriptions(updated);
    const result = updated.find((s) => s.id === subscriptionId || s.tenantId === subscriptionId);
    if (!result) throw new Error('Subscription not found');
    return result;
};

export const toggleAddon = async (
    subscriptionId: string,
    addonId: string,
    enabled: boolean
): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();
    const addonDef = SUBSCRIPTION_ADDONS.find((a) => a.id === addonId);

    const updated = list.map((sub) => {
        if (sub.id === subscriptionId || sub.tenantId === subscriptionId) {
            const existingAddons = [...sub.activeAddons];
            const existingIndex = existingAddons.findIndex((a) => a.addonId === addonId);

            if (existingIndex >= 0) {
                existingAddons[existingIndex] = {
                    ...existingAddons[existingIndex],
                    enabled,
                };
            } else if (addonDef && enabled) {
                existingAddons.push({
                    addonId: addonDef.id,
                    name: addonDef.name,
                    monthlyPrice: addonDef.monthlyPrice,
                    enabled: true,
                });
            }

            return {
                ...sub,
                activeAddons: existingAddons,
            };
        }
        return sub;
    });

    saveStoredSubscriptions(updated);
    const result = updated.find((s) => s.id === subscriptionId || s.tenantId === subscriptionId);
    if (!result) throw new Error('Subscription not found');
    return result;
};

export const adjustCapacity = async (
    subscriptionId: string,
    licensedBeds: number,
    providerSeats: number
): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();

    const updated = list.map((sub) => {
        if (sub.id === subscriptionId || sub.tenantId === subscriptionId) {
            return {
                ...sub,
                licensedBeds,
                providerSeats,
            };
        }
        return sub;
    });

    saveStoredSubscriptions(updated);
    const result = updated.find((s) => s.id === subscriptionId || s.tenantId === subscriptionId);
    if (!result) throw new Error('Subscription not found');
    return result;
};

export const renewSubscription = async (subscriptionId: string): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();

    const updated = list.map((sub) => {
        if (sub.id === subscriptionId || sub.tenantId === subscriptionId) {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + (sub.billingCycle === 'Annually' ? 1 : 0));
            if (sub.billingCycle === 'Monthly') {
                nextYear.setMonth(nextYear.getMonth() + 1);
            }
            return {
                ...sub,
                status: 'Active' as SubscriptionStatus,
                currentPeriodEnd: nextYear.toISOString(),
                renewalDate: nextYear.toISOString(),
            };
        }
        return sub;
    });

    saveStoredSubscriptions(updated);
    const result = updated.find((s) => s.id === subscriptionId || s.tenantId === subscriptionId);
    if (!result) throw new Error('Subscription not found');
    return result;
};

export const createSubscription = async (
    payload: Partial<TenantSubscription>
): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === payload.tier) || SUBSCRIPTION_PLANS[1];

    const isAnnual = payload.billingCycle === 'Annually';
    const monthlyRate = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const annualRate = plan.annualPrice * 12;

    const newSub: TenantSubscription = {
        id: `sub_${Date.now()}`,
        tenantId: payload.tenantId || `tnt_${Date.now()}`,
        tenantName: payload.tenantName || 'New Regional Medical Center',
        tier: payload.tier || 'Community Hospital',
        billingCycle: payload.billingCycle || 'Annually',
        status: 'Active',
        monthlyRate,
        annualRate,
        licensedBeds: payload.licensedBeds || plan.maxBeds,
        maxBeds: plan.maxBeds,
        providerSeats: payload.providerSeats || plan.maxProviderSeats,
        maxProviderSeats: plan.maxProviderSeats,
        storageAllocatedGb: plan.includedStorageGb,
        storageUsedGb: 0,
        startDate: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        renewalDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: payload.paymentMethod || {
            type: 'ach',
            institutionName: 'Corporate ACH Direct Debit',
            last4: '1099',
        },
        activeAddons: payload.activeAddons || [],
        contactPerson: payload.contactPerson || 'Hospital Administrator',
        contactEmail: payload.contactEmail || 'admin@hospital.org',
        region: payload.region || 'US-East (N. Virginia)',
        baaSigned: true,
        fhirEnabled: payload.tier === 'Enterprise Health System' || payload.tier === 'Sovereign Cloud',
        dicomArchiveTier: plan.tier === 'Starter Clinic' ? 'Basic 500GB' : 'Enterprise Active PACS',
        notes: payload.notes || 'Provisioned through Super Admin Command Center.',
    };

    const updated = [newSub, ...list];
    saveStoredSubscriptions(updated);
    return newSub;
};

export const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: SubscriptionStatus
): Promise<TenantSubscription> => {
    const list = getStoredSubscriptions();

    const updated = list.map((sub) => {
        if (sub.id === subscriptionId || sub.tenantId === subscriptionId) {
            return {
                ...sub,
                status,
            };
        }
        return sub;
    });

    saveStoredSubscriptions(updated);
    const result = updated.find((s) => s.id === subscriptionId || s.tenantId === subscriptionId);
    if (!result) throw new Error('Subscription not found');
    return result;
};
