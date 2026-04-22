import { apiClient } from "@/src/api/client";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { ORDER_STATUSES, STATUS_COLORS } from "@/src/constants/statuses";
import { resolveApiImageUrl } from "@/src/hooks/useApiImage";
import {
  useCancelOrder,
  useOrder,
  usePayOrderConfirm,
  usePayOrderInitiate,
  usePayOrderStatus,
} from "@/src/hooks/useOrders";
import { useTheme } from "@/src/theme/ThemeProvider";
import { itemEnter } from "@/src/theme/animations";
import { OrderLog, OrderMedia, OrderProduct } from "@/src/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileDown,
  FileText,
  MapPin,
  Package,
  Plane,
  Receipt,
  Scale,
  Ship,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.amogtransit.com";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  purchase_assisted: "Supply Chain",
  transit: "Transit",
};

const SERVICE_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  purchase_assisted: ShoppingBag,
  transit: Truck,
};

const TRANSPORT_LABELS: Record<string, string> = {
  air_normal: "Aérien classique",
  air_express: "Aérien express",
  sea: "Maritime",
  road: "Terrestre",
};

const TRANSPORT_ICONS: Record<string, React.ComponentType<any>> = {
  air_normal: Plane,
  air_express: Plane,
  sea: Ship,
  road: Truck,
};

function getWeightDisplay(
  order: NonNullable<ReturnType<typeof useOrder>["data"]>,
): string | null {
  const w = order.actual_weight ?? order.estimated_weight;
  if (w == null) return null;
  const n = typeof w === "string" ? parseFloat(w) : w;
  if (isNaN(n) || n <= 0) return null;
  return `${n} kg`;
}

function fmtXaf(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  visible,
  onDismiss,
}: {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onDismiss: () => void;
}) {
  const { c } = useTheme();
  const bgColor =
    type === "success" ? c.success : type === "error" ? c.error : c.info;
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[styles.toastContainer, { backgroundColor: bgColor }]}
    >
      <Text style={styles.toastText}>{message}</Text>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <X size={16} color="#fff" strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Journey stepper ─────────────────────────────────────────────────────────

const JOURNEY_STEPS = [
  { label: "Paiement", statuses: ["pending", "pending_payment"] },
  { label: "Acheté", statuses: ["paid", "achete"] },
  { label: "Transit", statuses: ["en_transit", "in_transit", "en_douane"] },
  { label: "Arrivé", statuses: ["arrived", "disponible"] },
  {
    label: "Livré",
    statuses: ["out_for_delivery", "on_way_to_delivery", "livre", "done"],
  },
];

function getStatusAccentColor(
  status: string,
  c: Record<string, string>,
): string {
  if (["pending", "pending_payment", "en_douane"].includes(status))
    return c.warning;
  if (["incident", "cancelled"].includes(status)) return c.error;
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
  return c.info;
}

function getStepIndex(status: string): number {
  return JOURNEY_STEPS.findIndex((s) => s.statuses.includes(status));
}

function PulsingDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: color + "50",
          alignItems: "center",
          justifyContent: "center",
        },
        ring,
      ]}
    >
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

function JourneyStepper({
  status,
  c,
}: {
  status: string;
  c: Record<string, string>;
}) {
  const currentIndex = getStepIndex(status);
  const isCancelled = status === "cancelled";
  const isIncident = status === "incident";

  if (isCancelled || isIncident) {
    return (
      <Card className="mb-4">
        <View style={styles.stepperCancelled}>
          <XCircle
            size={20}
            color={isCancelled ? c.error : c.warning}
            strokeWidth={1.5}
          />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: isCancelled ? c.error : c.warning,
              marginLeft: 8,
            }}
          >
            {isCancelled ? "Commande annulée" : "Incident signalé"}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <View style={styles.stepperRow}>
        {JOURNEY_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          return (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor: i <= currentIndex ? c.primary : c.border,
                    },
                  ]}
                />
              )}
              <View style={styles.stepNode}>
                {current ? (
                  <PulsingDot color={c.primary} />
                ) : done ? (
                  <View
                    style={[styles.stepDot, { backgroundColor: c.primary }]}
                  >
                    <CheckCircle2 size={12} color="#fff" strokeWidth={2.5} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        borderColor: c.border,
                      },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: done || current ? c.primary : c.textMuted,
                      fontFamily: current
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </Card>
  );
}

