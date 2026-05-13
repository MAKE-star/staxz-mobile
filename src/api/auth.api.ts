import { api } from './client';
import { User, UserRole } from '../types';

export const authApi = {
  requestOtp: (phone: string) =>
    api.post('/auth/request-otp', { phone }),

  verifyOtp: (phone: string, code: string, role?: UserRole) =>
    api.post<{ data: { accessToken: string; refreshToken: string; isNewUser: boolean } }>(
      '/auth/verify-otp', { phone, code, role }
    ),

  refresh: (refreshToken: string) =>
    api.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () =>
    api.get<{ data: User }>('/auth/me'),

  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    api.post('/auth/push-token', { token, platform }),
};
