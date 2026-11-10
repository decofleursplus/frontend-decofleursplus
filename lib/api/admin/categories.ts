import { apiClient } from '../client';
import type { AdminCategory } from '@/lib/admin/mock-data/types';

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateSubcategoryPayload {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  subCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  }>;
  _count?: {
    products?: number;
  };
}

/**
 * Récupère la liste de toutes les catégories avec leurs statistiques
 * Endpoint: GET /api/v1/categories
 */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const data = await apiClient.get<BackendCategory[]>('/categories');
    if (Array.isArray(data)) {
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        productCount: c._count?.products ?? 0,
        status: 'actif',
        imageUrl: c.imageUrl || undefined,
      }));
    }
    return [];
  } catch (error) {
    console.warn('[Admin Categories] Erreur de récupération des catégories:', error);
    return [];
  }
}

/**
 * Créer une nouvelle catégorie
 * Endpoint: POST /api/v1/admin/categories
 */
export async function createAdminCategory(payload: CreateCategoryPayload): Promise<AdminCategory> {
  const slug =
    payload.slug ||
    payload.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    `cat-${Date.now()}`;

  const cleanImageUrl =
    typeof payload.imageUrl === 'string' && payload.imageUrl.trim().length > 0
      ? payload.imageUrl.trim()
      : null;

  const data = await apiClient.post<BackendCategory>(
    '/admin/categories',
    {
      name: payload.name.trim(),
      slug,
      description: payload.description?.trim() || null,
      imageUrl: cleanImageUrl,
    },
    { isAdmin: true }
  );

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    productCount: 0,
    status: 'actif',
    imageUrl: data.imageUrl || cleanImageUrl || undefined,
  };
}

/**
 * Mettre à jour une catégorie existante
 * Endpoint: PATCH /api/v1/admin/categories/{id}
 */
export async function updateAdminCategory(
  id: string,
  payload: Partial<CreateCategoryPayload>
): Promise<AdminCategory> {
  const updatePayload: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    updatePayload.name = payload.name.trim();
  }
  if (payload.slug !== undefined) {
    updatePayload.slug = payload.slug.trim();
  }
  if (payload.description !== undefined) {
    updatePayload.description = payload.description.trim() || null;
  }
  if (payload.imageUrl !== undefined) {
    updatePayload.imageUrl =
      typeof payload.imageUrl === 'string' && payload.imageUrl.trim().length > 0
        ? payload.imageUrl.trim()
        : null;
  }

  const data = await apiClient.patch<BackendCategory>(`/admin/categories/${id}`, updatePayload, {
    isAdmin: true,
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    productCount: data._count?.products ?? 0,
    status: 'actif',
    imageUrl: data.imageUrl || (updatePayload.imageUrl as string | undefined) || undefined,
  };
}

/**
 * Supprimer une catégorie
 * Endpoint: DELETE /api/v1/admin/categories/{id}
 */
export async function deleteAdminCategory(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/admin/categories/${id}`, { isAdmin: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Créer une nouvelle sous-catégorie
 * Endpoint: POST /api/v1/admin/subcategories
 */
export async function createAdminSubcategory(payload: CreateSubcategoryPayload): Promise<any> {
  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return apiClient.post('/admin/subcategories', { ...payload, slug }, { isAdmin: true });
}

/**
 * Supprimer une sous-catégorie
 * Endpoint: DELETE /api/v1/admin/subcategories/{id}
 */
export async function deleteAdminSubcategory(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/admin/subcategories/${id}`, { isAdmin: true });
    return true;
  } catch {
    return false;
  }
}
