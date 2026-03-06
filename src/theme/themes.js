import { lightPalette, darkPalette } from './palettes';
import { tokens } from './tokens';
import { PixelRatio, Dimensions, Platform } from 'react-native';

// ─── Responsive scaling ───────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 14 Pro base

export const scale = (size) =>
    Math.round((size * SCREEN_W) / BASE_WIDTH);

export const fontScale = (size) => {
    const ratio = PixelRatio.getFontScale();
    return Math.round(size * Math.min(ratio, 1.3));
};

export const isTablet = SCREEN_W >= 768;
export const isWeb = Platform.OS === 'web';

// ─── Typography Scale ─────────────────────────
const createTypography = () => ({
    fontRegular: Platform.select({ ios: 'SF Pro Text', android: 'Roboto', default: 'System' }),
    fontMedium: Platform.select({ ios: 'SF Pro Text', android: 'Roboto-Medium', default: 'System' }),
    fontSemiBold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Medium', default: 'System' }),
    fontBold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Bold', default: 'System' }),
    display: fontScale(isTablet ? 36 : 28),
    h1: fontScale(isTablet ? 28 : 22),
    h2: fontScale(isTablet ? 22 : 18),
    h3: fontScale(isTablet ? 20 : 16),
    bodyLg: fontScale(isTablet ? 18 : 15),
    body: fontScale(isTablet ? 16 : 14),
    bodySm: fontScale(isTablet ? 15 : 13),
    label: fontScale(isTablet ? 14 : 12),
    caption: fontScale(isTablet ? 13 : 11),
    amount: fontScale(isTablet ? 30 : 24),
    amountSm: fontScale(isTablet ? 20 : 16),
});

// ─── Spacing Scale ────────────────────────────
const createSpacing = () => ({
    xxs: scale(2), xs: scale(4), sm: scale(8),
    md: scale(12), base: scale(16), lg: scale(20),
    xl: scale(24), xxl: scale(32), xxxl: scale(48),
    huge: scale(64),
});

// ─── Radius Scale ─────────────────────────────
const radius = { ...tokens.radius };

// ─── Elevation ────────────────────────────────
const createElevation = (mode) => ({
    none: {},
    xs: {
        shadowColor: mode === 'light' ? '#6C63FF' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: mode === 'light' ? 0.08 : 0.4,
        shadowRadius: 4,
        elevation: 2,
    },
    sm: {
        shadowColor: mode === 'light' ? '#6C63FF' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: mode === 'light' ? 0.1 : 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    md: {
        shadowColor: mode === 'light' ? '#6C63FF' : '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: mode === 'light' ? 0.12 : 0.6,
        shadowRadius: 16,
        elevation: 8,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: mode === 'light' ? 0.15 : 0.7,
        shadowRadius: 24,
        elevation: 12,
    },
});

// ─── Theme Objects ────────────────────────────
export const lightTheme = {
    mode: 'light',
    colors: lightPalette,
    typography: createTypography(),
    spacing: createSpacing(),
    radius,
    elevation: createElevation('light'),
    screen: { width: SCREEN_W, height: SCREEN_H },
    isTablet,
    isWeb,
};

export const darkTheme = {
    mode: 'dark',
    colors: darkPalette,
    typography: createTypography(),
    spacing: createSpacing(),
    radius,
    elevation: createElevation('dark'),
    screen: { width: SCREEN_W, height: SCREEN_H },
    isTablet,
    isWeb,
};
