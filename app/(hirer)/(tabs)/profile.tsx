import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/auth.store';
import { authApi } from '../../../src/api/auth.api';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Avatar } from '../../../src/components/ui';

const MENU_ITEMS = [
  { emoji: '📋', label: 'My Bookings',      route: '/(hirer)/(tabs)/bookings' },
  { emoji: '❤️', label: 'Saved Providers',  route: '/(hirer)/(tabs)/saved'    },
  { emoji: '💳', label: 'Payment Methods',  route: null                        },
  { emoji: '🔔', label: 'Notifications',    route: '/(hirer)/(tabs)/notifications' },
  { emoji: '⚙️', label: 'Settings',         route: null                        },
  { emoji: '❓', label: 'Help & Support',   route: null                        },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
          await logout();
          router.replace('/(auth)/phone');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <Avatar name={user?.full_name ?? user?.phone} size={72} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.full_name ?? 'Staxz User'}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Client</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
            onPress={() => item.route ? router.push(item.route as never) : null}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Staxz v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56 },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  profileInfo: { flex: 1 },
  name:  { fontSize: 18, fontWeight: '800', color: COLORS.text0, marginBottom: 2 },
  phone: { fontSize: 13, color: COLORS.text1, marginBottom: SPACING.xs },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primaryLo,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  roleText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  menu: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuEmoji: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text0, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: COLORS.text2 },
  logoutBtn: {
    padding: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.red,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  logoutText: { color: COLORS.red, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.text2 },
});
