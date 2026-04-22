import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { pressIn as animPressIn, pressOut as animPressOut } from '@/src/theme/animations';
import { Text } from './Text';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'accent' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, variant = 'primary', disabled, loading, ...props }: ButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    ghost: 'bg-transparent border border-border',
  }[variant];

  const textColor = {
    primary: 'text-text-on-primary',
    accent: 'text-text-on-primary',
    ghost: 'text-primary',
  }[variant];

  return (
    <Animated.View style={animStyle} className="w-full">
      <Pressable
        onPressIn={() => animPressIn(scale)}
        onPressOut={() => animPressOut(scale)}
        disabled={disabled || loading}
        className={`${bg} rounded-md px-5 py-3 items-center justify-center ${disabled || loading ? 'opacity-45' : ''}`}
        {...props}
      >
        <Text className={`font-body text-sm font-semibold ${textColor}`}>
          {loading ? 'Chargement...' : title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
