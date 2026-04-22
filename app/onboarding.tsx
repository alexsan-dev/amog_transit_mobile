import { Button } from "@/src/components/ui/Button";
import { Text } from "@/src/components/ui/Text";
import { storageGet, storageSet } from "@/src/lib/storage";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Globe,
  MessageSquare,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.65;
const SLIDE_HEIGHT = IMAGE_SIZE + 56;
const ONBOARDING_KEY = "has_seen_onboarding";

const STEPS = [
  {
    keyword: "SIMPLICITÉ",
    icon: Globe,
    title: "Votre fret, simplifié",
    body: "AMOG TRANSIT vous accompagne de la Chine ou de la France jusqu'au Congo. Aérien ou maritime, nous gérons tout.",
    image: "https://amog-transit.com/images/prepared/slide_1.png?v=3.6",
  },
  {
    keyword: "TRAÇABILITÉ",
    icon: Activity,
    title: "Suivi en temps réel",
    body: "Suivez chaque étape de votre colis : achat, transit, douane, livraison. Notifications push à chaque changement.",
    image: "https://amog-transit.com/images/prepared/slide_2.png?v=3.6",
  },
  {
    keyword: "RÉACTIVITÉ",
    icon: MessageSquare,
    title: "Support dédié",
    body: "Une question ? Un blocage ? Contactez notre équipe directement depuis l'app. Réponse garantie sous 24h.",
    image: "https://amog-transit.com/images/prepared/slide_3.png?v=3.6",
  },
];

function SwipeHint({ side, color }: { side: "left" | "right"; color: string }) {
  const isReducedMotion = useReducedMotion();
  const iconOpacity = useSharedValue(0);
  const iconNudge = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    const nudge = side === "right" ? 6 : -6;

    iconOpacity.value = withDelay(
      350,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 450 }),
          withTiming(0.15, { duration: 750 }),
        ),
        -1,
      ),
    );
    iconNudge.value = withDelay(
      350,
      withRepeat(
        withSequence(
          withTiming(nudge, { duration: 450 }),
          withTiming(0, { duration: 750 }),
        ),
        -1,
      ),
    );
    ringScale.value = withDelay(
      550,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2.2, { duration: 950 }),
        ),
        -1,
      ),
    );
    ringOpacity.value = withDelay(
      550,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 150 }),
          withTiming(0, { duration: 800 }),
        ),
        -1,
      ),
    );
    return () => {
      iconOpacity.value = 0;
      iconNudge.value = 0;
      ringOpacity.value = 0;
    };
  }, [side, isReducedMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: isReducedMotion ? 0.5 : iconOpacity.value,
    transform: [{ translateX: isReducedMotion ? 0 : iconNudge.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: isReducedMotion ? 0 : ringOpacity.value,
    transform: [{ scale: isReducedMotion ? 1 : ringScale.value }],
  }));

  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 14,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            ringStyle,
            {
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: color,
            },
          ]}
        />
        <Animated.View
          style={[
            iconStyle,
            {
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: color + "14",
              borderWidth: 1,
              borderColor: color + "28",
            },
          ]}
        >
          <Icon size={17} color={color} strokeWidth={1.5} />
        </Animated.View>
      </View>
    </View>
  );
}

