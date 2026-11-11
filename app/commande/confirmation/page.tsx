'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  RotateCw,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { getMyOrder, CustomerOrder } from '@/lib/api/orders';
import { payOrder } from '@/lib/api/payment';
import { useAuth } from '@/components/auth-provider';
import { formatPrice } from '@/lib/products';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [pollCount, setPollCount] = useState(0);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [loadError, setLoadError] = useState('');

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirection vers connexion si la session a expiré
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/commande';
      router.push(`/connexion?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const loadOrder = useCallback(
    async () => {
      if (!orderNumber) return null;
      try {
        const data = await getMyOrder(orderNumber);
        setOrder(data);
        setLoadError('');
        return data;
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Impossible de charger la commande.');
      } finally {
        setLoading(false);
      }
      return null;
    },
    [orderNumber]
  );

  // Chargement initial
  useEffect(() => {
    // `loading` vaut déjà true au premier rendu
    if (!orderNumber || !isAuthenticated) return;
    getMyOrder(orderNumber)
      .then(setOrder)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Impossible de charger la commande.'))
      .finally(() => setLoading(false));
  }, [orderNumber, isAuthenticated]);

  // Vérification automatique (5 essais) tant que le paiement en ligne est en attente
  const isDigitalPending =
    Boolean(order) &&
    order!.paymentStatus === 'PENDING' &&
    order!.paymentMethod !== 'CASH_ON_DELIVERY' &&
    order!.orderStatus !== 'CANCELLED';
  const isPolling = isDigitalPending && pollCount < 5;

  useEffect(() => {
    if (!isPolling) return;
    pollTimerRef.current = setTimeout(async () => {
      await loadOrder();
      setPollCount((prev) => prev + 1);
    }, 2500);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [isPolling, pollCount, loadOrder]);

  async function handleRetryPayment() {
    if (!order) return;
    setRetryingPayment(true);
    setRetryError('');
    try {
      const session = await payOrder(order.orderNumber);
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      setRetryError('Le service de paiement n’a pas renvoyé de lien. Réessayez dans un instant.');
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : 'Impossible de relancer le paiement en ligne.');
    }
    setRetryingPayment(false);
  }

  const paymentLabels: Record<string, string> = {
    WAVE: 'Wave Sénégal',
    ORANGE_MONEY: 'Orange Money',
    FREE_MONEY: 'Free Money',
    CARD: 'Carte bancaire',
    CASH_ON_DELIVERY: 'Espèces à la livraison',
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800' },
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

  const isCash = order?.paymentMethod === 'CASH_ON_DELIVERY';
  const isPaid = order?.paymentStatus === 'PAID';

  return (
    <main className="content-width page-main state-page">
      {order && (
        <span className="state-icon success">
          <Check size={28} />
        </span>
      )}

      <h1>{order ? 'Merci, votre commande est enregistrée' : 'Confirmation de commande'}</h1>

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

          {/* BANNIÈRE CONTEXTUELLE SELON LE MODE ET STATUT DU PAIEMENT */}
          {isCash ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-emerald-900">
              <div className="flex items-start gap-2.5">
                <Banknote size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm mb-1">
                    Commande validée — Règlement en espèces à la livraison
                  </strong>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Votre commande est bien transmise à notre atelier. Préparez la somme exacte de{' '}
                    <strong>{formatPrice(order.totalAmount)}</strong> pour le livreur lors de la remise en main propre.
                  </p>
                </div>
              </div>
            </div>
          ) : isPaid ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-emerald-900">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm mb-1">Paiement validé avec succès</strong>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Votre transaction par {paymentLabels[order.paymentMethod] || 'NabooPay'} a été confirmée. Nos artisans fleuristes s’occupent de composer votre création.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-amber-900">
              <div className="flex items-start gap-2.5">
                {isPolling ? (
                  <Loader2 size={18} className="animate-spin text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <Clock size={18} className="text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="block text-sm">
                      {isPolling
                        ? 'Vérification du paiement NabooPay...'
                        : 'Paiement en attente de validation'}
                    </strong>
                    <button
                      type="button"
                      onClick={() => void loadOrder()}
                      className="text-xs text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 underline ml-2"
                      title="Rafraîchir"
                    >
                      <RotateCw size={12} className={isPolling ? 'animate-spin' : ''} /> Actualiser
                    </button>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {isPolling
                      ? 'Nous attendons la confirmation de votre opérateur de paiement (Wave / Orange Money). La page s’actualise automatiquement.'
                      : 'Si vous avez finalisé le règlement sur NabooPay, cliquez sur "Actualiser". Sinon, vous pouvez relancer la session ci-dessous.'}
                  </p>

                  {/* Bouton de relance NabooPay direct */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      disabled={retryingPayment}
                      className="button button-primary text-xs inline-flex items-center gap-1.5 py-1.5 px-3"
                    >
                      {retryingPayment ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Connexion à NabooPay...</span>
                        </>
                      ) : (
                        <>
                          <span>Payer maintenant ({paymentLabels[order.paymentMethod] || 'NabooPay'})</span>
                          <ExternalLink size={12} />
                        </>
                      )}
                    </button>
                  </div>
                  {retryError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> {retryError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Détails de livraison */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl mb-4">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-[#173f22] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-neutral-800">
                  {order.deliveryMode === 'PICKUP' ? 'Retrait en boutique' : 'Adresse de livraison'}
                </strong>
                <span>
                  {order.deliveryMode === 'PICKUP'
                    ? 'À retirer à notre atelier'
                    : [order.deliveryAddress, order.deliveryZone?.name].filter(Boolean).join(' — ')}
                </span>
                {order.recipientName && (
                  <span className="block">
                    Pour : {order.recipientName}
                    {order.recipientPhone ? ` (${order.recipientPhone})` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-[#173f22] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-neutral-800">Date & Créneau</strong>
                <span>
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'À convenir avec la boutique'}
                  {order.timeSlot ? ` (${order.timeSlot})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 px-4 py-2.5 rounded-2xl mb-4">
            <span className="flex items-center gap-1.5 font-medium text-neutral-700">
              <CreditCard size={14} className="text-[#173f22]" /> Mode de paiement :
            </span>
            <strong>{paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
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

            <div className="border-t border-neutral-100 mt-3 pt-3 space-y-1 text-xs text-neutral-600">
              {order.extrasAmount > 0 && (
                <div className="flex justify-between">
                  <span>Options cadeau</span>
                  <span>{formatPrice(order.extrasAmount)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{order.deliveryMode === 'PICKUP' ? 'Retrait' : 'Livraison'}</span>
                <span>{order.deliveryFee === 0 ? 'Offerte' : formatPrice(order.deliveryFee)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 mt-3 pt-3 text-base">
              <strong>{isPaid ? 'Total payé' : 'Total à régler'}</strong>
              <strong className="text-[#173f22] text-lg">{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-neutral-700 mb-6 space-y-3" role="alert">
          <p>
            {orderNumber
              ? `Nous n’avons pas pu afficher la commande ${orderNumber}${loadError ? ` : ${loadError}` : '.'}`
              : 'Aucune commande n’est indiquée.'}
          </p>
          {orderNumber && (
            <button type="button" onClick={() => {
                setLoading(true);
                void loadOrder();
              }} className="button button-outline inline-flex items-center gap-1.5">
              <RotateCw size={14} /> Réessayer
            </button>
          )}
        </div>
      )}

      <div className="state-actions">
        {order && order.deliveryMode !== 'PICKUP' ? (
          <Link
            className="button button-primary flex items-center gap-1.5"
            href={`/compte/suivi/${order.orderNumber}`}
          >
            <Truck size={16} /> Suivre ma livraison
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
