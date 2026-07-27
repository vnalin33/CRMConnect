import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity, Alert,
    ActivityIndicator, FlatList, Platform, PermissionsAndroid,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { generatePDF } from 'react-native-html-to-pdf';
import { downloadInvoicePdf, openDownloadedPdf } from '../../utils/downloadPdf';
import Share from 'react-native-share';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import { scale, fs } from '../../theme/metrics';
import AppText from '../common/AppText';
import { getPayoutsApi } from '../../api/payoutApi';
import { generateInvoice, generateCycleInvoice, getInvoicesByTrackIds } from '../../api/invoiceApi';
import { submitInvoiceRequest, getInvoiceRequestStatuses, getInvoiceHtmlByTrackId } from '../../api/invoiceRequestApi';
import { buildInvoiceHTML } from '../../utils/invoiceTemplate';
import { useToast } from '../../context/ToastContext';
import { useProfile } from '../../hooks/useProfile';
import { useAlert } from '../../context/AlertContext';

const GST_RATE = 0.09;
const AVATAR_COLORS = ['#816FF5', '#2DBFE6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
const formatINR = (n) => '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Generate month labels dynamically from account creation date to now
const generateMonthPeriods = (accountCreatedDate) => {
    const months = [];
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    let startDate;
    if (accountCreatedDate) {
        startDate = new Date(accountCreatedDate);
        // If parsing fails, fallback to 12 months ago
        if (isNaN(startDate.getTime())) {
            startDate = new Date(nowYear, nowMonth - 11, 1);
        }
    } else {
        // Fallback: last 12 months
        startDate = new Date(nowYear, nowMonth - 11, 1);
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();

    // Calculate total months from start to now
    const totalMonths = (nowYear - startYear) * 12 + (nowMonth - startMonth) + 1;

    for (let i = 0; i < totalMonths; i++) {
        const d = new Date(nowYear, nowMonth - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        months.push({ key, label });
    }
    return months;
};

const MonthPill = React.memo(({ label, active, onPress }) => {
    const { colors, radius, spacing } = useTheme();
    if (active) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
                <LinearGradient
                    colors={BRAND_GRADIENT.colors} start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end} locations={BRAND_GRADIENT.locations}
                    style={[s.monthPill, { borderRadius: radius.full }]}
                >
                    <AppText variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>{label}</AppText>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}
            style={[s.monthPill, { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
        >
            <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '500' }}>{label}</AppText>
        </TouchableOpacity>
    );
});

const StatBox = React.memo(({ icon, iconColor, iconBg, label, value }) => {
    const { colors, radius } = useTheme();
    return (
        <View style={s.statBox}>
            <View style={[s.statIcon, { backgroundColor: iconBg, borderRadius: radius.sm }]}>
                <MaterialCommunityIcons name={icon} size={scale(18)} color={iconColor} />
            </View>
            <AppText variant="caption" color="secondary" style={{ marginTop: 4 }} numberOfLines={1}>{label}</AppText>
            <AppText variant="bodySm" color="primary" style={{ fontWeight: '700', marginTop: 2 }} numberOfLines={1}>{value}</AppText>
        </View>
    );
});

const DisbursementCard = React.memo(({ item, invoice, approvalStatus, onGenerate, onShare, generating, isGstRegistered }) => {
    const { colors, radius, spacing } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const initials = getInitials(item.name);
    const avatarBg = getAvatarColor(item.name);
    const isGenerated = !!invoice;
    const tds = Math.round(item.payoutAmount * 0.02 * 100) / 100;
    const sgst = isGstRegistered ? 0 : Math.round(item.payoutAmount * GST_RATE * 100) / 100;
    const cgst = isGstRegistered ? 0 : Math.round(item.payoutAmount * GST_RATE * 100) / 100;
    const total = Math.round((item.payoutAmount - sgst - cgst - tds) * 100) / 100;

    // Determine display status
    const getStatusDisplay = () => {
        if (approvalStatus === 'paid') return { label: 'Paid', bgColor: '#DBEAFE', textColor: '#3B82F6' };
        if (approvalStatus === 'approved') return { label: 'Approved', bgColor: '#E0FAF3', textColor: colors.success };
        if (approvalStatus === 'rejected') return { label: 'Rejected', bgColor: '#FEE2E2', textColor: '#EF4444' };
        if (approvalStatus === 'pending') return { label: 'Pending Approval', bgColor: '#FEF3C7', textColor: '#F59E0B' };
        if (isGenerated) return { label: 'Invoice Raised', bgColor: '#E0FAF3', textColor: colors.success };
        return { label: 'Pending', bgColor: colors.infoBg, textColor: colors.primary };
    };
    const statusDisplay = getStatusDisplay();

    return (
        <View style={[s.disbCard, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={s.disbTopRow}>
                <View style={[s.avatar, { backgroundColor: avatarBg, borderRadius: radius.full }]}>
                    <AppText variant="bodySm" style={{ color: '#FFF', fontWeight: '700' }}>{initials}</AppText>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <AppText variant="h3" color="primary" style={{ fontWeight: '700' }}>{item.name}</AppText>
                    <AppText variant="caption" color="secondary">{item.loanType} - {item.date}</AppText>
                </View>
                {/* Dynamic status badge */}
                <View style={[s.statusBadge, { backgroundColor: statusDisplay.bgColor, borderRadius: radius.full }]}>
                    <AppText variant="caption" style={{ color: statusDisplay.textColor, fontWeight: '700', fontSize: 11 }}>{statusDisplay.label}</AppText>
                </View>
            </View>

            <View style={[s.disbValRow, { marginTop: spacing.sm, gap: scale(8) }]}>
                <View style={[s.disbValBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
                    <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>Disbursed</AppText>
                    <AppText variant="bodySm" color="primary" style={{ fontWeight: '600' }}>{item.disbursedAmountFormatted}</AppText>
                </View>
                <View style={[s.disbValBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
                    <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>Payout</AppText>
                    <AppText variant="bodySm" style={{ color: colors.success, fontWeight: '700' }}>{item.payoutAmountFormatted}</AppText>
                </View>
                <View style={[s.disbValBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
                    <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>Total Amount</AppText>
                    <AppText variant="bodySm" color="primary" style={{ fontWeight: '600' }}>{formatINR(total)}</AppText>
                </View>
            </View>

            <View style={[s.disbBottomRow, { marginTop: spacing.md }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textSecondary} />
                    <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                        {invoice ? `#${invoice.invoiceNumber}` : '#Pending'}
                    </AppText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={[s.chevronBtn, { backgroundColor: colors.surfaceElevated, borderRadius: radius.full }]}>
                        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
                    </TouchableOpacity>

                    {isGenerated ? (
                        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                            <TouchableOpacity onPress={() => onShare(item, invoice, 'pdf', approvalStatus)}
                                style={[s.actionBtn, { backgroundColor: colors.cyan, borderRadius: radius.md }]}>
                                <AppText variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>
                                    {approvalStatus === 'paid' ? 'Download Invoice' : 'PDF'}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => onGenerate(item)} disabled={generating}
                            style={{ overflow: 'hidden', borderRadius: radius.md }}>
                            <LinearGradient colors={BRAND_GRADIENT.colors} start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end} locations={BRAND_GRADIENT.locations}
                                style={s.actionBtn}>
                                {generating ? <ActivityIndicator size="small" color="#FFF" /> :
                                    <AppText variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>Raise Invoice</AppText>}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isExpanded && (
                <View style={[s.breakdownSection, { borderTopColor: colors.divider, marginTop: spacing.md, paddingTop: spacing.md }]}>
                    <AppText variant="caption" color="primary" style={{ fontWeight: '800', marginBottom: spacing.sm }}>INVOICE BREAKDOWN</AppText>

                    <View style={s.breakdownRow}>
                        <AppText variant="caption" color="secondary">Loan Amount</AppText>
                        <AppText variant="caption" color="primary" style={{ fontWeight: '600' }}>{item.loanAmountFormatted}</AppText>
                    </View>
                    <View style={s.breakdownRow}>
                        <AppText variant="caption" color="secondary">Disbursed Amount</AppText>
                        <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>{item.disbursedAmountFormatted}</AppText>
                    </View>
                    <View style={s.breakdownRow}>
                        <AppText variant="caption" color="secondary">Payout Amount</AppText>
                        <AppText variant="caption" color="primary" style={{ fontWeight: '600' }}>{item.payoutAmountFormatted}</AppText>
                    </View>
                    <View style={s.breakdownRow}>
                        <AppText variant="caption" color="secondary">Subtotal</AppText>
                        <AppText variant="caption" color="primary" style={{ fontWeight: '600' }}>{item.payoutAmountFormatted}</AppText>
                    </View>
                    {!isGstRegistered && (
                        <>
                            <View style={s.breakdownRow}>
                                <AppText variant="caption" color="secondary">SGST (9%)</AppText>
                                <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '600' }}>{'- ' + formatINR(sgst)}</AppText>
                            </View>
                            <View style={s.breakdownRow}>
                                <AppText variant="caption" color="secondary">CGST (9%)</AppText>
                                <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '600' }}>{'- ' + formatINR(cgst)}</AppText>
                            </View>
                        </>
                    )}
                    <View style={s.breakdownRow}>
                        <AppText variant="caption" color="secondary">TDS (2%)</AppText>
                        <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '600' }}>{'- ' + formatINR(tds)}</AppText>
                    </View>

                    <View style={[s.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: spacing.sm, paddingTop: spacing.sm, marginBottom: 0 }]}>
                        <AppText variant="bodySm" color="primary" style={{ fontWeight: '800' }}>Grand Total</AppText>
                        <AppText variant="body" color="cyan" style={{ fontWeight: '800', color: colors.cyan }}>{formatINR(total)}</AppText>
                    </View>
                </View>
            )}
        </View>
    );
});

const InvoiceListTab = ({ type = 'cycle' }) => {
    const { colors, spacing, radius } = useTheme();
    const { showToast } = useToast();
    const { profileData } = useProfile();
    const { showAlert } = useAlert();
    const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
        profileData?.taxDetails?.gst &&
        profileData?.taxDetails?.gst !== 'Not Provided';

    const monthPeriods = useMemo(() => generateMonthPeriods(profileData?.accountCreatedDate), [profileData?.accountCreatedDate]);
    const [selectedMonth, setSelectedMonth] = useState(monthPeriods[0]?.key);
    const [payouts, setPayouts] = useState([]);
    const [invoiceMap, setInvoiceMap] = useState({});
    const [approvalMap, setApprovalMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);
    const [generatingAll, setGeneratingAll] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Fetch payouts
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getPayoutsApi();
            const data = result.success && result.data?.length ? result.data : [];
            setPayouts(data);
            // Fetch invoice status
            if (data.length) {
                const trackIds = data.map(p => p.id);
                try {
                    const map = await getInvoicesByTrackIds(trackIds);
                    setInvoiceMap(map || {});
                } catch { setInvoiceMap({}); }
            }
            // Fetch approval statuses from CRM admin backend
            try {
                const statusResult = await getInvoiceRequestStatuses();
                if (statusResult.success && statusResult.data) {
                    const aMap = {};
                    for (const req of statusResult.data) {
                        // Use track_id for reliable matching
                        if (req.track_id) {
                            aMap[req.track_id] = req.status; // pending/approved/rejected/paid
                        }
                    }
                    setApprovalMap(aMap);
                }
            } catch { /* silent */ }
        } catch (err) {
            console.log('Failed to fetch cycle data:', err.message);
            setErrorMsg(err.message);
            setPayouts([]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Group by month and filter by type
    const groupedByMonth = useMemo(() => {
        const groups = {};
        for (const p of payouts) {
            const svcType = (p.serviceType || '').toLowerCase();
            const procType = (p.processingType || '').toLowerCase();
            const pType = (svcType.includes('cycle') || procType.includes('cycle')) ? 'cycle' : 'instant';
            if (pType !== type) continue;

            let key = 'unknown';
            if (p.dateRaw) {
                const d = new Date(p.dateRaw);
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } else if (p.date) {
                try {
                    const d = new Date(p.date);
                    if (!isNaN(d)) key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                } catch { }
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        }
        return groups;
    }, [payouts, type]);

    const currentItems = groupedByMonth[selectedMonth] || [];
    const selectedLabel = monthPeriods.find(m => m.key === selectedMonth)?.label || selectedMonth;

    // Summary calculations
    const summary = useMemo(() => {
        let totalDisbursed = 0, totalPayout = 0;
        for (const item of currentItems) {
            totalDisbursed += item.disbursedAmount || 0;
            totalPayout += item.payoutAmount || 0;
        }
        const tds = Math.round(totalPayout * 0.02 * 100) / 100;
        const sgst = isGstRegistered ? 0 : Math.round(totalPayout * GST_RATE * 100) / 100;
        const cgst = isGstRegistered ? 0 : Math.round(totalPayout * GST_RATE * 100) / 100;
        const grandTotal = Math.round((totalPayout - sgst - cgst - tds) * 100) / 100;
        const pendingCount = currentItems.filter(i => !invoiceMap[i.id]).length;
        return { totalDisbursed, totalPayout, sgst, cgst, tds, grandTotal, pendingCount, total: currentItems.length };
    }, [currentItems, invoiceMap, isGstRegistered]);

    const handleGenerate = useCallback(async (item) => {
        setGenerating(item.id);
        try {
            // 1. Generate invoice locally (mobile backend)
            const inv = type === 'instant' ? await generateInvoice(item) : await generateCycleInvoice(item);
            setInvoiceMap(prev => ({ ...prev, [item.id]: inv }));

            // 2. Send invoice request to ONEBind Backend for admin approval
            try {
                const reqResult = await submitInvoiceRequest(item, type);
                if (reqResult.success) {
                    showToast('success', 'Invoice Raised', 'Invoice generated and request sent to admin for approval.');
                }
            } catch (reqErr) {
                // Don't block invoice generation if admin request fails
                console.warn('Admin request submission failed:', reqErr.message);
            }
        } catch (err) {
            showToast('error', 'Error', err.message || 'Failed to generate invoice');
        } finally { setGenerating(null); }
    }, [type]);

    const handleGenerateAll = useCallback(async () => {
        const pending = currentItems.filter(i => !invoiceMap[i.id]);
        if (!pending.length) { showToast('info', 'Info', 'All invoices already generated'); return; }
        setGeneratingAll(true);
        let success = 0;
        let adminSuccess = 0;
        for (const item of pending) {
            try {
                // 1. Generate local invoice
                const inv = type === 'instant' ? await generateInvoice(item) : await generateCycleInvoice(item);
                setInvoiceMap(prev => ({ ...prev, [item.id]: inv }));
                success++;

                // 2. Submit admin request
                try {
                    const reqResult = await submitInvoiceRequest(item, type);
                    if (reqResult.success) adminSuccess++;
                } catch (reqErr) {
                    console.warn(`Admin request failed for ${item.name}:`, reqErr.message);
                }
            } catch (err) { console.error(`Failed for ${item.name}:`, err); }
        }
        setGeneratingAll(false);
        showToast('success', 'Done', `Raised ${success} of ${pending.length} invoices.\n(${adminSuccess} sent for admin approval)`);
    }, [currentItems, invoiceMap, type]);

    const handleShareOrPdf = useCallback(async (item, invoice, mode, approvalStatus) => {
        if (!invoice) return;
        try {
            showToast('info', 'Downloading', 'Preparing invoice PDF...');
            
            let html;
            // If the status is paid, fetch the final valid invoice from the backend
            if (approvalStatus === 'paid' && item.id) {
                try {
                    html = await getInvoiceHtmlByTrackId(item.id);
                } catch (e) {
                    console.warn('Failed to fetch backend PDF, falling back to local template', e);
                    html = buildInvoiceHTML(invoice);
                }
            } else {
                html = buildInvoiceHTML(invoice);
            }

            if (mode === 'pdf') {
                // Download to public Downloads folder
                const result = await downloadInvoicePdf(html, invoice.invoiceNumber);
                showToast('success', '✅ Invoice Downloaded', `Saved to Downloads:\n${result.fileName}`);

                // Prompt to open the PDF immediately
                showAlert({
                    type: 'success',
                    title: 'Download Complete',
                    message: `Invoice ${result.fileName} has been saved to your Downloads folder.`,
                    buttonText: 'Open PDF',
                    cancelText: 'Close',
                    showConfirm: true,
                    onConfirm: async () => {
                        try {
                            await openDownloadedPdf(result.filePath);
                        } catch (e) {
                            showToast('error', 'Error', e.message);
                        }
                    }
                });
            } else {
                // Share via share sheet (use private dir — share sheet can access it)
                const pdf = await generatePDF({ html, fileName: invoice.invoiceNumber, directory: 'Documents' });
                await Share.open({
                    title: `Invoice ${invoice.invoiceNumber}`,
                    message: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
                    url: Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
                    type: 'application/pdf',
                });
            }
        } catch (err) {
            if (err?.message !== 'User did not share') {
                console.error('Share/PDF error:', err);
                showToast('error', 'Error', err.message || 'Failed to process invoice');
            }
        }
    }, []);

    if (loading) {
        return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={{ paddingBottom: 120 }}>
            {/* Info Banner */}
            <View style={[s.banner, { backgroundColor: colors.cyanBg, marginHorizontal: spacing.base, marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.md }]}>
                <Feather name="info" size={scale(16)} color={colors.cyan} />
                <AppText variant="caption" style={{ color: colors.cyan, marginLeft: spacing.sm, flex: 1, fontWeight: '600' }}>
                    {type === 'cycle'
                        ? "Cycle Payout - Consolidated invoice for all disbursements in the selected cycle period"
                        : "Instant Payout - Individual invoices for immediate disbursements"}
                </AppText>
            </View>

            {/* SELECT CYCLE PERIOD */}
            <AppText variant="label" color="secondary" style={{ marginHorizontal: spacing.base, marginTop: spacing.lg, marginBottom: spacing.sm }}>
                {type === 'cycle' ? 'SELECT CYCLE PERIOD' : 'SELECT DISBURSEMENT MONTH'}
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.xs }}>
                {monthPeriods.map(m => (
                    <MonthPill key={m.key} label={m.label} active={selectedMonth === m.key}
                        onPress={() => setSelectedMonth(m.key)} />
                ))}
            </ScrollView>

            {/* Summary Card */}
            <View style={[s.summaryCard, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.xl, marginHorizontal: spacing.base, marginTop: spacing.md, padding: spacing.base }]}>
                <View style={s.summaryTopRow}>
                    <View>
                        <AppText variant="caption" color="secondary" style={{ fontWeight: '600' }}>
                            {type === 'cycle' ? 'CYCLE PERIOD' : 'DISBURSEMENT MONTH'}
                        </AppText>
                        <AppText variant="h1" color="primary" style={{ fontWeight: '800' }}>{selectedLabel}</AppText>
                    </View>
                    <View style={[s.disbBadge, { backgroundColor: colors.infoBg, borderRadius: radius.full }]}>
                        <Feather name="edit-3" size={12} color={colors.primary} />
                        <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', marginLeft: 4 }}>
                            {summary.total} Disbursement
                        </AppText>
                    </View>
                </View>

                <View style={[s.statsRow, { marginTop: spacing.md }]}>
                    <StatBox icon="cash-multiple" iconColor="#10B981" iconBg={colors.successBg || '#E0FAF3'}
                        label="Total Disbursed" value={formatINR(summary.totalDisbursed)} />
                    <StatBox icon="wallet-outline" iconColor={colors.primary} iconBg={colors.infoBg || '#EDEAFF'}
                        label="Total Payout" value={formatINR(summary.totalPayout)} />
                    <StatBox icon="account-cash-outline" iconColor={colors.cyan} iconBg={colors.cyanBg || '#E0F7FA'}
                        label="Grand Total" value={formatINR(summary.grandTotal)} />
                </View>

                <View style={[s.taxRow, { borderTopColor: colors.divider, marginTop: spacing.md, paddingTop: spacing.sm }]}>
                    <AppText variant="h1" color="primary" style={{ fontWeight: '800' }}>{formatINR(summary.grandTotal)}</AppText>
                    <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginLeft: 16 }}>
                        {!isGstRegistered && (
                            <>
                                <View style={s.taxCol}>
                                    <AppText variant="caption" color="secondary" style={{ fontSize: fs(10) }}>SGST (9%)</AppText>
                                    <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '700' }}>{'- ' + formatINR(summary.sgst)}</AppText>
                                </View>
                                <View style={s.taxCol}>
                                    <AppText variant="caption" color="secondary" style={{ fontSize: fs(10) }}>CGST (9%)</AppText>
                                    <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '700' }}>{'- ' + formatINR(summary.cgst)}</AppText>
                                </View>
                            </>
                        )}
                        <View style={s.taxCol}>
                            <AppText variant="caption" color="secondary" style={{ fontSize: fs(10) }}>TDS (2%)</AppText>
                            <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '700' }}>{'- ' + formatINR(summary.tds)}</AppText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Generate All Button */}
            {currentItems.length > 0 && (
                <TouchableOpacity activeOpacity={0.8} onPress={handleGenerateAll} disabled={generatingAll || summary.pendingCount === 0}
                    style={{ marginHorizontal: spacing.base, marginTop: spacing.md }}>
                    <LinearGradient colors={BRAND_GRADIENT.colors} start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end} locations={BRAND_GRADIENT.locations}
                        style={[s.generateAllBtn, { borderRadius: radius.full, opacity: summary.pendingCount === 0 ? 0.6 : 1 }]}>
                        {generatingAll ? <ActivityIndicator color="#FFF" size="small" /> :
                            <AppText variant="body" style={{ color: '#FFF', fontWeight: '700' }}>
                                {summary.pendingCount > 0 ? `Raise All Invoices (${summary.pendingCount} Pending)` : 'All Invoices Raised'}
                            </AppText>}
                    </LinearGradient>
                </TouchableOpacity>
            )}



            {/* Payout & Disbursement List */}
            <View style={[s.listHeader, { marginHorizontal: spacing.base, marginTop: spacing.lg }]}>
                <AppText variant="h3" color="primary" style={{ fontWeight: '700' }}>Payout & Disbursement List</AppText>
                <AppText variant="caption" color="secondary">{currentItems.length} entries</AppText>
            </View>

            {currentItems.length === 0 ? (
                <View style={s.emptyState}>
                    {errorMsg ? (
                        <>
                            <Feather name="alert-circle" size={40} color={colors.error || '#EF4444'} />
                            <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: 20 }}>
                                {errorMsg}
                            </AppText>
                            <TouchableOpacity onPress={fetchData} style={{ marginTop: spacing.md }}>
                                <AppText variant="bodySm" style={{ color: colors.primary, fontWeight: '700' }}>Tap to Retry</AppText>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Feather name="inbox" size={40} color={colors.textSecondary} />
                            <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
                                No disbursements for this period
                            </AppText>
                            <TouchableOpacity onPress={fetchData} style={{ marginTop: spacing.md }}>
                                <AppText variant="bodySm" style={{ color: colors.primary, fontWeight: '700' }}>Refresh Data</AppText>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ) : (
                currentItems.map(item => (
                    <View key={item.id} style={{ marginHorizontal: spacing.base, marginBottom: spacing.sm }}>
                        <DisbursementCard item={item} invoice={invoiceMap[item.id]}
                            approvalStatus={approvalMap[item.id]}
                            onGenerate={handleGenerate}
                            onShare={handleShareOrPdf}
                            generating={generating === item.id}
                            isGstRegistered={isGstRegistered}
                        />
                    </View>
                ))
            )}
        </View>
    );
};

