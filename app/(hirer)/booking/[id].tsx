import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Modal, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../../src/api/bookings.api';
import { providersApi } from '../../../src/api/providers.api';
import { providersApi } from '../../../src/api/providers.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { ScreenHeader, Badge, Button, LoadingSpinner, EmptyState, BottomSheet } from '../../../src/components/ui';
import { BookingStatus } from '../../../src/types';

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; emoji: string }> = {
  pending_payment: { label: 'Awaiting Payment', variant: 'warning', emoji: '⏳' },
  confirmed:       { label: 'Confirmed',         variant: 'info',    emoji: '✅' },
  in_progress:     { label: 'In Progress',        variant: 'info',    emoji: '🔄' },
  completed:       { label: 'Completed',          variant: 'success', emoji: '🎉' },
  disputed:        { label: 'Disputed',           variant: 'danger',  emoji: '⚠️' },
  cancelled:       { label: 'Cancelled',          variant: 'default', emoji: '❌' },
  refunded:        { label: 'Refunded',           variant: 'default', emoji: '💸' },
};

const DISPUTE_REASONS = [
  "Provider didn't show up",
  'Service was not as described',
  'Provider was unprofessional',
  'Wrong service performed',
  'Other',
];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();

  const [showReview,  setShowReview]  = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [stars, setStars]             = useState(5);
  const [reviewBody, setReviewBody]   = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => bookingsApi.getById(id).then(r => r.data.data),
  });

  const { data: provider } = useQuery({
    queryKey: ['booking-provider', booking?.provider_id],
    queryFn:  () => providersApi.getById(booking!.provider_id).then(r => r.data.data),
    enabled:  !!booking?.provider_id,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['booking', id] });

  const confirm  = useMutation({ mutationFn: () => bookingsApi.confirm(id),  onSuccess: invalidate, onError: e => Alert.alert('Error', getErrorMessage(e)) });
  const cancel   = useMutation({ mutationFn: () => bookingsApi.cancel(id),   onSuccess: invalidate, onError: e => Alert.alert('Error', getErrorMessage(e)) });
  const dispute  = useMutation({
    mutationFn: () => bookingsApi.dispute(id, disputeReason, disputeDetails),
    onSuccess: () => { setShowDispute(false); invalidate(); },
    onError: e => Alert.alert('Error', getErrorMessage(e)),
  });
  const review   = useMutation({
    mutationFn: () => bookingsApi.review(id, stars, reviewBody),
    onSuccess: () => { setShowReview(false); invalidate(); Alert.alert('Thank you!', 'Your review has been submitted.'); },
    onError: e => Alert.alert('Error', getErrorMessage(e)),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!booking)  return <EmptyState emoji="😕" title="Booking not found" />;

  const status   = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: 'default', emoji: '📋' };
  const canConfirm  = booking.status === 'in_progress';
  const canCancel   = ['confirmed', 'pending_payment'].includes(booking.status);
  const canDispute  = ['confirmed', 'in_progress'].includes(booking.status);
  const canReview   = booking.status === 'completed';

  return (
    <View style={styles.container}>
      <ScreenHeader title={booking.reference} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status hero */}
        <View style={styles.statusHero}>
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Badge label={status.label} variant={status.variant} style={styles.statusBadge} />
          <Text style={styles.providerName}>{booking.provider_name ?? 'Provider'}</Text>
          <Text style={styles.amount}>₦{(booking.total_charged_kobo / 100).toLocaleString()}</Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <DetailRow label="Reference"   value={booking.reference} />
          <DetailRow label="Service"     value={booking.service_type === 'home' ? '🏠 Home Service' : '🏪 Walk-In'} />
          {booking.service_address && <DetailRow label="Address" value={booking.service_address} />}
          {booking.scheduled_at && (
            <DetailRow
              label="Scheduled"
              value={new Date(booking.scheduled_at).toLocaleString('en-NG', {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            />
          )}
          <DetailRow label="Booked on" value={new Date(booking.created_at).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })} />
        </View>

        {/* Provider Contact — unlocked after confirmed payment */}
        {['confirmed', 'in_progress', 'completed'].includes(booking.status) && provider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Provider Contact</Text>
            <Text style={styles.providerName}>{provider.business_name}</Text>
            <View style={styles.contactBtns}>
              <TouchableOpacity
                style={[styles.contactBtn, styles.callBtn]}
                onPress={() => Linking.openURL(`tel:${provider.whatsapp_number}`)}
              >
                <Text style={styles.contactBtnText}>📞  Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.waBtn]}
                onPress={() => {
                  const num = provider.whatsapp_number.replace('+', '');
                  Linking.openURL(
                    `https://wa.me/${num}?text=Hi, regarding my Staxz booking ${booking.reference}`
                  );
                }}
              >
                <Text style={styles.contactBtnText}>💬  WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <DetailRow label="Provider fee"   value={`₦${(booking.provider_quote_kobo / 100).toLocaleString()}`} />
          <DetailRow label="Platform fee"   value={`₦${(booking.platform_fee_kobo / 100).toLocaleString()}`} />
          <View style={styles.divider} />
          <DetailRow label="Total paid" value={`₦${(booking.total_charged_kobo / 100).toLocaleString()}`} bold />
          <DetailRow
            label="Escrow"
            value={booking.escrow_released ? '✅ Released to provider' : '🔒 Held in escrow'}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {canConfirm && (
            <Button
              title="Confirm Service Complete"
              onPress={() => Alert.alert(
                'Confirm Completion',
                'This will release payment to the provider. Are you satisfied with the service?',
                [
                  { text: 'Not yet', style: 'cancel' },
                  { text: 'Yes, Release Payment', onPress: () => confirm.mutate() },
                ]
              )}
              loading={confirm.isPending}
              style={styles.actionBtn}
            />
          )}

          {canReview && (
            <Button
              title="Leave a Review ⭐"
              onPress={() => setShowReview(true)}
              variant="outline"
              style={styles.actionBtn}
            />
          )}

          {canDispute && (
            <Button
              title="Raise Dispute"
              onPress={() => setShowDispute(true)}
              variant="outline"
              style={styles.actionBtn}
            />
          )}

          {canCancel && (
            <Button
              title="Cancel Booking"
              variant="ghost"
              onPress={() => Alert.alert(
                'Cancel Booking',
                'Are you sure? A cancellation fee may apply if within 2 hours of your appointment.',
                [
                  { text: 'Keep Booking', style: 'cancel' },
                  { text: 'Cancel', style: 'destructive', onPress: () => cancel.mutate() },
                ]
              )}
              style={[styles.actionBtn, { borderColor: COLORS.red }]}
              textStyle={{ color: COLORS.red }}
            />
          )}
        </View>
      </ScrollView>

      {/* Review Sheet */}
      <BottomSheet visible={showReview} onClose={() => setShowReview(false)} title="Leave a Review">
        <View style={styles.reviewForm}>
          <Text style={styles.starsLabel}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setStars(i)}>
                <Text style={[styles.star, i <= stars && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tell others about your experience..."
            placeholderTextColor={COLORS.text2}
            value={reviewBody}
            onChangeText={setReviewBody}
            multiline
            numberOfLines={4}
          />
          <Button
            title="Submit Review"
            onPress={() => review.mutate()}
            loading={review.isPending}
          />
        </View>
      </BottomSheet>

      {/* Dispute Sheet */}
      <BottomSheet visible={showDispute} onClose={() => setShowDispute(false)} title="Raise a Dispute">
        <View style={styles.disputeForm}>
          <Text style={styles.disputeLabel}>What went wrong?</Text>
          {DISPUTE_REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonRow, disputeReason === reason && styles.reasonSelected]}
              onPress={() => setDisputeReason(reason)}
            >
              <View style={[styles.radio, disputeReason === reason && styles.radioSelected]}>
                {disputeReason === reason && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.disputeInput}
            placeholder="Additional details (optional)..."
            placeholderTextColor={COLORS.text2}
            value={disputeDetails}
            onChangeText={setDisputeDetails}
            multiline
            numberOfLines={3}
          />
          <Button
            title="Submit Dispute"
            onPress={() => dispute.mutate()}
            loading={dispute.isPending}
            disabled={!disputeReason}
            variant="danger"
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const DetailRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, bold && styles.detailValueBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg0 },
  content:     { padding: SPACING.md, paddingBottom: 40 },
  statusHero:  {
    alignItems: 'center', padding: SPACING.xl,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  statusEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  statusBadge: { marginBottom: SPACING.sm },
  providerName:{ fontSize: 18, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.xs },
  amount:      { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  providerName: { fontSize: 14, color: COLORS.text1, marginBottom: SPACING.sm },
  contactBtns:  { flexDirection: 'row', gap: SPACING.sm },
  contactBtn:   { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1.5 },
  callBtn:      { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLo },
  waBtn:        { borderColor: COLORS.green,   backgroundColor: COLORS.greenLo },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text0 },
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  detailLabel: { fontSize: 13, color: COLORS.text2 },
  detailValue: { fontSize: 13, color: COLORS.text0, fontWeight: '500', flex: 1, textAlign: 'right' },
  detailValueBold: { fontWeight: '800', color: COLORS.primary, fontSize: 15 },
  divider:     { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  actions:     { gap: SPACING.sm },
  actionBtn:   {},
  reviewForm:  { gap: SPACING.md, paddingBottom: SPACING.lg },
  starsLabel:  { fontSize: 15, color: COLORS.text0, fontWeight: '600' },
  starsRow:    { flexDirection: 'row', gap: SPACING.sm },
  star:        { fontSize: 32, color: COLORS.border },
  starActive:  { color: '#F59E0B' },
  reviewInput: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0,
    minHeight: 80, textAlignVertical: 'top',
  },
  disputeForm:     { gap: SPACING.sm, paddingBottom: SPACING.lg },
  disputeLabel:    { fontSize: 15, fontWeight: '600', color: COLORS.text0 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reasonSelected:  { borderColor: COLORS.primary, backgroundColor: COLORS.bg2 },
  reasonText:      { fontSize: 14, color: COLORS.text0, flex: 1 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot:      { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  disputeInput: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0,
    textAlignVertical: 'top',
  },
});