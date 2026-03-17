import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppCard from '../common/AppCard';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the first letter(s) from a name for the avatar */
const getInitials = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() ?? '?';
};

/** Fixed set of avatar background colors – assigned by index */
const AVATAR_COLORS = ['#6855F0', '#00C896', '#F59E0B', '#2DBFE6', '#E05C9F', '#8B72FF'];

const getAvatarColor = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/** Status badge config – Instant = purple, Cycle = teal */
const getStatusConfig = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'instant') return { bg: '#EDE9FF', text: '#6855F0' };
    if (s === 'cycle') return { bg: '#E0F7FA', text: '#00838F' };
    return { bg: '#F0F0F8', text: '#6B7280' };
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * CustomerCard
 *
 * Reusable card matching the Figma Customers screen design.
 *
 * @param {object} customer
 *   - name            string   e.g. 'Manoj Kumar'
 *   - loanType        string   e.g. 'Home Loan'
 *   - status          string   'Instant' | 'Cycle'
 *   - loanAmount      string   e.g. '₹ 12,00,000'
 *   - disbursedAmount string   e.g. '₹ 11,80,000.00'
 *   - disbursementDate string  e.g. '20 Feb 2026'
 * @param {function} [onPress]
 */
const CustomerCard = memo(({ customer, onPress }) => {
    const { colors, spacing, radius } = useTheme();
    const initials = getInitials(customer.name);
    const avatarBg = getAvatarColor(customer.name);
    const statusConf = getStatusConfig(customer.status);

    return (
        <AppCard
            variant="elevated"
            style={[styles.card, { marginHorizontal: spacing.base, marginBottom: spacing.md }]}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={styles.touchable}
            >
                {/* ── Top row: Avatar + Name/Type + Status badge ── */}
                <View style={styles.topRow}>
                    <View style={[styles.avatar, { backgroundColor: avatarBg, borderRadius: radius.full }]}>
                        <AppText style={styles.avatarText}>{initials}</AppText>
                    </View>

                    <View style={styles.nameSection}>
                        <AppText variant="h3" color="primary" numberOfLines={1}>{customer.name}</AppText>
                        <AppText variant="bodySm" color="secondary" style={{ marginTop: 2 }}>{customer.loanType}</AppText>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusConf.bg, borderRadius: radius.full }]}>
                        <AppText variant="caption" style={[styles.statusText, { color: statusConf.text }]}>
                            {customer.status}
                        </AppText>
                    </View>
                </View>

                {/* ── Amount row: Loan Amount + Disbursed Amount ── */}
                <View style={[styles.amountRow, { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <View>
                        <AppText variant="label" color="secondary">Loan Amount</AppText>
                        <AppText variant="bodySm" color="primary" style={styles.amountValue}>
                            {customer.loanAmount}
                        </AppText>
                    </View>

                    <View style={styles.disbursedSection}>
                        <AppText variant="label" color="secondary" align="right">Disbursed Amount</AppText>
                        <AppText variant="bodySm" style={[styles.amountValue, { color: colors.primary }]} align="right">
                            {customer.disbursedAmount}
                        </AppText>
                    </View>
                </View>

                {/* ── Bottom row: Date + Chevron ── */}
                <View style={[styles.bottomRow, { marginTop: spacing.sm }]}>
                    <View>
                        <AppText variant="label" color="secondary">Disbursement Date</AppText>
                        <AppText variant="bodySm" color="primary" style={{ marginTop: 2 }}>
                            {customer.disbursementDate}
                        </AppText>
                    </View>

                    <Feather name="chevron-right" size={25} color={colors.textSecondary} />
                </View>
            </TouchableOpacity>
        </AppCard>
    );
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        padding: 0,
    },
    touchable: {
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 18,
    },
    nameSection: {
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    statusText: {
        fontWeight: '700',
        fontSize: 13,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    disbursedSection: {
        alignItems: 'flex-end',
    },
    amountValue: {
        fontWeight: '700',
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default CustomerCard;
