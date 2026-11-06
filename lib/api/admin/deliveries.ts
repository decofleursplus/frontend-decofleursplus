import { apiClient } from '../client';
import type {
  AdminDelivery,
  DeliveryDriver,
  DeliveryStatus,
} from '@/lib/admin/mock-data/types';

export interface GetAdminDeliveriesParams {
  page?: number;
  limit?: number;
  status?: string;
  driverId?: string;
  date?: string;
  search?: string;
}

export interface AdminDeliveriesResponse {
  deliveries: AdminDelivery[];
  total: number;
  counts?: {
    all: number;
    a_livrer: number;
    en_cours: number;
    livree: number;
    echec: number;
  };
}

// Map backend delivery status to frontend DeliveryStatus
export function mapBackendDeliveryStatus(status: string): DeliveryStatus {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'ASSIGNED':
    case 'A_LIVRER':
      return 'a_livrer';
    case 'PICKED_UP':
    case 'IN_TRANSIT':
    case 'IN_PROGRESS':
    case 'EN_COURS':
      return 'en_cours';
    case 'DELIVERED':
    case 'LIVREE':
      return 'livree';
    case 'FAILED':
    case 'CANCELLED':
    case 'ECHEC':
      return 'echec';
    default:
      return (status as DeliveryStatus) || 'a_livrer';
  }
}

// Map frontend DeliveryStatus to backend status enum
export function mapFrontendToBackendDeliveryStatus(status: DeliveryStatus | string): string {
  switch (status) {
    case 'a_livrer':
      return 'ASSIGNED';
    case 'en_cours':
      return 'IN_TRANSIT';
    case 'livree':
      return 'DELIVERED';
    case 'echec':
      return 'FAILED';
    default:
      return status.toUpperCase();
  }
}

// Transform raw backend delivery to AdminDelivery
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminDelivery(raw: any): AdminDelivery {
  const customerName = raw.order?.customer
    ? `${raw.order.customer.firstName || ''} ${raw.order.customer.lastName || ''}`.trim() || raw.customerName || 'Client'
    : raw.customerName || 'Client DécoFleur';

  const customerPhone = raw.order?.customer?.phone || raw.order?.shippingAddress?.phone || raw.customerPhone || '';
  
  let deliveryAddress = raw.deliveryAddress || '';
  if (!deliveryAddress && raw.order?.shippingAddress) {
    if (typeof raw.order.shippingAddress === 'string') {
      deliveryAddress = raw.order.shippingAddress;
    } else {
      deliveryAddress = [
        raw.order.shippingAddress.address,
        raw.order.shippingAddress.city,
        raw.order.shippingAddress.zone,
      ].filter(Boolean).join(', ');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemsSummary = raw.itemsSummary || (Array.isArray(raw.order?.items)
    ? raw.order.items.map((it: any) => `${it.quantity}x ${it.productName || it.product?.name || 'Produit'}`).join(', ')
    : 'Articles floraux');

  return {
    id: raw.id,
    orderId: raw.orderId || raw.order?.id || '',
    orderRef: raw.order?.orderNumber || raw.orderRef || `#${raw.orderId || raw.id}`,
    customerId: raw.customerId || raw.order?.customerId || '',
    customerName,
    customerPhone,
    deliveryAddress: deliveryAddress || 'Adresse non spécifiée',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deliveryZone: (raw.deliveryZone || raw.order?.deliveryZone?.name || 'Saly') as any,
    deliveryMode: raw.deliveryMode || (raw.order?.isExpress ? 'Livraison express' : 'Livraison standard'),
    driverId: raw.driverId || raw.driver?.id,
    driverName: raw.driver?.name || raw.driverName,
    driverPhone: raw.driver?.phone || raw.driverPhone,
    driverVehicle: raw.driver ? `${raw.driver.vehicle} (${raw.driver.vehiclePlate || ''})`.trim() : raw.driverVehicle,
    status: mapBackendDeliveryStatus(raw.status),
    scheduledDate: raw.scheduledDate ? raw.scheduledDate.split('T')[0] : (raw.createdAt ? raw.createdAt.split('T')[0] : 'Aujourd’hui'),
    timeSlot: raw.timeSlot || raw.order?.deliverySlot || 'Journée',
    deliveredAt: raw.deliveredAt,
    recipientName: raw.recipientName,
    deliveryFee: Number(raw.deliveryFee ?? raw.order?.deliveryFee ?? 0),
    itemsSummary,
    notes: raw.notes || raw.order?.adminNotes || '',
    trackingSteps: raw.trackingSteps || [
      { step: 'preparation', label: 'Commande préparée', completed: true },
      { step: 'prise_en_charge', label: 'Prise en charge livreur', completed: raw.status !== 'PENDING' },
      { step: 'en_acheminement', label: 'En cours d’acheminement', completed: raw.status === 'IN_TRANSIT' || raw.status === 'DELIVERED' },
      { step: 'livre', label: 'Livré au destinataire', completed: raw.status === 'DELIVERED' },
    ],
  };
}

// Transform raw backend driver to DeliveryDriver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformDeliveryDriver(raw: any): DeliveryDriver {
  let status: 'disponible' | 'en_course' | 'indisponible' = 'disponible';
  const rawStatus = (raw.availability || raw.status || '').toUpperCase();
  if (rawStatus === 'BUSY' || rawStatus === 'EN_COURSE') {
    status = 'en_course';
  } else if (rawStatus === 'OFFLINE' || rawStatus === 'INACTIVE' || rawStatus === 'INDISPONIBLE') {
    status = 'indisponible';
  }

  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    vehicle: raw.vehicle || 'Moto',
    vehiclePlate: raw.vehiclePlate || '',
    status,
    activeDeliveriesCount: Number(raw.activeDeliveriesCount ?? raw._count?.deliveries ?? 0),
    rating: Number(raw.rating ?? 5.0),
    avatar: raw.name ? raw.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DL',
  };
}

