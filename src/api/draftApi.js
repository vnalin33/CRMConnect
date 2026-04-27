import { ENV } from '../config/env';
import { authHeaders } from './profileApi';

const safeFetch = async (url, options) => {
    let response;
    try {
        response = await fetch(url, options);
    } catch (err) {
        throw new Error('Unable to connect to the server.');
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

export const getDraftsApi = async () => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/drafts`, {
        method: 'GET',
        headers,
    });
    return result.data;
};

export const saveDraftApi = async (draftData) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/drafts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(draftData),
    });
    return result.data;
};

export const deleteDraftApi = async (draftId) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/drafts/${draftId}`, {
        method: 'DELETE',
        headers,
    });
    return result;
};
