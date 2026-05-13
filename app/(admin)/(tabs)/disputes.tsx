import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, LoadingSpinner, EmptyState, Button } from '../../../src/components/ui';

interface Dispute {
  id: string; booking_id: string; reason: string;
  status: string; created_at: string;
  booking_reference?: string; hirer_name?: string; provider_name?: string;
}

export default function DisputesScreen() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [note, setNote] = useState('');
  const [action, setAction] = useState<'refund_hirer' | 'release_escrow' | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/admin/disputes').then(r => r.data.data),
  });

  const resolve = useMutation({
    mutationFn: ({ bookingId, action, note }: { bookingId: string; action: string; note: string }) =>
      api.post(`/admin/disputes/${bookingId}/resolve`, { action, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      setSelected(null); setNote(''); setAction(null);
      Alert.alert('✅ Dispute resolved');
    },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Disputes</Text>

      <FlatList
        data={data ?? []}
        keyExtractor={(d: Dispute) => d.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState emoji="✅" title="No open disputes" body="All disputes have been resolved" />}
        renderItem={({ item }: { item: Dispute }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.9}>
            <View style={styles.cardTop}>
              <Text style={styles.ref}>{item.booking_reference ?? item.booking_id.slice(0, 8)}</Text>
              <Badge label={item.status} variant={item.status === 'open' ? 'danger' : 'warning'} />
            </View>
            <Text style={styles.reason}>{item.reason}</Text>
            <View style={styles.parties}>
              <Text style={styles.party}>🧑 {item.hirer_name ?? 'Hirer'}</Text>
              <Text style={styles.party}>💼 {item.provider_name ?? 'Provider'}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-NG')}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Resolution Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Resolve Dispute</Text>
            <Text style={styles.modalReason}>{selected?.reason}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, action === 'refund_hirer' && styles.actionBtnActive]}
                onPress={() => setAction('refund_hirer')}
              >
                <Text style={styles.actionEmoji}>↩️</Text>
                <Text style={styles.actionLabel}>Refund Hirer</Text>
                <Text style={styles.actionDesc}>Release escrow back to client</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, action === 'release_escrow' && styles.actionBtnActive]}
                onPress={() => setAction('release_escrow')}
              >
                <Text style={styles.actionEmoji}>💸</Text>
                <Text style={styles.actionLabel}>Release to Provider</Text>
                <Text style={styles.actionDesc}>Send escrow to provider</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Resolution note (required)..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.text2}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => { setSelected(null); setNote(''); setAction(null); }}
                style={{ flex: 1 }}
              />
              <Button
                title="Resolve"
                onPress={() => {
                  if (!action || !note.trim()) {
                    Alert.alert('Required', 'Select an action and add a note.');
                    return;
                  }
                  resolve.mutate({ bookingId: selected!.booking_id, action, note });
                }}
                loading={resolve.isPending}
                disabled={!action || !note.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title:  { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56 },
  list:   { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 4, borderLeftColor: COLORS.red,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  ref:     { fontSize: 13, fontWeight: '700', color: COLORS.text0 },
  reason:  { fontSize: 14, color: COLORS.text0, marginBottom: SPACING.xs },
  parties: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.xs },
  party:   { fontSize: 12, color: COLORS.text1 },
  date:    { fontSize: 11, color: COLORS.text2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.bg1, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
  },
  modalTitle:  { fontSize: 18, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.xs },
  modalReason: { fontSize: 14, color: COLORS.text1, marginBottom: SPACING.lg },
  actionButtons: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  actionBtn: {
    flex: 1, padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg1, alignItems: 'center',
  },
  actionBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  actionDesc:  { fontSize: 11, color: COLORS.text1, textAlign: 'center' },
  noteInput: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0,
    marginBottom: SPACING.md, minHeight: 80, textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: SPACING.md },
});
