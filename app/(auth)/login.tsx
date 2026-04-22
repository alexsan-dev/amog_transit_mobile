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
// import { Image } from "react-native";
import { setToken } from "@/src/api/auth";
import { apiClient } from "@/src/api/client";
import { SocialAuthButtons } from "@/src/components/SocialAuthButtons";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Text } from "@/src/components/ui/Text";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      await setToken(token);
      setAuth(token, user);
      router.replace("/(client)");
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants incorrects.");
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
          className="items-center pb-10 px-6"
          style={{ paddingTop: insets.top + 24 }}
        >
          <View className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border border-border">
            <Image
              resizeMode="cover"
              style={{ width: "100%", height: "100%", padding: 8 }}
              source={{ uri: "https://amog-transit.com/logo/logo.png" }}
            />
          </View>
          <Text className="font-mono text-xl tracking-widest text-primary mb-1">
            AMOG TRANSIT
          </Text>
          <Text className="font-body text-sm text-text-muted text-center">
            Votre partenaire logistique International
          </Text>
        </View>

        {/* Form card */}
        <View className="flex-1 bg-surface rounded-t-3xl px-6 pt-8 pb-10 border-t border-border">
          <Text variant="h2" className="text-text mb-1">
            Connexion
          </Text>
          <Text className="font-body text-sm text-text-muted mb-6">
            Accédez à votre espace client
          </Text>

          {error ? (
            <View className="flex-row items-center bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color={c.error} />
              <Text className="text-error font-body text-sm ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          <Input
            label="Adresse e-mail"
            placeholder="client@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />

          <View className="relative w-full mb-1">
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry={secure}
              autoComplete="password"
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

          <View className="items-end mb-5">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text className="font-body text-xs text-primary">
                  Mot de passe oublié ?
                </Text>
              </Pressable>
            </Link>
          </View>

          <Button
            title={loading ? "Connexion en cours…" : "Se connecter"}
            onPress={handleLogin}
            disabled={loading}
          />

          <SocialAuthButtons />

          <View className="flex-row items-center justify-center mt-6">
            <Text className="font-body text-sm text-text-muted">
              Pas encore de compte ?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="font-body text-sm text-primary font-semibold">
                  S'inscrire
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
