'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  PackageCheck,
  Truck,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  XCircle,
  Loader2,
} from 'lucide-react';
import { getMyOrder, cancelMyOrder, DELIVERY_MODE_LABELS, type CustomerOrder } from '@/lib/api/orders';
import { getOrderPayments, payOrder, Payment } from '@/lib/api/payment';
import { formatPrice } from '@/lib/products';
import { useAuth } from '@/components/auth-provider';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loadError, setLoadError] = useState<{ notFound: boolean; text: string } | null>(null);

  // `loading` vaut déjà true au premier rendu ; les rechargements manuels passent par `reloadOrder`.
  const loadOrderData = useCallback(
    () =>
      Promise.all([getMyOrder(id), getOrderPayments(id)])
        .then(([ord, pays]) => {
          setOrder(ord);
          setPayments(pays);
          setLoadError(null);
        })
        .catch((err) => {
          const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
          setLoadError({
            notFound: status === 404,
            text: err instanceof Error ? err.message : 'Impossible de charger la commande.',
          });
        })
        .finally(() => setLoading(false)),
    [id],
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/connexion?redirect=/compte/commandes/${encodeURIComponent(id)}`);
      return;
    }
    if (isAuthenticated) void loadOrderData();
  }, [id, isAuthenticated, authLoading, router, loadOrderData]);

  function reloadOrder() {
    setLoading(true);
    void loadOrderData();
  }

  async function handleRetryPayment() {
    if (!order) return;
    setRetryingPayment(true);
    setActionMessage(null);
    try {
      const session = await payOrder(order.orderNumber);
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      setActionMessage({ type: 'error', text: 'Le service de paiement n’a pas renvoyé de lien. Réessayez.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Impossible d’initialiser le paiement.' });
    }
    setRetryingPayment(false);
  }

  async function handleCancelOrder() {
    if (!order) return;
    const reason = window.prompt('Souhaitez-vous indiquer la raison de l’annulation ? (facultatif)', '');
    if (reason === null) return;

    setCancellingOrder(true);
    setActionMessage(null);
    try {
      await cancelMyOrder(order.orderNumber, reason.trim() || 'Annulation par le client depuis son espace');
      setActionMessage({ type: 'success', text: 'Votre commande a bien été annulée.' });
      void loadOrderData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Impossible d’annuler cette commande.' });
    } finally {
      setCancellingOrder(false);
    }
  }

  const paymentLabels: Record<string, string> = {
    WAVE: 'Wave Sénégal',
    ORANGE_MONEY: 'Orange Money',
    FREE_MONEY: 'Free Money',
    CARD: 'Carte bancaire',
    CASH_ON_DELIVERY: 'Espèces à la livraison',
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'En attente', class: 'pending' },
    PAID: { label: 'Payée', class: 'paid' },
    PREPARING: { label: 'En préparation', class: 'pending' },
    READY: { label: 'Prête', class: 'pending' },
    IN_DELIVERY: { label: 'En livraison', class: 'pending' },
    DELIVERED: { label: 'Livrée', class: 'delivered' },
    CANCELLED: { label: 'Annulée', class: 'cancelled' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-neutral-500 gap-3">
        <Loader2 size={24} className="animate-spin text-[#173f22]" />
        <span>Chargement des informations de votre commande #{id}...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="account-panel text-center py-12">
        <AlertCircle size={36} className="mx-auto text-amber-600 mb-3" />
        <h2 className="text-xl font-serif font-bold text-neutral-800 mb-2">
          {loadError && !loadError.notFound ? 'Chargement impossible' : 'Commande introuvable'}
        </h2>
        <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
          {loadError && !loadError.notFound
            ? loadError.text
            : `La commande ${id} n’existe pas ou n’est pas associée à votre compte.`}
        </p>
        {loadError && !loadError.notFound && (
          <button type="button" onClick={reloadOrder} className="button button-outline mb-3 inline-flex items-center gap-1.5">
            <RotateCw size={15} /> Réessayer
          </button>
        )}
        <Link href="/compte/commandes" className="button button-primary inline-flex items-center gap-1.5">
          <ArrowLeft size={16} /> Retour à mes commandes
        </Link>
      </div>
    );
  }

  const isPendingPayment = order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED';
  const isCash = order.paymentMethod === 'CASH_ON_DELIVERY';
  const canCancel = ['PENDING', 'PAID'].includes(order.orderStatus);
  const reachedOn = (status: string) => {
    const entry = order.statusHistory.find((h) => h.toStatus === status);
    return entry ? new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
  };

  return (
    <>
      <div className="account-title-row">
        <div>
          <Link className="back-link" href="/compte/commandes">
            <ArrowLeft size={14} /> Mes commandes
          </Link>
          <h1 className="account-title">Commande n° #{order.orderNumber}</h1>
          <p className="account-intro">
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.orderStatus !== 'CANCELLED' && order.deliveryMode !== 'PICKUP' && (
            <Link
              className="button button-outline button-small flex items-center gap-1"
              href={`/compte/suivi/${encodeURIComponent(order.orderNumber)}`}
            >
              <Truck size={14} /> Suivre la livraison
            </Link>
          )}
          {order.orderStatus !== 'CANCELLED' && (
            <Link
              className="button button-outline button-small flex items-center gap-1"
              href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}/facture`}
            >
              <Receipt size={14} /> Facture
            </Link>
          )}
          {canCancel && !(isPendingPayment && !isCash) && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
              className="button button-outline button-small flex items-center gap-1 text-red-700"
            >
              {cancellingOrder ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={14} />} Annuler la commande
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 mb-4 rounded-2xl text-xs font-medium border flex items-center gap-2 ${
            actionMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {actionMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* BANNIÈRE DE PAIEMENT EN ATTENTE SI APPLICABLE */}
      {isPendingPayment && !isCash && (
        <section className="account-panel mb-5 border-amber-200 bg-amber-50/70 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block text-sm mb-0.5">
                  Paiement de {formatPrice(order.totalAmount)} en attente
                </strong>
                <p className="text-xs text-amber-800">
                  Cette commande n’a pas encore été réglée via {paymentLabels[order.paymentMethod] || 'NabooPay'}. Vous pouvez finaliser la transaction en toute sécurité.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="button button-primary button-small flex items-center gap-1.5"
              >
                {retryingPayment ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Payer avec NabooPay</span>
                    <ExternalLink size={13} />
                  </>
                )}
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                  className="button button-outline button-small text-neutral-600 hover:text-red-700"
                >
                  {cancellingOrder ? <Loader2 size={13} className="animate-spin" /> : 'Annuler'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {order.orderStatus === 'CANCELLED' && (
        <section className="account-panel border-red-200 bg-red-50/60 text-sm text-red-800">
          Commande annulée le {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('fr-FR') : '—'}
          {order.cancelReason ? ` — ${order.cancelReason}` : ''}.
        </section>
      )}

      {/* Timeline de statut */}
      <section className="account-panel">
        <div className="order-timeline">
          <div className="complete">
            <span><Check size={14} /></span>
            <b>Commande validée</b>
            <small>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</small>
          </div>
          <div className={['PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'complete' : 'pending'}>
            <span><PackageCheck size={14} /></span>
            <b>Préparation atelier</b>
            <small>{reachedOn('PREPARING') ?? 'En attente'}</small>
          </div>
          <div className={['IN_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? (order.orderStatus === 'DELIVERED' ? 'complete' : 'current') : 'pending'}>
            <span><Truck size={14} /></span>
            <b>En livraison</b>
            <small>{reachedOn('IN_DELIVERY') ?? (order.deliveryMode === 'PICKUP' ? 'Retrait en boutique' : 'À venir')}</small>
          </div>
          <div className={order.orderStatus === 'DELIVERED' ? 'complete' : 'pending'}>
            <span><Check size={14} /></span>
            <b>Livrée</b>
            <small>{reachedOn('DELIVERED') ?? 'En attente'}</small>
          </div>
        </div>
      </section>

      <div className="order-detail-columns">
        {/* Colonne gauche : Articles & Paiement */}
        <div className="space-y-4">
          <section className="account-panel">
            <div className="account-panel-heading">
              <h2>Détail des articles</h2>
              <span className={`order-status ${statusLabels[order.orderStatus]?.class || 'pending'}`}>
                {statusLabels[order.orderStatus]?.label || order.orderStatus}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="order-product">
                  <Image
                    src={it.image || '/images/hero.jpg'}
                    alt={it.productName}
                    width={75}
                    height={75}
                    className="rounded-xl object-cover"
                  />
                  <span>
                    <b>{it.productName}</b>
                    {it.variantName && it.variantName !== 'Standard' && <small className="block text-neutral-500">{it.variantName}</small>}
                    <small>Quantité : {it.quantity}</small>
                    {it.giftWrap && <small className="block text-neutral-500">Emballage cadeau</small>}
                    {it.cardMessage && <small className="block text-neutral-500">Carte : « {it.cardMessage} »</small>}
                  </span>
                  <strong>{formatPrice(it.totalPrice)}</strong>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 mt-4 pt-3 space-y-1.5 text-xs text-neutral-600">
              <div className="recap-line">
                <span>Sous-total articles</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.extrasAmount > 0 && (
                <div className="recap-line">
                  <span>Options cadeau</span>
                  <span>{formatPrice(order.extrasAmount)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="recap-line text-emerald-700">
                  <span>Réduction{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="recap-line">
                <span>
                  {DELIVERY_MODE_LABELS[order.deliveryMode]}
                  {order.deliveryZone ? ` — ${order.deliveryZone.name}` : ''}
                </span>
                <span>{order.deliveryFee === 0 ? 'Offerts' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="recap-line border-t border-neutral-200 pt-2 text-sm font-bold text-neutral-900">
                <span>{order.paymentStatus === 'PAID' ? 'Total réglé' : 'Total commande'}</span>
                <strong className="text-[#173f22] text-base">{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          </section>

          {/* Journal des transactions NabooPay */}
          {payments.length > 0 && (
            <section className="account-panel">
              <div className="account-panel-heading">
                <h3 className="text-sm font-serif font-bold text-neutral-800 flex items-center gap-1.5">
                  <Receipt size={16} className="text-[#173f22]" /> Historique des transactions
                </h3>
              </div>

              <div className="space-y-2 mt-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="border border-neutral-100 rounded-xl p-3 bg-neutral-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-neutral-800">
                          {p.provider === 'NABOOPAY' ? (paymentLabels[p.paymentMethod] || 'NabooPay') : 'Espèces'}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'PAID'
                            ? 'Succès'
                            : p.status === 'FAILED'
                            ? 'Échoué'
                            : 'En attente'}
                        </span>
                      </div>
                      <span className="text-neutral-400 block text-[11px] mt-0.5">
                        Ref : {p.transactionRef || 'En attente de session'} · {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <strong className="text-neutral-900 text-sm">
                      {formatPrice(p.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne droite : Adresse & Modalités */}
        <div className="space-y-4">
          <section className="account-panel">
            <h2 className="flex items-center gap-1.5 text-sm font-serif font-bold mb-3 text-neutral-800">
              <MapPin size={16} className="text-[#173f22]" /> Coordonnées de livraison
            </h2>
            <div className="address-preview text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
              <b className="block text-neutral-900 mb-1">{order.recipientName || order.customerName}</b>
              <p>{order.deliveryMode === 'PICKUP' ? 'Retrait à notre atelier' : order.deliveryAddress}</p>
              {order.recipientPhone && <p className="text-neutral-500 mt-1">Tél : {order.recipientPhone}</p>}
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#173f22]" />
                <span>
                  Date prévue :{' '}
                  <strong>
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString('fr-FR')
                      : 'Non définie'}{' '}
                    {order.timeSlot ? `(${order.timeSlot})` : ''}
                  </strong>
                </span>
              </div>
              {order.notes && (
                <p className="bg-amber-50/50 p-2 rounded-lg text-neutral-600 mt-2">
                  <strong>Instructions :</strong> {order.notes}
                </p>
              )}
            </div>
          </section>

          <section className="account-panel">
            <h2 className="flex items-center gap-1.5 text-sm font-serif font-bold mb-3 text-neutral-800">
              <CreditCard size={16} className="text-[#173f22]" /> Modalités de règlement
            </h2>
            <div className="text-xs text-neutral-600 space-y-2">
              <div className="flex justify-between items-center">
                <span>Méthode choisie :</span>
                <strong>{paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>État du paiement :</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus === 'PAID'
                    ? 'Payé'
                    : order.paymentStatus === 'FAILED'
                    ? 'Échoué'
                    : 'En attente'}
                </span>
              </div>

              {order.paidAt && (
                <div className="flex justify-between items-center border-t border-neutral-100 pt-2 text-[11px]">
                  <span>Date du règlement :</span>
                  <span>{new Date(order.paidAt).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
