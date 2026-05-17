import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C, CATS } from '../../../src/constants';

const MIN_PHOTOS = 3;

export default function Step3() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const selectedCats = CATS.filter(c => data.service_categories.includes(c.id));

  const addPhoto = async (catId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload portfolio photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(catId);
    // Store locally for now — will upload on final submit
    const uri = result.assets[0].uri;
    setPhotos(prev => ({
      ...prev,
      [catId]: [...(prev[catId] ?? []), uri],
    }));
    // Save to onboarding store
    update({ [`portfolio_${catId}`]: [...(photos[catId] ?? []), uri] } as any);
    setUploading(null);
  };

  const removePhoto = (catId: string, idx: number) => {
    Alert.alert('Remove photo?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => setPhotos(prev => ({
          ...prev,
          [catId]: (prev[catId] ?? []).filter((_, i) => i !== idx),
        })),
      },
    ]);
  };

  // All categories must have at least 3 photos
  const allReady = selectedCats.length > 0
    && selectedCats.every(cat => (photos[cat.id] ?? []).length >= MIN_PHOTOS);

  const totalPhotos = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Progress current={2} onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Portfolio Photos</Text>
        <Text style={{ fontSize: 14, color: C.text2, marginBottom: 8 }}>
          Upload at least {MIN_PHOTOS} photos per service category to continue.
        </Text>

        {/* Overall progress */}
        <View style={{ backgroundColor: allReady ? C.green + '15' : C.amberLo, borderRadius: 12, padding: 12, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: allReady ? C.green + '40' : C.amber + '40' }}>
          <Text style={{ fontSize: 20 }}>{allReady ? '✅' : '📸'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: allReady ? C.green : C.amber }}>
              {allReady ? 'All photos uploaded! Ready to continue.' : `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} uploaded — need ${MIN_PHOTOS} per category`}
            </Text>
          </View>
        </View>

        {/* Per category */}
        {selectedCats.map(cat => {
          const catPhotos = photos[cat.id] ?? [];
          const ready = catPhotos.length >= MIN_PHOTOS;
          return (
            <View key={cat.id} style={{ backgroundColor: C.bg1, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: ready ? C.green + '40' : C.border }}>
              {/* Category header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.text0 }}>{cat.label}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: ready ? C.green + '20' : C.amberLo }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: ready ? C.green : C.amber }}>
                    {catPhotos.length}/{MIN_PHOTOS} photos
                  </Text>
                </View>
              </View>

              {/* Photo grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {catPhotos.map((uri, i) => (
                  <TouchableOpacity key={i} onLongPress={() => removePhoto(cat.id, i)}
                    style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden' }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                    <View style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: C.white, fontSize: 10 }}>✕</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Add photo button */}
                {catPhotos.length < 10 && (
                  <TouchableOpacity onPress={() => addPhoto(cat.id)} disabled={uploading === cat.id}
                    style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', backgroundColor: C.bg2, alignItems: 'center', justifyContent: 'center' }}>
                    {uploading === cat.id
                      ? <ActivityIndicator color={C.primary} />
                      : <>
                          <Text style={{ fontSize: 28, color: C.primary }}>📷</Text>
                          <Text style={{ fontSize: 10, color: C.text2, marginTop: 2 }}>Add photo</Text>
                        </>
                    }
                  </TouchableOpacity>
                )}
              </View>

              {!ready && (
                <Text style={{ fontSize: 11, color: C.amber, marginTop: 8 }}>
                  Add {MIN_PHOTOS - catPhotos.length} more photo{MIN_PHOTOS - catPhotos.length !== 1 ? 's' : ''} to unlock this category
                </Text>
              )}
            </View>
          );
        })}

        <Text style={{ fontSize: 12, color: C.text2, textAlign: 'center', marginBottom: 20 }}>
          Long press a photo to remove it
        </Text>

        <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step4')} disabled={!allReady}
          style={{ backgroundColor: allReady ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: allReady ? 8 : 0 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
