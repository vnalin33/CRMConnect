import { z } from 'zod';

export const SIGNUP_ROLES = [
    { id: 'agent', label: 'Agent' },
    { id: 'real_estate_agent', label: 'Real Estate Agent' },
    { id: 'lic_agent', label: 'LIC Agent' },
];

export const signupSchema = z.object({
    name: z
        .string()
        .min(1, 'Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    role: z
        .string()
        .min(1, 'Please select a role'),
    isActive: z.boolean().optional(),
});

export const validateSignupForm = (data) => {
    const result = signupSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    const errors = {};
    if (result.error && result.error.issues) {
        result.error.issues.forEach(issue => {
            if (issue.path && issue.path.length > 0) {
                errors[issue.path[0]] = issue.message;
            }
        });
    }
    return { isValid: false, errors };
};

export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Email or mobile is required')
        .refine(val => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const isMobile = /^[6-9]\d{9}$/.test(val.replace(/\D/g, ''));
            return isEmail || isMobile;
        }, 'Enter a valid email or 10-digit mobile number'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z
        .string()
        .min(1, 'Confirm password is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const validateLoginForm = (data) => {
    const result = loginSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, errors: {} };
    }

    const errors = {};
    if (result.error && result.error.issues) {
        result.error.issues.forEach(issue => {
            if (issue.path && issue.path.length > 0) {
                errors[issue.path[0]] = issue.message;
            }
        });
    }
    return { isValid: false, errors };
};

export const validateForgotPasswordForm = (data) => {
    const result = forgotPasswordSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, errors: {} };
    }

    const errors = {};
    if (result.error && result.error.issues) {
        result.error.issues.forEach(issue => {
            if (issue.path && issue.path.length > 0) {
                errors[issue.path[0]] = issue.message;
            }
        });
    }
    return { isValid: false, errors };
};

export const validateResetPasswordForm = (data) => {
    const result = resetPasswordSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, errors: {} };
    }

    const errors = {};
    if (result.error && result.error.issues) {
        result.error.issues.forEach(issue => {
            if (issue.path && issue.path.length > 0) {
                errors[issue.path[0]] = issue.message;
            }
        });
    }
    return { isValid: false, errors };
};

/**
 * Calculate password strength score (0-4)
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '#D1D5DB' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Normalize to 4 levels
    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { score: 3, label: 'Good', color: '#3B82F6' };
    return { score: 4, label: 'Strong', color: '#10B981' };
};
