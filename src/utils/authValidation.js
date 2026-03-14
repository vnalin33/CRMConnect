import { z } from 'zod';

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
    identifier: z
        .string()
        .min(1, 'Email or mobile is required')
        .refine(val => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const isMobile = /^[6-9]\d{9}$/.test(val.replace(/\D/g, ''));
            return isEmail || isMobile;
        }, 'Enter a valid email or 10-digit mobile number'),
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
        .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
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
