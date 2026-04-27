import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AlertProvider } from './src/context/AlertContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './src/context/SocketContext';

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
    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <ThemeProvider>
                    <SafeAreaProvider>
                        <AlertProvider>
                            <AppNavigator />
                        </AlertProvider>
                    </SafeAreaProvider>
                </ThemeProvider>
            </SocketProvider>
        </QueryClientProvider>
    );
}