import React, { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AlertProvider } from './src/context/AlertContext';
import { ToastProvider } from './src/context/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './src/context/SocketContext';
import { NotificationProvider } from './src/context/NotificationContext';
import notificationService from './src/services/NotificationService';

// Create a single client instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 1 minute before being considered stale
            staleTime: 60 * 1000, 
            retry: 1,
            // Re-fetch when coming back to the app
            refetchOnWindowFocus: true,
        },
    },
});

export default function App() {
    console.log('App component rendering');

    // Request notification permission immediately on first launch (Android 13+)
    useEffect(() => {
        const requestNotificationPermission = async () => {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                        {
                            title: 'CRMConnect Notifications',
                            message:
                                'CRMConnect needs notification access to alert you about invoice approvals, payouts, and withdrawal updates.',
                            buttonPositive: 'Allow',
                            buttonNegative: 'Deny',
                        }
                    );
                    console.log('[Permissions] POST_NOTIFICATIONS:', granted);
                } catch (err) {
                    console.warn('[Permissions] Error:', err);
                }
            }

            // Initialize push notification service after permission is granted/denied
            notificationService.initialize();
        };

        requestNotificationPermission();
        return () => notificationService.destroy();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <ThemeProvider>
                    <SafeAreaProvider>
                        <ToastProvider>
                            <AlertProvider>
                                <NotificationProvider>
                                    <AppNavigator />
                                </NotificationProvider>
                            </AlertProvider>
                        </ToastProvider>
                    </SafeAreaProvider>
                </ThemeProvider>
            </SocketProvider>
        </QueryClientProvider>
    );
}
