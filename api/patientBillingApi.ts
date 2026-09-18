import { HospitalPatientBill, PaymentTender } from '../packages/shared/types';
import { getStoredPatientBills, saveStoredPatientBills } from './mockBillingData';

export interface RecordSplitPaymentPayload {
    billId: string;
    newTenders: PaymentTender[];
    cashierNotes?: string;
}

export const getPatientBills = async (tenantId?: string): Promise<HospitalPatientBill[]> => {
    // Artificial latency simulation for realistic UI feel
    await new Promise((resolve) => setTimeout(resolve, 80));
    const bills = getStoredPatientBills();
    if (!tenantId || tenantId === 'ALL') {
        return bills;
    }
    return bills.filter((b) => b.tenantId === tenantId);
};

export const getPatientBillById = async (id: string): Promise<HospitalPatientBill | null> => {
    const bills = getStoredPatientBills();
    return bills.find((b) => b.id === id) || null;
};

export const recordSplitPayment = async (
    payload: RecordSplitPaymentPayload
): Promise<HospitalPatientBill> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const bills = getStoredPatientBills();
    const index = bills.findIndex((b) => b.id === payload.billId);

    if (index === -1) {
        throw new Error(`Bill ${payload.billId} not found`);
    }

    const currentBill = bills[index];
    const updatedTenders = [...currentBill.tenders, ...payload.newTenders];

    // Compute total paid across all tenders (converted amount in bill currency)
    const totalPaid = updatedTenders.reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0);
    const remainingBalance = Math.max(0, currentBill.totalAmount - totalPaid);

    let status: HospitalPatientBill['status'] = 'Partially Paid';
    if (remainingBalance <= 0.009) {
        status = 'Paid in Full';
    } else if (updatedTenders.length === 0) {
        status = 'Unpaid';
    } else if (updatedTenders.some((t) => t.type === 'insurance' && t.status === 'Pending Clearance')) {
        status = 'Pending Insurance';
    }

    const updatedBill: HospitalPatientBill = {
        ...currentBill,
        tenders: updatedTenders,
        totalPaid,
        remainingBalance,
        status,
        notes: payload.cashierNotes
            ? `${currentBill.notes ? currentBill.notes + ' | ' : ''}${payload.cashierNotes}`
            : currentBill.notes,
        updatedAt: new Date().toISOString(),
    };

    bills[index] = updatedBill;
    saveStoredPatientBills(bills);
    return updatedBill;
};

export const createPatientBill = async (
    billData: Omit<HospitalPatientBill, 'id' | 'createdAt' | 'updatedAt'>
): Promise<HospitalPatientBill> => {
    const bills = getStoredPatientBills();
    const newBill: HospitalPatientBill = {
        ...billData,
        id: `bill_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const updated = [newBill, ...bills];
    saveStoredPatientBills(updated);
    return newBill;
};

export const simulateMpesaStkPush = async (
    phoneNumber: string,
    amountKes: number
): Promise<{ success: boolean; transactionCode: string; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Generate authentic Safaricom format: e.g. QHK89412LA
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randLetters = () => chars[Math.floor(Math.random() * chars.length)];
    const code = `Q${randLetters()}${randLetters()}${Math.floor(10000 + Math.random() * 89999)}${randLetters()}${randLetters()}`;

    return {
        success: true,
        transactionCode: code,
        message: `M-Pesa STK Push of KES ${amountKes.toLocaleString()} completed successfully to ${phoneNumber}. Daraja Reference: ${code}`,
    };
};

export const simulateInsuranceAuth = async (
    provider: string,
    policyNumber: string,
    amount: number
): Promise<{ approved: boolean; preAuthCode: string; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const code = `AUTH-${provider.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 899999)}`;
    return {
        approved: true,
        preAuthCode: code,
        message: `Direct claim approval received from ${provider} for $${amount.toLocaleString()}. Pre-Authorization Reference: ${code}`,
    };
};
