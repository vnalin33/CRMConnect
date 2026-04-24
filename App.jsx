import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
    console.log('App component rendering');
    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <AppNavigator />
            </SafeAreaProvider>
        </ThemeProvider>
    );
}