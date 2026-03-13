import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from './AppText';

const DropdownSelect = ({ label, placeholder, value, options, isOpen, onToggle, onSelect, error }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View style={{ marginBottom: spacing.base }}>
            {label ? (
                <AppText variant="label" color="secondary" style={{ marginBottom: spacing.xs }}>
                    {label}
                </AppText>
            ) : null}

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onToggle}
                style={[
                    styles.dropdownTrigger,
                    {
                        backgroundColor: colors.inputBg,
                        borderColor: error ? colors.error : isOpen ? colors.primary : colors.border,
                        borderRadius: radius.xl,
                        paddingHorizontal: spacing.base,
                    }
                ]}
            >
                <AppText
                    variant="bodySm"
                    style={{
                        flex: 1,
                        color: value ? colors.textPrimary : colors.textPlaceholder,
                        fontSize: 14,
                    }}
                >
                    {value || placeholder}
                </AppText>
                <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[
                    styles.dropdownList,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                    }
                ]}>
                    <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        locations={BRAND_GRADIENT.locations}
                        style={[styles.dropdownHeaderItem, { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]}
                    >
                        <AppText variant="bodySm" style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>
                            {placeholder}
                        </AppText>
                    </LinearGradient>

                    {options.map((item, index) => {
                        const isLast = index === options.length - 1;
                        return (
                            <Pressable
                                key={item}
                                onPress={() => onSelect(item)}
                                style={[
                                    {
                                        borderBottomWidth: isLast ? 0 : 1,
                                        borderBottomColor: colors.divider,
                                        borderBottomLeftRadius: isLast ? radius.md : 0,
                                        borderBottomRightRadius: isLast ? radius.md : 0,
                                        overflow: 'hidden',
                                    }
                                ]}
                            >
                                {({ pressed }) => (
                                    pressed ? (
                                        <LinearGradient
                                            colors={BRAND_GRADIENT.colors}
                                            start={BRAND_GRADIENT.start}
                                            end={BRAND_GRADIENT.end}
                                            locations={BRAND_GRADIENT.locations}
                                            style={styles.dropdownItem}
                                        >
                                            <AppText variant="bodySm" style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>
                                                {item}
                                            </AppText>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.dropdownItem}>
                                            <AppText variant="bodySm" style={{ color: colors.textPrimary, fontSize: 13 }}>
                                                {item}
                                            </AppText>
                                        </View>
                                    )
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {error ? (
                <AppText variant="caption" color="error" style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}>
                    ⚠ {error}
                </AppText>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        minHeight: 52,
        paddingVertical: 12,
    },
    dropdownList: {
        borderWidth: 1,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownHeaderItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default DropdownSelect;
