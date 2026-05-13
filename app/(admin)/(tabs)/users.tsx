import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { getErrorMessage } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Badge, LoadingSpinner, EmptyState, Avatar } from '../../../src/components/ui';

export default function UsersScreen() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => api.get('/admin/users', { params: { role: roleFilter, limit: 50 } }).then(r => r.data.data),
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); Alert.alert('User suspended'); },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  const reinstate = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/reinstate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); Alert.alert('User reinstated'); },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  const flag = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/admin/users/${id}/flag`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = (data ?? []).filter((u: any) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const handleActions = (user: any) => {
    Alert.alert(user.full_name ?? user.phone, 'Choose an action', [
      { text: 'Cancel', style: 'cancel' },
      user.is_active
        ? { text: '🚫 Suspend',   onPress: () => suspend.mutate(user.id) }
        : { text: '✅ Reinstate', onPress: () => reinstate.mutate(user.id) },
      user.is_flagged
        ? { text: '🏳️ Remove Flag', onPress: () => api.put(`/admin/users/${user.id}/unflag`) }
        : {
            text: '🚩 Flag',
            onPress: () => Alert.prompt('Flag Reason', 'Enter reason', reason => {
              if (reason) flag.mutate({ id: user.id, reason });
            }),
          },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name or phone..."
        placeholderTextColor={COLORS.text2}
        value={search}
        onChangeText={setSearch}
      />

      {/* Role filter */}
      <View style={styles.filters}>
        {[null, 'hirer', 'provider', 'admin'].map(role => (
          <TouchableOpacity
            key={String(role)}
            style={[styles.filter, roleFilter === role && styles.filterActive]}
            onPress={() => setRoleFilter(role)}
          >
            <Text style={[styles.filterText, roleFilter === role && styles.filterTextActive]}>
              {role ?? 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u: any) => u.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState emoji="👥" title="No users found" />}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleActions(item)} activeOpacity={0.9}>
            <Avatar name={item.full_name ?? item.phone} size={44} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name ?? 'Unnamed'}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              {item.business_name && <Text style={styles.business}>{item.business_name}</Text>}
            </View>
            <View style={styles.badges}>
              <Badge
                label={item.role}
                variant={item.role === 'provider' ? 'info' : item.role === 'admin' ? 'warning' : 'default'}
              />
              {!item.is_active && <Badge label="Suspended" variant="danger" />}
              {item.is_flagged && <Badge label="Flagged" variant="warning" />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title:  { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm },
  search: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 14, color: COLORS.text0,
  },
  filters: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.md },
  filter: {
    flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
    alignItems: 'center', backgroundColor: COLORS.bg2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:     { fontSize: 12, color: COLORS.text1, fontWeight: '500', textTransform: 'capitalize' },
  filterTextActive: { color: COLORS.white, fontWeight: '700' },
  list: { padding: SPACING.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  info:     { flex: 1 },
  name:     { fontSize: 14, fontWeight: '700', color: COLORS.text0 },
  phone:    { fontSize: 12, color: COLORS.text1 },
  business: { fontSize: 11, color: COLORS.primary, fontWeight: '500' },
  badges:   { gap: 4, alignItems: 'flex-end' },
});
