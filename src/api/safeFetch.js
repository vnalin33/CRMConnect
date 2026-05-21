/**
 * Shared fetch wrapper with automatic retry and exponential backoff.
 * Handles transient network failures (e.g. backend not yet started,
 * adb reverse disconnected momentarily).
 */

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {string} url  – API endpoint
 * @param {object} options – fetch options (method, headers, body, etc.)
 * @param {number} [retries=MAX_RETRIES] – max retry attempts
 * @returns {Promise<object>} parsed JSON response
 */
const safeFetch = async (url, options, retries = MAX_RETRIES) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);

            let result;
            try {
                result = await response.json();
            } catch (err) {
                throw new Error(`Server returned an unexpected response (${response.status})`);
            }

            if (!response.ok) {
                throw new Error(result?.error?.message || result?.message || 'Request failed');
            }
            return result;
        } catch (err) {
            lastError = err;

            // Only retry on network/connection errors, not on server-side errors
            const isNetworkError =
                err.message.includes('Network request failed') ||
                err.message.includes('Failed to connect') ||
                err.message.includes('Unable to connect') ||
                err.message === 'TypeError: Network request failed';

            if (isNetworkError && attempt < retries) {
                const backoff = INITIAL_DELAY_MS * Math.pow(2, attempt);
                console.log(`[safeFetch] Retry ${attempt + 1}/${retries} in ${backoff}ms – ${url}`);
                await delay(backoff);
                continue;
            }
            break;
        }
    }

    // All retries exhausted — throw a user-friendly error
    throw new Error(
        'Unable to connect to the server. Please check that the backend is running and your device is connected via USB (adb reverse).'
    );
};

export default safeFetch;
