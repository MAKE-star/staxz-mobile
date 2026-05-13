import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../../src/constants';

const ROLES = [
  {
    id: 'hirer',
    emoji: '🌟',
    title: 'I\'m a Client',
    description: 'Book beauty & grooming services near you',
  },
  {
    id: 'provider',
    emoji: '💼',
    title: 'I\'m a Provider',
    description: 'Offer your beauty & grooming services',
  },
];

export default function RoleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'provider') router.replace('/(provider)/onboarding/step1');
    else                         router.replace('/(hirer)/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How will you use Staxz?</Text>
      <Text style={styles.subtitle}>You can change this later in settings.</Text>

      {ROLES.map(role => (
        <TouchableOpacity
          key={role.id}
          onPress={() => setSelected(role.id)}
          activeOpacity={0.85}
          style={[styles.card, selected === role.id && styles.cardSelected]}
        >
          <Text style={styles.emoji}>{role.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={[styles.roleTitle, selected === role.id && styles.roleTitleSelected]}>
              {role.title}
            </Text>
            <Text style={styles.roleDesc}>{role.description}</Text>
          </View>
          <View style={[styles.radio, selected === role.id && styles.radioSelected]}>
            {selected === role.id && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={handleContinue}
        disabled={!selected}
        style={[styles.btn, !selected && styles.btnDisabled]}
      >
        <Text style={styles.btnText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.bg0,
    padding: SPACING.lg, paddingTop: 80,
  },
  title:    { fontSize: 26, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.sm },
  subtitle: { fontSize: 15, color: COLORS.text1, marginBottom: SPACING.xl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  emoji:    { fontSize: 32 },
  cardText: { flex: 1 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  roleTitleSelected: { color: COLORS.primary },
  roleDesc:  { fontSize: 13, color: COLORS.text1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  btn: {
    marginTop: SPACING.xl, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, padding: 16, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
