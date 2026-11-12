'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Phone, Truck, CheckCircle2, XCircle, Loader2, RefreshCw, Navigation, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  completeDriverDelivery,
  failDriverDelivery,
  getDriverDeliveries,
  getDriverProfile,
  startDriverDelivery,
  type DriverDelivery,
  type DriverProfile,
} from '@/lib/api/admin/driver';

const STATUS: Record<DriverDelivery['status'], { label: string; style: string }> = {
  TO_DELIVER: { label: 'À livrer', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  IN_PROGRESS: { label: 'En cours', style: 'bg-blue-50 text-blue-800 border-blue-200' },
  DELIVERED: { label: 'Livrée', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  FAILED: { label: 'Échec', style: 'bg-red-50 text-red-700 border-red-200' },
  CANCELLED: { label: 'Annulée', style: 'bg-gray-100 text-gray-600 border-gray-200' },
};
const fcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

/** Espace livreur : courses assignées, départ, remise au client ou échec (avec motif). */
export default function DriverDeliveriesPage() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [scope, setScope] = useState<'active' | 'history'>('active');
  const [deliveries, setDeliveries] = useState<DriverDelivery[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([getDriverProfile(), getDriverDeliveries(scope)])
        .then(([p, list]) => {
          setProfile(p);
          setDeliveries(list);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Courses indisponibles.')),
    [scope],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (d: DriverDelivery, action: () => Promise<unknown>, success: string) => {
    setBusyId(d.id);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const complete = (d: DriverDelivery) => {
    const name = window.prompt('Nom de la personne qui a réceptionné le colis :', d.order.recipientName ?? d.order.customerName);
    if (name === null) return;
    if (name.trim().length < 2) return toast.error('Indiquez le nom de la personne qui a réceptionné.');
    void run(d, () => completeDriverDelivery(d.id, { recipientName: name.trim() }), `Course ${d.deliveryNumber} livrée.`);
  };

  const fail = (d: DriverDelivery) => {
    const reason = window.prompt('Motif de l’échec (client absent, adresse introuvable…) :', '');
    if (reason === null) return;
    if (reason.trim().length < 3) return toast.error('Indiquez un motif (3 caractères minimum).');
    void run(d, () => failDriverDelivery(d.id, reason.trim()), `Échec enregistré pour ${d.deliveryNumber}.`);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Mes livraisons</h1>
          {profile && (
            <p className="text-xs text-gray-500 mt-1">
              {profile.name} · {profile.vehicle} {profile.vehiclePlate ?? ''} · {profile.activeDeliveriesCount} course(s) active(s)
            </p>
          )}
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#e7e4dd] bg-white text-xs font-semibold">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </button>
      </div>

      <div className="flex gap-2">
        {(['active', 'history'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border ${scope === s ? 'bg-[#24582d] text-white border-[#24582d]' : 'bg-white border-[#e7e4dd]'}`}
          >
            {s === 'active' ? 'À faire' : 'Historique'}
          </button>
        ))}
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}

      {deliveries === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement de vos courses…
        </div>
      ) : (deliveries ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">
          <Truck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          {scope === 'active' ? 'Aucune course assignée pour le moment.' : 'Aucune course terminée.'}
        </div>
      ) : (
        <div className="space-y-3">
          {(deliveries ?? []).map((d) => {
            const phone = d.order.recipientPhone || d.order.customerPhone;
            const address = [d.order.deliveryAddress, d.order.deliveryZone?.name].filter(Boolean).join(', ');
            const instructions = d.notes || [...(d.events ?? [])].reverse().find((e) => e.type === 'ASSIGNED' && e.note)?.note || null;
            return (
              <article key={d.id} className="bg-white rounded-2xl border border-[#e7e4dd] p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="font-mono text-sm">{d.deliveryNumber}</strong>
                    <span className="block text-gray-500">Commande {d.order.orderNumber}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border font-semibold ${STATUS[d.status].style}`}>{STATUS[d.status].label}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{d.order.recipientName || d.order.customerName}</p>
                  <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-[#24582d] font-semibold">
                    <Phone className="h-3.5 w-3.5" /> {phone}
                  </a>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {address || 'Adresse non renseignée'}
                  </p>
                  {(d.scheduledDate || d.timeSlot) && (
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="h-3.5 w-3.5" />
                      {[d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString('fr-FR') : null, d.timeSlot].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-gray-600">{d.order.itemsSummary}</p>
                  {d.order.paymentMethod === 'CASH_ON_DELIVERY' && d.order.paymentStatus !== 'PAID' && (
                    <p className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 font-semibold text-amber-900">
                      À encaisser : {fcfa(d.order.totalAmount)}
                    </p>
                  )}
                  {instructions && <p className="text-gray-600">Consignes : {instructions}</p>}
                  {d.order.notes && <p className="text-gray-600">Note du client : {d.order.notes}</p>}
                  {d.failureReason && <p className="text-red-700">Motif d’échec : {d.failureReason}</p>}
                </div>
                {scope === 'active' && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0ede6]">
                    {address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#e7e4dd] font-semibold"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Itinéraire
                      </a>
                    )}
                    {d.status === 'TO_DELIVER' && (
                      <button
                        type="button"
                        disabled={busyId === d.id}
                        onClick={() => void run(d, () => startDriverDelivery(d.id), `Course ${d.deliveryNumber} démarrée.`)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#3d5a99] text-white font-semibold disabled:opacity-50"
                      >
                        <Truck className="h-3.5 w-3.5" /> Démarrer la course
                      </button>
                    )}
                    {d.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => complete(d)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#166534] text-white font-semibold disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Livrée
                        </button>
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => fail(d)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 font-semibold disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Échec
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
