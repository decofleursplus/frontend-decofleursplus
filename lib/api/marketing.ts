import { apiClient } from './client';

export interface ValidatedCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  discountAmount: number;
  freeShipping: boolean;
  finalTotal: number;
  description?: string;
}

export interface ValidateCouponPayload {
  code: string;
  subtotal: number;
  deliveryFee?: number;
}

export interface ActivePromotion {
  id: string;
  name: string;
  targetType: 'all' | 'categories' | 'products';
  targetIds?: string[];
  targetNames?: string[];
  discountPercentage: number;
  startDate: string;
  endDate: string;
  badgeText: string;
  isActive: boolean;
}

/**
 * Valide un code promo pour le panier ou le checkout
 * Endpoint: POST /api/v1/coupons/validate
 */
export async function validateCoupon(
  payload: ValidateCouponPayload
): Promise<{ success: boolean; coupon?: ValidatedCoupon; error?: string }> {
  try {
    const coupon = await apiClient.post<ValidatedCoupon>('/coupons/validate', {
      code: payload.code.trim(),
      subtotal: payload.subtotal,
      deliveryFee: payload.deliveryFee ?? 0,
    });

    return { success: true, coupon };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible de vérifier ce code promo pour le moment.',
    };
  }
}

/**
 * Liste les promotions actives en vitrine
 * Endpoint: GET /api/v1/promotions/active
 */
export async function getActivePromotions(): Promise<ActivePromotion[]> {
  try {
    const promotions = await apiClient.get<ActivePromotion[]>('/promotions/active');
    return promotions || [];
  } catch {
    return [];
  }
}
