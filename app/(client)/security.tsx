import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Lock,
  Smartphone,
  Shield,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  QrCode,
} from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useProfile } from '@/src/hooks/useProfile';
import { useChangePassword } from '@/src/hooks/useProfile';

function SecurityRow({
  icon: Icon,
  label,
  description,
  c,
  onPress,
  teaser,
}: {
  icon: any;
  label: string;
  description: string;
  c: Record<string, string>;
  onPress?: () => void;
  teaser?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={teaser}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
        backgroundColor: pressed && !teaser ? c.primary + '06' : 'transparent',
        opacity: teaser ? 0.55 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          backgroundColor: c.primary + '10',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon size={18} color={c.primary} strokeWidth={1.5} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: c.text }}>
            {label}
          </Text>
          {teaser && (
            <View
              style={{
                backgroundColor: c.info + '12',
                borderColor: c.info + '25',
                borderWidth: 1,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: c.info }}>
                BIENTOT
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      {!teaser && <ChevronRight size={16} color={c.textMuted} />}
    </Pressable>
  );
}

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { data: profile } = useProfile();
  const isOAuth = profile?.auth_provider != null && profile?.auth_provider !== 'local';

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: 12,
            backgroundColor: c.background,
            borderBottomColor: c.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <ArrowLeft size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 16, color: c.text }}>Securite</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: c.textMuted,
              marginBottom: 16,
            }}
          >
            Gerez la securite de votre compte
          </Text>

          {/* Password Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            {isOAuth ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Shield size={28} color={c.info} strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: c.text,
                    marginTop: 10,
                  }}
                >
                  Authentification sociale
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: c.textMuted,
                    marginTop: 4,
                    textAlign: 'center',
                    maxWidth: 280,
                    lineHeight: 20,
                  }}
                >
                  Votre compte est connecte via {profile?.auth_provider}. Le mot de passe est gere par le provider.
                </Text>
              </View>
            ) : (
              <>
                <SecurityRow
                  icon={Lock}
                  label="Changer le mot de passe"
                  description="Mettez a jour votre mot de passe"
                  c={c}
                  onPress={() => setShowPasswordForm((v) => !v)}
                />

                {showPasswordForm && <PasswordForm c={c} />}
              </>
            )}
          </View>

          {/* 2FA & QR */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border, marginTop: 12 },
            ]}
          >
            <SecurityRow
              icon={Smartphone}
              label="Authentification 2FA"
              description="Ajoutez une couche de securite"
              c={c}
              teaser
            />
            <SecurityRow
              icon={QrCode}
              label="QR Code Auth"
              description="Connectez-vous via QR Code"
              c={c}
              teaser
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function PasswordForm({ c }: { c: Record<string, string> }) {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const canSubmit =
    current.length > 0 && password.length >= 8 && password === confirm;

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    try {
      await changePassword.mutateAsync({
        current_password: current,
        password,
        password_confirmation: confirm,
      });
      setSuccess(true);
      setCurrent('');
      setPassword('');
      setConfirm('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors du changement.');
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(200)} style={{ paddingTop: 8, paddingBottom: 8 }}>
      {success && (
        <View
          style={[
            styles.alert,
            { backgroundColor: c.success + '10', borderColor: c.success + '25' },
          ]}
        >
          <CheckCircle2 size={16} color={c.success} strokeWidth={2} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.success, marginLeft: 8 }}>
            Mot de passe modifie avec succes.
          </Text>
        </View>
      )}
      {error ? (
        <View
          style={[
            styles.alert,
            { backgroundColor: c.error + '10', borderColor: c.error + '25' },
          ]}
        >
          <AlertTriangle size={16} color={c.error} strokeWidth={2} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.error, marginLeft: 8 }}>
            {error}
          </Text>
        </View>
      ) : null}

      <PasswordInput
        label="Mot de passe actuel"
        value={current}
        onChangeText={setCurrent}
        show={showCurrent}
        toggleShow={() => setShowCurrent((v) => !v)}
        c={c}
      />
      <PasswordInput
        label="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        show={showNew}
        toggleShow={() => setShowNew((v) => !v)}
        c={c}
      />
      <PasswordInput
        label="Confirmation"
        value={confirm}
        onChangeText={setConfirm}
        show={showNew}
        toggleShow={() => setShowNew((v) => !v)}
        c={c}
      />

      <Button
        title="Modifier"
        onPress={handleSubmit}
        disabled={!canSubmit || changePassword.isPending}
        loading={changePassword.isPending}
        style={{ marginTop: 8 }}
      />
    </Animated.View>
  );
}

function PasswordInput({
  label,
  value,
  onChangeText,
  show,
  toggleShow,
  c,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
  c: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: c.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 10,
          backgroundColor: c.background,
          paddingHorizontal: 12,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: c.text,
            paddingVertical: 10,
          }}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholderTextColor={c.textMuted}
        />
        <Pressable onPress={toggleShow} hitSlop={8}>
          {show ? (
            <EyeOff size={16} color={c.textMuted} strokeWidth={1.5} />
          ) : (
            <Eye size={16} color={c.textMuted} strokeWidth={1.5} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
});
