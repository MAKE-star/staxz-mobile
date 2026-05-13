import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../src/constants';

export default function OtpScreen() {
  const router  = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setTokens } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setResendTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) handleVerify(next.join(''));
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, fullCode);
      const { accessToken, refreshToken, isNewUser } = res.data.data;
      await setTokens(accessToken, refreshToken);

      if (isNewUser) {
        router.replace('/(auth)/role');
      } else {
        const me = await authApi.me();
        const user = me.data.data;
        if      (user.role === 'admin')    router.replace('/(admin)/(tabs)');
        else if (user.role === 'provider') router.replace('/(provider)/(tabs)');
        else                               router.replace('/(hirer)/(tabs)');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authApi.requestOtp(phone);
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←  Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}<Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { if (el) inputs.current[i] = el; }}
              style={[styles.box, digit && styles.boxFilled, error && styles.boxError]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={loading ? 'Verifying...' : 'Verify'}
          onPress={() => handleVerify(code.join(''))}
          loading={loading}
          disabled={code.some(d => !d)}
          style={styles.btn}
        />

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[styles.resend, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg0 },
  container: { flex: 1, padding: SPACING.lg, paddingTop: 60 },
  back:     { marginBottom: SPACING.xl },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  title:    { fontSize: 26, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.sm },
  subtitle: { fontSize: 15, color: COLORS.text1, lineHeight: 22, marginBottom: SPACING.xl },
  phone:    { fontWeight: '700', color: COLORS.text0 },
  codeRow:  { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  box: {
    flex: 1, height: 56, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.bg1,
    fontSize: 22, fontWeight: '700', color: COLORS.text0,
    textAlign: 'center',
  },
  boxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  boxError:  { borderColor: COLORS.red },
  error:    { color: COLORS.red, fontSize: 13, marginBottom: SPACING.md, textAlign: 'center' },
  btn:      { marginBottom: SPACING.lg },
  resend:   { fontSize: 14, color: COLORS.primary, textAlign: 'center', fontWeight: '600' },
  resendDisabled: { color: COLORS.text2 },
});
