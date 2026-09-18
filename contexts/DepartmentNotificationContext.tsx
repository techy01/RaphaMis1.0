import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    InterDepartmentNotification,
    HospitalDepartment,
    NotificationPriority,
} from '../packages/shared/types';
import {
    getStoredNotifications,
    saveStoredNotifications,
} from '../api/notificationsApi';

interface DepartmentNotificationContextType {
    notifications: InterDepartmentNotification[];
    unreadCount: number;
    criticalCount: number;
    activeDepartmentFilter: HospitalDepartment | 'ALL';
    setActiveDepartmentFilter: (dept: HospitalDepartment | 'ALL') => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    activeToast: InterDepartmentNotification | null;
    dismissToast: () => void;
    dispatchHandoff: (
        payload: Omit<InterDepartmentNotification, 'id' | 'timestamp' | 'read'>
    ) => InterDepartmentNotification;
    playNotificationChime: (priority: NotificationPriority) => void;
    isHandoffModalOpen: boolean;
    openHandoffModal: () => void;
    closeHandoffModal: () => void;
}

const DepartmentNotificationContext = createContext<DepartmentNotificationContextType | undefined>(undefined);

export const DepartmentNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<InterDepartmentNotification[]>(() => getStoredNotifications());
    const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<HospitalDepartment | 'ALL'>('ALL');
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem('raphamis_notif_muted') === 'true';
        } catch {
            return false;
        }
    });
    const [activeToast, setActiveToast] = useState<InterDepartmentNotification | null>(null);
    const [isHandoffModalOpen, setIsHandoffModalOpen] = useState<boolean>(false);

    const playNotificationChime = useCallback((priority: NotificationPriority) => {
        if (isMuted) return;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const now = ctx.currentTime;

            if (priority === 'CRITICAL_STAT') {
                // High urgency 3-beep clinical monitor alert
                [0, 0.12, 0.24].forEach((offset) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now + offset);
                    gain.gain.setValueAtTime(0.14, now + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + offset);
                    osc.stop(now + offset + 0.1);
                });
            } else if (priority === 'DISCHARGE_CLEARANCE') {
                // Warm celebratory clinical chime
                const freqs = [523.25, 659.25, 783.99];
                freqs.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                    gain.gain.setValueAtTime(0.09, now + idx * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.1);
                    osc.stop(now + idx * 0.1 + 0.3);
                });
            } else {
                // Gentle hospital intercom two-tone chime
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(587.33, now); // D5
                gain1.gain.setValueAtTime(0.08, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.25);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, now + 0.14); // A5
                gain2.gain.setValueAtTime(0.08, now + 0.14);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.14);
                osc2.stop(now + 0.45);
            }
        } catch {
            // Audio policy fallback
        }
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('raphamis_notif_muted', String(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
            saveStoredNotifications(updated);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            saveStoredNotifications(updated);
            return updated;
        });
    };

    const dispatchHandoff = useCallback(
        (payload: Omit<InterDepartmentNotification, 'id' | 'timestamp' | 'read'>): InterDepartmentNotification => {
            const newNotif: InterDepartmentNotification = {
                ...payload,
                id: `notif_${Date.now()}`,
                timestamp: new Date().toISOString(),
                read: false,
            };

            setNotifications((prev) => {
                const updated = [newNotif, ...prev];
                saveStoredNotifications(updated);
                return updated;
            });

            // Trigger reactive sound and floating toast
            playNotificationChime(payload.priority);
            setActiveToast(newNotif);

            return newNotif;
        },
        [playNotificationChime]
    );

    // Auto-dismiss active toast after 6 seconds
    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => {
            setActiveToast(null);
        }, 6000);
        return () => clearTimeout(timer);
    }, [activeToast]);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const criticalCount = notifications.filter((n) => !n.read && n.priority === 'CRITICAL_STAT').length;

    return (
        <DepartmentNotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                criticalCount,
                activeDepartmentFilter,
                setActiveDepartmentFilter,
                markAsRead,
                markAllAsRead,
                isMuted,
                toggleMute,
                activeToast,
                dismissToast: () => setActiveToast(null),
                dispatchHandoff,
                playNotificationChime,
                isHandoffModalOpen,
                openHandoffModal: () => setIsHandoffModalOpen(true),
                closeHandoffModal: () => setIsHandoffModalOpen(false),
            }}
        >
            {children}
        </DepartmentNotificationContext.Provider>
    );
};

export const useDepartmentNotifications = (): DepartmentNotificationContextType => {
    const context = useContext(DepartmentNotificationContext);
    if (!context) {
        throw new Error('useDepartmentNotifications must be used within DepartmentNotificationProvider');
    }
    return context;
};
