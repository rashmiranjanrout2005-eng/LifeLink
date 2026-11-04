import api from './api';

export const donorService = {
  getAll: () => api.get('/donors'),
  create: (payload) => api.post('/donors', payload),
  update: (id, payload) => api.put(`/donors/${id}`, payload),
  remove: (id) => api.delete(`/donors/${id}`)
};
