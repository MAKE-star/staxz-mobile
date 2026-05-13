import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../src/store/onboarding.store';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { OnboardingProgress } from '../../../src/components/shared/OnboardingProgress';
import { LocationAutocomplete } from '../../../src/components/shared/LocationAutocomplete';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';

// Common Lagos areas for quick selection
const LAGOS_AREAS = [
  'Lekki Phase 1', 'Lekki Phase 2', 'Victoria Island', 'Ikoyi',
  'Surulere', 'Yaba', 'Ikeja', 'Ajah', 'Sangotedo', 'Gbagada',
  'Ogba', 'Maryland', 'Magodo', 'Ojodu', 'Berger',
];

export default function Step4Screen() {
  const router = useRouter();
  const { data, update } = useOnboardingStore();

  const canContinue =
    /^\+234[0-9]{10}$/.test(data.whatsapp_number) &&
    data.location_text.trim().length >= 3;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <OnboardingProgress current={3} />

        {/* WhatsApp section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>💬</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>How Staxz works with WhatsApp</Text>
            <Text style={styles.infoBody}>
              When a client sends an enquiry, our bot will message you on WhatsApp with the details.
              Simply reply with your price (e.g. "8000") and we handle the rest.
            </Text>
          </View>
        </View>

        <Input
          label="WhatsApp Number *"
          value={data.whatsapp_number}
          onChangeText={v => update({ whatsapp_number: v })}
          placeholder="+2348012345678"
          keyboardType="phone-pad"
          maxLength={14}
          hint="Must be a Nigerian number (+234XXXXXXXXXX) with WhatsApp active"
        />

        {/* Location section */}
        <Text style={styles.sectionTitle}>Where do you operate? *</Text>
        <Text style={styles.hint}>Clients nearby will find you first</Text>

        <LocationAutocomplete
          label="Area / Neighbourhood"
          value={data.location_text}
          onChange={v => update({ location_text: v })}
          placeholder="e.g. Lekki Phase 1, Lagos"
        />

        <Button
          title="Continue →"
          onPress={() => router.push('/(provider)/onboarding/step5')}
          disabled={!canContinue}
          style={styles.btn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.bg0 },
  container: { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  back:      { marginBottom: SPACING.md },
  backText:  { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  infoBox: {
    flexDirection: 'row', gap: SPACING.md,
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoEmoji: { fontSize: 28 },
  infoText:  { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: 4 },
  infoBody:  { fontSize: 13, color: COLORS.text1, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.xs },
  hint: { fontSize: 13, color: COLORS.text2, marginBottom: SPACING.md },
  quickLabel: { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.xs },
  areaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.lg },
  areaChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bg1,
  },
  areaChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  areaText:       { fontSize: 12, color: COLORS.text1 },
  areaTextActive: { color: COLORS.white, fontWeight: '600' },
  btn: { marginTop: SPACING.md },
});
