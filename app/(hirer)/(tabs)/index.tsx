import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ScrollView, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { providersApi } from '../../../src/api/providers.api';
import { Provider } from '../../../src/types';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';
import { StarRating, Badge, LoadingSpinner, EmptyState } from '../../../src/components/ui';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['providers', activeCategory, activeMode],
    queryFn: () => providersApi.list({
      category: activeCategory ?? undefined,
      mode: activeMode ?? undefined,
      sort: 'rating',
    }).then(r => r.data.data),
  });

  const filtered = (data ?? []).filter(p =>
    !search || p.business_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location_text ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.headline}>Find your perfect stylist</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search by name or area..."
          placeholderTextColor={COLORS.text2}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !activeCategory && styles.chipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {SERVICE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
            onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
          >
            <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mode filter */}
      <View style={styles.modeRow}>
        {[
          { id: null, label: 'All' },
          { id: 'home', label: '🏠 Home Service' },
          { id: 'walkin', label: '🏪 Walk-In' },
        ].map(m => (
          <TouchableOpacity
            key={String(m.id)}
            style={[styles.modeBtn, activeMode === m.id && styles.modeBtnActive]}
            onPress={() => setActiveMode(m.id)}
          >
            <Text style={[styles.modeBtnText, activeMode === m.id && styles.modeBtnTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Provider list */}
      {isLoading ? (
        <LoadingSpinner message="Finding providers..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <EmptyState emoji="🔍" title="No providers found" body="Try a different category or area" />
          }
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => router.push(`/(hirer)/provider/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const ProviderCard = ({ provider, onPress }: { provider: Provider; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarBox}>
        <Text style={styles.avatarText}>{provider.business_name[0]}</Text>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.businessName}>{provider.business_name}</Text>
          {provider.cac_verified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.location}>📍 {provider.location_text ?? 'Lagos'}</Text>
        <StarRating rating={provider.rating_avg} count={provider.rating_count} />
      </View>
      {provider.distance_km != null && (
        <Text style={styles.distance}>{provider.distance_km.toFixed(1)}km</Text>
      )}
    </View>

    <View style={styles.categories}>
      {provider.service_categories.slice(0, 3).map(cat => {
        const found = SERVICE_CATEGORIES.find(c => c.id === cat);
        return (
          <View key={cat} style={styles.catChip}>
            <Text style={styles.catText}>{found?.emoji} {found?.label ?? cat}</Text>
          </View>
        );
      })}
      {provider.service_categories.length > 3 && (
        <View style={styles.catChip}>
          <Text style={styles.catText}>+{provider.service_categories.length - 3}</Text>
        </View>
      )}
    </View>

    <View style={styles.cardFooter}>
      <Text style={styles.price}>From ₦{(provider.base_fee_kobo / 100).toLocaleString()}</Text>
      <View style={styles.modes}>
        {provider.service_modes.map(m => (
          <Badge key={m} label={m === 'home' ? '🏠 Home' : '🏪 Walk-in'} variant="info" />
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    padding: SPACING.lg, paddingTop: 56,
    backgroundColor: COLORS.bg0,
  },
  greeting:  { fontSize: 14, color: COLORS.text1 },
  headline:  { fontSize: 22, fontWeight: '800', color: COLORS.text0, marginTop: 2 },
  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  search: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, fontSize: 15, color: COLORS.text0,
  },
  chips: { paddingLeft: SPACING.md, marginBottom: SPACING.sm, maxHeight: 44 },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    marginRight: SPACING.xs, backgroundColor: COLORS.bg1,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:   { fontSize: 13, color: COLORS.text1, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  modeRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.md,
    gap: SPACING.xs, marginBottom: SPACING.sm,
  },
  modeBtn: {
    flex: 1, padding: SPACING.xs, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bg1, alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: COLORS.bg2, borderColor: COLORS.primary },
  modeBtnText:     { fontSize: 12, color: COLORS.text1, fontWeight: '500' },
  modeBtnTextActive: { color: COLORS.primary },
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  avatarBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  cardInfo: { flex: 1 },
  nameRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  businessName: { fontSize: 15, fontWeight: '700', color: COLORS.text0 },
  verified: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  location: { fontSize: 12, color: COLORS.text1, marginBottom: 4 },
  distance: { fontSize: 12, color: COLORS.text2, fontWeight: '600' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.xs, paddingVertical: 3,
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.sm,
  },
  catText: { fontSize: 11, color: COLORS.text1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  modes: { flexDirection: 'row', gap: 4 },
});