// ─── Service type chip ───────────────────────────────────────────────────────

function ServiceTypeChip({
  serviceType,
  c,
}: {
  serviceType?: string;
  c: Record<string, string>;
}) {
  if (!serviceType) return null;
  const Icon = SERVICE_TYPE_ICONS[serviceType] ?? Truck;
  const label = SERVICE_TYPE_LABELS[serviceType] ?? serviceType;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: c.primary + "12",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 6,
      }}
    >
      <Icon size={13} color={c.primary} strokeWidth={1.8} />
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          color: c.primary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Info card ───────────────────────────────────────────────────────────────

function InfoCard({
  order,
  c,
}: {
  order: NonNullable<ReturnType<typeof useOrder>["data"]>;
  c: Record<string, string>;
}) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const weight = getWeightDisplay(order);
  const transportMode = order.shipping_route?.transport_mode;
  const TransportIcon = transportMode
    ? (TRANSPORT_ICONS[transportMode] ?? Truck)
    : null;
  const transportLabel = transportMode
    ? (TRANSPORT_LABELS[transportMode] ?? transportMode)
    : null;

  return (
    <Card className="mb-4 overflow-hidden p-0">
      <View
        style={[
          styles.infoAccent,
          { backgroundColor: getStatusAccentColor(order.status, c) },
        ]}
      />
      <View
        style={{
          paddingLeft: 16,
          paddingRight: 12,
          paddingVertical: 14,
          gap: 12,
        }}
      >
        <ServiceTypeChip serviceType={order.service_type} c={c} />

        <View style={styles.infoRow}>
          <MapPin size={14} color={c.textMuted} strokeWidth={1.5} />
          <Text style={[styles.infoText, { color: c.text }]}>
            {order.shipping_route.origin}
            <Text style={{ color: c.textMuted }}> → </Text>
            {order.shipping_route.destination}
          </Text>
        </View>

        {transportLabel && TransportIcon && (
          <View style={styles.infoRow}>
            <TransportIcon size={14} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              {transportLabel}
            </Text>
          </View>
        )}

        {order.shipping_route.transit_days != null && (
          <View style={styles.infoRow}>
            <Clock size={14} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              Transit estimé : {order.shipping_route.transit_days} jours
            </Text>
          </View>
        )}

        {weight && (
          <View style={styles.infoRow}>
            <Scale size={14} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              Poids : {weight}
            </Text>
          </View>
        )}

        {order.delivery_address && (
          <View style={styles.infoRow}>
            <MapPin size={14} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              Livraison : {order.delivery_address}
            </Text>
          </View>
        )}

        {order.client_notes && (
          <View style={styles.infoRow}>
            <FileText size={14} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              Notes : {order.client_notes}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Calendar size={14} color={c.textMuted} strokeWidth={1.5} />
          <Text style={[styles.infoText, { color: c.textMuted }]}>
            Créée le {fmtDate(order.created_at)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// ─── Amount card ─────────────────────────────────────────────────────────────

function AmountCard({
  order,
  c,
  onDownloadInvoice,
}: {
  order: NonNullable<ReturnType<typeof useOrder>["data"]>;
  c: Record<string, string>;
  onDownloadInvoice?: () => void;
}) {
  const hasPricing = order.pricing != null;
  const hasAmount = (order.quoted_amount ?? 0) > 0;
  const isPaid = hasAmount && order.paid_amount >= (order.quoted_amount ?? 0);
  const isPartial = hasAmount && order.paid_amount > 0 && !isPaid;
  const ratio = hasAmount
    ? Math.min(order.paid_amount / (order.quoted_amount ?? 1), 1)
    : 0;
  const isPending = order.status === "pending";

  return (
    <Card className="mb-4">
      {!hasAmount && !hasPricing ? (
        <View style={styles.devisBox}>
          <View
            style={[
              styles.devisIcon,
              { backgroundColor: isPending ? c.info + "18" : c.warning + "18" },
            ]}
          >
            <Clock
              size={18}
              color={isPending ? c.info : c.warning}
              strokeWidth={1.5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: c.text,
              }}
            >
              {isPending
                ? "Devis en cours de préparation"
                : "En attente de paiement"}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: c.textMuted,
                marginTop: 2,
              }}
            >
              {isPending
                ? "Le montant vous sera communiqué sous peu."
                : "Cliquez sur « Procéder au paiement » pour initier le paiement."}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.amountRow}>
            <View>
              <Text style={[styles.amountLabel, { color: c.textMuted }]}>
                Montant total
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: c.text, fontFamily: "JetBrainsMono_100Medium" },
                ]}
              >
                {fmtXaf(order.pricing?.total ?? order.quoted_amount ?? 0)}{" "}
                <Text style={[styles.amountCurrency, { color: c.textMuted }]}>
                  {order.currency}
                </Text>
              </Text>
            </View>
            {isPaid && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={[
                    styles.paidBadge,
                    {
                      backgroundColor: c.success + "15",
                      borderColor: c.success + "30",
                    },
                  ]}
                >
                  <CheckCircle2 size={13} color={c.success} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      color: c.success,
                    }}
                  >
                    Payé
                  </Text>
                </View>
                <Pressable
                  onPress={onDownloadInvoice}
                  style={[
                    styles.paidBadge,
                    {
                      backgroundColor: c.primary + "10",
                      borderColor: c.primary + "25",
                      paddingHorizontal: 8,
                    },
                  ]}
                  hitSlop={6}
                >
                  <FileDown size={13} color={c.primary} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      color: c.primary,
                      marginLeft: 4,
                    }}
                  >
                    Facture
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Dynamic cost breakdown from backend pricing */}
          {order.pricing?.breakdown && order.pricing.breakdown.length > 0 && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: c.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Receipt
                  size={14}
                  color={c.textMuted}
                  strokeWidth={1.5}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.breakdownLabel, { color: c.textMuted }]}>
                  Détail des coûts
                </Text>
              </View>
              {order.pricing.breakdown.map((item, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text
                    style={[styles.breakdownText, { color: c.textMuted }]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: c.text }]}>
                    {fmtXaf(item.amount)} {order.currency}
                  </Text>
                </View>
              ))}
              <View
                style={[
                  styles.breakdownRow,
                  {
                    marginTop: 6,
                    paddingTop: 6,
                    borderTopWidth: 1,
                    borderTopColor: c.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: c.text,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 13,
                    color: c.primary,
                  }}
                >
                  {fmtXaf(order.pricing.total)} {order.currency}
                </Text>
              </View>
            </View>
          )}

          {isPartial && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.partialRow}>
                <Text style={[styles.partialText, { color: c.textMuted }]}>
                  Payé : {fmtXaf(order.paid_amount)} {order.currency}
                </Text>
                <Text
                  style={[
                    styles.partialText,
                    { color: c.success, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {Math.round(ratio * 100)}%
                </Text>
              </View>
              <View
                style={[styles.progressTrack, { backgroundColor: c.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: c.success,
                      width: `${ratio * 100}%` as `${number}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.partialText,
                  { color: c.textMuted, marginTop: 6 },
                ]}
              >
                Reste : {fmtXaf((order.quoted_amount ?? 0) - order.paid_amount)}{" "}
                {order.currency}
              </Text>
            </View>
          )}
        </>
      )}
    </Card>
  );
}

// ─── Products card ───────────────────────────────────────────────────────────

function ProductsCard({
  products,
  currency,
  c,
}: {
  products: OrderProduct[];
  currency: string;
  c: Record<string, string>;
}) {
  const fmt = (n: number | string) =>
    new Intl.NumberFormat("fr-FR").format(Number(n));
  const total = products.reduce((sum, p) => sum + (p.total ?? 0), 0);

  return (
    <Card className="mb-4">
      <View style={styles.cardHeader}>
        <Text variant="h3" style={{ color: c.primary }}>
          Articles
        </Text>
        <Text style={[styles.chipLabel, { color: c.textMuted }]}>
          {products.length} article{products.length > 1 ? "s" : ""}
        </Text>
      </View>
      {products.map((product, i) => (
        <Animated.View entering={itemEnter(i)} key={i}>
          {i > 0 && (
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          )}
          <View style={styles.productRow}>
            <View
              style={[
                styles.productIcon,
                { backgroundColor: c.primary + "10" },
              ]}
            >
              <Package size={14} color={c.primary} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.productName, { color: c.text }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <View style={styles.productMeta}>
                {product.quantity != null && (
                  <Text
                    style={[styles.productMetaText, { color: c.textMuted }]}
                  >
                    Qté : {product.quantity}
                  </Text>
                )}
                <Text style={[styles.productMetaText, { color: c.textMuted }]}>
                  PU : {fmt(product.unit_price)} {currency}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.productTotal,
                { color: c.text, fontFamily: "JetBrainsMono_400Regular" },
              ]}
            >
              {fmt(product.total || Number(product.unit_price))} {currency}
            </Text>
          </View>
        </Animated.View>
      ))}
      {total > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <View style={[styles.productRow, { paddingVertical: 8 }]}>
            <Text
              style={[
                styles.productName,
                { color: c.text, fontFamily: "Inter_600SemiBold", flex: 1 },
              ]}
            >
              Total articles
            </Text>
            <Text
              style={[
                styles.productTotal,
                {
                  color: c.primary,
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 14,
                },
              ]}
            >
              {fmt(total)} {currency}
            </Text>
          </View>
        </>
      )}
    </Card>
  );
}

// ─── Media gallery ───────────────────────────────────────────────────────────

function MediaGallery({
  media,
  c,
}: {
  media: OrderMedia[];
  c: Record<string, string>;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  if (!media || media.length === 0) return null;

  return (
    <>
      <Card className="mb-4">
        <View style={styles.cardHeader}>
          <Text variant="h3" style={{ color: c.primary }}>
            Photos
          </Text>
          <Text style={[styles.chipLabel, { color: c.textMuted }]}>
            {media.length} photo{media.length > 1 ? "s" : ""}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10, paddingVertical: 4 }}>
            {media.map((m, i) => (
              <Pressable
                key={m.id}
                onPress={() => setPreviewIndex(i)}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: c.surface,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Image
                  source={{ uri: resolveApiImageUrl(m.path) }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Card>
      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPreviewIndex(null)}
          />
          {previewIndex !== null && (
            <Image
              source={{ uri: resolveApiImageUrl(media[previewIndex].path) }}
              style={{ width: "90%", height: "60%", borderRadius: 12 }}
              resizeMode="contain"
            />
          )}
          <Pressable
            onPress={() => setPreviewIndex(null)}
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

// ─── Timeline card ────────────────────────────────────────────────────────────

function TimelineCard({
  logs,
  order,
  c,
}: {
  logs: OrderLog[];
  order: NonNullable<ReturnType<typeof useOrder>["data"]>;
  c: Record<string, string>;
}) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const statusMeta =
    ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const syntheticTimeline: {
    label: string;
    date: string;
    isCurrent?: boolean;
  }[] = [...logs.map((l) => ({ label: l.label, date: l.date }))];

  if (syntheticTimeline.length === 0) {
    syntheticTimeline.push({ label: "Commande créée", date: order.created_at });
    if (order.status !== "pending" && order.status !== "pending_payment") {
      syntheticTimeline.push({
        label: statusMeta?.label ?? order.status,
        date: order.updated_at,
        isCurrent: true,
      });
    } else {
      syntheticTimeline[0].isCurrent = true;
    }
  }

  const reversed = [...syntheticTimeline].reverse();

  return (
    <Card className="mb-4">
      <View style={[styles.cardHeader, { marginBottom: 16 }]}>
        <Text variant="h3" style={{ color: c.primary }}>
          Historique
        </Text>
      </View>
      {reversed.map((entry, i) => {
        const isLast = i === reversed.length - 1;
        return (
          <Animated.View
            entering={itemEnter(i)}
            key={i}
            style={styles.timelineRow}
          >
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: entry.isCurrent ? c.primary : c.border,
                    borderColor: entry.isCurrent ? c.primary : c.border,
                  },
                ]}
              />
              {!isLast && (
                <View
                  style={[styles.timelineLine, { backgroundColor: c.border }]}
                />
              )}
            </View>
            <View
              style={[styles.timelineContent, isLast && { marginBottom: 0 }]}
            >
              <Text
                style={[
                  styles.timelineLabel,
                  {
                    color: entry.isCurrent ? c.primary : c.text,
                    fontFamily: entry.isCurrent
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                {entry.label}
              </Text>
              <Text style={[styles.timelineDate, { color: c.textMuted }]}>
                {fmtDate(entry.date)}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </Card>
  );
}

// ─── Payment sheet ───────────────────────────────────────────────────────────

const OPERATORS = [
  { key: "mtn", label: "MTN Money", color: "#FFBB00" },
  { key: "airtel", label: "Airtel Money", color: "#E8002D" },
];

function PaymentSheet({
  visible,
  onClose,
  amount,
  currency,
  phone,
  setPhone,
  operator,
  setOperator,
  onConfirm,
  loading,
  c,
  insets,
}: {
  visible: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  phone: string;
  setPhone: (v: string) => void;
  operator: string;
  setOperator: (v: string) => void;
  onConfirm: () => void;
  loading: boolean;
  c: Record<string, string>;
  insets: { bottom: number };
}) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: c.surface, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={styles.sheetHeader}>
            <View>
              <Text
                style={[
                  styles.sheetTitle,
                  { color: c.text, fontFamily: "Syne_700Bold" },
                ]}
              >
                Paiement mobile
              </Text>
              <Text style={[styles.sheetSubtitle, { color: c.textMuted }]}>
                Choisissez votre opérateur
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[styles.closeBtn, { backgroundColor: c.background }]}
            >
              <X size={18} color={c.textMuted} strokeWidth={1.5} />
            </Pressable>
          </View>
          <View
            style={[
              styles.amountPill,
              {
                backgroundColor: c.primary + "10",
                borderColor: c.primary + "25",
              },
            ]}
          >
            <Text style={[styles.amountPillLabel, { color: c.textMuted }]}>
              Montant à payer
            </Text>
            <Text
              style={[
                styles.amountPillValue,
                { color: c.primary, fontFamily: "JetBrainsMono_500Medium" },
              ]}
            >
              {fmt(amount)} {currency}
            </Text>
          </View>
          <Text style={[styles.inputLabel, { color: c.text }]}>Opérateur</Text>
          <View style={styles.operatorRow}>
            {OPERATORS.map((op) => {
              const active = operator === op.key;
              return (
                <Pressable
                  key={op.key}
                  onPress={() => setOperator(op.key)}
                  style={[
                    styles.operatorCard,
                    {
                      backgroundColor: active ? op.color + "15" : c.background,
                      borderColor: active ? op.color : c.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.operatorDot, { backgroundColor: op.color }]}
                  />
                  <Text
                    style={{
                      fontFamily: active
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                      fontSize: 13,
                      color: active ? op.color : c.textMuted,
                    }}
                  >
                    {op.label}
                  </Text>
                  {active && (
                    <CheckCircle2
                      size={14}
                      color={op.color}
                      strokeWidth={2}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
          <Input
            label="Numéro de téléphone"
            placeholder="+242 06 400 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button
            title={loading ? "Traitement…" : "Confirmer le paiement"}
            onPress={onConfirm}
            loading={loading}
            disabled={!phone.trim()}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Payment processing overlay ──────────────────────────────────────────────

function PaymentProcessingOverlay({
  visible,
  onCancel,
  c,
}: {
  visible: boolean;
  onCancel: () => void;
  c: Record<string, string>;
}) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    if (!visible) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={[
          styles.processingOverlay,
          { backgroundColor: c.background + "F0" },
        ]}
      >
        <Animated.View style={pulseStyle}>
          <View
            style={[
              styles.processingIconCircle,
              { backgroundColor: c.primary + "15" },
            ]}
          >
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        </Animated.View>
        <Text
          style={[
            styles.processingTitle,
            { color: c.text, fontFamily: "Syne_700Bold" },
          ]}
        >
          Validation en cours…
        </Text>
        <Text
          style={[
            styles.processingText,
            { color: c.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          Veuillez valider la transaction sur votre téléphone.{"\n"}
          Ne fermez pas cette fenêtre.
        </Text>
        <Pressable onPress={onCancel} style={{ marginTop: 28 }} hitSlop={12}>
          <Text
            style={{
              color: c.error,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
            }}
          >
            Annuler l'attente
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Cancel bottom sheet ─────────────────────────────────────────────────────

function CancelSheet({
  visible,
  reference,
  onClose,
  onConfirm,
  loading,
  c,
  insets,
}: {
  visible: boolean;
  reference: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  c: Record<string, string>;
  insets: { bottom: number };
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: c.surface, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View
            style={[styles.cancelIconBox, { backgroundColor: c.error + "10" }]}
          >
            <AlertTriangle size={28} color={c.error} strokeWidth={1.5} />
          </View>
          <Text
            style={[
              styles.cancelTitle,
              { color: c.text, fontFamily: "Syne_700Bold" },
            ]}
          >
            Annuler la commande ?
          </Text>
          <Text
            style={[
              styles.cancelRef,
              { color: c.primary, fontFamily: "JetBrainsMono_400Regular" },
            ]}
          >
            {reference}
          </Text>
          <Text style={[styles.cancelBody, { color: c.textMuted }]}>
            Cette action est irréversible. Votre commande sera définitivement
            annulée et aucun remboursement ne sera traité si elle était déjà
            payée.
          </Text>
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            style={[
              styles.cancelConfirmBtn,
              { backgroundColor: c.error, opacity: loading ? 0.6 : 1 },
            ]}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
              }}
            >
              {loading ? "Annulation…" : "Oui, annuler la commande"}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelKeepBtn} hitSlop={8}>
            <Text
              style={{
                color: c.primary,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            >
              Garder ma commande
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  const { data: order, isLoading, refetch } = useOrder(id ?? "");
  const cancelMutation = useCancelOrder();
  const payInitiateMutation = usePayOrderInitiate();
  const payConfirmMutation = usePayOrderConfirm();
  const payStatusMutation = usePayOrderStatus();

  const [paySheetVisible, setPaySheetVisible] = useState(false);
  const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState("mtn");
  const [isPaying, setIsPaying] = useState(false);
  const [processingVisible, setProcessingVisible] = useState(false);
  const [pollRef, setPollRef] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "info", visible: false });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 4000);
    },
    [],
  );

  const statusMeta =
    ORDER_STATUSES[order?.status as keyof typeof ORDER_STATUSES];
  const accentColor = getStatusAccentColor(order?.status ?? "", c);

  const hasAmount = (order?.quoted_amount ?? 0) > 0;
  const isPending = order?.status === "pending";
  const isPendingPayment = order?.status === "pending_payment";
  const canCancel = isPending || isPendingPayment;

  const handlePayInitiate = () => {
    setPhone("");
    setOperator("mtn");
    setPaySheetVisible(true);
  };

  const handlePayConfirm = async () => {
    if (!order) return;
    if (!phone.trim()) {
      showToast("Veuillez saisir votre numéro de téléphone.", "error");
      return;
    }
    setIsPaying(true);
    try {
      // 1. Initiate
      const initRes = await payInitiateMutation.mutateAsync(order.reference);

      // 2. Confirm
      const confirmRes = await payConfirmMutation.mutateAsync({
        reference: order.reference,
        payment_id: initRes.payment_id,
        phone: phone.trim(),
        operator,
      });

      const status = confirmRes?.data?.status;

      if (status === "succeeded") {
        setPaySheetVisible(false);
        setPhone("");
        showToast("Paiement effectué avec succès !", "success");
        refetch();
      } else if (status === "failed") {
        showToast(confirmRes?.message ?? "Le paiement a échoué.", "error");
      } else {
        // processing / requires_action / pending → async mobile money flow
        setPaySheetVisible(false);
        setPhone("");
        setProcessingVisible(true);
        setPollRef(order.reference);
      }
    } catch (err: unknown) {
      console.error("[PayConfirm]", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        "Le paiement a échoué. Réessayez.";
      showToast(msg, "error");
    } finally {
      setIsPaying(false);
    }
  };

  // Poll payment status when in processing state
  React.useEffect(() => {
    if (!pollRef) return;

    let attempts = 0;
    const maxAttempts = 24; // 2 minutes (5s × 24)
    let timeoutId: ReturnType<typeof setTimeout>;

    const check = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setProcessingVisible(false);
        setPollRef(null);
        showToast(
          "Le délai de validation a expiré. Veuillez vérifier l'état de votre commande.",
          "error",
        );
        return;
      }

      try {
        const res = await payStatusMutation.mutateAsync(pollRef);
        const status = res?.status;

        if (status === "succeeded") {
          setProcessingVisible(false);
          setPollRef(null);
          showToast("Paiement effectué avec succès !", "success");
          refetch();
          return;
        }
        if (
          status === "failed" ||
          status === "canceled" ||
          status === "expired"
        ) {
          setProcessingVisible(false);
          setPollRef(null);
          showToast("Le paiement a échoué ou a été annulé.", "error");
          return;
        }

        // Still processing → next poll
        timeoutId = setTimeout(check, 5000);
      } catch {
        if (attempts > 3) {
          setProcessingVisible(false);
          setPollRef(null);
          showToast("Impossible de vérifier le statut du paiement.", "error");
          return;
        }
        timeoutId = setTimeout(check, 5000);
      }
    };

    // First check after 3 seconds (give provider time to notify)
    timeoutId = setTimeout(check, 3000);

    return () => clearTimeout(timeoutId);
  }, [pollRef, payStatusMutation, showToast, refetch]);

  const handleCancelConfirm = async () => {
    if (!order) return;
    try {
      await cancelMutation.mutateAsync(order.reference);
      setCancelSheetVisible(false);
      showToast("Commande annulée avec succès.", "success");
      setTimeout(() => router.back(), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      showToast(msg ?? "Impossible d'annuler cette commande.", "error");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      const res = await apiClient.get(
        `/orders/${order.reference}/invoice/download`,
        {
          responseType: "arraybuffer",
        },
      );
      const bytes = new Uint8Array(res.data);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      await Linking.openURL(`data:application/pdf;base64,${base64}`);
    } catch (err: unknown) {
      console.error("[InvoiceDownload]", err);
      showToast("Impossible de telecharger la facture.", "error");
    }
  };

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }]}>
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={56} />
          <Skeleton height={80} />
          <Skeleton height={120} />
          <Skeleton height={160} />
          <Skeleton height={80} />
          <Skeleton height={120} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.background,
        }}
      >
        <Package size={48} color={c.textMuted} strokeWidth={1.2} />
        <Text
          style={{
            color: c.textMuted,
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            marginTop: 12,
          }}
        >
          Commande introuvable.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.primary, fontFamily: "Inter_500Medium" }}>
            ← Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Sub-header */}
      <View
        style={[
          styles.subHeader,
          { backgroundColor: c.surface, borderBottomColor: c.border },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.subHeaderRef,
              { color: c.primary, fontFamily: "JetBrainsMono_400Regular" },
            ]}
            numberOfLines={1}
          >
            {order.reference}
          </Text>
        </View>
        <Badge
          status={order.status as keyof typeof STATUS_COLORS}
          label={statusMeta?.label ?? order.status}
        />
      </View>

      {/* Scroll content */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (isPendingPayment || canCancel ? 100 : 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <JourneyStepper status={order.status} c={c} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(60).duration(280)}>
          <InfoCard order={order} c={c} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(120).duration(280)}>
          <AmountCard
            order={order}
            c={c}
            onDownloadInvoice={handleDownloadInvoice}
          />
        </Animated.View>
        {order.products && order.products.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(280)}>
            <ProductsCard
              products={order.products}
              currency={order.currency}
              c={c}
            />
          </Animated.View>
        )}
        {order.media && order.media.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(280)}>
            <MediaGallery media={order.media} c={c} />
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(240).duration(280)}>
          <TimelineCard logs={order.logs ?? []} order={order} c={c} />
        </Animated.View>
      </ScrollView>

      {/* Action bar */}
      {(isPendingPayment || canCancel) && (
        <Animated.View
          entering={FadeInDown.delay(300).duration(280)}
          style={[
            styles.actionBar,
            {
              backgroundColor: c.surface,
              borderTopColor: c.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          {isPendingPayment && (
            <Pressable
              onPress={handlePayInitiate}
              style={[styles.payBtn, { backgroundColor: c.primary }]}
            >
              <CreditCard size={17} color="#fff" strokeWidth={1.8} />
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                }}
              >
                {hasAmount ? "Payer maintenant" : "Procéder au paiement"}
              </Text>
              <ChevronRight size={17} color="#fff" strokeWidth={2} />
            </Pressable>
          )}
          {canCancel && (
            <Pressable
              onPress={() => setCancelSheetVisible(true)}
              style={styles.cancelLink}
              hitSlop={8}
            >
              <XCircle size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={{
                  color: c.textMuted,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                }}
              >
                Annuler la commande
              </Text>
            </Pressable>
          )}
        </Animated.View>
      )}

      <PaymentSheet
        visible={paySheetVisible}
        onClose={() => setPaySheetVisible(false)}
        amount={order.pricing?.total ?? order.quoted_amount ?? 0}
        currency={order.currency}
        phone={phone}
        setPhone={setPhone}
        operator={operator}
        setOperator={setOperator}
        onConfirm={handlePayConfirm}
        loading={isPaying}
        c={c}
        insets={insets}
      />
      <PaymentProcessingOverlay
        visible={processingVisible}
        onCancel={() => {
          setProcessingVisible(false);
          setPollRef(null);
        }}
        c={c}
      />
      <CancelSheet
        visible={cancelSheetVisible}
        reference={order.reference}
        onClose={() => setCancelSheetVisible(false)}
        onConfirm={handleCancelConfirm}
        loading={cancelMutation.isPending}
        c={c}
        insets={insets}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  toastText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },

  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  subHeaderSkeleton: {
    height: 20,
    width: 200,
    backgroundColor: "#e8ecf4",
    borderRadius: 4,
  },
  subHeaderRef: { fontSize: 13 },
  backBtn: { padding: 2 },
  content: { padding: 16 },

  stepperRow: { flexDirection: "row", alignItems: "flex-start" },
  stepperCancelled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  stepLine: { flex: 1, height: 2, marginTop: 12 },
  stepNode: { alignItems: "center", width: 52 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 9, marginTop: 6, textAlign: "center" },

  infoAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  amountValue: { fontSize: 26, lineHeight: 34 },
  amountCurrency: { fontSize: 14 },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  partialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  partialText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  devisBox: { flexDirection: "row", alignItems: "center", gap: 12 },
  devisIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  breakdownLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 10,
  },
  breakdownText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
    lineHeight: 16,
  },
  breakdownValue: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11,
    flexShrink: 0,
    textAlign: "right",
    marginTop: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chipLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginVertical: 8 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  productIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  productMeta: { flexDirection: "row", gap: 12 },
  productMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  productTotal: { fontSize: 12, textAlign: "right", minWidth: 80 },

  timelineRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineLeft: { alignItems: "center", width: 20, marginRight: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  timelineLine: { width: 2, flex: 1, minHeight: 24, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineLabel: { fontSize: 13 },
  timelineDate: {
    fontSize: 11,
    fontFamily: "JetBrainsMono_400Regular",
    marginTop: 2,
  },

  actionBar: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20 },
  sheetSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  amountPill: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
  },
  amountPillLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  amountPillValue: { fontSize: 24 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 10 },
  operatorRow: { gap: 10, marginBottom: 16 },
  operatorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
  },
  operatorDot: { width: 12, height: 12, borderRadius: 6 },

  cancelIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  cancelTitle: { fontSize: 20, textAlign: "center", marginBottom: 8 },
  cancelRef: { fontSize: 13, textAlign: "center", marginBottom: 12 },
  cancelBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  cancelConfirmBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  cancelKeepBtn: { alignItems: "center", paddingVertical: 10 },

  processingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  processingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  processingText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
