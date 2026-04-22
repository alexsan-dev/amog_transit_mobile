import { apiClient } from '@/src/api/client';
import { setToken } from '@/src/api/auth';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function OAuthCallbackScreen() {
  const { token, error } = useLocalSearchParams<{ token?: string; error?: string }>();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (error || !token) {
      router.replace('/(auth)/login');
      return;
    }

    (async () => {
      try {
        await setToken(token);
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuth(token, res.data.data);
        router.replace('/(client)');
      } catch {
        router.replace('/(auth)/login');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