/**
 * Fetch deliveries list with optional filter params and mock fallback
 */
export async function getAdminDeliveries(params?: GetAdminDeliveriesParams): Promise<AdminDeliveriesResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') {
      q.set('status', mapFrontendToBackendDeliveryStatus(params.status));
    }
    if (params?.driverId && params.driverId !== 'all') q.set('driverId', params.driverId);
    if (params?.date) q.set('date', params.date);
    if (params?.search) q.set('search', params.search);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/deliveries${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (res && typeof res === 'object') {
      const dataObj = res.data ?? res;
      if (Array.isArray(dataObj.items)) {
        return {
          deliveries: dataObj.items.map(transformAdminDelivery),
          total: dataObj.total ?? dataObj.items.length,
          counts: dataObj.counts ?? res.counts,
        };
      }
      if (Array.isArray(res.deliveries)) {
        return {
          deliveries: res.deliveries.map(transformAdminDelivery),
          total: res.total ?? res.deliveries.length,
          counts: res.counts,
        };
      }
      if (Array.isArray(res)) {
        return {
          deliveries: res.map(transformAdminDelivery),
          total: res.length,
        };
      }
      if (Array.isArray(res.data)) {
        return {
          deliveries: res.data.map(transformAdminDelivery),
          total: res.total ?? res.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminDeliveriesAPI] Erreur de récupération des livraisons:', err);
  }

  return {
    deliveries: [],
    total: 0,
  };
}

/**
 * Assign a driver to a delivery
 */
export async function assignDeliveryDriver(
  id: string,
  body: { driverId: string; timeSlot?: string; scheduledDate?: string; note?: string }
): Promise<AdminDelivery> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>(`/admin/deliveries/${id}/assign`, body, {
    useAdminToken: true,
  });
  return transformAdminDelivery(res);
}

/**
 * Mark delivery as completed
 */
export async function completeAdminDelivery(
  id: string,
  body: { recipientName?: string; notes?: string }
): Promise<AdminDelivery> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>(`/admin/deliveries/${id}/complete`, body, {
    useAdminToken: true,
  });
  return transformAdminDelivery(res);
}

/**
 * Mark delivery as failed
 */
export async function failAdminDelivery(id: string, body: { reason: string }): Promise<AdminDelivery> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>(`/admin/deliveries/${id}/fail`, body, {
    useAdminToken: true,
  });
  return transformAdminDelivery(res);
}

/**
 * Fetch all delivery drivers
 */
export async function getAdminDrivers(includeInactive = false): Promise<DeliveryDriver[]> {
  try {
    const q = includeInactive ? '?includeInactive=true' : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/drivers${q}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) {
      return res.map(transformDeliveryDriver);
    }
    if (res && Array.isArray(res.drivers)) {
      return res.drivers.map(transformDeliveryDriver);
    }
    if (res && Array.isArray(res.data)) {
      return res.data.map(transformDeliveryDriver);
    }
  } catch (err) {
    console.warn('[AdminDriversAPI] Erreur de récupération des livreurs:', err);
  }

  return [];
}

/**
 * Create a new driver
 */
export async function createAdminDriver(body: {
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate?: string;
  availability?: string;
}): Promise<DeliveryDriver> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/drivers', body, {
    useAdminToken: true,
  });
  return transformDeliveryDriver(res);
}

/**
 * Update a driver
 */
export async function updateAdminDriver(
  id: string,
  body: Partial<{
    name: string;
    phone: string;
    vehicle: string;
    vehiclePlate?: string;
    availability?: string;
  }>
): Promise<DeliveryDriver> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/drivers/${id}`, body, {
    useAdminToken: true,
  });
  return transformDeliveryDriver(res);
}

/**
 * Delete a driver
 */
export async function deleteAdminDriver(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/drivers/${id}`, {
    useAdminToken: true,
  });
  return true;
}
