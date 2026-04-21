import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Home, Package, Plus, CreditCard, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/src/theme/ThemeProvider';

const TAB_HEIGHT = 64;
const FAB_SIZE = 52;

interface TabConfig {
  name: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  isFab?: boolean;
}

const TABS: TabConfig[] = [
  { name: 'index', label: 'Accueil', Icon: Home },
  { name: 'tracking', label: 'Commandes', Icon: Package },
  { name: 'add-order', label: 'Ajouter', Icon: Plus, isFab: true },
  { name: 'payments', label: 'Paiements', Icon: CreditCard },
  { name: 'tickets', label: 'Support', Icon: MessageSquare },
];

interface TabItemProps {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
  c: Record<string, string>;
}

function FabItem({ tab, isActive, onPress, c }: TabItemProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
          hitSlop={6}
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            backgroundColor: isActive ? c.accent : c.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isActive ? c.accent : c.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
            marginBottom: 6,
          }}
        >
          <tab.Icon size={24} color="#fff" strokeWidth={2} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function RegularItem({ tab, isActive, onPress, c }: TabItemProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = isActive ? c.primary : c.textMuted;

  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.88, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        hitSlop={4}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 4 }}
      >
        <tab.Icon
          size={22}
          color={color}
          strokeWidth={isActive ? 2 : 1.5}
        />
        <View style={{ marginTop: 3, alignItems: 'center' }}>
          <Animated.Text
            style={{
              fontSize: 10,
              fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
              color,
            }}
          >
            {tab.label}
          </Animated.Text>
          {isActive && (
            <View
              style={{
                marginTop: 3,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: c.primary,
              }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        height: TAB_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderTopColor: c.border,
        alignItems: 'stretch',
      }}
    >
      {TABS.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        const isActive = routeIndex !== -1 && routeIndex === state.index;

        const onPress = () => {
          if (routeIndex === -1) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[routeIndex].key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        if (tab.isFab) {
          return (
            <FabItem key={tab.name} tab={tab} isActive={isActive} onPress={onPress} c={c} />
          );
        }
        return (
          <RegularItem key={tab.name} tab={tab} isActive={isActive} onPress={onPress} c={c} />
        );
      })}
    </View>
  );
}
