# AMOG TRANSIT — BRAND_MOBILE.md

> **Source de vérité graphique pour l'application mobile React Native.**
> Alignée avec `BRAND_GUIDELINE.md` v1.2 et `rules/BRAND.md`.
> Toute décision UI mobile doit être validée contre ce fichier.

---

## 1. PALETTE DE COULEURS

La palette mobile est **identique** à la palette web. Elle est définie dans `theme/colors.ts`.

### `theme/colors.ts`

```ts
export const colors = {
  light: {
    // Surfaces
    base100: "#ffffff",
    base200: "#f4f6fa",
    base300: "#e8ecf4",
    background: "#f4f6fa",
    surface: "#ffffff",
    surfaceHover: "#eef1f8",

    // Bordures
    border: "#d0d8ea",

    // Primaire — Navy AMOG
    primary: "#1b2d5b",
    primaryLight: "#2a4080",
    primaryDark: "#0f1a38",

    // Accent — Rouge Cargo
    accent: "#8b1a2f",

    // Textes
    text: "#0f1a38",
    textMuted: "#6b7a99",
    textInverse: "#ffffff",
    textOnPrimary: "#ffffff",

    // Sémantiques — NON NÉGOCIABLES
    success: "#1a7a4a",
    warning: "#c47d0e",
    error: "#b91c1c",
    info: "#1d5faa",
  },
  dark: {
    base100: "#0d1528",
    base200: "#121e38",
    base300: "#1a2848",
    background: "#0d1528",
    surface: "#121e38",
    surfaceHover: "#1e2f50",
    border: "#263a60",
    primary: "#3a5ba8",
    primaryLight: "#4d72c8",
    primaryDark: "#1b2d5b",
    accent: "#c0293f",
    text: "#e8ecf4",
    textMuted: "#7a8fad",
    textInverse: "#0d1528",
    textOnPrimary: "#ffffff",
    success: "#22a25e",
    warning: "#e09b2a",
    error: "#e53e3e",
    info: "#4a90d9",
  },
} as const;

export type ColorScheme = typeof colors.light;
```

### Hook d'accès aux couleurs

```ts
// hooks/useThemeColors.ts
import { useColorScheme } from "nativewind";
import { colors } from "../theme/colors";

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return colors[colorScheme === "dark" ? "dark" : "light"];
}
```

### Statuts logistiques — couleurs strictes

```ts
// constants/statuses.ts
export const STATUS_COLORS = {
  achete: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  en_transit: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  en_douane: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  disponible: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  livre: {
    bg: "bg-success/15",
    text: "text-success",
    border: "border-success/25",
  },
  incident: {
    bg: "bg-error/10",
    text: "text-error",
    border: "border-error/20",
  },
} as const;
```

**Ces couleurs ont une valeur opérationnelle. Ne jamais déroger.**

### NativeWind — configuration des couleurs

Dans `tailwind.config.js`, les couleurs AMOG doivent être mappées pour NativeWind :

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        // etc.
      },
    },
  },
};
```

Ou via CSS variables avec le thème NativeWind v4.

---

## 2. TYPOGRAPHIE

### Stack

```
Titres  → Syne (expo-google-fonts)  — 600 / 700 / 800
Corps   → Inter (expo-google-fonts) — 400 / 500 / 600
Données → JetBrains Mono (expo-google-fonts) — 400 / 500
```

### Installation Expo

```bash
npx expo install @expo-google-fonts/syne @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono expo-font
```

### `theme/typography.ts`

```ts
export const typography = {
  // Titres Syne
  display: { fontFamily: "Syne_800ExtraBold", fontSize: 32, lineHeight: 36 },
  h1: { fontFamily: "Syne_700Bold", fontSize: 28, lineHeight: 33 },
  h2: { fontFamily: "Syne_700Bold", fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: "Syne_600SemiBold", fontSize: 18, lineHeight: 24 },

  // Corps Inter
  bodyLg: { fontFamily: "Inter_400Regular", fontSize: 17, lineHeight: 26 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 24 },
  bodySm: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  label: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 18 },
  micro: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Données JetBrains Mono
  tracking: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  code: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
} as const;
```

### NativeWind — classes typographiques

```tsx
// Titres
<Text className="font-heading text-2xl font-bold">Mes commandes</Text>

// Corps
<Text className="font-body text-base text-text">Description normale</Text>
<Text className="font-body text-sm text-muted">Texte secondaire</Text>

