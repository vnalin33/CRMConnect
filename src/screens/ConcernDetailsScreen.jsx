import React from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale, fs } from '../theme/metrics';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { getPriorityConfig, getStatusConfig } from '../components/concerns/concernConstants';

const ConcernDetailsScreen = ({ route, navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();

    const { concern } = route.params || {};

    if (!concern) {
        return (
            <ScreenWrapper withPadding={false}>
                <GradientScreenHeader title="Concern Details" showBack navigation={navigation} />
                <View style={[styles.emptyContainer, { marginTop: scale(60) }]}>
                    <Feather name="alert-circle" size={scale(48)} color={colors.error} />
                    <AppText color="secondary" style={{ marginTop: spacing.md }}>
                        Concern details not found.
                    </AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const priorityConf = getPriorityConfig(concern.priority);
    const statusConf = getStatusConfig(concern.status);

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            <GradientScreenHeader
                title=" "
                showBack
                navigation={navigation}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
            >
                {/* ── Main Details Card ── */}
                <AppCard style={styles.card}>
                    {/* Header: Title & ID */}
                    <View style={styles.headerSection}>
                        <View style={styles.titleRow}>
                            <View style={styles.titleTextContainer}>
                                <AppText variant="h2" color="primary">
                                    {concern.title}
                                </AppText>
                                <AppText variant="bodySm" color="secondary" style={styles.idText}>
                                    ID: {concern.id}
                                </AppText>
                            </View>
                            <View style={[styles.categoryChip, { backgroundColor: colors.surfaceElevated, borderRadius: radius.full }]}>
                                <AppText variant="caption" color="primary" style={styles.categoryText}>
                                    {concern.category}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {/* Status & Priority Row */}
                    <View style={[styles.badgesRow, { borderBottomColor: colors.divider }]}>
                        <View style={styles.badgeColumn}>
                            <AppText variant="label" color="secondary" style={styles.badgeLabel}>Status</AppText>
                            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg, borderRadius: radius.full }]}>
                                <AppText variant="caption" style={{ color: statusConf.text, fontWeight: '700' }}>
                                    {concern.status}
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.badgeColumn}>
                            <AppText variant="label" color="secondary" style={styles.badgeLabel}>Priority</AppText>
                            <View style={styles.priorityContainer}>
                                <View style={[styles.priorityIcon, { backgroundColor: priorityConf.bg, borderRadius: radius.sm }]}>
                                    <Feather name={priorityConf.icon} size={scale(14)} color={priorityConf.color} />
                                </View>
                                <AppText variant="bodySm" color="primary">{concern.priority}</AppText>
                            </View>
                        </View>

                        <View style={styles.badgeColumn}>
                            <AppText variant="label" color="secondary" style={styles.badgeLabel}>Raised On</AppText>
                            <View style={styles.dateContainer}>
                                <Feather name="calendar" size={scale(14)} color={colors.textSecondary} />
                                <AppText variant="bodySm" color="primary" style={styles.dateText}>{concern.date}</AppText>
                            </View>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.descriptionSection}>
                        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                            Description
                        </AppText>
                        <AppText variant="body" color="primary" style={styles.descriptionText}>
                            {concern.description}
                        </AppText>
                    </View>
                </AppCard>

                {/* ── Activity/Updates Card (Placeholder for future) ── */}
                <AppCard style={[styles.card, { marginTop: spacing.md }]}>
                    <View style={styles.activityHeader}>
                        <Feather name="clock" size={scale(18)} color={colors.primary} />
                        <AppText variant="h3" color="primary" style={{ marginLeft: spacing.sm }}>
                            Recent Activity
                        </AppText>
                    </View>
                    <View style={styles.activityTimeline}>
                        <View style={styles.timelineIconContainer}>
                            <View style={[styles.timelineDot, { backgroundColor: statusConf.bg }]} />
                        </View>
                        <View style={styles.timelineContent}>
                            <AppText variant="bodySm" color="primary" style={{ fontWeight: '600' }}>Concern Logged</AppText>
                            <AppText variant="caption" color="secondary">{concern.date}</AppText>
                        </View>
                    </View>
                </AppCard>

                {/* ── Add Comment Section ── */}
                <AppCard style={[styles.card, { marginTop: spacing.md }]}>
                    <AppText variant="label" color="secondary" style={styles.commentHeader}>
                        ADD COMMENT
                    </AppText>

                    <View style={styles.commentInputWrapper}>
                        <View style={[styles.commentInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                            <TextInput
                                placeholder="Type your comment..."
                                placeholderTextColor={colors.textDisabled}
                                multiline
                                textAlignVertical="top"
                                maxLength={1000} // Character limit approx 200 words
                                style={[styles.commentInput, { color: colors.textPrimary }]}
                            />
                            <AppText variant="caption" color="textDisabled" style={styles.wordLimitText}>
                                * Max 200 Words
                            </AppText>
                        </View>

                        <TouchableOpacity style={styles.sendButtonWrapper} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#43ADF7', '#6A62FC']} // Adjusted to match the specific blue-to-purple gradient in image
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sendButton}
                            >
                                <Feather name="send" size={scale(20)} color="#FFFFFF" style={{ marginLeft: scale(-2), transform: [{ rotate: '45deg' }] }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </AppCard>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    scrollContent: {
        padding: scale(16),
    },
    card: {
        padding: scale(16),
    },
    headerSection: {
        marginBottom: scale(16),
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleTextContainer: {
        flex: 1,
        marginRight: scale(12),
    },
    idText: {
        marginTop: scale(4),
    },
    categoryChip: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
    },
    categoryText: {
        fontWeight: '600',
        fontSize: fs(11),
    },
    badgesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(16),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    badgeColumn: {
        flex: 1,
        alignItems: 'flex-start',
    },
    badgeLabel: {
        marginBottom: scale(6),
    },
    statusBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
    },
    priorityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityIcon: {
        width: scale(22),
        height: scale(22),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(6),
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: scale(6),
    },
    descriptionSection: {
        paddingTop: scale(16),
    },
    sectionTitle: {
        marginBottom: scale(8),
    },
    descriptionText: {
        lineHeight: fs(22),
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(16),
    },
    activityTimeline: {
        flexDirection: 'row',
    },
    timelineIconContainer: {
        width: scale(20),
        alignItems: 'center',
    },
    timelineDot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        marginTop: scale(4),
    },
    timelineContent: {
        flex: 1,
        marginLeft: scale(10),
    },
    commentHeader: {
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: scale(12),
        fontSize: fs(11),
    },
    commentInputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    commentInputContainer: {
        flex: 1,
        borderWidth: 1,
        borderRadius: scale(16),
        height: scale(100),
        paddingHorizontal: scale(12),
        paddingVertical: scale(10),
    },
    commentInput: {
        flex: 1,
        fontSize: fs(13),
        padding: 0,
    },
    wordLimitText: {
        alignSelf: 'flex-end',
        fontSize: fs(10),
        fontStyle: 'italic',
        marginTop: scale(4),
    },
    sendButtonWrapper: {
        marginLeft: scale(12),
        marginBottom: scale(2),
        borderRadius: scale(14),
        elevation: 3,
        shadowColor: '#2DBFE6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sendButton: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ConcernDetailsScreen;
