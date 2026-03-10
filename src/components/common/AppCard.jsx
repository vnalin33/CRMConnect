import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

const AppCard = ({ children, style, variant = 'elevated' }) => {
    const { colors, spacing, radius } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'outlined':
                return { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface };
            case 'flat':
                return { backgroundColor: colors.background };
            case 'elevated':
            default:
                return {
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 2,
                };
        }
    };

    return (
        <View style={[styles.card, { borderRadius: radius.lg, padding: spacing.md }, getVariantStyles(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
    },
});

export default AppCard;
