import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C } from '../../../src/constants';

const Icon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function HirerTabs() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.text2,
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: 80, paddingBottom: 16, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index"    options={{ title: 'Explore',   tabBarIcon: ({ focused }) => <Icon emoji="🔍" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings',  tabBarIcon: ({ focused }) => <Icon emoji="📋" focused={focused} /> }} />
      <Tabs.Screen name="saved"    options={{ title: 'Saved',     tabBarIcon: ({ focused }) => <Icon emoji="❤️" focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}
