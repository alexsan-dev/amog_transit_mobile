import { OrderCard } from "@/src/components/orders/OrderCard";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { ORDER_STATUSES, STATUS_COLORS } from "@/src/constants/statuses";
import { useApiImage } from "@/src/hooks/useApiImage";
import { useBlogPosts } from "@/src/hooks/useBlogPosts";
import { useOrders } from "@/src/hooks/useOrders";
import { useProfile } from "@/src/hooks/useProfile";
import { useTheme } from "@/src/theme/ThemeProvider";
import { itemEnter, screenEnter } from "@/src/theme/animations";
import { BlogPost, Order } from "@/src/types/api";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  MapPin,
  MessageSquare,
  Package,
  Search,
  Truck,
} from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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

const STATUS_PROGRESS: Record<string, number> = {
  pending: 5,
  pending_payment: 10,
  paid: 20,
  achete: 28,
  en_transit: 45,
  in_transit: 45,
  en_douane: 55,
  arrived: 65,
  disponible: 80,
  out_for_delivery: 85,
  on_way_to_delivery: 93,
  livre: 100,
  done: 100,
};

function getProgressColor(status: string, c: Record<string, string>): string {
  if (["pending", "pending_payment", "en_douane"].includes(status))
    return c.warning;
  if (
    [
      "livre",
      "done",
      "disponible",
      "out_for_delivery",
      "on_way_to_delivery",
    ].includes(status)
  )
    return c.success;
  if (status === "incident") return c.error;
  return c.info;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  value,
  label,
  color,
  index,
  c,
}: {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  value: number;
  label: string;
  color: string;
  index: number;
  c: Record<string, string>;
}) {
  return (
    <Animated.View entering={itemEnter(index)} style={styles.kpiCard}>
      <View
        style={[
          styles.kpiInner,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <View style={[styles.kpiIconBox, { backgroundColor: color + "18" }]}>
          <Icon size={18} color={color} strokeWidth={1.5} />
        </View>
        <Text
          style={[
            styles.kpiValue,
            { color: c.text, fontFamily: "JetBrainsMono_500Medium" },
          ]}
        >
          {value}
        </Text>
        <Text style={[styles.kpiLabel, { color: c.textMuted }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const pct = useSharedValue(0);

  React.useEffect(() => {
    pct.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${pct.value}%` as `${number}%`,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: color + "22" }]}>
      <Animated.View
        style={[styles.progressFill, { backgroundColor: color }, animStyle]}
      />
    </View>
  );
}

function ActiveOrderItem({
  order,
  index,
  c,
  onPress,
}: {
  order: Order;
  index: number;
  c: Record<string, string>;
  onPress: () => void;
}) {
  const progress = STATUS_PROGRESS[order.status] ?? 10;
  const barColor = getProgressColor(order.status, c);
  const statusMeta =
    ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const statusColors =
    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS];

  return (
    <Animated.View entering={itemEnter(index + 1)}>
      <Pressable onPress={onPress} style={styles.activeOrderRow}>
        {/* Reference + badge */}
        <View style={styles.activeOrderHeader}>
          <Text
            style={[
              styles.activeOrderRef,
              { color: c.primary, fontFamily: "JetBrainsMono_400Regular" },
            ]}
            numberOfLines={1}
          >
            {order.reference}
          </Text>
          {statusColors && (
            <Badge
              status={order.status as keyof typeof STATUS_COLORS}
              label={statusMeta?.label ?? order.status}
            />
          )}
        </View>

        {/* Route */}
        <View style={styles.activeOrderRoute}>
          <MapPin size={11} color={c.textMuted} strokeWidth={1.5} />
          <Text style={[styles.activeOrderRouteText, { color: c.textMuted }]}>
            {order.shipping_route.origin} → {order.shipping_route.destination}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.activeOrderProgressRow}>
          <View style={styles.activeOrderProgressTrack}>
            <ProgressBar progress={progress} color={barColor} />
          </View>
          <Text
            style={[
              styles.activeOrderPct,
              { color: barColor, fontFamily: "JetBrainsMono_400Regular" },
            ]}
          >
            {progress}%
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({
  title,
  count,
  onViewAll,
  c,
}: {
  title: string;
  count?: number;
  onViewAll?: () => void;
  c: Record<string, string>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="h3" style={{ color: c.primary }}>
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <View
            style={[styles.countPill, { backgroundColor: c.primary + "18" }]}
          >
            <Text
              style={[
                styles.countPillText,
                { color: c.primary, fontFamily: "JetBrainsMono_400Regular" },
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </View>
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8} style={styles.viewAllBtn}>
          <Text
            style={[
              styles.viewAllText,
              { color: c.primary, fontFamily: "Inter_500Medium" },
            ]}
          >
            Voir tout
          </Text>
          <ArrowRight size={13} color={c.primary} strokeWidth={1.5} />
        </Pressable>
      )}
    </View>
  );
}

function QuickTrackingInput({ c }: { c: Record<string, string> }) {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleTrack = () => {
    const clean = ref.trim().toUpperCase();
    if (!clean) return;
    router.push(`/(client)/tracking/${clean}`);
  };

  return (
    <View
      style={[
        styles.trackingRow,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Search size={16} color={c.textMuted} strokeWidth={1.5} />
      <TextInput
        ref={inputRef}
        value={ref}
        onChangeText={(t) => setRef(t.toUpperCase())}
        placeholder="AMG-2026-00001"
        placeholderTextColor={c.textMuted}
        onSubmitEditing={handleTrack}
        returnKeyType="search"
        autoCapitalize="characters"
        style={[
          styles.trackingInput,
          { color: c.text, fontFamily: "JetBrainsMono_400Regular" },
        ]}
      />
      <Pressable
        onPress={handleTrack}
        style={[styles.trackingBtn, { backgroundColor: c.primary }]}
        hitSlop={4}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: "Inter_600SemiBold",
            fontSize: 12,
          }}
        >
          Suivre
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Blog trail card ─────────────────────────────────────────────────────────

function BlogTrail({
  posts,
  c,
}: {
  posts: BlogPost[];
  c: Record<string, string>;
}) {
  const router = useRouter();
  if (!Array.isArray(posts)) return null;
  return (
    <View>
      {posts.slice(0, 3).map((post, i) => (
        <Pressable
          key={post.id}
          onPress={() =>
            router.push(`https://amog-transit.com/blog/${post.slug}`)
          }
          style={[
            styles.blogCard,
            { backgroundColor: c.surface, borderColor: c.border },
            i > 0 && { marginTop: 8 },
          ]}
        >
          {post.cover_image || post.thumbnail ? (
            <Image
              source={{ uri: useApiImage(post.thumbnail ?? post.cover_image) }}
              style={styles.blogThumb}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.blogThumbPlaceholder,
                { backgroundColor: c.primary + "10" },
              ]}
            >
              <BookOpen size={5} color={c.primary} strokeWidth={1.5} />
            </View>
          )}
          <View style={{ flex: 1, paddingVertical: 2 }}>
            {post.category && (
              <Text style={[styles.blogCategory, { color: c.primary }]}>
                {post.category}
              </Text>
            )}
            <Text
              style={[styles.blogTitle, { color: c.text }]}
              numberOfLines={2}
            >
              {post.title}
            </Text>
            <Text
              style={[styles.blogExcerpt, { color: c.textMuted }]}
              numberOfLines={1}
            >
              {post.excerpt ?? ""}
            </Text>
          </View>
          <ArrowRight size={14} color={c.textMuted} strokeWidth={1.5} />
        </Pressable>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();

  const { data: orders, isLoading, refetch } = useOrders();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: blogPosts } = useBlogPosts();

  const firstName = profile?.name?.split(" ")[0] ?? "…";
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { kpis, activeOrders, recentOrders } = useMemo(() => {
    if (!orders) {
      return {
        kpis: { total: 0, enCours: 0, livrees: 0, attPaiement: 0 },
        activeOrders: [],
        recentOrders: [],
      };
    }
    const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    return {
      kpis: {
        total: orders.length,
        enCours: active.length,
        livrees: orders.filter((o) => ["livre", "done"].includes(o.status))
          .length,
        attPaiement: orders.filter((o) =>
          ["pending", "pending_payment"].includes(o.status),
        ).length,
      },
      activeOrders: active.slice(0, 5),
      recentOrders: orders.slice(0, 3),
    };
  }, [orders]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting hero ── */}
        <Animated.View entering={screenEnter} style={styles.heroWrap}>
          <View style={[styles.hero, { backgroundColor: c.primary }]}>
            <Text style={[styles.heroDate, { color: c.textOnPrimary + "A0" }]}>
              {today}
            </Text>
            <Text
              style={[
                styles.heroName,
                { color: c.textOnPrimary, fontFamily: "Syne_700Bold" },
              ]}
            >
              Bonjour, {loadingProfile ? "…" : firstName} 👋
            </Text>
            <View style={styles.heroMeta}>
              <View
                style={[
                  styles.heroPill,
                  { backgroundColor: c.textOnPrimary + "18" },
                ]}
              >
                <Truck size={12} color={c.textOnPrimary} strokeWidth={1.5} />
                <Text style={[styles.heroPillText, { color: c.textOnPrimary }]}>
                  {kpis.enCours} en cours
                </Text>
              </View>
              {kpis.attPaiement > 0 && (
                <View
                  style={[
                    styles.heroPill,
                    { backgroundColor: c.warning + "30" },
                  ]}
                >
                  <CreditCard size={12} color={c.warning} strokeWidth={1.5} />
                  <Text style={[styles.heroPillText, { color: c.warning }]}>
                    {kpis.attPaiement} à payer
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ── KPI grid ── */}
        <View style={styles.kpiGrid}>
          {isLoading ? (
            <>
              <View style={styles.kpiCard}>
                <Skeleton height={88} />
              </View>
              <View style={styles.kpiCard}>
                <Skeleton height={88} />
              </View>
              <View style={styles.kpiCard}>
                <Skeleton height={88} />
              </View>
              <View style={styles.kpiCard}>
                <Skeleton height={88} />
              </View>
            </>
          ) : (
            <>
              <KpiCard
                icon={Package}
                value={kpis.total}
                label="Total"
                color={c.primary}
                index={0}
                c={c}
              />
              <KpiCard
                icon={Truck}
                value={kpis.enCours}
                label="En cours"
                color={c.info}
                index={1}
                c={c}
              />
              <KpiCard
                icon={CheckCircle2}
                value={kpis.livrees}
                label="Livrées"
                color={c.success}
                index={2}
                c={c}
              />
              <KpiCard
                icon={CreditCard}
                value={kpis.attPaiement}
                label="Att. paiem."
                color={c.warning}
                index={3}
                c={c}
              />
            </>
          )}
        </View>

        {/* ── Commandes en cours ── */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(300)}
          style={styles.section}
        >
          <SectionHeader
            title="En cours"
            count={activeOrders.length}
            onViewAll={() => router.push("/(client)/orders")}
            c={c}
          />

          <Card className="p-0 overflow-hidden">
            {isLoading ? (
              <View style={{ padding: 16, gap: 16 }}>
                <Skeleton height={56} />
                <Skeleton height={56} />
              </View>
            ) : activeOrders.length === 0 ? (
              <View style={styles.emptyInCard}>
                <Truck size={28} color={c.textMuted} strokeWidth={1.2} />
                <Text style={[styles.emptyText, { color: c.textMuted }]}>
                  Aucune expédition en cours
                </Text>
              </View>
            ) : (
              activeOrders.map((order, i) => (
                <React.Fragment key={order.id}>
                  {i > 0 && (
                    <View
                      style={[styles.divider, { backgroundColor: c.border }]}
                    />
                  )}
                  <ActiveOrderItem
                    order={order}
                    index={i}
                    c={c}
                    onPress={() =>
                      router.push(`/(client)/tracking/${order.reference}`)
                    }
                  />
                </React.Fragment>
              ))
            )}
          </Card>
        </Animated.View>

        {/* ── Actions rapides ── */}
        <Animated.View
          entering={FadeInDown.delay(260).duration(300)}
          style={styles.section}
        >
          <SectionHeader title="Actions rapides" c={c} />

          <Card className="gap-3">
            <Button
              title="Créer une commande"
              onPress={() => router.push("/(client)/add-order")}
            />

            <QuickTrackingInput c={c} />

            <Pressable
              onPress={() => router.push("/(client)/tickets")}
              style={[
                styles.supportBtn,
                { borderColor: c.border, backgroundColor: c.surface },
              ]}
            >
              <MessageSquare size={16} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={[
                  styles.supportBtnText,
                  { color: c.text, fontFamily: "Inter_500Medium" },
                ]}
              >
                Contacter le support
              </Text>
              <ArrowRight size={14} color={c.textMuted} strokeWidth={1.5} />
            </Pressable>
          </Card>
        </Animated.View>

        {/* ── Activité récente ── */}
        <Animated.View
          entering={FadeInDown.delay(340).duration(300)}
          style={styles.section}
        >
          <SectionHeader
            title="Activité récente"
            onViewAll={() => router.push("/(client)/orders")}
            c={c}
          />

          {isLoading ? (
            <>
              <Skeleton height={96} className="mb-2.5" />
              <Skeleton height={96} className="mb-2.5" />
              <Skeleton height={96} />
            </>
          ) : recentOrders.length === 0 ? (
            <View
              style={[
                styles.emptyFullCard,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Package size={32} color={c.textMuted} strokeWidth={1.2} />
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                Aucune commande pour le moment
              </Text>
              <Pressable
                onPress={() => router.push("/(client)/add-order")}
                style={styles.emptyAction}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: c.primary,
                  }}
                >
                  Créer ma première commande
                </Text>
                <ArrowRight size={13} color={c.primary} />
              </Pressable>
            </View>
          ) : (
            recentOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))
          )}
        </Animated.View>

        {/* ── Blog / Lecture ── */}
        {Array.isArray(blogPosts) && blogPosts.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(420).duration(300)}
            style={styles.section}
          >
            <SectionHeader
              title="À lire"
              onViewAll={() => router.push("https://amog-transit.com/blog")}
              c={c}
            />
            <BlogTrail posts={blogPosts} c={c} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hero
  heroWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  hero: { borderRadius: 16, padding: 20 },
  heroDate: { fontSize: 12, textTransform: "capitalize", marginBottom: 4 },
  heroName: { fontSize: 22, marginBottom: 12 },
  heroMeta: { flexDirection: "row", gap: 8 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroPillText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  // KPI
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  kpiCard: { width: "50%", padding: 4 },
  kpiInner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  kpiValue: { fontSize: 22, lineHeight: 26 },
  kpiLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
    textAlign: "center",
  },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: { fontSize: 11 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { fontSize: 12 },

  // Active orders
  activeOrderRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  activeOrderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  activeOrderRef: { fontSize: 12, flex: 1 },
  activeOrderRoute: { flexDirection: "row", alignItems: "center", gap: 5 },
  activeOrderRouteText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  activeOrderProgressRow: { flexDirection: "row", alignItems: "center" },
  activeOrderProgressTrack: { flex: 1, marginRight: 8 },
  activeOrderPct: { fontSize: 11, minWidth: 32, textAlign: "right" },
  divider: { height: 1, marginHorizontal: 16 },

  // Progress bar
  progressTrack: { height: 5, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },

  // Tracking input
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  trackingInput: { flex: 1, fontSize: 12, paddingVertical: 0 },
  trackingBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },

  // Support button
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  supportBtnText: { flex: 1, fontSize: 13 },

  // Empty states
  emptyInCard: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  emptyFullCard: {
    alignItems: "center",
    paddingVertical: 32,
    borderWidth: 1,
    borderRadius: 12,
  },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },

  // Blog trail
  blogCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  blogThumb: { width: 48, height: 48, borderRadius: 8 },
  blogThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  blogCategory: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  blogTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  blogExcerpt: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
});
