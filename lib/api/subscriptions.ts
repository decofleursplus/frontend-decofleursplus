import { apiClient } from './client';

export type SubscriptionPlan = 'PARTICULIER' | 'PRESTIGE' | 'ENTREPRISE';
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
  paymentMethod?: 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'FREE_MONEY' | 'CASH_ON_DELIVERY';
  paymentPhone?: string;
}

export interface SubscriptionDelivery {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'PREPARING' | 'DELIVERED' | 'SKIPPED';
  deliveredAt?: string | null;
  vaseReturned: boolean;
  notes?: string | null;
}

export interface CustomerSubscription {
  id: string;
  subscriptionNumber: string;
  plan: SubscriptionPlan;
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
  perDeliveryPrice: number;
  monthlyAmount: number;
  deliveriesPerMonth: number;
  startDate: string;
  nextDeliveryDate?: string | null;
  pausedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  deliveries?: SubscriptionDelivery[];
}

/**
 * Récupérer les formules d'abonnements floraux
 * Endpoint: GET /api/v1/subscriptions/plans
 */
export async function getSubscriptionPlans(): Promise<PlanConfig[]> {
  try {
    const plans = await apiClient.get<PlanConfig[]>('/subscriptions/plans');
    return plans || [];
  } catch {
    return [];
  }
}

/**
 * Souscrire à une formule d'abonnement floral
 * Endpoint: POST /api/v1/subscriptions
 */
export async function subscribeToPlan(payload: SubscribePayload): Promise<{
  success: boolean;
  subscription?: CustomerSubscription;
  error?: string;
}> {
  try {
    const res = await apiClient.post<CustomerSubscription>('/subscriptions', payload);
    return { success: true, subscription: res };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible d’enregistrer votre abonnement pour le moment.',
    };
  }
}

/**
 * Récupérer les abonnements du client connecté
 * Endpoint: GET /api/v1/subscriptions/mine
 */
export async function getMySubscriptions(): Promise<CustomerSubscription[]> {
  try {
    const subs = await apiClient.get<CustomerSubscription[]>('/subscriptions/mine');
    return subs || [];
  } catch {
    return [];
  }
}

/**
 * Récupérer le détail d'un abonnement client
 * Endpoint: GET /api/v1/subscriptions/mine/:subscriptionNumber
 */
export async function getMySubscription(
  subscriptionNumber: string
): Promise<CustomerSubscription | null> {
  try {
    const sub = await apiClient.get<CustomerSubscription>(
      `/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}`
    );
    return sub;
  } catch {
    return null;
  }
}

/**
 * Suspendre temporairement un abonnement
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/pause
 */
export async function pauseMySubscription(subscriptionNumber: string): Promise<boolean> {
  try {
    await apiClient.patch(`/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/pause`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Réactiver un abonnement suspendu
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/resume
 */
export async function resumeMySubscription(subscriptionNumber: string): Promise<boolean> {
  try {
    await apiClient.patch(`/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/resume`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Résilier un abonnement
 * Endpoint: PATCH /api/v1/subscriptions/mine/:subscriptionNumber/cancel
 */
export async function cancelMySubscription(
  subscriptionNumber: string,
  reason?: string
): Promise<boolean> {
  try {
    await apiClient.patch(
      `/subscriptions/mine/${encodeURIComponent(subscriptionNumber)}/cancel`,
      { reason }
    );
    return true;
  } catch {
    return false;
  }
}
