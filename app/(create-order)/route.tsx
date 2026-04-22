import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { useCreateOrder } from "@/src/context/CreateOrderContext";
import { useShippingRoutes } from "@/src/hooks/useShippingRoutes";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { RouteCountry } from "@/src/types/api";
import { useRouter } from "expo-router";
import {
  Anchor,
  ArrowRight,
  Check,
  MapPin,
  Plane,
  RefreshCw,
  Truck,
  WifiOff,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TRANSPORT_LABELS: Record<string, string> = {
  air_normal: "Aérien classique",
  air_express: "Aérien express",
  sea: "Maritime",
  road: "Terrestre",
};

const CITY_LABELS: Record<string, string> = {
  brazzaville: "Brazzaville",
  pointe_noire: "Pointe-Noire",
};

function TransportIcon({
  mode,
  color,
  size = 14,
}: {
  mode: string;
  color: string;
  size?: number;
}) {
  if (mode === "sea")
    return <Anchor size={size} color={color} strokeWidth={1.8} />;
  if (mode === "road")
    return <Truck size={size} color={color} strokeWidth={1.8} />;
  return <Plane size={size} color={color} strokeWidth={1.8} />;
}

function FlagEmoji({
  emoji,
  size = 16,
}: {
  emoji: string | null;
  size?: number;
}) {
  if (!emoji) return null;
  return <Text style={{ fontSize: size, lineHeight: size + 4 }}>{emoji}</Text>;
}

export default function Step2RouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, setRouteId } = useCreateOrder();
  const {
    data: routes,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useShippingRoutes();

  // Collect unique origin countries from active routes
  const originTabs = useMemo(() => {
    if (!routes) return [];
    const seen = new Set<string>();
    const tabs: RouteCountry[] = [];
    for (const r of routes) {
      if (r.origin_country && !seen.has(r.origin_country.code)) {
        seen.add(r.origin_country.code);
        tabs.push(r.origin_country);
      }
    }
    return tabs;
  }, [routes]);

  const [activeCode, setActiveCode] = useState<string | null>(null);

  // Auto-select first tab when routes load
  const effectiveCode = activeCode ?? originTabs[0]?.code ?? null;

  const filtered = useMemo(
    () =>
      (routes ?? []).filter((r) => r.origin_country?.code === effectiveCode),
    [routes, effectiveCode],
  );

  const handleSelect = (routeId: number) => {
    setRouteId(routeId);
    router.navigate("/(create-order)/parcel" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
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
          onPress={() => router.back()}
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
            Retour
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

      {/* Step label */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: c.textMuted,
          }}
        >
          Étape 2 sur 6 — Choisissez votre itinéraire
        </Text>
      </View>

      {/* Origin country tabs */}
      {!isLoading && !isFetching && !isError && originTabs.length > 0 && (
        <ScrollView
          horizontal
          // showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
            // alignItems: "center",
          }}
        >
          {originTabs.map((country) => {
            const active = country.code === effectiveCode;
            return (
              <Pressable
                key={country.code}
                onPress={() => setActiveCode(country.code)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? c.primary : c.surface,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <FlagEmoji emoji={country.flag_emoji} size={15} />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: active ? "#fff" : c.text,
                    marginLeft: 6,
                  }}
                >
                  {country.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Animated.ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Skeletons */}
        {(isLoading || isFetching) && (
          <>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <Skeleton height={36} style={{ flex: 1, borderRadius: 20 }} />
              <Skeleton height={36} style={{ flex: 1, borderRadius: 20 }} />
            </View>
            <Skeleton height={104} className="mb-3 rounded-xl" />
            <Skeleton height={104} className="mb-3 rounded-xl" />
            <Skeleton height={104} className="rounded-xl" />
          </>
        )}

        {/* Error */}
        {!isLoading && !isFetching && isError && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <WifiOff size={36} color={c.textMuted} strokeWidth={1.3} />
            <Text
              style={{
                fontFamily: "Syne_600SemiBold",
                fontSize: 15,
                color: c.text,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Routes indisponibles
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: c.textMuted,
                marginTop: 6,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Impossible de charger les routes. Vérifiez votre connexion.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { backgroundColor: c.primary }]}
            >
              <RefreshCw size={14} color="#fff" strokeWidth={2} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: "#fff",
                }}
              >
                Réessayer
              </Text>
            </Pressable>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isFetching && !isError && filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <MapPin size={40} color={c.textMuted} strokeWidth={1.2} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: c.textMuted,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Aucune route disponible pour ce pays.
            </Text>
          </View>
        )}

        {/* Route cards */}
        {!isLoading &&
          !isFetching &&
          !isError &&
          filtered.map((route, i) => {
            const active = state.routeId === route.id;
            const days =
              route.transit_days_min != null && route.transit_days_max != null
                ? `${route.transit_days_min}–${route.transit_days_max} j`
                : route.transit_days_min != null
                  ? `${route.transit_days_min} j`
                  : null;
            const isExpress = route.transport_mode === "air_express";
            const isSea = route.transport_mode === "sea";

            return (
              <Animated.View
                key={route.id}
                entering={FadeInDown.delay(i * 60).duration(280)}
              >
                <Pressable
                  onPress={() => handleSelect(route.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: active ? c.primary + "0C" : c.surface,
                      borderColor: active ? c.primary : c.border,
                    },
                  ]}
                >
                  {/* Transport mode badge */}
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.modeBadge,
                        { backgroundColor: active ? c.primary : c.base200 },
                      ]}
                    >
                      <TransportIcon
                        mode={route.transport_mode}
                        color={active ? "#fff" : c.textMuted}
                        size={13}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          color: active ? "#fff" : c.textMuted,
                          marginLeft: 5,
                        }}
                      >
                        {TRANSPORT_LABELS[route.transport_mode] ??
                          route.transport_mode}
                      </Text>
                      {isExpress && (
                        <View
                          style={[
                            styles.expressBadge,
                            {
                              backgroundColor: active
                                ? "rgba(255,255,255,0.2)"
                                : c.accent + "22",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Inter_700Bold",
                              fontSize: 9,
                              color: active ? "#fff" : c.accent,
                              letterSpacing: 0.5,
                            }}
                          >
                            EXPRESS
                          </Text>
                        </View>
                      )}
                    </View>
                    {active && (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: c.primary },
                        ]}
                      >
                        <Check size={11} color="#fff" strokeWidth={2.5} />
                      </View>
                    )}
                  </View>

                  {/* Origin → Destination */}
                  <View style={styles.routeRow}>
                    <View style={styles.countryChip}>
                      <FlagEmoji
                        emoji={route.origin_country?.flag_emoji ?? null}
                        size={15}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 13,
                          color: active ? c.primary : c.text,
                          marginLeft: 5,
                        }}
                      >
                        {route.origin_country?.name ?? "?"}
                      </Text>
                    </View>
                    <ArrowRight
                      size={14}
                      color={c.textMuted}
                      strokeWidth={2}
                      style={{ marginHorizontal: 6 }}
                    />
                    <View style={styles.countryChip}>
                      <FlagEmoji
                        emoji={route.destination_country?.flag_emoji ?? null}
                        size={15}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 13,
                          color: active ? c.primary : c.text,
                          marginLeft: 5,
                        }}
                      >
                        {route.destination_country?.name ?? "?"}
                      </Text>
                    </View>
                  </View>

                  {/* Meta: city · transit · price */}
                  <View style={styles.metaRow}>
                    {route.city ? (
                      <View
                        style={[
                          styles.metaChip,
                          { borderColor: c.border, backgroundColor: c.base200 },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 11,
                            color: c.textMuted,
                          }}
                        >
                          {CITY_LABELS[route.city] ?? route.city}
                        </Text>
                      </View>
                    ) : null}
                    {days ? (
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 11,
                          color: c.textMuted,
                        }}
                      >
                        {days}
                      </Text>
                    ) : null}
                    {route.price_per_kg ? (
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          color: active ? c.primary : c.text,
                        }}
                      >
                        {parseFloat(route.price_per_kg).toLocaleString("fr-FR")}{" "}
                        {route.currency}/{isSea ? "cbm" : "kg"}
                      </Text>
                    ) : null}
                  </View>
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
  tab: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 20,
    height: 36,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expressBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  routeRow: { flexDirection: "row", alignItems: "center" },
  countryChip: { flexDirection: "row", alignItems: "center" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  metaChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  errorBox: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
});
