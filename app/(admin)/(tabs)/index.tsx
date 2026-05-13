import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { LoadingSpinner } from '../../../src/components/ui';

export default function AdminDashboard() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const {
    bookingsByStatus = {},
    platformRevenue = 0,
    openDisputes = 0,
    newUsers30d = 0,
  } = data ?? {};

  const totalBookings = Object.values(bookingsByStatus as Record<string, number>).reduce((a, b) => a + b, 0);
  const completedBookings = (bookingsByStatus as any).completed ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Platform overview</Text>

      {/* Key metrics */}
      <View style={styles.statsGrid}>
        <StatCard emoji="💰" label="Platform Revenue" value={`₦${(platformRevenue / 100).toLocaleString()}`} color={COLORS.green} />
        <StatCard emoji="⚠️" label="Open Disputes"  value={String(openDisputes)}  color={openDisputes > 0 ? COLORS.red : COLORS.green} />
        <StatCard emoji="👥" label="New Users (30d)" value={String(newUsers30d)}  color={COLORS.primary} />
        <StatCard emoji="📋" label="Total Bookings"  value={String(totalBookings)} color={COLORS.primary} />
      </View>

      {/* Bookings by status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bookings by Status</Text>
        {Object.entries(bookingsByStatus as Record<string, number>).map(([status, count]) => (
          <View key={status} style={styles.statusRow}>
            <Text style={styles.statusLabel}>{status.replace(/_/g, ' ')}</Text>
            <View style={styles.statusBar}>
              <View style={[
                styles.statusFill,
                { width: `${totalBookings > 0 ? (count / totalBookings) * 100 : 0}%` },
              ]} />
            </View>
            <Text style={styles.statusCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Completion rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <Text style={styles.bigStat}>
          {totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0}%
        </Text>
        <Text style={styles.bigStatSub}>{completedBookings} of {totalBookings} bookings completed</Text>
      </View>
    </ScrollView>
  );
}

const StatCard = ({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  title:     { fontSize: 24, fontWeight: '800', color: COLORS.text0 },
  subtitle:  { fontSize: 14, color: COLORS.text1, marginBottom: SPACING.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    width: '47%', backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  statEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.text1, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  statusLabel: { fontSize: 12, color: COLORS.text1, width: 110, textTransform: 'capitalize' },
  statusBar: { flex: 1, height: 6, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden' },
  statusFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  statusCount: { fontSize: 12, fontWeight: '700', color: COLORS.text0, width: 30, textAlign: 'right' },
  bigStat:    { fontSize: 48, fontWeight: '800', color: COLORS.primary },
  bigStatSub: { fontSize: 13, color: COLORS.text1 },
});
