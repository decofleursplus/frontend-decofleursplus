# 🚨 Endpoints Feedback — DécoFleur Plus (Mise à jour Branche staging)

**Date :** 2026-11-03  
**Branche backend analysée :** `staging` (Commit `f37f5c6`)  
**Statut global :** Sur 149 endpoints recensés sur la branche `staging`, **la quasi-totalité des besoins du frontend (Commandes, Livraisons, NabooPay, CRM Clients, Abonnements, Blog, Marketing, Paramètres, Location) est désormais couverte par le backend !**

Ce document recense les quelques routes encore manquantes, les ajustements de conception à prévoir, et les règles d'intégration strictes entre le frontend et l'API backend.

---

## 1. Synthèse par Niveau de Priorité

| Priorité | Sujet | Type | Statut |
|---|---|---|---|
| 🟡 **MOYENNE** | Mot de passe oublié & réinitialisation | Route manquante | Non implémenté en V1 |
| 🟡 **MOYENNE** | OAuth Google & Facebook | Fonctionnalité manquante | Masquer boutons front |
| 🟢 **FAIBLE** | Dépôt d'avis clients (`POST /reviews`) | Route manquante | Affichage existant, dépôt non géré |
| 🟢 **FAIBLE** | Synchronisation serveur des favoris | Persistance | Conserver `localStorage` côté client |
| 🟠 **MOYENNE** | Système de Notifications In-App (Client & Admin) | Module complet manquant | Aucun endpoint, aucun modèle BDD |


---

## 2. Détail des Endpoints Manquants ou Partiels

### 2.1 Authentification — Mot de passe oublié
- **Besoin frontend :** Page `/mot-de-passe-oublie` demandant l'email/téléphone pour recevoir un lien ou code de réinitialisation.
- **État backend :** Aucun endpoint `/auth/forgot-password` ni `/auth/reset-password` n'est implémenté.
- **Spécification recommandée pour le backend :**
  ```http
  POST /api/v1/auth/forgot-password
  Content-Type: application/json
  { "email": "client@example.com" }
  // Réponse 200 : { "success": true, "data": { "message": "Email de réinitialisation envoyé" } }

  POST /api/v1/auth/reset-password
  Content-Type: application/json
  { "token": "jwt_reset_token", "newPassword": "NouveauPassword123!" }
  ```
- **Solution frontend en attendant :**
  ✅ **Implémenté :** La page `/mot-de-passe-oublie` affiche désormais un bloc d'assistance prioritaire avec bouton direct WhatsApp (+221 77 941 78 60) et numéro d'appel direct pour réinitialisation manuelle instantanée par le support client.

---

### 2.2 Connexion Sociale (Google / Facebook)
- **Besoin frontend :** Boutons « Continuer avec Google » et « Continuer avec Facebook » sur `/connexion` et `/inscription`.
- **État backend :** L'authentification repose uniquement sur `identifier (email/phone) + password` avec vérification bcrypt et génération JWT. Aucun provider OAuth (Google Client ID, Facebook App ID) n'est configuré côté serveur.
- **Action frontend :**
  ✅ **Implémenté :** La connexion Facebook a été complètement retirée. Le bouton Google s'affiche en pleine largeur avec le badge informatif « Bientôt disponible » et une notification explicite au clic.

---

### 2.3 Avis Clients & Notations (`Reviews`)
- **Besoin frontend :** Évaluation des bouquets (étoiles et commentaires clients).
- **État backend :** Le modèle `Product` contient les champs `rating` (Float, ex: 4.8) et `reviewsCount` (Int, ex: 12), mais il n'existe pas d'entité `Review` ni d'endpoint `POST /api/v1/products/:id/reviews` pour soumettre un avis public.
- **Action frontend :**
  ✅ **Implémenté :** Un accordéon interactif « Avis Clients & Notations » est intégré directement sous la fiche produit avec la note globale, des avis certifiés avec likes utiles, et un formulaire complet de dépôt d'avis (étoiles 1-5, nom, ville, commentaire) avec persistance locale et confirmation de remerciement.

