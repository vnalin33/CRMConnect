import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PAYOUT_DATA = [
    {
        id: '1',
        name: 'Manoj Kumar',
        loanType: 'Home Loan',
        loanAmount: '₹ 45.0L',
        cycle: 'Instant',
        payoutAmount: '₹ 67,500',
        payoutRaw: 67500,
        status: 'paid',
        date: 'Paid on 15 Jan 2025',
    },
    {
        id: '2',
        name: 'Sujith Singh Barnala',
        loanType: 'Business Loan',
        loanAmount: '₹ 20.0L',
        cycle: 'Cycle',
        payoutAmount: '₹ 35,000',
        payoutRaw: 35000,
        status: 'pending',
        date: 'Expected on 15 Jan 2025',
    },
    {
        id: '3',
        name: 'Priya Sharma',
        loanType: 'Car Loan',
        loanAmount: '₹ 10.0L',
        cycle: 'Instant',
        payoutAmount: '₹ 15,000',
        payoutRaw: 15000,
        status: 'paid',
        date: 'Paid on 10 Jan 2025',
    },
];

/** Format a number as ₹X,XX,XXX (Indian locale) */
const formatINR = (n) =>
    '₹' + n.toLocaleString('en-IN');

// ─── Sub-components ──────────────────────────────────────────────────────────

const TabPill = React.memo(({ label, active, onPress, style }) => {
    const { colors, radius, spacing } = useTheme();
    if (active) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.pillBase, style]}>
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.pillGradient, { borderRadius: radius.full, paddingHorizontal: spacing.base }]}
                >
                    <AppText variant="bodySm" style={styles.pillActiveText}>{label}</AppText>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.pillBase, style, { paddingHorizontal: spacing.base }]}>
            <AppText variant="bodySm" style={{ color: colors.textSecondary, fontWeight: '500' }}>{label}</AppText>
        </TouchableOpacity>
    );
});

