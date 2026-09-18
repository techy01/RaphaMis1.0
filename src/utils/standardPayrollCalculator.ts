import {
    StaffMember,
    StandardPayrollParameters,
    StaffPayrollEntry,
    PayrollRunSummary,
} from '../types/staffPayrollTypes';

/**
 * Official Standard Statutory Tax, Social Security, and Health Insurance
 * default statutory parameters as enacted under Standard Finance Regulations.
 */
export const DEFAULT_KENYAN_PAYROLL_PARAMS: StandardPayrollParameters = {
    lastUpdated: '2026-09-01T00:00:00.000Z',
    updatedBy: 'National Treasury & KRA Statutory Compliance Desk',
    versionName: 'Standard Global Finance & Health Insurance Framework',

    // KRA Graduated PAYE Tax Bands (Monthly in KES)
    taxBands: [
        { id: 'b1', bandName: 'Band 1 (First KES 24,000)', minIncome: 0, maxIncome: 24000, ratePercent: 10.0 },
        { id: 'b2', bandName: 'Band 2 (Next KES 8,333)', minIncome: 24000, maxIncome: 32333, ratePercent: 25.0 },
        { id: 'b3', bandName: 'Band 3 (Next KES 467,667)', minIncome: 32333, maxIncome: 500000, ratePercent: 30.0 },
        { id: 'b4', bandName: 'Band 4 (Next KES 300,000)', minIncome: 500000, maxIncome: 800000, ratePercent: 32.5 },
        { id: 'b5', bandName: 'Band 5 (Above KES 800,000)', minIncome: 800000, maxIncome: null, ratePercent: 35.0 },
    ],

    // KRA Statutory Tax Reliefs (Monthly in KES)
    personalReliefMonthly: 2400, // KES 28,800 annually
    insuranceReliefPercent: 15.0, // 15% of Health Insurance and qualifying health/life policies
    maxInsuranceReliefMonthly: 5000, // Max KES 60,000 annually
    housingReliefPercent: 15.0, // 15% of Affordable Housing Levy contribution
    maxHousingReliefMonthly: 9000, // Max KES 108,000 annually

    // NSSF Act 2013 Phase II Limits (Monthly in KES)
    nssfTier1Limit: 7000, // Lower Earnings Limit (LEL)
    nssfTier1RatePercent: 6.0, // Employee 6% (max KES 420)
    nssfTier2Limit: 36000, // Upper Earnings Limit (UEL)
    nssfTier2RatePercent: 6.0, // Employee 6% (max KES 1,740)
    nssfEmployerMatchPercent: 6.0, // 100% Employer Match

    // Social Health Insurance Fund (Health Insurance Act 2023)
    healthInsuranceRatePercent: 2.75, // 2.75% of Gross Salary (replaces old graduated Health Insurance rates)
    healthInsuranceMinimumContribution: 300, // Minimum floor of KES 300/month

    // Affordable Housing Levy (Affordable Housing Act 2024)
    housingLevyEmployeeRatePercent: 1.5, // 1.5% of Gross Salary
    housingLevyEmployerRatePercent: 1.5, // 1.5% Employer Match

    // Allowable Tax Exemption on Pension/NSSF (KRA ITA Sec 15)
    maxAllowablePensionExemption: 20000, // KES 20,000/month or KES 240,000/year
};

/**
 * Calculates a single staff member's complete Kenyan payroll breakdown
 * using dynamic and modifiable parameters.
 */
