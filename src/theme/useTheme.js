import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used inside ThemeProvider');
    const { theme, isDark, themeMode, setThemeMode, toggleTheme } = context;
    return {
        theme, isDark, themeMode, setThemeMode, toggleTheme,
        colors: theme.colors,
        typography: theme.typography,
        spacing: theme.spacing,
        radius: theme.radius,
        elevation: theme.elevation,
        isTablet: theme.isTablet,
        isWeb: theme.isWeb,
    };
};
