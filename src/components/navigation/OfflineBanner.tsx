import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // NetInfo returns null for isConnected on first render → treat as online
    if (netInfo.isConnected === false) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [netInfo.isConnected]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.banner,
        {
          top: insets.top,
          backgroundColor: c.warning,
        },
      ]}
    >
      <WifiOff size={14} color="#fff" strokeWidth={2} />
      <View style={styles.textWrap}>
        <Animated.Text style={styles.title}>Hors ligne</Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Verifiez votre connexion internet
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  textWrap: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  subtitle: {
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    opacity: 0.9,
    marginTop: 1,
  },
});
