/**
 * useLogin.js
 * CRM Connect — Login Hook
 * Integrated with Real Node.js / PostgreSQL Backend
 */

import { useState, useCallback } from 'react';
import { ENV } from '../config/env';

const loginAPI = async ({ identifier, password }) => {
  try {
    const response = await fetch(`${ENV.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Login failed');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

const useLogin = ({ onSuccess, onError } = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const login = useCallback(async credentials => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginAPI(credentials);
      setData(result);
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

  return { login, isLoading, error, data, reset };
};

export default useLogin;
