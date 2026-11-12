'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import {
  checkRentalAvailability,
  createRentalReservation,
  type RentalAvailability,
  type RentalEquipment,
  type RentalReservation,
} from '@/lib/api/rentals';
import {
  addDaysToInputValue,
  dateInputFromToday,
  formatFcfa,
  formatRentalPeriod,
} from '@/lib/rental-utils';

interface RentalBookingFormProps {
  equipment: RentalEquipment;
  /** Période présélectionnée (AAAA-MM-JJ) */
  initialStartDate?: string;
  initialEndDate?: string;
  /** Appelé après l'enregistrement de la réservation par le serveur */
  onReserved?: (reservation: RentalReservation) => void;
  /** Affiche un bouton de fermeture sur l'écran de confirmation */
  onClose?: () => void;
}

type FieldErrors = Partial<Record<'startDate' | 'endDate' | 'quantity' | 'clientName' | 'clientPhone' | 'clientEmail' | 'eventLocation' | 'notes', string>>;

const inputClass =
  'w-full py-2 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white focus:border-[#173f22] outline-none text-xs';

/** Période invalide côté client : message à afficher, sinon null. */
function periodError(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return 'Choisissez les dates de mise à disposition et de restitution.';
  if (startDate < dateInputFromToday(0)) return 'La date de mise à disposition ne peut pas être dans le passé.';
  if (endDate <= startDate) return 'La restitution doit avoir lieu après la mise à disposition.';
  return null;
}

