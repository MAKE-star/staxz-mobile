import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../src/constants';

const ROLES = [
  {
    id: 'hirer',
    emoji: '🌟',
    title: 'Client',
    subtitle: 'I want to book beauty services',
    color: C.primary,
    bullets: ['Browse providers near you', 'Book home service or walk-in', 'Secure escrow payments'],
  },
  {
    id: 'provider',
    emoji: '💼',
    title: 'Provider',
    subtitle: 'I offer beauty & grooming services',
    color: '#EC4899',
    bullets: ['Get bookings via WhatsApp', 'Paid directly to your bank', 'Build your portfolio'],
  },
];

export default function SignUpScreen() {
  const router = useRouter();

  const select = (roleId: string) => {
    router.push({ pathname: '/(auth)/register-phone', params: { role: roleId } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg0 }} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, color: C.text0 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '800', color: C.text0, marginBottom: 6 }}>Create Account</Text>
        <Text style={{ fontSize: 15, color: C.text1, lineHeight: 22, marginBottom: 28 }}>
          How will you use Staxz? You can change this later.
        </Text>
      </View>

      {/* Role cards */}
      <View style={{ paddingHorizontal: 24, gap: 16 }}>
        {ROLES.map(role => (
          <TouchableOpacity key={role.id} onPress={() => select(role.id)} activeOpacity={0.9}
            style={{ backgroundColor: C.bg1, borderRadius: 20, borderWidth: 2, borderColor: C.border, padding: 22, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>

            {/* Role header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: role.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28 }}>{role.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.text0 }}>{role.title}</Text>
                <Text style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>{role.subtitle}</Text>
              </View>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: role.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.white, fontSize: 16 }}>→</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: C.border, marginBottom: 14 }} />

            {/* Bullets */}
            {role.bullets.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: role.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: role.color }}>✓</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.text1 }}>{b}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign in link */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 14, color: C.text1 }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/phone')}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.primary }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
