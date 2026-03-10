import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

const PayoutCard = ({
    payableAmount = '₹24,500',
    expectedDate = 'Feb 28, 2026',
    status = 'Scheduled',
    activeTab = 'instant',
    onTabChange,
    onViewHistory,
}) => {
    const { colors, spacing, radius } = useTheme();

    const Pill = ({ label, id, active }) => (
        <TouchableOpacity
            onPress={() => onTabChange?.(id)}
            style={[
                styles.pill,
                {
                    backgroundColor: active ? colors.pillActiveBg : colors.pillBg,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                },
            ]}
        >
            <AppText variant="caption" style={{ color: active ? colors.pillActiveText : colors.pillText, fontWeight: '600' }}>
                {label}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.payoutCardBg,
                    borderColor: colors.payoutBorder,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    marginHorizontal: spacing.base,
                    marginTop: spacing.lg,
                },
            ]}
        >
            {/* Header row */}
            <View style={styles.headerRow}>
                <AppText variant="h3" color="brand" style={{ fontWeight: '700' }}>Payout</AppText>
                <View style={styles.pillRow}>
                    <Pill id="instant" label="Instant" active={activeTab === 'instant'} />
                    <View style={{ width: spacing.xs }} />
                    <Pill id="cycle" label="Cycle" active={activeTab === 'cycle'} />
                </View>
            </View>

            {/* Details */}
            <View style={[styles.detailRow, { marginTop: spacing.lg }]}>
                <AppText variant="body" color="secondary">Payable amount</AppText>
                <AppText variant="h2" style={{ color: colors.textPrimary, fontWeight: '700' }}>{payableAmount}</AppText>
            </View>
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
                <AppText variant="body" color="secondary">Expected Date</AppText>
                <AppText variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>{expectedDate}</AppText>
            </View>
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
                <AppText variant="body" color="secondary">Status</AppText>
                <View style={[styles.statusBadge, { backgroundColor: colors.scheduledBg, borderRadius: radius.full }]}>
                    <AppText variant="caption" style={{ color: colors.scheduledText, fontWeight: '600' }}>{status}</AppText>
                </View>
            </View>

            {/* Footer link */}
            <TouchableOpacity
                onPress={onViewHistory}
                style={[styles.linkRow, { marginTop: spacing.lg }]}
                accessibilityRole="button"
                accessibilityLabel="View Payout History"
            >
                <AppText variant="body" color="link" style={{ fontWeight: '600' }}>
                    View Payout History
                </AppText>
                <Feather name="arrow-right" size={16} color={colors.textLink} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pillRow: { flexDirection: 'row', alignItems: 'center' },
    pill: {},
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 3 },
    linkRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' },
});

export default PayoutCard;
