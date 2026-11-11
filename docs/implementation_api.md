# 📋 Plan d'Implémentation API — DécoFleur Plus (Branche staging)

**Date de début :** 2026-11-03  
**Dernière mise à jour :** 2026-11-11  
**Backend Staging :** `https://backend-decofleursplus-staging.up.railway.app/api/v1`  
**Backend Local :** `http://localhost:5000/api/v1`  
**Version backend :** Commit `57d32f0` (166 endpoints recensés dans `docs/apis.md`)  
**Stratégie globale :** Client d'abord (Phases 0 à 5) → Admin ensuite (Phases 6 à 10) → Recette & Tests (Phase 11) → Nouveautés Backend v1.1 & Espace Compte (Phase 12)  
**Total des tâches :** 49 tâches réparties en 13 phases structurées  

---

## 📑 Sommaire des Phases

### Partie 1 : Espace Public & Client (Phases 0 à 5)
- [Phase 0 : Infrastructure & Client API](#phase-0--infrastructure--client-api) (Tâches 0.1 à 0.3)
- [Phase 1 : Authentification & Espace Client](#phase-1--authentification--espace-client) (Tâches 1.1 à 1.5)
- [Phase 2 : Catalogue Public & Vitrine](#phase-2--catalogue-public--vitrine) (Tâches 2.1 à 2.4)
- [Phase 3 : Panier, Promotions & Devis Événementiels](#phase-3--panier-promotions--devis-événementiels) (Tâches 3.1 à 3.4)
- [Phase 4 : Tunnel de Commande, Livraisons & NabooPay](#phase-4--tunnel-de-commande-livraisons--naboopay) (Tâches 4.1 à 4.5)
- [Phase 5 : Blog Floral & Abonnements Publics](#phase-5--blog-floral--abonnements-publics) (Tâches 5.1 à 5.3)

### Partie 2 : Espace Administration & Back-Office (Phases 6 à 10)
- [Phase 6 : Authentification Admin & Tableau de Bord](#phase-6--authentification-admin--tableau-de-bord) (Tâches 6.1 à 6.3)
- [Phase 7 : Catalogue Admin & Inventaire de Stock](#phase-7--catalogue-admin--inventaire-de-stock) (Tâches 7.1 à 7.4)
- [Phase 8 : Commandes, Devis & Livraisons Admin](#phase-8--commandes-devis--livraisons-admin) (Tâches 8.1 à 8.5)
- [Phase 9 : CRM Clients & Marketing Admin](#phase-9--crm-clients--marketing-admin) (Tâches 9.1 à 9.3)
- [Phase 10 : Blog, Abonnements & Paramètres Boutique](#phase-10--blog-abonnements--paramètres-boutique) (Tâches 10.1 à 10.3)

### Partie 3 : Clôture & Optimisations (Phase 11)
- [Phase 11 : Recette E2E, Nettoyage & Sécurité](#phase-11--recette-e2e-nettoyage--sécurité) (Tâches 11.1 à 11.2)

### Partie 4 : Nouveautés Backend v1.1 & Espace Compte (Phase 12)
- [Phase 12 : Nouvelles APIs Backend (17 endpoints) & Favoris Mon Compte](#phase-12--nouvelles-apis-backend-17-endpoints--favoris-mon-compte) (Tâches 12.1 à 12.5)

---

## Phase 0 : Infrastructure & Client API

### Tâche 0.1 : Variables d'environnement & Configuration Base API
- **Fichiers :** `.env.local`, `.env.example`, `lib/api/config.ts`
- **Endpoints :** `GET /health`
- **Description :** Configurer l'URL de base de l'API avec fallback configurable (`NEXT_PUBLIC_API_URL`, valeur par défaut : `https://backend-decofleursplus-staging.up.railway.app/api/v1`). Ajouter le timeout, les en-têtes standard (`Content-Type: application/json`), et la fonction de healthcheck.
- **Critères d'acceptation :**
  - La variable `NEXT_PUBLIC_API_URL` est documentée dans `.env.example`.
  - Un appel de test sur `/health` retourne `{ success: true, data: { status: "UP" } }`.
- **Statut :** ⬜ À faire

### Tâche 0.2 : Client HTTP générique & Gestionnaire d'erreurs
- **Fichiers :** `lib/api/client.ts`, `lib/api/types.ts`
- **Endpoints :** Tous
- **Description :** Créer un wrapper universel `apiClient` autour de `fetch` gérant : l'injection automatique du token JWT (`Authorization: Bearer`), le formatage de l'enveloppe `{ success, data, error }`, les codes d'erreur backend (`VALIDATION_ERROR`, `UNAUTHORIZED`, `CONFLICT_ERROR`), et la gestion des sessions expirées (redirection / notification).
- **Critères d'acceptation :**
  - Réponses typées avec generics TypeScript `<T>`.
  - En cas de 401, le token invalide est nettoyé et l'utilisateur est déconnecté proprement.
  - Les erreurs de validation Zod (`error.details`) sont propagées de manière lisible pour les formulaires.
- **Statut :** ⬜ À faire

### Tâche 0.3 : Synchronisation du Token JWT & Session
- **Fichiers :** `lib/api/auth-token.ts`, `components/auth-provider.tsx`
- **Endpoints :** Aucun (Infrastructure client)
- **Description :** Centraliser le stockage sécurisé du token JWT (`decofleur_jwt`) et des informations utilisateur. Configurer les helpers d'accès côté client et côté middleware Next.js si requis.
- **Critères d'acceptation :**
  - Le token est persisté et rechargé au refresh de page.
  - La déconnexion supprime immédiatement le token et réinitialise l'état utilisateur.
- **Statut :** ⬜ À faire

---

## Phase 1 : Authentification & Espace Client

### Tâche 1.1 : Connexion & Inscription dynamique
- **Fichiers :** `components/auth-provider.tsx`, `app/connexion/page.tsx`, `app/inscription/page.tsx`, `lib/api/auth.ts`
- **Endpoints :** `POST /auth/register`, `POST /auth/login`
- **Description :** Remplacer le système mock `localStorage` actuel par les vrais appels API backend. Accepter email ou téléphone international dans `POST /auth/login`. Vérifier réellement le mot de passe via bcrypt côté serveur.
- **Critères d'acceptation :**
  - Inscription crée le compte en base avec rôle `CLIENT` et connecte l'utilisateur.
  - Connexion avec mauvais mot de passe affiche un message d'erreur clair.
  - Les boutons sociaux Google/Facebook sont annotés ou désactivés en V1.
- **Statut :** ⬜ À faire

### Tâche 1.2 : Récupération du profil de session & Reconnexion automatique
- **Fichiers :** `lib/api/auth.ts`, `components/auth-provider.tsx`
- **Endpoints :** `GET /auth/me`, `GET /customers/me`
- **Description :** Au chargement de l'application, si un token JWT est présent, valider sa fraîcheur via `GET /auth/me` et charger le profil enrichi via `GET /customers/me`.
- **Critères d'acceptation :**
  - L'état utilisateur (`user`) est immédiatement synchronisé avec la base.
  - Si le token est expiré, la session est invalidée sans crash UI.
- **Statut :** ⬜ À faire

### Tâche 1.3 : Mise à jour du profil client & Mot de passe
- **Fichiers :** `app/compte/informations/page.tsx`, `lib/api/customer.ts`
- **Endpoints :** `PATCH /customers/me`, `PATCH /customers/me/password`
- **Description :** Raccorder le formulaire de profil (nom, prénom, téléphone) et le formulaire de changement de mot de passe (mot de passe actuel + nouveau mot de passe).
- **Critères d'acceptation :**
  - Les modifications de profil sont sauvegardées en base et répercutées dans l'état global.
  - Le changement de mot de passe valide la complexité et confirme la mise à jour.
- **Statut :** ⬜ À faire

### Tâche 1.4 : Carnet d'adresses de livraison du client
- **Fichiers :** `app/compte/adresses/page.tsx`, `lib/api/customer.ts`
- **Endpoints :** `GET /customers/me/addresses`, `POST /customers/me/addresses`, `PATCH /customers/me/addresses/:id`, `DELETE /customers/me/addresses/:id`, `POST /customers/me/addresses/:id/default`
- **Description :** Remplacer les adresses factices par le carnet d'adresses réel de l'utilisateur. Permettre l'ajout, la modification, la suppression et la sélection de l'adresse par défaut.
- **Critères d'acceptation :**
  - La liste affiche les adresses réelles du compte.
  - La première adresse créée est automatiquement définie par défaut.
- **Statut :** ⬜ À faire

### Tâche 1.5 : Programme de Fidélité & Statistiques
- **Fichiers :** `app/compte/fidelite/page.tsx`, `app/compte/page.tsx`
- **Endpoints :** `GET /customers/me`
- **Description :** Afficher les points de fidélité réels, le niveau atteint (`Bronze`, `Silver`, `Gold`, `Platinum`), les dépenses cumulées et le nombre total de commandes.
- **Critères d'acceptation :**
  - La jauge de niveau et le solde de points reflètent exactement les données de `data.customer.loyaltyPoints`.
- **Statut :** ⬜ À faire

---

## Phase 2 : Catalogue Public & Vitrine

### Tâche 2.1 : Service API Catalogue
- **Fichiers :** `lib/api/catalog.ts`, `lib/types/catalog.ts`
- **Endpoints :** `GET /categories`, `GET /categories/:slug`, `GET /products`, `GET /products/:slug`
- **Description :** Définir les fonctions client pour interroger les catégories et produits avec filtres (recherche, sous-catégories, minPrice, maxPrice, sort, featured, pagination). Adapter les formats de données pour compatibilité avec les composants front.
- **Critères d'acceptation :**
  - Typage strict des réponses backend (avec `variants`, `sizes`, `compareAtPrice`).
- **Statut :** ⬜ À faire

### Tâche 2.2 : Page d'accueil dynamique
- **Fichiers :** `app/page.tsx`, `components/featured-products.tsx`, `components/category-slider.tsx`
- **Endpoints :** `GET /products?featured=true&limit=8`, `GET /categories`
- **Description :** Remplacer les données statiques d'accueil par les produits vedettes (`isFeatured: true`) et la liste dynamique des catégories.
- **Critères d'acceptation :**
  - Les 8 bouquets vedettes s'affichent avec leurs prix réels, images R2 et badges promos calculés.
- **Statut :** ⬜ À faire

### Tâche 2.3 : Page Boutique & Filtres avancés
- **Fichiers :** `app/boutique/page.tsx`, `components/product-filters.tsx`, `components/product-grid.tsx`
- **Endpoints :** `GET /products`, `GET /categories`
- **Description :** Dynamiser la grille boutique : pagination, recherche texte, filtre par catégorie/sous-catégorie, filtre par tranche de prix et tri (`newest`, `price_asc`, `price_desc`, `name`).
- **Critères d'acceptation :**
  - Le changement de filtre ou de page déclenche une requête API fluide sans rechargement complet.
  - État vide géré avec message bienveillant si aucun produit ne correspond.
- **Statut :** ⬜ À faire

### Tâche 2.4 : Page Détail Produit
- **Fichiers :** `app/produit/[slug]/page.tsx`, `components/product-details.tsx`
- **Endpoints :** `GET /products/:slug`, `GET /products?category=...&limit=4`
- **Description :** Afficher le produit complet par son slug : galerie d'images, sélection de variante/taille avec delta de prix, affichage du stock disponible, et produits similaires de la même catégorie.
- **Critères d'acceptation :**
  - Si un produit est masqué (`status: HIDDEN`) ou inexistant, la page renvoie un 404 propre.
  - La sélection d'une variante met à jour le prix affiché et injecte le bon `variantId` dans le panier.
- **Statut :** ⬜ À faire

---

## Phase 3 : Panier, Promotions & Devis Événementiels

### Tâche 3.1 : Validation de Code Promo dans le Panier
- **Fichiers :** `app/panier/page.tsx`, `components/cart-summary.tsx`, `lib/api/marketing.ts`
- **Endpoints :** `POST /coupons/validate`
- **Description :** Connecter le champ de code promo du panier à l'endpoint de vérification. Déduire le montant de remise (`discountAmount`) ou offrir la livraison si coupon `free_shipping`.
- **Critères d'acceptation :**
  - Message d'erreur explicite si le coupon est expiré, quota atteint ou sous-total insuffisant.
  - Application visuelle de la réduction dans le récapitulatif du panier.
- **Statut :** ⬜ À faire

### Tâche 3.2 : Bannières de Promotions Actives
- **Fichiers :** `components/promo-banner.tsx`, `lib/api/marketing.ts`
- **Endpoints :** `GET /promotions/active`
- **Description :** Charger les promotions en cours et afficher la bannière promotionnelle en haut du site (ex: « -20% sur tous les bouquets ronds ce week-end »).
- **Critères d'acceptation :**
  - La bannière se masque automatiquement si aucune promotion n'est active.
- **Statut :** ⬜ À faire

### Tâche 3.3 : Formulaire de Devis Événementiel avec Upload d'Images
- **Fichiers :** `app/devis/page.tsx`, `components/devis-form.tsx`, `lib/api/quotes.ts`
- **Endpoints :** `POST /quotes/uploads`, `POST /quotes`
- **Description :** Permettre l'upload d'images d'inspiration directement vers le stockage Cloudflare R2, puis soumettre le devis complet. Si le client est connecté, le devis est automatiquement relié à son compte.
- **Critères d'acceptation :**
  - Affichage de la référence de devis générée (`DEV-AAAA-NNNN`) après soumission réussie.
  - Possibilité de continuer la conversation sur WhatsApp avec la référence pré-remplie.
- **Statut :** ⬜ À faire

### Tâche 3.4 : Espace Client — Mes Devis
- **Fichiers :** `app/compte/devis/page.tsx`, `lib/api/quotes.ts`
- **Endpoints :** `GET /quotes/mine`
- **Description :** Lister les devis soumis par l'utilisateur connecté avec statut en temps réel (`Nouveau`, `En étude`, `Envoyé`, `Accepté`) et montant chiffré dès qu'il est validé par l'équipe.
- **Critères d'acceptation :**
  - Consultation de la fiche de devis avec détail des options et notes.
- **Statut :** ⬜ À faire

---

## Phase 4 : Tunnel de Commande, Livraisons & NabooPay

### Tâche 4.1 : Zones de Livraison & Devis Panier
- **Fichiers :** `app/commande/page.tsx`, `lib/api/orders.ts`
- **Endpoints :** `GET /delivery-zones`, `POST /orders/quote`
- **Description :** Charger les zones de livraison actives (Saly, Mbour, Dakar, Somone...) et leurs tarifs réels (standard, express, gratuit au-delà d'un seuil). Calculer le récapitulatif chiffré serveur via `POST /orders/quote`.
- **Critères d'acceptation :**
  - Les frais de livraison sont calculés dynamiquement selon la zone choisie.
  - Option retrait boutique (`PICKUP`) avec frais à 0 FCFA.
- **Statut :** ✅ Terminé

### Tâche 4.2 : Création de Commande & Passerelle NabooPay (Multi-moyens)
- **Fichiers :** `app/commande/page.tsx`, `lib/api/orders.ts`, `lib/api/payment.ts`
- **Endpoints :** `POST /orders`
- **Description :** Valider la commande avec authentification obligatoire. Envoi strict des données (`items`, `deliveryMode`, `deliveryZoneId`, `paymentMethod`, `deliveryAddress`, etc.). Support complet de 5 modes de paiement :
  - Mobile Money & Carte via passerelle NabooPay (`WAVE`, `ORANGE_MONEY`, `FREE_MONEY`, `CARD`)
  - Espèces à la livraison (`CASH_ON_DELIVERY`)
- **Étapes d'implémentation détaillées :**
  1. Étendre `PlaceOrderPayload` dans `lib/api/orders.ts` pour accepter `'CASH_ON_DELIVERY'`.
  2. Ajouter l'option visuelle "Paiement en espèces à la livraison" dans la liste des modes de paiement de `app/commande/page.tsx`.
  3. Gérer l'aiguillage après soumission réussie :
     - Si paiement digital NabooPay (`checkoutUrl` présent) : redirection immédiate vers `checkoutUrl`.
     - Si paiement en espèces à la livraison : redirection directe vers `/commande/confirmation?orderNumber=${order.orderNumber}`.
  4. Vider le panier (`clear()`) et réinitialiser les coupons en session lors de la commande validée.
- **Critères d'acceptation :**
  - L'utilisateur peut choisir entre Wave, Orange Money, Free Money, Carte bancaire ou Paiement en espèces.
  - Si paiement digital : redirection fluide et sans erreur vers la page de paiement sécurisée NabooPay.
  - Si paiement à la livraison : redirection immédiate vers la page de confirmation sans tentative NabooPay.
  - Le panier est vidé dès que la commande est enregistrée avec succès.
- **Statut :** ✅ Terminé

### Tâche 4.3 : Écrans de Confirmation, Détection Webhook & Relance après Échec
- **Fichiers :** `lib/api/payment.ts`, `app/commande/confirmation/page.tsx`, `app/commande/paiement-echoue/page.tsx`
- **Endpoints :** `GET /orders/mine/:orderNumber`, `POST /orders/mine/:orderNumber/pay`, `GET /orders/mine/:orderNumber/payments`
- **Description :** Créer le module client dédié `lib/api/payment.ts` et moderniser entièrement les écrans de confirmation et d'échec de transaction.
- **Étapes d'implémentation détaillées :**
  1. **Création du client API `lib/api/payment.ts` :**
     - `payOrder(orderNumber: string)` : déclenche `POST /orders/mine/:orderNumber/pay` et retourne `{ checkoutUrl, transactionRef }`.
     - `getOrderPayments(orderNumber: string)` : interroge `GET /orders/mine/:orderNumber/payments` et retourne la liste des transactions (`Payment[]`).
  2. **Page de confirmation `/commande/confirmation` :**
     - Vérification de l'authentification (redirection vers `/connexion?redirect=...` si la session a expiré au retour de passerelle).
     - Chargement des données de commande en temps réel via `getMyOrder(orderNumber)`.
     - **Sondage dynamique (Polling intelligent) :** Si `order.paymentStatus === 'PENDING'` et commande digitale, exécuter un sondage de 3 à 5 tentatives (espacées de 2s) pour capturer la validation asynchrone du webhook NabooPay (`PAID`).
     - Affichage d'un badge d'état réactif : "Paiement en cours de confirmation...", "Payée avec succès" (NabooPay), ou "Commande confirmée — Règlement en espèces à la livraison" (`CASH_ON_DELIVERY`).
     - Bouton de rafraîchissement manuel et bouton de repli pour payer si l'utilisateur avait annulé ou fermé NabooPay prématurément.
  3. **Page d'échec de paiement `/commande/paiement-echoue` :**
     - Prise en charge du paramètre d'URL `?orderNumber=...`.
     - Redirection propre vers `/connexion?redirect=...` si la session a expiré.
     - Chargement des détails de la commande échouée (`GET /orders/mine/:orderNumber`).
     - Affichage pédagogique du motif d'échec ou d'interruption.
     - Bouton d'action principal : « Réessayer le paiement maintenant » qui appelle `payOrder(orderNumber)` et redirige vers le nouveau `checkoutUrl` généré.
     - Actions de secours : Assistance instantanée WhatsApp avec référence pré-remplie, annulation de commande (`cancelMyOrder`), ou retour à la boutique.
- **Critères d'acceptation :**
  - Redirection automatique vers `/connexion` avec retour d'URL si le token a expiré.
  - La page de confirmation se met à jour automatiquement en vert ("Payée avec succès") dès réception du webhook NabooPay.
  - La page d'échec affiche la commande réelle et permet de relancer le paiement en 1 clic sans devoir refaire son panier.
- **Statut :** ✅ Terminé

### Tâche 4.4 : Historique des Commandes & Reprise de Paiement dans l'Espace Client
- **Fichiers :** `app/compte/commandes/page.tsx`, `app/compte/commandes/[id]/page.tsx`, `lib/api/payment.ts`, `lib/api/orders.ts`
- **Endpoints :** `GET /orders/mine`, `GET /orders/mine/:orderNumber`, `POST /orders/mine/:orderNumber/pay`, `GET /orders/mine/:orderNumber/payments`, `POST /orders/mine/:orderNumber/cancel`
- **Description :** Remplacer intégralement les mocks statiques de la fiche commande par les données dynamiques de l'API, avec visualisation des transactions NabooPay et possibilité de régler une commande en attente.
- **Étapes d'implémentation détaillées :**
  1. Dynamiser `app/compte/commandes/[id]/page.tsx` en composant client (suppression de `export const dynamicParams = false` et des données fictives `demoOrders`).
  2. Récupérer la commande via `getMyOrder(orderNumber)` et l'historique des transactions via `getOrderPayments(orderNumber)`.
  3. Pour toute commande ayant `paymentStatus === 'PENDING'` (et non annulée) :
     - Afficher un bloc d'alerte contextuel "Paiement en attente".
     - Bouton interactif « Payer ma commande avec NabooPay » appelant `payOrder` avec état de chargement et redirection automatique.
     - Bouton d'annulation de commande « Annuler la commande » (`POST /cancel`).
  4. Afficher le journal des transactions associées (référence transaction, prestataire NabooPay, méthode utilisée, montant, date et statut).
  5. Mettre à jour les liens de `app/compte/commandes/page.tsx` pour permettre d'ouvrir la fiche détaillée de toute commande.
- **Critères d'acceptation :**
  - Toutes les commandes du client sont consultables avec leurs vraies données.
  - Un client peut reprendre et finaliser le paiement d'une commande passée en attente directement depuis son compte.
  - L'historique des tentatives de transaction NabooPay est clairement affiché.
- **Statut :** ✅ Terminé

### Tâche 4.5 : Suivi de Livraison en Direct
- **Fichiers :** `app/compte/suivi/[id]/page.tsx`, `lib/api/delivery.ts`
- **Endpoints :** `GET /orders/mine/:orderNumber/tracking`
- **Description :** Afficher le parcours de livraison en 4 étapes (`Préparation`, `Prise en charge`, `En cours d'acheminement`, `Livré`), avec les informations du livreur assigné et l'heure estimée.
- **Critères d'acceptation :**
  - Synchronisation de la barre de progression avec le statut réel de la livraison.
- **Statut :** ⬜ À faire

---

## Phase 5 : Blog Floral & Abonnements Publics

### Tâche 5.1 : Consultation du Blog Floral & Likes
- **Fichiers :** `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/api/blog.ts`
- **Endpoints :** `GET /blog/articles`, `GET /blog/articles/:slug`, `POST /blog/articles/:slug/like`, `GET /blog/categories`, `GET /blog/authors`
- **Description :** Dynamiser le flux d'articles, la recherche par mots-clés, le filtre par catégorie et étiquette, la lecture d'un article avec temps de lecture et articles recommandés, et le bouton like sans authentification.
- **Critères d'acceptation :**
  - Le compteur de vues et de likes s'incrémente de façon réactive.
- **Statut :** ⬜ À faire

### Tâche 5.2 : Formules & Souscription d'Abonnement Floral
- **Fichiers :** `app/abonnements/page.tsx`, `components/subscription-wizard.tsx`, `lib/api/subscriptions.ts`
- **Endpoints :** `GET /subscriptions/plans`, `POST /subscriptions`
- **Description :** Charger les formules officielles (`Particulier`, `Prestige`, `Entreprise`) avec tarifs hebdomadaire/bimensuel. Permettre la souscription interactive en 4 étapes (formule, fréquence, jour de livraison, coordonnées).
- **Critères d'acceptation :**
  - Génération de la référence unique `ABO-XXXXXX`.
- **Statut :** ⬜ À faire

### Tâche 5.3 : Espace Client — Gestion des Abonnements
- **Fichiers :** `app/compte/abonnements/page.tsx`, `lib/api/subscriptions.ts`
- **Endpoints :** `GET /subscriptions/mine`, `GET /subscriptions/mine/:subscriptionNumber`, `PATCH /subscriptions/mine/:subscriptionNumber/pause`, `PATCH /subscriptions/mine/:subscriptionNumber/resume`, `PATCH /subscriptions/mine/:subscriptionNumber/cancel`
- **Description :** Permettre au client de consulter ses abonnements, de suspendre temporairement les passages (ex: congés) ou de les réactiver en un clic.
- **Critères d'acceptation :**
  - Changement d'état immédiat avec notification de confirmation.
- **Statut :** ⬜ À faire

---

## Phase 6 : Authentification Admin & Tableau de Bord

### Tâche 6.1 : Connexion Staff & Sécurisation Back-Office (Suppression des Mocks)
- **Fichiers :** `app/admin/connexion/page.tsx`, `app/admin/connexion/actions.ts`, `app/admin/(protected)/layout.tsx`, `lib/api/auth-token.ts`, `components/admin/admin-topbar.tsx`, `components/admin/admin-mobile-drawer.tsx`
- **Endpoints :** `POST /auth/login`, `GET /auth/me`
- **Description :** Suppression complète du compte mocké en dur (`admin@decofleur.com` / `admin123`) et de tous les fallbacks de contournement en cas d'erreur API. Intégration stricte de l'authentification backend :
  - Formulaire de connexion épuré sans identifiants pré-remplis avec placeholders professionnels.
  - Appel direct à l'API `POST /api/v1/auth/login` et validation des rôles staff (`ADMIN`, `MANAGER`, `FLORIST`, `DELIVERY`, `SALES`, `ACCOUNTANT`).
  - Stockage du jeton JWT dans le cookie sécurisé `decofleur_admin_jwt` (`path=/`, `SameSite=Lax`, 7 jours) et synchronisation avec `getAdminAuthToken()`.
  - Protection stricte de `ProtectedAdminLayout` : vérification obligatoire de la présence du jeton JWT (redirection immédiate vers `/admin/connexion` si absent).
  - Affichage dynamique du nom, email et rôle de l'utilisateur connecté dans la barre supérieure (`AdminTopbar`) et le tiroir mobile (`AdminMobileDrawer`).
- **Critères d'acceptation :**
  - Aucun compte mocké ni mot de passe par défaut.
  - Rejet explicite avec notification en cas d'identifiants invalides ou de rôle non staff (`CLIENT`).
  - Blocage strict de l'accès aux pages protégées en l'absence de JWT valide.
- **Statut :** ✅ Terminé (Novembre 2026)

### Tâche 6.2 : Tableau de Bord d'Administration
- **Fichiers :** `app/admin/page.tsx`, `components/admin/dashboard-stats.tsx`, `lib/api/admin-dashboard.ts`
- **Endpoints :** `GET /admin/dashboard`
- **Description :** Connecter les 4 KPIs principaux (Chiffre d'affaires, Commandes, Clients, Produits), le graphique d'évolution des ventes, la distribution des commandes par statut, les commandes récentes et le top produits.
- **Critères d'acceptation :**
  - Données réelles agrégées affichées sans mocks.
- **Statut :** ⬜ À faire

### Tâche 6.3 : Rapports Financiers & Transactions
- **Fichiers :** `app/admin/rapports/page.tsx`, `lib/api/admin-dashboard.ts`
- **Endpoints :** `GET /admin/reports`, `GET /admin/reports/transactions`
- **Description :** Raccorder les filtres de période (`today`, `7days`, `30days`, `this_month`, `this_year`, `custom`), le comparatif N vs N-1, la ventilation par zone et méthode de paiement, ainsi que le journal financier des transactions avec calcul des frais NabooPay.
- **Critères d'acceptation :**
  - Totaux bruts, frais de passerelle et montants nets cohérents avec la comptabilité.
- **Statut :** ⬜ À faire

---

## Phase 7 : Catalogue Admin & Inventaire de Stock

### Tâche 7.1 : Upload de Médias Produits, Catégories, Blog, Marketing & Paramètres
- **Fichiers :** `components/admin/image-uploader.tsx`, `lib/api/admin/uploads.ts`, `next.config.ts`
- **Endpoints :** `POST /admin/uploads?folder=products`, `POST /admin/uploads?folder=categories`
- **Description :** Création du composant d'upload réutilisable `ImageUploader` avec drag-and-drop, téléversement immédiat en `multipart/form-data`, indicateur de progression, gestion d'erreurs en mode strict, sélection de la photo principale et aperçus avec suppression. Intégration sur :
  - Produits (`/admin/produits/nouveau` et `[id]`) : galerie multi-photos (jusqu'à 10 photos) + choix d'image principale (`featuredImage`).
  - Catégories (`/admin/categories`) : photo d'illustration dans le dialogue d'ajout/édition et affichage dans la table/cartes.
  - Blog (`components/admin/article-form.tsx`) : téléversement direct de la photo de couverture avec alternative aux visuels prédéfinis.
  - Événements Marketing (`components/admin/edit-event-dialog.tsx`) : téléversement cloud de la photo d'ambiance avec bouton dédié et spinner.
  - Paramètres Boutique (`/admin/parametres`) : téléversement et mise à jour dynamique du logo officiel de l'enseigne.
- **Critères d'acceptation :**
  - Validation stricte des types de fichiers (JPEG, PNG, WebP, AVIF) et taille maximale (5 Mo).
  - Mode strict : notification d'erreur immédiate et blocage en cas d'échec du serveur de stockage.
  - Renvoi direct des URLs publiques sauvegardées dans les entités respectives.
  - Configuration des hostnames Cloudflare R2 (`pub-*.r2.dev`, `*.r2.dev`, `pub-69eb0dcdef4244f49946a2556c863719.r2.dev`) dans `next.config.ts` (`images.remotePatterns`) pour autoriser le rendu Next.js Image sans erreur de sécurité.
- **Statut :** ✅ Terminé

### Tâche 7.2 : Gestion des Catégories & Sous-Catégories
- **Fichiers :** `app/admin/categories/page.tsx`, `lib/api/admin/categories.ts`
- **Endpoints :** `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`, `POST /admin/subcategories`, `PATCH /admin/subcategories/:id`, `DELETE /admin/subcategories/:id`
- **Description :** Interface complète de gestion de la hiérarchie des catégories, avec photo de couverture (`imageUrl`), slug auto, description et réorganisation.
- **Critères d'acceptation :**
  - Création, modification et suppression fonctionnelles avec confirmation modale et affichage de la vignette.
- **Statut :** ✅ Terminé

### Tâche 7.3 : Gestion des Produits Catalogue
- **Fichiers :** `app/admin/produits/page.tsx`, `app/admin/produits/nouveau/page.tsx`, `app/admin/produits/[id]/page.tsx`, `lib/api/admin/products.ts`, `lib/admin/mock-data/types.ts`
- **Endpoints :** `GET /admin/products`, `GET /admin/products/:id`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`
- **Description :** Gestion complète du catalogue : création avec galerie multi-photos, sélection d'image principale, catégories dynamiques chargées depuis l'API, variantes de tailles, prix de base et prix barré promo (`compareAtPrice`), statut (`ACTIVE`, `HIDDEN`, `ON_QUOTE`, `PROMO`).
- **Critères d'acceptation :**
  - L'upload d'images est interactif et lié aux endpoints API (`POST /admin/uploads?folder=products`).
  - La création de produit transmet des données strictement conformes au schéma backend (`createProductSchema.strict()`) avec gestion automatique des prix promotionnels (`compareAtPrice > basePrice`).
  - Les catégories sont chargées dynamiquement avec leurs identifiants UUID et validation immédiate.
  - La suppression logique passe le produit en `HIDDEN`.
  - La recherche et le filtre par statut fonctionnent côté admin sans données mockées résiduelles.
- **Statut :** ✅ Terminé

### Tâche 7.4 : Gestion des Stocks & Mouvements d'Inventaire
- **Fichiers :** `app/admin/stock/page.tsx`, `lib/api/admin-catalog.ts`
- **Endpoints :** `GET /admin/inventory`, `POST /admin/inventory/:variantId/movements`, `GET /admin/stock-movements`
- **Description :** Suivi en temps réel des stocks par variante de produit, filtre alerte stock bas (`lowStock=true`), saisie des mouvements (`ENTRY`, `EXIT`, `ADJUSTMENT`) avec motif et historique des modifications.
- **Critères d'acceptation :**
  - Un mouvement d'inventaire met à jour instantanément la quantité en stock.
- **Statut :** ⬜ À faire

---

## Phase 8 : Commandes, Devis & Livraisons Admin

### Tâche 8.1 : Gestion des Commandes Back-Office
- **Fichiers :** `app/admin/commandes/page.tsx`, `app/admin/commandes/[id]/page.tsx`, `lib/api/admin-orders.ts`
- **Endpoints :** `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id`, `PATCH /admin/orders/:id/status`
- **Description :** Liste complète avec compteurs par statut (`counts`), recherche client/référence, détail complet de commande, saisie de notes internes et transitions de cycle de vie (`PENDING` → `PAID` → `PREPARING` → `READY` → `IN_DELIVERY` → `DELIVERED`).
- **Critères d'acceptation :**
  - Changement de statut avec historique d'événements enregistré.
- **Statut :** ⬜ À faire

### Tâche 8.2 : Configuration des Zones de Livraison
- **Fichiers :** `app/admin/livraisons/zones/page.tsx` (ou modal dédié), `lib/api/admin-orders.ts`
- **Endpoints :** `GET /admin/delivery-zones`, `POST /admin/delivery-zones`, `PATCH /admin/delivery-zones/:id`, `DELETE /admin/delivery-zones/:id`
- **Description :** Interface de paramétrage des zones géographiques : nom de zone, tarif standard, tarif express, seuil de gratuité et délai estimé.
- **Critères d'acceptation :**
  - Les modifications de zones sont immédiatement appliquées au tunnel de commande client.
- **Statut :** ⬜ À faire

### Tâche 8.3 : Back-Office des Devis Événementiels
- **Fichiers :** `app/admin/devis/page.tsx`, `app/admin/devis/[id]/page.tsx`, `lib/api/admin-quotes.ts`
- **Endpoints :** `GET /admin/quotes`, `GET /admin/quotes/:id`, `PATCH /admin/quotes/:id`, `PATCH /admin/quotes/:id/status`
- **Description :** Créer l'écran back-office de gestion des devis : visualisation des demandes, saisie du montant chiffré (`quotedAmount`), passage au statut `SENT`, `ACCEPTED` ou `REFUSED`, et notes administratives internes.
- **Critères d'acceptation :**
  - Le devis chiffré devient visible côté client avec montant mis à jour.
- **Statut :** ⬜ À faire

### Tâche 8.4 : Gestion des Livraisons & Assignation
- **Fichiers :** `app/admin/livraisons/page.tsx`, `lib/api/admin-deliveries.ts`
- **Endpoints :** `GET /admin/deliveries`, `GET /admin/deliveries/:id`, `PATCH /admin/deliveries/:id`, `POST /admin/deliveries/:id/assign`, `POST /admin/deliveries/:id/start`, `POST /admin/deliveries/:id/complete`, `POST /admin/deliveries/:id/fail`
- **Description :** Tableau de bord logistique : assignation d'un livreur disponible, suivi du statut de la course, validation manuelle ou gestion des échecs de livraison.
- **Critères d'acceptation :**
  - L'assignation d'un livreur incrémente son compteur de courses en cours.
- **Statut :** ⬜ À faire

### Tâche 8.5 : Flotte de Livreurs
- **Fichiers :** `app/admin/livreurs/page.tsx`, `lib/api/admin-deliveries.ts`
- **Endpoints :** `GET /admin/drivers`, `GET /admin/drivers/:id`, `POST /admin/drivers`, `PATCH /admin/drivers/:id`, `DELETE /admin/drivers/:id`
- **Description :** Gestion de la flotte de livreurs : ajout d'un livreur avec véhicule (moto, van), numéro de téléphone, statut de disponibilité (`AVAILABLE`, `UNAVAILABLE`) et historique de courses.
- **Critères d'acceptation :**
  - Ajout et modification d'un profil livreur fonctionnels.
- **Statut :** ⬜ À faire

---

## Phase 9 : CRM Clients & Marketing Admin

### Tâche 9.1 : CRM Clients & Segmentation
- **Fichiers :** `app/admin/clients/page.tsx`, `app/admin/clients/[id]/page.tsx`, `lib/api/admin-customers.ts`
- **Endpoints :** `GET /admin/customers`, `GET /admin/customers/:id`, `PATCH /admin/customers/:id`
- **Description :** Liste paginée des clients avec filtres de segments (`particulier`, `entreprise`, `vip`), recherche multi-critères, fiche client détaillée avec historique des 10 dernières commandes, LTV, panier moyen, et modification du segment ou notes internes.
- **Critères d'acceptation :**
  - Affichage précis des statistiques CRM et modification du statut/segment.
- **Statut :** ⬜ À faire

### Tâche 9.2 : Gestion des Codes Promo & Promotions Catalogue
- **Fichiers :** `app/admin/marketing/page.tsx`, `lib/api/admin-marketing.ts`
- **Endpoints :** `GET/POST /admin/marketing/coupons`, `GET/PATCH/DELETE /admin/marketing/coupons/:id`, `GET/POST/PATCH/DELETE /admin/marketing/promotions[/:id]`
- **Description :** Onglets de gestion des coupons (pourcentage, montant fixe, livraison offerte, dates, quotas d'utilisation) et des campagnes de promotion catalogue (bannières, réductions par catégorie ou produit).
- **Critères d'acceptation :**
  - Création d'un coupon immédiatement utilisable dans le panier client.
- **Statut :** ⬜ À faire

### Tâche 9.3 : Campagnes de Communication & Paniers Abandonnés
- **Fichiers :** `app/admin/marketing/campagnes/page.tsx`, `app/admin/marketing/paniers-abandonnes/page.tsx`, `lib/api/admin-marketing.ts`
- **Endpoints :** `GET/POST/PATCH/DELETE /admin/marketing/campaigns[/:id]`, `POST /admin/marketing/campaigns/:id/send`, `GET /admin/marketing/abandoned-carts`, `POST /admin/marketing/abandoned-carts/:id/remind`, `GET/PUT /admin/marketing/abandoned-carts/settings`
- **Description :** Suivi des campagnes de communication (WhatsApp, SMS, Email) et gestion des paniers abandonnés avec déclenchement de relance et configuration des délais automatiques.
- **Critères d'acceptation :**
  - Envoi ou simulation de relance panier abandonné réussi.
- **Statut :** ⬜ À faire

---

## Phase 10 : Blog, Abonnements & Paramètres Boutique

### Tâche 10.1 : Gestion Éditoriale du Blog
- **Fichiers :** `app/admin/blog/page.tsx`, `lib/api/admin-blog.ts`
- **Endpoints :** `GET/POST/PATCH/DELETE /admin/blog/articles[/:id]`, `POST/PATCH/DELETE /admin/blog/categories[/:id]`, `POST/PATCH/DELETE /admin/blog/authors[/:id]`
- **Description :** Back-office complet de publication : éditeur d'article (titre, slug auto, cover image, markdown, tags, SEO, statut brouillon/publié), gestion des catégories d'articles et des profils d'auteurs fleuristes.
- **Critères d'acceptation :**
  - Un article publié apparaît immédiatement sur la page publique `/blog`.
- **Statut :** ⬜ À faire

### Tâche 10.2 : Gestion des Abonnements Floraux & Passages
- **Fichiers :** `app/admin/abonnements/page.tsx`, `lib/api/admin-subscriptions.ts`
- **Endpoints :** `GET /admin/subscriptions`, `GET /admin/subscriptions/:id`, `PATCH /admin/subscriptions/:id/status`, `PATCH /admin/subscriptions/deliveries/:deliveryId`
- **Description :** Suivi des contrats d'abonnements, calendrier des passages récurrents, validation de livraison d'un passage et enregistrement de l'échange/restitution de vase (`vaseReturned: true`).
- **Critères d'acceptation :**
  - Validation d'un passage de livraison avec mise à jour du statut.
- **Statut :** ⬜ À faire

### Tâche 10.3 : Paramètres de la Boutique & Équipe Staff
- **Fichiers :** `app/admin/parametres/page.tsx`, `lib/api/admin-settings.ts`
- **Endpoints :** `GET/PUT /admin/settings`, `GET /admin/roles`, `GET/POST/GET/PUT/DELETE /admin/users[/:id]`
- **Description :** Configuration générale (coordonnées Dakar/Saly, horaires, devises, notifications WhatsApp/Email, SEO), matrice des permissions par rôle, et gestion des collaborateurs (création avec rôle et mot de passe, désactivation, suppression).
- **Critères d'acceptation :**
  - La modification des coordonnées boutique est répercutée sur le footer et les pages de contact du site.
  - La création d'un collaborateur staff lui permet de se connecter avec ses droits dédiés.
- **Statut :** ⬜ À faire

---

## Phase 11 : Recette E2E, Nettoyage & Sécurité

### Tâche 11.1 : Tests d'Intégration Bout en Bout (Parcours Client & Admin)
- **Fichiers :** Ensemble de l'application
- **Description :** Validation complète du parcours d'achat (Sélection bouquet → Ajout panier → Code promo → Tunnel commande → Paiement → Suivi de livraison), ainsi que de la gestion back-office (Préparation commande → Assignation livreur → Clôture livraison).
- **Critères d'acceptation :**
  - Zéro erreur 500 ou crash React non intercepté.
  - Expérience utilisateur fluide et réactive sur mobile et desktop.
- **Statut :** ⬜ À faire

### Tâche 11.2 : Nettoyage des Mocks & Optimisation Bundle
- **Fichiers :** `lib/products.ts`, composants nettoyés
- **Description :** Supprimer les données codées en dur superflues, vérifier les logs de build Next.js, s'assurer que toutes les pages dynamiques se compilent sans warning TypeScript.
- **Critères d'acceptation :**
  - `npm run build` s'exécute avec succès sans aucune erreur de compilation.
- **Statut :** ✅ Terminé

---

## 🛡️ Audit Exhaustif et Validation du Back-Office Admin (Sans Données Mockées)

**Date d'audit :** 2026-11-06  
**Backend Staging :** `https://backend-decofleursplus-staging.up.railway.app/api/v1`  
**Compte d'accès Admin :** `admin@decofleursplus.com` / `admin123`  
**Résultat TypeScript :** `tsc --noEmit` : **0 erreur**

### Synthèse Module par Module

1. **Module 1 : Catégories (`/admin/categories`)**
   - Données mockées supprimées à 100%.
   - Connecté à `GET /api/v1/categories`, `POST/PATCH/DELETE /api/v1/admin/categories`.
   - État vérifié sur staging : 5 catégories en ligne (Bouquets, Plantes, Mariage & Événements, Compositions Deuil, Coffrets Cadeaux).

2. **Module 2 : Produits Catalogue (`/admin/produits`, `/nouveau`, `/[id]`)**
   - Données mockées supprimées à 100%.
   - Référence produit (SKU) générée automatiquement au format `DFP-{CAT}-{TIMESTAMP}` si non renseignée.
   - Upload d'image Cloudflare R2 validé (`next.config.ts` mis à jour avec `*.r2.dev`).
   - Gestion stricte du format des variantes et attributs sans crash.
   - État vérifié sur staging : 3 produits réels en ligne.

3. **Module 3 : Stocks & Mouvements (`/admin/stock`)**
   - Connecté aux endpoints `/admin/stock/adjust` et `/admin/stock/movements`.
   - Enums backend strictement respectés (`ENTRY | EXIT | ADJUSTMENT`).
   - Vue desktop et cartes mobiles munies d'états de chargement et d'états vides explicites.

4. **Module 4 : Devis Événementiels (`/admin/devis`)**
   - Données mockées supprimées à 100%.
   - Connecté à `GET /api/v1/admin/quotes`, `PATCH /api/v1/admin/quotes/:id`, `PATCH /api/v1/admin/quotes/:id/status`.
   - Statuts backend supportés (`NEW`, `UNDER_REVIEW`, `SENT`, `ACCEPTED`, `REFUSED`, `CONVERTED_TO_ORDER`).
   - Chiffrage commercial et notes internes opérationnels.
   - État vérifié sur staging : 5 devis réels en base.

5. **Module 5 : Commandes (`/admin/commandes`, `/[id]`)**
   - Données mockées supprimées à 100%.
   - Connecté à `GET /api/v1/admin/orders` et `GET/PATCH /api/v1/admin/orders/:id`.
   - Unpacking réactif `res.data.items` pour les réponses paginées.
   - Gestion des statuts (`PENDING`, `PAID`, `PREPARATION`, `IN_DELIVERY`, `DELIVERED`, `CANCELLED`).

6. **Module 6 : Clients & CRM (`/admin/clients`, `/[id]`)**
   - Données mockées supprimées à 100%.
   - Connecté à `GET /api/v1/admin/customers` et `GET /api/v1/admin/customers/:id`.
   - État vérifié sur staging : 37 clients réels synchronisés.
   - Fiche client avec statistiques réelles et commandes récentes.

7. **Module 7 : Livraisons & Flotte (`/admin/livraisons`)**
   - Données mockées supprimées à 100%.
   - Connecté à `GET /api/v1/admin/deliveries` et `GET /api/v1/admin/drivers`.
   - Vues courses et livreurs munies d'états vides et de chargement fluides.

8. **Module 8 : Marketing & Fidélisation (`/admin/marketing`)**
   - Données mockées supprimées à 100%.
   - 4 onglets connectés aux endpoints staging (`/admin/marketing/coupons`, `/promotions`, `/campaigns`, `/abandoned-carts`).
   - États vides informatifs avec boutons de création rapide.

9. **Module 9 : Abonnements & Location de Matériel (`/admin/abonnements`, `/admin/location`)**
   - **Abonnements :** Connecté à `GET /api/v1/admin/subscriptions` (4 abonnements réels détectés sur staging).
   - **Location :** API dédiée `lib/api/admin/rentals.ts` créée, connectée au CRUD `/api/v1/admin/rentals` avec gestion des équipements et réservations.

10. **Module 10 : Blog Floral & Paramètres Boutique (`/admin/blog`, `/admin/parametres`)**
    - **Blog :** Connecté à `GET/POST/PATCH/DELETE /api/v1/admin/blog/articles[/:id]`. Catégories et auteurs reliés dynamiquement, 0 données mockées.
    - **Paramètres :** Connecté à `GET /api/v1/admin/settings`, `PUT /api/v1/admin/settings`, `GET /api/v1/admin/users`. Paramètres boutique réels chargés (Décofleur Plus, Saly Portudal, devises, fuseau horaire Dakar).

11. **Module 11 : Tableau de Bord & Rapports Financiers (`/admin/tableau-de-bord`, `/admin/rapports`)**
    - Connecté à `GET /api/v1/admin/dashboard` et `GET /api/v1/admin/reports`.
    - KPIs réels (CA, commandes, 37 clients, produits, graphiques temporels).
    - Zéro mock fallback : si aucune vente n'est encore enregistrée sur la période, affichage propre des zéros et états vides.

12. **Module 12 : Blocage des Fonctionnalités à Venir & Gating UI (Fournisseurs, Approvisionnements, Paysagisme)**
    - **Statut :** ⚠️ Bloqué / Fonctionnalités à venir (En attente d'implémentation backend REST).
    - **Spécifications techniques de référence :** Les 23 endpoints REST requis pour ces modules sont formellement spécifiés dans `docs/endpoints_feedback.md` (Fournisseurs : 5 routes, Approvisionnements & Factures : 7 routes, Paysagisme : 8 routes).
    - **Mesures d'assainissement et UI Gating appliquées :**
      - **Navigation Admin (`components/admin/admin-sidebar.tsx`, `components/admin/admin-mobile-drawer.tsx`) :**
        - Badge explicite « À venir » affiché sur les liens de menu `Fournisseurs`, `Approvisionnements` et `Paysagisme` (en vue développée et dans les tooltips en vue rétractée).
      - **Navigation Client & Vitrine (`components/site-header.tsx`, `components/site-footer.tsx`) :**
        - Badge explicite « À venir » sur le déclencheur et les sous-éléments du menu `Paysagisme` (desktop et tiroir mobile).
        - Badge « À venir » dans le pied de page (footer) sur le lien `Paysagisme`.
      - **Module Fournisseurs (`app/admin/(protected)/fournisseurs/page.tsx`, `app/admin/(protected)/fournisseurs/[id]/page.tsx`) :**
        - Badge « À venir » dans l'en-tête de la page principale et sur la fiche détail.
        - Boutons d'ajout et de création désactivés (`disabled`, `opacity-50`, `cursor-not-allowed`) avec mention explicite `(À venir)`.
      - **Module Approvisionnements (`app/admin/(protected)/approvisionnements/page.tsx`, `.../factures/page.tsx`, `.../reception/[id]/page.tsx`) :**
        - Badge « À venir » dans l'en-tête et sur l'accès aux factures fournisseurs.
        - Boutons « Nouvelle commande », « Ajouter une facture », « Marquer comme payée », « Enregistrer les modifications » et « Enregistrer la réception » désactivés (`disabled`, `opacity-50`, `cursor-not-allowed`) avec libellé `(À venir)`.
      - **Module Paysagisme Admin (`app/admin/(protected)/paysagisme/page.tsx`) :**
        - Badge « À venir » dans l'en-tête.
        - Boutons de création et de sauvegarde de prestation ou de réalisation désactivés (`disabled`, `opacity-50`, `cursor-not-allowed`) avec libellé `(À venir)`.
      - **Pages Paysagisme Publiques (`app/paysagisme/page.tsx`, `.../prestations/page.tsx`, `.../realisations/page.tsx`) :**
        - Bannières et bandeaux d'information proéminents signalant que le service et le catalogue en ligne sont à venir.
      - **Formulaire de Devis (`app/devis/page.tsx`, `components/shared-devis-form.tsx`) :**
        - Bascule du type de service par défaut vers `evenements` (qui dispose d'un endpoint backend fonctionnel `POST /quotes`) au lieu de `paysagisme`.
        - Badge « À venir » positionné sur le sélecteur de métier pour l'option « Paysagisme & Espaces Verts ».

---

## Phase 12 : Nouvelles APIs Backend (17 endpoints) & Favoris Mon Compte

Cette phase couvre la prise en compte des 17 nouveaux endpoints introduits par le commit backend `57d32f0` (PR #8 & #9), ainsi que la relocalisation de la page Favoris dans l'espace client unifié.

### Tâche 12.1 : Authentification Google & Réinitialisation de Mot de Passe
- **Fichiers :** `lib/api/auth.ts`, `app/mot-de-passe-oublie/page.tsx`, `components/auth/forgot-password-form.tsx`
- **Endpoints :**
  - `POST /api/v1/auth/google` (Connexion / Inscription Google OAuth)
  - `POST /api/v1/auth/forgot-password` (Demande de lien de réinitialisation)
  - `POST /api/v1/auth/reset-password` (Application du nouveau mot de passe via token)
- **Description :** Création des méthodes clientes typées `loginWithGoogle`, `forgotPassword`, `resetPassword`. Raccordement au formulaire de mot de passe oublié.
- **Statut :** ✅ Services créés & typés dans `lib/api/auth.ts`

### Tâche 12.2 : Avis & Évaluations Catalogue
- **Fichiers :** `lib/api/catalog.ts`, `app/produits/[slug]/page.tsx`
- **Endpoints :**
  - `GET /api/v1/products/{id}/reviews` (Liste des avis avec moyenne et répartition)
  - `POST /api/v1/products/{id}/reviews` (Dépôt d'un avis noté de 1 à 5)
- **Description :** Création des types `ProductReview`, `ProductReviewsResponse` et des méthodes `getProductReviews`, `addProductReview`.
- **Statut :** ✅ Services créés & typés dans `lib/api/catalog.ts`

### Tâche 12.3 : Centre de Notifications In-App Client
- **Fichiers :** `lib/api/notifications.ts`, `components/account-section.tsx`
- **Endpoints :**
  - `GET /api/v1/notifications/mine`
  - `GET /api/v1/notifications/mine/unread-count`
  - `PATCH /api/v1/notifications/mine/{id}/read`
  - `POST /api/v1/notifications/mine/read-all`
  - `GET /api/v1/notifications/mine/preferences`
  - `PUT /api/v1/notifications/mine/preferences`
- **Description :** Service client complet pour le suivi des alertes commandes, livraisons et messages personnalisés.
- **Statut :** ✅ Service créé & typé dans `lib/api/notifications.ts`

### Tâche 12.4 : Notifications Staff & Diffusions Broadcast Admin
- **Fichiers :** `lib/api/admin/notifications.ts`
- **Endpoints :**
  - `GET /api/v1/admin/notifications`
  - `GET /api/v1/admin/notifications/unread-count`
  - `PATCH /api/v1/admin/notifications/{id}/read`
  - `POST /api/v1/admin/notifications/read-all`
  - `POST /api/v1/admin/notifications/send`
  - `GET /api/v1/admin/notifications/broadcasts`
- **Description :** Service d'administration pour la gestion des alertes d'activité internes et des campagnes de messages broadcast ciblés.
- **Statut :** ✅ Service créé & typé dans `lib/api/admin/notifications.ts`

### Tâche 12.5 : Relocalisation de la page Favoris dans « Mon Compte »
- **Fichiers :** `app/compte/favoris/page.tsx`, `app/favoris/page.tsx`, `next.config.ts`, `components/account-sidebar.tsx`, `components/site-header.tsx`, `app/compte/page.tsx`
- **Endpoints :** Aucun (Composant d'affichage de la wishlist client synchronisée avec le panier / localStorage)
- **Description :** Déplacement de la page externe `/favoris` vers `/compte/favoris` avec gabarit `AccountLayout`, redirection permanente 308 et mise à jour de la navigation desktop/mobile.
- **Statut :** ✅ Terminé & validé

---

## 📌 Récapitulatif des Endpoints Manquants (En Attente Backend)

Les seuls modules et endpoints non implémentés à ce jour par le backend sont strictement limités aux 3 modules d'exploitation ci-dessous (**20 endpoints au total**, spécifiés dans `docs/endpoints_feedback.md`) :
1. **Fournisseurs** (5 endpoints : `/api/v1/admin/suppliers`...)
2. **Approvisionnements & Factures** (7 endpoints : `/api/v1/admin/supplier-orders`, `/admin/supplier-invoices`...)
3. **Paysagisme & Portfolio** (8 endpoints : `/api/v1/landscape-services`, `/api/v1/landscape-projects`...)


