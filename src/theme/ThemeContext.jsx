import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';
import { spacing, radius } from './metrics';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('light'); // Changed to 'light' to always show light theme by default

    const isDark = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    const colors = isDark ? darkColors : lightColors;

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = {
        colors,
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
        spacing,
        radius,
    };

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
