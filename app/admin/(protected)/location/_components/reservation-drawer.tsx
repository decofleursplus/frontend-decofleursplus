'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { ApiClientError } from '@/lib/api/client';
import {
  changeAdminRentalReservationStatus,
  getAdminRentalReservation,
  updateAdminRentalReservation,
  type RentalDepositStatus,
  type RentalReservation,
  type RentalReservationStatus,
} from '@/lib/api/admin/rentals';
import { DEPOSIT_STATUS_LABELS, formatFcfa, formatRentalDate } from '@/lib/rental-utils';
import { DepositStatusBadge, ReservationStatusBadge } from './reservation-status';

interface ReservationDrawerProps {
  /** Identifiant (ou numéro) de la réservation à afficher ; null = fermé */
  reservationId: string | null;
  onClose: () => void;
  /** Appelé après chaque modification enregistrée par le serveur */
  onChanged: (reservation: RentalReservation) => void;
}

interface StatusAction {
  to: RentalReservationStatus;
  label: string;
  className: string;
}

/** Actions de statut autorisées par le backend (machine d'états des réservations). */
function statusActions(status: RentalReservationStatus): StatusAction[] {
  const primary = 'bg-[#193e23] hover:bg-[#13301b] text-white';
  switch (status) {
    case 'PENDING':
      return [{ to: 'CONFIRMED', label: 'Confirmer la réservation', className: primary }];
    case 'CONFIRMED':
    case 'RESERVED':
      return [{ to: 'DISPATCHED', label: 'Matériel remis au client (en cours)', className: primary }];
    case 'DISPATCHED':
      return [{ to: 'RETURNED', label: 'Valider le retour du matériel', className: primary }];
    default:
      return [];
  }
}

const canCancel = (status: RentalReservationStatus) =>
  status === 'PENDING' || status === 'CONFIRMED' || status === 'RESERVED';

/** Actions de caution autorisées par le backend. */
function depositActions(
  reservation: RentalReservation,
): { to: RentalDepositStatus; label: string; className: string }[] {
  const outline = 'border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800';
  switch (reservation.depositStatus) {
    case 'PENDING':
      return reservation.status === 'CANCELLED'
        ? []
        : [{ to: 'COLLECTED', label: 'Caution encaissée', className: outline }];
    case 'COLLECTED':
      return [
        { to: 'REFUNDED', label: 'Restituer la caution', className: outline },
        { to: 'RETAINED', label: 'Retenir la caution', className: 'border border-orange-300 bg-white hover:bg-orange-50 text-orange-800' },
        { to: 'PENDING', label: 'Annuler l’encaissement', className: 'border border-border bg-white hover:bg-muted text-muted-foreground' },
      ];
    case 'REFUNDED':
    case 'RETAINED':
      return [{ to: 'COLLECTED', label: 'Corriger : revenir à « encaissée »', className: 'border border-border bg-white hover:bg-muted text-muted-foreground' }];
    default:
      return [];
  }
}

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiClientError ? err.message : fallback);

