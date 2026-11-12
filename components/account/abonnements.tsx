'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Pause, Play, XCircle } from 'lucide-react';
import {
  cancelMySubscription,
  getMySubscription,
  getMySubscriptions,
  pauseMySubscription,
  resumeMySubscription,
  type CustomerSubscription,
  type SubscriptionDelivery,
} from '@/lib/api/subscriptions';
import { ErrorState, LoadingState, Notice, SectionHeader, errorText, fcfa, formatDate, useResource } from './shared';

const STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Actif', color: 'bg-emerald-100 text-emerald-800' },
  PAUSED: { label: 'En pause', color: 'bg-amber-100 text-amber-800' },
  CANCELLED: { label: 'Résilié', color: 'bg-neutral-100 text-neutral-600' },
  EXPIRED: { label: 'Terminé', color: 'bg-neutral-100 text-neutral-600' },
};
const DAY: Record<string, string> = { MARDI: 'mardi', VENDREDI: 'vendredi', SAMEDI: 'samedi' };
const DELIVERY_STATUS: Record<SubscriptionDelivery['status'], string> = {
  SCHEDULED: 'Prévue',
  PREPARING: 'En préparation',
  DELIVERED: 'Livrée',
  SKIPPED: 'Non livrée',
};

function SubscriptionCard({ sub, onChanged }: { sub: CustomerSubscription; onChanged: () => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<CustomerSubscription | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const status = STATUS[sub.status] ?? { label: sub.status, color: 'bg-neutral-100 text-neutral-700' };

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !detail) {
      try {
        setDetail(await getMySubscription(sub.subscriptionNumber));
      } catch (err) {
        setDetailError(errorText(err, 'Détail indisponible.'));
      }
    }
  }

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'success', text: success });
      setDetail(null);
      await onChanged();
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Action impossible.') });
    } finally {
      setBusy(false);
    }
  }

  const deliveries = (detail?.deliveries ?? []).slice().sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-neutral-900 text-base">Formule {sub.planName ?? sub.plan}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
            <span className="text-xs text-neutral-400">{sub.subscriptionNumber}</span>
          </div>
          <div className="text-sm text-neutral-700">
            {sub.frequency === 'HEBDOMADAIRE' ? 'Chaque semaine' : 'Toutes les deux semaines'}, le {DAY[sub.deliveryDay] ?? sub.deliveryDay}
            {' · '}
            {fcfa(sub.perDeliveryPrice)} par livraison
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {sub.address || sub.location} · Pour {sub.recipientName} ({sub.phone})
          </div>
          {sub.status === 'ACTIVE' && sub.nextDeliveryDate && (
            <div className="text-xs text-[#173f22] font-medium mt-1">Prochaine livraison : {formatDate(sub.nextDeliveryDate)}</div>
          )}
          {sub.status === 'CANCELLED' && (
            <div className="text-xs text-neutral-500 mt-1">
              Résilié le {formatDate(sub.cancelledAt)}
              {sub.cancellationReason ? ` — ${sub.cancellationReason}` : ''}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <div className="text-right">
            <span className="text-xs text-neutral-400 block">Montant mensuel</span>
            <strong className="text-base text-[#173f22]">{fcfa(sub.monthlyAmount)}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sub.status === 'ACTIVE' && (
              <button type="button" disabled={busy} onClick={() => run(() => pauseMySubscription(sub.subscriptionNumber), 'Abonnement mis en pause.')} className="button button-outline button-small">
                <Pause size={13} /> Pause
              </button>
            )}
            {sub.status === 'PAUSED' && (
              <button type="button" disabled={busy} onClick={() => run(() => resumeMySubscription(sub.subscriptionNumber), 'Abonnement réactivé.')} className="button button-outline button-small">
                <Play size={13} /> Reprendre
              </button>
            )}
            {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
              <button type="button" disabled={busy} onClick={() => setCancelling((v) => !v)} className="button button-outline button-small" style={{ color: '#dc2626' }}>
                <XCircle size={13} /> Résilier
              </button>
            )}
            <button type="button" onClick={toggle} className="button button-outline button-small" aria-expanded={open}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Livraisons
            </button>
          </div>
        </div>
      </div>

      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      {cancelling && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-3 space-y-2">
          <label className="block text-xs font-semibold text-neutral-700">
            Motif de la résiliation (facultatif)
            <textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs font-normal" />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              className="button button-primary button-small"
              onClick={() =>
                run(() => cancelMySubscription(sub.subscriptionNumber, reason.trim() || undefined), 'Abonnement résilié.').then(() => setCancelling(false))
              }
            >
              Confirmer la résiliation
            </button>
            <button type="button" className="button button-outline button-small" onClick={() => setCancelling(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="mt-4 border-t border-neutral-100 pt-3">
          {detailError ? (
            <p className="text-xs text-red-600">{detailError}</p>
          ) : !detail ? (
            <LoadingState label="Chargement des livraisons…" />
          ) : deliveries.length === 0 ? (
            <p className="text-xs text-neutral-500">Aucune livraison planifiée pour le moment.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {deliveries.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{formatDate(d.scheduledDate)}</span>
                  <span className="font-semibold">{DELIVERY_STATUS[d.status] ?? d.status}</span>
                  {d.notes && <span className="w-full text-neutral-500">{d.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function AbonnementsSection() {
  const { data: subs, error, loading, reload } = useResource(getMySubscriptions);
  return (
    <section className="account-panel">
      <SectionHeader title="Mes abonnements floraux" description="Vos bouquets livrés automatiquement : pause, reprise, résiliation et historique." />
      {loading ? (
        <LoadingState label="Chargement de vos abonnements…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (subs ?? []).length === 0 ? (
        <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl mt-4">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 mb-1">Aucun abonnement floral</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">Recevez un bouquet frais chaque semaine ou toutes les deux semaines.</p>
          <Link href="/abonnements" className="button button-primary">
            Découvrir nos formules
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 mt-4">
          {(subs ?? []).map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} onChanged={reload} />
          ))}
        </div>
      )}
    </section>
  );
}