---

### 2.4 Synchronisation des Favoris (`Wishlist`)
- **Besoin frontend :** Page `/favoris` pour sauvegarder des produits coup de cœur.
- **État backend :** Pas de table de favoris utilisateur en base de données.
- **Action frontend :**
  Conserver l'implémentation frontend actuelle basée sur le `localStorage` (`decofleur_favorites`). C'est rapide, performant, et cela fonctionne aussi bien pour les utilisateurs invités que connectés.

---

## 3. Règles Métier & Contraintes d'Intégration Strictes

### 3.1 Validation Zod Stricte (Aucun champ superflu)
Le backend utilise des schémas de validation stricts : **tout champ non prévu dans le schéma de requête provoque un rejet immédiat (`400 VALIDATION_ERROR`)**.
- ⚠️ **Dans `POST /orders` :** Ne jamais envoyer de `price`, `unitPrice`, `subtotal`, ou `totalAmount` ! Le backend recalcule obligatoirement les prix depuis sa base de données à partir de `variantId`.
- ⚠️ **Dans `POST /orders` :** Chaque ligne de commande doit contenir le **`variantId`** (UUID) de la variante du produit sélectionné (et non le productId seul).

### 3.2 Format des Identifiants & Téléphones
- Les IDs sont tous des **UUIDv4** côté backend (et non des entiers `"1"`, `"2"`).
- Les numéros de téléphone sont normalisés au format international E.164 (`+221771234567`). L'API tolère les saisies avec espaces ou tirets et les normalise automatiquement, mais il est recommandé d'envoyer un format propre.

### 3.3 Devis (`Quotes`) & Upload d'Images d'Inspiration
- La route `POST /api/v1/quotes` accepte directement la structure du `DevisForm` frontend.
- Pour les images d'inspiration : utiliser `POST /api/v1/quotes/uploads` (`multipart/form-data`, champ `files`), récupérer les URLs renvoyées, et les transmettre dans le champ `inspirationImages: string[]` lors de la soumission du devis.

### 3.4 Paiement en Ligne (NabooPay)
- Lors de `POST /api/v1/orders`, si la méthode sélectionnée est en ligne (`WAVE`, `ORANGE_MONEY`, `FREE_MONEY`, `CARD`), la réponse renvoie `checkoutUrl`.
- Le frontend doit immédiatement effectuer une redirection navigateur : `window.location.href = res.data.checkoutUrl`.
- À l'issue du paiement, NabooPay redirige le client vers :
  - Succès : `/commande/confirmation?orderNumber=CMD-AAAA-NNNN`
  - Échec : `/commande/paiement-echoue?orderNumber=CMD-AAAA-NNNN`
- Le webhook asynchrone sécurisé (`POST /api/v1/webhooks/naboopay`) valide ensuite la transaction et met à jour le statut en base.

### 3.5 Rôles Staff & Authentification Back-Office
- Le backend staging exige un rôle staff pour toutes les routes préfixées par `/api/v1/admin/*`.
- Rôles reconnus côté backend : `ADMIN`, `MANAGER`, `FLORIST`, `DELIVERY`, `SALES`, `ACCOUNTANT`.
- La page `/admin/connexion` vérifie le rôle après authentification et bloque l'accès aux clients standard avec le message explicite : *« Accès réservé à l'équipe DécoFleur Plus »*.
- Le client API `lib/api/client.ts` transmet automatiquement l'en-tête `Authorization: Bearer <token_admin>` via l'option `useAdminToken: true`.

### 3.6 Mappage Harmonisé des Statuts de Commande
- L'API backend utilise des constantes en majuscules anglaises (`PENDING`, `CONFIRMED`, `PROCESSING`, `READY_FOR_DELIVERY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
- Le frontend assure une conversion bidirectionnelle transparente vers la terminologie florale en français (`en_attente`, `en_preparation`, `en_livraison`, `livree`, `annulee`).

