import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';

const SUPPORT_EMAIL = 'oneassistconsultant@gmail.com';

const FAQ_DATA = [
    {
        q: 'How do I add a new lead?',
        a: 'Go to the "Add Contact" tab from the bottom navigation. Fill in the customer details including name, phone, loan type, and amount, then tap "Submit" to create the lead.',
    },
    {
        q: 'When will I receive my payout?',
        a: 'Payout timing depends on the processing type. Instant payouts are processed within 24–48 hours after loan disbursement. Cycle payouts are processed at the end of each billing cycle (typically 5–7 business days).',
    },
    {
        q: 'How do I raise an invoice?',
        a: 'Navigate to Quick Actions → Raise Invoice, or go to the Payout tab and select a disbursed lead. The invoice will be generated and sent to admin for approval.',
    },
    {
        q: 'How does the lead tracking work?',
        a: 'Each lead moves through stages: New Lead → Assigned → In Progress → Approved → Disbursed. You can track the real-time status from the "Status" tab.',
    },
    {
        q: 'Is my data shared with others?',
        a: 'No. Your personal information, bank details, and lead data are strictly private and encrypted. Only authorized admin staff can view lead assignments.',
    },
    {
        q: 'What if I forget my password?',
        a: 'Tap "Forgot Password?" on the login screen. Enter your registered email address and we\'ll send you a reset link. The link expires in 1 hour.',
    },
    {
        q: 'Why is my profile incomplete?',
        a: 'To add leads and raise invoices, you must complete your Address, Bank Details (IFSC, Account Number), and Tax Details (PAN). Go to My Profile to update these sections.',
    },
    {
        q: 'How do I withdraw my wallet balance?',
        a: 'Go to the Wallet screen and tap "Withdraw". Enter the amount (minimum ₹500) and submit. Withdrawals are processed to your registered bank account within 2–3 business days.',
    },
    {
        q: 'Who can use ONEBind?',
        a: 'ONEBind is designed for loan connectors, financial advisors, real estate brokers, insurance agents, and other professionals who refer customers for financial products.',
    },
    {
        q: 'Will I get reminders for follow-ups?',
        a: 'Yes! You will receive push notifications for lead status updates, payout approvals, invoice actions, and important reminders. Make sure notifications are enabled in your device settings.',
    },
];

const SupportScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();

    const handleSendEmail = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=ONEBind Support Request`);
    };

    return (
        <ScreenWrapper
            scrollable={false}
            withPadding={false}
            edges={['left', 'right']}
            style={styles.root}
        >
            <GradientScreenHeader
                title="Support"
                showBack
                navigation={navigation}
                onBackPress={() => navigation.navigate('Profile')}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl, paddingTop: spacing.xl }}
            >
                {/* ── Gradient Support Contact Card ── */}
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.gradientCard, { borderRadius: radius.xl, marginBottom: spacing.xl }]}
                >
                    {/* Decorative circles */}
                    <View style={[styles.decorCircle, styles.decorCircle1]} />
                    <View style={[styles.decorCircle, styles.decorCircle2]} />

                    <View style={styles.gradientContent}>
                        <View style={[styles.supportIconBox, { borderRadius: radius.full, marginBottom: spacing.sm }]}>
                            <Feather name="headphones" size={26} color="#fff" />
                        </View>

                        <AppText variant="h2" style={styles.gradientTitle}>
                            Help & Support
                        </AppText>
                        <AppText variant="body" style={styles.gradientSubtitle}>
                            Need help with leads, payouts, invoices, or your account? Contact us and we'll assist you as soon as possible.
                        </AppText>

                        {/* Email row */}
                        <View style={[styles.emailRow, { marginBottom: spacing.lg }]}>
                            <View style={styles.emailIconBox}>
                                <Feather name="mail" size={16} color="#fff" />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
                                    Email Support
                                </AppText>
                                <TouchableOpacity onPress={handleSendEmail}>
                                    <AppText variant="bodySm" style={{ color: '#fff', fontWeight: '600', marginTop: 2 }}>
                                        {SUPPORT_EMAIL}
                                    </AppText>
                                </TouchableOpacity>
                                <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                                    Typical response within 24 hours
                                </AppText>
                            </View>
                        </View>

                        {/* Send Email Button */}
                        <TouchableOpacity onPress={handleSendEmail} activeOpacity={0.85} style={styles.sendBtnWrapper}>
                            <View style={[styles.sendBtn, { borderRadius: radius.full }]}>
                                <Feather name="send" size={15} color={BRAND_GRADIENT.colors[0]} />
                                <AppText variant="subtitle2" style={{ color: BRAND_GRADIENT.colors[0], fontWeight: '700', marginLeft: 8 }}>
                                    Send Email
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* ── Common Questions ── */}
                <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md, paddingHorizontal: spacing.xs }}>
                    Common Questions
                </AppText>

                {FAQ_DATA.map((item, index) => (
                    <View key={index} style={[styles.faqItem, { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: index < FAQ_DATA.length - 1 ? 1 : 0, borderBottomColor: colors.border }]}>
                        <AppText variant="subtitle2" style={{ color: colors.textPrimary, fontWeight: '700', lineHeight: 22 }}>
                            {item.q}
                        </AppText>
                        <AppText variant="bodySm" style={{ color: colors.textSecondary, lineHeight: 20, marginTop: spacing.xs }}>
                            {item.a}
                        </AppText>
                    </View>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    gradientCard: {
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#6855F0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    decorCircle1: {
        width: 120,
        height: 120,
        top: -30,
        right: -20,
    },
    decorCircle2: {
        width: 80,
        height: 80,
        bottom: -20,
        left: 20,
    },
    gradientContent: {
        padding: 24,
    },
    supportIconBox: {
        width: 52,
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientTitle: {
        color: '#fff',
        fontWeight: '800',
        marginBottom: 6,
    },
    gradientSubtitle: {
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 22,
        marginBottom: 20,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    emailIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnWrapper: {
        alignSelf: 'stretch',
    },
    sendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        backgroundColor: '#fff',
    },
    faqItem: {
        paddingHorizontal: 4,
    },
});

export default SupportScreen;
