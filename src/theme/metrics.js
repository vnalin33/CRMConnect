/**
 * metrics.js
 * CRM Connect — Responsive Scale System
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const SCREEN_W = W;
export const SCREEN_H = H;
export const IS_TABLET = W >= 768;
export const IS_WEB = Platform.OS === 'web';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

const BASE_W = 390;

export const scale = size => {
    if (IS_WEB || IS_TABLET) return size;
    return Math.round((size * W) / BASE_W);
};

export const fs = size => {
    const base = IS_TABLET ? size * 1.15 : IS_WEB ? size : scale(size);
    const ratio = PixelRatio.getFontScale();
    return Math.round(base * Math.min(ratio, 1.3));
};

export const spacing = {
    xxs: scale(2), xs: scale(4), sm: scale(8),
    md: scale(12), base: scale(16), lg: scale(20),
    xl: scale(24), xxl: scale(32), xxxl: scale(48),
    huge: scale(64),
};

export const radius = {
    none: 0, xs: scale(4), sm: scale(6), md: scale(8),
    lg: scale(12), xl: scale(16), xxl: scale(24), full: 9999,
};

export const MAX_CONTENT_WIDTH = IS_TABLET || IS_WEB ? 480 : W;

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
export const HIT_SLOP_LG = { top: 12, bottom: 12, left: 16, right: 16 };