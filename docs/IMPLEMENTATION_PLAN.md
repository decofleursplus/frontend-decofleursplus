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


