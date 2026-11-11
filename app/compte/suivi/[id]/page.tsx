'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Check, Headphones, Home, Loader2, MapPin, Package, Phone, RefreshCw, Truck, UserCheck } from 'lucide-react';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/products';
import {
  getMyOrder,
  getOrderTracking,
  ORDER_STATUS_LABELS,
  type CustomerOrder,
  type DeliveryTracking,
  type DeliveryTrackingStep,
} from '@/lib/api/orders';

const STEP_ICONS: Record<DeliveryTrackingStep['step'], typeof Check> = {
  preparation: Package,
  prise_en_charge: UserCheck,
  en_acheminement: Truck,
  livre: Home,
};

const VEHICLE: Record<string, string> = { MOTO: 'moto', SCOOTER: 'scooter', VAN: 'fourgonnette', CAR: 'voiture' };

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

/** Suivi de livraison : données réelles de la commande et de la livraison, actualisées toutes les minutes. */
export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [o, t] = await Promise.all([getMyOrder(id), getOrderTracking(id)]);
    setOrder(o);
    setTracking(t);
    setError(null);
  }, [id]);

  useEffect(() => {
    let active = true;
    const run = () =>
      load().catch((err) => active && setError(err instanceof Error ? err.message : 'Suivi indisponible.'));
    void run();
    const timer = window.setInterval(run, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Suivi indisponible.'))
      .finally(() => setRefreshing(false));
  };

  if (error && !order) {
    return (
      <div className="account-panel text-center py-12" role="alert">
        <AlertTriangle size={32} className="mx-auto text-amber-600 mb-3" />
        <p className="text-sm text-neutral-700 mb-4">{error}</p>
        <button type="button" onClick={refresh} className="button button-outline inline-flex items-center gap-1.5">
          <RefreshCw size={15} /> Réessayer
        </button>
        <div className="mt-3">
          <Link href="/compte/commandes" className="text-sm underline">
            Retour à mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (!order || !tracking) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 py-10">
        <Loader2 size={18} className="animate-spin" /> Chargement du suivi…
      </div>
    );
  }

  const failed = tracking.deliveryStatus === 'FAILED';
  const delivered = order.orderStatus === 'DELIVERED';
  const scheduled = tracking.scheduledDate
    ? `${new Date(tracking.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${
        tracking.timeSlot ? `, créneau ${tracking.timeSlot}` : ''
      }`
    : null;

  const statusText = delivered
    ? `Livrée le ${time(tracking.deliveredAt) ?? '—'}`
    : order.orderStatus === 'CANCELLED'
      ? 'Commande annulée'
      : failed
        ? 'Le livreur n’a pas pu remettre votre commande'
        : tracking.deliveryStatus === 'IN_PROGRESS'
          ? 'Votre livreur est en route'
          : tracking.driver
            ? 'Un livreur a été assigné à votre commande'
            : ORDER_STATUS_LABELS[order.orderStatus];

  return (
    <div className="track-order-container">
      <nav className="breadcrumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span>›</span>
        <Link href="/compte/commandes">Mes commandes</Link>
        <span>›</span>
        <span>Suivi {order.orderNumber}</span>
      </nav>

      <div className="track-header-row">
        <div>
          <h1 className="account-title">Suivi de commande</h1>
          <p className="order-meta-sub">
            Commande n° <strong>{order.orderNumber}</strong> • Passée le{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="track-header-actions">
          <button type="button" onClick={refresh} disabled={refreshing} className="button-pill-outline button-small">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Actualiser
          </button>
          <Link href="/contact" className="button-pill-outline button-small">
            <Headphones size={15} /> Contacter la boutique
          </Link>
        </div>
      </div>

      <section className="track-stepper-card" aria-label="Étapes de la livraison">
        <div className="stepper-track-line" />
        <div className="stepper-steps-grid">
          <div className="stepper-step completed">
            <div className="step-circle">
              <Check size={16} />
            </div>
            <strong className="step-label">Commande enregistrée</strong>
            <span className="step-time">{time(order.createdAt)}</span>
          </div>
          {tracking.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.step] ?? Check;
            const nextDone = tracking.steps[index + 1]?.completed;
            const state = step.completed ? (nextDone || step.step === 'livre' ? 'completed' : 'active') : 'pending';
            return (
              <div key={step.step} className={`stepper-step ${state}`}>
                <div className="step-circle">
                  <Icon size={16} />
                </div>
                <strong className="step-label">{step.label}</strong>
                <span className="step-time">{time(step.time) ?? (step.completed ? 'Fait' : 'À venir')}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="track-columns-grid">
        <div className="track-left-col space-y-4">
          <section className={`account-panel ${failed ? 'border-red-200 bg-red-50/60' : ''}`}>
            <h2 className="flex items-center gap-2">
              <Truck size={17} /> {statusText}
            </h2>
            {failed && tracking.failureReason && <p className="text-sm text-red-800">Motif : {tracking.failureReason}. Notre équipe vous recontacte pour une nouvelle livraison.</p>}
            {scheduled && !delivered && <p className="text-sm text-neutral-700">Livraison prévue {scheduled}.</p>}
            {tracking.driver && !delivered && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                <div>
                  <strong className="block text-sm">{tracking.driver.name}</strong>
                  <span className="text-xs text-neutral-500">
                    Votre livreur{VEHICLE[tracking.driver.vehicle] ? ` — ${VEHICLE[tracking.driver.vehicle]}` : ''}
                  </span>
                </div>
                <a href={`tel:${tracking.driver.phone}`} className="button-pill-pink button-small">
                  <Phone size={14} /> Appeler
                </a>
              </div>
            )}
            {!tracking.driver && !delivered && order.orderStatus !== 'CANCELLED' && (
              <p className="text-xs text-neutral-500 mt-2">Le nom de votre livreur apparaîtra ici dès son affectation.</p>
            )}
          </section>

          <section className="account-panel">
            <h2 className="flex items-center gap-2">
              <MapPin size={16} /> Adresse de livraison
            </h2>
            <p className="text-sm text-neutral-700">
              {order.recipientName ? `${order.recipientName} — ` : ''}
              {tracking.deliveryAddress}
              {tracking.deliveryZone ? ` (${tracking.deliveryZone.name})` : ''}
            </p>
            {order.recipientPhone && <p className="text-xs text-neutral-500 mt-1">Tél. destinataire : {order.recipientPhone}</p>}
          </section>
        </div>

        <div className="track-right-col">
          <section className="account-panel">
            <h2>Récapitulatif</h2>
            <div className="track-recap-items">
              {order.items.map((it) => (
                <div key={it.id} className="track-recap-item">
                  <Image src={it.image || PRODUCT_PLACEHOLDER_IMAGE} alt={it.productName} width={48} height={48} className="rounded-lg object-cover" />
                  <span className="flex-1 text-xs">
                    <strong className="block">{it.productName}</strong>
                    Quantité : {it.quantity}
                  </span>
                  <strong className="text-xs">{formatPrice(it.totalPrice + it.extrasPrice)}</strong>
                </div>
              ))}
            </div>
            <div className="track-totals-breakdown text-xs space-y-1 mt-3">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal + order.extrasAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Réduction</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{order.deliveryFee === 0 ? 'Offerte' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-neutral-100 pt-2">
                <span>{order.paymentStatus === 'PAID' ? 'Total payé' : 'Total à régler'}</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
            <Link href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}`} className="button button-outline button-small mt-3">
              Voir le détail de la commande
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
