import { Tabs } from 'expo-router';
import { C } from '../../../src/constants';
export default function AdminTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.primary, tabBarInactiveTintColor: C.text3, tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: 80, paddingBottom: 16, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tabs.Screen name="index"    options={{ title: 'Dashboard', tabBarIcon: () => <>📊</> }} />
      <Tabs.Screen name="disputes" options={{ title: 'Disputes',  tabBarIcon: () => <>⚠️</> }} />
      <Tabs.Screen name="users"    options={{ title: 'Users',     tabBarIcon: () => <>👥</> }} />
    </Tabs>
  );
}
