import { apiClient } from '../client';
import type { AdminDelivery, DeliveryDriver, DeliveryStatus } from '@/lib/admin/mock-data/types';

/** Créneaux acceptés par le backend (identiques au tunnel de commande). */
export const DELIVERY_TIME_SLOTS = ['9h-12h', '10h-14h', '14h-18h', '18h-20h'] as const;

const VEHICLE_FROM_API: Record<string, DeliveryDriver['vehicle']> = { MOTO: 'Moto', SCOOTER: 'Scooter', VAN: 'Fourgonnette', CAR: 'Voiture' };
const VEHICLE_TO_API: Record<DeliveryDriver['vehicle'], string> = { Moto: 'MOTO', Scooter: 'SCOOTER', Fourgonnette: 'VAN', Voiture: 'CAR' };

const STATUS_FROM_API: Record<string, DeliveryStatus> = {
  TO_DELIVER: 'a_livrer',
  IN_PROGRESS: 'en_cours',
  DELIVERED: 'livree',
  FAILED: 'echec',
  CANCELLED: 'echec',
};
const STATUS_TO_API: Record<DeliveryStatus, string> = { a_livrer: 'TO_DELIVER', en_cours: 'IN_PROGRESS', livree: 'DELIVERED', echec: 'FAILED' };

interface ApiDelivery {
  id: string;
  deliveryNumber: string;
  status: string;
  scheduledDate: string | null;
  timeSlot: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  recipientName: string | null;
  notes: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    userId: string | null;
    orderStatus: string;
    deliveryMode: string;
    customerName: string;
    customerPhone: string;
    recipientName: string | null;
    recipientPhone: string | null;
    deliveryAddress: string | null;
    deliveryZone: { id: string; name: string } | null;
    deliveryFee: number;
    itemsSummary: string;
  };
  driver: { id: string; name: string; phone: string; vehicle: string; vehiclePlate: string | null } | null;
  events?: { id: string; type: string; note: string | null; createdAt: string; authorName: string | null }[];
}

interface ApiDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate: string | null;
  availability: string;
  status: string;
  rating: number;
  isActive: boolean;
  activeDeliveriesCount: number;
}

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined;

export function transformAdminDelivery(raw: ApiDelivery): AdminDelivery {
  const status = STATUS_FROM_API[raw.status] ?? 'a_livrer';
  const vehicle = raw.driver ? VEHICLE_FROM_API[raw.driver.vehicle] ?? raw.driver.vehicle : undefined;
  return {
    id: raw.id,
    deliveryNumber: raw.deliveryNumber,
    orderId: raw.order.id,
    orderRef: raw.order.orderNumber,
    orderStatus: raw.order.orderStatus,
    customerId: raw.order.userId ?? '',
    customerName: raw.order.recipientName || raw.order.customerName,
    customerPhone: raw.order.recipientPhone || raw.order.customerPhone,
    deliveryAddress: raw.order.deliveryAddress ?? '',
    deliveryZone: raw.order.deliveryZone?.name ?? '',
    deliveryMode: raw.order.deliveryMode === 'EXPRESS' ? 'Livraison express' : raw.order.deliveryMode === 'PICKUP' ? 'Retrait boutique' : 'Livraison standard',
    driverId: raw.driver?.id,
    driverName: raw.driver?.name,
    driverPhone: raw.driver?.phone,
    driverVehicle: raw.driver ? [vehicle, raw.driver.vehiclePlate].filter(Boolean).join(' · ') : undefined,
    status,
    scheduledDate: raw.scheduledDate ? new Date(raw.scheduledDate).toLocaleDateString('fr-FR') : 'Non planifiée',
    timeSlot: raw.timeSlot ?? '',
    deliveredAt: formatTime(raw.deliveredAt),
    recipientName: raw.recipientName ?? undefined,
    deliveryFee: raw.order.deliveryFee,
    itemsSummary: raw.order.itemsSummary,
    notes: raw.notes ?? '',
    failureReason: raw.failureReason ?? undefined,
    events: raw.events,
    trackingSteps: [
      { step: 'preparation', label: 'Commande préparée', completed: true, time: formatTime(raw.createdAt) },
      { step: 'prise_en_charge', label: raw.driver ? `Livreur : ${raw.driver.name}` : 'Livreur à assigner', completed: Boolean(raw.driver) },
      { step: 'en_acheminement', label: 'En cours d’acheminement', completed: Boolean(raw.pickedUpAt), time: formatTime(raw.pickedUpAt) },
      {
        step: 'livre',
        label: raw.recipientName ? `Remis à ${raw.recipientName}` : 'Livré au destinataire',
        completed: raw.status === 'DELIVERED',
        time: formatTime(raw.deliveredAt),
      },
    ],
  };
}

