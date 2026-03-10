/**
 * colors.js
 * CRM Connect — Color System
 * Semantic tokens for light & dark themes.
 * Never use raw hex in components — always reference these tokens via useTheme().
 */

// ── Brand Gradients ─────────────────────────────
export const BRAND_GRADIENT = {
    colors: ['#816FF5', '#6395EC', '#2DBFE6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
};

export const BRAND_GRADIENT_DIAGONAL = {
    colors: ['#816FF5', '#6395EC', '#2DBFE6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
};

export const BRAND_GRADIENT_VERTICAL = {
    colors: ['#816FF5', '#6395EC', '#2DBFE6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
};

// ── Wallet Card Gradients (theme-specific) ──────
export const WALLET_GRADIENT_LIGHT = ['rgba(112,82,230,0.92)', 'rgba(76,118,226,0.88)', 'rgba(38,168,214,0.84)'];
export const WALLET_GRADIENT_DARK = ['rgba(20,28,72,0.99)', 'rgba(16,24,66,0.97)', 'rgba(12,20,58,0.96)'];

// ── LIGHT THEME ─────────────────────────────────
export const lightColors = {
    // Backgrounds
    background: '#D5E1EF',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F5FB',
    cardBg: '#FFFFFF',

    // Inputs
    inputBg: '#FFFFFF',
    inputBorder: '#D5E1EE',
    inputBorderFocus: '#816FF5',

    // Brand
    primary: '#6855F0',
    primaryLight: '#EDEAFF',
    textPrimary: '#141828',
    textSecondary: '#6B7280',
    textDisabled: '#B0BAC9',
    textPlaceholder: '#A0A8C0',
    textLink: '#6855F0',
    textInverse: '#FFFFFF',
    textBrand: '#816FF5',
    textMuted: '#9CA6B8',

    // Status colors
    success: '#00C896',
    successBg: '#E0FAF3',
    successText: '#065F46',
    warning: '#F59E0B',
    warningBg: '#FEF3CD',
    warningText: '#92400E',
    error: '#F44336',
    errorBg: 'rgba(244,67,54,0.08)',
    errorBorder: '#F44336',
    errorText: '#D32F2F',
    info: '#6855F0',
    infoBg: '#EDEAFF',
    cyan: '#2DBFE6',
    cyanBg: '#E0F7FA',

    // Borders & dividers
    border: '#DAE5F0',
    divider: '#E8F0F8',

    // Icons
    iconColor: '#9CA3AF',

    // Shadows
    shadow: 'rgba(80,100,180,0.10)',
    overlay: 'rgba(0,0,0,0.5)',

    // Tab bar
    tabBg: '#FFFFFF',
    tabBorder: '#E8F0F8',
    tabActive: '#6855F0',
    tabInactive: '#9CA3AF',

    // Snapshot cards
    snapshotCardBg: '#FFFFFF',
    snapshotCardBorder: '#E4EDF7',
    snapshotCountColor: '#141828',
    snapshotLabelColor: '#6B7280',

    // Search bar
    searchBg: '#FFFFFF',
    searchBorder: '#DAE5F0',

    // Payout card
    payoutCardBg: '#FFFFFF',
    payoutBorder: '#E4EDF7',

    // Performance card
    perfCardBg: '#FFFFFF',
    perfBorder: '#E4EDF7',

    // Pill / badge
    pillBg: '#F0F0F8',
    pillActiveBg: '#6855F0',
    pillActiveText: '#FFFFFF',
    pillText: '#6B7280',

    // Status badge
    scheduledBg: '#E0FAF3',
    scheduledText: '#00C896',

    // StatusBar
    statusBarStyle: 'dark-content',
};

// ── DARK THEME ──────────────────────────────────
export const darkColors = {
    // Backgrounds
    background: '#0C0E1A',
    surface: '#141928',
    surfaceElevated: '#192036',
    cardBg: '#141928',

    // Inputs
    inputBg: '#16203A',
    inputBorder: '#202840',
    inputBorderFocus: '#816FF5',

    // Brand
    primary: '#7B72FF',
    primaryLight: '#1E1A4B',
    textPrimary: '#ECF0FA',
    textSecondary: '#8892B0',
    textDisabled: '#3D4860',
    textPlaceholder: '#475569',
    textLink: '#818CF8',
    textInverse: '#0C0E1A',
    textBrand: '#9D8FFF',
    textMuted: '#58637E',

    // Status colors
    success: '#34D399',
    successBg: '#073326',
    successText: '#6EE7B7',
    warning: '#FBBF24',
    warningBg: '#3A1C02',
    warningText: '#FDE68A',
    error: '#F87171',
    errorBg: 'rgba(248,113,113,0.12)',
    errorBorder: '#F87171',
    errorText: '#FCA5A5',
    info: '#818CF8',
    infoBg: '#1E1A4B',
    cyan: '#22D3EE',
    cyanBg: '#0E3044',

    // Borders & dividers
    border: '#202840',
    divider: '#192036',

    // Icons
    iconColor: '#3D4860',

    // Shadows
    shadow: 'rgba(0,0,0,0.65)',
    overlay: 'rgba(0,0,0,0.75)',

    // Tab bar
    tabBg: '#141928',
    tabBorder: '#192036',
    tabActive: '#7B72FF',
    tabInactive: '#3D4860',

    // Snapshot cards
    snapshotCardBg: '#192036',
    snapshotCardBorder: '#202840',
    snapshotCountColor: '#ECF0FA',
    snapshotLabelColor: 'rgba(236,240,250,0.58)',

    // Search bar
    searchBg: '#16203A',
    searchBorder: '#202840',

    // Payout card
    payoutCardBg: '#141928',
    payoutBorder: '#202840',

    // Performance card
    perfCardBg: '#141928',
    perfBorder: '#202840',

    // Pill / badge
    pillBg: '#1E2440',
    pillActiveBg: '#7B72FF',
    pillActiveText: '#FFFFFF',
    pillText: '#8892B0',

    // Status badge
    scheduledBg: '#073326',
    scheduledText: '#34D399',

    // StatusBar
    statusBarStyle: 'light-content',
};