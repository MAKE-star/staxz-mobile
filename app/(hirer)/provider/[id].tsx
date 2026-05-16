import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['provider', id], queryFn: () => api(`/providers/${id}`, { token }) });
  const p = data?.data;
  if (isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 56 }}>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ fontSize: 16, color: C.primary, marginBottom: 24 }}>← Back</Text></TouchableOpacity>
      <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.white }}>{p?.business_name?.[0] ?? 'S'}</Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 }}>{p?.business_name}</Text>
      <Text style={{ fontSize: 14, color: C.text2, marginBottom: 4 }}>📍 {p?.location_text ?? 'Lagos'}</Text>
      <Text style={{ fontSize: 14, color: '#F59E0B', marginBottom: 16 }}>{'★'.repeat(Math.round(p?.rating_avg ?? 0))} ({p?.rating_count ?? 0})</Text>
      {p?.bio && <Text style={{ fontSize: 14, color: C.text2, lineHeight: 22, marginBottom: 24 }}>{p.bio}</Text>}
      <TouchableOpacity onPress={() => router.push({ pathname: '/(hirer)/provider/enquiry', params: { providerId: id, providerName: p?.business_name } })}
        style={{ backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center' }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Book Now — from ₦{((p?.base_fee_kobo??0)/100).toLocaleString()}</Text>
      </TouchableOpacity>
    </View>
  );
}
