import { HospitalPatientBill } from '../packages/shared/types';

/**
 * Production Patient Billing Store
 * Real billing records only - no mock or simulated entries.
 */
export const initialPatientBills: HospitalPatientBill[] = [];

export const getStoredPatientBills = (): HospitalPatientBill[] => {
    try {
        const data = localStorage.getItem('raphamis_patient_bills');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const saveStoredPatientBills = (bills: HospitalPatientBill[]) => {
    try {
        localStorage.setItem('raphamis_patient_bills', JSON.stringify(bills));
    } catch {
        // ignore storage errors
    }
};