const s = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
    banner: { flexDirection: 'row', alignItems: 'center' },
    monthPill: { paddingHorizontal: scale(14), paddingVertical: scale(8), marginRight: scale(4) },
    summaryCard: { borderWidth: 1 },
    summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    disbBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(10), paddingVertical: scale(4) },
    statsRow: { flexDirection: 'row', gap: scale(8) },
    statBox: { flex: 1, alignItems: 'center' },
    statIcon: { width: scale(36), height: scale(36), alignItems: 'center', justifyContent: 'center' },
    taxRow: { flexDirection: 'row', borderTopWidth: 1 },
    taxCol: { flex: 1, alignItems: 'center' },
    generateAllBtn: { paddingVertical: scale(14), alignItems: 'center', justifyContent: 'center', elevation: 3 },
    actionRow: { flexDirection: 'row' },
    outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, paddingVertical: scale(10) },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(10) },
    disbCard: { borderWidth: 1, padding: scale(14) },
    disbTopRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: scale(40), height: scale(40), alignItems: 'center', justifyContent: 'center' },
    statusBadge: { paddingHorizontal: scale(10), paddingVertical: scale(4) },
    disbValRow: { flexDirection: 'row' },
    disbValBox: { flex: 1, alignItems: 'center', paddingVertical: scale(8), paddingHorizontal: scale(4) },
    disbBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actionBtn: { paddingHorizontal: scale(14), paddingVertical: scale(6), alignItems: 'center', justifyContent: 'center' },
    chevronBtn: { width: scale(28), height: scale(28), alignItems: 'center', justifyContent: 'center' },
    breakdownSection: { borderTopWidth: 1 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(6) },
    emptyState: { alignItems: 'center', marginTop: 60 },
});

export default InvoiceListTab;
