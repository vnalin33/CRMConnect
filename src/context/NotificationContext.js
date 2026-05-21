import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AppState } from 'react-native';
import {
    getNotificationsApi,
    markNotificationReadApi,
    markAllNotificationsReadApi,
    clearAllNotificationsApi
} from '../api/notificationApi';

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    loading: true,
    refresh: () => {},
    markAsRead: () => {},
    markAllAsRead: () => {},
    clearAll: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

/**
 * Global notification provider — single source of truth for bell badge + notification list.
 * Auto-refreshes on mount, app foreground, and every 60 seconds.
 */
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await getNotificationsApi();
            if (!mountedRef.current) return;

            if (response && response.success) {
                setNotifications(response.data || []);
                setUnreadCount(response.unreadCount || 0);
            } else if (response && Array.isArray(response.data)) {
                setNotifications(response.data || []);
                setUnreadCount(response.unreadCount || 0);
            }
        } catch (error) {
            console.warn('[Notifications] Fetch failed:', error.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await markNotificationReadApi(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            setNotifications([]);
            setUnreadCount(0);
            await markAllNotificationsReadApi();
        } catch (error) {
            console.error('Failed to mark all as read', error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const clearAll = useCallback(async () => {
        try {
            setNotifications([]);
            setUnreadCount(0);
            await clearAllNotificationsApi();
        } catch (error) {
            console.error('Failed to clear notifications', error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    // Fetch on mount + auto-poll every 60 seconds
    useEffect(() => {
        mountedRef.current = true;
        fetchNotifications();

        intervalRef.current = setInterval(fetchNotifications, 60000);

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications]);

    // Refresh when app comes back to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active' && mountedRef.current) {
                fetchNotifications();
            }
        });
        return () => subscription?.remove();
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refresh: fetchNotifications,
            markAsRead,
            markAllAsRead,
            clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
