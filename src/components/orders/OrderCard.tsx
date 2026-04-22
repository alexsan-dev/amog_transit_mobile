import React from 'react';
import { View, Pressable, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ChevronRight, Calendar, Package, ArrowRight, MapPin,
  CreditCard, Scale, ShoppingBag, Truck, Plane, Ship,
} from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { pressIn, pressOut, itemEnter } from '@/src/theme/animations';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Order } from '@/src/types/api';
import { ORDER_STATUSES, STATUS_COLORS } from '@/src/constants/statuses';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  purchase_assisted: 'Supply Chain',
  transit: 'Transit',
};

const SERVICE_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  purchase_assisted: ShoppingBag,
  transit: Truck,
};

const TRANSPORT_LABELS: Record<string, string> = {
  air_normal: 'Aérien classique',
  air_express: 'Aérien express',
  sea: 'Maritime',
  road: 'Terrestre',
};

const TRANSPORT_ICONS: Record<string, React.ComponentType<any>> = {
  air_normal: Plane,
  air_express: Plane,
  sea: Ship,
  road: Truck,
};

function getWeight(order: Order): string | null {
  const w = order.actual_weight ?? order.estimated_weight;
  if (!w) return null;
  const n = typeof w === 'string' ? parseFloat(w) : w;
  if (isNaN(n) || n <= 0) return null;
  return `${n} kg`;
}

function getPricingTotal(order: Order): { total: number; currency: string } | null {
  if (order.pricing) {
    return { total: order.pricing.total, currency: order.pricing.currency };
  }
  if (order.quoted_amount != null && order.quoted_amount > 0) {
    return { total: order.quoted_amount, currency: order.currency };
  }
  return null;
}

