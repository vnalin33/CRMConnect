import React, { useRef } from 'react';
import { TouchableOpacity, View, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import AppText from './AppText';

const sizeMap = {
    sm: { height: 36, paddingH: 16, fontSize: 13 },
    md: { height: 44, paddingH: 20, fontSize: 14 },
    lg: { height: 52, paddingH: 24, fontSize: 16 },
    full: { height: 54, paddingH: 24, fontSize: 16 },
};

const AppButton = ({
    title, onPress, variant = 'gradient', size = 'lg',
    loading = false, disabled = false,
    leftIcon, rightIcon, style, textStyle,
}) => {
    const { colors, spacing, radius } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { height, paddingH, fontSize } = sizeMap[size] ?? sizeMap.lg;
    const isDisabled = disabled || loading;

    const onPressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
    const onPressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    const getContainerStyle = () => {
        const base = {
            height, borderRadius: radius.full, paddingHorizontal: paddingH,
            justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
            overflow: 'hidden', width: size === 'full' ? '100%' : undefined,
        };
        switch (variant) {
            case 'gradient':
            case 'primary':
                return { ...base, backgroundColor: colors.primary };
            case 'outline':
                return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
            case 'ghost':
                return { ...base, backgroundColor: 'transparent' };
            case 'danger':
                return { ...base, backgroundColor: colors.error };
            default:
                return base;
        }
    };

    const getTextColor = () => {
        if (variant === 'outline' || variant === 'ghost') return colors.primary;
        return '#FFFFFF';
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.55 : 1 }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
                style={getContainerStyle()}
                accessibilityRole="button"
                accessibilityLabel={title}
                accessibilityState={{ disabled: isDisabled, busy: loading }}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} size="small" />
                ) : (
                    <>
                        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
                        <AppText
                            variant={size === 'sm' ? 'bodySm' : 'bodyLg'}
                            style={[{ fontWeight: '700', fontSize, color: getTextColor() }, textStyle]}
                        >
                            {title}
                        </AppText>
                        {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default AppButton;