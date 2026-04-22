import React from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, Shield, Settings, LogOut } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface ProfileDropdownProps {
  onProfile: () => void;
  onSecurity: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

type ItemKey = 'profile' | 'security' | 'settings' | 'logout';

interface DropdownItem {
  key: ItemKey;
  icon: any;
  label: string;
  danger?: boolean;
}

const ITEMS: DropdownItem[] = [
  { key: 'profile', icon: User, label: 'Mon profil' },
  { key: 'security', icon: Shield, label: 'Securite' },
  { key: 'settings', icon: Settings, label: 'Parametres' },
  { key: 'logout', icon: LogOut, label: 'Deconnexion', danger: true },
];

export function ProfileDropdown({ onProfile, onSecurity, onSettings, onLogout }: ProfileDropdownProps) {
  const { c } = useTheme();

  const handlers: Record<ItemKey, () => void> = {
    profile: onProfile,
    security: onSecurity,
    settings: onSettings,
    logout: onLogout,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify().damping(22)}
      style={{
        width: 186,
        backgroundColor: c.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 16,
        overflow: 'hidden',
      }}
    >
      {ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const color = item.danger ? c.error : c.text;

        return (
          <React.Fragment key={item.key}>
            {idx > 0 && (
              <View style={{ height: 1, backgroundColor: c.border, marginLeft: 56 }} />
            )}
            <Pressable
              onPress={handlers[item.key]}
              style={({ pressed }) => ({
                backgroundColor: pressed ? c.primary + '08' : 'transparent',
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: item.danger ? c.error + '12' : c.primary + '10',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Icon size={14} color={color} strokeWidth={2} />
                </View>
                <RNText
                  style={{
                    fontFamily: item.danger ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    fontSize: 14,
                    color,
                    flex: 1,
                  }}
                >
                  {item.label}
                </RNText>
              </View>
            </Pressable>
          </React.Fragment>
        );
      })}
    </Animated.View>
  );
}
