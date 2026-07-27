import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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


export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);
    const intervalRef = useRef(null);


    const isAuthenticated = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            return !!token;
        } catch {
            return false;
        }
    };

    const fetchNotifications = useCallback(async () => {
        try {
            // Skip if not logged in — prevents 401 spam
            if (!(await isAuthenticated())) {
                if (mountedRef.current) setLoading(false);
                return;
            }

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
            // Silently ignore auth errors (token expired, user logged out)
            if (error?.name === 'AuthError' || error?.statusCode === 401) {
                console.debug('[Notifications] Skipping fetch — not authenticated');
                return;
            }
            console.warn('[Notifications] Fetch failed:', error.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            if (!(await isAuthenticated())) return;

            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await markNotificationReadApi(id);
        } catch (error) {
            if (error?.name === 'AuthError' || error?.statusCode === 401) {
                console.debug('[Notifications] Skipping mark-read — not authenticated');
                return;
            }
            console.error('Failed to mark as read', error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            if (!(await isAuthenticated())) return;

            setNotifications([]);
            setUnreadCount(0);
            await markAllNotificationsReadApi();
        } catch (error) {
            if (error?.name === 'AuthError' || error?.statusCode === 401) {
                console.debug('[Notifications] Skipping mark-all-read — not authenticated');
                return;
            }
            console.error('Failed to mark all as read', error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const clearAll = useCallback(async () => {
        try {
            if (!(await isAuthenticated())) return;

            setNotifications([]);
            setUnreadCount(0);
            await clearAllNotificationsApi();
        } catch (error) {
            if (error?.name === 'AuthError' || error?.statusCode === 401) {
                console.debug('[Notifications] Skipping clear — not authenticated');
                return;
            }
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
