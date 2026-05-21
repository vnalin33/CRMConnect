import api from './apiClient';

/**
 * Fetch all payout records for the logged-in connector.
 * Returns { data: [...payouts], summary: {...}, count: number }
 */
export const getPayoutsApi = async () => {
  return api.get('/payouts');
};
