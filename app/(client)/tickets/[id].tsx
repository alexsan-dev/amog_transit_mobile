import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { useSendMessage, useTicket } from "@/src/hooks/useTickets";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Send,
  Shield,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatMessageDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (isYesterday) {
    return `Hier ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DateDivider({
  label,
  c,
}: {
  label: string;
  c: Record<string, string>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          color: c.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
    </View>
  );
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { data: ticket, isLoading, refetch } = useTicket(ticketId);
  const sendMutation = useSendMessage();
  const scrollRef = useRef<ScrollView>(null);

  const [reply, setReply] = useState("");

  const messages = ticket?.messages ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSend = async () => {
    const text = reply.trim();
    if (!text) return;
    try {
      await sendMutation.mutateAsync({ ticketId, body: text });
      setReply("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error("[SendMessage]", err);
    }
  };

  const isOpen = ticket?.status === "open";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: 12,
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

        <View style={{ flex: 1, alignItems: "center", marginHorizontal: 8 }}>
          <Text
            style={{
              fontFamily: "Syne_700Bold",
              fontSize: 15,
              color: c.text,
            }}
            numberOfLines={1}
          >
            {ticket?.subject ?? "Ticket"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 3,
              gap: 5,
            }}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? c.success : c.textMuted },
              ]}
            />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: isOpen ? c.success : c.textMuted,
              }}
            >
              {isOpen ? "Ouvert" : "Ferme"}
            </Text>
          </View>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
      >
        {isLoading ? (
          <>
            <Skeleton height={72} className="mb-3 rounded-xl" />
            <Skeleton height={88} className="mb-3 rounded-xl" />
            <Skeleton height={72} className="mb-3 rounded-xl" />
            <Skeleton height={56} className="rounded-xl" />
          </>
        ) : messages.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <View
              style={[
                styles.emptyCircle,
                { backgroundColor: c.primary + "08" },
              ]}
            >
              <AlertCircle size={32} color={c.primary} strokeWidth={1.2} />
            </View>
            <Text
              style={{
                fontFamily: "Syne_600SemiBold",
                fontSize: 15,
                color: c.text,
                marginTop: 16,
              }}
            >
              Pas encore de messages
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: c.textMuted,
                marginTop: 6,
                textAlign: "center",
                maxWidth: 240,
                lineHeight: 20,
              }}
            >
              Decrivez votre probleme ci-dessous. Notre equipe vous repondra
              sous 24h.
            </Text>
          </View>
        ) : (
          messages.map((msg, i) => {
            const fromClient = msg.sender === "client";
            const showDate =
              i === 0 ||
              new Date(msg.created_at).toDateString() !==
                new Date(messages[i - 1].created_at).toDateString();

            return (
              <React.Fragment key={msg.id ?? i}>
                {showDate && (
                  <DateDivider
                    label={new Date(msg.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      },
                    )}
                    c={c}
                  />
                )}
                <Animated.View
                  entering={FadeInUp.duration(200)}
                  style={[
                    styles.row,
                    { justifyContent: fromClient ? "flex-end" : "flex-start" },
                  ]}
                >
                  {/* Avatar (admin only) */}
                  {!fromClient && (
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: c.info + "15", marginRight: 8 },
                      ]}
                    >
                      <Shield size={14} color={c.info} strokeWidth={2} />
                    </View>
                  )}

                  {/* Bubble */}
                  <View style={{ maxWidth: "76%" }}>
                    <View
                      style={[
                        styles.bubble,
                        {
                          backgroundColor: fromClient ? c.primary : c.surface,
                          borderColor: fromClient ? c.primary + "30" : c.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: fromClient ? "#fff" : c.text,
                          lineHeight: 20,
                        }}
                      >
                        {msg.body}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 10,
                        color: c.textMuted,
                        marginTop: 4,
                        textAlign: fromClient ? "right" : "left",
                        paddingHorizontal: 4,
                      }}
                    >
                      {formatMessageDate(msg.created_at)}
                    </Text>
                  </View>

                  {/* Avatar (client only) */}
                  {fromClient && (
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: c.primary + "18", marginLeft: 8 },
                      ]}
                    >
                      <User size={14} color={c.primary} strokeWidth={2} />
                    </View>
                  )}
                </Animated.View>
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: c.surface,
            borderTopColor: c.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: c.background,
              borderColor: c.border,
              color: c.text,
            },
          ]}
          placeholder="Ecrivez votre message..."
          placeholderTextColor={c.textMuted}
          value={reply}
          onChangeText={setReply}
          multiline
          maxLength={2000}
          editable={isOpen}
        />
        <Pressable
          onPress={handleSend}
          disabled={!reply.trim() || sendMutation.isPending || !isOpen}
          style={[
            styles.sendBtn,
            {
              backgroundColor: reply.trim() && isOpen ? c.primary : c.border,
              opacity: sendMutation.isPending ? 0.6 : 1,
            },
          ]}
          hitSlop={8}
        >
          <Send size={18} color="#fff" strokeWidth={2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", marginBottom: 4, alignItems: "flex-end" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});
