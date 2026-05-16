import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C, CATS } from '../../../src/constants';

export default function ExploreScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['providers', cat, mode],
    queryFn: () => api(`/providers${cat ? `?category=${cat}` : ''}${mode ? `${cat ? '&' : '?'}mode=${mode}` : ''}`, { token }),
  });

  const providers = (data?.data ?? []).filter((p: any) =>
    !search || p.business_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location_text ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0 }}>
      {/* Header */}
      <View style={{ backgroundColor: C.bg0, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
        <Text style={{ fontSize: 13, color: C.text2, marginBottom: 2 }}>Good day 👋</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 14 }}>Find your perfect stylist</Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 48, marginBottom: 14 }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or area..." placeholderTextColor={C.text2}
            style={{ flex: 1, fontSize: 14, color: C.text0 }} />
        </View>

        {/* Mode filters */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {[{ id: null, label: 'All' }, { id: 'home', label: '🏠 Home' }, { id: 'walkin', label: '🏪 Walk-in' }].map(m => (
            <TouchableOpacity key={String(m.id)} onPress={() => setMode(m.id as any)}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5, borderColor: mode === m.id ? C.primary : C.border, backgroundColor: mode === m.id ? C.primary : C.bg1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: mode === m.id ? C.white : C.text1 }}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setCat(null)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5, borderColor: !cat ? C.primary : C.border, backgroundColor: !cat ? C.primary : C.bg1, marginRight: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: !cat ? C.white : C.text1 }}>⭐ All</Text>
          </TouchableOpacity>
          {CATS.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setCat(cat === c.id ? null : c.id)}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5, borderColor: cat === c.id ? c.color : C.border, backgroundColor: cat === c.id ? c.color + '20' : C.bg1, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13 }}>{c.icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: cat === c.id ? c.color : C.text1 }}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Provider list */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={{ color: C.text2, marginTop: 12, fontSize: 14 }}>Finding providers...</Text>
        </View>
      ) : (
        <FlatList data={providers} keyExtractor={(p: any) => p.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0 }}>No providers found</Text>
              <Text style={{ fontSize: 14, color: C.text2, marginTop: 6 }}>Try a different category or area</Text>
            </View>
          }
          renderItem={({ item: p }: any) => (
            <TouchableOpacity onPress={() => router.push(`/(hirer)/provider/${p.id}`)} activeOpacity={0.9}
              style={{ backgroundColor: C.bg1, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, shadowColor: '#7B4FA6', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
              <View style={{ flexDirection: 'row', gap: 14, marginBottom: 12 }}>
                {/* Avatar */}
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: C.white }}>{p.business_name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.text0 }}>{p.business_name}</Text>
                    {p.cac_verified && <View style={{ backgroundColor: C.green + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 }}><Text style={{ fontSize: 10, fontWeight: '700', color: C.green }}>✓ Verified</Text></View>}
                  </View>
                  <Text style={{ fontSize: 12, color: C.text1, marginBottom: 3 }}>📍 {p.location_text ?? 'Lagos'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#F59E0B' }}>{'★'.repeat(Math.round(p.rating_avg ?? 0))}{'☆'.repeat(5 - Math.round(p.rating_avg ?? 0))}</Text>
                    <Text style={{ fontSize: 11, color: C.text2, marginLeft: 4 }}>{(p.rating_avg ?? 0).toFixed(1)} ({p.rating_count ?? 0})</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.primary }}>₦{((p.base_fee_kobo ?? 0) / 100).toLocaleString()}</Text>
                  <Text style={{ fontSize: 10, color: C.text2 }}>from</Text>
                </View>
              </View>

              {/* Service mode badges */}
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {(p.service_modes ?? []).map((m: string) => (
                  <View key={m} style={{ backgroundColor: C.primaryLo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.primary }}>{m === 'home' ? '🏠 Home' : '🏪 Walk-in'}</Text>
                  </View>
                ))}
                {(p.service_categories ?? []).slice(0, 3).map((catId: string) => {
                  const found = CATS.find(c => c.id === catId);
                  return found ? (
                    <View key={catId} style={{ backgroundColor: found.color + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: found.color }}>{found.icon} {found.label}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </TouchableOpacity>
          )} />
      )}
    </View>
  );
}
