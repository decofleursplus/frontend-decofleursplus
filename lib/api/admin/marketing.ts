import { apiClient } from '../client';
import type {
  AdminCoupon,
  AdminPromotion,
  AdminCampaign,
  AdminAbandonedCart,
  CartRecoverySettings,
  CartReminderRunResult,
  CouponStatus,
  PromotionStatus,
} from '@/lib/admin/mock-data/types';

// ==========================================
// 1. COUPONS (CODES PROMO)
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminCoupon(raw: any): AdminCoupon {
  let status: CouponStatus = 'actif';
  const rawStatus = (raw.status || '').toLowerCase();
  if (rawStatus.includes('prog') || rawStatus.includes('sched')) status = 'programme';
  else if (rawStatus.includes('expir')) status = 'expire';
  else if (rawStatus.includes('epuis') || rawStatus.includes('exhaust')) status = 'epuise';
  else if (rawStatus.includes('inact')) status = 'inactif';

  return {
    id: raw.id,
    code: raw.code,
    type: raw.type === 'FREE_SHIPPING' ? 'free_shipping' : (raw.type === 'FIXED_AMOUNT' ? 'fixed_amount' : 'percentage'),
    value: Number(raw.value ?? raw.discount ?? 0),
    minOrderAmount: raw.minOrderAmount ? Number(raw.minOrderAmount) : undefined,
    maxUsageTotal: raw.maxUsageTotal ? Number(raw.maxUsageTotal) : undefined,
    currentUsageCount: Number(raw.currentUsageCount ?? raw.usageCount ?? 0),
    maxUsagePerCustomer: raw.maxUsagePerCustomer ? Number(raw.maxUsagePerCustomer) : undefined,
    startDate: raw.startDate ? raw.startDate.split('T')[0] : (raw.startsAt ? raw.startsAt.split('T')[0] : '2024-01-01'),
    endDate: raw.endDate ? raw.endDate.split('T')[0] : (raw.expiresAt ? raw.expiresAt.split('T')[0] : '2025-12-31'),
    status,
    revenueGenerated: Number(raw.revenueGenerated ?? 0),
    description: raw.description || '',
    isPublic: Boolean(raw.isPublic),
  };
}

export async function getAdminCoupons(params?: { status?: string; search?: string }): Promise<AdminCoupon[]> {
  try {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/marketing/coupons${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res.map(transformAdminCoupon);
    if (res && Array.isArray(res.coupons)) return res.coupons.map(transformAdminCoupon);
    if (res && Array.isArray(res.data)) return res.data.map(transformAdminCoupon);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Données marketing indisponibles');
  }
  return [];
}

export async function createAdminCoupon(data: {
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxUsageTotal?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  maxUsagePerCustomer?: number;
  isPublic?: boolean;
}): Promise<AdminCoupon> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/marketing/coupons', data, {
    useAdminToken: true,
  });
  return transformAdminCoupon(res);
}

export async function updateAdminCoupon(id: string, data: Partial<AdminCoupon>): Promise<AdminCoupon> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/marketing/coupons/${id}`, data, {
    useAdminToken: true,
  });
  return transformAdminCoupon(res);
}

export async function deleteAdminCoupon(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/marketing/coupons/${id}`, {
    useAdminToken: true,
  });
  return true;
}

// ==========================================
// 2. PROMOTIONS CATALOGUE
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminPromotion(raw: any): AdminPromotion {
  let status: PromotionStatus = 'active';
  const rawStatus = (raw.status || '').toLowerCase();
  if (rawStatus.includes('prog')) status = 'programmee';
  else if (rawStatus.includes('term') || rawStatus.includes('end')) status = 'terminee';
  else if (rawStatus.includes('inact')) status = 'inactive';

  return {
    id: raw.id,
    name: raw.name || raw.title || 'Promotion',
    targetType: raw.targetType || 'all',
    targetNames: Array.isArray(raw.targetNames) ? raw.targetNames : [],
    targetIds: Array.isArray(raw.targetIds) ? raw.targetIds : [],
    discountPercentage: Number(raw.discountPercentage ?? raw.discount ?? 10),
    startDate: raw.startDate ? raw.startDate.split('T')[0] : '2024-01-01',
    endDate: raw.endDate ? raw.endDate.split('T')[0] : '2025-12-31',
    badgeText: raw.badgeText || `-${Number(raw.discountPercentage ?? 10)}%`,
    status,
    salesCount: Number(raw.salesCount ?? 0),
    revenueGenerated: Number(raw.revenueGenerated ?? 0),
  };
}

export async function getAdminPromotions(params?: { status?: string; search?: string }): Promise<AdminPromotion[]> {
  try {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/marketing/promotions${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res.map(transformAdminPromotion);
    if (res && Array.isArray(res.promotions)) return res.promotions.map(transformAdminPromotion);
    if (res && Array.isArray(res.data)) return res.data.map(transformAdminPromotion);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Données marketing indisponibles');
  }
  return [];
}

export async function createAdminPromotion(data: {
  name: string;
  discountPercentage: number;
  startDate?: string;
  endDate?: string;
  badgeText?: string;
  targetType?: string;
  targetNames?: string[];
  targetIds?: string[];
}): Promise<AdminPromotion> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/marketing/promotions', data, {
    useAdminToken: true,
  });
  return transformAdminPromotion(res);
}

