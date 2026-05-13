import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../../src/api/bookings.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, LoadingSpinner, EmptyState } from '../../../src/components/ui';
import { BookingStatus } from '../../../src/types';

export default function ProviderBookingsScreen() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [tab, setTab] = useState('Active');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn:  () => bookingsApi.list().then(r => r.data.data),
  });

  const markComplete = useMutation({
    mutationFn: (id: string) => bookingsApi.markComplete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['provider-bookings'] }),
    onError:    e  => Alert.alert('Error', getErrorMessage(e)),
  });

  const filtered = (data ?? []).filter(b => {
    if (tab === 'Active')    return ['confirmed', 'in_progress', 'pending_payment'].includes(b.status);
    if (tab === 'Completed') return b.status === 'completed';
    if (tab === 'Disputed')  return b.status === 'disputed';
    return true;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>

      <View style={styles.tabs}>
        {['Active', 'Completed', 'Disputed', 'All'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState emoji="📋" title="No bookings" body="Your bookings will appear here" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(hirer)/booking/${item.id}`)}
            activeOpacity={0.9}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.ref}>{item.reference}</Text>
                <Text style={styles.client}>{item.hirer_name ?? 'Client'}</Text>
                <Text style={styles.mode}>{item.service_type === 'home' ? '🏠 Home Service' : '🏪 Walk-In'}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>₦{(item.provider_quote_kobo / 100).toLocaleString()}</Text>
                <Badge label={item.status.replace('_', ' ')} variant={
                  item.status === 'completed' ? 'success' :
                  item.status === 'disputed'  ? 'danger'  :
                  item.status === 'confirmed' ? 'info'    : 'default'
                } />
              </View>
            </View>

            {item.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => Alert.alert(
                  'Mark Complete',
                  'Confirm you have completed this service? The client will be notified to confirm.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Mark Complete', onPress: () => markComplete.mutate(item.id) },
                  ]
                )}
              >
                <Text style={styles.completeBtnText}>✓ Mark as Complete</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title:  { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56 },
  tabs:   { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.md },
  tab:    { flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, alignItems: 'center', backgroundColor: COLORS.bg2 },
  tabActive:    { backgroundColor: COLORS.primary },
  tabText:      { fontSize: 11, color: COLORS.text1, fontWeight: '500' },
  tabTextActive:{ color: COLORS.white, fontWeight: '700' },
  list:   { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  ref:        { fontSize: 12, color: COLORS.text2, marginBottom: 2 },
  client:     { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  mode:       { fontSize: 12, color: COLORS.text1 },
  right:      { alignItems: 'flex-end', gap: 4 },
  amount:     { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  completeBtn:{
    backgroundColor: COLORS.greenLo, borderRadius: RADIUS.sm,
    padding: SPACING.sm, alignItems: 'center',
  },
  completeBtnText: { fontSize: 13, color: COLORS.green, fontWeight: '700' },
});
