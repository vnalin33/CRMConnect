import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import useForgotPassword from '../hooks/useForgotPassword';
import { validateResetPasswordForm } from '../utils/authValidation';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const { colors, spacing } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const { resetPassword, isLoading, error, success } = useForgotPassword();

  const handleReset = async () => {
    const { errors, isValid } = validateResetPasswordForm({ newPassword, confirmPassword });
    setFormErrors(errors);

    if (!isValid) return;

    const result = await resetPassword(token, newPassword);
    if (result) {
      setTimeout(() => navigation.navigate('Login'), 2000);
    }
  };

  if (!token) {
    return (
      <ScreenWrapper withPadding={false}>
        <GradientScreenHeader title="Reset Password" onBack={() => navigation.goBack()} />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Feather name="alert-circle" size={48} color={colors.error} style={{ marginBottom: 16 }} />
          <AppText variant="h2" color="error" style={{ textAlign: 'center' }}>Invalid Reset Link</AppText>
          <AppText variant="body" color="secondary" style={styles.subtitle}>
            We couldn't find a valid reset token. Please request a new password reset link.
          </AppText>
          <AppButton
            title="Go to Forgot Password"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.button}
            variant="outline"
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withPadding={false}>
      <GradientScreenHeader
        title="Create New Password"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Feather name="key" size={32} color={colors.primary} />
          </View>
          <AppText variant="h1" style={styles.title}>Secure Account</AppText>
          <AppText variant="body" color="secondary" style={styles.subtitle}>
            Please enter your new password below. Ensure it is at least 8 characters long and includes numbers and special characters.
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setFormErrors(prev => ({ ...prev, newPassword: null }));
            }}
            secureTextEntry
            showPasswordToggle
            error={formErrors.newPassword}
            leftIcon={<Feather name="lock" size={18} color={colors.textDisabled} />}
          />

          <AppInput
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setFormErrors(prev => ({ ...prev, confirmPassword: null }));
            }}
            secureTextEntry
            showPasswordToggle
            error={formErrors.confirmPassword}
            leftIcon={<Feather name="lock" size={18} color={colors.textDisabled} />}
          />

          {error && <AppText variant="caption" color="error" style={styles.errorText}>{error}</AppText>}
          {success && !isLoading && !error && (
            <AppText variant="caption" color="success" style={styles.successText}>
              Password resets successfully! Redirecting to login...
            </AppText>
          )}

          <AppButton
            title="Confirm Reset"
            onPress={handleReset}
            variant="gradient"
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  form: {
    marginTop: 8,
  },
  button: {
    marginTop: 24,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
