import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppCard from '../common/AppCard';
import { BRAND_GRADIENT } from '../../theme/colors';

const StatusCard = ({ lead }) => {
    const { colors, spacing, radius } = useTheme();

    const getStatusConfig = (status) => {
        const s = status.toLowerCase();
        if (s.includes('approved')) return { bg: colors.successBg, text: colors.successText, icon: 'check-circle' };
        if (s.includes('new')) return { bg: colors.primaryLight, text: colors.primary, icon: 'plus-circle' };
        if (s.includes('disbursement')) return { bg: colors.cyanBg, text: colors.cyan, icon: 'refresh-ccw' };
        if (s.includes('following')) return { bg: colors.infoBg, text: colors.info, icon: 'clock' };
        if (s.includes('rejected')) return { bg: colors.errorBg, text: colors.errorText, icon: 'x-circle' };
        if (s.includes('completed')) return { bg: colors.successBg, text: colors.successText, icon: 'check-circle' };
        return { bg: colors.pillBg, text: colors.textSecondary, icon: 'help-circle' };
    };

    const config = getStatusConfig(lead.status);

    return (
        <AppCard style={styles.card} variant="elevated">
            <View style={styles.mainContainer}>
                {/* Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.nameSection}>
                        <AppText variant="h3" color="primary" numberOfLines={1}>{lead.name}</AppText>
                        <AppText variant="bodySm" color="secondary" style={styles.loanType}>{lead.loanType}</AppText>
                    </View>
                    <View style={styles.amountSection}>
                        <AppText variant="amountSm" color="primary">₹ {lead.amount}</AppText>
                        <AppText variant="label" color="secondary" align="right">Loan Amount</AppText>
                    </View>
                </View>

                {/* Status & Date Section */}
                <View style={styles.middleRow}>
                    <View style={[styles.badge, { backgroundColor: config.bg, borderRadius: radius.lg }]}>
                        <AppText variant="label" style={{ color: config.text, fontWeight: '700' }}>{lead.status}</AppText>
                    </View>
                    <View style={styles.dateContainer}>
                        <Feather name="calendar" size={14} color={colors.textSecondary} />
                        <AppText variant="bodySm" color="secondary" style={styles.dateText}>{lead.date}</AppText>
                    </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                        <AppText variant="label" color="secondary">Progress</AppText>
                        <AppText variant="label" color="cyan" style={{ fontWeight: '700' }}>{lead.progress}%</AppText>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.divider, borderRadius: radius.xs }]}>
                        {lead.progress > 0 && (
                            <LinearGradient
                                colors={lead.status.toLowerCase().includes('rejected') ? [colors.error, colors.errorText] : ['#2DBFE6', '#22D3EE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${lead.progress}%`,
                                        borderRadius: radius.xs 
                                    }
                                ]} 
                            />
                        )}
                    </View>
                </View>
            </View>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        marginHorizontal: 16,
        padding: 0, // Override AppCard default padding for more control
    },
    mainContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameSection: {
        flex: 1,
        marginRight: 12,
    },
    amountSection: {
        alignItems: 'flex-end',
    },
    loanType: {
        marginTop: 2,
    },
    middleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 6,
    },
    progressSection: {
        marginTop: 16,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressBarBg: {
        height: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
});

export default memo(StatusCard);
