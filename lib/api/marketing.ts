import { apiClient } from './client';

export interface ActivePromotion {
  id: string;
  name: string;
  targetType: 'all' | 'categories' | 'products';
  targetIds: string[];
  targetNames: string[];
  discountPercentage: number;
  startDate: string;
  endDate: string;
  badgeText: string;
  isActive: boolean;
}

/** Promotions en cours, réellement appliquées aux prix de la vitrine. */
export async function getActivePromotions(): Promise<ActivePromotion[]> {
  return apiClient.get<ActivePromotion[]>('/promotions/active');
}
