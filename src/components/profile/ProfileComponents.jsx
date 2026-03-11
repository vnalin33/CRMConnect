import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

export const HeaderRow = ({ title, showEdit = false, isEditing = false, onPressEdit }) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={[styles.headerRow, { paddingHorizontal: spacing.base }]}>
            <AppText variant="label" style={{ color: colors.textBrand, letterSpacing: 0.5, fontWeight: '700' }}>
                {title.toUpperCase()}
            </AppText>
            {showEdit && (
                <TouchableOpacity onPress={onPressEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {isEditing ? (
                        <Feather name="check" size={18} color={colors.success} />
                    ) : (
                        <Feather name="edit" size={16} color={colors.textSecondary} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

export const InfoRow = ({ icon, label, value, isLast = false }) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={[
            styles.infoRow,
            {
                paddingHorizontal: spacing.base,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.divider
            }
        ]}>
            <View style={[styles.iconBubble, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name={icon} size={15} color={colors.iconColor} />
            </View>

            <View style={styles.infoContent}>
                <AppText variant="caption" color="secondary" style={{ marginBottom: 2 }}>{label}</AppText>
                <AppText variant="bodySm" style={{
                    color: value === 'Not Provided' ? colors.textDisabled : colors.textPrimary,
                    fontStyle: value === 'Not Provided' ? 'italic' : 'normal',
                    fontWeight: value === 'Not Provided' ? '400' : '600'
                }}>
                    {value}
                </AppText>
            </View>
        </View>
    );
};

export const ActionRow = ({ icon, title, subtitle, rightElement, onPress, isLast = false }) => {
    const { colors, spacing } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onPress}
            onPress={onPress}
            style={[
                styles.actionRow,
                {
                    paddingHorizontal: spacing.base,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: colors.divider
                }
            ]}
        >
            <View style={[styles.iconBubble, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name={icon} size={15} color={title === 'Report an Issue' ? colors.error : colors.iconColor} />
            </View>

            <View style={styles.actionContent}>
                <AppText variant="bodySm" style={{ fontWeight: '600', color: colors.textPrimary }}>{title}</AppText>
                {subtitle ? (
                    <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>{subtitle}</AppText>
                ) : null}
            </View>

            <View style={styles.rightElement}>
                {rightElement ? rightElement : <Feather name="chevron-right" size={16} color={colors.iconColor} />}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    iconBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
        justifyContent: 'center'
    },
    actionContent: {
        flex: 1,
        justifyContent: 'center'
    },
    rightElement: {
        marginLeft: 10,
    }
});
