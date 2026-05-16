import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C, CATS } from '../../../src/constants';

export default function Step3() {
  const router = useRouter();
  const { data } = useOnboarding();

  const selectedCats = CATS.filter(c => data.service_categories.includes(c.id));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Progress current={2} onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Portfolio Photos</Text>
        <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>
          You need at least 3 photos per service to go live. Upload after setup.
        </Text>

        {/* Hero */}
        <View style={{ backgroundColor: C.primary + '12', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.primary + '30' }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📸</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text0, textAlign: 'center', marginBottom: 8 }}>
            Photos = More Bookings
          </Text>
          <Text style={{ fontSize: 13, color: C.text1, textAlign: 'center', lineHeight: 20 }}>
            Providers with 3+ photos per service get <Text style={{ fontWeight: '700', color: C.primary }}>5x more bookings</Text>. Upload yours from your dashboard after setup.
          </Text>
        </View>

        {/* Required photos per category */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0, marginBottom: 12 }}>Your categories need:</Text>
        {selectedCats.map(cat => (
          <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>{cat.icon}</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.text0 }}>{cat.label}</Text>
            <View style={{ backgroundColor: C.amberLo, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.amber }}>3 photos needed</Text>
            </View>
          </View>
        ))}

        {/* Tips */}
        <View style={{ backgroundColor: C.bg2, borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.text0, marginBottom: 8 }}>💡 Photo tips</Text>
          {['Use good natural lighting', 'Show before & after', 'Only show your own work', 'Clear, sharp images only'].map(tip => (
            <Text key={tip} style={{ fontSize: 13, color: C.text1, marginBottom: 4 }}>• {tip}</Text>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step4')}
          style={{ backgroundColor: C.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: 8 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Got it, continue →</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: C.text2, textAlign: 'center', marginTop: 12 }}>
          You'll upload photos from your dashboard after setup
        </Text>
      </View>
    </ScrollView>
  );
}
