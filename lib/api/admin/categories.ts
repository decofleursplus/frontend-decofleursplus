import { apiClient } from '../client';
import type { AdminCategory } from '@/lib/admin/mock-data/types';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface CreateSubcategoryPayload {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
}

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  productCount?: number;
  totalProductCount?: number;
  subCategories?: { id: string; name: string; slug: string; description?: string | null }[];
}

const toAdminCategory = (c: BackendCategory): AdminCategory => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description || '',
  productCount: c.productCount ?? 0,
  totalProductCount: c.totalProductCount ?? c.productCount ?? 0,
  status: c.isActive === false ? 'inactif' : 'actif',
  imageUrl: c.imageUrl || undefined,
  subCategories: c.subCategories ?? [],
});

/** Toutes les catégories du back-office (inactives comprises) avec leurs sous-catégories et compteurs. */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  return (await apiClient.get<BackendCategory[]>('/admin/categories', admin)).map(toAdminCategory);
}

export async function createAdminCategory(payload: CreateCategoryPayload): Promise<AdminCategory> {
  return toAdminCategory(
    await apiClient.post<BackendCategory>(
      '/admin/categories',
      { ...payload, description: payload.description?.trim() || null, imageUrl: payload.imageUrl || null },
      admin,
    ),
  );
}

export async function updateAdminCategory(id: string, payload: Partial<CreateCategoryPayload>): Promise<AdminCategory> {
  const body: Record<string, unknown> = { ...payload };
  if (payload.description !== undefined) body.description = payload.description.trim() || null;
  if (payload.imageUrl !== undefined) body.imageUrl = payload.imageUrl || null;
  return toAdminCategory(await apiClient.patch<BackendCategory>(`/admin/categories/${id}`, body, admin));
}

/** Refusée (409) si la catégorie contient encore des produits, même masqués. */
export async function deleteAdminCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`, admin);
}

export async function createAdminSubcategory(payload: CreateSubcategoryPayload) {
  return apiClient.post<{ id: string; name: string; slug: string }>('/admin/subcategories', payload, admin);
}

export async function updateAdminSubcategory(id: string, payload: { name?: string; description?: string | null }) {
  return apiClient.patch<{ id: string; name: string; slug: string }>(`/admin/subcategories/${id}`, payload, admin);
}

export async function deleteAdminSubcategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/subcategories/${id}`, admin);
}
