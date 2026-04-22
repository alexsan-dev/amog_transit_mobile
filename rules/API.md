# AMOG TRANSIT — API.md

> Documentation de l'API REST pour les développeurs mobiles.
> **Ce fichier est mis à jour automatiquement à chaque création ou modification d'endpoint.**
> Base URL : `{EXPO_PUBLIC_API_URL}/api`
> Auth : `Authorization: Bearer {token}` (Sanctum)

---

## Convention de réponses

Toutes les réponses API suivent ce format :

**Succès :**

```json
{ "success": true, "message": "...", "data": { ... } }
```

**Liste paginée :**

```json
{ "success": true, "data": [...], "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 72 } }
```

**Erreur :**

```json
{ "success": false, "message": "...", "code": "ERROR_CODE" }
```

**Erreur de validation :**

```json
{
  "success": false,
  "message": "Les données fournies sont invalides.",
  "errors": { "field": ["message"] }
}
```

---

## Codes d'erreur globaux

| Code                 | HTTP | Description                           |
| -------------------- | ---- | ------------------------------------- |
| `UNAUTHENTICATED`    | 401  | Token absent, invalide ou expiré      |
| `FORBIDDEN`          | 403  | Action non autorisée pour ce rôle     |
| `VALIDATION_ERROR`   | 422  | Données d'entrée invalides            |
| `SERVER_ERROR`       | 500  | Erreur serveur inattendue             |
| `ACCOUNT_BANNED`     | 403  | Compte suspendu                       |
| `EMAIL_NOT_VERIFIED` | 403  | Email non vérifié                     |
| `ORDER_NOT_FOUND`    | 404  | Commande introuvable                  |
| `ROUTE_NOT_FOUND`    | 404  | Route logistique introuvable          |
| `PAYMENT_FAILED`     | 402  | Échec du paiement                     |
| `PROFILE_INCOMPLETE` | 403  | Profil incomplet (téléphone manquant) |
| `NOT_FOUND`          | 404  | Ressource introuvable                 |
| `NOT_IMPLEMENTED`    | 501  | Fonctionnalité non implémentée        |

---

## Authentification

### POST /api/auth/login

Auth requise : Non

**Payload d'entrée :**

```json
{ "email": "client@example.com", "password": "motdepasse" }
```

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "token": "1|xxxxxxxxxxxxxxxx",
    "user": {
      "id": 42,
      "name": "Jean Mobemba",
      "email": "jean@example.com",
      "role": "client",
      "email_verified": true,
      "avatar_url": null
    }
  }
}
```

**Erreurs :**

```json
{ "success": false, "message": "Identifiants incorrects.", "code": "INVALID_CREDENTIALS" }
{ "success": false, "message": "Compte suspendu.", "code": "ACCOUNT_BANNED" }
```

---

### POST /api/auth/register

Auth requise : Non

**Payload d'entrée :**

```json
{
  "name": "Jean Mobemba",
  "email": "jean@example.com",
  "password": "motdepasse",
  "password_confirmation": "motdepasse",
  "phone": "+242064000000"
}
```

**Payload de sortie (201) :**

```json
{
  "success": true,
  "message": "Compte créé. Vérifiez votre email.",
  "data": {
    "token": "2|xxxxxxxxxxxxxxxx",
    "user": {
      "id": 43,
      "name": "Jean Mobemba",
      "email": "jean@example.com",
      "role": "client",
      "email_verified": false
    }
  }
}
```

---

### POST /api/auth/logout

Auth requise : Oui (tout rôle)

**Payload de sortie (200) :**

```json
{ "success": true, "message": "Déconnexion réussie." }
```

---

### GET /api/auth/me

Auth requise : Oui (tout rôle)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Jean Mobemba",
    "email": "jean@example.com",
    "phone": "+242064000000",
    "role": "client",
    "email_verified": true,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### POST /api/auth/refresh

Auth requise : Oui (tout rôle)

Supprime le token courant et en génère un nouveau.

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Token rafraîchi.",
  "data": {
    "token": "3|xxxxxxxxxxxxxxxx",
    "user": {
      "id": 42,
      "name": "Jean Mobemba",
      "email": "jean@example.com",
      "role": "client",
      "email_verified": true
    }
  }
}
```

---

### POST /api/auth/forgot-password/send

Auth requise : Non

**Payload d'entrée :**

