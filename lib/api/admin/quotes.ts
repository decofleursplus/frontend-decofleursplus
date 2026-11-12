import { apiClient } from '../client';
import type { LandscapeQuote, QuoteStatus } from '@/lib/admin/mock-data/types';

export interface GetAdminQuotesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AdminQuotesResponse {
  quotes: LandscapeQuote[];
  total: number;
  page?: number;
  totalPages?: number;
}

// Map backend QuoteStatus to frontend QuoteStatus
export function mapBackendQuoteStatus(status: string): QuoteStatus {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'NEW':
    case 'SUBMITTED':
    case 'PENDING':
    case 'NOUVELLE':
      return 'nouvelle';
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'EN_COURS':
      return 'en_cours';
    case 'SENT':
    case 'QUOTED':
    case 'DEVIS_ENVOYE':
      return 'devis_envoye';
    case 'ACCEPTED':
    case 'ACCEPTEE':
      return 'acceptee';
    case 'REFUSED':
    case 'REJECTED':
    case 'REFUSEE':
      return 'refusee';
    case 'CONVERTED_TO_ORDER':
    case 'COMPLETED':
    case 'TERMINEE':
      return 'terminee';
    default:
      return 'nouvelle';
  }
}

// Map frontend QuoteStatus to backend status enum
export function mapFrontendToBackendQuoteStatus(status: QuoteStatus | string): string {
  switch (status) {
    case 'nouvelle':
      return 'NEW';
    case 'en_cours':
      return 'UNDER_REVIEW';
    case 'devis_envoye':
      return 'SENT';
    case 'acceptee':
      return 'ACCEPTED';
    case 'refusee':
      return 'REFUSED';
    case 'terminee':
      return 'CONVERTED_TO_ORDER';
    default:
      return status.toUpperCase();
  }
}

// Transform raw backend quote to LandscapeQuote (used by UI)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminQuote(raw: any): LandscapeQuote {
  const clientName =
    raw.customerName ||
    (raw.customer ? `${raw.customer.firstName || ''} ${raw.customer.lastName || ''}`.trim() : '') ||
    raw.contactName ||
    raw.clientName ||
    'Client Devis';

  const clientEmail = raw.customerEmail || raw.customer?.email || raw.contactEmail || raw.clientEmail || '';
  const clientPhone = raw.customerPhone || raw.customer?.phone || raw.contactPhone || raw.clientPhone || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quoteItems = Array.isArray(raw.items) ? raw.items.map((it: any) => ({
    description: it.description || it.name || 'Prestation florale',
    qty: it.qty || it.quantity || 1,
    unitPrice: Number(it.unitPrice || it.price || 0),
    total: Number(it.total || (it.qty || 1) * (it.unitPrice || 0)),
  })) : raw.quoteItems || [];

  return {
    id: raw.id, // Primary UUID for API calls
    quoteNumber: raw.quoteNumber || raw.id, // Display reference e.g. DEV-2026-0005
    createdAt: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) : 'Récemment',
    clientName,
    clientEmail,
    clientPhone,
    company: raw.company || raw.organization || '',
    prestationType: raw.eventType || raw.prestationType || 'Événement Floral',
    spaceType: raw.estimatedGuests ? `${raw.estimatedGuests} invités` : '',
    surfaceArea: '',
    desiredDate: raw.eventDate ? raw.eventDate.split('T')[0] : (raw.desiredDate || ''),
    location: raw.eventLocation || raw.location || 'Saly / Dakar',
    description: raw.details || raw.description || '',
    budget: raw.budgetRange || raw.budget || 'Non spécifié',
    maintenanceFrequency: raw.maintenanceFrequency || '',
    photos: Array.isArray(raw.inspirationImages) ? raw.inspirationImages : (Array.isArray(raw.photos) ? raw.photos : []),
    status: mapBackendQuoteStatus(raw.status),
    notes: raw.adminNotes || raw.notes || '',
    quoteAmount: raw.quotedAmount ? Number(raw.quotedAmount) : raw.quoteAmount,
    quoteItems,
  };
}

/**
 * Fetch quotes list from admin API
 */
