import api from './api';

export const inventoryService = {
  getAll: () => api.get('/inventory'),
  getAvailability: () => api.get('/inventory/availability'),
  create: (payload) => api.post('/inventory', payload),
  update: (id, payload) => api.put(`/inventory/${id}`, payload)
};
