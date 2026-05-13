import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '../../../src/api/notifications.api';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Button, LoadingSpinner, BottomSheet } from '../../../src/components/ui';

export default function EarningsScreen() {
  const qc = useQueryClient();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  const { data: balance, isLoading } = useQuery({
    queryKey: ['withdrawal-balance'],
    queryFn:  () => withdrawalsApi.getBalance().then(r => r.data.data),
  });

  const { data: history } = useQuery({
    queryKey: ['withdrawal-history'],
    queryFn:  () => withdrawalsApi.listHistory().then((r: any) => r.data.data),
  });

  const withdraw = useMutation({
    mutationFn: () => {
      const kobo = Math.round(parseFloat(amount) * 100);
      return withdrawalsApi.initiate(kobo);
    },
    onSuccess: () => {
      setShowWithdraw(false);
      setAmount('');
      qc.invalidateQueries({ queryKey: ['withdrawal-balance'] });
      qc.invalidateQueries({ queryKey: ['withdrawal-history'] });
      Alert.alert('Withdrawal Initiated ✅', 'Your funds are on their way to your bank account.');
    },
    onError: e => Alert.alert('Error', getErrorMessage(e)),
  });

  if (isLoading) return <LoadingSpinner />;

  const available = (balance?.availableKobo ?? 0) / 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Earnings</Text>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₦{available.toLocaleString()}</Text>

        <View style={styles.statsRow}>
          <BalanceStat
            label="Total Earned"
            value={`₦${((balance?.totalEarnedKobo ?? 0) / 100).toLocaleString()}`}
          />
          <BalanceStat
            label="In Escrow"
            value={`₦${((balance?.pendingEscrowKobo ?? 0) / 100).toLocaleString()}`}
          />
          <BalanceStat
            label="Withdrawn"
            value={`₦${((balance?.totalWithdrawnKobo ?? 0) / 100).toLocaleString()}`}
          />
        </View>

        <Button
          title="Withdraw to Bank"
          onPress={() => setShowWithdraw(true)}
          disabled={available < 1000}
          style={styles.withdrawBtn}
        />
        {available < 1000 && (
          <Text style={styles.minNote}>Minimum withdrawal is ₦1,000</Text>
        )}
      </View>

      {/* History */}
      <Text style={styles.sectionTitle}>Withdrawal History</Text>
      {(!history || history.length === 0) ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No withdrawals yet</Text>
        </View>
      ) : (
        history.map((w: any) => (
          <View key={w.id} style={styles.historyRow}>
            <View>
              <Text style={styles.historyAmount}>₦{(w.amount_kobo / 100).toLocaleString()}</Text>
              <Text style={styles.historyDate}>
                {new Date(w.initiated_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={[
              styles.historyStatus,
              w.status === 'completed' && styles.statusCompleted,
              w.status === 'failed'    && styles.statusFailed,
              w.status === 'processing'&& styles.statusProcessing,
            ]}>
              <Text style={styles.historyStatusText}>
                {w.status === 'completed' ? '✅ Paid' : w.status === 'failed' ? '❌ Failed' : '⏳ Processing'}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Withdraw sheet */}
      <BottomSheet visible={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <View style={styles.withdrawForm}>
          <Text style={styles.availableText}>Available: ₦{available.toLocaleString()}</Text>
          <Text style={styles.amountLabel}>Amount (₦)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            placeholderTextColor={COLORS.text2}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity onPress={() => setAmount(String(Math.floor(available)))}>
            <Text style={styles.maxBtn}>Withdraw all (₦{Math.floor(available).toLocaleString()})</Text>
          </TouchableOpacity>
          <Button
            title="Confirm Withdrawal"
            onPress={() => withdraw.mutate()}
            loading={withdraw.isPending}
            disabled={!amount || parseFloat(amount) < 1000 || parseFloat(amount) > available}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const BalanceStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.balanceStat}>
    <Text style={styles.balanceStatValue}>{value}</Text>
    <Text style={styles.balanceStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg0 },
  content:       { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },
  title:         { fontSize: 24, fontWeight: '800', color: COLORS.text0, marginBottom: SPACING.lg },
  balanceCard:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl },
  balanceLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.lg },
  statsRow:      { flexDirection: 'row', marginBottom: SPACING.lg },
  balanceStat:   { flex: 1, alignItems: 'center' },
  balanceStatValue:{ fontSize: 14, fontWeight: '800', color: COLORS.white, marginBottom: 2 },
  balanceStatLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  withdrawBtn:   { backgroundColor: 'rgba(255,255,255,0.2)' },
  minNote:       { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: SPACING.xs },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  emptyBox:      { backgroundColor: COLORS.bg1, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText:     { fontSize: 14, color: COLORS.text2 },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  historyAmount:     { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  historyDate:       { fontSize: 12, color: COLORS.text2 },
  historyStatus:     { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusCompleted:   { backgroundColor: COLORS.greenLo },
  statusFailed:      { backgroundColor: COLORS.redLo },
  statusProcessing:  { backgroundColor: COLORS.amberLo },
  historyStatusText: { fontSize: 12, fontWeight: '600' },
  withdrawForm:      { gap: SPACING.md, paddingBottom: SPACING.xl },
  availableText:     { fontSize: 14, color: COLORS.text1, textAlign: 'center' },
  amountLabel:       { fontSize: 13, fontWeight: '500', color: COLORS.text1 },
  amountInput: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 20, fontWeight: '700', color: COLORS.text0,
  },
  maxBtn: { fontSize: 13, color: COLORS.primary, fontWeight: '600', textAlign: 'right' },
});
