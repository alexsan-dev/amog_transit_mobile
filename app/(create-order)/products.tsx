import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Package, Plus, Trash2, X } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder, WizardProduct } from '@/src/context/CreateOrderContext';

export default function Step4ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, addProduct, removeProduct } = useCreateOrder();
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<WizardProduct>({
    name: '', url: '', unit_price: '', currency: 'EUR', nature: '', quantity: '1', notes: '',
  });

  const canAdd = product.name.trim().length > 0 && product.unit_price.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addProduct({ ...product });
    setProduct({ name: '', url: '', unit_price: '', currency: 'EUR', nature: '', quantity: '1', notes: '' });
    setAdding(false);
  };

  const inputStyle = {
    backgroundColor: c.background,
    borderColor: c.border,
    color: c.text,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 12,
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
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
            Etape 4 sur 6 — Produits a acheter
          </Text>

          {state.products.length === 0 && !adding && (
            <View style={[styles.emptyBox, { backgroundColor: c.base200 }]}>
              <Package size={32} color={c.textMuted} strokeWidth={1.2} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.textMuted, marginTop: 8 }}>
                Aucun produit ajoute. Appuyez sur le bouton ci-dessous.
              </Text>
            </View>
          )}

          {state.products.map((p, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 40).duration(200)} style={[styles.productCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: c.text }}>{p.name}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                  {p.quantity}x {p.unit_price} {p.currency}
                </Text>
                {p.url ? <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.primary, marginTop: 2 }} numberOfLines={1}>{p.url}</Text> : null}
              </View>
              <Pressable onPress={() => removeProduct(i)} hitSlop={8}>
                <Trash2 size={16} color={c.error} strokeWidth={1.5} />
              </Pressable>
            </Animated.View>
          ))}

          {!adding && (
            <Pressable onPress={() => setAdding(true)} style={[styles.addBtn, { borderColor: c.primary }]}>
              <Plus size={18} color={c.primary} strokeWidth={2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: c.primary, marginLeft: 8 }}>
                Ajouter un produit
              </Text>
            </Pressable>
          )}

          {adding && (
            <Animated.View entering={FadeInDown.duration(200)} style={[styles.formCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 14, color: c.text }}>Nouveau produit</Text>
                <Pressable onPress={() => setAdding(false)} hitSlop={8}>
                  <X size={18} color={c.textMuted} strokeWidth={2} />
                </Pressable>
              </View>

              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput style={inputStyle} placeholder="ex: iPhone 15 Pro" placeholderTextColor={c.textMuted} value={product.name} onChangeText={(t) => setProduct((p) => ({ ...p, name: t }))} />

              <Text style={styles.label}>URL du produit</Text>
              <TextInput style={inputStyle} placeholder="https://..." placeholderTextColor={c.textMuted} value={product.url} onChangeText={(t) => setProduct((p) => ({ ...p, url: t }))} autoCapitalize="none" keyboardType="url" />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Prix unitaire *</Text>
                  <TextInput style={inputStyle} placeholder="150" placeholderTextColor={c.textMuted} value={product.unit_price} onChangeText={(t) => setProduct((p) => ({ ...p, unit_price: t }))} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Devise</Text>
                  <TextInput style={inputStyle} placeholder="EUR" placeholderTextColor={c.textMuted} value={product.currency} onChangeText={(t) => setProduct((p) => ({ ...p, currency: t.toUpperCase() }))} autoCapitalize="characters" />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nature</Text>
                  <TextInput style={inputStyle} placeholder="telephones" placeholderTextColor={c.textMuted} value={product.nature} onChangeText={(t) => setProduct((p) => ({ ...p, nature: t }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Quantite</Text>
                  <TextInput style={inputStyle} placeholder="1" placeholderTextColor={c.textMuted} value={product.quantity} onChangeText={(t) => setProduct((p) => ({ ...p, quantity: t }))} keyboardType="number-pad" />
                </View>
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput style={[inputStyle, { marginBottom: 16 }]} placeholder="Notes supplementaires..." placeholderTextColor={c.textMuted} value={product.notes} onChangeText={(t) => setProduct((p) => ({ ...p, notes: t }))} multiline numberOfLines={2} />

              <Button title="Ajouter" onPress={handleAdd} disabled={!canAdd} />
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Continuer"
          onPress={() => router.navigate('/(create-order)/photos' as any)}
          disabled={state.products.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 60 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderRadius: 12, marginBottom: 16 },
  productCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  formCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', marginBottom: 6 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
