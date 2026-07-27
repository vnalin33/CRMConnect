import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import WalletCard from '../components/dashboard/WalletCard';
import AppButton from '../components/common/AppButton';
import { useProfile } from '../hooks/useProfile';
import useWalletData from '../hooks/useWalletData';
import AppInput from '../components/common/AppInput';
import { submitWithdrawalRequest } from '../api/withdrawalApi';
import { useToast } from '../context/ToastContext';

// Mask account number for privacy
const maskAccount = (acc) => {
    if (!acc || acc.length < 4) return acc || '';
    return `XXXX XXXX ${acc.slice(-4)}`;
};

// Generate month labels from account creation date to current month (continuous)
const getMonthsFromData = (payouts, withdrawals = [], accountCreatedDate) => {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    let startDate;
    if (accountCreatedDate) {
        startDate = new Date(accountCreatedDate);
        if (isNaN(startDate.getTime())) {
            startDate = null;
        }
    }

    // If we have account creation date, generate continuous months
    if (startDate) {
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const totalMonths = (nowYear - startYear) * 12 + (nowMonth - startMonth) + 1;

        const months = [];
        for (let i = 0; i < totalMonths; i++) {
            const d = new Date(nowYear, nowMonth - i, 1);
            months.push(`${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`);
        }
        return months.length > 0 ? months : [formatCurrentMonth()];
    }

    // Fallback: generate from data only
    const monthSet = new Set();
    monthSet.add(`${now.toLocaleString('en-IN', { month: 'short' })} ${now.getFullYear()}`);

    const extractMonth = (dateString) => {
        if (!dateString) return;
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            monthSet.add(`${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`);
        }
    };

    payouts.forEach(p => extractMonth(p.dateRaw));
    withdrawals.forEach(w => extractMonth(w.request_date));

    const months = Array.from(monthSet).sort((a, b) => {
        const da = new Date(`01 ${a}`);
        const db = new Date(`01 ${b}`);
        return db - da;
    });

    return months.length > 0 ? months : [formatCurrentMonth()];
};

const formatCurrentMonth = () => {
    const now = new Date();
    return `${now.toLocaleString('en-IN', { month: 'short' })} ${now.getFullYear()}`;
};

