import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants';

const STEPS = ['Business', 'Services', 'Portfolio', 'WhatsApp', 'Bank'];

export const OnboardingProgress = ({ current }: { current: number }) => (
  <View style={styles.container}>
    <View style={styles.bar}>
      {STEPS.map((label, i) => (
        <View key={i} style={styles.stepWrap}>
          <View style={[
            styles.dot,
            i < current  && styles.dotDone,
            i === current && styles.dotActive,
          ]}>
            {i < current
              ? <Text style={styles.check}>✓</Text>
              : <Text style={[styles.num, i === current && styles.numActive]}>{i + 1}</Text>
            }
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.line, i < current && styles.lineDone]} />
          )}
        </View>
      ))}
    </View>
    <Text style={styles.label}>
      Step {current + 1} of {STEPS.length} — <Text style={styles.bold}>{STEPS[current]}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  stepWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.bg3, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dotDone:   { backgroundColor: COLORS.green,   borderColor: COLORS.green },
  check: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  num:   { color: COLORS.text2, fontSize: 12, fontWeight: '700' },
  numActive: { color: COLORS.white },
  line: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 2 },
  lineDone: { backgroundColor: COLORS.green },
  label: { fontSize: 13, color: COLORS.text1 },
  bold:  { fontWeight: '700', color: COLORS.text0 },
});
