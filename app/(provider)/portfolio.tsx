import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '../../src/api/providers.api';
import { useAuthStore } from '../../src/store/auth.store';
import { COLORS, SPACING, RADIUS, SERVICE_CATEGORIES } from '../../src/constants';
import { ScreenHeader, LoadingSpinner, EmptyState } from '../../src/components/ui';
import { getErrorMessage } from '../../src/api/client';

export default function PortfolioScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: liveStatus, isLoading } = useQuery({
    queryKey: ['provider-live-status'],
    queryFn: () => providersApi.getLiveStatus().then((r: any) => r.data.data),
  });

  const { data: provider } = useQuery({
    queryKey: ['my-provider'],
    queryFn: () => {
      // get provider id from live status query data
      return providersApi.getLiveStatus().then((r: any) => r.data.data);
    },
  });

  const deletePhoto = useMutation({
    mutationFn: ({ providerId, photoId }: { providerId: string; photoId: string }) =>
      providersApi.deletePhoto(providerId, photoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-live-status'] }),
  });

  const handleUpload = async (categoryId: string, providerId: string) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload portfolio photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      await providersApi.uploadPhoto(providerId, categoryId, result.assets[0].uri);
      qc.invalidateQueries({ queryKey: ['provider-live-status'] });
      Alert.alert('✅ Uploaded!', 'Photo added to your portfolio.');
    } catch (err) {
      Alert.alert('Upload failed', getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const { isLive, missingCategories, photoCounts } = liveStatus ?? {};
  const categories = SERVICE_CATEGORIES.filter(c =>
    provider?.service_categories?.includes(c.id)
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Portfolio" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Go-live status banner */}
        <View style={[styles.statusBanner, isLive ? styles.bannerLive : styles.bannerPending]}>
          <Text style={styles.bannerEmoji}>{isLive ? '🟢' : '🟡'}</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {isLive ? 'Profile is Live!' : 'Almost live — add more photos'}
            </Text>
            <Text style={styles.bannerSub}>
              {isLive
                ? 'Clients can find and book you'
                : `${missingCategories?.length ?? 0} categories need 3+ photos`
              }
            </Text>
          </View>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catTabs}>
          <TouchableOpacity
            style={[styles.catTab, !selectedCat && styles.catTabActive]}
            onPress={() => setSelectedCat(null)}
          >
            <Text style={[styles.catTabText, !selectedCat && styles.catTabTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => {
            const count = photoCounts?.[cat.id] ?? 0;
            const needsMore = count < 3;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTab, selectedCat === cat.id && styles.catTabActive]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <Text style={[styles.catTabText, selectedCat === cat.id && styles.catTabTextActive]}>
                  {cat.emoji} {cat.label}
                </Text>
                <View style={[styles.countBadge, needsMore ? styles.countBadgeWarn : styles.countBadgeOk]}>
                  <Text style={styles.countText}>{count}/3</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Per-category photo grids */}
        {categories
          .filter(c => !selectedCat || c.id === selectedCat)
          .map(cat => {
            const photos = provider?.portfolioPhotos?.filter((p: any) => p.category_id === cat.id) ?? [];
            const count  = photoCounts?.[cat.id] ?? 0;
            const needsMore = count < 3;

            return (
              <View key={cat.id} style={styles.catSection}>
                <View style={styles.catHeader}>
                  <Text style={styles.catTitle}>{cat.emoji} {cat.label}</Text>
                  <View style={[styles.countPill, needsMore ? styles.pillWarn : styles.pillOk]}>
                    <Text style={[styles.countPillText, needsMore ? styles.pillTextWarn : styles.pillTextOk]}>
                      {count}/3 photos
                    </Text>
                  </View>
                </View>

                <View style={styles.photoGrid}>
                  {/* Existing photos */}
                  {photos.map((photo: any) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.photoBox}
                      onLongPress={() => {
                        Alert.alert('Delete Photo?', 'This will remove the photo from your portfolio.', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deletePhoto.mutate({ providerId: provider?.id, photoId: photo.id }) },
                        ]);
                      }}
                    >
                      <Image source={{ uri: photo.url }} style={styles.photo} />
                    </TouchableOpacity>
                  ))}

                  {/* Add photo slot */}
                  {count < 10 && (
                    <TouchableOpacity
                      style={[styles.photoBox, styles.addPhotoBox]}
                      onPress={() => provider?.id && handleUpload(cat.id, provider.id)}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator color={COLORS.primary} />
                      ) : (
                        <>
                          <Text style={styles.addIcon}>+</Text>
                          <Text style={styles.addText}>Add photo</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {needsMore && (
                  <Text style={styles.needMore}>
                    Need {3 - count} more photo{3 - count !== 1 ? 's' : ''} to go live in this category
                  </Text>
                )}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.md, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1,
  },
  bannerLive:    { backgroundColor: COLORS.greenLo, borderColor: COLORS.green },
  bannerPending: { backgroundColor: COLORS.amberLo, borderColor: COLORS.amber },
  bannerEmoji:   { fontSize: 24 },
  bannerText:    { flex: 1 },
  bannerTitle:   { fontSize: 14, fontWeight: '700', color: COLORS.text0 },
  bannerSub:     { fontSize: 12, color: COLORS.text1, marginTop: 2 },
  catTabs: { marginBottom: SPACING.md, maxHeight: 44 },
  catTab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    marginRight: SPACING.xs, backgroundColor: COLORS.bg1,
  },
  catTabActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catTabText:       { fontSize: 13, color: COLORS.text1, fontWeight: '500' },
  catTabTextActive: { color: COLORS.white },
  countBadge:     { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 8 },
  countBadgeWarn: { backgroundColor: COLORS.amberLo },
  countBadgeOk:   { backgroundColor: COLORS.greenLo },
  countText: { fontSize: 10, fontWeight: '700' },
  catSection:  { marginBottom: SPACING.lg },
  catHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  catTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.text0 },
  countPill:   { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  pillOk:      { backgroundColor: COLORS.greenLo },
  pillWarn:    { backgroundColor: COLORS.amberLo },
  countPillText:    { fontSize: 11, fontWeight: '700' },
  pillTextOk:       { color: COLORS.green },
  pillTextWarn:     { color: COLORS.amber },
  photoGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  photoBox:    { width: '31%', aspectRatio: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  photo:       { width: '100%', height: '100%' },
  addPhotoBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addIcon: { fontSize: 24, color: COLORS.primary, fontWeight: '300' },
  addText: { fontSize: 11, color: COLORS.text1, marginTop: 2 },
  needMore: { fontSize: 12, color: COLORS.amber, marginTop: SPACING.xs },
});
