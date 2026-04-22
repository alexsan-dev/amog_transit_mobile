# AMOG TRANSIT — AGENTS.md

> Fichier de déclaration pour les développeurs de l'application mobile AMOG TRANSIT.
> Lire ce fichier et ses index avant toute intervention sur le projet mobile.

---

## Index des sources de vérité

| Ressource                  | Fichier                                            | Rôle                                                                         |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Documentation API complète | [@/rules/API.md](./rules/API.md)                   | Endpoints, payloads, codes d'erreur                                          |
| Design system mobile       | [@/rules/BRAND_MOBILE.md](./rules/BRAND_MOBILE.md) | Couleurs, typo, spacing, animations, thèmes                                  |
| Tarifs fret aérien         | [@/aerien.json](./aerien.json)                     | Grilles tarifaires : routes, articles, prix XAF (Brazzaville / Pointe-Noire) |
| Tarifs fret maritime       | [@/maritime.json](./maritime.json)                 | Grilles tarifaires au m³/CBM                                                 |

**Ces fichiers sont la loi.** Toute décision de design ou d'intégration API doit être validée contre eux.

> **Attention :** AMOG TRANSIT n'est pas uniquement Chine → Congo. La plateforme couvre plusieurs corridors (Chine ↔ Congo, France ↔ Congo) et deux modes (aérien / maritime). L'app mobile doit refléter cette réalité dans ses filtres et écrans de routes.

**Ces deux fichiers sont la loi.** Toute décision de design ou d'intégration API doit être validée contre eux.

---

## Le projet mobile

### Contexte

L'app mobile AMOG TRANSIT est le **compagnon client** de la plateforme web. Elle offre la même expérience de confiance opérationnelle sur iOS et Android. Un utilisateur doit pouvoir :

- Suivre ses colis en temps réel (timeline interactive)
- Consulter l'état de ses commandes et paiements
- Contacter le support via tickets
- Recevoir des notifications push (statuts, alertes)
- Gérer son profil et ses paramètres

### Stack officielle

| Technologie            | Version | Rôle                                                  |
| ---------------------- | ------- | ----------------------------------------------------- |
| **React Native**       | 0.76+   | Framework mobile cross-platform (iOS + Android)       |
| **Expo**               | SDK 52+ | Build, déploiement, APIs natives                      |
| **Expo Router**        | v4      | Navigation file-based (iOS tabs + Android back stack) |
| **NativeWind**         | v4      | Tailwind CSS pour React Native — styling utilitaire   |
| **React Native Paper** | v5      | Composants Material Design (modals, dialogs, inputs)  |
| **React Reanimated**   | v3      | Animations natives haute performance                  |
| **TanStack Query**     | v5      | Cache serveur, synchronisation données API            |
| **Axios**              | latest  | Client HTTP avec interceptors                         |
| **Expo SecureStore**   | —       | Stockage sécurisé du token Sanctum                    |

---

## Authentification

L'app mobile utilise **Laravel Sanctum** (tokens Bearer).

```
POST /api/auth/login  →  reçoit { token, user }
                         Token stocké dans SecureStore

Toutes les requêtes protégées :
  Header: Authorization: Bearer {token}

POST /api/auth/logout  →  révoque le token côté serveur
                          Effacer le token local (SecureStore)
```

**Interceptor Axios recommandé :**

```ts
// lib/api.ts
axios.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("auth_token");
      // Rediriger vers login via Expo Router
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  },
);
```

---

## Organisation du projet mobile

```
/
├── app/                               ← Routes Expo Router (file-based)
│   ├── _layout.tsx                    ← Root layout (providers, theme)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (client)/
│       ├── _layout.tsx                ← Bottom Tab Navigator
│       ├── index.tsx                  ← Dashboard — mes commandes
│       ├── tracking/
│       │   └── [id].tsx               ← Timeline de suivi d'un colis
│       ├── tickets/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── notifications/
│       │   └── index.tsx
│       └── profile/
│           └── index.tsx
│
├── components/
│   ├── ui/                            ← Primitives réutilisables
│   │   ├── Badge.tsx                  ← Badges de statut logistique
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Skeleton.tsx               ← Loading state
│   │   └── StatusDot.tsx              ← Point de statut avec pulse
│   ├── tracking/
│   │   ├── TrackingTimeline.tsx       ← Composant signature — timeline
│   │   └── TrackingStep.tsx
│   └── orders/
│       ├── OrderCard.tsx
│       └── OrderList.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts                   ← TanStack Query pour les commandes
│   └── useNotifications.ts
│
├── lib/
│   ├── api.ts                         ← Instance Axios configurée + interceptors
│   ├── auth.ts                        ← Helpers SecureStore (get/set/clear token)
│   └── utils.ts
│
├── theme/
│   ├── colors.ts                      ← Palette AMOG complète (light + dark)
│   ├── typography.ts                  ← Échelle typographique
│   ├── spacing.ts                     ← Système de spacing (base 4pt)
│   └── animations.ts                  ← Variants Reanimated centralisés
│
├── types/
│   ├── api.ts                         ← Types retournés par l'API AMOG
│   └── navigation.ts                  ← Types Expo Router params
│
└── constants/
    └── statuses.ts                    ← Labels + couleurs des statuts logistiques
```

