import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: { id: string; role: string; phone: string } | null;
  isLoading: boolean;
  setAuth: (token: string, user: AuthState['user']) => Promise<void>;
  logout: () => Promise<void>;
  load: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token, user) => {
    await SecureStore.setItemAsync('token', token);
    set({ token, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  },

  load: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        set({ token });
      }
    } catch {}
    set({ isLoading: false });
  },
}));
