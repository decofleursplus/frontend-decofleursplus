/**
 * Service API Catalogue public (catégories, produits, avis).
 * Les erreurs remontent à l'appelant : aucune liste vide ni valeur de repli silencieuse.
 */

import { apiClient } from './client';
import { PaginatedResponse } from './types';
import { PRODUCT_PLACEHOLDER_IMAGE, type Product, type ProductStatus } from '../products';

export interface ApiSubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  /** Produits visibles en vitrine */
  productCount?: number;
  subCategories?: ApiSubCategory[];
}

export interface ApiProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  stockQuantity: number;
  minStockAlert: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  subCategory?: { id: string; name: string; slug: string } | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string | null;
  badgeType?: 'discount' | 'new' | null;
  isNew?: boolean;
  promotion?: { id: string; name: string; badgeText: string | null; discountPercentage: number } | null;
  inStock: boolean;
  status: ProductStatus;
  isFeatured?: boolean;
  reference?: string | null;
  variants?: ApiProductVariant[];
  createdAt?: string;
}

export type ProductSort = 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'name';

export interface ProductFilterParams {
  /** Slug de la catégorie */
  category?: string;
  /** Slug de la sous-catégorie */
  subCategory?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  newOnly?: boolean;
  onSale?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

/** Convertit un produit de l'API au format utilisé par les composants de la vitrine. */
export function mapApiProductToProduct(item: ApiProduct): Product {
  const images = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category?.name ?? '',
    categorySlug: item.category?.slug ?? null,
    price: item.price,
    oldPrice: item.oldPrice ?? undefined,
    image: item.image || images[0] || PRODUCT_PLACEHOLDER_IMAGE,
    images: images.length > 0 ? images : [PRODUCT_PLACEHOLDER_IMAGE],
    rating: item.rating ?? 0,
    reviews: item.reviews ?? 0,
    badge: item.badge ?? undefined,
    badgeType: item.badgeType ?? undefined,
    description: item.description || '',
    inStock: item.inStock,
    reference: item.reference ?? undefined,
    status: item.status,
    isNew: Boolean(item.isNew),
    promotion: item.promotion ?? null,
    variants: (item.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      oldPrice: v.oldPrice,
      stockQuantity: v.stockQuantity,
    })),
  };
}

/** Catégories visibles en vitrine (triées par le serveur). */
export async function getCategories(): Promise<ApiCategory[]> {
  return apiClient.get<ApiCategory[]>('/categories');
}

/** Détail d'une catégorie ; renvoie null si elle n'existe pas (404). */
export async function getCategoryBySlug(slug: string): Promise<ApiCategory | null> {
  try {
    return await apiClient.get<ApiCategory>(`/categories/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** Liste filtrée et paginée des produits publics. */
export async function getProducts(filters: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> {
  const apiData = await apiClient.get<PaginatedResponse<ApiProduct>>('/products', {
    params: {
      category: filters.category,
      subCategory: filters.subCategory,
      featured: filters.featured ? 'true' : undefined,
      inStock: filters.inStock ? 'true' : undefined,
      newOnly: filters.newOnly ? 'true' : undefined,
      onSale: filters.onSale ? 'true' : undefined,
      search: filters.search,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: filters.page || 1,
      limit: filters.limit || 20,
    },
  });
  return { ...apiData, items: apiData.items.map(mapApiProductToProduct) };
}

/** Produits mis en avant (page d'accueil). */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return (await getProducts({ featured: true, limit })).items;
}

/** Détail d'un produit ; renvoie null si le produit n'existe pas ou n'est plus en vente (404). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const apiProduct = await apiClient.get<ApiProduct>(`/products/${encodeURIComponent(slug)}`);
    return mapApiProductToProduct(apiProduct);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404);
}

// ── Avis produits ──────────────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  reviewsCount: number;
}

export interface AddProductReviewPayload {
  rating: number;
  comment: string;
  /** Nom affiché (2 à 80 caractères) */
  userName: string;
  userEmail?: string;
}

export async function getProductReviews(
  productId: string,
  options?: { page?: number; limit?: number },
): Promise<ProductReviewsResponse> {
  return apiClient.get<ProductReviewsResponse>(`/products/${productId}/reviews`, { params: options });
}

/** Dépose un avis (connecté ou non) ; le serveur recalcule la note moyenne. */
export async function addProductReview(productId: string, payload: AddProductReviewPayload): Promise<ProductReview> {
  return apiClient.post<ProductReview>(`/products/${productId}/reviews`, {
    rating: payload.rating,
    comment: payload.comment.trim(),
    userName: payload.userName.trim(),
    ...(payload.userEmail?.trim() ? { userEmail: payload.userEmail.trim() } : {}),
  });
}
