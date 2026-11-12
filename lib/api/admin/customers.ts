import { apiClient } from '../client';
import type { AdminCustomer, CustomerSegment } from '@/lib/admin/mock-data/types';
import { transformAdminOrder } from './orders';

export interface GetAdminCustomersParams {
  search?: string;
  segment?: string;
  status?: string;
  minSpent?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AdminCustomersResponse {
  customers: AdminCustomer[];
  total: number;
  page: number;
  totalPages: number;
  /** Compteurs sur toute la base (indépendants des filtres) */
  counts: { all: number; vip: number; entreprise: number; particulier: number; inactif: number };
}

// Map backend customer to AdminCustomer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminCustomer(raw: any): AdminCustomer {
  const name = raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Client';
  
  let segment: CustomerSegment = 'particulier';
  const rawSegment = (raw.segment || '').toLowerCase();
  if (rawSegment.includes('vip')) segment = 'vip';
  else if (rawSegment.includes('entreprise') || rawSegment.includes('b2b') || rawSegment.includes('pro')) segment = 'entreprise';

  const defaultAddr = Array.isArray(raw.addresses)
    ? raw.addresses.find((a: { isDefault?: boolean }) => a.isDefault) || raw.addresses[0]
    : raw.address;

  const addressStr = typeof defaultAddr === 'string'
    ? defaultAddr
    : defaultAddr
      ? [defaultAddr.street || defaultAddr.address, defaultAddr.city].filter(Boolean).join(', ')
      : raw.city || '';

  return {
    id: raw.id,
    name,
    email: raw.email || '',
    phone: raw.phone || '',
    segment,
    totalOrders: Number(raw.totalOrders ?? raw._count?.orders ?? 0),
    totalSpent: Number(raw.totalSpent ?? 0),
    status: raw.status === 'INACTIVE' || raw.isActive === false ? 'inactif' : 'actif',
    joinedAt: raw.createdAt ? raw.createdAt.split('T')[0] : (raw.joinedAt || '2024-01-01'),
    avatar: raw.avatar || '',
    address: addressStr || undefined,
    lastOrderDate: raw.lastOrderDate ? raw.lastOrderDate.split('T')[0] : undefined,
    loyaltyTier: raw.loyaltyTier,
    loyaltyPoints: raw.loyaltyPoints ? Number(raw.loyaltyPoints) : 0,
    notes: raw.notes || '',
    internalRating: raw.internalRating ? Number(raw.internalRating) : undefined,
    recentOrders: Array.isArray(raw.recentOrders) ? raw.recentOrders.map(transformAdminOrder) : [],
  };
}

/**
 * Liste paginée côté serveur (GET /admin/customers) : recherche, segment, statut, montant minimum et tri
 * portent sur toute la base. Lève une ApiClientError en cas d'échec.
 */
export async function getAdminCustomers(params: GetAdminCustomersParams = {}): Promise<AdminCustomersResponse> {
  const res = await apiClient.get<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[];
    total: number;
    page: number;
    totalPages: number;
    counts?: AdminCustomersResponse['counts'];
  }>('/admin/customers', {
    useAdminToken: true,
    cache: 'no-store',
    params: {
      search: params.search || undefined,
      segment: params.segment && params.segment !== 'all' ? params.segment : undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      minSpent: params.minSpent || undefined,
      sort: params.sort,
      page: params.page ?? 1,
      limit: params.limit ?? 25,
    },
  });
  return {
    customers: (res.items ?? []).map(transformAdminCustomer),
    total: res.total ?? 0,
    page: res.page ?? 1,
    totalPages: res.totalPages ?? 1,
    counts: res.counts ?? { all: 0, vip: 0, entreprise: 0, particulier: 0, inactif: 0 },
  };
}

/**
 * Get customer by ID
 */
export async function getAdminCustomerById(id: string): Promise<AdminCustomer | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/customers/${id}`, {
      useAdminToken: true,
      cache: 'no-store',
    });
    if (res) {
      return transformAdminCustomer(res?.data || res);
    }
  } catch (err) {
    console.warn(`[AdminCustomersAPI] Error fetching customer ${id}:`, err);
  }

  return null;
}

/**
 * Update customer segment or status
 */
export async function updateAdminCustomer(
  id: string,
  body: Partial<{
    name: string;
    phone: string;
    address: string | null;
    segment: 'PARTICULIER' | 'ENTREPRISE' | 'VIP';
    loyaltyPoints: number;
    isActive: boolean;
    notes: string | null;
    internalRating: number;
  }>,
): Promise<AdminCustomer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/customers/${id}`, body, { useAdminToken: true });
  return transformAdminCustomer(res);
}

/** Envoie un email au client depuis le back-office (POST /admin/customers/:id/email). */
export async function sendAdminCustomerEmail(
  customerId: string,
  body: { subject: string; message: string; sendCopy?: boolean },
): Promise<void> {
  await apiClient.post(`/admin/customers/${customerId}/email`, body, { useAdminToken: true });
}
