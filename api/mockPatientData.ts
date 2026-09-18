import { Patient } from '../packages/shared/types';

/**
 * Production Patient Store
 * No dummy or mock data. MySQL database and active patient records are the sole source of truth.
 */
export const initialPatients: Patient[] = [];

export const getStoredPatients = (): Patient[] => {
    try {
        const data = localStorage.getItem('raphamis_patients');
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch {
        return [];
    }
};

export const saveStoredPatients = (patients: Patient[]) => {
    try {
        localStorage.setItem('raphamis_patients', JSON.stringify(patients));
    } catch {
        // Ignore storage error
    }
};
