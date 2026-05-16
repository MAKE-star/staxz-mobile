import { useState } from 'react';
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

  const selectedBank = BANKS.find(b => b.code === data.bank_code);

  const canSubmit = data.bank_account_name.trim().length >= 3
    && /^\d{10}$/.test(data.bank_account_number)
    && data.bank_code !== '';

  const submit = async () => {
    setLoading(true);
    try {
      await api('/providers/onboard', {
        method: 'POST',
        token,
        body: {
          business_name:       data.business_name,
          business_type:       data.business_type,
          cac_number:          data.cac_number || undefined,
          whatsapp_number:     data.whatsapp_number,
          location_text:       data.location_text,
          service_modes:       data.service_modes,
          base_fee_kobo:       parseInt(data.base_fee) * 100,
          service_categories:  data.service_categories,
          bank_account_name:   data.bank_account_name,
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
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>Add your bank details to receive payouts</Text>

          {/* Payout info */}
          <View style={{ backgroundColor: C.green + '15', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.green + '30' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0, marginBottom: 4 }}>💸 How payouts work</Text>
            <Text style={{ fontSize: 13, color: C.text1, lineHeight: 18 }}>
              When a client confirms your service, <Text style={{ fontWeight: '700' }}>85%</Text> of the quoted amount goes straight to your bank. Staxz takes a 15% platform fee.
            </Text>
          </View>

          {/* Bank picker */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Bank *</Text>
          <TouchableOpacity onPress={() => setBankOpen(true)}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: data.bank_code ? C.primary : C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, color: selectedBank ? C.text0 : C.text2 }}>
              {selectedBank?.name ?? 'Select your bank'}
            </Text>
            <Text style={{ color: C.text2 }}>▼</Text>
          </TouchableOpacity>

          {/* Account number */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Account Number *</Text>
          <TextInput value={data.bank_account_number} onChangeText={v => update({ bank_account_number: v.replace(/\D/g, '') })}
            placeholder="10-digit NUBAN number" keyboardType="number-pad" maxLength={10}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4 }} />
          <Text style={{ fontSize: 11, color: data.bank_account_number.length > 0 && data.bank_account_number.length !== 10 ? C.red : C.text2, marginBottom: 16 }}>
            {data.bank_account_number.length}/10 digits
          </Text>

          {/* Account name */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Account Name *</Text>
          <TextInput value={data.bank_account_name} onChangeText={v => update({ bank_account_name: v })}
            placeholder="Name as on your bank statement" autoCapitalize="words"
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4 }} />
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 28 }}>Must match your BVN name exactly</Text>

          {/* Summary */}
          <View style={{ backgroundColor: C.bg2, borderRadius: 14, padding: 16, marginBottom: 28 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text0, marginBottom: 10 }}>Profile Summary</Text>
            {[
              ['Business', data.business_name],
              ['Type', data.business_type],
              ['Services', `${data.service_categories.length} categories`],
              ['Mode', data.service_modes.join(' & ')],
              ['Base fee', `₦${parseInt(data.base_fee || '0').toLocaleString()}`],
              ['Location', data.location_text],
              ['WhatsApp', data.whatsapp_number],
            ].map(([l, v]) => (
              <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.border }}>
                <Text style={{ fontSize: 13, color: C.text2 }}>{l}</Text>
                <Text style={{ fontSize: 13, color: C.text0, fontWeight: '500' }}>{v || '—'}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={submit} disabled={!canSubmit || loading}
            style={{ backgroundColor: canSubmit && !loading ? C.primary : C.border, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', elevation: canSubmit ? 8 : 0 }}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Go Live 🚀</Text>
            }
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: C.text2, textAlign: 'center', marginTop: 12 }}>
            By submitting you agree to Staxz's Provider Terms of Service
          </Text>
        </View>
      </ScrollView>

      {/* Bank picker modal */}
      <Modal visible={bankOpen} transparent animationType="slide" onRequestClose={() => setBankOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setBankOpen(false)} />
        <View style={{ backgroundColor: C.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' }}>
          <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0, marginBottom: 16 }}>Select Bank</Text>
          <FlatList data={BANKS} keyExtractor={b => b.code}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { update({ bank_code: item.code }); setBankOpen(false); }}
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
