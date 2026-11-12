import { apiClient } from '../client';

/** Zone de livraison telle que renvoyée par l'API (/admin/delivery-zones). */
export interface AdminDeliveryZone {
  id: string;
  name: string;
  slug: string;
  coverage: string | null;
  /** Frais de livraison standard (FCFA) */
  fee: number;
  /** Frais de livraison express (FCFA) */
  expressFee: number;
  /** Livraison standard offerte à partir de ce sous-total (FCFA) ; null = jamais offerte */
  freeAbove: number | null;
  estimatedTimeHours: number;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminDeliveryZonePayload {
  name: string;
  coverage?: string | null;
  fee: number;
  expressFee: number;
  freeAbove?: number | null;
  estimatedTimeHours?: number;
  sortOrder?: number;
  isActive?: boolean;
}

/** Résultat d'une suppression : une zone déjà utilisée par des commandes est désactivée, pas supprimée. */
export interface DeliveryZoneRemoval {
  deleted: boolean;
  deactivated: boolean;
}

export async function getAdminDeliveryZones(): Promise<AdminDeliveryZone[]> {
  return apiClient.get<AdminDeliveryZone[]>('/admin/delivery-zones', { useAdminToken: true });
}

export async function createAdminDeliveryZone(data: AdminDeliveryZonePayload): Promise<AdminDeliveryZone> {
  return apiClient.post<AdminDeliveryZone>('/admin/delivery-zones', data, { useAdminToken: true });
}

export async function updateAdminDeliveryZone(
  id: string,
  data: Partial<AdminDeliveryZonePayload>,
): Promise<AdminDeliveryZone> {
  return apiClient.patch<AdminDeliveryZone>(`/admin/delivery-zones/${id}`, data, { useAdminToken: true });
}

export async function deleteAdminDeliveryZone(id: string): Promise<DeliveryZoneRemoval> {
  return apiClient.delete<DeliveryZoneRemoval>(`/admin/delivery-zones/${id}`, { useAdminToken: true });
}
