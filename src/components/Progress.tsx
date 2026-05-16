import { View, Text, TouchableOpacity } from 'react-native';
import { C } from '../constants';

const STEPS = ['Business', 'Services', 'Portfolio', 'WhatsApp', 'Go Live'];

export function Progress({ current, onBack }: { current: number; onBack: () => void }) {
  return (
    <View style={{ backgroundColor: C.bg0, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 12 }}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 22, color: C.text0 }}>←</Text>
      </TouchableOpacity>

      {/* Step dots */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        {STEPS.map((_, i) => (
          <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: i < current ? C.green : i === current ? C.primary : C.bg3,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: i <= current ? C.white : C.text2 }}>
                {i < current ? '✓' : i + 1}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{ flex: 1, height: 2, backgroundColor: i < current ? C.green : C.bg3, marginHorizontal: 2 }} />
            )}
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 13, color: C.text2 }}>
        Step {current + 1} of {STEPS.length} —{' '}
        <Text style={{ fontWeight: '700', color: C.text0 }}>{STEPS[current]}</Text>
      </Text>
    </View>
  );
}
