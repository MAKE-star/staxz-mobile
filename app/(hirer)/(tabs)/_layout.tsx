import { Tabs } from 'expo-router';
import { C } from '../../../src/constants';
export default function HirerTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.primary, tabBarInactiveTintColor: C.text3, tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: 80, paddingBottom: 16, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tabs.Screen name="index"    options={{ title: 'Explore',   tabBarIcon: ({ color }) => <TabIcon emoji="🔍" /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings',  tabBarIcon: ({ color }) => <TabIcon emoji="📋" /> }} />
      <Tabs.Screen name="saved"    options={{ title: 'Saved',     tabBarIcon: ({ color }) => <TabIcon emoji="❤️" /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: ({ color }) => <TabIcon emoji="👤" /> }} />
    </Tabs>
  );
}
const TabIcon = ({ emoji }: { emoji: string }) => <>{emoji}</>;
