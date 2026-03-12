import { useState } from 'react';

const LOAN_TYPES = [
    'Home Loan',
    'Personal Loan',
    'Loan Against Property',
    'Business Loan',
];

const EMPLOYMENT_TYPES = [
    'Salaried',
    'Self Employed',
    'Business Owner',
];

export const useNewLead = () => {
    // Form Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [loanType, setLoanType] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [annualIncome, setAnnualIncome] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [notes, setNotes] = useState('');

    // Dropdown Visibility
    const [showLoanDropdown, setShowLoanDropdown] = useState(false);
    const [showEmploymentDropdown, setShowEmploymentDropdown] = useState(false);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Submission State
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[A-Za-z]+$/.test(firstName.trim())) {
            newErrors.firstName = 'Only letters allowed';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'Minimum 2 characters';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!/^[A-Za-z]+$/.test(lastName.trim())) {
            newErrors.lastName = 'Only letters allowed';
        } else if (lastName.trim().length < 2) {
            newErrors.lastName = 'Minimum 2 characters';
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
        } else if (isNaN(Number(loanAmount.replace(/,/g, '')))) {
            newErrors.loanAmount = 'Enter a valid amount';
        }

        if (!annualIncome.trim()) {
            newErrors.annualIncome = 'Annual income is required';
        } else if (isNaN(Number(annualIncome.replace(/,/g, '')))) {
            newErrors.annualIncome = 'Enter a valid amount';
        }

        if (!employmentType) newErrors.employmentType = 'Please select employment type';

        // 200 Word Limit Validation on Submit
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
        setFirstName('');
        setLastName('');
        setEmail('');
        setMobile('');
        setLoanType('');
        setLoanAmount('');
        setAnnualIncome('');
        setEmploymentType('');
        setNotes('');
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                loanType,
                loanAmount: loanAmount.replace(/,/g, ''),
                annualIncome: annualIncome.replace(/,/g, ''),
                employmentType,
                notes: notes.trim(),
            };
            console.log('Lead submitted:', payload);
            resetForm();
            return { success: true };
        } catch (error) {
            console.error('Submit error:', error);
            return { success: false, error };
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        setSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                loanType,
                loanAmount: loanAmount.replace(/,/g, ''),
                annualIncome: annualIncome.replace(/,/g, ''),
                employmentType,
                notes: notes.trim(),
                isDraft: true,
            };
            console.log('Draft saved:', payload);
            return { success: true };
        } catch (error) {
            console.error('Draft error:', error);
            return { success: false, error };
        } finally {
            setSubmitting(false);
        }
    };

    const selectLoanType = (type) => {
        setLoanType(type);
        setShowLoanDropdown(false);
        setErrors(prev => ({ ...prev, loanType: null }));
    };

    const selectEmploymentType = (type) => {
        setEmploymentType(type);
        setShowEmploymentDropdown(false);
        setErrors(prev => ({ ...prev, employmentType: null }));
    };

    return {
        // Field values
        firstName,
        lastName,
        email,
        mobile,
        loanType,
        loanAmount,
        annualIncome,
        employmentType,
        notes,

        // Setters
        setFirstName,
        setLastName,
        setEmail,
        setMobile,
        setLoanAmount,
        setAnnualIncome,
        setNotes,

        // Dropdown
        showLoanDropdown,
        setShowLoanDropdown,
        showEmploymentDropdown,
        setShowEmploymentDropdown,
        selectLoanType,
        selectEmploymentType,
        LOAN_TYPES,
        EMPLOYMENT_TYPES,

        // Validation & Actions
        errors,
        setErrors,
        submitting,
        handleSubmit,
        handleSaveDraft,
        resetForm,
    };
};
