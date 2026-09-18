export type StaffDepartment =
    | 'Emergency & Casualty (A&E)'
    | 'Internal Medicine'
    | 'General Surgery & Theatre'
    | 'Pediatrics & Child Health'
    | 'Obstetrics & Gynaecology'
    | 'Critical Care (ICU / HDU)'
    | 'Pharmacy & Therapeutics'
    | 'Laboratory & Pathology'
    | 'Radiology & Medical Imaging'
    | 'Nursing Services'
    | 'Outpatient Clinics (OPD)'
    | 'Finance, Billing & Cashier'
    | 'Hospital Administration & HR';

export type EmploymentType =
    | 'Permanent & Pensionable'
    | 'Fixed-Term Contract'
    | 'Locum / Casual'
    | 'Visiting Consultant';

export type ProfessionalCouncil =
    | 'MD_COUNCIL' // Medical Medical Practitioners and Dentists Council Dental Council
    | 'NURSING_BOARD'   // Nursing Board
    | 'PPB'   // Pharmacy and Poisons Board
    | 'LAB_BOARD'// Medical Laboratory Board
    | 'COC'   // Clinical Officers Council
    | 'RAD_BOARD'  // Radiology Registration Board
    | 'None / Administrative';

export interface StaffMember {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: string;
    nationalId: string;
    email: string;
    phone: string;
    address: string;

    // Professional & Clinical Roles
    department: StaffDepartment;
    jobTitle: string;
    employmentType: EmploymentType;
    dateOfJoining: string;
    status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned';

    // Professional Council Credentialing
    professionalCouncil: ProfessionalCouncil;
    licenseNumber: string;
    licenseExpiryDate: string;
    retentionStatus: 'Valid & Active' | 'Expiring Soon' | 'Expired' | 'N/A';

    // Kenyan Statutory Registration
    kraPin: string;
    nssfNumber: string;
    healthInsuranceNumber: string; // Formerly National Health Insurance
    hudumaNumber?: string;

    // Banking & Disbursement Coordinates
    paymentMethod: 'Bank Transfer' | 'Digital Wallet Bulk';
    bankName: string;
    bankBranch: string;
    bankAccountNumber: string;
    mpesaNumber: string;

    // Monthly Compensation Package (in KES)
    compensation: {
        basicSalary: number;
        houseAllowance: number;
        commuterAllowance: number;
        medicalAllowance: number;
        callDutyAllowance: number;
        riskAllowance: number;
        overtimeHours?: number;
        overtimeRatePerHour?: number;

        // Discretionary / Voluntary Monthly Deductions
        saccoDeduction: number;
        saccoName?: string;
        staffLoanDeduction: number;
        voluntaryPensionPercent: number; // % of basic
        benevolentFund: number;
        otherDeductions: number;
    };
}

export interface TaxBand {
    id: string;
    bandName: string;
    minIncome: number;
    maxIncome: number | null; // null represents unbounded ("Above X")
    ratePercent: number;
}

export interface StandardPayrollParameters {
    lastUpdated: string;
    updatedBy: string;
    versionName: string; // e.g., "Standard Global Finance 2023/2024 Compliant"

    // KRA PAYE Tax Bands (Graduated Scale)
    taxBands: TaxBand[];

    // KRA Tax Reliefs
    personalReliefMonthly: number; // KES 2,400 / month
    insuranceReliefPercent: number; // 15% of National Health Insurance and private medical/life
    maxInsuranceReliefMonthly: number; // KES 5,000 / month
    housingReliefPercent: number; // 15% of AHL contribution
    maxHousingReliefMonthly: number; // KES 9,000 / month (KES 108,000/yr)

    // NSSF (National Social Security Fund) - NSSF Act 2013 Current Phase
    nssfTier1Limit: number; // Lower Earnings Limit (KES 7,000)
    nssfTier1RatePercent: number; // 6%
    nssfTier2Limit: number; // Upper Earnings Limit (KES 36,000)
    nssfTier2RatePercent: number; // 6%
    nssfEmployerMatchPercent: number; // 6% match

    // SHIF (Social Health Insurance Fund - SHIF Act 2023)
    healthInsuranceRatePercent: number; // 2.75% of gross salary
    healthInsuranceMinimumContribution: number; // KES 300 minimum floor

    // Affordable Housing Levy (Affordable Housing Act 2024)
    housingLevyEmployeeRatePercent: number; // 1.5% of gross salary
    housingLevyEmployerRatePercent: number; // 1.5% of gross salary