// Données critiques
<Text className="font-mono text-sm tracking-wider">AMG-2026-00142</Text>
<Text className="font-mono text-base">45 000 XAF</Text>
```

**Règles :**

- `JetBrains Mono` pour : numéros de tracking, IDs commandes, montants XAF, timestamps
- Taille minimum : 11pt (jamais en dessous)
- `font-weight: 400` sur fond foncé → passer à 500 minimum
- Pas de `text-transform: uppercase` sur du texte long

---

## 3. SPACING & PROPORTIONS

### `theme/spacing.ts`

```ts
export const spacing = {
  s1: 4, // micro — séparation icône
  s2: 8, // xs — padding badge, gap interne
  s3: 12, // sm — gap entre cards
  s4: 16, // base — padding horizontal écran, padding card
  s5: 20, // md — marges de sections
  s6: 24, // lg — padding sections
  s8: 32, // xl — gap entre composants
  s10: 40, // 2xl — marges importantes
  s12: 48, // 3xl — header height
  s16: 64, // 4xl — bottom nav height
} as const;
```

### Border Radius

```ts
export const radius = {
  sm: 4, // badges, tags
  md: 8, // inputs, boutons, cards
  lg: 12, // modals, panels
  xl: 16, // bottom sheets, drawers
  full: 9999, // pills, avatars
} as const;
```

### Proportions écran mobile

```
Écran 360–390px
├── Safe area top     : 44–48pt (status bar)
├── Header app        : 56pt
├── Contenu           : flex-1
├── Bottom navigation : 64pt
└── Safe area bottom  : 20–34pt (home indicator)

Padding horizontal    : 16pt (spacing.s4)
Gap entre cards       : 12pt (spacing.s3)
Zone tactile minimum  : 44×44pt (Apple HIG / Material)
```

---

## 4. COMPOSANTS

### Badges de statut

```tsx
// components/ui/Badge.tsx
interface BadgeProps {
  status: keyof typeof STATUS_COLORS;
  label: string;
}

// Style : padding 4px 10px · radius 4 · Inter 500 · 12px
// Fond semi-transparent sur la couleur sémantique
```

### Cards

```tsx
// Style standard
className="bg-surface border border-border rounded-lg shadow-sm p-4"

// Hover / Press effect
onPressIn  → scale(0.98) via Reanimated withSpring
onPressOut → scale(1)
```

### Boutons

```tsx
// Primaire
className="bg-primary rounded-md px-5 py-2.5 items-center"
// Texte : Inter 600 · 14px · text-on-primary

// Accent (actions critiques)
className="bg-accent rounded-md px-5 py-2.5 items-center"

// Ghost
className="border-1.5 border-border rounded-md px-5 py-2.5 items-center"
// Texte : text-primary

// Disabled
opacity={0.45} pointerEvents="none"

// Active state (PAS de hover sur mobile)
onPressIn  → scale(0.97) Reanimated
onPressOut → scale(1)
```

### Timeline de tracking (composant signature)

```tsx
// Structure
● Étape passée   → cercle plein couleur sémantique + icon check
● Étape actuelle → cercle plein + animation pulse (trackingDotPulse Reanimated)
○ Étape future   → cercle vide, couleur text-muted

// La ligne verticale change de couleur au fur et à mesure
// Utiliser FlatList ou Animated.FlatList pour les longues timelines
// stagger l'apparition des steps : entryDelay = index * 80ms
```

### Skeleton Loading

```tsx
// Utiliser react-native-skeleton-placeholder ou animation Reanimated
// Couleur : base300 → base200 → base300 (même logique que web shimmer)
// Duration : 1.4s loop infini
```

### États vides (empty states)

- Illustration SVG simple (Expo SVG)
- Titre Syne 600, sous-titre Inter 400 text-muted
- Un seul CTA bouton primaire

---

## 5. ANIMATIONS — React Reanimated

**React Reanimated est la bibliothèque officielle d'animation.** Toute animation de performance doit l'utiliser.

### `theme/animations.ts`

```ts
import {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

// ── Entrées d'écran ──
export const screenEnter = FadeInDown.duration(280).springify().damping(18);
export const screenExit = FadeOutDown.duration(200);

// ── Apparition de composants (listes, cards) ──
export const itemEnter = (index: number) =>
  FadeInDown.delay(index * 70)
    .duration(250)
    .easing(Easing.out(Easing.quad));

// ── Bottom Sheet / Modal ──
export const sheetEnter = FadeInUp.duration(300).easing(
  Easing.out(Easing.cubic),
);
export const sheetExit = FadeOutDown.duration(220);

// ── Active press state ──
export const pressIn = (sv: SharedValue<number>) => {
  "worklet";
  sv.value = withSpring(0.97, { damping: 15 });
};
export const pressOut = (sv: SharedValue<number>) => {
  "worklet";
  sv.value = withSpring(1.0, { damping: 15 });
};

// ── Tracking dot pulse (étape actuelle) ──
export const trackingDotPulse = () =>
  useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.35, {
              duration: 700,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1.0, {
              duration: 700,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      },
    ],
    opacity: withRepeat(
      withSequence(
        withTiming(0.5, { duration: 700 }),
        withTiming(1.0, { duration: 700 }),
      ),
      -1,
      true,
    ),
  }));

// ── Shimmer skeleton ──
export const shimmerTranslate = (width: number) =>
  useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withRepeat(
          withTiming(width, { duration: 1000, easing: Easing.linear }),
          -1,
        ),
      },
    ],
  }));
