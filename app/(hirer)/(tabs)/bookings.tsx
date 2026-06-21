import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';

const STATUS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Awaiting Payment', color: C.amber },
  confirmed:       { label: 'Confirmed',         color: C.primary },
  in_progress:     { label: 'In Progress',        color: C.primary },
  completed:       { label: 'Completed',          color: C.green },
  disputed:        { label: 'Disputed',           color: C.red },
  cancelled:       { label: 'Cancelled',          color: C.text3 },
  refunded:        { label: 'Refunded',           color: C.text3 },
};

export default function BookingsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api('/bookings', { token }),
  });

  const bookings = data?.data ?? [];

  if (isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, padding: 16, paddingTop: 56 }}>My Bookings</Text>
      <FlatList data={bookings} keyExtractor={(b: any) => b.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}><Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text><Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>No bookings yet</Text></View>}
        renderItem={({ item: b }: any) => {
          const s = STATUS[b.status] ?? { label: b.status, color: C.text3 };
          return (
            <TouchableOpacity onPress={() => router.push(`/(hirer)/booking/${b.id}`)}
              style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: C.text3, fontWeight: '600' }}>{b.reference}</Text>
                <View style={{ backgroundColor: s.color + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: s.color }}>{s.label}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 }}>{b.provider_name ?? 'Provider'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>₦{(b.total_charged_kobo/100).toLocaleString()}</Text>
                <Text style={{ fontSize: 12, color: C.text3 }}>{new Date(b.created_at).toLocaleDateString('en-NG')}</Text>
              </View>
            </TouchableOpacity>
          );
        }} />
    </View>
  );
}
