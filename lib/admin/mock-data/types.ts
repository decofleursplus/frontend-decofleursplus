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