### 3.7 Résilience Hors-Ligne & Fallback Transparent
- L'ensemble des 16 modules d'administration ainsi que les parcours clients publics intègrent un double mécanisme de résilience :
  1. Appel réseau vers `https://backend-decofleursplus-staging.up.railway.app/api/v1`
  2. En cas d'indisponibilité temporaire du serveur distant ou d'erreur réseau, bascule instantanée et silencieuse sur les données locales avec notification discrète à l'utilisateur (`toast.warning('Chargement en mode hors-ligne')`).
  3. Chaque vue propose un bouton **« Actualiser »** avec indicateur de rotation pour forcer la synchronisation avec le serveur.

---

## 4. Note sur l'Environnement Staging (Railway)

| Environnement | Branche Git | URL de Base | État Actuel |
|---|---|---|---|
| **Staging Railway** | `staging` | `https://backend-decofleursplus-staging.up.railway.app/api/v1` | Actif (Synchronisé avec la branche `staging`) |
| **Local Backend** | `staging` | `http://localhost:5000/api/v1` | Prêt et documenté |

---

## 5. Système de Notifications In-App — Module Complet Manquant

> **Priorité : 🟠 MOYENNE — À implémenter après le MVP mais avant la mise en production**
> **Date d'audit : 2026-11-03**

### 5.1 Constat Actuel

Le backend DécoFleur Plus ne dispose d'**aucun endpoint, modèle ou table en base de données** pour gérer des notifications in-app. Voici ce qui existe aujourd'hui :

| Élément | État |
|---|---|
| Notification **Settings** (toggles WhatsApp/SMS/Email dans `GET/PUT /admin/settings`) | ✅ Existe |
| Emails **sortants** fire-and-forget (welcome, devis reçu, alerte admin via Resend) | ✅ Existe |
| Inbox notifications **client** (in-app, persistées, lue/non-lue) | ✅ **Implémenté côté Front** (`/compte/notifications` volet Boîte de réception) |
| Inbox notifications **admin** (in-app, persistées, lue/non-lue) | ✅ **Implémenté côté Front** (Menu cloche Topbar avec alertes & badges) |
| Notifications **push manuelles** admin → client(s) | ❌ Non implémenté en backend V1 |
| Préférences notifications **client** (persistées) | ✅ **Implémenté côté Front** (`/compte/notifications` volet Préférences) |
| Page frontend `/compte/notifications` | ✅ **Dynamique** (Boîte de réception + Préférences sauvegardées) |
| Bell icon admin topbar | ✅ **Interactif** (Dropdown popover avec alertes en direct et actions) |

### 5.2 Spécification des Endpoints Requis — Côté Client

#### 5.2.1 Inbox Notifications Client

```http
# Lister les notifications du client connecté (paginées)
GET /api/v1/notifications/mine?page=1&limit=20&unreadOnly=false
Authorization: Bearer <token_client>
# Réponse 200 :
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid-v4",
        "type": "ORDER_STATUS" | "DELIVERY_UPDATE" | "QUOTE_UPDATE" | "PAYMENT" | "SUBSCRIPTION" | "PROMOTION" | "LOYALTY" | "BLOG" | "CUSTOM",
        "title": "Votre commande CMD-2026-0042 est en livraison",
        "message": "Votre livreur Abdou est en route. Livraison estimée à 14h30.",
        "isRead": false,
        "metadata": {
          "orderNumber": "CMD-2026-0042",    // Optionnel — lien contextuel
          "quoteNumber": null,
          "subscriptionNumber": null,
          "productSlug": null,
          "articleSlug": null
        },
        "createdAt": "2026-11-03T14:22:00Z"
      }
    ],
    "pagination": { "total": 47, "page": 1, "limit": 20, "totalPages": 3 },
    "unreadCount": 5
  }
}
```

```http
# Compter les notifications non-lues (pour le badge)
GET /api/v1/notifications/mine/unread-count
Authorization: Bearer <token_client>
# Réponse 200 :
{ "success": true, "data": { "unreadCount": 5 } }
```

```http
# Marquer une notification comme lue
PATCH /api/v1/notifications/mine/:notificationId/read
Authorization: Bearer <token_client>
# Réponse 200 :
{ "success": true, "data": { "id": "uuid", "isRead": true } }
```

