import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/auth.store';
import { authApi } from '../../../src/api/auth.api';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { Avatar } from '../../../src/components/ui';

const MENU = [
  { emoji: '✏️', label: 'Edit Profile',      route: '/(provider)/edit-profile' },
  { emoji: '📸', label: 'Portfolio Photos',  route: '/(provider)/portfolio' },
  { emoji: '⚙️', label: 'Business Settings', route: null },
  { emoji: '🏦', label: 'Bank Account',      route: null },
  { emoji: '🔔', label: 'Notifications',     route: null },
  { emoji: '❓', label: 'Help & Support',    route: null },
];

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
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
      <View style={styles.profileHeader}>
        <Avatar name={user?.full_name ?? user?.phone} size={72} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.full_name ?? 'Provider'}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Service Provider</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, i < MENU.length - 1 && styles.border]}
            onPress={() => item.route ? router.push(item.route as never) : null}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  content:   { padding: SPACING.lg, paddingTop: 56 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  profileInfo:   { flex: 1 },
  name:      { fontSize: 18, fontWeight: '800', color: COLORS.text0, marginBottom: 2 },
  phone:     { fontSize: 13, color: COLORS.text1, marginBottom: SPACING.xs },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.primaryLo, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  roleText:  { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  menu:      { backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  menuItem:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  border:    { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuEmoji: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text0, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: COLORS.text2 },
  logoutBtn: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.red, alignItems: 'center' },
  logoutText:{ color: COLORS.red, fontWeight: '700', fontSize: 15 },
});
