import type {
  AdminCoupon,
  AdminPromotion,
  AdminCampaign,
  AdminAbandonedCart,
  CartRecoverySettings,
} from './types';

export const adminCoupons: AdminCoupon[] = [];
export const adminPromotions: AdminPromotion[] = [];
export const adminCampaigns: AdminCampaign[] = [];
export const adminAbandonedCarts: AdminAbandonedCart[] = [];

export const initialCoupons: AdminCoupon[] = adminCoupons;
export const initialPromotions: AdminPromotion[] = adminPromotions;
export const initialCampaigns: AdminCampaign[] = adminCampaigns;
export const initialAbandonedCarts: AdminAbandonedCart[] = adminAbandonedCarts;

export const defaultCartRecoverySettings: CartRecoverySettings = {
  autoEnabled: false,
  delayHours1: 2,
  delayHours2: 24,
  includeDiscount: false,
  discountCode: '',
  discountValue: '',
};
