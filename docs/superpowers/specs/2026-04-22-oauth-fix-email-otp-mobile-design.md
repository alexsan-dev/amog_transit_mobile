# Design — OAuth fix + Mobile email OTP overlay
**Date** : 2026-04-22

---

## 1. OAuth `redirect_uri_mismatch` fix

### Problème
`web/AuthController::socialCallback` appelle `Socialite::driver($provider)->stateless()->user()` sans préciser `redirectUrl`. Le `redirect_uri` envoyé à Google lors de l'échange de token (étape 3) est lu depuis `config/services.php`, alors que l'URL d'autorisation (étape 1, construite dans `Api/AuthController::socialRedirect`) utilise explicitement `url('/auth/{provider}/callback')`. Si les deux valeurs diffèrent (HTTP vs HTTPS, chemin relatif, `APP_URL` mal configuré en prod), Google retourne `redirect_uri_mismatch`.

### Fix
**Fichier** : `app/Http/Controllers/AuthController.php` — méthode `socialCallback`

```php
// Avant
$socialUser = $isMobile
    ? Socialite::driver($provider)->stateless()->user()
    : Socialite::driver($provider)->user();

// Après
$socialUser = $isMobile
    ? Socialite::driver($provider)->redirectUrl(url('/auth/' . $provider . '/callback'))->stateless()->user()
    : Socialite::driver($provider)->user();
```

`url('/auth/{provider}/callback')` produit la même URL absolue que dans `Api/AuthController::socialRedirect`, ce qui garantit la cohérence entre les étapes 1 et 3.

### Portée
- 1 ligne modifiée dans un seul fichier backend
- Aucun changement mobile, aucun changement de routes, aucun changement de config

---

## 2. Mobile email OTP overlay

### Contexte
- Backend API : `/api/email-verification/send` et `/api/email-verification/confirm` → **déjà implémentés**
- Web overlay `EmailVerificationOverlay.tsx` → **déjà implémenté** dans `ClientLayout.tsx`
- Mobile : rien n'existe — à construire
- Le champ `email_verified` est déjà dans `formatUser` (backend) et dans le type `User` du store (`useAuthStore`)

### Architecture

#### Nouveau fichier : `src/components/EmailVerificationModal.tsx`
- `Modal` React Native, `transparent={true}`, `visible` piloté par `user?.email_verified === false`
- Pas de `onRequestClose` → bloquant (Android back button ne ferme pas)
- Deux étapes internes :
  - **`idle`** : bouton "Recevoir le code de vérification"
  - **`sent`** : input 6 chiffres + bouton "Confirmer" + bouton "Renvoyer" (désactivé pendant 60s)
- API calls :
  - `POST /api/email-verification/send` → démarre le countdown 60s, passe à `sent`
  - `POST /api/email-verification/confirm` → sur succès : `GET /auth/me` → `setAuth(token, freshUser)` → modal se ferme
- Animations : `FadeInDown` Reanimated sur le card, `withTiming` sur la transition idle→sent
- Style : cohérent avec `ForgotPasswordScreen` (composants `Input`, `Button`, `Text` existants)
- Gestion d'erreur : inline sous l'input, message du serveur (`err.response?.data?.message`)

#### Modification : `app/(client)/_layout.tsx`
- Ajouter `<EmailVerificationModal />` juste avant `</View>` de la View racine
- Le composant lit `user` depuis `useAuthStore` directement — aucune prop nécessaire

### Flow complet
```
Login / Register → setAuth(token, user{email_verified: false})
→ navigate /(client)
→ ClientLayout render → EmailVerificationModal visible=true
→ user clique "Recevoir le code" → POST /send → cooldown 60s → step=sent
→ user saisit code → POST /confirm → GET /auth/me → setAuth(token, freshUser{email_verified: true})
→ re-render → visible=false → modal fermé
```

### Ce qui ne change pas
- `useAuthStore` : pas de nouvelle action — `setAuth` suffit pour mettre à jour `email_verified`
- Routes backend : aucune modification
- Web overlay : aucune modification
- Middleware `EnsureEmailVerified` : pas étendu (la protection frontend suffit pour ce besoin)

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `app/Http/Controllers/AuthController.php` | Modifier 1 ligne (mobile branch de `socialCallback`) |
| `src/components/EmailVerificationModal.tsx` | Créer |
| `app/(client)/_layout.tsx` | Ajouter `<EmailVerificationModal />` |
