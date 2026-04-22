import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2, Truck, ShoppingBag, MapPin, Scale, FileText, Package, Image as ImageIcon } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder } from '@/src/context/CreateOrderContext';
import { useShippingRoutes } from '@/src/hooks/useShippingRoutes';
import { apiClient } from '@/src/api/client';

export default function Step6ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, reset } = useCreateOrder();
  const { data: routes } = useShippingRoutes();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const route = routes?.find((r) => r.id === state.routeId);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('shipping_route_id', String(state.routeId));
      formData.append('service_type', state.serviceType!);
      if (state.estimatedWeight) formData.append('estimated_weight', state.estimatedWeight);
      if (state.deliveryAddress) formData.append('delivery_address', state.deliveryAddress);
      if (state.clientNotes) formData.append('client_notes', state.clientNotes);

      if (state.serviceType === 'purchase_assisted' && state.products.length > 0) {
        state.products.forEach((p, i) => {
          formData.append(`products[${i}][name]`, p.name);
          formData.append(`products[${i}][url]`, p.url);
          formData.append(`products[${i}][unit_price]`, p.unit_price);
          formData.append(`products[${i}][currency]`, p.currency);
          formData.append(`products[${i}][nature]`, p.nature);
          formData.append(`products[${i}][quantity]`, p.quantity);
          formData.append(`products[${i}][notes]`, p.notes);
        });
      }

      state.photos.forEach((photo) => {
        formData.append('product_photos[]', {
          uri: photo.uri,
          name: photo.name,
          type: photo.type,
        } as any);
      });

      const res = await apiClient.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        reset();
        router.replace('/(client)/orders');
      } else {
        setError(res.data?.message ?? 'Erreur lors de la creation.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
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

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
            Etape 6 sur 6 — Verification avant envoi
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: c.error + '12', borderColor: c.error + '30' }]}>
              <Text style={{ color: c.error, fontFamily: 'Inter_500Medium', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 14, color: c.text, marginBottom: 12 }}>Recapitulatif</Text>

            <Row icon={state.serviceType === 'transit' ? Truck : ShoppingBag} label="Service" value={state.serviceType === 'transit' ? 'Transit' : 'Supply Chain'} c={c} />
            <Row icon={MapPin} label="Itineraire" value={route ? route.name : '-'} c={c} />
            <Row icon={Scale} label="Poids estime" value={state.estimatedWeight ? `${state.estimatedWeight} kg` : '-'} c={c} />
            <Row icon={MapPin} label="Livraison" value={state.deliveryAddress || '-'} c={c} />
            {state.clientNotes ? <Row icon={FileText} label="Notes" value={state.clientNotes} c={c} /> : null}
          </View>

          {state.serviceType === 'purchase_assisted' && state.products.length > 0 && (
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, marginTop: 12 }]}>
              <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 14, color: c.text, marginBottom: 12 }}>Produits ({state.products.length})</Text>
              {state.products.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.text, flex: 1 }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.textMuted }}>{p.quantity}x {p.unit_price} {p.currency}</Text>
                </View>
              ))}
            </View>
          )}

          {state.photos.length > 0 && (
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, marginTop: 12 }]}>
              <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 14, color: c.text, marginBottom: 12 }}>Photos ({state.photos.length})</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {state.photos.map((photo, i) => (
                  <View key={i} style={[styles.thumb, { backgroundColor: c.base200 }]}>
                    <ImageIcon size={20} color={c.textMuted} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: insets.bottom + 16 }]}>
        <Button title={submitting ? 'Envoi en cours...' : 'Confirmer et creer'} onPress={handleSubmit} loading={submitting} />
      </View>
    </View>
  );
}

function Row({ icon: Icon, label, value, c }: { icon: any; label: string; value: string; c: Record<string, string> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
      <Icon size={16} color={c.textMuted} strokeWidth={1.5} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: c.textMuted, marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.text }} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 60 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 4 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  thumb: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
