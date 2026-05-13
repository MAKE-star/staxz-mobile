import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, ViewStyle, Modal,
  ScrollView, Pressable,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; }
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
interface BadgeProps { label: string; variant?: BadgeVariant; style?: ViewStyle; }
export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => (
  <View style={[styles.badge, styles[`badge_${variant}`], style]}>
    <Text style={[styles.badgeText, styles[`badgeText_${variant}`]]}>{label}</Text>
  </View>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps { uri?: string | null; name?: string; size?: number; }
export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 40 }) => {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri
        ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        : <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
      }
    </View>
  );
};

// ─── StarRating ───────────────────────────────────────────────────────────────
interface StarRatingProps { rating: number; count?: number; size?: number; }
export const StarRating: React.FC<StarRatingProps> = ({ rating, count, size = 14 }) => (
  <View style={styles.stars}>
    {[1,2,3,4,5].map(i => (
      <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#F59E0B' : COLORS.border }}>★</Text>
    ))}
    {count !== undefined && (
      <Text style={[styles.ratingText, { fontSize: size - 2 }]}> {rating.toFixed(1)} ({count})</Text>
    )}
  </View>
);

// ─── ScreenHeader ─────────────────────────────────────────────────────────────
interface ScreenHeaderProps {
  title: string; subtitle?: string;
  onBack?: () => void; rightAction?: React.ReactNode;
}
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, rightAction }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      )}
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightAction}
  </View>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps { emoji?: string; title: string; body?: string; action?: React.ReactNode; }
export const EmptyState: React.FC<EmptyStateProps> = ({ emoji = '🔍', title, body, action }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {body && <Text style={styles.emptyBody}>{body}</Text>}
    {action && <View style={{ marginTop: SPACING.lg }}>{action}</View>}
  </View>
);

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <View style={styles.spinner}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message && <Text style={styles.spinnerText}>{message}</Text>}
  </View>
);

// ─── BottomSheet ──────────────────────────────────────────────────────────────
interface BottomSheetProps {
  visible: boolean; onClose: () => void;
  title?: string; children: React.ReactNode;
}
export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      {title && <Text style={styles.sheetTitle}>{title}</Text>}
      <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badge_success: { backgroundColor: COLORS.greenLo },
  badge_warning: { backgroundColor: COLORS.amberLo },
  badge_danger:  { backgroundColor: COLORS.redLo },
  badge_info:    { backgroundColor: COLORS.primaryLo },
  badge_default: { backgroundColor: COLORS.bg3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeText_success: { color: COLORS.green },
  badgeText_warning: { color: COLORS.amber },
  badgeText_danger:  { color: COLORS.red },
  badgeText_info:    { color: COLORS.primary },
  badgeText_default: { color: COLORS.text1 },
  avatar: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '700' },
  stars: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: COLORS.text1, marginLeft: 2 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.bg0, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: COLORS.text0 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text0 },
  headerSubtitle: { fontSize: 12, color: COLORS.text2, marginTop: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text0, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: COLORS.text1, textAlign: 'center', marginTop: SPACING.xs, lineHeight: 20 },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  spinnerText: { fontSize: 14, color: COLORS.text1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.bg1, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: COLORS.border,
    borderRadius: RADIUS.full, alignSelf: 'center', marginBottom: SPACING.md,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text0, marginBottom: SPACING.md },
});
