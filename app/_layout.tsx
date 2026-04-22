import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular, JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold,
} from '@expo-google-fonts/syne';

import '../global.css';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { OfflineBanner } from '@/src/components/navigation/OfflineBanner';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

const FONT_TIMEOUT_MS = 5000;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
    Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold,
  });

  const splashHiddenRef = useRef(false);

  const hideSplash = React.useCallback(async () => {
    if (!splashHiddenRef.current) {
      splashHiddenRef.current = true;
      try { await SplashScreen.hideAsync(); } catch {}
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) hideSplash();
  }, [fontsLoaded, fontError, hideSplash]);

  useEffect(() => {
    const timer = setTimeout(hideSplash, FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [hideSplash]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f6fa', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(client)" options={{ headerShown: false }} />
            <Stack.Screen name="(create-order)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
