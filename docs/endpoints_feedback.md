# 📋 Spécifications des Endpoints Manquants — DécoFleur Plus

**Date de mise à jour :** 2026-11-11  
**Cible :** API Backend DécoFleur Plus (Branche `staging` / `production`)  
**Version backend actuelle :** Commit `57d32f0` (166 endpoints opérationnels dans `docs/apis.md`)  
**Objectif :** Définir formellement et exclusivement les routes REST, structures de requêtes et modèles de données attendus pour les **3 modules d'administration actuellement dépourvus d'endpoints backend** (total : **20 endpoints manquants**) :

> [!NOTE]
> Les 17 endpoints précédemment attendus (Google OAuth, réinitialisation de mot de passe, avis & évaluations catalogue, centre de notifications client et admin) ont été livrés et intégrés avec succès dans le backend (commit `57d32f0`).  
> **Ce document recense uniquement et strictement les endpoints restant à implémenter côté backend.**

### 📊 Tableau Récapitulatif des 20 Endpoints Manquants

| Module | Méthode | Route REST | Description | Rôles Requis |
|---|---|---|---|---|
| **Fournisseurs** | `GET` | `/api/v1/admin/suppliers` | Liste paginée avec recherche et filtres | `ADMIN, MANAGER` |
| **Fournisseurs** | `GET` | `/api/v1/admin/suppliers/{id}` | Détail avec historique commandes/factures | `ADMIN, MANAGER` |
| **Fournisseurs** | `POST` | `/api/v1/admin/suppliers` | Création d'un nouveau fournisseur | `ADMIN, MANAGER` |
| **Fournisseurs** | `PATCH` | `/api/v1/admin/suppliers/{id}` | Mise à jour des coordonnées / conditions | `ADMIN, MANAGER` |
| **Fournisseurs** | `DELETE` | `/api/v1/admin/suppliers/{id}` | Désactivation logique du fournisseur | `ADMIN` |
| **Approvisionnements** | `GET` | `/api/v1/admin/supplier-orders` | Liste paginée des commandes d'achat | `ADMIN, MANAGER, FLORIST` |
| **Approvisionnements** | `GET` | `/api/v1/admin/supplier-orders/{id}` | Détail complet d'une commande d'achat | `ADMIN, MANAGER, FLORIST` |
| **Approvisionnements** | `POST` | `/api/v1/admin/supplier-orders` | Création d'une commande d'achat | `ADMIN, MANAGER, FLORIST` |
| **Approvisionnements** | `POST` | `/api/v1/admin/supplier-orders/{id}/receive` | Réception marchandises & incrémentation stock | `ADMIN, MANAGER, FLORIST` |
| **Approvisionnements** | `GET` | `/api/v1/admin/supplier-invoices` | Liste des factures d'achat fournisseurs | `ADMIN, MANAGER, ACCOUNTANT` |
| **Approvisionnements** | `POST` | `/api/v1/admin/supplier-invoices` | Enregistrement d'une facture d'achat | `ADMIN, MANAGER, ACCOUNTANT` |
| **Approvisionnements** | `PATCH` | `/api/v1/admin/supplier-invoices/{id}/pay` | Règlement d'une facture fournisseur | `ADMIN, ACCOUNTANT` |
| **Paysagisme** | `GET` | `/api/v1/landscape-services` | Liste des prestations paysagères (Public) | 🌐 Public |
| **Paysagisme** | `GET` | `/api/v1/admin/landscape-services` | Liste complète des prestations (Admin) | `ADMIN, MANAGER` |
| **Paysagisme** | `POST` | `/api/v1/admin/landscape-services` | Création d'une nouvelle prestation | `ADMIN, MANAGER` |
| **Paysagisme** | `PATCH` | `/api/v1/admin/landscape-services/{id}` | Mise à jour d'une prestation existante | `ADMIN, MANAGER` |
| **Paysagisme** | `DELETE` | `/api/v1/admin/landscape-services/{id}` | Suppression / désactivation prestation | `ADMIN` |
| **Paysagisme** | `GET` | `/api/v1/landscape-projects` | Portfolio des réalisations paysagères | 🌐 Public |
| **Paysagisme** | `GET` | `/api/v1/admin/landscape-projects` | Gestion des réalisations (Admin) | `ADMIN, MANAGER` |
| **Paysagisme** | `POST` | `/api/v1/admin/landscape-projects` | Ajout d'une réalisation au portfolio | `ADMIN, MANAGER` |
| **Paysagisme** | `PATCH` | `/api/v1/admin/landscape-projects/{id}` | Mise à jour d'une réalisation | `ADMIN, MANAGER` |
| **Paysagisme** | `DELETE` | `/api/v1/admin/landscape-projects/{id}` | Suppression d'une réalisation | `ADMIN` |

