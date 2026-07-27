import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import AppLogo from '../components/common/AppLogo';
import DropdownSelect from '../components/common/DropdownSelect';
import ScreenWrapper from '../components/layout/ScreenWrapper';

import { BRAND_GRADIENT } from '../theme/colors';
import { validateSignupForm, SIGNUP_ROLES } from '../utils/authValidation';
import useSignup from '../hooks/useSignup';
import { getPasswordStrength } from '../utils/authValidation';
import CountryCodePicker, { COUNTRIES } from '../components/common/CountryCodePicker';

const ROLE_OPTIONS = SIGNUP_ROLES.map(r => r.label);
const roleIdFromLabel = label => SIGNUP_ROLES.find(r => r.label === label)?.id ?? '';

const { width: SW } = Dimensions.get('window');
const IS_TABLET = SW >= 768;

// ── Icon helpers ────────────────────────────────────────────────
const UserIcon  = ({ color }) => <Feather name="user"       size={18} color={color} />;
const MailIcon  = ({ color }) => <Feather name="mail"       size={18} color={color} />;
const PhoneIcon = ({ color }) => <Feather name="phone"      size={18} color={color} />;
const LockIcon  = ({ color }) => <Feather name="lock"       size={18} color={color} />;
const ShieldIcon = ({ color }) => <Feather name="shield"    size={18} color={color} />;
const CalendarIcon = ({ color }) => <Feather name="calendar" size={18} color={color} />;
const ArrowIcon = ()          => <Feather name="arrow-right" size={18} color="#FFFFFF" />;

// ── Password Strength Bar ────────────────────────────────────────
const PasswordStrengthBar = ({ password }) => {
    const { colors, spacing } = useTheme();
    const { score, label, color } = getPasswordStrength(password);
    if (!password) return null;
    return (
        <View style={{ marginTop: 4, marginBottom: spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <View
                        key={i}
                        style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: i <= score ? color : colors.border,
                        }}
                    />
                ))}
            </View>
            <AppText variant="caption" style={{ color, marginTop: 4, fontWeight: '600' }}>
                {label}
            </AppText>
        </View>
    );
};



