# 📊 Statut d'Implémentation API — DécoFleur Plus (Branche staging)

**Dernière mise à jour :** 2026-11-11  
**Branche backend :** `staging` (Commit `57d32f0` — 166 endpoints recensés dans `docs/apis.md`)  
**Progression globale :** 50 / 50 tâches (100% du périmètre backend disponible raccordé)  

---

## Légende des Statuts

| Symbole | Signification |
|---|---|
| ⬜ | À faire |
| 🔄 | En cours |
| ✅ | Terminé & testé |
| ⚠️ | Bloqué / En attente backend |

---

## Tableau de Bord d'Avancement par Phase

| Phase | Intitulé | Tâches | Complétées | Statut Global |
|---|---|:---:|:---:|:---:|
| **Phase 0** | Infrastructure & Client API | 3 | 3 | ✅ Terminé |
| **Phase 1** | Authentification & Espace Client | 5 | 5 | ✅ Terminé |
| **Phase 2** | Catalogue Public & Vitrine | 4 | 4 | ✅ Terminé |
| **Phase 3** | Panier, Promotions & Devis Événementiels | 4 | 4 | ✅ Terminé |
| **Phase 4** | Tunnel de Commande, Livraisons & NabooPay | 5 | 5 | ✅ Terminé |
| **Phase 5** | Blog Floral & Abonnements Publics | 3 | 3 | ✅ Terminé |
| **Phase 6** | Authentification Admin & Tableau de Bord | 3 | 3 | ✅ Terminé |
| **Phase 7** | Catalogue Admin & Inventaire de Stock | 4 | 4 | ✅ Terminé |
| **Phase 8** | Commandes, Devis & Livraisons Admin | 5 | 5 | ✅ Terminé |
| **Phase 9** | CRM Clients & Marketing Admin | 3 | 3 | ✅ Terminé |
| **Phase 10** | Blog, Abonnements & Paramètres Boutique | 3 | 3 | ✅ Terminé |
| **Phase 11** | Recette E2E, Nettoyage & Sécurité | 5 | 5 | ✅ Terminé |
| **Phase 12** | Nouvelles APIs Backend (17 endpoints) & Favoris Mon Compte | 5 | 5 | ✅ Terminé |
| **TOTAL** | **Ensemble du Projet Raccordé** | **50** | **50** | **100%** |
| *En attente* | *Endpoints manquants backend (Fournisseurs, Appro, Paysagisme)* | *3 modules* | *20 routes* | ⚠️ En attente backend |

---

## Détail des Tâches

### Phase 0 : Infrastructure & Client API
- [x] **Tâche 0.1** : Variables d'environnement & Configuration Base API (`.env.local`, `.env.example`, `lib/api/config.ts`) ✅
- [x] **Tâche 0.2** : Client HTTP générique & Gestionnaire d'erreurs (`lib/api/client.ts`, `lib/api/types.ts`) ✅
- [x] **Tâche 0.3** : Synchronisation du Token JWT & Session (`lib/api/auth-token.ts`, `components/auth-provider.tsx`) ✅

### Phase 1 : Authentification & Espace Client
- [x] **Tâche 1.1** : Connexion & Inscription dynamique (`components/auth-provider.tsx`, `/connexion`, `/inscription`) ✅
- [x] **Tâche 1.2** : Récupération du profil de session & Reconnexion (`lib/api/auth.ts`, `components/auth-provider.tsx`) ✅
- [x] **Tâche 1.3** : Mise à jour du profil client & Mot de passe (`/compte/informations`) ✅
- [x] **Tâche 1.4** : Carnet d'adresses de livraison du client (`/compte/adresses`) ✅
- [x] **Tâche 1.5** : Programme de Fidélité & Statistiques (`/compte/fidelite`) ✅

### Phase 2 : Catalogue Public & Vitrine
- [x] **Tâche 2.1** : Service API Catalogue (`lib/api/catalog.ts`, `lib/types/catalog.ts`) ✅
- [x] **Tâche 2.2** : Page d'accueil dynamique (produits vedettes & catégories) ✅
- [x] **Tâche 2.3** : Page Boutique & Filtres avancés (`/boutique`) ✅
- [x] **Tâche 2.4** : Page Détail Produit (`/produits/[slug]`) ✅

### Phase 3 : Panier, Promotions & Devis Événementiels
- [x] **Tâche 3.1** : Validation de Code Promo dans le Panier (`POST /coupons/validate`) ✅
- [x] **Tâche 3.2** : Bannières de Promotions Actives (`GET /promotions/active`) ✅
- [x] **Tâche 3.3** : Formulaire de Devis Événementiel avec Upload d'Images (`/devis`) ✅
- [x] **Tâche 3.4** : Espace Client — Mes Devis (`/compte/devis`) ✅

