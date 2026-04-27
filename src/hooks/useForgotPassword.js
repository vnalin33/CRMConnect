/**
 * useForgotPassword.js
 * CRM Connect — Forgot / Reset Password Hook
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

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
      const response = await fetch(`${ENV.API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send reset email');
      }

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
      const response = await fetch(`${ENV.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reset password');
      }

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
