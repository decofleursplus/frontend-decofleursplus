import { apiClient } from '../client';
import { initialBoutiqueSettings, initialAdminUsers } from '@/lib/admin/mock-data/settings';
import type { BoutiqueSettings, AdminUser, AdminRoleKey, AdminUserStatus } from '@/lib/admin/mock-data/types';

// Map backend staff user to AdminUser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminUser(raw: any): AdminUser {
  let role: AdminRoleKey = 'gestionnaire';
  const r = (raw.role || '').toUpperCase();
  if (r === 'ADMIN') role = 'admin';
  else if (r === 'FLORIST' || r === 'FLEURISTE') role = 'fleuriste';
  else if (r === 'DELIVERY' || r === 'LIVREUR') role = 'livreur';
  else if (r === 'ACCOUNTANT' || r === 'COMPTABLE') role = 'comptable';

  let status: AdminUserStatus = 'actif';
  if (raw.status === 'INACTIVE' || raw.isActive === false) status = 'inactif';

  return {
    id: raw.id,
    name: raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Collaborateur',
    email: raw.email || '',
    phone: raw.phone || '',
    role,
    status,
    avatar: raw.avatar || '',
    createdAt: raw.createdAt ? raw.createdAt.split('T')[0] : '2024-01-01',
    lastLogin: raw.lastLoginAt ? new Date(raw.lastLoginAt).toLocaleDateString('fr-FR') : (raw.lastLogin || 'Récemment'),
  };
}

/**
 * Fetch boutique general settings
 */
export async function getAdminSettings(): Promise<BoutiqueSettings> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/settings', {
      useAdminToken: true,
      cache: 'no-store',
    });
    if (res && typeof res === 'object') {
      return {
        ...initialBoutiqueSettings,
        shopName: res.shopName || res.name || initialBoutiqueSettings.shopName,
        contactEmail: res.contactEmail || res.email || initialBoutiqueSettings.contactEmail,
        phoneDakar: res.phoneDakar || initialBoutiqueSettings.phoneDakar,
        phoneSaly: res.phoneSaly || initialBoutiqueSettings.phoneSaly,
        address: res.address || initialBoutiqueSettings.address,
        tagline: res.tagline || initialBoutiqueSettings.tagline,
        openingHours: res.openingHours || initialBoutiqueSettings.openingHours,
      };
    }
  } catch (err) {
    console.warn('[AdminSettingsAPI] Falling back to initial boutique settings:', err);
  }

  return initialBoutiqueSettings;
}

/**
 * Update boutique general settings
 */
export async function updateAdminSettings(settings: Partial<BoutiqueSettings>): Promise<boolean> {
  await apiClient.put('/admin/settings', settings, {
    useAdminToken: true,
  });
  return true;
}

/**
 * Fetch staff users list
 */
export async function getAdminStaffUsers(params?: { search?: string; role?: string; status?: string }): Promise<AdminUser[]> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.role && params.role !== 'all') q.set('role', params.role.toUpperCase());
    if (params?.status && params.status !== 'all') q.set('status', params.status.toUpperCase());

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/users${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (Array.isArray(res)) return res.map(transformAdminUser);
    if (res && Array.isArray(res.users)) return res.users.map(transformAdminUser);
    if (res && Array.isArray(res.data)) return res.data.map(transformAdminUser);
  } catch (err) {
    console.warn('[AdminSettingsAPI] Falling back to mock staff users:', err);
  }

  return initialAdminUsers;
}

/**
 * Create a new staff collaborator
 */
export async function createAdminStaffUser(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
}): Promise<AdminUser> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/users', data, {
    useAdminToken: true,
  });
  return transformAdminUser(res);
}

/**
 * Update a staff collaborator
 */
export async function updateAdminStaffUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.put<any>(`/admin/users/${id}`, data, {
    useAdminToken: true,
  });
  return transformAdminUser(res);
}
