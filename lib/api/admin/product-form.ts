import { apiClient } from '../client';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

export type AdminProductStatus = 'ACTIVE' | 'HIDDEN' | 'ON_QUOTE' | 'PROMO';

export const PRODUCT_STATUS_LABELS: Record<AdminProductStatus, string> = {
  ACTIVE: 'En vente',
  PROMO: 'En promotion',
  ON_QUOTE: 'Sur devis',
  HIDDEN: 'Masqué',
};

export interface AdminVariant {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  minStockAlert: number;
}

/** Fiche produit telle que renvoyée par GET /admin/products/:id. */
export interface AdminProductDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { id: string; name: string; slug: string };
  subCategory: { id: string; name: string } | null;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  status: AdminProductStatus;
  isFeatured: boolean;
  variants: AdminVariant[];
}

export interface CategoryOption {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

export interface ProductPayload {
  categoryId: string;
  subCategoryId: string | null;
  name: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  status: AdminProductStatus;
  featuredImage: string | null;
  images: string[];
  variants: { id?: string; name: string; sku?: string; price: number; stockQuantity?: number; minStockAlert?: number }[];
}

export async function getAdminProductDto(id: string): Promise<AdminProductDto | null> {
  try {
    return await apiClient.get<AdminProductDto>(`/admin/products/${id}`, admin);
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const res = await apiClient.get<{ id: string; name: string; subCategories?: { id: string; name: string }[] }[]>('/admin/categories', admin);
  return res.map((c) => ({ id: c.id, name: c.name, subCategories: (c.subCategories ?? []).map((s) => ({ id: s.id, name: s.name })) }));
}

export async function saveAdminProduct(id: string | null, payload: ProductPayload): Promise<AdminProductDto> {
  return id
    ? apiClient.patch<AdminProductDto>(`/admin/products/${id}`, payload, admin)
    : apiClient.post<AdminProductDto>('/admin/products', payload, admin);
}

/** Masque le produit (par défaut) ou le supprime définitivement s'il n'a jamais été commandé. */
export async function removeAdminProduct(id: string, permanent: boolean): Promise<{ deleted: boolean }> {
  return apiClient.delete<{ deleted: boolean }>(`/admin/products/${id}`, { ...admin, params: { permanent: permanent ? 'true' : undefined } });
}

export async function duplicateAdminProduct(id: string): Promise<AdminProductDto> {
  return apiClient.post<AdminProductDto>(`/admin/products/${id}/duplicate`, undefined, admin);
}