```json
{ "email": "jean@example.com" }
```

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Si cette adresse est associée à un compte, un code de réinitialisation vient d'être envoyé."
}
```

---

### POST /api/auth/forgot-password/reset

Auth requise : Non

**Payload d'entrée :**

```json
{
  "email": "jean@example.com",
  "code": "123456",
  "password": "nouveau",
  "password_confirmation": "nouveau"
}
```

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."
}
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Code invalide ou expiré.",
  "code": "VALIDATION_ERROR"
}
```

---

### GET /api/auth/{provider}/redirect

Auth requise : Non

`provider` ∈ `['google', 'facebook', 'tiktok']`

**Flow mobile :**

1. L'app appelle cet endpoint pour obtenir l'URL d'autorisation OAuth
2. L'app ouvre cette URL dans un navigateur in-app (`expo-web-browser`)
3. L'utilisateur s'authentifie chez le provider
4. Le provider redirige vers `GET /api/auth/{provider}/callback` (backend)
5. Le backend traite le callback et redirige vers le deep-link `amogtransit://auth/callback?token=xxx`

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=https%3A%2F%2F...",
    "provider": "google"
  }
}
```

---

### GET /api/auth/{provider}/callback

Auth requise : Non

**⚠️ Ne pas appeler directement depuis l'app.** Cet endpoint est appelé par le provider OAuth (Google/Facebook/TikTok) après l'authentification de l'utilisateur.

**Comportement :**

- Crée ou connecte l'utilisateur (match par `provider_id` puis par email)
- Génère un token Sanctum mobile
- Redirige vers le deep-link `amogtransit://auth/callback?token=xxx`

**Deep-link en cas de succès :**

```
amogtransit://auth/callback?token=1%7Cxxxxxxxxxxxxxxxx
```

**Deep-link en cas d'erreur :**

```
amogtransit://auth/callback?error=oauth_failed&message=Authentification%20sociale%20%C3%A9chou%C3%A9e.
```

**Codes d'erreur deep-link :**
| Code | Déclencheur |
|---|---|
| `invalid_provider` | Fournisseur non supporté |
| `oauth_failed` | Échec de l'échange OAuth (code invalide, token expiré) |
| `account_banned` | Compte suspendu |

---

### GET /api/auth/{provider}/callback

Auth requise : Non

`provider` ∈ `['google', 'facebook', 'tiktok']`

**Payload de sortie (501) :**

```json
{
  "success": false,
  "message": "Authentification sociale non disponible via API directe.",
  "code": "NOT_IMPLEMENTED"
}
```

---

## Vérification Email

### POST /api/email-verification/send

Auth requise : Oui (client)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Code de vérification envoyé par email.",
  "data": { "already_verified": false }
}
```

---

### POST /api/email-verification/confirm

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{ "code": "123456" }
```

**Payload de sortie (200) :**

```json
{ "success": true, "message": "Email vérifié avec succès." }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Code invalide ou expiré.",
  "code": "VALIDATION_ERROR"
}
```

---

## Commandes

### GET /api/orders

Auth requise : Oui (client)

**Query params :**

- `status` (optionnel) : `acheté|en_transit|en_douane|disponible|livré|incident|pending|paid|cancelled`
- `page` (optionnel, défaut 1)
- `per_page` (optionnel, défaut 15)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "reference": "AMG-2026-00101",
      "status": "en_transit",
      "quoted_amount": 45000,
      "currency": "XAF",
      "shipping_route": {
        "id": 3,
        "origin": "Guangzhou, Chine",
        "destination": "Pointe-Noire, Congo"
      },
      "created_at": "2026-01-12T08:00:00Z",
      "updated_at": "2026-01-13T09:15:00Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 }
}
```

---

### POST /api/orders

Auth requise : Oui (client — profil complet requis)

**Payload d'entrée :**

```json
{
  "shipping_route_id": 3,
  "service_type": "purchase_assisted",
  "estimated_weight": 12.5,
  "delivery_address": "Brazzaville, Congo",
  "client_notes": "Fragile",
  "products": [
    {
      "name": "Téléphone",
      "url": "...",
      "unit_price": 150,
      "currency": "EUR",
      "nature": "telephones",
      "quantity": 2,
      "notes": "..."
    }
  ],
  "product_photos": ["<fichier>"]
}
```

**Payload de sortie (201) :**

```json
{ "success": true, "message": "Commande AMG-2026-00102 créée avec succès.", "data": { ... } }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Complétez votre profil...",
  "code": "PROFILE_INCOMPLETE"
}
```

---

### GET /api/orders/{reference}

Auth requise : Oui (client — doit être propriétaire de la commande)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "reference": "AMG-2026-00101",
    "status": "en_transit",
    "quoted_amount": 45000,
    "paid_amount": 45000,
    "currency": "XAF",
    "shipping_route": {
      "origin": "Guangzhou, Chine",
      "destination": "Pointe-Noire, Congo",
      "transit_days": 7
    },
    "products": [
      {
        "name": "Téléphones",
        "quantity": 10,
        "unit_price": 4000,
        "total": 40000
      }
    ],
    "logs": [
      {
        "status": "acheté",
        "label": "Commande créée",
        "date": "2026-01-12T08:00:00Z"
      }
    ],
    "created_at": "2026-01-12T08:00:00Z"
  }
}
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Commande introuvable.",
  "code": "ORDER_NOT_FOUND"
}
```

