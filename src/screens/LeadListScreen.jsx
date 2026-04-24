import React, { useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import { useLeadList, STATUS_MAP } from '../hooks/useLeadList';

// ── Tab Pill ──────────────────────────────────────────────────────
const TabPill = React.memo(({ label, count, active, onPress }) => {
    const { colors, radius, spacing } = useTheme();
    if (active) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.pillBase}>
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.pillGradient, { borderRadius: radius.full, paddingHorizontal: spacing.sm }]}
                >
                    <AppText variant="caption" style={styles.pillActiveText}>
                        {label} {count > 0 ? `(${count})` : ''}
                    </AppText>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.pillBase, { paddingHorizontal: spacing.sm }]}>
            <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '500' }}>
                {label} {count > 0 ? `(${count})` : ''}
            </AppText>
        </TouchableOpacity>
    );
});

// ── Progress Bar ──────────────────────────────────────────────────
const ProgressBar = React.memo(({ progress, color }) => {
    const { colors, radius } = useTheme();
    return (
        <View style={[styles.progressTrack, { backgroundColor: colors.border, borderRadius: radius.sm }]}>
            <LinearGradient
                colors={progress >= 100 ? ['#00C896', '#10B981'] : [color || '#6366F1', color ? `${color}CC` : '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, borderRadius: radius.sm }]}
            />
        </View>
    );
});

// ── Lead Card ─────────────────────────────────────────────────────
const LeadCard = React.memo(({ item, onPress }) => {
    const { colors, radius, spacing } = useTheme();

    const statusCode = item.statusCode || item.track_status || item.lead_status || 1;
    const mapped = STATUS_MAP[statusCode] || { label: 'Unknown', progress: 0, color: '#6B7280' };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.card,
                {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    shadowColor: colors.shadow,
                },
            ]}
        >
            {/* Top row: Name + Status Badge */}
            <View style={styles.cardTopRow}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                        {item.firstname || ''} {item.lastname || ''}
                    </AppText>
                    {item.loantype ? (
                        <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                            {item.loantype}
                        </AppText>
                    ) : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${mapped.color}18`, borderColor: `${mapped.color}40`, borderRadius: radius.full }]}>
                    <View style={[styles.statusDot, { backgroundColor: mapped.color }]} />
                    <AppText variant="caption" style={[styles.statusText, { color: mapped.color }]}>
                        {mapped.label}
                    </AppText>
                </View>
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: spacing.sm }}>
                <ProgressBar progress={mapped.progress} color={mapped.color} />
                <View style={styles.progressLabelRow}>
                    <AppText variant="caption" color="secondary">Progress</AppText>
                    <AppText variant="caption" style={{ color: mapped.color, fontWeight: '700' }}>
                        {mapped.progress}%
                    </AppText>
                </View>
            </View>

            {/* Bottom row: Phone + Date */}
            <View style={[styles.cardBottomRow, { borderTopColor: colors.divider, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
                {item.mobilenumber ? (
                    <View style={styles.infoChip}>
                        <Feather name="phone" size={11} color={colors.textSecondary} />
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                            {item.mobilenumber}
                        </AppText>
                    </View>
                ) : null}
                {item.createdon ? (
                    <View style={styles.infoChip}>
                        <Feather name="calendar" size={11} color={colors.textSecondary} />
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                            {new Date(item.createdon).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </AppText>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
});

// ── Main Screen ───────────────────────────────────────────────────
const LeadListScreen = ({ navigation }) => {
    const { colors, spacing } = useTheme();

    const {
        leads,
        loading,
        error,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        refresh,
        FILTER_TABS,
        tabCounts,
    } = useLeadList();

    const handleCardPress = useCallback((item) => {
        navigation.navigate('LeadDetail', { leadId: item.id });
    }, [navigation]);

    const renderItem = useCallback(({ item }) => (
        <LeadCard item={item} onPress={() => handleCardPress(item)} />
    ), [handleCardPress]);

    const keyExtractor = useCallback((item) => String(item.id), []);

    const ListHeader = (
        <View>
            {/* Status Tabs */}
            <View style={[styles.tabRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {FILTER_TABS.map((tab) => (
                    <TabPill
                        key={tab.id}
                        label={tab.label}
                        count={tabCounts[tab.id]}
                        active={activeTab === tab.id}
                        onPress={() => setActiveTab(tab.id)}
                    />
                ))}
            </View>

            <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
                <AppText variant="caption" color="secondary">
                    {leads.length} {leads.length === 1 ? 'lead' : 'leads'} found
                </AppText>
            </View>
        </View>
    );

    const ListEmpty = (
        <View style={styles.emptyState}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <>
                    <Feather name="inbox" size={48} color={colors.textSecondary} />
                    <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                        {error || 'No leads found'}
                    </AppText>
                </>
            )}
        </View>
    );

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={styles.root}>
            <GradientScreenHeader
                title="My Leads"
                subtitle="Track your lead progress"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search leads..."
            />

            <FlatList
                data={leads}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.primary]} />
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 50,
        borderWidth: 1,
    },
    pillBase: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    pillGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, width: '100%' },
    pillActiveText: { color: '#FFFFFF', fontWeight: '700' },
    card: {
        borderWidth: 1,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    statusText: { fontWeight: '700', fontSize: 11 },
    progressTrack: { height: 6, width: '100%' },
    progressFill: { height: 6 },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
    },
    infoChip: { flexDirection: 'row', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80 },
});

export default LeadListScreen;
