import { apiClient } from '../client';
import type { AdminOrder, OrderStatus } from '@/lib/admin/mock-data/types';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

/** Statuts de commande du backend. */
export type BackendOrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type BackendPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export const ORDER_STATUS_LABELS: Record<BackendOrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  IN_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const ORDER_STATUS_STYLES: Record<BackendOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  PAID: 'bg-sky-50 text-sky-800 border-sky-200',
  PREPARING: 'bg-violet-50 text-violet-800 border-violet-200',
  READY: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  IN_DELIVERY: 'bg-blue-50 text-blue-800 border-blue-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

/** Libellé du bouton qui fait passer la commande vers ce statut. */
export const ORDER_ACTION_LABELS: Record<BackendOrderStatus, string> = {
  PENDING: 'Remettre en attente',
  PAID: 'Marquer payée',
  PREPARING: 'Lancer la préparation',
  READY: 'Marquer prête',
  IN_DELIVERY: 'Remettre au livreur',
  DELIVERED: 'Marquer livrée / retirée',
  CANCELLED: 'Annuler la commande',
};

export const PAYMENT_STATUS_LABELS: Record<BackendPaymentStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  FREE_MONEY: 'Free Money',
  CARD: 'Carte bancaire',
  CASH_ON_DELIVERY: 'Paiement à la livraison',
};

export const DELIVERY_MODE_LABELS: Record<string, string> = {
  STANDARD: 'Livraison standard',
  EXPRESS: 'Livraison express',
  PICKUP: 'Retrait en boutique',
};

export const TIME_SLOTS = ['9h-12h', '10h-14h', '14h-18h', '18h-20h'] as const;

export interface AdminOrderItemDetail {
  id: string;
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
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryMode: 'STANDARD' | 'EXPRESS' | 'PICKUP';
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
  paymentStatus: BackendPaymentStatus;
  paymentMethod: string;
  orderStatus: BackendOrderStatus;
  notes: string | null;
  adminNotes: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItemDetail[];
  statusHistory: { id: string; fromStatus: BackendOrderStatus | null; toStatus: BackendOrderStatus; note: string | null; createdAt: string; authorName: string | null }[];
  /** Statuts proposés par le backend depuis l'état actuel */
  allowedTransitions: BackendOrderStatus[];
}

export interface AdminOrdersFilters {
  page?: number;
  limit?: number;
  status?: BackendOrderStatus;
  paymentStatus?: BackendPaymentStatus;
  deliveryMode?: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  search?: string;
  from?: string;
  to?: string;
  sort?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface AdminOrdersPage {
  items: AdminOrderDetail[];
  total: number;
  page: number;
  totalPages: number;
  counts: Record<BackendOrderStatus, number>;
}

export async function getAdminOrders(filters: AdminOrdersFilters = {}): Promise<AdminOrdersPage> {
  return apiClient.get<AdminOrdersPage>('/admin/orders', {
    ...admin,
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      status: filters.status,
      paymentStatus: filters.paymentStatus,
      deliveryMode: filters.deliveryMode,
      search: filters.search || undefined,
      from: filters.from,
      to: filters.to,
      sort: filters.sort,
    },
  });
}

/** Détail ; null si la commande n'existe pas (404). */
export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  try {
    return await apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`, admin);
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

/** Notes internes, date et créneau de livraison. */
export async function updateAdminOrder(
  id: string,
  body: { adminNotes?: string | null; deliveryDate?: string | null; timeSlot?: string | null },
): Promise<AdminOrderDetail> {
  return apiClient.patch<AdminOrderDetail>(`/admin/orders/${id}`, body, admin);
}

export async function changeAdminOrderStatus(
  id: string,
  status: BackendOrderStatus,
  extra: { note?: string; cancelReason?: string } = {},
): Promise<AdminOrderDetail> {
  return apiClient.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, { status, ...extra }, admin);
}

// ---------- Format « historique client » (page Clients) ----------

const LEGACY_STATUS: Record<string, OrderStatus> = {
  PENDING: 'nouvelle',
  PAID: 'nouvelle',
  PREPARING: 'en_preparation',
  READY: 'en_preparation',
  IN_DELIVERY: 'en_livraison',
  DELIVERED: 'livree',
  CANCELLED: 'annulee',
};

/** Résumé d'une commande pour l'historique d'un client. */
export function transformAdminOrder(
  raw: Pick<AdminOrderDetail, 'id' | 'orderNumber' | 'createdAt' | 'orderStatus' | 'totalAmount'> & Partial<AdminOrderDetail>,
): AdminOrder {
  return {
    id: raw.id,
    ref: raw.orderNumber,
    customerId: raw.customerId ?? '',
    customerName: raw.customerName ?? '',
    items: (raw.items ?? []).map((it) => ({
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      image: it.image ?? '/images/hero.jpg',
    })),
    total: raw.totalAmount,
    status: LEGACY_STATUS[raw.orderStatus] ?? 'nouvelle',
    date: raw.createdAt,
    deliveryAddress: raw.deliveryAddress ?? '',
    deliveryMode: raw.deliveryMode ? DELIVERY_MODE_LABELS[raw.deliveryMode] : '',
    deliveryFee: raw.deliveryFee ?? 0,
    paymentMethod: raw.paymentMethod ? PAYMENT_METHOD_LABELS[raw.paymentMethod] ?? raw.paymentMethod : '',
    notes: raw.adminNotes ?? raw.notes ?? '',
  };
}
