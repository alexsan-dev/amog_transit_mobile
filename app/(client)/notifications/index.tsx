import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, MailOpen, CheckCheck, ArrowLeft, Trash2 } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Skeleton } from '@/src/components/ui/Skeleton';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/src/hooks/useNotifications';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Notification } from '@/src/types/api';

type Filter = 'all' | 'unread' | 'read';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const readParam = filter === 'unread' ? false : filter === 'read' ? true : undefined;
  const { data: notifications, isLoading, refetch } = useNotifications(readParam);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'unread', label: 'Non lues' },
    { key: 'read', label: 'Lues' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: 12,
            backgroundColor: c.background,
            borderBottomColor: c.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 16, color: c.text }}>
          Notifications
        </Text>
        <Pressable onPress={handleMarkAllRead} hitSlop={8} style={styles.backBtn}>
          <CheckCheck size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { borderBottomColor: c.border }]}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: active ? c.primary + '12' : 'transparent',
                  borderColor: active ? c.primary : c.border,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  fontSize: 12,
                  color: active ? c.primary : c.textMuted,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <Skeleton height={70} className="mb-3 rounded-xl" />
            <Skeleton height={70} className="mb-3 rounded-xl" />
            <Skeleton height={70} className="rounded-xl" />
          </>
        ) : !notifications || notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <MailOpen size={40} color={c.textMuted} strokeWidth={1.5} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: c.textMuted, marginTop: 12 }}>
              Aucune notification.
            </Text>
          </View>
        ) : (
          notifications.map((notif, i) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              index={i}
              c={c}
              onPress={() => {
                if (!notif.read) handleMarkRead(notif.id);
                if (notif.order_reference) {
                  router.push(`/(client)/tracking/${notif.order_reference}` as any);
                }
              }}
              onMarkRead={() => handleMarkRead(notif.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function NotificationItem({
  notif,
  index,
  c,
  onPress,
  onMarkRead,
}: {
  notif: Notification;
  index: number;
  c: Record<string, string>;
  onPress: () => void;
  onMarkRead: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(200)}>
      <Pressable onPress={onPress} style={{ marginBottom: 10 }}>
        <Card
          style={{
            opacity: notif.read ? 0.65 : 1,
            borderLeftWidth: notif.read ? 0 : 3,
            borderLeftColor: notif.read ? undefined : c.primary,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: notif.read ? c.base200 : c.primary + '12',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Bell size={16} color={notif.read ? c.textMuted : c.primary} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: notif.read ? 'Inter_400Regular' : 'Inter_600SemiBold',
                  fontSize: 13,
                  color: c.text,
                  marginBottom: 2,
                }}
              >
                {notif.title}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, lineHeight: 18 }}>
                {notif.body}
              </Text>
              {notif.order_reference && (
                <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.primary, marginTop: 4 }}>
                  {notif.order_reference}
                </Text>
              )}
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: c.textMuted, marginTop: 4 }}>
                {new Date(notif.created_at).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            {!notif.read && (
              <Pressable onPress={onMarkRead} hitSlop={10} style={{ padding: 4 }}>
                <Trash2 size={14} color={c.textMuted} strokeWidth={1.5} />
              </Pressable>
            )}
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
