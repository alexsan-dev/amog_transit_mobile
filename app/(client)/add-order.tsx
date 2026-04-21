import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plane, Ship, ChevronRight } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeProvider';

type FreightMode = 'aerien' | 'maritime';

interface ModeCardProps {
  mode: FreightMode;
  selected: boolean;
  onSelect: () => void;
  c: Record<string, string>;
}

function ModeCard({ mode, selected, onSelect, c }: ModeCardProps) {
  const Icon = mode === 'aerien' ? Plane : Ship;
  const label = mode === 'aerien' ? 'Aérien' : 'Maritime';
  const sublabel = mode === 'aerien' ? 'Rapide · 5–10 jours' : 'Économique · 30–45 jours';

  return (
    <Pressable
      onPress={onSelect}
      style={{
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 12,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? c.primary : c.border,
        backgroundColor: selected ? c.primary + '0C' : c.surface,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: selected ? c.primary + '18' : c.base200,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Icon size={22} color={selected ? c.primary : c.textMuted} strokeWidth={1.5} />
      </View>
      <Text
        style={{
          fontFamily: 'Syne_600SemiBold',
          fontSize: 15,
          color: selected ? c.primary : c.text,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.textMuted, textAlign: 'center' }}>
        {sublabel}
      </Text>
    </Pressable>
  );
}

export default function AddOrderScreen() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [mode, setMode] = useState<FreightMode>('aerien');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(280).springify().damping(20)}>
          <Text variant="h2" className="text-primary mb-1">Nouvelle commande</Text>
          <Text className="font-body text-sm text-text-muted mb-6">
            Renseignez les informations de votre expédition
          </Text>

          {/* Mode selection */}
          <Text className="font-body text-xs text-text-muted mb-3" style={{ letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' }}>
            Mode de transport
          </Text>
          <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 24 }}>
            <ModeCard mode="aerien" selected={mode === 'aerien'} onSelect={() => setMode('aerien')} c={c} />
            <ModeCard mode="maritime" selected={mode === 'maritime'} onSelect={() => setMode('maritime')} c={c} />
          </View>

          {/* Route */}
          <Text className="font-body text-xs text-text-muted mb-3" style={{ letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' }}>
            Itinéraire
          </Text>
          <Card className="mb-6">
            <Input
              label="Ville d'origine"
              placeholder="ex: Shanghai"
              value={origin}
              onChangeText={setOrigin}
              autoCapitalize="words"
            />
            <View style={{ height: 1, backgroundColor: c.border, marginVertical: 4 }} />
            <Input
              label="Ville de destination"
              placeholder="ex: Brazzaville"
              value={destination}
              onChangeText={setDestination}
              autoCapitalize="words"
            />
          </Card>

          {/* Description */}
          <Text className="font-body text-xs text-text-muted mb-3" style={{ letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' }}>
            Marchandise
          </Text>
          <Input
            label="Description des articles"
            placeholder="ex: Électronique, vêtements, pièces auto…"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={{ marginTop: 32 }}>
            <Button
              title="Envoyer la demande"
              onPress={() => {}}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
