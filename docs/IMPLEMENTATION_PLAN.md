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

## Phase 6 — Célébrations & Événements Saisonniers Dynamiques & Slogan de Marque
- [x] **Identité & Slogan Déco Fleur Plus** : Intégration du slogan officiel « Nature en Élégance » directement sous le logo Déco Fleur Plus dans le Header desktop et dans le drawer mobile en typographie fine serif italique dorée (`#a8793b`).
- [x] **Grand Hero Événementiel Immersif (`EventHero`)** :
  - Adaptation automatique du Hero de la page d'accueil à l'événement en cours sélectionné par l'administrateur.
  - 8 thèmes chromatiques sur mesure (`emerald`, `ruby`, `gold`, `rose`, `amber`, `purple`, `festive`, `standard`).
  - Visuels haute définition générés pour Tabaski, Magal de Touba, Gamou de Tivaouane, Korité, 8 Mars Journée des Droits des Femmes, Fête des Pères, Fête des Mères, Saint-Valentin et Noël.
  - Badges officiels, titre d'accroche avec emphase calligraphiée, bouton d'action thématique et bouton direct WhatsApp express pré-rempli.
- [x] **Section Coordonnée « Créations Dédiées à la Célébration » (`EventFeaturedRow`)** :
  - Carte haute à gauche adaptée à la fête du moment.
  - Grille de 4 bouquets, lys, orchidées ou corbeilles de fruits associées à l'événement.
  - Titre dynamique et lien direct vers la collection thématique sans chevauchement responsive.
