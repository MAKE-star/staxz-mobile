import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { LoadingSpinner } from '../../../src/components/ui';

export default function AnalyticsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const {
    completionRate = 0, responseRate = 0, disputeRate = 0,
    escrowReleaseRate = 0, gmvKobo = 0, escrowBalanceKobo = 0,
    revenueBreakdown = {}, topProviders = [],
  } = data ?? {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <Text style={styles.title}>Analytics</Text>

      {/* GMV + Escrow */}
      <View style={styles.row}>
        <View style={[styles.bigCard, { flex: 1 }]}>
          <Text style={styles.bigCardLabel}>Total GMV</Text>
          <Text style={styles.bigCardValue}>₦{(gmvKobo / 100).toLocaleString()}</Text>
        </View>
        <View style={[styles.bigCard, { flex: 1 }]}>
          <Text style={styles.bigCardLabel}>Escrow Balance</Text>
          <Text style={[styles.bigCardValue, { color: COLORS.amber }]}>
            ₦{(escrowBalanceKobo / 100).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Rate metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Health</Text>
        <RateRow label="Booking Completion"  rate={completionRate}   color={COLORS.green}   />
        <RateRow label="Provider Response"   rate={responseRate}     color={COLORS.primary} />
        <RateRow label="Escrow Release"      rate={escrowReleaseRate} color={COLORS.green}  />
        <RateRow label="Dispute Rate"        rate={disputeRate}      color={COLORS.red}     invert />
      </View>

      {/* Revenue breakdown */}
      {Object.keys(revenueBreakdown).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Category</Text>
          {Object.entries(revenueBreakdown as Record<string, number>).map(([cat, amount]) => (
            <View key={cat} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{cat}</Text>
              <Text style={styles.breakdownValue}>₦{(amount / 100).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Top providers */}
      {topProviders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Providers</Text>
          {(topProviders as any[]).map((p, i) => (
            <View key={p.id} style={styles.providerRow}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p.business_name}</Text>
                <Text style={styles.providerStat}>{p.booking_count} bookings</Text>
              </View>
              <Text style={styles.providerRevenue}>₦{(p.revenue_kobo / 100).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const RateRow = ({ label, rate, color, invert }: { label: string; rate: number; color: string; invert?: boolean }) => {
  const pct = Math.round(rate * 100);
  const isGood = invert ? pct < 10 : pct > 70;
  return (
    <View style={styles.rateRow}>
      <Text style={styles.rateLabel}>{label}</Text>
      <View style={styles.rateBarBg}>
        <View style={[styles.rateBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.ratePct, { color: isGood ? COLORS.green : COLORS.amber }]}>{pct}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  title:     { fontSize: 24, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.lg },
  row:       { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  bigCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  bigCardLabel: { fontSize: 12, color: COLORS.text1, marginBottom: 4 },
  bigCardValue: { fontSize: 20, fontWeight: '800', color: COLORS.green },
  section: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  rateRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  rateLabel: { fontSize: 13, color: COLORS.text1, width: 140 },
  rateBarBg: { flex: 1, height: 8, backgroundColor: COLORS.bg3, borderRadius: 4, overflow: 'hidden' },
  rateBarFill: { height: '100%', borderRadius: 4 },
  ratePct:   { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  breakdownLabel: { fontSize: 13, color: COLORS.text1, textTransform: 'capitalize' },
  breakdownValue: { fontSize: 13, fontWeight: '700', color: COLORS.text0 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.xs, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  rank:         { fontSize: 16, fontWeight: '800', color: COLORS.primary, width: 28 },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 14, fontWeight: '700', color: COLORS.text0 },
  providerStat: { fontSize: 11, color: COLORS.text1 },
  providerRevenue: { fontSize: 14, fontWeight: '700', color: COLORS.green },
});
