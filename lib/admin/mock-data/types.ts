/* ── Admin Back-office Types ─────────────────────── */

export type OrderStatus =
  | 'nouvelle'
  | 'en_preparation'
  | 'en_livraison'
  | 'livree'
  | 'annulee'
  | 'remboursee';

export type ProductStatus = 'actif' | 'inactif' | 'rupture';

export type CustomerSegment = 'particulier' | 'entreprise' | 'vip';

export type AdminProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  promoPrice?: number;
  sku: string;
  stock: number;
  minStock?: number;
  status: ProductStatus;
  image: string;
  images: string[];
  description: string;
  featured: boolean;
  createdAt: string;
  rating: number;
  reviews: number;
};

export type StockMovementType = 'entree' | 'sortie' | 'ajustement';

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  author: string;
};


export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: string;
};

export type AdminOrder = {
  id: string;
  ref: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  deliveryAddress: string;
  deliveryMode: string;
  deliveryFee: number;
  paymentMethod: string;
  notes?: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  totalOrders: number;
  totalSpent: number;
  status: 'actif' | 'inactif';
  joinedAt: string;
  avatar?: string;
  address?: string;
  lastOrderDate?: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'actif' | 'inactif';
};

export type KpiData = {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  products: number;
  productsDelta: number;
};

export type ChartPoint = {
  label: string;
  sales: number;
  orders: number;
};

export type OrderDistribution = {
  status: OrderStatus;
  count: number;
  percentage: number;
};

export type DeliveryStatus = 'a_livrer' | 'en_cours' | 'livree' | 'echec';

export type DeliveryDriver = {
  id: string;
  name: string;
  phone: string;
  vehicle: 'Moto' | 'Scooter' | 'Fourgonnette' | 'Voiture';
  vehiclePlate?: string;
  status: 'disponible' | 'en_course' | 'indisponible';
  activeDeliveriesCount: number;
  rating: number;
  avatar?: string;
};

export type DeliveryTrackingStep = {
  step: 'preparation' | 'prise_en_charge' | 'en_acheminement' | 'livre';
  label: string;
  time?: string;
  completed: boolean;
};

export type AdminDelivery = {
  id: string;
  orderId: string;
  orderRef: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: 'Saly' | 'Mbour' | 'Somone' | 'Ngaparou' | 'Dakar' | 'Autre';
  deliveryMode: 'Livraison express' | 'Livraison standard' | 'Retrait boutique';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  status: DeliveryStatus;
  scheduledDate: string;
  timeSlot: string;
  deliveredAt?: string;
  recipientName?: string;
  deliveryFee: number;
  itemsSummary: string;
  notes?: string;
  trackingSteps?: DeliveryTrackingStep[];
};

/* ── Marketing & Promotions Types ───────────────────── */

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type CouponStatus = 'actif' | 'programme' | 'expire' | 'epuise' | 'inactif';

export type AdminCoupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUsageTotal?: number;
  currentUsageCount: number;
  maxUsagePerCustomer?: number;
  startDate: string;
  endDate: string;
  status: CouponStatus;
  revenueGenerated: number;
  description?: string;
};

export type PromotionTargetType = 'all' | 'categories' | 'products';
export type PromotionStatus = 'active' | 'programmee' | 'terminee' | 'inactive';

export type AdminPromotion = {
  id: string;
  name: string;
  targetType: PromotionTargetType;
  targetNames: string[];
  discountPercentage: number;
  startDate: string;
  endDate: string;
  badgeText: string;
  status: PromotionStatus;
  salesCount: number;
  revenueGenerated: number;
};

export type CampaignChannel = 'whatsapp' | 'sms' | 'email';
export type CampaignStatus = 'envoyee' | 'programmee' | 'brouillon';

export type AdminCampaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  audience: string;
  recipientCount: number;
  sentAt?: string;
  scheduledAt?: string;
  openRate?: number;
  clickRate?: number;
  conversionCount: number;
  revenueGenerated: number;
  status: CampaignStatus;
  messageContent: string;
};

export type CartRecoveryStatus =
  | 'a_relancer'
  | 'relance_1_envoyee'
  | 'relance_2_envoyee'
  | 'recupere'
  | 'expire';

