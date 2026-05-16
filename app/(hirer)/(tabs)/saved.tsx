import { View, Text } from 'react-native';
import { C } from '../../../src/constants';
export default function SavedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>❤️</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>Saved Providers</Text>
      <Text style={{ fontSize: 14, color: C.text2, marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}
