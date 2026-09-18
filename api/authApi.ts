import apiClient from './apiClient';
import { User } from '../packages/shared/types';
import {
    getLoginLockoutStatus,
    LockoutStatus,
    generatePasswordResetCode,
    verifyPasswordResetCode,
    completePasswordReset,
    authenticateCredentials,
} from '../services/securityService';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token?: string;
    user?: User;
    requires2FA?: boolean;
    twoFactorPending?: boolean;
    email?: string;
    tempToken?: string;
    isBackupCode?: boolean;
}

export interface TwoFactorSetupData {
    secret: string;
    formattedSecret: string;
    uri: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
}

export interface TwoFactorStatusData {
    email: string;
    twoFactorEnabled: boolean;
    backupCodesCount: number;
    hasTotpSecret: boolean;
}

export interface PasswordResetRequestResponse {
    success: boolean;
    expiresInMinutes: number;
    code?: string;
    error?: string;
}

export interface PasswordResetConfirmResponse {
    success: boolean;
    error?: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
};

export const verify2FALogin = async (email: string, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/2fa-verify', { email, code });
    return response.data;
};

export const getTwoFactorStatus = async (email?: string): Promise<TwoFactorStatusData> => {
    const response = await apiClient.post<TwoFactorStatusData>('/auth/2fa/status', { email });
    return response.data;
};

export const setupTwoFactor = async (email?: string): Promise<TwoFactorSetupData> => {
    const response = await apiClient.post<TwoFactorSetupData>('/auth/2fa/setup', { email });
    return response.data;
};

export const activateTwoFactor = async (email: string, code: string): Promise<{ success: boolean; backupCodes?: string[] }> => {
    const response = await apiClient.post<{ success: boolean; backupCodes?: string[] }>('/auth/2fa/activate', { email, code });
    return response.data;
};

export const disableTwoFactor = async (email: string, password: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>('/auth/2fa/disable', { email, password });
    return response.data;
};

export const getProfile = async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetRequestResponse> => {
    const response = await apiClient.post<PasswordResetRequestResponse>('/auth/password-reset/request', { email });
    return response.data;
};

export const verifyResetCode = async (email: string, code: string): Promise<{ valid: boolean; error?: string }> => {
    const response = await apiClient.post<{ valid: boolean; error?: string }>('/auth/password-reset/verify', { email, code });
    return response.data;
};

export const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
): Promise<PasswordResetConfirmResponse> => {
    const response = await apiClient.post<PasswordResetConfirmResponse>('/auth/password-reset/confirm', {
        email,
        code,
        newPassword,
    });
    return response.data;
};

export { getLoginLockoutStatus, type LockoutStatus };
