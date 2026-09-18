import apiClient from './apiClient';
import {
    AnalyticsDataPayload,
    AnalyticsTimeRange,
    AnalyticsKpiSummary,
    RevenueTrendPoint,
    DepartmentCensus,
    FacilityBenchmark,
    ClinicalQualityMetric,
    PredictiveCapacityPoint,
    PayerMixPoint,
    PatientStatus,
} from '../packages/shared/types';
import { getStoredPatients } from './mockPatientData';

// Helper to retrieve tenants from localStorage
const getStoredTenantsList = () => {
    try {
        const stored = localStorage.getItem('raphamis_mock_tenants');
        if (stored) return JSON.parse(stored);
    } catch (e) {
        // fallback
    }
    return [
        { id: 'tnt_001', name: 'St. Jude General Hospital', subscriptionPlan: 'Enterprise Tier', status: 'Active' },
        { id: 'tnt_002', name: "Mercy Children's Clinic", subscriptionPlan: 'Professional Tier', status: 'Active' },
        { id: 'tnt_003', name: 'Northwest Community Medical', subscriptionPlan: 'Standard Tier', status: 'Trial' },
        { id: 'tnt_004', name: 'Apex Orthopedic Institute', subscriptionPlan: 'Enterprise Tier', status: 'Suspended' },
    ];
};

