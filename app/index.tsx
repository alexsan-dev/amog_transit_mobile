import * as FileSystem from 'expo-file-system';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getToken, getUser, clearToken, clearUser } from '@/src/api/auth';
import { storageGet, storageDel } from '@/src/lib/storage';

const ONBOARDING_KEY = 'has_seen_onboarding';

// Stored in the app's document directory — cleared on uninstall (unlike iOS Keychain).
// Absence of this file = fresh install → purge stale Keychain data.
const INSTALL_MARKER = FileSystem.documentDirectory + '.install_marker';

async function purgeStaleKeychainOnFreshInstall(): Promise<void> {
  const info = await FileSystem.getInfoAsync(INSTALL_MARKER);
  if (!info.exists) {
    await Promise.all([clearToken(), clearUser(), storageDel(ONBOARDING_KEY)]);
    await FileSystem.writeAsStringAsync(INSTALL_MARKER, '1');
  }
}

export default function IndexGate() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { setHydrated, logout, setAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      try {
        // Must run before reading Keychain — clears stale data from a previous install
        await purgeStaleKeychainOnFreshInstall();

        const [token, user, hasSeen] = await Promise.all([
          getToken(),
          getUser(),
          storageGet(ONBOARDING_KEY),
        ]);
        if (!mounted) return;

        if (token && user) {
          setAuth(token, user as any);
        } else {
          logout();
        }
        setHydrated();

        if (!hasSeen) {
          router.replace('/onboarding');
          return;
        }

        if (!token || !user) {
          router.replace('/(auth)/login');
          return;
        }

        router.replace('/(client)');
      } catch (error) {
        console.warn('[IndexGate] init error:', error);
        if (!mounted) return;
        setHydrated();
        router.replace('/(auth)/login');
      }
    };

    if (rootNavigationState?.key) {
      init();
    } else {
      fallbackTimer = setTimeout(() => {
        if (mounted) init();
      }, 400);
    }

    return () => {
      mounted = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [rootNavigationState?.key]);

  return <View style={{ flex: 1, backgroundColor: '#f4f6fa' }} />;
}
