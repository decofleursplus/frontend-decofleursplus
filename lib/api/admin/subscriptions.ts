import { apiClient } from '../client';
import type {
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
