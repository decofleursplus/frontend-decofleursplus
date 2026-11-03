'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  X,
  Tag,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';
import { validateCoupon, ValidatedCoupon } from '@/lib/api/marketing';

export default function CartPage() {
  const { items, subtotal, change, remove } = useCart();
  const [promo, setPromo] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restaurer le coupon précédemment validé en session si existant
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('decofleur_applied_coupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch {
      // Ignorer
    }
  }, []);

  const baseDelivery = items.length ? 3000 : 0;
  const isFreeShipping = appliedCoupon?.freeShipping;
  const delivery = isFreeShipping ? 0 : baseDelivery;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + delivery;

  const handleApplyCoupon = async () => {
    const trimmed = promo.trim();
    if (!trimmed) {
      setCouponMessage({ type: 'error', text: 'Veuillez saisir un code promo.' });
      return;
    }

    setLoadingCoupon(true);
    setCouponMessage(null);

    const result = await validateCoupon({
      code: trimmed,
      subtotal,
      deliveryFee: baseDelivery,
    });

    setLoadingCoupon(false);

    if (result.success && result.coupon) {
      setAppliedCoupon(result.coupon);
      setPromo('');
      try {
        sessionStorage.setItem('decofleur_applied_coupon', JSON.stringify(result.coupon));
      } catch {
        // Ignorer
      }
      setCouponMessage({
        type: 'success',
        text: `Code promo "${result.coupon.code}" appliqué avec succès !`,
      });
    } else {
      setCouponMessage({
        type: 'error',
        text: result.error || 'Code promo invalide ou expiré.',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    try {
      sessionStorage.removeItem('decofleur_applied_coupon');
    } catch {
      // Ignorer
    }
  };

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <main className="content-width page-main cart-page">
        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Panier</span>
        </div>

        {items.length > 0 ? (
          <div className="cart-layout">
            <section className="cart-panel">
              <div className="cart-title-row">
                <h1>
                  Mon panier{' '}
                  <span>
                    ({totalItemCount} {totalItemCount === 1 ? 'article' : 'articles'})
                  </span>
                </h1>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => items.forEach((item) => remove(item.lineId))}
                >
                  Vider le panier
                </button>
              </div>

              <div className="cart-list">
                {items.map(({ product, quantity, lineId, options }) => (
                  <article className="cart-item" key={lineId}>
                    <Link href={`/produits/${product.slug}`} className="cart-image">
                      <Image src={product.image} alt={product.name} fill sizes="90px" />
                    </Link>

                    <div className="cart-item-detail">
                      <Link href={`/produits/${product.slug}`}>{product.name}</Link>
                      <span>Taille : {options?.size ?? 'Standard'}</span>
                      <span>Carte cadeau : {options?.cardMessage ? 'Oui' : 'Non'}</span>
                      {options?.giftWrap && <span>Emballage premium : Oui</span>}
                    </div>

                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => change(lineId, quantity - 1)}
                        aria-label="Réduire la quantité"
                      >
                        <Minus size={13} />
                      </button>
                      <b>{quantity}</b>
                      <button
                        type="button"
                        onClick={() => change(lineId, quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <strong>{formatPrice(product.price * quantity)}</strong>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => remove(lineId)}
                      aria-label={`Retirer ${product.name}`}
                    >
                      <X size={16} />
                    </button>
                  </article>
                ))}
              </div>

              {/* Formulaire Code Promo */}
              <div className="promo-form">
                <label htmlFor="promo">Code promo ou bon de réduction</label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Tag size={16} />
                      <div>
                        <strong>{appliedCoupon.code}</strong> —{' '}
                        {appliedCoupon.freeShipping
                          ? 'Livraison offerte'
                          : `-${formatPrice(appliedCoupon.discountAmount)}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      id="promo"
                      placeholder="Ex: DEC015, BIENVENUE..."
                      value={promo}
                      onChange={(event) => setPromo(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="button button-green flex items-center gap-1.5"
                      onClick={handleApplyCoupon}
                      disabled={loadingCoupon}
                    >
                      {loadingCoupon ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Vérification...</span>
                        </>
                      ) : (
                        'Appliquer'
                      )}
                    </button>
                  </div>
                )}

                {couponMessage && (
                  <div
                    className={`mt-2 text-xs flex items-center gap-1.5 ${
                      couponMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {couponMessage.type === 'success' && <CheckCircle2 size={13} />}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>
            </section>

            <aside className="order-summary">
              <h2>Résumé de la commande</h2>

              <div>
                <span>
                  Sous-total ({totalItemCount} {totalItemCount === 1 ? 'article' : 'articles'})
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="text-emerald-700">
                  <span>Remise ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div>
                <span>Frais de livraison</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-medium">Offerte</span>
                  ) : (
                    formatPrice(delivery)
                  )}
                </span>
              </div>

              <div className="delivery-choice">
                <Truck size={18} />
                <span>
                  Livraison à Saly &amp; Mbour
                  <small>{isFreeShipping ? 'Gratuite avec votre code' : 'Rapide (24–48h)'}</small>
                </span>
              </div>

              <div className="summary-total">
                <b>Total</b>
                <strong>{formatPrice(finalTotal)}</strong>
              </div>

              <Link className="button button-primary checkout-button" href="/commande">
                Passer la commande <ArrowRight size={16} />
              </Link>

              <ul className="checkout-perks">
                <li>
                  <Truck /> Livraison rapide
                  <small>à Saly &amp; Mbour</small>
                </li>
                <li>
                  <ShieldCheck /> Paiement sécurisé
                  <small>Wave · Orange Money</small>
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