// ── Main Screen ──────────────────────────────────────────────────
const SignupScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();

    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [phone, setPhone]       = useState('');
    const [dob, setDob]           = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [roleLabel, setRoleLabel] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [signupCountry, setSignupCountry] = useState(COUNTRIES[0]); // India default
    const [showDatePicker, setShowDatePicker] = useState(false);

    const emailRef    = useRef(null);
    const phoneRef    = useRef(null);
    const dobRef      = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const { signup, isLoading, error: apiError } = useSignup({
        onSuccess: () => navigation.replace('MainTabs'),
    });

    // Entrance animation
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const clearFieldError = field =>
        setFormErrors(prev => ({ ...prev, [field]: null }));

    const handleSubmit = useCallback(() => {
        const role = roleIdFromLabel(roleLabel);
        const { errors, isValid } = validateSignupForm({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            dob: dob.trim(),
            password,
            confirmPassword,
            role,
        });

        // Extra validation: if role is 'others', customRole is required
        if (role === 'others' && !customRole.trim()) {
            errors.customRole = 'Please specify your profession';
        }

        setFormErrors(errors);
        if (!isValid || errors.customRole) return;

        signup({
            name:  name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            dob: dob.trim(),
            password,
            role: role === 'others' ? customRole.trim() : roleLabel.trim(),
        });
    }, [name, email, phone, password, confirmPassword, roleLabel, customRole, dob, signup]);

    const maxWidth = IS_TABLET ? 480 : SW;

    return (
        <ScreenWrapper scrollable withPadding={false}>
            <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            paddingHorizontal: IS_TABLET ? spacing.xxxl : spacing.xl,
                            paddingTop:        IS_TABLET ? spacing.huge  : spacing.xxxl,
                            paddingBottom: spacing.xl,
                            opacity:   fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >

                    {/* ── Brand Section ── */}
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

                    {/* ── Heading ── */}
                    <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>
                        <AppText
                            variant="h1"
                            style={{
                                color: colors.textPrimary,
                                fontWeight: '700',
                                fontSize: IS_TABLET ? 28 : 24,
                            }}
                        >
                            Create Account
                        </AppText>
                        <AppText variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
                            Fill in the details below to get started
                        </AppText>
                    </View>

                    {/* ── Form ── */}
                    <View style={{ marginTop: IS_TABLET ? spacing.xxxl : spacing.xxl }}>

                        {/* Full Name */}
                        <AppInput
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={val => { setName(val); clearFieldError('name'); }}
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            error={formErrors.name}
                            leftIcon={<UserIcon color={colors.iconColor || colors.textDisabled} />}
                        />

                        {/* Email */}
                        <AppInput
                            ref={emailRef}
                            label="Email Address"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={val => { setEmail(val); clearFieldError('email'); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => phoneRef.current?.focus()}
                            error={formErrors.email}
                            leftIcon={<MailIcon color={colors.iconColor || colors.textDisabled} />}
                        />

                        {/* Phone */}
                        <AppInput
                            ref={phoneRef}
                            label="Mobile Number"
                            placeholder="9876543210"
                            value={phone}
                            onChangeText={val => {
                                if (/^[0-9]*$/.test(val) && val.length <= 10) {
                                    setPhone(val);
                                    clearFieldError('phone');
                                }
                            }}
                            keyboardType="phone-pad"
                            maxLength={10}
                            returnKeyType="next"
                            onSubmitEditing={() => setShowDatePicker(true)}
                            error={formErrors.phone}
                            leftIcon={
                                <CountryCodePicker
                                    selected={signupCountry}
                                    onSelect={setSignupCountry}
                                />
                            }
                        />

                        {/* DOB */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                            <View pointerEvents="none">
                                <AppInput
                                    label="Date of Birth"
                                    placeholder="YYYY-MM-DD"
                                    value={dob}
                                    error={formErrors.dob}
                                    leftIcon={<CalendarIcon color={colors.iconColor || colors.textDisabled} />}
                                    editable={false}
                                />
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                                mode="date"
                                display="default"
                                maximumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        const formattedDate = selectedDate.toISOString().split('T')[0];
                                        setDob(formattedDate);
                                        clearFieldError('dob');
                                    }
                                }}
                            />
                        )}

                        {/* Password */}
                        <AppInput
                            ref={passwordRef}
                            label="Password"
                            placeholder="Min. 8 chars, uppercase & symbol"
                            value={password}
                            onChangeText={val => { setPassword(val); clearFieldError('password'); }}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                            error={formErrors.password}
                            leftIcon={<LockIcon color={colors.iconColor || colors.textDisabled} />}
                        />
                        <PasswordStrengthBar password={password} />

                        {/* Confirm Password */}
                        <AppInput
                            ref={confirmPasswordRef}
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

                        {/* Role Dropdown */}
                        <DropdownSelect
                            label="Select Profession *"
                            placeholder="Choose your profession"
                            value={roleLabel}
                            options={ROLE_OPTIONS}
                            isOpen={roleDropdownOpen}
                            onToggle={() => setRoleDropdownOpen(prev => !prev)}
                            onSelect={label => {
                                setRoleLabel(label);
                                setRoleDropdownOpen(false);
                                clearFieldError('role');
                                if (label !== 'Others') setCustomRole('');
                            }}
                            error={formErrors.role}
                        />

                        {/* Custom Role Input — shown only when 'Others' is selected */}
                        {roleLabel === 'Others' && (
                            <AppInput
                                label="Specify Your Profession *"
                                placeholder="Enter your profession"
                                value={customRole}
                                onChangeText={val => { setCustomRole(val); clearFieldError('customRole'); }}
                                autoCapitalize="words"
                                error={formErrors.customRole}
                                leftIcon={<UserIcon color={colors.iconColor || colors.textDisabled} />}
                            />
                        )}

                        {/* API Error Banner */}
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

                        {/* Submit */}
                        <View style={{ marginTop: spacing.xl }}>
                            <AppButton
                                title="Create Account"
                                onPress={handleSubmit}
                                variant="gradient"
                                size="full"
                                loading={isLoading}
                                disabled={isLoading}
                                rightIcon={<ArrowIcon />}
                            />
                        </View>

                    </View>

                    {/* ── Footer: Link back to Login ── */}
                    <View style={styles.footer}>
                        <AppText variant="bodySm" color="secondary" align="center">
                            Already have an account?{' '}
                            <AppText
                                variant="bodySm"
                                style={{ color: colors.primary, fontWeight: '700' }}
                                onPress={() => navigation.navigate('Login')}
                            >
                                Sign In
                            </AppText>
                        </AppText>

                        <AppText variant="caption" color="disabled" align="center" style={{ marginTop: spacing.base }}>
                            © 2026 ONE Bind · All rights reserved
                        </AppText>
                    </View>

                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container:         { flex: 1 },
    inner:             { flex: 1 },
    brandSection:      { alignItems: 'flex-start' },
    errorBanner:       {},
    footer:            { marginTop: 'auto', paddingTop: 32, paddingBottom: 8 },
});

export default SignupScreen;
