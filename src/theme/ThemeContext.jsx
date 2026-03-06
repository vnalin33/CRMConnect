import React, { createContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './themes';

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system');

    const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
