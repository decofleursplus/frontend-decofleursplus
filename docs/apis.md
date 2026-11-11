# 📡 Recensement Exhaustif des APIs — DécoFleur Plus (Branche staging)

**Version backend :** Staging (Branch `staging`, Commit `57d32f0` / PR #8 & #9)  
**Base URL Staging :** `https://backend-decofleursplus-staging.up.railway.app/api/v1`  
**Base URL Local :** `http://localhost:5000/api/v1`  
**Swagger UI :** `/api/docs` | **Spécification OpenAPI :** `/api/docs/openapi.json`  
**Total des endpoints recensés :** 166 (59 Client / Public + 107 Admin / Staff)  

---

## 📑 Sommaire

1. [Conventions Générales](#1-conventions-générales)
2. [APIs Client & Public (59 endpoints)](#2-apis-client--public-59-endpoints)
   - 2.1 [Système & Santé (1)](#21-système--santé)
   - 2.2 [Authentification Client (6)](#22-authentification-client)
   - 2.3 [Catalogue Public & Avis (6)](#23-catalogue-public--avis)
   - 2.4 [Devis Événementiels (3)](#24-devis-événementiels)
   - 2.5 [Commandes & Panier (6)](#25-commandes--panier)
   - 2.6 [Livraisons & Suivi Colis (1)](#26-livraisons--suivi-colis)
   - 2.7 [Paiements & Webhooks (3)](#27-paiements--webhooks)
   - 2.8 [Location de Matériel (5)](#28-location-de-matériel)
   - 2.9 [Espace Client & Profil (8)](#29-espace-client--profil)
   - 2.10 [Marketing & Promotions (2)](#210-marketing--promotions)
   - 2.11 [Blog Floral Public (5)](#211-blog-floral-public)
   - 2.12 [Abonnements Floraux (7)](#212-abonnements-floraux)
   - 2.13 [Notifications In-App Client (6)](#213-notifications-in-app-client)
3. [APIs Admin & Back-Office (107 endpoints)](#3-apis-admin--back-office-107-endpoints)
   - 3.1 [Médias & Uploads (1)](#31-médias--uploads)
   - 3.2 [Catalogue & Catégories (11)](#32-catalogue--catégories)
   - 3.3 [Stock & Inventaire (3)](#33-stock--inventaire)
   - 3.4 [Devis Admin (4)](#34-devis-admin)
   - 3.5 [Commandes Admin (4)](#35-commandes-admin)
   - 3.6 [Zones de Livraison Admin (4)](#36-zones-de-livraison-admin)
   - 3.7 [Livraisons Admin (7)](#37-livraisons-admin)
   - 3.8 [Gestion des Livreurs Admin (5)](#38-gestion-des-livreurs-admin)
   - 3.9 [Espace Livreur Mobile/Course (5)](#39-espace-livreur-mobilecourse)
   - 3.10 [CRM Clients Admin (3)](#310-crm-clients-admin)
   - 3.11 [Tableau de Bord & Rapports Financiers (3)](#311-tableau-de-bord--rapports-financiers)
   - 3.12 [Marketing, Coupons & Relances (19)](#312-marketing-coupons--relances)
   - 3.13 [Blog Éditorial Admin (11)](#313-blog-éditorial-admin)
   - 3.14 [Abonnements Floraux Admin (4)](#314-abonnements-floraux-admin)
   - 3.15 [Location & Matériel Admin (4)](#315-location--matériel-admin)
   - 3.16 [Réservations Location & Gantt (5)](#316-réservations-location--gantt)
   - 3.17 [Paramètres Boutique, Rôles & Collaborateurs (8)](#317-paramètres-boutique-rôles--collaborateurs)
   - 3.18 [Notifications & Diffusions Broadcast Staff (6)](#318-notifications--diffusions-broadcast-staff)
4. [Matrice des Rôles & Accès](#4-matrice-des-rôles--accès)

---

## 1. Conventions Générales

### Enveloppe de Réponse Standard
```json
// Succès (200, 201)
{
  "success": true,
  "data": { ... }
}

// Erreur (400, 401, 403, 404, 409, 500)
{
  "success": false,
  "error": {
    "message": "Description de l'erreur",
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT_ERROR | INTERNAL_SERVER_ERROR",
    "details": [
      { "path": "champ", "message": "Détail de la validation" }
    ]
  }
}
```

### Format des Listes Paginées
```json
{
  "items": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```
Paramètres de requête : `?page=1&limit=20` (max limit : 100).

### Authentification & Tokens
- Format : En-tête HTTP `Authorization: Bearer <jwt_token>`.
- Durée de validité : **7 jours**.
- Le token contient : `userId`, `role`, `email`.

---

## 2. APIs Client & Public (59 endpoints)

### 2.1 Système & Santé

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/health` | État de l'API | 🌐 Public | — | — |

### 2.2 Authentification Client

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Créer un compte client | 🌐 Public | — | JSON (**name**, **email**, **phone**, **password**) |
| `POST` | `/auth/login` | Connexion (email ou téléphone) | 🌐 Public | — | JSON (**identifier**, **password**) |
| `POST` | `/auth/google` | Connexion / Inscription via Google OAuth | 🌐 Public | — | JSON (credential, idToken, email, firstName, lastName, avatar) |
| `POST` | `/auth/forgot-password` | Demande de réinitialisation de mot de passe | 🌐 Public | — | JSON (**email**) |
| `POST` | `/auth/reset-password` | Réinitialisation effective de mot de passe avec token | 🌐 Public | — | JSON (**token**, **newPassword**) |
| `GET` | `/auth/me` | Utilisateur connecté | 🔒 Client JWT | — | — |

### 2.3 Catalogue Public & Avis

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/categories` | Lister les catégories | 🌐 Public | — | — |
| `GET` | `/categories/{slug}` | Détail catégorie | 🌐 Public | — | — |
| `GET` | `/products` | Lister les produits visibles | 🌐 Public | page, limit, category, subCategory, status, featured, search, minPrice, maxPrice, sort | — |
| `GET` | `/products/{slug}` | Détail produit | 🌐 Public | — | — |
| `GET` | `/products/{id}/reviews` | Lister les avis d’un produit (moyenne, pagination) | 🌐 Public | page, limit | — |
| `POST` | `/products/{id}/reviews` | Déposer un avis / note sur un produit | 🌐 Public / JWT optionnel | — | JSON (**rating** [1-5], **comment**, authorName, authorEmail) |

### 2.4 Devis Événementiels

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/quotes` | Soumettre une demande de devis | 🔒 Client JWT | — | **eventType**, eventDate, **location**, budget, **name**, **phone**... |
| `POST` | `/quotes/uploads` | Uploader des images d'inspiration | 🔒 Client JWT | — | FormData (`files`: max 10 images) |
| `GET` | `/quotes/mine` | Mes devis | 🔒 Client JWT | — | — |

### 2.5 Commandes & Panier

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/delivery-zones` | Zones de livraison actives | 🌐 Public | — | — |
| `POST` | `/orders/quote` | Calculer le prix du panier | 🌐 Public | — | **items**, deliveryMode, deliveryZoneId, couponCode |
| `POST` | `/orders` | Passer une commande | 🔒 Client JWT | — | **items**, deliveryMode, deliveryZoneId, couponCode, phone, recipientName... |
| `GET` | `/orders/mine` | Mes commandes | 🔒 Client JWT | page, limit | — |
| `GET` | `/orders/mine/{orderNumber}` | Détail d'une de mes commandes | 🔒 Client JWT | — | — |
| `POST` | `/orders/mine/{orderNumber}/cancel` | Annuler ma commande | 🔒 Client JWT | — | reason |

### 2.6 Livraisons & Suivi Colis

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/orders/mine/{orderNumber}/tracking` | Suivi d'une livraison client | 🔒 Client JWT | — | — |

### 2.7 Paiements & Webhooks

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/orders/mine/{orderNumber}/pay` | Initier ou relancer une session de paiement NabooPay pour une commande | 🔒 Client JWT | — | — |
| `GET` | `/orders/mine/{orderNumber}/payments` | Historique des transactions de paiement pour une commande | 🔒 Client JWT | — | — |
| `POST` | `/webhooks/naboopay` | Webhook de notification des paiements NabooPay | 🌐 Public | — | **order_id**, **transaction_status** |

### 2.8 Location de Matériel

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/rentals` | Lister le matériel de location disponible | 🌐 Public | category, search, from, to | — |
| `GET` | `/rentals/categories` | Lister les catégories de location | 🌐 Public | — | — |
| `GET` | `/rentals/{slug}` | Détail d’un équipement de location | 🌐 Public | category, search, from, to | — |
| `POST` | `/rentals/check-availability` | Vérifier la disponibilité d’un ensemble d’équipements sur une période | 🌐 Public | — | **items**, **startDate**, **endDate** |
| `POST` | `/rentals/reservations` | Effectuer une demande de réservation de location (client) | 🌐 Public | — | **equipmentId**, **quantity**, **startDate**, **endDate**, **clientName**, **clientPhone**... |

### 2.9 Espace Client & Profil

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/customers/me` | Consulter mon profil client | 🔒 Client JWT | — | — |
| `PATCH` | `/customers/me` | Mettre à jour mes informations personnelles | 🔒 Client JWT | — | firstName, lastName, phone, avatar |
| `PATCH` | `/customers/me/password` | Modifier mon mot de passe | 🔒 Client JWT | — | **currentPassword**, **newPassword** |
| `GET` | `/customers/me/addresses` | Lister mes adresses enregistrées | 🔒 Client JWT | — | — |
| `POST` | `/customers/me/addresses` | Ajouter une nouvelle adresse | 🔒 Client JWT | — | **name**, **street**, **city**, **phone**, isDefault |
| `PATCH` | `/customers/me/addresses/{id}` | Modifier une adresse existante | 🔒 Client JWT | — | name, street, city, phone, isDefault |
| `DELETE` | `/customers/me/addresses/{id}` | Supprimer une adresse | 🔒 Client JWT | — | — |
| `POST` | `/customers/me/addresses/{id}/default` | Définir une adresse par défaut | 🔒 Client JWT | — | — |

### 2.10 Marketing & Promotions

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/coupons/validate` | Valider un code promo (panier / checkout) | 🌐 Public | — | `ValidateCouponRequest` |
| `GET` | `/promotions/active` | Liste des promotions actives (vitrine / bannières) | 🌐 Public | — | — |

### 2.11 Blog Floral Public

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/blog/articles` | Lister les articles de blog publiés | 🌐 Public | page, limit, search, categorySlug, authorId, tag, isFeatured | — |
| `GET` | `/blog/articles/{slug}` | Consulter un article de blog publié | 🌐 Public | — | — |
| `POST` | `/blog/articles/{slug}/like` | Aimer / liker un article de blog | 🌐 Public | — | — |
| `GET` | `/blog/categories` | Lister les catégories du blog | 🌐 Public | — | — |
| `GET` | `/blog/authors` | Lister les auteurs / artisans du blog | 🌐 Public | — | — |

### 2.12 Abonnements Floraux

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/subscriptions/plans` | Lister les formules d’abonnements floraux | 🌐 Public | — | — |
| `POST` | `/subscriptions` | Souscrire à un abonnement floral | 🌐 Public | — | `SubscribeRequest` |
| `GET` | `/subscriptions/mine` | Lister les abonnements du client connecté | 🔒 Client JWT | — | — |
| `GET` | `/subscriptions/mine/{subscriptionNumber}` | Détail d’un abonnement client | 🔒 Client JWT | — | — |
| `PATCH` | `/subscriptions/mine/{subscriptionNumber}/pause` | Suspendre temporairement un abonnement | 🔒 Client JWT | — | — |
| `PATCH` | `/subscriptions/mine/{subscriptionNumber}/resume` | Reprendre un abonnement suspendu | 🔒 Client JWT | — | — |
| `PATCH` | `/subscriptions/mine/{subscriptionNumber}/cancel` | Résilier définitivement un abonnement | 🔒 Client JWT | — | `CancelSubscriptionRequest` |

### 2.13 Notifications In-App Client

| Méthode | Route | Description | Auth | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/notifications/mine` | Lister mes notifications in-app | 🔒 Client JWT | page, limit, unreadOnly | — |
| `GET` | `/notifications/mine/unread-count` | Nombre de notifications non lues | 🔒 Client JWT | — | — |
| `PATCH` | `/notifications/mine/{id}/read` | Marquer une notification comme lue | 🔒 Client JWT | — | — |
| `POST` | `/notifications/mine/read-all` | Marquer toutes mes notifications comme lues | 🔒 Client JWT | — | — |
| `GET` | `/notifications/mine/preferences` | Consulter mes préférences de notification | 🔒 Client JWT | — | — |
| `PUT` | `/notifications/mine/preferences` | Mettre à jour mes préférences de notification | 🔒 Client JWT | — | `UpdateNotificationPreferencesRequest` |

---

## 3. APIs Admin & Back-Office (107 endpoints)

### 3.1 Médias & Uploads

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/admin/uploads` | Uploader des images catalogue | `ADMIN, MANAGER` | **folder** | FormData (`files`: max 10 images) |

### 3.2 Catalogue & Catégories (Admin)

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `POST` | `/admin/categories` | Créer une catégorie | `ADMIN, MANAGER` | — | **name**, slug, description, imageUrl |
| `PATCH` | `/admin/categories/{id}` | Modifier une catégorie | `ADMIN, MANAGER` | — | name, slug, description, imageUrl |
| `DELETE` | `/admin/categories/{id}` | Supprimer une catégorie | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/subcategories` | Créer une sous-catégorie | `ADMIN, MANAGER` | — | **categoryId**, **name**, slug, description |
| `PATCH` | `/admin/subcategories/{id}` | Modifier une sous-catégorie | `ADMIN, MANAGER` | — | categoryId, name, slug, description |
| `DELETE` | `/admin/subcategories/{id}` | Supprimer une sous-catégorie | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/products` | Lister tous les produits | `ADMIN, MANAGER` | page, limit, category, subCategory, status, featured, search, minPrice, maxPrice, sort | — |
| `POST` | `/admin/products` | Créer un produit | `ADMIN, MANAGER` | — | **categoryId**, subCategoryId, **name**, slug, **description**, **basePrice**... |
| `GET` | `/admin/products/{id}` | Détail produit (admin) | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/products/{id}` | Modifier un produit | `ADMIN, MANAGER` | — | categoryId, subCategoryId, name, slug, description, basePrice... |
| `DELETE` | `/admin/products/{id}` | Masquer un produit | `ADMIN, MANAGER` | — | — |

### 3.3 Stock & Inventaire (Admin)

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/inventory` | État du stock | `ADMIN, MANAGER` | lowStock | — |
| `POST` | `/admin/inventory/{variantId}/movements` | Ajuster le stock | `ADMIN, MANAGER` | — | **type**, **quantity**, **reason** |
| `GET` | `/admin/stock-movements` | Historique des mouvements | `ADMIN, MANAGER` | variantId, limit | — |

### 3.4 Devis Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/quotes` | Lister les devis | `ADMIN, MANAGER` | page, limit, status, search, from, to | — |
| `GET` | `/admin/quotes/{id}` | Détail devis | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/quotes/{id}` | Modifier un devis | `ADMIN, MANAGER` | — | adminNotes, quotedAmount, estimatedGuests, eventDate, eventLocation, budgetRange |
| `PATCH` | `/admin/quotes/{id}/status` | Changer le statut | `ADMIN, MANAGER` | — | **status**, quotedAmount |

### 3.5 Commandes Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/orders` | Lister les commandes | `ADMIN, MANAGER` | page, limit, status, paymentStatus, search, from, to | — |
| `GET` | `/admin/orders/{id}` | Détail commande | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/orders/{id}` | Modifier notes / créneau | `ADMIN, MANAGER` | — | adminNotes, deliveryDate, timeSlot |
| `PATCH` | `/admin/orders/{id}/status` | Changer le statut | `ADMIN, MANAGER` | — | **status**, note, cancelReason |

### 3.6 Zones de Livraison Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/delivery-zones` | Toutes les zones | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/delivery-zones` | Créer une zone | `ADMIN, MANAGER` | — | **name**, slug, coverage, **fee**, **expressFee**, freeAbove... |
| `PATCH` | `/admin/delivery-zones/{id}` | Modifier une zone | `ADMIN, MANAGER` | — | name, slug, coverage, fee, expressFee, freeAbove... |
| `DELETE` | `/admin/delivery-zones/{id}` | Supprimer une zone | `ADMIN, MANAGER` | — | — |

### 3.7 Livraisons Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/deliveries` | Lister les livraisons avec compteurs par statut | `ADMIN, MANAGER` | page, limit, status, driverId, date, search | — |
| `GET` | `/admin/deliveries/{id}` | Détail d'une livraison | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/deliveries/{id}` | Modifier les détails de livraison (notes, créneau, date) | `ADMIN, MANAGER` | — | notes, scheduledDate, timeSlot |
| `POST` | `/admin/deliveries/{id}/assign` | Assigner ou réassigner un livreur | `ADMIN, MANAGER` | — | **driverId**, timeSlot, scheduledDate, note |
| `POST` | `/admin/deliveries/{id}/start` | Forcer la prise en charge de la livraison (IN_PROGRESS) | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/deliveries/{id}/complete` | Marquer la livraison comme effectuée (DELIVERED) | `ADMIN, MANAGER` | — | **recipientName**, notes |
| `POST` | `/admin/deliveries/{id}/fail` | Marquer la livraison en échec (FAILED) | `ADMIN, MANAGER` | — | **reason** |

### 3.8 Gestion des Livreurs Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/drivers` | Lister les livreurs | `ADMIN, MANAGER` | includeInactive | — |
| `POST` | `/admin/drivers` | Ajouter un livreur | `ADMIN, MANAGER` | — | **name**, **phone**, vehicle, vehiclePlate, availability, rating... |
| `GET` | `/admin/drivers/{id}` | Détail d'un livreur | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/drivers/{id}` | Modifier un livreur | `ADMIN, MANAGER` | — | name, phone, vehicle, vehiclePlate, availability, rating... |
| `DELETE` | `/admin/drivers/{id}` | Supprimer un livreur (ou le désactiver si des livraisons lui sont rattachées) | `ADMIN, MANAGER` | — | — |

### 3.9 Espace Livreur Mobile/Course

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/driver/deliveries` | Mes courses assignées | `DELIVERY` | page, limit, status, date, search | — |
| `GET` | `/driver/deliveries/{id}` | Détail d'une de mes courses | `DELIVERY` | — | — |
| `POST` | `/driver/deliveries/{id}/start` | Prendre en charge la livraison | `DELIVERY` | — | — |
| `POST` | `/driver/deliveries/{id}/complete` | Marquer la livraison comme effectuée | `DELIVERY` | — | **recipientName**, notes |
| `POST` | `/driver/deliveries/{id}/fail` | Signaler un échec de livraison | `DELIVERY` | — | **reason** |

### 3.10 CRM Clients Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/customers` | Lister les clients avec statistiques CRM | `ADMIN, MANAGER` | search, segment, status, minSpent, sort, page, limit | — |
| `GET` | `/admin/customers/{id}` | Fiche détaillée d un client CRM | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/customers/{id}` | Mettre à jour le segment, statut ou notes CRM | `ADMIN, MANAGER` | — | name, phone, address, avatar, segment, loyaltyPoints... |

### 3.11 Tableau de Bord & Rapports Financiers

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/dashboard` | Données synthétiques du tableau de bord | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/reports` | Rapport détaillé d activité et comparatif | `ADMIN, MANAGER` | preset, startDate, endDate | — |
| `GET` | `/admin/reports/transactions` | Journal des transactions financières | `ADMIN, MANAGER` | search, paymentMethod, status, page, limit | — |

### 3.12 Marketing, Coupons & Relances

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/marketing/summary` | KPIs et synthèse globale du module marketing | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/marketing/coupons` | Lister les codes promo | `ADMIN, MANAGER` | status, search | — |
| `POST` | `/admin/marketing/coupons` | Créer un code promo | `ADMIN, MANAGER` | — | `CreateCouponRequest` |
| `GET` | `/admin/marketing/coupons/{id}` | Détail d un code promo | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/marketing/coupons/{id}` | Modifier un code promo | `ADMIN, MANAGER` | — | `UpdateCouponRequest` |
| `DELETE` | `/admin/marketing/coupons/{id}` | Supprimer un code promo | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/marketing/promotions` | Lister les promotions catalogue | `ADMIN, MANAGER` | status, search | — |
| `POST` | `/admin/marketing/promotions` | Créer une promotion catalogue | `ADMIN, MANAGER` | — | `CreatePromotionRequest` |
| `PATCH` | `/admin/marketing/promotions/{id}` | Modifier une promotion catalogue | `ADMIN, MANAGER` | — | `UpdatePromotionRequest` |
| `DELETE` | `/admin/marketing/promotions/{id}` | Supprimer une promotion catalogue | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/marketing/campaigns` | Lister les campagnes marketing | `ADMIN, MANAGER` | channel, search | — |
| `POST` | `/admin/marketing/campaigns` | Créer une campagne marketing | `ADMIN, MANAGER` | — | `CreateCampaignRequest` |
| `PATCH` | `/admin/marketing/campaigns/{id}` | Modifier une campagne marketing | `ADMIN, MANAGER` | — | `UpdateCampaignRequest` |
| `DELETE` | `/admin/marketing/campaigns/{id}` | Supprimer une campagne marketing | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/marketing/campaigns/{id}/send` | Envoyer ou diffuser une campagne marketing | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/marketing/abandoned-carts` | Lister les paniers abandonnés | `ADMIN, MANAGER` | status, search | — |
| `POST` | `/admin/marketing/abandoned-carts/{id}/remind` | Envoyer une relance pour un panier abandonné | `ADMIN, MANAGER` | — | channel |
| `GET` | `/admin/marketing/abandoned-carts/settings` | Paramètres de relance automatique des paniers | `ADMIN, MANAGER` | — | — |
| `PUT` | `/admin/marketing/abandoned-carts/settings` | Mettre à jour les paramètres de relance des paniers | `ADMIN, MANAGER` | — | `UpdateCartRecoverySettingsRequest` |

### 3.13 Blog Éditorial Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/blog/articles` | Lister tous les articles (tous statuts) | `ADMIN, MANAGER` | page, limit, search, categorySlug, authorId, status, isFeatured | — |
| `POST` | `/admin/blog/articles` | Créer un nouvel article de blog | `ADMIN, MANAGER` | — | `CreateBlogArticleRequest` |
| `GET` | `/admin/blog/articles/{id}` | Consulter un article pour édition | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/blog/articles/{id}` | Modifier un article de blog | `ADMIN, MANAGER` | — | `UpdateBlogArticleRequest` |
| `DELETE` | `/admin/blog/articles/{id}` | Supprimer un article de blog | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/blog/categories` | Créer une catégorie de blog | `ADMIN, MANAGER` | — | `CreateBlogCategoryRequest` |
| `PATCH` | `/admin/blog/categories/{id}` | Modifier une catégorie de blog | `ADMIN, MANAGER` | — | `UpdateBlogCategoryRequest` |
| `DELETE` | `/admin/blog/categories/{id}` | Supprimer une catégorie de blog | `ADMIN, MANAGER` | — | — |
| `POST` | `/admin/blog/authors` | Créer un profil auteur de blog | `ADMIN, MANAGER` | — | `CreateBlogAuthorRequest` |
| `PATCH` | `/admin/blog/authors/{id}` | Modifier un profil auteur de blog | `ADMIN, MANAGER` | — | `UpdateBlogAuthorRequest` |
| `DELETE` | `/admin/blog/authors/{id}` | Supprimer un profil auteur de blog | `ADMIN, MANAGER` | — | — |

### 3.14 Abonnements Floraux Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/subscriptions` | Lister tous les abonnements (Admin) | `ADMIN, MANAGER` | page, limit, search, status, plan, frequency | — |
| `GET` | `/admin/subscriptions/{id}` | Détail d’un abonnement (Admin) | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/subscriptions/{id}/status` | Modifier le statut d’un abonnement (Admin) | `ADMIN, MANAGER` | — | `AdminUpdateSubscriptionStatusRequest` |
| `PATCH` | `/admin/subscriptions/deliveries/{deliveryId}` | Mettre à jour un passage de livraison d’abonnement | `ADMIN, MANAGER` | — | `AdminUpdateDeliveryRequest` |

### 3.15 Location & Matériel Admin

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/rentals` | Lister tous les équipements (admin) | `ADMIN, MANAGER` | category, search, from, to | — |
| `POST` | `/admin/rentals` | Créer un équipement de location | `ADMIN, MANAGER` | — | **name**, slug, **category**, categoryLabel, **pricePerDay**, **depositAmount**... |
| `PATCH` | `/admin/rentals/{id}` | Modifier un équipement | `ADMIN, MANAGER` | — | name, slug, category, categoryLabel, pricePerDay, depositAmount... |
| `DELETE` | `/admin/rentals/{id}` | Supprimer ou désactiver un équipement | `ADMIN, MANAGER` | — | — |

### 3.16 Réservations Location & Gantt

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/rental-reservations` | Lister les réservations avec compteurs par statut | `ADMIN, MANAGER` | equipmentId, status, search, from, to | — |
| `GET` | `/admin/rental-reservations/gantt` | Vue calendrier Gantt des réservations et disponibilités | `ADMIN, MANAGER` | month, **year**, category | — |
| `GET` | `/admin/rental-reservations/{id}` | Détail d’une réservation | `ADMIN, MANAGER` | — | — |
| `PATCH` | `/admin/rental-reservations/{id}` | Mettre à jour les notes d’une réservation | `ADMIN, MANAGER` | — | notes, adminNotes |
| `PATCH` | `/admin/rental-reservations/{id}/status` | Changer le statut d’une réservation | `ADMIN, MANAGER` | — | **status**, adminNotes, cancelReason |

### 3.17 Paramètres Boutique, Rôles & Collaborateurs

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/settings` | Récupérer les paramètres généraux de la boutique | `ADMIN, MANAGER` | — | — |
| `PUT` | `/admin/settings` | Mettre à jour les paramètres généraux de la boutique | `ADMIN, MANAGER` | — | `UpdateShopSettingsRequest` |
| `GET` | `/admin/roles` | Consulter la liste des rôles et la matrice des permissions | `ADMIN, MANAGER` | — | — |
| `GET` | `/admin/users` | Lister les collaborateurs internes (staff) | `ADMIN, MANAGER` | search, role, status | — |
| `POST` | `/admin/users` | Créer un nouveau collaborateur | `ADMIN, MANAGER` | — | `CreateStaffUserRequest` |
| `GET` | `/admin/users/{id}` | Détail d’un collaborateur | `ADMIN, MANAGER` | — | — |
| `PUT` | `/admin/users/{id}` | Mettre à jour un collaborateur | `ADMIN, MANAGER` | — | `UpdateStaffUserRequest` |
| `DELETE` | `/admin/users/{id}` | Supprimer un collaborateur | `ADMIN, MANAGER` | — | — |

### 3.18 Notifications & Diffusions Broadcast Staff

| Méthode | Route | Description | Rôles Autorisés | Paramètres Query | Corps Requête |
|---|---|---|---|---|---|
| `GET` | `/admin/notifications` | Lister toutes les notifications d'activité (staff) | `ADMIN, MANAGER, FLORIST, DELIVERY, SALES, ACCOUNTANT` | page, limit, unreadOnly, type | — |
| `GET` | `/admin/notifications/unread-count` | Nombre d'alertes staff non lues | `ADMIN, MANAGER, FLORIST, DELIVERY, SALES, ACCOUNTANT` | — | — |
| `PATCH` | `/admin/notifications/{id}/read` | Marquer une notification staff comme lue | `ADMIN, MANAGER, FLORIST, DELIVERY, SALES, ACCOUNTANT` | — | — |
| `POST` | `/admin/notifications/read-all` | Tout marquer comme lu pour le staff | `ADMIN, MANAGER, FLORIST, DELIVERY, SALES, ACCOUNTANT` | — | — |
| `POST` | `/admin/notifications/send` | Diffuser une notification broadcast manuelle | `ADMIN, MANAGER` | — | `SendBroadcastNotificationRequest` (**title**, **message**, **target**, channels, scheduledAt) |
| `GET` | `/admin/notifications/broadcasts` | Historique des campagnes de diffusions broadcasts | `ADMIN, MANAGER, FLORIST, DELIVERY, SALES, ACCOUNTANT` | page, limit | — |

---

## 4. Matrice des Rôles & Accès

| Rôle Backend | Nom Français | Périmètre d'Accès Principal | Écran Frontend Correspondant |
|---|---|---|---|
| `CLIENT` | Client boutique | Commandes personnelles, Devis personnels, Adresses, Profil, Abonnements | `/compte/*`, tunnel `/commande` |
| `ADMIN` | Super Administrateur | Accès total sans restriction (système, finances, paramètres, collaborateurs, suppression) | Tout le back-office `/admin/*` |
| `MANAGER` | Gestionnaire Boutique | Catalogue, Commandes, Devis, Stock, Livraisons, CRM, Marketing, Rapports | `/admin/*` (sauf modification paramètres système et suppression staff) |
| `FLORIST` | Fleuriste / Artisan | Catalogue produits, Gestion du stock et mouvements, Suivi des commandes fleurs | `/admin/produits`, `/admin/stock`, `/admin/commandes` |
| `DELIVERY` | Livreur | Espace livreur dédié, liste de ses courses assignées, validation remise colis | Espace livreur mobile, `/admin/livraisons` (lecture) |
| `SALES` | Commercial / Événements | Devis événementiels, CRM clients, Commandes, Marketing, Abonnements | `/admin/devis`, `/admin/clients`, `/admin/marketing`, `/admin/abonnements` |
| `ACCOUNTANT` | Responsable Comptable | Rapports de ventes, Journal des transactions, Paramètres financiers (lecture) | `/admin/rapports`, `/admin/parametres` |