---

## 1. Module Fournisseurs (`/admin/fournisseurs`)

Ce module gère le référentiel des partenaires horticoles, grossistes en fleurs fraîches, pépiniéristes et fournisseurs d'emballages.

### 1.1 `GET /api/v1/admin/suppliers`
- **Description :** Liste paginée des fournisseurs avec recherche et filtres.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Paramètres Query :**
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string, optionnel) : recherche sur `name`, `contactName`, `email`, `phone`
  - `status` (string, optionnel) : `ACTIVE` | `INACTIVE`
  - `category` (string, optionnel) : `FLEURS_COUPEES`, `PLANTES`, `ACCESSOIRES`, `EMBALLAGES`, `TERREAUX_ENGRAIS`
  - `sort` (string, optionnel) : `name_asc`, `name_desc`, `newest`
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
          "name": "Flora Sénégal SARL",
          "contactName": "Mamadou Diop",
          "email": "contact@florasenegal.sn",
          "phone": "+221 77 123 45 67",
          "address": "Route de Rufisque, Km 14, Dakar",
          "category": "FLEURS_COUPEES",
          "status": "ACTIVE",
          "paymentTerms": "30_DAYS",
          "totalOrders": 14,
          "totalSpent": 4850000,
          "createdAt": "2026-01-15T10:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

### 1.2 `GET /api/v1/admin/suppliers/:id`
- **Description :** Détail complet d'un fournisseur avec synthèse des commandes et factures associées.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": {
      "id": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
      "name": "Flora Sénégal SARL",
      "contactName": "Mamadou Diop",
      "email": "contact@florasenegal.sn",
      "phone": "+221 77 123 45 67",
      "address": "Route de Rufisque, Km 14, Dakar",
      "notes": "Fournisseur principal de roses et feuillages tropicaux.",
      "category": "FLEURS_COUPEES",
      "status": "ACTIVE",
      "paymentTerms": "30_DAYS",
      "bankDetails": "SN08 SN01 2345 6789 0123 45",
      "stats": {
        "totalOrders": 14,
        "totalSpent": 4850000,
        "pendingInvoicesCount": 2,
        "pendingInvoicesAmount": 650000
      },
      "recentOrders": [
        {
          "id": "ord-supp-001",
          "orderNumber": "CF-2026-0014",
          "totalAmount": 350000,
          "status": "RECEIVED",
          "expectedDate": "2026-11-01"
        }
      ]
    }
  }
  ```

### 1.3 `POST /api/v1/admin/suppliers`
- **Description :** Création d'un nouveau fournisseur.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Corps Requête (JSON) :**
  ```json
  {
    "name": "Horti Plus Petite-Côte",
    "contactName": "Aïssatou Sow",
    "email": "aissatou@hortiplus.sn",
    "phone": "+221 78 456 78 90",
    "address": "Ngaparou, Route de Saly",
    "category": "PLANTES",
    "paymentTerms": "IMMEDIATE",
    "notes": "Pépinière locale pour plantes vertes et arbustes méditerranéens."
  }
  ```
- **Validation :**
  - `name` : `z.string().min(2).max(100)` (Requis)
  - `contactName` : `z.string().min(2).max(100).optional()`
  - `email` : `z.string().email().optional()`
  - `phone` : `z.string().min(8).max(20)` (Requis)
  - `category` : enum `FLEURS_COUPEES` | `PLANTES` | `ACCESSOIRES` | `EMBALLAGES` | `TERREAUX_ENGRAIS` (Requis)
  - `paymentTerms` : enum `IMMEDIATE` | `15_DAYS` | `30_DAYS` | `60_DAYS` (Default: `30_DAYS`)
- **Réponse 201 :** Objet fournisseur créé.

### 1.4 `PATCH /api/v1/admin/suppliers/:id`
- **Description :** Mise à jour des coordonnées ou conditions d'un fournisseur.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Corps Requête :** Partiel des champs de création + `status` (`ACTIVE` | `INACTIVE`).
- **Réponse 200 :** Objet fournisseur mis à jour.

### 1.5 `DELETE /api/v1/admin/suppliers/:id`
- **Description :** Désactivation logique d'un fournisseur (statut `INACTIVE`, conservation pour l'historique comptable).
- **Rôles autorisés :** `ADMIN`
- **Réponse 200 :** `{ "success": true, "data": { "id": "...", "status": "INACTIVE" } }`

---

## 2. Module Approvisionnements & Achats (`/admin/approvisionnements`)

Ce module gère le cycle des commandes d'achat passées aux fournisseurs, le pointage à réception avec mise à jour du stock inventaire, et le suivi des factures d'achat.

### 2.1 Commandes d'Achat Fournisseurs

#### `GET /api/v1/admin/supplier-orders`
- **Description :** Liste paginée des commandes d'achat.
- **Rôles autorisés :** `ADMIN`, `MANAGER`, `FLORIST`
- **Paramètres Query :**
  - `page`, `limit`
  - `supplierId` (uuid, optionnel)
  - `status` (string, optionnel) : `DRAFT` | `CONFIRMED` | `SHIPPED` | `PARTIALLY_RECEIVED` | `RECEIVED` | `CANCELLED`
  - `dateFrom`, `dateTo` (ISO date, optionnel)
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "e4a8b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
          "orderNumber": "CF-2026-0042",
          "supplier": {
            "id": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
            "name": "Flora Sénégal SARL"
          },
          "status": "CONFIRMED",
          "totalAmount": 420000,
          "itemsCount": 5,
          "expectedDate": "2026-11-10",
          "createdAt": "2026-11-05T08:30:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
  ```

