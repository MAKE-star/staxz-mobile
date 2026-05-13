import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { providersApi } from '../../../src/api/providers.api';
import { bookingsApi } from '../../../src/api/bookings.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, StarRating, LoadingSpinner } from '../../../src/components/ui';

export default function ProviderDashboard() {
  const router = useRouter();
  const user   = useAuthStore(s => s.user);

  const { data: earnings, isLoading: earningsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn:  () => providersApi.getEarnings().then((r: any) => r.data.data),
  });

  const { data: liveStatus } = useQuery({
    queryKey: ['provider-live'],
    queryFn:  () => providersApi.getLiveStatus().then((r: any) => r.data.data),
  });

  const { data: bookings } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn:  () => bookingsApi.list().then(r => r.data.data),
  });

  const activeBookings = (bookings ?? []).filter(b =>
    ['confirmed', 'in_progress'].includes(b.status)
  );

  if (earningsLoading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name}>{user?.full_name ?? 'Provider'}</Text>
        </View>
        <View style={[styles.liveIndicator, liveStatus?.isLive ? styles.live : styles.offline]}>
          <Text style={styles.liveText}>{liveStatus?.isLive ? '🟢 Live' : '🔴 Offline'}</Text>
        </View>
      </View>

      {/* Go-live prompt */}
      {!liveStatus?.isLive && liveStatus?.missingCategories?.length > 0 && (
        <TouchableOpacity
          style={styles.goLiveBanner}
          onPress={() => router.push('/(provider)/onboarding/portfolio')}
        >
          <Text style={styles.goLiveTitle}>📸 Almost there!</Text>
          <Text style={styles.goLiveBody}>
            Upload 3 photos for each service to go live:{' '}
            {liveStatus.missingCategories.slice(0, 2).join(', ')}
            {liveStatus.missingCategories.length > 2 ? ` +${liveStatus.missingCategories.length - 2} more` : ''}
          </Text>
          <Text style={styles.goLiveLink}>Upload photos →</Text>
        </TouchableOpacity>
      )}

      {/* Earnings summary */}
      <View style={styles.earningsCard}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <Text style={styles.earningsBig}>₦{((earnings?.thisMonthKobo ?? 0) / 100).toLocaleString()}</Text>

        <View style={styles.earningsRow}>
          <EarningsStat
            label="Available"
            value={`₦${((earnings?.completedKobo ?? 0) / 100).toLocaleString()}`}
            color={COLORS.green}
          />
          <EarningsStat
            label="In Escrow"
            value={`₦${((earnings?.pendingEscrowKobo ?? 0) / 100).toLocaleString()}`}
            color={COLORS.amber}
          />
          <EarningsStat
            label="Bookings"
            value={String(earnings?.bookingCount ?? 0)}
            color={COLORS.primary}
          />
        </View>

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => router.push('/(provider)/(tabs)/earnings')}
        >
          <Text style={styles.withdrawText}>Withdraw Earnings →</Text>
        </TouchableOpacity>
      </View>

      {/* Active bookings */}
      <Text style={styles.sectionTitle}>Active Bookings</Text>
      {activeBookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active bookings right now</Text>
        </View>
      ) : (
        activeBookings.slice(0, 3).map(b => (
          <TouchableOpacity
            key={b.id}
            style={styles.bookingCard}
            onPress={() => router.push(`/(hirer)/booking/${b.id}`)}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.bookingRef}>{b.reference}</Text>
              <Text style={styles.bookingHirer}>{b.hirer_name ?? 'Client'}</Text>
            </View>
            <View style={styles.bookingRight}>
              <Text style={styles.bookingAmount}>₦{(b.provider_quote_kobo / 100).toLocaleString()}</Text>
              <Badge label={b.status === 'confirmed' ? 'Confirmed' : 'In Progress'} variant="info" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const EarningsStat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.earningsStat}>
    <Text style={[styles.earningsStatValue, { color }]}>{value}</Text>
    <Text style={styles.earningsStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: SPACING.lg,
  },
  greeting:   { fontSize: 14, color: COLORS.text1 },
  name:       { fontSize: 22, fontWeight: '800', color: COLORS.text0 },
  liveIndicator: {
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  live:      { borderColor: COLORS.green,  backgroundColor: COLORS.greenLo },
  offline:   { borderColor: COLORS.border, backgroundColor: COLORS.bg2 },
  liveText:  { fontSize: 12, fontWeight: '700' },
  goLiveBanner: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  goLiveTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: 4 },
  goLiveBody:  { fontSize: 13, color: COLORS.text1, lineHeight: 18, marginBottom: 4 },
  goLiveLink:  { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  earningsCard: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.lg,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  earningsBig:  { fontSize: 36, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  earningsRow:  { flexDirection: 'row', marginBottom: SPACING.md },
  earningsStat: { flex: 1, alignItems: 'center' },
  earningsStatValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  earningsStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center',
  },
  withdrawText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  emptyBox: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    padding: SPACING.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  emptyText: { fontSize: 14, color: COLORS.text2 },
  bookingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bookingRef:    { fontSize: 12, color: COLORS.text2, marginBottom: 2 },
  bookingHirer:  { fontSize: 15, fontWeight: '700', color: COLORS.text0 },
  bookingRight:  { alignItems: 'flex-end', gap: 4 },
  bookingAmount: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
});
