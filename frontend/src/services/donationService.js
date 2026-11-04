import api from './api';

export const donationService = {
  getAll: () => api.get('/donations'),
  create: (payload) => api.post('/donations', payload)
};
