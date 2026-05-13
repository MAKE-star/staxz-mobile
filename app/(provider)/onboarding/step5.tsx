import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Modal, FlatList, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useOnboardingStore } from '../../../src/store/onboarding.store';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { OnboardingProgress } from '../../../src/components/shared/OnboardingProgress';
import { providersApi } from '../../../src/api/providers.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS, NIGERIAN_BANKS } from '../../../src/constants';

export default function Step5Screen() {
  const router = useRouter();
  const { data, update, reset } = useOnboardingStore();
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBank = NIGERIAN_BANKS.find(b => b.code === data.bank_code);

  const canSubmit =
    data.bank_account_name.trim().length >= 3 &&
    /^\d{10}$/.test(data.bank_account_number) &&
    data.bank_code !== '';

  const submit = useMutation({
    mutationFn: () => providersApi.onboard({
      business_name:       data.business_name,
      business_type:       data.business_type as any,
      cac_number:          data.cac_number || undefined,
      whatsapp_number:     data.whatsapp_number,
      location_text:       data.location_text,
      service_modes:       data.service_modes,
      base_fee_kobo:       parseInt(data.base_fee_kobo) * 100,
      service_categories:  data.service_categories,
      bank_account_name:   data.bank_account_name,
      bank_account_number: data.bank_account_number,
      bank_code:           data.bank_code,
      bio:                 data.bio || undefined,
      years_experience:    data.years_experience ? parseInt(data.years_experience) : undefined,
    }),
    onSuccess: () => {
      reset();
      router.replace('/(provider)/(tabs)');
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err);
      Alert.alert('Onboarding Failed', msg);
    },
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <OnboardingProgress current={4} />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💸 How payouts work</Text>
          <Text style={styles.infoBody}>
            When a client confirms a completed service, 85% of the quoted amount is transferred directly
            to your bank account. Staxz takes a 15% platform fee.
          </Text>
        </View>

        {/* Bank picker */}
        <Text style={styles.label}>Bank *</Text>
        <TouchableOpacity
          style={[styles.bankPicker, data.bank_code && styles.bankPickerFilled]}
          onPress={() => setBankPickerOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.bankPickerText, !selectedBank && styles.placeholder]}>
            {selectedBank ? selectedBank.name : 'Select your bank'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        <Input
          label="Account Number *"
          value={data.bank_account_number}
          onChangeText={v => update({ bank_account_number: v.replace(/\D/g, '') })}
          placeholder="10-digit NUBAN account number"
          keyboardType="number-pad"
          maxLength={10}
          hint={`${data.bank_account_number.length}/10 digits`}
          error={data.bank_account_number.length > 0 && data.bank_account_number.length !== 10
            ? 'Must be exactly 10 digits' : undefined}
        />

        <Input
          label="Account Name *"
          value={data.bank_account_name}
          onChangeText={v => update({ bank_account_name: v })}
          placeholder="Name as it appears on your bank statement"
          hint="Must match your BVN name exactly"
          maxLength={100}
          autoCapitalize="words"
        />

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Profile Summary</Text>
          <SummaryRow label="Business"   value={data.business_name} />
          <SummaryRow label="Type"       value={data.business_type} />
          <SummaryRow label="Services"   value={`${data.service_categories.length} categories`} />
          <SummaryRow label="Modes"      value={data.service_modes.join(', ')} />
          <SummaryRow label="Base fee"   value={`₦${parseInt(data.base_fee_kobo || '0').toLocaleString()}`} />
          <SummaryRow label="Location"   value={data.location_text} />
          <SummaryRow label="WhatsApp"   value={data.whatsapp_number} />
        </View>

        <Button
          title={submit.isPending ? 'Creating profile...' : 'Go Live 🚀'}
          onPress={() => submit.mutate()}
          loading={submit.isPending}
          disabled={!canSubmit}
          style={styles.btn}
        />

        <Text style={styles.note}>
          By submitting you agree to Staxz's Provider Terms of Service.
        </Text>
      </ScrollView>

      {/* Bank picker modal */}
      <Modal visible={bankPickerOpen} animationType="slide" transparent onRequestClose={() => setBankPickerOpen(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setBankPickerOpen(false)} />
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>Select Bank</Text>
          <FlatList
            data={NIGERIAN_BANKS}
            keyExtractor={b => b.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.bankItem, item.code === data.bank_code && styles.bankItemActive]}
                onPress={() => { update({ bank_code: item.code }); setBankPickerOpen(false); }}
              >
                <Text style={[styles.bankItemText, item.code === data.bank_code && styles.bankItemTextActive]}>
                  {item.name}
                </Text>
                {item.code === data.bank_code && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.sumRow}>
    <Text style={styles.sumLabel}>{label}</Text>
    <Text style={styles.sumValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.bg0 },
  container: { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  back:      { marginBottom: SPACING.md },
  backText:  { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  infoBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: 4 },
  infoBody:  { fontSize: 13, color: COLORS.text1, lineHeight: 18 },
  label:       { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.xs },
  bankPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, minHeight: 50, marginBottom: SPACING.md,
  },
  bankPickerFilled: { borderColor: COLORS.primary },
  bankPickerText:   { fontSize: 15, color: COLORS.text0 },
  placeholder:      { color: COLORS.text2 },
  chevron:          { fontSize: 12, color: COLORS.text2 },
  summary: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.sm },
  sumRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  sumLabel: { fontSize: 13, color: COLORS.text1 },
  sumValue: { fontSize: 13, color: COLORS.text0, fontWeight: '500', flex: 1, textAlign: 'right' },
  btn:  { marginBottom: SPACING.sm },
  note: { fontSize: 12, color: COLORS.text2, textAlign: 'center', lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: COLORS.bg1, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
    maxHeight: '70%',
  },
  pickerHandle: { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  pickerTitle:  { fontSize: 17, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  bankItem: { padding: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between' },
  bankItemActive: { backgroundColor: COLORS.bg2 },
  bankItemText:   { fontSize: 15, color: COLORS.text0 },
  bankItemTextActive: { color: COLORS.primary, fontWeight: '700' },
  tick: { color: COLORS.primary, fontWeight: '700' },
});
