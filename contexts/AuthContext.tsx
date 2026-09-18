import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authApi from '../api/authApi';
import { User } from '../packages/shared/types';
import { logSecurityEvent } from '../services/securityService';
import { IdleTimeoutModal } from '../components/security/IdleTimeoutModal';

// HIPAA § 164.312(a)(2)(iii) & GDPR Security Standard:
// 15-minute maximum inactivity threshold for all healthcare and administrative accounts
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const IDLE_WARNING_MS = 14 * 60 * 1000; // Warning shown at 14 minutes (60 seconds remaining)
const SESSION_STORAGE_KEY = 'raphamis_active_session';
const SESSION_NOTICE_KEY = 'raphamis_session_notice';

export interface ActiveSession {
    token: string;
    user: User;
    loginTime: number;
    lastActivityTime: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (credentials: authApi.LoginCredentials) => Promise<authApi.LoginResponse>;
    verify2FA: (email: string, code: string) => Promise<authApi.LoginResponse>;
    logout: (reason?: string) => void;
    extendSession: () => void;
    loading: boolean;
    sessionNotice: string | null;
    clearSessionNotice: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionNotice, setSessionNotice] = useState<string | null>(() => {
        try {
            return sessionStorage.getItem(SESSION_NOTICE_KEY);
        } catch {
            return null;
        }
    });

    // Idle Inactivity Warning State
    const [isIdleWarningOpen, setIsIdleWarningOpen] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(60);

    const navigate = useNavigate();
    const location = useLocation();
    const lastActivityRef = useRef<number>(Date.now());
    const throttleActivityRef = useRef<number>(0);

    const clearSessionNotice = useCallback(() => {
        setSessionNotice(null);
        try {
            sessionStorage.removeItem(SESSION_NOTICE_KEY);
        } catch {
            // ignore
        }
    }, []);

    // Perform secure logout and wipe all session data
    const logout = useCallback((reason?: string) => {
        const currentUser = user;
        try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');

            if (reason) {
                sessionStorage.setItem(SESSION_NOTICE_KEY, reason);
                setSessionNotice(reason);
            } else {
                sessionStorage.removeItem(SESSION_NOTICE_KEY);
                setSessionNotice(null);
            }
        } catch {
            // ignore storage errors
        }

        if (currentUser) {
            logSecurityEvent(
                reason?.includes('inactivity') ? 'SESSION_IDLE_TIMEOUT' : 'LOGOUT',
                currentUser.email,
                reason || 'User initiated manual sign out.'
            );
        }

        setUser(null);
        setIsIdleWarningOpen(false);
        navigate('/login', { replace: true });
    }, [user, navigate]);

    // Extend session when user confirms activity
    const extendSession = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        setIsIdleWarningOpen(false);
        setRemainingSeconds(60);

        try {
            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
            if (raw) {
                const session: ActiveSession = JSON.parse(raw);
                session.lastActivityTime = now;
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            }
        } catch {
            // ignore
        }
    }, []);

    // Strict session validation on load - NO AUTO-LOGIN
    const checkAuthStatus = useCallback(() => {
        setLoading(true);
        try {
            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
            if (!raw) {
                // No authenticated session exists - ensure state is clean
                setUser(null);
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                setLoading(false);
                return;
            }

            const session: ActiveSession = JSON.parse(raw);
            const now = Date.now();
            const elapsed = now - (session.lastActivityTime || session.loginTime || 0);

            // If session is older than 15 minutes of inactivity, invalidate immediately
            if (elapsed > IDLE_TIMEOUT_MS) {
                logout('Your previous session expired due to inactivity. Please sign in again to access the portal.');
                setLoading(false);
                return;
            }

            // Session is valid
            session.lastActivityTime = now;
            lastActivityRef.current = now;
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            sessionStorage.setItem('token', session.token);
            localStorage.setItem('token', session.token);
            setUser(session.user);
        } catch (error) {
            console.error('Session validation failed', error);
            setUser(null);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Inactivity / Idle Timeout Event Listeners
    useEffect(() => {
        if (!user) {
            setIsIdleWarningOpen(false);
            return;
        }

        const handleUserActivity = () => {
            const now = Date.now();
            // Throttle updating storage to once every 5 seconds to preserve performance
            if (now - throttleActivityRef.current > 5000) {
                throttleActivityRef.current = now;
                lastActivityRef.current = now;

                // Update session in storage
                try {
                    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
                    if (raw) {
                        const session: ActiveSession = JSON.parse(raw);
                        session.lastActivityTime = now;
                        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
                        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
                    }
                } catch {
                    // ignore
                }

                // If warning was previously open and user moved, close warning
                if (isIdleWarningOpen) {
                    setIsIdleWarningOpen(false);
                    setRemainingSeconds(60);
                }
            }
        };

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

        // Master 1-second interval timer checking for idle timeout
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;

            if (elapsed >= IDLE_TIMEOUT_MS) {
                // Idle timeout reached! Log user out
                logout('Security Notice: You have been automatically logged out after 15 minutes of inactivity to safeguard patient health records.');
            } else if (elapsed >= IDLE_WARNING_MS) {
                // Inside the final 60-second warning window
                setIsIdleWarningOpen(true);
                const secondsLeft = Math.max(1, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
                setRemainingSeconds(secondsLeft);
            } else {
                if (isIdleWarningOpen) {
                    setIsIdleWarningOpen(false);
                }
            }
        }, 1000);

        return () => {
            events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
            clearInterval(interval);
        };
    }, [user, isIdleWarningOpen, logout]);

    const login = async (credentials: authApi.LoginCredentials): Promise<authApi.LoginResponse> => {
        const result = await authApi.login(credentials);
        if (result.requires2FA) {
            return result;
        }
        if (result.access_token && result.user) {
            const now = Date.now();
            const sessionData: ActiveSession = {
                token: result.access_token,
                user: result.user,
                loginTime: now,
                lastActivityTime: now,
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            sessionStorage.setItem('token', result.access_token);
            localStorage.setItem('token', result.access_token);

            lastActivityRef.current = now;
            setUser(result.user);
            clearSessionNotice();
        }
        return result;
    };

    const verify2FA = async (email: string, code: string): Promise<authApi.LoginResponse> => {
        const result = await authApi.verify2FALogin(email, code);
        if (result.access_token && result.user) {
            const now = Date.now();
            const sessionData: ActiveSession = {
                token: result.access_token,
                user: result.user,
                loginTime: now,
                lastActivityTime: now,
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            sessionStorage.setItem('token', result.access_token);
            localStorage.setItem('token', result.access_token);

            lastActivityRef.current = now;
            setUser(result.user);
            clearSessionNotice();
        }
        return result;
    };

    const value: AuthContextType = {
        isAuthenticated: !!user,
        user,
        login,
        verify2FA,
        logout,
        extendSession,
        loading,
        sessionNotice,
        clearSessionNotice,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4 space-y-3">
                <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-300">Verifying Clinical Security Credential...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
            {/* HIPAA Automatic Logoff Inactivity Warning Modal */}
            <IdleTimeoutModal
                isOpen={isIdleWarningOpen}
                remainingSeconds={remainingSeconds}
                onExtendSession={extendSession}
                onLogout={() => logout('You signed out from the session timeout prompt.')}
                userEmail={user?.email}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

