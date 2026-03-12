import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import GradientText from '../components/common/GradientText';
import { useNewLead } from '../hooks/useNewLead';
const DropdownSelect = ({ label, placeholder, value, options, isOpen, onToggle, onSelect, error }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View style={{ marginBottom: spacing.base }}>
            {label ? (
                <AppText variant="label" color="secondary" style={{ marginBottom: spacing.xs }}>
                    {label}
                </AppText>
            ) : null}

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onToggle}
                style={[
                    styles.dropdownTrigger,
                    {
                        backgroundColor: colors.inputBg,
                        borderColor: error ? colors.error : isOpen ? colors.primary : colors.border,
                        borderRadius: radius.xl,
                        paddingHorizontal: spacing.base,
                    }
                ]}
            >
                <AppText
                    variant="bodySm"
                    style={{
                        flex: 1,
                        color: value ? colors.textPrimary : colors.textPlaceholder,
                        fontSize: 14,
                    }}
                >
                    {value || placeholder}
                </AppText>
                <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[
                    styles.dropdownList,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                    }
                ]}>
                    {/* Header Option */}
                    <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        locations={BRAND_GRADIENT.locations}
                        style={[styles.dropdownHeaderItem, { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]}
                    >
                        <AppText variant="bodySm" style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>
                            {placeholder}
                        </AppText>
                    </LinearGradient>

                    {options.map((item, index) => (
                        <TouchableOpacity
                            key={item}
                            activeOpacity={0.7}
                            onPress={() => onSelect(item)}
                            style={[
                                styles.dropdownItem,
                                {
                                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                                    borderBottomColor: colors.divider,
                                    borderBottomLeftRadius: index === options.length - 1 ? radius.md : 0,
                                    borderBottomRightRadius: index === options.length - 1 ? radius.md : 0,
                                }
                            ]}
                        >
                            <AppText variant="bodySm" style={{ color: colors.textPrimary, fontSize: 13 }}>
                                {item}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {error ? (
                <AppText variant="caption" color="error" style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}>
                    ⚠ {error}
                </AppText>
            ) : null}
        </View>
    );
};

const NewLeadScreen = ({ navigation }) => {
    const { colors, spacing, radius, isDark } = useTheme();

    const {
        firstName, lastName, email, mobile,
        loanType, loanAmount, annualIncome, employmentType, notes,
        setFirstName, setLastName, setEmail, setMobile,
        setLoanAmount, setAnnualIncome, setNotes,
        showLoanDropdown, setShowLoanDropdown,
        showEmploymentDropdown, setShowEmploymentDropdown,
        selectLoanType, selectEmploymentType,
        LOAN_TYPES, EMPLOYMENT_TYPES,
        errors, setErrors, submitting,
        handleSubmit, handleSaveDraft,
    } = useNewLead();

    const onSubmit = async () => {
        const result = await handleSubmit();
        if (result?.success) {
            Alert.alert('Success', 'Lead submitted successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        }
    };

    const onDraft = async () => {
        const result = await handleSaveDraft();
        if (result?.success) {
            Alert.alert('Saved', 'Lead saved as draft.');
        }
    };

    return (
        <ScreenWrapper scrollable withPadding={false} edges={['bottom', 'left', 'right']} style={{ backgroundColor: colors.background }}>

            <GradientScreenHeader
                title="Add Contact"
                subtitle="New Lead Entry"
                showBack
                navigation={navigation}
            />

            {/* ── Form Container ──────────────── */}
            <View style={[styles.formContainer, { paddingHorizontal: spacing.base }]}>

                {/* ── PERSONAL INFO ──────────── */}
                <GradientText variant="label" style={styles.sectionTitle}>
                    PERSONAL INFO
                </GradientText>

                {/* First Name / Last Name Row */}
                <View style={styles.nameRow}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <AppInput
                            label="FIRST NAME"
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(t) => {
                                setFirstName(t.replace(/[^a-zA-Z\s]/g, ''));
                                setErrors(prev => ({ ...prev, firstName: null }));
                            }}
                            error={errors.firstName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AppInput
                            label="LAST NAME"
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(t) => {
                                setLastName(t.replace(/[^a-zA-Z\s]/g, ''));
                                setErrors(prev => ({ ...prev, lastName: null }));
                            }}
                            error={errors.lastName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                </View>

                {/* Email */}
                <AppInput
                    label="EMAIL ID"
                    placeholder="email@example.com"
                    value={email}
                    keyboardType="email-address"
                    onChangeText={(t) => {
                        setEmail(t);
                        setErrors(prev => ({ ...prev, email: null }));
                    }}
                    error={errors.email}
                    leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                />

                {/* Mobile Number */}
                <AppInput
                    label="MOBILE NUMBER"
                    placeholder="+91 00000 00000"
                    value={mobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onChangeText={(t) => {
                        setMobile(t.replace(/[^0-9]/g, ''));
                        setErrors(prev => ({ ...prev, mobile: null }));
                    }}
                    error={errors.mobile}
                    leftIcon={
                        <View style={styles.flagContainer}>
                            <MaterialCommunityIcons name="flag-in" size={20} color={colors.success} style={{ marginRight: 2 }} />
                            <Feather name="chevron-down" size={12} color={colors.textSecondary} style={{ marginLeft: 2 }} />
                        </View>
                    }
                />

                {/* ── LOAN DETAILS ─────────── */}
                <GradientText variant="label" style={styles.sectionTitle}>
                    LOAN DETAILS
                </GradientText>

                {/* Loan Type Dropdown */}
                <DropdownSelect
                    label="LOAN TYPE"
                    placeholder="--Select Loan Type--"
                    value={loanType}
                    options={LOAN_TYPES}
                    isOpen={showLoanDropdown}
                    onToggle={() => {
                        setShowLoanDropdown(!showLoanDropdown);
                        setShowEmploymentDropdown(false);
                    }}
                    onSelect={selectLoanType}
                    error={errors.loanType}
                />

                {/* Required Loan Amount */}
                <AppInput
                    label="REQUIRED LOAN AMOUNT"
                    placeholder="Enter Loan Amount"
                    value={loanAmount}
                    keyboardType="numeric"
                    onChangeText={(t) => {
                        setLoanAmount(t.replace(/[^0-9,]/g, ''));
                        setErrors(prev => ({ ...prev, loanAmount: null }));
                    }}
                    error={errors.loanAmount}
                    leftIcon={<MaterialCommunityIcons name="cash-multiple" size={18} color={colors.textPlaceholder} />}
                />

                {/* Annual Income */}
                <AppInput
                    label="ANNUAL INCOME"
                    placeholder="e.g. ₹6,00,000 per year"
                    value={annualIncome}
                    keyboardType="numeric"
                    onChangeText={(t) => {
                        setAnnualIncome(t.replace(/[^0-9,]/g, ''));
                        setErrors(prev => ({ ...prev, annualIncome: null }));
                    }}
                    error={errors.annualIncome}
                    leftIcon={<MaterialCommunityIcons name="cash-fast" size={18} color={colors.textPlaceholder} />}
                />
                <DropdownSelect
                    label="EMPLOYMENT TYPE"
                    placeholder="--Select Employment Type--"
                    value={employmentType}
                    options={EMPLOYMENT_TYPES}
                    isOpen={showEmploymentDropdown}
                    onToggle={() => {
                        setShowEmploymentDropdown(!showEmploymentDropdown);
                        setShowLoanDropdown(false);
                    }}
                    onSelect={selectEmploymentType}
                    error={errors.employmentType}
                />

                {/* Notes */}
                <AppInput
                    label="NOTES (OPTIONAL)"
                    placeholder="Any additional information about this lead...."
                    value={notes}
                    onChangeText={(t) => {
                        const words = t.trim().split(/\s+/).filter(word => word.length > 0);
                        if (words.length <= 200) {
                            setNotes(t);
                            setErrors(prev => ({ ...prev, notes: null }));
                        } else {
                            setErrors(prev => ({ ...prev, notes: 'Notes exceed 200 words' }));
                        }
                    }}
                    error={errors.notes}
                    multiline
                    inputStyle={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
                />
                <AppText variant="caption" color="secondary" style={{ textAlign: 'right', marginTop: -8, marginBottom: spacing.md }}>
                    * Max 200 Words
                </AppText>

                {/* ── Action Buttons ─────────── */}
                <AppButton
                    title="Submit Contact"
                    variant="gradient"
                    size="full"
                    loading={submitting}
                    onPress={onSubmit}
                    style={{ marginBottom: spacing.md }}
                />

                <AppButton
                    title="Save as Draft"
                    variant="outline"
                    size="full"
                    onPress={onDraft}
                    disabled={submitting}
                    leftIcon={<Feather name="save" size={18} color={colors.primary} />}
                    style={{ marginBottom: spacing.xxxl }}
                />

            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        paddingTop: 15,
    },
    sectionTitle: {
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 14,
        fontSize: 13,
    },
    nameRow: {
        flexDirection: 'row',
    },
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        minHeight: 52,
        paddingVertical: 12,
    },
    dropdownList: {
        borderWidth: 1,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownHeaderItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default NewLeadScreen;