---

## Conventions & Bonnes pratiques

### Composants

- PascalCase pour les fichiers → `TrackingTimeline.tsx`
- Un composant par fichier
- Props typées TypeScript strict — **pas de `any`**
- NativeWind pour le styling (classes Tailwind) — éviter `StyleSheet.create` sauf micro-optimisation de performance prouvée
- Utiliser React Native Paper pour les composants complexes (Dialog, Modal, TextInput, FAB)

### Animations — React Reanimated

**React Reanimated est prioritaire** pour toutes les animations de performance.

```ts
// theme/animations.ts — centralisé, ne jamais redéfinir inline

export const fadeInDown: EntryAnimations = FadeInDown.duration(250).easing(
  Easing.out(Easing.quad),
);
export const fadeInUp: EntryAnimations = FadeInUp.duration(250).easing(
  Easing.out(Easing.quad),
);

// Pour les tracking timelines — pulse sur le dot actuel
export const trackingDotPulse = (sv: SharedValue<number>) =>
  useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.3, { duration: 600 }),
            withTiming(1, { duration: 600 }),
          ),
          -1,
        ),
      },
    ],
    opacity: withRepeat(
      withSequence(
        withTiming(0.6, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
    ),
  }));

// Entrée d'écran standard
export const screenEnter = FadeInDown.duration(280).springify().damping(20);
```

**Règles animations :**

- Toutes les animations d'entrée d'écran → `FadeInDown` ou `FadeInUp` via `entering` prop
- Timeline de tracking → `stagger` Reanimated + pulse sur le dot actuel
- Transitions de navigation → animations natives Expo Router
- Gestes (swipe, pull-to-refresh) → `react-native-gesture-handler`
- Aucune animation > 400ms (règle identique au web)
- Pas de `bounce` ou effets ludiques — langage de mouvement **sérieux et logistique**

### Navigation

- Expo Router (file-based) — les routes reflètent la structure des fichiers
- Bottom Tab Navigator pour l'espace client (4 onglets max)
- Types de params documentés dans `types/navigation.ts`
- Deep linking configuré pour les notifications push → `amog://tracking/[id]`

### Données & cache

- **TanStack Query** pour toutes les données serveur (ordres, tickets, notifications)
- Clé de cache par ressource → `['orders', userId]`, `['order', orderId]`, etc.
- Pas de store global (Redux) — contexte React pour l'auth, TanStack Query pour les données

### Dark mode

- Support dark mode **obligatoire**
- Utiliser les classes NativeWind `dark:` → `className="bg-white dark:bg-[#0D1528]"`
- Synchroniser avec `useColorScheme()` Expo ou préférence utilisateur
- Toutes les couleurs définies dans `theme/colors.ts` avec variante light + dark

### Zones tactiles

- Minimum `44×44` points pour toute zone tactile (règle Apple / Google)
- Pas de hover states — utiliser `onPressIn` / `onPressOut` pour les active states
- Active state standard : `scale(0.97)` via Reanimated `withSpring`

---

## Statuts logistiques — constantes

```ts
// constants/statuses.ts
export const ORDER_STATUSES = {
  achete: { label: "Acheté", color: "info", icon: "shopping-bag" },
  en_transit: { label: "En transit", color: "info", icon: "truck" },
  en_douane: { label: "En douane", color: "warning", icon: "shield" },
  disponible: { label: "Disponible", color: "success", icon: "package" },
  livre: { label: "Livré", color: "success", icon: "check-circle" },
  incident: { label: "Incident", color: "error", icon: "alert-triangle" },
} as const;
```

Les couleurs référencent la palette définie dans `theme/colors.ts` (jamais de valeurs en dur).

---

## Communication API

- Base URL → variable d'environnement : `EXPO_PUBLIC_API_URL`
- Format de toutes les réponses API → voir **@/rules/API.md** section "Convention de réponses"
- Gestion des erreurs → toujours lire `error.response.data.code` pour afficher le bon message
- Timeout recommandé : 15 secondes
- Retry automatique sur 5xx (TanStack Query `retry: 2`)

---

## Sources de vérité — rappel

| Question                                  | Où chercher                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Quel endpoint appeler ? Quel payload ?    | **@/rules/API.md**                                                     |
| Quelle couleur utiliser ? Quelle typo ?   | **@/rules/BRAND_MOBILE.md**                                            |
| Quelle animation utiliser ?               | **@/rules/BRAND_MOBILE.md** section Animations + `theme/animations.ts` |
| Quel statut logistique afficher comment ? | **@/rules/BRAND_MOBILE.md** section Statuts + `constants/statuses.ts`  |
