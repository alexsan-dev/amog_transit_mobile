import { setToken, setUser } from "@/src/api/auth";
import { apiClient } from "@/src/api/client";
import { Text } from "@/src/components/ui/Text";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useTheme } from "@/src/theme/ThemeProvider";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AlertTriangle } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

type Provider = "google" | "tiktok";

const PROVIDER_META: Record<Provider, { label: string; icon: string }> = {
  google: {
    label: "Continuer avec Google",
    icon: "http://amog-transit.com/images/prepared/google.png?v=4.6",
  },
  tiktok: {
    label: "Continuer avec TikTok",
    icon: "http://amog-transit.com/images/prepared/tiktok.png?v=4.6",
  },
};

export function SocialAuthButtons() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { c } = useTheme();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  const handleSocial = async (provider: Provider) => {
    setError(null);
    setLoading(provider);
    handledRef.current = false;

    let listener: { remove: () => void } | null = null;

    const cleanup = () => {
      if (listener) {
        listener.remove();
        listener = null;
      }
      // Best-effort dismiss of any remaining browser session
      try {
        WebBrowser.dismissBrowser();
      } catch {}
      setLoading(null);
    };

    const handleUrl = async (event: { url: string }) => {
      if (handledRef.current) return;

      const parsed = Linking.parse(event.url);
      if (parsed.path !== "auth/callback") return;

      handledRef.current = true;
      cleanup();

      const token = parsed.queryParams?.token as string | undefined;
      const oauthError = parsed.queryParams?.error as string | undefined;
      const message = parsed.queryParams?.message as string | undefined;

      if (oauthError) {
        setError(
          message
            ? decodeURIComponent(message)
            : "Authentification sociale \u00e9chou\u00e9e.",
        );
        return;
      }

      if (!token) {
        setError("Token manquant. Veuillez r\u00e9essayer.");
        return;
      }

      try {
        await setToken(token);
        const meRes = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        await setUser(meRes.data.data);
        setAuth(token, meRes.data.data);
        router.replace("/(client)");
      } catch (err: any) {
        console.log("[OAuth handleUrl]", err.response?.data);
        setError(
          err.response?.data?.message ?? "Erreur lors de la connexion sociale.",
        );
      }
    };

    listener = Linking.addEventListener("url", handleUrl);

    try {
      const res = await apiClient.get(`/auth/${provider}/redirect`, {
        params: { stateless: 1 },
      });

      const { url } = res.data.data;

      // openAuthSessionAsync is kept so the OS attempts to close the browser
      // when the deep link fires, but on Android we rely on the Linking listener
      // as the source of truth because result.type is often 'dismiss'.
      await WebBrowser.openAuthSessionAsync(url, "amogtransit://auth/callback");

      // If we reach here and the callback was NOT handled by the listener,
      // it means the user closed the browser manually or the flow was cancelled.
      if (!handledRef.current) {
        cleanup();
      }
    } catch (err: any) {
      cleanup();
      const code = err.response?.data?.code;
      if (code === "NOT_IMPLEMENTED") {
        setError("Connexion sociale non disponible pour le moment.");
      } else {
        console.log("[OAuth redirect]", err.response?.data);
        setError(
          err.response?.data?.message ?? "Erreur lors de la connexion sociale.",
        );
      }
    }
  };

  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-text-muted font-body text-xs mx-3">
          ou continuer avec
        </Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      <View className="gap-3">
        {(["google", "tiktok"] as Provider[]).map((provider) => {
          const meta = PROVIDER_META[provider];
          return (
            <Pressable
              key={provider}
              onPress={() => handleSocial(provider)}
              disabled={loading !== null}
              className="flex-row items-center justify-center bg-surface border border-border rounded-md py-3.5"
            >
              {loading === provider ? (
                <ActivityIndicator size="small" color={c.textMuted} />
              ) : (
                <>
                  <View style={{ width: 25, height: 25, margin: 5 }}>
                    <Image
                      source={{ uri: meta.icon }}
                      style={{ width: 22, height: 22 }}
                    />
                  </View>
                  <Text className="font-body text-sm text-text ml-2.5">
                    {meta.label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="flex-row items-center mt-3 bg-error/10 border border-error/20 rounded-md px-3 py-2">
          <AlertTriangle size={14} color={c.error} />
          <Text className="text-error font-body text-xs ml-2 flex-1">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
