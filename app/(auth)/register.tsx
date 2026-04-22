import { setToken } from "@/src/api/auth";
import { apiClient } from "@/src/api/client";
import { SocialAuthButtons } from "@/src/components/SocialAuthButtons";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Text } from "@/src/components/ui/Text";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Link, useRouter } from "expo-router";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/register", {
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { token, user } = res.data.data;
      await setToken(token);
      setAuth(token, user);
      router.replace("/(client)");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header */}
        <View
          className="items-center pb-8 px-6"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border border-border">
            <Image
              resizeMode="cover"
              style={{ width: "100%", height: "100%", padding: 8 }}
              source={{ uri: "https://amog-transit.com/logo/logo.png" }}
            />
          </View>
          <Text className="font-mono text-lg tracking-widest text-primary">
            AMOG TRANSIT
          </Text>
        </View>

        {/* Form card */}
        <View className="flex-1 bg-surface rounded-t-3xl px-6 pt-8 pb-10 border-t border-border">
          <Text variant="h2" className="text-text mb-1">
            Créer un compte
          </Text>
          <Text className="font-body text-sm text-text-muted mb-6">
            Rejoignez la plateforme AMOG TRANSIT
          </Text>

          {error ? (
            <View className="flex-row items-center bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color={c.error} />
              <Text className="text-error font-body text-sm ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Identity section */}
          <Text className="font-body text-xs text-text-muted uppercase tracking-wider mb-2">
            Identité
          </Text>
          <Input
            label="Nom complet"
            placeholder="Jean Mobemba"
            autoComplete="name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Adresse e-mail"
            placeholder="client@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Téléphone (optionnel)"
            placeholder="+242 06 400 0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Password section */}
          <Text className="font-body text-xs text-text-muted uppercase tracking-wider mt-2 mb-2">
            Sécurité
          </Text>
          <View className="relative w-full">
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry={secure}
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              className="pr-12"
            />
            <Pressable
              onPress={() => setSecure((s) => !s)}
              className="absolute right-3 top-[38px]"
              hitSlop={12}
            >
              {secure ? (
                <EyeOff size={20} color={c.textMuted} />
              ) : (
                <Eye size={20} color={c.textMuted} />
              )}
            </Pressable>
          </View>

          <View className="relative w-full mb-6">
            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              secureTextEntry={secureConfirm}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              className="pr-12"
            />
            <Pressable
              onPress={() => setSecureConfirm((s) => !s)}
              className="absolute right-3 top-[38px]"
              hitSlop={12}
            >
              {secureConfirm ? (
                <EyeOff size={20} color={c.textMuted} />
              ) : (
                <Eye size={20} color={c.textMuted} />
              )}
            </Pressable>
          </View>

          <Button
            title={loading ? "Création en cours…" : "Créer mon compte"}
            onPress={handleRegister}
            disabled={loading}
          />

          <SocialAuthButtons />

          <View className="flex-row items-center justify-center mt-6">
            <Text className="font-body text-sm text-text-muted">
              Déjà un compte ?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="font-body text-sm text-primary font-semibold">
                  Se connecter
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
