import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Smartphone, ChevronRight, Shield } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeProvider';

interface SecurityRowProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  description: string;
  c: Record<string, string>;
  onPress?: () => void;
}

function SecurityRow({ icon: Icon, label, description, c, onPress }: SecurityRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
        backgroundColor: pressed ? c.surfaceHover : 'transparent',
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: c.primary + '12',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon size={18} color={c.primary} strokeWidth={1.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: c.text }}>{label}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <ChevronRight size={16} color={c.textMuted} />
    </Pressable>
  );
}

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Shield size={22} color={c.primary} strokeWidth={1.5} style={{ marginRight: 10 }} />
          <Text variant="h2" className="text-primary">Sécurité</Text>
        </View>
        <Text className="font-body text-sm text-text-muted mb-6">
          Gérez la sécurité de votre compte
        </Text>

        <Card>
          <SecurityRow
            icon={Lock}
            label="Changer le mot de passe"
            description="Mettez à jour votre mot de passe régulièrement"
            c={c}
            onPress={() => {}}
          />
          <SecurityRow
            icon={Smartphone}
            label="Authentification à deux facteurs"
            description="Ajoutez une couche de sécurité supplémentaire"
            c={c}
            onPress={() => {}}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
