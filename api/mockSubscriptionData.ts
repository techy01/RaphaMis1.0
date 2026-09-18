import {
    SubscriptionPlan,
    SubscriptionAddon,
    TenantSubscription,
    ExecutiveDashboardData,
} from '../packages/shared/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_starter',
        tier: 'Starter Clinic',
        tagline: 'Essential EHR, outpatient clinics, and foundational billing for independent medical facilities.',
        monthlyPrice: 1499,
        annualPrice: 1199,
        maxBeds: 50,
        maxProviderSeats: 15,
        includedStorageGb: 500,
        highlightFeatures: [
            'Core Multi-Tenant EHR & Clinical Charting',
            'Outpatient Appointments & Patient Vitals',
            'Foundational Billing & CMS-1500 Invoicing',
            'Laboratory Diagnostics (LIS) Integration',
            'Standard Role-Based Access Control (RBAC)',
            'Standard Cloud Hosting (99.9% SLA)',
        ],
        allFeatures: [
            {
                category: 'Clinical Core',
                items: [
                    { name: 'Patient Demographics & Medical Records', included: true },
                    { name: 'Vitals & Progress Notes', included: true },
                    { name: 'e-Prescribing Essentials', included: true },
                    { name: 'Inpatient Ward & Bed Management', included: false, note: 'Available in Community+' },
                ],
            },
            {
                category: 'Diagnostics & Pharmacy',
                items: [
                    { name: 'Laboratory Diagnostics (LIS)', included: true },
                    { name: 'Basic Pharmacy Formulary', included: true },
                    { name: 'Radiology (RIS) Scheduling', included: false },
                    { name: 'DICOM PACS Medical Viewer', included: false },
                ],
            },
            {
                category: 'Platform & Compliance',
                items: [
                    { name: 'HIPAA Business Associate Agreement (BAA)', included: true },
                    { name: 'Audit Trail & Access Logging', included: true },
                    { name: 'Multi-Region Failover', included: false },
                    { name: 'Dedicated Cloud VPC', included: false },
                ],
            },
        ],
    },
    {
        id: 'plan_community',
        tier: 'Community Hospital',
        tagline: 'Comprehensive acute care, pharmacy dispensing, telemedicine, and diagnostic imaging for growing hospitals.',
        badge: 'Growth Tier',
        monthlyPrice: 3499,
        annualPrice: 2799,
        maxBeds: 250,
        maxProviderSeats: 60,
        includedStorageGb: 3000,
        highlightFeatures: [
            'All Starter features included',
            'HD Telemedicine Encounters with Virtual Waiting Room',
            'Inpatient Bed & Ward Occupancy Management',
            'Hospital Pharmacy Dispensing & Inventory Tracking',
            'Radiology (RIS) Scheduling & Worklists',
            'Patient Engagement Portal (Appointments, Messaging, Refills)',
            'Automated Claims Scrubbing & Revenue Cycle Tracking',
            '99.95% High Availability Cloud SLA',
        ],
        allFeatures: [
            {
                category: 'Clinical Core',
                items: [
                    { name: 'Patient Demographics & Medical Records', included: true },
                    { name: 'Vitals & Progress Notes', included: true },
                    { name: 'Inpatient Ward & Bed Management', included: true },
                    { name: 'Staff Scheduling & Shift Allocations', included: true },
                ],
            },
            {
                category: 'Diagnostics & Pharmacy',
                items: [
                    { name: 'Laboratory Diagnostics (LIS)', included: true },
                    { name: 'Hospital Pharmacy Dispensing & Alerts', included: true },
                    { name: 'Radiology (RIS) Scheduling & Reporting', included: true },
                    { name: 'DICOM PACS Medical Viewer', included: true, note: 'Standard web viewer' },
                ],
            },
            {
                category: 'Platform & Compliance',
                items: [
                    { name: 'HIPAA Business Associate Agreement (BAA)', included: true },
                    { name: 'SOC2 Type II Audit Logging', included: true },
                    { name: 'Patient Portal SSO & Mobile Ready', included: true },
                    { name: 'Dedicated Cloud VPC', included: false },
                ],
            },
        ],
    },
    {
        id: 'plan_enterprise',
        tier: 'Enterprise Health System',
        tagline: 'Full-suite hospital network intelligence with Cloud DICOM PACS, AI Clinical Scribing, and Medical Supply Chain.',
        badge: 'Most Popular',
        monthlyPrice: 7999,
        annualPrice: 6399,
        maxBeds: 800,
        maxProviderSeats: 200,
        includedStorageGb: 15000,
        highlightFeatures: [
            'All Community Hospital features included',
            'Full Web DICOM PACS Viewer with Multi-Planar Tools',
            'Medical Supply Chain with Barcode Lot/Expiry Tracking',
            'AI Clinical Scribe & Automated Radiology Impression Summary',
            'HL7 v2 & FHIR R4 Real-Time Interoperability Engine',
            'Cross-Facility Multi-Tenant Data Federation',
            'Automated Insurance Pre-Auth & Claims Remittance',
            '99.99% Multi-Region Enterprise SLA',
        ],
        allFeatures: [
            {
                category: 'Clinical Core',
                items: [
                    { name: 'Patient Demographics & Medical Records', included: true },
                    { name: 'Vitals, Progress Notes & Clinical Alerts', included: true },
                    { name: 'Advanced Inpatient Bed Optimization & Transfers', included: true },
                    { name: 'Multi-Department Roster & Credentialing', included: true },
                ],
            },
            {
                category: 'Diagnostics & Pharmacy',
                items: [
                    { name: 'Automated High-Volume LIS Analyzer Feeds', included: true },
                    { name: 'Multi-Store Pharmacy Supply Chain with Barcoding', included: true },
                    { name: 'Web DICOM PACS with 3D/MPR Measurements', included: true },
                    { name: 'AI Diagnostic Screening & Critical Findings Push', included: true },
                ],
            },
            {
                category: 'Platform & Compliance',
                items: [
                    { name: 'HIPAA, GDPR & Regional Health BAA', included: true },
                    { name: 'Enterprise SAML / OAuth / Okta Single Sign-On', included: true },
                    { name: 'FHIR R4 API Bulk Export & Ingestion', included: true },
                    { name: '24/7 Clinical Emergency Concierge Response', included: true },
                ],
            },
        ],
    },
    {
        id: 'plan_sovereign',
        tier: 'Sovereign Cloud',
        tagline: 'Isolated dedicated VPC, zero-trust HIPAA architecture, custom SLA, and regional health data sovereignty.',
        badge: 'Sovereign Security',
        monthlyPrice: 14999,
        annualPrice: 11999,
        maxBeds: 3500,
        maxProviderSeats: 1000,
        includedStorageGb: 100000,
        highlightFeatures: [
            'Dedicated Isolated HIPAA & HITRUST Cloud VPC',
            'Custom Regional Data Residency & Sovereignty Guarantee',
            'Unlimited Cloud DICOM PACS Archive with Zero Tier-Egress',
            'Enterprise Millisecond HL7 v2 / FHIR Transformation Bus',
            'Bespoke Clinical AI Model Fine-Tuning on Sanitized Data',
            'Active-Active Multi-Region Zero-Loss Hot Standby (RPO 0s)',
            'Executive Account Director & Dedicated Engineering Pod',
            '99.999% Guaranteed Fault-Tolerant Uptime SLA',
        ],
        allFeatures: [
            {
                category: 'Clinical Core',
                items: [
                    { name: 'Unlimited Enterprise Hospital Facilities & Clinics', included: true },
                    { name: 'Custom EHR Workflow Engine & Clinical Forms', included: true },
                    { name: 'Autonomous Bed Occupancy & Discharge Prediction', included: true },
                    { name: 'Comprehensive Staff Credentialing & CME Tracking', included: true },
                ],
            },
            {
                category: 'Diagnostics & Pharmacy',
                items: [
                    { name: 'Universal Diagnostic Interoperability (LIS/PACS/ECG)', included: true },
                    { name: 'Automated Drug Dispensing Cabinets (Pyxis/Omnicell)', included: true },
                    { name: 'Zero-Footprint Diagnostic Medical DICOM Workstation', included: true },
                    { name: 'Custom Trained On-Premise / Private AI Models', included: true },
                ],
            },
            {
                category: 'Platform & Compliance',
                items: [
                    { name: 'Zero-Trust Dedicated Isolated Infrastructure (VPC)', included: true },
                    { name: 'Custom Hardware Security Module (HSM) Encryption Keys', included: true },
                    { name: 'Real-Time SIEM Stream (Splunk / Datadog / Sentinel)', included: true },
                    { name: 'Under 15-Minute Guaranteed Incident SLA', included: true },
                ],
            },
        ],
    },
];

