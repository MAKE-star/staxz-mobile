import { Tabs } from 'expo-router';
import { COLORS } from '../../../src/constants';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.bg1,
        borderTopColor: COLORS.border,
        height: 80, paddingBottom: 16, paddingTop: 8,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.text2,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index"         options={{ title: 'Dashboard',   tabBarIcon: () => <>📊</> }} />
      <Tabs.Screen name="disputes"      options={{ title: 'Disputes',    tabBarIcon: () => <>⚠️</> }} />
      <Tabs.Screen name="conversations" options={{ title: 'Chats',       tabBarIcon: () => <>💬</> }} />
      <Tabs.Screen name="users"         options={{ title: 'Users',       tabBarIcon: () => <>👥</> }} />
      <Tabs.Screen name="analytics"     options={{ title: 'Analytics',   tabBarIcon: () => <>📈</> }} />
    </Tabs>
  );
}
