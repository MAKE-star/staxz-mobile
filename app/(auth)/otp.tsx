import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/store/auth';
import { C } from '../../src/constants';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
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
      if (res.data.isNewUser) router.replace('/(auth)/role');
      else {
        const me = await api('/auth/me', { token: res.data.accessToken });
        await setAuth(res.data.accessToken, me.data);
        const role = me.data.role;
        if (role === 'admin') router.replace('/(admin)/(tabs)');
        else if (role === 'provider') router.replace('/(provider)/(tabs)');
        else router.replace('/(hirer)/(tabs)');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setCode(['','','','','','']);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (timer > 0) return;
    await api('/auth/request-otp', { method: 'POST', body: { phone } });
    setTimer(60);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, color: C.primary, fontWeight: '500' }}>← Back</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 8 }}>Enter OTP</Text>
      <Text style={{ fontSize: 15, color: C.text2, marginBottom: 32 }}>
        Code sent to <Text style={{ fontWeight: '700', color: C.text }}>{phone}</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        {code.map((d, i) => (
          <TextInput key={i}
            ref={el => { refs.current[i] = el; }}
            value={d} onChangeText={v => onChange(v, i)}
            onKeyPress={({ nativeEvent: { key } }) => { if (key === 'Backspace' && !d && i > 0) refs.current[i-1]?.focus(); }}
            keyboardType="number-pad" maxLength={1} selectTextOnFocus
            style={{ flex: 1, height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: d ? C.primary : C.border, backgroundColor: d ? C.bg2 : C.white, fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' }}
          />
        ))}
      </View>
      <TouchableOpacity onPress={() => verify(code.join(''))} disabled={loading || code.some(d => !d)}
        style={{ backgroundColor: (loading || code.some(d => !d)) ? '#C084E8' : C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={resend} disabled={timer > 0}>
        <Text style={{ textAlign: 'center', color: timer > 0 ? C.text3 : C.primary, fontWeight: '600' }}>
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
