import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

/**
 * AppCard
 * 
 * Variants:
 *  - elevated  (default) — white/dark surface with premium multi-layer shadow
 *  - outlined  — bordered card, no shadow
 *  - flat      — plain background, no shadow or border
 */
const AppCard = ({ children, style, variant = 'elevated' }) => {
    const { colors, spacing, radius, isDark } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'outlined':
                return {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'flat':
                return {
                    backgroundColor: colors.background,
                };
            case 'elevated':
            default:
                return {
                    backgroundColor: colors.surface,
                    // iOS multi-layer shadow for depth
                    shadowColor: isDark ? '#000000' : '#8090B8',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.55 : 0.13,
                    shadowRadius: 12,
                    // Android elevation
                    elevation: isDark ? 6 : 4,
                };
        }
    };

    return (
        <View style={[
            styles.card,
            { borderRadius: radius.lg, padding: spacing.md },
            getVariantStyles(),
            style,
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        overflow: 'visible', // allow shadow to show on Android via elevation
    },
});

export default AppCard;