#### `GET /api/v1/admin/supplier-orders/:id`
- **Description :** Détail d'une commande fournisseur avec lignes d'articles et réceptions partielles.
- **Rôles autorisés :** `ADMIN`, `MANAGER`, `FLORIST`
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": {
      "id": "e4a8b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
      "orderNumber": "CF-2026-0042",
      "supplierId": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
      "supplier": {
        "id": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
        "name": "Flora Sénégal SARL",
        "email": "contact@florasenegal.sn",
        "phone": "+221 77 123 45 67"
      },
      "status": "CONFIRMED",
      "expectedDate": "2026-11-10",
      "totalAmount": 420000,
      "notes": "Livraison matinale avant 8h à la boutique de Saly.",
      "items": [
        {
          "id": "item-001",
          "variantId": "32640604-59c7-43dd-822c-af3bce51836f",
          "productName": "Roses Rouges Naomi",
          "sku": "BQ-ROSE-S",
          "quantityOrdered": 100,
          "quantityReceived": 0,
          "unitCost": 3500,
          "totalCost": 350000
        },
        {
          "id": "item-002",
          "variantId": null,
          "productName": "Feuillage Eucalyptus Cinerea",
          "sku": "MAT-EUC-01",
          "quantityOrdered": 20,
          "quantityReceived": 0,
          "unitCost": 3500,
          "totalCost": 70000
        }
      ],
      "createdAt": "2026-11-05T08:30:00.000Z"
    }
  }
  ```

#### `POST /api/v1/admin/supplier-orders`
- **Description :** Création d'une commande d'achat.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Corps Requête (JSON) :**
  ```json
  {
    "supplierId": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
    "expectedDate": "2026-11-10",
    "notes": "Commande hebdomadaire",
    "items": [
      {
        "variantId": "32640604-59c7-43dd-822c-af3bce51836f",
        "productName": "Roses Rouges Naomi",
        "sku": "BQ-ROSE-S",
        "quantityOrdered": 100,
        "unitCost": 3500
      }
    ]
  }
  ```

#### `POST /api/v1/admin/supplier-orders/:id/receive`
- **Description :** Enregistrement de la réception physique des marchandises. Met à jour automatiquement les stocks des variantes catalogue concernées (via mouvement `ENTRY`).
- **Rôles autorisés :** `ADMIN`, `MANAGER`, `FLORIST`
- **Corps Requête (JSON) :**
  ```json
  {
    "receptionDate": "2026-11-10T09:00:00.000Z",
    "notes": "Colis en bon état, toutes les tiges fraîches.",
    "items": [
      {
        "itemId": "item-001",
        "quantityReceived": 100
      }
    ]
  }
  ```
- **Effet de bord :** 
  - Si toutes les quantités sont reçues : `status` passe à `RECEIVED`.
  - Si réception partielle : `status` passe à `PARTIALLY_RECEIVED`.
  - Pour chaque `variantId` lié, le backend effectue un appel à la table `StockMovement` avec `type = 'ENTRY'`, `quantity = quantityReceived`, `reason = 'Réception commande CF-2026-0042'`.

---

### 2.2 Factures Fournisseurs (`/admin/approvisionnements/factures`)

#### `GET /api/v1/admin/supplier-invoices`
- **Description :** Liste des factures d'achat des fournisseurs.
- **Paramètres Query :** `page`, `limit`, `supplierId`, `status` (`DRAFT`, `PENDING`, `PAID`, `OVERDUE`).
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "fac-001",
          "invoiceNumber": "FAC-FLORA-892",
          "supplierOrderId": "e4a8b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
          "supplier": { "id": "...", "name": "Flora Sénégal SARL" },
          "amount": 420000,
          "issueDate": "2026-11-05",
          "dueDate": "2026-12-05",
          "status": "PENDING",
          "fileUrl": "https://pub-xxx.r2.dev/invoices/fac-892.pdf"
        }
      ],
      "total": 1
    }
  }
  ```

