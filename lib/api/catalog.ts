/**
 * Service API Catalogue Public (Catégories et Produits)
 */

import { apiClient } from './client';
import { PaginatedResponse } from './types';
import { Product } from '../products';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  subCategories?: Array<{ id: string; name: string; slug: string }>;
}

export interface ApiProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  minStockAlert: number;
}

export interface ApiProductSize {
  id: string;
  name: string;
  label: string;
  priceDelta: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { id: string; name: string; slug: string } | string;
  subCategory?: { id: string; name: string; slug: string } | null;
  price: number;
  oldPrice?: number | null;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string | null;
  badgeType?: 'discount' | 'new' | null;
  inStock: boolean;
  status?: 'ACTIVE' | 'HIDDEN' | 'ON_QUOTE' | 'PROMO';
  isFeatured?: boolean;
  reference?: string;
  sizes?: ApiProductSize[];
  variants?: ApiProductVariant[];
  createdAt?: string;
}

export interface ProductFilterParams {
  category?: string;
  subCategory?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  page?: number;
  limit?: number;
}

/**
 * Convertit un produit API en format Product utilisé par les composants React du frontend
 */
export function mapApiProductToProduct(item: ApiProduct): Product {
  const categoryName =
    typeof item.category === 'object' && item.category !== null
      ? item.category.name
      : String(item.category || 'Général');

  const hasRealDiscount = typeof item.oldPrice === 'number' && item.oldPrice > item.price;

  let badge: string | undefined = undefined;
  let badgeType: 'discount' | 'new' | undefined = undefined;

  if (hasRealDiscount) {
    badge = item.badge || `-${Math.round(((item.oldPrice! - item.price) / item.oldPrice!) * 100)}%`;
    badgeType = 'discount';
  } else if (item.badgeType === 'new') {
    badge = item.badge || 'Nouveau';
    badgeType = 'new';
  } else if (
    item.badge &&
    !item.badge.startsWith('-') &&
    !item.badge.includes('%') &&
    !/promo|remise|solde|sale|discount/i.test(item.badge) &&
    item.badgeType !== 'discount'
  ) {
    badge = item.badge;
  }

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: categoryName,
    price: item.price,
    oldPrice: hasRealDiscount ? (item.oldPrice as number) : undefined,
    image: item.image || (item.images && item.images[0]) || '/images/hero.jpg',
    images: item.images && item.images.length > 0 ? item.images : [item.image || '/images/hero.jpg'],
    rating: item.rating ?? 4.8,
    reviews: item.reviews ?? 0,
    badge,
    badgeType,
    description: item.description || '',
    inStock: item.inStock ?? true,
    reference: item.reference,
    sizes: (item.sizes || []).map((s) => ({
      name: s.name,
      label: s.label || s.name,
      priceDelta: s.priceDelta || 0,
    })),
  };
}

/**
 * Récupère la liste de toutes les catégories publiques avec sous-catégories
 */
export async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await apiClient.get<ApiCategory[]>('/categories');
    return Array.isArray(res) ? res : [];
  } catch (error) {
    console.warn('[Catalog] Impossible de charger les catégories depuis l’API:', error);
    return [];
  }
}

/**
 * Récupère le détail d'une catégorie par son slug
 */
export async function getCategoryBySlug(slug: string): Promise<ApiCategory | null> {
  try {
    return await apiClient.get<ApiCategory>(`/categories/${slug}`);
  } catch {
    return null;
  }
}

/**
 * Récupère la liste filtrée et paginée des produits publics
 */
export async function getProducts(
  filters: ProductFilterParams = {},
): Promise<PaginatedResponse<Product>> {
  try {
    const apiData = await apiClient.get<PaginatedResponse<ApiProduct>>('/products', {
      params: {
        category: filters.category,
        subCategory: filters.subCategory,
        featured: filters.featured ? 'true' : undefined,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });

    if (apiData && Array.isArray(apiData.items)) {
      return {
        ...apiData,
        items: apiData.items.map(mapApiProductToProduct),
      };
    }

    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  } catch (error) {
    console.warn('[Catalog] Erreur lors de l’appel /products:', error);
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Récupère les produits vedettes pour la page d'accueil
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const res = await getProducts({ featured: true, limit });
    return res.items;
  } catch {
    return [];
  }
}

/**
 * Récupère le détail d'un produit par son slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const apiProduct = await apiClient.get<ApiProduct>(`/products/${slug}`);
    if (apiProduct) {
      return mapApiProductToProduct(apiProduct);
    }
  } catch {
    // API not found or error
  }

  return null;
}
