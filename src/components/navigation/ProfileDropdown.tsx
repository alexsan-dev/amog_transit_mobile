import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, Shield, LogOut } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { useTheme } from '@/src/theme/ThemeProvider';

interface ProfileDropdownProps {
  onProfile: () => void;
  onSecurity: () => void;
  onLogout: () => void;
}

type ItemKey = 'profile' | 'security' | 'logout';

interface DropdownItem {
  key: ItemKey;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  danger?: boolean;
}

const ITEMS: DropdownItem[] = [
  { key: 'profile', icon: User, label: 'Mon profil' },
  { key: 'security', icon: Shield, label: 'Sécurité' },
  { key: 'logout', icon: LogOut, label: 'Déconnexion', danger: true },
];

export function ProfileDropdown({ onProfile, onSecurity, onLogout }: ProfileDropdownProps) {
  const { c } = useTheme();

  const handlers: Record<ItemKey, () => void> = {
    profile: onProfile,
    security: onSecurity,
    logout: onLogout,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify().damping(22)}
      style={{
        width: 200,
        backgroundColor: c.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
      }}
    >
      {ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const color = item.danger ? c.error : c.text;

        return (
          <React.Fragment key={item.key}>
            {idx > 0 && (
              <View style={{ height: 1, backgroundColor: c.border, marginHorizontal: 12 }} />
            )}
            <Pressable
              onPress={handlers[item.key]}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: pressed ? c.surfaceHover : 'transparent',
              })}
            >
              <Icon size={18} color={color} strokeWidth={1.5} />
              <Text
                style={{
                  marginLeft: 12,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </Animated.View>
  );
}