export function ReservationDrawer({ reservationId, onClose, onChanged }: ReservationDrawerProps) {
  const [reservation, setReservation] = useState<RentalReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [adminNotes, setAdminNotes] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!reservationId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setCancelMode(false);
    setCancelReason('');
    getAdminRentalReservation(reservationId)
      .then((res) => {
        if (cancelled) return;
        setReservation(res);
        setAdminNotes(res.adminNotes ?? '');
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Impossible de charger la réservation.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reservationId, reloadKey]);

  const applyUpdate = (updated: RentalReservation, message: string) => {
    setReservation(updated);
    setAdminNotes(updated.adminNotes ?? '');
    onChanged(updated);
    toast.success(message);
  };

  const handleStatus = async (to: RentalReservationStatus, label: string) => {
    if (!reservation) return;
    setBusy(`status-${to}`);
    try {
      const updated = await changeAdminRentalReservationStatus(reservation.id, {
        status: to,
        ...(to === 'CANCELLED' ? { cancelReason: cancelReason.trim() } : {}),
      });
      setCancelMode(false);
      setCancelReason('');
      applyUpdate(updated, `${updated.reservationNumber} : ${label.toLowerCase()}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Le changement de statut a échoué.'));
    } finally {
      setBusy(null);
    }
  };

  const handleDeposit = async (to: RentalDepositStatus) => {
    if (!reservation) return;
    setBusy(`deposit-${to}`);
    try {
      const updated = await updateAdminRentalReservation(reservation.id, { depositStatus: to });
      applyUpdate(updated, `Caution de ${updated.reservationNumber} : ${DEPOSIT_STATUS_LABELS[to].toLowerCase()}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'La mise à jour de la caution a échoué.'));
    } finally {
      setBusy(null);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    setBusy('notes');
    try {
      const updated = await updateAdminRentalReservation(reservation.id, { adminNotes: adminNotes.trim() || null });
      applyUpdate(updated, 'Note interne enregistrée.');
    } catch (err) {
      toast.error(errorMessage(err, 'La note n’a pas pu être enregistrée.'));
    } finally {
      setBusy(null);
    }
  };

  const notesChanged = reservation ? adminNotes.trim() !== (reservation.adminNotes ?? '') : false;

  return (
    <AdminDrawer
      isOpen={reservationId !== null}
      onClose={onClose}
      size="lg"
      title={reservation ? `Réservation ${reservation.reservationNumber}` : 'Réservation'}
      subtitle="Dossier de location événementielle et caution."
      icon={<CalendarClock size={20} />}
      headerExtra={reservation ? <ReservationStatusBadge status={reservation.status} /> : undefined}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          Fermer
        </button>
      }
    >
      {loading && !reservation ? (
        <div className="flex items-center justify-center gap-2 py-16 text-xs text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Chargement de la réservation…
        </div>
      ) : loadError ? (
        <div className="p-6 rounded-2xl border border-red-200 bg-red-50 text-center space-y-3 text-xs text-red-700">
          <AlertCircle className="mx-auto" size={22} />
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="px-4 py-2 rounded-xl bg-[#193e23] text-white font-semibold"
          >
            Réessayer
          </button>
        </div>
      ) : reservation ? (
        <div className="space-y-5 text-xs" data-testid="reservation-drawer">
          {/* Client */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
            <span className="font-bold text-[#173f22] uppercase tracking-wider text-[11px] block">Coordonnées client</span>
            <Row label="Nom" value={reservation.clientName} />
            <Row label="Téléphone" value={<a href={`tel:${reservation.clientPhone}`} className="font-mono hover:underline">{reservation.clientPhone}</a>} />
            <Row
              label="Email"
              value={
                reservation.clientEmail ? (
                  <a href={`mailto:${reservation.clientEmail}`} className="hover:underline">{reservation.clientEmail}</a>
                ) : (
                  <span className="text-muted-foreground">Non renseigné</span>
                )
              }
            />
            <Row label="Lieu de réception" value={reservation.eventLocation ?? <span className="text-muted-foreground">Non précisé</span>} />
            {reservation.notes && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block mb-0.5">Message du client :</span>
                <p className="text-foreground whitespace-pre-line">{reservation.notes}</p>
              </div>
            )}
          </div>

          {/* Matériel & dates */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
            <span className="font-bold text-[#173f22] uppercase tracking-wider text-[11px] block">Matériel loué &amp; dates</span>
            <Row label="Équipement" value={reservation.equipmentName ?? '—'} />
            <Row label="Quantité" value={`${reservation.quantity} unité${reservation.quantity > 1 ? 's' : ''}`} />
            <Row label="Mise à disposition" value={formatRentalDate(reservation.startDate, 'long')} />
            <Row label="Restitution prévue" value={formatRentalDate(reservation.endDate, 'long')} />
            <Row label="Durée" value={`${reservation.days} jour${reservation.days > 1 ? 's' : ''}`} />
            {reservation.returnedAt && (
              <Row label="Matériel restitué le" value={new Date(reservation.returnedAt).toLocaleString('fr-FR')} />
            )}
            <Row label="Demande reçue le" value={new Date(reservation.createdAt).toLocaleString('fr-FR')} />
          </div>

          {/* Montants & caution */}
          <div className="p-4 rounded-2xl bg-[#edf8ef]/60 border border-emerald-200/80 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Montant de la location ({reservation.quantity} × {formatFcfa(reservation.unitPricePerDay)} × {reservation.days} j) :
              </span>
              <span className="text-base font-extrabold text-[#c8436e]">{formatFcfa(reservation.totalRental)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60">
              <span className="text-muted-foreground">Caution de garantie :</span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-[#173f22]">{formatFcfa(reservation.deposit)}</span>
                <DepositStatusBadge status={reservation.depositStatus} />
              </span>
            </div>
            {reservation.deposit > 0 && depositActions(reservation).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {depositActions(reservation).map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    disabled={busy !== null}
                    onClick={() => handleDeposit(action.to)}
                    className={`flex-1 min-w-[140px] py-1.5 px-3 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1 ${action.className}`}
                  >
                    {busy === `deposit-${action.to}` && <Loader2 size={12} className="animate-spin" />}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="p-4 rounded-2xl border border-border space-y-3">
            <span className="font-bold text-[#173f22] uppercase tracking-wider text-[11px] block">Suivi de la réservation</span>
            {reservation.status === 'CANCELLED' ? (
              <p className="text-red-700">
                Réservation annulée{reservation.cancelReason ? ` — motif : ${reservation.cancelReason}` : '.'}
              </p>
            ) : reservation.status === 'RETURNED' ? (
              <p className="text-teal-700">Location terminée : le matériel a été restitué.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {statusActions(reservation.status).map((action) => (
                    <button
                      key={action.to}
                      type="button"
                      disabled={busy !== null}
                      onClick={() => handleStatus(action.to, action.label)}
                      className={`flex-1 min-w-[180px] py-2 px-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 ${action.className}`}
                    >
                      {busy === `status-${action.to}` && <Loader2 size={13} className="animate-spin" />}
                      {action.label}
                    </button>
                  ))}
                  {canCancel(reservation.status) && !cancelMode && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => setCancelMode(true)}
                      className="py-2 px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs cursor-pointer disabled:opacity-50"
                    >
                      Annuler la réservation
                    </button>
                  )}
                </div>
                {cancelMode && (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50/60 space-y-2">
                    <label htmlFor="cancel-reason" className="block font-semibold text-red-800">
                      Motif d’annulation (envoyé au client par email) *
                    </label>
                    <textarea
                      id="cancel-reason"
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Ex : matériel indisponible à cette date, demande du client…"
                      className="w-full p-2.5 rounded-xl border border-red-200 bg-white outline-none text-xs resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCancelMode(false);
                          setCancelReason('');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold cursor-pointer"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null || cancelReason.trim().length < 3}
                        onClick={() => handleStatus('CANCELLED', 'Réservation annulée')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {busy === 'status-CANCELLED' && <Loader2 size={12} className="animate-spin" />}
                        Confirmer l’annulation
                      </button>
                    </div>
                  </div>
                )}
                {reservation.clientEmail && (reservation.status === 'PENDING' || canCancel(reservation.status)) && (
                  <p className="text-[11px] text-muted-foreground">
                    Le client est prévenu par email lors de la confirmation ou de l’annulation.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Notes internes */}
          <form onSubmit={handleSaveNotes} className="space-y-2">
            <label htmlFor="admin-notes" className="block font-semibold text-muted-foreground">
              Notes internes (non visibles par le client)
            </label>
            <textarea
              id="admin-notes"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Livraison, état du matériel au retour…"
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!notesChanged || busy !== null}
                className="px-4 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {busy === 'notes' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Enregistrer la note
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminDrawer>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label} :</span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
