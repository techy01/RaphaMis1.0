import apiClient from './apiClient';
import { Invoice } from '../packages/shared/types';

export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/billing/invoices');
    return response.data;
};
