import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export interface AppCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const AppCard: React.FC<AppCardProps> = ({
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
                    backgroundColor: COLORS.background, // Or a slightly darker shade if needed
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
