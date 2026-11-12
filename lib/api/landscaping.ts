import { apiClient } from './client';
import type { LandscapePrestation, LandscapeProject, LandscapeProjectCategory } from '@/lib/admin/mock-data/types';

export const LANDSCAPE_CATEGORIES: { value: LandscapeProjectCategory; label: string }[] = [
  { value: 'jardins', label: 'Jardins' },
  { value: 'villas', label: 'Villas' },
  { value: 'hotels', label: 'Hôtels & résidences' },
  { value: 'bureaux', label: 'Bureaux & commerces' },
  { value: 'terrasses', label: 'Terrasses & balcons' },
];

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

// ---------- Vitrine ----------

export async function getLandscapeServices(): Promise<LandscapePrestation[]> {
  return apiClient.get<LandscapePrestation[]>('/landscaping/services');
}

export interface LandscapeProjectsParams extends Record<string, string | number | boolean | undefined | null> {
  category?: LandscapeProjectCategory;
  featured?: boolean;
  limit?: number;
}

export async function getLandscapeProjects(params?: LandscapeProjectsParams | LandscapeProjectCategory): Promise<LandscapeProject[]> {
  const queryParams = typeof params === 'string' ? { category: params } : params;
  return apiClient.get<LandscapeProject[]>('/landscaping/projects', { params: queryParams });
}

export async function likeLandscapeProject(id: string, liked: boolean): Promise<number> {
  return (await apiClient.post<{ likesCount: number }>(`/landscaping/projects/${id}/like`, { liked })).likesCount;
}

// ---------- Back-office ----------

export interface LandscapeServicePayload {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  image?: string;
  benefits?: string[];
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface LandscapeProjectPayload {
  title: string;
  category: LandscapeProjectCategory;
  location?: string;
  description?: string;
  image: string;
  tags?: string[];
  featured?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export const getAdminLandscapeServices = () => apiClient.get<LandscapePrestation[]>('/admin/landscaping/services', admin);
export const createLandscapeService = (data: LandscapeServicePayload) => apiClient.post<LandscapePrestation>('/admin/landscaping/services', data, admin);
export const updateLandscapeService = (id: string, data: Partial<LandscapeServicePayload>) =>
  apiClient.patch<LandscapePrestation>(`/admin/landscaping/services/${id}`, data, admin);
export const deleteLandscapeService = async (id: string) => {
  await apiClient.delete(`/admin/landscaping/services/${id}`, admin);
};

export const getAdminLandscapeProjects = () => apiClient.get<LandscapeProject[]>('/admin/landscaping/projects', admin);
export const createLandscapeProject = (data: LandscapeProjectPayload) => apiClient.post<LandscapeProject>('/admin/landscaping/projects', data, admin);
export const updateLandscapeProject = (id: string, data: Partial<LandscapeProjectPayload>) =>
  apiClient.patch<LandscapeProject>(`/admin/landscaping/projects/${id}`, data, admin);
export const deleteLandscapeProject = async (id: string) => {
  await apiClient.delete(`/admin/landscaping/projects/${id}`, admin);
};
