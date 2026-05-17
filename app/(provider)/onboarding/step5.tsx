import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { useAuth } from '../../../src/store/auth';
import { Progress } from '../../../src/components/Progress';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
import { BANKS } from '../../../src/constants/banks';

export default function Step5() {
  const router = useRouter();
  const { data, update, reset } = useOnboarding();
  const { token } = useAuth();
  const [bankOpen, setBankOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState('');
  const [resolveError, setResolveError] = useState('');

  const selectedBank = BANKS.find(b => b.code === data.bank_code);

  // Auto-resolve account name when 10 digits + bank selected
  useEffect(() => {
    if (data.bank_account_number.length === 10 && data.bank_code) {
      resolveAccount();
    } else {
      setResolvedName('');
      setResolveError('');
    }
  }, [data.bank_account_number, data.bank_code]);

  const resolveAccount = async () => {
    setResolving(true);
    setResolveError('');
    setResolvedName('');
    try {
      const res = await api(`/payments/resolve-account?account_number=${data.bank_account_number}&bank_code=${data.bank_code}`, { token });
      const name = res.data?.account_name ?? res.data?.data?.account_name;
      if (name) {
        setResolvedName(name);
        update({ bank_account_name: name });
      } else {
        setResolveError('Could not resolve account. Check number and bank.');
      }
    } catch {
      setResolveError('Could not verify account. Check your details.');
    } finally {
      setResolving(false);
    }
  };

  const canSubmit = data.bank_account_number.length === 10
    && data.bank_code !== ''
    && resolvedName !== ''
    && !resolveError;

  const submit = async () => {
    setLoading(true);
    try {
      await api('/providers/onboard', {
        method: 'POST',
        token,
        body: {
          business_name:       data.business_name,
          business_type:       data.business_type,
          cac_number:          data.cac_number,
          whatsapp_number:     data.whatsapp_number,
          state:               data.state,
          location_text:       data.location_text,
          full_address:        data.full_address,
          service_modes:       data.service_modes,
          base_fee_kobo:       parseInt(data.base_fee) * 100,
          service_categories:  data.service_categories,
          bank_account_name:   resolvedName,
          bank_account_number: data.bank_account_number,
          bank_code:           data.bank_code,
          bio:                 data.bio || undefined,
        },
      });
      reset();
      router.replace('/(provider)/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={4} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Go Live 🚀</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>Add your bank account to receive payouts</Text>

          {/* Payout info */}
          <View style={{ backgroundColor: C.green + '15', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.green + '30' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0, marginBottom: 4 }}>💸 How payouts work</Text>
            <Text style={{ fontSize: 13, color: C.text1, lineHeight: 18 }}>
              When a client confirms your service, <Text style={{ fontWeight: '700' }}>85%</Text> of the quoted amount goes directly to your bank account within 24 hours. Staxz takes a 15% platform fee.
            </Text>
          </View>

          {/* Bank picker */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Bank *</Text>
          <TouchableOpacity onPress={() => setBankOpen(true)}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: data.bank_code ? C.primary : C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 15, color: selectedBank ? C.text0 : C.text2 }}>
              {selectedBank?.name ?? 'Select your bank'}
            </Text>
            <Text style={{ color: C.text2 }}>▼</Text>
          </TouchableOpacity>

          {/* Account number */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Account Number *</Text>
          <TextInput value={data.bank_account_number}
            onChangeText={v => { update({ bank_account_number: v.replace(/\D/g, ''), bank_account_name: '' }); setResolvedName(''); setResolveError(''); }}
            placeholder="10-digit NUBAN number" keyboardType="number-pad" maxLength={10}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: resolvedName ? C.green : resolveError ? C.red : C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 8 }} />

          {/* Account name resolution */}
          {resolving && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={{ fontSize: 13, color: C.text2 }}>Verifying account...</Text>
            </View>
          )}
          {resolvedName !== '' && !resolving && (
            <View style={{ backgroundColor: C.green + '15', borderRadius: 10, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.green + '40' }}>
              <Text style={{ fontSize: 18 }}>✅</Text>
              <View>
                <Text style={{ fontSize: 11, color: C.text2 }}>Account verified</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.text0 }}>{resolvedName}</Text>
              </View>
            </View>
          )}
          {resolveError !== '' && !resolving && (
            <View style={{ backgroundColor: C.redLo, borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: C.red + '40' }}>
              <Text style={{ fontSize: 13, color: C.red }}>❌ {resolveError}</Text>
              <TouchableOpacity onPress={resolveAccount} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: C.primary, fontWeight: '600' }}>Try again →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Profile Summary */}
          <View style={{ backgroundColor: C.bg2, borderRadius: 14, padding: 16, marginBottom: 28 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text0, marginBottom: 10 }}>Profile Summary</Text>
            {[
              ['Business', data.business_name],
              ['Type', data.business_type],
              ['CAC', data.cac_number],
              ['Services', `${data.service_categories.length} categories`],
              ['Mode', data.service_modes.join(' & ')],
              ['Base fee', `₦${parseInt(data.base_fee || '0').toLocaleString()}`],
              ['Location', data.location_text],
              ['WhatsApp', data.whatsapp_number],
            ].map(([l, v]) => (
              <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.border }}>
                <Text style={{ fontSize: 13, color: C.text2 }}>{l}</Text>
                <Text style={{ fontSize: 13, color: C.text0, fontWeight: '500', flex: 1, textAlign: 'right' }}>{v || '—'}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={submit} disabled={!canSubmit || loading}
            style={{ backgroundColor: canSubmit && !loading ? C.primary : C.border, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', elevation: canSubmit ? 8 : 0 }}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Go Live 🚀</Text>}
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: C.text2, textAlign: 'center', marginTop: 12 }}>
            By submitting you agree to Staxz's Provider Terms of Service
          </Text>
        </View>
      </ScrollView>

      {/* Bank Modal */}
      <Modal visible={bankOpen} transparent animationType="slide" onRequestClose={() => setBankOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setBankOpen(false)} />
        <View style={{ backgroundColor: C.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' }}>
          <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0, marginBottom: 16 }}>Select Bank</Text>
          <FlatList data={BANKS} keyExtractor={b => b.code}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { update({ bank_code: item.code, bank_account_name: '' }); setResolvedName(''); setBankOpen(false); }}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: item.code === data.bank_code ? C.bg2 : 'transparent' }}>
                <Text style={{ fontSize: 15, color: item.code === data.bank_code ? C.primary : C.text0, fontWeight: item.code === data.bank_code ? '700' : '400' }}>{item.name}</Text>
                {item.code === data.bank_code && <Text style={{ color: C.primary, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
            )} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