export function calculateStaffPayrollEntry(
    staff: StaffMember,
    params: StandardPayrollParameters,
    period: string,
    payrollRunId: string
): StaffPayrollEntry {
    const comp = staff.compensation;

    // 1. Calculate Overtime Pay
    const overtimeHours = comp.overtimeHours || 0;
    const overtimeRate = comp.overtimeRatePerHour || 0;
    const overtimePay = Math.round(overtimeHours * overtimeRate);

    // 2. Calculate Gross Salary
    const grossSalary = Math.round(
        comp.basicSalary +
        comp.houseAllowance +
        comp.commuterAllowance +
        comp.medicalAllowance +
        comp.callDutyAllowance +
        comp.riskAllowance +
        overtimePay
    );

    // 3. NSSF (National Social Security Fund) - Tier I and Tier II
    let nssfTier1Employee = 0;
    let nssfTier2Employee = 0;

    if (grossSalary > 0) {
        const tier1Base = Math.min(grossSalary, params.nssfTier1Limit);
        nssfTier1Employee = Math.round(tier1Base * (params.nssfTier1RatePercent / 100));

        if (grossSalary > params.nssfTier1Limit) {
            const tier2Base = Math.min(
                grossSalary - params.nssfTier1Limit,
                params.nssfTier2Limit - params.nssfTier1Limit
            );
            nssfTier2Employee = Math.round(tier2Base * (params.nssfTier2RatePercent / 100));
        }
    }

    const totalNssfEmployee = nssfTier1Employee + nssfTier2Employee;
    const nssfTier1Employer = nssfTier1Employee;
    const nssfTier2Employer = nssfTier2Employee;
    const totalNssfEmployer = totalNssfEmployee;

    // 4. Health Insurance (Social Health Insurance Fund - 2.75% of Gross)
    let healthInsuranceEmployee = 0;
    if (grossSalary > 0) {
        healthInsuranceEmployee = Math.round(grossSalary * (params.healthInsuranceRatePercent / 100));
        if (healthInsuranceEmployee < params.healthInsuranceMinimumContribution) {
            healthInsuranceEmployee = params.healthInsuranceMinimumContribution;
        }
    }

    // 5. Affordable Housing Levy (AHL - 1.5% Employee, 1.5% Employer)
    const housingLevyEmployee = Math.round(grossSalary * (params.housingLevyEmployeeRatePercent / 100));
    const housingLevyEmployer = Math.round(grossSalary * (params.housingLevyEmployerRatePercent / 100));

    // 6. Voluntary Pension
    const voluntaryPensionEmployee = Math.round(
        (comp.basicSalary * (comp.voluntaryPensionPercent || 0)) / 100
    );

    // 7. Allowable Deductions for KRA Tax Computation
    // Under Kenyan Tax Law, combined statutory NSSF + qualifying Pension is allowable up to KES 20,000/month
    const allowablePensionNssfExemption = Math.min(
        totalNssfEmployee + voluntaryPensionEmployee,
        params.maxAllowablePensionExemption
    );

    const taxableGrossPay = grossSalary;
    const taxableNetPay = Math.max(0, grossSalary - allowablePensionNssfExemption);

    // 8. KRA PAYE Graduated Tax Computation
    let grossTaxPaye = 0;

    // Sort bands ascending by minIncome to guarantee sequential computation
    const sortedBands = [...params.taxBands].sort((a, b) => a.minIncome - b.minIncome);

    for (const band of sortedBands) {
        if (taxableNetPay > band.minIncome) {
            let taxableChunk = 0;
            if (band.maxIncome !== null && band.maxIncome !== undefined) {
                taxableChunk = Math.min(taxableNetPay - band.minIncome, band.maxIncome - band.minIncome);
            } else {
                // Highest unbounded bracket
                taxableChunk = taxableNetPay - band.minIncome;
            }

            if (taxableChunk > 0) {
                grossTaxPaye += taxableChunk * (band.ratePercent / 100);
            }
        }
    }
    grossTaxPaye = Math.round(grossTaxPaye);

    // 9. Statutory Tax Reliefs
    const personalRelief = params.personalReliefMonthly;

    // Insurance Relief: 15% of Health Insurance contribution, max KES 5,000/month
    const calculatedInsuranceRelief = Math.round(healthInsuranceEmployee * (params.insuranceReliefPercent / 100));
    const insuranceRelief = Math.min(calculatedInsuranceRelief, params.maxInsuranceReliefMonthly);

    // Housing Relief: 15% of Housing Levy contribution, max KES 9,000/month
    const calculatedHousingRelief = Math.round(housingLevyEmployee * (params.housingReliefPercent / 100));
    const housingRelief = Math.min(calculatedHousingRelief, params.maxHousingReliefMonthly);

    const totalReliefs = personalRelief + insuranceRelief + housingRelief;

    // Net PAYE Tax Payable (cannot be less than zero)
    const netTaxPaye = Math.max(0, Math.round(grossTaxPaye - totalReliefs));

    // 10. Discretionary & Voluntary Deductions
    const saccoDeduction = comp.saccoDeduction || 0;
    const staffLoanDeduction = comp.staffLoanDeduction || 0;
    const benevolentFund = comp.benevolentFund || 0;
    const otherDeductions = comp.otherDeductions || 0;

    const totalVoluntaryDeductions =
        saccoDeduction +
        staffLoanDeduction +
        voluntaryPensionEmployee +
        benevolentFund +
        otherDeductions;

    // 11. Total Deductions
    const totalDeductions =
        netTaxPaye +
        totalNssfEmployee +
        healthInsuranceEmployee +
        housingLevyEmployee +
        totalVoluntaryDeductions;

    // 12. Net Take-Home Salary
    const netSalary = Math.round(grossSalary - totalDeductions);

    // 13. Total Hospital Employer Cost (CTC)
    const totalEmployerCost = Math.round(
        grossSalary +
        totalNssfEmployer +
        housingLevyEmployer +
        voluntaryPensionEmployee // if matched or hospital contribution
    );

    return {
        id: `PAY-${staff.id}-${period.replace(/\s+/g, '-')}`,
        payrollRunId,
        period,
        staffId: staff.id,
        employeeNumber: staff.employeeNumber,
        staffName: `${staff.firstName} ${staff.lastName}`,
        department: staff.department,
        jobTitle: staff.jobTitle,
        kraPin: staff.kraPin,
        nssfNumber: staff.nssfNumber,
        healthInsuranceNumber: staff.healthInsuranceNumber,
        bankName: staff.bankName,
        bankAccountNumber: staff.bankAccountNumber,
        mpesaNumber: staff.mpesaNumber,
        paymentMethod: staff.paymentMethod,

        // Earnings
        basicSalary: comp.basicSalary,
        houseAllowance: comp.houseAllowance,
        commuterAllowance: comp.commuterAllowance,
        medicalAllowance: comp.medicalAllowance,
        callDutyAllowance: comp.callDutyAllowance,
        riskAllowance: comp.riskAllowance,
        overtimePay,
        grossSalary,

        // Statutory Employee
        nssfTier1Employee,
        nssfTier2Employee,
        totalNssfEmployee,
        healthInsuranceEmployee,
        housingLevyEmployee,

        // Statutory Employer
        nssfTier1Employer,
        nssfTier2Employer,
        totalNssfEmployer,
        housingLevyEmployer,

        // Tax
        taxableGrossPay,
        allowablePensionNssfExemption,
        taxableNetPay,
        grossTaxPaye,
        personalRelief,
        insuranceRelief,
        housingRelief,
        totalReliefs,
        netTaxPaye,

        // Voluntary
        saccoDeduction,
        staffLoanDeduction,
        voluntaryPensionEmployee,
        benevolentFund,
        otherDeductions,
        totalVoluntaryDeductions,

        // Totals
        totalDeductions,
        netSalary,
        totalEmployerCost,

        status: 'Computed',
        payslipGenerated: true,
    };
}

