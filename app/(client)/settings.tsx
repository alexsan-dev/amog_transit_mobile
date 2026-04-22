import { Button } from "@/src/components/ui/Button";
import { useFeedback } from "@/src/hooks/useFeedback";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Info,
  Mail,
  Monitor,
  Moon,
  Package,
  Phone,
  Star,
  Sun,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const APP_VERSION = "1.0.0";
const SUPPORT_WHATSAPP = "+242061818113";
const SUPPORT_EMAIL = "contact@amog-transit.com";
const SUPPORT_PHONE = "+242061818113";
const WEBSITE = "https://amog-transit.com";

function SettingsRow({
  icon: Icon,
  label,
  description,
  c,
  onPress,
}: {
  icon: any;
  label: string;
  description?: string;
  c: Record<string, string>;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? c.primary + "06" : "transparent",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 13,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: c.primary + "10",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={c.primary} strokeWidth={1.6} />
        </View>
        <View style={{ flex: 1 }}>
          <RNText
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13.5,
              color: c.text,
            }}
          >
            {label}
          </RNText>
          {description ? (
            <RNText
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: c.textMuted,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {description}
            </RNText>
          ) : null}
        </View>
        <ExternalLink size={15} color={c.textMuted} strokeWidth={1.5} />
      </View>
    </Pressable>
  );
}

