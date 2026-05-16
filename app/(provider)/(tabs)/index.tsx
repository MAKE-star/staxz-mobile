import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function ProviderDashboard() {
  const { token } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['provider-earnings'], queryFn: () => api('/providers/me/earnings', { token }) });
  const e = data?.data;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 56 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 24 }}>Dashboard</Text>
      {isLoading ? <ActivityIndicator color={C.primary} /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'Total Earned', value: `₦${((e?.completedKobo??0)/100).toLocaleString()}`, color: C.green },
            { label: 'In Escrow', value: `₦${((e?.pendingEscrowKobo??0)/100).toLocaleString()}`, color: C.amber },
            { label: 'This Month', value: `₦${((e?.thisMonthKobo??0)/100).toLocaleString()}`, color: C.primary },
            { label: 'Bookings', value: String(e?.bookingCount??0), color: C.primary },
          ].map(s => (
            <View key={s.label} style={{ width: '47%', backgroundColor: C.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>{s.label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: s.color }}>{s.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
