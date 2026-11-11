import { apiClient } from './client';

/** Paramètres de la boutique visibles par la vitrine (GET /settings/public, sans authentification). */
export interface PublicShopSettings {
  boutique: {
    shopName: string;
    tagline: string;
    contactEmail: string;
    phoneDakar: string;
    phoneSaly: string;
    address: string;
    logoUrl: string;
    openingHours: string;
  };
  social: { instagramUrl: string; facebookUrl: string; tiktokUrl: string };
  /** Moyens de paiement acceptés par la boutique */
  payments: { wave: boolean; orangeMoney: boolean; card: boolean; cash: boolean; cashMaxAmount: number | null };
  /** Tarifs des options cadeau, par ligne de commande (FCFA) */
  orderOptions: { giftWrapFee: number; cardMessageFee: number };
}

export async function getPublicSettings(): Promise<PublicShopSettings> {
  return apiClient.get<PublicShopSettings>('/settings/public');
}
