/**
 * Back-office : cartes cadeaux, réglages du programme de fidélité et parrainages.
 * Les erreurs remontent à l'appelant (aucune donnée de repli).
 */
import { apiClient } from '../client';
import type { GiftCardStatus, PaymentMethodCode } from '../rewards';

export interface AdminGiftCard {
  id: string;
  code: string;
  initialAmount: number;
  balance: number;
  status: GiftCardStatus;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string | null;
  recipientName: string;
  recipientEmail: string;
  message: string | null;
  paymentMethod: PaymentMethodCode | null;
  paidAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  issuedInStore: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGiftCardDetail extends AdminGiftCard {
  transactions: {
    id: string;
    amount: number;
    balanceAfter: number;
    orderId: string | null;
    orderNumber: string | null;
    note: string;
    createdAt: string;
  }[];
}

export type GiftCardCounts = Record<GiftCardStatus | 'all', number>;

export interface AdminGiftCardPage {
  items: AdminGiftCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: GiftCardCounts;
}

const admin = { useAdminToken: true } as const;

export function listAdminGiftCards(params: { status?: GiftCardStatus; search?: string; page: number; limit: number }) {
  return apiClient.get<AdminGiftCardPage>('/admin/gift-cards', { ...admin, params });
}

export function getAdminGiftCard(id: string) {
  return apiClient.get<AdminGiftCardDetail>(`/admin/gift-cards/${encodeURIComponent(id)}`, admin);
}

export interface IssueGiftCardInput {
  amount: number;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  purchaserName?: string;
  purchaserEmail?: string;
  purchaserPhone?: string;
  paymentMethod?: PaymentMethodCode;
  notes?: string;
  sendEmail?: boolean;
}

export function issueGiftCard(input: IssueGiftCardInput) {
  return apiClient.post<AdminGiftCardDetail>('/admin/gift-cards', input, admin);
}

export function activateGiftCard(id: string, input: { paymentMethod: PaymentMethodCode; notes?: string }) {
  return apiClient.post<AdminGiftCardDetail>(`/admin/gift-cards/${encodeURIComponent(id)}/activate`, input, admin);
}

export function disableGiftCard(id: string, reason?: string) {
  return apiClient.post<AdminGiftCardDetail>(`/admin/gift-cards/${encodeURIComponent(id)}/disable`, { reason }, admin);
}

export function enableGiftCard(id: string) {
  return apiClient.post<AdminGiftCardDetail>(`/admin/gift-cards/${encodeURIComponent(id)}/enable`, undefined, admin);
}

export function resendGiftCard(id: string) {
  return apiClient.post<{ sent: boolean; to: string }>(`/admin/gift-cards/${encodeURIComponent(id)}/resend`, undefined, admin);
}

// ---------------------------------------------------------------------------
// Programme de fidélité & parrainage
// ---------------------------------------------------------------------------

export interface LoyaltySettings {
  fcfaPerPoint: number;
  silverMinPoints: number;
  goldMinPoints: number;
  platinumMinPoints: number;
  rewardPointsCost: number;
  rewardValue: number;
  rewardValidityDays: number;
  referralEnabled: boolean;
  referrerRewardPoints: number;
  refereeDiscountValue: number;
  refereeMinOrderAmount: number;
  updatedAt: string;
}

export type LoyaltySettingsInput = Partial<Omit<LoyaltySettings, 'updatedAt'>>;

export function getLoyaltySettings() {
  return apiClient.get<LoyaltySettings>('/admin/loyalty-settings', admin);
}

export function updateLoyaltySettings(input: LoyaltySettingsInput) {
  return apiClient.put<LoyaltySettings>('/admin/loyalty-settings', input, admin);
}

export interface AdminReferral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  refereeName: string;
  refereeEmail: string;
  status: 'PENDING' | 'REWARDED' | 'CANCELLED';
  welcomeCouponIssued: boolean;
  rewardPoints: number;
  createdAt: string;
  rewardedAt: string | null;
}

export function listAdminReferrals(params: { status?: AdminReferral['status']; search?: string } = {}) {
  return apiClient.get<AdminReferral[]>('/admin/referrals', { ...admin, params });
}
