import React from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, Truck, CreditCard, ArrowRight } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { OrderCard } from '@/src/components/orders/OrderCard';
import { useOrders } from '@/src/hooks/useOrders';
import { useProfile } from '@/src/hooks/useProfile';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useTheme } from '@/src/theme/ThemeProvider';
import { itemEnter, screenEnter } from '@/src/theme/animations';

function StatPill({
  icon: Icon,
  value,
  label,
  color,
  index,
  c,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  value: number | string;
  label: string;
  color: string;
  index: number;
  c: Record<string, string>;
}) {
  return (
    <Animated.View entering={itemEnter(index)} style={{ flex: 1, marginHorizontal: 4 }}>
      <View
        style={{
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: color + '14',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Icon size={18} color={color} strokeWidth={1.5} />
        </View>
        <Text
          style={{ fontFamily: 'JetBrainsMono_500Medium', fontSize: 18, color: c.text }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 10,
            color: c.textMuted,
            marginTop: 3,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { data: orders, isLoading: loadingOrders, refetch } = useOrders();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: notifications } = useNotifications(false);

  const firstName = profile?.name?.split(' ')[0] ?? 'Client';
  const activeOrders = orders?.filter((o) => !['livre', 'incident'].includes(o.status)).length ?? 0;
  const inTransit = orders?.filter((o) => o.status === 'en_transit').length ?? 0;
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={loadingOrders} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Animated.View entering={screenEnter} style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 }}>
          <View
            style={{
              backgroundColor: c.primary,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: c.textOnPrimary + 'B0',
                marginBottom: 4,
                textTransform: 'capitalize',
              }}
            >
              {today}
            </Text>
            <Text
              style={{
                fontFamily: 'Syne_700Bold',
                fontSize: 22,
                color: c.textOnPrimary,
                marginBottom: 2,
              }}
            >
              Bonjour, {loadingProfile ? '…' : firstName}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: c.textOnPrimary + 'CC',
              }}
            >
              {activeOrders} expédition{activeOrders !== 1 ? 's' : ''} en cours
            </Text>
          </View>
        </Animated.View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 20 }}>
          <StatPill icon={Package}   value={orders?.length ?? 0} label="Commandes"  color={c.primary} index={0} c={c} />
          <StatPill icon={Truck}     value={inTransit}            label="En transit" color={c.info}    index={1} c={c} />
          <StatPill icon={CreditCard} value={unread}              label="Non lus"    color={c.warning} index={2} c={c} />
        </View>

        {/* Quick action */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Button
            title="Ajouter une commande"
            onPress={() => router.push('/(client)/add-order')}
          />
        </View>

        {/* Recent orders */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text variant="h3" className="text-primary">Dernières commandes</Text>
            <Pressable
              onPress={() => router.push('/(client)/tracking')}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                  color: c.primary,
                }}
              >
                Voir tout
              </Text>
              <ArrowRight size={14} color={c.primary} strokeWidth={1.5} />
            </Pressable>
          </View>

          {loadingOrders ? (
            <>
              <Skeleton height={76} className="mb-3" />
              <Skeleton height={76} className="mb-3" />
              <Skeleton height={76} />
            </>
          ) : !orders || orders.length === 0 ? (
            <View className="items-center py-10 bg-surface border border-border rounded-xl">
              <Text className="text-text-muted font-body text-sm">Aucune commande pour le moment</Text>
              <Pressable
                onPress={() => router.push('/(client)/add-order')}
                style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.primary }}>
                  Créer ma première commande
                </Text>
                <ArrowRight size={13} color={c.primary} />
              </Pressable>
            </View>
          ) : (
            orders.slice(0, 3).map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
