/**
 * useForgotPassword.js
 * ONEBind — Forgot / Reset Password Hook
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';

const useForgotPassword = ({ onSuccess, onError } = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Request a password reset email
   */
  const requestReset = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const result = await api.public.post('/auth/forgot-password', { email });

      setIsSuccess(true);
      setMessage(result.data?.message || 'Reset link sent to your email.');
      return result.data;
    } catch (err) {
      const msg = err?.message ?? 'Something went wrong. Please try again.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password using the token from the email link
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const result = await api.public.post('/auth/reset-password', { token, newPassword });

      if (result.data?.token) {
        await AsyncStorage.setItem('auth_token', result.data.token);
      }
      if (result.data?.user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(result.data.user));
      }

      setIsSuccess(true);
      setMessage(result.data?.message || 'Password reset successfully.');
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const msg = err?.message ?? 'Something went wrong. Please try again.';
      setError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setMessage('');
    setIsLoading(false);
  }, []);

  return { requestReset, resetPassword, isLoading, error, isSuccess, message, reset };
};

export default useForgotPassword;
