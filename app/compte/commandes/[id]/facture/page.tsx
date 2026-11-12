'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { getMyOrder, DELIVERY_MODE_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type CustomerOrder } from '@/lib/api/orders';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { formatPrice } from '@/lib/products';

/** Facture imprimable (ou enregistrable en PDF via l'impression du navigateur). */
export default function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyOrder(id), getPublicSettings()])
      .then(([o, s]) => {
        setOrder(o);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Facture indisponible.'));
  }, [id]);

  if (error) {
    return (
      <div className="account-panel" role="alert">
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/compte/commandes" className="underline text-sm">
          Retour à mes commandes
        </Link>
      </div>
    );
  }
  if (!order || !shop) return <p className="py-10 text-sm text-neutral-500">Préparation de la facture…</p>;
  if (order.orderStatus === 'CANCELLED') {
    return (
      <div className="account-panel">
        <p className="text-sm">Cette commande a été annulée : aucune facture n’est émise.</p>
      </div>
    );
  }

  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

  return (
    <div className="invoice-page">
      <div className="invoice-actions flex flex-wrap items-center justify-between gap-2 mb-4">
        <Link href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}`} className="back-link">
          <ArrowLeft size={14} /> Retour à la commande
        </Link>
        <button type="button" onClick={() => window.print()} className="button button-primary button-small">
          <Printer size={15} /> Imprimer / enregistrer en PDF
        </button>
      </div>

      <article className="account-panel invoice-sheet text-sm" aria-label={`Facture ${order.orderNumber}`}>
        <header className="flex flex-wrap justify-between gap-4 border-b border-neutral-200 pb-4 mb-4">
          <div>
            <strong className="block text-lg font-serif">{shop.boutique.shopName}</strong>
            <span className="block text-xs text-neutral-600">{shop.boutique.address}</span>
            <span className="block text-xs text-neutral-600">
              {shop.boutique.phoneSaly} · {shop.boutique.contactEmail}
            </span>
          </div>
          <div className="text-right">
            <strong className="block text-lg">Facture</strong>
            <span className="block text-xs">N° {order.orderNumber}</span>
            <span className="block text-xs">Date : {date(order.createdAt)}</span>
            <span className="block text-xs">Paiement : {PAYMENT_STATUS_LABELS[order.paymentStatus]}{order.paidAt ? ` le ${date(order.paidAt)}` : ''}</span>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 gap-4 mb-4 text-xs">
          <div>
            <strong className="block text-neutral-500 uppercase text-[10px] tracking-wider mb-1">Client</strong>
            {order.customerName}
            <br />
            {order.customerEmail}
            <br />
            {order.customerPhone}
          </div>
          <div>
            <strong className="block text-neutral-500 uppercase text-[10px] tracking-wider mb-1">{DELIVERY_MODE_LABELS[order.deliveryMode]}</strong>
            {order.recipientName && (
              <>
                {order.recipientName}
                <br />
              </>
            )}
            {order.deliveryMode === 'PICKUP' ? 'Retrait à l’atelier' : order.deliveryAddress}
            {order.deliveryZone ? ` (${order.deliveryZone.name})` : ''}
          </div>
        </section>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-300 text-left">
              <th className="py-2">Article</th>
              <th className="py-2 text-right">Qté</th>
              <th className="py-2 text-right">Prix unitaire</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-neutral-100 align-top">
                <td className="py-2">
                  {it.productName}
                  {it.variantName && it.variantName !== 'Standard' ? ` — ${it.variantName}` : ''}
                  {it.sku && <span className="block text-[10px] text-neutral-500">Réf. {it.sku}</span>}
                  {(it.giftWrap || it.cardMessage) && (
                    <span className="block text-[10px] text-neutral-500">
                      Options : {[it.giftWrap && 'emballage cadeau', it.cardMessage && 'carte message'].filter(Boolean).join(', ')}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatPrice(it.unitPrice)}</td>
                <td className="py-2 text-right">{formatPrice(it.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.extrasAmount > 0 && (
            <div className="flex justify-between">
              <span>Options cadeau</span>
              <span>{formatPrice(order.extrasAmount)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Remise{order.couponCode ? ` (${order.couponCode})` : ''}</span>
              <span>−{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          <p className="pt-2 text-[11px] text-neutral-500">Règlement : {PAYMENT_METHOD_LABELS[order.paymentMethod]}.</p>
        </div>
      </article>
    </div>
  );
}
