import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { COLORS, SPACING, RADIUS } from '../../../src/constants';
import { LoadingSpinner, EmptyState, ScreenHeader } from '../../../src/components/ui';

interface Conversation {
  id: string;
  booking_id: string | null;
  enquiry_id: string | null;
  provider_wa_id: string;
  direction: 'inbound' | 'outbound';
  from_role: 'bot' | 'hirer' | 'provider' | 'system';
  message_text: string;
  media_url: string | null;
  created_at: string;
}

export default function ConversationsScreen() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { data: conversations, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: () => api.get('/admin/conversations').then(r => r.data.data),
  });

  const { data: thread } = useQuery({
    queryKey: ['admin-conversation-thread', selectedBookingId],
    queryFn:  () => api.get(`/admin/conversations/${selectedBookingId}`).then(r => r.data.data),
    enabled: !!selectedBookingId,
  });

  if (selectedBookingId) {
    return <ConversationThread
      bookingId={selectedBookingId}
      messages={thread ?? []}
      onBack={() => setSelectedBookingId(null)}
    />;
  }

  if (isLoading) return <LoadingSpinner />;

  // Group conversations by booking_id
  const grouped: Record<string, Conversation[]> = {};
  (conversations ?? []).forEach((c: Conversation) => {
    const key = c.booking_id ?? c.enquiry_id ?? 'unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const bookingIds = Object.keys(grouped);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WhatsApp Conversations</Text>

      <FlatList
        data={bookingIds}
        keyExtractor={k => k}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState emoji="💬" title="No conversations yet" />}
        renderItem={({ item: bookingId }) => {
          const msgs = grouped[bookingId];
          const last = msgs[msgs.length - 1];
          return (
            <TouchableOpacity
              style={styles.convoCard}
              onPress={() => setSelectedBookingId(bookingId)}
              activeOpacity={0.9}
            >
              <View style={styles.convoHeader}>
                <Text style={styles.bookingId}>{bookingId.slice(0, 8)}...</Text>
                <Text style={styles.msgCount}>{msgs.length} messages</Text>
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {last?.from_role === 'bot' ? '🤖' : last?.from_role === 'provider' ? '💼' : '🧑'}{' '}
                {last?.message_text}
              </Text>
              <Text style={styles.lastTime}>
                {new Date(last?.created_at).toLocaleString('en-NG', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function ConversationThread({
  bookingId, messages, onBack,
}: {
  bookingId: string;
  messages: Conversation[];
  onBack: () => void;
}) {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`Booking ${bookingId.slice(0, 8)}...`}
        subtitle="WhatsApp thread"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.thread}>
        {messages.length === 0 ? (
          <EmptyState emoji="💬" title="No messages" />
        ) : (
          messages.map((msg) => {
            const isInbound  = msg.direction === 'inbound';
            const isBot      = msg.from_role === 'bot';
            const isSystem   = msg.from_role === 'system';
            return (
              <View
                key={msg.id}
                style={[
                  styles.bubble,
                  isInbound  ? styles.bubbleIn  : styles.bubbleOut,
                  isSystem   && styles.bubbleSystem,
                ]}
              >
                <View style={styles.bubbleRole}>
                  <Text style={styles.roleTag}>
                    {isBot ? '🤖 Bot' : isSystem ? '⚙️ System' : isInbound ? '💼 Provider' : '🤖 Bot'}
                  </Text>
                  <Text style={styles.bubbleTime}>
                    {new Date(msg.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.bubbleText}>{msg.message_text}</Text>
                {msg.media_url && (
                  <Text style={styles.mediaNote}>📎 Media attached</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  title:  { fontSize: 24, fontWeight: '800', color: COLORS.text0, padding: SPACING.lg, paddingTop: 56 },
  list:   { padding: SPACING.md },
  convoCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  convoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bookingId:   { fontSize: 13, fontWeight: '700', color: COLORS.text0 },
  msgCount:    { fontSize: 11, color: COLORS.text2 },
  lastMsg:     { fontSize: 13, color: COLORS.text1, marginBottom: 4 },
  lastTime:    { fontSize: 11, color: COLORS.text2 },
  thread: { padding: SPACING.md, paddingBottom: 40 },
  bubble: {
    maxWidth: '85%', padding: SPACING.sm, borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  bubbleIn:     { backgroundColor: COLORS.bg2, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleOut:    { backgroundColor: COLORS.primaryLo, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleSystem: { backgroundColor: COLORS.amberLo, alignSelf: 'center', borderRadius: RADIUS.sm, maxWidth: '100%' },
  bubbleRole:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  roleTag:      { fontSize: 10, fontWeight: '700', color: COLORS.text1 },
  bubbleTime:   { fontSize: 10, color: COLORS.text2, marginLeft: SPACING.md },
  bubbleText:   { fontSize: 13, color: COLORS.text0, lineHeight: 18 },
  mediaNote:    { fontSize: 11, color: COLORS.primary, marginTop: 3 },
});
