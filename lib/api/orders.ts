/**
 * Commandes client : zones, chiffrage du panier, passage de commande, suivi.
 * Les erreurs de l'API remontent (ApiClientError) : l'écran affiche le message exact.
 */
import { apiClient } from './client';

export type DeliveryMode = 'STANDARD' | 'EXPRESS' | 'PICKUP';
export type OrderPaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARD' | 'CASH_ON_DELIVERY';
export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

/** Créneaux acceptés par le serveur */
export const TIME_SLOTS = ['9h-12h', '10h-14h', '14h-18h', '18h-20h'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export interface DeliveryZone {
  id: string;
  name: string;
  slug: string;
  coverage: string | null;
  fee: number;
  expressFee: number;
  /** Livraison standard offerte à partir de ce sous-total ; null = jamais */
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
  deliveryMode?: DeliveryMode;
  deliveryZoneId?: string;
  couponCode?: string;
  /** Carte cadeau utilisée en paiement (partiel ou total) */
  giftCardCode?: string;
}

export interface QuotedLine {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  image: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftWrap: boolean;
  cardMessage: string | null;
  extrasPrice: number;
  availableStock: number;
  /** Prix catalogue si une promotion s'applique */
  originalUnitPrice: number | null;
  promotion: { id: string; name: string; badgeText: string; discountPercentage: number } | null;
}

/** Montants calculés par le serveur (seule source de vérité des prix). */
export interface CartQuote {
  items: QuotedLine[];
  deliveryZone: { id: string; name: string } | null;
  appliedCoupon: { id: string; code: string; discountAmount: number; freeShipping: boolean } | null;
  appliedGiftCard: { id: string; code: string; amount: number; remainingBalance: number } | null;
  /** Montant réglé par carte cadeau (déjà déduit de totalAmount) */
  giftCardAmount: number;
  subtotal: number;
  extrasAmount: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
}

export interface PlaceOrderPayload extends QuoteCartPayload {
  paymentMethod: OrderPaymentMethod;
  phone?: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  /** AAAA-MM-JJ */
  deliveryDate?: string;
  timeSlot?: TimeSlot;
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
  extrasPrice: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryMode: DeliveryMode;
  deliveryAddress: string | null;
  deliveryZone: { id: string; name: string } | null;
  deliveryDate: string | null;
  timeSlot: string | null;
  subtotal: number;
  extrasAmount: number;
  discountAmount: number;
  couponCode: string | null;
  deliveryFee: number;
  /** Montant réglé par carte cadeau ; totalAmount = reste à payer */
  giftCardAmount?: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: OrderPaymentMethod;
  orderStatus: OrderStatus;
  notes: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: CustomerOrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  /** URL de paiement en ligne (uniquement à la création ou après une relance) */
  checkoutUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTrackingStep {
  step: 'preparation' | 'prise_en_charge' | 'en_acheminement' | 'livre';
  label: string;
  time: string | null;
  completed: boolean;
}

export interface DeliveryTracking {
  orderNumber: string;
  orderStatus: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryStatus: 'TO_DELIVER' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | null;
  deliveryAddress: string | null;
  deliveryZone: { id: string; name: string } | null;
  scheduledDate: string | null;
  timeSlot: string | null;
  driver: { name: string; phone: string; vehicle: string } | null;
  deliveredAt: string | null;
  failureReason: string | null;
  steps: DeliveryTrackingStep[];
}

export interface PaginatedOrders {
  items: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  IN_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  FREE_MONEY: 'Free Money',
  CARD: 'Carte bancaire',
  CASH_ON_DELIVERY: 'Paiement à la livraison',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'En attente de paiement',
  PAID: 'Payée',
  FAILED: 'Paiement échoué',
  REFUNDED: 'Remboursée',
};

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  STANDARD: 'Livraison standard',
  EXPRESS: 'Livraison express',
  PICKUP: 'Retrait en boutique',
};

/** Zones de livraison actives (triées par le serveur). */
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  return apiClient.get<DeliveryZone[]>('/delivery-zones');
}

/** Chiffre le panier côté serveur (prix, options, promotions, coupon, livraison). */
export async function quoteOrder(payload: QuoteCartPayload): Promise<CartQuote> {
  return apiClient.post<CartQuote>('/orders/quote', payload);
}

/** Crée la commande ; `checkoutUrl` est renseigné pour un paiement en ligne. */
export async function placeOrder(payload: PlaceOrderPayload): Promise<CustomerOrder> {
  return apiClient.post<CustomerOrder>('/orders', payload);
}

export async function getMyOrders(page = 1, limit = 20): Promise<PaginatedOrders> {
  return apiClient.get<PaginatedOrders>('/orders/mine', { params: { page, limit } });
}

export async function getMyOrder(orderNumber: string): Promise<CustomerOrder> {
  return apiClient.get<CustomerOrder>(`/orders/mine/${encodeURIComponent(orderNumber)}`);
}

export async function cancelMyOrder(orderNumber: string, reason?: string): Promise<CustomerOrder> {
  return apiClient.post<CustomerOrder>(`/orders/mine/${encodeURIComponent(orderNumber)}/cancel`, {
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });
}

export async function getOrderTracking(orderNumber: string): Promise<DeliveryTracking> {
  return apiClient.get<DeliveryTracking>(`/orders/mine/${encodeURIComponent(orderNumber)}/tracking`);
}

/** Enregistre le panier du client connecté (relances « paniers abandonnés » côté back-office). */
export async function saveMyCart(items: OrderCartItemInput[]): Promise<void> {
  await apiClient.put('/cart/mine', { items });
}

/** Vide le panier enregistré côté serveur. */
export async function clearMyCart(): Promise<void> {
  await apiClient.delete('/cart/mine');
}
