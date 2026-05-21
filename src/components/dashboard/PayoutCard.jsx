import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, BRAND_GRADIENT } from '../../theme';
import AppText from '../common/AppText';
import GradientText from '../common/GradientText';

const PayoutCard = ({
    payableAmount = '₹24,500',
    expectedDate = 'Feb 28, 2026',
    status = 'Scheduled',
    activeTab = 'instant',
    onTabChange,
    onViewHistory,
}) => {
    const { colors, spacing, radius } = useTheme();

    const getStatusStyles = () => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'scheduled') {
            return { bg: colors.scheduledBg, text: colors.scheduledText };
        }
        if (lowerStatus === 'pending') {
            return { bg: colors.warningBg, text: colors.warningText };
        }
        if (lowerStatus === 'paid') {
            return { bg: 'rgba(0,200,150,0.15)', text: colors.success || '#00C896' };
        }
        return { bg: colors.surfaceElevated, text: colors.textSecondary };
    };

    const statusStyles = getStatusStyles();

    const Pill = ({ label, id, active }) => (
        <TouchableOpacity
            onPress={() => onTabChange?.(id)}
            style={[
                styles.pill,
                {
                    backgroundColor: !active ? colors.pillBg : undefined,
                    borderRadius: radius.full,
                    overflow: 'hidden',
                },
            ]}
        >
            {active ? (
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
                >
                    <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                        {label}
                    </AppText>
                </LinearGradient>
            ) : (
                <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                    <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
                        {label}
                    </AppText>
                </View>
            )}
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
                    padding: spacing.base,
                    marginHorizontal: spacing.base,
                    marginTop: spacing.md,
                },
            ]}
        >
            {/* Header row */}
            <View style={styles.headerRow}>
                <GradientText variant="h3" style={{ fontWeight: '700' }}>Payout</GradientText>
                <View style={[styles.pillRow, { backgroundColor: colors.pillBg, borderRadius: radius.full, padding: 2 }]}>
                    <Pill id="instant" label="Instant" active={activeTab === 'instant'} />
                    <Pill id="cycle" label="Cycle" active={activeTab === 'cycle'} />
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border, marginTop: spacing.md }]} />

            {/* Details */}
            <View style={[styles.detailRow, { marginTop: spacing.md }]}>
                <AppText variant="body" color="secondary">Payable amount</AppText>
                <AppText variant="h2" style={{ color: colors.textPrimary, fontWeight: '700' }}>{payableAmount}</AppText>
            </View>
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
                <AppText variant="body" color="secondary">Expected Date</AppText>
                <AppText variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>{expectedDate}</AppText>
            </View>
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
                <AppText variant="body" color="secondary">Status</AppText>
                <View style={[styles.statusBadge, { backgroundColor: statusStyles.bg, borderRadius: radius.full }]}>
                    <AppText variant="caption" style={{ color: statusStyles.text, fontWeight: '600' }}>{status}</AppText>
                </View>
            </View>


            <View style={[styles.divider, { backgroundColor: colors.border, marginTop: spacing.md }]} />

            <TouchableOpacity
                onPress={onViewHistory}
                style={[styles.linkRow, { marginTop: spacing.md }]}
                accessibilityRole="button"
                accessibilityLabel="View Payout History"
            >
                <AppText variant="body" color="link" style={{ fontWeight: '600' }}>
                    View All
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
    pill: { justifyContent: 'center', alignItems: 'center' },
    divider: { height: 1, width: '100%' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 3 },
    linkRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' },
});

export default PayoutCard;
