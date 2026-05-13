import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { providersApi } from '../../../src/api/providers.api';
import { bookingsApi } from '../../../src/api/bookings.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';
import { ScreenHeader, Button, LoadingSpinner } from '../../../src/components/ui';

const STEPS = ['Service', 'Type', 'Details', 'Confirm'];

export default function EnquiryScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();

  const [step, setStep]         = useState(0);
  const [category, setCategory] = useState('');
  const [mode, setMode]         = useState<'home' | 'walkin' | ''>('');
  const [notes, setNotes]       = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [address, setAddress]       = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn:  () => providersApi.getById(providerId).then(r => r.data.data),
  });

  const sendEnquiry = useMutation({
    mutationFn: () => bookingsApi.createEnquiry({
      providerId,
      categoryId:  category,
      serviceType: mode as 'home' | 'walkin',
      notes:       notes || undefined,
    }),
    onSuccess: (res) => {
      Alert.alert(
        'Enquiry Sent! 🎉',
        `Your enquiry has been sent to ${provider?.business_name}. They will reply via WhatsApp within 60 minutes with a price. You will get a push notification when your quote arrives.`,
        [{ text: 'View Bookings', onPress: () => router.replace('/(hirer)/(tabs)/bookings') }]
      );
    },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  const acceptQuote = useMutation({
    mutationFn: (enquiryId: string) => {
      const scheduledAt = scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined;
      return bookingsApi.acceptQuote(enquiryId, {
        scheduled_at: scheduledAt,
        service_address: address || undefined,
      });
    },
    onSuccess: (res: any) => {
      const paymentUrl = res?.data?.data?.paymentUrl;
      const bookingRef = res?.data?.data?.booking?.reference;
      if (paymentUrl) {
        router.push({ pathname: '/(hirer)/payment', params: { url: paymentUrl, bookingRef } });
      } else {
        router.replace('/(hirer)/(tabs)/bookings');
      }
    },
    onError: (err) => Alert.alert('Payment Error', getErrorMessage(err)),
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!provider) return null;

  const availableCategories = SERVICE_CATEGORIES.filter(c =>
    provider.service_categories.includes(c.id)
  );

  const canNext = (
    (step === 0 && category) ||
    (step === 1 && mode) ||
    (step === 2) ||
    (step === 3)
  );

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <ScreenHeader
          title={`Book ${provider.business_name}`}
          subtitle={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
          onBack={step === 0 ? () => router.back() : () => setStep(s => s - 1)}
        />

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Step 0 — Choose service category */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>What service do you need?</Text>
              <View style={styles.grid}>
                {availableCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, category === cat.id && styles.catCardSelected]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, category === cat.id && styles.catLabelSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1 — Service mode */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>How would you like it done?</Text>
              {provider.service_modes.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeCard, mode === m && styles.modeCardSelected]}
                  onPress={() => setMode(m)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modeEmoji}>{m === 'home' ? '🏠' : '🏪'}</Text>
                  <View style={styles.modeInfo}>
                    <Text style={[styles.modeTitle, mode === m && styles.modeTitleSelected]}>
                      {m === 'home' ? 'Home Service' : 'Walk-In'}
                    </Text>
                    <Text style={styles.modeDesc}>
                      {m === 'home'
                        ? 'Provider comes to your location'
                        : 'Visit their salon / studio'}
                    </Text>
                  </View>
                  <View style={[styles.radio, mode === m && styles.radioSelected]}>
                    {mode === m && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
              {mode === 'home' && (
                <View style={styles.addressBox}>
                  <Text style={styles.addressLabel}>Your address</Text>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your address..."
                    placeholderTextColor={COLORS.text2}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>
              )}
            </View>
          )}

          {/* Step 2 — Notes + inspiration photo */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Any details for the provider?</Text>

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Describe what you want, e.g. 'Box braids, waist length, no extensions'"
                placeholderTextColor={COLORS.text2}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.fieldLabel}>Inspiration photo (optional)</Text>
              <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
                {photoUri ? (
                  <Text style={styles.photoSelected}>✓ Photo selected</Text>
                ) : (
                  <>
                    <Text style={styles.photoIcon}>📸</Text>
                    <Text style={styles.photoBtnText}>Add a photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Review your enquiry</Text>

              <View style={styles.summaryCard}>
                <SummaryRow label="Provider"   value={provider.business_name} />
                <SummaryRow label="Service"    value={SERVICE_CATEGORIES.find(c => c.id === category)?.label ?? category} />
                <SummaryRow label="Mode"       value={mode === 'home' ? '🏠 Home Service' : '🏪 Walk-In'} />
                {address && <SummaryRow label="Address" value={address} />}
                {notes   && <SummaryRow label="Notes"   value={notes} />}
                {photoUri && <SummaryRow label="Photo"  value="✓ Attached" />}
              </View>

              {/* Optional scheduling */}
              <Text style={styles.scheduleTitle}>Schedule (optional)</Text>
              <Text style={styles.scheduleHint}>Set a preferred date and time for the service</Text>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>Date</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.text2}
                    value={scheduledDate}
                    onChangeText={setScheduledDate}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                </View>
                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>Time</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.text2}
                    value={scheduledTime}
                    onChangeText={setScheduledTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>What happens next?</Text>
                <Text style={styles.infoText}>
                  1. Your enquiry is sent to the provider via WhatsApp{'\n'}
                  2. They'll reply with a price within 60 minutes{'\n'}
                  3. You'll get a notification with their quote{'\n'}
                  4. Accept and pay to confirm your booking
                </Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <Button
            title={step < 3 ? 'Continue →' : 'Send Enquiry'}
            onPress={() => {
              if (step < 3) setStep(s => s + 1);
              else sendEnquiry.mutate();
            }}
            loading={sendEnquiry.isPending}
            disabled={!canNext}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg0 },
  progressTrack:{ height: 3, backgroundColor: COLORS.border },
  progressFill: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  content:      { padding: SPACING.lg, paddingBottom: 100 },
  stepTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.lg },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  catCard: {
    width: '31%', aspectRatio: 1, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bg1, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
  },
  catCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  catEmoji:        { fontSize: 26 },
  catLabel:        { fontSize: 11, color: COLORS.text1, textAlign: 'center', fontWeight: '500' },
  catLabelSelected:{ color: COLORS.primary, fontWeight: '700' },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  modeCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  modeEmoji:        { fontSize: 28 },
  modeInfo:         { flex: 1 },
  modeTitle:        { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: 3 },
  modeTitleSelected:{ color: COLORS.primary },
  modeDesc:         { fontSize: 13, color: COLORS.text1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addressBox:    { marginTop: SPACING.md },
  addressLabel:  { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.xs },
  addressInput: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0, minHeight: 80,
  },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: COLORS.text1, marginBottom: SPACING.xs },
  textarea: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0,
    minHeight: 100, marginBottom: SPACING.lg, textAlignVertical: 'top',
  },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
    padding: SPACING.lg,
  },
  photoIcon:     { fontSize: 24 },
  photoBtnText:  { fontSize: 15, color: COLORS.text1, fontWeight: '500' },
  photoSelected: { fontSize: 15, color: COLORS.green, fontWeight: '600' },
  summaryCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', marginBottom: SPACING.lg,
  },
  scheduleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginTop: SPACING.lg, marginBottom: 2 },
  scheduleHint:  { fontSize: 12, color: COLORS.text2, marginBottom: SPACING.sm },
  scheduleRow:   { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  scheduleField: { flex: 1 },
  scheduleLabel: { fontSize: 12, color: COLORS.text1, marginBottom: 4, fontWeight: '500' },
  scheduleInput: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.sm, fontSize: 14, color: COLORS.text0,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryLabel: { fontSize: 14, color: COLORS.text2 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text0, flex: 1, textAlign: 'right' },
  infoBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.xs },
  infoText:  { fontSize: 13, color: COLORS.text1, lineHeight: 22 },
  footer:    { padding: SPACING.md, paddingBottom: 32, backgroundColor: COLORS.bg0, borderTopWidth: 1, borderTopColor: COLORS.border },
});
