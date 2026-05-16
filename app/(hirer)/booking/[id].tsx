import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['booking', id], queryFn: () => api(`/bookings/${id}`, { token }) });
  const b = data?.data;
  const refresh = () => qc.invalidateQueries({ queryKey: ['booking', id] });
  const confirm = useMutation({ mutationFn: () => api(`/bookings/${id}/confirm`, { method: 'POST', token }), onSuccess: refresh, onError: (e: any) => Alert.alert('Error', e.message) });
  const dispute = useMutation({ mutationFn: () => api(`/bookings/${id}/dispute`, { method: 'POST', token, body: { reason: 'Other', details: 'Raised from app' } }), onSuccess: refresh, onError: (e: any) => Alert.alert('Error', e.message) });
  if (isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 56 }}>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ fontSize: 16, color: C.primary, marginBottom: 24 }}>← Back</Text></TouchableOpacity>
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 }}>{b?.reference}</Text>
      <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>{b?.status?.replace(/_/g,' ')}</Text>
      <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 8 }}>Payment</Text>
        <Text style={{ fontSize: 14, color: C.text2 }}>Your quote: ₦{((b?.provider_quote_kobo??0)/100).toLocaleString()}</Text>
        <Text style={{ fontSize: 14, color: C.text2 }}>Platform fee: ₦{((b?.platform_fee_kobo??0)/100).toLocaleString()}</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary, marginTop: 4 }}>Total: ₦{((b?.total_charged_kobo??0)/100).toLocaleString()}</Text>
      </View>
      {b?.status === 'in_progress' && (
        <TouchableOpacity onPress={() => Alert.alert('Confirm?', 'This will release payment to the provider.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => confirm.mutate() }])}
          style={{ backgroundColor: C.green, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Confirm Service Complete</Text>
        </TouchableOpacity>
      )}
      {['confirmed','in_progress'].includes(b?.status) && (
        <TouchableOpacity onPress={() => Alert.alert('Raise Dispute?', 'This will freeze the payment.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Raise Dispute', style: 'destructive', onPress: () => dispute.mutate() }])}
          style={{ borderWidth: 1.5, borderColor: C.red, borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: C.red, fontWeight: '700', fontSize: 16 }}>Raise Dispute</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
