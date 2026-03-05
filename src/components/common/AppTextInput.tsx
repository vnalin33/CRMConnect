import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

export interface AppTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
    label,
    error,
    iconLeft,
    iconRight,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label && (
                <Text style={[styles.label, !!error && styles.errorText]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focusedInput,
                    !!error && styles.errorInput,
                ]}
            >
                {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}

                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={COLORS.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </View>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: SPACING.xs,
    },
    label: {
        ...TYPOGRAPHY.label,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        minHeight: 48,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        ...TYPOGRAPHY.body1,
        paddingVertical: SPACING.sm, // Ensure multi-line handles right
    },
    focusedInput: {
        borderColor: COLORS.primary,
        backgroundColor: '#FAFCFF',
    },
    errorInput: {
        borderColor: COLORS.error,
    },
    errorText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.error,
        marginTop: SPACING.xs,
    },
    iconLeft: {
        marginRight: SPACING.sm,
    },
    iconRight: {
        marginLeft: SPACING.sm,
    },
});
