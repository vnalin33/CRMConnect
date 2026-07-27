import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Platform,
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
import AppStatusModal from '../components/common/AppStatusModal';
import { getPayoutsApi } from '../api/payoutApi';
import { getInvoiceRequestStatuses, getInvoiceHtmlByTrackId } from '../api/invoiceRequestApi';
import { generatePDF } from 'react-native-html-to-pdf';
import { downloadInvoicePdf, openDownloadedPdf } from '../utils/downloadPdf';
import { useToast } from '../context/ToastContext';
import { useProfile } from '../hooks/useProfile';

const formatINR = (n) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

const PayoutItem = React.memo(({ item, onRaiseInvoice, invoiceRequest, onDownload, isGstRegistered }) => {
    const { colors, radius, spacing } = useTheme();
    const isPaid = item.status === 'paid';
    const reqStatus = invoiceRequest?.status;
    const hasInvoice = !!reqStatus;

    const payoutAmt = parseFloat(item.payoutAmount) || 0;
    const tds = Math.round(payoutAmt * 0.02 * 100) / 100;
    const sgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
    const cgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
    const netPayout = Math.round((payoutAmt - tds - sgst - cgst) * 100) / 100;
    const netPayoutFormatted = formatINR(netPayout);

    // Determine badge to display
    const getStatusBadge = () => {
        if (reqStatus === 'paid') {
            return { colors: ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.08)'], borderColor: '#3B82F6', icon: 'check-circle-outline', iconColor: '#3B82F6', text: 'Paid' };
        }
        if (reqStatus === 'approved') {
            return { colors: ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.08)'], borderColor: '#10B981', icon: 'check-circle-outline', iconColor: '#10B981', text: 'Approved' };
        }
        if (reqStatus === 'rejected') {
            return { colors: ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.08)'], borderColor: '#EF4444', icon: 'close-circle-outline', iconColor: '#EF4444', text: 'Rejected' };
        }
        if (reqStatus === 'pending') {
            return { colors: ['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.08)'], borderColor: '#F59E0B', icon: 'clock-check-outline', iconColor: '#F59E0B', text: 'Pending Approval' };
        }
        if (isPaid) {
            return { colors: ['rgba(0,200,150,0.15)', 'rgba(0,200,150,0.08)'], borderColor: colors.success, icon: 'check-circle-outline', iconColor: colors.success, text: 'Paid' };
        }
        return { colors: ['rgba(129,111,245,0.15)', 'rgba(129,111,245,0.08)'], borderColor: colors.primary, icon: 'clock-outline', iconColor: colors.primary, text: 'Pending' };
    };

    const badge = getStatusBadge();

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
                <LinearGradient
                    colors={badge.colors}
                    style={[styles.statusBadge, { borderRadius: radius.full, borderColor: badge.borderColor }]}
                >
                    <MaterialCommunityIcons name={badge.icon} size={13} color={badge.iconColor} />
                    <AppText variant="caption" style={[styles.statusText, { color: badge.iconColor }]}>{badge.text}</AppText>
                </LinearGradient>
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
                    <AppText variant="caption" color="secondary">Net Payout Amount</AppText>
                    <AppText variant="bodySm" style={[styles.itemDetailText, { color: '#10B981', fontWeight: '700' }]}>
                        {netPayoutFormatted}
                    </AppText>
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

            {/* Expected Payout Date - show when admin has set it */}
            {invoiceRequest?.expected_payout_date && (
                <View style={[styles.itemAmountRow, { borderTopColor: colors.divider }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="calendar" size={12} color="#10B981" />
                        <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700', marginLeft: 4 }}>Expected Payout:</AppText>
                    </View>
                    <AppText variant="bodySm" style={{ color: '#10B981', fontWeight: '700' }}>
                        {new Date(invoiceRequest.expected_payout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </AppText>
                </View>
            )}

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

            {/* Action Button */}
            {hasInvoice ? (
                reqStatus === 'paid' ? (
                    /* Invoice paid — show Download Invoice button */
                    <View style={{ marginTop: spacing.md }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onDownload && onDownload()}
                            style={[
                                styles.raiseInvoiceButton,
                                {
                                    borderRadius: radius.md,
                                    borderWidth: 1.5,
                                    borderColor: '#3B82F6',
                                    backgroundColor: 'rgba(59,130,246,0.08)',
                                },
                            ]}>
                            <Feather name="download" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                            <AppText variant="button" style={{ color: '#3B82F6', fontWeight: '700' }}>
                                Download Invoice
                            </AppText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Invoice raised but not yet paid — show status */
                    <View style={{ marginTop: spacing.md, alignItems: 'flex-start' }}>
                        <View style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: radius.full,
                            backgroundColor: reqStatus === 'approved' ? 'rgba(16,185,129,0.1)' : 
                                             reqStatus === 'rejected' ? 'rgba(239,68,68,0.1)' : 
                                             'rgba(245,158,11,0.1)',
                        }}>
                            <AppText variant="caption" style={{ 
                                color: reqStatus === 'approved' ? '#10B981' : 
                                       reqStatus === 'rejected' ? '#EF4444' : 
                                       '#F59E0B', 
                                fontWeight: '700' 
                            }}>
                                {reqStatus === 'approved' ? 'Approved' : reqStatus === 'rejected' ? 'Rejected' : 'Pending Approval'}
                            </AppText>
                        </View>
                    </View>
                )
            ) : !isPaid && onRaiseInvoice ? (
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
            ) : null}
        </View>
    );
});

const PayoutScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const { showToast } = useToast();
    const { profileData } = useProfile();

    const [payouts, setPayouts] = useState([]);
    const [summary, setSummary] = useState({
        totalDisbursedFormatted: '₹0',
        paidAmountFormatted: '₹0',
        pendingAmountFormatted: '₹0',
        paidCount: 0,
        pendingCount: 0,
    });
    const [approvalMap, setApprovalMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [downloadModal, setDownloadModal] = useState({ visible: false, fileName: '', filePath: '' });

    const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
        profileData?.taxDetails?.gst &&
        profileData?.taxDetails?.gst !== 'Not Provided';

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');

    const fetchPayouts = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const result = await getPayoutsApi();

            if (result.success) {
                setPayouts(result.data || []);
                if (result.summary) {
                    setSummary(result.summary);
                } else {
                    setSummary({
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
                }
            } else {
                setError(result.message || 'Failed to fetch payouts');
            }
        } catch (err) {
            console.log('Failed to fetch payouts:', err.message);
            setError('An error occurred while fetching payouts. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }

        // Fetch approval statuses from CRM admin backend
        try {
            const statusResult = await getInvoiceRequestStatuses();
            if (statusResult.success && statusResult.data) {
                const aMap = {};
                for (const req of statusResult.data) {
                    // Use track_id for reliable matching
                    if (req.track_id) {
                        aMap[req.track_id] = req;
                    }
                }
                setApprovalMap(aMap);
            }
        } catch { /* silent */ }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPayouts();
        }, [fetchPayouts])
    );

    const onRefresh = useCallback(() => {
        fetchPayouts(true);
    }, [fetchPayouts]);

    const statusTabs = useMemo(() => {
        let paidC = 0;
        let pendC = 0;
        payouts.forEach(item => {
            const req = approvalMap[parseInt(item.id, 10)];
            const isPaid = item.status === 'paid' || (req && req.status === 'paid');
            if (isPaid) paidC++;
            else pendC++;
        });
        return [
            { id: 'all', label: 'All' },
            { id: 'paid', label: `Paid (${paidC})` },
            { id: 'pending', label: `Pending (${pendC})` },
        ];
    }, [payouts, approvalMap]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return payouts.filter(item => {
            const matchSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.loanType.toLowerCase().includes(q) ||
                (item.bankName && item.bankName.toLowerCase().includes(q)) ||
                (item.trackNumber && item.trackNumber.toLowerCase().includes(q));

            const req = approvalMap[parseInt(item.id, 10)];
            const isPaid = item.status === 'paid' || (req && req.status === 'paid');

            let matchStatus = false;
            if (statusTab === 'all') matchStatus = true;
            else if (statusTab === 'paid') matchStatus = isPaid;
            else if (statusTab === 'pending') matchStatus = !isPaid;

            return matchSearch && matchStatus;
        });
    }, [search, statusTab, payouts, approvalMap]);

    const handleStatusTab = useCallback((id) => setStatusTab(id), []);

    const handleRaiseInvoice = useCallback((item) => {
        navigation.navigate('RaiseInvoice', { payoutData: item });
    }, [navigation]);

    const handleDownload = useCallback(async (invoiceReq) => {
        if (!invoiceReq || !invoiceReq.id || !invoiceReq.track_id) return;
        
        try {
            showToast('info', 'Downloading', 'Preparing invoice PDF...');
            // Fetch final HTML from backend
            const htmlContent = await getInvoiceHtmlByTrackId(invoiceReq.track_id);
            
            if (!htmlContent || htmlContent.length < 50) {
                throw new Error('Invoice HTML content is empty or invalid. Ensure the invoice has been generated on the admin portal.');
            }

            // Generate PDF and save to device's Downloads folder
            const result = await downloadInvoicePdf(htmlContent, `Invoice_${invoiceReq.track_id}`);
            
            setDownloadModal({ visible: true, fileName: result.fileName, filePath: result.filePath });
        } catch (err) {
            console.error('PDF error:', err);
            showToast('error', 'Download Failed', err.message || 'Failed to download invoice');
        }
    }, [showToast]);

    const renderItem = useCallback(({ item }) => {
        const req = approvalMap[parseInt(item.id, 10)];
        return (
            <PayoutItem
                item={item}
                onRaiseInvoice={handleRaiseInvoice}
                invoiceRequest={req}
                onDownload={() => handleDownload(req)}
                isGstRegistered={isGstRegistered}
            />
        );
    }, [handleRaiseInvoice, handleDownload, approvalMap, isGstRegistered]);

    const keyExtractor = useCallback((item) => item.id, []);

    const dynamicSummary = useMemo(() => {
        let paidA = 0;
        let pendA = 0;
        let paidC = 0;
        let pendC = 0;

        payouts.forEach(item => {
            const req = approvalMap[parseInt(item.id, 10)];
            const isPaid = item.status === 'paid' || (req && req.status === 'paid');
            
            const payoutAmt = parseFloat(item.payoutAmount) || 0;
            const tds = Math.round(payoutAmt * 0.02 * 100) / 100;
            const sgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
            const cgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
            const netAmt = Math.round((payoutAmt - tds - sgst - cgst) * 100) / 100;

            if (isPaid) {
                paidC++;
                paidA += netAmt;
            } else {
                pendC++;
                pendA += netAmt;
            }
        });

        return {
            ...summary,
            paidCount: paidC,
            pendingCount: pendC,
            paidAmountFormatted: formatINR(paidA),
            pendingAmountFormatted: formatINR(pendA)
        };
    }, [payouts, approvalMap, summary, isGstRegistered]);

    const ListHeader = useMemo(() => (
        <View>
            <View style={styles.summaryWrapper}>
                <PayoutSummaryCard summary={dynamicSummary} />
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
    ), [dynamicSummary, statusTab, statusTabs, filtered.length, colors]);

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
        <ScreenWrapper withPadding={false} edges={['left', 'right']} style={styles.root}>
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
                contentContainerStyle={{ paddingBottom: 16 }}
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

            <AppStatusModal
                visible={downloadModal.visible}
                type="success"
                title="Invoice Downloaded"
                message={`Saved as:\n${downloadModal.fileName}\n\nYou can find it in your Downloads folder.`}
                buttonText="Open PDF"
                cancelText="Close"
                showConfirm={true}
                onConfirm={async () => {
                    try {
                        await openDownloadedPdf(downloadModal.filePath);
                    } catch (e) {
                        showToast('error', 'Error', e.message);
                    }
                }}
                onClose={() => setDownloadModal({ visible: false, fileName: '', filePath: '' })}
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


