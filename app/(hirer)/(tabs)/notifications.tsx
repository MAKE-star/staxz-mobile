import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../../src/api/notifications.api';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { LoadingSpinner, EmptyState } from '../../../src/components/ui';
import { Notification } from '../../../src/types';

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {(data?.unreadCount ?? 0) > 0 && (
          <TouchableOpacity onPress={() => markAll.mutate()}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState emoji="🔔" title="All caught up!" body="You have no notifications" />}
          renderItem={({ item }: { item: Notification }) => (
            <TouchableOpacity
              style={[styles.item, !item.is_read && styles.unread]}
              onPress={() => !item.is_read && markRead.mutate(item.id)}
              activeOpacity={0.85}
            >
              {!item.is_read && <View style={styles.dot} />}
              <View style={styles.itemContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifTime}>
                  {new Date(item.created_at).toLocaleString('en-NG', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingTop: 56,
  },
  title:   { fontSize: 24, fontWeight: '800', color: COLORS.text0 },
  markAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  list:    { padding: SPACING.md },
  item: {
    flexDirection: 'row', gap: SPACING.sm,
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  unread:      { backgroundColor: COLORS.bg2, borderColor: COLORS.primaryLo },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },
  itemContent: { flex: 1 },
  notifTitle:  { fontSize: 14, fontWeight: '700', color: COLORS.text0, marginBottom: 2 },
  notifBody:   { fontSize: 13, color: COLORS.text1, lineHeight: 18, marginBottom: 4 },
  notifTime:   { fontSize: 11, color: COLORS.text2 },
});
