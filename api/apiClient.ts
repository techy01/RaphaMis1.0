import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';

/**
 * Production RaphaMIS API Client
 * Strict Zero-Simulation Architecture: Direct End-to-End wire to MySQL Backend
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Attach JWT Bearer token to all outgoing authenticated requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Validates production JSON responses and strictly rejects HTML fallbacks
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Prevent SPA router HTML fallbacks from being treated as API payloads
        if (
            typeof response.data === 'string' &&
            (response.data.trim().startsWith('<!DOCTYPE') || response.data.includes('<html'))
        ) {
            return Promise.reject(
                new Error(
                    `API route "${response.config.url}" returned an HTML fallback. Please verify that the NestJS backend service is running on the VPS.`
                )
            );
        }
        return response;
    },
    (error: AxiosError) => {
        // Handle 401 Unauthorized sessions
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('raphamis_active_session');
            localStorage.removeItem('token');
            localStorage.removeItem('raphamis_active_session');
        }

        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;
