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

export const initialAdminUsers: AdminUser[] = [];

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

export const initialDeliveryZones: DeliveryZoneSettings[] = [];

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
