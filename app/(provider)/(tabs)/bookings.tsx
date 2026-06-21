import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function ProviderBookings() {
  const { token } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['provider-bookings'], queryFn: () => api('/bookings', { token }) });
  const bookings = data?.data ?? [];
  if (isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, padding: 16, paddingTop: 56 }}>Bookings</Text>
      <FlatList data={bookings} keyExtractor={(b: any) => b.id} contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}><Text style={{ fontSize: 40 }}>📋</Text><Text style={{ fontSize: 18, fontWeight: '700', color: C.text, marginTop: 12 }}>No bookings yet</Text></View>}
        renderItem={({ item: b }: any) => (
          <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: C.text3, fontWeight: '600' }}>{b.reference}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: C.green }}>₦{(b.provider_quote_kobo/100).toLocaleString()}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{b.hirer_name ?? 'Client'}</Text>
            <Text style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{b.status.replace(/_/g,' ')}</Text>
          </View>
        )} />
    </View>
  );
}
