import { useState } from 'react';
import { LOAN_TYPES, EMPLOYMENT_TYPES } from '../api/mockData';
import { createLeadApi } from '../api/leadApi';

export const useNewLead = () => {
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        loanType: '',
        loanAmount: '',
        annualIncome: '',
        employmentType: '',
        notes: '',
    });

    // UI States
    const [dropdowns, setDropdowns] = useState({
        loan: false,
        employment: false,
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
        setDropdowns(prev => ({
            loan: field === 'loan' ? !prev.loan : false,
            employment: field === 'employment' ? !prev.employment : false,
        }));
    };

    const validate = () => {
        const newErrors = {};
        const { firstName, lastName, email, mobile, loanType, loanAmount, annualIncome, employmentType, notes } = formData;

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

        if (!annualIncome.trim()) {
            newErrors.annualIncome = 'Annual income is required';
        }

        if (!employmentType) newErrors.employmentType = 'Please select employment type';

        if (notes.trim()) {
            const wordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
            if (wordCount > 200) {
                newErrors.notes = `Notes exceed 200 words (Currently: ${wordCount})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            loanType: '',
            loanAmount: '',
            annualIncome: '',
            employmentType: '',
            notes: '',
        });
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
        loanamount: formData.loanAmount.replace(/[^0-9]/g, ''),
        annualincome: formData.annualIncome.replace(/[^0-9]/g, ''),
        employmenttype: formData.employmentType,
        notes: formData.notes.trim(),
        status
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

    const handleSaveDraft = async () => {
        setSubmitting(true);
        try {
            const payload = getMappedData(0); // 0 = Draft
            await createLeadApi(payload);
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
        resetForm,
        LOAN_TYPES,
        EMPLOYMENT_TYPES,
    };
};
