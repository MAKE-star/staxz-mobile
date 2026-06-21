import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';

export default function ProviderDashboard() {
  const { token, user, logout } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn: () => api('/providers/me/earnings', { token }),
    retry: false,
  });

  const e = data?.data;

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/phone');
  };

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );

  if (isError) return (
    <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0, marginBottom: 8, textAlign: 'center' }}>
        Provider profile not found
      </Text>
      <Text style={{ fontSize: 14, color: C.text2, textAlign: 'center', marginBottom: 24 }}>
        Your onboarding may not have completed. Please sign up again as a provider.
      </Text>
      <TouchableOpacity onPress={doLogout}
        style={{ backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
        <Text style={{ color: C.white, fontWeight: '700' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}>

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
        <Text style={{ fontSize: 13, color: C.text2 }}>Welcome back 👋</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text0 }}>Dashboard</Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {/* Earnings highlight */}
        <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: '#E8E2F0', marginBottom: 4 }}>Available Balance</Text>
          <Text style={{ fontSize: 36, fontWeight: '800', color: C.white }}>
            ₦{((e?.completedKobo ?? 0) / 100).toLocaleString()}
          </Text>
          <Text style={{ fontSize: 12, color: '#E8E2F0', marginTop: 8 }}>
            Total earned from completed bookings
          </Text>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'In Escrow',   value: `₦${((e?.pendingEscrowKobo ?? 0) / 100).toLocaleString()}`, color: C.amber,   emoji: '🔒' },
            { label: 'This Month',  value: `₦${((e?.thisMonthKobo ?? 0) / 100).toLocaleString()}`,     color: C.green,   emoji: '📈' },
            { label: 'Bookings',    value: String(e?.bookingCount ?? 0),                                color: C.primary, emoji: '📋' },
            { label: 'Rating',      value: '—',                                                         color: C.amber,   emoji: '⭐' },
          ].map(s => (
            <View key={s.label} style={{ width: '47%', backgroundColor: C.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 22, marginBottom: 8 }}>{s.emoji}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 12, color: C.text2, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Portfolio reminder */}
        <View style={{ backgroundColor: C.amberLo, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.amber + '40', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.amber, marginBottom: 4 }}>📸 Add Portfolio Photos</Text>
          <Text style={{ fontSize: 13, color: C.text1 }}>
            Providers with photos get 5x more bookings. Upload from your profile.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
