import type {
  AdminRoleKey,
  AdminUser,
  RoleDefinition,
  AdminPermissionModule,
  BoutiqueSettings,
  PaymentGatewaySettings,
  DeliveryZoneSettings,
  NotificationSettings,
  SeoSettings,
} from './types';

export const adminRolesList: RoleDefinition[] = [
  {
    key: 'admin',
    label: 'Administrateur',
    description: 'Accès complet sans restriction à l’ensemble des modules, finances et configurations.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    key: 'gestionnaire',
    label: 'Gestionnaire Boutique',
    description: 'Gestion des commandes, catalogue produits, clients CRM et promotions.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    key: 'fleuriste',
    label: 'Fleuriste & Stock',
    description: 'Accès à l’atelier de composition, gestion des stocks floraux et arrivages.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    key: 'livreur',
    label: 'Livreur Saly & Dakar',
    description: 'Accès aux fiches de livraison, itinéraires et validation des remises en mains propres.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    key: 'comptable',
    label: 'Comptable / Trésorerie',
    description: 'Accès aux rapports financiers, Grand Livre, exports d’audit et passerelles de paiement.',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
];

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'USR-001',
    name: 'Aïssatou Ba',
    email: 'aissatou.ba@decofleurplus.sn',
    phone: '+221 77 941 78 60',
    role: 'admin',
    status: 'actif',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-10-13T05:15:00Z',
    createdAt: '2023-01-15T09:00:00Z',
  },
  {
    id: 'USR-002',
    name: 'Mamadou Sarr',
    email: 'm.sarr@decofleurplus.sn',
    phone: '+221 78 234 56 78',
    role: 'gestionnaire',
    status: 'actif',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-10-12T18:40:00Z',
    createdAt: '2023-04-10T11:00:00Z',
  },
  {
    id: 'USR-003',
    name: 'Fatou Sow',
    email: 'fatou.sow@decofleurplus.sn',
    phone: '+221 77 678 90 12',
    role: 'fleuriste',
    status: 'actif',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-10-13T04:50:00Z',
    createdAt: '2023-06-01T08:30:00Z',
  },
  {
    id: 'USR-004',
    name: 'Ibrahima Diallo',
    email: 'i.diallo@decofleurplus.sn',
    phone: '+221 77 567 89 01',
    role: 'livreur',
    status: 'actif',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-10-13T05:05:00Z',
    createdAt: '2023-08-15T14:20:00Z',
  },
  {
    id: 'USR-005',
    name: 'Khady Ndiaye',
    email: 'khady.finance@decofleurplus.sn',
    phone: '+221 70 456 78 90',
    role: 'comptable',
    status: 'actif',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-10-12T16:22:00Z',
    createdAt: '2024-01-08T10:00:00Z',
  },
  {
    id: 'USR-006',
    name: 'Cheikh Ndao',
    email: 'c.ndao@decofleurplus.sn',
    phone: '+221 77 123 45 67',
    role: 'livreur',
    status: 'inactif',
    lastLogin: '2026-09-28T11:10:00Z',
    createdAt: '2024-03-20T09:15:00Z',
  },
];

export const adminPermissionsMatrix: AdminPermissionModule[] = [
  {
    key: 'dashboard',
    label: 'Tableau de bord & KPIs',
    category: 'Général',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: false, delete: false, export: true },
      fleuriste: { read: true, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: true, write: false, delete: false, export: true },
    },
  },
  {
    key: 'commandes',
    label: 'Commandes & Suivi',
    category: 'Ventes',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: true },
      fleuriste: { read: true, write: true, delete: false, export: false },
      livreur: { read: true, write: true, delete: false, export: false },
      comptable: { read: true, write: false, delete: false, export: true },
    },
  },
  {
    key: 'produits',
    label: 'Catalogue Produits & Prix',
    category: 'Catalogue',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: true },
      fleuriste: { read: true, write: true, delete: false, export: false },
      livreur: { read: true, write: false, delete: false, export: false },
      comptable: { read: true, write: false, delete: false, export: true },
    },
  },
  {
    key: 'categories',
    label: 'Catégories Florales',
    category: 'Catalogue',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: false },
      fleuriste: { read: true, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: false, write: false, delete: false, export: false },
    },
  },
  {
    key: 'stock',
    label: 'Stock, Inventaire & Alertes',
    category: 'Logistique',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: true },
      fleuriste: { read: true, write: true, delete: false, export: true },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: true, write: false, delete: false, export: true },
    },
  },
  {
    key: 'livraisons',
    label: 'Livraisons & Assignation Livreurs',
    category: 'Logistique',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: true },
      fleuriste: { read: true, write: false, delete: false, export: false },
      livreur: { read: true, write: true, delete: false, export: false },
      comptable: { read: false, write: false, delete: false, export: false },
    },
  },
  {
    key: 'clients',
    label: 'Clients & CRM',
    category: 'Clients',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: true },
      fleuriste: { read: false, write: false, delete: false, export: false },
      livreur: { read: true, write: false, delete: false, export: false },
      comptable: { read: true, write: false, delete: false, export: true },
    },
  },
  {
    key: 'marketing',
    label: 'Promotions, Coupons & Campagnes',
    category: 'Marketing',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: true, delete: false, export: false },
      fleuriste: { read: false, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: false, write: false, delete: false, export: false },
    },
  },
  {
    key: 'blog',
    label: 'Blog & Articles Floraux',
    category: 'Contenu',
    permissions: {
      admin: { read: true, write: true, delete: true, export: false },
      gestionnaire: { read: true, write: true, delete: false, export: false },
      fleuriste: { read: true, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: false, write: false, delete: false, export: false },
    },
  },
  {
    key: 'rapports',
    label: 'Rapports & Grand Livre Financier',
    category: 'Finance',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: true, write: false, delete: false, export: false },
      fleuriste: { read: false, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: true, write: true, delete: false, export: true },
    },
  },
  {
    key: 'parametres',
    label: 'Paramètres Système & Collaborateurs',
    category: 'Administration',
    permissions: {
      admin: { read: true, write: true, delete: true, export: true },
      gestionnaire: { read: false, write: false, delete: false, export: false },
      fleuriste: { read: false, write: false, delete: false, export: false },
      livreur: { read: false, write: false, delete: false, export: false },
      comptable: { read: false, write: false, delete: false, export: false },
    },
  },
];

