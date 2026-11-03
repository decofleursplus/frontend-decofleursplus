/**
 * Service API Catalogue Public (Catégories et Produits)
 */

import { apiClient } from './client';
import { PaginatedResponse } from './types';
import { Product, products as fallbackProducts } from '../products';

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

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: categoryName,
    price: item.price,
    oldPrice: item.oldPrice ?? undefined,
    image: item.image || (item.images && item.images[0]) || '/images/hero.jpg',
    images: item.images && item.images.length > 0 ? item.images : [item.image || '/images/hero.jpg'],
    rating: item.rating ?? 4.8,
    reviews: item.reviews ?? 0,
    badge: item.badge ?? undefined,
    badgeType: item.badgeType ?? undefined,
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
    return await apiClient.get<ApiCategory[]>('/categories');
  } catch (error) {
    console.warn('[Catalog] Impossible de charger les catégories depuis l’API:', error);
    return [
      { id: '1', name: 'Bouquets', slug: 'bouquets' },
      { id: '2', name: 'Plantes', slug: 'plantes' },
      { id: '3', name: 'Mariages', slug: 'mariages' },
      { id: '4', name: 'Deuil & Hommage', slug: 'deuil-hommage' },
      { id: '5', name: 'Paniers de fruits', slug: 'paniers-fruits' },
      { id: '6', name: 'Cadeaux & Box', slug: 'cadeaux' },
    ];
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

    // Si l'API retourne des produits réels, les mapper
    if (apiData && Array.isArray(apiData.items) && apiData.items.length > 0) {
      return {
        ...apiData,
        items: apiData.items.map(mapApiProductToProduct),
      };
    }

    // Si la base est encore vide (en attente du seed staging), fallback gracieux
    let filtered = [...fallbackProducts];
    if (filters.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  } catch (error) {
    console.warn('[Catalog] Erreur lors de l’appel /products, utilisation du fallback local:', error);
    return {
      items: fallbackProducts,
      total: fallbackProducts.length,
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
    if (res.items.length > 0) {
      return res.items;
    }
    return fallbackProducts.slice(0, limit);
  } catch {
    return fallbackProducts.slice(0, limit);
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
    // Fallback local
  }

  const fallback = fallbackProducts.find((p) => p.slug === slug);
  return fallback || null;
}
