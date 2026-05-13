import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../../src/api/bookings.api';
import { Booking, BookingStatus } from '../../../src/types';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, LoadingSpinner, EmptyState } from '../../../src/components/ui';

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  pending_payment: { label: 'Awaiting Payment', variant: 'warning' },
  confirmed:       { label: 'Confirmed',         variant: 'info'    },
  in_progress:     { label: 'In Progress',        variant: 'info'    },
  completed:       { label: 'Completed',          variant: 'success' },
  disputed:        { label: 'Disputed',           variant: 'danger'  },
  cancelled:       { label: 'Cancelled',          variant: 'default' },
  refunded:        { label: 'Refunded',           variant: 'default' },
};

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const router  = useRouter();
  const [tab, setTab] = useState('All');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.list().then(r => r.data.data),
  });

  const filtered = (data ?? []).filter(b => {
    if (tab === 'Active')    return ['confirmed', 'in_progress', 'pending_payment'].includes(b.status);
    if (tab === 'Completed') return b.status === 'completed';
    if (tab === 'Cancelled') return ['cancelled', 'refunded'].includes(b.status);
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState emoji="📋" title="No bookings yet" body="Your bookings will appear here" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(hirer)/booking/${item.id}`)}
              activeOpacity={0.9}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.ref}>{item.reference}</Text>
                  <Text style={styles.provider}>{item.provider_name ?? 'Provider'}</Text>
                </View>
                <Badge
                  label={STATUS_CONFIG[item.status]?.label ?? item.status}
                  variant={STATUS_CONFIG[item.status]?.variant ?? 'default'}
                />
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.amount}>₦{(item.total_charged_kobo / 100).toLocaleString()}</Text>
                <Text style={styles.date}>
                  {item.scheduled_at
                    ? new Date(item.scheduled_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                    : new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                  }
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56 },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.md },
  tabBtn: {
    flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
    alignItems: 'center', backgroundColor: COLORS.bg2,
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText:      { fontSize: 12, color: COLORS.text1, fontWeight: '500' },
  tabTextActive: { color: COLORS.white, fontWeight: '700' },
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  ref:        { fontSize: 13, color: COLORS.text2, fontWeight: '600', marginBottom: 2 },
  provider:   { fontSize: 15, fontWeight: '700', color: COLORS.text0 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  date:   { fontSize: 12, color: COLORS.text2 },
});
