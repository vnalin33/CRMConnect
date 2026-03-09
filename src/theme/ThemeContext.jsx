import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './colors';
import { spacing, radius } from './metrics';

const THEME_STORAGE_KEY = '@crm_theme_mode';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState('dark');
    const [isReady, setIsReady] = useState(false);

    // Restore persisted theme on mount
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY)
            .then(saved => {
                if (saved === 'light' || saved === 'dark' || saved === 'system') {
                    setThemeModeState(saved);
                }
            })
            .catch(() => { })
            .finally(() => setIsReady(true));
    }, []);

    // Persist whenever theme changes
    const setThemeMode = useCallback(mode => {
        setThemeModeState(mode);
        AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => { });
    }, []);

    const isDark = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    const colors = isDark ? darkColors : lightColors;

    const toggleTheme = useCallback(() => {
        setThemeMode(isDark ? 'light' : 'dark');
    }, [isDark, setThemeMode]);

    const value = {
        colors,
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
        spacing,
        radius,
    };

    // Don't render until theme is restored so we avoid a flash
    if (!isReady) return null;

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used inside ThemeProvider');
    return context;
};

export default ThemeContext;