export type AdminAbandonedCart = {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  abandonedAt: string;
  status: CartRecoveryStatus;
  lastReminderAt?: string;
  recoveryChannel?: 'whatsapp' | 'email';
  recoveredAt?: string;
};

export type CartRecoverySettings = {
  autoEnabled: boolean;
  delayHours1: number;
  delayHours2: number;
  includeDiscount: boolean;
  discountCode: string;
  discountValue: string;
};

/* ── Blog & Contenu Types ────────────────────────────── */

export type BlogArticleStatus = 'publie' | 'brouillon' | 'planifie' | 'archive';

export type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  coverImage: string;
  coverImageCaption?: string;
  excerpt: string;
  content: string;
  readTime: string;
  status: BlogArticleStatus;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  relatedProductIds?: string[];
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  articlesCount: number;
  coverImage?: string;
};

export type BlogAuthor = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  articlesCount: number;
};

/* ── Rapports & Finances Types ───────────────────────── */

export type ReportPeriodPreset =
  | 'today'
  | '7days'
  | '30days'
  | 'this_month'
  | 'this_year'
  | 'custom';

export type PaymentMethodType = 'wave' | 'orange_money' | 'carte_bancaire' | 'especes';

export type SettlementStatus = 'encaisse' | 'en_attente' | 'rembourse';

export type FinancialTransaction = {
  id: string;
  ref: string;
  orderId: string;
  orderRef: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethodType;
  grossAmount: number;
  gatewayFeeRate: number; // e.g. 0.01 for 1%
  gatewayFee: number;
  netAmount: number;
  status: SettlementStatus;
  date: string;
  settlementDate?: string;
  gatewayRef?: string;
  notes?: string;
};

export type SalesTimePoint = {
  date: string;
  label: string;
  sales: number;
  orders: number;
  previousSales: number;
};

export type SalesByCategory = {
  category: string;
  salesCount: number;
  revenue: number;
  percentage: number;
  color: string;
};

export type SalesByZone = {
  zone: string;
  ordersCount: number;
  revenue: number;
  percentage: number;
};

export type TopSellingProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  quantitySold: number;
  revenue: number;
  averagePrice: number;
  marginRate: number;
};

export type PaymentMethodBreakdown = {
  method: PaymentMethodType;
  label: string;
  count: number;
  grossRevenue: number;
  fees: number;
  netRevenue: number;
  percentage: number;
  color: string;
};

export type PeriodMetrics = {
  grossRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  collectedAmount: number;
  pendingAmount: number;
  gatewayFees: number;
  netRevenue: number;
};

export type ReportDataset = {
  periodLabel: string;
  comparisonLabel: string;
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    revenueDelta: number;
    ordersDelta: number;
    aovDelta: number;
    customersDelta: number;
    netDelta: number;
  };
  chartPoints: SalesTimePoint[];
  topProducts: TopSellingProduct[];
  categoriesBreakdown: SalesByCategory[];
  zonesBreakdown: SalesByZone[];
  paymentBreakdown: PaymentMethodBreakdown[];
};

// ── Types Paramètres & Équipe (Maquettes 15 & 16) ───────────────────
export type AdminRoleKey =
  | 'admin'
  | 'gestionnaire'
  | 'fleuriste'
  | 'livreur'
  | 'comptable';

export type AdminUserStatus = 'actif' | 'inactif' | 'en_attente';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRoleKey;
  status: AdminUserStatus;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
};

export type RoleDefinition = {
  key: AdminRoleKey;
  label: string;
  description: string;
  badgeClass: string;
};

export type AdminPermissionModule = {
  key: string;
  label: string;
  category: string;
  permissions: Record<
    AdminRoleKey,
    {
      read: boolean;
      write: boolean;
      delete: boolean;
      export: boolean;
    }
  >;
};

export type BoutiqueSettings = {
  shopName: string;
  tagline: string;
  contactEmail: string;
  phoneDakar: string;
  phoneSaly: string;
  address: string;
  logoUrl: string;
  currency: string;
  timezone: string;
  openingHours: string;
  orderPrefix: string;
};