export async function getAdminQuotes(params?: GetAdminQuotesParams): Promise<AdminQuotesResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') {
      q.set('status', mapFrontendToBackendQuoteStatus(params.status));
    }
    if (params?.search) q.set('search', params.search);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/quotes${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    if (res && typeof res === 'object') {
      const dataObj = res.data ?? res;
      if (Array.isArray(dataObj.items)) {
        return {
          quotes: dataObj.items.map(transformAdminQuote),
          total: dataObj.total ?? dataObj.items.length,
          page: dataObj.page ?? 1,
          totalPages: dataObj.totalPages ?? 1,
        };
      }
      if (Array.isArray(res.quotes)) {
        return {
          quotes: res.quotes.map(transformAdminQuote),
          total: res.total ?? res.quotes.length,
          page: res.page ?? 1,
          totalPages: res.totalPages ?? 1,
        };
      }
      if (Array.isArray(res)) {
        return {
          quotes: res.map(transformAdminQuote),
          total: res.length,
        };
      }
      if (Array.isArray(res.data)) {
        return {
          quotes: res.data.map(transformAdminQuote),
          total: res.total ?? res.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminQuotesAPI] Erreur de récupération des devis:', err);
  }

  return {
    quotes: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };
}

/**
 * Get quote details by ID
 */
export async function getAdminQuoteById(id: string): Promise<LandscapeQuote | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/quotes/${id}`, {
      useAdminToken: true,
      cache: 'no-store',
    });
    if (res) {
      return transformAdminQuote(res);
    }
  } catch (err) {
    console.warn(`[AdminQuotesAPI] Failed to fetch quote ${id}:`, err);
  }

  return null;
}

/**
 * Update quote details (notes, amounts, items)
 */
export async function updateAdminQuote(
  id: string,
  body: {
    adminNotes?: string;
    quotedAmount?: number;
    estimatedGuests?: number;
    eventDate?: string;
    eventLocation?: string;
    budgetRange?: string;
  }
): Promise<LandscapeQuote> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/quotes/${id}`, body, {
    useAdminToken: true,
  });
  return transformAdminQuote(res);
}

/**
 * Update quote status
 */
export async function updateAdminQuoteStatus(
  id: string,
  body: { status: QuoteStatus | string; quotedAmount?: number }
): Promise<LandscapeQuote> {
  const backendStatus = mapFrontendToBackendQuoteStatus(body.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(
    `/admin/quotes/${id}/status`,
    {
      status: backendStatus,
    },
    { useAdminToken: true }
  );

  if (body.quotedAmount !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await apiClient.patch<any>(
      `/admin/quotes/${id}`,
      { quotedAmount: body.quotedAmount },
      { useAdminToken: true }
    );
    return transformAdminQuote(updated?.data || updated || res?.data || res);
  }

  return transformAdminQuote(res?.data || res);
}

/** Transitions de statut autorisées par le backend (l'envoi de la proposition passe par `sendAdminQuoteProposal`). */
export const QUOTE_NEXT_STATUSES: Record<string, QuoteStatus[]> = {
  nouvelle: ['en_cours', 'refusee'],
  en_cours: ['refusee'],
  devis_envoye: ['acceptee', 'refusee', 'en_cours'],
  acceptee: [],
  refusee: [],
  terminee: [],
};

/** Enregistre les lignes chiffrées (le montant est recalculé côté serveur) et les notes internes. */
export async function saveAdminQuoteProposal(
  id: string,
  body: { items: { description: string; quantity: number; unitPrice: number }[]; adminNotes: string | null },
): Promise<LandscapeQuote> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return transformAdminQuote(await apiClient.patch<any>(`/admin/quotes/${id}`, body, { useAdminToken: true }));
}

/** Envoie la proposition au client (email + notification dans son espace). */
export async function sendAdminQuoteProposal(id: string, message?: string): Promise<LandscapeQuote & { emailSent?: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>(`/admin/quotes/${id}/send`, { message: message || undefined }, { useAdminToken: true });
  return { ...transformAdminQuote(res), emailSent: res?.emailSent };
}
