import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/constants';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('+234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!/^\+234[0-9]{10}$/.test(phone)) {
      setError('Enter a valid Nigerian number: +234XXXXXXXXXX');
      return;
    }
    setLoading(true);
    try {
      await api('/auth/request-otp', { method: 'POST', body: { phone } });
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: C.bg0, padding: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
            <Image source={require('../../assets/images/icon.png')} style={{ width: 70, height: 70, borderRadius: 18 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: C.text0 }}>Staxz</Text>
          <Text style={{ fontSize: 13, color: C.text2, marginTop: 4 }}>Lagos's Beauty & Grooming Marketplace</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 6 }}>Welcome back 👋</Text>
        <Text style={{ fontSize: 15, color: C.text1, marginBottom: 28, lineHeight: 22 }}>Enter your phone number to continue.</Text>

        {/* Phone input */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 8 }}>Phone Number</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 14, borderWidth: 1.5, borderColor: error ? C.red : C.border, paddingHorizontal: 16, height: 54, marginBottom: 6 }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🇳🇬</Text>
          <TextInput value={phone} onChangeText={t => { setPhone(t); setError(''); }}
            keyboardType="phone-pad" placeholder="+2348012345678" maxLength={14} autoFocus
            style={{ flex: 1, fontSize: 16, color: C.text0 }} placeholderTextColor={C.text2} />
        </View>
        {error ? <Text style={{ fontSize: 12, color: C.red, marginBottom: 16 }}>{error}</Text> : <View style={{ height: 16 }} />}

        <TouchableOpacity onPress={submit} disabled={loading}
          style={{ backgroundColor: C.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>{loading ? 'Sending OTP...' : 'Continue →'}</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: C.text2, textAlign: 'center', marginTop: 24, lineHeight: 18 }}>
          By continuing you agree to our{'\n'}Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
