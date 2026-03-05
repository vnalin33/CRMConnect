import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export interface AppButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    iconLeft,
    iconRight,
    ...rest
}) => {
    const isOutline = variant === 'outline';
    const isText = variant === 'text';

    const getBackgroundColor = () => {
        if (disabled) return COLORS.divider;
        switch (variant) {
            case 'primary': return COLORS.primary;
            case 'secondary': return COLORS.secondary;
            case 'outline': return 'transparent';
            case 'text': return 'transparent';
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.textTertiary;
        switch (variant) {
            case 'primary': return COLORS.surface;
            case 'secondary': return COLORS.surface;
            case 'outline': return COLORS.primary;
            case 'text': return COLORS.primary;
            default: return COLORS.surface;
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'small': return 36;
            case 'large': return 56;
            case 'medium':
            default: return 48;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled || isLoading}
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    height: getHeight(),
                    borderColor: isOutline ? COLORS.primary : 'transparent',
                    borderWidth: isOutline ? 1.5 : 0,
                },
                (!isOutline && !isText && !disabled) && SHADOWS.small,
                style,
            ]}
            {...rest}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {iconLeft && <React.Fragment>{iconLeft}</React.Fragment>}
                    <Text
                        style={[
                            styles.text,
                            TYPOGRAPHY.label,
                            { color: getTextColor() },
                            !!iconLeft && { marginLeft: SPACING.sm },
                            !!iconRight && { marginRight: SPACING.sm },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {iconRight && <React.Fragment>{iconRight}</React.Fragment>}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        marginVertical: SPACING.xs,
    },
    text: {
        textAlign: 'center',
    },
});
