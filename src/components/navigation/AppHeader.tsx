import React from 'react';
import { View, Pressable } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useProfile } from '@/src/hooks/useProfile';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useApiImage } from '@/src/hooks/useApiImage';

interface AppHeaderProps {
  onProfilePress: () => void;
  onNotificationsPress: () => void;
}

export function AppHeader({ onProfilePress, onNotificationsPress }: AppHeaderProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications(false);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const avatarUri = useApiImage(profile?.avatar_url);

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: c.surface,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
      }}
    >
      <View
        style={{
          height: 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 16,
                height: 2,
                backgroundColor: '#fff',
                marginBottom: 3,
              }}
            />
            <View style={{ width: 10, height: 2, backgroundColor: '#fff' }} />
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {['A', 'M', 'O', 'G'].map((char, i) => (
                <View
                  key={i}
                  style={{
                    width: char === 'M' ? 10 : 8,
                    height: 10,
                    backgroundColor: i % 2 === 0 ? c.primary : c.accent,
                    borderRadius: 1,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Right actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {/* Bell */}
          <Pressable
            onPress={onNotificationsPress}
            hitSlop={8}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={22} color={c.textMuted} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: c.accent,
                  borderWidth: 1.5,
                  borderColor: c.surface,
                }}
              />
            )}
          </Pressable>

          {/* Profile avatar */}
          <Pressable
            onPress={onProfilePress}
            hitSlop={8}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: c.primary + '18',
                borderWidth: 1.5,
                borderColor: c.primary + '40',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 34, height: 34 }}
                  contentFit="cover"
                />
              ) : (
                <User size={16} color={c.primary} strokeWidth={1.5} />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
