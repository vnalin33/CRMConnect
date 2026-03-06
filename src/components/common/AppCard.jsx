import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const AppCard = ({
    children,
    style,
    variant = 'elevated',
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'outlined':
                return {
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    backgroundColor: COLORS.surface,
                };
            case 'flat':
                return {
                    backgroundColor: COLORS.background,
                };
            case 'elevated':
            default:
                return {
                    backgroundColor: COLORS.surface,
                    ...SHADOWS.small,
                };
        }
    };

    return (
        <View style={[styles.card, getVariantStyles(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginVertical: SPACING.xs,
    },
});
