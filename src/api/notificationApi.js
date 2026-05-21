import api from './apiClient';

export const getNotificationsApi = async () => {
    return api.get('/notifications');
};

export const pollNotificationsApi = async (sinceId = 0) => {
    return api.get(`/notifications/poll?since_id=${sinceId}`);
};

export const markNotificationReadApi = async (id) => {
    return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = async () => {
    return api.put('/notifications/mark-all-read');
};

export const clearAllNotificationsApi = async () => {
    return api.delete('/notifications/clear-all');
};
