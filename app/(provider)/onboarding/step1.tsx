import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C } from '../../../src/constants';

export default function Step1() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const toggleMode = (id: string) => {
    const modes = data.service_modes.includes(id)
      ? data.service_modes.filter(m => m !== id)
      : [...data.service_modes, id];
    update({ service_modes: modes });
  };

  const canContinue = data.business_name.trim().length >= 2
    && data.business_type !== ''
    && data.service_modes.length > 0
    && data.base_fee !== '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={0} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>Business Info</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>Tell clients about your business</Text>

          {/* Business Name */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Business Name *</Text>
          <TextInput value={data.business_name} onChangeText={v => update({ business_name: v })}
            placeholder="e.g. Supreme Cuts, Glow by Ada" maxLength={120}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 20 }} />

          {/* Business Type */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 10 }}>Business Type *</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'salon', emoji: '🏪', label: 'Salon / Studio', sub: 'Fixed location' },
              { id: 'independent', emoji: '🚀', label: 'Independent', sub: 'Mobile / Solo' },
            ].map(r => (
              <TouchableOpacity key={r.id} onPress={() => update({ business_type: r.id })}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: data.business_type === r.id ? C.primary : C.border, backgroundColor: data.business_type === r.id ? C.bg2 : C.bg1 }}>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{r.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: data.business_type === r.id ? C.primary : C.text0 }}>{r.label}</Text>
                <Text style={{ fontSize: 12, color: C.text2 }}>{r.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Service Mode */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 10 }}>How do you work? *</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'home', emoji: '🏠', label: 'Home Service', sub: 'You travel to client' },
              { id: 'walkin', emoji: '🏪', label: 'Walk-In', sub: 'Client comes to you' },
            ].map(m => (
              <TouchableOpacity key={m.id} onPress={() => toggleMode(m.id)}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: data.service_modes.includes(m.id) ? C.primary : C.border, backgroundColor: data.service_modes.includes(m.id) ? C.bg2 : C.bg1 }}>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{m.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: data.service_modes.includes(m.id) ? C.primary : C.text0 }}>{m.label}</Text>
                <Text style={{ fontSize: 12, color: C.text2 }}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Base Fee */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Base Fee (₦) *</Text>
          <TextInput value={data.base_fee} onChangeText={v => update({ base_fee: v.replace(/[^0-9]/g, '') })}
            placeholder="e.g. 5000" keyboardType="number-pad"
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4 }} />
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 20 }}>Minimum starting price. You quote higher per job.</Text>

          {/* CAC (optional) */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>CAC Number <Text style={{ fontWeight: '400', color: C.text2 }}>(optional — gets you a ✓ badge)</Text></Text>
          <TextInput value={data.cac_number} onChangeText={v => update({ cac_number: v })}
            placeholder="RC-1234567 or BN-9515166" autoCapitalize="characters"
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 20 }} />

          {/* Bio (optional) */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.text1, marginBottom: 6 }}>Bio <Text style={{ fontWeight: '400', color: C.text2 }}>(optional)</Text></Text>
          <TextInput value={data.bio} onChangeText={v => update({ bio: v })}
            placeholder="Tell clients what makes you special..." multiline numberOfLines={3} maxLength={300}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4, minHeight: 80, textAlignVertical: 'top' }} />
          <Text style={{ fontSize: 11, color: C.text2, marginBottom: 32 }}>{data.bio.length}/300</Text>

          {/* Continue */}
          <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step2')} disabled={!canContinue}
            style={{ backgroundColor: canContinue ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOpacity: canContinue ? 0.35 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: canContinue ? 8 : 0 }}>
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
