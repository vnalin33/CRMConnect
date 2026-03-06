import React, { useRef, useEffect } from 'react';
import {
    View, TouchableOpacity, Animated, StyleSheet,
    Dimensions, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppText } from '../../../components/common/AppText';
import { AppInput } from '../../../components/common/AppInput';
import { AppButton } from '../../../components/common/AppButton';
import { loginSchema } from '../validations/auth.schema';
import { useLogin } from '../hooks/useLogin';

const { width: SW, height: SH } = Dimensions.get('window');
const isTablet = SW >= 768;
const isWeb = Platform.OS === 'web';

// ─── Icons (inline SVG-style via Text — replace with vector-icons) ───
const MailIcon = ({ color }) => (
    <AppText style={{ fontSize: 16, color }}>✉</AppText>
);
const LockIcon = ({ color }) => (
    <AppText style={{ fontSize: 16, color }}>🔒</AppText>
);
const ArrowIcon = ({ color }) => (
    <AppText style={{ fontSize: 18, color }}>→</AppText>
);

// ─── App Logo Component ───────────────────────
const AppLogo = () => {
    const { spacing } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.logoContainer,
                { transform: [{ scale: pulseAnim }] },
            ]}
        >
            <View style={styles.logoGradientBg}>
                <AppText style={styles.logoText}>d</AppText>
            </View>
        </Animated.View>
    );
};

// ─── LoginScreen ──────────────────────────────
export const LoginScreen = ({ navigation }) => {
    const { colors, spacing, radius, typography, isDark, isTablet: tablet } = useTheme();
    const { mutate: login, isPending, error: loginError } = useLogin();

    // Entrance animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: '', password: '' },
    });

    const onSubmit = (data) => {
        login({ identifier: data.identifier, password: data.password });
    };

    const maxWidth = tablet || isWeb ? 480 : SW;

    return (
        <ScreenWrapper scrollable withPadding={false}>
            {/* Background gradient overlay */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: colors.background },
                ]}
            />

            {/* Subtle top gradient accent */}
            <View
                style={[
                    styles.topAccent,
                    { backgroundColor: isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)' },
                ]}
                pointerEvents="none"
            />

            <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            paddingHorizontal: tablet ? spacing.xxxl : spacing.xl,
                            paddingTop: tablet ? spacing.huge : spacing.xxxl,
                            paddingBottom: spacing.xl,
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* ── Logo + Branding ── */}
                    <View style={styles.brandSection}>
                        <AppLogo />
                        <AppText
                            variant="display"
                            style={[
                                styles.brandTitle,
                                {
                                    color: colors.primary,
                                    marginTop: spacing.lg,
                                    fontSize: tablet ? 38 : 32,
                                    letterSpacing: -1,
                                },
                            ]}
                        >
                            CRM Connect
                        </AppText>
                        <AppText
                            variant="bodySm"
                            color="secondary"
                            style={{ marginTop: spacing.xs }}
                        >
                            Financial Suite - v1.0.0
                        </AppText>
                    </View>

                    {/* ── Welcome copy ── */}
                    <View style={{ marginTop: tablet ? spacing.xxxl : spacing.xxl }}>
                        <AppText
                            variant="h1"
                            style={{
                                color: colors.textPrimary,
                                fontWeight: '700',
                                fontSize: tablet ? 28 : 24,
                            }}
                        >
                            Welcome back
                        </AppText>
                        <AppText
                            variant="body"
                            color="secondary"
                            style={{ marginTop: spacing.xs }}
                        >
                            Sign in to continue to your dashboard
                        </AppText>
                    </View>

                    {/* ── Form ── */}
                    <View style={{ marginTop: tablet ? spacing.xxxl : spacing.xxl }}>
                        {/* Email or Mobile */}
                        <Controller
                            control={control}
                            name="identifier"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AppInput
                                    label="Email or Mobile"
                                    placeholder="you@example.com"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="email"
                                    returnKeyType="next"
                                    error={errors.identifier?.message}
                                    leftIcon={<MailIcon color={colors.textDisabled} />}
                                />
                            )}
                        />

                        {/* Password */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AppInput
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry
                                    showPasswordToggle
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="password"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSubmit(onSubmit)}
                                    error={errors.password?.message}
                                    leftIcon={<LockIcon color={colors.textDisabled} />}
                                />
                            )}
                        />

                        {/* API Error */}
                        {loginError && (
                            <View
                                style={[
                                    styles.errorBanner,
                                    {
                                        backgroundColor: colors.errorBg,
                                        borderRadius: radius.md,
                                        padding: spacing.md,
                                        marginBottom: spacing.base,
                                        borderLeftWidth: 3,
                                        borderLeftColor: colors.error,
                                    },
                                ]}
                            >
                                <AppText variant="bodySm" color="error">
                                    {loginError.message}
                                </AppText>
                            </View>
                        )}

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={() => navigation?.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityRole="button"
                            accessibilityLabel="Forgot password"
                        >
                            <AppText
                                variant="body"
                                style={{ color: colors.primary, fontWeight: '600' }}
                            >
                                Forgot Password?
                            </AppText>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <View style={{ marginTop: spacing.xl }}>
                            <AppButton
                                title="Sign In"
                                onPress={handleSubmit(onSubmit)}
                                variant="gradient"
                                size="full"
                                loading={isPending}
                                rightIcon={<ArrowIcon color="#fff" />}
                            />
                        </View>
                    </View>

                    {/* ── Footer ── */}
                    <View style={styles.footer}>
                        <AppText variant="caption" color="disabled" align="center">
                            © 2026 CRM Connect · All rights reserved
                        </AppText>
                    </View>
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
    topAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
    },
    brandSection: {
        alignItems: 'flex-start',
    },
    brandTitle: {
        fontWeight: '700',
    },
    logoContainer: {
        width: 72,
        height: 72,
    },
    logoGradientBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        fontStyle: 'italic',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 4,
    },
    errorBanner: {},
    footer: {
        marginTop: 'auto',
        paddingTop: 32,
        paddingBottom: 8,
    },
});
