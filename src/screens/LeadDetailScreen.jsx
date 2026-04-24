import React, { useState, useCallback } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppButton from '../components/common/AppButton';
import DropdownSelect from '../components/common/DropdownSelect';
import AppInput from '../components/common/AppInput';
import { useLeadDetail } from '../hooks/useLeadDetail';
import { STATUS_MAP } from '../hooks/useLeadList';

// ── Status display options (view-only, matches CRM web) ──
const STATUS_DISPLAY = [
    { code: null, label: 'All',                      icon: 'list',         color: '#3B82F6' },
    { code: 3,    label: 'Following',                icon: 'repeat',       color: '#F59E0B' },
    { code: 4,    label: 'Approved',                 icon: 'check-circle', color: '#10B981' },
    { code: 5,    label: 'Reject',                   icon: 'x-circle',     color: '#EF4444' },
    { code: 22,   label: 'No Response',              icon: 'phone-off',    color: '#6B7280' },
    { code: 24,   label: 'Not Exist/Out of Service', icon: 'slash',        color: '#6B7280' },
    { code: 12,   label: 'Doc Collection',           icon: 'folder',       color: '#8B5CF6' },
    { code: 13,   label: 'File Login',               icon: 'log-in',       color: '#3B82F6' },
    { code: 15,   label: 'Sanction',                 icon: 'award',        color: '#10B981' },
    { code: 17,   label: 'Disbursement',             icon: 'dollar-sign',  color: '#059669' },
];

// ── Progress Stepper ─────────────────────────────────────────────
const MAIN_STEPS = [
    { codes: [1, 10], label: 'New' },
    { codes: [2],     label: 'Assigned' },       // code 11 (post-approved Assigned) is web-only, skip
    { codes: [3],     label: 'Following' },
    { codes: [4],     label: 'Approved' },
    { codes: [12],    label: 'Doc Collection' },
    { codes: [13],    label: 'File Login' },
    { codes: [15],    label: 'Sanction' },
    { codes: [17, 18],label: 'Disbursement' },   // 100% — includes Completed
];

const ProgressStepper = React.memo(({ currentStatus }) => {
    const { colors, spacing } = useTheme();
    const mapped = STATUS_MAP[currentStatus] || { progress: 0, color: '#6B7280' };

    // Find which step we're at or past based on actual progress or code inclusion
    const currentIdx = MAIN_STEPS.findIndex(s => s.codes.includes(currentStatus) || (STATUS_MAP[currentStatus]?.progress || 0) <= (STATUS_MAP[s.codes[0]]?.progress || 0));
    const activeIndex = currentIdx >= 0 ? currentIdx : MAIN_STEPS.length - 1;

    return (
        <View style={[styles.stepperContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm }}>
                Progress Tracker
            </AppText>
            <View style={styles.stepperRow}>
                {MAIN_STEPS.map((step, index) => {
                    const isCompleted = mapped.progress >= (STATUS_MAP[step.codes[0]]?.progress || 0);
                    const isCurrent = step.codes.includes(currentStatus);
                    const stepColor = isCompleted ? '#10B981' : isCurrent ? mapped.color : colors.border;

                    return (
                        <View key={step.label} style={styles.stepItem}>
                            {/* Connector line (except first) */}
                            {index > 0 && (
                                <View style={[styles.stepLine, { backgroundColor: isCompleted ? '#10B981' : colors.border }]} />
                            )}
                            {/* Circle */}
                            <View
                                style={[
                                    styles.stepCircle,
                                    {
                                        backgroundColor: isCompleted ? '#10B981' : isCurrent ? mapped.color : 'transparent',
                                        borderColor: stepColor,
                                    },
                                ]}
                            >
                                {isCompleted ? (
                                    <Feather name="check" size={10} color="#FFFFFF" />
                                ) : (
                                    <AppText variant="caption" style={{ color: isCurrent ? '#FFFFFF' : colors.textSecondary, fontSize: 8, fontWeight: '700' }}>
                                        {index + 1}
                                    </AppText>
                                )}
                            </View>
                            {/* Label */}
                            <AppText
                                variant="caption"
                                style={[
                                    styles.stepLabel,
                                    { color: isCompleted || isCurrent ? colors.textPrimary : colors.textSecondary },
                                    isCurrent && { fontWeight: '700' },
                                ]}
                            >
                                {step.label}
                            </AppText>
                        </View>
                    );
                })}
            </View>
        </View>
    );
});

