import { View, Text } from 'react-native';
import { C } from '../../../src/constants';
export default function AdminScreen() {
  return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>Admin disputes</Text></View>;
}
