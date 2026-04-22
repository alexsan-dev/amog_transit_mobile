import { Text } from "@/src/components/ui/Text";
import { useCreateOrder } from "@/src/context/CreateOrderContext";
import { useProfile } from "@/src/hooks/useProfile";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { ChevronRight, ShoppingBag, Truck } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SERVICES = [
  {
    key: "transit" as const,
    label: "Transit",
    description: "J'expedie mes propres marchandises d'un point a un autre.",
    Icon: Truck,
  },
  {
    key: "purchase_assisted" as const,
    label: "Supply Chain",
    description: "J'achete des produits via AMOG et je les fais livrer.",
    Icon: ShoppingBag,
  },
];

export default function Step1ServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { setServiceType, state } = useCreateOrder();
  const { data: profile } = useProfile();

  const isProfileIncomplete = profile && !profile.phone;

  const handleSelect = (service: (typeof SERVICES)[0]["key"]) => {
    setServiceType(service);
    router.navigate("/(create-order)/route" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            borderBottomColor: c.border,
            backgroundColor: c.background,
          },
        ]}
      >
        <Pressable
          onPress={() => router.navigate('/(client)' as any)}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text
            style={{
              color: c.primary,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
            }}
          >
            Annuler
          </Text>
        </Pressable>
        <Text
          style={{
            fontFamily: "Syne_700Bold",
            fontSize: 16,
            color: c.text,
            textAlign: "center",
            flex: 1,
          }}
        >
          Nouvelle commande
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: c.textMuted,
            marginBottom: 20,
          }}
        >
          Etape 1 sur 6 — Choisissez votre service
        </Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isProfileIncomplete && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={[
              styles.profileAlert,
              {
                backgroundColor: c.warning + "12",
                borderColor: c.warning + "30",
              },
            ]}
          >
            <Text
              style={{
                color: c.warning,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              Completez votre profil (numero de telephone) avant de creer une
              commande.
            </Text>
          </Animated.View>
        )}

        {SERVICES.map((service, i) => {
          const Icon = service.Icon;
          const active = state.serviceType === service.key;
          return (
            <Animated.View
              key={service.key}
              entering={FadeInDown.delay(i * 80).duration(280)}
            >
              <Pressable
                onPress={() =>
                  !isProfileIncomplete && handleSelect(service.key)
                }
                style={[
                  styles.card,
                  {
                    backgroundColor: active ? c.primary + "0C" : c.surface,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: active ? c.primary + "18" : c.base200 },
                  ]}
                >
                  <Icon
                    size={24}
                    color={active ? c.primary : c.textMuted}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontFamily: "Syne_600SemiBold",
                      fontSize: 15,
                      color: active ? c.primary : c.text,
                      marginBottom: 4,
                    }}
                  >
                    {service.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: c.textMuted,
                      lineHeight: 18,
                    }}
                  >
                    {service.description}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={active ? c.primary : c.textMuted}
                  strokeWidth={2}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 60 },
  profileAlert: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
});
