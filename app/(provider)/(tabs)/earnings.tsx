import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function Earnings() {
  const { token } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['balance'], queryFn: () => api('/withdrawals/balance', { token }) });
  const b = data?.data;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 56 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 24 }}>Earnings</Text>
      {isLoading ? <ActivityIndicator color={C.primary} /> : (
        <>
          <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: '#E8E2F0', marginBottom: 4 }}>Available Balance</Text>
            <Text style={{ fontSize: 36, fontWeight: '800', color: C.white }}>₦{((b?.availableKobo??0)/100).toLocaleString()}</Text>
          </View>
          {[['In Escrow', b?.pendingEscrowKobo??0, C.amber], ['Total Earned', b?.totalEarnedKobo??0, C.green], ['Total Withdrawn', b?.totalWithdrawnKobo??0, C.text3]].map(([l,v,c]: any) => (
            <View key={l} style={{ backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: C.text2 }}>{l}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c }}>₦{(v/100).toLocaleString()}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
