import { apiClient } from '../client';
import type { AdminOrder, OrderStatus } from '@/lib/admin/mock-data/types';

export interface GetAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
  page?: number;
  totalPages?: number;
}

// Convert backend status to frontend OrderStatus
export function mapBackendOrderStatus(status: string): OrderStatus {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'CONFIRMED':
    case 'NOUVELLE':
      return 'nouvelle';
    case 'PREPARING':
    case 'EN_PREPARATION':
      return 'en_preparation';
    case 'IN_DELIVERY':
    case 'EN_LIVRAISON':
      return 'en_livraison';
    case 'DELIVERED':
    case 'LIVREE':
      return 'livree';
    case 'CANCELLED':
    case 'ANNULEE':
      return 'annulee';
    case 'REFUNDED':
    case 'REMBOURSEE':
      return 'remboursee';
    default:
      return (status as OrderStatus) || 'nouvelle';
  }
}

// Convert frontend OrderStatus to backend enum
export function mapFrontendToBackendOrderStatus(status: OrderStatus | string): string {
  switch (status) {
    case 'nouvelle':
      return 'CONFIRMED';
    case 'en_preparation':
      return 'PREPARING';
    case 'en_livraison':
      return 'IN_DELIVERY';
    case 'livree':
      return 'DELIVERED';
    case 'annulee':
      return 'CANCELLED';
    case 'remboursee':
      return 'REFUNDED';
    default:
      return status.toUpperCase();
  }
}

// Transform raw API order to AdminOrder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminOrder(raw: any): AdminOrder {
  const customerName = raw.customer
    ? `${raw.customer.firstName || ''} ${raw.customer.lastName || ''}`.trim() || raw.shippingAddress?.fullName || 'Client'
    : raw.customerName || raw.shippingAddress?.fullName || 'Client DécoFleur';

  let deliveryAddress = raw.deliveryAddress || '';
  if (!deliveryAddress && raw.shippingAddress) {
    if (typeof raw.shippingAddress === 'string') {
      deliveryAddress = raw.shippingAddress;
    } else {
      deliveryAddress = [
        raw.shippingAddress.address,
        raw.shippingAddress.city,
        raw.shippingAddress.zone,
      ].filter(Boolean).join(', ');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = Array.isArray(raw.items) ? raw.items.map((it: any) => ({
    productId: it.productId || it.product?.id || it.id || '',
    productName: it.productName || it.product?.name || 'Produit floral',
    quantity: it.quantity || 1,
    unitPrice: Number(it.unitPrice ?? it.price ?? 0),
    image: it.image || it.product?.image || it.product?.images?.[0]?.url || '/images/products/rose-rouge.jpg',
  })) : [];

  return {
    id: raw.id,
    ref: raw.orderNumber || raw.ref || raw.id,
    customerId: raw.customerId || raw.customer?.id || '',
    customerName,
    items,
    total: Number(raw.totalAmount ?? raw.total ?? 0),
    status: mapBackendOrderStatus(raw.status),
    date: raw.createdAt || raw.date || new Date().toISOString(),
    deliveryAddress: deliveryAddress || 'Adresse non spécifiée',
    deliveryMode: raw.deliveryMode || (raw.isExpress ? 'Livraison express' : 'Livraison standard'),
    deliveryFee: Number(raw.deliveryFee ?? 0),
    paymentMethod: raw.paymentMethod || 'NabooPay',
    notes: raw.adminNotes || raw.notes || raw.customerNotes || '',
  };
}

/**
 * Fetch orders list from admin API with fallback to mock data
 */
export async function getAdminOrders(params?: GetAdminOrdersParams): Promise<AdminOrdersResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') {
      q.set('status', mapFrontendToBackendOrderStatus(params.status));
    }
    if (params?.paymentStatus && params.paymentStatus !== 'all') {
      q.set('paymentStatus', params.paymentStatus.toUpperCase());
    }
    if (params?.search) q.set('search', params.search);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/orders${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (res && typeof res === 'object') {
      if (Array.isArray(res.orders)) {
        return {
          orders: res.orders.map(transformAdminOrder),
          total: res.total ?? res.orders.length,
          page: res.page ?? 1,
          totalPages: res.totalPages ?? 1,
        };
      }
      if (Array.isArray(res)) {
        return {
          orders: res.map(transformAdminOrder),
          total: res.length,
        };
      }
      if (Array.isArray(res.data)) {
        return {
          orders: res.data.map(transformAdminOrder),
          total: res.total ?? res.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminOrdersAPI] Erreur de récupération des commandes:', err);
  }

  return {
    orders: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };
}

/**
 * Get single order detail
 */
export async function getAdminOrderById(id: string): Promise<AdminOrder | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/orders/${id}`, {
      useAdminToken: true,
      cache: 'no-store',
    });
    if (res) {
      return transformAdminOrder(res);
    }
  } catch (err) {
    console.warn(`[AdminOrdersAPI] Fetching order ${id} failed:`, err);
  }

  return null;
}

/**
 * Update order notes or delivery slot
 */
export async function updateAdminOrder(
  id: string,
  body: { adminNotes?: string; deliveryDate?: string; timeSlot?: string }
): Promise<AdminOrder> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/orders/${id}`, body, {
    useAdminToken: true,
  });
  return transformAdminOrder(res);
}

/**
 * Update order status (CONFIRMED, PREPARING, IN_DELIVERY, DELIVERED, CANCELLED, REFUNDED)
 */
export async function updateAdminOrderStatus(
  id: string,
  body: { status: OrderStatus | string; note?: string; cancelReason?: string }
): Promise<AdminOrder> {
  const backendStatus = mapFrontendToBackendOrderStatus(body.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(
    `/admin/orders/${id}/status`,
    {
      status: backendStatus,
      note: body.note,
      cancelReason: body.cancelReason,
    },
    { useAdminToken: true }
  );
  return transformAdminOrder(res);
}