export type PaymentGatewaySettings = {
  wave: {
    enabled: boolean;
    merchantId: string;
    absorbFees: boolean;
    feeRate: number;
  };
  orangeMoney: {
    enabled: boolean;
    merchantNumber: string;
    absorbFees: boolean;
    feeRate: number;
  };
  card: {
    enabled: boolean;
    provider: string;
    absorbFees: boolean;
    feeRate: number;
  };
  cash: {
    enabled: boolean;
    maxAmount: number;
  };
};

export type DeliveryZoneSettings = {
  id: string;
  name: string;
  coverage: string;
  price: number;
  delayHours: string;
  freeAbove?: number;
  enabled: boolean;
};

export type NotificationSettings = {
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  onNewOrder: boolean;
  onDriverAssigned: boolean;
  onDelivered: boolean;
  onLowStock: boolean;
  adminAlertPhone: string;
  adminAlertEmail: string;
};

export type SeoSettings = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
};

/* ── Fournisseurs & Approvisionnements (Module A) ── */
export type SupplierStatus = 'actif' | 'inactif';

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  paymentTerms: string;
  leadTime: string;
  minOrder: number;
  status: SupplierStatus;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
};

export type SupplierOrderStatus =
  | 'brouillon'
  | 'a_valider'
  | 'validee'
  | 'envoyee'
  | 'en_cours'
  | 'receptionnee'
  | 'annulee';

export type SupplierOrderItem = {
  id: string;
  productId?: string;
  name: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  total: number;
  status: 'complete' | 'partielle' | 'en_attente';
};

export type SupplierOrder = {
  id: string; // CF-2024-0012
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate: string;
  items: SupplierOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: SupplierOrderStatus;
  notes?: string;
};

export type SupplierInvoiceStatus =
  | 'a_verifier'
  | 'a_payer'
  | 'payee'
  | 'en_retard'
  | 'contestee'
  | 'annulee';

export type SupplierInvoice = {
  id: string; // FAC-2024-0045
  supplierId: string;
  supplierName: string;
  orderId?: string;
  date: string;
  dueDate: string;
  amount: number;
  status: SupplierInvoiceStatus;
  notes?: string;
};

/* ── Paysagisme & Aménagement Vert (Module B) ── */
export type LandscapePrestation = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  image: string;
  benefits?: string[];
  features?: string[];
};

export type LandscapeProjectCategory =
  | 'jardins'
  | 'terrasses'
  | 'villas'
  | 'hotels'
  | 'bureaux';

export type LandscapeProject = {
  id: string;
  title: string;
  category: LandscapeProjectCategory;
  categoryLabel: string;
  location: string;
  description: string;
  image: string;
  featured?: boolean;
  tags: string[];
};

/* ── Demandes de Devis (Module C) ── */
export type QuoteStatus =
  | 'nouvelle'
  | 'en_cours'
  | 'devis_envoye'
  | 'acceptee'
  | 'refusee'
  | 'terminee';

export type LandscapeQuote = {
  id: string; // DEV-2024-0089
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company?: string;
  prestationType: string;
  spaceType: string;
  surfaceArea: string;
  desiredDate: string;
  location: string;
  description: string;
  budget?: string;
  maintenanceFrequency?: string;
  photos: string[];
  status: QuoteStatus;
  notes?: string;
  quoteAmount?: number;
  quoteItems?: { description: string; qty: number; unitPrice: number; total: number }[];
};

/* ── Location Événementielle (Module D) ── */
export type RentalEquipmentCategory =
  | 'mobilier'
  | 'vaisselle'
  | 'decoration'
  | 'accessoires';

export type RentalEquipment = {
  id: string;
  name: string;
  category: RentalEquipmentCategory;
  categoryLabel: string;
  pricePerDay: number;
  deposit: number; // caution
  totalStock: number;
  availableStock: number;
  image: string;
  description: string;
  dimensions?: string;
  status: 'disponible' | 'stock_faible' | 'indisponible';
};

export type RentalReservationStatus =
  | 'en_attente'
  | 'confirmee'
  | 'en_cours'
  | 'terminee'
  | 'annulee';

export type RentalReservation = {
  id: string; // RL-2024-0032
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  startDate: string; // 2024-03-15
  endDate: string; // 2024-03-17
  totalRental: number;
  deposit: number;
  status: RentalReservationStatus;
  notes?: string;
};
