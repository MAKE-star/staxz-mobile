import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/store/auth';
import { api } from '../../../src/api';
import { C } from '../../../src/constants';
export default function EnquiryScreen() {
  const { providerId, providerName } = useLocalSearchParams<{ providerId: string; providerName: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState<'home'|'walkin'>('home');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const CATS = ['barbing','makeup','braids','nails','weaves','lashes','facials','spa','haircut','coloring'];

  const submit = async () => {
    if (!category) { Alert.alert('Select a service category'); return; }
    setLoading(true);
    try {
      await api('/enquiries', { method: 'POST', token, body: { providerId, categoryId: category, serviceType: mode, notes: notes || undefined } });
      Alert.alert('Enquiry Sent! 🎉', `Your enquiry has been sent to ${providerName}. They will reply within 60 minutes.`, [{ text: 'OK', onPress: () => router.replace('/(hirer)/(tabs)/bookings') }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 56 }}>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ fontSize: 16, color: C.primary, marginBottom: 24 }}>← Back</Text></TouchableOpacity>
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 }}>Book {providerName}</Text>
      <Text style={{ fontSize: 14, color: C.text2, marginBottom: 24 }}>Select your service and we'll send your enquiry</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 }}>Service *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {CATS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: category === c ? C.primary : C.border, backgroundColor: category === c ? C.primary : C.white }}>
            <Text style={{ fontSize: 13, color: category === c ? C.white : C.text2, textTransform: 'capitalize' }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 }}>Service Mode *</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        {(['home', 'walkin'] as const).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: mode === m ? C.primary : C.border, backgroundColor: mode === m ? C.bg2 : C.white, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: mode === m ? C.primary : C.text }}>{m === 'home' ? '🏠 Home Service' : '🏪 Walk-In'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 }}>Notes (optional)</Text>
      <TextInput value={notes} onChangeText={setNotes} placeholder="Any specific requirements..." multiline numberOfLines={3}
        style={{ backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, fontSize: 14, color: C.text, marginBottom: 24, minHeight: 80, textAlignVertical: 'top' }} />
      <TouchableOpacity onPress={submit} disabled={loading}
        style={{ backgroundColor: loading ? '#C084E8' : C.primary, borderRadius: 12, padding: 16, alignItems: 'center' }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>{loading ? 'Sending...' : 'Send Enquiry'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
