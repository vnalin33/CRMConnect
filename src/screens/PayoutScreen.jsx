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
        loanAmount: '₹45,00,000',
        cycle: 'Instant',
        payoutAmount: '₹45,000',
        payoutRaw: 45000,
        status: 'paid',
        date: '12 Jan 2026',
        expectedPayoutDate: '15 Jan 2026',
    },
    {
        id: '2',
        name: 'Sujith Singh',
        loanType: 'Business Loan',
        loanAmount: '₹20,00,000',
        cycle: 'Cycle',
        payoutAmount: '₹30,000',
        payoutRaw: 30000,
        status: 'pending',
        date: '14 Feb 2026',
        expectedPayoutDate: '16 Feb 2026',
    },
    {
        id: '3',
        name: 'Harigaran',
        loanType: 'Personal Loan',
        loanAmount: '₹25,00,000',
        cycle: 'Instant',
        payoutAmount: '₹25,000',
        payoutRaw: 25000,
        status: 'pending',
        date: '20 Jan 2026',
        expectedPayoutDate: '22 Jan 2026',
    },
    {
        id: '4',
        name: 'Nalin',
        loanType: 'Property Loan',
        loanAmount: '₹30,00,000',
        cycle: 'Cycle',
        payoutAmount: '₹45,000',
        payoutRaw: 45000,
        status: 'paid',
        date: '25 Jan 2026',
        expectedPayoutDate: '28 Jan 2026',
    },
];

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
                <AppText variant="body" style={styles.summaryTitle}>
                    Total Payout
                </AppText>
            </View>
            <AppText variant="display" style={styles.summaryValue}>
                {summary.total}
            </AppText>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
            <View style={styles.summaryBottomRow}>
                <View style={styles.summaryCol}>
                    <View style={styles.summaryLabelRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <AppText variant="caption" style={styles.summarySubLabel}>Paid Amount</AppText>
                    </View>
                    <AppText variant="amountSm" style={styles.summaryAmount}>
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
                        <AppText variant="caption" style={styles.summarySubLabel}>Pending Amount</AppText>
                    </View>
                    <AppText variant="amountSm" style={styles.summaryAmount}>
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

const PayoutItem = React.memo(({ item, onRaiseInvoice }) => {
    const { colors, radius, spacing } = useTheme();
    const isPaid = item.status === 'paid';
    return (
        <View style={[
            styles.payoutItem,
            {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                borderRadius: radius.lg,
                shadowColor: colors.shadow,
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
                        style={[styles.statusBadge, { borderRadius: radius.full, borderColor: colors.success }]}
                    >
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.success} />
                        <AppText variant="caption" style={[styles.statusText, { color: colors.success }]}>Paid</AppText>
                    </LinearGradient>
                ) : (
                    <LinearGradient
                        colors={['rgba(129,111,245,0.15)', 'rgba(129,111,245,0.08)']}
                        style={[styles.statusBadge, { borderRadius: radius.full, borderColor: colors.primary }]}
                    >
                        <MaterialCommunityIcons name="clock-outline" size={13} color={colors.primary} />
                        <AppText variant="caption" style={[styles.statusText, { color: colors.primary }]}>Pending</AppText>
                    </LinearGradient>
                )}
            </View>
            <View style={[styles.itemAmountRow, { borderTopColor: colors.divider }]}>
                <View>
                    <AppText variant="caption" color="secondary">Loan Amount</AppText>
                    <AppText variant="bodySm" style={[styles.itemDetailText, { color: colors.textPrimary }]}>
                        {item.loanAmount} · {item.cycle}
                    </AppText>
                </View>
                <View style={styles.alignEnd}>
                    <AppText variant="caption" color="secondary">Payout Amount</AppText>
                    <AppText variant="amountSm" style={[styles.itemAmountText, { color: colors.textBrand }]}>
                        {item.payoutAmount}
                    </AppText>
                </View>
            </View>
            <View style={[styles.itemDateRow, { marginTop: spacing.xs }]}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>{item.date}</AppText>
            </View>

            {!isPaid && onRaiseInvoice && (
                <View style={{ marginTop: spacing.md }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onRaiseInvoice(item)}
                        style={styles.raiseInvoiceBox}
                    >
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={[styles.raiseInvoiceButton, { borderRadius: radius.md }]}
                        >
                            <Feather name="file-text" size={14} color="#FFF" style={{ marginRight: 6 }} />
                            <AppText variant="button" style={{ color: '#FFF', fontWeight: '700' }}>
                                Raise Invoice
                            </AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
});

const CYCLE_TABS = [
    { id: 'instant', label: 'Instant' },
    { id: 'cycle', label: 'Cycle' },
];

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
        { id: 'paid', label: `Paid(${summary.paidCount})` },
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

    const handleRaiseInvoice = useCallback((item) => {
        navigation.navigate('RaiseInvoice', { payoutData: item });
    }, [navigation]);

    const renderItem = useCallback(({ item }) => (
        <PayoutItem item={item} onRaiseInvoice={handleRaiseInvoice} />
    ), [handleRaiseInvoice]);

    const keyExtractor = useCallback((item) => item.id, []);

    const ListHeader = useMemo(() => (
        <View>
            <View style={styles.summaryWrapper}>
                <PayoutSummaryCard summary={summary} />
            </View>

            {/* Status tabs */}
            <View style={[styles.statusTabRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
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

            {/* Cycle tabs */}
            <View style={[styles.cycleTabRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
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

            <View style={styles.recordsCountRow}>
                <AppText variant="caption" color="secondary">
                    {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                </AppText>
            </View>
        </View>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [summary, statusTab, cycleTab, statusTabs, filtered.length, colors]);

    const ListEmpty = useMemo(() => (
        <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={colors.textSecondary} />
            <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                No payouts found
            </AppText>
        </View>
    ), [colors.textSecondary, spacing.sm]);

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={styles.root}>
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

const styles = StyleSheet.create({
    root: { flex: 1 },
    summaryCard: {
        shadowColor: '#816FF5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    summaryTopRow: { flexDirection: 'row', alignItems: 'center' },
    summaryTitle: { color: '#FFFFFF', marginLeft: 6, fontWeight: '600' },
    summaryValue: { color: '#FFFFFF', fontWeight: '800', marginTop: 6 },
    summaryDivider: { height: 1, marginVertical: 14 },
    summaryBottomRow: { flexDirection: 'row' },
    summaryCol: { flex: 1 },
    summaryLabelRow: { flexDirection: 'row', alignItems: 'center' },
    summarySubLabel: { color: 'rgba(255,255,255,0.75)', marginLeft: 4 },
    summaryAmount: { color: '#FFFFFF', fontWeight: '700', marginTop: 2 },
    summaryVertDivider: { width: 1, marginHorizontal: 16, alignSelf: 'stretch' },
    summaryWrapper: { marginTop: 16 },
    whiteSubText: { color: 'rgba(255,255,255,0.75)' },
    statusTabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 50,
        borderWidth: 1,
    },
    cycleTabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 50,
        borderWidth: 1,
    },
    recordsCountRow: { marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
    tabFlex: { flex: 1, alignItems: 'center', paddingVertical: 9 },
    pillBase: { alignItems: 'center', justifyContent: 'center' },
    pillGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 9, width: '100%' },
    pillActiveText: { color: '#FFFFFF', fontWeight: '700' },
    payoutItem: {
        borderWidth: 1,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    itemTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
    statusText: { fontWeight: '700', marginLeft: 4 },
    itemAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 12,
        borderTopWidth: 1,
        paddingTop: 12,
    },
    itemDetailText: { fontWeight: '600', marginTop: 2 },
    itemAmountText: { fontWeight: '700', marginTop: 2 },
    alignEnd: { alignItems: 'flex-end' },
    itemDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    raiseInvoiceBox: { overflow: 'hidden' },
    raiseInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16
    },
});

export default PayoutScreen;
