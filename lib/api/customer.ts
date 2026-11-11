/**
 * Service API Espace Client & Carnet d'adresses
 */

import { apiClient } from './client';

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string | null;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  segment?: 'PARTICULIER' | 'ENTREPRISE' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  defaultAddress: CustomerAddress | null;
}

export interface LoyaltyOverview {
  points: number;
  tier: LoyaltyTier;
  nextTier: { tier: LoyaltyTier; minPoints: number; pointsToGo: number } | null;
  tiers: { tier: LoyaltyTier; minPoints: number }[];
  /** 1 point par tranche de `fcfaPerPoint` FCFA, crédité à la livraison */
  fcfaPerPoint: number;
  history: { id: string; points: number; balance: number; reason: string; createdAt: string }[];
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: { id: string; name: string; slug: string; image: string | null };
}

export interface CustomerAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  phone: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAddressPayload {
  name: string;
  street: string;
  city: string;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  name?: string;
  street?: string;
  city?: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Récupère le profil client complet avec points de fidélité et stats
 */
export async function getCustomerProfile(): Promise<CustomerProfile> {
  return apiClient.get<CustomerProfile>('/customers/me');
}

/**
 * Met à jour les informations du profil client
 */
export async function updateCustomerProfile(payload: UpdateProfilePayload): Promise<CustomerProfile> {
  return apiClient.patch<CustomerProfile>('/customers/me', payload);
}

/**
 * Modifie le mot de passe du client connecté
 */
export async function changeCustomerPassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiClient.patch<{ message: string }>('/customers/me/password', payload);
}

/**
 * Liste les adresses de livraison enregistrées
 */
export async function getCustomerAddresses(): Promise<CustomerAddress[]> {
  return apiClient.get<CustomerAddress[]>('/customers/me/addresses');
}

/**
 * Ajoute une nouvelle adresse de livraison
 */
export async function createCustomerAddress(payload: CreateAddressPayload): Promise<CustomerAddress> {
  return apiClient.post<CustomerAddress>('/customers/me/addresses', payload);
}

/**
 * Modifie une adresse existante
 */
export async function updateCustomerAddress(
  id: string,
  payload: UpdateAddressPayload,
): Promise<CustomerAddress> {
  return apiClient.patch<CustomerAddress>(`/customers/me/addresses/${id}`, payload);
}

/**
 * Supprime une adresse de livraison
 */
export async function deleteCustomerAddress(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/customers/me/addresses/${id}`);
}

/**
 * Définit une adresse comme adresse par défaut
 */
export async function setDefaultCustomerAddress(id: string): Promise<CustomerAddress> {
  return apiClient.post<CustomerAddress>(`/customers/me/addresses/${id}/default`);
}

export async function getMyLoyalty(): Promise<LoyaltyOverview> {
  return apiClient.get<LoyaltyOverview>('/customers/me/loyalty');
}

export async function getMyReviews(): Promise<MyReview[]> {
  return apiClient.get<MyReview[]>('/customers/me/reviews');
}
