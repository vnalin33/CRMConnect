import React, { useState, useRef } from 'react';
import {
    View, TextInput, TouchableOpacity,
    StyleSheet, Animated,
} from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

export const AppInput = ({
    label,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    error,
    hint,
    secureTextEntry,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    ...rest
}) => {
    const { colors, spacing, radius, typography, elevation } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = (e) => {
        setIsFocused(true);
        Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        onBlur?.(e);
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.primary],
    });

    const EyeIcon = () => (
        <TouchableOpacity
            onPress={() => setIsSecure(p => !p)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
        >
            <AppText variant="body" color={isSecure ? 'disabled' : 'secondary'}>
                {isSecure ? '👁️' : '🙈'}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <View style={[{ marginBottom: spacing.base }, containerStyle]}>
            {label && (
                <AppText
                    variant="label"
                    color="secondary"
                    uppercase
                    style={{ marginBottom: spacing.xs, letterSpacing: 0.8 }}
                >
                    {label}
                </AppText>
            )}

            <Animated.View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: colors.inputBg,
                        borderRadius: radius.xl,
                        borderWidth: 1.5,
                        borderColor,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.md,
                        minHeight: 52,
                    },
                    isFocused && elevation.xs,
                ]}
            >
                {leftIcon && (
                    <View style={[styles.icon, { marginRight: spacing.sm }]}>
                        {leftIcon}
                    </View>
                )}

                <TextInput
                    {...rest}
                    secureTextEntry={isSecure}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholderTextColor={colors.textDisabled}
                    style={[
                        styles.input,
                        {
                            fontSize: typography.body,
                            color: colors.textPrimary,
                            flex: 1,
                        },
                        inputStyle,
                    ]}
                    accessibilityLabel={label}
                />

                {(showPasswordToggle || rightIcon) && (
                    <View style={[styles.icon, { marginLeft: spacing.sm }]}>
                        {showPasswordToggle ? <EyeIcon /> : rightIcon}
                    </View>
                )}
            </Animated.View>

            {(error || hint) && (
                <AppText
                    variant="caption"
                    color={error ? 'error' : 'secondary'}
                    style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}
                >
                    {error ?? hint}
                </AppText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        padding: 0,
        margin: 0,
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
