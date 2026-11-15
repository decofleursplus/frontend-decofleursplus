'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { getMyOrder, type CustomerOrder } from '@/lib/api/orders';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { buildOrderInvoice } from '@/lib/documents/order-invoice';

/** Facture imprimable (ou enregistrable en PDF via l'impression du navigateur). */
export default function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyOrder(id), getPublicSettings().catch(() => null)])
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
  if (!order) return <p className="py-10 text-sm text-neutral-500">Préparation de la facture…</p>;
  if (order.orderStatus === 'CANCELLED') {
    return (
      <div className="account-panel">
        <p className="text-sm">Cette commande a été annulée : aucune facture n’est émise.</p>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="invoice-actions mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}`} className="back-link">
          <ArrowLeft size={14} /> Retour à la commande
        </Link>
        <button type="button" onClick={() => window.print()} className="button button-primary button-small">
          <Printer size={15} /> Imprimer / enregistrer en PDF
        </button>
      </div>
      <InvoiceDocument shop={shop?.boutique ?? null} {...buildOrderInvoice(order)} />
    </div>
  );
}
