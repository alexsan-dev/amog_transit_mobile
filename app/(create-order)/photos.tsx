import React from 'react';
import { View, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Camera, X, ImagePlus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCreateOrder } from '@/src/context/CreateOrderContext';

export default function Step5PhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { state, addPhoto, removePhoto } = useCreateOrder();

  const pickImage = async () => {
    if (state.photos.length >= 4) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 4 - state.photos.length,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      result.assets.forEach((asset) => {
        addPhoto({
          uri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          type: asset.mimeType ?? 'image/jpeg',
        });
      });
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
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
            Etape 5 sur 6 — Photos des produits (max 4)
          </Text>

          <View style={styles.grid}>
            {state.photos.map((photo, i) => (
              <Animated.View key={photo.uri + i} entering={FadeInDown.delay(i * 60).duration(200)} style={[styles.photoBox, { backgroundColor: c.base200 }]}>
                <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
                <Pressable onPress={() => removePhoto(i)} style={[styles.removeBtn, { backgroundColor: c.error }]} hitSlop={8}>
                  <X size={12} color="#fff" strokeWidth={2} />
                </Pressable>
              </Animated.View>
            ))}

            {state.photos.length < 4 && (
              <Pressable onPress={pickImage} style={[styles.addPhotoBox, { borderColor: c.primary, backgroundColor: c.primary + '08' }]}>
                <ImagePlus size={28} color={c.primary} strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: c.primary, marginTop: 6 }}>
                  Ajouter
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: insets.bottom + 16 }]}>
        <Button title="Continuer" onPress={() => router.navigate('/(create-order)/review' as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoBox: { width: '47%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addPhotoBox: { width: '47%', aspectRatio: 1, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
