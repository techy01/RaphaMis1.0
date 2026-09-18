import {
    SubscriptionCheckoutPayload,
    SubscriptionReceipt,
    WireTransferInvoice,
    Tenant,
    TenantStatus,
    TenantSubscription,
    Invoice,
    InvoiceStatus,
    SubscriptionTier,
} from '../packages/shared/types';
import { getWireTransferSettings } from './wireTransferApi';
import { getStoredSubscriptions, saveStoredSubscriptions, SUBSCRIPTION_PLANS } from './mockSubscriptionData';

const MOCK_TENANTS_STORAGE_KEY = 'raphamis_mock_tenants';
const DISPATCHED_EMAILS_STORAGE_KEY = 'raphamis_dispatched_emails_v1';

export interface DispatchedEmailLog {
    id: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    type: 'receipt_instant' | 'activation_credentials' | 'wire_invoice_submitted';
    sentAt: string;
    details: {
        tenantName: string;
        planTier: string;
        amount: number;
        currency: string;
        paymentMethod: string;
        transactionReference: string;
        temporaryPassword?: string;
        loginUrl?: string;
    };
}

// Helpers for tenant storage
const getStoredTenants = (): Tenant[] => {
    try {
        const raw = localStorage.getItem(MOCK_TENANTS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // fallback
    }
    return [];
};

const saveStoredTenants = (tenants: Tenant[]) => {
    try {
        localStorage.setItem(MOCK_TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch {
        // fallback
    }
};

export const getDispatchedEmails = (): DispatchedEmailLog[] => {
    try {
        const raw = localStorage.getItem(DISPATCHED_EMAILS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // fallback
    }
    return [];
};

const recordDispatchedEmail = (emailLog: Omit<DispatchedEmailLog, 'id' | 'sentAt'>) => {
    const list = getDispatchedEmails();
    const newEntry: DispatchedEmailLog = {
        ...emailLog,
        id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        sentAt: new Date().toISOString(),
    };
    try {
        localStorage.setItem(DISPATCHED_EMAILS_STORAGE_KEY, JSON.stringify([newEntry, ...list]));
    } catch (e) {
        console.error('Failed to log email dispatch:', e);
    }
    return newEntry;
};

// Calculate pricing in KES and USD
export const getPlanPricing = (tier: SubscriptionTier, billingCycle: 'Monthly' | 'Annually') => {
    let usdMonthly = 1000;
    let kesMonthly = 25000;

    if (tier === 'Starter Clinic') {
        usdMonthly = billingCycle === 'Annually' ? 179 : 199;
        kesMonthly = billingCycle === 'Annually' ? 22000 : 25000;
    } else if (tier === 'Community Hospital') {
        usdMonthly = billingCycle === 'Annually' ? 449 : 499;
        kesMonthly = billingCycle === 'Annually' ? 58000 : 65000;
    } else {
        usdMonthly = billingCycle === 'Annually' ? 999 : 1199;
        kesMonthly = billingCycle === 'Annually' ? 130000 : 150000;
    }

    const totalUsd = billingCycle === 'Annually' ? usdMonthly * 12 : usdMonthly;
    const totalKes = billingCycle === 'Annually' ? kesMonthly * 12 : kesMonthly;

    return {
        usdMonthly,
        kesMonthly,
        totalUsd,
        totalKes,
    };
};

// End-to-end checkout processing
export const processSubscriptionCheckout = async (
    payload: SubscriptionCheckoutPayload
): Promise<{
    success: boolean;
    method: 'mobile_money' | 'card' | 'wire';
    receipt?: SubscriptionReceipt;
    wireInvoice?: WireTransferInvoice;
    statusMessage: string;
    tenant: Tenant;
    subscription: TenantSubscription;
    initialCredentials?: {
        loginEmail: string;
        temporaryPassword?: string;
        loginUrl: string;
    };
}> => {
    const isMpesaOrCard = payload.paymentMethod === 'mobile_money' || payload.paymentMethod === 'card';
    const isWire = payload.paymentMethod === 'wire';

    const pricing = getPlanPricing(payload.tier, payload.billingCycle);
    const amount = payload.paymentMethod === 'mobile_money' ? pricing.totalKes : pricing.totalUsd;
    const currency = payload.paymentMethod === 'mobile_money' ? 'KES' : 'USD';

    const tenantId = `tnt_${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const referenceNumber = payload.paymentMethod === 'mobile_money'
        ? `MP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        : payload.paymentMethod === 'card'
        ? `STRIPE_CH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        : `WIRE-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialPassword = `Welcome#${Math.floor(1000 + Math.random() * 9000)}!Pass`;

    // 1. Create or prepare the Tenant
    const newTenant: Tenant = {
        id: tenantId,
        name: payload.tenantName,
        email: payload.contactEmail,
        phone: payload.contactPhone,
        address: payload.address,
        status: isMpesaOrCard ? TenantStatus.Active : TenantStatus.Trial,
        subscriptionPlan: payload.tier,
        paymentStatus: isMpesaOrCard ? 'Paid' : 'Pending',
        activationStatus: isMpesaOrCard ? 'Active' : 'Pending Activation',
        paymentMethodType: payload.paymentMethod,
        paymentReference: referenceNumber,
        wireTransferInvoiceNumber: isWire ? invoiceNumber : undefined,
        initialCredentialsSent: isMpesaOrCard,
        temporaryPassword: isMpesaOrCard ? initialPassword : undefined,
        institutionType: payload.institutionType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Save tenant to storage
    const currentTenants = getStoredTenants();
    saveStoredTenants([newTenant, ...currentTenants]);

    // 2. Create the Subscription record
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === payload.tier) || SUBSCRIPTION_PLANS[0];
    const newSubscription: TenantSubscription = {
        id: `sub_${Date.now()}`,
        tenantId,
        tenantName: payload.tenantName,
        tier: payload.tier,
        billingCycle: payload.billingCycle,
        status: isMpesaOrCard ? 'Active' : 'Trial',
        monthlyRate: payload.billingCycle === 'Annually' ? plan.annualPrice : plan.monthlyPrice,
        annualRate: plan.annualPrice * 12,
        licensedBeds: plan.maxBeds,
        maxBeds: plan.maxBeds,
        providerSeats: plan.maxProviderSeats,
        maxProviderSeats: plan.maxProviderSeats,
        storageAllocatedGb: plan.includedStorageGb,
        storageUsedGb: 0,
        startDate: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + (payload.billingCycle === 'Annually' ? 365 : 30) * 24 * 3600 * 1000).toISOString(),
        renewalDate: new Date(Date.now() + (payload.billingCycle === 'Annually' ? 365 : 30) * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: {
            type: payload.paymentMethod,
            phoneNumber: payload.mobileMoneyPhone,
            brand: payload.cardDetails?.brand || 'Visa',
            last4: payload.cardDetails?.last4 || (payload.cardDetails?.cardNumber ? payload.cardDetails.cardNumber.slice(-4) : '4242'),
            transactionCode: referenceNumber,
            invoiceNumber,
            institutionName: payload.tenantName,
        },
        activeAddons: [],
        contactPerson: payload.contactPerson,
        contactEmail: payload.contactEmail,
        region: 'US-East (N. Virginia)',
        baaSigned: true,
        fhirEnabled: payload.tier === 'Enterprise Health System',
        dicomArchiveTier: 'Enterprise Active PACS',
        notes: payload.notes || `Subscribed via ${payload.paymentMethod.toUpperCase()} online checkout.`,
        activationStatus: isMpesaOrCard ? 'Active' : 'Pending Activation',
        paymentStatus: isMpesaOrCard ? 'Paid' : 'Pending',
        paymentReference: referenceNumber,
        temporaryPassword: isMpesaOrCard ? initialPassword : undefined,
        credentialsSentAt: isMpesaOrCard ? new Date().toISOString() : undefined,
    };

    const currentSubs = getStoredSubscriptions();
    saveStoredSubscriptions([newSubscription, ...currentSubs]);

    // 3. Create invoice in localStorage
    try {
        const invoicesRaw = localStorage.getItem('raphamis_mock_invoices');
        const invoices: Invoice[] = invoicesRaw ? JSON.parse(invoicesRaw) : [];
        const newInvoice: Invoice = {
            id: invoiceNumber,
            tenantId,
            tenant: newTenant,
            amount,
            dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
            paidDate: isMpesaOrCard ? new Date().toISOString().split('T')[0] : null,
            status: isMpesaOrCard ? InvoiceStatus.Paid : InvoiceStatus.Pending,
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem('raphamis_mock_invoices', JSON.stringify([newInvoice, ...invoices]));
    } catch {
        // ignore
    }

    // 4. Handle Flows:
    if (isMpesaOrCard) {
        // Instant Activation: Send receipt and initial credentials to subscriber's email
        const receipt: SubscriptionReceipt = {
            receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
            invoiceNumber,
            tenantId,
            tenantName: payload.tenantName,
            subscriberEmail: payload.contactEmail,
            contactPerson: payload.contactPerson,
            contactPhone: payload.contactPhone,
            planTier: payload.tier,
            billingCycle: payload.billingCycle,
            amountPaid: amount,
            currency,
            paymentMethod: payload.paymentMethod,
            transactionReference: referenceNumber,
            paidAt: new Date().toISOString(),
            activationStatus: 'Active',
            accountLoginUrl: '/login',
            initialCredentials: {
                loginEmail: payload.contactEmail,
                temporaryPassword: initialPassword,
                loginUrl: '/login',
            },
            sentReceiptEmail: true,
            notes: `Payment verified instantly via ${payload.paymentMethod === 'mobile_money' ? 'Safaricom M-Pesa STK push' : 'Stripe Card Authorization'}. Official payment receipt and initial login credentials dispatched to ${payload.contactEmail}.`,
        };

        // Record Dispatched Email
        recordDispatchedEmail({
            recipientEmail: payload.contactEmail,
            recipientName: payload.contactPerson,
            subject: `Payment Receipt & Account Activation - ${payload.tenantName}`,
            type: 'receipt_instant',
            details: {
                tenantName: payload.tenantName,
                planTier: payload.tier,
                amount,
                currency,
                paymentMethod: payload.paymentMethod.toUpperCase(),
                transactionReference: referenceNumber,
                temporaryPassword: initialPassword,
                loginUrl: '/login',
            },
        });

        return {
            success: true,
            method: payload.paymentMethod,
            receipt,
            statusMessage: `Payment successfully verified! Your account for ${payload.tenantName} has been activated instantly. An official payment receipt and login credentials have been sent to ${payload.contactEmail}.`,
            tenant: newTenant,
            subscription: newSubscription,
            initialCredentials: {
                loginEmail: payload.contactEmail,
                temporaryPassword: initialPassword,
                loginUrl: '/login',
            },
        };
    } else {
        // Wire Transfer Flow:
        // Picks wire transfer bank details from Super Admin settings
        const superAdminWireDetails = getWireTransferSettings();

        const wireInvoice: WireTransferInvoice = {
            invoiceNumber,
            invoiceDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            tenantId,
            tenantName: payload.tenantName,
            subscriberEmail: payload.contactEmail,
            contactPerson: payload.contactPerson,
            contactPhone: payload.contactPhone,
            institutionType: payload.institutionType,
            address: payload.address,
            planTier: payload.tier,
            billingCycle: payload.billingCycle,
            amountDue: amount,
            currency: 'KES',
            paymentStatus: 'Pending',
            activationStatus: 'Pending Activation',
            wireTransferDetails: superAdminWireDetails,
            paymentReference: referenceNumber,
            statusMessage: 'Subscription request submitted. Wait for an activation email.',
        };

        // Record wire transfer submission email to subscriber
        recordDispatchedEmail({
            recipientEmail: payload.contactEmail,
            recipientName: payload.contactPerson,
            subject: `Subscription Request Submitted - Payment Invoice #${invoiceNumber}`,
            type: 'wire_invoice_submitted',
            details: {
                tenantName: payload.tenantName,
                planTier: payload.tier,
                amount,
                currency: 'KES',
                paymentMethod: 'WIRE_TRANSFER',
                transactionReference: referenceNumber,
            },
        });

        return {
            success: true,
            method: 'wire',
            wireInvoice,
            statusMessage: 'Subscription request submitted. Wait for an activation email.',
            tenant: newTenant,
            subscription: newSubscription,
        };
    }
};

// Super Admin manual activation of wire transfer
export const activatePendingWireSubscription = async (
    tenantId: string,
    wireReference: string,
    superAdminNotes?: string
): Promise<{
    success: boolean;
    tenant: Tenant;
    subscription: TenantSubscription;
    initialCredentials: {
        loginEmail: string;
        temporaryPassword: string;
        loginUrl: string;
    };
    emailSent: boolean;
}> => {
    // 1. Update Tenant
    const tenants = getStoredTenants();
    const tenantIndex = tenants.findIndex((t) => t.id === tenantId);
    if (tenantIndex === -1) {
        throw new Error(`Tenant with ID ${tenantId} not found.`);
    }

    const tenant = tenants[tenantIndex];
    const generatedPassword = `Wire#${Math.floor(1000 + Math.random() * 9000)}!Auth`;

    const updatedTenant: Tenant = {
        ...tenant,
        status: TenantStatus.Active,
        paymentStatus: 'Paid',
        activationStatus: 'Active',
        paymentReference: wireReference || tenant.paymentReference || `WIRE-VERIFIED-${Date.now()}`,
        initialCredentialsSent: true,
        temporaryPassword: generatedPassword,
        updatedAt: new Date().toISOString(),
    };
    tenants[tenantIndex] = updatedTenant;
    saveStoredTenants(tenants);

    // 2. Update Subscription
    const subs = getStoredSubscriptions();
    const subIndex = subs.findIndex((s) => s.tenantId === tenantId || s.id === tenantId);
    let updatedSub: TenantSubscription;

    if (subIndex !== -1) {
        updatedSub = {
            ...subs[subIndex],
            status: 'Active',
            activationStatus: 'Active',
            paymentStatus: 'Paid',
            paymentReference: wireReference,
            temporaryPassword: generatedPassword,
            credentialsSentAt: new Date().toISOString(),
            notes: superAdminNotes ? `${subs[subIndex].notes || ''} | Wire verified: ${superAdminNotes}` : subs[subIndex].notes,
        };
        subs[subIndex] = updatedSub;
        saveStoredSubscriptions(subs);
    } else {
        throw new Error('Associated subscription not found.');
    }

    // 3. Update Invoice to Paid
    try {
        const invoicesRaw = localStorage.getItem('raphamis_mock_invoices');
        if (invoicesRaw) {
            const invoices: Invoice[] = JSON.parse(invoicesRaw);
            const updatedInvoices = invoices.map((inv) => {
                if (inv.tenantId === tenantId) {
                    return {
                        ...inv,
                        status: InvoiceStatus.Paid,
                        paidDate: new Date().toISOString().split('T')[0],
                    };
                }
                return inv;
            });
            localStorage.setItem('raphamis_mock_invoices', JSON.stringify(updatedInvoices));
        }
    } catch {
        // ignore
    }

    // 4. Send the Initial Email and Password Details to Subscriber
    recordDispatchedEmail({
        recipientEmail: tenant.email,
        recipientName: tenant.name,
        subject: `Account Activated - Official Login Credentials for ${tenant.name}`,
        type: 'activation_credentials',
        details: {
            tenantName: tenant.name,
            planTier: tenant.subscriptionPlan,
            amount: updatedSub.monthlyRate,
            currency: 'KES',
            paymentMethod: 'WIRE_TRANSFER_SETTLED',
            transactionReference: wireReference,
            temporaryPassword: generatedPassword,
            loginUrl: '/login',
        },
    });

    return {
        success: true,
        tenant: updatedTenant,
        subscription: updatedSub,
        initialCredentials: {
            loginEmail: tenant.email,
            temporaryPassword: generatedPassword,
            loginUrl: '/login',
        },
        emailSent: true,
    };
};
