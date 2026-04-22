import { apiClient } from "@/src/api/client";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Text } from "@/src/components/ui/Text";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/forgot-password/send", { email });
      setStep("reset");
      setSuccess("Code envoyé. Vérifiez votre boîte de réception et spam.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "Erreur lors de l'envoi du code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!code || !password || !passwordConfirmation) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/forgot-password/reset", {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess("Mot de passe réinitialisé avec succès.");
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Code invalide ou expiré.");
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
        <View
          className="flex-1 px-6 pt-6 pb-10"
          style={{ paddingTop: insets.top + 24 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="self-start mb-6"
            hitSlop={12}
          >
            <ArrowLeft size={24} color={c.text} />
          </Pressable>

          <Text variant="h2" className="text-text mb-1">
            {step === "email" ? "Mot de passe oublié" : "Réinitialisation"}
          </Text>
          <Text className="font-body text-sm text-text-muted mb-6">
            {step === "email"
              ? "Saisissez votre adresse e-mail pour recevoir un code de réinitialisation."
              : "Saisissez le code reçu par e-mail et votre nouveau mot de passe."}
          </Text>

          {error ? (
            <View className="flex-row items-center bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color={c.error} />
              <Text className="text-error font-body text-sm ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          {success ? (
            <View className="flex-row items-center bg-success/10 border border-success/20 rounded-xl px-4 py-3 mb-5">
              <CheckCircle size={16} color={c.success} />
              <Text className="text-success font-body text-sm ml-2 flex-1">
                {success}
              </Text>
            </View>
          ) : null}

          {step === "email" ? (
            <>
              <Input
                label="Adresse e-mail"
                placeholder="client@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />

              <Button
                title={loading ? "Envoi en cours…" : "Envoyer le code"}
                onPress={handleSendCode}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Input
                label="Code de réinitialisation"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />

              <Input
                label="Nouveau mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Input
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
              />

              <Button
                title={
                  loading
                    ? "Réinitialisation…"
                    : "Réinitialiser le mot de passe"
                }
                onPress={handleReset}
                disabled={loading}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
