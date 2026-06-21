import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../../src/store/onboarding';
import { Progress } from '../../../src/components/Progress';
import { C } from '../../../src/constants';
import { STATES, getAreasForState } from '../../../src/constants/locations';

export default function Step4() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const areas = data.state ? getAreasForState(data.state) : [];

  const filteredStates = STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const canContinue = /^\+234[0-9]{10}$/.test(data.whatsapp_number)
    && data.state !== ''
    && data.location_text.trim().length >= 3
    && data.full_address.trim().length >= 5;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Progress current={3} onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.text0, marginBottom: 4 }}>WhatsApp & Location</Text>
          <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>
            Help clients find and contact you
          </Text>

          {/* WhatsApp info */}
          <View style={{ backgroundColor: C.green + '15', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: C.green + '30', flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.text0, marginBottom: 3 }}>How enquiries work</Text>
              <Text style={{ fontSize: 12, color: C.text1, lineHeight: 18 }}>
                When a client sends an enquiry, our bot messages you on WhatsApp with their details. Reply with your price to accept.
              </Text>
            </View>
          </View>

          {/* WhatsApp number */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>WhatsApp Number *</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: /^\+234[0-9]{10}$/.test(data.whatsapp_number) ? C.green : C.border, paddingHorizontal: 14, height: 54, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🇳🇬</Text>
            <TextInput value={data.whatsapp_number} onChangeText={v => update({ whatsapp_number: v })}
              keyboardType="phone-pad" placeholder="+2348012345678" maxLength={14}
              style={{ flex: 1, fontSize: 15, color: C.text0 }} placeholderTextColor={C.text2} />
            {/^\+234[0-9]{10}$/.test(data.whatsapp_number) && <Text style={{ color: C.green }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 24 }}>Must have WhatsApp active on this number</Text>

          {/* ── STATE ─────────────────────────────────────────────────────────── */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>State *</Text>
          <TouchableOpacity onPress={() => setStateOpen(true)}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: data.state ? C.primary : C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 15, color: data.state ? C.text0 : C.text2 }}>
              {data.state || 'Select your state'}
            </Text>
            <Text style={{ color: C.text2 }}>▼</Text>
          </TouchableOpacity>

          {/* ── AREA / NEIGHBOURHOOD ─────────────────────────────────────────── */}
          {data.state !== '' && (
            <>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Area / Neighbourhood *</Text>
              <TextInput value={data.location_text} onChangeText={v => update({ location_text: v })}
                placeholder="e.g. Lekki Phase 1"
                style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 10 }} />

              {/* Quick-pick chips for selected state */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.text2, marginBottom: 8 }}>Quick pick:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {areas.map(area => (
                  <TouchableOpacity key={area} onPress={() => update({ location_text: area })}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: data.location_text === area ? C.primary : C.border, backgroundColor: data.location_text === area ? C.primary : C.bg1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: data.location_text === area ? C.white : C.text1 }}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── FULL ADDRESS ─────────────────────────────────────────────────── */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.text2, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Full Address *</Text>
          <TextInput
            value={data.full_address}
            onChangeText={v => update({ full_address: v })}
            placeholder="e.g. 12 Admiralty Way, Lekki Phase 1, Lagos"
            multiline numberOfLines={2}
            style={{ backgroundColor: C.bg1, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, color: C.text0, marginBottom: 4, minHeight: 70, textAlignVertical: 'top' }}
          />
          <Text style={{ fontSize: 12, color: C.text2, marginBottom: 32 }}>
            Exact address shown to clients only after confirmed booking
          </Text>

          <TouchableOpacity onPress={() => router.push('/(provider)/onboarding/step5')} disabled={!canContinue}
            style={{ backgroundColor: canContinue ? C.primary : C.border, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', elevation: canContinue ? 8 : 0 }}>
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* State picker modal */}
      <Modal visible={stateOpen} transparent animationType="slide" onRequestClose={() => setStateOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setStateOpen(false)} />
        <View style={{ backgroundColor: C.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' }}>
          <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text0, marginBottom: 12 }}>Select State</Text>

          {/* Search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg2, borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ marginRight: 8 }}>🔍</Text>
            <TextInput value={stateSearch} onChangeText={setStateSearch}
              placeholder="Search state..." placeholderTextColor={C.text2}
              style={{ flex: 1, fontSize: 14, color: C.text0 }} />
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={s => s}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  update({ state: item, location_text: '', full_address: '' });
                  setStateSearch('');
                  setStateOpen(false);
                }}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: item === data.state ? C.bg2 : 'transparent' }}>
                <Text style={{ fontSize: 15, color: item === data.state ? C.primary : C.text0, fontWeight: item === data.state ? '700' : '400' }}>
                  {item}
                </Text>
                {item === data.state && <Text style={{ color: C.primary, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
