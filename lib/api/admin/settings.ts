import { apiClient } from '../client';
import type { AnnouncementBar, QuoteFormSettings } from '../settings';

export type { QuoteFormSettings, QuoteProjectOptions, QuoteProjectType } from '../settings';

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
  /** Mentions légales imprimées sur les factures, devis et reçus */
  ninea: string;
  rccm: string;
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

/** Agrégateurs de paiement en ligne pris en charge par le serveur. */
export type PaymentGatewayCode = 'NABOOPAY' | 'PAYTECH';
/** live : paiements réels ; test : environnement de test de l'agrégateur ; simulation : aucune clé sur le serveur. */
export type PaymentGatewayMode = 'live' | 'test' | 'simulation';

export interface PaymentGatewayStatus {
  code: PaymentGatewayCode;
  label: string;
  /** Clés API présentes sur le serveur (Render) */
  configured: boolean;
  mode: PaymentGatewayMode;
  /** Agrégateur utilisé pour les nouveaux paiements */
  active: boolean;
}

/** Objet JSON libre côté serveur : un moyen jamais configuré est absent (considéré comme actif). */
export interface PaymentSettings {
  /** Agrégateur choisi ; absent = NabooPay s'il est configuré */
  gateway?: PaymentGatewayCode;
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
  /** Choix « Prestation souhaitée » et « Type de lieu » du formulaire de devis, par type de projet */
  quoteForm: QuoteFormSettings;
  /** Agrégateur réellement utilisé pour les nouveaux paiements. */
  paymentGateway: { provider: string; code: PaymentGatewayCode | null; configured: boolean; mode: PaymentGatewayMode };
  /** Agrégateurs disponibles et état de leurs clés sur le serveur. */
  paymentGateways: PaymentGatewayStatus[];
  updatedAt: string;
}

export interface UpdateShopSettingsPayload {
  boutique?: Partial<BoutiqueSettings>;
  notifications?: Partial<NotificationSettings>;
  payments?: PaymentSettings;
  seo?: Partial<SeoSettings>;
  /** Listes complètes d'un ou des deux types de projet (le type absent est conservé) */
  quoteForm?: Partial<QuoteFormSettings>;
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
  /** Mot de passe temporaire pas encore changé par le collaborateur */
  mustChangePassword?: boolean;
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

/** Collaborateur mis à jour ; `passwordEmailSent` présent si un mot de passe temporaire a été donné. */
export interface UpdatedStaffUser extends StaffUser {
  /** false si l'email du nouveau mot de passe temporaire n'a pas pu être envoyé. */
  passwordEmailSent?: boolean;
}

export async function updateAdminStaffUser(id: string, data: UpdateStaffUserPayload): Promise<UpdatedStaffUser> {
  return apiClient.put<UpdatedStaffUser>(`/admin/users/${id}`, data, { useAdminToken: true });
}

export async function deleteAdminStaffUser(id: string): Promise<void> {
  await apiClient.delete<{ id: string; deleted: boolean }>(`/admin/users/${id}`, { useAdminToken: true });
}

// ── Rôles & permissions ────────────────────────────────────────────────────

export interface RoleDefinition {
  key: string;
  role: StaffRole;
  label: string;
  description: string;
  badgeClass: string;
}

export type PermissionAction = 'read' | 'write' | 'delete';

/** read = voir, write = créer / modifier, delete = supprimer */
export interface ModulePermission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface PermissionModule {
  key: string;
  label: string;
  category: string;
  description: string;
  /** Actions qui ont un sens pour ce module */
  actions: PermissionAction[];
  /** Actions réservées à l'administrateur (non attribuables) */
  adminOnly?: PermissionAction[];
  /** Libellés propres au module (ex. « Désactiver ») */
  actionLabels?: Partial<Record<PermissionAction, string>>;
}

export interface RolesAndPermissions {
  roles: RoleDefinition[];
  modules: PermissionModule[];
  /** Droits en vigueur : clé de rôle (admin, gestionnaire…) → module → actions */
  permissions: Record<string, Record<string, ModulePermission>>;
  /** Droits par défaut, pour comparer et revenir en arrière */
  defaults: Record<string, Record<string, ModulePermission>>;
  /** La matrice a été modifiée par l'administrateur */
  customized: boolean;
}

/** Droits du compte connecté (rôle actuel, relu par l'API). */
export interface MyAdminAccess {
  role: StaffRole;
  roleKey: string;
  permissions: Record<string, ModulePermission>;
  /** Mot de passe temporaire : à changer avant d'utiliser le back-office */
  mustChangePassword?: boolean;
}

export async function getAdminRoles(): Promise<RolesAndPermissions> {
  return apiClient.get<RolesAndPermissions>('/admin/roles', { useAdminToken: true });
}

export async function getMyAdminAccess(): Promise<MyAdminAccess> {
  return apiClient.get<MyAdminAccess>('/admin/roles/me', { useAdminToken: true });
}

/** Modification partielle (administrateur) : clé de rôle → module → actions. */
export async function updateRolePermissions(
  permissions: Record<string, Record<string, Partial<ModulePermission>>>,
): Promise<RolesAndPermissions> {
  return apiClient.put<RolesAndPermissions>('/admin/roles/permissions', { permissions }, { useAdminToken: true });
}

/** Revient aux droits par défaut de tous les rôles (administrateur). */
export async function resetRolePermissions(): Promise<RolesAndPermissions> {
  return apiClient.post<RolesAndPermissions>('/admin/roles/permissions/reset', undefined, { useAdminToken: true });
}

/** Bandeau d'annonce du site (droit « voir » du module Annonces). */
export async function getAnnouncementBar(): Promise<AnnouncementBar> {
  return apiClient.get<AnnouncementBar>('/admin/settings/announcement-bar', { useAdminToken: true, cache: 'no-store' });
}

/** Modifie le bandeau d'annonce du site (droit « envoyer » du module Annonces). */
export async function updateAnnouncementBar(bar: AnnouncementBar): Promise<AnnouncementBar> {
  return apiClient.put<AnnouncementBar>('/admin/settings/announcement-bar', bar, { useAdminToken: true });
}
