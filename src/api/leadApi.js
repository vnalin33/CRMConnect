import api from './apiClient';

/**
 * Submit a new lead (Add Contact)
 */
export const createLeadApi = async (leadData) => {
  const result = await api.post('/leads', leadData);
  return result.data;
};

/**
 * Fetch unassigned contact list for the connector
 */
export const getUnassignedContactsApi = async () => {
  const result = await api.get('/leads/unassigned');
  return result.data;
};

/**
 * Fetch all leads for the logged-in connector with status + progress
 */
export const getMyLeadsApi = async () => {
  return api.get('/leads/my');
};

/**
 * Fetch full lead detail + history
 */
export const getLeadDetailApi = async (leadId) => {
  const result = await api.get(`/leads/${leadId}`);
  return result.data;
};

/**
 * Update lead status
 */
export const updateLeadStatusApi = async (leadId, status, notes) => {
  const result = await api.put(`/leads/${leadId}/status`, { status, notes });
  return result.data;
};

/**
 * Assign a lead
 */
export const assignLeadApi = async (leadId, notes) => {
  const result = await api.post(`/leads/${leadId}/assign`, { notes });
  return result.data;
};

/**
 * Delete a lead
 */
export const deleteLeadApi = async (leadId) => {
  return api.delete(`/leads/${leadId}`);
};
