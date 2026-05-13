import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedApi } from '../../../src/api/notifications.api';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';
import { StarRating, EmptyState, LoadingSpinner, Button } from '../../../src/components/ui';

export default function SavedScreen() {
  const router = useRouter();
  const qc     = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['saved-providers'],
    queryFn:  () => savedApi.listProviders().then((r: any) => r.data.data),
  });

  const unsave = useMutation({
    mutationFn: (id: string) => savedApi.toggleProvider(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-providers'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Providers</Text>

      <FlatList
        data={data ?? []}
        keyExtractor={(p: any) => p.provider_id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <EmptyState
            emoji="❤️"
            title="No saved providers yet"
            body="Tap the heart icon on any provider to save them here"
            action={<Button title="Explore Providers" onPress={() => router.push('/(hirer)/(tabs)')} fullWidth={false} />}
          />
        }
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(hirer)/provider/${item.provider_id}`)}
            activeOpacity={0.9}
          >
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.business_name?.[0] ?? 'S'}</Text>
              </View>
              <View>
                <Text style={styles.name}>{item.business_name}</Text>
                <Text style={styles.location}>📍 {item.location_text ?? 'Lagos'}</Text>
                <StarRating rating={item.rating_avg ?? 0} count={item.rating_count ?? 0} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => unsave.mutate(item.provider_id)}
              style={styles.heartBtn}
            >
              <Text style={styles.heart}>❤️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title:  { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56 },
  list:   { padding: SPACING.md },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  name:       { fontSize: 15, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  location:   { fontSize: 12, color: COLORS.text1, marginBottom: 4 },
  heartBtn:   { padding: SPACING.xs },
  heart:      { fontSize: 20 },
});
