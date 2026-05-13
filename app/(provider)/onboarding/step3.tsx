import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useOnboardingStore } from '../../../src/store/onboarding.store';
import { Button } from '../../../src/components/ui/Button';
import { OnboardingProgress } from '../../../src/components/shared/OnboardingProgress';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';

// Portfolio is uploaded AFTER onboarding via the portfolio screen
// This step explains the requirement and lets them skip to continue

export default function Step3Screen() {
  const router = useRouter();
  const { data } = useOnboardingStore();

  const selectedCats = SERVICE_CATEGORIES.filter(c =>
    data.service_categories.includes(c.id)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <OnboardingProgress current={2} />

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>📸</Text>
        <Text style={styles.heroTitle}>Portfolio Photos</Text>
        <Text style={styles.heroBody}>
          You need at least <Text style={styles.bold}>3 photos per service category</Text> to go live.
          You can complete your profile now and upload photos after.
        </Text>
      </View>

      <View style={styles.requirementBox}>
        <Text style={styles.reqTitle}>Your selected categories:</Text>
        {selectedCats.map(cat => (
          <View key={cat.id} style={styles.reqRow}>
            <Text style={styles.reqEmoji}>{cat.emoji}</Text>
            <Text style={styles.reqLabel}>{cat.label}</Text>
            <View style={styles.reqBadge}>
              <Text style={styles.reqBadgeText}>3 photos needed</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Pro tips</Text>
        <Text style={styles.tip}>• Use good lighting — natural light works best</Text>
        <Text style={styles.tip}>• Show before & after results</Text>
        <Text style={styles.tip}>• Photos must be of your own work</Text>
        <Text style={styles.tip}>• Clear, high-quality images get more bookings</Text>
      </View>

      <Button
        title="Got it, continue →"
        onPress={() => router.push('/(provider)/onboarding/step4')}
        style={styles.btn}
      />

      <Text style={styles.note}>
        You can upload photos from your provider dashboard after completing setup.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  back:      { marginBottom: SPACING.md },
  backText:  { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  hero: { alignItems: 'center', padding: SPACING.xl, marginBottom: SPACING.md },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.md },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.sm, textAlign: 'center' },
  heroBody:  { fontSize: 15, color: COLORS.text1, textAlign: 'center', lineHeight: 22 },
  bold:      { fontWeight: '700', color: COLORS.text0 },
  requirementBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reqTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.sm },
  reqRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  reqEmoji: { fontSize: 16 },
  reqLabel: { flex: 1, fontSize: 14, color: COLORS.text0 },
  reqBadge: { backgroundColor: COLORS.amberLo, paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: RADIUS.sm },
  reqBadgeText: { fontSize: 11, color: COLORS.amber, fontWeight: '600' },
  tipBox: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.xs },
  tip: { fontSize: 13, color: COLORS.text1, marginBottom: 4, lineHeight: 20 },
  btn:  { marginBottom: SPACING.md },
  note: { fontSize: 12, color: COLORS.text2, textAlign: 'center', lineHeight: 18 },
});
