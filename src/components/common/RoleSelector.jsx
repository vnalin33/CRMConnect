import React, { useRef } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import AppText from './AppText';
import { BRAND_GRADIENT } from '../../theme/colors';

/**
 * RoleSelector – a horizontally scrollable chip group.
 *
 * Props:
 *   roles    : Array<{ id: string, label: string }>
 *   selected : string | null  (role id)
 *   onSelect : (id: string) => void
 *   error    : string | null
 */
const RoleChip = ({ role, isSelected, onSelect }) => {
    const { colors, spacing, radius } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 30 }).start();

    const onPressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginRight: spacing.sm }}>
            <TouchableOpacity
                onPress={() => onSelect(role.id)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select role: ${role.label}`}
            >
                {isSelected ? (
                    <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        locations={BRAND_GRADIENT.locations}
                        style={[
                            styles.chip,
                            {
                                borderRadius: radius.full,
                                paddingHorizontal: spacing.lg,
                                paddingVertical: spacing.sm + 2,
                            },
                        ]}
                    >
                        <AppText
                            variant="bodySm"
                            style={{ fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 }}
                        >
                            {role.label}
                        </AppText>
                    </LinearGradient>
                ) : (
                    <View
                        style={[
                            styles.chip,
                            {
                                borderRadius: radius.full,
                                paddingHorizontal: spacing.lg,
                                paddingVertical: spacing.sm + 2,
                                backgroundColor: colors.inputBg,
                                borderWidth: 1.5,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <AppText
                            variant="bodySm"
                            style={{ fontWeight: '600', color: colors.textSecondary }}
                        >
                            {role.label}
                        </AppText>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const RoleSelector = ({ roles, selected, onSelect, error, label }) => {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ marginBottom: spacing.base }}>
            {label ? (
                <AppText
                    variant="label"
                    color="secondary"
                    style={{ marginBottom: spacing.xs }}
                >
                    {label}
                </AppText>
            ) : null}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: spacing.sm }}
            >
                {roles.map((role) => (
                    <RoleChip
                        key={role.id}
                        role={role}
                        isSelected={selected === role.id}
                        onSelect={onSelect}
                    />
                ))}
            </ScrollView>

            {error ? (
                <AppText
                    variant="caption"
                    color="error"
                    style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}
                >
                    ⚠ {error}
                </AppText>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RoleSelector;
