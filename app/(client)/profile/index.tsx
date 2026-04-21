import React from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Phone, Shield, ChevronRight, LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useProfile } from '@/src/hooks/useProfile';
import { useApiImage } from '@/src/hooks/useApiImage';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { clearToken } from '@/src/api/auth';

function ProfileRow({ icon: Icon, label, value, c }: { icon: any; label: string; value?: string; c: any }) {
  return (
    <View className="flex-row items-center py-3 border-b border-border last:border-b-0">
      <Icon size={18} color={c.textMuted} strokeWidth={1.5} className="mr-3" />
      <View className="flex-1">
        <Text className="font-body text-xs text-text-muted">{label}</Text>
        <Text className="font-body text-sm text-text">{value ?? '-'}</Text>
      </View>
      <ChevronRight size={16} color={c.textMuted} />
    </View>
  );
}

function ThemeOption({ icon: Icon, label, isActive, onPress, c }: { icon: any; label: string; isActive: boolean; onPress: () => void; c: any }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3 px-3 rounded-md ${isActive ? 'bg-primary/10' : ''}`}
    >
      <Icon size={18} color={isActive ? c.primary : c.textMuted} strokeWidth={1.5} />
      <Text className={`flex-1 ml-3 font-body text-sm ${isActive ? 'text-primary font-medium' : 'text-text'}`}>
        {label}
      </Text>
      {isActive && <View className="w-2 h-2 rounded-full bg-primary" />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading } = useProfile();
  const avatarUri = useApiImage(profile?.avatar_url);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme, c } = useTheme();

  const handleLogout = async () => {
    await clearToken();
    logout();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-3">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-20 h-20 rounded-full" />
            ) : (
              <User size={32} color={c.primary} strokeWidth={1.5} />
            )}
          </View>
          <Text variant="h2" className="text-primary">
            {isLoading ? '...' : profile?.name ?? 'Client'}
          </Text>
          <Text className="text-text-muted font-body text-sm mt-1">{profile?.email ?? ''}</Text>
          {profile?.email_verified ? (
            <View className="flex-row items-center mt-1 bg-success/10 px-2 py-1 rounded-sm">
              <Shield size={12} color={c.success} />
              <Text className="text-success font-body text-xs ml-1">Email vérifié</Text>
            </View>
          ) : null}
        </View>

        <Card className="mb-4">
          <ProfileRow icon={User} label="Nom" value={profile?.name} c={c} />
          <ProfileRow icon={Mail} label="Email" value={profile?.email} c={c} />
          <ProfileRow icon={Phone} label="Téléphone" value={profile?.phone} c={c} />
        </Card>

        <Card className="mb-4">
          <Text className="font-body text-sm font-medium text-text mb-3">Apparence</Text>
          <ThemeOption icon={Monitor} label="Système" isActive={theme === 'system'} onPress={() => setTheme('system')} c={c} />
          <ThemeOption icon={Sun} label="Clair" isActive={theme === 'light'} onPress={() => setTheme('light')} c={c} />
          <ThemeOption icon={Moon} label="Sombre" isActive={theme === 'dark'} onPress={() => setTheme('dark')} c={c} />
        </Card>

        <Button title="Déconnexion" variant="accent" onPress={handleLogout} />
      </ScrollView>
    </View>
  );
}
