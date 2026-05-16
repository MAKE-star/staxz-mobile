import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C } from '../../../src/constants';

const LAGOS_AREAS = [
  'Lekki Phase 1', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba',
  'Ikeja GRA', 'Ajah', 'Sangotedo', 'Gbagada', 'Maryland',
  'Magodo', 'Ojodu Berger', 'Ogba', 'Festac', 'Isolo',
];

export default function Step4() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue = /^\+234[0-9]{10}$/.test(data.whatsapp_number)
    && data.location_text.trim().length >= 3;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={3} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>WhatsApp & Location</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>
            Clients contact you on WhatsApp after booking
          </Text>

          {/* WhatsApp info box */}
          <View style={{ backgroundColor: C.green + '15', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.green + '30', flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontSize: 24 }}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.text0, marginBottom: 4 }}>How it works</Text>
              <Text style={{ fontSize: 13, color: C.text1, lineHeight: 18 }}>
                When a client sends an enquiry, our bot messages you on WhatsApp with their details. Reply with your price (e.g. "8000") and we handle the rest.
              </Text>
            </View>
          </View>

          {/* WhatsApp number */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>WhatsApp Number *</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 54, marginBottom: 6 }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🇳🇬</Text>
            <TextInput value={data.whatsapp_number} onChangeText={v => update({ whatsapp_number: v })}
              keyboardType="phone-pad" placeholder="+2348012345678" maxLength={14}
              style={{ flex: 1, fontSize: 15, color: C.text0 }} placeholderTextColor={C.text2} />
          </View>
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 24 }}>Must have WhatsApp active on this number</Text>

          {/* Location */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Area / Neighbourhood *</Text>
          <TextInput value={data.location_text} onChangeText={v => update({ location_text: v })}
            placeholder="e.g. Lekki Phase 1, Lagos" maxLength={200}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 12 }} />

          {/* Quick pick */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.text2, marginBottom: 8 }}>Quick pick:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {LAGOS_AREAS.map(area => (
              <TouchableOpacity key={area} onPress={() => update({ location_text: area })}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: data.location_text === area ? C.primary : C.border, backgroundColor: data.location_text === area ? C.primary : C.bg1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: data.location_text === area ? C.white : C.text1 }}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step5')} disabled={!canContinue}
            style={{ backgroundColor: canContinue ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: canContinue ? 8 : 0 }}>
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
