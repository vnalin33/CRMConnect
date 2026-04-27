import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

/**
 * CheckListCard
 *
 * Reusable card for checklist items.
 * Matches Figma: light-blue tinted card with document icon + title.
 *
 * @param {string} title  – The document name (e.g. "Pan card")
 * @param {string} [icon] – MaterialCommunityIcons name (default: 'clipboard-text-outline')
 */
const CheckListCard = ({ title, icon = 'clipboard-text-outline' }) => {
    const { colors, spacing, radius, isDark } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: isDark ? colors.surfaceElevated : '#F5F9FF',
                    borderColor: isDark ? colors.border : '#E0E8FF',
                    borderRadius: radius.lg,
                    marginHorizontal: spacing.base,
                    marginBottom: spacing.sm,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.base,
                },
            ]}
        >
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: isDark ? `${colors.primary}20` : '#E8EEFF',
                        borderRadius: radius.md,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={25}
                    color={isDark ? colors.textBrand : '#3B5998'}
                />
            </View>

            <AppText
                variant="body"
                style={[styles.title, { color: colors.textPrimary }]}
                numberOfLines={2}
            >
                {title}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    iconContainer: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    title: {
        flex: 1,
        fontWeight: '500',
        fontSize: 15,
    },
});

export default CheckListCard;
