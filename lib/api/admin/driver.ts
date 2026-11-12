import { apiClient } from '../client';

const opts = { useAdminToken: true as const, cache: 'no-store' as const };

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate: string | null;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  activeDeliveriesCount: number;
}

export interface DriverDelivery {
  id: string;
  deliveryNumber: string;
  status: 'TO_DELIVER' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  scheduledDate: string | null;
  timeSlot: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  recipientName: string | null;
  notes: string | null;
  /** Journal de la course (la consigne d'assignation est la note de l'évènement ASSIGNED) */
  events?: { type: string; note: string | null; createdAt: string }[];
  order: {
    orderNumber: string;
    orderStatus: string;
    customerName: string;
    customerPhone: string;
    recipientName: string | null;
    recipientPhone: string | null;
    deliveryAddress: string | null;
    deliveryZone: { name: string } | null;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    notes: string | null;
    itemsSummary: string;
  };
}

/** Espace livreur (rôle DELIVERY) : uniquement ses propres courses. */
export const getDriverProfile = () => apiClient.get<DriverProfile>('/driver/me', opts);

export async function getDriverDeliveries(scope: 'active' | 'history'): Promise<DriverDelivery[]> {
  return (await apiClient.get<{ items: DriverDelivery[] }>('/driver/deliveries', { ...opts, params: { scope, limit: 50 } })).items;
}

export const startDriverDelivery = (id: string) => apiClient.post<DriverDelivery>(`/driver/deliveries/${id}/start`, undefined, opts);
export const completeDriverDelivery = (id: string, body: { recipientName: string; notes?: string }) =>
  apiClient.post<DriverDelivery>(`/driver/deliveries/${id}/complete`, body, opts);
export const failDriverDelivery = (id: string, reason: string) => apiClient.post<DriverDelivery>(`/driver/deliveries/${id}/fail`, { reason }, opts);
