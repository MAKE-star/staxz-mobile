import { Tabs } from 'expo-router';
import { C } from '../../../src/constants';
export default function ProviderTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.primary, tabBarInactiveTintColor: C.text3, tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: 80, paddingBottom: 16, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tabs.Screen name="index"    options={{ title: 'Dashboard', tabBarIcon: () => <>📊</> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings',  tabBarIcon: () => <>📋</> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings',  tabBarIcon: () => <>💰</> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: () => <>👤</> }} />
    </Tabs>
  );
}
