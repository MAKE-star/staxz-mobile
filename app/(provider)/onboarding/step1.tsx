import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C } from '../../../src/constants';

const LAGOS_AREAS = [
  'Lekki Phase 1', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba',
  'Ikeja GRA', 'Ajah', 'Sangotedo', 'Gbagada', 'Maryland',
  'Magodo', 'Ojodu Berger', 'Ogba', 'Festac', 'Isolo',
];

export default function Step1() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const toggleMode = (id: string) => {
    const modes = data.service_modes.includes(id)
      ? data.service_modes.filter(m => m !== id)
      : [...data.service_modes, id];
    update({ service_modes: modes });
  };

  const cacValid = /^(RC|BN|IT|LP|LLP)-?\d{5,9}$/i.test(data.cac_number.trim());

  const canContinue = data.business_name.trim().length >= 2
    && data.business_type !== ''
    && cacValid
    && data.location_text.trim().length >= 3
    && data.service_modes.length > 0
    && data.base_fee !== '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={0} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Tell us about your business</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>This information will be verified and shown to clients.</Text>

          {/* Business Type */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Business Type</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[{ id: 'salon', label: 'Salon / Shop' }, { id: 'independent', label: 'Independent' }].map(r => (
              <TouchableOpacity key={r.id} onPress={() => update({ business_type: r.id })}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: data.business_type === r.id ? C.primary : C.border, backgroundColor: data.business_type === r.id ? C.bg2 : C.bg1, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: data.business_type === r.id ? C.primary : C.text0 }}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Business Name */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Business Name</Text>
          <TextInput value={data.business_name} onChangeText={v => update({ business_name: v })}
            placeholder="e.g. Supreme Cuts" maxLength={120}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 20 }} />

          {/* CAC Number - mandatory */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>CAC Registration Number</Text>
          <TextInput value={data.cac_number} onChangeText={v => update({ cac_number: v })}
            placeholder="RC-0000000" autoCapitalize="characters" maxLength={15}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: data.cac_number && !cacValid ? C.red : data.cac_number && cacValid ? C.green : C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4 }} />
          {data.cac_number && !cacValid && (
            <Text style={{ fontSize: 12, color: C.red, marginBottom: 4 }}>Format: RC-1234567 or BN-9515166</Text>
          )}
          {data.cac_number && cacValid && (
            <Text style={{ fontSize: 12, color: C.green, marginBottom: 4 }}>✓ Valid CAC format</Text>
          )}
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 20 }}>Verifies your legal accountability on the platform</Text>

          {/* Location */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Location</Text>
          <TextInput value={data.location_text} onChangeText={v => update({ location_text: v })}
            placeholder="e.g. Yaba, Lekki Phase 1, Surulere..."
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {LAGOS_AREAS.map(area => (
              <TouchableOpacity key={area} onPress={() => update({ location_text: area })}
                style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: data.location_text === area ? C.primary : C.border, backgroundColor: data.location_text === area ? C.primary : C.bg1 }}>
                <Text style={{ fontSize: 11, color: data.location_text === area ? C.white : C.text2 }}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Service Mode */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Service Mode</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'home', emoji: '🏠', label: 'Home Service', sub: 'You travel to client' },
              { id: 'walkin', emoji: '🪑', label: 'Walk-In Only', sub: 'Client comes to you' },
            ].map(m => (
              <TouchableOpacity key={m.id} onPress={() => toggleMode(m.id)}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: data.service_modes.includes(m.id) ? C.primary : C.border, backgroundColor: data.service_modes.includes(m.id) ? C.bg2 : C.bg1 }}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{m.emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: data.service_modes.includes(m.id) ? C.primary : C.text0 }}>{m.label}</Text>
                <Text style={{ fontSize: 11, color: C.text2 }}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Base Fee */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Base Fee (₦)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 54, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, color: C.primary, marginRight: 8, fontWeight: '700' }}>₦</Text>
            <TextInput value={data.base_fee} onChangeText={v => update({ base_fee: v.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 5000" keyboardType="number-pad"
              style={{ flex: 1, fontSize: 15, color: C.text0 }} placeholderTextColor={C.text2} />
          </View>
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 32 }}>Minimum starting price. You can quote higher per job.</Text>

          <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step2')} disabled={!canContinue}
            style={{ backgroundColor: canContinue ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: canContinue ? 8 : 0 }}>
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
