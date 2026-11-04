import { apiClient } from '../client';
import type { AdminCustomer, CustomerSegment } from '@/lib/admin/mock-data/types';

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
    ? raw.addresses.find((a: any) => a.isDefault) || raw.addresses[0]
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
  };
}

/**
 * Fetch customers list with CRM stats
 */
export async function getAdminCustomers(params?: GetAdminCustomersParams): Promise<AdminCustomersResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.segment && params.segment !== 'all') q.set('segment', params.segment);
    if (params?.status && params.status !== 'all') q.set('status', params.status.toUpperCase());
    if (params?.minSpent) q.set('minSpent', String(params.minSpent));
    if (params?.sort) q.set('sort', params.sort);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/customers${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (res && typeof res === 'object') {
      if (Array.isArray(res.customers)) {
        return {
          customers: res.customers.map(transformAdminCustomer),
          total: res.total ?? res.customers.length,
        };
      }
      if (Array.isArray(res)) {
        return {
          customers: res.map(transformAdminCustomer),
          total: res.length,
        };
      }
      if (Array.isArray(res.data)) {
        return {
          customers: res.data.map(transformAdminCustomer),
          total: res.total ?? res.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminCustomersAPI] Erreur de récupération des clients:', err);
  }

  return {
    customers: [],
    total: 0,
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
      return transformAdminCustomer(res);
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
    address: string;
    avatar: string;
    segment: string;
    status: string;
  }>
): Promise<AdminCustomer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/customers/${id}`, body, {
    useAdminToken: true,
  });
  return transformAdminCustomer(res);
}
