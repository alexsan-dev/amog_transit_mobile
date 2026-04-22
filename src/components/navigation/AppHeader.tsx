import { useApiImage } from "@/src/hooks/useApiImage";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useProfile } from "@/src/hooks/useProfile";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Image } from "react-native";
import { Bell, User } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
  onProfilePress: () => void;
  onNotificationsPress: () => void;
}

export function AppHeader({
  onProfilePress,
  onNotificationsPress,
}: AppHeaderProps) {
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Bell */}
        <Pressable
          onPress={onNotificationsPress}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={22} color={c.textMuted} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: c.accent,
                borderWidth: 1.5,
                borderColor: c.surface,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: unreadCount > 9 ? 9 : 10,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: c.primary + "18",
              borderWidth: 1.5,
              borderColor: c.primary + "40",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 34, height: 34 }}
                resizeMode="cover"
              />
            ) : (
              <User size={16} color={c.primary} strokeWidth={1.5} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
