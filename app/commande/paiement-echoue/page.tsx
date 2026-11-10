'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CircleAlert,
  RotateCw,
  ExternalLink,
  Loader2,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { SiteFooter } from '@/components/site-footer';
import { getMyOrder, cancelMyOrder, CustomerOrder } from '@/lib/api/orders';
import { payOrder } from '@/lib/api/payment';
import { useAuth } from '@/components/auth-provider';
import { formatPrice } from '@/lib/products';

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');

  // Redirection vers connexion si session expirée
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/commande';
      router.push(`/connexion?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (orderNumber && isAuthenticated) {
      setLoading(true);
      getMyOrder(orderNumber)
        .then((data) => {
          if (data) setOrder(data);
        })
        .finally(() => setLoading(false));
    } else if (!orderNumber) {
      setLoading(false);
    }
  }, [orderNumber, isAuthenticated]);

  async function handleRetryPayment() {
    if (!order) return;
    setRetrying(true);
    setActionError('');
    const res = await payOrder(order.orderNumber);
    setRetrying(false);

    if (res.success && res.data?.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else {
      setActionError(
        res.error ||
          'Impossible de générer une nouvelle session NabooPay. Veuillez contacter notre assistance.'
      );
    }
  }

  async function handleCancelOrder() {
    if (!order) return;
    if (
      !window.confirm(
        'Êtes-vous sûr de vouloir annuler cette commande ? Vos articles seront remis en stock.'
      )
    ) {
      return;
    }

    setCancelling(true);
    setActionError('');
    const ok = await cancelMyOrder(
      order.orderNumber,
      'Annulation suite à paiement non abouti'
    );
    setCancelling(false);

    if (ok) {
      router.push('/commande');
    } else {
      setActionError(
        'Impossible d’annuler cette commande. Veuillez contacter la boutique.'
      );
    }
  }

  const paymentLabels: Record<string, string> = {
    WAVE: 'Wave Sénégal',
    ORANGE_MONEY: 'Orange Money',
    FREE_MONEY: 'Free Money',
    CARD: 'Carte bancaire',
    CASH_ON_DELIVERY: 'Espèces à la livraison',
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour Décofleur Plus, j'ai rencontré un problème lors du paiement de ma commande #${
      order?.orderNumber || orderNumber || ''
    }. Pouvez-vous m'aider ?`
  );

  return (
    <main className="content-width page-main state-page">
      <span className="state-icon error">
        <CircleAlert size={28} />
      </span>

      <h1>Paiement non abouti</h1>

      {loading ? (
        <div className="flex items-center justify-center p-8 gap-2 text-neutral-500">
          <Loader2 size={20} className="animate-spin" />
          <span>Récupération des informations de la commande...</span>
        </div>
      ) : order ? (
        <div className="max-w-xl mx-auto w-full text-left bg-white border border-red-100 rounded-3xl p-6 shadow-sm my-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <div>
              <span className="text-xs text-neutral-500 block">Commande conservée</span>
              <strong className="text-lg text-neutral-900">#{order.orderNumber}</strong>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
              Paiement interrompu
            </span>
          </div>

          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            La transaction auprès de votre opérateur (
            <strong>{paymentLabels[order.paymentMethod] || 'NabooPay'}</strong>) n’a pas été finalisée ou a été annulée. Rassurez-vous, votre commande est réservée afin de vous éviter de refaire votre panier.
          </p>

          {actionError && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {actionError}
            </div>
          )}

          {/* Récapitulatif montant & articles */}
          <div className="bg-neutral-50 p-4 rounded-2xl mb-5 space-y-2 text-xs text-neutral-700">
            <div className="flex justify-between">
              <span>Articles commandés ({order.items.length})</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison ({order.deliveryMode})</span>
              <span className="font-semibold">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-bold text-neutral-900">
              <span>Montant restant à régler</span>
              <span className="text-[#173f22]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Boutons d'action contextuels */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={retrying}
              className="button button-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {retrying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Génération du nouveau lien de paiement...</span>
                </>
              ) : (
                <>
                  <RotateCw size={16} />
                  <span>Réessayer le paiement maintenant ({paymentLabels[order.paymentMethod] || 'NabooPay'})</span>
                </>
              )}
            </button>

            <div className="grid sm:grid-cols-2 gap-2 pt-1">
              <a
                href={`https://wa.me/221779417860?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-outline text-xs flex items-center justify-center gap-2 py-2"
              >
                <WhatsAppIcon size={14} />
                <span>Assistance WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="button button-outline text-xs text-neutral-600 hover:text-red-700 flex items-center justify-center gap-1.5 py-2"
              >
                {cancelling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                <span>Annuler et recommencer</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="max-w-md mx-auto text-neutral-600 mb-6">
          Le paiement n’a pas été confirmé. Vérifiez le solde de votre compte ou choisissez un autre moyen de paiement.
        </p>
      )}

      <div className="state-actions">
        <Link className="button button-primary" href="/commande">
          <ArrowLeft size={16} /> Retour au tunnel de commande
        </Link>
        <Link className="button button-outline" href="/compte/commandes">
          Consulter mes commandes
        </Link>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <>
      <Suspense fallback={<div className="p-12 text-center text-neutral-500">Chargement...</div>}>
        <PaymentFailedContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
