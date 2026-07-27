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

    // Request only necessary permissions on first launch
    useEffect(() => {
        const requestAppPermissions = async () => {
            if (Platform.OS === 'android') {
                try {
                    // ── 1. Notifications (Android 13+) ──────────────────────────────
                    if (Platform.Version >= 33) {
                        await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                            {
                                title: 'Allow Notifications',
                                message:
                                    'ONEBind sends alerts for invoice approvals, payout updates, and lead status changes. Allow notifications to stay informed.',
                                buttonPositive: 'Allow',
                                buttonNegative: 'Skip',
                            }
                        );
                    }

                    // ── 2. Storage – for saving invoice PDFs (Android ≤ 12 only) ───
                    // Android 13+ uses scoped storage — no WRITE_EXTERNAL_STORAGE needed
                    if (Platform.Version < 33) {
                        await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                            {
                                title: 'Allow Storage Access',
                                message:
                                    'ONEBind needs storage access to save invoice PDFs to your device for offline viewing and sharing.',
                                buttonPositive: 'Allow',
                                buttonNegative: 'Skip',
                            }
                        );
                    }
                } catch (err) {
                    console.warn('[Permissions] Error requesting permissions:', err);
                }
            }

            // Initialize push notification service after permissions resolved
            notificationService.initialize();
        };

        requestAppPermissions();
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
