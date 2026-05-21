

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// ─── Error Classes ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, statusCode = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Unable to connect to the server. Please check your network connection.') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Session expired. Please log in again.') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timed out. Please try again.') {
    super(message, 0);
    this.name = 'TimeoutError';
  }
}

// ─── Configuration ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  baseURL: ENV.API_URL,
  timeout: 30000,               // 30 seconds default
  maxRetries: 3,                // retry up to 3 times for network errors
  retryDelay: 1000,             // initial retry delay (ms), doubles each time
  retryOnlyNetworkErrors: true, // don't retry 4xx/5xx
};

// ─── Token Management ───────────────────────────────────────────────────────

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// ─── Logout callback — set by the app's auth layer ──────────────────────────

let _onAuthFailure = null;


export const setOnAuthFailure = (callback) => {
  _onAuthFailure = callback;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isNetworkError = (err) =>
  err.message?.includes('Network request failed') ||
  err.message?.includes('Failed to connect') ||
  err.message?.includes('Unable to connect') ||
  err.message?.includes('AbortError') ||
  err.name === 'TypeError';

const logDev = (...args) => {
  if (__DEV__) {
    console.log('[API]', ...args);
  }
};

// ─── Core Request Function ──────────────────────────────────────────────────

/**
 * Make an HTTP request with full resilience features.
 *
 * @param {string} endpoint   — path after baseURL, e.g. '/leads' or full URL
 * @param {object} options
 * @param {string}  options.method     — GET | POST | PUT | DELETE | PATCH
 * @param {object}  options.body       — request body (auto-stringified if not FormData)
 * @param {object}  options.headers    — extra headers (merged with defaults)
 * @param {boolean} options.auth       — inject Bearer token? (default: true)
 * @param {number}  options.timeout    — override default timeout (ms)
 * @param {number}  options.maxRetries — override default retries
 * @param {boolean} options.raw        — if true, return full { success, data, ... } object
 * @param {AbortSignal} options.signal — external AbortController signal
 * @returns {Promise<any>} parsed response data
 */
const request = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers: customHeaders = {},
    auth = true,
    timeout = DEFAULT_CONFIG.timeout,
    maxRetries = DEFAULT_CONFIG.maxRetries,
    raw = false,
    signal: externalSignal = null,
  } = options;

  // Build URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${DEFAULT_CONFIG.baseURL}${endpoint}`;

  // Build headers
  const isFormData = body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  };

  // Inject auth token
  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Build fetch options
  const fetchOptions = {
    method,
    headers,
    ...(body
      ? { body: isFormData ? body : JSON.stringify(body) }
      : {}),
  };

  // ─── Retry loop ─────────────────────────────────────────────────────────

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Create timeout controller
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    // Combine with external signal if provided
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        throw new TimeoutError('Request was cancelled.');
      }
      externalSignal.addEventListener('abort', () => abortController.abort(), { once: true });
    }

    try {
      logDev(`${method} ${endpoint}${attempt > 0 ? ` (retry ${attempt})` : ''}`);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // ── Parse response ────────────────────────────────────────────────
      let result;
      try {
        result = await response.json();
      } catch {
        if (response.status !== 401) {
            throw new ApiError(
            `Server returned an unexpected response (${response.status})`,
            response.status
            );
        }
      }

      // ── Handle 401 Unauthorized ───────────────────────────────────────
      if (response.status === 401) {
        logDev('⚠ 401 Unauthorized — triggering auth failure');
        const isLogin = endpoint.includes('/auth/login');
        if (!isLogin && _onAuthFailure) {
          _onAuthFailure();
        }
        const errorMessage = result?.error?.message || result?.message || 'Invalid credentials or session expired.';
        throw new AuthError(errorMessage);
      }

      // ── Handle error responses ────────────────────────────────────────
      if (!response.ok) {
        const errorMessage =
          result?.error?.message || result?.message || `Request failed (${response.status})`;
        throw new ApiError(errorMessage, response.status, result);
      }

      // ── Success ───────────────────────────────────────────────────────
      if (__DEV__ && method !== 'GET') {
        logDev(`✓ ${method} ${endpoint} → ${response.status}`);
      }

      return raw ? result : result;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // Don't retry auth errors or known API errors
      if (err instanceof AuthError || err instanceof ApiError) {
        throw err;
      }

      // Check if it's a timeout from our AbortController
      if (err.name === 'AbortError') {
        if (attempt < maxRetries) {
          const backoff = DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt);
          logDev(`⏱ Timeout — retrying in ${backoff}ms (${attempt + 1}/${maxRetries})`);
          await delay(backoff);
          continue;
        }
        throw new TimeoutError();
      }

      // Network error — retry with backoff
      if (isNetworkError(err) && attempt < maxRetries) {
        const backoff = DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt);
        logDev(`🔄 Network error — retrying in ${backoff}ms (${attempt + 1}/${maxRetries})`);
        await delay(backoff);
        continue;
      }

      break;
    }
  }

  // All retries exhausted
  throw new NetworkError(
    lastError?.message ||
    'Unable to connect to the server. Please check that the backend is running and your device is connected via USB (adb reverse).'
  );
};

// ─── Convenience Methods ────────────────────────────────────────────────────

const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Upload a file via multipart/form-data.
   * Timeout is automatically extended for uploads.
   */
  upload: (endpoint, formData, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      timeout: options.timeout || 60000, // 60s for uploads
    }),

  /**
   * Make a request WITHOUT auth token (e.g. login, signup, forgot-password).
   */
  public: {
    post: (endpoint, body, options = {}) =>
      request(endpoint, { ...options, method: 'POST', body, auth: false }),

    get: (endpoint, options = {}) =>
      request(endpoint, { ...options, method: 'GET', auth: false }),
  },
};

export default api;