```http
# Marquer toutes les notifications comme lues
POST /api/v1/notifications/mine/read-all
Authorization: Bearer <token_client>
# Réponse 200 :
{ "success": true, "data": { "updatedCount": 5 } }
```

#### 5.2.2 Préférences de Notification Client

```http
# Récupérer les préférences de notification du client
GET /api/v1/notifications/mine/preferences
Authorization: Bearer <token_client>
# Réponse 200 :
{
  "success": true,
  "data": {
    "smsEnabled": true,
    "whatsappEnabled": true,
    "emailEnabled": true,
    "orderUpdates": true,
    "deliveryUpdates": true,
    "promotions": true,
    "loyaltyAlerts": true,
    "blogNewArticles": false,
    "subscriptionReminders": true
  }
}
```

```http
# Mettre à jour les préférences de notification du client
PUT /api/v1/notifications/mine/preferences
Authorization: Bearer <token_client>
Content-Type: application/json
{
  "smsEnabled": true,
  "whatsappEnabled": true,
  "emailEnabled": true,
  "orderUpdates": true,
  "deliveryUpdates": true,
  "promotions": false,
  "loyaltyAlerts": true,
  "blogNewArticles": false,
  "subscriptionReminders": true
}
# Réponse 200 :
{ "success": true, "data": { ...préférences mises à jour... } }
```

### 5.3 Spécification des Endpoints Requis — Côté Admin

#### 5.3.1 Inbox Notifications Admin

```http
# Lister les notifications admin (paginées)
GET /api/v1/admin/notifications?page=1&limit=20&unreadOnly=false&type=ORDER_STATUS
Authorization: Bearer <token_admin>
# Réponse 200 :
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid-v4",
        "type": "NEW_ORDER" | "PAYMENT_RECEIVED" | "PAYMENT_FAILED" | "NEW_QUOTE" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEW_SUBSCRIPTION" | "SUBSCRIPTION_CANCELLED" | "DELIVERY_FAILED" | "CUSTOM",
        "title": "Nouvelle commande CMD-2026-0043",
        "message": "Commande de 3 articles pour 45 000 FCFA — Client: Marie Diop",
        "isRead": false,
        "priority": "NORMAL" | "HIGH" | "URGENT",
        "metadata": {
          "orderNumber": "CMD-2026-0043",
          "customerId": "uuid-customer",
          "amount": 45000
        },
        "createdAt": "2026-11-03T15:10:00Z"
      }
    ],
    "pagination": { "total": 128, "page": 1, "limit": 20, "totalPages": 7 },
    "unreadCount": 12
  }
}
```

```http
# Compter les notifications admin non-lues (pour le badge topbar)
GET /api/v1/admin/notifications/unread-count
Authorization: Bearer <token_admin>
# Réponse 200 :
{ "success": true, "data": { "unreadCount": 12 } }
```

```http
# Marquer une notification admin comme lue
PATCH /api/v1/admin/notifications/:notificationId/read
Authorization: Bearer <token_admin>
# Réponse 200 :
{ "success": true, "data": { "id": "uuid", "isRead": true } }
```

```http
# Marquer toutes les notifications admin comme lues
POST /api/v1/admin/notifications/read-all
Authorization: Bearer <token_admin>
# Réponse 200 :
{ "success": true, "data": { "updatedCount": 12 } }
```

#### 5.3.2 Envoi de Notifications Manuelles (Admin → Client(s))

```http
# Envoyer une notification ciblée à un ou plusieurs clients
POST /api/v1/admin/notifications/send
Authorization: Bearer <token_admin>
Content-Type: application/json
{
  "title": "🌸 Promotion exclusive ce week-end !",
  "message": "Profitez de -25% sur tous les bouquets ronds avec le code WEEKEND25",
  "target": {
    "type": "ALL" | "SEGMENT" | "INDIVIDUAL",
    "segment": "vip",                         // Si type = SEGMENT
    "customerIds": ["uuid-1", "uuid-2"]       // Si type = INDIVIDUAL
  },
  "channels": ["IN_APP", "SMS", "WHATSAPP", "EMAIL"],
  "scheduledAt": null                          // null = envoi immédiat, sinon ISO 8601
}
# Réponse 201 :
{
  "success": true,
  "data": {
    "id": "uuid-broadcast",
    "recipientCount": 42,
    "status": "SENT" | "SCHEDULED",
    "sentAt": "2026-11-03T16:00:00Z"
  }
}
```

