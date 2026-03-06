import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import AppLogo from '../components/common/AppLogo';
import ScreenWrapper from '../components/layout/ScreenWrapper';

import useLogin from './useLogin';
import { validateLoginForm } from './authValidation';

const { width: SW } = Dimensions.get('window');
const IS_TABLET = SW >= 768;

// Professional Feather Icons
const MailIcon = ({ color }) => <Feather name="mail" size={18} color={color} />;
const LockIcon = ({ color }) => <Feather name="lock" size={18} color={color} />;
const ArrowIcon = () => <Feather name="arrow-right" size={18} color="#FFFFFF" />;

const LoginScreen = ({ navigation }) => {
    const { colors, spacing, radius, isDark } = useTheme();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const passwordRef = useRef(null);

    const { login, isLoading, error: apiError } = useLogin({
        onSuccess: () => navigation?.navigate('Home'),
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSubmit = useCallback(() => {
        const { errors, isValid } = validateLoginForm({ identifier, password });
        setFormErrors(errors);
        if (!isValid) return;
        login({ identifier: identifier.trim(), password });
    }, [identifier, password, login]);

    const clearFieldError = field =>
        setFormErrors(prev => ({ ...prev, [field]: null }));

    const maxWidth = IS_TABLET ? 480 : SW;

    return (
        <ScreenWrapper scrollable withPadding={false}>
            <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            paddingHorizontal: IS_TABLET ? spacing.xxxl : spacing.xl,
                            paddingTop: IS_TABLET ? spacing.huge : spacing.xxxl,
                            paddingBottom: spacing.xl,
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo + Branding */}
                    <View style={styles.brandSection}>
                        <AppLogo />
                        <AppText
                            variant="display"
                            style={[
                                styles.brandTitle,
                                {
                                    color: isDark ? '#9D8FFF' : '#7060E8',
                                    marginTop: spacing.lg,
                                    fontSize: IS_TABLET ? 38 : 32,
                                    letterSpacing: -1,
                                },
                            ]}
                        >
                            CRM Connect
                        </AppText>
                        <AppText variant="bodySm" color="secondary" style={{ marginTop: spacing.xs }}>
                            Financial Suite - v1.0.0
                        </AppText>
                    </View>

                    {/* Welcome */}
                    <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                        <AppText
                            variant="h1"
                            style={{ color: colors.textPrimary, fontWeight: '700', fontSize: IS_TABLET ? 28 : 24 }}
                        >
                            Welcome back
                        </AppText>
                        <AppText variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
                            Sign in to continue to your dashboard
                        </AppText>
                    </View>

                    {/* Form */}
                    <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                        <AppInput
                            label="Email or Mobile"
                            placeholder="you@example.com"
                            value={identifier}
                            onChangeText={val => { setIdentifier(val); clearFieldError('identifier'); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            error={formErrors.identifier}
                            leftIcon={<MailIcon color={colors.iconColor || colors.textDisabled} />}
                        />

                        <AppInput
                            ref={passwordRef}
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={val => { setPassword(val); clearFieldError('password'); }}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoComplete="password"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            error={formErrors.password}
                            leftIcon={<LockIcon color={colors.iconColor || colors.textDisabled} />}
                        />

                        {apiError ? (
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
                                <AppText variant="bodySm" color="error">⚠ {apiError}</AppText>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            onPress={() => navigation?.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityRole="button"
                            accessibilityLabel="Forgot password"
                        >
                            <AppText variant="body" style={{ color: colors.textLink || colors.primary, fontWeight: '600' }}>
                                Forgot Password?
                            </AppText>
                        </TouchableOpacity>

                        <View style={{ marginTop: spacing.xl }}>
                            <AppButton
                                title="Sign In"
                                onPress={handleSubmit}
                                variant="gradient"
                                size="full"
                                loading={isLoading}
                                disabled={isLoading}
                                rightIcon={<ArrowIcon />}
                            />
                        </View>
                    </View>

                    {/* Footer */}
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
    container: { flex: 1 },
    inner: { flex: 1 },
    brandSection: { alignItems: 'flex-start' },
    brandTitle: { fontWeight: '700' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 },
    errorBanner: {},
    footer: { marginTop: 'auto', paddingTop: 32, paddingBottom: 8 },
});

export default LoginScreen;