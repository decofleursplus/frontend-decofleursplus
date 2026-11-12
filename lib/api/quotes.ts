import { apiClient } from './client';

export interface SubmitQuotePayload {
  eventType: string;
  eventDate?: string;
  location: string;
  budget?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  estimatedGuests?: number;
  inspirationImages?: string[];
}

export type QuoteStatus = 'NEW' | 'UNDER_REVIEW' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CONVERTED_TO_ORDER';

/** Devis vu par le client (sans notes internes). */
export interface QuoteItem {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  eventType: string;
  eventDate: string | null;
  eventLocation: string;
  budgetRange: string | null;
  estimatedGuests: number | null;
  details: string | null;
  inspirationImages: string[];
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
