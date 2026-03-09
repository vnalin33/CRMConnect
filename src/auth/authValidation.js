import { z } from 'zod';

// ─── Login Schema ─────────────────────────────
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

// ─── Validation Helpers ───────────────────────

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
