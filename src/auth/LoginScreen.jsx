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

import useLogin from '../hooks/useLogin';
import { validateLoginForm } from '../utils/authValidation';

const { width: SW } = Dimensions.get('window');
const IS_TABLET = SW >= 768;

const MailIcon = ({ color }) => <Feather name="mail" size={18} color={color} />;
const PhoneIcon = ({ color }) => <Feather name="phone" size={18} color={color} />;
const LockIcon = ({ color }) => <Feather name="lock" size={18} color={color} />;
const ArrowIcon = () => <Feather name="arrow-right" size={18} color="#FFFFFF" />;

const LoginScreen = ({ navigation }) => {

  const { colors, spacing, radius } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [inputType, setInputType] = useState('email');

  const passwordRef = useRef(null);

  const { login, isLoading, error: apiError } = useLogin({
    onSuccess: () => navigation.replace('MainTabs'),
  });

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


  const handleIdentifierChange = value => {

    if (value === "") {
      setInputType("email");
      setIdentifier("");
      return;
    }

    const numbersOnly = /^[0-9]*$/.test(value);
    const emailIndicators = /[.@a-zA-Z]/.test(value);

    if (numbersOnly && value.length <= 10) {
      setInputType("phone");
      setIdentifier(value);
    } else if (emailIndicators) {
      setInputType("email");
      setIdentifier(value);
    }

    clearFieldError("identifier");
  };


  const handleSubmit = useCallback(() => {

    const { errors, isValid } = validateLoginForm({ identifier, password });
    setFormErrors(errors);

    if (!isValid) return;

    login({
      identifier: identifier.trim(),
      password
    });

  }, [identifier, password, login]);


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
                  CRM Connect
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
                  CRM Connect
                </AppText>
              </LinearGradient>
            </MaskedView>

            <AppText variant="bodySm" color="secondary" style={{ marginTop: spacing.xs }}>
              Financial Suite - v1.0.0
            </AppText>

          </View>

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

          <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>

            <View style={styles.identifierContainer}>

              {inputType === "phone" && (
                <AppText style={styles.prefixText}>+91</AppText>
              )}

              <AppInput
                label="Email or Mobile"
                placeholder={inputType === 'phone' ? "9876543210" : "you@example.com"}
                value={identifier}
                onChangeText={handleIdentifierChange}
                keyboardType="default"
                autoCapitalize="none"
                returnKeyType="next"
                maxLength={inputType === 'phone' ? 10 : 60}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={formErrors.identifier}
                leftIcon={
                  inputType === 'phone'
                    ? <PhoneIcon color={colors.iconColor || colors.textDisabled} />
                    : <MailIcon color={colors.iconColor || colors.textDisabled} />
                }
                style={inputType === 'phone' ? styles.phoneInputPadding : null}
              />

            </View>


            <AppInput
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={val => {
                setPassword(val);
                clearFieldError('password');
              }}
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
                <AppText variant="bodySm" color="error">
                  ⚠ {apiError}
                </AppText>
              </View>
            ) : null}


            <TouchableOpacity
              onPress={() => navigation?.navigate('ForgotPassword')}
              style={styles.forgotBtn}
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

  identifierContainer: { position: 'relative' },

  prefixText: {
    position: 'absolute',
    left: 45,
    top: 37,
    fontSize: 14,
    color: '#6B7280',
    zIndex: 10
  },

  phoneInputPadding: {
    paddingLeft: 32
  },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 },

  errorBanner: {},

  footer: { marginTop: 'auto', paddingTop: 32, paddingBottom: 8 }

});

export default LoginScreen;