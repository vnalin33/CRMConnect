import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import WalletCard from '../components/dashboard/WalletCard';
import AppButton from '../components/common/AppButton';

// ── Mock Data ──
const MOCK_MONTHS = ['Feb 2026', 'Jan 2026', 'Dec 2025', 'Nov 2025', 'Oct 2025'];
const TRANSACTIONS = [
    { id: '1', type: 'credit', name: 'Manoj Kumar', description: 'Home Loan', amount: '+ ₹67,500', status: 'Credited' },
    { id: '2', type: 'debit', name: 'Amazon', description: 'Spent wallet Amount', amount: '- ₹15,000', status: 'Debited' },
    { id: '3', type: 'credit', name: 'Rahul', description: 'Personal Loan', amount: '+ ₹25,000', status: 'Credited' },
    { id: '4', type: 'debit', name: 'Nalin', description: 'Food Order', amount: '- ₹1,250', status: 'Debited' },
    { id: '5', type: 'credit', name: 'Sujith', description: 'Business Loan', amount: '+ ₹45,000', status: 'Credited' },
    { id: '6', type: 'debit', name: 'Umesh', description: 'Travel', amount: '- ₹450', status: 'Debited' },
];

const WalletScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('Feb 2026');
    const [showAll, setShowAll] = useState(false);

    const renderMonthSelector = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.monthScroll, { paddingHorizontal: spacing.base }]} style={{ marginVertical: spacing.lg }}>
            {MOCK_MONTHS.map(month => {
                const isActive = selectedMonth === month;
                return (
                    <TouchableOpacity
                        key={month}
                        onPress={() => setSelectedMonth(month)}
                        style={[
                            styles.monthPill,
                            {
                                backgroundColor: isActive ? colors.primary : colors.surface,
                                borderColor: isActive ? colors.primary : colors.primaryLight,
                                borderRadius: radius.full
                            }
                        ]}
                    >
                        <AppText variant="caption" style={{ color: isActive ? '#FFFFFF' : colors.primary, fontWeight: isActive ? '700' : '500' }}>
                            {month}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderSummaryCard = () => (
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderRadius: radius.xl, marginHorizontal: spacing.base, borderColor: colors.border }]}>
            <View style={[styles.summaryHeader, { borderBottomColor: colors.border }]}>
                <AppText variant="h6" style={{ color: colors.textPrimary }}>{selectedMonth} Summary</AppText>
                <View style={[styles.paymentBadge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
                    <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>8 Payments</AppText>
                </View>
            </View>
            <View style={styles.summaryBody}>
                {/* Credited Column */}
                <View style={styles.summaryColumn}>
                    <View style={styles.summaryTitleRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.successBg, borderRadius: radius.sm }]}>
                            <Feather name="arrow-down-left" size={14} color={colors.success} />
                        </View>
                        <AppText variant="caption" style={{ color: colors.textSecondary, marginLeft: 6 }}>Credited</AppText>
                    </View>
                    <AppText variant="h4" style={{ color: colors.success, marginTop: 8 }}>₹ 64,500.00</AppText>
                    <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 4 }}>6 Transactions</AppText>
                </View>

                {/* Vertical Divider */}
                <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

                {/* Withdrawn Column */}
                <View style={styles.summaryColumn}>
                    <View style={styles.summaryTitleRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.infoBg, borderRadius: radius.sm }]}>
                            <Feather name="arrow-up-right" size={14} color={colors.info} />
                        </View>
                        <AppText variant="caption" style={{ color: colors.textSecondary, marginLeft: 6 }}>Withdrawn</AppText>
                    </View>
                    <AppText variant="h4" style={{ color: colors.info, marginTop: 8 }}>₹ 15,000.00</AppText>
                    <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 4 }}>2 Transactions</AppText>
                </View>
            </View>
        </View>
    );

    const renderTransactions = () => (
        <View style={[styles.transactionsSection, { paddingHorizontal: spacing.base, marginTop: spacing.xl }]}>
            <View style={styles.txnHeaderRow}>
                <AppText variant="h6" style={{ color: colors.primary }}>Transactions</AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>{selectedMonth}</AppText>
            </View>

            <View style={styles.timelineRow}>
                <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>Today</AppText>
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                <AppText variant="caption" style={{ color: colors.textMuted }}>2 txn</AppText>
            </View>

            {TRANSACTIONS.slice(0, showAll ? TRANSACTIONS.length : 2).map(txn => {
                const isCredit = txn.type === 'credit';
                const statusColor = isCredit ? colors.success : colors.info;
                const statusBg = isCredit ? colors.successBg : colors.infoBg;

                return (
                    <View key={txn.id} style={[styles.txnItem, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border }]}>
                        <View style={[styles.txnIconWrap, { backgroundColor: statusBg, borderRadius: radius.md }]}>
                            <Feather name={isCredit ? "arrow-down-left" : "arrow-up-right"} size={16} color={statusColor} />
                        </View>

                        <View style={styles.txnDetails}>
                            <AppText variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>{txn.name}</AppText>
                            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>{txn.description}</AppText>
                        </View>

                        <View style={styles.txnAmounts}>
                            <AppText variant="body" style={{ color: statusColor, fontWeight: '600' }}>{txn.amount}</AppText>
                            <View style={[styles.txnBadge, { backgroundColor: statusBg, borderRadius: radius.sm }]}>
                                <AppText variant="caption" style={{ color: statusColor, fontSize: 10, fontWeight: '600' }}>{txn.status}</AppText>
                            </View>
                        </View>
                    </View>
                );
            })}

            <AppButton
                title={showAll ? "Show Less" : "View All Transactions"}
                onPress={() => setShowAll(!showAll)}
                variant="outline"
                size="md"
                rightIcon={<Feather name={showAll ? "chevron-up" : "arrow-right"} size={16} color={colors.primary} />}
                style={{ marginTop: spacing.base, marginBottom: spacing.base }}
            />
        </View>
    );

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={{ backgroundColor: colors.background }}>

            {/* The standard App gradient header with back/search logic */}
            <GradientScreenHeader
                title="My Wallet"
                subtitle="Track your earnings & settlements"
                showBack
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                navigation={navigation}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
            >
                {/* Dynamically overlay WalletCard overlapping slightly or standardly configured */}
                <View style={{ marginTop: spacing.md, overflow: 'visible' }}>
                    <WalletCard
                        balance="0.00"
                        accountNumber="XXXX XXXX XXXX 1234"
                        onWithdraw={() => { }}
                        onViewWallet={() => { }}
                        secondaryLabel="Spend Wallet"
                    />
                </View>

                {renderMonthSelector()}
                {renderSummaryCard()}
                {renderTransactions()}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    monthScroll: { alignItems: 'center' },
    monthPill: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, marginRight: 10 },
    summaryCard: { overflow: 'hidden', borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    paymentBadge: { paddingHorizontal: 12, paddingVertical: 4 },
    summaryBody: { flexDirection: 'row', paddingVertical: 20 },
    summaryColumn: { flex: 1, paddingHorizontal: 16 },
    verticalDivider: { width: 1 },
    summaryTitleRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { padding: 4 },
    transactionsSection: { flex: 1 },
    txnHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    timelineLine: { flex: 1, height: 1, marginHorizontal: 12 },
    txnItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    txnIconWrap: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txnDetails: { flex: 1 },
    txnAmounts: { alignItems: 'flex-end' },
    txnBadge: { paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
});

export default WalletScreen;
