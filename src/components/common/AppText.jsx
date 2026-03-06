import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme';

const variantWeightMap = {
    display: '700', h1: '700', h2: '600', h3: '600',
    bodyLg: '400', body: '400', bodySm: '400',
    label: '500', caption: '400',
    amount: '700', amountSm: '600',
};

export const AppText = ({
    variant = 'body',
    color = 'primary',
    align,
    uppercase = false,
    style,
    children,
    ...rest
}) => {
    const { colors, typography } = useTheme();

    const resolveColor = () => {
        const map = {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
            disabled: colors.textDisabled,
            link: colors.textLink,
            inverse: colors.textInverse,
            error: colors.error,
            success: colors.success,
            warning: colors.warning,
            cyan: colors.cyan,
        };
        return map[color] ?? color;
    };

    const fontSize = typography[variant];

    return (
        <Text
            {...rest}
            style={[
                {
                    fontSize,
                    fontWeight: variantWeightMap[variant],
                    color: resolveColor(),
                    textAlign: align,
                    textTransform: uppercase ? 'uppercase' : 'none',
                    letterSpacing: variant === 'label' ? 0.8 : variant === 'display' ? -0.5 : 0,
                    lineHeight: fontSize * (variant === 'display' || variant.startsWith('h') ? 1.2 : 1.5),
                },
                ...(Array.isArray(style) ? style : style ? [style] : []),
            ]}
        >
            {children}
        </Text>
    );
};
