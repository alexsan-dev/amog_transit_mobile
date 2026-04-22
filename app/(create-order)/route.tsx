import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin, ChevronRight, RefreshCw, WifiOff } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder } from '@/src/context/CreateOrderContext';
import { useShippingRoutes } from '@/src/hooks/useShippingRoutes';

export default function Step2RouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, setRouteId } = useCreateOrder();
  const { data: routes, isLoading, isError, refetch, isFetching } = useShippingRoutes();

  const handleSelect = (routeId: number) => {
    setRouteId(routeId);
    router.navigate('/(create-order)/parcel' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: c.border, backgroundColor: c.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={{ color: c.primary, fontFamily: 'Inter_500Medium', fontSize: 14 }}>Retour</Text>
        </Pressable>
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 16, color: c.text, textAlign: 'center', flex: 1 }}>
          Nouvelle commande
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
          Etape 2 sur 6 — Choisissez votre itineraire
        </Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {(isLoading || isFetching) && (
          <>
            <Skeleton height={80} className="mb-3 rounded-xl" />
            <Skeleton height={80} className="mb-3 rounded-xl" />
            <Skeleton height={80} className="rounded-xl" />
          </>
        )}

        {!isLoading && !isFetching && isError && (
          <View style={[styles.errorBox, { backgroundColor: c.surface, borderColor: c.border }]}>
            <WifiOff size={36} color={c.textMuted} strokeWidth={1.3} />
            <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 15, color: c.text, marginTop: 12, textAlign: 'center' }}>
              Routes indisponibles
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              L'endpoint /api/shipping-routes n'est pas encore déployé côté serveur.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { backgroundColor: c.primary }]}
            >
              <RefreshCw size={14} color="#fff" strokeWidth={2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#fff' }}>
                Réessayer
              </Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !isFetching && !isError && routes && routes.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MapPin size={40} color={c.textMuted} strokeWidth={1.2} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: c.textMuted, marginTop: 12 }}>
              Aucune route disponible pour le moment.
            </Text>
          </View>
        )}

        {!isLoading && !isFetching && !isError && routes && routes.map((route, i) => {
          const active = state.routeId === route.id;
          const days = route.transit_days_min && route.transit_days_max
            ? `${route.transit_days_min}-${route.transit_days_max} jours`
            : route.transit_days_min
            ? `${route.transit_days_min} jours`
            : null;
          return (
            <Animated.View key={route.id} entering={FadeInDown.delay(i * 60).duration(280)}>
              <Pressable
                onPress={() => handleSelect(route.id)}
                style={[styles.card, { backgroundColor: active ? c.primary + '0C' : c.surface, borderColor: active ? c.primary : c.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: active ? c.primary + '18' : c.base200 }]}>
                  <MapPin size={22} color={active ? c.primary : c.textMuted} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 15, color: active ? c.primary : c.text, marginBottom: 4 }}>
                    {route.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted }}>
                    {route.origin_country} {'->'} {route.destination_country}
                    {days ? `  ·  ${days}` : ''}
                  </Text>
                </View>
                <ChevronRight size={18} color={active ? c.primary : c.textMuted} strokeWidth={2} />
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 60 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, borderWidth: 1, borderRadius: 16, marginTop: 8 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
});