### Phase 4 : Tunnel de Commande, Livraisons & NabooPay
- [x] **Tâche 4.1** : Zones de Livraison & Devis Panier (`GET /delivery-zones`, `POST /orders/quote`) ✅
- [x] **Tâche 4.2** : Création de Commande & Passerelle NabooPay (Wave, OM, Free, Card + Cash on delivery) (`POST /orders`) ✅
- [x] **Tâche 4.3** : Écrans de Confirmation, Détection Webhook & Relance après Échec (`lib/api/payment.ts`, `/commande/confirmation`, `/commande/paiement-echoue`) ✅
- [x] **Tâche 4.4** : Historique des Commandes & Reprise de Paiement dans l'Espace Client (`/compte/commandes/[id]`, `POST /pay`, `GET /payments`) ✅
- [x] **Tâche 4.5** : Suivi de Livraison en Direct (`/compte/suivi/[id]`) ✅

### Phase 5 : Blog Floral & Abonnements Publics
- [x] **Tâche 5.1** : Consultation du Blog Floral & Likes (`/blog`, `/blog/[slug]`) ✅
- [x] **Tâche 5.2** : Formules & Souscription d'Abonnement Floral (`/abonnements`) ✅
- [x] **Tâche 5.3** : Espace Client — Gestion des Abonnements (`/compte/abonnements`) ✅

---

### Phase 6 : Authentification Admin & Tableau de Bord
- [x] **Tâche 6.1** : Connexion Staff Réelle API & Sécurisation Back-Office (Suppression des comptes mockés, validation JWT `decofleur_admin_jwt`, rôle staff obligatoire) ✅
- [x] **Tâche 6.2** : Tableau de Bord d'Administration (`/admin/tableau-de-bord`, stats dynamiques, bouton Actualiser) ✅
- [x] **Tâche 6.3** : Rapports Financiers & Transactions (`/admin/rapports`, ventes par période & canal, bouton Actualiser) ✅

### Phase 7 : Catalogue Admin & Inventaire de Stock
- [x] **Tâche 7.1** : Composant Reutilisable Upload de Médias Produits, Catégories, Blog, Marketing & Paramètres (`components/admin/image-uploader.tsx`, `POST /admin/uploads`, `next.config.ts` remotePatterns Cloudflare R2, multipart/form-data) ✅
- [x] **Tâche 7.2** : Gestion des Catégories & Sous-Catégories (`/admin/categories`, CRUD complet & réorganisation) ✅
- [x] **Tâche 7.3** : Gestion des Produits Catalogue (`/admin/produits`, `/nouveau`, `/[id]`, formulaire complet) ✅
- [x] **Tâche 7.4** : Gestion des Stocks & Mouvements d'Inventaire (`/admin/stock`, alertes réappro, ajustements) ✅

### Phase 8 : Commandes, Devis & Livraisons Admin
- [x] **Tâche 8.1** : Gestion des Commandes Back-Office (`/admin/commandes`, cycle de vie, impression bon, transition livraison) ✅
- [x] **Tâche 8.2** : Configuration des Zones de Livraison (`lib/api/admin/delivery-zones.ts`, CRUD zones & frais) ✅
- [x] **Tâche 8.3** : Back-Office des Devis Événementiels (`/admin/devis`, acceptation, rejet, proposition chiffrée) ✅
- [x] **Tâche 8.4** : Gestion des Livraisons & Assignation (`/admin/livraisons`, créneaux, changements de statut en direct) ✅
- [x] **Tâche 8.5** : Flotte de Livreurs (`/admin/livraisons`, assignation de chauffeurs, gestion d'équipe) ✅

### Phase 9 : CRM Clients & Marketing Admin
- [x] **Tâche 9.1** : CRM Clients & Segmentation (`/admin/clients`, synchronisation fiches, fidélité & dépenses) ✅
- [x] **Tâche 9.2** : Gestion des Codes Promo & Promotions Catalogue (`/admin/marketing`, coupons Wave/OM, remises %) ✅
- [x] **Tâche 9.3** : Campagnes de Communication & Paniers Abandonnés (`/admin/marketing`, relances SMS/WhatsApp & bannières) ✅

### Phase 10 : Blog, Abonnements & Paramètres Boutique
- [x] **Tâche 10.1** : Gestion Éditoriale du Blog (`/admin/blog`, édition WYSIWYG, catégories & publications) ✅
- [x] **Tâche 10.2** : Gestion des Abonnements Floraux & Passages (`/admin/abonnements`, statuts actif/pause, MRR) ✅
- [x] **Tâche 10.3** : Paramètres de la Boutique & Équipe Staff (`/admin/parametres`, boutique, rôles, collaborateurs) ✅

### Phase 11 : Recette E2E, Nettoyage & Sécurité
- [x] **Tâche 11.1** : Tests d'Intégration Bout en Bout (Parcours Client & Admin validés, TypeScript `tsc --noEmit` à 0 erreur) ✅
- [x] **Tâche 11.2** : Nettoyage des Mocks, Robustesse Offline & Build de Production (`npm run build` validé : 97/97 pages générées avec succès) ✅
- [x] **Tâche 11.3** : Ergonomie Mobile & Déconnexion Globale (Bouton de déconnexion direct mobile dans la Topbar, menu déroulant du profil et Drawer mobile Admin & Storefront) ✅
- [x] **Tâche 11.4** : Gestion Précise des Remises Produits (Basculement explicite de promotion, suppression des remises par défaut, synchronisation variante-basePrice et annulation explicite `compareAtPrice: null`) ✅
- [x] **Tâche 11.5** : Assainissement Exhaustif des Formulaires d'Administration & Dépendances Métier (Élimination intégrale des valeurs par défaut mockées dans les dialogues Marketing, Approvisionnements, Factures, Paysagisme et Location d'équipements. Chargement dynamique des cibles réelles et blocage prérequis si aucune catégorie n'existe avant création d'un produit). ✅