export const SUBSCRIPTION_ADDONS: SubscriptionAddon[] = [
    {
        id: 'addon_ai_scribe',
        name: 'AI Diagnostic & Clinical Scribe',
        description: 'Ambient physician-patient encounter transcription, structured note generation, and radiology impression synthesis.',
        category: 'AI & Diagnostics',
        monthlyPrice: 499,
        annualPrice: 399,
        unitLabel: '/facility/mo',
    },
    {
        id: 'addon_pacs_archive',
        name: 'DICOM PACS Cloud Deep Archive (50TB)',
        description: 'Permanent cloud storage tier for high-resolution CT, MRI, and Fluoroscopy studies with instant retrieval.',
        category: 'Storage & Archiving',
        monthlyPrice: 750,
        annualPrice: 600,
        unitLabel: '/50TB/mo',
    },
    {
        id: 'addon_patient_notifications',
        name: 'Patient Omnichannel SMS & WhatsApp Pack (50k/mo)',
        description: 'High-throughput 2-way SMS and WhatsApp automated appointment reminders, prescription alerts, and lab notifications.',
        category: 'Patient Experience',
        monthlyPrice: 299,
        annualPrice: 239,
        unitLabel: '/50,000 msgs/mo',
    },
    {
        id: 'addon_fhir_gateway',
        name: 'HL7 v2 & FHIR R4 Enterprise Gateway',
        description: 'Bi-directional integration bridge for Epic, Cerner, LabCorp, Quest, and national health exchange networks.',
        category: 'Integrations',
        monthlyPrice: 599,
        annualPrice: 479,
        unitLabel: '/gateway/mo',
    },
    {
        id: 'addon_smart_supply_iot',
        name: 'Smart Medical Supply IoT & RFID Reader Pack',
        description: 'Hardware firmware integration for surgical suite RFID scanners and real-time perishable inventory tracking.',
        category: 'Integrations',
        monthlyPrice: 399,
        annualPrice: 319,
        unitLabel: '/50 devices/mo',
    },
];

