import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import { scale, fs } from '../theme/metrics';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';
import AppInput from '../components/common/AppInput';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../context/ToastContext';

const ISSUE_CATEGORIES = [
    { id: 'bug', label: 'Bug Report', icon: 'alert-triangle', color: '#EF4444' },
    { id: 'feature', label: 'Feature Request', icon: 'zap', color: '#F59E0B' },
    { id: 'ui', label: 'UI Issue', icon: 'layout', color: '#3B82F6' },
    { id: 'payout', label: 'Payout Issue', icon: 'dollar-sign', color: '#10B981' },
    { id: 'invoice', label: 'Invoice Issue', icon: 'file-text', color: '#8B5CF6' },
    { id: 'other', label: 'Other', icon: 'help-circle', color: '#6B7280' },
];

const ReportIssueScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const { profileData } = useProfile();
    const { showToast } = useToast();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!selectedCategory) {
            showToast('warning', 'Select Category', 'Please select an issue category.');
            return;
        }
        if (!description.trim()) {
            showToast('warning', 'Description Required', 'Please describe the issue you are facing.');
            return;
        }

        const category = ISSUE_CATEGORIES.find(c => c.id === selectedCategory);
        const userName = profileData?.name || 'Unknown';
        const userEmail = profileData?.personalInfo?.email || '';
        const userMobile = profileData?.personalInfo?.mobile || '';

        const emailSubject = `[ONEBind] ${category?.label || 'Issue'}: ${subject || 'No Subject'}`;
        const emailBody = [
            `Issue Category: ${category?.label || 'N/A'}`,
            `Subject: ${subject || 'N/A'}`,
            '',
            'Description:',
            description,
            '',
            '--- User Info ---',
            `Name: ${userName}`,
            `Email: ${userEmail}`,
            `Mobile: ${userMobile}`,
            `Platform: ${Platform.OS} ${Platform.Version}`,
            `App: ONEBind`,
            `Date: ${new Date().toLocaleString('en-IN')}`,
        ].join('\n');

        const mailtoUrl = `mailto:oneassistconsultant@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        Linking.openURL(mailtoUrl).catch(() => {
            showToast('error', 'Error', 'Could not open email client. Please email oneassistconsultant@gmail.com directly.');
        });
    };

    return (
        <ScreenWrapper withPadding={false} edges={['left', 'right']} style={{ backgroundColor: colors.background }}>
            <GradientScreenHeader
                title="Report an Issue"
                showBack
                navigation={navigation}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.xxxl }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Info Banner */}
                <View style={[styles.banner, {
                    backgroundColor: colors.cyanBg,
                    padding: spacing.sm,
                    borderRadius: radius.md,
                    marginBottom: spacing.lg,
                }]}>
                    <Feather name="info" size={scale(16)} color={colors.cyan} />
                    <AppText variant="caption" style={{ color: colors.cyan, marginLeft: spacing.sm, flex: 1, fontWeight: '600' }}>
                        Describe your issue below. Your report will be sent via email to our support team.
                    </AppText>
                </View>

                {/* Category Selection */}
                <AppText variant="label" color="secondary" style={{ marginBottom: spacing.sm, fontWeight: '700' }}>
                    SELECT ISSUE CATEGORY
                </AppText>

                <View style={styles.categoryGrid}>
                    {ISSUE_CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.7}
                                onPress={() => setSelectedCategory(cat.id)}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: isActive ? cat.color + '15' : colors.surface,
                                        borderColor: isActive ? cat.color : colors.border,
                                        borderRadius: radius.lg,
                                    },
                                ]}
                            >
                                <View style={[styles.categoryIcon, {
                                    backgroundColor: isActive ? cat.color + '20' : colors.surfaceElevated,
                                    borderRadius: radius.md,
                                }]}>
                                    <Feather name={cat.icon} size={scale(18)} color={isActive ? cat.color : colors.textSecondary} />
                                </View>
                                <AppText variant="caption" style={{
                                    color: isActive ? cat.color : colors.textSecondary,
                                    fontWeight: isActive ? '700' : '500',
                                    marginTop: spacing.xs,
                                    textAlign: 'center',
                                    fontSize: fs(11),
                                }}>
                                    {cat.label}
                                </AppText>
                                {isActive && (
                                    <View style={[styles.checkBadge, { backgroundColor: cat.color, borderRadius: radius.full }]}>
                                        <Feather name="check" size={10} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Form */}
                <AppCard style={{ padding: spacing.base, marginTop: spacing.lg, borderColor: colors.border, borderWidth: 1 }} variant="elevated">
                    <AppInput
                        label="Subject"
                        placeholder="Brief summary of the issue"
                        value={subject}
                        onChangeText={setSubject}
                        leftIcon={<Feather name="edit-3" size={16} color={colors.primary} />}
                    />

                    <AppInput
                        label="Description"
                        placeholder="Please describe the issue in detail. Include steps to reproduce if applicable..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        style={{ minHeight: scale(120), textAlignVertical: 'top' }}
                    />

                    {/* User Info Preview */}
                    <View style={[styles.userInfoBox, {
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                        marginTop: spacing.sm,
                    }]}>
                        <AppText variant="caption" color="secondary" style={{ fontWeight: '700', marginBottom: spacing.xs }}>
                            YOUR INFO (included in report)
                        </AppText>
                        <AppText variant="caption" color="secondary">
                            {profileData?.name || 'N/A'} • {profileData?.personalInfo?.email || 'N/A'} • {profileData?.personalInfo?.mobile || 'N/A'}
                        </AppText>
                    </View>
                </AppCard>

                {/* Submit Button */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    style={{ marginTop: spacing.lg }}
                >
                    <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        locations={BRAND_GRADIENT.locations}
                        style={[styles.submitBtn, { borderRadius: radius.full }]}
                    >
                        <Feather name="send" size={scale(16)} color="#FFF" style={{ marginRight: scale(8) }} />
                        <AppText variant="body" style={{ color: '#FFF', fontWeight: '700' }}>
                            Send Report via Email
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Direct email fallback */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL('mailto:oneassistconsultant@gmail.com')}
                    style={{ marginTop: spacing.md, alignItems: 'center' }}
                >
                    <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                        Or email us directly at oneassistconsultant@gmail.com
                    </AppText>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    categoryCard: {
        width: '31%',
        borderWidth: 1.5,
        padding: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    categoryIcon: {
        width: scale(36),
        height: scale(36),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: scale(6),
        right: scale(6),
        width: scale(18),
        height: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfoBox: {},
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
});

export default ReportIssueScreen;
