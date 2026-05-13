import { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input }  from '../../src/components/ui/Input';
import { authApi } from '../../src/api/auth.api';
import { getErrorMessage } from '../../src/api/client';
import { COLORS, SPACING } from '../../src/constants';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('+234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    if (!/^\+234[0-9]{10}$/.test(phone)) {
      setError('Enter a valid Nigerian number: +234XXXXXXXXXX');
      return;
    }

    setLoading(true);
    try {
      await authApi.requestOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <Text style={styles.title}>Welcome to Staxz</Text>
        <Text style={styles.subtitle}>
          Nigeria's beauty & grooming marketplace.{'\n'}Enter your phone number to get started.
        </Text>

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+2348012345678"
          error={error}
          autoFocus
          maxLength={14}
        />

        <Button
          title="Send OTP"
          onPress={handleContinue}
          loading={loading}
          style={styles.btn}
        />

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg0 },
  container: {
    flexGrow: 1, padding: SPACING.lg,
    justifyContent: 'center', paddingTop: 80,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary, shadowOpacity: 0.3,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  title:    { fontSize: 26, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.sm },
  subtitle: { fontSize: 15, color: COLORS.text1, lineHeight: 22, marginBottom: SPACING.xl },
  btn:      { marginTop: SPACING.sm },
  terms:    { fontSize: 12, color: COLORS.text2, textAlign: 'center', marginTop: SPACING.lg, lineHeight: 18 },
});
