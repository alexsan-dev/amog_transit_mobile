import { apiClient } from '@/src/api/client';
import { setToken, setUser } from '@/src/api/auth';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function OAuthCallbackScreen() {
  const { token, error: oauthError, message } = useLocalSearchParams<{
    token?: string;
    error?: string;
    message?: string;
  }>();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<'processing' | 'error'>('processing');

  useEffect(() => {
    // Dismiss any lingering browser session (Android especially)
    try { WebBrowser.dismissBrowser(); } catch {}

    if (oauthError || !token) {
      setStatus('error');
      // Give the user a moment to read any error state before redirecting
      const t = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
      return () => clearTimeout(t);
    }

    (async () => {
      try {
        await setToken(token);
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        await setUser(res.data.data);
        setAuth(token, res.data.data);
        router.replace('/(client)');
      } catch (err) {
        console.error('[OAuthCallback]', err);
        setStatus('error');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
