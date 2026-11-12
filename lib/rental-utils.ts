/**
 * Aides d'affichage du module Location (vitrine et back-office).
 * Les dates de location sont des jours calendaires, stockés à minuit UTC côté serveur.
 */
import type { RentalDepositStatus, RentalReservationStatus } from '@/lib/api/rentals';

/** Jour local au format AAAA-MM-JJ (valeur d'un `<input type="date">`). */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Ajoute `days` jours à une date AAAA-MM-JJ. */
export function addDaysToInputValue(value: string, days: number): string {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Aujourd'hui + `offset` jours, au format AAAA-MM-JJ. */
export function dateInputFromToday(offset = 0): string {
  return addDaysToInputValue(toDateInputValue(new Date()), offset);
}

/** « 12 nov. 2026 » — accepte une date ISO du serveur ou une valeur AAAA-MM-JJ. */
export function formatRentalDate(value: string, month: 'short' | 'long' = 'short'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' });
}

export function formatRentalPeriod(start: string, end: string): string {
  return `du ${formatRentalDate(start)} au ${formatRentalDate(end)}`;
}

export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

export const RESERVATION_STATUS_LABELS: Record<RentalReservationStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  RESERVED: 'Confirmée',
  DISPATCHED: 'En cours',
  RETURNED: 'Terminée',
  CANCELLED: 'Annulée',
};

export const DEPOSIT_STATUS_LABELS: Record<RentalDepositStatus, string> = {
  PENDING: 'Non encaissée',
  COLLECTED: 'Encaissée',
  REFUNDED: 'Restituée',
  RETAINED: 'Retenue',
};
