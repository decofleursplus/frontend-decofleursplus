'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Flower2,
  Package,
  Truck,
  ArrowRight,
  ExternalLink,
  Loader2,
  Calendar,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { getMyOrder, CustomerOrder } from '@/lib/api/orders';
import { formatPrice } from '@/lib/products';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      setLoading(true);
      getMyOrder(orderNumber)
        .then((data) => {
          if (data) setOrder(data);
        })
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente de paiement', color: 'bg-amber-100 text-amber-800' },
    PAID: { label: 'Payée avec succès', color: 'bg-emerald-100 text-emerald-800' },
    PREPARING: { label: 'En préparation à l’atelier', color: 'bg-blue-100 text-blue-800' },
    READY: { label: 'Prête en boutique', color: 'bg-purple-100 text-purple-800' },
    IN_DELIVERY: { label: 'En cours de livraison', color: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-900' },
    CANCELLED: { label: 'Annulée', color: 'bg-neutral-100 text-neutral-600' },
  };

  const statusInfo = order
    ? statusLabels[order.orderStatus] || { label: order.orderStatus, color: 'bg-neutral-100 text-neutral-700' }
    : null;

  return (
    <main className="content-width page-main state-page">
      <span className="state-icon success">
        <Check size={28} />
      </span>

      <h1>Confirmation de commande</h1>

      {loading ? (
        <div className="flex items-center justify-center p-8 gap-2 text-neutral-500">
          <Loader2 size={20} className="animate-spin" />
          <span>Chargement des détails de votre commande...</span>
        </div>
      ) : order ? (
        <div className="max-w-xl mx-auto w-full text-left bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm my-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <div>
              <span className="text-xs text-neutral-500 block">Numéro de commande</span>
              <strong className="text-lg text-neutral-900">#{order.orderNumber}</strong>
            </div>
            {statusInfo && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-600 mb-4">
            Merci pour votre commande ! Notre atelier floral prépare avec soin votre composition fraîche.
          </p>

          {/* Lien de paiement si PENDING avec NabooPay */}
          {order.checkoutUrl && order.paymentStatus === 'PENDING' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-emerald-900">
              <strong className="block text-sm mb-1">Finalisez votre paiement :</strong>
              <p className="text-xs text-emerald-700 mb-3">
                Si vous n’avez pas été redirigé automatiquement vers NabooPay, cliquez ci-dessous pour payer via Wave, Orange Money ou Carte.
              </p>
              <a
                href={order.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary text-xs inline-flex items-center gap-1.5"
              >
                Payer maintenant <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Détails de livraison */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl mb-4">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-[#173f22] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-neutral-800">Adresse de livraison</strong>
                <span>{order.deliveryAddress || 'Saly Portudal'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-[#173f22] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-neutral-800">Date & Créneau</strong>
                <span>
                  {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('fr-FR') : 'Aujourd’hui'}{' '}
                  {order.timeSlot ? `(${order.timeSlot})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="border-t border-neutral-100 pt-3">
            <strong className="text-xs text-neutral-500 block mb-2">Articles commandés</strong>
            <div className="space-y-2">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span>
                    {it.quantity}x {it.productName}
                    {it.variantName ? ` (${it.variantName})` : ''}
                  </span>
                  <strong>{formatPrice(it.totalPrice)}</strong>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 mt-3 pt-3 text-base">
              <strong>Total payé</strong>
              <strong className="text-[#173f22] text-lg">{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className="max-w-md mx-auto text-neutral-600 mb-6">
          Votre commande a bien été enregistrée. Vous pouvez suivre son avancée en direct depuis votre espace client.
        </p>
      )}

      <div className="state-actions">
        {order ? (
          <Link
            className="button button-primary flex items-center gap-1.5"
            href={`/compte/suivi/${order.orderNumber}`}
          >
            <Truck size={16} /> Suivre ma livraison en direct
          </Link>
        ) : (
          <Link className="button button-primary" href="/compte/commandes">
            Voir mes commandes
          </Link>
        )}
        <Link className="button button-outline" href="/boutique">
          Continuer mes achats
        </Link>
      </div>

      <Flower2 className="state-flower" />
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <Suspense fallback={<div className="p-12 text-center text-neutral-500">Chargement...</div>}>
        <ConfirmationContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