function AnimatedDot({ isActive }: { isActive: boolean }) {
  const isReducedMotion = useReducedMotion();
  const w = useSharedValue(isActive ? 24 : 8);
  useEffect(() => {
    w.value = isReducedMotion
      ? isActive
        ? 24
        : 8
      : withSpring(isActive ? 24 : 8, { damping: 18, stiffness: 220 });
  }, [isActive, isReducedMotion]);
  const animStyle = useAnimatedStyle(() => ({ width: w.value }));
  return (
    <Animated.View
      style={[animStyle, { height: 8, borderRadius: 4, marginHorizontal: 4 }]}
      className={isActive ? "bg-primary" : "bg-border"}
    />
  );
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { c } = useTheme();
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    storageGet(ONBOARDING_KEY).then((val) => {
      if (val === "true") router.replace("/(auth)/login");
    });
  }, []);

  const finish = useCallback(async () => {
    await storageSet(ONBOARDING_KEY, "true");
    router.replace("/(auth)/login");
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      finish();
    }
  }, [currentIndex, finish]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(newIndex);
    },
    [],
  );

  const step = STEPS[currentIndex];
  const StepIcon = step.icon;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
        <Image
          source="https://amog-transit.com/logo/logo.png"
          style={{ width: 38, height: 38, borderRadius: 19 }}
          contentFit="cover"
        />
        <Pressable onPress={finish} hitSlop={12}>
          <Text className="text-text-muted font-body text-sm">Passer</Text>
        </Pressable>
      </View>

      {/* Swipeable zone — image only */}
      <View style={{ height: SLIDE_HEIGHT, position: "relative" }}>
        <FlatList
          ref={flatListRef}
          data={STEPS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          style={{ height: SLIDE_HEIGHT }}
          renderItem={({ item }) => (
            <View
              style={{
                width,
                height: SLIDE_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: IMAGE_SIZE + 20,
                  height: IMAGE_SIZE + 20,
                  borderRadius: 28,
                  backgroundColor: c.surface,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.07,
                  shadowRadius: 14,
                  elevation: 5,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: 22,
                  }}
                  contentFit="cover"
                  transition={300}
                />
              </View>
            </View>
          )}
          keyExtractor={(_, i) => String(i)}
        />

        {currentIndex > 0 && (
          <SwipeHint key={`l-${currentIndex}`} side="left" color={c.primary} />
        )}
        {currentIndex < STEPS.length - 1 && (
          <SwipeHint key={`r-${currentIndex}`} side="right" color={c.primary} />
        )}
      </View>

      {/* Narrative card + dots + CTA */}
      <View className="flex-1 px-5 pt-4 pb-2 justify-between">
        {isReducedMotion ? (
          <View
            key={currentIndex}
            className="bg-surface border border-border rounded-2xl"
            style={{
              borderTopColor: c.primary,
              borderTopWidth: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <OnboardingCardContent
              step={step}
              currentIndex={currentIndex}
              c={c}
            />
          </View>
        ) : (
          <Animated.View
            key={currentIndex}
            entering={FadeInDown.duration(300).springify().damping(22)}
            className="bg-surface border border-border rounded-2xl"
            style={{
              borderTopColor: c.primary,
              borderTopWidth: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <OnboardingCardContent
              step={step}
              currentIndex={currentIndex}
              c={c}
            />
          </Animated.View>
        )}

        {/* dots */}
        <View className="flex-row justify-center my-4">
          {STEPS.map((_, i) => (
            <AnimatedDot key={i} isActive={i === currentIndex} />
          ))}
        </View>

        <Button
          title={currentIndex < STEPS.length - 1 ? "Continuer" : "Commencer"}
          onPress={goNext}
        />
      </View>
    </SafeAreaView>
  );
}

function OnboardingCardContent({
  step,
  currentIndex,
  c,
}: {
  step: (typeof STEPS)[0];
  currentIndex: number;
  c: Record<string, string>;
}) {
  const StepIcon = step.icon;
  return (
    <View className="p-5">
      {/* keyword row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
            <StepIcon size={15} color={c.primary} strokeWidth={1.5} />
          </View>
          <Text
            style={{ letterSpacing: 1.8 }}
            className="font-mono text-[10px] font-semibold text-primary"
          >
            {step.keyword}
          </Text>
        </View>
        <Text className="font-mono text-[10px] text-text-muted">
          {String(currentIndex + 1).padStart(2, "0")}
          {" / "}
          {String(STEPS.length).padStart(2, "0")}
        </Text>
      </View>

      {/* divider */}
      <View className="h-px bg-border mb-4" />

      {/* title */}
      <Text variant="h2" className="text-primary mb-3">
        {step.title}
      </Text>

      {/* body with left accent */}
      <View
        style={{
          borderLeftWidth: 2,
          borderLeftColor: c.primary + "30",
          paddingLeft: 12,
        }}
      >
        <Text className="text-text-muted font-body text-sm leading-[22px]">
          {step.body}
        </Text>
      </View>

      {/* watermark */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", bottom: -2, right: 16 }}
      >
        <Text
          style={{
            fontSize: 80,
            lineHeight: 80,
            fontWeight: "900",
            color: c.primary + "0C",
            fontFamily: "Syne_700Bold",
          }}
        >
          {String(currentIndex + 1).padStart(2, "0")}
        </Text>
      </View>
    </View>
  );
}
