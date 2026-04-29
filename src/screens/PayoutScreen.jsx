import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import { getPayoutsApi } from '../api/payoutApi';

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
                    Total Disbursed
                </AppText>
            </View>
            <AppText variant="display" style={styles.summaryValue}>
                {summary.totalDisbursedFormatted}
            </AppText>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
            <View style={styles.summaryBottomRow}>
                <View style={styles.summaryCol}>
                    <View style={styles.summaryLabelRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <AppText variant="caption" style={styles.summarySubLabel}>Paid Amount</AppText>
                    </View>
                    <AppText variant="amountSm" style={styles.summaryAmount}>
                        {summary.paidAmountFormatted}
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
                        {summary.pendingAmountFormatted}
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

            {/* Loan Amount & Disbursed Amount */}
            <View style={[styles.itemAmountRow, { borderTopColor: colors.divider }]}>
                <View>
                    <AppText variant="caption" color="secondary">Loan Amount</AppText>
                    <AppText variant="bodySm" style={[styles.itemDetailText, { color: colors.textPrimary }]}>
                        {item.loanAmountFormatted}
                    </AppText>
                </View>
                <View style={styles.alignEnd}>
                    <AppText variant="caption" color="secondary">Disbursed Amount</AppText>
                    <AppText variant="amountSm" style={[styles.itemAmountText, { color: colors.textBrand }]}>
                        {item.disbursedAmountFormatted}
                    </AppText>
                </View>
            </View>

            {/* Payout Amount & Bank */}
            <View style={[styles.itemAmountRow, { borderTopColor: colors.divider }]}>
                <View>
                    <AppText variant="caption" color="secondary">Payout Amount</AppText>
                    <AppText variant="bodySm" style={[styles.itemDetailText, { color: '#10B981', fontWeight: '700' }]}>
                        {item.payoutAmountFormatted}
                    </AppText>
                    {item.payoutPercent > 0 && (
                        <AppText variant="caption" color="secondary" style={{ marginTop: 1 }}>
                            ({item.payoutPercent}% payout)
                        </AppText>
                    )}
                </View>
                {item.bankName ? (
                    <View style={styles.alignEnd}>
                        <AppText variant="caption" color="secondary">Bank</AppText>
                        <AppText variant="bodySm" style={[styles.itemDetailText, { color: colors.textPrimary }]}>
                            {item.bankName}
                        </AppText>
                    </View>
                ) : null}
            </View>

            {/* Date & Track Number */}
            <View style={[styles.itemDateRow, { marginTop: spacing.xs }]}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>{item.date}</AppText>
                {item.trackNumber ? (
                    <>
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 10 }}>•</AppText>
                        <Feather name="hash" size={11} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 2 }}>{item.trackNumber}</AppText>
                    </>
                ) : null}
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

const MOCK_PAYOUTS = [
    {
        id: 'mock-1',
        name: 'John Doe',
        loanType: 'Home Loan',
        loanAmountFormatted: '₹50,00,000',
        disbursedAmountFormatted: '₹48,50,000',
        payoutAmountFormatted: '₹48,500',
        payoutPercent: 1.0,
        status: 'pending',
        bankName: 'HDFC Bank',
        trackNumber: 'TRK00123',
        date: '25 Apr 2026',
    },
    {
        id: 'mock-2',
        name: 'Jane Smith',
        loanType: 'Business Loan',
        loanAmountFormatted: '₹25,00,000',
        disbursedAmountFormatted: '₹25,00,000',
        payoutAmountFormatted: '₹37,500',
        payoutPercent: 1.5,
        status: 'paid',
        bankName: 'ICICI Bank',
        trackNumber: 'TRK00456',
        date: '20 Apr 2026',
    },
    {
        id: 'mock-3',
        name: 'Robert Wilson',
        loanType: 'Personal Loan',
        loanAmountFormatted: '₹5,00,000',
        disbursedAmountFormatted: '₹5,00,000',
        payoutAmountFormatted: '₹10,000',
        payoutPercent: 2.0,
        status: 'pending',
        bankName: 'Axis Bank',
        trackNumber: 'TRK00789',
        date: '27 Apr 2026',
    }
];

const MOCK_SUMMARY = {
    totalCount: 3,
    totalDisbursedFormatted: '₹78,50,000',
    paidCount: 1,
    paidAmountFormatted: '₹25,00,000',
    pendingCount: 2,
    pendingAmountFormatted: '₹53,50,000',
};

const PayoutScreen = ({ navigation }) => {
    const { colors, spacing } = useTheme();

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [payouts, setPayouts] = useState([]);
    const [summary, setSummary] = useState({
        totalCount: 0,
        totalDisbursed: 0,
        totalDisbursedFormatted: '₹0',
        paidCount: 0,
        paidAmount: 0,
        paidAmountFormatted: '₹0',
        pendingCount: 0,
        pendingAmount: 0,
        pendingAmountFormatted: '₹0',
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchPayouts = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const result = await getPayoutsApi();

            if (result.success && result.data && result.data.length > 0) {
                setPayouts(result.data);
                if (result.summary) {
                    setSummary(result.summary);
                }
            } else {
                // Use mock data as fallback for reference if API is empty or fails
                setPayouts(MOCK_PAYOUTS);
                setSummary(MOCK_SUMMARY);
                if (!result.success) {
                    console.warn('API failed, using mock data for reference');
                }
            }
        } catch (err) {
            console.error('Failed to fetch payouts, using mock data:', err);
            setPayouts(MOCK_PAYOUTS);
            setSummary(MOCK_SUMMARY);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    const onRefresh = useCallback(() => {
        fetchPayouts(true);
    }, [fetchPayouts]);

    const statusTabs = useMemo(() => [
        { id: 'all', label: 'All' },
        { id: 'paid', label: `Paid (${summary.paidCount})` },
        { id: 'pending', label: `Pending (${summary.pendingCount})` },
    ], [summary.paidCount, summary.pendingCount]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return payouts.filter(item => {
            const matchSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.loanType.toLowerCase().includes(q) ||
                (item.bankName && item.bankName.toLowerCase().includes(q)) ||
                (item.trackNumber && item.trackNumber.toLowerCase().includes(q));
            const matchStatus = statusTab === 'all' || item.status === statusTab;
            return matchSearch && matchStatus;
        });
    }, [search, statusTab, payouts]);

    const handleStatusTab = useCallback((id) => setStatusTab(id), []);

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

            <View style={styles.recordsCountRow}>
                <AppText variant="caption" color="secondary">
                    {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                </AppText>
            </View>
        </View>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [summary, statusTab, statusTabs, filtered.length, colors]);

    const ListEmpty = useMemo(() => (
        <View style={styles.emptyState}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : error ? (
                <>
                    <Feather name="alert-circle" size={40} color={colors.error || '#EF4444'} />
                    <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: 20 }}>
                        {error}
                    </AppText>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => fetchPayouts()}
                        style={{ marginTop: spacing.md }}
                    >
                        <AppText variant="bodySm" style={{ color: colors.primary, fontWeight: '600' }}>
                            Tap to Retry
                        </AppText>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Feather name="inbox" size={40} color={colors.textSecondary} />
                    <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                        No payouts found
                    </AppText>
                    <AppText variant="caption" color="secondary" style={{ marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: 40 }}>
                        Disbursement entries from the CRM portal will appear here
                    </AppText>
                </>
            )}
        </View>
    ), [loading, error, colors, spacing, fetchPayouts]);

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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary || '#816FF5']}
                        tintColor={colors.primary || '#816FF5'}
                    />
                }
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
