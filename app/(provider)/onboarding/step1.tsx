import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../src/store/onboarding.store';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { OnboardingProgress } from '../../../src/components/shared/OnboardingProgress';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';

const BUSINESS_TYPES = [
  { id: 'salon',       label: '🏪 Salon / Studio',      desc: 'You operate from a fixed location' },
  { id: 'independent', label: '🚀 Independent',          desc: 'You work solo or mobile' },
];

export default function Step1Screen() {
  const router = useRouter();
  const { data, update } = useOnboardingStore();

  const canContinue = data.business_name.trim().length >= 2 && data.business_type !== '';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>Tell clients about your business.</Text>

        <OnboardingProgress current={0} />

        <View style={styles.form}>
          <Input
            label="Business Name *"
            value={data.business_name}
            onChangeText={v => update({ business_name: v })}
            placeholder="e.g. Supreme Cuts, Glow by Ada"
            maxLength={120}
          />

          <Text style={styles.label}>Business Type *</Text>
          {BUSINESS_TYPES.map(bt => (
            <TouchableOpacity
              key={bt.id}
              style={[styles.typeCard, data.business_type === bt.id && styles.typeCardActive]}
              onPress={() => update({ business_type: bt.id as any })}
              activeOpacity={0.85}
            >
              <Text style={styles.typeLabel}>{bt.label}</Text>
              <Text style={styles.typeDesc}>{bt.desc}</Text>
              <View style={[styles.radio, data.business_type === bt.id && styles.radioActive]}>
                {data.business_type === bt.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <Input
            label="CAC Number (optional)"
            value={data.cac_number}
            onChangeText={v => update({ cac_number: v })}
            placeholder="RC-1234567 or BN-1234567"
            hint="Get a Verified ✓ badge — adds trust with clients"
            maxLength={20}
            autoCapitalize="characters"
          />

          <Input
            label="Bio (optional)"
            value={data.bio}
            onChangeText={v => update({ bio: v })}
            placeholder="Tell clients what makes you special..."
            multiline
            numberOfLines={3}
            maxLength={500}
            hint={`${data.bio.length}/500 characters`}
          />

          <Input
            label="Years of Experience (optional)"
            value={data.years_experience}
            onChangeText={v => update({ years_experience: v })}
            placeholder="e.g. 5"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <Button
          title="Continue →"
          onPress={() => router.push('/(provider)/onboarding/step2')}
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
  title:     { fontSize: 24, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.xs },
  subtitle:  { fontSize: 15, color: COLORS.text1, marginBottom: SPACING.sm },
  form:      { marginTop: SPACING.md },
  label:     { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.sm },
  typeCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
  },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  typeLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text0, flex: 1 },
  typeDesc:  { fontSize: 12, color: COLORS.text1, width: '100%', marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  btn: { marginTop: SPACING.lg },
});
