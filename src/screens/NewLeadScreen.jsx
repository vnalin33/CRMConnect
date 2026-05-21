import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import GradientText from '../components/common/GradientText';
import DropdownSelect from '../components/common/DropdownSelect';
import { useNewLead } from '../hooks/useNewLead';
import { useProfile } from '../hooks/useProfile';
import { useDrafts } from '../hooks/useDrafts';
import { useAlert } from '../context/AlertContext';
import CountryCodePicker, { COUNTRIES } from '../components/common/CountryCodePicker';


const NewLeadScreen = ({ route, navigation }) => {
    const { colors, spacing } = useTheme();
    const { showAlert } = useAlert();
    const { deleteDraft } = useDrafts();
    const draftId = route.params?.draftId || null;
    const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]);
    const prefill = route.params?.prefill?.draft_data || null;
    const lastLoadedDraftRef = useRef(null);

    const {
        formData,
        updateField,
        dropdowns,
        toggleDropdown,
        errors,
        submitting,
        handleSubmit,
        handleSaveDraft,
        loadPrefill,
        LOAN_TYPES,
        OCCUPATION_TYPES,
        COMPANY_CATEGORIES,
        SALARY_BANKS,
        SALARY_MODES,
        SERVICE_TYPES,
        PROCESSING_TYPES,
    } = useNewLead(prefill);

    const { profileData, isLoading: profileLoading } = useProfile();

    // Build dynamic list of missing profile sections
    const getMissingProfileSections = () => {
        if (!profileData) return [];
        const missing = [];

        const hasAddress = profileData.personalInfo?.address && profileData.personalInfo.address.trim() !== '';
        if (!hasAddress) missing.push({ icon: 'map-pin', label: 'Address', section: 'Personal Info' });

        const hasBank = profileData.bankDetails?.account && profileData.bankDetails.account !== 'Not Provided';
        const hasIfsc = profileData.bankDetails?.ifsc && profileData.bankDetails.ifsc !== 'Not Provided';
        if (!hasBank || !hasIfsc) missing.push({ icon: 'credit-card', label: 'Bank Details', section: 'Bank Details' });

        const hasPan = profileData.taxDetails?.pan && profileData.taxDetails.pan !== 'Not Provided';
        if (!hasPan) missing.push({ icon: 'file-text', label: 'PAN Number', section: 'Tax Details' });

        return missing;
    };

    const missingSections = !profileLoading && profileData ? getMissingProfileSections() : [];
    const isProfileIncomplete = missingSections.length > 0;

    React.useEffect(() => {
        if (prefill && draftId && lastLoadedDraftRef.current !== draftId) {
            lastLoadedDraftRef.current = draftId;
            loadPrefill(prefill);
        }
    }, [draftId, prefill, loadPrefill]);

    const onSubmit = async () => {
        const result = await handleSubmit();
        if (result?.success) {
            if (draftId) {
                try { await deleteDraft(draftId); } catch(e) {}
            }
            navigation.setParams({ draftId: undefined, prefill: undefined });
            showAlert({
                type: 'success',
                title: 'Success!',
                message: 'Lead submitted successfully!',
                onClose: () => navigation.navigate('Home')
            });
        } else if (result?.error) {
            showAlert({ type: 'error', title: 'Submission Failed', message: result.error });
        }
    };

    const onDraft = async () => {
        const result = await handleSaveDraft(draftId);
        if (result?.success) {
            showAlert({
                type: 'success',
                title: 'Saved',
                message: 'Lead saved as draft.',
                onClose: () => navigation.navigate('Home')
            });
        } else if (result?.error) {
            showAlert({ type: 'error', title: 'Draft Failed', message: result.error });
        }
    };

    if (profileLoading || isProfileIncomplete) {
        return (
            <ScreenWrapper withPadding={false} edges={['left', 'right']}>
                <GradientScreenHeader title="Add Contact" subtitle="New Lead Entry" showBack navigation={navigation} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    {profileLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <View style={{ alignItems: 'center', width: '100%', maxWidth: 320 }}>
                            <Feather name="lock" size={48} color={colors.warning} />
                            <AppText variant="bodyLg" style={{ marginTop: 16, textAlign: 'center', fontWeight: '700', fontSize: 17 }}>
                                Profile Completion Required
                            </AppText>
                            <AppText variant="bodySm" style={{ marginTop: 8, textAlign: 'center', color: colors.textSecondary, lineHeight: 20 }}>
                                Please update the following to start adding leads:
                            </AppText>

                            <View style={{ marginTop: 20, width: '100%' }}>
                                {missingSections.map((item, idx) => (
                                    <View key={idx} style={{
                                        flexDirection: 'row', alignItems: 'center',
                                        paddingVertical: 12, paddingHorizontal: 16,
                                        backgroundColor: colors.inputBg,
                                        borderRadius: 12, marginBottom: 8,
                                        borderLeftWidth: 3, borderLeftColor: colors.warning,
                                    }}>
                                        <Feather name={item.icon} size={18} color={colors.warning} />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <AppText variant="bodySm" style={{ fontWeight: '600' }}>{item.label}</AppText>
                                            <AppText variant="caption" style={{ color: colors.textSecondary }}>
                                                Update in {item.section}
                                            </AppText>
                                        </View>
                                        <Feather name="alert-circle" size={16} color={colors.warning} />
                                    </View>
                                ))}
                            </View>

                            <AppButton
                                title="Go to Profile"
                                variant="gradient"
                                size="full"
                                onPress={() => navigation.navigate('Profile')}
                                style={{ marginTop: 20 }}
                                leftIcon={<Feather name="user" size={18} color="#FFF" />}
                            />
                        </View>
                    )}
                </View>
            </ScreenWrapper>
        );
    }

    /* ── Yes/No Toggle Component with Gradient ── */
    const YesNoToggle = ({ label, value, onChange, error }) => (
        <View style={{ marginBottom: spacing.base }}>
            <AppText variant="label" color="secondary" style={{ marginBottom: spacing.xs }}>
                {label}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                {['Yes', 'No'].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => onChange(opt)}
                    >
                        {value === opt ? (
                            <LinearGradient
                                colors={BRAND_GRADIENT.colors}
                                start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end}
                                locations={BRAND_GRADIENT.locations}
                                style={[styles.toggleBtn, { borderColor: 'transparent' }]}
                            >
                                <AppText variant="bodySm" style={{ color: '#FFF', fontWeight: '700' }}>
                                    {opt}
                                </AppText>
                            </LinearGradient>
                        ) : (
                            <View style={[styles.toggleBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                                <AppText variant="bodySm" style={{ color: colors.textPrimary, fontWeight: '400' }}>
                                    {opt}
                                </AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            {error ? (
                <AppText variant="caption" color="error" style={{ marginTop: spacing.xs, marginLeft: spacing.xs }}>
                    ⚠ {error}
                </AppText>
            ) : null}
        </View>
    );

    return (
        <ScreenWrapper withPadding={false} edges={['left', 'right']}>
            <GradientScreenHeader title="Add Contact" subtitle="New Lead Entry" showBack navigation={navigation} />

            <ScrollView
                contentContainerStyle={[styles.formContainer, { paddingHorizontal: spacing.base }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── PROCESSING DETAILS ── */}
                <GradientText variant="h3" style={styles.sectionTitle}>
                    PROCESSING DETAILS
                </GradientText>

                <DropdownSelect
                    label="SERVICE TYPE"
                    required
                    placeholder="--Select Service Type--"
                    value={formData.serviceType}
                    options={SERVICE_TYPES}
                    isOpen={dropdowns.service}
                    onToggle={() => toggleDropdown('service')}
                    onSelect={(val) => { updateField('serviceType', val); toggleDropdown(null); }}
                    error={errors.serviceType}
                />

                <DropdownSelect
                    label="PAYOUT TYPE"
                    required
                    placeholder="--Select Payout Type--"
                    value={formData.processingType}
                    options={PROCESSING_TYPES}
                    isOpen={dropdowns.processing}
                    onToggle={() => toggleDropdown('processing')}
                    onSelect={(val) => { updateField('processingType', val); toggleDropdown(null); }}
                    error={errors.processingType}
                />

                {/* ── PERSONAL INFO ── */}
                <GradientText variant="h3" style={styles.sectionTitle}>
                    PERSONAL INFO
                </GradientText>

                <View style={styles.nameRow}>
                    <View style={styles.flexItemWithMargin}>
                        <AppInput
                            label="FIRST NAME" required placeholder="First Name"
                            value={formData.firstName}
                            onChangeText={(t) => updateField('firstName', t.replace(/[^a-zA-Z\s]/g, ''))}
                            error={errors.firstName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                    <View style={styles.flexItem}>
                        <AppInput
                            label="LAST NAME" required placeholder="Last Name"
                            value={formData.lastName}
                            onChangeText={(t) => updateField('lastName', t.replace(/[^a-zA-Z\s]/g, ''))}
                            error={errors.lastName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                </View>

                <AppInput
                    label="EMAIL ID" required placeholder="email@example.com"
                    value={formData.email} keyboardType="email-address"
                    onChangeText={(t) => updateField('email', t)}
                    error={errors.email}
                    leftIcon={<Feather name="mail" size={16} color={colors.textPlaceholder} />}
                />

                <AppInput
                    label="MOBILE NUMBER" required placeholder="00000 00000"
                    value={formData.mobile} keyboardType="phone-pad" maxLength={10}
                    onChangeText={(t) => updateField('mobile', t.replace(/[^0-9]/g, ''))}
                    error={errors.mobile}
                    leftIcon={<CountryCodePicker selected={selectedCountry} onSelect={setSelectedCountry} />}
                />

                <AppInput
                    label="LOCATION" placeholder="Enter city or area"
                    value={formData.location}
                    onChangeText={(t) => updateField('location', t)}
                    error={errors.location}
                    leftIcon={<Feather name="map-pin" size={16} color={colors.textPlaceholder} />}
                />

                {/* ── OCCUPATION DETAILS (placed right after Personal Info) ── */}
                <GradientText variant="h3" style={styles.sectionTitle}>
                    OCCUPATION DETAILS
                </GradientText>

                <DropdownSelect
                    label="OCCUPATION TYPE"
                    required
                    placeholder="--Select Occupation Type--"
                    value={formData.occupationType}
                    options={OCCUPATION_TYPES}
                    isOpen={dropdowns.occupation}
                    onToggle={() => toggleDropdown('occupation')}
                    onSelect={(val) => {
                        updateField('occupationType', val);
                        if (val === 'Salaried') {
                            updateField('businessName', ''); updateField('businessType', '');
                            updateField('annualTurnover', ''); updateField('businessVintage', '');
                            updateField('businessContact', ''); updateField('hasGstin', 'No');
                            updateField('gstinNumber', '');
                        } else {
                            updateField('companyName', ''); updateField('companyCategory', '');
                            updateField('designation', ''); updateField('totalExperience', '');
                            updateField('currentExperience', ''); updateField('salaryBank', '');
                            updateField('salaryMode', '');
                        }
                        toggleDropdown(null);
                    }}
                    error={errors.occupationType}
                />

                <View style={styles.nameRow}>
                    <View style={styles.flexItemWithMargin}>
                        <AppInput
                            label="MONTHLY INCOME (₹)" required placeholder="Enter monthly income"
                            value={formData.monthlyIncome} keyboardType="numeric"
                            onChangeText={(t) => updateField('monthlyIncome', t.replace(/[^0-9]/g, ''))}
                            error={errors.monthlyIncome}
                            leftIcon={<Feather name="dollar-sign" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                    <View style={styles.flexItem}>
                        <AppInput
                            label="OTHER INCOME (₹)" placeholder="Enter other income"
                            value={formData.otherIncome} keyboardType="numeric"
                            onChangeText={(t) => updateField('otherIncome', t.replace(/[^0-9]/g, ''))}
                            error={errors.otherIncome}
                            leftIcon={<Feather name="plus-circle" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                </View>

                {/* Other Income Name — always visible */}
                <AppInput
                    label="OTHER INCOME SOURCE NAME"
                    placeholder="e.g. Rental, Freelancing, Investments"
                    value={formData.otherIncomeName}
                    onChangeText={(t) => updateField('otherIncomeName', t)}
                    error={errors.otherIncomeName}
                    leftIcon={<Feather name="tag" size={16} color={colors.textPlaceholder} />}
                />

                {/* ── SALARIED INFORMATION ── */}
                {formData.occupationType === 'Salaried' && (
                    <>
                        <GradientText variant="h3" style={styles.sectionTitle}>
                            SALARIED INFORMATION
                        </GradientText>

                        <View style={styles.nameRow}>
                            <View style={styles.flexItemWithMargin}>
                                <AppInput
                                    label="COMPANY NAME" required placeholder="Enter company name"
                                    value={formData.companyName}
                                    onChangeText={(t) => updateField('companyName', t)}
                                    error={errors.companyName}
                                    leftIcon={<Feather name="home" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                            <View style={styles.flexItem}>
                                <DropdownSelect
                                    label="COMPANY CATEGORY" required
                                    placeholder="--Select Category--"
                                    value={formData.companyCategory}
                                    options={COMPANY_CATEGORIES}
                                    isOpen={dropdowns.companyCategory}
                                    onToggle={() => toggleDropdown('companyCategory')}
                                    onSelect={(val) => { updateField('companyCategory', val); toggleDropdown(null); }}
                                    error={errors.companyCategory}
                                />
                            </View>
                        </View>

                        <View style={styles.nameRow}>
                            <View style={styles.flexItemWithMargin}>
                                <AppInput
                                    label="DESIGNATION" required placeholder="Enter designation"
                                    value={formData.designation}
                                    onChangeText={(t) => updateField('designation', t)}
                                    error={errors.designation}
                                    leftIcon={<Feather name="award" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                            <View style={styles.flexItem}>
                                <AppInput
                                    label="TOTAL WORK EXPERIENCE" required placeholder="e.g. 5 Years"
                                    value={formData.totalExperience}
                                    onChangeText={(t) => updateField('totalExperience', t)}
                                    error={errors.totalExperience}
                                    leftIcon={<Feather name="clock" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                        </View>

                        <AppInput
                            label="CURRENT COMPANY EXPERIENCE" required placeholder="e.g. 2 Years"
                            value={formData.currentExperience}
                            onChangeText={(t) => updateField('currentExperience', t)}
                            error={errors.currentExperience}
                            leftIcon={<Feather name="clock" size={16} color={colors.textPlaceholder} />}
                        />

                        <View style={styles.nameRow}>
                            <View style={styles.flexItemWithMargin}>
                                <DropdownSelect
                                    label="SALARY CREDIT BANK" required
                                    placeholder="--Select Bank--"
                                    value={formData.salaryBank}
                                    options={SALARY_BANKS}
                                    isOpen={dropdowns.salaryBank}
                                    onToggle={() => toggleDropdown('salaryBank')}
                                    onSelect={(val) => { updateField('salaryBank', val); if (val !== 'Other') updateField('salaryBankOther', ''); toggleDropdown(null); }}
                                    error={errors.salaryBank}
                                />
                            </View>
                            <View style={styles.flexItem}>
                                <DropdownSelect
                                    label="SALARY MODE" required
                                    placeholder="--Select Mode--"
                                    value={formData.salaryMode}
                                    options={SALARY_MODES}
                                    isOpen={dropdowns.salaryMode}
                                    onToggle={() => toggleDropdown('salaryMode')}
                                    onSelect={(val) => { updateField('salaryMode', val); toggleDropdown(null); }}
                                    error={errors.salaryMode}
                                />
                            </View>
                        </View>

                        {formData.salaryBank === 'Other' && (
                            <AppInput
                                label="SPECIFY BANK NAME" required
                                placeholder="Enter bank name"
                                value={formData.salaryBankOther || ''}
                                onChangeText={(t) => updateField('salaryBankOther', t)}
                                error={errors.salaryBankOther}
                                leftIcon={<Feather name="edit-3" size={16} color={colors.textPlaceholder} />}
                            />
                        )}
                    </>
                )}

                {/* ── BUSINESS INFORMATION (Self Employed) ── */}
                {formData.occupationType === 'Self Employed' && (
                    <>
                        <GradientText variant="h3" style={styles.sectionTitle}>
                            BUSINESS INFORMATION
                        </GradientText>

                        <View style={styles.nameRow}>
                            <View style={styles.flexItemWithMargin}>
                                <AppInput
                                    label="BUSINESS NAME" required placeholder="Enter business name"
                                    value={formData.businessName}
                                    onChangeText={(t) => updateField('businessName', t)}
                                    error={errors.businessName}
                                    leftIcon={<Feather name="briefcase" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                            <View style={styles.flexItem}>
                                <AppInput
                                    label="BUSINESS TYPE" required placeholder="e.g. Manufacturing"
                                    value={formData.businessType}
                                    onChangeText={(t) => updateField('businessType', t)}
                                    error={errors.businessType}
                                    leftIcon={<Feather name="layers" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                        </View>

                        <View style={styles.nameRow}>
                            <View style={styles.flexItemWithMargin}>
                                <AppInput
                                    label="ANNUAL TURNOVER (₹)" required placeholder="Enter turnover"
                                    value={formData.annualTurnover} keyboardType="numeric"
                                    onChangeText={(t) => updateField('annualTurnover', t.replace(/[^0-9]/g, ''))}
                                    error={errors.annualTurnover}
                                    leftIcon={<Feather name="trending-up" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                            <View style={styles.flexItem}>
                                <AppInput
                                    label="BUSINESS VINTAGE" required placeholder="e.g. 3 Years"
                                    value={formData.businessVintage}
                                    onChangeText={(t) => updateField('businessVintage', t)}
                                    error={errors.businessVintage}
                                    leftIcon={<Feather name="calendar" size={16} color={colors.textPlaceholder} />}
                                />
                            </View>
                        </View>

                        <AppInput
                            label="BUSINESS CONTACT NUMBER" required placeholder="Enter contact number"
                            value={formData.businessContact} keyboardType="phone-pad" maxLength={10}
                            onChangeText={(t) => updateField('businessContact', t.replace(/[^0-9]/g, ''))}
                            error={errors.businessContact}
                            leftIcon={<Feather name="phone" size={16} color={colors.textPlaceholder} />}
                        />

                        {/* GSTIN Yes/No Toggle */}
                        <YesNoToggle
                            label="BUSINESS GSTIN REGISTERED? *"
                            value={formData.hasGstin}
                            onChange={(val) => {
                                updateField('hasGstin', val);
                                if (val === 'No') updateField('gstinNumber', '');
                            }}
                        />

                        {formData.hasGstin === 'Yes' && (
                            <AppInput
                                label="GSTIN NUMBER" required placeholder="Enter GSTIN number"
                                value={formData.gstinNumber}
                                autoCapitalize="characters" maxLength={15}
                                onChangeText={(t) => updateField('gstinNumber', t.toUpperCase())}
                                error={errors.gstinNumber}
                                leftIcon={<Feather name="file-text" size={16} color={colors.textPlaceholder} />}
                            />
                        )}
                    </>
                )}

                {/* ── LOAN DETAILS ── */}
                <GradientText variant="h3" style={styles.sectionTitle}>
                    LOAN DETAILS
                </GradientText>

                <DropdownSelect
                    label="LOAN TYPE" required
                    placeholder="--Select Loan Type--"
                    value={formData.loanType}
                    options={LOAN_TYPES}
                    isOpen={dropdowns.loan}
                    onToggle={() => toggleDropdown('loan')}
                    onSelect={(val) => { updateField('loanType', val); toggleDropdown(null); }}
                    error={errors.loanType}
                />

                <AppInput
                    label="REQUIRED LOAN AMOUNT" required placeholder="Enter Loan Amount"
                    value={formData.loanAmount} keyboardType="numeric"
                    onChangeText={(t) => updateField('loanAmount', t.replace(/[^0-9,]/g, ''))}
                    error={errors.loanAmount}
                    leftIcon={<Feather name="dollar-sign" size={16} color={colors.textPlaceholder} />}
                />

                <AppInput
                    label="CIBIL SCORE" required placeholder="Enter CIBIL Score (300-900)"
                    value={formData.cibilScore} keyboardType="numeric" maxLength={3}
                    onChangeText={(t) => updateField('cibilScore', t.replace(/[^0-9]/g, ''))}
                    error={errors.cibilScore}
                    leftIcon={<Feather name="bar-chart-2" size={16} color={colors.textPlaceholder} />}
                />

                {/* ── NOTES ── */}
                <AppInput
                    label="NOTES (OPTIONAL)"
                    placeholder="Any additional information about this lead...."
                    value={formData.notes}
                    onChangeText={(t) => updateField('notes', t)}
                    error={errors.notes}
                    multiline
                    inputStyle={styles.notesInput}
                />
                <AppText variant="caption" color="secondary" style={styles.notesHelpText}>
                    * Max 200 Words
                </AppText>

                <AppButton
                    title="Submit Contact" variant="gradient" size="full"
                    loading={submitting} onPress={onSubmit} style={styles.submitBtn}
                />

                <AppButton
                    title="Save as Draft" variant="outline" size="full"
                    onPress={onDraft} disabled={submitting}
                    leftIcon={<Feather name="save" size={18} color={colors.primary} />}
                    style={styles.draftBtn}
                />

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        paddingTop: scale(20),
    },
    sectionTitle: {
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: scale(16),
        marginTop: scale(8),
    },
    nameRow: {
        flexDirection: 'row',
    },
    flexItem: { flex: 1 },
    flexItemWithMargin: { flex: 1, marginRight: scale(8) },
    notesInput: { minHeight: scale(80), textAlignVertical: 'top', paddingTop: scale(12) },
    notesHelpText: { textAlign: 'right', marginTop: scale(-8), marginBottom: scale(16) },
    submitBtn: { marginBottom: scale(16) },
    draftBtn: { marginBottom: scale(40) },
    toggleBtn: {
        paddingVertical: scale(12),
        paddingHorizontal: scale(24),
        borderRadius: scale(25),
        borderWidth: 1.5,
        minWidth: scale(80),
        alignItems: 'center',
    },
});

export default NewLeadScreen;
