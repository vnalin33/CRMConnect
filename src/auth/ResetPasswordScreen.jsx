import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
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
import { validateResetPasswordForm, getPasswordStrength } from '../utils/authValidation';

const { width: SW } = Dimensions.get('window');
const IS_TABLET = SW >= 768;

const LockIcon = ({ color }) => <Feather name="lock" size={18} color={color} />;
const ShieldIcon = ({ color }) => <Feather name="shield" size={18} color={color} />;
const ArrowIcon = () => <Feather name="arrow-right" size={18} color="#FFFFFF" />;

const STRENGTH_BAR_COUNT = 4;

const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password);
  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.barRow}>
        {Array.from({ length: STRENGTH_BAR_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[strengthStyles.bar, { backgroundColor: i < strength.score ? strength.color : '#E5E7EB' }]}
          />
        ))}
      </View>
      {strength.label ? (
        <AppText style={[strengthStyles.label, { color: strength.color }]}>{strength.label}</AppText>
      ) : null}
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 4 },
  barRow: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'right' },
});

const PasswordRequirements = ({ password, colors, radius }) => {
  const requirements = [
    { test: password.length >= 8, text: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { test: /[a-z]/.test(password), text: 'One lowercase letter' },
    { test: /[0-9]/.test(password), text: 'One digit (0–9)' },
    { test: /[^A-Za-z0-9]/.test(password), text: 'One special character (!@#$...)' },
  ];
  return (
    <View style={[reqStyles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg }]}>
      <AppText variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '700' }}>
        Password Requirements
      </AppText>
      {requirements.map((req, i) => (
        <View key={i} style={reqStyles.row}>
          <Feather
            name={req.test ? 'check-circle' : 'circle'}
            size={14}
            color={req.test ? colors.success : colors.textDisabled}
            style={{ marginRight: 8 }}
          />
          <AppText variant="caption" style={{ color: req.test ? colors.success : colors.textSecondary }}>
            {req.text}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const reqStyles = StyleSheet.create({
  card: { padding: 14, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});

const ResetPasswordScreen = ({ navigation, route }) => {
  const token = route?.params?.token || '';
  const { colors, spacing, radius } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const confirmRef = useRef(null);
  const { resetPassword, isLoading, error: apiError, isSuccess } = useForgotPassword({
    onSuccess: () => {
      setTimeout(() => {
        navigation.replace('MainTabs');
      }, 1500);
    }
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const clearFieldError = field => setFormErrors(prev => ({ ...prev, [field]: null }));

  const handleSubmit = useCallback(() => {
    const { errors, isValid } = validateResetPasswordForm({ newPassword, confirmPassword });
    setFormErrors(errors);
    if (!isValid) return;
    resetPassword(token, newPassword);
  }, [newPassword, confirmPassword, token, resetPassword]);

  const maxWidth = IS_TABLET ? 480 : SW;

  // No token = invalid/expired link
  if (!token) {
    return (
      <ScreenWrapper scrollable withPadding={false}>
        <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
          <View style={[styles.inner, { paddingHorizontal: IS_TABLET ? spacing.xxxl : spacing.xl, paddingTop: IS_TABLET ? spacing.huge : spacing.xxxl, paddingBottom: spacing.xl }]}>
            <View style={styles.brandSection}><AppLogo /></View>
            <View style={{ marginTop: spacing.xxxl, alignItems: 'center' }}>
              <Feather name="alert-triangle" size={48} color={colors.error} />
              <AppText variant="h1" style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 22, marginTop: spacing.lg, textAlign: 'center' }}>
                Invalid Reset Link
              </AppText>
              <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 }}>
                This link is invalid or has expired. Please request a new password reset email.
              </AppText>
              <View style={{ marginTop: spacing.xxl, width: '100%' }}>
                <AppButton
                  title="Request New Link"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  variant="gradient"
                  size="full"
                  rightIcon={<ArrowIcon />}
                />
              </View>
            </View>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

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
                <AppText variant="display" style={{ fontSize: IS_TABLET ? 38 : 32, fontWeight: '700', letterSpacing: -1, marginTop: spacing.lg, backgroundColor: 'translucent' }}>
                  ONE Bind
                </AppText>
              }
            >
              <LinearGradient colors={BRAND_GRADIENT.colors} start={BRAND_GRADIENT.start} end={BRAND_GRADIENT.end} locations={BRAND_GRADIENT.locations}>
                <AppText variant="display" style={{ opacity: 0, fontSize: IS_TABLET ? 38 : 32, fontWeight: '700', letterSpacing: -1, marginTop: spacing.lg }}>
                  ONE Bind
                </AppText>
              </LinearGradient>
            </MaskedView>
            <AppText variant="bodySm" color="secondary" style={{ marginTop: spacing.xs }}>
              Financial Suite - v1.0.0
            </AppText>
          </View>

          {/* Success State */}
          {isSuccess ? (
            <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl, alignItems: 'center' }}>
              <Feather name="check-circle" size={56} color="#10B981" />
              <AppText variant="h1" style={{ color: colors.textPrimary, fontWeight: '700', fontSize: IS_TABLET ? 28 : 24, marginTop: spacing.lg, textAlign: 'center' }}>
                Password Changed!
              </AppText>
              <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 }}>
                Your password has been updated successfully. Redirecting you to your dashboard...
              </AppText>
            </View>
          ) : (
            <>
              <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                <AppText variant="h1" style={{ color: colors.textPrimary, fontWeight: '700', fontSize: IS_TABLET ? 28 : 24 }}>
                  Set New Password
                </AppText>
                <AppText variant="body" color="secondary" style={{ marginTop: spacing.xs, lineHeight: 22 }}>
                  Create a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                </AppText>
              </View>

              <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                {/* New Password field */}
                <AppInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={val => { setNewPassword(val); clearFieldError('newPassword'); }}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  error={formErrors.newPassword}
                  leftIcon={<LockIcon color={colors.iconColor || colors.textDisabled} />}
                />

                {/* Strength bar */}
                {newPassword.length > 0 && <PasswordStrengthBar password={newPassword} />}

                {/* Live requirements checklist */}
                {newPassword.length > 0 && (
                  <PasswordRequirements password={newPassword} colors={colors} radius={radius} />
                )}

                {/* Confirm Password field */}
                <AppInput
                  ref={confirmRef}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={val => { setConfirmPassword(val); clearFieldError('confirmPassword'); }}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  error={formErrors.confirmPassword}
                  leftIcon={<ShieldIcon color={colors.iconColor || colors.textDisabled} />}
                />

                {/* Passwords match indicator */}
                {confirmPassword.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 12 }}>
                    <Feather
                      name={newPassword === confirmPassword ? 'check-circle' : 'x-circle'}
                      size={14}
                      color={newPassword === confirmPassword ? colors.success : colors.error}
                      style={{ marginRight: 6 }}
                    />
                    <AppText variant="caption" style={{ color: newPassword === confirmPassword ? colors.success : colors.error, fontWeight: '600' }}>
                      {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </AppText>
                  </View>
                )}

                {/* API Error */}
                {apiError ? (
                  <View style={[styles.errorBanner, { backgroundColor: colors.errorBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.base, borderLeftWidth: 3, borderLeftColor: colors.error }]}>
                    <AppText variant="bodySm" color="error">⚠ {apiError}</AppText>
                  </View>
                ) : null}

                {/* Submit Button */}
                <View style={{ marginTop: spacing.md }}>
                  <AppButton
                    title="Reset Password"
                    onPress={handleSubmit}
                    variant="gradient"
                    size="full"
                    loading={isLoading}
                    disabled={isLoading}
                    rightIcon={<ArrowIcon />}
                  />
                </View>

                {/* Back link */}
                <TouchableOpacity
                  style={[styles.backBtn, { marginTop: spacing.xl }]}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={16} color={colors.primary || '#6366F1'} />
                  <AppText variant="bodySm" style={{ color: colors.primary || '#6366F1', fontWeight: '600', marginLeft: 6 }}>
                    Request a new link
                  </AppText>
                </TouchableOpacity>
              </View>
            </>
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

export default ResetPasswordScreen;