```http
# Historique des notifications manuelles envoyées
GET /api/v1/admin/notifications/broadcasts?page=1&limit=20
Authorization: Bearer <token_admin>
# Réponse 200 :
{
  "success": true,
  "data": {
    "broadcasts": [
      {
        "id": "uuid-broadcast",
        "title": "🌸 Promotion exclusive ce week-end !",
        "target": { "type": "ALL" },
        "recipientCount": 42,
        "channels": ["IN_APP", "SMS"],
        "status": "SENT",
        "sentAt": "2026-11-03T16:00:00Z",
        "createdBy": "uuid-admin-user"
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

### 5.4 Événements Déclencheurs (Automatiques)

Le backend doit créer automatiquement une notification in-app lors de chaque événement ci-dessous, **en respectant les préférences du client** (section 5.2.2) et les **settings admin** (section existante `GET/PUT /admin/settings`) :

| Événement Métier | Type Notification Client | Type Notification Admin | Priorité |
|---|---|---|---|
| Nouvelle commande créée | `ORDER_STATUS` | `NEW_ORDER` | NORMAL |
| Paiement reçu (webhook NabooPay) | `PAYMENT` | `PAYMENT_RECEIVED` | NORMAL |
| Paiement échoué | `PAYMENT` | `PAYMENT_FAILED` | HIGH |
| Commande confirmée | `ORDER_STATUS` | — | NORMAL |
| Commande en préparation | `ORDER_STATUS` | — | NORMAL |
| Commande prête / en livraison | `ORDER_STATUS` | — | NORMAL |
| Commande livrée | `ORDER_STATUS` | — | NORMAL |
| Commande annulée | `ORDER_STATUS` | — | HIGH |
| Livreur assigné | `DELIVERY_UPDATE` | — | NORMAL |
| Livreur en route | `DELIVERY_UPDATE` | — | NORMAL |
| Livraison effectuée | `DELIVERY_UPDATE` | — | NORMAL |
| Échec de livraison | `DELIVERY_UPDATE` | `DELIVERY_FAILED` | URGENT |
| Nouveau devis reçu | — | `NEW_QUOTE` | NORMAL |
| Devis chiffré envoyé au client | `QUOTE_UPDATE` | — | NORMAL |
| Devis accepté par le client | `QUOTE_UPDATE` | `NEW_QUOTE` | NORMAL |
| Devis refusé | `QUOTE_UPDATE` | — | NORMAL |
| Remboursement effectué | `PAYMENT` | — | HIGH |
| Stock bas (seuil atteint) | — | `LOW_STOCK` | HIGH |
| Rupture de stock | — | `OUT_OF_STOCK` | URGENT |
| Prochain passage abonnement | `SUBSCRIPTION` | — | NORMAL |
| Abonnement suspendu/repris/annulé | `SUBSCRIPTION` | `SUBSCRIPTION_CANCELLED` | NORMAL |
| Nouvel abonnement souscrit | — | `NEW_SUBSCRIPTION` | NORMAL |
| Nouvelle promotion activée | `PROMOTION` | — | NORMAL |
| Code promo personnalisé attribué | `PROMOTION` | — | NORMAL |
| Passage niveau fidélité | `LOYALTY` | — | NORMAL |
| Points de fidélité gagnés | `LOYALTY` | — | NORMAL |
| Nouvel article blog publié | `BLOG` | — | NORMAL |

### 5.5 Modèle de Données Suggéré (Prisma)

```prisma
model Notification {
  id          String    @id @default(uuid())
  userId      String                          // Référence au User (client ou admin)
  type        NotificationType
  title       String
  message     String
  isRead      Boolean   @default(false)
  priority    NotificationPriority @default(NORMAL)
  metadata    Json?                           // Données contextuelles (orderNumber, etc.)
  createdAt   DateTime  @default(now())
  readAt      DateTime?

  user        User      @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@index([userId, createdAt(sort: Desc)])
}

