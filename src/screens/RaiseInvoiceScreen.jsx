import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generatePDF } from 'react-native-html-to-pdf';
import { downloadInvoicePdf, openDownloadedPdf } from '../utils/downloadPdf';
import Share from 'react-native-share';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import { scale, fs } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { generateInvoice, getInvoicesByTrackIds } from '../api/invoiceApi';
import { buildInvoiceHTML } from '../utils/invoiceTemplate';
import InvoiceListTab from '../components/invoice/InvoiceListTab';
import { submitInvoiceRequest, getInvoiceRequestStatuses } from '../api/invoiceRequestApi';
import { ENV } from '../config/env';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../context/ToastContext';
import { useAlert } from '../context/AlertContext';



// ─── Sub-Components ─────────────────────────────────────────────────────────

const GridRow = React.memo(({ label, value, boldValue = false }) => (
    <View style={styles.gridItem}>
        <AppText variant="caption" color="secondary" style={styles.gridLabel}>{label}</AppText>
        <AppText variant="bodySm" color="primary" style={[styles.gridValue, boldValue && { fontWeight: '700' }]}>
            {value}
        </AppText>
    </View>
));

const BillRow = React.memo(({ label, value, isTotal = false }) => {
    const { colors } = useTheme();
    const isDeduction = typeof value === 'string' && value.startsWith('-');
    return (
        <View style={[styles.billRow, isTotal && styles.totalRow]} accessibilityRole="text">
            <AppText variant={isTotal ? 'h3' : 'bodySm'} color={isTotal ? 'primary' : 'secondary'}>
                {label}
            </AppText>
            <AppText
                variant={isTotal ? 'h2' : 'bodySm'}
                style={isTotal ? { color: colors.primary, fontWeight: '800' } : { color: isDeduction ? '#EF4444' : colors.textPrimary, fontWeight: '600' }}
            >
                {value}
            </AppText>
        </View>
    );
});

const GradientButton = React.memo(({ label, icon, onPress, style, flex = 0, loading = false, disabled = false }) => {
    const { radius, colors } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            disabled={disabled || loading}
            style={flex ? { flex: 1 } : null}
        >
            <LinearGradient
                colors={BRAND_GRADIENT.colors}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
                locations={BRAND_GRADIENT.locations}
                style={[styles.primaryBtn, { borderRadius: radius.full, opacity: disabled ? 0.6 : 1 }, style]}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <>
                        {icon && <Feather name={icon} size={scale(16)} color="#FFF" style={{ marginRight: scale(6) }} />}
                        <AppText color="inverse" style={{ fontWeight: '700', fontSize: fs(13) }}>{label}</AppText>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
});

const OutlineButton = React.memo(({ label, icon, onPress, style, flex = 0, disabled = false }) => {
    const { radius, colors } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.outlineBtn,
                { borderColor: disabled ? (colors.textMuted || '#6B7280') : colors.primary, borderRadius: radius.full },
                flex ? { flex: 1 } : null,
                style
            ]}
        >
            {icon && (
                <Feather
                    name={icon}
                    size={14}
                    color={disabled ? (colors.textMuted || '#6B7280') : colors.primary}
                />
            )}
            <AppText
                variant="bodySm"
                style={{
                    color: disabled ? (colors.textMuted || '#6B7280') : colors.primary,
                    fontWeight: '700',
                    marginLeft: 6
                }}
            >
                {label}
            </AppText>
        </TouchableOpacity>
    );
});
// ─── Screen ──────────────────────────────────────────────────────────────────

// ─── Tab Toggle ─────────────────────────────────────────────────────────────

const TabToggle = React.memo(({ activeTab, onTabChange }) => {
    const { colors, radius, spacing } = useTheme();
    const tabs = [{ id: 'instant', label: 'Instant' }, { id: 'cycle', label: 'Cycle' }];
    return (
        <View style={[styles.tabToggleContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.full, marginHorizontal: spacing.base, marginTop: spacing.md, padding: scale(4) }]}>
            {tabs.map(tab => (
                tab.id === activeTab ? (
                    <TouchableOpacity key={tab.id} onPress={() => onTabChange(tab.id)} activeOpacity={0.85} style={{ flex: 1 }}>
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors} start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end} locations={BRAND_GRADIENT.locations}
                            style={[styles.tabPill, { borderRadius: radius.full, width: '100%' }]}
                        >
                            <AppText variant="bodySm" style={{ color: '#FFF', fontWeight: '700' }}>{tab.label}</AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity key={tab.id} onPress={() => onTabChange(tab.id)} activeOpacity={0.7}
                        style={[styles.tabPill, { flex: 1, width: '100%' }]}>
                        <AppText variant="bodySm" style={{ color: colors.textSecondary, fontWeight: '600' }}>{tab.label}</AppText>
                    </TouchableOpacity>
                )
            ))}
        </View>
    );
});

