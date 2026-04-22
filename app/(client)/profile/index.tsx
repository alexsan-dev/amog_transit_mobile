import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Pencil,
  Check,
  X,
  LogOut,
  AlertCircle,
  Globe,
} from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import {
  useProfile,
  useUpdateProfile,
  useUpdateAvatar,
} from '@/src/hooks/useProfile';
import { useApiImage } from '@/src/hooks/useApiImage';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { clearToken } from '@/src/api/auth';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const avatarUri = useApiImage(profile?.avatar_url);
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const logout = useAuthStore((s) => s.logout);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [uploading, setUploading] = useState(false);

  const isOAuth = profile?.auth_provider != null && profile?.auth_provider !== 'local';

  const startEdit = useCallback(() => {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
    setEditing(true);
  }, [profile]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setName('');
    setPhone('');
  }, []);

  const saveEdit = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setEditing(false);
    } catch (err) {
      console.error('[UpdateProfile]', err);
    }
  }, [name, phone, updateProfile]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as any);
      setUploading(true);
      try {
        await updateAvatar.mutateAsync(formData);
      } catch (err) {
        console.error('[UpdateAvatar]', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    await clearToken();
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
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
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 16, color: c.text }}>
          Mon profil
        </Text>
        {editing ? (
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Pressable onPress={cancelEdit} hitSlop={8} style={styles.iconBtn}>
              <X size={20} color={c.error} strokeWidth={2} />
            </Pressable>
            <Pressable onPress={saveEdit} hitSlop={8} style={styles.iconBtn}>
              <Check size={20} color={c.success} strokeWidth={2} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={startEdit} hitSlop={8} style={styles.iconBtn}>
            <Pencil size={18} color={c.primary} strokeWidth={1.8} />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <Skeleton height={100} className="mb-4 rounded-xl" />
            <Skeleton height={180} className="mb-4 rounded-xl" />
            <Skeleton height={56} className="rounded-xl" />
          </>
        ) : (
          <Animated.View entering={FadeInDown.duration(280)}>
            {/* Avatar + Name Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  alignItems: 'center',
                  paddingVertical: 28,
                },
              ]}
            >
              <Pressable onPress={pickAvatar} disabled={uploading}>
                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      backgroundColor: c.primary + '12',
                      borderWidth: 3,
                      borderColor: c.primary + '25',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={{ width: 90, height: 90 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <User size={36} color={c.primary} strokeWidth={1.5} />
                    )}
                  </View>
                  {uploading && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: c.background + 'AA',
                        borderRadius: 45,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ActivityIndicator color={c.primary} />
                    </View>
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: c.primary,
                      borderWidth: 2,
                      borderColor: c.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Camera size={14} color="#fff" strokeWidth={2} />
                  </View>
                </View>
              </Pressable>

              <Text
                style={{
                  fontFamily: 'Syne_700Bold',
                  fontSize: 18,
                  color: c.text,
                  marginTop: 14,
                }}
              >
                {profile?.name ?? 'Client'}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: c.textMuted,
                  marginTop: 4,
                }}
              >
                {profile?.email ?? ''}
              </Text>

              {profile?.email_verified ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    backgroundColor: c.success + '10',
                    borderColor: c.success + '25',
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Shield size={12} color={c.success} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 11,
                      color: c.success,
                      marginLeft: 5,
                    }}
                  >
                    Email verifie
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Info Fields */}
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.border, marginTop: 12 },
              ]}
            >
              <InfoField
                icon={User}
                label="Nom complet"
                value={profile?.name}
                editing={editing}
                editValue={name}
                onEditChange={setName}
                c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.border }]} />

              <InfoField
                icon={Mail}
                label="Email"
                value={profile?.email}
                editing={false}
                disabled
                disabledReason={
                  isOAuth
                    ? 'Votre email est gere par votre compte ' +
                      (profile?.auth_provider ?? 'social') +
                      '. Modifiez-le depuis le provider.'
                    : undefined
                }
                c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.border }]} />

              <InfoField
                icon={Phone}
                label="Telephone"
                value={profile?.phone}
                editing={editing}
                editValue={phone}
                onEditChange={setPhone}
                placeholder="+242 06 400 0000"
                c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.border }]} />

              <InfoField
                icon={Globe}
                label="Compte"
                value={
                  isOAuth
                    ? `Connecte via ${profile?.auth_provider}`
                    : 'Email / mot de passe'
                }
                editing={false}
                c={c}
              />
            </View>

            {/* Logout */}
            <Pressable
              onPress={handleLogout}
              style={[
                styles.logoutBtn,
                { backgroundColor: c.error + '08', borderColor: c.error + '20' },
              ]}
            >
              <LogOut size={18} color={c.error} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: c.error,
                  marginLeft: 10,
                }}
              >
                Deconnexion
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
  editing,
  editValue,
  onEditChange,
  placeholder,
  disabled,
  disabledReason,
  c,
}: {
  icon: any;
  label: string;
  value?: string;
  editing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
  c: Record<string, string>;
}) {
  return (
    <View style={{ paddingVertical: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
        <Icon size={14} color={c.textMuted} strokeWidth={1.5} />
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: c.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Text>
      </View>

      {editing && onEditChange ? (
        <TextInput
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            color: c.text,
            borderWidth: 1,
            borderColor: c.primary + '40',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: c.background,
          }}
          value={editValue}
          onChangeText={onEditChange}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: disabled ? c.textMuted : c.text,
              flex: 1,
            }}
          >
            {value ?? '-'}
          </Text>
          {disabled && disabledReason ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, flexShrink: 1 }}>
              <AlertCircle size={13} color={c.warning} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: c.warning,
                  marginLeft: 4,
                  flexShrink: 1,
                }}
                numberOfLines={2}
              >
                {disabledReason}
              </Text>
            </View>
          ) : null}
        </View>
      )}
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
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  divider: { height: 1, marginHorizontal: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
  },
});
