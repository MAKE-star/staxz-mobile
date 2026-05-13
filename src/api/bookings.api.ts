import { api } from './client';
import { Booking, Enquiry } from '../types';

export const bookingsApi = {
  createEnquiry: (data: {
    providerId: string;
    categoryId: string;
    serviceType: string;
    inspirationPhotoUrl?: string;
    notes?: string;
  }) => api.post<{ data: Enquiry }>('/enquiries', data),

  getEnquiry: (id: string) =>
    api.get<{ data: Enquiry }>(`/enquiries/${id}`),

  acceptQuote: (enquiryId: string, data?: {
    scheduled_at?: string;
    service_address?: string;
  }) => api.post(`/enquiries/${enquiryId}/accept`, data ?? {}),

  list: (page = 1) =>
    api.get<{ data: Booking[] }>('/bookings', { params: { page } }),

  getById: (id: string) =>
    api.get<{ data: Booking }>(`/bookings/${id}`),

  markComplete: (id: string) =>
    api.post(`/bookings/${id}/complete`),

  confirm: (id: string) =>
    api.post(`/bookings/${id}/confirm`),

  cancel: (id: string) =>
    api.post(`/bookings/${id}/cancel`),

  dispute: (id: string, reason: string, details?: string) =>
    api.post(`/bookings/${id}/dispute`, { reason, details }),

  review: (id: string, stars: number, body?: string) =>
    api.post(`/bookings/${id}/review`, { stars, body }),
};
