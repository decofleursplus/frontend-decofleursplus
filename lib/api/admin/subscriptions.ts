import { apiClient } from '../client';
import type { CustomerSubscription } from '@/lib/api/subscriptions';

export interface GetAdminSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  frequency?: string;
}

export interface AdminSubscriptionsResponse {
  subscriptions: CustomerSubscription[];
  total: number;
}

/**
 * Fetch subscriptions for back-office
 */
export async function getAdminSubscriptions(
  params?: GetAdminSubscriptionsParams
): Promise<AdminSubscriptionsResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'all') q.set('status', params.status.toUpperCase());
    if (params?.plan && params.plan !== 'all') q.set('plan', params.plan);
    if (params?.frequency && params.frequency !== 'all') q.set('frequency', params.frequency);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/subscriptions${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (res && typeof res === 'object') {
      const dataObj = res.data ?? res;
      if (Array.isArray(dataObj.items)) {
        return {
          subscriptions: dataObj.items,
          total: dataObj.total ?? dataObj.items.length,
        };
      }
      if (Array.isArray(res.subscriptions)) {
        return {
          subscriptions: res.subscriptions,
          total: res.total ?? res.subscriptions.length,
        };
      }
      if (Array.isArray(res)) {
        return {
          subscriptions: res,
          total: res.length,
        };
      }
      if (Array.isArray(res.data)) {
        return {
          subscriptions: res.data,
          total: res.total ?? res.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminSubscriptionsAPI] Error fetching admin subscriptions:', err);
  }

  return {
    subscriptions: [],
    total: 0,
  };
}

/**
 * Update subscription status (ACTIVE, PAUSED, CANCELLED)
 */
export async function updateAdminSubscriptionStatus(
  id: string,
  body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'; reason?: string }
): Promise<boolean> {
  await apiClient.patch(`/admin/subscriptions/${id}/status`, body, {
    useAdminToken: true,
  });
  return true;
}

/**
 * Update delivery slot or driver for a recurring subscription passage
 */
export async function updateAdminSubscriptionDelivery(
  deliveryId: string,
  body: { scheduledDate?: string; timeSlot?: string; driverId?: string; status?: string }
): Promise<boolean> {
  await apiClient.patch(`/admin/subscriptions/deliveries/${deliveryId}`, body, {
    useAdminToken: true,
  });
  return true;
}
