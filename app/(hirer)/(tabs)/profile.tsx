import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/store/auth';
import { C } from '../../../src/constants';
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const doLogout = () => Alert.alert('Log Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/phone'); } },
  ]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 56 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.white }}>{user?.phone?.[4] ?? 'U'}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 }}>{user?.phone ?? 'User'}</Text>
      <View style={{ backgroundColor: C.primary + '20', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start', marginBottom: 32 }}>
        <Text style={{ fontSize: 12, color: C.primary, fontWeight: '700' }}>Client</Text>
      </View>
      <TouchableOpacity onPress={doLogout} style={{ padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: C.red, alignItems: 'center' }}>
        <Text style={{ color: C.red, fontWeight: '700', fontSize: 15 }}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
