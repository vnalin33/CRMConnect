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
// Concerns data will come from API; placeholder until integrated
const CONCERNS_DATA = [];
const CONCERN_FILTER_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved'];

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
            edges={['left', 'right']}
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

            {/* Coming Soon Placeholder */}
            <View style={styles.comingSoonContainer}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Feather name="tool" size={scale(48)} color={colors.primary} />
                </View>
                <AppText variant="h2" style={[styles.comingSoonTitle, { color: colors.textPrimary }]}>
                    Coming Soon!
                </AppText>
                <AppText variant="body" style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                    We are working hard to bring you a comprehensive issue management system. Stay tuned!
                </AppText>
            </View>

            {/* Gradient FAB — Raise Concern (Disabled for now) */}
            <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Raise a new concern"
                style={[styles.fabWrapper, { bottom: insets.bottom + spacing.lg, right: spacing.base, opacity: 0.6 }]}
            >
                <LinearGradient
                    colors={['#9CA3AF', '#6B7280']} // Grayed out gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
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
    comingSoonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(32),
        marginTop: scale(-40), // slight visual adjustment
    },
    iconCircle: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(24),
    },
    comingSoonTitle: {
        marginBottom: scale(12),
        textAlign: 'center',
    },
    comingSoonText: {
        textAlign: 'center',
        lineHeight: 24,
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


