import { apiClient } from '../client';
import type { DeliveryZoneSettings } from '@/lib/admin/mock-data/types';

export interface AdminDeliveryZonePayload {
  name: string;
  slug?: string;
  coverage?: string;
  fee: number;
  expressFee?: number;
  freeAbove?: number;
  estimatedHours?: string;
  isActive?: boolean;
}

// Transform backend DeliveryZone to DeliveryZoneSettings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformDeliveryZone(raw: any): DeliveryZoneSettings {
  return {
    id: raw.id,
    name: raw.name,
    coverage: raw.coverage || raw.description || '',
    price: Number(raw.fee ?? raw.price ?? 2000),
    delayHours: raw.estimatedHours || raw.delayHours || 'Sous 24h',
    freeAbove: raw.freeAbove ? Number(raw.freeAbove) : undefined,
    enabled: raw.isActive ?? raw.enabled ?? true,
  };
}

/**
 * Fetch all delivery zones
 */
export async function getAdminDeliveryZones(): Promise<DeliveryZoneSettings[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/delivery-zones', {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) {
      return res.map(transformDeliveryZone);
    }
    if (res && Array.isArray(res.data)) {
      return res.data.map(transformDeliveryZone);
    }
    if (res && Array.isArray(res.zones)) {
      return res.zones.map(transformDeliveryZone);
    }
  } catch (err) {
    console.warn('[AdminDeliveryZonesAPI] Erreur de récupération des zones de livraison:', err);
  }

  return [];
}

/**
 * Create a new delivery zone
 */
export async function createAdminDeliveryZone(data: AdminDeliveryZonePayload): Promise<DeliveryZoneSettings> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/delivery-zones', data, {
    useAdminToken: true,
  });
  return transformDeliveryZone(res);
}

/**
 * Update an existing delivery zone
 */
export async function updateAdminDeliveryZone(
  id: string,
  data: Partial<AdminDeliveryZonePayload>
): Promise<DeliveryZoneSettings> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/delivery-zones/${id}`, data, {
    useAdminToken: true,
  });
  return transformDeliveryZone(res);
}

/**
 * Delete a delivery zone
 */
export async function deleteAdminDeliveryZone(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/delivery-zones/${id}`, {
    useAdminToken: true,
  });
  return true;
}