export const INITIAL_TENANT_SUBSCRIPTIONS: TenantSubscription[] = [];

export const EXECUTIVE_DASHBOARD_DATA: ExecutiveDashboardData = {
    arr: 3222000,
    mrr: 268500,
    mrrGrowthMoM: 18.4,
    expansionRevenueMoM: 34200,
    netDollarRetention: 118.4,
    totalHospitalTenants: 14,
    totalClinicalFacilities: 42,
    activeInpatientBeds: 2085,
    totalMonitoredBeds: 2475,
    activeProviderSeats: 1280,
    monthlyPatientEncounters: 28450,
    totalDiagnosticStudies: 18710,
    telemedicineConsultations: 4120,
    averageDischargeSpeedupPercent: 34,
    smartInventorySavingsTotal: 1420000,
    cleanClaimsRate: 98.6,
    averageLabTurnaroundMinutes: 18,
    slaUptimePercent: 99.994,
    avgPlatformLatencyMs: 38,
};

export const REVENUE_GROWTH_CHART_DATA = [
    { month: 'Oct 2025', mrr: 185000, arr: 2220000, activeTenants: 9, beds: 1450 },
    { month: 'Nov 2025', mrr: 198000, arr: 2376000, activeTenants: 10, beds: 1600 },
    { month: 'Dec 2025', mrr: 215000, arr: 2580000, activeTenants: 11, beds: 1750 },
    { month: 'Jan 2026', mrr: 232000, arr: 2784000, activeTenants: 12, beds: 1900 },
    { month: 'Feb 2026', mrr: 249000, arr: 2988000, activeTenants: 13, beds: 2150 },
    { month: 'Mar 2026', mrr: 268500, arr: 3222000, activeTenants: 14, beds: 2475 },
];

