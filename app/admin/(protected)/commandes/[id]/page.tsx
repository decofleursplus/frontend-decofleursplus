'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Printer, Truck, MapPin, CreditCard, User, Loader2, History, StickyNote, Save, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  DELIVERY_MODE_LABELS,
  ORDER_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  TIME_SLOTS,
  changeAdminOrderStatus,
  getAdminOrderById,
  updateAdminOrder,
  type AdminOrderDetail,
  type BackendOrderStatus,
} from '@/lib/api/admin/orders';

const fcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} F CFA`;
const dateTime = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Détail d'une commande : informations complètes, actions de statut proposées par le serveur, notes et créneau. */
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrderDetail | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const apply = (o: AdminOrderDetail | null) => {
    setOrder(o);
    if (o) {
      setAdminNotes(o.adminNotes ?? '');
      setDeliveryDate(o.deliveryDate ? o.deliveryDate.slice(0, 10) : '');
      setTimeSlot(o.timeSlot ?? '');
    }
  };

  const load = useCallback(
    () =>
      getAdminOrderById(id)
        .then((o) => {
          apply(o);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Commande indisponible.')),
    [id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError && order === undefined) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {loadError}{' '}
        <button type="button" onClick={() => void load()} className="underline font-semibold">
          Réessayer
        </button>
      </div>
    );
  }
  if (order === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement de la commande…
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-gray-600">Commande introuvable.</p>
        <Link href="/admin/commandes" className="underline text-sm">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const changeStatus = async (status: BackendOrderStatus) => {
    let cancelReason: string | undefined;
    if (status === 'CANCELLED') {
      const reason = window.prompt('Motif de l’annulation (obligatoire) :', '');
      if (reason === null) return;
      if (reason.trim().length < 3) {
        toast.error('Indiquez un motif d’annulation (3 caractères minimum).');
        return;
      }
      cancelReason = reason.trim();
    }
    setBusy(true);
    try {
      apply(await changeAdminOrderStatus(order.id, status, { cancelReason }));
      toast.success(`Commande ${order.orderNumber} : ${ORDER_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Changement de statut impossible.');
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = async () => {
    setBusy(true);
    try {
      apply(
        await updateAdminOrder(order.id, {
          adminNotes: adminNotes.trim() || null,
          deliveryDate: deliveryDate || null,
          timeSlot: timeSlot || null,
        }),
      );
      toast.success('Informations de la commande enregistrées.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const final = order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED';

  return (
    <div className="space-y-6 admin-order-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/commandes" className="print:hidden p-2 rounded-lg border border-[#e7e4dd] hover:bg-gray-50" aria-label="Retour aux commandes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#1e2a1f]">Commande {order.orderNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${ORDER_STATUS_STYLES[order.orderStatus]}`}>{ORDER_STATUS_LABELS[order.orderStatus]}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Passée le {dateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e7e4dd] text-xs font-semibold hover:bg-gray-50">
            <Printer className="h-3.5 w-3.5" /> Imprimer
          </button>
          {order.allowedTransitions.map((to) => (
            <button
              key={to}
              type="button"
              disabled={busy}
              onClick={() => void changeStatus(to)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 ${
                to === 'CANCELLED' ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-[#c1647a] hover:bg-[#a85266] text-white'
              }`}
            >
              {to === 'IN_DELIVERY' && <Truck className="h-3.5 w-3.5" />}
              {ORDER_ACTION_LABELS[to]}
            </button>
          ))}
        </div>
      </div>

      {order.orderStatus === 'READY' && order.deliveryMode !== 'PICKUP' && (
        <p className="print:hidden rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
          Commande prête : assignez un livreur et démarrez la course depuis{' '}
          <Link href="/admin/livraisons" className="underline font-semibold">
            Livraisons
          </Link>
          , ou utilisez « Remettre au livreur ».
        </p>
      )}
      {order.orderStatus === 'CANCELLED' && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          Annulée{order.cancelledAt ? ` le ${dateTime(order.cancelledAt)}` : ''}
          {order.cancelReason ? ` — motif : ${order.cancelReason}` : ''}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-[#e7e4dd] p-5 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f]">
            <Package className="h-4 w-4" /> Articles
          </h2>
          <ul className="divide-y divide-[#f0ede6]">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-start gap-3 py-3 text-xs">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {it.image && <Image src={it.image} alt={it.productName} fill sizes="48px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-sm">{it.productName}</strong>
                  <span className="text-gray-500">
                    {[it.variantName && it.variantName !== 'Standard' ? it.variantName : null, it.sku ? `Réf. ${it.sku}` : null].filter(Boolean).join(' · ')}
                  </span>
                  {(it.giftWrap || it.cardMessage) && (
                    <span className="block text-gray-600 mt-0.5">
                      {it.giftWrap && 'Emballage cadeau. '}
                      {it.cardMessage && <>Carte : « {it.cardMessage} »</>}
                    </span>
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="block text-gray-500">
                    {fcfa(it.unitPrice)} × {it.quantity}
                  </span>
                  <strong>{fcfa(it.totalPrice + it.extrasPrice)}</strong>
                </div>
              </li>
            ))}
          </ul>
          <div className="ml-auto max-w-xs space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{fcfa(order.subtotal)}</span>
            </div>
            {order.extrasAmount > 0 && (
              <div className="flex justify-between">
                <span>Options cadeau</span>
                <span>{fcfa(order.extrasAmount)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>−{fcfa(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{order.deliveryFee ? fcfa(order.deliveryFee) : 'Offerte'}</span>
            </div>
            {(order.giftCardAmount ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Carte cadeau</span>
                <span>−{fcfa(order.giftCardAmount ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#f0ede6] pt-2 text-sm font-bold">
              <span>{(order.giftCardAmount ?? 0) > 0 ? 'Reste à payer' : 'Total'}</span>
              <span>{fcfa(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        <div className="space-y-5">
          <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 text-xs space-y-1.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f] mb-2">
              <User className="h-4 w-4" /> Client
            </h2>
            <strong className="block text-sm">{order.customerName}</strong>
            <a href={`mailto:${order.customerEmail}`} className="block text-[#c1647a]">
              {order.customerEmail}
            </a>
            <a href={`tel:${order.customerPhone}`} className="block">
              {order.customerPhone}
            </a>
            {order.customerId && (
              <Link href={`/admin/clients/${order.customerId}`} className="print:hidden inline-block mt-1 underline">
                Voir le profil client
              </Link>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 text-xs space-y-1.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f] mb-2">
              <MapPin className="h-4 w-4" /> {DELIVERY_MODE_LABELS[order.deliveryMode]}
            </h2>
            {order.recipientName && (
              <span className="block">
                Destinataire : <strong>{order.recipientName}</strong> {order.recipientPhone && `(${order.recipientPhone})`}
              </span>
            )}
            <span className="block">{order.deliveryMode === 'PICKUP' ? 'Retrait à la boutique' : order.deliveryAddress}</span>
            {order.deliveryZone && <span className="block text-gray-500">Zone : {order.deliveryZone.name}</span>}
            {order.notes && <span className="block text-gray-600">Note du client : « {order.notes} »</span>}
          </section>

          <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 text-xs space-y-1.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f] mb-2">
              <CreditCard className="h-4 w-4" /> Paiement
            </h2>
            <span className="block">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
            <span className="block">
              Statut : <strong>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</strong>
              {order.paidAt ? ` le ${dateTime(order.paidAt)}` : ''}
            </span>
          </section>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 text-xs space-y-3 print:hidden">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f]">
            <StickyNote className="h-4 w-4" /> Planification & notes internes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-semibold mb-1">Date de livraison</span>
              <input type="date" value={deliveryDate} disabled={final} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full h-9 rounded-md border border-[#e7e4dd] px-2" />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Créneau</span>
              <select value={timeSlot} disabled={final} onChange={(e) => setTimeSlot(e.target.value)} className="w-full h-9 rounded-md border border-[#e7e4dd] px-2 bg-white">
                <option value="">Non défini</option>
                {TIME_SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="block font-semibold mb-1">Notes internes (non visibles du client)</span>
            <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full rounded-md border border-[#e7e4dd] p-2" />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveDetails()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#24582d] text-white font-semibold disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> Enregistrer
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 text-xs">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a1f] mb-3">
            <History className="h-4 w-4" /> Historique
          </h2>
          <ol className="space-y-2">
            {[...order.statusHistory].reverse().map((h) => (
              <li key={h.id} className="flex gap-3">
                <span className="w-36 shrink-0 text-gray-500">{dateTime(h.createdAt)}</span>
                <span>
                  <strong>{ORDER_STATUS_LABELS[h.toStatus]}</strong>
                  {h.note ? ` — ${h.note}` : ''}
                  {h.authorName ? <span className="text-gray-500"> ({h.authorName})</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
