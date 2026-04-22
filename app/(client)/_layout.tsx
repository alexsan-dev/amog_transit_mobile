import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { TabBar } from '@/src/components/navigation/TabBar';
import { ProfileDropdown } from '@/src/components/navigation/ProfileDropdown';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { clearToken } from '@/src/api/auth';
import { EmailVerificationModal } from '@/src/components/EmailVerificationModal';

export default function ClientLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    setDropdownVisible(false);
    await clearToken();
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        onProfilePress={() => setDropdownVisible((v) => !v)}
        onNotificationsPress={() => {
          setDropdownVisible(false);
          router.push('/(client)/notifications');
        }}
      />

      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="orders" />
        <Tabs.Screen name="add-order" />
        <Tabs.Screen name="payments" />
        <Tabs.Screen name="tickets" />
        <Tabs.Screen name="tracking" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="security" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>

      <EmailVerificationModal />

      {dropdownVisible && (
        <>
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
            }}
            onPress={() => setDropdownVisible(false)}
          />
          <View
            style={{
              position: 'absolute',
              top: insets.top + 56,
              right: 12,
              zIndex: 200,
            }}
            pointerEvents="box-none"
          >
            <ProfileDropdown
              onProfile={() => {
                setDropdownVisible(false);
                router.push('/(client)/profile');
              }}
              onSecurity={() => {
                setDropdownVisible(false);
                router.push('/(client)/security');
              }}
              onSettings={() => {
                setDropdownVisible(false);
                router.push('/(client)/settings');
              }}
              onLogout={handleLogout}
            />
          </View>
        </>
      )}
    </View>
  );
}