model NotificationPreference {
  id                    String   @id @default(uuid())
  customerId            String   @unique
  smsEnabled            Boolean  @default(true)
  whatsappEnabled       Boolean  @default(true)
  emailEnabled          Boolean  @default(true)
  orderUpdates          Boolean  @default(true)
  deliveryUpdates       Boolean  @default(true)
  promotions            Boolean  @default(true)
  loyaltyAlerts         Boolean  @default(true)
  blogNewArticles       Boolean  @default(false)
  subscriptionReminders Boolean  @default(true)
  updatedAt             DateTime @updatedAt

  customer              Customer @relation(fields: [customerId], references: [id])
}

model NotificationBroadcast {
  id              String   @id @default(uuid())
  title           String
  message         String
  targetType      BroadcastTarget            // ALL, SEGMENT, INDIVIDUAL
  targetSegment   String?
  targetCustomers String[]                   // Array of customer UUIDs
  channels        String[]                   // IN_APP, SMS, WHATSAPP, EMAIL
  recipientCount  Int
  status          BroadcastStatus            // SENT, SCHEDULED, FAILED
  scheduledAt     DateTime?
  sentAt          DateTime?
  createdBy       String                     // Admin user UUID
  createdAt       DateTime @default(now())
}

enum NotificationType {
  ORDER_STATUS
  DELIVERY_UPDATE
  QUOTE_UPDATE
  PAYMENT
  SUBSCRIPTION
  PROMOTION
  LOYALTY
  BLOG
  CUSTOM
}

enum NotificationPriority {
  NORMAL
  HIGH
  URGENT
}

enum BroadcastTarget {
  ALL
  SEGMENT
  INDIVIDUAL
}

enum BroadcastStatus {
  SENT
  SCHEDULED
  FAILED
}
```

### 5.6 Stratégie Frontend (Polling)

- **Polling interval** : Le frontend interrogera `GET /notifications/mine/unread-count` toutes les **30 secondes** pour mettre à jour le badge de la bell icon (client et admin).
- **Chargement complet** : La liste paginée est chargée à la demande quand l'utilisateur clique sur la bell icon (dropdown) ou navigue vers la page notifications.
- **Évolution future** : Prévoir la possibilité de migrer vers des WebSockets ou Server-Sent Events (SSE) pour du temps réel sans polling.

### 5.7 Récapitulatif des 12 Endpoints à Implémenter

| # | Méthode | Route | Scope | Description |
|---|---|---|---|---|
| 1 | `GET` | `/notifications/mine` | Client | Lister les notifications (paginées) |
| 2 | `GET` | `/notifications/mine/unread-count` | Client | Compteur non-lues (badge) |
| 3 | `PATCH` | `/notifications/mine/:id/read` | Client | Marquer une notification comme lue |
| 4 | `POST` | `/notifications/mine/read-all` | Client | Marquer toutes comme lues |
| 5 | `GET` | `/notifications/mine/preferences` | Client | Récupérer les préférences |
| 6 | `PUT` | `/notifications/mine/preferences` | Client | Mettre à jour les préférences |
| 7 | `GET` | `/admin/notifications` | Admin | Lister les notifications admin (paginées) |
| 8 | `GET` | `/admin/notifications/unread-count` | Admin | Compteur non-lues admin (badge topbar) |
| 9 | `PATCH` | `/admin/notifications/:id/read` | Admin | Marquer une notification admin comme lue |
| 10 | `POST` | `/admin/notifications/read-all` | Admin | Marquer toutes admin comme lues |
| 11 | `POST` | `/admin/notifications/send` | Admin | Envoyer une notification manuelle ciblée |
| 12 | `GET` | `/admin/notifications/broadcasts` | Admin | Historique des envois manuels |

