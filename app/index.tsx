import { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { authApi } from '../src/api/auth.api';
import { COLORS } from '../src/constants';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, setUser, logout } = useAuthStore();
  const opacity = new Animated.Value(0);
  const scale   = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const navigate = async () => {
      if (!isAuthenticated) {
        setTimeout(() => router.replace('/(auth)/phone'), 1200);
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
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.logoText}>S</Text>
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <Text style={styles.brand}>Staxz</Text>
        <Text style={styles.tagline}>Lagos's Beauty & Grooming Marketplace</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.bg0,
    alignItems: 'center', justifyContent: 'center', gap: 20,
  },
  logoBox: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.4,
    shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  logoText: { fontSize: 42, fontWeight: '800', color: COLORS.white },
  brand:   { fontSize: 34, fontWeight: '800', color: COLORS.text0, textAlign: 'center' },
  tagline: { fontSize: 13, color: COLORS.text1, textAlign: 'center', marginTop: 6 },
});
