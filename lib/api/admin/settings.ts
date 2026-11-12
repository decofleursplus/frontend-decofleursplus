import { apiClient } from '../client';

/**
 * Paramètres du back-office : boutique, notifications, paiement, SEO, collaborateurs, rôles.
 * Les types reprennent exactement les réponses de l'API (GET/PUT /admin/settings, /admin/users, /admin/roles).
 * Aucune valeur de repli : les erreurs remontent à l'écran appelant.
 */

export interface BoutiqueSettings {
  shopName: string;
  tagline: string;
  contactEmail: string;
  phoneDakar: string;
  phoneSaly: string;
  address: string;
  logoUrl: string;
  currency: string;
  timezone: string;
  openingHours: string;
  orderPrefix: string;
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  onNewOrder: boolean;
  onDriverAssigned: boolean;
  onDelivered: boolean;
  onLowStock: boolean;
  adminAlertPhone: string;
  adminAlertEmail: string;
}

export type PaymentMethodKey = 'wave' | 'orangeMoney' | 'card' | 'cash';

/** Objet JSON libre côté serveur : un moyen jamais configuré est absent (considéré comme actif). */
export interface PaymentSettings {
  wave?: { enabled?: boolean };
  orangeMoney?: { enabled?: boolean };
  card?: { enabled?: boolean };
  cash?: { enabled?: boolean; maxAmount?: number | null };
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
}

export interface AdminShopSettings {
  boutique: BoutiqueSettings;
  notifications: NotificationSettings;
  payments: PaymentSettings;
  seo: SeoSettings;
  /** État réel de l'agrégateur de paiement en ligne côté serveur. */
  paymentGateway: { provider: string; configured: boolean };
  updatedAt: string;
}

export interface UpdateShopSettingsPayload {
  boutique?: Partial<BoutiqueSettings>;
  notifications?: Partial<NotificationSettings>;
  payments?: PaymentSettings;
  seo?: Partial<SeoSettings>;
}

export async function getAdminShopSettings(): Promise<AdminShopSettings> {
  return apiClient.get<AdminShopSettings>('/admin/settings', { useAdminToken: true });
}

/** Mise à jour partielle : seules les sections envoyées sont modifiées. Renvoie la configuration enregistrée. */
export async function updateAdminShopSettings(payload: UpdateShopSettingsPayload): Promise<AdminShopSettings> {
  return apiClient.put<AdminShopSettings>('/admin/settings', payload, { useAdminToken: true });
}

// ── Collaborateurs ─────────────────────────────────────────────────────────

export type StaffRole = 'ADMIN' | 'MANAGER' | 'FLORIST' | 'DELIVERY' | 'SALES' | 'ACCOUNTANT';
export type StaffStatus = 'actif' | 'inactif';

export interface StaffUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  /** Clé du rôle dans la matrice des droits (admin, gestionnaire, fleuriste, livreur, comptable, commercial). */
  roleKey: string;
  status: StaffStatus;
  avatar: string | null;
  /** Dernière connexion réussie ; null si le compte ne s'est jamais connecté. */
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedStaffUser extends StaffUser {
  /** false si l'email d'invitation n'a pas pu être envoyé. */
  invitationSent: boolean;
}

export interface CreateStaffUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  /** Mot de passe initial (8 caractères minimum), choisi par l'administrateur. */
  password: string;
  avatar?: string | null;
}

export interface UpdateStaffUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role?: StaffRole;
  status?: StaffStatus;
  password?: string;
  avatar?: string | null;
}

export async function getAdminStaffUsers(params?: {
  search?: string;
  role?: StaffRole;
  status?: StaffStatus;
}): Promise<StaffUser[]> {
  return apiClient.get<StaffUser[]>('/admin/users', { useAdminToken: true, params });
}

export async function createAdminStaffUser(data: CreateStaffUserPayload): Promise<CreatedStaffUser> {
  return apiClient.post<CreatedStaffUser>('/admin/users', data, { useAdminToken: true });
}

export async function updateAdminStaffUser(id: string, data: UpdateStaffUserPayload): Promise<StaffUser> {
  return apiClient.put<StaffUser>(`/admin/users/${id}`, data, { useAdminToken: true });
}

export async function deleteAdminStaffUser(id: string): Promise<void> {
  await apiClient.delete<{ id: string; deleted: boolean }>(`/admin/users/${id}`, { useAdminToken: true });
}

// ── Rôles & permissions (lecture seule) ────────────────────────────────────

export interface RoleDefinition {
  key: string;
  role: StaffRole;
  label: string;
  description: string;
  badgeClass: string;
}

export interface RoleModulePermission {
  read: boolean;
  write: boolean;
  delete: boolean;
  /** Accès à une partie seulement des fonctions du module. */
  limited: boolean;
}

export interface PermissionModule {
  key: string;
  label: string;
  category: string;
  /** Clé = RoleDefinition.key */
  permissions: Record<string, RoleModulePermission>;
}

export interface RolesAndPermissions {
  roles: RoleDefinition[];
  permissions: PermissionModule[];
}

export async function getAdminRoles(): Promise<RolesAndPermissions> {
  return apiClient.get<RolesAndPermissions>('/admin/roles', { useAdminToken: true });
}
