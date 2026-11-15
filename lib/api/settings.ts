import { apiClient } from './client';

/** Types de projet du formulaire de demande de devis. */
export type QuoteProjectType = 'paysagisme' | 'evenements';

/** Choix proposés pour un type de projet (gérés dans Paramètres › Formulaire de devis). */
export interface QuoteProjectOptions {
  /** « Prestation souhaitée », dans l'ordre d'affichage (au moins un choix) */
  prestations: string[];
  /** « Type de lieu », dans l'ordre d'affichage (au moins un choix) */
  lieux: string[];
}

export type QuoteFormSettings = Record<QuoteProjectType, QuoteProjectOptions>;

/** Paramètres de la boutique visibles par la vitrine (GET /settings/public, sans authentification). */
export interface PublicShopSettings {
  boutique: {
    shopName: string;
    tagline: string;
    contactEmail: string;
    phoneDakar: string;
    phoneSaly: string;
    /** Numéro WhatsApp de la boutique (format libre, ex. « +221 77 941 78 60 ») */
    whatsappNumber: string;
    address: string;
    logoUrl: string;
    openingHours: string;
    /** Mentions légales des documents commerciaux (vides si non renseignées) */
    ninea?: string;
    rccm?: string;
  };
  social: { instagramUrl: string; facebookUrl: string; tiktokUrl: string };
  /** Moyens de paiement acceptés par la boutique */
  payments: { wave: boolean; orangeMoney: boolean; card: boolean; cash: boolean; cashMaxAmount: number | null };
  /** Tarifs des options cadeau, par ligne de commande (FCFA) */
  orderOptions: { giftWrapFee: number; cardMessageFee: number };
  /** Choix du formulaire de demande de devis, par type de projet */
  quoteForm: QuoteFormSettings;
}

export async function getPublicSettings(): Promise<PublicShopSettings> {
  return apiClient.get<PublicShopSettings>('/settings/public');
}
