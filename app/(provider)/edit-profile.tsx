import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '../../src/api/providers.api';
import { useAuthStore } from '../../src/store/auth.store';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ScreenHeader, LoadingSpinner } from '../../src/components/ui';
import { LocationAutocomplete } from '../../src/components/shared/LocationAutocomplete';
import { getErrorMessage } from '../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../src/constants';

export default function EditProfileScreen() {
  const router = useRouter();
  const qc     = useQueryClient();
  const { user } = useAuthStore();

  const { data: liveStatus, isLoading } = useQuery({
    queryKey: ['provider-live-status'],
    queryFn:  () => providersApi.getLiveStatus().then((r: any) => r.data.data),
  });

  // We need the provider object — fetch it via the provider's own endpoint
  const { data: providerData } = useQuery({
    queryKey: ['my-provider-detail'],
    queryFn:  () => providersApi.list().then((r: any) => {
      // find the provider belonging to this user
      return r.data.data?.find((p: any) => p.user_id === user?.id) ?? null;
    }),
  });

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio]                   = useState('');
  const [locationText, setLocationText] = useState('');
  const [baseFee, setBaseFee]           = useState('');
  const [whatsapp, setWhatsapp]         = useState('');

  useEffect(() => {
    if (providerData) {
      setBusinessName(providerData.business_name ?? '');
      setBio(providerData.bio ?? '');
      setLocationText(providerData.location_text ?? '');
      setBaseFee(providerData.base_fee_kobo ? String(providerData.base_fee_kobo / 100) : '');
      setWhatsapp(providerData.whatsapp_number ?? '');
    }
  }, [providerData]);

  const update = useMutation({
    mutationFn: () => providersApi.update(providerData!.id, {
      business_name:   businessName,
      bio:             bio || undefined,
      location_text:   locationText,
      base_fee_kobo:   Math.round(parseFloat(baseFee) * 100),
      whatsapp_number: whatsapp,
    } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-provider-detail'] });
      qc.invalidateQueries({ queryKey: ['provider-live-status'] });
      Alert.alert('✅ Profile Updated', '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  const canSave =
    businessName.trim().length >= 2 &&
    /^\+234[0-9]{10}$/.test(whatsapp) &&
    locationText.trim().length >= 3 &&
    parseFloat(baseFee) >= 100;

  if (isLoading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Profile" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Business Name *"
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Your business name"
          maxLength={120}
        />

        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell clients about your work..."
          multiline
          numberOfLines={3}
          maxLength={500}
          hint={`${bio.length}/500`}
        />

        <LocationAutocomplete
          label="Location *"
          value={locationText}
          onChange={setLocationText}
          placeholder="e.g. Lekki Phase 1, Lagos"
        />

        <Input
          label="WhatsApp Number *"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="+2348012345678"
          keyboardType="phone-pad"
          maxLength={14}
          hint="Clients contact you here after booking"
        />

        <Input
          label="Base Fee (₦) *"
          value={baseFee}
          onChangeText={v => setBaseFee(v.replace(/[^0-9.]/g, ''))}
          placeholder="e.g. 3500"
          keyboardType="decimal-pad"
          hint="Minimum ₦100"
          error={baseFee && parseFloat(baseFee) < 100 ? 'Minimum base fee is ₦100' : undefined}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 To update your service categories, bank details, or CAC number please contact support.
          </Text>
        </View>

        <Button
          title={update.isPending ? 'Saving...' : 'Save Changes'}
          onPress={() => update.mutate()}
          loading={update.isPending}
          disabled={!canSave}
          style={styles.btn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: COLORS.bg0 },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  infoBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoText: { fontSize: 13, color: COLORS.text1, lineHeight: 18 },
  btn: { marginTop: SPACING.sm },
});
