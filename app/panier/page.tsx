'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gift,
  Loader2,
  MessageSquareText,
  Minus,
  Plus,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { formatPrice } from '@/lib/products';
import { getDeliveryZones, type DeliveryZone } from '@/lib/api/orders';
import { useCartQuote, useCheckoutPrefs } from '@/lib/hooks/use-cart-quote';
import { usePublicSettings } from '@/lib/hooks/use-public-settings';

export default function CartPage() {
  const { items, count, change, remove, clear, updateOptions, droppedLegacyLines, acknowledgeDroppedLines } = useCart();
  const { isAuthenticated } = useAuth();
  const { settings } = usePublicSettings();
  const { prefs, ready, update } = useCheckoutPrefs();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [promo, setPromo] = useState('');

  useEffect(() => {
    getDeliveryZones()
      .then(setZones)
      .catch((err) => setZonesError(err instanceof Error ? err.message : 'Zones de livraison indisponibles.'));
  }, []);

  // Sans zone choisie, on chiffre comme un retrait en boutique (livraison affichée « selon la zone »)
  const zoneChosen = prefs.deliveryMode === 'PICKUP' || Boolean(prefs.deliveryZoneId);
  const { quote, loading, error, lineProblems, couponError } = useCartQuote({
    lines: items,
    deliveryMode: zoneChosen ? prefs.deliveryMode : 'PICKUP',
    deliveryZoneId: prefs.deliveryZoneId || undefined,
    couponCode: prefs.couponCode || undefined,
    enabled: ready,
  });

  const zone = zones.find((z) => z.id === prefs.deliveryZoneId) ?? null;
  const hasProblems = Object.keys(lineProblems).length > 0;
  const quotedLine = (variantId: string) => quote?.items.find((q) => q.variantId === variantId);

  const applyPromo = () => {
    if (!promo.trim()) return;
    update({ couponCode: promo.trim().toUpperCase() });
    setPromo('');
  };

  return (
    <>
      <main className="content-width page-main cart-page">
        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Panier</span>
        </div>

        {droppedLegacyLines > 0 && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
            <span>
              {droppedLegacyLines} article{droppedLegacyLines > 1 ? 's' : ''} d’un ancien panier n’ont pas pu être repris
              (format obsolète). Merci de les ajouter à nouveau depuis la boutique.
            </span>
            <button type="button" onClick={acknowledgeDroppedLines} aria-label="Fermer" className="shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {items.length > 0 ? (
          <div className="cart-layout">
            <section className="cart-panel">
              <div className="cart-title-row">
                <h1>
                  Mon panier{' '}
                  <span>
                    ({count} {count === 1 ? 'article' : 'articles'})
                  </span>
                </h1>
                <button type="button" className="text-action" onClick={clear}>
                  Vider le panier
                </button>
              </div>

              <div className="cart-list">
                {items.map((line) => {
                  const quoted = quotedLine(line.variantId);
                  const problem = lineProblems[line.variantId];
                  const unitPrice = quoted?.unitPrice ?? line.unitPrice;
                  return (
                    <article className="cart-item" key={line.lineId}>
                      <Link href={line.slug ? `/produits/${line.slug}` : '/boutique'} className="cart-image">
                        <Image src={line.image} alt={line.name} fill sizes="90px" />
                      </Link>

                      <div className="cart-item-detail">
                        {line.slug ? <Link href={`/produits/${line.slug}`}>{line.name}</Link> : <strong>{line.name}</strong>}
                        {line.variantName && line.variantName !== 'Standard' && <span>Taille : {line.variantName}</span>}
                        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={line.giftWrap}
                            onChange={(e) => updateOptions(line.lineId, { giftWrap: e.target.checked })}
                          />
                          <Gift size={12} /> Emballage cadeau
                          {settings && <> (+{formatPrice(settings.orderOptions.giftWrapFee)})</>}
                        </label>
                        {line.cardMessage && (
                          <span className="inline-flex items-center gap-1">
                            <MessageSquareText size={12} /> Carte : « {line.cardMessage.slice(0, 40)}
                            {line.cardMessage.length > 40 ? '…' : ''} »
                          </span>
                        )}
                        {quoted?.originalUnitPrice && (
                          <span className="text-rose-700">
                            Promo : {formatPrice(quoted.unitPrice)} au lieu de {formatPrice(quoted.originalUnitPrice)}
                          </span>
                        )}
                        {problem && (
                          <span className="text-red-700 font-semibold inline-flex items-center gap-1" role="alert">
                            <AlertTriangle size={12} /> {problem.message}
                            {problem.available !== undefined && problem.available > 0 && (
                              <button type="button" className="underline" onClick={() => change(line.lineId, problem.available!)}>
                                Ajuster à {problem.available}
                              </button>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="quantity-stepper">
                        <button type="button" onClick={() => change(line.lineId, line.quantity - 1)} aria-label="Réduire la quantité">
                          <Minus size={13} />
                        </button>
                        <b>{line.quantity}</b>
                        <button
                          type="button"
                          onClick={() => change(line.lineId, line.quantity + 1)}
                          disabled={line.quantity >= line.maxQuantity}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <strong>{formatPrice(quoted ? quoted.totalPrice + quoted.extrasPrice : unitPrice * line.quantity)}</strong>

                      <button type="button" className="remove-item" onClick={() => remove(line.lineId)} aria-label={`Retirer ${line.name}`}>
                        <X size={16} />
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="promo-form">
                <label htmlFor="promo">Code promo</label>
                {prefs.couponCode && !couponError ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Tag size={16} />
                      <div>
                        <strong>{prefs.couponCode}</strong>
                        {quote?.appliedCoupon &&
                          ` — ${quote.appliedCoupon.freeShipping ? 'livraison offerte' : `−${formatPrice(quote.appliedCoupon.discountAmount)}`}`}
                      </div>
                    </div>
                    <button type="button" onClick={() => update({ couponCode: '' })} className="text-xs text-red-600 underline font-medium">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      id="promo"
                      placeholder="Votre code"
                      value={promo}
                      onChange={(event) => setPromo(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyPromo();
                        }
                      }}
                    />
                    <button type="button" className="button button-green" onClick={applyPromo} disabled={!promo.trim()}>
                      Appliquer
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="mt-2 text-xs flex items-center justify-between gap-2 text-red-600" role="alert">
                    <span>
                      « {prefs.couponCode} » : {couponError}
                    </span>
                    <button type="button" className="underline" onClick={() => update({ couponCode: '' })}>
                      Retirer
                    </button>
                  </div>
                )}
                {quote?.appliedCoupon && !couponError && (
                  <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={13} /> Code appliqué
                  </div>
                )}
              </div>
            </section>

            <aside className="order-summary" aria-busy={loading}>
              <h2>Résumé de la commande</h2>

              <div className="delivery-choice" style={{ display: 'grid', gap: 8 }}>
                <span className="text-xs font-semibold">Livraison</span>
                <div className="flex gap-2 flex-wrap text-xs">
                  {(
                    [
                      ['STANDARD', 'Standard', Truck],
                      ['EXPRESS', 'Express', Truck],
                      ['PICKUP', 'Retrait boutique', Store],
                    ] as const
                  ).map(([mode, label, Icon]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => update({ deliveryMode: mode })}
                      aria-pressed={prefs.deliveryMode === mode}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border ${
                        prefs.deliveryMode === mode ? 'border-[var(--pink)] text-[var(--pink)] bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
                {prefs.deliveryMode !== 'PICKUP' &&
                  (zonesError ? (
                    <small className="text-red-600">{zonesError}</small>
                  ) : (
                    <select
                      aria-label="Zone de livraison"
                      value={prefs.deliveryZoneId}
                      onChange={(e) => update({ deliveryZoneId: e.target.value })}
                      className="h-9 rounded-md border border-gray-300 px-2 text-sm"
                    >
                      <option value="">Choisir votre zone…</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {formatPrice(prefs.deliveryMode === 'EXPRESS' ? z.expressFee : z.fee)}
                        </option>
                      ))}
                    </select>
                  ))}
                {zone && prefs.deliveryMode === 'STANDARD' && zone.freeAbove && (
                  <small className="text-gray-500">Offerte dès {formatPrice(zone.freeAbove)} d’achat.</small>
                )}
              </div>

              {quote ? (
                <>
                  <div>
                    <span>Sous-total</span>
                    <span>{formatPrice(quote.subtotal)}</span>
                  </div>
                  {quote.extrasAmount > 0 && (
                    <div>
                      <span>Options cadeau</span>
                      <span>{formatPrice(quote.extrasAmount)}</span>
                    </div>
                  )}
                  {quote.discountAmount > 0 && (
                    <div className="text-emerald-700">
                      <span>Remise {quote.appliedCoupon?.code}</span>
                      <span>−{formatPrice(quote.discountAmount)}</span>
                    </div>
                  )}
                  <div>
                    <span>Livraison</span>
                    <span>
                      {!zoneChosen ? (
                        <span className="text-gray-500">Selon la zone</span>
                      ) : quote.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-medium">{prefs.deliveryMode === 'PICKUP' ? 'Retrait gratuit' : 'Offerte'}</span>
                      ) : (
                        formatPrice(quote.deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="summary-total">
                    <b>Total{!zoneChosen ? ' (hors livraison)' : ''}</b>
                    <strong>{formatPrice(quote.totalAmount)}</strong>
                  </div>
                </>
              ) : loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 size={16} className="animate-spin" /> Calcul des montants…
                </div>
              ) : hasProblems ? (
                <p className="text-sm text-red-700 py-2">Corrigez les articles signalés pour afficher le total.</p>
              ) : error ? (
                <p className="text-sm text-red-700 py-2" role="alert">
                  {error}
                </p>
              ) : null}

              {hasProblems || !quote ? (
                <span className="button button-primary checkout-button opacity-50 cursor-not-allowed" aria-disabled="true">
                  Passer la commande <ArrowRight size={16} />
                </span>
              ) : (
                <Link className="button button-primary checkout-button" href={isAuthenticated ? '/commande' : '/connexion?redirect=/commande'}>
                  Passer la commande <ArrowRight size={16} />
                </Link>
              )}

              <ul className="checkout-perks">
                <li>
                  <Truck /> Livraison ou retrait
                  <small>{zones.length > 0 ? zones.map((z) => z.name).join(' · ') : 'Selon votre zone'}</small>
                </li>
                <li>
                  <ShieldCheck /> Montants vérifiés
                  <small>Calculés par nos serveurs</small>
                </li>
              </ul>
            </aside>
          </div>
        ) : (
          <section className="cart-empty">
            <div className="empty-cart-icon">
              <Truck size={30} />
            </div>
            <h1>Votre panier est vide</h1>
            <p>Découvrez nos bouquets et attentions florales pour trouver le cadeau parfait.</p>
            <Link className="button button-primary" href="/boutique">
              Découvrir la boutique <ArrowRight size={16} />
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
