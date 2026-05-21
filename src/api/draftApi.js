import api from './apiClient';

export const getDraftsApi = async () => {
  const result = await api.get('/drafts');
  return result.data;
};

export const saveDraftApi = async (draftData) => {
  const result = await api.post('/drafts', draftData);
  return result.data;
};

export const deleteDraftApi = async (draftId) => {
  return api.delete(`/drafts/${draftId}`);
};
