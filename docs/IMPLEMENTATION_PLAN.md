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

### Gestion du stock (Stock)
- [ ] Create `/admin/stock` page layout
- [ ] Implement Stock DataTable with Low Stock alerts

### Gestion des livraisons (Deliveries)
- [ ] Create `/admin/livraisons` page layout
- [ ] Implement Deliveries DataTable

### Gestion des catégories (Categories)
- [ ] Create `/admin/categories` page layout
- [ ] Implement Categories DataTable
- [ ] Implement Category creation/editing modal

### Marketing
- [ ] Create `/admin/marketing` page layout
- [ ] Implement Promotions & Coupons DataTable
- [ ] Implement Campaign management & Cart recovery features

### Blog & Contenu
- [ ] Create `/admin/blog` page layout
- [ ] Implement Articles & Categories management
- [ ] Implement Article editor with Drafts/Publication status

### Rapports (Finances & Reports)
- [ ] Create `/admin/rapports` page layout
- [ ] Implement Revenue, Payments, and Refunds charts
- [ ] Implement detailed statistical reporting views

### Paramètres (Settings)
- [ ] Create `/admin/parametres` page layout
- [ ] Implement settings tabs (General, Users, Roles, etc.)
