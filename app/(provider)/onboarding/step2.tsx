import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C, CATS } from '../../../src/constants';

export default function Step2() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const toggle = (id: string) => {
    const cats = data.service_categories.includes(id)
      ? data.service_categories.filter(c => c !== id)
      : [...data.service_categories, id];
    update({ service_categories: cats });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Progress current={1} onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Services</Text>
        <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>
          Select all the services you offer. You need at least 1.
        </Text>

        {/* Category grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
          {CATS.map(cat => {
            const selected = data.service_categories.includes(cat.id);
            return (
              <TouchableOpacity key={cat.id} onPress={() => toggle(cat.id)} activeOpacity={0.8}
                style={{
                  width: '47%', padding: 14, borderRadius: 14, borderWidth: 2,
                  borderColor: selected ? cat.color : C.border,
                  backgroundColor: selected ? cat.color + '15' : C.bg1,
                }}>
                <Text style={{ fontSize: 26, marginBottom: 6 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? cat.color : C.text0 }}>{cat.label}</Text>
                {selected && (
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: cat.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 13, color: C.text2, marginBottom: 20, textAlign: 'center' }}>
          {data.service_categories.length} service{data.service_categories.length !== 1 ? 's' : ''} selected
        </Text>

        <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step3')}
          disabled={data.service_categories.length === 0}
          style={{ backgroundColor: data.service_categories.length > 0 ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: data.service_categories.length > 0 ? 8 : 0 }}>
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