function ThemeRow({
  icon: Icon,
  label,
  description,
  c,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  description?: string;
  c: Record<string, string>;
  active: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? c.primary + "06" : "transparent",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 13,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: c.primary + "10",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={c.primary} strokeWidth={1.6} />
        </View>
        <View style={{ flex: 1 }}>
          <RNText
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13.5,
              color: c.text,
            }}
          >
            {label}
          </RNText>
          {description ? (
            <RNText
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: c.textMuted,
                marginTop: 2,
              }}
            >
              {description}
            </RNText>
          ) : null}
        </View>
        {active ? (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: c.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={12} color={c.textOnPrimary} strokeWidth={2.5} />
          </View>
        ) : (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 1.5,
              borderColor: c.border,
            }}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c, theme, setTheme } = useTheme();
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const openWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\+/g, "")}`;
    Linking.openURL(url).catch(() => {});
  };

  const openEmail = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
  const openPhone = () =>
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});

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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.iconBtn}
        >
          <ArrowLeft size={20} color={c.primary} strokeWidth={1.8} />
        </Pressable>
        <RNText
          style={{ fontFamily: "Syne_700Bold", fontSize: 16, color: c.text }}
        >
          Parametres
        </RNText>
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
          {/* Feedback */}
          {/* <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <SettingsRow
              icon={Heart}
              label="Donner mon avis"
              description="Notez l'app et laissez un commentaire"
              c={c}
              onPress={() => setFeedbackVisible(true)}
            />
          </View> */}

          {/* Appearance */}
          <RNText style={[styles.sectionTitle, { color: c.textMuted }]}>
            APPARENCE
          </RNText>

          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <ThemeRow
              icon={Sun}
              label="Clair"
              description="Theme lumineux"
              c={c}
              active={theme === "light"}
              onPress={() => setTheme("light")}
            />
            <View
              style={{ height: 1, backgroundColor: c.border, marginLeft: 62 }}
            />
            <ThemeRow
              icon={Moon}
              label="Sombre"
              description="Theme fonce"
              c={c}
              active={theme === "dark"}
              onPress={() => setTheme("dark")}
            />
            <View
              style={{ height: 1, backgroundColor: c.border, marginLeft: 62 }}
            />
            <ThemeRow
              icon={Monitor}
              label="Systeme"
              description="Suivre le reglage de l'appareil"
              c={c}
              active={theme === "system"}
              onPress={() => setTheme("system")}
            />
          </View>

          {/* About */}
          <RNText style={[styles.sectionTitle, { color: c.textMuted }]}>
            A PROPOS
          </RNText>

          {/* App Header Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                marginBottom: 10,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: c.primary + "10",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Package size={20} color={c.primary} strokeWidth={1.5} />
              </View>
              <View>
                <RNText
                  style={{
                    fontFamily: "Syne_700Bold",
                    fontSize: 16,
                    color: c.text,
                  }}
                >
                  AMOG Transit
                </RNText>
                <RNText
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: c.textMuted,
                    marginTop: 2,
                  }}
                >
                  Version {APP_VERSION}
                </RNText>
              </View>
            </View>
          </View>

          {/* Links Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <SettingsRow
              icon={Globe}
              label="Site web"
              description={WEBSITE}
              c={c}
              onPress={() => Linking.openURL(WEBSITE).catch(() => {})}
            />
            <View
              style={{ height: 1, backgroundColor: c.border, marginLeft: 62 }}
            />
            <SettingsRow
              icon={Info}
              label="Mentions legales"
              c={c}
              onPress={() =>
                Linking.openURL(`${WEBSITE}/legal`).catch(() => {})
              }
            />
          </View>

          {/* Contact */}
          <RNText style={[styles.sectionTitle, { color: c.textMuted }]}>
            CONTACTER LE STAFF
          </RNText>

          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <SettingsRow
              icon={Phone}
              label="WhatsApp"
              description={SUPPORT_WHATSAPP}
              c={c}
              onPress={openWhatsApp}
            />
            <View
              style={{ height: 1, backgroundColor: c.border, marginLeft: 62 }}
            />
            <SettingsRow
              icon={Mail}
              label="Email"
              description={SUPPORT_EMAIL}
              c={c}
              onPress={openEmail}
            />
            <View
              style={{ height: 1, backgroundColor: c.border, marginLeft: 62 }}
            />
            {/* <SettingsRow
              icon={MessageSquare}
              label="Telephone"
              description={SUPPORT_PHONE}
              c={c}
              onPress={openPhone}
            /> */}
          </View>
        </Animated.View>
      </ScrollView>

      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        c={c}
      />
    </View>
  );
}

function FeedbackModal({
  visible,
  onClose,
  c,
}: {
  visible: boolean;
  onClose: () => void;
  c: Record<string, string>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const feedback = useFeedback();

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await feedback.mutateAsync({ rating, comment: comment.trim() });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setComment("");
        onClose();
      }, 2000);
    } catch (err) {
      console.error("[Feedback]", err);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: c.background + "E6" }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={[
            styles.modalContent,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <RNText
              style={{
                fontFamily: "Syne_700Bold",
                fontSize: 16,
                color: c.text,
              }}
            >
              Votre avis
            </RNText>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={c.textMuted} strokeWidth={2} />
            </Pressable>
          </View>

          {submitted ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <CheckCircle2 size={40} color={c.success} strokeWidth={1.5} />
              <RNText
                style={{
                  fontFamily: "Syne_600SemiBold",
                  fontSize: 15,
                  color: c.text,
                  marginTop: 12,
                }}
              >
                Merci pour votre avis !
              </RNText>
            </View>
          ) : (
            <>
              <RNText
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: c.textMuted,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Comment s'est passee votre experience ?
              </RNText>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)} hitSlop={10}>
                    <Star
                      size={32}
                      color={s <= rating ? "#F59E0B" : c.border}
                      strokeWidth={1.5}
                      fill={s <= rating ? "#F59E0B" : "transparent"}
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 12,
                  backgroundColor: c.background,
                  color: c.text,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  minHeight: 80,
                  textAlignVertical: "top",
                  marginBottom: 16,
                }}
                placeholder="Commentaire (optionnel)..."
                placeholderTextColor={c.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />

              <Button
                title="Envoyer"
                onPress={handleSubmit}
                disabled={rating === 0 || feedback.isPending}
                loading={feedback.isPending}
              />
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
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
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
});
