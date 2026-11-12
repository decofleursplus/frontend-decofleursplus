import { apiClient } from '../client';
import type {
  PlanConfig,
  CustomerSubscription,
  SubscriptionDelivery,
  SubscriptionDeliveryStatus,
  SubscriptionFrequency,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@/lib/api/subscriptions';

export interface GetAdminSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  frequency?: SubscriptionFrequency;
}

/** Statistiques globales (indépendantes des filtres), calculées par le serveur. */
export interface AdminSubscriptionStats {
  total: number;
  active: number;
  paused: number;
  cancelled: number;
  expired: number;
  /** Somme des montants mensuels des abonnements actifs (FCFA). */
  monthlyRecurringRevenue: number;
}

export interface AdminSubscriptionsResponse {
  items: CustomerSubscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AdminSubscriptionStats;
}

/**
 * Liste paginée des abonnements + statistiques globales
 * Endpoint: GET /api/v1/admin/subscriptions
 */
export async function getAdminSubscriptions(
  params: GetAdminSubscriptionsParams = {}
): Promise<AdminSubscriptionsResponse> {
  return apiClient.get<AdminSubscriptionsResponse>('/admin/subscriptions', {
    useAdminToken: true,
    params: { ...params },
  });
}

/**
 * Détail d'un abonnement avec l'historique complet de ses passages
 * Endpoint: GET /api/v1/admin/subscriptions/:id
 */
export async function getAdminSubscription(id: string): Promise<CustomerSubscription> {
  return apiClient.get<CustomerSubscription>(`/admin/subscriptions/${encodeURIComponent(id)}`, {
    useAdminToken: true,
  });
}

/**
 * Changer le statut d'un abonnement. `reason` est obligatoire pour CANCELLED.
 * Endpoint: PATCH /api/v1/admin/subscriptions/:id/status
 */
export async function updateAdminSubscriptionStatus(
  id: string,
  body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'; reason?: string }
): Promise<CustomerSubscription> {
  return apiClient.patch<CustomerSubscription>(
    `/admin/subscriptions/${encodeURIComponent(id)}/status`,
    body,
    { useAdminToken: true }
  );
}

export interface UpdateSubscriptionDeliveryPayload {
  status?: SubscriptionDeliveryStatus;
  /** Date ISO ; par défaut le serveur utilise l'heure du passage à DELIVERED. */
  deliveredAt?: string | null;
  vaseReturned?: boolean;
  notes?: string | null;
}

/**
 * Mettre à jour un passage (statut, vase récupéré, note)
 * Endpoint: PATCH /api/v1/admin/subscriptions/deliveries/:deliveryId
 */
export async function updateAdminSubscriptionDelivery(
  deliveryId: string,
  body: UpdateSubscriptionDeliveryPayload
): Promise<SubscriptionDelivery> {
  return apiClient.patch<SubscriptionDelivery>(
    `/admin/subscriptions/deliveries/${encodeURIComponent(deliveryId)}`,
    body,
    { useAdminToken: true }
  );
}

// ---------- Formules (catalogue géré par l'équipe) ----------

export interface AdminSubscriptionPlan extends PlanConfig {
  /** Abonnements (tous statuts) rattachés à la formule */
  subscriptionsCount: number;
}

export interface SubscriptionPlanPayload {
  name: string;
  tagline: string;
  badge?: string | null;
  perDeliveryPrice: number;
  monthlyPriceHebdo: number;
  monthlyPriceBimensuel: number;
  bouquetSpecs: string;
  vaseSpecs: string;
  recommendedFor: string;
  serviceCommitments: string[];
  frequencies: SubscriptionFrequency[];
  isActive?: boolean;
  sortOrder?: number;
}

const adminOpts = { useAdminToken: true as const, cache: 'no-store' as const };

/** Toutes les formules (actives ou non) — GET /admin/subscription-plans */
export async function getAdminSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
  return apiClient.get<AdminSubscriptionPlan[]>('/admin/subscription-plans', adminOpts);
}

/** Crée une formule ; le code est dérivé du nom s'il n'est pas fourni. */
export async function createAdminSubscriptionPlan(payload: SubscriptionPlanPayload & { code?: string }): Promise<AdminSubscriptionPlan> {
  return apiClient.post<AdminSubscriptionPlan>('/admin/subscription-plans', payload, adminOpts);
}

export async function updateAdminSubscriptionPlan(code: string, payload: Partial<SubscriptionPlanPayload>): Promise<AdminSubscriptionPlan> {
  return apiClient.patch<AdminSubscriptionPlan>(`/admin/subscription-plans/${encodeURIComponent(code)}`, payload, adminOpts);
}

/** Refusé (409) si des abonnements utilisent la formule : il faut alors la désactiver. */
export async function deleteAdminSubscriptionPlan(code: string): Promise<void> {
  await apiClient.delete(`/admin/subscription-plans/${encodeURIComponent(code)}`, adminOpts);
}
