import { useState, useMemo } from 'react';
import { changePasswordApi } from '../api/profileApi';

/**
 * Password strength levels:
 *  0 = Too Short  |  1 = Weak  |  2 = Fair  |  3 = Good  |  4 = Strong
 */
const getPasswordStrength = (password) => {
    if (!password || password.length < 4) return { level: 0, label: 'Too Short', color: '#9CA3AF' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#F44336' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#FF9800' };
    if (score === 3) return { level: 3, label: 'Good', color: '#FFC107' };
    return { level: 4, label: 'Strong', color: '#4CAF50' };
};

const STRENGTH_GRADIENT_COLORS = {
    0: ['#9CA3AF', '#9CA3AF'],
    1: ['#F44336', '#E53935'],
    2: ['#FF9800', '#FB8C00'],
    3: ['#FFC107', '#FFB300'],
    4: ['#4CAF50', '#43A047'],
};

export const useChangePassword = (navigation) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
    const strengthGradient = STRENGTH_GRADIENT_COLORS[strength.level];

    const validate = () => {
        const errs = {};

        if (!oldPassword.trim()) {
            errs.oldPassword = 'Current password is required';
        }

        if (!newPassword.trim()) {
            errs.newPassword = 'New password is required';
        } else if (newPassword.length < 4) {
            errs.newPassword = 'Password must be at least 4 characters';
        } else if (strength.level < 2) {
            errs.newPassword = 'Password is too weak. Add uppercase, digits or symbols';
        }

        if (newPassword === oldPassword && newPassword.length > 0) {
            errs.newPassword = 'New password must be different from old password';
        }

        if (!confirmPassword.trim()) {
            errs.confirmPassword = 'Please confirm your new password';
        } else if (confirmPassword !== newPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        setSuccessMessage('');
        if (!validate()) return;

        setLoading(true);
        try {
            await changePasswordApi({ oldPassword, newPassword });
            setSuccessMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            // Auto-navigate back after a short delay
            setTimeout(() => navigation?.goBack(), 1500);
        } catch (error) {
            setErrors({ general: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const clearFieldError = (field) => {
        setErrors(prev => ({ ...prev, [field]: null }));
        setSuccessMessage('');
    };

    return {
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
    };
};
