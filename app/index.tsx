import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { authApi } from '../src/api/auth.api';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    const navigate = async () => {
      if (!isAuthenticated) {
        setTimeout(() => router.replace('/(auth)/phone'), 800);
        return;
      }
      try {
        const res = await authApi.me();
        const user = res.data.data;
        setUser(user);
        setTimeout(() => {
          if      (user.role === 'admin')    router.replace('/(admin)/(tabs)');
          else if (user.role === 'provider') router.replace('/(provider)/(tabs)');
          else                               router.replace('/(hirer)/(tabs)');
        }, 800);
      } catch {
        await logout();
        router.replace('/(auth)/phone');
      }
    };
    navigate();
  }, [isLoading, isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#7B4FA6', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 42, fontWeight: '800', color: '#7B4FA6' }}>S</Text>
      </View>
      <Text style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' }}>Staxz</Text>
      <Text style={{ fontSize: 13, color: '#E8E2F0', textAlign: 'center', marginTop: 6 }}>Lagos's Beauty & Grooming Marketplace</Text>
    </View>
  );
}