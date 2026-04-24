import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

const FilterChips = ({
    activeFilter,
    onFilterChange,
    filters = ['All', 'Unassigned', 'Assigned', 'Following', 'Approved', 'Reject', 'No Response', 'Not Exist/Out of Service', 'Doc Collection', 'File Login', 'Sanction', 'Disbursement']
}) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.base }]}
            >
                {filters.map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => onFilterChange(filter)}
                            activeOpacity={0.7}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isActive ? colors.pillActiveBg : (colors.surfaceElevated || colors.background),
                                    borderRadius: radius.xl,
                                    marginRight: spacing.sm,
                                    borderColor: isActive ? colors.primary : colors.border,
                                    borderWidth: 1,
                                    // Subtle shadow for industrial look
                                    elevation: isActive ? 2 : 0,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isActive ? 0.2 : 0,
                                    shadowRadius: 2,
                                }
                            ]}
                        >
                            <AppText
                                variant="caption"
                                color={isActive ? 'inverse' : 'secondary'}
                                style={{
                                    fontWeight: isActive ? '700' : '500',
                                    letterSpacing: 0.3
                                }}
                            >
                                {filter}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    scrollContent: {
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FilterChips;
