import { apiClient } from './client';

/** Code d'une formule (ex. PARTICULIER) : les formules sont gérées depuis le back-office. */
export type SubscriptionPlan = string;
export type SubscriptionFrequency = 'HEBDOMADAIRE' | 'BIMENSUELLE';
export type SubscriptionDeliveryDay = 'MARDI' | 'VENDREDI' | 'SAMEDI';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface PlanConfig {
  id: SubscriptionPlan;
  code: string;
  name: string;
  tagline: string;
  badge?: string;
  perDeliveryPrice: number;
  monthlyPriceHebdo: number;
  monthlyPriceBimensuel: number;
  bouquetSpecs: string;
  vaseSpecs: string;
  recommendedFor: string;
  serviceCommitments: string[];
  /** Rythmes proposés pour cette formule */
  frequencies: SubscriptionFrequency[];
  isActive: boolean;
  sortOrder: number;
}

export interface SubscribePayload {
  plan: SubscriptionPlan;
  frequency: SubscriptionFrequency;
  deliveryDay: SubscriptionDeliveryDay;
  recipientName: string;
  phone: string;
  email?: string;
  location: string;
  address: string;
  notes?: string;
  /** Mode de règlement souhaité (aucun paiement en ligne n'est déclenché à la souscription). */
  paymentMethod?: 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'FREE_MONEY' | 'CASH_ON_DELIVERY';
  paymentPhone?: string;
}

export type SubscriptionDeliveryStatus = 'SCHEDULED' | 'PREPARING' | 'DELIVERED' | 'SKIPPED';

export interface SubscriptionDelivery {
  id: string;
  subscriptionId?: string;
  scheduledDate: string;
  status: SubscriptionDeliveryStatus;
  deliveredAt?: string | null;
  vaseReturned: boolean;
  notes?: string | null;
}

export interface CustomerSubscription {
  id: string;
  subscriptionNumber: string;
  userId?: string | null;
  plan: SubscriptionPlan;
  /** Nom lisible de la formule (renvoyé par l'API) */
  planName?: string | null;
  frequency: SubscriptionFrequency;
  deliveryDay: SubscriptionDeliveryDay;
  status: SubscriptionStatus;
  recipientName: string;
  phone: string;
  email?: string | null;
  location: string;
  address: string;
  notes?: string | null;
  paymentMethod: string;
  paymentPhone?: string | null;
  perDeliveryPrice: number;
  monthlyAmount: number;
  deliveriesPerMonth: number;
  startDate: string;
  nextDeliveryDate?: string | null;
  pausedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  deliveries?: SubscriptionDelivery[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  } | null;
}

/** Zone de livraison active (GET /delivery-zones). */
export interface SubscriptionDeliveryZone {
  id: string;
  name: string;
  slug: string;
  coverage: string | null;
}

/** Modes de règlement activés par la boutique (GET /settings/public → payments). */
export interface SubscriptionPaymentOptions {
  wave: boolean;
  orangeMoney: boolean;
  card: boolean;
  cash: boolean;
}

/*
 * Toutes les fonctions ci-dessous laissent remonter les erreurs de l'API
 * (ApiClientError) : c'est à l'écran appelant d'afficher l'échec.
 */

/**
 * Récupérer les formules d'abonnements floraux
 * Endpoint: GET /api/v1/subscriptions/plans
 */
export async function getSubscriptionPlans(): Promise<PlanConfig[]> {
  return apiClient.get<PlanConfig[]>('/subscriptions/plans');
}

/**
 * Zones de livraison actives proposées pour un abonnement
 * Endpoint: GET /api/v1/delivery-zones
 */
export async function getSubscriptionDeliveryZones(): Promise<SubscriptionDeliveryZone[]> {
  return apiClient.get<SubscriptionDeliveryZone[]>('/delivery-zones');
}

/**
 * Modes de règlement activés dans les paramètres de la boutique
 * Endpoint: GET /api/v1/settings/public
 */
export async function getSubscriptionPaymentOptions(): Promise<SubscriptionPaymentOptions> {
  const settings = await apiClient.get<{ payments: SubscriptionPaymentOptions }>('/settings/public');
  return settings.payments;
}

/**
 * Souscrire à une formule d'abonnement floral
 * Endpoint: POST /api/v1/subscriptions
 */
export async function subscribeToPlan(payload: SubscribePayload): Promise<CustomerSubscription> {
  return apiClient.post<CustomerSubscription>('/subscriptions', payload);
}

/**
 * Récupérer les abonnements du client connecté
 * Endpoint: GET /api/v1/subscriptions/mine
 */
export async function getMySubscriptions(): Promise<CustomerSubscription[]> {
  return apiClient.get<CustomerSubscription[]>('/subscriptions/mine');
}

/**
 * Récupérer le détail d'un abonnement client (avec l'historique des passages)
 * Endpoint: GET /api/v1/subscriptions/mine/:subscriptionNumber
 */
export async function getMySubscription(subscriptionNumber: string): Promise<CustomerSubscription> {
  return apiClient.get<CustomerSubscription>(
    `/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}`
  );
}

/**
 * Suspendre temporairement un abonnement
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/pause
 */
export async function pauseMySubscription(subscriptionNumber: string): Promise<boolean> {
  await apiClient.patch(`/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/pause`);
  return true;
}

/**
 * Réactiver un abonnement suspendu
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/resume
 */
export async function resumeMySubscription(subscriptionNumber: string): Promise<boolean> {
  await apiClient.patch(`/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/resume`);
  return true;
}

/**
 * Résilier un abonnement
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/cancel
 */
export async function cancelMySubscription(
  subscriptionNumber: string,
  reason?: string
): Promise<boolean> {
  await apiClient.patch(
    `/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/cancel`,
    { reason }
  );
  return true;
}
