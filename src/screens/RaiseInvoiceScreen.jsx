import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import { scale, fs } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';

// ─── Constants ──────────────────────────────────────────────────────────────

const INSTANT_DATA = {
    id: '#INV-2026-0123',
    date: '27 Feb 2026',
    expectedPayoutDate: '01 Mar 2026',
    customer: 'Manoj Kumar',
    loanType: 'Home Loan',
    loanAmount: '₹ 12,00,000',
    disbursedAmount: '₹ 11,80,000',
    payoutType: 'Instant',
    payoutPercent: '1.5%',
    subtotal: '₹ 18,000.00',
    sgst: '₹ 1,620.00',
    cgst: '₹ 1,620.00',
    igst: '₹ 0.00',
    total: '₹ 21,240.00',
};

// ─── Sub-Components ─────────────────────────────────────────────────────────

const SegmentedTabs = React.memo(({ active, onTabChange }) => {
    const { colors, radius, spacing } = useTheme();

    return (
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, padding: scale(4) }]}>
            {['Instant', 'Cycle'].map((tab) => {
                const isActive = active === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        activeOpacity={0.8}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={`${tab} payout tab`}
                        onPress={() => onTabChange(tab)}
                        style={[
                            styles.tabButton,
                            {
                                borderRadius: radius.md,
                                overflow: 'hidden',
                                paddingVertical: spacing.sm,
                            }
                        ]}
                    >
                        {isActive && (
                            <LinearGradient
                                colors={BRAND_GRADIENT.colors}
                                start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end}
                                locations={BRAND_GRADIENT.locations}
                                style={StyleSheet.absoluteFill}
                            />
                        )}
                        <AppText
                            color={isActive ? 'inverse' : 'secondary'}
                            style={{ fontWeight: '600', fontSize: fs(13) }}
                        >
                            {tab}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

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
    return (
        <View style={[styles.billRow, isTotal && styles.totalRow]} accessibilityRole="text">
            <AppText variant={isTotal ? 'h3' : 'bodySm'} color={isTotal ? 'primary' : 'secondary'}>
                {label}
            </AppText>
            <AppText
                variant={isTotal ? 'h2' : 'bodySm'}
                style={isTotal ? { color: colors.primary, fontWeight: '800' } : { color: colors.textPrimary, fontWeight: '600' }}
            >
                {value}
            </AppText>
        </View>
    );
});

const GradientButton = React.memo(({ label, icon, onPress, style, flex = 0 }) => {
    const { radius } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={flex ? { flex: 1 } : null}
        >
            <LinearGradient
                colors={BRAND_GRADIENT.colors}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
                locations={BRAND_GRADIENT.locations}
                style={[styles.primaryBtn, { borderRadius: radius.full }, style]}
            >
                {icon && <Feather name={icon} size={scale(16)} color="#FFF" style={{ marginRight: scale(6) }} />}
                <AppText color="inverse" style={{ fontWeight: '700', fontSize: fs(13) }}>{label}</AppText>
            </LinearGradient>
        </TouchableOpacity>
    );
});

// ─── Screen ──────────────────────────────────────────────────────────────────

