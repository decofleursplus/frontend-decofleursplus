import { apiClient, ApiClientError } from '../client';
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
  compareAtPrice?: number | null;
  status?: 'ACTIVE' | 'HIDDEN' | 'ON_QUOTE' | 'PROMO';
  isFeatured?: boolean;
  minStock?: number;
  featuredImage?: string | null;
  images?: string[] | Array<{ url: string; isPrimary?: boolean; order?: number }>;
  variants?: Array<{
    id?: string;
    name: string;
    sku?: string;
    price: number;
    stock?: number;
    stockQuantity?: number;
    minStockAlert?: number;
  }>;
}

export interface AdminProductsResult {
  items: AdminProduct[];
  total: number;
}

interface BackendImage {
  url?: string;
  isPrimary?: boolean;
}

interface BackendVariant {
  id?: string;
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  stockQuantity?: number;
  minStockAlert?: number;
}

interface BackendProductResponse {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  category?: { id?: string; name?: string; slug?: string } | string;
  basePrice?: number;
  price?: number;
  compareAtPrice?: number | null;
  promoPrice?: number;
  featuredImage?: string | null;
  imageUrl?: string;
  images?: Array<BackendImage | string>;
  variants?: BackendVariant[];
  stock?: number;
  isFeatured?: boolean;
  featured?: boolean;
  status?: string;
  createdAt?: string;
  rating?: number;
  averageRating?: number;
  reviewsCount?: number;
  reviews?: number;
}

interface BackendProductsListResponse {
  items?: BackendProductResponse[];
  products?: BackendProductResponse[];
  total?: number;
}