### Phase 12 : Nouvelles APIs Backend (17 endpoints) & Favoris Mon Compte
- [x] **Tâche 12.1** : Authentification Google & Réinitialisation Mot de passe (`POST /auth/google`, `POST /auth/forgot-password`, `POST /auth/reset-password` typés et testés dans `lib/api/auth.ts`) ✅
- [x] **Tâche 12.2** : Avis & Évaluations Catalogue (`GET /products/{id}/reviews`, `POST /products/{id}/reviews` typés dans `lib/api/catalog.ts`) ✅
- [x] **Tâche 12.3** : Centre de Notifications In-App Client (`/notifications/mine`, compteurs, préférences créés dans `lib/api/notifications.ts`) ✅
- [x] **Tâche 12.4** : Notifications Staff & Diffusions Broadcast Admin (`/admin/notifications`, broadcasts créés dans `lib/api/admin/notifications.ts`) ✅
- [x] **Tâche 12.5** : Relocalisation de la page Favoris dans « Mon Compte » (Création `/compte/favoris`, redirection permanente 308 de `/favoris`, mise à jour barre latérale, en-tête et tableau de bord) ✅

---

## ⚠️ Endpoints Manquants Côté Backend (Statut Bloqué / En Attente)

Ces 20 endpoints sont les **seuls endpoints restants non implémentés sur le backend** à ce jour. Ils sont documentés en détail dans `docs/endpoints_feedback.md` :

1. **Fournisseurs (`/admin/fournisseurs`) — 5 endpoints manquants**
   - ⚠️ `GET /api/v1/admin/suppliers`
   - ⚠️ `GET /api/v1/admin/suppliers/{id}`
   - ⚠️ `POST /api/v1/admin/suppliers`
   - ⚠️ `PATCH /api/v1/admin/suppliers/{id}`
   - ⚠️ `DELETE /api/v1/admin/suppliers/{id}`

2. **Approvisionnements & Factures d'Achat (`/admin/approvisionnements`) — 7 endpoints manquants**
   - ⚠️ `GET /api/v1/admin/supplier-orders`
   - ⚠️ `GET /api/v1/admin/supplier-orders/{id}`
   - ⚠️ `POST /api/v1/admin/supplier-orders`
   - ⚠️ `POST /api/v1/admin/supplier-orders/{id}/receive`
   - ⚠️ `GET /api/v1/admin/supplier-invoices`
   - ⚠️ `POST /api/v1/admin/supplier-invoices`
   - ⚠️ `PATCH /api/v1/admin/supplier-invoices/{id}/pay`

3. **Paysagisme & Portfolio (`/admin/paysagisme`, `/paysagisme`) — 8 endpoints manquants**
   - ⚠️ `GET /api/v1/landscape-services` (Public)
   - ⚠️ `GET /api/v1/admin/landscape-services` (Admin)
   - ⚠️ `POST /api/v1/admin/landscape-services`
   - ⚠️ `PATCH /api/v1/admin/landscape-services/{id}`
   - ⚠️ `DELETE /api/v1/admin/landscape-services/{id}`
   - ⚠️ `GET /api/v1/landscape-projects` (Public)
   - ⚠️ `GET /api/v1/admin/landscape-projects` (Admin)
   - ⚠️ `POST /api/v1/admin/landscape-projects`
   - ⚠️ `PATCH /api/v1/admin/landscape-projects/{id}`
   - ⚠️ `DELETE /api/v1/admin/landscape-projects/{id}`
