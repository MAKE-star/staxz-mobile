import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C } from '../../../src/constants';

const Icon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function AdminTabs() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.text2,
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: 80, paddingBottom: 16, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index"    options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <Icon emoji="📊" focused={focused} /> }} />
      <Tabs.Screen name="disputes" options={{ title: 'Disputes',  tabBarIcon: ({ focused }) => <Icon emoji="⚠️" focused={focused} /> }} />
      <Tabs.Screen name="users"    options={{ title: 'Users',     tabBarIcon: ({ focused }) => <Icon emoji="👥" focused={focused} /> }} />
    </Tabs>
  );
}