export function RentalBookingForm({
  equipment,
  initialStartDate,
  initialEndDate,
  onReserved,
  onClose,
}: RentalBookingFormProps) {
  const { user } = useAuth();
  const today = dateInputFromToday(0);

  const [startDate, setStartDate] = useState(initialStartDate || dateInputFromToday(1));
  const [endDate, setEndDate] = useState(initialEndDate || dateInputFromToday(2));
  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [recheck, setRecheck] = useState(0);
  // Dernier résultat du serveur, associé à la saisie qui l'a produit
  const [checked, setChecked] = useState<{ key: string; availability: RentalAvailability | null; error: string | null } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [reservation, setReservation] = useState<RentalReservation | null>(null);

  // Pré-remplissage avec le compte connecté (une fois par utilisateur, sans écraser une saisie)
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && user.id !== prefilledFor) {
    setPrefilledFor(user.id);
    setClientName((v) => v || user.name || '');
    setClientPhone((v) => v || user.phone || '');
    setClientEmail((v) => v || user.email || '');
  }

  const localPeriodError = periodError(startDate, endDate);
  const validInput = !localPeriodError && Number.isInteger(quantity) && quantity >= 1;
  const availabilityKey = JSON.stringify([equipment.id, quantity, startDate, endDate, recheck]);
  const current = validInput && checked?.key === availabilityKey ? checked : null;
  const availability = current?.availability ?? null;
  const availabilityError = current?.error ?? null;
  const checking = validInput && !reservation && !current;

  // Disponibilité et montant calculés par le serveur à chaque changement de période ou de quantité
  useEffect(() => {
    if (reservation || !validInput) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      checkRentalAvailability({ equipmentId: equipment.id, quantity, startDate, endDate })
        .then((result) => {
          if (!cancelled) setChecked({ key: availabilityKey, availability: result, error: null });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setChecked({
            key: availabilityKey,
            availability: null,
            error: err instanceof ApiClientError ? err.message : 'Impossible de vérifier la disponibilité.',
          });
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [equipment.id, quantity, startDate, endDate, validInput, reservation, availabilityKey]);

  const checkedItem = availability?.items[0];
  const stockOnPeriod = checkedItem?.availableStock;
  const canSubmit = !submitting && !checking && !localPeriodError && availability?.available === true;

  const handleStartChange = (value: string) => {
    setStartDate(value);
    // Garde une période cohérente : la restitution suit la mise à disposition
    if (value && endDate <= value) setEndDate(addDaysToInputValue(value, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const errors: FieldErrors = {};
    if (clientName.trim().length < 2) errors.clientName = 'Indiquez votre nom et prénom.';
    if (clientPhone.replace(/[\s\-.()]/g, '').length < 7) errors.clientPhone = 'Indiquez un numéro de téléphone valide.';
    if (clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      errors.clientEmail = 'Adresse email invalide.';
    }
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createRentalReservation({
        equipmentId: equipment.id,
        quantity,
        startDate,
        endDate,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        eventLocation: eventLocation.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setReservation(created);
      onReserved?.(created);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details?.length) {
          const serverErrors: FieldErrors = {};
          for (const detail of err.details) {
            serverErrors[detail.path as keyof FieldErrors] = detail.message;
          }
          setFieldErrors(serverErrors);
        }
        setSubmitError(err.message);
        // Stock pris entre-temps par une autre réservation : on réaffiche la disponibilité réelle
        if (err.status === 409) setRecheck((n) => n + 1);
      } else {
        setSubmitError('La réservation n’a pas pu être enregistrée. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (reservation) {
    return (
      <div className="p-6 text-center space-y-3" data-testid="rental-booking-success">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} />
        </div>
        <h4 className="text-lg font-serif font-bold text-[#173f22]">Demande enregistrée !</h4>
        <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
          Votre demande de réservation{' '}
          <strong className="text-gray-900" data-testid="rental-reservation-number">
            {reservation.reservationNumber}
          </strong>{' '}
          pour {reservation.quantity} × {reservation.equipmentName ?? equipment.name} est en attente de validation.
          Notre équipe vous contacte sous 24 h pour la confirmer et convenir du règlement.
        </p>
        {reservation.clientEmail && (
          <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
            Un email récapitulatif a été envoyé à <strong>{reservation.clientEmail}</strong>.
          </p>
        )}

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-left space-y-1 max-w-sm mx-auto">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">Période :</span>
            <span className="font-semibold text-gray-800 text-right">
              {reservation.days} jour{reservation.days > 1 ? 's' : ''} ({formatRentalPeriod(reservation.startDate, reservation.endDate)})
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">Location ({reservation.quantity} ×) :</span>
            <span className="font-bold text-[#c8436e]">{formatFcfa(reservation.totalRental)}</span>
          </div>
          <div className="flex justify-between gap-3 pt-1 border-t border-gray-200 text-[11px]">
            <span className="text-gray-500">Caution (restituée au retour) :</span>
            <span className="font-semibold text-gray-900">{formatFcfa(reservation.deposit)}</span>
          </div>
        </div>

        {onClose && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-xs transition-colors"
            >
              Fermer et continuer
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-5 space-y-3 text-xs" data-testid="rental-booking-form">
      {/* Période & quantité */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-start-date">
            Mise à disposition *
          </label>
          <input
            id="rental-start-date"
            type="date"
            required
            min={today}
            value={startDate}
            onChange={(e) => handleStartChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-end-date">
            Restitution *
          </label>
          <input
            id="rental-end-date"
            type="date"
            required
            min={startDate ? addDaysToInputValue(startDate, 1) : today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-quantity">
          Quantité souhaitée *
          {stockOnPeriod !== undefined && (
            <span className="font-normal text-gray-500"> ({stockOnPeriod} disponible{stockOnPeriod > 1 ? 's' : ''} sur ces dates)</span>
          )}
        </label>
        <input
          id="rental-quantity"
          type="number"
          min={1}
          max={equipment.totalStock}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          className={inputClass}
        />
      </div>

      {/* Disponibilité calculée par le serveur */}
      <div aria-live="polite" data-testid="rental-availability">
        {localPeriodError ? (
          <p className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle size={14} className="shrink-0 mt-0.5" /> {localPeriodError}
          </p>
        ) : checking ? (
          <p className="flex items-center gap-1.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600">
            <Loader2 size={14} className="animate-spin shrink-0" /> Vérification de la disponibilité…
          </p>
        ) : availabilityError ? (
          <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <span className="flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {availabilityError}
            </span>
            <button type="button" onClick={() => setRecheck((n) => n + 1)} className="font-semibold underline shrink-0">
              Réessayer
            </button>
          </div>
        ) : availability && !availability.available ? (
          <p className="flex items-start gap-1.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {checkedItem?.error
              ? checkedItem.error
              : stockOnPeriod && stockOnPeriod > 0
                ? `Seulement ${stockOnPeriod} unité${stockOnPeriod > 1 ? 's' : ''} disponible${stockOnPeriod > 1 ? 's' : ''} sur ces dates. Réduisez la quantité ou changez de période.`
                : 'Cet équipement n’est pas disponible sur ces dates. Essayez une autre période.'}
          </p>
        ) : availability ? (
          <p className="flex items-center gap-1.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            <CheckCircle2 size={14} className="shrink-0" /> Disponible sur ces dates.
          </p>
        ) : null}
      </div>

      {/* Coordonnées */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h5 className="font-bold text-gray-900 text-xs">Vos coordonnées</h5>
        <div>
          <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-client-name">
            Nom et prénom *
          </label>
          <input
            id="rental-client-name"
            type="text"
            required
            autoComplete="name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex : Moussa Ndiaye"
            className={inputClass}
          />
          {fieldErrors.clientName && <p className="mt-0.5 text-red-600">{fieldErrors.clientName}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-client-phone">
              Téléphone *
            </label>
            <input
              id="rental-client-phone"
              type="tel"
              required
              autoComplete="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+221 77 123 45 67"
              className={inputClass}
            />
            {fieldErrors.clientPhone && <p className="mt-0.5 text-red-600">{fieldErrors.clientPhone}</p>}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-client-email">
              Email <span className="font-normal text-gray-500">(pour recevoir la confirmation)</span>
            </label>
            <input
              id="rental-client-email"
              type="email"
              autoComplete="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className={inputClass}
            />
            {fieldErrors.clientEmail && <p className="mt-0.5 text-red-600">{fieldErrors.clientEmail}</p>}
          </div>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-event-location">
            Lieu de réception
          </label>
          <input
            id="rental-event-location"
            type="text"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Saly, Dakar…"
            className={inputClass}
          />
          {fieldErrors.eventLocation && <p className="mt-0.5 text-red-600">{fieldErrors.eventLocation}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="rental-notes">
            Précisions (optionnel)
          </label>
          <textarea
            id="rental-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Horaire de livraison souhaité, type d’événement…"
            className={`${inputClass} resize-none`}
          />
          {fieldErrors.notes && <p className="mt-0.5 text-red-600">{fieldErrors.notes}</p>}
        </div>
      </div>

      {/* Récapitulatif calculé par le serveur */}
      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-[11px]" data-testid="rental-summary">
        <div className="flex justify-between text-gray-600">
          <span>Durée de location :</span>
          <span className="font-semibold text-gray-900">
            {availability ? `${availability.days} jour${availability.days > 1 ? 's' : ''}` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Montant ({quantity} × {formatFcfa(equipment.pricePerDay)} / jour) :</span>
          <span className="font-extrabold text-[#c8436e]">
            {availability ? formatFcfa(availability.totalRental) : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-gray-200 text-[10px]">
          <span className="text-gray-500">Caution (séparée, restituée au retour) :</span>
          <span className="font-semibold text-gray-900">
            {availability ? formatFcfa(availability.deposit) : '—'}
          </span>
        </div>
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-1.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" /> {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {submitting ? 'Envoi de la demande…' : 'Envoyer ma demande de réservation'}
      </button>
      <p className="text-[10px] text-gray-500 text-center">
        Aucun paiement en ligne : la réservation est confirmée par notre équipe, qui convient avec vous du règlement.
      </p>
    </form>
  );
}