---

### POST /api/orders/{reference}/cancel

Auth requise : Oui (client — doit être propriétaire)

**Payload de sortie (200) :**

```json
{ "success": true, "message": "Commande AMG-2026-00101 annulée avec succès." }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Cette commande ne peut pas être annulée.",
  "code": "VALIDATION_ERROR"
}
```

---

### GET /api/tracking

Auth requise : Oui (client)

Alias filtré de la liste des commandes pour l'onglet suivi.

**Query params :**

- `status` (optionnel)
- `page` (optionnel)
- `per_page` (optionnel)

**Payload de sortie (200) :** identique à `GET /api/orders`

---

## Paiements

### POST /api/orders/{reference}/pay/initiate

Auth requise : Oui (client — doit être propriétaire)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Paiement initié.",
  "data": {
    "payment_id": 55,
    "intent_id": "pi_xxxxx",
    "client_secret": "pi_xxxxx_secret_yyyyy",
    "amount": 45000,
    "currency": "XAF"
  }
}
```

**Erreurs :**

```json
{ "success": false, "message": "Cette commande n'est pas en attente de paiement.", "code": "VALIDATION_ERROR" }
{ "success": false, "message": "Montant invalide.", "code": "VALIDATION_ERROR" }
```

---

### POST /api/orders/{reference}/pay/confirm

Auth requise : Oui (client — doit être propriétaire)

**Payload d'entrée :**

```json
{ "payment_id": 55, "phone": "+242064000000", "operator": "mtn" }
```

**Payload de sortie (200) :**

```json
{ "success": true, "data": { "status": "succeeded" } }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Le paiement a échoué.",
  "code": "PAYMENT_FAILED"
}
```

---

### GET /api/orders/{reference}/pay/status

Auth requise : Oui (client — doit être propriétaire)

**Payload de sortie (200) :**

```json
{ "success": true, "data": { "status": "processing" } }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Aucun paiement en cours trouvé.",
  "code": "NOT_FOUND"
}
```

---

### GET /api/orders/{reference}/invoice/download

Auth requise : Oui (client — doit être propriétaire)

Retourne un PDF (`Content-Type: application/pdf`).

**Erreurs :**

```json
{
  "success": false,
  "message": "La facture est disponible uniquement après paiement.",
  "code": "FORBIDDEN"
}
```

---

## Routes logistiques

### GET /api/shipping-routes

Auth requise : Non

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Guangzhou → Pointe-Noire",
      "origin_country": "Chine",
      "destination_country": "Congo",
      "transit_days_min": 5,
      "transit_days_max": 10,
      "active": true
    }
  ]
}
```

---

### POST /api/shipping-routes/{id}/simulate

Auth requise : Non

**Payload d'entrée :**

```json
{ "weight_kg": 15.5, "value_eur": 200, "type": "purchase_assisted" }
```

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "subtotal_xaf": 50000,
    "service_fee_xaf": 7500,
    "payment_fee_xaf": 1750,
    "total_xaf": 59250,
    "total_eur": 90.46,
    "breakdown": { "service_rate": "15%", "payment_rate": "8.5%" }
  }
}
```

---

## Notifications

### GET /api/notifications

Auth requise : Oui (client)

**Query params :**

- `read` (optionnel) : `true|false`
- `page` (optionnel)
- `per_page` (optionnel, défaut 20)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": [
    {
      "id": 55,
      "title": "Colis en transit",
      "body": "Votre commande AMG-2026-00101 est en route.",
      "type": "info",
      "read": false,
      "order_reference": "AMG-2026-00101",
      "created_at": "2026-01-13T09:15:00Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 20, "total": 5 }
}
```