function mapBackendToAdminProduct(p: BackendProductResponse): AdminProduct {
  const primaryImage =
    p.featuredImage ||
    (p.images?.find((img): img is BackendImage => typeof img !== 'string' && Boolean(img?.isPrimary)))?.url ||
    (typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url) ||
    p.imageUrl ||
    '/images/bouquet-passion.jpg';

  const totalStock = Array.isArray(p.variants)
    ? p.variants.reduce((acc: number, v) => acc + (v.stockQuantity ?? v.stock ?? 0), 0)
    : p.stock ?? 0;

  const firstSku = p.variants?.[0]?.sku || `PRD-${(p.id || '').slice(0, 6).toUpperCase()}`;
  const displayPrice = p.basePrice ?? p.price ?? p.variants?.[0]?.price ?? 0;

  let mappedStatus: 'actif' | 'inactif' | 'rupture' = 'actif';
  if (p.status === 'HIDDEN' || p.status === 'inactif') {
    mappedStatus = 'inactif';
  } else if (totalStock <= 0 || p.status === 'OUT_OF_STOCK' || p.status === 'rupture') {
    mappedStatus = 'rupture';
  }

  // Tarification : compareAtPrice (ou oldPrice) est l'ancien prix barré, basePrice est le prix d'achat effectif
  let price = displayPrice;
  let promoPrice: number | undefined = undefined;

  const compareVal =
    typeof p.compareAtPrice === 'number' && p.compareAtPrice > 0
      ? p.compareAtPrice
      : typeof (p as { oldPrice?: number | null }).oldPrice === 'number' && (p as { oldPrice?: number | null }).oldPrice! > 0
      ? (p as { oldPrice?: number | null }).oldPrice!
      : null;

  if (compareVal && compareVal > displayPrice) {
    price = compareVal; // Prix original barré
    promoPrice = displayPrice; // Prix effectif en promo
  } else if (typeof p.promoPrice === 'number' && p.promoPrice > 0 && p.promoPrice < displayPrice) {
    promoPrice = p.promoPrice;
  }

  const normalizedImages = Array.isArray(p.images)
    ? p.images.map((i) => (typeof i === 'string' ? i : i.url)).filter((url): url is string => Boolean(url))
    : primaryImage
    ? [primaryImage]
    : [];

  const categoryName = typeof p.category === 'object' && p.category !== null ? p.category.name : p.category;
  const categoryId = typeof p.category === 'object' && p.category !== null ? p.category.id : p.categoryId;

  return {
    id: p.id,
    slug: p.slug,
    variantId: p.variants?.[0]?.id || '',
    name: p.name,
    category: categoryName || 'Bouquets',
    categoryId: categoryId || '',
    price,
    promoPrice,
    compareAtPrice: compareVal && compareVal > displayPrice ? compareVal : null,
    sku: firstSku,
    stock: totalStock,
    minStock: 5,
    status: mappedStatus,
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
    description: p.description || '',
    featured: Boolean(p.isFeatured ?? p.featured),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    rating: p.rating ?? p.averageRating ?? 5,
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
    const res = await apiClient.get<BackendProductsListResponse | BackendProductResponse[]>('/admin/products', {
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

    const items = Array.isArray(res)
      ? res
      : res?.items || res?.products || [];
    const total = Array.isArray(res) ? items.length : (res?.total ?? items.length);

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
    const res = await apiClient.get<BackendProductResponse>(`/admin/products/${id}`, { isAdmin: true });
    return mapBackendToAdminProduct(res);
  } catch {
    return null;
  }
}

/**
 * Créer un nouveau produit
 * Endpoint: POST /api/v1/admin/products
 */
export async function createAdminProduct(payload: CreateProductPayload): Promise<AdminProduct> {
  const normalizedImages: string[] = Array.isArray(payload.images)
    ? payload.images
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter((url): url is string => Boolean(url))
    : [];

  const featured =
    typeof payload.featuredImage === 'string' && payload.featuredImage.trim().length > 0
      ? payload.featuredImage.trim()
      : normalizedImages[0] || undefined;

  const slug =
    payload.slug ||
    payload.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    `prd-${Date.now()}`;

  // Logique de prix: le backend exige compareAtPrice > basePrice
  const hasPromo = typeof payload.promoPrice === 'number' && payload.promoPrice > 0;
  let effectiveBasePrice = payload.basePrice;
  let effectiveCompareAtPrice: number | null = null;
  let status = payload.status || 'ACTIVE';

  if (hasPromo) {
    if (payload.promoPrice! < payload.basePrice) {
      // Cas standard : basePrice devient le prix promo réduit, compareAtPrice devient l'ancien prix
      effectiveBasePrice = payload.promoPrice!;
      effectiveCompareAtPrice = payload.basePrice;
    } else if (payload.promoPrice! > payload.basePrice) {
      // L'utilisateur a saisi l'ancien prix plus élevé dans promoPrice
      effectiveBasePrice = payload.basePrice;
      effectiveCompareAtPrice = payload.promoPrice!;
    }
    if (!payload.status) {
      status = 'PROMO';
    }
  } else {
    // Si aucun prix promotionnel n'est renseigné, compareAtPrice est null et le statut par défaut est ACTIVE
    effectiveBasePrice = payload.basePrice;
    effectiveCompareAtPrice = null;
    if (!payload.status || payload.status === 'PROMO') {
      status = 'ACTIVE';
    }
  }

  // Construction du corps strict conforme à createProductSchema
  const backendPayload: Record<string, unknown> = {
    name: payload.name.trim(),
    slug,
    description: payload.description.trim(),
    categoryId: payload.categoryId.trim(),
    basePrice: effectiveBasePrice,
    compareAtPrice: effectiveCompareAtPrice,
    isFeatured: Boolean(payload.isFeatured),
    status,
  };

  if (payload.subCategoryId) {
    backendPayload.subCategoryId = payload.subCategoryId.trim();
  }

  if (featured) {
    backendPayload.featuredImage = featured;
  }

  if (normalizedImages.length > 0) {
    backendPayload.images = normalizedImages;
  }

  if (payload.variants && payload.variants.length > 0) {
    backendPayload.variants = payload.variants.map((v, index) => {
      const variantItem: Record<string, unknown> = {
        name: v.name.trim(),
        price: !hasPromo && index === 0 ? payload.basePrice : effectiveBasePrice,
      };
      if (v.sku && v.sku.trim().length > 0) {
        variantItem.sku = v.sku.trim();
      }
      if (typeof v.stockQuantity === 'number') {
        variantItem.stockQuantity = v.stockQuantity;
      } else if (typeof v.stock === 'number') {
        variantItem.stockQuantity = v.stock;
      }
      if (typeof v.minStockAlert === 'number') {
        variantItem.minStockAlert = v.minStockAlert;
      }
      return variantItem;
    });
  }

  try {
    const res = await apiClient.post<BackendProductResponse>('/admin/products', backendPayload, { isAdmin: true });
    return mapBackendToAdminProduct(res);
  } catch (err: unknown) {
    // Si l'instance active du backend requiert un SKU obligatoire pour les variantes (version legacy)
    if (
      err instanceof ApiClientError &&
      err.status === 400 &&
      Array.isArray(backendPayload.variants) &&
      backendPayload.variants.some((v) => typeof v === 'object' && v !== null && !('sku' in v))
    ) {
      const fallbackCat = (payload.categoryId || 'PRD').slice(0, 3).toUpperCase();
      backendPayload.variants = (backendPayload.variants as Array<Record<string, unknown>>).map((v) => {
        if (!('sku' in v) || !v.sku) {
          const rand = Math.floor(100000 + Math.random() * 900000);
          return { ...v, sku: `DFP-${fallbackCat}-${rand}` };
        }
        return v;
      });
      const retryRes = await apiClient.post<BackendProductResponse>('/admin/products', backendPayload, { isAdmin: true });
      return mapBackendToAdminProduct(retryRes);
    }
    throw err;
  }
}

/**
 * Mettre à jour un produit existant
 * Endpoint: PATCH /api/v1/admin/products/:id
 */
export async function updateAdminProduct(
  id: string,
  payload: Partial<CreateProductPayload>
): Promise<AdminProduct> {
  const backendPayload: Record<string, unknown> = {};

  if (payload.name !== undefined) backendPayload.name = payload.name.trim();
  if (payload.slug !== undefined) backendPayload.slug = payload.slug.trim();
  if (payload.description !== undefined) backendPayload.description = payload.description.trim();
  if (payload.categoryId !== undefined) backendPayload.categoryId = payload.categoryId.trim();
  if (payload.subCategoryId !== undefined) backendPayload.subCategoryId = payload.subCategoryId;
  if (payload.isFeatured !== undefined) backendPayload.isFeatured = Boolean(payload.isFeatured);
  if (payload.status !== undefined) backendPayload.status = payload.status;

  // Gestion des prix
  if (payload.promoPrice !== undefined) {
    const base = payload.basePrice ?? 0;
    if (payload.promoPrice && base && payload.promoPrice > 0 && payload.promoPrice < base) {
      backendPayload.basePrice = payload.promoPrice;
      backendPayload.compareAtPrice = base;
    } else {
      backendPayload.compareAtPrice = null;
      if (payload.basePrice !== undefined) backendPayload.basePrice = payload.basePrice;
    }
  } else if (payload.compareAtPrice !== undefined) {
    backendPayload.compareAtPrice = payload.compareAtPrice;
    if (payload.basePrice !== undefined) backendPayload.basePrice = payload.basePrice;
  } else {
    if (payload.basePrice !== undefined) backendPayload.basePrice = payload.basePrice;
  }

  // Gestion des images
  if (payload.images !== undefined) {
    const norm = Array.isArray(payload.images)
      ? payload.images
          .map((img) => (typeof img === 'string' ? img : img?.url))
          .filter((url): url is string => Boolean(url))
      : [];
    backendPayload.images = norm;
    if (payload.featuredImage === undefined && norm.length > 0) {
      backendPayload.featuredImage = norm[0];
    }
  }

  if (payload.featuredImage !== undefined) {
    backendPayload.featuredImage =
      typeof payload.featuredImage === 'string' && payload.featuredImage.trim().length > 0
        ? payload.featuredImage.trim()
        : null;
  }

  // Gestion des variantes
  if (payload.variants !== undefined) {
    backendPayload.variants = payload.variants.map((v) => {
      const variantItem: Record<string, unknown> = {
        name: v.name.trim(),
        price: typeof v.price === 'number' ? v.price : ((backendPayload.basePrice as number) ?? 0),
      };
      if (v.id) {
        variantItem.id = v.id;
      }
      if (v.sku && v.sku.trim().length > 0) {
        variantItem.sku = v.sku.trim();
      }
      if (typeof v.stockQuantity === 'number') {
        variantItem.stockQuantity = v.stockQuantity;
      } else if (typeof v.stock === 'number') {
        variantItem.stockQuantity = v.stock;
      }
      if (typeof v.minStockAlert === 'number') {
        variantItem.minStockAlert = v.minStockAlert;
      }
      return variantItem;
    });
  }

  try {
    const res = await apiClient.patch<BackendProductResponse>(`/admin/products/${id}`, backendPayload, { isAdmin: true });
    return mapBackendToAdminProduct(res);
  } catch (err: unknown) {
    if (
      err instanceof ApiClientError &&
      err.status === 400 &&
      Array.isArray(backendPayload.variants) &&
      backendPayload.variants.some((v) => typeof v === 'object' && v !== null && !('sku' in v))
    ) {
      const fallbackCat = (payload.categoryId || 'PRD').slice(0, 3).toUpperCase();
      backendPayload.variants = (backendPayload.variants as Array<Record<string, unknown>>).map((v) => {
        if (!('sku' in v) || !v.sku) {
          const rand = Math.floor(100000 + Math.random() * 900000);
          return { ...v, sku: `DFP-${fallbackCat}-${rand}` };
        }
        return v;
      });
      const retryRes = await apiClient.patch<BackendProductResponse>(`/admin/products/${id}`, backendPayload, { isAdmin: true });
      return mapBackendToAdminProduct(retryRes);
    }
    throw err;
  }
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
