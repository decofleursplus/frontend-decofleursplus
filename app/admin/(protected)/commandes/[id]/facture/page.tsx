'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { getAdminOrderById, type AdminOrderDetail } from '@/lib/api/admin/orders';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { buildOrderInvoice } from '@/lib/documents/order-invoice';

/** Facture d'une commande depuis le back-office (à imprimer ou envoyer au client en PDF). */
export default function AdminOrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminOrderById(id), getPublicSettings().catch(() => null)])
      .then(([o, s]) => {
        if (!o) setError('Commande introuvable.');
        else setOrder(o);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Facture indisponible.'));
  }, [id]);

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}{' '}
        <Link href="/admin/commandes" className="font-semibold underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Préparation de la facture…
      </div>
    );
  }
  if (order.orderStatus === 'CANCELLED') {
    return (
      <p className="rounded-xl border border-[#e7e4dd] bg-white p-4 text-sm">Commande annulée : aucune facture n’est émise.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="invoice-actions flex flex-wrap items-center justify-between gap-2">
        <Link href={`/admin/commandes/${order.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à la commande
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#c1647a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a85266]"
        >
          <Printer className="h-3.5 w-3.5" /> Imprimer / enregistrer en PDF
        </button>
      </div>
      <InvoiceDocument shop={shop?.boutique ?? null} {...buildOrderInvoice(order)} />
    </div>
  );
}
