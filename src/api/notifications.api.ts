import { api } from './client';
import { Notification } from '../types';

export const notificationsApi = {
  list: (page = 1) =>
    api.get<{ data: Notification[]; unreadCount: number }>('/notifications', { params: { page } }),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};

export const savedApi = {
  listProviders: () =>
    api.get('/saved/providers'),

  toggleProvider: (providerId: string) =>
    api.post(`/saved/providers/${providerId}`),

  checkSaved: (providerId: string) =>
    api.get<{ data: { saved: boolean } }>(`/saved/providers/${providerId}/status`),

  listCards: () =>
    api.get('/saved/cards'),

  setDefaultCard: (cardId: string) =>
    api.patch(`/saved/cards/${cardId}/default`),

  deleteCard: (cardId: string) =>
    api.delete(`/saved/cards/${cardId}`),
};

export const withdrawalsApi = {
  getBalance: () =>
    api.get<{ data: {
      availableKobo: number;
      pendingEscrowKobo: number;
      totalEarnedKobo: number;
      totalWithdrawnKobo: number;
    } }>('/withdrawals/balance'),

  initiate: (amount_kobo: number) =>
    api.post('/withdrawals', { amount_kobo }),

  listHistory: (page = 1) =>
    api.get('/withdrawals/history', { params: { page } }),
};
