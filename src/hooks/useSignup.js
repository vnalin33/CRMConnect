import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import api from '../api/apiClient';

/**
 * useSignup – handles registration API call.
 *
 * Usage:
 *   const { signup, isLoading, error } = useSignup({ onSuccess });
 *   signup({ name, email, phone, password, role, isActive });
 */
const realSignupAPI = async (payload) => {
    const result = await api.public.post('/auth/register', payload);
    return result.data;
};

const mockSignupAPI = async (payload) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        user: {
            id: 'mock-user-new',
            name: payload.name,
            email: payload.email,
            role: payload.role,
        },
        token: 'mock-jwt-token-new',
    };
};

const useSignup = ({ onSuccess } = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const signup = useCallback(async (payload) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await (ENV.USE_MOCK ? mockSignupAPI(payload) : realSignupAPI(payload));

            // Store JWT token and user data in AsyncStorage
            if (result?.token) {
                await AsyncStorage.setItem('auth_token', result.token);
            }
            if (result?.user) {
                await AsyncStorage.setItem('user_data', JSON.stringify(result.user));
            }

            onSuccess?.(result);
        } catch (err) {
            setError(err.message || 'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [onSuccess]);

    return { signup, isLoading, error };
};

export default useSignup;