export async function updateAdminPromotion(id: string, data: Partial<AdminPromotion>): Promise<AdminPromotion> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/marketing/promotions/${id}`, data, {
    useAdminToken: true,
  });
  return transformAdminPromotion(res);
}

export async function deleteAdminPromotion(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/marketing/promotions/${id}`, {
    useAdminToken: true,
  });
  return true;
}

// ==========================================
// 3. CAMPAGNES MARKETING
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminCampaign(raw: any): AdminCampaign {
  return {
    id: raw.id,
    name: raw.name || raw.title || 'Campagne',
    channel: raw.channel || 'whatsapp',
    audience: raw.audience || 'Tous les clients',
    recipientCount: Number(raw.recipientCount ?? 0),
    sentAt: raw.sentAt,
    scheduledAt: raw.scheduledAt,
    openRate: raw.openRate != null ? Number(raw.openRate) : undefined,
    clickRate: raw.clickRate != null ? Number(raw.clickRate) : undefined,
    conversionCount: Number(raw.conversionCount ?? 0),
    revenueGenerated: Number(raw.revenueGenerated ?? 0),
    status: raw.status || 'brouillon',
    messageContent: raw.messageContent || raw.content || '',
  };
}

export async function getAdminCampaigns(params?: { channel?: string; search?: string }): Promise<AdminCampaign[]> {
  try {
    const q = new URLSearchParams();
    if (params?.channel && params.channel !== 'all') q.set('channel', params.channel);
    if (params?.search) q.set('search', params.search);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/marketing/campaigns${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res.map(transformAdminCampaign);
    if (res && Array.isArray(res.campaigns)) return res.campaigns.map(transformAdminCampaign);
    if (res && Array.isArray(res.data)) return res.data.map(transformAdminCampaign);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Données marketing indisponibles');
  }
  return [];
}

export async function createAdminCampaign(data: {
  name: string;
  channel: string;
  audience: string;
  messageContent: string;
}): Promise<AdminCampaign> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/marketing/campaigns', data, {
    useAdminToken: true,
  });
  return transformAdminCampaign(res);
}

export async function sendAdminCampaign(id: string): Promise<boolean> {
  await apiClient.post(`/admin/marketing/campaigns/${id}/send`, {}, {
    useAdminToken: true,
  });
  return true;
}

export async function deleteAdminCampaign(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/marketing/campaigns/${id}`, {
    useAdminToken: true,
  });
  return true;
}

// ==========================================
// 4. PANIERS ABANDONNÉS & RELANCES
// ==========================================

export async function getAdminAbandonedCarts(): Promise<AdminAbandonedCart[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/marketing/abandoned-carts', {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.carts)) return res.carts;
    if (res && Array.isArray(res.data)) return res.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Données marketing indisponibles');
  }
  return [];
}

export async function remindAdminAbandonedCart(id: string, channel: 'whatsapp' | 'email'): Promise<boolean> {
  await apiClient.post(`/admin/marketing/abandoned-carts/${id}/remind`, { channel }, {
    useAdminToken: true,
  });
  return true;
}

export async function getCartRecoverySettings(): Promise<CartRecoverySettings> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/marketing/abandoned-carts/settings', {
      useAdminToken: true,
      cache: 'no-store',
    });
    if (res) return res;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Réglages de relance indisponibles');
  }
  throw new Error('Réglages de relance indisponibles');
}

export async function updateCartRecoverySettings(settings: CartRecoverySettings): Promise<CartRecoverySettings> {
  const { lastAutoRunAt: _a, lastAutoRunSent: _b, ...editable } = settings;
  void _a;
  void _b;
  return apiClient.put<CartRecoverySettings>('/admin/marketing/abandoned-carts/settings', editable, {
    useAdminToken: true,
  });
}

/** Lance tout de suite un passage de la relance automatique (sinon exécutée toutes les 10 min par le serveur). */
export async function runAdminCartReminders(): Promise<CartReminderRunResult> {
  return apiClient.post<CartReminderRunResult>('/admin/marketing/abandoned-carts/run-reminders', undefined, {
    useAdminToken: true,
  });
}

/** Audiences de campagne (codes) avec le nombre réel de destinataires. */
export interface CampaignAudience {
  code: 'all' | 'newsletter' | 'vip' | 'entreprise' | 'inactive';
  label: string;
  count: number;
}

export async function getCampaignAudiences(): Promise<CampaignAudience[]> {
  return apiClient.get<CampaignAudience[]>('/admin/marketing/audiences', { useAdminToken: true, cache: 'no-store' });
}

export async function setAdminAbandonedCartStatus(id: string, status: 'recupere' | 'expire'): Promise<void> {
  await apiClient.patch(`/admin/marketing/abandoned-carts/${id}/status`, { status }, { useAdminToken: true });
}

export interface MarketingSummary {
  totalRevenue: number;
  activeCouponsCount: number;
  activePromosCount: number;
  recoveredRevenue: number;
  recoveryRate: number;
}

export async function getMarketingSummary(): Promise<MarketingSummary> {
  return apiClient.get<MarketingSummary>('/admin/marketing/summary', { useAdminToken: true, cache: 'no-store' });
}
