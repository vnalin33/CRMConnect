import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';

const Section = ({ title, children }) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={{ marginBottom: spacing.lg }}>
            <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm }}>
                {title}
            </AppText>
            {children}
        </View>
    );
};

const Bullet = ({ text }) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={{ flexDirection: 'row', marginBottom: spacing.xs, paddingLeft: spacing.sm }}>
            <AppText variant="body" style={{ color: colors.textSecondary, marginRight: spacing.sm }}>•</AppText>
            <AppText variant="body" style={{ color: colors.textSecondary, flex: 1 }}>{text}</AppText>
        </View>
    );
};

const Paragraph = ({ text, bold = false }) => {
    const { colors, spacing } = useTheme();
    return (
        <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: bold ? '600' : '400' }}>
            {text}
        </AppText>
    );
};

const PrivacyPolicyScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <ScreenWrapper withPadding={false} edges={['left', 'right']} style={{ backgroundColor: colors.background }}>
            <GradientScreenHeader
                title="Privacy Policy"
                showBack
                navigation={navigation}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.xxxl }}
            >
                <AppCard style={{ padding: spacing.base, marginBottom: spacing.base, borderColor: colors.border, borderWidth: 1 }} variant="elevated">
                    <AppText variant="h2" style={{ color: colors.primary, fontWeight: '800', marginBottom: spacing.xs }}>
                        Privacy Policy
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                        Last Updated: May 22, 2026
                    </AppText>

                    <View style={{ height: 1, backgroundColor: colors.divider, marginBottom: spacing.lg }} />

                    <Paragraph
                        text={`This Privacy Policy explains how OneAssist Technologies Pvt. Ltd. ("OneAssist", "we", "us") collects, uses, and shares information when you use the ONEBind mobile application.`}
                        bold
                    />

                    {/* Section 1 */}
                    <Section title="1. Information We Collect">
                        <Paragraph text="Account Information" bold />
                        <Bullet text="Name, email, and phone number." />
                        <Bullet text="Profile information you choose to provide (e.g., profession, location, and address)." />
                        <Bullet text="Date of birth (optional)." />

                        <Paragraph text="Financial Information" bold />
                        <Bullet text="Bank account details (IFSC, account number, branch, account holder name)." />
                        <Bullet text="PAN number and GST registration details for tax and invoice processing." />
                        <Bullet text="Payout and disbursement records." />

                        <Paragraph text="Loan & Lead Information" bold />
                        <Bullet text="Lead details you submit including customer name, loan type, loan amount, and bank/NBFC." />
                        <Bullet text="Disbursement and payout tracking data." />
                        <Bullet text="Invoice records and approval statuses." />

                        <Paragraph text="Device & Usage" bold />
                        <Bullet text="Device type, OS version, app usage, and diagnostic information." />
                    </Section>

                    {/* Section 2 */}
                    <Section title="2. How We Use Your Information">
                        <Bullet text="To create and manage your connector/partner account." />
                        <Bullet text="To process lead submissions, track disbursements, and manage payouts." />
                        <Bullet text="To generate invoices and facilitate invoice approval workflows." />
                        <Bullet text="To process wallet withdrawals and settlement requests." />
                        <Bullet text="To send service notifications (payout updates, lead status changes, invoice approvals)." />
                        <Bullet text="To enable password reset and account recovery via email." />
                        <Bullet text="To provide support and improve app reliability and performance." />
                    </Section>

                    {/* Section 3 */}
                    <Section title="3. Information Sharing">
                        <Paragraph text="With Banks & NBFCs" bold />
                        <Paragraph text="We may share lead and disbursement details with partner banks and NBFCs to facilitate loan processing and payout settlements." />

                        <Paragraph text="With Admin Portal" bold />
                        <Paragraph text="Your invoice requests, withdrawal requests, and lead data are visible to OneAssist administrators through the ONEBind admin portal for approval and processing." />

                        <Paragraph text="Legal Requirements" bold />
                        <Paragraph text="We may disclose information if required by law or to protect our rights, users, or the public." />
                    </Section>

                    {/* Section 4 */}
                    <Section title="4. Data Security">
                        <Paragraph text="We use industry-standard safeguards such as encrypted transmission (TLS), JWT-based authentication with session expiry, and secure database storage. Passwords are stored using bcrypt hashing. No method of transmission or storage is completely secure, but we take reasonable measures to protect your data." />
                    </Section>

                    {/* Section 5 */}
                    <Section title="5. Your Choices & Rights">
                        <Bullet text="Update your personal, bank, and tax information in the app." />
                        <Bullet text="Change your password from the Profile page." />
                        <Bullet text="Control notification preferences in the app settings." />
                        <Bullet text="Request account deletion by contacting support." />
                        <Paragraph text="When you delete your account, we remove your personal and login information. Some records such as leads, payouts, invoices, and transaction history may be retained in anonymized form for legal/accounting and dispute resolution purposes." />
                    </Section>

                    {/* Section 6 */}
                    <Section title="6. Changes to this Policy">
                        <Paragraph text="We may update this policy periodically. We may notify you of significant changes through the app or email." />
                    </Section>

                    {/* Section 7 */}
                    <Section title="7. Contact Us">
                        <Paragraph text="If you have questions about this Privacy Policy, please contact us:" />
                        <Bullet text="Email: oneassistconsultant@gmail.com" />
                        <Bullet text="Company: OneAssist Technologies Pvt. Ltd." />
                    </Section>

                    <View style={{ height: 1, backgroundColor: colors.divider, marginTop: spacing.sm, marginBottom: spacing.md }} />

                    <AppText variant="body" style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
                        Your privacy matters to us. We are committed to protecting your personal information.
                    </AppText>
                </AppCard>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default PrivacyPolicyScreen;
