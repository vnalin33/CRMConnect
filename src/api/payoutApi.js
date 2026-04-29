import { ENV } from '../config/env';
import { authHeaders } from './profileApi';

const safeFetch = async (url, options) => {
    let response;
    try {
        response = await fetch(url, options);
    } catch (err) {
        throw new Error(
            'Unable to connect to the server. Please check that the backend is running and your device is connected via USB (adb reverse).'
        );
    }

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
};

/**
 * Fetch all payout records for the logged-in connector.
 * Returns { data: [...payouts], summary: {...}, count: number }
 */
export const getPayoutsApi = async () => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/payouts`, {
        method: 'GET',
        headers,
    });
    return result;
};
