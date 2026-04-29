import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import GradientText from '../components/common/GradientText';
import DropdownSelect from '../components/common/DropdownSelect';
import { useNewLead } from '../hooks/useNewLead';
import { useDrafts } from '../hooks/useDrafts';
import { useAlert } from '../context/AlertContext';
import CountryCodePicker, { COUNTRIES } from '../components/common/CountryCodePicker';


const NewLeadScreen = ({ route, navigation }) => {
    const { colors, spacing } = useTheme();
    const { showAlert } = useAlert();
    const { deleteDraft } = useDrafts();
    const draftId = route.params?.draftId || null;
    const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]); // India default
    const prefill = route.params?.prefill?.draft_data || null;
    // Track which draft has been loaded to prevent re-loading the same one
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
        EMPLOYMENT_TYPES,
        SERVICE_TYPES,
        PROCESSING_TYPES,
    } = useNewLead(prefill);

    // Sync form with route params (for resume/edit)
    // We use draftId as the trigger since object references are unreliable
    React.useEffect(() => {
        if (prefill && draftId && lastLoadedDraftRef.current !== draftId) {
            lastLoadedDraftRef.current = draftId;
            loadPrefill(prefill);
        }
    }, [draftId, prefill, loadPrefill]);

    const onSubmit = async () => {
        const result = await handleSubmit();
        if (result?.success) {
            // If it was a draft, delete it from backend AND local cache
            if (draftId) {
                try {
                    await deleteDraft(draftId);
                } catch(e) {}
            }
            // Clear params so this draft doesn't reload later
            navigation.setParams({ draftId: undefined, prefill: undefined });
            
            showAlert({
                type: 'success',
                title: 'Success!',
                message: 'Lead submitted successfully!',
                onClose: () => navigation.navigate('Home')
            });
        } else if (result?.error) {
            showAlert({
                type: 'error',
                title: 'Submission Failed',
                message: result.error
            });
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
            showAlert({
                type: 'error',
                title: 'Draft Failed',
                message: result.error
            });
        }
    };

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']}>
            <GradientScreenHeader
                title="Add Contact"
                subtitle="New Lead Entry"
                showBack
                navigation={navigation}
            />

            <ScrollView 
                contentContainerStyle={[styles.formContainer, { paddingHorizontal: spacing.base }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <GradientText variant="h3" style={styles.sectionTitle}>
                    PERSONAL INFO
                </GradientText>

                <View style={styles.nameRow}>
                    <View style={styles.flexItemWithMargin}>
                        <AppInput
                            label="FIRST NAME"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChangeText={(t) => updateField('firstName', t.replace(/[^a-zA-Z\s]/g, ''))}
                            error={errors.firstName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                    <View style={styles.flexItem}>
                        <AppInput
                            label="LAST NAME"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChangeText={(t) => updateField('lastName', t.replace(/[^a-zA-Z\s]/g, ''))}
                            error={errors.lastName}
                            leftIcon={<Feather name="user" size={16} color={colors.textPlaceholder} />}
                        />
                    </View>
                </View>

                <AppInput
                    label="EMAIL ID"
                    placeholder="email@example.com"
                    value={formData.email}
                    keyboardType="email-address"
                    onChangeText={(t) => updateField('email', t)}
                    error={errors.email}
                    leftIcon={<Feather name="mail" size={16} color={colors.textPlaceholder} />}
                />

                <AppInput
                    label="MOBILE NUMBER"
                    placeholder="00000 00000"
                    value={formData.mobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onChangeText={(t) => updateField('mobile', t.replace(/[^0-9]/g, ''))}
                    error={errors.mobile}
                    leftIcon={
                        <CountryCodePicker
                            selected={selectedCountry}
                            onSelect={setSelectedCountry}
                        />
                    }
                />

                <GradientText variant="h3" style={styles.sectionTitle}>
                    LOAN DETAILS
                </GradientText>

                <DropdownSelect
                    label="LOAN TYPE"
                    placeholder="--Select Loan Type--"
                    value={formData.loanType}
                    options={LOAN_TYPES}
                    isOpen={dropdowns.loan}
                    onToggle={() => toggleDropdown('loan')}
                    onSelect={(val) => {
                        updateField('loanType', val);
                        toggleDropdown(null);
                    }}
                    error={errors.loanType}
                />

                <AppInput
                    label="REQUIRED LOAN AMOUNT"
                    placeholder="Enter Loan Amount"
                    value={formData.loanAmount}
                    keyboardType="numeric"
                    onChangeText={(t) => updateField('loanAmount', t.replace(/[^0-9,]/g, ''))}
                    error={errors.loanAmount}
                    leftIcon={<Feather name="dollar-sign" size={16} color={colors.textPlaceholder} />}
                />

                <AppInput
                    label="ANNUAL INCOME"
                    placeholder="e.g. ₹6,00,000 per year"
                    value={formData.annualIncome}
                    keyboardType="numeric"
                    onChangeText={(t) => updateField('annualIncome', t.replace(/[^0-9,]/g, ''))}
                    error={errors.annualIncome}
                    leftIcon={<Feather name="trending-up" size={16} color={colors.textPlaceholder} />}
                />

                <DropdownSelect
                    label="EMPLOYMENT TYPE"
                    placeholder="--Select Employment Type--"
                    value={formData.employmentType}
                    options={EMPLOYMENT_TYPES}
                    isOpen={dropdowns.employment}
                    onToggle={() => toggleDropdown('employment')}
                    onSelect={(val) => {
                        updateField('employmentType', val);
                        toggleDropdown(null);
                    }}
                    error={errors.employmentType}
                />

                <DropdownSelect
                    label="SERVICE TYPE"
                    placeholder="--Select Service Type--"
                    value={formData.serviceType}
                    options={SERVICE_TYPES}
                    isOpen={dropdowns.service}
                    onToggle={() => toggleDropdown('service')}
                    onSelect={(val) => {
                        updateField('serviceType', val);
                        toggleDropdown(null);
                    }}
                    error={errors.serviceType}
                />

                <DropdownSelect
                    label="PROCESSING TYPE"
                    placeholder="--Select Processing Type--"
                    value={formData.processingType}
                    options={PROCESSING_TYPES}
                    isOpen={dropdowns.processing}
                    onToggle={() => toggleDropdown('processing')}
                    onSelect={(val) => {
                        updateField('processingType', val);
                        toggleDropdown(null);
                    }}
                    error={errors.processingType}
                />

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
                    title="Submit Contact"
                    variant="gradient"
                    size="full"
                    loading={submitting}
                    onPress={onSubmit}
                    style={styles.submitBtn}
                />

                <AppButton
                    title="Save as Draft"
                    variant="outline"
                    size="full"
                    onPress={onDraft}
                    disabled={submitting}
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
});

export default NewLeadScreen;
