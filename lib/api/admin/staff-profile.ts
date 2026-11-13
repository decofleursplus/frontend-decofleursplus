/**
 * « Mon profil » du membre de l'équipe connecté (GET/PATCH /admin/me, POST /admin/me/avatar).
 * Ouvert à tous les rôles du back-office ; les erreurs remontent à l'appelant.
 */
import { apiClient } from '../client';

export interface StaffProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
}

const admin = { useAdminToken: true } as const;

export function getMyStaffProfile() {
  return apiClient.get<StaffProfile>('/admin/me', admin);
}

/** Envoie la photo (une image, 5 Mo max) : elle est enregistrée immédiatement sur le profil. */
export function uploadMyStaffAvatar(file: File) {
  const formData = new FormData();
  formData.append('files', file);
  return apiClient.post<StaffProfile>('/admin/me/avatar', formData, admin);
}

export function updateMyStaffProfile(data: { firstName?: string; lastName?: string; avatar?: string | null }) {
  return apiClient.patch<StaffProfile>('/admin/me', data, admin);
}
