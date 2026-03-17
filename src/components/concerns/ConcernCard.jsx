import React, { memo, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale, fs } from '../../theme/metrics';
import AppText from '../common/AppText';
import AppCard from '../common/AppCard';
import { getPriorityConfig, getStatusConfig } from './concernConstants';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ConcernCard
 *
 * A fully reusable, prop-driven card for displaying concern/issue items.
 * All visual config is derived from shared constants (concernConstants.js)
 * and the current theme — nothing is hardcoded.
 *
 * @param {object}   concern         — The concern data object
 * @param {string}   concern.id      — e.g. '#CON-001'
 * @param {string}   concern.title   — e.g. 'Payout Delay'
 * @param {string}   concern.description — Brief description text
 * @param {string}   concern.priority — 'High' | 'Medium' | 'Low'
 * @param {string}   concern.status  — 'Pending' | 'In Progress' | 'Resolved' | 'Closed'
 * @param {string}   concern.category — e.g. 'Payout'
 * @param {string}   concern.date    — e.g. '27 Feb 2026'
 * @param {function} [onPress]       — Callback when card is pressed
 * @param {string}   [cardVariant]   — AppCard variant: 'elevated' | 'outlined' | 'flat'
 * @param {number}   [descriptionLines] — Max lines for description preview
 * @param {boolean}  [showCategory]  — Whether to display the category chip
 * @param {boolean}  [showDate]      — Whether to display the date row
 * @param {boolean}  [showChevron]   — Whether to show the right-arrow chevron
 * @param {object}   [style]         — Additional style for the outer card
 */
const ConcernCard = memo(({
    concern,
    onPress,
    cardVariant = 'elevated',
    descriptionLines = 2,
    showCategory = true,
    showDate = true,
    showChevron = true,
    style,
}) => {
    const { colors, spacing, radius } = useTheme();

    const priorityConf = useMemo(
        () => getPriorityConfig(concern.priority),
        [concern.priority],
    );
    const statusConf = useMemo(
        () => getStatusConfig(concern.status),
        [concern.status],
    );

    const hasBottomRow = showCategory || showDate || showChevron;

    return (
        <AppCard
            variant={cardVariant}
            style={[styles.card, { marginHorizontal: spacing.base, marginBottom: spacing.md }, style]}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Concern: ${concern.title}, Status: ${concern.status}`}
                style={[styles.touchable, { padding: spacing.base }]}
            >
                {/* ── Top row: Priority icon + Title + Status badge ── */}
                <View style={styles.topRow}>
                    <View
                        style={[
                            styles.priorityIcon,
                            {
                                backgroundColor: priorityConf.bg,
                                borderRadius: radius.md,
                            },
                        ]}
                    >
                        <Feather
                            name={priorityConf.icon}
                            size={scale(18)}
                            color={priorityConf.color}
                        />
                    </View>

                    <View style={styles.titleSection}>
                        <AppText variant="h3" color="primary" numberOfLines={1}>
                            {concern.title}
                        </AppText>
                        <AppText
                            variant="caption"
                            color="secondary"
                            numberOfLines={1}
                            style={styles.idText}
                        >
                            {concern.id}
                        </AppText>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: statusConf.bg,
                                borderRadius: radius.full,
                            },
                        ]}
                    >
                        <AppText
                            variant="caption"
                            style={{
                                color: statusConf.text,
                                fontWeight: '700',
                                fontSize: fs(11),
                            }}
                        >
                            {concern.status}
                        </AppText>
                    </View>
                </View>

                {/* ── Description preview ── */}
                <AppText
                    variant="bodySm"
                    color="secondary"
                    numberOfLines={descriptionLines}
                    style={{ marginTop: spacing.sm }}
                >
                    {concern.description}
                </AppText>

                {/* ── Bottom row: Category + Date + Chevron ── */}
                {hasBottomRow && (
                    <View
                        style={[
                            styles.bottomRow,
                            {
                                marginTop: spacing.sm,
                                paddingTop: spacing.sm,
                                borderTopWidth: StyleSheet.hairlineWidth,
                                borderTopColor: colors.divider,
                            },
                        ]}
                    >
                        {showCategory && (
                            <View
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: colors.surfaceElevated,
                                        borderRadius: radius.full,
                                    },
                                ]}
                            >
                                <AppText
                                    variant="caption"
                                    color="primary"
                                    style={styles.categoryText}
                                >
                                    {concern.category}
                                </AppText>
                            </View>
                        )}

                        {showDate && (
                            <View style={styles.dateRow}>
                                <Feather
                                    name="calendar"
                                    size={scale(12)}
                                    color={colors.textSecondary}
                                />
                                <AppText
                                    variant="caption"
                                    color="secondary"
                                    style={styles.dateText}
                                >
                                    {concern.date}
                                </AppText>
                            </View>
                        )}

                        {showChevron && (
                            <Feather
                                name="chevron-right"
                                size={scale(20)}
                                color={colors.textSecondary}
                            />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </AppCard>
    );
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        padding: 0,
    },
    touchable: {},
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityIcon: {
        width: scale(40),
        height: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    titleSection: {
        flex: 1,
        marginRight: scale(10),
    },
    idText: {
        marginTop: scale(2),
    },
    statusBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryChip: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(3),
    },
    categoryText: {
        fontWeight: '600',
        fontSize: fs(10),
    },
    dateRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: scale(12),
    },
    dateText: {
        marginLeft: scale(4),
    },
});

export default ConcernCard;
