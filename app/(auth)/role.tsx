import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../src/constants';

export default function RoleScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 80 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 8 }}>How will you use Staxz?</Text>
      <Text style={{ fontSize: 15, color: C.text2, marginBottom: 32 }}>You can change this later.</Text>
      {[
        { id: 'hirer', emoji: '🌟', title: "I'm a Client", desc: 'Book beauty & grooming services' },
        { id: 'provider', emoji: '💼', title: "I'm a Provider", desc: 'Offer your beauty & grooming services' },
      ].map(r => (
        <TouchableOpacity key={r.id} onPress={() => setRole(r.id)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: role === r.id ? C.primary : C.border, padding: 16, marginBottom: 12, backgroundColor: role === r.id ? C.bg2 : C.white }}>
          <Text style={{ fontSize: 32 }}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: role === r.id ? C.primary : C.text }}>{r.title}</Text>
            <Text style={{ fontSize: 13, color: C.text2 }}>{r.desc}</Text>
          </View>
          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: role === r.id ? C.primary : C.border, alignItems: 'center', justifyContent: 'center' }}>
            {role === r.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />}
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => { if (role === 'provider') router.replace('/(provider)/onboarding/step1'); else router.replace('/(hirer)/(tabs)'); }}
        disabled={!role}
        style={{ backgroundColor: role ? C.primary : '#C084E8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}
