import React, { memo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppCard from '../common/AppCard';
import { BRAND_GRADIENT } from '../../theme/colors';

/**
 * DraftCard
 *
 * Reusable card for the Drafts screen. Imported once, reused for all entries.
 *
 * @param {object}   draft
 *   - id               string
 *   - name             string   e.g. 'Praveen Kumar'
 *   - loanType         string   e.g. 'Home Loan'
 *   - amount           string   e.g. '₹ 15,00,000'
 *   - savedAt          string   e.g. '27 Feb 2026, 2:30 PM'
 * @param {function} [onResume]   – called when Resume is pressed
 * @param {function} [onDelete]   – called when Delete is pressed
 */
const DraftCard = memo(({ draft, onResume, onDelete }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <AppCard
            variant="elevated"
            style={[styles.card, { marginHorizontal: spacing.base, marginBottom: spacing.md }]}
        >
            {/* ── Top row: folder icon + name / loan / amount ── */}
            <View style={styles.topRow}>
                {/* Lavender folder icon box */}
                <View style={[styles.iconBox, { backgroundColor: '#EDE9FF', borderRadius: radius.md }]}>
                    <MaterialCommunityIcons name="folder-outline" size={26} color="#6855F0" />
                </View>

                {/* Info section */}
                <View style={styles.infoSection}>
                    <AppText variant="h3" color="primary" numberOfLines={1}>{draft.name}</AppText>
                    <AppText variant="bodySm" color="secondary" style={styles.infoSubText}>{draft.loanType}</AppText>
                    <AppText variant="bodySm" color="secondary" style={styles.infoSubText}>{draft.amount}</AppText>
                </View>
            </View>

            {/* ── Divider ── */}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* ── Bottom row: timestamp + delete + resume ── */}
            <View style={styles.bottomRow}>
                {/* Timestamp */}
                <View style={styles.timestampRow}>
                    <Feather name="clock" size={18} color={colors.textSecondary} />
                    <AppText variant="caption" color="secondary" style={styles.timestampText}>
                        {draft.savedAt}
                    </AppText>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {/* Delete button */}
                    <TouchableOpacity
                        onPress={onDelete}
                        activeOpacity={0.8}
                        style={[styles.deleteBtn, { backgroundColor: '#FEE2E2', borderRadius: radius.md }]}
                        accessibilityRole="button"
                        accessibilityLabel="Delete draft"
                    >
                        <Feather name="trash-2" size={15} color="#E53935" />
                    </TouchableOpacity>

                    {/* Resume button */}
                    <TouchableOpacity
                        onPress={onResume}
                        activeOpacity={0.8}
                        style={{ borderRadius: radius.full, overflow: 'hidden' }}
                        accessibilityRole="button"
                        accessibilityLabel="Resume draft"
                    >
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            style={styles.resumeBtn}
                        >
                            <Feather name="play" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <AppText style={styles.resumeText}>Resume</AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </AppCard>
    );
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        padding: 14,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    infoSection: {
        flex: 1,
    },
    infoSubText: {
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    timestampText: {
        marginLeft: 5,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resumeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    resumeText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
});

export default DraftCard;
