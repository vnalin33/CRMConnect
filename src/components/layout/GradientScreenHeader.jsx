import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from '../common/AppText';

/**
 * GradientScreenHeader
 *
 * Design:
 *   ┌──────────────────────────────────────────┐  ← GRADIENT (status bar area)
 *   │  [status bar icons from OS]              │
 *   ├──────────────────────────────────────────┤  ← SURFACE BAR (if title given)
 *   │  ← back   Title / Subtitle   [right]     │
 *   └──────────────────────────────────────────┘
 *
 * For HomeScreen (no title, children only): the gradient is tall and contains
 * children (DashboardHeader) — no surface bar is rendered.
 *
 * Props:
 *  - title        {string}   Centered title on the surface bar
 *  - subtitle     {string?}  Optional subtitle below title
 *  - showBack     {bool}     Show ← arrow (calls navigation.goBack)
 *  - navigation   {object}   Required when showBack=true
 *  - rightElement {node}     Element on the right side of the surface bar
 *  - children     {node}     Content rendered INSIDE the gradient (e.g. DashboardHeader)
 *  - gradientStyle{style}    Extra style on the gradient (for large gradient variant)
 */
const GradientScreenHeader = ({
    title,
    subtitle,
    showBack = false,
    navigation,
    rightElement,
    children,
    gradientStyle,
}) => {
    const { colors, spacing, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // In dark mode render a solid dark strip instead of the gradient
    const GradientOrDark = isDark ? View : LinearGradient;
    const gradientProps = isDark
        ? { style: [{ paddingTop: insets.top, backgroundColor: colors.background }, gradientStyle] }
        : {
            colors: BRAND_GRADIENT.colors,
            start: BRAND_GRADIENT.start,
            end: BRAND_GRADIENT.end,
            locations: BRAND_GRADIENT.locations,
            style: [{ paddingTop: insets.top }, gradientStyle],
          };

    return (
        <View>
            {/* ── Gradient strip (covers status bar inset + any extra via gradientStyle) ── */}
            <GradientOrDark {...gradientProps}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />
                {/* Optional inner content (e.g. DashboardHeader for HomeScreen) */}
                {children}
            </GradientOrDark>

            {/* ── Surface bar — only rendered when a title is provided ── */}
            {title ? (
                <View
                    style={[
                        styles.surfaceBar,
                        {
                            backgroundColor: colors.surface,
                            paddingHorizontal: spacing.base,
                            borderBottomColor: colors.border,
                        },
                    ]}
                >
                    {/* Left — back button or placeholder */}
                    <View style={styles.side}>
                        {showBack ? (
                            <TouchableOpacity
                                onPress={() => navigation?.goBack()}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Feather
                                    name="arrow-left"
                                    size={22}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.sideSpace} />
                        )}
                    </View>

                    {/* Center */}
                    <View style={styles.center}>
                        <AppText
                            variant="h2"
                            style={[styles.title, { color: colors.textPrimary }]}
                            numberOfLines={1}
                        >
                            {title}
                        </AppText>
                        {subtitle ? (
                            <AppText
                                variant="caption"
                                style={{ color: colors.textSecondary, marginTop: 1, textAlign: 'center' }}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </AppText>
                        ) : null}
                    </View>

                    {/* Right */}
                    <View style={styles.side}>
                        {rightElement ?? <View style={styles.sideSpace} />}
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    surfaceBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    side: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideSpace: {
        width: 22,
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default GradientScreenHeader;
