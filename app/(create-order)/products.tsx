import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, ChevronDown, Package, Plus, Trash2, X } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder, WizardProduct } from '@/src/context/CreateOrderContext';

/* ─── Constantes API ─────────────────────────────────────────── */

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'EUR', label: 'Euro' },
  { code: 'XAF', label: 'Franc CFA (CEMAC)' },
];

const NATURES: { code: string; label: string }[] = [
  { code: '',                  label: 'Non spécifiée' },
  { code: 'telephones',        label: 'Téléphones' },
  { code: 'tablettes',         label: 'Tablettes' },
  { code: 'ordinateurs',       label: 'Ordinateurs' },
  { code: 'montres_connectees',label: 'Montres connectées' },
  { code: 'vetements',         label: 'Vêtements' },
  { code: 'chaussures',        label: 'Chaussures' },
  { code: 'accessoires',       label: 'Accessoires' },
  { code: 'livres',            label: 'Livres' },
  { code: 'parfum',            label: 'Parfum' },
  { code: 'cosmetique',        label: 'Cosmétique' },
  { code: 'produit_liquide',   label: 'Produit liquide' },
  { code: 'batterie',          label: 'Batterie' },
  { code: 'objets_divers',     label: 'Objets divers' },
];

/* ─── Generic picker ─────────────────────────────────────────── */

interface PickerOption { code: string; label: string }

interface PickerProps {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (code: string) => void;
  c: Record<string, string>;
}

function Picker({ label, value, options, onChange, c }: PickerProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((o) => o.code === value);

  return (
    <>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.pickerBtn, { backgroundColor: c.background, borderColor: value ? c.primary : c.border }]}
      >
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: selected ? c.text : c.textMuted, flex: 1 }}>
          {selected ? `${selected.code} — ${selected.label}` : 'Choisir…'}
        </Text>
        <ChevronDown size={16} color={c.textMuted} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
              <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 15, color: c.text }}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <X size={20} color={c.textMuted} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView>
              {options.map((opt) => {
                const active = value === opt.code;
                return (
                  <Pressable
                    key={opt.code}
                    onPress={() => { onChange(opt.code); setOpen(false); }}
                    style={[styles.sheetItem, { borderBottomColor: c.border, backgroundColor: active ? c.primary + '0D' : 'transparent' }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: c.text }}>{opt.code}</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginTop: 1 }}>{opt.label}</Text>
                    </View>
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

/* ─── Screen ─────────────────────────────────────────────────── */

const EMPTY: WizardProduct = {
  name: '', url: '', unit_price: '', currency: 'EUR', nature: '', quantity: '1', notes: '',
};

export default function Step4ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, addProduct, removeProduct } = useCreateOrder();
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<WizardProduct>(EMPTY);

  const canAdd = product.name.trim().length > 0 && product.unit_price.trim().length > 0 && product.currency.length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addProduct({ ...product });
    setProduct(EMPTY);
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
            Étape 4 sur 6 — Produits à acheter
          </Text>

          {state.products.length === 0 && !adding && (
            <View style={[styles.emptyBox, { backgroundColor: c.base200 }]}>
              <Package size={32} color={c.textMuted} strokeWidth={1.2} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.textMuted, marginTop: 8, textAlign: 'center' }}>
                Aucun produit ajouté.{'\n'}Appuyez sur le bouton ci-dessous.
              </Text>
            </View>
          )}

          {state.products.map((p, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 40).duration(200)} style={[styles.productCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: c.text }}>{p.name}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                  {p.quantity}× {p.unit_price} {p.currency} · {NATURES.find((n) => n.code === p.nature)?.label ?? p.nature}
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

              <Text style={[styles.label, { color: c.textMuted }]}>Nom du produit *</Text>
              <TextInput
                style={inputStyle}
                placeholder="ex: iPhone 15 Pro"
                placeholderTextColor={c.textMuted}
                value={product.name}
                onChangeText={(t) => setProduct((p) => ({ ...p, name: t }))}
              />

              <Text style={[styles.label, { color: c.textMuted }]}>URL du produit</Text>
              <TextInput
                style={inputStyle}
                placeholder="https://..."
                placeholderTextColor={c.textMuted}
                value={product.url}
                onChangeText={(t) => setProduct((p) => ({ ...p, url: t }))}
                autoCapitalize="none"
                keyboardType="url"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textMuted }]}>Prix unitaire *</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="150"
                    placeholderTextColor={c.textMuted}
                    value={product.unit_price}
                    onChangeText={(t) => setProduct((p) => ({ ...p, unit_price: t }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Picker
                    label="Devise *"
                    value={product.currency}
                    options={CURRENCIES}
                    onChange={(code) => setProduct((p) => ({ ...p, currency: code }))}
                    c={c}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Picker
                    label="Nature *"
                    value={product.nature}
                    options={NATURES}
                    onChange={(code) => setProduct((p) => ({ ...p, nature: code }))}
                    c={c}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textMuted }]}>Quantité</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="1"
                    placeholderTextColor={c.textMuted}
                    value={product.quantity}
                    onChangeText={(t) => setProduct((p) => ({ ...p, quantity: t }))}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: c.textMuted }]}>Notes</Text>
              <TextInput
                style={[inputStyle, { marginBottom: 16 }]}
                placeholder="Notes supplémentaires..."
                placeholderTextColor={c.textMuted}
                value={product.notes}
                onChangeText={(t) => setProduct((p) => ({ ...p, notes: t }))}
                multiline
                numberOfLines={2}
              />

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
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 6 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
