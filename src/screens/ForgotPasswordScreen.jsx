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

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const { requestReset, isLoading, error, success } = useForgotPassword();

  const handleRequestToken = async () => {
    if (!email) return;
    await requestReset(email);
  };

  return (
    <ScreenWrapper withPadding={false}>
      <GradientScreenHeader 
        title="Reset Password"
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Feather name={success ? "check-circle" : "lock"} size={32} color={colors.primary} />
          </View>
          <AppText variant="h1" style={styles.title}>
            Forgot Password?
          </AppText>
          <AppText variant="body" color="secondary" style={styles.subtitle}>
            {success 
              ? "If an account exists with this email, we've sent a secure link to reset your password. Please check your inbox."
              : "Enter your email address and we'll send you a secure link to reset your password."}
          </AppText>
        </View>

        {!success && (
          <View style={styles.form}>
            <AppInput
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Feather name="mail" size={18} color={colors.textDisabled} />}
            />
            
            {error && <AppText variant="caption" color="error" style={styles.errorText}>{error}</AppText>}

            <AppButton
              title="Send Reset Link"
              onPress={handleRequestToken}
              variant="gradient"
              loading={isLoading}
              style={styles.button}
            />
          </View>
        )}
        
        {success && (
          <View style={styles.form}>
            <AppButton
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.button}
            />
          </View>
        )}
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
});

export default ForgotPasswordScreen;
