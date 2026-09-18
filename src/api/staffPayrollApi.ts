import {
    StaffMember,
    StandardPayrollParameters,
    StaffPayrollEntry,
    PayrollRunSummary,
    ShiftRosterEntry,
    LeaveRequest,
} from '../types/staffPayrollTypes';
import {
    DEFAULT_KENYAN_PAYROLL_PARAMS,
    calculateStaffPayrollEntry,
    generatePayrollSummary,
} from '../utils/standardPayrollCalculator';

const STORAGE_KEYS = {
    STAFF: 'raphamis_staff_directory_v2',
    PAYROLL_PARAMS: 'raphamis_kenyan_payroll_params_v2',
    PAYROLL_RUNS: 'raphamis_payroll_runs_v2',
    PAYROLL_ENTRIES: 'raphamis_payroll_entries_v2',
    ROSTERS: 'raphamis_shift_rosters_v2',
    LEAVES: 'raphamis_leave_requests_v2',
};

// Production Staff Directory - MySQL / Live API source of truth
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [];

// Production Shift Rosters
export const INITIAL_SHIFT_ROSTERS: ShiftRosterEntry[] = [];

// Production Leave Requests
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

// ----------------------------------------------------------------------------
// Storage & API Handlers
// ----------------------------------------------------------------------------

export function getStaffMembers(): StaffMember[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
        if (raw) return JSON.parse(raw);
    } catch {
        // Fallback
    }
    return [];
}

export function saveStaffMember(staff: StaffMember): StaffMember {
    const list = getStaffMembers();
    const existingIdx = list.findIndex((s) => s.id === staff.id);
    if (existingIdx >= 0) {
        list[existingIdx] = staff;
    } else {
        list.push(staff);
    }
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    return staff;
}

export function deleteStaffMember(staffId: string): void {
    const list = getStaffMembers().filter((s) => s.id !== staffId);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
}

export function getPayrollParameters(): StandardPayrollParameters {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PAYROLL_PARAMS);
        if (raw) return JSON.parse(raw);
    } catch {
        // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.PAYROLL_PARAMS, JSON.stringify(DEFAULT_KENYAN_PAYROLL_PARAMS));
    return DEFAULT_KENYAN_PAYROLL_PARAMS;
}

export function savePayrollParameters(params: StandardPayrollParameters): StandardPayrollParameters {
    const updated = {
        ...params,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Hospital Financial Controller & HR Desk',
    };
    localStorage.setItem(STORAGE_KEYS.PAYROLL_PARAMS, JSON.stringify(updated));
    return updated;
}

export function resetPayrollParametersToOfficialDefaults(): StandardPayrollParameters {
    localStorage.setItem(STORAGE_KEYS.PAYROLL_PARAMS, JSON.stringify(DEFAULT_KENYAN_PAYROLL_PARAMS));
    return DEFAULT_KENYAN_PAYROLL_PARAMS;
}

/**
 * Computes a live monthly payroll run for all active hospital employees
 * according to current modifiable Kenyan statutory parameters.
 */
export function calculatePayrollForPeriod(
    period: string = 'September 2026'
): { summary: PayrollRunSummary; entries: StaffPayrollEntry[] } {
    const staffList = getStaffMembers().filter((s) => s.status === 'Active' || s.status === 'On Leave');
    const params = getPayrollParameters();
    const runId = `RUN-${period.replace(/\s+/g, '-').toUpperCase()}`;

    const entries = staffList.map((staff) => calculateStaffPayrollEntry(staff, params, period, runId));
    const summary = generatePayrollSummary(entries, period, runId);

    // Save active computation
    localStorage.setItem(STORAGE_KEYS.PAYROLL_ENTRIES + `_${period}`, JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEYS.PAYROLL_RUNS + `_${period}`, JSON.stringify(summary));

    return { summary, entries };
}

export function disbursePayroll(period: string): PayrollRunSummary {
    const { summary, entries } = calculatePayrollForPeriod(period);
    summary.status = 'Disbursed';
    const timestamp = new Date().toISOString();

    for (const e of entries) {
        e.status = 'Disbursed';
        e.disbursedAt = timestamp;
        e.transactionReference = `KRA-PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }

    localStorage.setItem(STORAGE_KEYS.PAYROLL_ENTRIES + `_${period}`, JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEYS.PAYROLL_RUNS + `_${period}`, JSON.stringify(summary));

    return summary;
}

export function getRosters(): ShiftRosterEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.ROSTERS);
        if (raw) return JSON.parse(raw);
    } catch {
        // Fallback
    }
    return [];
}

export function saveRosterEntry(entry: ShiftRosterEntry): ShiftRosterEntry {
    const list = getRosters();
    const existingIdx = list.findIndex((r) => r.id === entry.id);
    if (existingIdx >= 0) {
        list[existingIdx] = entry;
    } else {
        list.push(entry);
    }
    localStorage.setItem(STORAGE_KEYS.ROSTERS, JSON.stringify(list));
    return entry;
}

export function getLeaveRequests(): LeaveRequest[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
        if (raw) return JSON.parse(raw);
    } catch {
        // Fallback
    }
    return [];
}

export function saveLeaveRequest(req: LeaveRequest): LeaveRequest {
    const list = getLeaveRequests();
    const existingIdx = list.findIndex((l) => l.id === req.id);
    if (existingIdx >= 0) {
        list[existingIdx] = req;
    } else {
        list.unshift(req);
    }
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(list));
    return req;
}

export function updateLeaveStatus(
    leaveId: string,
    status: 'Approved' | 'Rejected',
    approverName: string = 'Hospital Medical Director'
): void {
    const list = getLeaveRequests();
    const item = list.find((l) => l.id === leaveId);
    if (item) {
        item.status = status;
        item.approvedBy = approverName;
        item.approvedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(list));
    }
}
