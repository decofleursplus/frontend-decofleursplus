import { RentalEquipment, RentalReservation } from './types';

export type GanttBooking = {
  id: string;
  equipmentName: string;
  totalQuantity: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  status: 'confirmee' | 'en_cours' | 'en_attente' | 'non_disponible';
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  totalRental?: number;
  deposit?: number;
};

export const initialRentalEquipment: RentalEquipment[] = [];
export const initialRentalReservations: RentalReservation[] = [];
export const initialGanttBookings: GanttBooking[] = [];