const formatAmount = (num) => {
    const val = parseFloat(num) || 0;
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const WalletScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const { profileData } = useProfile();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(formatCurrentMonth());
    const [showAll, setShowAll] = useState(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);

    // Use shared wallet data hook (same cache as HomeScreen)
    const { 
        payouts, 
        withdrawals, 
        loading, 
        formattedBalance, 
        walletBalance,
        refresh 
    } = useWalletData();

    const bankAccount = profileData?.bankDetails?.account;

    // Generate dynamic month list
    const months = useMemo(() => getMonthsFromData(payouts, withdrawals, profileData?.accountCreatedDate), [payouts, withdrawals, profileData?.accountCreatedDate]);

    // Filter payouts by selected month
    const filteredPayouts = useMemo(() => {
        return payouts.filter(p => {
            if (!p.dateRaw) return false;
            const d = new Date(p.dateRaw);
            if (isNaN(d.getTime())) return false;
            const label = `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
            return label === selectedMonth;
        });
    }, [payouts, selectedMonth]);

    // Build transactions from real payout data and withdrawal history
    const transactions = useMemo(() => {
        const txns = filteredPayouts.map(p => ({
            id: `p_${p.id}`,
            type: 'credit',
            name: p.name || 'Unknown',
            description: p.loanType || 'Loan',
            amount: `+ ${p.payoutAmountFormatted || formatAmount(p.payoutAmount)}`,
            rawAmount: p.payoutAmount || 0,
            status: p.status === 'paid' ? 'Credited' : 'Pending',
            date: p.date || '',
            dateRaw: p.dateRaw ? new Date(p.dateRaw).getTime() : 0,
        }));

        const filteredWithdrawals = withdrawals.filter(w => {
            if (!w.request_date) return false;
            const d = new Date(w.request_date);
            if (isNaN(d.getTime())) return false;
            return `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}` === selectedMonth;
        });

        const withdrawalTxns = filteredWithdrawals.map(w => {
            let statusText = 'Pending';
            if (w.status === 'approved') statusText = 'Approved';
            if (w.status === 'paid') statusText = 'Completed';
            if (w.status === 'rejected') statusText = 'Rejected';

            const d = new Date(w.request_date);
            const dateStr = !isNaN(d.getTime()) ? `${d.getDate()} ${d.toLocaleString('en-IN', { month: 'short' })}` : '';

            return {
                id: `w_${w.id}`,
                type: 'debit',
                name: 'Wallet Withdrawal',
                description: `Bank Transfer - ${statusText}`,
                amount: `- ${formatAmount(w.amount)}`,
                rawAmount: Number(w.amount) || 0,
                status: statusText,
                date: dateStr,
                dateRaw: d.getTime() || 0,
            };
        });

        return [...txns, ...withdrawalTxns].sort((a, b) => b.dateRaw - a.dateRaw);
    }, [filteredPayouts, withdrawals, selectedMonth]);

    // Monthly summary calculations
    const monthlySummary = useMemo(() => {
        const credited = transactions.filter(t => t.type === 'credit' && t.status === 'Credited');
        const creditedTotal = credited.reduce((sum, t) => sum + t.rawAmount, 0);

        const withdrawn = transactions.filter(t => t.type === 'debit' && (t.status === 'Approved' || t.status === 'Completed'));
        const withdrawnTotal = withdrawn.reduce((sum, t) => sum + t.rawAmount, 0);

        return {
            creditedTotal,
            creditedCount: credited.length,
            withdrawnTotal,
            withdrawnCount: withdrawn.length,
            totalPayments: transactions.length,
        };
    }, [transactions]);

    const handleWithdrawSubmit = async () => {
        const amount = parseFloat(withdrawAmount);

        if (isNaN(amount) || amount <= 0) {
            showToast('warning', 'Invalid Amount', 'Please enter a valid amount to withdraw.');
            return;
        }

        if (amount < 500) {
            showToast('warning', 'Minimum Withdrawal', 'The minimum withdrawal amount is ₹500.');
            return;
        }

        if (amount > walletBalance) {
            showToast('warning', 'Insufficient Balance', `You cannot withdraw more than your available balance (${formattedBalance}).`);
            return;
        }

        setWithdrawing(true);
        try {
            const bankDetails = profileData?.bankDetails || {};
            await submitWithdrawalRequest(amount, bankDetails);
            setWithdrawing(false);
            setWithdrawModalVisible(false);
            setWithdrawAmount('');
            showToast('success', 'Request Submitted', `Withdrawal request for ${formatAmount(amount)} has been submitted successfully.`);
            refresh();
        } catch (error) {
            setWithdrawing(false);
            showToast('error', 'Error', error.message || 'Failed to submit withdrawal request. Please try again.');
        }
    };

    const renderMonthSelector = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.monthScroll, { paddingHorizontal: spacing.base }]} style={{ marginVertical: spacing.lg }}>
            {months.map(month => {
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
                    <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>{monthlySummary.totalPayments} Payments</AppText>
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
                    <AppText variant="h4" style={{ color: colors.success, marginTop: 8 }}>{formatAmount(monthlySummary.creditedTotal)}</AppText>
                    <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 4 }}>{monthlySummary.creditedCount} Transactions</AppText>
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
                    <AppText variant="h4" style={{ color: colors.info, marginTop: 8 }}>{formatAmount(monthlySummary.withdrawnTotal)}</AppText>
                    <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 4 }}>{monthlySummary.withdrawnCount} Transactions</AppText>
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

            {transactions.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
                    <Feather name="inbox" size={40} color={colors.textMuted} />
                    <AppText variant="body" style={{ color: colors.textMuted, marginTop: spacing.base }}>No transactions this month</AppText>
                </View>
            ) : (
                <>
                    <View style={styles.timelineRow}>
                        <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>{selectedMonth}</AppText>
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        <AppText variant="caption" style={{ color: colors.textMuted }}>{transactions.length} txn</AppText>
                    </View>

                    {transactions.slice(0, showAll ? transactions.length : 3).map(txn => {
                        const isCredit = txn.type === 'credit';
                        const isPending = txn.status === 'Pending';
                        const isRejected = txn.status === 'Rejected';
                        
                        let statusColor = colors.info;
                        let statusBg = colors.infoBg;

                        if (isPending) {
                            statusColor = colors.warning || '#F59E0B';
                            statusBg = colors.warningBg || '#FEF3C7';
                        } else if (isRejected) {
                            statusColor = colors.error || '#EF4444';
                            statusBg = colors.errorBg || '#FEE2E2';
                        } else if (isCredit) {
                            statusColor = colors.success;
                            statusBg = colors.successBg;
                        }

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

                    {transactions.length > 3 && (
                        <AppButton
                            title={showAll ? "Show Less" : "View All Transactions"}
                            onPress={() => setShowAll(!showAll)}
                            variant="outline"
                            size="md"
                            rightIcon={<Feather name={showAll ? "chevron-up" : "arrow-right"} size={16} color={colors.primary} />}
                            style={{ marginTop: spacing.base, marginBottom: spacing.base }}
                        />
                    )}
                </>
            )}
        </View>
    );

    return (
        <ScreenWrapper withPadding={false} edges={['left', 'right']} style={{ backgroundColor: colors.background }}>

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
                contentContainerStyle={{ paddingBottom: spacing.base }}
            >
                {/* Wallet balance card — uses same shared data as HomeScreen */}
                <View style={{ marginTop: spacing.md, overflow: 'visible' }}>
                    <WalletCard
                        balance={formattedBalance}
                        accountNumber={bankAccount && bankAccount !== 'Not Provided' ? maskAccount(bankAccount) : 'XXXX XXXX XXXX'}
                        onWithdraw={() => setWithdrawModalVisible(true)}
                        onViewWallet={() => { }}
                    />
                </View>

                {loading ? (
                    <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <AppText variant="caption" style={{ color: colors.textMuted, marginTop: spacing.base }}>Loading wallet data...</AppText>
                    </View>
                ) : (
                    <>
                        {renderMonthSelector()}
                        {renderSummaryCard()}
                        {renderTransactions()}
                    </>
                )}

            </ScrollView>

            {/* Withdrawal Modal */}
            <Modal
                visible={withdrawModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setWithdrawModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                        <View style={styles.modalHeader}>
                            <AppText variant="h3" style={{ color: colors.textPrimary }}>Withdraw Funds</AppText>
                            <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
                                Available Balance: <AppText variant="body" style={{ color: colors.success, fontWeight: '700' }}>{formattedBalance}</AppText>
                            </AppText>

                            <AppInput
                                label="Withdrawal Amount"
                                placeholder="Enter amount (e.g. 5000)"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                                keyboardType="numeric"
                                leftIcon={<Feather name="dollar-sign" size={18} color={colors.primary} />}
                            />

                            <AppButton
                                title={withdrawing ? "Processing..." : "Confirm Withdrawal"}
                                onPress={handleWithdrawSubmit}
                                loading={withdrawing}
                                style={{ marginTop: spacing.xl }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalBody: {
        width: '100%',
    },
});

export default WalletScreen;


