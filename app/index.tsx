import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getToken } from '@/src/api/auth';
import { storageGet } from '@/src/lib/storage';
const ONBOARDING_KEY = 'has_seen_onboarding';

export default function IndexGate() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { isAuthenticated, isHydrated, setHydrated, logout } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = await getToken();
        if (!mounted) return;
        if (!token) logout();
        setHydrated();

        const hasSeen = await storageGet(ONBOARDING_KEY);
        if (!mounted) return;

        if (!hasSeen) {
          router.replace('/onboarding');
          return;
        }

        if (!token) {
          router.replace('/(auth)/login');
          return;
        }
      } catch (error) {
        console.warn('[IndexGate] init error:', error);
        if (!mounted) return;
        setHydrated();
        router.replace('/(auth)/login');
      }
    };

    if (rootNavigationState?.key) {
      init();
    }
    return () => { mounted = false; };
  }, [rootNavigationState?.key]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      router.replace('/(client)');
    }
  }, [isHydrated, isAuthenticated]);

  return <View style={{ flex: 1, backgroundColor: '#f4f6fa' }} />;
}