export function transformDeliveryDriver(raw: ApiDriver): DeliveryDriver {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    vehicle: VEHICLE_FROM_API[raw.vehicle] ?? 'Moto',
    vehiclePlate: raw.vehiclePlate ?? '',
    status: !raw.isActive || raw.availability === 'UNAVAILABLE' ? 'indisponible' : raw.activeDeliveriesCount > 0 ? 'en_course' : 'disponible',
    activeDeliveriesCount: raw.activeDeliveriesCount,
    rating: raw.rating,
    avatar: raw.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}

export interface AdminDeliveriesResponse {
  deliveries: AdminDelivery[];
  total: number;
  counts: Record<DeliveryStatus, number>;
}

/** Livraisons (100 plus récentes par défaut) avec compteurs par statut calculés par le serveur. */
export async function getAdminDeliveries(params: { status?: DeliveryStatus; search?: string; limit?: number } = {}): Promise<AdminDeliveriesResponse> {
  const res = await apiClient.get<{ items: ApiDelivery[]; total: number; counts: Record<string, number> }>('/admin/deliveries', {
    useAdminToken: true,
    cache: 'no-store',
    params: { limit: params.limit ?? 100, status: params.status ? STATUS_TO_API[params.status] : undefined, search: params.search || undefined },
  });
  const c = res.counts ?? {};
  return {
    deliveries: res.items.map(transformAdminDelivery),
    total: res.total,
    counts: {
      a_livrer: c.TO_DELIVER ?? 0,
      en_cours: c.IN_PROGRESS ?? 0,
      livree: c.DELIVERED ?? 0,
      echec: (c.FAILED ?? 0) + (c.CANCELLED ?? 0),
    },
  };
}

export async function assignDeliveryDriver(
  id: string,
  body: { driverId: string; timeSlot?: string; scheduledDate?: string; note?: string },
): Promise<AdminDelivery> {
  return transformAdminDelivery(await apiClient.post<ApiDelivery>(`/admin/deliveries/${id}/assign`, body, { useAdminToken: true }));
}

/** Départ en livraison (la commande doit être « prête » et un livreur assigné). */
export async function startAdminDelivery(id: string): Promise<AdminDelivery> {
  return transformAdminDelivery(await apiClient.post<ApiDelivery>(`/admin/deliveries/${id}/start`, undefined, { useAdminToken: true }));
}

export async function completeAdminDelivery(id: string, body: { recipientName: string; notes?: string }): Promise<AdminDelivery> {
  return transformAdminDelivery(await apiClient.post<ApiDelivery>(`/admin/deliveries/${id}/complete`, body, { useAdminToken: true }));
}

export async function failAdminDelivery(id: string, body: { reason: string }): Promise<AdminDelivery> {
  return transformAdminDelivery(await apiClient.post<ApiDelivery>(`/admin/deliveries/${id}/fail`, body, { useAdminToken: true }));
}

export async function getAdminDrivers(includeInactive = false): Promise<DeliveryDriver[]> {
  const res = await apiClient.get<ApiDriver[]>('/admin/drivers', {
    useAdminToken: true,
    cache: 'no-store',
    params: { includeInactive: includeInactive ? 'true' : undefined },
  });
  return res.map(transformDeliveryDriver);
}

export async function createAdminDriver(body: {
  name: string;
  phone: string;
  vehicle: DeliveryDriver['vehicle'];
  vehiclePlate?: string;
  available?: boolean;
}): Promise<DeliveryDriver> {
  const res = await apiClient.post<ApiDriver>(
    '/admin/drivers',
    {
      name: body.name,
      phone: body.phone,
      vehicle: VEHICLE_TO_API[body.vehicle],
      vehiclePlate: body.vehiclePlate || null,
      availability: body.available === false ? 'UNAVAILABLE' : 'AVAILABLE',
    },
    { useAdminToken: true },
  );
  return transformDeliveryDriver(res);
}

export async function updateAdminDriver(
  id: string,
  body: Partial<{ name: string; phone: string; vehicle: DeliveryDriver['vehicle']; vehiclePlate: string | null; available: boolean; isActive: boolean }>,
): Promise<DeliveryDriver> {
  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.phone !== undefined) payload.phone = body.phone;
  if (body.vehicle !== undefined) payload.vehicle = VEHICLE_TO_API[body.vehicle];
  if (body.vehiclePlate !== undefined) payload.vehiclePlate = body.vehiclePlate;
  if (body.available !== undefined) payload.availability = body.available ? 'AVAILABLE' : 'UNAVAILABLE';
  if (body.isActive !== undefined) payload.isActive = body.isActive;
  return transformDeliveryDriver(await apiClient.patch<ApiDriver>(`/admin/drivers/${id}`, payload, { useAdminToken: true }));
}

export async function deleteAdminDriver(id: string): Promise<void> {
  await apiClient.delete(`/admin/drivers/${id}`, { useAdminToken: true });
}
