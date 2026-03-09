/**
 * useLogin.js
 * CRM Connect — Login Hook
 * Replace loginAPI with your real authService
 */

import {useState, useCallback} from 'react';

// ── Mock API — replace with real service ──────
const loginAPI = async ({identifier, password}) => {
  await new Promise(r => setTimeout(r, 1500)); // simulate network
  // Demo mode — accepts any credentials if format is valid
  return {
    token:        'jwt_token_' + Date.now(),
    refreshToken: 'refresh_token_xyz',
    user: {
      id:             'user_001',
      name:           'User1234',
      email:          identifier,
      mobile:         '+91 XXXXX XXXXX',
      role:           'Finance Agent',
      rating:         4.2,
      isTopPerformer: true,
    },
  };
};

const useLogin = ({onSuccess, onError} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [data, setData]           = useState(null);

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

  return {login, isLoading, error, data, reset};
};

export default useLogin;