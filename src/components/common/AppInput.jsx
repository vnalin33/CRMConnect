import React, { useState, useRef, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from './AppText';

const AppInput = forwardRef(({
    label, placeholder, value, onChangeText, onFocus, onBlur,
    onSubmitEditing, keyboardType, autoCapitalize = 'none',
    autoCorrect = false, autoComplete, returnKeyType = 'next',
    secureTextEntry = false, showPasswordToggle = false,
    leftIcon, rightIcon, error, hint, editable = true,
    multiline = false, maxLength, containerStyle, inputStyle, ...rest
}, ref) => {
    const { colors, spacing, radius } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = e => {
        setIsFocused(true);
        Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        onFocus?.(e);
    };

    const handleBlur = e => {
        setIsFocused(false);
        Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        onBlur?.(e);
    };

    const animatedBorderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error ? colors.error : colors.border,
            error ? colors.error : colors.primary,
        ],
    });

    return (
        <View style={[{ marginBottom: spacing.base }, containerStyle]}>
            {label ? (
                <AppText variant="label" color="secondary" style={{ marginBottom: spacing.xs }}>
                    {label}
                </AppText>
            ) : null}

            <Animated.View
                style={[
                    styles.inputBox,
                    {
                        backgroundColor: colors.inputBg,
                        borderRadius: radius.xl,
                        borderColor: animatedBorderColor,
                        paddingHorizontal: spacing.base,
                        minHeight: 52,
                    },
                    isFocused && {
                        shadowColor: '#816FF5',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    },
                    !editable && { opacity: 0.6 },
                ]}
            >
                {leftIcon ? <View style={[styles.iconSlot, { marginRight: spacing.sm }]}>{leftIcon}</View> : null}

                <TextInput
                    ref={ref}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textDisabled}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    autoComplete={autoComplete}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    editable={editable}
                    multiline={multiline}
                    maxLength={maxLength}
                    style={[styles.input, { color: colors.textPrimary, fontSize: 14, flex: 1 }, inputStyle]}
                    accessibilityLabel={label}
                    {...rest}
                />

                {showPasswordToggle ? (
                    <TouchableOpacity
                        onPress={() => setIsSecure(p => !p)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
                        style={[styles.eyeBtn, { marginLeft: spacing.sm }]}
                    >
                        <Feather
                            name={isSecure ? 'eye-off' : 'eye'}
                            size={20}
                            color={isFocused ? colors.primary : (colors.iconColor || colors.textDisabled)}
                        />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <View style={[styles.iconSlot, { marginLeft: spacing.sm }]}>{rightIcon}</View>
                ) : null}
            </Animated.View>

            {error ? (
                <AppText variant="caption" color="error" style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}>
                    ⚠ {error}
                </AppText>
            ) : hint ? (
                <AppText variant="caption" color="secondary" style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}>
                    {hint}
                </AppText>
            ) : null}
        </View>
    );
});

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
    inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, overflow: 'hidden' },
    input: { padding: 0, margin: 0, includeFontPadding: false },
    iconSlot: { justifyContent: 'center', alignItems: 'center' },
    eyeBtn: { justifyContent: 'center', alignItems: 'center', padding: 4 },
});

export default AppInput;