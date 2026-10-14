# Implementation Plan

## Phase 3 — Back-office

### Foundation
- [x] Initialize `shadcn/ui` and configure design tokens for admin (colors, typography)
- [x] Create `components/admin` directory structure
- [x] Setup `lib/admin/mock-data` with static TypeScript data arrays
- [x] Build Back-office architecture (`app/admin/layout.tsx`)
- [x] Implement Admin Sidebar (`components/admin/admin-sidebar.tsx`)
- [x] Implement Admin Topbar (`components/admin/admin-topbar.tsx`)
- [x] Ensure responsive-ready structure

### Authentification Admin
- [x] Create `/admin/connexion` page layout with a premium centered card design
- [x] Implement Admin Login form (Email & Password)
- [x] Simulate auth flow with hardcoded credentials and redirect to dashboard
- [x] Protect `/admin/*` routes (redirect to `/admin/connexion` if not authenticated)

### Tableau de bord (Dashboard)
- [x] Create `/admin/tableau-de-bord` page layout
- [x] Implement KPI cards (Chiffre d'affaires, Commandes, Clients, Produits)
- [x] Implement Ventes sur 30 jours chart (Recharts)
- [x] Implement Répartition des commandes chart
- [x] Implement Commandes récentes list
- [x] Implement Produits les plus vendus list

### Gestion des produits (Products)
- [x] Create `/admin/produits` page layout
- [x] Implement Product filters & search bar
- [x] Implement Product DataTable with pagination and status
- [x] Create `/admin/produits/nouveau` (Product creation form)
- [x] Create `/admin/produits/[id]` (Product editing/detail)
- [x] Implement Product images upload/management UI
- [x] Implement Product variants & stock UI
- [x] Implement Product pricing & SEO UI

### Gestion des commandes (Orders)
- [x] Create `/admin/commandes` page layout
- [x] Implement Order filters & search bar
- [x] Implement Order DataTable with status badges
- [x] Create `/admin/commandes/[id]` (Order detail page)
- [x] Implement Order status update actions with Confirmation Dialogs

### Gestion des clients (Customers & CRM)
- [x] Create `/admin/clients` page layout
- [x] Implement Customer DataTable with CRM segmentation
- [x] Create `/admin/clients/[id]` (Customer profile & CRM history)
- [x] Implement Customer order history, VIP status & loyalty info

### Gestion des catégories (Categories — Maquette 09)
- [x] Create `/admin/categories` page layout
- [x] Implement Categories DataTable (Nom, Description, Nombre de produits, Statut, Actions)
- [x] Implement Category creation/editing Modal or Drawer ("+ Ajouter une catégorie")
- [x] Implement search & category status toggle


### Gestion du stock (Stock — Maquette 10)
- [x] Create `/admin/stock` page layout with tabs (Tous, Stock faible, Rupture)
- [x] Implement Stock DataTable (Produit avec image, Stock actuel, Stock minimum, Statut badge, Actions)
- [x] Implement Stock quick-adjust modal or inline update
- [x] Implement Stock filter by category and search
- [x] Implement Movement history tab with full audit trail


### Gestion des livraisons (Deliveries — Maquette 11)
- [x] Create `/admin/livraisons` page layout with status tabs (Toutes, À livrer, En cours, Livrées)
- [x] Implement Deliveries DataTable (#Livraison, Commande, Livreur, Statut, Date, Actions)
- [x] Implement delivery detail / assign driver modal

### Marketing & Promotions (Maquette 12/13)
- [x] Create `/admin/marketing` page layout with tabs (Promotions, Coupons, Campagnes, Relance panier)
- [x] Implement Promotions & Coupons DataTable (Nom, Type, Réduction, Période, Statut)
- [x] Implement Campaign creation modal & Cart recovery configuration with WhatsApp/Email triggers

### Paramètres & Équipe (Settings — Maquettes 15 & 16)
- [x] Create `/admin/parametres` page layout with sub-navigation (Boutique & Général, Collaborateurs, Rôles & Permissions, Paiement, Livraison, Notifications, SEO)
- [x] Implement Boutique settings form (Nom, Slogan, Contact, Logo, Horaires, Devise, Fuseau horaire)
- [x] Implement Team/Users DataTable with "+ Ajouter un utilisateur" and `UserEditorDialog`
- [x] Implement interactive Roles & Permissions matrix (Modules vs Rôles avec bascule des droits Lecture/Écriture/Suppression/Export)
- [x] Implement operational tabs: Passerelles de paiement (Wave, OM, CB, Espèces), Zones de livraison (Saly, Mbour, Dakar, Ngaparou), Notifications & Alertes (WhatsApp/SMS/Email), et SEO & Google SERP preview

### Blog & Contenu
- [x] Create `/admin/blog` page layout with 4 sub-sections (Articles, Catégories, Auteurs, Paramètres/SEO)
- [x] Implement Articles management (DataTable, filtres par statut, recherche, actions dupliquer/statut/supprimer)
- [x] Implement Article editor modal (`ArticleEditorDialog`) with 4 tabs (Contenu, Médias, Cross-selling produits, SEO Google Preview)
- [x] Implement Article preview modal (`ArticlePreviewDialog`) with live storefront rendering
- [x] Implement Category creation/editing modal (`CreateBlogCategoryDialog`) with color presets
- [x] Implement Author creation/editing modal (`AuthorProfileDialog`)


### Rapports & Finances
- [x] Create `/admin/rapports` page layout with dual analytical tabs (Ventes & Performance, Bilan Financier & Trésorerie)
- [x] Implement Revenue, Payments, and Financial breakdown charts with comparative period indicators
- [x] Implement export and statistical reports (`ExportReportDialog` with CSV and styled PDF print)
- [x] Implement financial audit journal and transaction detail drawer (`TransactionDetailDialog`)


## Phase 4 — Back-office Responsive & PWA (Tab View & Ergonomie Mobile)

### Architecture & Shell Global PWA
- [x] Mettre à jour `app/manifest.ts` avec le raccourci direct Back-office (`/admin/tableau-de-bord`) et métadonnées PWA
- [x] Créer le composant `AdminMobileTabBar` (barre fixe en bas : Dashboard, Commandes, Produits, Livraisons, Menu)
- [x] Créer le composant `AdminMobileDrawer` (Side Drawer glissant depuis la gauche avec liste des 11 modules, installateur PWA et déconnexion)
- [x] Adapter `AdminTopbar` pour mobile (compact, logo/brand, icône notifs & profil, safe-area)
- [x] Adapter `AdminSidebar` (masquage propre sur mobile < 1024px sans saut de layout)
- [x] Ajouter les styles CSS d'administration mobile dans `app/globals.css` (Safe Area Insets iOS/Android, conteneurs réactifs, prévention overflow)

### Module 1 — Tableau de bord (`/admin/tableau-de-bord`)
- [x] Adapter la grille de KPIs en layout mobile tactile fluide (1 ou 2 colonnes sans écrasement)
- [x] Adapter les graphiques Recharts/Chart.js pour petits écrans (responsive container, tooltips tactiles)
- [x] Transformer la liste des commandes récentes et produits phares en fiches mobiles claires
- [x] Audit visuel et validation : zéro débordement horizontal, textes lisibles

### Module 2 — Commandes (`/admin/commandes`)
- [x] Onglets de statut scrollables horizontalement (Toutes, En attente, Confirmées, Livrées, Annulées)
- [x] Transformer le tableau de commandes en Card View tactile (badges statut, montant mis en avant, actions rapides)
- [x] Adapter la page de détail `/admin/commandes/[id]` pour mobile
- [x] Audit visuel et validation anti-overflow

### Module 3 — Produits (`/admin/produits`)
- [x] Barre de filtres et recherche adaptée aux écrans tactiles
- [x] Transformer le tableau de produits en fiches compactes (vignette photo, nom, prix, stock badge, switch statut)
- [x] Adapter les formulaires création/édition produit (`/admin/produits/nouveau`, `/admin/produits/[id]`)
- [x] Audit visuel et validation anti-overflow

### Module 4 — Livraisons (`/admin/livraisons`)
- [x] Adaptation des sous-onglets de courses
- [x] Transformation du tableau en fiches de livraison avec livreur, créneau et état
- [x] Adaptation du drawer `DeliveryDetailSheet` et modale `AssignDriverDialog` sur mobile
- [x] Audit visuel et validation anti-overflow

### Module 5 — Stock (`/admin/stock`)
- [x] Fiches de gestion de stock avec alerte seuil critique et ajustement rapide tactile
- [x] Onglet historique des mouvements adapté au mobile
- [x] Audit visuel et validation anti-overflow

### Module 6 — Clients (`/admin/clients`)
- [x] Fiches CRM clients adaptées avec badges fidélité et accès rapide au contact (téléphone/email)
- [x] Adaptation de la fiche client `/admin/clients/[id]`
- [x] Audit visuel et validation anti-overflow

### Module 7 — Catégories (`/admin/categories`)
- [x] Fiches catégories et modale d'ajout/édition adaptées au tactile
- [x] Audit visuel et validation anti-overflow

### Module 8 — Marketing (`/admin/marketing`)
- [x] Onglets de navigation marketing (Coupons, Promotions, Campagnes, Relance panier)
- [x] Fiches coupons et formulaires de création adaptés au mobile
- [x] Audit visuel et validation anti-overflow

### Module 9 — Blog & Contenu (`/admin/blog`)
- [x] Onglets internes (Articles, Catégories, Auteurs, Paramètres/SEO)
- [x] Fiches articles et modales d'édition `ArticleEditorDialog` adaptées sur smartphone
- [x] Audit visuel et validation anti-overflow

### Module 10 — Rapports & Finances (`/admin/rapports`)
- [x] Onglets analytiques (Performance commerciale, Bilan trésorerie)
- [x] Graphiques financiers et KPIs adaptatifs
- [x] Fiches d'audit financier et dialogue d'export responsive
- [x] Audit visuel et validation anti-overflow

### Module 11 — Paramètres (`/admin/parametres`)
- [x] Remplacer la colonne latérale par une barre d'onglets segmentée/défilable sur mobile
- [x] Adaptation des formulaires boutique, gestion collaborateurs et matrice de rôles
- [x] Audit visuel et validation anti-overflow

### Ajustements Ergonomiques & Retours Utilisateur (5 Small Fixes)
- [x] **Image 1** : Rétablir la couleur du sélecteur actif mobile avec la même couleur que sur desktop (dégradé vert menthe `#edf8ef` à `#e8f4ea`, texte vert forêt `#193e23`, icône et pastille rose poudrée `#c1647a`).
- [x] **Image 2** : Rendre la bannière PWA plus subtile et discrète (carte compacte et claire, micro-bouton élégant au lieu du pavé vert massif).
- [x] **Image 3** : Supprimer la redondance entre bottom navbar et drawer (retrait du bouton "Menu" du bottom bar qui compte désormais 4 items, et exclusion des 4 modules Dashboard/Commandes/Produits/Livraisons du drawer).
- [x] **Image 4** : Supprimer le sectionnage dans le drawer (retrait des en-têtes *ACTIVITÉ PRINCIPALE*, etc., liste plate directe des 7 modules restants).
- [x] **Image 5** : Bouton WhatsApp avec la véritable couleur officielle (`#25D366`) et le véritable logo WhatsApp officiel (bulle de dialogue avec combiné).

### Ajustements Structurels & Métier (/grill-me)
- [x] **Image 1 — Restructuration Chapeau/Extrait d'article** : Intégration directe du champ dans la 1ère carte d'informations générales (Titre & Slug) au lieu d'une carte séparée, libellé équilibré, textarea claire et compteur en dessous.
- [x] **Image 2 — Suppression note FCFA / Commissions** : Suppression de la bannière informative jaune dans la modale d'export des rapports d'activité (`ExportReportDialog`).
- [x] **Logique fix — Séparation Collaborateurs / Flotte Livraisons** : Retrait du rôle "Livreur" dans `UserEditorDialog` et dans le filtre de Paramètres. Exclusion des livreurs de la liste des collaborateurs au profit du module dédié `/admin/livraisons`, avec bandeau d'orientation et lien direct.

## Phase 5 — Refonte & Harmonisation UI Côté Particulier (Intégration Maquette Client)
- [x] **Bouton Flottant WhatsApp** : Implémentation du composant circulaire discret (52px, vert officiel `#25D366`, icône officielle, safe-area inset, message pré-rempli) persistant sur toute la vitrine publique.
- [x] **Section « Notre univers » (Homepage)** : Grille responsive 2x5 ou 2x6 avec typographie Cormorant/Jost, icônes florales raffinées, micro-interactions tactiles et redirection vers les catégories du catalogue.
- [x] **Bandeau Campagnes & Événements Saisonniers Haute Définition** : 4 visuels d'artisanat floral d'exception générés sur mesure (Roses rouges Saint-Valentin, Pivoines pastel Fête des Mères, Atelier floral Promotions, Panier de fraises fraîches du terroir) incrustés à gauche avec un fondu horizontal progressif dans les dégradés thématiques, et micro-zoom fluide (scale 1.06) au survol.
- [x] **Scénographie & Demande de Devis** :
  - Bloc d'appel à l'action sur la page d'accueil pour la scénographie sur mesure (mariages, hôtels, villas).
  - Formulaire interactif de demande de devis sur mesure directement intégré dans `/evenements` avec bouton direct WhatsApp.
- [x] **Page « À Propos » Enrichie & Hero Compact Luminous (`/a-propos`)** :
  - Déplacement des blocs éditoriaux de la maquette (Héritage familial & Primeur, les 8 Domaines de Savoir-Faire, les 7 Engagements et la Vision De Saly vers le Sénégal).
  - Suppression du voile vert opaque étouffant et réduction de la hauteur du hero (de 320px à 175px desktop / 155px mobile). La photo de l'atelier et de l'artisan fleuriste rayonne désormais sur la droite avec un scrim doux à gauche pour la lisibilité.
  - Maintien d'un bloc signature sobre et épuré sur la page d'accueil.
- [x] **Hero Section Homepage** : Enrichissement avec le sous-titre de la maquette et double CTA (Découvrir nos créations + Commander sur WhatsApp).
- [x] **Page Dédiée & Tunnel Compact « Abonnements Floraux » (`/abonnements`)** :
  - **Suppression du look « AI-generated » & Élimination du superflu** : Suppression du grand bandeau photo encombrant de 320px et des blocs verbeux de remplissage. Remplacement par un en-tête sobre et compact (`.abonnements-compact-header`).
  - **Visibilité immédiate au 1er coup d'œil (100vh / Above the fold)** : L'ensemble des 3 offres et des tarifs est directement visible à l'écran dès l'arrivée sur la page sans avoir à scroller.
  - **Tunnel séquentiel en 4 étapes fluides tenant sur le viewport** :
    1. *Étape 1 : Formule* : Bascule de fréquence Hebdomadaire (4 passages) / Bimensuel (2 passages), 3 cartes compactes (*Particulier & Villa* 25 000 FCFA, *Prestige & Réception* 50 000 FCFA, *Entreprise & Hôtellerie* 22 500 FCFA) et sélecteur compact à 3 onglets sur mobile (*Villa*, *Prestige ⭐*, *Entreprise*).
    2. *Étape 2 : Livraison & Coordonnées* : Formulaire direct avec rappel de l'offre choisie, sélecteur de jour de livraison (Mardi, Vendredi, Samedi) et repères locaux.
    3. *Étape 3 : Paiement avec Vrais Logos Officiels* : Cartes de paiement interactives intégrant les logos authentiques : Wave Sénégal (`/payment/wave.png`), Orange Money sur fond `#FF7900` (`/payment/orange-money.svg`), et Carte Bancaire Visa / Mastercard (`/payment/visa.svg`, `/payment/mastercard.svg`). Saisie du compte Mobile Money avec réassurance 0% frais.
    4. *Étape 4 : Confirmation & Ticket récapitulatif* : Écran de félicitations immédiat avec ticket de récapitulatif complet et bouton WhatsApp officiel (`#25D366`) pré-rempli pour notifier instantanément l'artisan.
  - **FAQ Compacte en accordéon** : 4 questions pratiques placées sous le tunnel sans encombrer la vue initiale.
- [x] **Refonte Haut de Gamme du Formulaire de Devis (`DevisForm`)** :
  - Restructuration intégrale en 4 étapes numérotées : Cartes visuelles de sélection d'événement (Mariage, Fête, Hôtel, Villa, Paysage, Sur mesure), Grille d'entrées avec icônes élégantes (Date, Lieu, Budget, Nom, Téléphone, Email), et zone d'expression aérée.
  - Élimination des collisions de texte et normalisation des hauteurs (touch targets 48px), bordures douces et focus rings végétaux.
  - Double bouton d'action (Envoi classique + Validation directe WhatsApp avec message pré-rempli) et 3 pastilles de réassurance.
- [x] **Correction Lisibilité & Contraste des Bannières Vitrine** :
  - Élimination des textes blancs sur fond clair (`#fff` sur fond crème) sur `/evenements` au profit d'un badge rose poudré contrasté (`.banner-badge` avec `#a0254c`) et d'un conteneur en verre dépoli avec typographie sombre haute définition.
  - Renforcement du scrim d'ombrage sur `/a-propos` et `/abonnements` via un double dégradé (horizontal 90deg + vertical 180deg) et ajout d'ombres portées typographiques (`text-shadow`), garantissant une lecture immédiate et sans fatigue visuelle sur ordinateur comme sur mobile.
- [x] **Contrôle Qualité & Recette Visuelle** : Audit Playwright desktop et mobile (390px/1280px), vérification de l'alignement, des espacements, de l'absence totale d'overflow horizontal et de la cohérence globale sur toutes les pages refondues.



