import { OrderCard } from "@/src/components/orders/OrderCard";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { ORDER_STATUSES } from "@/src/constants/statuses";
import { useOrders } from "@/src/hooks/useOrders";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Order } from "@/src/types/api";
import { Package, Search, SlidersHorizontal, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = [
  "paid",
  "achete",
  "en_transit",
  "in_transit",
  "en_douane",
  "arrived",
  "disponible",
  "out_for_delivery",
  "on_way_to_delivery",
];

const STATUS_FILTER_OPTIONS = [
  { key: "all", label: "Toutes" },
  { key: "pending_payment", label: ORDER_STATUSES.pending_payment.label },
  { key: "paid", label: ORDER_STATUSES.paid.label },
  { key: "in_transit", label: ORDER_STATUSES.in_transit.label },
  { key: "en_transit", label: ORDER_STATUSES.en_transit.label },
  { key: "arrived", label: ORDER_STATUSES.arrived.label },
  { key: "out_for_delivery", label: ORDER_STATUSES.out_for_delivery.label },
  { key: "done", label: ORDER_STATUSES.done.label },
  { key: "cancelled", label: ORDER_STATUSES.cancelled.label },
  { key: "incident", label: ORDER_STATUSES.incident.label },
];

// ─── Quick-stat pill ─────────────────────────────────────────────────────────

interface QuickStatConfig {
  label: string;
  count: number;
  color: string;
  filterKey: string;
}

function QuickStatPill({
  stat,
  isActive,
  onPress,
  c,
}: {
  stat: QuickStatConfig;
  isActive: boolean;
  onPress: () => void;
  c: Record<string, string>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickStat,
        {
          backgroundColor: isActive ? stat.color + "18" : c.surface,
          borderColor: isActive ? stat.color + "60" : c.border,
        },
      ]}
    >
      <Text
        style={[
          styles.quickStatValue,
          {
            color: isActive ? stat.color : c.text,
          },
        ]}
      >
        {stat.count}
      </Text>
      <Text
        style={[
          styles.quickStatLabel,
          { color: isActive ? stat.color : c.textMuted },
        ]}
      >
        {stat.label}
      </Text>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allOrders, isLoading, refetch } = useOrders();

  const quickStats: QuickStatConfig[] = useMemo(() => {
    const list = allOrders ?? [];
    return [
      {
        label: "Total",
        count: list.length,
        color: c.primary,
        filterKey: "all",
      },
      {
        label: "En cours",
        count: list.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
        color: c.info,
        filterKey: "_en_cours",
      },
      {
        label: "Livrées",
        count: list.filter((o) => ["livre", "done"].includes(o.status)).length,
        color: c.success,
        filterKey: "_livrees",
      },
      {
        label: "À payer",
        count: list.filter((o) =>
          ["pending", "pending_payment"].includes(o.status),
        ).length,
        color: c.warning,
        filterKey: "_a_payer",
      },
    ];
  }, [allOrders, c]);

  const filteredOrders = useMemo(() => {
    const list = allOrders ?? [];

    let base: Order[];
    if (activeFilter === "all") base = list;
    else if (activeFilter === "_en_cours")
      base = list.filter((o) => ACTIVE_STATUSES.includes(o.status));
    else if (activeFilter === "_livrees")
      base = list.filter((o) => ["livre", "done"].includes(o.status));
    else if (activeFilter === "_a_payer")
      base = list.filter((o) =>
        ["pending", "pending_payment"].includes(o.status),
      );
    else base = list.filter((o) => o.status === activeFilter);

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.shipping_route.origin.toLowerCase().includes(q) ||
        o.shipping_route.destination.toLowerCase().includes(q),
    );
  }, [allOrders, activeFilter, searchQuery]);

  const handleQuickStat = (filterKey: string) => {
    setActiveFilter(filterKey);
    setSearchQuery("");
    setShowFilters(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text variant="h2" style={{ color: c.primary }}>
            Mes commandes
          </Text>
          {!isLoading && allOrders && (
            <View
              style={[styles.totalPill, { backgroundColor: c.primary + "14" }]}
            >
              <Text
                style={[
                  styles.totalPillText,
                  { color: c.primary, fontFamily: "JetBrainsMono_500Medium" },
                ]}
              >
                {allOrders.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Quick stats row ── */}
        {isLoading ? (
          <View style={styles.quickStatsRow}>
            <Skeleton height={56} className="flex-1 mr-2" />
            <Skeleton height={56} className="flex-1 mr-2" />
            <Skeleton height={56} className="flex-1 mr-2" />
            <Skeleton height={56} className="flex-1" />
          </View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(280)}
            style={styles.quickStatsRow}
          >
            {quickStats.map((stat) => (
              <QuickStatPill
                key={stat.filterKey}
                stat={stat}
                isActive={activeFilter === stat.filterKey}
                onPress={() => handleQuickStat(stat.filterKey)}
                c={c}
              />
            ))}
          </Animated.View>
        )}

        {/* ── Search bar ── */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Search size={17} color={c.textMuted} strokeWidth={1.5} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Référence, origine, destination..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <X size={16} color={c.textMuted} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            hitSlop={8}
            style={styles.filterToggle}
          >
            <SlidersHorizontal
              size={17}
              color={showFilters ? c.primary : c.textMuted}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>

        {/* ── Status filter chips ── */}
        {showFilters && (
          <Animated.View
            entering={FadeInDown.duration(220)}
            style={styles.filterRow}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {STATUS_FILTER_OPTIONS.map((opt) => {
                  const isActive = activeFilter === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setActiveFilter(opt.key)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isActive ? c.primary : c.surface,
                          borderColor: isActive ? c.primary : c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: isActive ? "#fff" : c.textMuted },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* ── Results count ── */}
        {!isLoading && (
          <Text style={[styles.resultCount, { color: c.textMuted }]}>
            {filteredOrders.length} résultat
            {filteredOrders.length !== 1 ? "s" : ""}
            {activeFilter !== "all" ? " · filtrées" : ""}
          </Text>
        )}

        {/* ── List ── */}
        {isLoading ? (
          <>
            <Skeleton height={100} className="mb-3" />
            <Skeleton height={100} className="mb-3" />
            <Skeleton height={100} />
          </>
        ) : filteredOrders.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Package size={36} color={c.textMuted} strokeWidth={1.2} />
            <Text style={[styles.emptyTitle, { color: c.textMuted }]}>
              {searchQuery.trim()
                ? "Aucune commande ne correspond"
                : "Aucune commande pour le moment"}
            </Text>
            {searchQuery.trim() && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={styles.emptyAction}
              >
                <Text
                  style={{
                    color: c.primary,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  Effacer la recherche
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredOrders.map((order: Order, i: number) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  totalPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  totalPillText: { fontSize: 13 },

  quickStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  quickStatValue: { fontSize: 18, lineHeight: 22 },
  quickStatLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    fontFamily: "Inter_400Regular",
  },
  filterToggle: { marginLeft: 2 },

  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  resultCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  emptyTitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyAction: { marginTop: 4 },
});