const RaiseInvoiceScreen = ({ navigation, route }) => {
    const { colors, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const { payoutData } = route?.params || {};
    const [payoutType, setPayoutType] = useState(payoutData?.cycle || 'Instant');

    const handleTabChange = useCallback((tab) => {
        setPayoutType(tab);
    }, []);

    const renderInvoiceContent = () => {
        let invoiceData = INSTANT_DATA;
        if (payoutData) {
            const subtotal = payoutData.payoutRaw || 0;
            const gstRate = 0.09;
            const sgst = subtotal * gstRate;
            const cgst = subtotal * gstRate;
            const total = subtotal + sgst + cgst;

            const formatINR = (n) => '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            invoiceData = {
                id: payoutData.id ? `#INV-2026-${String(payoutData.id).padStart(4, '0')}` : INSTANT_DATA.id,
                date: payoutData.date || INSTANT_DATA.date,
                expectedPayoutDate: payoutData.expectedPayoutDate || INSTANT_DATA.expectedPayoutDate,
                customer: payoutData.name || INSTANT_DATA.customer,
                loanType: payoutData.loanType || INSTANT_DATA.loanType,
                loanAmount: payoutData.loanAmount || INSTANT_DATA.loanAmount,
                disbursedAmount: payoutData.loanAmount || INSTANT_DATA.disbursedAmount,
                payoutType: payoutData.cycle || INSTANT_DATA.payoutType,
                payoutPercent: '1.5%',
                subtotal: formatINR(subtotal),
                sgst: formatINR(sgst),
                cgst: formatINR(cgst),
                igst: '₹ 0.00',
                total: formatINR(total),
            };
        }

        return (
            <View style={[styles.templateContainer, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
                {/* Template Header */}
                <View style={[styles.templateHeader, { paddingHorizontal: spacing.base, paddingBottom: spacing.base }]}>
                    <View style={styles.companyRow}>
                        <View style={[styles.logoBox, { backgroundColor: colors.primaryLight, borderRadius: radius.md }]}>
                            <MaterialCommunityIcons name="office-building" size={scale(24)} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                            <AppText variant="h3" color="primary">OneAssist Pvt. Ltd.</AppText>
                            <AppText variant="caption" color="secondary">GST: 27AABCM1234F1Z1</AppText>
                        </View>
                        <View>
                            <AppText color="secondary" style={{ fontSize: fs(13), fontWeight: '700' }}>
                                Invoice No: <AppText color="primary" style={{ fontWeight: '800' }}>{invoiceData.id}</AppText>
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* Details Grid */}
                <View style={[styles.gridContainer, { borderTopWidth: 1, borderTopColor: colors.divider, padding: spacing.base }]}>
                    <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                        <GridRow label="Invoice Date" value={invoiceData.date} />
                        <GridRow label="Expected Payout Date" value={invoiceData.expectedPayoutDate} />
                    </View>
                    <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                        <GridRow label="Customer Name" value={invoiceData.customer} />
                        <GridRow label="Loan Type" value={invoiceData.loanType} />
                    </View>
                    <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                        <GridRow label="Loan Amount" value={invoiceData.loanAmount} />
                        <GridRow label="Disbursed Amount" value={invoiceData.disbursedAmount} />
                    </View>
                    <View style={[styles.gridRow, { marginBottom: spacing.md }]}>
                        <GridRow label="Payout Type" value={invoiceData.payoutType} boldValue />
                    </View>
                </View>

                {/* Bill Breakdown */}
                <View style={[styles.billBreakdown, { backgroundColor: colors.surfaceElevated, padding: spacing.base }]}>
                    <BillRow label={`Payout (${invoiceData.payoutPercent})`} value={invoiceData.subtotal} />
                    <BillRow label="Subtotal" value={invoiceData.subtotal} />
                    <View style={[styles.miniDivider, { backgroundColor: colors.divider }]} />
                    <BillRow label="SGST (9%)" value={invoiceData.sgst} />
                    <BillRow label="CGST (9%)" value={invoiceData.cgst} />
                    <BillRow label="IGST (0%)" value={invoiceData.igst} />
                    <View style={[styles.thickDivider, { backgroundColor: colors.primary }]} />
                    <BillRow label="Grand Total" value={invoiceData.total} isTotal />
                </View>
            </View>
        )
    };

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            <GradientScreenHeader
                title="Raise Invoice"
                showBack
                navigation={navigation}
                searchable
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
                contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Segmented Tabs */}
                <View style={{ padding: spacing.base }}>
                    <SegmentedTabs active={payoutType} onTabChange={handleTabChange} />
                </View>

                {/* Info Banner */}
                <View
                    style={[
                        styles.banner,
                        {
                            backgroundColor: payoutType === 'Instant' ? colors.cyanBg : colors.primaryLight,
                            marginHorizontal: spacing.base,
                            marginBottom: spacing.md,
                            padding: spacing.sm,
                            borderRadius: radius.md,
                        }
                    ]}
                    accessibilityRole="text"
                >
                    <Feather name="info" size={scale(16)} color={payoutType === 'Instant' ? colors.cyan : colors.primary} />
                    <AppText
                        variant="caption"
                        style={{
                            color: payoutType === 'Instant' ? colors.cyan : colors.primary,
                            marginLeft: spacing.sm,
                            flex: 1,
                            fontWeight: '600',
                        }}
                    >
                        {payoutType === 'Instant'
                            ? "Instant Payout - Higher interest, lower payout, settled immediately"
                            : "Cycle Payout - Consolidated invoice for all disbursements in the selected cycle period"
                        }
                    </AppText>
                </View>

                {/* Main Content */}
                {renderInvoiceContent()}

                {/* Action Buttons */}
                <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.lg }}>
                    <GradientButton
                        label="Generate Invoice"
                        onPress={() => { }}
                        style={{ paddingVertical: spacing.base }}
                    />

                    <View style={[styles.secondaryRow, { marginTop: spacing.sm, gap: spacing.sm }]}>
                        <GradientButton label="Download PDF" icon="download" onPress={() => { }} flex={1} style={{ paddingVertical: spacing.sm }} />
                        <GradientButton label="Share Invoice" icon="share-2" onPress={() => { }} flex={1} style={{ paddingVertical: spacing.sm }} />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    secondaryRow: {
        flexDirection: 'row',
    },
});

export default RaiseInvoiceScreen;
