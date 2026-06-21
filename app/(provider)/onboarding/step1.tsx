import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { api } from '../../../src/api';
import { useAuth } from '../../../src/store/auth';
import { C } from '../../../src/constants';

const LAGOS_AREAS = [
  'Lekki Phase 1', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba',
  'Ikeja GRA', 'Ajah', 'Sangotedo', 'Gbagada', 'Maryland',
  'Magodo', 'Ojodu Berger', 'Ogba', 'Festac', 'Isolo',
];

type CACStatus = 'idle' | 'checking' | 'verified' | 'failed';

export default function Step1() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const { token } = useAuth();
  const [cacStatus, setCacStatus]           = useState<CACStatus>('idle');
  const [cacError, setCacError]             = useState('');
  const [cacRegisteredName, setCacRegisteredName] = useState('');

  const toggleMode = (id: string) => {
    const modes = data.service_modes.includes(id)
      ? data.service_modes.filter(m => m !== id)
      : [...data.service_modes, id];
    update({ service_modes: modes });
  };

  const cacFormatValid = /^(RC|BN|IT|LP|LLP)-?\d{5,9}$/i.test(data.cac_number.trim());

  const verifyCac = async () => {
    if (!cacFormatValid || !data.business_name.trim()) {
      Alert.alert('Required', 'Enter your business name and CAC number first.');
      return;
    }
    setCacStatus('checking');
    setCacError('');
    setCacRegisteredName('');
    try {
      const res = await api('/cac/verify', {
        method: 'POST',
        token,
        body: { cac_number: data.cac_number.trim(), business_name: data.business_name.trim() },
      });
      setCacStatus('verified');
      setCacRegisteredName(res.data?.registeredName ?? '');
      update({ cac_verified: true } as any);
    } catch (e: any) {
      setCacStatus('failed');
      setCacError(e.message ?? 'CAC verification failed');
      update({ cac_verified: false } as any);
    }
  };

  const canContinue = data.business_name.trim().length >= 2
    && data.business_type !== ''
    && cacStatus === 'verified'
    && data.service_modes.length > 0
    && data.base_fee !== '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={0} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Tell us about your business</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>This information will be verified and shown to clients.</Text>

          {/* Business Type */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Business Type</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[{ id: 'salon', label: 'Salon / Shop' }, { id: 'independent', label: 'Independent' }].map(r => (
              <TouchableOpacity key={r.id} onPress={() => update({ business_type: r.id })}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: data.business_type === r.id ? C.primary : C.border, backgroundColor: data.business_type === r.id ? C.bg2 : C.bg1, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: data.business_type === r.id ? C.primary : C.text0 }}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Business Name */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Business Name</Text>
          <TextInput value={data.business_name}
            onChangeText={v => { update({ business_name: v }); setCacStatus('idle'); setCacRegisteredName(''); }}
            placeholder="e.g. Supreme Cuts" maxLength={120}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 20 }} />

          {/* CAC Number */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>CAC Registration Number *</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
            <TextInput value={data.cac_number}
              onChangeText={v => { update({ cac_number: v }); setCacStatus('idle'); setCacRegisteredName(''); }}
              placeholder="RC-0000000 or BN-0000000" autoCapitalize="characters" maxLength={15}
              style={{ flex: 1, backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5,
                borderColor: cacStatus === 'verified' ? C.green : cacStatus === 'failed' ? C.red : cacFormatValid ? C.primary : C.border,
                padding: 14, fontSize: 15, color: C.text0 }} />
            <TouchableOpacity onPress={verifyCac}
              disabled={!cacFormatValid || !data.business_name.trim() || cacStatus === 'checking'}
              style={{ backgroundColor: cacStatus === 'verified' ? C.green : (!cacFormatValid || !data.business_name.trim()) ? C.border : C.primary,
                borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minWidth: 80 }}>
              {cacStatus === 'checking'
                ? <ActivityIndicator color={C.white} size="small" />
                : <Text style={{ color: C.white, fontWeight: '700', fontSize: 13 }}>
                    {cacStatus === 'verified' ? '✓ Done' : 'Verify'}
                  </Text>
              }
            </TouchableOpacity>
          </View>

          {/* CAC status feedback */}
          {cacStatus === 'verified' && (
            <View style={{ backgroundColor: C.green + '15', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.green + '40', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>✅</Text>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.green }}>CAC Verified</Text>
                {cacRegisteredName ? <Text style={{ fontSize: 12, color: C.text1 }}>Registered as: {cacRegisteredName}</Text> : null}
              </View>
            </View>
          )}
          {cacStatus === 'failed' && (
            <View style={{ backgroundColor: C.redLo, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.red + '40' }}>
              <Text style={{ fontSize: 13, color: C.red, fontWeight: '600' }}>❌ {cacError}</Text>
              <Text style={{ fontSize: 11, color: C.text2, marginTop: 4 }}>
                Contact support if your business is registered but verification fails.
              </Text>
            </View>
          )}
          {cacStatus === 'idle' && (
            <Text style={{ fontSize: 12, color: C.text2, marginBottom: 20 }}>
              Verifies your legal accountability on the platform. Required to go live.
            </Text>
          )}

          {/* Service Mode */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Service Mode</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'home', emoji: '🏠', label: 'Home Service', sub: 'You travel to client' },
              { id: 'walkin', emoji: '🪑', label: 'Walk-In Only', sub: 'Client comes to you' },
            ].map(m => (
              <TouchableOpacity key={m.id} onPress={() => toggleMode(m.id)}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: data.service_modes.includes(m.id) ? C.primary : C.border, backgroundColor: data.service_modes.includes(m.id) ? C.bg2 : C.bg1 }}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{m.emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: data.service_modes.includes(m.id) ? C.primary : C.text0 }}>{m.label}</Text>
                <Text style={{ fontSize: 11, color: C.text2 }}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Base Fee */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Base Fee (₦)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 54, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, color: C.primary, marginRight: 8, fontWeight: '700' }}>₦</Text>
            <TextInput value={data.base_fee} onChangeText={v => update({ base_fee: v.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 5000" keyboardType="number-pad"
              style={{ flex: 1, fontSize: 15, color: C.text0 }} placeholderTextColor={C.text2} />
          </View>
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 20 }}>Minimum starting price. You can quote higher per job.</Text>

          {/* Bio (optional) */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Bio <Text style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</Text></Text>
          <TextInput value={data.bio} onChangeText={v => update({ bio: v })}
            placeholder="Tell clients what makes you special..." multiline numberOfLines={3} maxLength={300}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4, minHeight: 80, textAlignVertical: 'top' }} />
          <Text style={{ fontSize: 11, color: C.text2, marginBottom: 32 }}>{data.bio.length}/300</Text>

          {/* Hint if CAC not verified */}
          {cacStatus !== 'verified' && (
            <View style={{ backgroundColor: C.amberLo, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.amber + '40' }}>
              <Text style={{ fontSize: 13, color: C.amber, fontWeight: '600' }}>⚠️ Verify your CAC number to continue</Text>
              <Text style={{ fontSize: 12, color: C.text1, marginTop: 4 }}>Enter your CAC number above and tap "Verify"</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step2')} disabled={!canContinue}
            style={{ backgroundColor: canContinue ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: canContinue ? 8 : 0, shadowColor: C.primary, shadowOpacity: canContinue ? 0.35 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}>
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
