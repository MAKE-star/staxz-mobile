import { Tabs } from 'expo-router';
import { COLORS } from '../../../src/constants';

export default function HirerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg1,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text2,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"         options={{ title: 'Explore',   tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} /> }} />
      <Tabs.Screen name="bookings"      options={{ title: 'Bookings',  tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }} />
      <Tabs.Screen name="saved"         options={{ title: 'Saved',     tabBarIcon: ({ color }) => <TabIcon emoji="❤️" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts',    tabBarIcon: ({ color }) => <TabIcon emoji="🔔" color={color} /> }} />
      <Tabs.Screen name="profile"       options={{ title: 'Profile',   tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }} />
    </Tabs>
  );
}

const TabIcon = ({ emoji, color }: { emoji: string; color: string }) => (
  <>{emoji}</>
);