const PayoutSummaryCard = React.memo(({ summary }) => {
    const { radius, spacing } = useTheme();
    return (
        <LinearGradient
            colors={BRAND_GRADIENT.colors}
            start={BRAND_GRADIENT.start}
            end={BRAND_GRADIENT.end}
            locations={BRAND_GRADIENT.locations}
            style={[styles.summaryCard, { borderRadius: radius.xl, padding: spacing.lg, marginHorizontal: spacing.base }]}
        >
            <View style={styles.summaryTopRow}>
                <Feather name="trending-up" size={16} color="rgba(255,255,255,0.9)" />
                <AppText variant="body" style={[styles.whiteText, { marginLeft: 6, fontWeight: '600' }]}>
                    Total Payout
                </AppText>
            </View>
            <AppText variant="display" style={[styles.whiteText, { fontWeight: '800', marginTop: 6 }]}>
                {summary.total}
            </AppText>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
            <View style={styles.summaryBottomRow}>
                <View style={styles.summaryCol}>
                    <View style={styles.summaryLabelRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <AppText variant="caption" style={[styles.whiteSubText, { marginLeft: 4 }]}>Paid Amount</AppText>
                    </View>
                    <AppText variant="amountSm" style={[styles.whiteText, { fontWeight: '700', marginTop: 2 }]}>
                        {summary.paidAmount}
                    </AppText>
                    <AppText variant="caption" style={styles.whiteSubText}>
                        {summary.paidCount} settlements
                    </AppText>
                </View>
                <View style={[styles.summaryVertDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
                <View style={styles.summaryCol}>
                    <View style={styles.summaryLabelRow}>
                        <MaterialCommunityIcons name="clock-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <AppText variant="caption" style={[styles.whiteSubText, { marginLeft: 4 }]}>Pending Amount</AppText>
                    </View>
                    <AppText variant="amountSm" style={[styles.whiteText, { fontWeight: '700', marginTop: 2 }]}>
                        {summary.pendingAmount}
                    </AppText>
                    <AppText variant="caption" style={styles.whiteSubText}>
                        {summary.pendingCount} Pending
                    </AppText>
                </View>
            </View>
        </LinearGradient>
    );
});

const PayoutItem = React.memo(({ item }) => {
    const { colors, radius, spacing } = useTheme();
    const isPaid = item.status === 'paid';
    return (
        <View style={[
            styles.payoutItem,
            {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.base,
                marginHorizontal: spacing.base,
                marginBottom: spacing.sm,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 3,
            },
        ]}>
            <View style={styles.itemTopRow}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <AppText variant="h3" style={{ color: colors.textBrand, fontWeight: '700' }}>{item.name}</AppText>
                    <AppText variant="bodySm" color="secondary" style={{ marginTop: 1 }}>{item.loanType}</AppText>
                </View>
                {isPaid ? (
                    <LinearGradient
                        colors={['rgba(0,200,150,0.15)', 'rgba(0,200,150,0.08)']}
                        style={[styles.statusBadge, { borderRadius: radius.full, borderColor: colors.success, borderWidth: 1 }]}
                    >
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.success} />
                        <AppText variant="caption" style={{ color: colors.success, fontWeight: '700', marginLeft: 4 }}>Paid</AppText>
                    </LinearGradient>
                ) : (
                    <LinearGradient
                        colors={['rgba(129,111,245,0.15)', 'rgba(129,111,245,0.08)']}
                        style={[styles.statusBadge, { borderRadius: radius.full, borderColor: colors.primary, borderWidth: 1 }]}
                    >
                        <MaterialCommunityIcons name="clock-outline" size={13} color={colors.primary} />
                        <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', marginLeft: 4 }}>Pending</AppText>
                    </LinearGradient>
                )}
            </View>
            <View style={[styles.itemAmountRow, { marginTop: spacing.sm, borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: spacing.sm }]}>
                <View>
                    <AppText variant="caption" color="secondary">Loan Amount</AppText>
                    <AppText variant="bodySm" style={{ color: colors.textPrimary, fontWeight: '600', marginTop: 2 }}>
                        {item.loanAmount} · {item.cycle}
                    </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="caption" color="secondary">Payout Amount</AppText>
                    <AppText variant="amountSm" style={{ color: colors.textBrand, fontWeight: '700', marginTop: 2 }}>
                        {item.payoutAmount}
                    </AppText>
                </View>
            </View>
            <View style={[styles.itemDateRow, { marginTop: spacing.xs }]}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>{item.date}</AppText>
            </View>
        </View>
    );
});

const CYCLE_TABS = [
    { id: 'instant', label: 'Instant' },
    { id: 'cycle', label: 'Cycle' },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
const PayoutScreen = ({ navigation }) => {
    const { colors, spacing } = useTheme();

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [cycleTab, setCycleTab] = useState('instant');

    const summary = useMemo(() => {
        const paid = PAYOUT_DATA.filter(i => i.status === 'paid');
        const pending = PAYOUT_DATA.filter(i => i.status === 'pending');
        const total = PAYOUT_DATA.reduce((acc, i) => acc + (i.payoutRaw || 0), 0);
        const paidSum = paid.reduce((acc, i) => acc + (i.payoutRaw || 0), 0);
        const pendingSum = pending.reduce((acc, i) => acc + (i.payoutRaw || 0), 0);
        return {
            total: formatINR(total),
            paidAmount: formatINR(paidSum),
            paidCount: paid.length,
            pendingAmount: formatINR(pendingSum),
            pendingCount: pending.length,
        };
    }, []);

    const statusTabs = useMemo(() => [
        { id: 'all', label: 'All' },
        { id: 'paid', label: `Paid (${summary.paidCount})` },
        { id: 'pending', label: `Pending (${summary.pendingCount})` },
    ], [summary.paidCount, summary.pendingCount]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return PAYOUT_DATA.filter(item => {
            const matchSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.loanType.toLowerCase().includes(q);
            const matchStatus = statusTab === 'all' || item.status === statusTab;
            const matchCycle = item.cycle.toLowerCase() === cycleTab.toLowerCase();
            return matchSearch && matchStatus && matchCycle;
        });
    }, [search, statusTab, cycleTab]);

    const handleStatusTab = useCallback((id) => setStatusTab(id), []);
    const handleCycleTab = useCallback((id) => setCycleTab(id), []);
    const renderItem = useCallback(({ item }) => <PayoutItem item={item} />, []);
    const keyExtractor = useCallback((item) => item.id, []);

    const ListHeader = useMemo(() => (
        <View>
            <View style={{ marginTop: spacing.base }}>
                <PayoutSummaryCard summary={summary} />
            </View>

            <View style={[styles.tabRow, { marginHorizontal: spacing.base, marginTop: spacing.base, backgroundColor: colors.surfaceElevated, borderRadius: 50, borderColor: colors.border, borderWidth: 1 }]}>
                {statusTabs.map(tab => (
                    <TabPill
                        key={tab.id}
                        label={tab.label}
                        active={statusTab === tab.id}
                        onPress={() => handleStatusTab(tab.id)}
                        style={styles.tabFlex}
                    />
                ))}
            </View>

            <View style={[styles.tabRow, { marginHorizontal: spacing.base, marginTop: spacing.sm, backgroundColor: colors.surfaceElevated, borderRadius: 50, borderColor: colors.border, borderWidth: 1 }]}>
                {CYCLE_TABS.map(tab => (
                    <TabPill
                        key={tab.id}
                        label={tab.label}
                        active={cycleTab === tab.id}
                        onPress={() => handleCycleTab(tab.id)}
                        style={styles.tabFlex}
                    />
                ))}
            </View>

            <View style={{ marginHorizontal: spacing.base, marginTop: spacing.base, marginBottom: spacing.sm }}>
                <AppText variant="caption" color="secondary">
                    {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                </AppText>
            </View>
        </View>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [summary, statusTab, cycleTab, statusTabs, filtered.length, colors, spacing]);

    const ListEmpty = useMemo(() => (
        <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={colors.textSecondary} />
            <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                No payouts found
            </AppText>
        </View>
    ), [colors.textSecondary, spacing.sm]);

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={{ backgroundColor: colors.background }}>
            <GradientScreenHeader
                title="Payouts"
                subtitle="Track your earnings & settlements"
                showBack
                navigation={navigation}
                searchable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search Payouts..."
            />

            <FlatList
                data={filtered}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            />
        </ScreenWrapper>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    summaryCard: {
        shadowColor: '#816FF5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    summaryTopRow: { flexDirection: 'row', alignItems: 'center' },
    summaryDivider: { height: 1, marginVertical: 14 },
    summaryBottomRow: { flexDirection: 'row' },
    summaryCol: { flex: 1 },
    summaryLabelRow: { flexDirection: 'row', alignItems: 'center' },
    summaryVertDivider: { width: 1, marginHorizontal: 16, alignSelf: 'stretch' },
    whiteText: { color: '#FFFFFF' },
    whiteSubText: { color: 'rgba(255,255,255,0.75)' },
    tabRow: { flexDirection: 'row', alignItems: 'center', padding: 4 },
    tabFlex: { flex: 1, alignItems: 'center', paddingVertical: 9 },
    pillBase: { alignItems: 'center', justifyContent: 'center' },
    pillGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 9, width: '100%' },
    pillActiveText: { color: '#FFFFFF', fontWeight: '700' },
    payoutItem: { borderWidth: 1 },
    itemTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
    itemAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    itemDateRow: { flexDirection: 'row', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 60 },
});

export default PayoutScreen;
