import api from './api';

export const requestService = {
  getAll: () => api.get('/requests'),
  create: (payload) => api.post('/requests', payload),
  getById: (id) => api.get(`/requests/${id}`),
  updateStatus: (id, status) => api.put(`/requests/${id}/status`, { status })
};
