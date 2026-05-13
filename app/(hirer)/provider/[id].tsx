import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, Dimensions, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '../../../src/api/providers.api';
import { savedApi } from '../../../src/api/notifications.api';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../../src/constants';
import {
  StarRating, Badge, LoadingSpinner, EmptyState,
  ScreenHeader, Button,
} from '../../../src/components/ui';

const { width } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn:  () => providersApi.getById(id).then(r => r.data.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ['provider-reviews', id],
    queryFn:  () => providersApi.getReviews(id).then(r => r.data.data),
    enabled: activeTab === 'reviews',
  });

  const { data: savedStatus } = useQuery({
    queryKey: ['saved-status', id],
    queryFn:  () => savedApi.checkSaved(id).then(r => r.data.data.saved),
  });

  const toggleSave = useMutation({
    mutationFn: () => savedApi.toggleProvider(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['saved-status', id] }),
  });

  if (isLoading) return <LoadingSpinner message="Loading provider..." />;
  if (!provider) return <EmptyState emoji="😕" title="Provider not found" />;

  const portfolioPhotos = provider.portfolioPhotos ?? [];
  const filteredPhotos = activeCategory
    ? portfolioPhotos.filter(p => p.category_id === activeCategory)
    : portfolioPhotos;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={provider.business_name}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => toggleSave.mutate()} style={styles.heartBtn}>
            <Text style={styles.heart}>{savedStatus ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{provider.business_name[0]}</Text>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.businessName}>{provider.business_name}</Text>
              {provider.cac_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.location}>📍 {provider.location_text ?? 'Lagos'}</Text>
            <StarRating rating={provider.rating_avg} count={provider.rating_count} size={15} />
            <View style={styles.modeChips}>
              {provider.service_modes.map(m => (
                <Badge
                  key={m}
                  label={m === 'home' ? '🏠 Home Service' : '🏪 Walk-In'}
                  variant="info"
                />
              ))}
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.rating_avg.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.rating_count}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.years_experience ?? '—'}</Text>
            <Text style={styles.statLabel}>Yrs Exp</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>₦{Math.round(provider.base_fee_kobo / 100).toLocaleString()}</Text>
            <Text style={styles.statLabel}>From</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['about', 'portfolio', 'reviews'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        {activeTab === 'about' && (
          <View style={styles.section}>
            {provider.bio && (
              <>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bio}>{provider.bio}</Text>
              </>
            )}

            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.serviceGrid}>
              {provider.service_categories.map(cat => {
                const found = SERVICE_CATEGORIES.find(c => c.id === cat);
                return (
                  <View key={cat} style={styles.serviceChip}>
                    <Text style={styles.serviceEmoji}>{found?.emoji}</Text>
                    <Text style={styles.serviceLabel}>{found?.label ?? cat}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Portfolio */}
        {activeTab === 'portfolio' && (
          <View style={styles.section}>
            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catFilter}>
              <TouchableOpacity
                style={[styles.catChip, !activeCategory && styles.catChipActive]}
                onPress={() => setActiveCategory(null)}
              >
                <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>All</Text>
              </TouchableOpacity>
              {provider.service_categories.map(cat => {
                const found = SERVICE_CATEGORIES.find(c => c.id === cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                    onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  >
                    <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                      {found?.emoji} {found?.label ?? cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {filteredPhotos.length === 0 ? (
              <EmptyState emoji="📸" title="No photos yet" />
            ) : (
              <View style={styles.photoGrid}>
                {filteredPhotos.map(photo => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.url }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <View style={styles.section}>
            {!reviews?.length ? (
              <EmptyState emoji="⭐" title="No reviews yet" body="Be the first to review!" />
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.reviewer_name ?? 'Client'}</Text>
                    <StarRating rating={review.stars} />
                  </View>
                  {review.body && <Text style={styles.reviewBody}>{review.body}</Text>}
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book CTA */}
      <View style={styles.cta}>
        <View>
          <Text style={styles.ctaLabel}>Starting from</Text>
          <Text style={styles.ctaPrice}>₦{(provider.base_fee_kobo / 100).toLocaleString()}</Text>
        </View>
        <Button
          title="Book Now"
          onPress={() => router.push({ pathname: '/(hirer)/provider/enquiry', params: { providerId: id } })}
          fullWidth={false}
          style={styles.ctaBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg0 },
  heartBtn:   { padding: SPACING.xs },
  heart:      { fontSize: 22 },
  hero: {
    flexDirection: 'row', gap: SPACING.md,
    padding: SPACING.lg, backgroundColor: COLORS.bg1,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  heroAvatar: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 30, fontWeight: '800', color: COLORS.white },
  heroInfo:   { flex: 1 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 4, flexWrap: 'wrap' },
  businessName: { fontSize: 18, fontWeight: '800', color: COLORS.text0 },
  verifiedBadge: { backgroundColor: COLORS.greenLo, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  verifiedText:  { fontSize: 10, color: COLORS.green, fontWeight: '700' },
  location:   { fontSize: 13, color: COLORS.text1, marginBottom: 4 },
  modeChips:  { flexDirection: 'row', gap: 4, marginTop: SPACING.xs, flexWrap: 'wrap' },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.bg1,
    paddingVertical: SPACING.md, marginBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stat:       { flex: 1, alignItems: 'center' },
  statValue:  { fontSize: 16, fontWeight: '800', color: COLORS.text0, marginBottom: 2 },
  statLabel:  { fontSize: 11, color: COLORS.text2 },
  statDivider:{ width: 1, backgroundColor: COLORS.border },
  tabs: {
    flexDirection: 'row', backgroundColor: COLORS.bg1,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive:  { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText:    { fontSize: 14, color: COLORS.text2, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  section:    { padding: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
  bio:        { fontSize: 14, color: COLORS.text1, lineHeight: 22, marginBottom: SPACING.lg },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  serviceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  serviceEmoji: { fontSize: 16 },
  serviceLabel: { fontSize: 13, color: COLORS.text1, fontWeight: '500' },
  catFilter:  { marginBottom: SPACING.md, maxHeight: 40 },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    marginRight: SPACING.xs, backgroundColor: COLORS.bg1,
  },
  catChipActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText:      { fontSize: 12, color: COLORS.text1, fontWeight: '500' },
  catChipTextActive: { color: COLORS.white },
  photoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  photo:      { width: (width - SPACING.lg * 2 - 4) / 3, height: (width - SPACING.lg * 2 - 4) / 3, borderRadius: RADIUS.sm },
  reviewCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.text0 },
  reviewBody:   { fontSize: 13, color: COLORS.text1, lineHeight: 20, marginBottom: SPACING.xs },
  reviewDate:   { fontSize: 11, color: COLORS.text2 },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg1, padding: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: 32,
  },
  ctaLabel: { fontSize: 12, color: COLORS.text2 },
  ctaPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  ctaBtn:   { paddingHorizontal: SPACING.xl },
});
