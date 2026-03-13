import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from '../common/AppText';
import GradientText from '../common/GradientText';

export const HeaderRow = ({ title, showEdit = false, isEditing = false, onPressEdit }) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={[styles.headerRow, { paddingHorizontal: spacing.base }]}>
            <GradientText variant="label" style={{ letterSpacing: 0.5, fontWeight: '700', fontSize: 13 }}>
                {title.toUpperCase()}
            </GradientText>
            {showEdit && (
                <TouchableOpacity onPress={onPressEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {isEditing ? (
                        <Feather name="check" size={18} color={colors.success} />
                    ) : (
                        <View style={{ backgroundColor: colors.profileIconBg, padding: 6, borderRadius: 8 }}>
                            <Feather name="edit-3" size={14} color={colors.primary} />
                        </View>
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
            <View style={[styles.iconBubble, { backgroundColor: colors.searchBg, borderColor: colors.border, borderWidth: 1 }]}>
                <Feather name={icon} size={14} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
                <AppText variant="caption" color="secondary" style={{ marginBottom: 2, fontSize: 11 }}>{label}</AppText>
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

export const ActionRow = ({ icon, title, subtitle, rightElement, onPress, isLast = false, iconColor }) => {
    const { colors, spacing } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onPress && !rightElement}
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
            <View style={[styles.iconBubble, { backgroundColor: colors.searchBg, borderColor: colors.border, borderWidth: 1 }]}>
                <Feather name={icon} size={14} color={iconColor || colors.primary} />
            </View>
            <View style={styles.actionContent}>
                <AppText variant="bodySm" style={{ fontWeight: '600', color: colors.textPrimary }}>{title}</AppText>
                {subtitle ? (
                    <AppText variant="caption" color="secondary" style={{ marginTop: 2, fontSize: 11 }}>{subtitle}</AppText>
                ) : null}
            </View>
            <View style={styles.rightElement}>
                {rightElement ? rightElement : <Feather name="chevron-right" size={16} color={colors.iconColor} />}
            </View>
        </TouchableOpacity>
    );
};

export const GradientToggle = ({ value, onValueChange }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
            style={styles.gradientToggleTrack}
        >
            <LinearGradient
                colors={value ? BRAND_GRADIENT.colors : ['#CDD5DF', '#CDD5DF']}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
                locations={BRAND_GRADIENT.locations}
                style={styles.gradientToggleTrackBg}
            >
                <View style={[styles.gradientToggleThumb, { left: value ? 22 : 2 }]} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export const GradientThemeSwitcher = ({ isDark, toggleTheme, colors, spacing, radius }) => {
    return (
        <View style={[styles.themeSwitcherOuter, { backgroundColor: colors.searchBg, borderColor: colors.border }]}>
            <View style={styles.themeSwitcher}>
                <TouchableOpacity
                    onPress={() => { if (isDark) toggleTheme(); }}
                    activeOpacity={0.8}
                    style={styles.themeBtn}
                >
                    {!isDark ? (
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={[styles.themeBtnGradient, { borderRadius: radius.full }]}
                        >
                            <Feather name="sun" size={16} color="#FFF" />
                        </LinearGradient>
                    ) : (
                        <View style={styles.themeBtnInactive}>
                            <Feather name="sun" size={16} color={colors.textSecondary} />
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { if (!isDark) toggleTheme(); }}
                    activeOpacity={0.8}
                    style={styles.themeBtn}
                >
                    {isDark ? (
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={[styles.themeBtnGradient, { borderRadius: radius.full }]}
                        >
                            <Feather name="moon" size={16} color="#FFF" />
                        </LinearGradient>
                    ) : (
                        <View style={styles.themeBtnInactive}>
                            <Feather name="moon" size={16} color={colors.textSecondary} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
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
        width: 34,
        height: 34,
        borderRadius: 17,
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
    },
    gradientToggleTrack: {
        width: 44,
        height: 24,
    },
    gradientToggleTrackBg: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    gradientToggleThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    themeSwitcherOuter: {
        borderWidth: 1.5,
        borderRadius: 26,
        padding: 2,
    },
    themeSwitcher: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 2,
        width: 80,
        height: 34,
    },
    themeBtn: {
        flex: 1,
    },
    themeBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    themeBtnInactive: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
});
