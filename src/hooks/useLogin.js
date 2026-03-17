/**
 * useLogin.js
 * CRM Connect — Login Hook
 * Integrated with Real Node.js / PostgreSQL Backend
 */

import { useState, useCallback } from 'react';
import { ENV } from '../config/env';

const realLoginAPI = async ({ identifier, password }) => {
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
