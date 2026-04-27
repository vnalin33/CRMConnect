import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import { scale, fs } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FilterChips from '../components/status/FilterChips';
import ConcernCard from '../components/concerns/ConcernCard';
import { CONCERNS_DATA, CONCERN_FILTER_OPTIONS } from '../api/mockData';

// ─── Screen ──────────────────────────────────────────────────────────────────

const ConcernsScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredConcerns = useMemo(() => {
        let items = CONCERNS_DATA;

        // Filter by status
        if (activeFilter !== 'All') {
            items = items.filter(c => c.status === activeFilter);
        }

        // Filter by search
        const q = searchQuery.toLowerCase().trim();
        if (q) {
            items = items.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q),
            );
        }

        return items;
    }, [searchQuery, activeFilter]);

    const handleFilterChange = useCallback((filter) => {
        setActiveFilter(filter);
    }, []);

    const renderItem = useCallback(({ item }) => (
        <ConcernCard 
            concern={item} 
            onPress={() => navigation.navigate('ConcernDetails', { concern: item })} 
        />
    ), [navigation]);

    const keyExtractor = useCallback((item) => item.id, []);

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            {/* Fixed Top Bar */}
            <GradientScreenHeader
                title="Concerns"
                subtitle="Issue Management"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search concerns..."
            />

            {/* Filter Chips */}
            <View style={{ paddingTop: spacing.sm }}>
                <FilterChips
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    filters={CONCERN_FILTER_OPTIONS}
                />
            </View>

            {/* Concerns List */}
            <FlatList
                data={filteredConcerns}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + spacing.huge },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={scale(48)} color={colors.textDisabled} />
                        <AppText color="secondary" style={styles.emptyText}>
                            No concerns found
                        </AppText>
                    </View>
                }
            />

            {/* Gradient FAB — Raise Concern */}
            <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Raise a new concern"
                onPress={() => {}}
                style={[styles.fabWrapper, { bottom: insets.bottom + spacing.lg, right: spacing.base }]}
            >
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.fab, { borderRadius: radius.full }]}
                >
                    <Feather name="plus" size={scale(22)} color="#FFF" />
                    <AppText color="inverse" style={{ fontWeight: '700', fontSize: fs(13), marginLeft: scale(6) }}>
                        Raise Concern
                    </AppText>
                </LinearGradient>
            </TouchableOpacity>
        </ScreenWrapper>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    listContent: {
        paddingTop: scale(12),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: scale(60),
    },
    emptyText: {
        marginTop: scale(12),
    },
    fabWrapper: {
        position: 'absolute',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(3) },
        shadowOpacity: 0.2,
        shadowRadius: scale(6),
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(14),
    },
});

export default ConcernsScreen;
