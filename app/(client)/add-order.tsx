import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function AddOrderTab() {
  const router = useRouter();
  const { c } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.navigate('/(create-order)' as any);
      }, 50);
      return () => clearTimeout(timer);
    }, [router]),
  );

  // Render a background-colored placeholder while the navigation fires
  return <View style={{ flex: 1, backgroundColor: c.background }} />;
}
