import { Tabs } from 'expo-router';
import { COLORS } from '../../../src/constants';

export default function ProviderTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg1,
          borderTopColor: COLORS.border,
          height: 80, paddingBottom: 16, paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text2,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Dashboard', tabBarIcon: () => <>📊</> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings',  tabBarIcon: () => <>📋</> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings',  tabBarIcon: () => <>💰</> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: () => <>👤</> }} />
    </Tabs>
  );
}