interface OrderCardProps {
  order: Order;
  index?: number;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(amount));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Flag({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <Image
      source={{ uri: `https://flagcdn.com/16x12/${code.toLowerCase()}.png` }}
      style={{ width: 16, height: 12, borderRadius: 2, marginRight: 4 }}
    />
  );
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  const router = useRouter();
  const { c } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const statusMeta = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const statusColors = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS];
  const accentBg = statusColors?.bg.split('/')[0] ?? 'bg-border';

  const pricing = getPricingTotal(order);
  const isPaid = order.paid_amount > 0 && pricing && order.paid_amount >= pricing.total;
  const isPartiallyPaid = order.paid_amount > 0 && pricing && order.paid_amount < pricing.total;
  const paymentRatio = pricing && pricing.total > 0 ? Math.min(order.paid_amount / pricing.total, 1) : 0;

  const productLabel = (() => {
    const prods = order.products;
    if (!prods || prods.length === 0) return null;
    const first = prods[0].name;
    return prods.length === 1 ? first : `${prods.length} articles · ${first}`;
  })();

  const ServiceIcon = order.service_type ? SERVICE_TYPE_ICONS[order.service_type] ?? Truck : null;
  const serviceLabel = order.service_type ? SERVICE_TYPE_LABELS[order.service_type] ?? order.service_type : null;

  const TransportIcon = order.shipping_route?.transport_mode
    ? TRANSPORT_ICONS[order.shipping_route.transport_mode] ?? Truck
    : null;
  const transportLabel = order.shipping_route?.transport_mode
    ? TRANSPORT_LABELS[order.shipping_route.transport_mode] ?? order.shipping_route.transport_mode
    : null;

  const weight = getWeight(order);
  const origin = order.shipping_route?.origin_country ?? { name: order.shipping_route?.origin };
  const destination = order.shipping_route?.destination_country ?? { name: order.shipping_route?.destination };

  return (
    <Animated.View entering={itemEnter(index)} style={animStyle}>
      <Pressable
        onPressIn={() => pressIn(scale)}
        onPressOut={() => pressOut(scale)}
        onPress={() => router.push(`/(client)/tracking/${order.reference}`)}
        className="mb-3"
      >
        <Card className="overflow-hidden p-0">
          <View className="flex-row">
            {/* Left status accent bar */}
            <View className={`w-1 self-stretch rounded-l-lg ${accentBg}`} />

            <View className="flex-1 p-4">
              {/* Header: reference + badge */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-mono text-sm font-bold text-primary" numberOfLines={1}>
                  {order.reference}
                </Text>
                <Badge
                  status={order.status as keyof typeof STATUS_COLORS}
                  label={statusMeta?.label ?? order.status}
                />
              </View>

              {/* Service type + Route */}
              <View className="flex-row items-center mb-2 flex-wrap gap-y-1">
                {ServiceIcon && (
                  <View className="flex-row items-center mr-3">
                    <ServiceIcon size={11} color={c.textMuted} strokeWidth={1.5} />
                    <Text className="font-body text-xs text-text-muted ml-1">
                      {serviceLabel}
                    </Text>
                  </View>
                )}
                {TransportIcon && transportLabel && (
                  <View className="flex-row items-center mr-3">
                    <TransportIcon size={11} color={c.textMuted} strokeWidth={1.5} />
                    <Text className="font-body text-xs text-text-muted ml-1">
                      {transportLabel}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center">
                  {'code' in origin && origin.code && <Flag code={origin.code} />}
                  <Text className="font-body text-xs text-text-muted">
                    {origin?.name ?? order.shipping_route?.origin ?? '?'}
                  </Text>
                  <ArrowRight size={11} color={c.textMuted} strokeWidth={1.5} className="mx-1" />
                  {'code' in destination && destination.code && <Flag code={destination.code} />}
                  <Text className="font-body text-xs text-text font-medium">
                    {destination?.name ?? order.shipping_route?.destination ?? '?'}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-border mb-3" />

              {/* Body: meta + amount */}
              <View className="flex-row items-start justify-between">
                {/* Left: product + date + weight */}
                <View className="flex-1 mr-4">
                  {productLabel && (
                    <View className="flex-row items-center mb-1.5">
                      <Package size={11} color={c.textMuted} strokeWidth={1.5} />
                      <Text
                        className="font-body text-xs text-text-muted ml-1.5 flex-shrink"
                        numberOfLines={1}
                      >
                        {productLabel}
                      </Text>
                    </View>
                  )}
                  {weight && (
                    <View className="flex-row items-center mb-1.5">
                      <Scale size={11} color={c.textMuted} strokeWidth={1.5} />
                      <Text className="font-body text-xs text-text-muted ml-1.5">
                        {weight}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center">
                    <Calendar size={11} color={c.textMuted} strokeWidth={1.5} />
                    <Text className="font-body text-xs text-text-muted ml-1.5">
                      {formatDate(order.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Right: amount + chevron */}
                <View className="items-end">
                  {pricing ? (
                    <>
                      <Text className="font-mono text-base font-semibold text-text">
                        {formatAmount(pricing.total)}
                      </Text>
                      <Text className="font-body text-xs text-text-muted">
                        {pricing.currency}
                      </Text>
                    </>
                  ) : (
                    <View className="bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-sm">
                      <Text className="font-body text-xs text-warning">Devis en cours</Text>
                    </View>
                  )}
                  <View className="mt-1">
                    <ChevronRight size={16} color={c.textMuted} strokeWidth={1.5} />
                  </View>
                </View>
              </View>

              {/* Payment progress bar */}
              {isPartiallyPaid && (
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center">
                      <CreditCard size={11} color={c.textMuted} strokeWidth={1.5} />
                      <Text className="font-body text-xs text-text-muted ml-1">
                        {formatAmount(order.paid_amount)} {order.currency} payés
                      </Text>
                    </View>
                    <Text className="font-body text-xs text-success font-medium">
                      {Math.round(paymentRatio * 100)}%
                    </Text>
                  </View>
                  <View className="h-1.5 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-1.5 bg-success rounded-full"
                      style={{ width: `${paymentRatio * 100}%` }}
                    />
                  </View>
                </View>
              )}

              {/* Fully paid indicator */}
              {isPaid && (
                <View className="mt-3 flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-success mr-1.5" />
                  <Text className="font-body text-xs text-success font-medium">
                    Entièrement payé
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

export function OrderList({
  orders,
  emptyText = 'Aucune commande',
}: {
  orders?: Order[];
  emptyText?: string;
}) {
  if (!orders || orders.length === 0) {
    return (
      <View className="items-center justify-center py-12 bg-surface border border-border rounded-xl">
        <Package size={32} color="#6b7a99" strokeWidth={1.5} />
        <Text className="text-text-muted font-body text-sm mt-3">{emptyText}</Text>
        <Text className="text-text-muted font-body text-xs mt-1">
          Créez votre première commande
        </Text>
      </View>
    );
  }

  return (
    <View>
      {orders.map((order, i) => (
        <OrderCard key={order.id} order={order} index={i} />
      ))}
    </View>
  );
}
