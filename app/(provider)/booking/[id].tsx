import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../../src/api/bookings.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, LoadingSpinner, Button, ScreenHeader } from '../../../src/components/ui';
import { BookingStatus } from '../../../src/types';

const STATUS_CONFIG: Record<string, { label: string; variant: any; emoji: string }> = {
  pending_payment: { label: 'Awaiting Payment', variant: 'warning', emoji: '⏳' },
  confirmed:       { label: 'Confirmed',         variant: 'info',    emoji: '✅' },
  in_progress:     { label: 'In Progress',        variant: 'info',    emoji: '🔄' },
  completed:       { label: 'Completed',          variant: 'success', emoji: '🎉' },
  disputed:        { label: 'Disputed',           variant: 'danger',  emoji: '⚠️' },
  cancelled:       { label: 'Cancelled',          variant: 'default', emoji: '❌' },
  refunded:        { label: 'Refunded',           variant: 'default', emoji: '↩️' },
};

export default function ProviderBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id).then(r => r.data.data),
  });

  const markComplete = useMutation({
    mutationFn: () => bookingsApi.markComplete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] });
      qc.invalidateQueries({ queryKey: ['provider-bookings'] });
      Alert.alert('✅ Marked Complete', 'Waiting for client to confirm.');
    },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  if (isLoading || !booking) return <LoadingSpinner />;

  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.confirmed;

  return (
    <View style={styles.container}>
      <ScreenHeader title={booking.reference} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{cfg.emoji}</Text>
          <View>
            <Badge label={cfg.label} variant={cfg.variant} />
            <Text style={styles.statusSub}>
              {booking.service_type === 'home' ? '🏠 Home service' : '🏪 Walk-in'}
            </Text>
          </View>
        </View>

        {/* Client info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <InfoRow label="Name"   value={booking.hirer_name ?? 'Client'} />
          {booking.service_address && (
            <InfoRow label="Address" value={booking.service_address} />
          )}
          {booking.scheduled_at && (
            <InfoRow
              label="Scheduled"
              value={new Date(booking.scheduled_at).toLocaleString('en-NG', {
                weekday: 'short', day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })}
            />
          )}
          {booking.notes && <InfoRow label="Notes" value={booking.notes} />}
        </View>

        {/* Payment breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <InfoRow label="Your quote"    value={`₦${(booking.provider_quote_kobo / 100).toLocaleString()}`} />
          <InfoRow label="Platform fee"  value={`₦${(booking.platform_fee_kobo / 100).toLocaleString()} (15%)`} />
          <InfoRow label="Client paid"   value={`₦${(booking.total_charged_kobo / 100).toLocaleString()}`} bold />
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>You receive</Text>
            <Text style={styles.payoutAmount}>₦{(booking.provider_quote_kobo / 100).toLocaleString()}</Text>
          </View>
          <Text style={styles.escrowNote}>
            {booking.escrow_released
              ? '✅ Paid out to your bank account'
              : '🔒 In escrow — released after client confirms'}
          </Text>
        </View>

        {/* Actions */}
        {booking.status === 'confirmed' && (
          <View style={styles.actions}>
            <Button
              title="Mark Service as Complete"
              onPress={() => {
                Alert.alert(
                  'Mark Complete?',
                  'Only mark complete when the service is fully done. The client will be asked to confirm.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Mark Complete', onPress: () => markComplete.mutate() },
                  ]
                );
              }}
              loading={markComplete.isPending}
            />
          </View>
        )}

        {booking.status === 'in_progress' && (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingText}>
              ⏳ Waiting for client to confirm completion and release payment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, bold && styles.infoBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.md, paddingBottom: 40 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statusEmoji: { fontSize: 32 },
  statusSub:   { fontSize: 12, color: COLORS.text1, marginTop: 4 },
  section: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.sm },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 13, color: COLORS.text1 },
  infoValue: { fontSize: 13, color: COLORS.text0, fontWeight: '500', flex: 1, textAlign: 'right' },
  infoBold:  { fontWeight: '800' },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.sm, marginTop: SPACING.xs },
  payoutLabel:  { fontSize: 15, fontWeight: '700', color: COLORS.text0 },
  payoutAmount: { fontSize: 18, fontWeight: '800', color: COLORS.green },
  escrowNote:   { fontSize: 12, color: COLORS.text1, marginTop: SPACING.xs },
  actions:    { marginTop: SPACING.md },
  waitingBox: {
    backgroundColor: COLORS.amberLo, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.md,
    borderWidth: 1, borderColor: COLORS.amber,
  },
  waitingText: { fontSize: 14, color: COLORS.amber, textAlign: 'center', fontWeight: '500' },
});