export const initialBoutiqueSettings: BoutiqueSettings = {
  shopName: 'Décofleur Plus',
  tagline: 'Nature en Élégance',
  contactEmail: 'contact@decofleurplus.sn',
  phoneDakar: '+221 77 941 78 60',
  phoneSaly: '+221 33 957 88 99',
  address: 'Saly, Rue des Palmiers, Saly Portudal, Sénégal',
  logoUrl: '/icons/icon-192.png',
  currency: 'XOF (Franc CFA)',
  timezone: 'Africa/Dakar (GMT+0)',
  openingHours: 'Lundi - Samedi : 08h30 - 20h00 | Dimanche : 09h00 - 15h00',
  orderPrefix: '#DFP-2024-',
};

export const initialPaymentSettings: PaymentGatewaySettings = {
  wave: {
    enabled: true,
    merchantId: 'WAV-SN-984210',
    absorbFees: true,
    feeRate: 0.01,
  },
  orangeMoney: {
    enabled: true,
    merchantNumber: '+221 78 234 56 78 (Orange Money Pro)',
    absorbFees: true,
    feeRate: 0.01,
  },
  card: {
    enabled: true,
    provider: 'Stripe / Paydunya (Visa & Mastercard)',
    absorbFees: false,
    feeRate: 0.025,
  },
  cash: {
    enabled: true,
    maxAmount: 100000,
  },
};

export const initialDeliveryZones: DeliveryZoneSettings[] = [
  {
    id: 'ZONE-SALY',
    name: 'Saly Portudal & Résidences',
    coverage: 'Saly Centre, Niakh Niakhal, Saly Tapée, Palm Beach',
    price: 2000,
    delayHours: 'Livraison en 2h chrono',
    freeAbove: 35000,
    enabled: true,
  },
  {
    id: 'ZONE-MBOUR',
    name: 'Mbour & Petite Côte',
    coverage: 'Mbour Ville, Grand Mbour, Saly Joseph, Somone',
    price: 3000,
    delayHours: 'Le jour même (avant 16h)',
    freeAbove: 50000,
    enabled: true,
  },
  {
    id: 'ZONE-DAKAR',
    name: 'Dakar & Environs',
    coverage: 'Plateau, Almadies, Fann, Yoff, Ouakam, Mermoz',
    price: 5000,
    delayHours: '24h ouvrées / Navette frigorifique',
    freeAbove: 75000,
    enabled: true,
  },
  {
    id: 'ZONE-NGAPAROU',
    name: 'Ngaparou & Nianing',
    coverage: 'Ngaparou, Nianing, Warang, Pointe Sarène',
    price: 4000,
    delayHours: 'Livraison dans la journée',
    freeAbove: 60000,
    enabled: true,
  },
];

export const initialNotificationSettings: NotificationSettings = {
  whatsappEnabled: true,
  smsEnabled: true,
  emailEnabled: true,
  onNewOrder: true,
  onDriverAssigned: true,
  onDelivered: true,
  onLowStock: true,
  adminAlertPhone: '+221 77 941 78 60',
  adminAlertEmail: 'alertes@decofleurplus.sn',
};

export const initialSeoSettings: SeoSettings = {
  metaTitle: 'Décofleur Plus | Fleuriste d’exception à Saly & Dakar (Sénégal)',
  metaDescription:
    'Fleuriste artisanal de prestige au Sénégal. Bouquets d’exception, roses fraîches, centres de table de mariage et plantes exotiques avec livraison express à Saly, Mbour et Dakar.',
  keywords:
    'fleuriste dakar, fleurs saly, bouquet de fleurs senegal, roses saly, livraison fleurs dakar, deco mariage senegal, plantes tropicales',
  ogImageUrl: '/images/og-decofleur.jpg',
  instagramUrl: 'https://instagram.com/decofleurplus',
  facebookUrl: 'https://facebook.com/decofleurplus',
  tiktokUrl: 'https://tiktok.com/@decofleurplus',
};
