import { Skeleton } from "@/src/components/ui/Skeleton";
import { Text } from "@/src/components/ui/Text";
import { useTickets } from "@/src/hooks/useTickets";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ticket } from "@/src/types/api";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Clock,
  Hash,
  Inbox,
  MessageSquare,
  Plus,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function StatusBadge({
  status,
  c,
}: {
  status: string;
  c: Record<string, string>;
}) {
  const isOpen = status === "open";
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isOpen ? c.success + "12" : c.textMuted + "12",
          borderColor: isOpen ? c.success + "30" : c.textMuted + "20",
        },
      ]}
    >
      <View
        style={[
          styles.badgeDot,
          { backgroundColor: isOpen ? c.success : c.textMuted },
        ]}
      />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          color: isOpen ? c.success : c.textMuted,
        }}
      >
        {isOpen ? "Ouvert" : "Ferme"}
      </Text>
    </View>
  );
}

function TicketCard({
  ticket,
  index,
  onPress,
  c,
}: {
  ticket: Ticket;
  index: number;
  onPress: () => void;
  c: Record<string, string>;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(280)}>
      <Pressable onPress={onPress} style={styles.cardPressable}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            },
          ]}
        >
          {/* Left icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  ticket.status === "open"
                    ? c.primary + "12"
                    : c.textMuted + "10",
              },
            ]}
          >
            <MessageSquare
              size={20}
              color={ticket.status === "open" ? c.primary : c.textMuted}
              strokeWidth={1.5}
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: c.text,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {ticket.subject}
            </Text>

            {ticket.order_reference ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                  gap: 4,
                }}
              >
                <Hash size={11} color={c.primary} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_400Regular",
                    fontSize: 11,
                    color: c.primary,
                  }}
                >
                  {ticket.order_reference}
                </Text>
              </View>
            ) : null}

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Clock size={11} color={c.textMuted} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: c.textMuted,
                }}
              >
                {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Right side */}
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <StatusBadge status={ticket.status} c={c} />
            <ChevronRight size={16} color={c.textMuted} strokeWidth={1.5} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { data: tickets, isLoading, refetch } = useTickets();

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
        <Text
          style={{
            fontFamily: "Syne_700Bold",
            fontSize: 18,
            color: c.text,
          }}
        >
          Support
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: c.textMuted,
            marginTop: 2,
          }}
        >
          {tickets?.length ?? 0} ticket
          {tickets && tickets.length > 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <Skeleton height={88} className="mb-3 rounded-xl" />
            <Skeleton height={88} className="mb-3 rounded-xl" />
            <Skeleton height={88} className="rounded-xl" />
          </>
        ) : !tickets || tickets.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={{ alignItems: "center", paddingVertical: 80 }}
          >
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: c.primary + "08" },
              ]}
            >
              <Inbox size={36} color={c.primary} strokeWidth={1.2} />
            </View>
            <Text
              style={{
                fontFamily: "Syne_600SemiBold",
                fontSize: 16,
                color: c.text,
                marginTop: 20,
                marginBottom: 6,
              }}
            >
              Aucun ticket
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: c.textMuted,
                textAlign: "center",
                lineHeight: 20,
                maxWidth: 260,
              }}
            >
              Une question ? Un probleme ? Contactez notre equipe en creant un
              ticket.
            </Text>
          </Animated.View>
        ) : (
          tickets.map((ticket, i) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              index={i}
              c={c}
              onPress={() =>
                router.push(`/(client)/tickets/${ticket.id}` as any)
              }
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/(client)/tickets/create" as any)}
        style={[
          styles.fab,
          {
            backgroundColor: c.primary,
            shadowColor: c.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
            bottom: insets.bottom + 24,
          },
        ]}
        hitSlop={8}
      >
        <Plus size={24} color="#fff" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  cardPressable: {
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
