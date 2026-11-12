'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, CheckCircle2, AlertTriangle, Clock, Loader2, PackageCheck, Save, Boxes } from 'lucide-react';
import { toast } from 'sonner';
import type { SupplierOrder, SupplierOrderItem } from '@/lib/admin/mock-data/types';
import { RECEIVABLE_STATUSES, getSupplierOrder, receiveSupplierOrder } from '@/lib/api/admin/procurement';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, formatDay, formatFcfa } from '@/lib/admin/procurement-labels';

function ItemBadge({ status }: { status: SupplierOrderItem['status'] }) {
  if (status === 'complete')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
        <CheckCircle2 size={12} /> Complète
      </span>
    );
  if (status === 'partielle')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
        <AlertTriangle size={12} /> Partielle
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800">
      <Clock size={12} /> En attente
    </span>
  );
}

/**
 * Détail d'une commande fournisseur et saisie de la réception : on saisit ce qui arrive maintenant
 * (cumulable), les produits liés au catalogue entrent en stock.
 */
export default function AdminReceptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<SupplierOrder | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [arrivals, setArrivals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      getSupplierOrder(id)
        .then((o) => {
          setOrder(o);
          setArrivals({});
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
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la commande…
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
        <Boxes className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-serif font-bold text-gray-800">Commande fournisseur introuvable</h2>
        <Link href="/admin/approvisionnements" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#193e23] text-white text-xs font-semibold">
          <ArrowLeft size={14} /> Retour aux commandes
        </Link>
      </div>
    );
  }

  const receivable = RECEIVABLE_STATUSES.includes(order.status);
  const remaining = (it: SupplierOrderItem) => it.orderedQty - it.receivedQty;

  const fillAll = () => setArrivals(Object.fromEntries(order.items.filter((i) => remaining(i) > 0).map((i) => [i.id, String(remaining(i))])));

  const save = async () => {
    const lines = order.items
      .map((it) => ({ itemId: it.id, quantity: Math.round(Number(arrivals[it.id]) || 0) }))
      .filter((l) => l.quantity > 0);
    if (lines.length === 0) {
      toast.error('Saisissez au moins une quantité reçue.');
      return;
    }
    setSaving(true);
    try {
      const updated = await receiveSupplierOrder(order.id, lines);
      const stocked = order.items.filter((i) => i.variantId && lines.some((l) => l.itemId === i.id)).length;
      toast.success(
        `Réception enregistrée (${updated.status === 'receptionnee' ? 'commande complète' : 'réception partielle'})${
          stocked ? ` : ${stocked} produit(s) entré(s) en stock` : ''
        }.`,
      );
      setOrder(updated);
      setArrivals({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Réception impossible.');
    } finally {
      setSaving(false);
    }
  };

  const arrivalInput = (it: SupplierOrderItem) =>
    receivable && remaining(it) > 0 ? (
      <input
        type="number"
        min={0}
        max={remaining(it)}
        value={arrivals[it.id] ?? ''}
        placeholder="0"
        onChange={(e) => setArrivals((a) => ({ ...a, [it.id]: e.target.value }))}
        aria-label={`Quantité reçue maintenant pour ${it.name}`}
        className="w-24 px-3 py-2 rounded-xl border border-[#c4d6c7] bg-white text-center font-bold text-sm outline-none focus:ring-2 focus:ring-[#173f22]/20"
      />
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/approvisionnements" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft size={14} /> Commandes fournisseurs
        </Link>
        <span>›</span>
        <span className="font-semibold text-foreground">{order.orderNumber}</span>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#173f22]">{receivable ? 'Réception' : 'Commande'} {order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
          {receivable && (
            <button type="button" onClick={fillAll} className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted">
              Tout reçu (reste à recevoir)
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 size={16} className="text-[#c8436e]" />
            <span>
              Fournisseur :{' '}
              <Link href={`/admin/fournisseurs/${order.supplierId}`} className="font-semibold text-foreground underline">
                {order.supplierName}
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} className="text-[#c8436e]" />
            <span>
              Commandée le <strong className="text-foreground">{formatDay(order.date)}</strong>
              {order.expectedDate && <> · prévue le {formatDay(order.expectedDate)}</>}
            </span>
          </div>
          <div className="sm:text-right text-muted-foreground">
            Total : <strong className="text-sm text-[#c8436e]">{formatFcfa(order.total)}</strong>
          </div>
        </div>
        {!receivable && order.status !== 'receptionnee' && order.status !== 'annulee' && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            La réception sera possible une fois la commande validée (depuis la liste des commandes fournisseurs).
          </p>
        )}
        {order.notes && <p className="text-xs text-muted-foreground whitespace-pre-wrap">Notes : {order.notes}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
            <tr>
              <th className="py-3.5 px-5">Produit</th>
              <th className="py-3.5 px-5 text-center">Commandé</th>
              <th className="py-3.5 px-5 text-center">Déjà reçu</th>
              <th className="py-3.5 px-5 text-center">Reçu maintenant</th>
              <th className="py-3.5 px-5 text-right">Prix achat</th>
              <th className="py-3.5 px-5 text-center">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs sm:text-sm">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="py-4 px-5 font-semibold">
                  {it.name}
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {it.variantId ? 'Produit du catalogue : entre en stock à la réception' : 'Article hors catalogue'}
                  </span>
                </td>
                <td className="py-4 px-5 text-center font-mono">{it.orderedQty}</td>
                <td className="py-4 px-5 text-center font-mono">{it.receivedQty}</td>
                <td className="py-4 px-5 text-center">{arrivalInput(it)}</td>
                <td className="py-4 px-5 text-right font-mono">{formatFcfa(it.unitPrice)}</td>
                <td className="py-4 px-5 text-center">
                  <ItemBadge status={it.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receivable && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#193e23] hover:bg-[#14321c] text-white text-sm font-semibold shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer la réception
          </button>
        </div>
      )}
      {order.status === 'receptionnee' && (
        <p className="flex items-center gap-2 text-sm text-emerald-800">
          <PackageCheck size={18} /> Commande entièrement réceptionnée{order.receivedAt ? ` le ${formatDay(order.receivedAt)}` : ''}.
        </p>
      )}
    </div>
  );
}
