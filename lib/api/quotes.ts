import { apiClient } from './client';

export interface SubmitQuotePayload {
  eventType: string;
  /** Choix « Prestation souhaitée » et « Type de lieu » du formulaire */
  prestationType?: string;
  spaceType?: string;
  /** Surface approximative (projets paysagers), ex. « 150 m² » */
  surfaceArea?: string;
  company?: string;
  eventDate?: string;
  location: string;
  budget?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  estimatedGuests?: number;
  inspirationImages?: string[];
  /** Création de la boutique demandée sur mesure (slug de sa fiche) et taille de référence choisie */
  productSlug?: string;
  referenceSize?: string;
}

export type QuoteStatus = 'NEW' | 'UNDER_REVIEW' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CONVERTED_TO_ORDER';

/** Devis vu par le client (sans notes internes). */
export interface QuoteItem {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  company: string | null;
  eventType: string;
  prestationType: string | null;
  spaceType: string | null;
  surfaceArea: string | null;
  eventDate: string | null;
  eventLocation: string;
  budgetRange: string | null;
  estimatedGuests: number | null;
  details: string | null;
  inspirationImages: string[];
  /** Création demandée sur mesure depuis sa fiche produit, et taille de référence choisie */
  productName?: string | null;
  referenceSize?: string | null;
  /** null tant que la proposition n'est pas envoyée */
  quotedAmount: number | null;
  /** Lignes de la proposition (vide tant qu'elle n'est pas envoyée) */
  items: { description: string; quantity: number; unitPrice: number }[];
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

interface UploadQuoteImagesResult {
  files: { key: string; url: string; contentType: string; size: number }[];
}

/**
 * Envoie les photos d'inspiration (champ multipart `files`) et renvoie leurs URL publiques.
 * Endpoint : POST /api/v1/quotes/uploads
 */
export async function uploadQuoteImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await apiClient.upload<UploadQuoteImagesResult>('/quotes/uploads', formData);
  return res.files.map((f) => f.url);
}

/**
 * Soumettre une demande de devis sur mesure (invité ou connecté) — POST /quotes.
 * Les champs vides sont omis (validateur strict) ; l'erreur de l'API remonte telle quelle.
 */
export async function submitQuote(payload: SubmitQuotePayload): Promise<QuoteItem> {
  const body: Record<string, unknown> = {
    eventType: payload.eventType.trim(),
    location: payload.location.trim(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
  };
  if (payload.eventDate?.trim()) body.eventDate = payload.eventDate.trim();
  if (payload.budget?.trim()) body.budget = payload.budget.trim();
  if (payload.email?.trim()) body.email = payload.email.trim();
  if (payload.notes?.trim()) body.notes = payload.notes.trim();
  for (const key of ['prestationType', 'spaceType', 'surfaceArea', 'company', 'productSlug', 'referenceSize'] as const) {
    const value = payload[key]?.trim();
    if (value) body[key] = value;
  }
  if (payload.estimatedGuests) body.estimatedGuests = Number(payload.estimatedGuests);
  if (payload.inspirationImages?.length) body.inspirationImages = payload.inspirationImages;
  return apiClient.post<QuoteItem>('/quotes', body);
}

/**
 * Récupérer les devis du client connecté
 * Endpoint: GET /api/v1/quotes/mine
 */
export async function getMyQuotes(): Promise<QuoteItem[]> {
  return apiClient.get<QuoteItem[]>('/quotes/mine');
}

/** Accepter ou refuser une proposition reçue (statut SENT). */
export async function respondToQuote(id: string, decision: 'ACCEPTED' | 'REFUSED', comment?: string): Promise<QuoteItem> {
  return apiClient.post<QuoteItem>(`/quotes/mine/${id}/respond`, {
    decision,
    ...(comment?.trim() ? { comment: comment.trim() } : {}),
  });
}

/** Devis consulté depuis le lien personnel reçu par email (client inscrit ou non). */
export type SharedQuote = QuoteItem & { customerName: string };

export async function getSharedQuote(token: string): Promise<SharedQuote> {
  return apiClient.get<SharedQuote>(`/quotes/shared/${encodeURIComponent(token)}`, { cache: 'no-store' });
}

/** Accepter ou refuser depuis le lien personnel (sans compte). */
export async function respondToSharedQuote(token: string, decision: 'ACCEPTED' | 'REFUSED', comment?: string): Promise<SharedQuote> {
  return apiClient.post<SharedQuote>(`/quotes/shared/${encodeURIComponent(token)}/respond`, {
    decision,
    ...(comment?.trim() ? { comment: comment.trim() } : {}),
  });
}
