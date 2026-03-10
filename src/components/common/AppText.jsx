import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme';

const SIZES = {
    display: 34, h1: 24, h2: 20, h3: 17,
    bodyLg: 16, body: 14, bodySm: 13,
    label: 11, caption: 11, amount: 26, amountSm: 17,
};

const WEIGHTS = {
    display: '800', h1: '700', h2: '600', h3: '600',
    bodyLg: '400', body: '400', bodySm: '400',
    label: '600', caption: '400', amount: '700', amountSm: '600',
};

const AppText = ({
    variant = 'body', color = 'primary', align,
    uppercase = false, numberOfLines, style, children, ...rest
}) => {
    const { colors } = useTheme();

    const resolveColor = () => {
        const map = {
            primary: colors.textPrimary, secondary: colors.textSecondary,
            disabled: colors.textDisabled, link: colors.textLink,
            inverse: colors.textInverse, error: colors.error,
            success: colors.success, warning: colors.warning,
            cyan: colors.cyan, brand: colors.textBrand,
        };
        return map[color] ?? color;
    };

    const size = SIZES[variant] ?? 14;

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[
                {
                    fontSize: size,
                    fontWeight: style?.fontWeight ?? WEIGHTS[variant] ?? '600',
                    color: resolveColor(),
                    textAlign: align,
                    letterSpacing: variant === 'label' ? 0.8 : variant === 'display' ? -0.8 : 0,
                    lineHeight: size * (['display', 'h1', 'h2', 'h3'].includes(variant) ? 1.2 : 1.5),
                    textTransform: uppercase || variant === 'label' ? 'uppercase' : 'none',
                    includeFontPadding: false,
                },
                style,
            ]}
            {...rest}
        >
            {children}
        </Text>
    );
};

export default AppText;