export const VALUE_REALIZATION_METRICS = [
    {
        title: 'Discharge Velocity',
        metric: '34% Faster',
        subtitle: 'From 4.5 hrs down to 2.9 hrs',
        description: 'Automated inpatient bed management, physician discharge sign-offs, and pharmacy dispensing synchronization.',
        icon: 'TrendingUp',
        roiValue: '+$840k Annual Bed Utilization',
    },
    {
        title: 'RCM Clean Claims Rate',
        metric: '98.6%',
        subtitle: 'First-pass clean submission',
        description: 'Real-time billing validation, CMS ICD-10 cross-check, and automated insurance policy eligibility check.',
        icon: 'DollarSign',
        roiValue: '3.2x Faster Reimbursement',
    },
    {
        title: 'Medication Supply Waste',
        metric: '-42% Waste',
        subtitle: '$1.42M saved across networks',
        description: 'Batch expiry tracking, minimum safety thresholds, and auto-dispatched inter-facility pharmacy transfers.',
        icon: 'PackageCheck',
        roiValue: 'Zero Critical Stockouts',
    },
    {
        title: 'Diagnostics Turnaround',
        metric: '18 Minutes',
        subtitle: 'Down from 4.2 hours average',
        description: 'Bi-directional LIS analyzers and zero-latency DICOM PACS streaming to doctor tablets and workstations.',
        icon: 'Activity',
        roiValue: 'Critical Findings Push in <60s',
    },
];

export const SYSTEM_HEALTH_REGIONS = [
    {
        region: 'US-East (N. Virginia)',
        status: 'Operational',
        latency: '24ms',
        load: '34%',
        activeTenants: 8,
        storageTier: 'Multi-AZ Hot Archive',
        backupStatus: 'Hourly Snapshots Verified (100%)',
    },
    {
        region: 'US-West (Oregon)',
        status: 'Operational',
        latency: '42ms',
        load: '28%',
        activeTenants: 4,
        storageTier: 'Disaster Recovery Warm Standby',
        backupStatus: 'Replication Lag < 1.2s',
    },
    {
        region: 'EU-Central (Frankfurt)',
        status: 'Operational',
        latency: '68ms',
        load: '22%',
        activeTenants: 2,
        storageTier: 'GDPR / Sovereign Storage',
        backupStatus: 'Compliant Encrypted Vault',
    },
    {
        region: 'APAC (Singapore Edge)',
        status: 'Operational',
        latency: '82ms',
        load: '19%',
        activeTenants: 0,
        storageTier: 'Edge Gateway CDN & DNS',
        backupStatus: 'Sync Active',
    },
];

const SUBSCRIPTIONS_STORAGE_KEY = 'raphamis_tenant_subscriptions_v1';

export const getStoredSubscriptions = (): TenantSubscription[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
        if (!raw) {
            return [];
        }
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

export const saveStoredSubscriptions = (subs: TenantSubscription[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subs));
    } catch (e) {
        console.warn('Failed to save subscriptions to localStorage', e);
    }
};
