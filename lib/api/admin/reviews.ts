import { apiClient } from '../client';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

/** `approved` : publié en boutique ; `hidden` : masqué par l'équipe. */
export type ReviewStatusFilter = 'all' | 'approved' | 'hidden';

export interface AdminReview {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string; slug: string; featuredImage: string | null };
}

export interface AdminReviewList {
  items: AdminReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Compteurs par statut, calculés avec les filtres en cours (hors statut). */
  counts: Record<ReviewStatusFilter, number>;
}

export interface AdminReviewQuery {
  status?: ReviewStatusFilter;
  productId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/** Avis clients à modérer (GET /admin/reviews). */
export async function getAdminReviews(query: AdminReviewQuery = {}): Promise<AdminReviewList> {
  return apiClient.get<AdminReviewList>('/admin/reviews', {
    ...admin,
    params: {
      status: query.status && query.status !== 'all' ? query.status : undefined,
      productId: query.productId || undefined,
      rating: query.rating || undefined,
      search: query.search || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 25,
    },
  });
}

/** Masque (`false`) ou republie (`true`) un avis ; la note du produit est recalculée. */
export async function setAdminReviewApproved(id: string, isApproved: boolean): Promise<AdminReview> {
  return apiClient.patch<AdminReview>(`/admin/reviews/${id}`, { isApproved }, admin);
}

/** Suppression définitive d'un avis. */
export async function deleteAdminReview(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/admin/reviews/${id}`, admin);
}
