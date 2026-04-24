import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppCard from '../common/AppCard';
import { BRAND_GRADIENT } from '../../theme/colors';

const StatusCard = ({ lead, onPress, onDelete }) => {
    const { colors, spacing, radius } = useTheme();

    const getStatusConfig = (status) => {
        const s = status.toLowerCase();
        if (s.includes('unassigned'))   return { bg: colors.primaryLight, text: colors.primary, icon: 'user-plus' };
        if (s.includes('assigned'))     return { bg: colors.infoBg, text: colors.info, icon: 'user-check' };
        if (s.includes('approved'))     return { bg: colors.successBg, text: colors.successText, icon: 'check-circle' };
        if (s.includes('new'))          return { bg: colors.primaryLight, text: colors.primary, icon: 'plus-circle' };
        if (s.includes('disbursement')) return { bg: colors.cyanBg, text: colors.cyan, icon: 'dollar-sign' };
        if (s.includes('sanction'))     return { bg: colors.successBg, text: colors.successText, icon: 'award' };
        if (s.includes('file login'))   return { bg: colors.infoBg, text: colors.info, icon: 'log-in' };
        if (s.includes('doc'))          return { bg: colors.primaryLight, text: colors.primary, icon: 'folder' };
        if (s.includes('following'))    return { bg: colors.infoBg, text: colors.info, icon: 'clock' };
        if (s.includes('cibil'))        return { bg: colors.infoBg, text: colors.info, icon: 'shield' };
        if (s.includes('no response'))  return { bg: colors.errorBg, text: colors.errorText, icon: 'phone-off' };
        if (s.includes('not exist') || s.includes('out of service')) return { bg: colors.errorBg, text: colors.errorText, icon: 'slash' };
        if (s.includes('rejected') || s.includes('reject')) return { bg: colors.errorBg, text: colors.errorText, icon: 'x-circle' };
        if (s.includes('completed'))    return { bg: colors.successBg, text: colors.successText, icon: 'check-circle' };
        return { bg: colors.pillBg, text: colors.textSecondary, icon: 'help-circle' };
    };

    const config = getStatusConfig(lead.status);

    return (
        <TouchableOpacity 
            onPress={() => onPress?.(lead.id)} 
            activeOpacity={0.85}
        >
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
                    {(lead.statusCode === 1 || lead.statusCode === 10) && (
                    <TouchableOpacity
                        onPress={() => onDelete?.(lead)}
                        style={[styles.deleteBtn, { backgroundColor: colors.errorBg }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                    >
                        <Feather name="trash-2" size={16} color={colors.error} />
                    </TouchableOpacity>
                    )}
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        marginHorizontal: 16,
        padding: 0, // Override AppCard default padding for more control
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
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
