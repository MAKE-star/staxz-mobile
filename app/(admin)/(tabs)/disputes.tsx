import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';

export default function AdminDisputes() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api('/admin/disputes', { token }),
  });

  const disputes = data?.data ?? [];

  const resolve = useMutation({
    mutationFn: ({ action }: { action: string }) =>
      api(`/admin/disputes/${selected.booking_id}/resolve`, {
        method: 'POST', token,
        body: { action, note: note || 'Resolved by admin' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelected(null);
      setNote('');
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 }}>
        <Text style={{ fontSize: 13, color: C.text2 }}>Admin Panel</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text0 }}>Disputes</Text>
        {disputes.length > 0 && (
          <View style={{ backgroundColor: C.red + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: C.red, fontWeight: '700' }}>{disputes.length} open</Text>
          </View>
        )}
      </View>

      <FlatList data={disputes} keyExtractor={(d: any) => d.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0 }}>No open disputes</Text>
            <Text style={{ fontSize: 14, color: C.text2, marginTop: 6 }}>All disputes have been resolved</Text>
          </View>
        }
        renderItem={({ item: d }: any) => (
          <TouchableOpacity onPress={() => setSelected(d)} activeOpacity={0.9}
            style={{ backgroundColor: C.bg1, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.red + '40', borderLeftWidth: 4, borderLeftColor: C.red }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.red }}>⚠️ {d.status?.toUpperCase()}</Text>
              <Text style={{ fontSize: 12, color: C.text2 }}>{new Date(d.created_at).toLocaleDateString('en-NG')}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0, marginBottom: 4 }}>
              Booking: {d.booking_reference ?? d.booking_id?.slice(0, 8)}
            </Text>
            <Text style={{ fontSize: 13, color: C.text1, marginBottom: 4 }}>
              Raised by: {d.raised_by_role === 'hirer' ? '👤 Client' : '💼 Provider'}
            </Text>
            {d.reason && <Text style={{ fontSize: 12, color: C.text2 }}>Reason: {d.reason}</Text>}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1, backgroundColor: C.primary + '15', padding: 8, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: C.primary, fontWeight: '600' }}>Tap to resolve →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Resolve Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setSelected(null)} />
        <View style={{ backgroundColor: C.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Resolve Dispute</Text>
          <Text style={{ fontSize: 13, color: C.text2, marginBottom: 20 }}>
            Booking: {selected?.booking_reference ?? selected?.booking_id?.slice(0, 8)}
          </Text>

          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Admin Note (optional)</Text>
          <TextInput value={note} onChangeText={setNote}
            placeholder="Add a note about this decision..."
            multiline numberOfLines={2}
            style={{ backgroundColor: C.bg2, borderRadius: 12, padding: 12, fontSize: 14, color: C.text0, marginBottom: 20, minHeight: 70, textAlignVertical: 'top', borderWidth: 1, borderColor: C.border }} />

          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Release to Provider?', 'This will release the escrowed funds to the provider.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Release', onPress: () => resolve.mutate({ action: 'release_escrow' }) },
              ])}
              style={{ backgroundColor: C.green, borderRadius: 14, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>✅ Release to Provider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Refund Client?', 'This will refund the full amount to the client.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Refund', style: 'destructive', onPress: () => resolve.mutate({ action: 'refund_hirer' }) },
              ])}
              style={{ backgroundColor: C.red, borderRadius: 14, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>↩️ Refund Client</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelected(null)}
              style={{ borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: C.text2, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
