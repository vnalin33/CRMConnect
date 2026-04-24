import { ENV } from '../config/env';
import { authHeaders } from './profileApi'; // Reuse auth headers utility

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
 * Submit a new lead (Add Contact)
 */
export const createLeadApi = async (leadData) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(leadData),
    });
    return result.data;
};

/**
 * Fetch unassigned contact list for the connector
 */
export const getUnassignedContactsApi = async () => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/unassigned`, {
        method: 'GET',
        headers,
    });
    return result.data;
};

/**
 * Fetch all leads for the logged-in connector with status + progress
 */
export const getMyLeadsApi = async () => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/my`, {
        method: 'GET',
        headers,
    });
    return result;
};

/**
 * Fetch full lead detail + history
 */
export const getLeadDetailApi = async (leadId) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/${leadId}`, {
        method: 'GET',
        headers,
    });
    return result.data;
};

/**
 * Update lead status
 */
export const updateLeadStatusApi = async (leadId, status, notes) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, notes }),
    });
    return result.data;
};

/**
 * Assign a lead
 */
export const assignLeadApi = async (leadId, notes) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/${leadId}/assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes }),
    });
    return result.data;
};

/**
 * Delete a lead
 */
export const deleteLeadApi = async (leadId) => {
    const headers = await authHeaders();
    const result = await safeFetch(`${ENV.API_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers,
    });
    return result;
};
