/**
 * useLogin.js
 * CRM Connect — Login Hook
 * Integrated with Real Node.js / PostgreSQL Backend (connector table)
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import api from '../api/apiClient';
import notificationService from '../services/NotificationService';

const realLoginAPI = async ({ identifier, password }) => {
  const result = await api.public.post('/auth/login', { identifier, password });
  return result.data;
};

const mockLoginAPI = async ({ identifier, password }) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // In mock mode, we accept ANY credentials that passed the local validation
  return {
    user: {
      id: 'mock-user-123',
      identifier: identifier,
      name: 'Mock User',
      role: 'Finance Agent',
    },
    token: 'mock-jwt-token',
  };
};

const useLogin = ({ onSuccess, onError } = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const login = useCallback(async credentials => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await (ENV.USE_MOCK ? mockLoginAPI(credentials) : realLoginAPI(credentials));

      // Store JWT token, user data, and login timestamp in AsyncStorage
      if (result?.token) {
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('auth_login_time', Date.now().toString());
      }
      if (result?.user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(result.user));
      }

      setData(result);

      // Register FCM token with backend after successful login
      notificationService.registerAfterLogin().catch(() => {});

      onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err?.message ?? 'Something went wrong. Please try again.';
      setError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    // Unregister FCM token before clearing auth
    await notificationService.unregisterOnLogout().catch(() => {});
    await notificationService.reset();
    await AsyncStorage.multiRemove(['auth_token', 'user_data', 'auth_login_time']);
    setData(null);
  }, []);

  return { login, logout, isLoading, error, data, reset };
};

export default useLogin;
