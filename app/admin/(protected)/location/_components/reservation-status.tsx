import type { RentalDepositStatus, RentalReservationStatus } from '@/lib/api/admin/rentals';
import { DEPOSIT_STATUS_LABELS, RESERVATION_STATUS_LABELS } from '@/lib/rental-utils';

const STATUS_CLASSES: Record<RentalReservationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESERVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISPATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
  RETURNED: 'bg-teal-50 text-teal-700 border-teal-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

/** Couleur des barres du planning, par statut. */
export const GANTT_BAR_CLASSES: Record<RentalReservationStatus, string> = {
  PENDING: 'bg-amber-400 hover:bg-amber-500 text-slate-900',
  CONFIRMED: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  RESERVED: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  DISPATCHED: 'bg-blue-500 hover:bg-blue-600 text-white',
  RETURNED: 'bg-slate-400 hover:bg-slate-500 text-white',
  CANCELLED: 'bg-rose-500 hover:bg-rose-600 text-white',
};

const DEPOSIT_CLASSES: Record<RentalDepositStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
  COLLECTED: 'bg-blue-50 text-blue-700 border-blue-200',
  REFUNDED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RETAINED: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function ReservationStatusBadge({ status }: { status: RentalReservationStatus }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[status]}`}>
      {RESERVATION_STATUS_LABELS[status]}
    </span>
  );
}

export function DepositStatusBadge({ status }: { status: RentalDepositStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${DEPOSIT_CLASSES[status]}`}>
      Caution {DEPOSIT_STATUS_LABELS[status].toLowerCase()}
    </span>
  );
}
