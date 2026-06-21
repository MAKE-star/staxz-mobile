import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';

const ROLE_COLOR: Record<string, string> = {
  hirer: C.primary, provider: '#EC4899', admin: C.green,
};

export default function AdminUsers() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api('/admin/users?limit=50', { token }),
  });

  const users = (data?.data ?? []).filter((u: any) =>
    !search || u.phone?.includes(search) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const mutate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api(`/admin/users/${id}/${action}`, { method: 'PUT', token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const action = (user: any) => {
    const options = [];
    if (user.is_active) {
      options.push({ text: 'Suspend User', style: 'destructive' as const, onPress: () => mutate.mutate({ id: user.id, action: 'suspend' }) });
    } else {
      options.push({ text: 'Reinstate User', onPress: () => mutate.mutate({ id: user.id, action: 'reinstate' }) });
    }
    options.push({ text: 'Cancel', style: 'cancel' as const });
    Alert.alert(user.full_name ?? user.phone, `Role: ${user.role}`, options);
  };

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: C.text2 }}>Admin Panel</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text0, marginBottom: 12 }}>Users</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 44 }}>
          <Text style={{ marginRight: 8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch}
            placeholder="Search by name or phone..." placeholderTextColor={C.text2}
            style={{ flex: 1, fontSize: 14, color: C.text0 }} />
        </View>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginBottom: 12 }}>
        {[
          { label: 'Total', count: data?.data?.length ?? 0, color: C.primary },
          { label: 'Providers', count: data?.data?.filter((u: any) => u.role === 'provider').length ?? 0, color: '#EC4899' },
          { label: 'Clients', count: data?.data?.filter((u: any) => u.role === 'hirer').length ?? 0, color: C.primary },
        ].map(s => (
          <View key={s.label} style={{ flex: 1, backgroundColor: C.bg1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.count}</Text>
            <Text style={{ fontSize: 11, color: C.text2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList data={users} keyExtractor={(u: any) => u.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0 }}>No users found</Text>
          </View>
        }
        renderItem={({ item: u }: any) => (
          <TouchableOpacity onPress={() => action(u)} activeOpacity={0.8}
            style={{ backgroundColor: C.bg1, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: u.is_active ? C.border : C.red + '40', flexDirection: 'row', alignItems: 'center', gap: 12 }}>

            {/* Avatar */}
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: (ROLE_COLOR[u.role] ?? C.primary) + '20', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>{u.role === 'provider' ? '💼' : u.role === 'admin' ? '🛡️' : '👤'}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0 }}>{u.full_name ?? 'Unknown'}</Text>
                {!u.is_active && <View style={{ backgroundColor: C.red + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 }}><Text style={{ fontSize: 10, color: C.red, fontWeight: '700' }}>SUSPENDED</Text></View>}
              </View>
              <Text style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{u.phone}</Text>
            </View>

            <View style={{ backgroundColor: (ROLE_COLOR[u.role] ?? C.primary) + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: ROLE_COLOR[u.role] ?? C.primary, textTransform: 'capitalize' }}>{u.role}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
