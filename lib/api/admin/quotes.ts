import { apiClient } from '../client';
import { initialQuotes } from '@/lib/admin/mock-data/quotes';
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
    case 'SUBMITTED':
    case 'PENDING':
    case 'NOUVELLE':
      return 'nouvelle';
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'EN_COURS':
      return 'en_cours';
    case 'QUOTED':
    case 'SENT':
    case 'DEVIS_ENVOYE':
      return 'devis_envoye';
    case 'ACCEPTED':
    case 'ACCEPTEE':
      return 'acceptee';
    case 'REJECTED':
    case 'REFUSEE':
      return 'refusee';
    case 'COMPLETED':
    case 'TERMINEE':
      return 'terminee';
    default:
      return (status as QuoteStatus) || 'nouvelle';
  }
}

// Map frontend QuoteStatus to backend status enum
export function mapFrontendToBackendQuoteStatus(status: QuoteStatus | string): string {
  switch (status) {
    case 'nouvelle':
      return 'SUBMITTED';
    case 'en_cours':
      return 'UNDER_REVIEW';
    case 'devis_envoye':
      return 'QUOTED';
    case 'acceptee':
      return 'ACCEPTED';
    case 'refusee':
      return 'REJECTED';
    case 'terminee':
      return 'COMPLETED';
    default:
      return status.toUpperCase();
  }
}

// Transform raw backend quote to LandscapeQuote (used by UI)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdminQuote(raw: any): LandscapeQuote {
  const clientName = raw.customer
    ? `${raw.customer.firstName || ''} ${raw.customer.lastName || ''}`.trim() || raw.contactName || 'Client Devis'
    : raw.contactName || raw.clientName || 'Client Devis';

  const clientEmail = raw.customer?.email || raw.contactEmail || raw.clientEmail || '';
  const clientPhone = raw.customer?.phone || raw.contactPhone || raw.clientPhone || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quoteItems = Array.isArray(raw.items) ? raw.items.map((it: any) => ({
    description: it.description || it.name || 'Prestation florale',
    qty: it.qty || it.quantity || 1,
    unitPrice: Number(it.unitPrice || it.price || 0),
    total: Number(it.total || (it.qty || 1) * (it.unitPrice || 0)),
  })) : raw.quoteItems || [];

  return {
    id: raw.quoteNumber || raw.id,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) : raw.createdAt || 'Récemment',
    clientName,
    clientEmail,
    clientPhone,
    company: raw.company || raw.organization || '',
    prestationType: raw.eventType || raw.prestationType || 'Événement Floral',
    spaceType: raw.spaceType || (raw.estimatedGuests ? `${raw.estimatedGuests} convives` : 'Espace de réception'),
    surfaceArea: raw.surfaceArea ? String(raw.surfaceArea) : (raw.estimatedGuests ? `${raw.estimatedGuests} pers.` : 'N/C'),
    desiredDate: raw.eventDate ? raw.eventDate.split('T')[0] : (raw.desiredDate || ''),
    location: raw.eventLocation || raw.location || 'Saly / Dakar',
    description: raw.description || '',
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
 * Fetch quotes list from admin API with mock fallback
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
    console.warn('[AdminQuotesAPI] Falling back to mock quotes:', err);
  }

  // Fallback to local mock data
  let filtered = [...initialQuotes];
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((q) => q.status === params.status);
  }
  if (params?.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.id.toLowerCase().includes(term) ||
        q.clientName.toLowerCase().includes(term) ||
        q.location.toLowerCase().includes(term)
    );
  }

  return {
    quotes: filtered,
    total: filtered.length,
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

  return initialQuotes.find((q) => q.id === id) || null;
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
      quotedAmount: body.quotedAmount,
    },
    { useAdminToken: true }
  );
  return transformAdminQuote(res);
}
