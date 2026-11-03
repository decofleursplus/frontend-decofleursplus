import { apiClient } from './client';

export interface DeliveryZone {
  id: string;
  name: string;
  slug: string;
  coverage: string | null;
  fee: number;
  expressFee: number;
  freeAbove: number | null;
  estimatedTimeHours: number;
  sortOrder: number;
  isActive: boolean;
}

export interface OrderCartItemInput {
  variantId: string;
  quantity: number;
  giftWrap?: boolean;
  cardMessage?: string;
}

export interface QuoteCartPayload {
  items: OrderCartItemInput[];
  deliveryMode?: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  deliveryZoneId?: string;
  couponCode?: string;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
}

export interface QuoteCartResponse {
  totals: OrderTotals;
  zone: DeliveryZone | null;
  appliedCoupon?: { id: string; code: string; discountAmount: number } | null;
}

export interface PlaceOrderPayload {
  items: OrderCartItemInput[];
  deliveryMode?: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  deliveryZoneId?: string;
  couponCode?: string;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARD' | 'CASH_ON_DELIVERY';
  phone?: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  timeSlot?: '9h-12h' | '10h-14h' | '14h-18h' | '18h-20h';
  notes?: string;
}

export interface CustomerOrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  image: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftWrap: boolean;
  cardMessage: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  orderStatus: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARD' | 'CASH_ON_DELIVERY';
  deliveryMode: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  recipientName?: string | null;
  phone?: string | null;
  deliveryAddress?: string | null;
  deliveryDate?: string | null;
  timeSlot?: string | null;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  items: CustomerOrderItem[];
  checkoutUrl?: string | null;
  createdAt: string;
}

export interface DeliveryTrackingStep {
  step: 'preparation' | 'prise_en_charge' | 'en_acheminement' | 'livre';
  label: string;
  time: string | null;
  completed: boolean;
}

export interface DeliveryTracking {
  orderNumber: string;
  orderStatus: string;
  deliveryMode: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  deliveryStatus: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | null;
  deliveryAddress?: string | null;
  deliveryZone?: { id: string; name: string } | null;
  scheduledDate?: string | null;
  timeSlot?: string | null;
  driver?: { name: string; phone: string; vehicle?: string } | null;
  deliveredAt?: string | null;
  failureReason?: string | null;
  steps: DeliveryTrackingStep[];
}

export interface PaginatedOrders {
  items: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Récupère les zones de livraison actives
 * Endpoint: GET /api/v1/delivery-zones
 */
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  try {
    const zones = await apiClient.get<DeliveryZone[]>('/delivery-zones');
    return zones || [];
  } catch {
    return [];
  }
}

/**
 * Calcule et valide le montant du panier côté serveur
 * Endpoint: POST /api/v1/orders/quote
 */
export async function quoteOrder(payload: QuoteCartPayload): Promise<QuoteCartResponse | null> {
  try {
    const res = await apiClient.post<QuoteCartResponse>('/orders/quote', payload);
    return res;
  } catch {
    return null;
  }
}

/**
 * Crée une commande et initialise le paiement NabooPay (si applicable)
 * Endpoint: POST /api/v1/orders
 */
export async function placeOrder(payload: PlaceOrderPayload): Promise<{
  success: boolean;
  order?: CustomerOrder;
  error?: string;
}> {
  try {
    const order = await apiClient.post<CustomerOrder>('/orders', payload);
    return { success: true, order };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible de créer la commande. Veuillez vérifier vos informations.',
    };
  }
}

/**
 * Récupère les commandes du client connecté
 * Endpoint: GET /api/v1/orders/mine
 */
export async function getMyOrders(page = 1, limit = 20): Promise<PaginatedOrders> {
  try {
    const res = await apiClient.get<PaginatedOrders>('/orders/mine', {
      params: { page, limit },
    });
    return res || { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  } catch {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  }
}

/**
 * Récupère le détail d'une commande par son numéro
 * Endpoint: GET /api/v1/orders/mine/:orderNumber
 */
export async function getMyOrder(orderNumber: string): Promise<CustomerOrder | null> {
  try {
    const order = await apiClient.get<CustomerOrder>(`/orders/mine/${encodeURIComponent(orderNumber)}`);
    return order;
  } catch {
    return null;
  }
}

/**
 * Annule une commande en attente
 * Endpoint: POST /api/v1/orders/mine/:orderNumber/cancel
 */
export async function cancelMyOrder(orderNumber: string, reason?: string): Promise<boolean> {
  try {
    await apiClient.post(`/orders/mine/${encodeURIComponent(orderNumber)}/cancel`, { reason });
    return true;
  } catch {
    return false;
  }
}

/**
 * Suivi en temps réel de la livraison d'une commande
 * Endpoint: GET /api/v1/orders/mine/:orderNumber/tracking
 */
export async function getOrderTracking(orderNumber: string): Promise<DeliveryTracking | null> {
  try {
    const tracking = await apiClient.get<DeliveryTracking>(
      `/orders/mine/${encodeURIComponent(orderNumber)}/tracking`
    );
    return tracking;
  } catch {
    return null;
  }
}
