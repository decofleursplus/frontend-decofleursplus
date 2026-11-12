/**
 * Fidélité (échange de points), « Mes coupons », parrainage, cartes cadeaux et favoris.
 * Les erreurs remontent à l'appelant.
 */
import { apiClient } from './client';
import type { LoyaltyTier } from './customer';

export type PaymentMethodCode = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARD' | 'CASH_ON_DELIVERY';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodCode, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  FREE_MONEY: 'Free Money',
  CARD: 'Carte bancaire',
  CASH_ON_DELIVERY: 'Espèces',
};

// ---------------------------------------------------------------------------
// Programme de fidélité
// ---------------------------------------------------------------------------

export interface LoyaltyProgram {
  fcfaPerPoint: number;
  tiers: { tier: LoyaltyTier; minPoints: number }[];
  reward: { pointsCost: number; value: number; validityDays: number };
  referral: { enabled: boolean; referrerRewardPoints: number; refereeDiscountValue: number; refereeMinOrderAmount: number };
}

export function getLoyaltyProgram(): Promise<LoyaltyProgram> {
  return apiClient.get<LoyaltyProgram>('/loyalty/program');
}

export type MyCouponStatus = 'actif' | 'expire' | 'programme' | 'epuise' | 'inactif' | 'utilise';

export interface MyCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  description: string | null;
  minOrderAmount: number | null;
  startDate: string;
  endDate: string;
  origin: 'MANUAL' | 'LOYALTY' | 'REFERRAL';
  personal: boolean;
  status: MyCouponStatus;
  usable: boolean;
  usedByMe: number;
}

export function redeemLoyaltyPoints(): Promise<{ coupon: MyCoupon; balance: number }> {
  return apiClient.post('/customers/me/loyalty/redeem');
}

export function getMyCoupons(): Promise<{ personal: MyCoupon[]; offers: MyCoupon[] }> {
  return apiClient.get('/customers/me/coupons');
}

export const couponValueLabel = (c: Pick<MyCoupon, 'type' | 'value'>) =>
  c.type === 'percentage'
    ? `-${c.value} %`
    : c.type === 'fixed_amount'
      ? `-${c.value.toLocaleString('fr-FR')} FCFA`
      : 'Livraison offerte';

// ---------------------------------------------------------------------------
// Parrainage
// ---------------------------------------------------------------------------

export interface MyReferral {
  enabled: boolean;
  code: string;
  shareUrl: string;
  rewards: { referrerRewardPoints: number; refereeDiscountValue: number; refereeMinOrderAmount: number };
  stats: { total: number; rewarded: number; pending: number; pointsEarned: number };
  referrals: {
    id: string;
    refereeName: string;
    status: 'PENDING' | 'REWARDED' | 'CANCELLED';
    rewardPoints: number;
    createdAt: string;
    rewardedAt: string | null;
  }[];
}

export function getMyReferral(): Promise<MyReferral> {
  return apiClient.get<MyReferral>('/customers/me/referral');
}

export interface ReferralInvitation {
  code: string;
  referrerFirstName: string;
  refereeDiscountValue: number;
  refereeMinOrderAmount: number;
}

export function lookupReferralCode(code: string): Promise<ReferralInvitation> {
  return apiClient.get<ReferralInvitation>(`/referrals/${encodeURIComponent(code)}`);
}

/** Code reçu via /parrain/CODE, conservé jusqu'à l'inscription. */
export const REFERRAL_STORAGE_KEY = 'decofleur-parrainage';

export function rememberReferralCode(code: string) {
  try {
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, code);
  } catch {
    // stockage indisponible : le code reste dans l'URL d'inscription
  }
}

export function readRememberedReferralCode(): string {
  try {
    return window.localStorage.getItem(REFERRAL_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function forgetReferralCode() {
  try {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // rien à faire
  }
}

// ---------------------------------------------------------------------------
// Cartes cadeaux
// ---------------------------------------------------------------------------

export type GiftCardStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'USED' | 'DISABLED' | 'EXPIRED';

export const GIFT_CARD_STATUS_LABELS: Record<GiftCardStatus, string> = {
  PENDING_PAYMENT: 'En attente de paiement',
  ACTIVE: 'Active',
  USED: 'Épuisée',
  DISABLED: 'Désactivée',
  EXPIRED: 'Expirée',
};

export const GIFT_CARD_MIN_AMOUNT = 5000;
export const GIFT_CARD_MAX_AMOUNT = 500000;
export const GIFT_CARD_PRESETS = [10000, 25000, 50000, 100000];

export interface GiftCardPurchaseInput {
  amount: number;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone?: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
}

export function purchaseGiftCard(input: GiftCardPurchaseInput) {
  return apiClient.post<{ reference: string; amount: number; status: GiftCardStatus; recipientName: string; recipientEmail: string }>(
    '/gift-cards',
    input,
  );
}

export function checkGiftCardBalance(code: string) {
  return apiClient.post<{ code: string; status: GiftCardStatus; initialAmount: number; balance: number; expiresAt: string | null }>(
    '/gift-cards/balance',
    { code },
  );
}

export interface MyGiftCard {
  id: string;
  code: string | null;
  reference: string;
  role: 'received' | 'purchased';
  initialAmount: number;
  balance: number;
  status: GiftCardStatus;
  purchaserName: string;
  recipientName: string;
  recipientEmail: string;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function getMyGiftCards(): Promise<MyGiftCard[]> {
  return apiClient.get<MyGiftCard[]>('/customers/me/gift-cards');
}

// ---------------------------------------------------------------------------
// Favoris du compte
// ---------------------------------------------------------------------------

export interface FavoriteList {
  productIds: string[];
  items: { productId: string; addedAt: string }[];
}

export const getFavorites = () => apiClient.get<FavoriteList>('/favorites');
export const addFavorite = (productId: string) => apiClient.post<FavoriteList>('/favorites', { productId });
export const removeFavorite = (productId: string) => apiClient.delete<FavoriteList>(`/favorites/${encodeURIComponent(productId)}`);
export const syncFavorites = (productIds: string[]) => apiClient.post<FavoriteList>('/favorites/sync', { productIds });