export const generateAnalyticsData = (
    timeRange: AnalyticsTimeRange = '30d',
    tenantId: string = 'ALL'
): AnalyticsDataPayload => {
    const allPatients = getStoredPatients();
    const allTenants = getStoredTenantsList();

    // Filter patients by tenant if requested
    const filteredPatients = tenantId === 'ALL'
        ? allPatients
        : allPatients.filter((p) => p.tenantId === tenantId);

    const activePatientsCount = filteredPatients.length;
    const admittedCount = filteredPatients.filter((p) => p.status === PatientStatus.Admitted).length;
    const criticalCount = filteredPatients.filter((p) => p.status === PatientStatus.Critical).length;
    const outpatientCount = filteredPatients.filter((p) => p.status === PatientStatus.Outpatient).length;
    const inTreatmentCount = filteredPatients.filter((p) => p.status === PatientStatus.InTreatment).length;
    const dischargedCount = filteredPatients.filter((p) => p.status === PatientStatus.Discharged).length;

    // Multiplier based on timeRange
    const rangeMultiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1.0 : timeRange === '90d' ? 2.8 : timeRange === 'ytd' ? 8.2 : 11.5;
    const facilityMultiplier = tenantId === 'ALL' ? 1.0 : tenantId === 'tnt_001' ? 0.48 : tenantId === 'tnt_002' ? 0.26 : tenantId === 'tnt_003' ? 0.16 : 0.10;

    // Base Revenue calculation
    const baseMonthlyRevenue = 284500 * facilityMultiplier;
    const computedRevenue = Math.round(baseMonthlyRevenue * rangeMultiplier);

    // Dynamic Acuity calculation
    const totalAcuitySum = Math.max(1, admittedCount + criticalCount + outpatientCount + inTreatmentCount + dischargedCount);
    const acuityDistribution = [
        {
            name: 'Outpatient & Ambulatory',
            value: outpatientCount,
            color: '#0D9488', // Teal-600
            percentage: Math.round((outpatientCount / totalAcuitySum) * 100),
        },
        {
            name: 'Admitted (Inpatient Beds)',
            value: admittedCount,
            color: '#2563EB', // Blue-600
            percentage: Math.round((admittedCount / totalAcuitySum) * 100),
        },
        {
            name: 'Active In-Treatment',
            value: inTreatmentCount,
            color: '#8B5CF6', // Purple-500
            percentage: Math.round((inTreatmentCount / totalAcuitySum) * 100),
        },
        {
            name: 'Critical Care / ICU',
            value: criticalCount,
            color: '#DC2626', // Red-600
            percentage: Math.round((criticalCount / totalAcuitySum) * 100),
        },
        {
            name: 'Discharged / Post-Care',
            value: dischargedCount,
            color: '#64748B', // Slate-500
            percentage: Math.round((dischargedCount / totalAcuitySum) * 100),
        },
    ];

    // KPIs
    const kpis: AnalyticsKpiSummary = {
        totalRevenue: computedRevenue,
        revenueChange: timeRange === '7d' ? 4.2 : timeRange === '30d' ? 12.8 : 8.4,
        patientVolume: Math.round((tenantId === 'ALL' ? 3420 : 1240 * facilityMultiplier * 2.5) * rangeMultiplier),
        patientVolumeChange: 6.4,
        bedOccupancyRate: tenantId === 'tnt_001' ? 88.4 : tenantId === 'tnt_002' ? 76.1 : tenantId === 'tnt_004' ? 62.0 : 82.3,
        occupancyChange: 3.1,
        avgLengthOfStay: tenantId === 'tnt_002' ? 2.8 : 4.6,
        alosChange: -0.4,
        readmissionRate30d: tenantId === 'tnt_001' ? 4.8 : tenantId === 'tnt_003' ? 6.2 : 5.1,
        readmissionChange: -1.2,
        patientSatisfaction: 4.82,
        csatChange: 0.15,
        erAverageWaitTime: tenantId === 'tnt_002' ? 18 : 24,
        waitChange: -4,
        cleanClaimRate: 96.4,
        claimRateChange: 2.1,
    };

    // Revenue Trend Time Series Points
    const periods = timeRange === '7d'
        ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
        : timeRange === '30d'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : timeRange === '90d'
        ? ['Month 1', 'Month 2', 'Month 3']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

    const revenueTrends: RevenueTrendPoint[] = periods.map((period, idx) => {
        const factor = 1 + (idx * 0.05) + Math.sin(idx) * 0.08;
        const total = Math.round((computedRevenue / periods.length) * factor);
        const inpatient = Math.round(total * 0.44);
        const outpatient = Math.round(total * 0.28);
        const pharmacy = Math.round(total * 0.16);
        const diagnostics = total - inpatient - outpatient - pharmacy;
        const target = Math.round(total * 0.94);
        return {
            period,
            inpatient,
            outpatient,
            pharmacy,
            diagnostics,
            total,
            target,
        };
    });

    // Department Census & Utilization
    const departmentCensus: DepartmentCensus[] = [
        {
            department: 'Cardiology',
            occupied: 42,
            capacity: 50,
            utilizationRate: 84.0,
            avgWaitMinutes: 22,
            staffRatio: '1:4',
            status: 'Normal',
        },
        {
            department: 'Emergency & Trauma',
            occupied: 38,
            capacity: 40,
            utilizationRate: 95.0,
            avgWaitMinutes: 19,
            staffRatio: '1:2',
            status: 'Critical',
        },
        {
            department: 'Intensive Care Unit (ICU)',
            occupied: 23,
            capacity: 25,
            utilizationRate: 92.0,
            avgWaitMinutes: 5,
            staffRatio: '1:1',
            status: 'Near Capacity',
        },
        {
            department: 'Pediatrics',
            occupied: 28,
            capacity: 40,
            utilizationRate: 70.0,
            avgWaitMinutes: 15,
            staffRatio: '1:3',
            status: 'Normal',
        },
        {
            department: 'General Surgery',
            occupied: 34,
            capacity: 45,
            utilizationRate: 75.5,
            avgWaitMinutes: 30,
            staffRatio: '1:3',
            status: 'Normal',
        },
        {
            department: 'Orthopedics',
            occupied: 29,
            capacity: 35,
            utilizationRate: 82.8,
            avgWaitMinutes: 25,
            staffRatio: '1:4',
            status: 'Normal',
        },
        {
            department: 'Oncology',
            occupied: 18,
            capacity: 22,
            utilizationRate: 81.8,
            avgWaitMinutes: 18,
            staffRatio: '1:2',
            status: 'Normal',
        },
        {
            department: 'General Medicine',
            occupied: 56,
            capacity: 65,
            utilizationRate: 86.2,
            avgWaitMinutes: 20,
            staffRatio: '1:5',
            status: 'Near Capacity',
        },
    ];

    // Facility Benchmarks
    const facilityBenchmarks: FacilityBenchmark[] = [
        {
            tenantId: 'tnt_001',
            tenantName: 'St. Jude General Hospital',
            tier: 'Enterprise Tier',
            activePatients: 1420,
            bedOccupancyRate: 88.4,
            monthlyRevenue: 148500,
            avgLengthOfStay: 4.8,
            qualityScore: 4.9,
            readmissionRate: 4.8,
            status: 'Active',
        },
        {
            tenantId: 'tnt_002',
            tenantName: "Mercy Children's Clinic",
            tier: 'Professional Tier',
            activePatients: 860,
            bedOccupancyRate: 76.1,
            monthlyRevenue: 72400,
            avgLengthOfStay: 2.8,
            qualityScore: 4.8,
            readmissionRate: 3.2,
            status: 'Active',
        },
        {
            tenantId: 'tnt_003',
            tenantName: 'Northwest Community Medical',
            tier: 'Standard Tier',
            activePatients: 520,
            bedOccupancyRate: 71.5,
            monthlyRevenue: 38200,
            avgLengthOfStay: 4.2,
            qualityScore: 4.6,
            readmissionRate: 6.2,
            status: 'Trial',
        },
        {
            tenantId: 'tnt_004',
            tenantName: 'Apex Orthopedic Institute',
            tier: 'Enterprise Tier',
            activePatients: 380,
            bedOccupancyRate: 62.0,
            monthlyRevenue: 25400,
            avgLengthOfStay: 3.5,
            qualityScore: 4.7,
            readmissionRate: 4.1,
            status: 'Suspended',
        },
    ];

    // Clinical Quality & Safety Metrics
    const clinicalQuality: ClinicalQualityMetric[] = [
        {
            id: 'cqm_01',
            name: 'Hospital-Acquired Infection (HAI) Rate',
            category: 'Safety',
            currentValue: 0.72,
            targetValue: 1.0,
            unit: 'per 1k patient days',
            benchmark: '< 1.25 national avg',
            status: 'optimal',
            description: 'Central line, catheter, and surgical site infection surveillance incidence.',
        },
        {
            id: 'cqm_02',
            name: '30-Day All-Cause Readmission Rate',
            category: 'Care Quality',
            currentValue: 5.1,
            targetValue: 6.0,
            unit: '% of discharges',
            benchmark: '< 7.8% CMS benchmark',
            status: 'optimal',
            description: 'Unplanned readmissions within 30 days of primary discharge.',
        },
        {
            id: 'cqm_03',
            name: 'Emergency Door-to-Doctor Time',
            category: 'Efficiency',
            currentValue: 18.5,
            targetValue: 20.0,
            unit: 'minutes',
            benchmark: '< 30.0 mins standard',
            status: 'optimal',
            description: 'Elapsed duration from emergency intake triage to first licensed physician evaluation.',
        },
        {
            id: 'cqm_04',
            name: 'Stat Diagnostic Lab Turnaround Time',
            category: 'Efficiency',
            currentValue: 34.0,
            targetValue: 30.0,
            unit: 'minutes',
            benchmark: '< 45.0 mins CAP threshold',
            status: 'warning',
            description: 'Duration from specimen barcode scan to verified electronic report release.',
        },
        {
            id: 'cqm_05',
            name: 'Medication Reconciliation at Discharge',
            category: 'Compliance',
            currentValue: 98.4,
            targetValue: 95.0,
            unit: '% completed',
            benchmark: '> 90.0% Joint Commission',
            status: 'optimal',
            description: 'Pharmacist and physician signed reconciliation comparing pre-admission and post-discharge drugs.',
        },
        {
            id: 'cqm_06',
            name: 'Surgical Safety Checklist Compliance',
            category: 'Safety',
            currentValue: 99.1,
            targetValue: 98.0,
            unit: '% sign-in/out',
            benchmark: '> 95.0% WHO standard',
            status: 'optimal',
            description: 'Full time-out documentation prior to induction and skin incision.',
        },
    ];

    // Predictive Capacity & ER Surge Forecast (7-day ahead timeline)
    const predictiveForecast: PredictiveCapacityPoint[] = [
        {
            date: '2026-09-08',
            dayName: 'Tue (Observed)',
            isForecast: false,
            predictedAdmissions: 32,
            confidenceLower: 32,
            confidenceUpper: 32,
            erSurgeIndex: 58,
            bedOccupancyForecast: 81,
            staffDeficit: 0,
        },
        {
            date: '2026-09-09',
            dayName: 'Wed (Observed)',
            isForecast: false,
            predictedAdmissions: 35,
            confidenceLower: 35,
            confidenceUpper: 35,
            erSurgeIndex: 64,
            bedOccupancyForecast: 83,
            staffDeficit: 0,
        },
        {
            date: '2026-09-10',
            dayName: 'Today (Live)',
            isForecast: false,
            predictedAdmissions: 39,
            confidenceLower: 39,
            confidenceUpper: 39,
            erSurgeIndex: 72,
            bedOccupancyForecast: 85,
            staffDeficit: 1,
        },
        {
            date: '2026-09-11',
            dayName: 'Fri (Forecast)',
            isForecast: true,
            predictedAdmissions: 44,
            confidenceLower: 38,
            confidenceUpper: 50,
            erSurgeIndex: 82,
            bedOccupancyForecast: 89,
            staffDeficit: 3,
        },
        {
            date: '2026-09-12',
            dayName: 'Sat (Forecast)',
            isForecast: true,
            predictedAdmissions: 48,
            confidenceLower: 41,
            confidenceUpper: 55,
            erSurgeIndex: 88,
            bedOccupancyForecast: 93,
            staffDeficit: 4,
        },
        {
            date: '2026-09-13',
            dayName: 'Sun (Forecast)',
            isForecast: true,
            predictedAdmissions: 42,
            confidenceLower: 36,
            confidenceUpper: 49,
            erSurgeIndex: 75,
            bedOccupancyForecast: 87,
            staffDeficit: 2,
        },
        {
            date: '2026-09-14',
            dayName: 'Mon (Forecast)',
            isForecast: true,
            predictedAdmissions: 46,
            confidenceLower: 39,
            confidenceUpper: 54,
            erSurgeIndex: 85,
            bedOccupancyForecast: 91,
            staffDeficit: 3,
        },
    ];

    // Payer Mix Breakdown
    const payerMix: PayerMixPoint[] = [
        {
            payer: 'Medicare / CMS',
            percentage: 38.5,
            revenue: Math.round(computedRevenue * 0.385),
            claimsCount: 1420,
            color: '#0D9488', // Teal
        },
        {
            payer: 'Blue Cross Blue Shield',
            percentage: 27.2,
            revenue: Math.round(computedRevenue * 0.272),
            claimsCount: 980,
            color: '#2563EB', // Blue
        },
        {
            payer: 'Medicaid State Program',
            percentage: 16.4,
            revenue: Math.round(computedRevenue * 0.164),
            claimsCount: 650,
            color: '#8B5CF6', // Purple
        },
        {
            payer: 'Commercial / Private (Aetna, United)',
            percentage: 12.8,
            revenue: Math.round(computedRevenue * 0.128),
            claimsCount: 470,
            color: '#F59E0B', // Amber
        },
        {
            payer: 'Self-Pay / Uninsured',
            percentage: 5.1,
            revenue: Math.round(computedRevenue * 0.051),
            claimsCount: 190,
            color: '#64748B', // Slate
        },
    ];

    return {
        kpis,
        revenueTrends,
        departmentCensus,
        facilityBenchmarks,
        clinicalQuality,
        predictiveForecast,
        payerMix,
        acuityDistribution,
    };
};

export const getAnalyticsOverview = async (
    timeRange: AnalyticsTimeRange = '30d',
    tenantId: string = 'ALL'
): Promise<AnalyticsDataPayload> => {
    try {
        const response = await apiClient.get(`/analytics/overview?timeRange=${timeRange}&tenantId=${tenantId}`);
        if (response.data && response.data.kpis) {
            return response.data;
        }
    } catch (e) {
        // Fallback to local computation
    }
    return generateAnalyticsData(timeRange, tenantId);
};