```

### Usage dans les composants

```tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { screenEnter, itemEnter, pressIn, pressOut } from "../theme/animations";

// Entrée d'écran
<Animated.View entering={screenEnter}>
  <Screen />
</Animated.View>;

// Liste avec stagger
{
  orders.map((order, i) => (
    <Animated.View key={order.id} entering={itemEnter(i)}>
      <OrderCard order={order} />
    </Animated.View>
  ));
}

// Bouton avec press effect
const scale = useSharedValue(1);
const animStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
<Animated.View style={animStyle}>
  <Pressable
    onPressIn={() => pressIn(scale)}
    onPressOut={() => pressOut(scale)}
  />
</Animated.View>;
```

### Règles animations

- **Durée maximale : 400ms** — au-delà, l'interface paraît lente
- **Pas de `bounce` ou `shake`** sauf erreur critique (champ invalide)
- **Pas de rotation gratuite**, pas d'effets "ludiques" — mouvement sérieux et logistique
- **Stagger de listes : 70ms par item** (ni trop lent ni trop rapide)
- **Navigation entre écrans** → animations natives Expo Router (stack, tab) — ne pas surcharger
- **Transitions pull-to-refresh** → comportement natif (Expo RefreshControl)
- Ne jamais redéfinir les variants dans les composants — toujours importer depuis `theme/animations.ts`

---

## 6. THÈMES — ORGANISATION

### Structure du thème

```ts
// theme/index.ts — export unique
export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { animations } from "./animations";
```

### NativeWind + Dark mode

```tsx
// Toutes les classes supportent dark mode via préfixe dark:
<View className="bg-background dark:bg-[#0D1528]">
  <Text className="text-text dark:text-[#E8ECF4]">Contenu</Text>
</View>;

// Ou via useColorScheme()
const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
```

### Préférence utilisateur

- Suivre la préférence système par défaut (`Appearance.getColorScheme()`)
- Permettre à l'utilisateur de forcer light/dark depuis son profil
- Persister le choix dans AsyncStorage

### React Native Paper — thème

```ts
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from "react-native-paper";

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1b2d5b",
    secondary: "#8b1a2f",
    surface: "#ffffff",
    background: "#f4f6fa",
    error: "#b91c1c",
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#3a5ba8",
    secondary: "#c0293f",
    surface: "#121e38",
    background: "#0d1528",
    error: "#e53e3e",
  },
};
```

---

## 7. ICÔNES

Utiliser **Lucide React Native** pour la cohérence avec l'app web.

```bash
npx expo install lucide-react-native react-native-svg
```

```tsx
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  AlertTriangle,
} from "lucide-react-native";

// Taille : 16 (sm) · 20 (base) · 24 (lg)
// Stroke width : 1.5 (standard) · 2 (emphase)
// Couleur : toujours via theme colors — jamais en dur

<Package size={20} strokeWidth={1.5} color={colors.light.primary} />;
```

---

## 8. IMAGES & PLACEHOLDERS

```tsx
// Placeholder produit
const productPlaceholder = (w: number, h: number) =>
  `https://placehold.co/${w}x${h}/E8ECF4/6B7A99?text=Produit`;

// Placeholder avatar
const avatarPlaceholder = (initials: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1B2D5B&color=FFFFFF&size=128`;

// Usage avec react-native image (recommandé)
import { Image } from "react-native";
<Image
  source={{ uri: product.image_url ?? productPlaceholder(400, 300) }}
  style={{ width: "100%", height: 200, borderRadius: radius.md }}
  contentFit="cover"
  placeholder={{ thumbhash: "..." }}
/>;
```

---

## 9. INTERDICTIONS ABSOLUES (mobile)

- Couleur en dur dans le code → utiliser `theme/colors.ts` ou classes NativeWind
- Zone tactile < 44×44pt
- Hover states (inexistants sur mobile) → utiliser `onPressIn`/`onPressOut`
- Animation > 400ms
- Effets bounce, shake, rotation gratuite
- `StyleSheet.create` pour les layouts standard (réservé aux optimisations prouvées)
- Statut logistique affiché avec une couleur non conforme à la section 1
- Variants Reanimated définis inline dans les composants

---

## 10. CHECKLIST AVANT LIVRAISON

- [ ] Testé en mode clair ET mode sombre
- [ ] Testé sur iPhone SE (375px) et iPhone 15 Pro Max (430px)
- [ ] Testé sur Android 360px
- [ ] Zones tactiles ≥ 44×44pt vérifiées
- [ ] Couleurs sémantiques des statuts conformes
- [ ] Animations < 400ms
- [ ] Dark mode cohérent (pas de blanc qui "flashe")
- [ ] Données critiques (montants, tracking IDs) en JetBrains Mono
- [ ] Safe areas respectées (useSafeAreaInsets)
