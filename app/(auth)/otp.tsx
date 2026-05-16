import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/store/auth';
import { C } from '../../src/constants';

export default function OtpScreen() {
  const router = useRouter();
  const { phone, mode, role } = useLocalSearchParams<{ phone: string; mode: string; role: string }>();
  const { setAuth } = useAuth();
  const [code, setCode] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const onChange = (val: string, i: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code]; next[i] = val.slice(-1); setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d)) verify(next.join(''));
  };

  const verify = async (fullCode: string) => {
    setLoading(true);
    try {
      const res = await api('/auth/verify-otp', { method: 'POST', body: { phone, code: fullCode } });
      await setAuth(res.data.accessToken, null);

      const isNew = res.data.isNewUser;

      if (isNew) {
        // New user — route based on selected role
        if (role === 'provider') router.replace('/(provider)/onboarding/step1');
        else router.replace('/(hirer)/(tabs)');
      } else {
        // Existing user — fetch role from API
        const me = await api('/auth/me', { token: res.data.accessToken });
        await setAuth(res.data.accessToken, me.data);
        const userRole = me.data.role;
        if      (userRole === 'admin')    router.replace('/(admin)/(tabs)');
        else if (userRole === 'provider') router.replace('/(provider)/(tabs)');
        else                              router.replace('/(hirer)/(tabs)');
      }
    } catch (e: any) {
      Alert.alert('Invalid code', e.message ?? 'Please try again');
      setCode(['','','','','','']);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (timer > 0) return;
    try {
      await api('/auth/request-otp', { method: 'POST', body: { phone } });
      setTimer(60);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0, padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 22, color: C.text0 }}>←</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text0, marginBottom: 6 }}>Enter OTP</Text>
      <Text style={{ fontSize: 15, color: C.text1, marginBottom: 8, lineHeight: 22 }}>
        We sent a 6-digit code to
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.primary, marginBottom: 32 }}>{phone}</Text>

      {/* OTP boxes */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
        {code.map((d, i) => (
          <TextInput key={i}
            ref={el => { refs.current[i] = el; }}
            value={d}
            onChangeText={v => onChange(v, i)}
            onKeyPress={({ nativeEvent: { key } }) => {
              if (key === 'Backspace' && !d && i > 0) {
                const next = [...code]; next[i-1] = ''; setCode(next);
                refs.current[i-1]?.focus();
              }
            }}
            keyboardType="number-pad" maxLength={1} selectTextOnFocus
            style={{
              flex: 1, height: 60, borderRadius: 14,
              borderWidth: 2,
              borderColor: d ? C.primary : C.border,
              backgroundColor: d ? C.bg2 : C.bg1,
              fontSize: 24, fontWeight: '800', color: C.text0, textAlign: 'center',
            }}
          />
        ))}
      </View>

      {/* Verify button */}
      <TouchableOpacity
        onPress={() => verify(code.join(''))}
        disabled={loading || code.some(d => !d)}
        style={{ backgroundColor: (loading || code.some(d => !d)) ? C.border : C.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: C.primary, shadowOpacity: code.every(d => d) ? 0.35 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: code.every(d => d) ? 8 : 0 }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      {/* Resend */}
      <TouchableOpacity onPress={resend} disabled={timer > 0} style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: timer > 0 ? C.text2 : C.primary, fontWeight: '600' }}>
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
