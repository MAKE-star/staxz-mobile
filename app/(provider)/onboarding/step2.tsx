import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../src/store/onboarding.store';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { OnboardingProgress } from '../../../src/components/shared/OnboardingProgress';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';

const MODES = [
  { id: 'home',   label: '🏠 Home Service', desc: 'You travel to the client' },
  { id: 'walkin', label: '🏪 Walk-In',       desc: 'Client comes to you'      },
];

export default function Step2Screen() {
  const router = useRouter();
  const { data, update } = useOnboardingStore();

  const toggleCategory = (id: string) => {
    const cats = data.service_categories.includes(id)
      ? data.service_categories.filter(c => c !== id)
      : [...data.service_categories, id];
    update({ service_categories: cats });
  };

  const toggleMode = (id: string) => {
    const modes = data.service_modes.includes(id)
      ? data.service_modes.filter(m => m !== id)
      : [...data.service_modes, id];
    update({ service_modes: modes });
  };

  const canContinue =
    data.service_categories.length > 0 &&
    data.service_modes.length > 0 &&
    data.base_fee_kobo.trim() !== '' &&
    parseInt(data.base_fee_kobo) >= 100;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <OnboardingProgress current={1} />

        <Text style={styles.sectionTitle}>What services do you offer? *</Text>
        <Text style={styles.hint}>Select all that apply</Text>
        <View style={styles.grid}>
          {SERVICE_CATEGORIES.map(cat => {
            const active = data.service_categories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>How do you work? *</Text>
        <View style={styles.modeRow}>
          {MODES.map(m => {
            const active = data.service_modes.includes(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeCard, active && styles.modeCardActive]}
                onPress={() => toggleMode(m.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.modeLabel}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Base fee (₦) *"
          value={data.base_fee_kobo}
          onChangeText={v => update({ base_fee_kobo: v.replace(/[^0-9]/g, '') })}
          placeholder="e.g. 3500"
          keyboardType="number-pad"
          hint="Minimum ₦100. This is your starting price — you can quote higher per job."
        />

        <Button
          title="Continue →"
          onPress={() => router.push('/(provider)/onboarding/step3')}
          disabled={!canContinue}
          style={styles.btn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1, backgroundColor: COLORS.bg0 },
  container:    { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  back:         { marginBottom: SPACING.md },
  backText:     { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.xs, marginTop: SPACING.md },
  hint:         { fontSize: 13, color: COLORS.text2, marginBottom: SPACING.md },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.lg },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg1,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catEmoji:      { fontSize: 14 },
  catLabel:      { fontSize: 13, color: COLORS.text1, fontWeight: '500' },
  catLabelActive: { color: COLORS.white },
  modeRow:  { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  modeCard: {
    flex: 1, padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg1,
  },
  modeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  modeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  modeDesc:  { fontSize: 12, color: COLORS.text1 },
  btn: { marginTop: SPACING.md },
});
