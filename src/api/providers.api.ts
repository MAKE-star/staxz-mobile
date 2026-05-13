import { api } from './client';
import { Provider, Review } from '../types';

export const providersApi = {
  list: (params?: {
    lat?: number; lng?: number; radius?: number;
    category?: string; mode?: string; sort?: string;
    page?: number; limit?: number;
  }) => api.get<{ data: Provider[] }>('/providers', { params }),

  getById: (id: string) =>
    api.get<{ data: Provider }>(`/providers/${id}`),

  getReviews: (id: string, page = 1) =>
    api.get<{ data: Review[] }>(`/providers/${id}/reviews`, { params: { page } }),

  onboard: (data: {
    business_name: string;
    business_type: string;
    cac_number?: string;
    whatsapp_number: string;
    location_text: string;
    location_lat?: number;
    location_lng?: number;
    service_modes: string[];
    base_fee_kobo: number;
    service_categories: string[];
    bank_account_name: string;
    bank_account_number: string;
    bank_code: string;
    bio?: string;
    years_experience?: number;
  }) => api.post<{ data: Provider }>('/providers/onboard', data),

  update: (id: string, data: Partial<Provider>) =>
    api.put(`/providers/${id}`, data),

  uploadPhoto: (id: string, categoryId: string, uri: string) => {
    const form = new FormData();
    form.append('categoryId', categoryId);
    form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' } as never);
    return api.post(`/providers/${id}/portfolio`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePhoto: (providerId: string, photoId: string) =>
    api.delete(`/providers/${providerId}/portfolio/${photoId}`),

  getEarnings: () =>
    api.get('/providers/me/earnings'),

  getLiveStatus: () =>
    api.get('/providers/me/live-status'),
};