#### `POST /api/v1/admin/supplier-invoices`
- **Description :** Enregistrement d'une facture reçue du fournisseur.
- **Corps Requête (JSON) :**
  ```json
  {
    "supplierId": "c1f7a8e2-1a2b-4c3d-9e5f-123456789abc",
    "supplierOrderId": "e4a8b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
    "invoiceNumber": "FAC-FLORA-892",
    "amount": 420000,
    "issueDate": "2026-11-05",
    "dueDate": "2026-12-05",
    "fileUrl": "https://pub-xxx.r2.dev/invoices/fac-892.pdf",
    "notes": "Facture reçue par email."
  }
  ```

#### `PATCH /api/v1/admin/supplier-invoices/:id/pay`
- **Description :** Enregistrement d'un règlement de facture fournisseur.
- **Corps Requête (JSON) :**
  ```json
  {
    "paidAt": "2026-11-08T14:00:00.000Z",
    "paymentMethod": "VIREMENT_BANCAIRE",
    "transactionReference": "VIR-SN08-98421"
  }
  ```
- **Effet de bord :** Statut passe à `PAID`.

---

## 3. Module Paysagisme & Réalisations (`/admin/paysagisme`)

Ce module administre les prestations paysagères proposées (jardins de villa à Saly, terrasses végétalisées à Dakar, arrosage automatique) et le portfolio de réalisations pour les prospects.

### 3.1 Prestations Paysagères

