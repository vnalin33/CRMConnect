import { useState } from 'react';
import { createLeadApi } from '../api/leadApi';
import { saveDraftApi } from '../api/draftApi';

// Static dropdown options
const LOAN_TYPES = [
    'Home Loan',
    'Personal Loan',
    'Business Loan',
    'Loan Against Property',
];

const OCCUPATION_TYPES = [
    'Salaried',
    'Self Employed',
];

const COMPANY_CATEGORIES = [
    'Pvt Ltd',
    'Public Ltd',
    'Proprietorship',
    'Partnership',
    'Govt/PSU',
    'LLP',
    'MNC',
];

const SALARY_BANKS = [
    'SBI',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Bank of Baroda',
    'Punjab National Bank',
    'Canara Bank',
    'Union Bank',
    'Indian Bank',
    'Other',
];

const SALARY_MODES = [
    'Bank Transfer',
    'Cheque',
    'Cash',
];

export const useNewLead = (initialData = null) => {
    // Form State
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        mobile: initialData?.mobile || '',
        location: initialData?.location || '',
        loanType: initialData?.loanType || '',
        loanAmount: initialData?.loanAmount || '',
        cibilScore: initialData?.cibilScore || '',
        profession: initialData?.profession || '',
        serviceType: initialData?.serviceType || '',
        processingType: initialData?.processingType || '',
        notes: initialData?.notes || '',
        // Occupation Details (common)
        occupationType: initialData?.occupationType || '',
        monthlyIncome: initialData?.monthlyIncome || '',
        otherIncome: initialData?.otherIncome || '',
        otherIncomeName: initialData?.otherIncomeName || '',
        // Salaried fields
        companyName: initialData?.companyName || '',
        companyCategory: initialData?.companyCategory || '',
        designation: initialData?.designation || '',
        totalExperience: initialData?.totalExperience || '',
        currentExperience: initialData?.currentExperience || '',
        salaryBank: initialData?.salaryBank || '',
        salaryBankOther: initialData?.salaryBankOther || '',
        salaryMode: initialData?.salaryMode || '',
        // Self Employed fields
        businessName: initialData?.businessName || '',
        businessType: initialData?.businessType || '',
        annualTurnover: initialData?.annualTurnover || '',
        businessVintage: initialData?.businessVintage || '',
        businessContact: initialData?.businessContact || '',
        hasGstin: initialData?.hasGstin || 'No',
        gstinNumber: initialData?.gstinNumber || '',
    });

    // UI States
    const [dropdowns, setDropdowns] = useState({
        loan: false,
        occupation: false,
        service: false,
        processing: false,
        companyCategory: false,
        salaryBank: false,
        salaryMode: false,
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const toggleDropdown = (field) => {
        setDropdowns(prev => {
            const newState = {};
            Object.keys(prev).forEach(k => {
                newState[k] = k === field ? !prev[k] : false;
            });
            return newState;
        });
    };

    const validate = () => {
        const newErrors = {};
        const { firstName, lastName, email, mobile, loanType, loanAmount, cibilScore, profession, serviceType, processingType, notes, occupationType, monthlyIncome } = formData;

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[A-Za-z\s]+$/.test(firstName.trim())) {
            newErrors.firstName = 'Only letters and spaces allowed';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'Minimum 2 characters';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!/^[A-Za-z\s]+$/.test(lastName.trim())) {
            newErrors.lastName = 'Only letters and spaces allowed';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = 'Enter a valid email id';
        }

        if (!mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(mobile)) {
            newErrors.mobile = 'Enter a valid 10-digit mobile number';
        }

        if (!loanType) newErrors.loanType = 'Please select a loan type';

        if (!loanAmount.trim()) {
            newErrors.loanAmount = 'Loan amount is required';
        }

        if (!cibilScore.trim()) {
            newErrors.cibilScore = 'CIBIL score is required';
        } else if (parseInt(cibilScore, 10) < 300 || parseInt(cibilScore, 10) > 900) {
            newErrors.cibilScore = 'CIBIL score must be between 300 and 900';
        }


        // Occupation Details validation
        if (!occupationType) newErrors.occupationType = 'Please select occupation type';
        if (!monthlyIncome.trim()) newErrors.monthlyIncome = 'Monthly income is required';

        // Salaried-specific validation
        if (occupationType === 'Salaried') {
            if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
            if (!formData.companyCategory) newErrors.companyCategory = 'Company category is required';
            if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
            if (!formData.totalExperience.trim()) newErrors.totalExperience = 'Total experience is required';
            if (!formData.currentExperience.trim()) newErrors.currentExperience = 'Current experience is required';
            if (!formData.salaryBank) newErrors.salaryBank = 'Salary bank is required';
            if (formData.salaryBank === 'Other' && !formData.salaryBankOther?.trim()) newErrors.salaryBankOther = 'Please specify bank name';
            if (!formData.salaryMode) newErrors.salaryMode = 'Salary mode is required';
        }

        // Self Employed-specific validation
        if (occupationType === 'Self Employed') {
            if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
            if (!formData.businessType.trim()) newErrors.businessType = 'Business type is required';
            if (!formData.annualTurnover.trim()) newErrors.annualTurnover = 'Annual turnover is required';
            if (!formData.businessVintage.trim()) newErrors.businessVintage = 'Business vintage is required';
            if (!formData.businessContact.trim()) newErrors.businessContact = 'Business contact is required';
            if (formData.hasGstin === 'Yes' && !formData.gstinNumber.trim()) newErrors.gstinNumber = 'GSTIN number is required';
        }

        if (!serviceType) newErrors.serviceType = 'Please select a service type';
        if (!processingType) newErrors.processingType = 'Please select a processing type';

        if (notes.trim()) {
            const wordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
            if (wordCount > 200) {
                newErrors.notes = `Notes exceed 200 words (Currently: ${wordCount})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const emptyForm = {
        firstName: '', lastName: '', email: '', mobile: '', location: '',
        loanType: '', loanAmount: '', cibilScore: '', profession: '',
        serviceType: '', processingType: '', notes: '',
        occupationType: '', monthlyIncome: '', otherIncome: '', otherIncomeName: '',
        companyName: '', companyCategory: '', designation: '',
        totalExperience: '', currentExperience: '', salaryBank: '', salaryBankOther: '', salaryMode: '',
        businessName: '', businessType: '', annualTurnover: '', businessVintage: '',
        businessContact: '', hasGstin: 'No', gstinNumber: '',
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setErrors({});
    };

    const loadPrefill = (data) => {
        if (!data) return;
        const filled = {};
        Object.keys(emptyForm).forEach(k => { filled[k] = data[k] || ''; });
        setFormData(filled);
        setErrors({});
    };

    /**
     * Map frontend camelCase form data to backend lowercase model fields
     */
    const getMappedData = (status) => ({
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
        mobilenumber: formData.mobile.trim(),
        loantype: formData.loanType,
        location: formData.location.trim(),
        loanamount: formData.loanAmount.replace(/[^0-9]/g, ''),
        cibilscore: formData.cibilScore ? parseInt(formData.cibilScore, 10) : null,
        profession: formData.profession.trim(),
        existingloans: 0,
        servicetype: formData.serviceType,
        processingtype: formData.processingType,
        notes: formData.notes.trim(),
        status,
        // Occupation details → maps to leadoccupationdetails table
        occupation: {
            occupationtype: formData.occupationType,
            incomeamount: formData.monthlyIncome ? parseInt(formData.monthlyIncome.replace(/[^0-9]/g, ''), 10) : 0,
            otherincomeamount: formData.otherIncome ? parseInt(formData.otherIncome.replace(/[^0-9]/g, ''), 10) : 0,
            // Salaried
            compname: formData.companyName.trim() || null,
            compcat: formData.companyCategory || null,
            designation: formData.designation.trim() || null,
            totalexperience: formData.totalExperience.trim() || null,
            currentexperience: formData.currentExperience.trim() || null,
            salarybank: formData.salaryBank === 'Other' ? formData.salaryBankOther?.trim() : formData.salaryBank || null,
            salarymode: formData.salaryMode || null,
            // Self Employed
            businessname: formData.businessName.trim() || null,
            businesstype: formData.businessType.trim() || null,
            annualturnover: formData.annualTurnover.trim() || null,
            businessvintage: formData.businessVintage.trim() || null,
            companyaddress: null,
            officetelephonenumber: formData.businessContact.trim() || null,
            companygstinnumber: formData.hasGstin === 'Yes' ? formData.gstinNumber.trim() : null,
        },
    });

    const handleSubmit = async () => {
        if (!validate()) return { success: false };

        setSubmitting(true);
        try {
            const payload = getMappedData(1); // 1 = Active/New Lead
            await createLeadApi(payload);
            resetForm();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to submit lead' };
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async (draftId = null) => {
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (draftId) {
                payload.draftId = draftId;
            }
            await saveDraftApi(payload);
            resetForm();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to save draft' };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formData,
        updateField,
        dropdowns,
        toggleDropdown,
        errors,
        submitting,
        handleSubmit,
        handleSaveDraft,
        loadPrefill,
        resetForm,
        LOAN_TYPES,
        OCCUPATION_TYPES,
        COMPANY_CATEGORIES,
        SALARY_BANKS,
        SALARY_MODES,
        SERVICE_TYPES: [
            'End to End',
            'Converted Leads Only'
        ],
        PROCESSING_TYPES: [
            'Instant',
            'Cycle'
        ],
    };
};
