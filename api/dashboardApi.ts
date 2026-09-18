import apiClient from './apiClient';
import { DashboardStats, AuditLog, ExecutiveDashboardData } from '../packages/shared/types';
import { getExecutiveDashboardData as getExecData } from './subscriptionApi';
import { REVENUE_GROWTH_CHART_DATA, VALUE_REALIZATION_METRICS, SYSTEM_HEALTH_REGIONS } from './mockSubscriptionData';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
};

export const getRecentActivity = async (): Promise<AuditLog[]> => {
    const response = await apiClient.get('/dashboard/activity');
    return response.data;
};

export const getExecutiveStats = async (): Promise<ExecutiveDashboardData> => {
    return getExecData();
};

export const getRevenueGrowthHistory = async () => {
    return REVENUE_GROWTH_CHART_DATA;
};

export const getValueRealizationMetrics = async () => {
    return VALUE_REALIZATION_METRICS;
};

export const getRegionalSystemHealth = async () => {
    return SYSTEM_HEALTH_REGIONS;
};
