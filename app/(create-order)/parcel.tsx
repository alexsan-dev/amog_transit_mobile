import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Scale, MapPin, FileText } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder } from '@/src/context/CreateOrderContext';

export default function Step3ParcelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, setEstimatedWeight, setDeliveryAddress, setClientNotes } = useCreateOrder();

  const canContinue = state.estimatedWeight.trim().length > 0;

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
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
            Etape 3 sur 6 — Informations sur le colis
          </Text>

          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <Scale size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.text }}>Poids estime (kg)</Text>
            </View>
            <Input
              placeholder="ex: 12.5"
              value={state.estimatedWeight}
              onChangeText={setEstimatedWeight}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <MapPin size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.text }}>Adresse de livraison</Text>
            </View>
            <Input
              placeholder="ex: Brazzaville, Quartier Talangai"
              value={state.deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <FileText size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.text }}>Notes (optionnel)</Text>
            </View>
            <Input
              placeholder="Instructions supplementaires..."
              value={state.clientNotes}
              onChangeText={setClientNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Continuer"
          onPress={() => {
            if (state.serviceType === 'purchase_assisted') {
              router.navigate('/(create-order)/products' as any);
            } else {
              router.navigate('/(create-order)/photos' as any);
            }
          }}
          disabled={!canContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 60 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
