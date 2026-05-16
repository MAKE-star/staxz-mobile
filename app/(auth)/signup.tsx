import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/constants';

const ROLES = [
  {
    id: 'hirer',
    emoji: '🌟',
    title: 'Client',
    subtitle: 'I want to book beauty services',
    bullets: ['Browse providers near you', 'Book at home or walk-in', 'Secure escrow payments'],
    color: C.primary,
  },
  {
    id: 'provider',
    emoji: '💼',
    title: 'Provider',
    subtitle: 'I offer beauty & grooming services',
    bullets: ['Receive bookings on WhatsApp', 'Get paid directly to your bank', 'Build your portfolio'],
    color: '#EC4899',
  },
];

export default function SignUpScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [phone, setPhone] = useState('+234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'role' | 'phone'>('role');

  const submitPhone = async () => {
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

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, marginBottom: 32 }}>
          <TouchableOpacity onPress={() => step === 'phone' ? setStep('role') : router.back()} style={{ marginRight: 16 }}>
            <Text style={{ fontSize: 22, color: C.text0 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0 }}>
              {step === 'role' ? 'Create Account' : 'Enter your number'}
            </Text>
            <Text style={{ fontSize: 13, color: C.text2 }}>
              {step === 'role' ? 'Step 1 of 2 — Choose your role' : 'Step 2 of 2 — Verify phone'}
            </Text>
          </View>
        </View>

        {step === 'role' ? (
          <>
            <Text style={{ fontSize: 15, color: C.text1, marginBottom: 24, lineHeight: 22 }}>
              How will you use Staxz? You can always change this later.
            </Text>

            {ROLES.map(r => (
              <TouchableOpacity key={r.id} onPress={() => setRole(r.id)} activeOpacity={0.9}
                style={{ backgroundColor: role === r.id ? r.color + '12' : C.bg1, borderRadius: 18, borderWidth: 2, borderColor: role === r.id ? r.color : C.border, padding: 20, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: role === r.id ? r.color : C.bg2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{r.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: role === r.id ? r.color : C.text0 }}>{r.title}</Text>
                    <Text style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>{r.subtitle}</Text>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: role === r.id ? r.color : C.border, alignItems: 'center', justifyContent: 'center' }}>
                    {role === r.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: r.color }} />}
                  </View>
                </View>
                {r.bullets.map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: role === r.id ? r.color : C.text2 }} />
                    <Text style={{ fontSize: 13, color: role === r.id ? C.text0 : C.text2 }}>{b}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setStep('phone')} disabled={!role}
              style={{ backgroundColor: role ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: C.primary, shadowOpacity: role ? 0.35 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: role ? 8 : 0 }}>
              <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Selected role badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg2, borderRadius: 12, padding: 14, marginBottom: 28, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 24 }}>{ROLES.find(r => r.id === role)?.emoji}</Text>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0 }}>Signing up as {ROLES.find(r => r.id === role)?.title}</Text>
                <TouchableOpacity onPress={() => setStep('role')}>
                  <Text style={{ fontSize: 12, color: C.primary, marginTop: 2 }}>Change →</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 8 }}>Phone Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 14, borderWidth: 1.5, borderColor: error ? C.red : C.border, paddingHorizontal: 16, height: 54, marginBottom: 6 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🇳🇬</Text>
              <TextInput value={phone} onChangeText={t => { setPhone(t); setError(''); }}
                keyboardType="phone-pad" placeholder="+2348012345678" maxLength={14} autoFocus
                style={{ flex: 1, fontSize: 16, color: C.text0 }} placeholderTextColor={C.text2} />
            </View>
            {error ? <Text style={{ fontSize: 12, color: C.red, marginBottom: 16 }}>{error}</Text> : <View style={{ height: 16 }} />}

            <TouchableOpacity onPress={submitPhone} disabled={loading}
              style={{ backgroundColor: C.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
              <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>{loading ? 'Sending code...' : 'Get OTP →'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Sign in link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: C.text1 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/phone')}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.primary }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
