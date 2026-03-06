import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import authReducer from './src/features/auth/store/authSlice';

// Create a query client for react-query
const queryClient = new QueryClient();

// Setup Redux store
const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

function App() {
    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <SafeAreaProvider>
                        <AppNavigator />
                    </SafeAreaProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ReduxProvider>
    );
}

export default App;
