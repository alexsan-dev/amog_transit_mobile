import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { useCreateOrder } from "@/src/context/CreateOrderContext";
import { useShippingRoutes } from "@/src/hooks/useShippingRoutes";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { RouteCountry, ShippingRoute } from "@/src/types/api";
import { useRouter } from "expo-router";
import {
  Anchor,
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Plane,
  RefreshCw,
  Truck,
  WifiOff,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─── Constants ──────────────────────────────────────────────── */

const GROUPS: { key: string; label: string; modes: string[] }[] = [
  { key: "standard", label: "Aérien classique", modes: ["air_normal"] },
  { key: "express",  label: "Aérien express",   modes: ["air_express"] },
  { key: "maritime", label: "Maritime",          modes: ["sea"] },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function TransportIcon({ mode, color, size = 14 }: { mode: string; color: string; size?: number }) {
  if (mode === "sea")  return <Anchor size={size} color={color} strokeWidth={1.8} />;
  if (mode === "road") return <Truck  size={size} color={color} strokeWidth={1.8} />;
  return <Plane size={size} color={color} strokeWidth={1.8} />;
}

function FlagEmoji({ emoji, size = 16 }: { emoji: string | null; size?: number }) {
  if (!emoji) return null;
  return <Text style={{ fontSize: size, lineHeight: size + 4 }}>{emoji}</Text>;
}

/* ─── Dropdown picker ────────────────────────────────────────── */

interface DropdownProps {
  label: string;
  placeholder: string;
  value: RouteCountry | null;
  options: RouteCountry[];
  disabled?: boolean;
  onChange: (country: RouteCountry) => void;
  c: Record<string, string>;
}

function CountryDropdown({ label, placeholder, value, options, disabled, onChange, c }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={{ flex: 1 }}>
        <Text style={[styles.dropdownLabel, { color: c.textMuted }]}>{label}</Text>
        <Pressable
          onPress={() => !disabled && setOpen(true)}
          style={[
            styles.dropdownBtn,
            {
              backgroundColor: disabled ? c.base200 : c.surface,
              borderColor: value ? c.primary : c.border,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {value ? (
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 6 }}>
              <FlagEmoji emoji={value.flag_emoji} size={16} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: c.text, flex: 1 }} numberOfLines={1}>
                {value.name}
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.textMuted, flex: 1 }}>
              {placeholder}
            </Text>
          )}
          <ChevronDown size={16} color={c.textMuted} strokeWidth={2} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: c.surface, paddingBottom: insets.bottom + 16 },
            ]}
          >
            {/* Sheet header */}
            <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
              <Text style={{ fontFamily: "Syne_700Bold", fontSize: 15, color: c.text }}>
                {label}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <X size={20} color={c.textMuted} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView>
              {options.map((country) => {
                const active = value?.code === country.code;
                return (
                  <Pressable
                    key={country.code}
                    onPress={() => { onChange(country); setOpen(false); }}
                    style={[
                      styles.sheetItem,
                      { borderBottomColor: c.border, backgroundColor: active ? c.primary + "0D" : "transparent" },
                    ]}
                  >
                    <FlagEmoji emoji={country.flag_emoji} size={20} />
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: c.text, flex: 1, marginLeft: 10 }}>
                      {country.name}
                    </Text>
                    {active && <Check size={16} color={c.primary} strokeWidth={2.5} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/* ─── Route card ─────────────────────────────────────────────── */

function RouteCard({
  route,
  active,
  onPress,
  index,
  c,
}: {
  route: ShippingRoute;
  active: boolean;
  onPress: () => void;
  index: number;
  c: Record<string, string>;
}) {
  const days =
    route.transit_days_min != null && route.transit_days_max != null
      ? `${route.transit_days_min}–${route.transit_days_max} j`
      : route.transit_days_min != null
        ? `${route.transit_days_min} j`
        : null;
  const isSea = route.transport_mode === "sea";
  const CITY_LABELS: Record<string, string> = {
    brazzaville: "Brazzaville",
    pointe_noire: "Pointe-Noire",
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(260)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: active ? c.primary + "0C" : c.surface,
            borderColor: active ? c.primary : c.border,
          },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.modeBadge, { backgroundColor: active ? c.primary : c.base200 }]}>
            <TransportIcon mode={route.transport_mode} color={active ? "#fff" : c.textMuted} size={13} />
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            {/* Origin → Destination */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <FlagEmoji emoji={route.origin_country?.flag_emoji ?? null} size={13} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: active ? c.primary : c.text }}>
                {route.origin_country?.name ?? "?"}
              </Text>
              <ArrowRight size={12} color={c.textMuted} strokeWidth={2} style={{ marginHorizontal: 2 }} />
              <FlagEmoji emoji={route.destination_country?.flag_emoji ?? null} size={13} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: active ? c.primary : c.text }}>
                {route.destination_country?.name ?? "?"}
              </Text>
            </View>

            {/* Meta chips */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {route.city ? (
                <View style={[styles.metaChip, { borderColor: c.border, backgroundColor: c.base200 }]}>
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: c.textMuted }}>
                    {CITY_LABELS[route.city] ?? route.city}
                  </Text>
                </View>
              ) : null}
              {days ? (
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: c.textMuted }}>
                  {days}
                </Text>
              ) : null}
              {route.price_per_kg ? (
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: active ? c.primary : c.text }}>
                  {parseFloat(route.price_per_kg).toLocaleString("fr-FR")} {route.currency}/{isSea ? "cbm" : "kg"}
                </Text>
              ) : null}
            </View>
          </View>

          {active && (
            <View style={[styles.checkCircle, { backgroundColor: c.primary }]}>
              <Check size={11} color="#fff" strokeWidth={2.5} />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Main screen ────────────────────────────────────────────── */

export default function Step2RouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, setRouteId } = useCreateOrder();
  const { data: routes, isLoading, isError, refetch, isFetching } = useShippingRoutes();

  const [selectedOrigin, setSelectedOrigin] = useState<RouteCountry | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<RouteCountry | null>(null);

  /* Unique origin countries */
  const originOptions = useMemo(() => {
    if (!routes) return [];
    const seen = new Set<string>();
    const out: RouteCountry[] = [];
    for (const r of routes) {
      if (r.origin_country && !seen.has(r.origin_country.code)) {
        seen.add(r.origin_country.code);
        out.push(r.origin_country);
      }
    }
    return out;
  }, [routes]);

  /* Destination countries available for selected origin */
  const destinationOptions = useMemo(() => {
    if (!routes || !selectedOrigin) return [];
    const seen = new Set<string>();
    const out: RouteCountry[] = [];
    for (const r of routes) {
      if (
        r.origin_country?.code === selectedOrigin.code &&
        r.destination_country &&
        !seen.has(r.destination_country.code)
      ) {
        seen.add(r.destination_country.code);
        out.push(r.destination_country);
      }
    }
    return out;
  }, [routes, selectedOrigin]);

  /* Routes matching both selections */
  const matchedRoutes = useMemo(() => {
    if (!routes || !selectedOrigin || !selectedDestination) return null;
    return routes.filter(
      (r) =>
        r.origin_country?.code === selectedOrigin.code &&
        r.destination_country?.code === selectedDestination.code,
    );
  }, [routes, selectedOrigin, selectedDestination]);

  /* Group by transport type */
  const grouped = useMemo(() => {
    if (!matchedRoutes) return null;
    return GROUPS.map((g) => ({
      ...g,
      routes: matchedRoutes.filter((r) => g.modes.includes(r.transport_mode)),
    })).filter((g) => g.routes.length > 0);
  }, [matchedRoutes]);

  const handleOriginChange = (country: RouteCountry) => {
    setSelectedOrigin(country);
    setSelectedDestination(null);
  };

  const handleSelect = (routeId: number) => {
    setRouteId(routeId);
    router.navigate("/(create-order)/parcel" as any);
  };

  const bothSelected = selectedOrigin !== null && selectedDestination !== null;
  const hasResults = grouped !== null && grouped.length > 0;
  const noResults = bothSelected && grouped !== null && grouped.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: c.border, backgroundColor: c.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={{ color: c.primary, fontFamily: "Inter_500Medium", fontSize: 14 }}>
            Retour
          </Text>
        </Pressable>
        <Text style={{ fontFamily: "Syne_700Bold", fontSize: 16, color: c.text, textAlign: "center", flex: 1 }}>
          Nouvelle commande
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Step label */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.textMuted }}>
          Étape 2 sur 6 — Choisissez votre itinéraire
        </Text>
      </View>

      {/* Dropdowns */}
      <View style={[styles.dropdownRow, { borderBottomColor: c.border }]}>
        {isLoading || isFetching ? (
          <>
            <Skeleton height={56} style={{ flex: 1, borderRadius: 10 }} />
            <Skeleton height={56} style={{ flex: 1, borderRadius: 10 }} />
          </>
        ) : (
          <>
            <CountryDropdown
              label="Origine"
              placeholder="Choisir…"
              value={selectedOrigin}
              options={originOptions}
              onChange={handleOriginChange}
              c={c}
            />
            <CountryDropdown
              label="Destination"
              placeholder="Choisir…"
              value={selectedDestination}
              options={destinationOptions}
              disabled={!selectedOrigin}
              onChange={setSelectedDestination}
              c={c}
            />
          </>
        )}
      </View>

      {/* Content area */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* API error */}
        {!isLoading && !isFetching && isError && (
          <View style={[styles.errorBox, { backgroundColor: c.surface, borderColor: c.border }]}>
            <WifiOff size={36} color={c.textMuted} strokeWidth={1.3} />
            <Text style={{ fontFamily: "Syne_600SemiBold", fontSize: 15, color: c.text, marginTop: 12, textAlign: "center" }}>
              Routes indisponibles
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.textMuted, marginTop: 6, textAlign: "center", lineHeight: 20 }}>
              Impossible de charger les routes. Vérifiez votre connexion.
            </Text>
            <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: c.primary }]}>
              <RefreshCw size={14} color="#fff" strokeWidth={2} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" }}>
                Réessayer
              </Text>
            </Pressable>
          </View>
        )}

        {/* Prompt — nothing selected yet */}
        {!isLoading && !isFetching && !isError && !bothSelected && (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <MapPin size={40} color={c.border} strokeWidth={1.2} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.textMuted, marginTop: 14, textAlign: "center", lineHeight: 22 }}>
              Sélectionnez un pays d'origine{"\n"}et de destination pour voir les routes.
            </Text>
          </View>
        )}

        {/* No results */}
        {noResults && (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <MapPin size={40} color={c.border} strokeWidth={1.2} />
            <Text style={{ fontFamily: "Syne_600SemiBold", fontSize: 15, color: c.text, marginTop: 12, textAlign: "center" }}>
              Aucune route disponible
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.textMuted, marginTop: 6, textAlign: "center", lineHeight: 20 }}>
              Aucune route active pour ce trajet.{"\n"}Essayez une autre combinaison.
            </Text>
          </View>
        )}

        {/* Grouped results */}
        {hasResults && grouped!.map((group) => {
          let cardIndex = 0;
          return (
            <View key={group.key} style={{ marginBottom: 20 }}>
              {/* Group header */}
              <View style={[styles.groupHeader, { borderBottomColor: c.border }]}>
                <TransportIcon mode={group.modes[0]} color={c.textMuted} size={14} />
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: c.textMuted, marginLeft: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {group.label}
                </Text>
              </View>

              {group.routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  active={state.routeId === route.id}
                  onPress={() => handleSelect(route.id)}
                  index={cardIndex++}
                  c={c}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 60 },
  dropdownRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  modeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
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
