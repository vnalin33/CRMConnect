import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';

const supportQA = [
    { q: "Is my data shared with others?", a: "No, your data is private and secure." },
    { q: "What if I forget my password?", a: "Use “forgot password” and reset using otp or email." },
    { q: "Who can use this portal?", a: "Crm agents, real estate agents, and lic agents." },
    { q: "Will I get reminders for follow-ups?", a: "Yes, the system sends reminders for pending tasks." }
];

const SupportScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <ScreenWrapper
            scrollable={false}
            withPadding={false}
            edges={['bottom', 'left', 'right']}
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
                <AppText variant="h2" style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md, paddingHorizontal: spacing.xs }}>
                    Help & Support
                </AppText>
                
                {supportQA.map((item, index) => (
                    <AppCard 
                        key={index} 
                        style={[
                            styles.qaCard, 
                            { 
                                borderColor: colors.border, 
                                borderRadius: radius.lg,
                                padding: spacing.lg,
                                marginBottom: spacing.md
                            }
                        ]} 
                        variant="elevated"
                    >
                        <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>
                            {index + 1}. {item.q}
                        </AppText>
                        <AppText variant="body" style={{ color: colors.textSecondary, lineHeight: 22 }}>
                            {item.a}
                        </AppText>
                    </AppCard>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    qaCard: {
        borderWidth: 1,
        elevation: 2,
        shadowOpacity: 0.05,
    }
});

export default SupportScreen;
