import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../../src/constants';
export default function Step1() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 56 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8 }}>Set up your profile</Text>
      <Text style={{ fontSize: 15, color: C.text2, marginBottom: 32 }}>Step 1 of 5 — Business Info</Text>
      <Text style={{ fontSize: 14, color: C.text2, lineHeight: 22 }}>Provider onboarding coming in next update. For now contact support to register as a provider.</Text>
      <TouchableOpacity onPress={() => router.replace('/(auth)/phone')} style={{ marginTop: 32, padding: 16, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center' }}>
        <Text style={{ color: C.white, fontWeight: '700' }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
