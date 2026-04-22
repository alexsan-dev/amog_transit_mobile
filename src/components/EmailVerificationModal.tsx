import { apiClient } from "@/src/api/client";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Text } from "@/src/components/ui/Text";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useTheme } from "@/src/theme/ThemeProvider";
import { AlertCircle, Mail, RefreshCw, ShieldCheck } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COOLDOWN_SECONDS = 60;

export function EmailVerificationModal() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = user !== null && user.email_verified === false;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const handleSend = useCallback(async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiClient.post("/email-verification/send");
      setStep("sent");
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Impossible d'envoyer le code. Réessayez.");
    } finally {
      setSending(false);
    }
  }, [cooldown, sending, startCooldown]);

  const handleConfirm = useCallback(async () => {
    if (code.length !== 6 || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      await apiClient.post("/email-verification/confirm", { code });
      const meRes = await apiClient.get("/auth/me");
      setAuth(token!, meRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Code invalide ou expiré.");
      setCode("");
    } finally {
      setConfirming(false);
    }
  }, [code, confirming, token, setAuth]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(20)}
          style={{ width: "100%", maxWidth: 400, backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" }}
        >
          {/* Icon header */}
          <View style={{ alignItems: "center", paddingTop: 32, paddingBottom: 20 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary + "1A", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={28} color={c.primary} strokeWidth={1.5} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
            <Text variant="h3" className="text-text text-center mb-2">
              Vérifiez votre email
            </Text>
            <Text className="font-body text-sm text-text-muted text-center mb-6">
              Pour continuer, confirmez votre adresse email en saisissant le code que nous vous envoyons.
            </Text>

            {/* Email display */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.base200, borderWidth: 1, borderColor: c.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20 }}>
              <Mail size={15} color={c.textMuted} strokeWidth={1.5} />
              <Text className="font-body text-sm text-text ml-2 flex-1" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.error + "1A", borderWidth: 1, borderColor: c.error + "33", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
                <AlertCircle size={14} color={c.error} />
                <Text className="font-body text-xs text-error ml-2 flex-1">{error}</Text>
              </View>
            ) : null}

            {step === "idle" ? (
              <Button
                title={sending ? "Envoi en cours…" : "Recevoir le code de vérification"}
                onPress={handleSend}
                disabled={sending}
                loading={sending}
              />
            ) : (
              <>
                <Input
                  label="Code à 6 chiffres"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={(t) => { setCode(t.replace(/\D/g, "")); setError(null); }}
                  autoComplete="one-time-code"
                />

                <Button
                  title={confirming ? "Vérification…" : "Confirmer le code"}
                  onPress={handleConfirm}
                  disabled={code.length !== 6 || confirming}
                  loading={confirming}
                />

                {/* Resend */}
                <Pressable
                  onPress={handleSend}
                  disabled={cooldown > 0 || sending}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, opacity: cooldown > 0 || sending ? 0.45 : 1 }}
                >
                  <RefreshCw size={13} color={c.textMuted} strokeWidth={1.5} />
                  <Text className="font-body text-sm text-text-muted ml-1.5">
                    {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer le code"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
