import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import GradientText from '../components/common/GradientText';
import { useChangePassword } from '../hooks/useChangePassword';

const StrengthBar = ({ strength, strengthGradient }) => {
    const { colors, radius } = useTheme();
    const widthAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: strength.level / 4,
            duration: 350,
            useNativeDriver: false,
        }).start();
    }, [strength.level, widthAnim]);

    const barWidth = widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.strengthContainer}>
            <View style={[styles.strengthTrack, { backgroundColor: colors.border, borderRadius: radius.full }]}>
                <Animated.View style={{ width: barWidth, height: '100%', borderRadius: radius.full, overflow: 'hidden' }}>
                    <LinearGradient
                        colors={strengthGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1, borderRadius: radius.full }}
                    />
                </Animated.View>
            </View>
            <AppText
                variant="caption"
                style={[styles.strengthLabel, { color: strength.color }]}
            >
                {strength.label}
            </AppText>
        </View>
    );
};

const ChangePasswordScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const {
        oldPassword,
        setOldPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        errors,
        successMessage,
        strength,
        strengthGradient,
        handleSubmit,
        clearFieldError,
    } = useChangePassword(navigation);

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={styles.root}
        >
            <GradientScreenHeader
                title="Change Password"
                showBack
                navigation={navigation}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.base }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header icon */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={[styles.iconCircle, { borderRadius: radius.full }]}
                        >
                            <Feather name="lock" size={28} color="#FFFFFF" />
                        </LinearGradient>
                        <GradientText variant="h2" style={styles.heading}>
                            Update Your Password
                        </GradientText>
                        <AppText variant="bodySm" color="secondary" style={styles.subheading}>
                            Secure your account with a strong password
                        </AppText>
                    </View>

                    {/* General error */}
                    {errors.general ? (
                        <View style={[styles.alertBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderRadius: radius.lg }]}>
                            <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
                            <AppText variant="bodySm" style={{ color: colors.error, flex: 1 }}>{errors.general}</AppText>
                        </View>
                    ) : null}

                    {/* Success message */}
                    {successMessage ? (
                        <View style={[styles.alertBox, { backgroundColor: colors.successBg, borderColor: colors.success, borderRadius: radius.lg }]}>
                            <Feather name="check-circle" size={16} color={colors.success} style={{ marginRight: 8 }} />
                            <AppText variant="bodySm" style={{ color: colors.successText, flex: 1 }}>{successMessage}</AppText>
                        </View>
                    ) : null}

                    {/* Current password */}
                    <AppInput
                        label="Current Password"
                        placeholder="Enter current password"
                        value={oldPassword}
                        onChangeText={(t) => { setOldPassword(t); clearFieldError('oldPassword'); }}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.oldPassword}
                        returnKeyType="next"
                        onSubmitEditing={() => newPasswordRef.current?.focus()}
                        leftIcon={<Feather name="lock" size={18} color={colors.textSecondary} />}
                    />

                    {/* New password */}
                    <AppInput
                        ref={newPasswordRef}
                        label="New Password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={(t) => { setNewPassword(t); clearFieldError('newPassword'); }}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.newPassword}
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        leftIcon={<Feather name="shield" size={18} color={colors.textSecondary} />}
                    />

                    {/* Strength bar — only show when typing a new password */}
                    {newPassword.length > 0 && (
                        <StrengthBar strength={strength} strengthGradient={strengthGradient} />
                    )}

                    {/* Password requirements */}
                    {newPassword.length > 0 && (
                        <View style={[styles.requirementsCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg }]}>
                            <AppText variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '700' }}>
                                Password Requirements
                            </AppText>
                            {[
                                { test: newPassword.length >= 8, text: 'At least 8 characters' },
                                { test: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                                { test: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
                                { test: /[0-9]/.test(newPassword), text: 'One digit' },
                                { test: /[^A-Za-z0-9]/.test(newPassword), text: 'One special character (!@#$...)' },
                            ].map((req, i) => (
                                <View key={i} style={styles.reqRow}>
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
                    )}

                    {/* Confirm password */}
                    <AppInput
                        ref={confirmPasswordRef}
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); clearFieldError('confirmPassword'); }}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.confirmPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        leftIcon={<Feather name="check-square" size={18} color={colors.textSecondary} />}
                    />

                    {/* Submit button */}
                    <AppButton
                        title="Update Password"
                        variant="gradient"
                        size="full"
                        loading={loading}
                        disabled={!oldPassword || !newPassword || !confirmPassword}
                        onPress={handleSubmit}
                        style={{ marginTop: spacing.md }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconCircle: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heading: {
        fontWeight: '700',
        marginBottom: 4,
    },
    subheading: {
        textAlign: 'center',
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -8,
        marginBottom: 12,
    },
    strengthTrack: {
        flex: 1,
        height: 6,
        overflow: 'hidden',
    },
    strengthLabel: {
        marginLeft: 10,
        fontWeight: '700',
        fontSize: 12,
    },
    requirementsCard: {
        padding: 14,
        marginBottom: 16,
    },
    reqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
});

export default ChangePasswordScreen;