#### `GET /api/v1/landscape-services` (Public) & `GET /api/v1/admin/landscape-services` (Admin)
- **Description :** Liste des prestations d'aménagement paysager et d'entretien.
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "land-srv-01",
        "slug": "creation-jardin-villa",
        "title": "Création & Aménagement de Jardin de Villa",
        "shortDescription": "Conception paysagère sur-mesure pour villas et résidences de standing.",
        "description": "Étude topographique, sélection d'essences tropicales adaptées au climat côtier, engazonnement et plantations.",
        "indicativePrice": "À partir de 500 000 FCFA sur devis",
        "coverImage": "https://pub-xxx.r2.dev/landscaping/villa-jardin.jpg",
        "images": ["https://pub-xxx.r2.dev/landscaping/villa-1.jpg"],
        "isActive": true,
        "order": 1
      }
    ]
  }
  ```

#### `POST /api/v1/admin/landscape-services`
- **Description :** Création d'une nouvelle prestation paysagère.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Corps Requête (JSON) :**
  ```json
  {
    "title": "Entretien Régulier & Taille Saisonnière",
    "slug": "entretien-regulier-jardin",
    "shortDescription": "Contrats mensuels pour villas et résidences.",
    "description": "Tonte, taille des haies, désherbage et fertilisation biologique.",
    "indicativePrice": "Dès 75 000 FCFA / mois",
    "coverImage": "https://pub-xxx.r2.dev/landscaping/entretien.jpg",
    "images": ["https://pub-xxx.r2.dev/landscaping/entretien.jpg"],
    "isActive": true,
    "order": 2
  }
  ```

#### `PATCH /api/v1/admin/landscape-services/:id`
- **Description :** Modification d'une prestation existante.
- **Rôles autorisés :** `ADMIN`, `MANAGER`

#### `DELETE /api/v1/admin/landscape-services/:id`
- **Description :** Désactivation ou suppression d'une prestation.
- **Rôles autorisés :** `ADMIN`

---

### 3.2 Réalisations & Portfolio Paysager

#### `GET /api/v1/landscape-projects` (Public) & `GET /api/v1/admin/landscape-projects` (Admin)
- **Description :** Liste des chantiers et réalisations avec filtres géographiques et catégories.
- **Paramètres Query :**
  - `category` (optionnel) : `VILLA`, `HOTEL_RESORT`, `TERRASSE_BALCON`, `ESPACE_ENTREPRISE`
  - `location` (optionnel) : `SALY`, `DAKAR`, `SOMONE`, `MBOUR`, `ALMADIES`
- **Réponse 200 :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "proj-001",
        "slug": "villa-somone-oasis",
        "title": "Oasis Tropicale — Villa Somone",
        "category": "VILLA",
        "location": "Somone, Petite-Côte",
        "clientType": "PARTICULIER",
        "completionDate": "2026-03",
        "description": "Aménagement complet des abords de piscine avec palmiers royaux, bougainvilliers panachés et gazon Paspalum.",
        "coverImage": "https://pub-xxx.r2.dev/landscaping/somone-pool.jpg",
        "images": [
          "https://pub-xxx.r2.dev/landscaping/somone-pool.jpg",
          "https://pub-xxx.r2.dev/landscaping/somone-avant.jpg"
        ],
        "isFeatured": true,
        "createdAt": "2026-03-20T12:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/v1/admin/landscape-projects`
- **Description :** Ajout d'une nouvelle réalisation au portfolio.
- **Rôles autorisés :** `ADMIN`, `MANAGER`
- **Corps Requête (JSON) :**
  ```json
  {
    "title": "Jardin Zen & Patio Éco-Lodge",
    "slug": "patio-eco-lodge-saly",
    "category": "HOTEL_RESORT",
    "location": "Saly Niakh Niakhal",
    "clientType": "PROFESSIONNEL",
    "completionDate": "2026-05",
    "description": "Végétalisation du patio intérieur avec plantes dépolluantes et éclairage solaire intégré.",
    "coverImage": "https://pub-xxx.r2.dev/landscaping/patio.jpg",
    "images": ["https://pub-xxx.r2.dev/landscaping/patio.jpg"],
    "isFeatured": true
  }
  ```

#### `PATCH /api/v1/admin/landscape-projects/:id`
- **Description :** Modification d'une réalisation existante.
- **Rôles autorisés :** `ADMIN`, `MANAGER`

#### `DELETE /api/v1/admin/landscape-projects/:id`
- **Description :** Suppression d'une réalisation du portfolio.
- **Rôles autorisés :** `ADMIN`

---

## 4. Synthèse d'Implémentation & Statut Côté Frontend

En attendant le développement et déploiement de ces routes sur le backend :
1. **Fournisseurs** (`/admin/fournisseurs`) : Vidage complet des mocks en dur, affichage d'un *empty state* professionnel signalant la disponibilité prochaine via API.
2. **Approvisionnements** (`/admin/approvisionnements`) : Vidage complet des mocks en dur, interface en lecture/attente connectée dès livraison des routes.
3. **Paysagisme** (`/admin/paysagisme`) : Vidage des mocks en dur et alignement sur la vitrine publique du paysagisme.
