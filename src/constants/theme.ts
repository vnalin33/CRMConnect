export const COLORS = {
    primary: '#0066FF',
    primaryDark: '#0047B3',
    primaryLight: '#E5F0FF',

    secondary: '#FF9F0A',

    background: '#F8F9FA',
    surface: '#FFFFFF',

    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#32ADE6',

    border: '#E5E5EA',
    divider: '#C6C6C8',

    transparent: 'transparent',
    overlay: 'rgba(0,0,0,0.5)',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
};

export const TYPOGRAPHY = {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    h4: { fontSize: 18, fontWeight: '600' as const },
    body1: { fontSize: 16, fontWeight: '400' as const },
    body2: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
    label: { fontSize: 14, fontWeight: '500' as const },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5.46,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 7.49,
        elevation: 8,
    },
};
