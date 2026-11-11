/**
 * API back-office — location de matériel (équipements, réservations, planning Gantt).
 * Les erreurs remontent telles quelles (ApiClientError) : à l'écran de les afficher.
 */
import { apiClient } from '../client';
import type {
  RentalDepositStatus,
  RentalEquipment,
  RentalReservation,
  RentalReservationStatus,
} from '../rentals';

export type {
  RentalDepositStatus,
  RentalEquipment,
  RentalItemStatus,
  RentalReservation,
  RentalReservationStatus,
} from '../rentals';

/** Statuts qu'un gestionnaire peut attribuer à un équipement. */
export type RentalItemAdminStatus = 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';

/** Corps accepté par POST /admin/rentals (schéma strict côté serveur). */
export interface CreateRentalEquipmentPayload {
  name: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  totalQuantity: number;
  description: string;
  dimensions?: string;
  featuredImage?: string;
  images?: string[];
}

/** Corps accepté par PATCH /admin/rentals/:id (`null` retire la valeur). */
export interface UpdateRentalEquipmentPayload {
  name?: string;
  category?: string;
  pricePerDay?: number;
  depositAmount?: number;
  totalQuantity?: number;
  description?: string;
  dimensions?: string | null;
  featuredImage?: string | null;
  images?: string[];
  status?: RentalItemAdminStatus;
}

export interface AdminRentalListParams {
  category?: string;
  search?: string;
  status?: RentalItemAdminStatus;
}

export interface RentalEquipmentDeleted {
  id: string;
  /** true : supprimé définitivement */
  deleted: boolean;
  /** true : conservé pour l'historique des réservations, mais retiré du catalogue */
  deactivated: boolean;
}

export type RentalReservationCounts = Record<RentalReservationStatus, number>;

export interface AdminRentalReservationList {
  items: RentalReservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Compteurs sur l'ensemble des réservations (indépendants des filtres) */
  counts: RentalReservationCounts;
}

export interface AdminRentalReservationParams {
  status?: RentalReservationStatus;
  search?: string;
  equipmentId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface GanttBooking {
  /** Identifiant de la réservation */
  id: string;
  reservationNumber: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  month: number;
  year: number;
  /** Premier et dernier jours occupés dans le mois affiché (inclus) */
  startDay: number;
  endDay: number;
  startsBeforeMonth: boolean;
  endsAfterMonth: boolean;
  startDate: string;
  endDate: string;
  status: RentalReservationStatus;
  statusLabel: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  totalRental: number;
  deposit: number;
  depositStatus: RentalDepositStatus;
}

export interface GanttCalendar {
  /** 0 = janvier */
  month: number;
  year: number;
  daysInMonth: number;
  equipment: RentalEquipment[];
  bookings: GanttBooking[];
  /** Somme des stocks des équipements affichés */
  totalUnits: number;
  /** Unités réservées pour chaque jour du mois (index 0 = le 1er) */
  dailyReservedUnits: number[];
  /** Taux d'occupation du mois en % */
  occupancyRate: number;
}

const admin = { useAdminToken: true } as const;

// ── Équipements ───────────────────────────────────────────────

/** GET /admin/rentals — `availableStock` = stock disponible aujourd'hui. */
export function getAdminRentalEquipment(params: AdminRentalListParams = {}): Promise<RentalEquipment[]> {
  return apiClient.get<RentalEquipment[]>('/admin/rentals', {
    ...admin,
    params: {
      category: params.category && params.category !== 'all' ? params.category : undefined,
      search: params.search,
      status: params.status,
    },
  });
}

export function createAdminRentalEquipment(data: CreateRentalEquipmentPayload): Promise<RentalEquipment> {
  return apiClient.post<RentalEquipment>('/admin/rentals', data, admin);
}

export function updateAdminRentalEquipment(
  id: string,
  data: UpdateRentalEquipmentPayload,
): Promise<RentalEquipment> {
  return apiClient.patch<RentalEquipment>(`/admin/rentals/${id}`, data, admin);
}

export function deleteAdminRentalEquipment(id: string): Promise<RentalEquipmentDeleted> {
  return apiClient.delete<RentalEquipmentDeleted>(`/admin/rentals/${id}`, admin);
}

// ── Réservations ──────────────────────────────────────────────

export function getAdminRentalReservations(
  params: AdminRentalReservationParams = {},
): Promise<AdminRentalReservationList> {
  return apiClient.get<AdminRentalReservationList>('/admin/rental-reservations', {
    ...admin,
    params: { ...params },
  });
}

/** Accepte l'identifiant ou le numéro de réservation (RL-AAAA-NNNN). */
export function getAdminRentalReservation(idOrNumber: string): Promise<RentalReservation> {
  return apiClient.get<RentalReservation>(
    `/admin/rental-reservations/${encodeURIComponent(idOrNumber)}`,
    admin,
  );
}

/** PATCH /admin/rental-reservations/:id — notes internes et statut de caution. */
export function updateAdminRentalReservation(
  id: string,
  data: { adminNotes?: string | null; depositStatus?: RentalDepositStatus },
): Promise<RentalReservation> {
  return apiClient.patch<RentalReservation>(`/admin/rental-reservations/${id}`, data, admin);
}

/** PATCH /admin/rental-reservations/:id/status — `cancelReason` obligatoire pour CANCELLED. */
export function changeAdminRentalReservationStatus(
  id: string,
  data: { status: RentalReservationStatus; cancelReason?: string },
): Promise<RentalReservation> {
  return apiClient.patch<RentalReservation>(`/admin/rental-reservations/${id}/status`, data, admin);
}

// ── Planning ──────────────────────────────────────────────────

/** GET /admin/rental-reservations/gantt — `month` : 0 = janvier. */
export function getAdminRentalGantt(params: {
  month: number;
  year: number;
  category?: string;
}): Promise<GanttCalendar> {
  return apiClient.get<GanttCalendar>('/admin/rental-reservations/gantt', {
    ...admin,
    params: {
      month: params.month,
      year: params.year,
      category: params.category && params.category !== 'all' ? params.category : undefined,
    },
  });
}
