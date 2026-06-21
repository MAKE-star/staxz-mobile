import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api('/admin/dashboard', { token }),
  });

  const d = data?.data;

  const doLogout = async () => { await logout(); router.replace('/(auth)/phone'); };

  const StatCard = ({ label, value, color, emoji }: any) => (
    <View style={{ width: '47%', backgroundColor: C.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
      <Text style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.text2, marginTop: 4 }}>{label}</Text>
    </View>
  );

  const bookings = d?.bookingsByStatus ?? {};
  const totalBookings = Object.values(bookings).reduce((a: any, b: any) => a + b, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}>

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text style={{ fontSize: 13, color: C.text2 }}>Admin Panel</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: C.text0 }}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={doLogout} style={{ backgroundColor: C.redLo, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 }}>
          <Text style={{ fontSize: 12, color: C.red, fontWeight: '600' }}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ paddingHorizontal: 24 }}>

          {/* Revenue highlight */}
          <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 24, marginBottom: 20 }}>
            <Text style={{ fontSize: 13, color: '#E8E2F0', marginBottom: 4 }}>Platform Revenue (All time)</Text>
            <Text style={{ fontSize: 36, fontWeight: '800', color: C.white }}>
              ₦{((d?.platformRevenue ?? 0) / 100).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: '#E8E2F0', marginTop: 8 }}>15% of all completed bookings</Text>
          </View>

          {/* Stats grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <StatCard label="Total Bookings"    value={totalBookings}          color={C.primary} emoji="📋" />
            <StatCard label="Open Disputes"     value={d?.openDisputes ?? 0}   color={C.red}     emoji="⚠️" />
            <StatCard label="New Users (30d)"   value={d?.newUsers30d ?? 0}    color={C.green}   emoji="👥" />
            <StatCard label="Completed"         value={bookings.completed ?? 0} color={C.green}  emoji="✅" />
          </View>

          {/* Booking breakdown */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text0, marginBottom: 12 }}>Bookings by Status</Text>
          <View style={{ backgroundColor: C.bg1, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 20, overflow: 'hidden' }}>
            {Object.entries(bookings).length === 0 ? (
              <Text style={{ padding: 16, color: C.text2, textAlign: 'center' }}>No bookings yet</Text>
            ) : (
              Object.entries(bookings).map(([status, count]: any, i, arr) => (
                <View key={status} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: i < arr.length - 1 ? 0.5 : 0, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: 14, color: C.text0, textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</Text>
                  <View style={{ backgroundColor: C.primary + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary }}>{count}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Quick actions */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text0, marginBottom: 12 }}>Quick Actions</Text>
          <View style={{ gap: 10, marginBottom: 40 }}>
            {[
              { label: 'Review Open Disputes', emoji: '⚠️', color: C.red, onPress: () => {} },
              { label: 'Manage Users', emoji: '👥', color: C.primary, onPress: () => {} },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={a.onPress}
                style={{ backgroundColor: C.bg1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.text0, flex: 1 }}>{a.label}</Text>
                <Text style={{ color: a.color, fontWeight: '700' }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
