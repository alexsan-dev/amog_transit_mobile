import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Text } from "@/src/components/ui/Text";
import { useCreateTicket } from "@/src/hooks/useTickets";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TicketCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const createMutation = useCreateTicket();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    try {
      await createMutation.mutateAsync({
        subject: subject.trim(),
        message: message.trim(),
        order_reference: orderRef.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      console.error(
        "[TicketCreateScreen] create ticket error",
        err?.res?.response?.data,
      );
      setError(
        err?.response?.data?.message ?? "Erreur lors de la creation du ticket.",
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: c.border,
            backgroundColor: c.background,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
        <Text
          style={{ fontFamily: "Syne_700Bold", fontSize: 16, color: c.text }}
        >
          Nouveau ticket
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: c.error + "12",
                  borderColor: c.error + "30",
                },
              ]}
            >
              <Text
                style={{
                  color: c.error,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                gap: 6,
              }}
            >
              <MessageSquare size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: c.text,
                }}
              >
                Sujet *
              </Text>
            </View>
            <Input
              placeholder="ex: Colis bloque en douane"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                gap: 6,
              }}
            >
              <FileText size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: c.text,
                }}
              >
                Message *
              </Text>
            </View>
            <Input
              placeholder="Decrivez votre probleme en detail..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                gap: 6,
              }}
            >
              <FileText size={14} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: c.text,
                }}
              >
                Reference commande (optionnel)
              </Text>
            </View>
            <Input
              placeholder="ex: AMG-2026-00101"
              value={orderRef}
              onChangeText={setOrderRef}
              autoCapitalize="characters"
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.surface,
            borderTopColor: c.border,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <Button
          title={createMutation.isPending ? "Envoi..." : "Creer le ticket"}
          onPress={handleSubmit}
          disabled={!canSubmit || createMutation.isPending}
          loading={createMutation.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});
