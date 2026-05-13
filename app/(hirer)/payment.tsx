import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS } from '../../src/constants';

export default function PaymentScreen() {
  const router = useRouter();
  const qc     = useQueryClient();
  const { url, bookingRef } = useLocalSearchParams<{ url: string; bookingRef: string }>();

  const [loading, setLoading]   = useState(true);
  const [success, setSuccess]   = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleNavigationChange = (navState: { url: string }) => {
    const u = navState.url.toLowerCase();

    // Paystack redirects to callback_url on success
    if (u.includes('payment/verify') || u.includes('callback') || u.includes('success')) {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setTimeout(() => {
        router.replace('/(hirer)/(tabs)/bookings');
      }, 1500);
    }

    // User clicked "cancel" or "go back" on Paystack page
    if (u.includes('cancel') || u.includes('close')) {
      setCancelled(true);
    }
  };

  if (success) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>🎉</Text>
        <Text style={styles.resultTitle}>Payment Successful!</Text>
        <Text style={styles.resultSub}>Booking {bookingRef} is confirmed.</Text>
        <Text style={styles.resultNote}>Provider contact is now unlocked.</Text>
      </View>
    );
  }

  if (cancelled) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>😔</Text>
        <Text style={styles.resultTitle}>Payment Cancelled</Text>
        <Text style={styles.resultSub}>Your booking is still reserved for 30 minutes.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => setCancelled(false)}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.secureBadge}>
          <Text style={styles.secureText}>🔒 Secure</Text>
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      <WebView
        source={{ uri: url }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg1, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  closeBtn:    { padding: SPACING.xs },
  closeText:   { fontSize: 18, color: COLORS.text0, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0 },
  secureBadge: { backgroundColor: COLORS.greenLo, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  secureText:  { fontSize: 11, color: COLORS.green, fontWeight: '600' },
  webview:     { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg0, alignItems: 'center', justifyContent: 'center',
    zIndex: 10, gap: SPACING.md,
  },
  loadingText: { fontSize: 14, color: COLORS.text1 },
  resultScreen: {
    flex: 1, backgroundColor: COLORS.bg0,
    alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xl, gap: SPACING.md,
  },
  resultEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  resultTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text0, textAlign: 'center' },
  resultSub:   { fontSize: 15, color: COLORS.text1, textAlign: 'center' },
  resultNote:  { fontSize: 13, color: COLORS.text2, textAlign: 'center' },
  retryBtn: {
    marginTop: SPACING.lg, backgroundColor: COLORS.primary,
    paddingVertical: 14, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md,
  },
  retryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  backBtn:   { marginTop: SPACING.sm },
  backText:  { fontSize: 14, color: COLORS.text2 },
});
