import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/store/auth';
import { api } from '../src/api';
import { C } from '../src/constants';

export default function Splash() {
  const router = useRouter();
  const { isLoading, token, setAuth, logout } = useAuth();

  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bgColor     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: logo pops in → text fades in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const navigate = async () => {
      // Wait for animation to finish before navigating
      await new Promise(r => setTimeout(r, 1800));

      if (!token) { router.replace('/(auth)/phone'); return; }

      try {
        const res = await api('/auth/me', { token });
        await setAuth(token, res.data);
        const role = res.data.role;
        if      (role === 'admin')    router.replace('/(admin)/(tabs)');
        else if (role === 'provider') router.replace('/(provider)/(tabs)');
        else                          router.replace('/(hirer)/(tabs)');
      } catch {
        await logout();
        router.replace('/(auth)/phone');
      }
    };

    navigate();
  }, [isLoading, token]);

  return (
    <View style={{ flex: 1, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>

      {/* Animated logo */}
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], marginBottom: 28,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 16 }}>
        <View style={{ width: 110, height: 110, borderRadius: 30, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={require('../assets/images/icon.png')} style={{ width: 90, height: 90, borderRadius: 22 }} resizeMode="contain" />
        </View>
      </Animated.View>

      {/* Animated text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '800', color: C.white, letterSpacing: 0.5 }}>Staxz</Text>
        <Text style={{ fontSize: 13, color: '#E8E2F0', marginTop: 6, letterSpacing: 0.3 }}>
          Lagos's Beauty & Grooming Marketplace
        </Text>
      </Animated.View>

      {/* Subtle loading dots */}
      <Animated.View style={{ opacity: textOpacity, position: 'absolute', bottom: 60, flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        ))}
      </Animated.View>
    </View>
  );
}