// ── Info Row ──────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => {
    const { colors, spacing } = useTheme();
    if (!value) return null;
    return (
        <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.infoLabelRow}>
                <Feather name={icon} size={14} color={colors.textSecondary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 6 }}>{label}</AppText>
            </View>
            <AppText variant="bodySm" style={{ color: colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' }}>
                {value}
            </AppText>
        </View>
    );
};

// ── History Item ─────────────────────────────────────────────────
const HistoryItem = React.memo(({ item }) => {
    const { colors, spacing, radius } = useTheme();
    const mapped = STATUS_MAP[item.status] || { label: 'Unknown', progress: 0, color: '#6B7280' };

    return (
        <View style={[styles.historyItem, { borderLeftColor: mapped.color }]}>
            <View style={styles.historyTopRow}>
                <View style={[styles.historyBadge, { backgroundColor: `${mapped.color}18` }]}>
                    <AppText variant="caption" style={{ color: mapped.color, fontWeight: '700' }}>
                        {mapped.label} — {mapped.progress}%
                    </AppText>
                </View>
                {item.createon && (
                    <AppText variant="caption" color="secondary">
                        {new Date(item.createon).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </AppText>
                )}
            </View>
            {item.notes ? (
                <AppText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                    {item.notes}
                </AppText>
            ) : null}
        </View>
    );
});

// ── Main Screen ──────────────────────────────────────────────────
const LeadDetailScreen = ({ route, navigation }) => {
    const { leadId } = route.params;
    const { colors, spacing, radius } = useTheme();

    const { lead, history, loading, updating, error, updateStatus, assignLead } = useLeadDetail(leadId);

    const statusCode = lead?.statusCode || lead?.track_status || lead?.status || 1;
    const mapped = STATUS_MAP[statusCode] || { label: 'Unknown', progress: 0, color: '#6B7280' };

    if (loading) {
        return (
            <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']}>
                <GradientScreenHeader title="Lead Detail" showBack navigation={navigation} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!lead) {
        return (
            <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']}>
                <GradientScreenHeader title="Lead Detail" showBack navigation={navigation} />
                <View style={styles.loadingContainer}>
                    <Feather name="alert-circle" size={48} color={colors.error} />
                    <AppText variant="body" color="error" style={{ marginTop: spacing.sm }}>
                        {error || 'Lead not found'}
                    </AppText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']}>
            <GradientScreenHeader
                title={`${lead.firstname || ''} ${lead.lastname || ''}`}
                subtitle={`${mapped.label} · ${mapped.progress}%`}
                showBack
                navigation={navigation}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* ── Status Summary Card ── */}
                <View style={{ marginHorizontal: 16, marginTop: 16 }}>
                    <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        locations={BRAND_GRADIENT.locations}
                        style={[styles.summaryCard, { borderRadius: radius.xl }]}
                    >
                        <View style={styles.summaryRow}>
                            <View>
                                <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.75)' }}>Current Status</AppText>
                                <AppText variant="h2" style={{ color: '#FFFFFF', fontWeight: '800', marginTop: 4 }}>
                                    {mapped.label}
                                </AppText>
                            </View>
                            <View style={styles.progressCircle}>
                                <AppText variant="h2" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                                    {mapped.progress}%
                                </AppText>
                            </View>
                        </View>
                        {/* Mini progress bar */}
                        <View style={[styles.miniTrack, { marginTop: 16 }]}>
                            <View style={[styles.miniFill, { width: `${mapped.progress}%` }]} />
                        </View>
                    </LinearGradient>
                </View>

                {/* ── Progress Stepper ── */}
                <View style={{ marginHorizontal: 16, marginTop: 16 }}>
                    <ProgressStepper currentStatus={statusCode} />
                </View>

                {/* ── Personal Info ── */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.lg }]}>
                    <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
                        Personal Information
                    </AppText>
                    <InfoRow icon="user" label="Full Name" value={`${lead.firstname || ''} ${lead.lastname || ''}`} />
                    <InfoRow icon="mail" label="Email" value={lead.email} />
                    <InfoRow icon="phone" label="Mobile" value={lead.mobilenumber} />
                    <InfoRow icon="briefcase" label="Loan Type" value={lead.loantype} />
                    <InfoRow icon="dollar-sign" label="Loan Amount" value={lead.loanamount ? `₹${lead.loanamount}` : null} />
                    <InfoRow icon="trending-up" label="Annual Income" value={lead.annualincome ? `₹${lead.annualincome}` : null} />
                    <InfoRow icon="clipboard" label="Employment" value={lead.employmenttype} />
                    {lead.tracknumber && <InfoRow icon="hash" label="Track Number" value={lead.tracknumber} />}
                </View>

                {/* ── Status (View Only — only admin on CRM web can update) ── */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.lg }]}>
                    <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }}>
                        Status
                    </AppText>
                    <AppText color="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                        Current: {mapped.label}
                    </AppText>

                    {/* Status Chips (view-only) */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {STATUS_DISPLAY.map((opt) => {
                            const isCurrent = opt.code !== null && statusCode === opt.code;
                            return (
                                <View
                                    key={opt.code ?? 'all'}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        borderWidth: 1.5,
                                        borderColor: isCurrent ? opt.color : colors.border,
                                        backgroundColor: isCurrent ? opt.color + '18' : colors.background,
                                    }}
                                >
                                    <Feather
                                        name={isCurrent ? 'check' : opt.icon}
                                        size={14}
                                        color={isCurrent ? opt.color : colors.textSecondary}
                                        style={{ marginRight: 6 }}
                                    />
                                    <AppText style={{
                                        fontSize: 12,
                                        fontWeight: isCurrent ? '700' : '500',
                                        color: isCurrent ? opt.color : colors.textPrimary,
                                    }}>
                                        {opt.label}{isCurrent ? ' ✓' : ''}
                                    </AppText>
                                </View>
                            );
                        })}
                    </View>

                    {/* Admin-only notice */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.background, borderRadius: 10, marginTop: 12 }}>
                        <Feather name="lock" size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <AppText color="secondary" style={{ flex: 1, fontSize: 11 }}>
                            Status can only be updated by Admin from the CRM portal.
                        </AppText>
                    </View>
                </View>

                {/* ── History Timeline ── */}
                {history.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.lg }]}>
                        <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
                            Status History
                        </AppText>
                        {history.map((item) => (
                            <HistoryItem key={item.id} item={item} />
                        ))}
                    </View>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summaryCard: {
        padding: 20,
        shadowColor: '#816FF5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
    miniFill: { height: 4, backgroundColor: '#FFFFFF', borderRadius: 2 },
    section: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    infoLabelRow: { flexDirection: 'row', alignItems: 'center' },
    stepperContainer: {
        padding: 16,
        borderWidth: 1,
        borderRadius: 16,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
    stepLine: {
        position: 'absolute',
        top: 10,
        left: -50 + '%',
        right: 50 + '%',
        height: 2,
        zIndex: -1,
    },
    stepCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLabel: { fontSize: 9, marginTop: 4, textAlign: 'center' },
    historyItem: {
        borderLeftWidth: 3,
        paddingLeft: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    historyTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
});

export default LeadDetailScreen;
