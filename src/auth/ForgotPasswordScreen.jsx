import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import AppLogo from '../components/common/AppLogo';
import ScreenWrapper from '../components/layout/ScreenWrapper';

import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { BRAND_GRADIENT } from '../theme/colors';

import useForgotPassword from '../hooks/useForgotPassword';
import { validateForgotPasswordForm } from '../utils/authValidation';

const { width: SW } = Dimensions.get('window');
const IS_TABLET = SW >= 768;

const MailIcon = ({ color }) => <Feather name="mail" size={18} color={color} />;
const ArrowIcon = () => <Feather name="arrow-right" size={18} color="#FFFFFF" />;
const BackIcon = ({ color }) => <Feather name="arrow-left" size={20} color={color} />;
const CheckIcon = () => <Feather name="check-circle" size={48} color="#10B981" />;

const ForgotPasswordScreen = ({ navigation }) => {

  const { colors, spacing, radius } = useTheme();

  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const { requestReset, isLoading, error: apiError, isSuccess, message } = useForgotPassword();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const clearFieldError = field =>
    setFormErrors(prev => ({ ...prev, [field]: null }));

  const handleSubmit = useCallback(() => {
    const { errors, isValid } = validateForgotPasswordForm({ email });
    setFormErrors(errors);
    if (!isValid) return;
    requestReset(email.trim());
  }, [email, requestReset]);

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

          {/* Logo */}
          <View style={styles.brandSection}>
            <AppLogo />

            <MaskedView
              maskElement={
                <AppText
                  variant="display"
                  style={{
                    fontSize: IS_TABLET ? 38 : 32,
                    fontWeight: '700',
                    letterSpacing: -1,
                    marginTop: spacing.lg,
                    backgroundColor: 'translucent',
                  }}
                >
                  ONE Bind
                </AppText>
              }
            >
              <LinearGradient
                colors={BRAND_GRADIENT.colors}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
                locations={BRAND_GRADIENT.locations}
              >
                <AppText
                  variant="display"
                  style={{
                    opacity: 0,
                    fontSize: IS_TABLET ? 38 : 32,
                    fontWeight: '700',
                    letterSpacing: -1,
                    marginTop: spacing.lg,
                  }}
                >
                  ONE Bind
                </AppText>
              </LinearGradient>
            </MaskedView>

            <AppText variant="bodySm" color="secondary" style={{ marginTop: spacing.xs }}>
              Financial Suite - v1.0.0
            </AppText>
          </View>

          {/* Content changes based on success state */}
          {isSuccess ? (
            <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl, alignItems: 'center' }}>
              <CheckIcon />

              <AppText
                variant="h1"
                style={{ color: colors.textPrimary, fontWeight: '700', fontSize: IS_TABLET ? 28 : 24, marginTop: spacing.lg, textAlign: 'center' }}
              >
                Check Your Email
              </AppText>

              <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 }}>
                {message || 'We\'ve sent a password reset link to your email address. Please check your inbox and tap the link to reset your password.'}
              </AppText>

              <View style={{ marginTop: spacing.xxl, width: '100%' }}>
                <AppButton
                  title="Back to Login"
                  onPress={() => navigation.navigate('Login')}
                  variant="gradient"
                  size="full"
                  rightIcon={<ArrowIcon />}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                <AppText
                  variant="h1"
                  style={{ color: colors.textPrimary, fontWeight: '700', fontSize: IS_TABLET ? 28 : 24 }}
                >
                  Forgot Password?
                </AppText>

                <AppText variant="body" color="secondary" style={{ marginTop: spacing.xs, lineHeight: 22 }}>
                  Enter your registered email address and we'll send you a link to reset your password.
                </AppText>
              </View>

              <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                <AppInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={val => {
                    setEmail(val);
                    clearFieldError('email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  error={formErrors.email}
                  leftIcon={<MailIcon color={colors.iconColor || colors.textDisabled} />}
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
                    <AppText variant="bodySm" color="error">
                      ⚠ {apiError}
                    </AppText>
                  </View>
                ) : null}

                <View style={{ marginTop: spacing.xl }}>
                  <AppButton
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    variant="gradient"
                    size="full"
                    loading={isLoading}
                    disabled={isLoading}
                    rightIcon={<ArrowIcon />}
                  />
                </View>
              </View>
            </>
          )}

          {/* Back to Login */}
          {!isSuccess && (
            <TouchableOpacity
              style={[styles.backBtn, { marginTop: spacing.xl }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <BackIcon color={colors.primary || '#6366F1'} />
              <AppText
                variant="bodySm"
                style={{ color: colors.primary || '#6366F1', fontWeight: '600', marginLeft: 6 }}
              >
                Back to Login
              </AppText>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <AppText variant="caption" color="disabled" align="center">
              © 2026 ONE Bind · All rights reserved
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
  errorBanner: {},
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
  footer: { marginTop: 'auto', paddingTop: 32, paddingBottom: 8 },
});

export default ForgotPasswordScreen;
