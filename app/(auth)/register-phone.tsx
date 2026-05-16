import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/constants';

export default function RegisterPhoneScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const [phone, setPhone] = useState('+234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isProvider = role === 'provider';
  const emoji = isProvider ? '💼' : '🌟';
  const roleLabel = isProvider ? 'Provider' : 'Client';
  const color = isProvider ? '#EC4899' : C.primary;

  const submit = async () => {
    setError('');
    if (!/^\+234[0-9]{10}$/.test(phone)) {
      setError('Enter a valid Nigerian number: +234XXXXXXXXXX');
      return;
    }
    setLoading(true);
    try {
      await api('/auth/request-otp', { method: 'POST', body: { phone } });
      router.push({ pathname: '/(auth)/otp', params: { phone, mode: 'signup', role } });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: C.bg0, padding: 24 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ paddingTop: 32, marginBottom: 32 }}>
          <Text style={{ fontSize: 22, color: C.text0 }}>←</Text>
        </TouchableOpacity>

        {/* Role badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color + '15', borderRadius: 14, padding: 14, marginBottom: 28, borderWidth: 1, borderColor: color + '30' }}>
          <Text style={{ fontSize: 28 }}>{emoji}</Text>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0 }}>Signing up as {roleLabel}</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 12, color, marginTop: 2 }}>Change role →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text0, marginBottom: 6 }}>Enter your number</Text>
        <Text style={{ fontSize: 15, color: C.text1, marginBottom: 28, lineHeight: 22 }}>
          We'll send you a one-time code to verify your number.
        </Text>

        <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 8 }}>Phone Number</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 14, borderWidth: 1.5, borderColor: error ? C.red : C.border, paddingHorizontal: 16, height: 54, marginBottom: 6 }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🇳🇬</Text>
          <TextInput value={phone} onChangeText={t => { setPhone(t); setError(''); }}
            keyboardType="phone-pad" placeholder="+2348012345678" maxLength={14} autoFocus
            style={{ flex: 1, fontSize: 16, color: C.text0 }} placeholderTextColor={C.text2} />
        </View>
        {error ? <Text style={{ fontSize: 12, color: C.red, marginBottom: 16 }}>{error}</Text> : <View style={{ height: 16 }} />}

        <TouchableOpacity onPress={submit} disabled={loading}
          style={{ backgroundColor: loading ? C.border : color, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: 8 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Sending code...' : 'Get OTP →'}
          </Text>
        </TouchableOpacity>

        {isProvider && (
          <View style={{ backgroundColor: C.bg2, borderRadius: 12, padding: 14, marginTop: 24 }}>
            <Text style={{ fontSize: 13, color: C.text1, lineHeight: 18 }}>
              After verifying your number, you'll set up your business profile in 5 quick steps.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
