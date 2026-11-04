import { apiClient } from '../client';
import type { AdminProduct } from '@/lib/admin/mock-data/types';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  status?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  basePrice: number;
  promoPrice?: number;
  status?: 'ACTIVE' | 'HIDDEN' | 'ON_QUOTE' | 'PROMO';
  isFeatured?: boolean;
  minStock?: number;
  images?: Array<{ url: string; isPrimary?: boolean; order?: number }>;
  variants?: Array<{
    name: string;
    sku: string;
    price: number;
    stock: number;
  }>;
}

export interface AdminProductsResult {
  items: AdminProduct[];
  total: number;
}

function mapBackendToAdminProduct(p: any): AdminProduct {
  const primaryImage =
    p.images?.find((img: any) => img.isPrimary)?.url ||
    p.images?.[0]?.url ||
    p.imageUrl ||
    '/images/bouquet-passion.jpg';

  const totalStock = Array.isArray(p.variants)
    ? p.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
    : p.stock ?? 10;

  const firstSku = p.variants?.[0]?.sku || `PRD-${(p.id || '').slice(0, 6).toUpperCase()}`;
  const displayPrice = p.basePrice ?? p.variants?.[0]?.price ?? 25000;

  let mappedStatus: 'actif' | 'inactif' | 'rupture' = 'actif';
  if (p.status === 'HIDDEN' || p.status === 'inactif') {
    mappedStatus = 'inactif';
  } else if (totalStock <= 0 || p.status === 'OUT_OF_STOCK' || p.status === 'rupture') {
    mappedStatus = 'rupture';
  }

  return {
    id: p.id,
    name: p.name,
    category: p.category?.name || p.category || 'Bouquets',
    price: displayPrice,
    promoPrice: p.promoPrice || undefined,
    sku: firstSku,
    stock: totalStock,
    minStock: p.minStock ?? 5,
    status: mappedStatus,
    image: primaryImage,
    images: Array.isArray(p.images) ? p.images.map((i: any) => i.url || i) : [primaryImage],
    description: p.description || '',
    featured: Boolean(p.isFeatured ?? p.featured),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-03-01',
    rating: p.rating ?? 4.8,
    reviews: p.reviewsCount ?? p.reviews ?? 0,
  };
}

/**
 * Récupérer la liste des produits catalogue (Back-Office)
 * Endpoint: GET /api/v1/admin/products
 */
export async function getAdminProducts(
  params: ProductFilterParams = {}
): Promise<AdminProductsResult> {
  try {
    const res = await apiClient.get<any>('/admin/products', {
      params: {
        page: params.page,
        limit: params.limit,
        category: params.category,
        subCategory: params.subCategory,
        status: params.status,
        featured: params.featured,
        search: params.search,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sort: params.sort,
      },
      isAdmin: true,
    });

    const items = res?.items || res?.products || (Array.isArray(res) ? res : []);
    const total = res?.total ?? items.length;

    return {
      items: items.map(mapBackendToAdminProduct),
      total,
    };
  } catch (error) {
    console.warn('[Admin Products] Erreur lors de la récupération des produits:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Récupérer un produit par son identifiant
 * Endpoint: GET /api/v1/admin/products/:id
 */
export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  try {
    const res = await apiClient.get<any>(`/admin/products/${id}`, { isAdmin: true });
    return mapBackendToAdminProduct(res);
  } catch (error) {
    return null;
  }
}

/**
 * Créer un nouveau produit
 * Endpoint: POST /api/v1/admin/products
 */
export async function createAdminProduct(payload: CreateProductPayload): Promise<AdminProduct> {
  const res = await apiClient.post<any>('/admin/products', payload, { isAdmin: true });
  return mapBackendToAdminProduct(res);
}

/**
 * Mettre à jour un produit existant
 * Endpoint: PATCH /api/v1/admin/products/:id
 */
export async function updateAdminProduct(
  id: string,
  payload: Partial<CreateProductPayload>
): Promise<AdminProduct> {
  const res = await apiClient.patch<any>(`/admin/products/${id}`, payload, { isAdmin: true });
  return mapBackendToAdminProduct(res);
}

/**
 * Supprimer / masquer un produit
 * Endpoint: DELETE /api/v1/admin/products/:id
 */
export async function deleteAdminProduct(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/admin/products/${id}`, { isAdmin: true });
    return true;
  } catch {
    return false;
  }
}
