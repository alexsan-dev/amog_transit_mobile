import {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAnimatedStyle } from 'react-native-reanimated';

export const screenEnter = FadeInDown.duration(280).springify().damping(18);
export const screenExit  = FadeOutDown.duration(200);

export const itemEnter = (index: number) =>
  FadeInDown.delay(index * 70).duration(250).easing(Easing.out(Easing.quad));

export const sheetEnter = FadeInUp.duration(300).easing(Easing.out(Easing.cubic));
export const sheetExit  = FadeOutDown.duration(220);

export const pressIn  = (sv: any) => { 'worklet'; sv.value = withSpring(0.97, { damping: 15 }); };
export const pressOut = (sv: any) => { 'worklet'; sv.value = withSpring(1.0,  { damping: 15 }); };

export const trackingDotPulse = () =>
  useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withSequence(
      withTiming(1.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      withTiming(1.0,  { duration: 700, easing: Easing.inOut(Easing.ease) })
    ), -1, true) }],
    opacity: withRepeat(withSequence(
      withTiming(0.5, { duration: 700 }),
      withTiming(1.0, { duration: 700 })
    ), -1, true),
  }));

export const shimmerTranslate = (width: number) =>
  useAnimatedStyle(() => ({
    transform: [{ translateX: withRepeat(
      withTiming(width, { duration: 1000, easing: Easing.linear }),
      -1
    ) }],
  }));