- [x] **Studio Scénographique & Cockpit en Direct (`/admin/marketing`)** :
  - Remplacement de la grille standard de cartes par un "Studio Scénographique" créatif hors de l'ordinaire.
  - *Master Stage de simulation* intégrant un commutateur Desktop (1280px) et Mobile (390px) pour prévisualiser la scénographie en conditions réelles sans quitter le back-office.
  - *Dock Scénographique horizontal* fluide et ergonomique avec miniatures panoramiques des 9 célébrations et filtres thématiques (Fêtes religieuses, Romance, Famille, Fin d'année).
  - Barre de commande du cockpit avec projection & publication instantanée en 1 clic sur la vitrine.
  - Boîte de dialogue d'édition avancée `EditEventDialog` synchronisée en temps réel avec le stockage réactif local.
- [x] **Visuels Culturels Ultra-Évocateurs Haute Résolution** :
  - *Tabaski (Aïd el-Kébir)* : Bélier Ladoum noble aux cornes dorées majestueuses aux côtés d'une table de fête avec lys blancs, roses crème et corbeilles de fruits tropicaux.
  - *Grand Magal de Touba* : Grande Mosquée de Touba illuminée au crépuscule doré avec urnes florales royales d'accueil et d'hospitalité (Berndé).
  - *Gamou de Tivaouane* : Mosquée aux coupoles vertes sous une lumière spirituelle douce avec tubéreuses parfumées et lys immaculés.
  - *Korité (Aïd el-Fitr)* : Salon de fête chaleureux avec plateau de dattes dorées, douceurs traditionnelles et compositions fleuries printanières.
  - *Saint-Valentin* : Dîner romantique aux chandelles sur une terrasse privée face aux vagues de Saly Portudal avec roses rouges passion et champagne.
- [x] **Harmonisation Responsivité & Confort Mobile** :
  - Masquage automatique du bouton flottant WhatsApp lors de l'ouverture du tiroir de navigation mobile (évite tout chevauchement avec "Abonnements floraux").
  - Symétrie et pleine largeur des boutons d'action du Hero sur smartphone pour un équilibre visuel parfait.
  - Scrims de contraste adaptatifs par thème pour une lisibilité absolue sous toutes les conditions d'éclairage.

## Phase 7 — Refonte Vitrine & PWA Fidèle au Mockup Client (New Mockup)
- [x] **Étape 1 — Génération & Intégration des Visuels Clés** :
  - Génération de la boîte florale signature noire de luxe avec typographie dorée « Décofleur Plus — Nature en Élégance — » débordant de roses délicates (blush, pêche, corail, ivoire) et feuillage d'eucalyptus.
  - Préparation des feuillages botaniques d'eucalyptus pour les coins d'écran (top-left & top-right).
  - Visuel haute définition banquet de mariage pour la carte verticale « Événements & Mariages ».
  - Visuel pour le bandeau « Cartes Cadeaux ».
- [x] **Étape 2 — Feuilles Botaniques aux Coins d'Écran (`BotanicalCorners`)** :
  - Implémentation du composant décoratif discret d'eucalyptus en superposition douce aux coins de l'écran, avec `pointer-events: none` et adaptation responsive sans débordement horizontal.
- [x] **Étape 3 — Header & Mobile PWA 5 Onglets** :
  - Header desktop : Topbar sombre avec repères locaux Saly/Mbour et contact, barre de recherche centrale élargie, icônes favoris et panier rose avec pastille.
  - Header mobile : Hamburger menu gauche, logo centré « Nature en Élégance », icône recherche et panier rose avec badge.
  - Bottom Tab Bar mobile (PWA) : Mise à niveau à 5 onglets tactiles conformes au mockup (Accueil en rose actif, Catégories avec icône grille, Favoris avec badge compteur, Panier avec pastille rose, Compte profil).
- [x] **Étape 4 — Nouveau Hero Signature Fidèle au Mockup** :
  - Badge rose « Bienvenue chez Décofleur Plus » avec cœur.
  - Grand titre serif vert profond `#173f22` « Des fleurs, des idées, des émotions ».
  - Sous-titre officiel artisanal avec puces végétales.
  - Bouton pilule rose fuchsia « Découvrir nos produits → ».
  - Bloc visuel droit : Boîte florale signature ronde noire + calligraphie cursive « L'élégance de la nature à chaque instant » et arabesques.
  - Rendu mobile compact identique à la maquette smartphone.
- [x] **Étape 5 — 7 Catégories Circulaires du Mockup** :
  - 7 pastilles circulaires pastel avec icônes raffinées et libellés exacts (Bouquets élégants, Décoration sur mesure, Mariages & événements, Livraison à domicile, Paniers de fruits, Cadeaux, Location de vaisselle & matériel).
  - Version desktop fluide et version mobile en 2 rangées / scroll tactile.
- [x] **Étape 6 — Section Phare : Carte Événements & Grille 4 Produits** :
  - Carte haute gauche « Événements & Mariages » avec photo banquet et bouton rose « En savoir plus → ».
  - Grille droite « Nos produits phares » avec les 4 fiches exactes du mockup (Bouquet Élégance Rose, Panier de fruits tropicaux, Centre de table mariage, Coffret cadeau luxe) avec leurs prix FCFA, badges et avis.
  - Défilement tactile adapté sur smartphone.
- [x] **Étape 7 — Réassurance, Carte Cadeau & Avis Clients (« Ils nous font confiance »)** :
  - 4 badges de réassurance (Livraison rapide, Paiement sécurisé Wave & OM, Fleurs fraîches, Service client).
  - Bannière carte cadeau « Offrez des émotions avec nos cartes cadeaux » avec photo et bouton rose.
  - Grille d'avis clients avec les 3 témoignages réels (Awa Diop, Mamadou Sarr, Fatou Bâ) et pagination par points.
- [x] **Étape 8 — Footer Sombre & Calligraphie du Mockup** :
  - Fond vert forêt `#132c1b` / `#16321f`, logo blanc/doré, Liens rapides, Réseaux sociaux, Inscription newsletter avec bouton rose, et citation calligraphique sur 3 lignes avec cœur central.
- [x] **Étape 9 — Préservation & Liaison des Fonctionnalités Existantes** :
  - Maintien du tunnel d'abonnements floraux, du devis scénographique sur mesure et des campagnes saisonnières, accessibles via navigation et bannières discrètes.
- [x] **Étape 10 — Recette Visuelle (Desktop & Mobile) & Validation TypeScript** :
  - Contrôle pixel-perfect, tests responsive 1280px et 390px, 0 erreur TypeScript (`tsc --noEmit`).

## Phase 8 — Extensions Métier (Showcase Design System & Roadmap)

### Étape 1 — Fondations de Données & Types Métier
- [x] Définir les types TypeScript dans `lib/admin/mock-data/types.ts` pour Fournisseurs, Commandes d'approvisionnement, Réceptions, Factures fournisseurs, Prestations paysagisme, Réalisations, Devis, Équipements de location et Réservations.
- [x] Créer les stores mock-data réactifs :
  - `lib/admin/mock-data/suppliers.ts` (Fournisseurs, Commandes CF-2024-*, Réceptions, Factures FAC-2024-*)
  - `lib/admin/mock-data/landscaping.ts` (Prestations, Réalisations avec images HD générées, Catégories)
  - `lib/admin/mock-data/quotes.ts` (Demandes de devis DEV-2024-* avec pièces jointes et propositions)
  - `lib/admin/mock-data/rentals.ts` (Équipements, Tarifs, Cautions, Réservations RL-2024-*, Disponibilités et Gantt timeline)
- [x] Exporter l'ensemble dans `lib/admin/mock-data/index.ts`.

### Étape 2 — Navigation & Header / Sidebar
- [x] Mettre à jour `components/site-header.tsx` pour intégrer « Paysagisme » (dropdown Prestations, Réalisations, Devis) et « Location » dans la barre de navigation principale publique comme sur le mockup.
- [x] Mettre à jour `components/admin/admin-sidebar.tsx` et le drawer mobile pour ajouter les liens :
  - Fournisseurs (`/admin/fournisseurs`)
  - Approvisionnements (`/admin/approvisionnements`)
  - Devis (`/admin/devis`)
  - Location (`/admin/location`)
  - Paysagisme (`/admin/paysagisme`)

### Étape 3 — Module B : Paysagisme et Aménagement Vert (Site public)
- [x] Créer `app/paysagisme/page.tsx` (Maquette Écran 1) : Hero banner avec photo piscine villa de luxe HD, 4 pastilles circulaires (Jardins, Terrasses, Espaces pro, Entretien), et section "Nos réalisations" (Villas, Hôtels, Bureaux).
- [x] Créer `app/paysagisme/prestations/page.tsx` (Maquette Écran 2) : Grille des 6 prestations avec visuels HD, descriptions et modal "En savoir plus", avec bannière CTA devis.
- [x] Créer `app/paysagisme/realisations/page.tsx` (Maquette Écran 3) : Filtres en pilules et galerie en mosaïque avec modale de zoom/détail ("Villa Almadies", etc.).
- [x] Créer `app/admin/(protected)/paysagisme/page.tsx` : Gestion des prestations et réalisations dans le back-office.

### Étape 4 — Module C : Demande de Devis (Site public & Back-office)
- [x] Créer `app/paysagisme/devis/page.tsx` (Maquette Écran 4) : Stepper 4 étapes (1 Informations, 2 Détails du projet, 3 Photos, 4 Validation), drag & drop d'upload de photos réelles avec aperçu/suppression, enregistrement local, référence DEV-2024-* et option WhatsApp.
- [x] Créer `app/admin/(protected)/devis/page.tsx` : Tableau de bord de gestion des devis, vue détaillée avec photos du client, modification de statut et générateur de proposition commerciale chiffrée.

### Étape 5 — Module D : Location Événementielle (Site public & Back-office)
- [x] Créer `app/location/page.tsx` (Maquette Écran 5) : Hero banquet prestige HD, 4 catégories (Mobilier, Vaisselle, Décoration florale, Accessoires), "Nos équipements phares" (Table ronde, Chaise Chiavari, Arche florale, Centre de table), et modale de réservation interactive avec calcul du coût et de la caution séparée.
- [x] Créer `app/admin/(protected)/location/page.tsx` (Maquette Écrans 12 & 13) :
  - Onglet 1 : Réservations de location (RL-2024-*), statuts, suivi des cautions et remises.
  - Onglet 2 : Calendrier / Planning interactif Mars 2024 (vue Gantt avec barres de réservation colorées selon le statut).
  - Onglet 3 : Gestion du catalogue d'équipements de location.

### Étape 6 — Module A : Fournisseurs et Approvisionnements (Back-office)
- [x] Créer `app/admin/(protected)/fournisseurs/page.tsx` (Maquette Écran 6) : Tableau des fournisseurs (Flora Sénégal, Horti Plus, Green Supply, Afrifleurs, Eco Jardin) avec filtres, recherche, statut et modale "+ Ajouter un fournisseur".
- [x] Créer `app/admin/(protected)/fournisseurs/[id]/page.tsx` (Maquette Écran 7) : Fiche détaillée fournisseur avec 5 onglets (Informations, Produits, Commandes, Factures, Historique).
- [x] Créer `app/admin/(protected)/approvisionnements/page.tsx` (Maquette Écran 8) : Commandes fournisseurs CF-2024-* avec filtres par statut à onglets, recherche et modale de création "+ Nouvelle commande" avec export bon de commande.
- [x] Créer `app/admin/(protected)/approvisionnements/reception/[id]/page.tsx` (Maquette Écran 9) : Réception de commande avec tableau des quantités reçues vs commandées, calcul d'écarts et bouton "Enregistrer la réception" synchronisé avec le stock.
- [x] Créer `app/admin/(protected)/approvisionnements/factures/page.tsx` (Maquette Écran 10 / 12) : Factures fournisseurs FAC-2024-* avec onglets de statut (À payer, Payée, En retard, etc.) et modale "+ Ajouter une facture".

### Étape 7 — Contrôle Qualité, Recette Visuelle & Tests
- [x] Vérification TypeScript intégrale (`tsc --noEmit`) : 0 erreur.
- [x] Vérification de la conformité visuelle avec `mockups/Décofleur Plus Design System Showcase.png` pour l'ensemble des 13 écrans.
- [x] Validation responsive Desktop et Mobile.
- [x] Vérification HTTP (200 OK sur les 13 routes).
- [x] Mise à jour finale de la documentation (`IMPLEMENTATION_PLAN.md` & `IMPLEMENTATION_STATUS.md`).