---

### POST /api/notifications/read-all

Auth requise : Oui (client)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Toutes les notifications ont été marquées comme lues."
}
```

---

### POST /api/notifications/{id}/read

Auth requise : Oui (client)

**Payload de sortie (200) :**

```json
{ "success": true, "message": "Notification marquée comme lue." }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Notification introuvable.",
  "code": "NOT_FOUND"
}
```

---

## Support (Tickets)

### GET /api/tickets

Auth requise : Oui (client)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "subject": "Colis bloqué en douane",
      "status": "open",
      "order_reference": "AMG-2026-00101",
      "last_message_at": "2026-01-14T11:00:00Z",
      "created_at": "2026-01-13T14:00:00Z"
    }
  ]
}
```

---

### POST /api/tickets

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{
  "subject": "Colis bloqué en douane",
  "message": "Mon colis AMG-2026-00101 est bloqué depuis 3 jours.",
  "order_reference": "AMG-2026-00101"
}
```

**Payload de sortie (201) :**

```json
{
  "success": true,
  "message": "Ticket créé avec succès.",
  "data": { "id": 13, "subject": "Colis bloqué en douane", "status": "open" }
}
```

---

### GET /api/tickets/{id}

Auth requise : Oui (client — doit être propriétaire)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "subject": "Colis bloqué en douane",
    "status": "open",
    "messages": [
      {
        "id": 1,
        "body": "Mon colis est bloqué depuis 3 jours.",
        "sender": "client",
        "created_at": "2026-01-13T14:00:00Z"
      },
      {
        "id": 2,
        "body": "Nous vérifions avec nos équipes douanières.",
        "sender": "admin",
        "created_at": "2026-01-13T15:30:00Z"
      }
    ]
  }
}
```

---

### POST /api/tickets/{id}/messages

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{ "body": "Avez-vous des nouvelles ?" }
```

**Payload de sortie (201) :**

```json
{
  "success": true,
  "message": "Message envoyé.",
  "data": {
    "id": 3,
    "body": "Avez-vous des nouvelles ?",
    "sender": "client",
    "created_at": "2026-01-14T11:00:00Z"
  }
}
```

---

## Profil

### GET /api/profile

Auth requise : Oui (client)

**Payload de sortie (200) :**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Jean Mobemba",
    "email": "jean@example.com",
    "phone": "+242064000000",
    "avatar_url": null,
    "email_verified": true,
    "created_at": "2026-01-10T08:00:00Z"
  }
}
```

---

### PUT /api/profile

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{ "name": "Jean Mobemba", "phone": "+242064000001" }
```

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Profil mis à jour.",
  "data": {
    "id": 42,
    "name": "Jean Mobemba",
    "email": "jean@example.com",
    "phone": "+242064000001"
  }
}
```

---

### POST /api/profile/avatar

Auth requise : Oui (client)

**Payload d'entrée :** `multipart/form-data`

- `avatar` (required) : image jpeg/png/webp/gif, max 4Mo

**Payload de sortie (200) :**

```json
{
  "success": true,
  "message": "Photo de profil mise à jour.",
  "data": { "avatar_url": "/storage/avatars/xxxxx.jpg" }
}
```

---

### POST /api/profile/password

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{
  "current_password": "ancien",
  "password": "nouveau",
  "password_confirmation": "nouveau"
}
```

**Payload de sortie (200) :**

```json
{ "success": true, "message": "Mot de passe modifié avec succès." }
```

**Erreurs :**

```json
{
  "success": false,
  "message": "Mot de passe actuel incorrect.",
  "code": "VALIDATION_ERROR"
}
```

---

## Avis & Retours

### POST /api/feedback

Auth requise : Oui (client)

**Payload d'entrée :**

```json
{ "rating": 5, "comment": "Service rapide et fiable." }
```

**Payload de sortie (201) :**

```json
{ "success": true, "message": "Merci pour votre avis." }
```

---

_Ce fichier est généré et maintenu automatiquement. Ne pas modifier manuellement — mettre à jour via les contrôleurs API._