/**
 * Summarizes an entire monthly payroll run across all hospital employees.
 */
export function generatePayrollSummary(
    entries: StaffPayrollEntry[],
    period: string,
    payrollRunId: string
): PayrollRunSummary {
    const summary: PayrollRunSummary = {
        id: payrollRunId,
        period,
        runDate: new Date().toISOString(),
        preparedBy: 'Faith Muthoni (Chief Accountant & Payroll Officer)',
        verifiedBy: 'Dr. Michael Chen, MD (Hospital Superintendent)',
        status: 'Computed',
        totalEmployeesCount: entries.length,

        totalGrossPayroll: 0,
        totalNetSalaryPayout: 0,
        totalKraPayePayable: 0,
        totalNssfEmployee: 0,
        totalNssfEmployer: 0,
        totalNssfRemittance: 0,
        totalShifRemittance: 0,
        totalHousingLevyEmployee: 0,
        totalHousingLevyEmployer: 0,
        totalHousingLevyRemittance: 0,
        totalSaccoDeductions: 0,
        totalStaffLoans: 0,
        totalHospitalCost: 0,
    };

    for (const e of entries) {
        summary.totalGrossPayroll += e.grossSalary;
        summary.totalNetSalaryPayout += e.netSalary;
        summary.totalKraPayePayable += e.netTaxPaye;
        summary.totalNssfEmployee += e.totalNssfEmployee;
        summary.totalNssfEmployer += e.totalNssfEmployer;
        summary.totalNssfRemittance += e.totalNssfEmployee + e.totalNssfEmployer;
        summary.totalShifRemittance += e.healthInsuranceEmployee;
        summary.totalHousingLevyEmployee += e.housingLevyEmployee;
        summary.totalHousingLevyEmployer += e.housingLevyEmployer;
        summary.totalHousingLevyRemittance += e.housingLevyEmployee + e.housingLevyEmployer;
        summary.totalSaccoDeductions += e.saccoDeduction;
        summary.totalStaffLoans += e.staffLoanDeduction;
        summary.totalHospitalCost += e.totalEmployerCost;
    }

    return summary;
}