    // Allowable Tax Exemption on Pension/NSSF
    maxAllowablePensionExemption: number; // KES 20,000 / month
}

export interface StaffPayrollEntry {
    id: string;
    payrollRunId: string;
    period: string; // e.g. "September 2026"
    staffId: string;
    employeeNumber: string;
    staffName: string;
    department: StaffDepartment;
    jobTitle: string;
    kraPin: string;
    nssfNumber: string;
    healthInsuranceNumber: string;
    bankName: string;
    bankAccountNumber: string;
    mpesaNumber: string;
    paymentMethod: 'Bank Transfer' | 'Digital Wallet Bulk';

    // Earnings Itemization (KES)
    basicSalary: number;
    houseAllowance: number;
    commuterAllowance: number;
    medicalAllowance: number;
    callDutyAllowance: number;
    riskAllowance: number;
    overtimePay: number;
    grossSalary: number;

    // Statutory Employee Deductions (KES)
    nssfTier1Employee: number;
    nssfTier2Employee: number;
    totalNssfEmployee: number;
    healthInsuranceEmployee: number;
    housingLevyEmployee: number;

    // Statutory Employer Contributions (KES)
    nssfTier1Employer: number;
    nssfTier2Employer: number;
    totalNssfEmployer: number;
    housingLevyEmployer: number;

    // Tax Computation (KRA PAYE)
    taxableGrossPay: number;
    allowablePensionNssfExemption: number;
    taxableNetPay: number;
    grossTaxPaye: number;
    personalRelief: number;
    insuranceRelief: number;
    housingRelief: number;
    totalReliefs: number;
    netTaxPaye: number; // PAYE Payable (cannot be negative)

    // Voluntary / Discretionary Deductions (KES)
    saccoDeduction: number;
    staffLoanDeduction: number;
    voluntaryPensionEmployee: number;
    benevolentFund: number;
    otherDeductions: number;
    totalVoluntaryDeductions: number;

    // Totals
    totalDeductions: number;
    netSalary: number; // Take Home
    totalEmployerCost: number; // Cost to Hospital (Gross + Employer NSSF + Employer AHL)

    // Disbursement Status
    status: 'Draft' | 'Computed' | 'Verified' | 'Approved' | 'Disbursed';
    transactionReference?: string;
    disbursedAt?: string;
    payslipGenerated: boolean;
}

export interface PayrollRunSummary {
    id: string;
    period: string; // e.g. "September 2026"
    runDate: string;
    preparedBy: string;
    verifiedBy?: string;
    status: 'Draft' | 'Computed' | 'Approved' | 'Disbursed';
    totalEmployeesCount: number;

    // Financial Totals in KES
    totalGrossPayroll: number;
    totalNetSalaryPayout: number;
    totalKraPayePayable: number;
    totalNssfEmployee: number;
    totalNssfEmployer: number;
    totalNssfRemittance: number; // Employee + Employer
    totalShifRemittance: number;
    totalHousingLevyEmployee: number;
    totalHousingLevyEmployer: number;
    totalHousingLevyRemittance: number; // Employee + Employer
    totalSaccoDeductions: number;
    totalStaffLoans: number;
    totalHospitalCost: number;
}

export interface ShiftRosterEntry {
    id: string;
    staffId: string;
    staffName: string;
    staffRole: string;
    department: StaffDepartment;
    date: string; // YYYY-MM-DD
    shiftType: 'Morning (07:00-15:00)' | 'Evening (14:00-22:00)' | 'Night (20:00-08:00)' | 'On-Call 24hr' | 'Off Duty';
    assignedStation: string; // e.g. "Emergency Triage", "ICU Bed 01-04", "Central Pharmacy", "Theatre 2"
    status: 'Scheduled' | 'On Duty' | 'Completed' | 'Swapped' | 'Absent';
    swapRequestedWith?: string;
}

export interface LeaveRequest {
    id: string;
    staffId: string;
    staffName: string;
    department: StaffDepartment;
    jobTitle: string;
    leaveType: 'Annual Leave' | 'Sick Leave' | 'Maternity Leave' | 'Paternity Leave' | 'CME / Study Leave' | 'Compassionate Leave';
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    relieverStaffName: string;
    status: 'Pending HOD Approval' | 'Approved' | 'Rejected';
    appliedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}
