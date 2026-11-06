import { apiClient } from '../client';
import type { RentalEquipment, RentalEquipmentCategory } from '@/lib/admin/mock-data/types';

export interface CreateRentalEquipmentPayload {
  name: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  totalQuantity: number;
  description: string;
  dimensions?: string;
  imageUrl?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRentalEquipment(raw: any): RentalEquipment {
  let category: RentalEquipmentCategory = 'mobilier';
  const rawCat = (raw.category || '').toLowerCase();
  if (rawCat.includes('vaisselle')) category = 'vaisselle';
  else if (rawCat.includes('decor')) category = 'decoration';
  else if (rawCat.includes('access')) category = 'accessoires';

  const categoryLabels: Record<RentalEquipmentCategory, string> = {
    mobilier: 'Mobilier & Assises',
    vaisselle: 'Arts de la table',
    decoration: 'Décoration & Arches',
    accessoires: 'Accessoires & Vases',
  };

  const totalStock = Number(raw.totalQuantity ?? raw.totalStock ?? 1);
  const availableStock = Number(raw.availableQuantity ?? raw.availableStock ?? totalStock);

  let status: 'disponible' | 'stock_faible' | 'indisponible' = 'disponible';
  if (availableStock === 0) status = 'indisponible';
  else if (availableStock <= 3) status = 'stock_faible';

  return {
    id: raw.id,
    name: raw.name,
    category,
    categoryLabel: categoryLabels[category],
    pricePerDay: Number(raw.pricePerDay ?? 0),
    deposit: Number(raw.depositAmount ?? raw.deposit ?? 0),
    totalStock,
    availableStock,
    image: raw.imageUrl || raw.image || '/images/location/table-ronde.jpg',
    description: raw.description || '',
    dimensions: raw.dimensions || undefined,
    status,
  };
}

/**
 * Fetch all rental equipments from API
 */
export async function getAdminRentalEquipment(): Promise<RentalEquipment[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/rentals', {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res.map(transformRentalEquipment);
    if (res && Array.isArray(res.data)) return res.data.map(transformRentalEquipment);
    if (res && Array.isArray(res.items)) return res.items.map(transformRentalEquipment);
  } catch (err) {
    console.warn('[AdminRentalsAPI] Erreur de récupération des équipements:', err);
  }

  return [];
}

/**
 * Create rental equipment
 */
export async function createAdminRentalEquipment(
  data: CreateRentalEquipmentPayload
): Promise<RentalEquipment> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/rentals', data, {
    useAdminToken: true,
  });
  return transformRentalEquipment(res?.data || res);
}

/**
 * Update rental equipment
 */
export async function updateAdminRentalEquipment(
  id: string,
  data: Partial<CreateRentalEquipmentPayload>
): Promise<RentalEquipment> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/rentals/${id}`, data, {
    useAdminToken: true,
  });
  return transformRentalEquipment(res?.data || res);
}

/**
 * Delete rental equipment
 */
export async function deleteAdminRentalEquipment(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/rentals/${id}`, {
    useAdminToken: true,
  });
  return true;
}