// ─── Screen ──────────────────────────────────────────────────────────────────

const RaiseInvoiceScreen = ({ navigation, route }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const { payoutData } = route?.params || {};
    const { profileData } = useProfile();
    const { showToast } = useToast();
    const { showAlert } = useAlert();

    const [activeTab, setActiveTab] = useState(payoutData ? 'instant' : 'cycle');
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pdfPath, setPdfPath] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [invoiceRequestStatus, setInvoiceRequestStatus] = useState(null); // {status, expected_payout_date, remarks}

    // Reset state when a different payout card is opened, and check if it was already generated
    const payoutId = payoutData?.id;
    useEffect(() => {
        if (payoutData) {
            setInvoice(null);
            setPdfPath(null);
            setInvoiceRequestStatus(null);

            const checkExisting = async () => {
                setLoading(true);
                try {
                    // Check for existing invoice
                    const map = await getInvoicesByTrackIds([payoutData.id]);
                    if (map && map[payoutData.id]) {
                        setInvoice(map[payoutData.id]);
                    }
                    // Check invoice request status from admin backend
                    const statusRes = await getInvoiceRequestStatuses();
                    if (statusRes.success && statusRes.data) {
                        const match = statusRes.data.find(r => r.track_id === parseInt(payoutData.id, 10));
                        if (match) {
                            setInvoiceRequestStatus(match);
                            // Set invoice.id if it's not set
                            if (map && map[payoutData.id]) {
                                setInvoice(prev => ({ ...prev, id: match.id }));
                            } else {
                                setInvoice({ id: match.id, trackNumber: match.track_id });
                            }
                        }
                    }
                } catch (err) {
                    console.log('No existing invoice found or check failed:', err);
                } finally {
                    setLoading(false);
                }
            };
            checkExisting();
        }
    }, [payoutId, payoutData]);

    /**
     * Call backend to generate unique invoice number and persist the record,
     * and send the request to the admin backend.
     */
    const handleGenerateInvoice = useCallback(async () => {
        if (!payoutData) {
            showToast('error', 'Error', 'No payout data available to generate invoice.');
            return;
        }
        setLoading(true);
        try {
            const result = await generateInvoice(payoutData);
            setInvoice(result);

            // Send invoice request to CRM admin backend for approval
            try {
                const reqResult = await submitInvoiceRequest(payoutData, payoutData.processingType ? payoutData.processingType.toLowerCase() : 'instant');
                if (reqResult.success) {
                    setInvoiceRequestStatus(reqResult.data || { status: 'pending' });
                    showToast('success', 'Invoice Raised', 'Invoice generated and request sent to admin for approval.');
                }
            } catch (reqErr) {
                console.warn('Admin request submission failed:', reqErr.message);
            }
        } catch (err) {
            console.error('Invoice generation failed:', err);
            showToast('error', 'Error', err.message || 'Failed to generate invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [payoutData]);

    /**
     * Request storage permission on Android < 13 (SDK 33).
     */
    /**
     * Generate PDF from HTML and save to device's Downloads folder.
     */
    const handleDownloadPDF = useCallback(async () => {
        if (!invoice) return;

        setGenerating(true);
        try {
            let html = '';
            if (invoice.id) { // It's an existing/submitted invoice, fetch from backend
                try {
                    const response = await fetch(`${ENV.CRM_API_URL}/invoice-requests/${invoice.id}/invoice-html`);
                    if (response.ok) {
                        html = await response.text();
                    }
                } catch (e) {
                    console.warn('Failed to fetch HTML from backend, falling back to local builder', e);
                }
            }
            if (!html) {
                const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
                    profileData?.taxDetails?.gst &&
                    profileData?.taxDetails?.gst !== 'Not Provided';
                const localData = {
                    ...invoice,
                    isGstRegistered,
                    billToName: profileData?.personalInfo?.name,
                    billToAddress: profileData?.personalInfo?.address,
                    billToPhone: profileData?.personalInfo?.mobile,
                    billToEmail: profileData?.personalInfo?.email,
                    billToPan: profileData?.taxDetails?.pan,
                    billToGst: profileData?.taxDetails?.gst,
                };
                html = buildInvoiceHTML(localData);
            }

            const result = await downloadInvoicePdf(html, invoice.invoiceNumber || 'Invoice');
            setPdfPath(result.filePath);
            showToast('success', '✅ Invoice Downloaded', `Saved to Downloads:\n${result.fileName}`);

            // Industry Standard prompt to view/open the PDF immediately
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
        } catch (err) {
            console.error('PDF generation failed:', err);
            showToast('error', 'Error', err.message || 'Failed to generate PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    }, [invoice, profileData]);

    // Handle autoDownload
    useEffect(() => {
        if (route?.params?.autoDownload && invoice && !generating && !pdfPath) {
            // Wait slightly for states to settle
            const timer = setTimeout(() => {
                handleDownloadPDF();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [invoice, route?.params?.autoDownload, generating, pdfPath, handleDownloadPDF]);

    /**
     * Share the invoice PDF via native share sheet.
     */
    const handleShareInvoice = useCallback(async () => {
        if (!invoice) return;

        setGenerating(true);
        try {
            // Generate PDF first if not already generated
            let filePath = pdfPath;
            if (!filePath) {
                let html = '';
                if (invoice.id) { // It's an existing/submitted invoice, fetch from backend
                    try {
                        const response = await fetch(`${ENV.CRM_API_URL}/invoice-requests/${invoice.id}/invoice-html`);
                        if (response.ok) {
                            html = await response.text();
                        }
                    } catch (e) {
                        console.warn('Failed to fetch HTML from backend, falling back to local builder', e);
                    }
                }
                if (!html) {
                    const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
                        profileData?.taxDetails?.gst &&
                        profileData?.taxDetails?.gst !== 'Not Provided';
                    const localData = {
                        ...invoice,
                        isGstRegistered,
                        billToName: profileData?.personalInfo?.name,
                        billToAddress: profileData?.personalInfo?.address,
                        billToPhone: profileData?.personalInfo?.mobile,
                        billToEmail: profileData?.personalInfo?.email,
                        billToPan: profileData?.taxDetails?.pan,
                        billToGst: profileData?.taxDetails?.gst,
                    };
                    html = buildInvoiceHTML(localData);
                }
                const pdf = await generatePDF({
                    html,
                    fileName: `${invoice.invoiceNumber || 'Invoice'}`,
                    directory: 'Documents',
                });
                filePath = pdf.filePath;
                setPdfPath(filePath);
            }

            await Share.open({
                title: `Invoice ${invoice.invoiceNumber}`,
                message: `Invoice ${invoice.invoiceNumber} for ${invoice.customerName} - Total: ${invoice.grandTotalFormatted}`,
                url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
                type: 'application/pdf',
                subject: `Invoice ${invoice.invoiceNumber}`,
            });
        } catch (err) {
            // User cancelled share — ignore
            if (err?.message !== 'User did not share') {
                console.error('Share failed:', err);
            }
        } finally {
            setGenerating(false);
        }
    }, [invoice, pdfPath, profileData]);

    /**
     * Build formatted data for display.
     *
     * GST & TDS Logic:
     * - GST Registered:   Grand Total = Payout − TDS (2%)
     * - NOT GST Registered: Grand Total = Payout − SGST (9%) − CGST (9%) − TDS (2%)
     * All deductions are shown in red.
     */
    const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
        profileData?.taxDetails?.gst &&
        profileData?.taxDetails?.gst !== 'Not Provided';

    const getDisplayData = () => {
        const formatINR = (n) => '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const buildBreakdown = (payoutAmt) => {
            const tdsAmt = Math.round(payoutAmt * 0.02 * 100) / 100;

            if (isGstRegistered) {
                // GST registered: only TDS deducted
                const grandTotal = Math.round((payoutAmt - tdsAmt) * 100) / 100;
                return {
                    sgstAmt: 0,
                    cgstAmt: 0,
                    tdsAmt,
                    grandTotal,
                };
            }

            // NOT GST registered: SGST + CGST + TDS deducted
            const sgstAmt = Math.round(payoutAmt * 0.09 * 100) / 100;
            const cgstAmt = Math.round(payoutAmt * 0.09 * 100) / 100;
            const grandTotal = Math.round((payoutAmt - sgstAmt - cgstAmt - tdsAmt) * 100) / 100;
            return { sgstAmt, cgstAmt, tdsAmt, grandTotal };
        };

        if (invoice) {
            const payoutAmt = invoice.payoutAmount || 0;
            const { sgstAmt, cgstAmt, tdsAmt, grandTotal } = buildBreakdown(payoutAmt);

            return {
                invoiceNumber: invoice.invoiceNumber,
                date: invoice.dateFormatted,
                customer: invoice.customerName,
                loanType: invoice.loanType,
                serviceType: invoice.serviceType,
                processingType: invoice.processingType,
                loanAmount: invoice.loanAmountFormatted,
                disbursedAmount: invoice.disbursedAmountFormatted,
                bankName: invoice.bankName,
                trackNumber: invoice.trackNumber,
                payoutAmount: formatINR(payoutAmt),
                sgst: '- ' + formatINR(sgstAmt),
                cgst: '- ' + formatINR(cgstAmt),
                tds: '- ' + formatINR(tdsAmt),
                total: formatINR(grandTotal),
                isGstRegistered,
            };
        }
        // Show placeholder from payoutData while invoice is being generated
        if (payoutData) {
            const payoutAmt = payoutData.payoutAmount || 0;
            const { sgstAmt, cgstAmt, tdsAmt, grandTotal } = buildBreakdown(payoutAmt);

            return {
                invoiceNumber: loading ? 'Generating...' : '#Pending',
                date: payoutData.date || '',
                customer: payoutData.name || 'N/A',
                loanType: payoutData.loanType || 'N/A',
                serviceType: payoutData.serviceType || 'N/A',
                processingType: payoutData.processingType || 'Instant',
                loanAmount: payoutData.loanAmountFormatted || formatINR(payoutData.loanAmount || 0),
                disbursedAmount: payoutData.disbursedAmountFormatted || formatINR(payoutData.disbursedAmount || 0),
                bankName: payoutData.bankName || '',
                trackNumber: payoutData.trackNumber || '',
                payoutAmount: formatINR(payoutAmt),
                sgst: '- ' + formatINR(sgstAmt),
                cgst: '- ' + formatINR(cgstAmt),
                tds: '- ' + formatINR(tdsAmt),
                total: formatINR(grandTotal),
                isGstRegistered,
                billToName: profileData?.personalInfo?.name,
                billToAddress: profileData?.personalInfo?.address,
                billToPhone: profileData?.personalInfo?.mobile,
                billToEmail: profileData?.personalInfo?.email,
                billToPan: profileData?.taxDetails?.pan,
                billToGst: profileData?.taxDetails?.gst,
            };
        }
        return null;
    };

    const displayData = getDisplayData();

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            <GradientScreenHeader
                title="Raise Invoice"
                showBack
                navigation={navigation}
                onBackPress={() => {
                    if (route?.params?.payoutData) {
                        navigation.navigate('Payout');
                    } else {
                        navigation.goBack();
                    }
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.base }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Tab Toggle - Only show if not viewing a specific invoice */}
                {!payoutData && <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />}

                {/* List Views */}
                {!payoutData && activeTab === 'cycle' && <InvoiceListTab type="cycle" />}
                {!payoutData && activeTab === 'instant' && <InvoiceListTab type="instant" />}

                {/* Single Invoice View */}
                {payoutData && displayData && (
                    <View>
                        {/* Info Banner */}
                        <View
                            style={[
                                styles.banner,
                                {
                                    backgroundColor: colors.cyanBg,
                                    marginHorizontal: spacing.base,
                                    marginTop: spacing.md,
                                    marginBottom: spacing.md,
                                    padding: spacing.sm,
                                    borderRadius: radius.md,
                                }
                            ]}
                            accessibilityRole="text"
                        >
                            <Feather name="info" size={scale(16)} color={colors.cyan} />
                            <AppText
                                variant="caption"
                                style={{
                                    color: colors.cyan,
                                    marginLeft: spacing.sm,
                                    flex: 1,
                                    fontWeight: '600',
                                }}
                            >
                                {isGstRegistered
                                    ? 'GST Registered — TDS (2%) deducted from payout'
                                    : 'GST Not Registered — SGST, CGST & TDS deducted from payout'}
                            </AppText>
                        </View>

                        {/* Invoice Template */}
                        <View style={[styles.templateContainer, { backgroundColor: colors.surface, marginTop: spacing.xs }]}>
                            {/* Template Header */}
                            <View style={[styles.templateHeader, { paddingHorizontal: spacing.base, paddingBottom: spacing.base }]}>
                                <View style={styles.companyRow}>
                                    <View style={[styles.logoBox, { backgroundColor: colors.primaryLight, borderRadius: radius.md }]}>
                                        <MaterialCommunityIcons name="office-building" size={scale(24)} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                        <AppText variant="h3" color="primary">OneAssist Pvt. Ltd.</AppText>
                                        <AppText variant="caption" color="secondary">GST: 33AAFFO7105H1ZI</AppText>
                                    </View>
                                    <View>
                                        <AppText color="secondary" style={{ fontSize: fs(11), fontWeight: '600' }}>Invoice No:</AppText>
                                        <AppText color="primary" style={{ fontWeight: '800', fontSize: fs(13) }}>
                                            {loading ? 'Generating...' : displayData.invoiceNumber}
                                        </AppText>
                                    </View>
                                </View>
                            </View>

                            {/* Details Grid */}
                            <View style={[styles.gridContainer, { borderTopWidth: 1, borderTopColor: colors.divider, padding: spacing.base }]}>
                                <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                                    <GridRow label="Invoice Date" value={displayData.date} />
                                    <GridRow label="Customer Name" value={displayData.customer} />
                                </View>
                                <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                                    <GridRow label="Loan Type" value={displayData.loanType} />
                                    <GridRow label="Service Type" value={displayData.serviceType} />
                                </View>
                                <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                                    <GridRow label="Loan Amount" value={displayData.loanAmount} />
                                    <GridRow label="Disbursed Amount" value={displayData.disbursedAmount} />
                                </View>
                                <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                                    <GridRow label="Payout Type" value={displayData.processingType} boldValue />
                                    {displayData.bankName ? <GridRow label="Bank" value={displayData.bankName} /> : <View style={{ flex: 1 }} />}
                                </View>
                                {displayData.trackNumber ? (
                                    <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                                        <GridRow label="Track Number" value={displayData.trackNumber} />
                                    </View>
                                ) : null}
                            </View>

                            {/* Bill Breakdown */}
                            <View style={[styles.billBreakdown, { backgroundColor: colors.surfaceElevated, padding: spacing.base }]}>
                                <BillRow label="Payout Amount" value={displayData.payoutAmount} />
                                <View style={[styles.miniDivider, { backgroundColor: colors.divider }]} />

                                {/* GST Deductions - Only show when NOT GST registered */}
                                {!displayData.isGstRegistered && (
                                    <>
                                        <BillRow label="SGST (9%)" value={displayData.sgst} />
                                        <BillRow label="CGST (9%)" value={displayData.cgst} />
                                    </>
                                )}

                                {/* TDS Deduction - Always applied */}
                                <BillRow label="TDS (2%)" value={displayData.tds} />

                                <View style={[styles.thickDivider, { backgroundColor: colors.primary }]} />
                                <BillRow label="Grand Total" value={displayData.total} isTotal />
                            </View>
                        </View>

                        {/* Invoice Status Badge */}
                        {invoiceRequestStatus && (
                            <View style={{
                                marginHorizontal: spacing.base,
                                marginTop: spacing.md,
                                padding: spacing.sm,
                                borderRadius: radius.md,
                                backgroundColor: invoiceRequestStatus.status === 'approved' ? '#D1FAE5'
                                    : invoiceRequestStatus.status === 'rejected' ? '#FEE2E2'
                                        : invoiceRequestStatus.status === 'paid' ? '#DBEAFE'
                                            : '#FEF3C7',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <Feather
                                    name={invoiceRequestStatus.status === 'approved' ? 'check-circle'
                                        : invoiceRequestStatus.status === 'rejected' ? 'x-circle'
                                            : invoiceRequestStatus.status === 'paid' ? 'credit-card'
                                                : 'clock'}
                                    size={scale(16)}
                                    color={invoiceRequestStatus.status === 'approved' ? '#10B981'
                                        : invoiceRequestStatus.status === 'rejected' ? '#EF4444'
                                            : invoiceRequestStatus.status === 'paid' ? '#3B82F6'
                                                : '#F59E0B'}
                                />
                                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                                    <AppText variant="bodySm" style={{
                                        fontWeight: '700',
                                        color: invoiceRequestStatus.status === 'approved' ? '#10B981'
                                            : invoiceRequestStatus.status === 'rejected' ? '#EF4444'
                                                : invoiceRequestStatus.status === 'paid' ? '#3B82F6'
                                                    : '#F59E0B',
                                    }}>
                                        Status: {invoiceRequestStatus.status?.charAt(0).toUpperCase() + invoiceRequestStatus.status?.slice(1)}
                                    </AppText>
                                    {invoiceRequestStatus.expected_payout_date && (
                                        <AppText variant="caption" style={{ color: '#10B981', fontWeight: '600', marginTop: 2 }}>
                                            Expected Payout: {new Date(invoiceRequestStatus.expected_payout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </AppText>
                                    )}
                                    {invoiceRequestStatus.remarks && (
                                        <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '500', marginTop: 2, fontStyle: 'italic' }}>
                                            Remarks: {invoiceRequestStatus.remarks}
                                        </AppText>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.lg }}>
                            {invoiceRequestStatus ? (
                                /* Invoice already raised — show disabled button */
                                <View style={{
                                    paddingVertical: spacing.md,
                                    backgroundColor: colors.surfaceElevated,
                                    borderRadius: radius.full,
                                    borderWidth: 1.5,
                                    borderColor: invoiceRequestStatus.status === 'paid' ? '#3B82F6' : '#10B981',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    marginBottom: spacing.sm,
                                    opacity: 0.8,
                                }}>
                                    <Feather
                                        name={invoiceRequestStatus.status === 'paid' ? 'check' : 'file-text'}
                                        size={scale(16)}
                                        color={invoiceRequestStatus.status === 'paid' ? '#3B82F6' : '#10B981'}
                                        style={{ marginRight: scale(6) }}
                                    />
                                    <AppText style={{
                                        fontWeight: '700',
                                        fontSize: fs(13),
                                        color: invoiceRequestStatus.status === 'paid' ? '#3B82F6' : '#10B981',
                                    }}>
                                        {invoiceRequestStatus.status === 'paid' ? 'Paid' : 'Invoice Raised'}
                                    </AppText>
                                </View>
                            ) : (
                                <GradientButton
                                    label="Raise Invoice"
                                    icon="file-text"
                                    onPress={handleGenerateInvoice}
                                    loading={loading}
                                    style={{ paddingVertical: spacing.md, width: '100%', marginBottom: spacing.sm }}
                                />
                            )}

                            <View style={[styles.secondaryRow, { gap: spacing.sm }]}>
                                <OutlineButton
                                    label="Download PDF"
                                    icon="download"
                                    onPress={handleDownloadPDF}
                                    flex={1}
                                    style={{ paddingVertical: spacing.md }}
                                    disabled={!invoice || generating}
                                />
                                <OutlineButton
                                    label="Share Invoice"
                                    icon="share-2"
                                    onPress={handleShareInvoice}
                                    flex={1}
                                    style={{ paddingVertical: spacing.md }}
                                    disabled={!invoice || generating}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    templateContainer: {
        paddingTop: scale(16),
    },
    templateHeader: {},
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: scale(44),
        height: scale(44),
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {},
    gridRow: {
        flexDirection: 'row',
    },
    gridItem: {
        flex: 1,
    },
    gridLabel: {
        marginBottom: scale(4),
    },
    gridValue: {
        fontSize: fs(13),
    },
    billBreakdown: {},
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(8),
    },
    totalRow: {
        marginTop: scale(12),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.08)',
        paddingTop: scale(12),
    },
    miniDivider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: scale(8),
    },
    thickDivider: {
        height: scale(2),
        marginVertical: scale(12),
        opacity: 0.12,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.15,
        shadowRadius: scale(4),
    },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    secondaryRow: {
        flexDirection: 'row',
    },
    tabToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabPill: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(10),
    },
});

export default RaiseInvoiceScreen;


