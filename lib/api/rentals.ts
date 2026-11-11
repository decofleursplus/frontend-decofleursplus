/**
 * API publique — location de matériel événementiel.
 * Les erreurs remontent telles quelles (ApiClientError) : à l'écran de les afficher.
 */
import { apiClient } from './client';

export type RentalItemStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'DISPATCHED'
  | 'RETURNED'
  | 'MAINTENANCE'
  | 'UNAVAILABLE';

export type RentalAvailabilityLabel = 'disponible' | 'stock_faible' | 'indisponible';

export interface RentalEquipment {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  /** Tarif journalier en FCFA */
  pricePerDay: number;
  /** Caution unitaire en FCFA */
  deposit: number;
  totalStock: number;
  /** Stock disponible sur la période demandée (ou stock total si aucune période) */
  availableStock: number;
  image: string | null;
  images: string[];
  description: string;
  dimensions: string | null;
  status: RentalAvailabilityLabel;
  itemStatus: RentalItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RentalCategory {
  key: string;
  label: string;
  count: number;
}

export type RentalReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESERVED'
  | 'DISPATCHED'
  | 'RETURNED'
  | 'CANCELLED';

export type RentalDepositStatus = 'PENDING' | 'COLLECTED' | 'REFUNDED' | 'RETAINED';

export interface RentalReservation {
  id: string;
  reservationNumber: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  eventLocation: string | null;
  equipmentId: string;
  equipmentName: string | null;
  equipmentSlug: string | null;
  equipmentImage: string | null;
  quantity: number;
  startDate: string;
  endDate: string;
  days: number;
  unitPricePerDay: number;
  totalRental: number;
  deposit: number;
  status: RentalReservationStatus;
  statusLabel: string;
  notes: string | null;
  adminNotes: string | null;
  cancelReason: string | null;
  depositStatus: RentalDepositStatus;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalAvailabilityItem {
  equipmentId: string;
  name: string;
  slug?: string;
  category?: string;
  image?: string | null;
  available: boolean;
  requestedQuantity: number;
  availableStock: number;
  pricePerDay: number;
  totalPrice: number;
  deposit: number;
  error?: string;
}

export interface RentalAvailability {
  available: boolean;
  days: number;
  totalRental: number;
  deposit: number;
  totalAmount: number;
  items: RentalAvailabilityItem[];
}

export interface RentalListParams {
  category?: string;
  search?: string;
  /** AAAA-MM-JJ : avec `to`, le stock disponible est calculé sur la période */
  from?: string;
  to?: string;
}

export interface CreateRentalReservationPayload {
  equipmentId: string;
  quantity: number;
  /** AAAA-MM-JJ */
  startDate: string;
  /** AAAA-MM-JJ */
  endDate: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventLocation?: string;
  notes?: string;
}

/** GET /rentals — catalogue des équipements proposés à la location. */
export function getRentals(params: RentalListParams = {}): Promise<RentalEquipment[]> {
  return apiClient.get<RentalEquipment[]>('/rentals', {
    params: {
      category: params.category && params.category !== 'all' ? params.category : undefined,
      search: params.search,
      from: params.from,
      to: params.to,
    },
  });
}

/** GET /rentals/categories — catégories avec le nombre d'équipements. */
export function getRentalCategories(): Promise<RentalCategory[]> {
  return apiClient.get<RentalCategory[]>('/rentals/categories');
}

/** GET /rentals/:slug — fiche d'un équipement (stock sur la période si `from`/`to`). */
export function getRentalBySlug(
  slug: string,
  period: { from?: string; to?: string } = {},
): Promise<RentalEquipment> {
  return apiClient.get<RentalEquipment>(`/rentals/${encodeURIComponent(slug)}`, {
    params: { from: period.from, to: period.to },
  });
}

/** POST /rentals/check-availability — disponibilité et montant pour une période. */
export function checkRentalAvailability(input: {
  equipmentId: string;
  quantity: number;
  startDate: string;
  endDate: string;
}): Promise<RentalAvailability> {
  return apiClient.post<RentalAvailability>('/rentals/check-availability', {
    items: [{ equipmentId: input.equipmentId, quantity: input.quantity }],
    startDate: input.startDate,
    endDate: input.endDate,
  });
}

/** POST /rentals/reservations — demande de réservation (statut « en attente »). */
export function createRentalReservation(
  payload: CreateRentalReservationPayload,
): Promise<RentalReservation> {
  return apiClient.post<RentalReservation>('/rentals/reservations', payload);
}
