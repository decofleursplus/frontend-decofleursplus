import { apiClient } from './client';

export type EventThemeColor = 'emerald' | 'ruby' | 'gold' | 'rose' | 'amber' | 'purple' | 'festive' | 'standard';

/** Événement saisonnier (Tabaski, Saint-Valentin…) géré dans Marketing › Événements. */
export interface SeasonalEvent {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string;
  datesLabel: string;
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  whatsappMessage: string;
  themeColor: EventThemeColor;
  bgImage: string;
  isActive: boolean;
  collectionTitle: string;
  collectionDesc: string;
  discountNote: string | null;
  /** Ids (ou slugs) des produits mis en avant, 4 au maximum */
  featuredProductIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type SeasonalEventInput = Omit<SeasonalEvent, 'id' | 'slug' | 'isActive' | 'createdAt' | 'updatedAt'>;

/** Événement affiché sur l'accueil (null : accueil standard). */
export async function getActiveEvent(): Promise<SeasonalEvent | null> {
  return apiClient.get<SeasonalEvent | null>('/events/active');
}

// ---------- Back-office ----------

/**
 * Jeton du back-office : sans cette option, le client HTTP envoie d'abord le jeton client de la boutique
 * (session ouverte dans le même navigateur), refusé si ce compte client n'existe plus.
 */
const admin = { useAdminToken: true } as const;

export async function listAdminEvents(): Promise<SeasonalEvent[]> {
  return apiClient.get<SeasonalEvent[]>('/admin/events', admin);
}

export async function createAdminEvent(data: SeasonalEventInput, activate = false): Promise<SeasonalEvent> {
  return apiClient.post<SeasonalEvent>('/admin/events', { ...data, activate }, admin);
}

export async function updateAdminEvent(id: string, data: Partial<SeasonalEventInput>): Promise<SeasonalEvent> {
  return apiClient.patch<SeasonalEvent>(`/admin/events/${id}`, data, admin);
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiClient.delete(`/admin/events/${id}`, admin);
}

export async function activateAdminEvent(id: string): Promise<SeasonalEvent> {
  return apiClient.post<SeasonalEvent>(`/admin/events/${id}/activate`, undefined, admin);
}

export async function duplicateAdminEvent(id: string): Promise<SeasonalEvent> {
  return apiClient.post<SeasonalEvent>(`/admin/events/${id}/duplicate`, undefined, admin);
}

export async function deactivateAdminEvents(): Promise<void> {
  await apiClient.post('/admin/events/deactivate', undefined, admin);
}

/** Champs modifiables d'un événement (pour l'envoi à l'API). */
export function toEventInput(e: SeasonalEventInput): SeasonalEventInput {
  return {
    name: e.name,
    categoryLabel: e.categoryLabel,
    datesLabel: e.datesLabel,
    headline: e.headline,
    headlineHighlight: e.headlineHighlight,
    subheadline: e.subheadline,
    badge: e.badge,
    ctaText: e.ctaText,
    ctaLink: e.ctaLink,
    whatsappMessage: e.whatsappMessage,
    themeColor: e.themeColor,
    bgImage: e.bgImage,
    collectionTitle: e.collectionTitle,
    collectionDesc: e.collectionDesc,
    discountNote: e.discountNote || null,
    featuredProductIds: e.featuredProductIds.slice(0, 4),
  };
}
