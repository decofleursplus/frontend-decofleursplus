'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  Check,
  LockKeyhole,
  MapPin,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';

type DeliveryMode = 'standard' | 'express';
type PaymentMethod =
  | 'wave'
  | 'orange'
  | 'free'
  | 'card'
  | 'apple'
  | 'google'
  | 'paypal'
  | 'delivery';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [delivery, setDelivery] = useState<DeliveryMode>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('wave');
  const [promo, setPromo] = useState('');
  const [promoFeedback, setPromoFeedback] = useState('');
  const [notice, setNotice] = useState('');

  const shipping = delivery === 'standard' ? 2000 : 5000;

  // Use items in cart, or fallback to mockup default items if cart is empty so user can test and inspect
  const displayItems = items.length > 0 ? items : [
    {
      lineId: 'mock-1',
      product: {
        id: 'bouquet-elegance-rose',
        name: 'Bouquet Élégance Rose',
        price: 25000,
        image: '/images/hero.jpg',
        category: 'Bouquets',
        slug: 'bouquet-elegance-rose',
        description: '',
        tags: [],
        rating: 4.9,
        reviewsCount: 124,
      },
      quantity: 1,
      options: { size: 'Moyen' },
    },
    {
      lineId: 'mock-2',
      product: {
        id: 'carte-cadeau',
        name: 'Carte cadeau',
        price: 2000,
        image: '/images/cadeau.jpg',
        category: 'Cadeaux',
        slug: 'carte-cadeau',
        description: '',
        tags: [],
        rating: 5,
        reviewsCount: 45,
      },
      quantity: 1,
      options: { cardMessage: 'Message personnalisé' },
    },
  ];

  const calculatedSubtotal = items.length > 0
    ? subtotal
    : displayItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const calculatedTotal = calculatedSubtotal + shipping;

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      'Vos informations sont enregistrées avec succès pour cette démonstration. Redirection vers la confirmation...'
    );
  }

  return (
    <>
      <main className="content-width page-main checkout-page">
        {/* Breadcrumb Navigation matching mockup */}
        <nav className="breadcrumbs" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href="/boutique">Nos produits</Link>
          <span>›</span>
          <span>Livraison</span>
          <span>›</span>
          <span>Paiement</span>
        </nav>

        <div className="checkout-heading">
          <h1>Finaliser ma commande</h1>
          <p>Renseignez vos informations pour compléter votre achat en toute sécurité.</p>
        </div>

        <form className="checkout-layout-grid" onSubmit={submitOrder}>
          {/* LEFT COLUMN: Steps 1, 2, 3, 4 */}
          <div className="checkout-steps-column">
            {/* 1. Adresse de livraison */}
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>1. Adresse de livraison</h2>
                <button type="button" className="link-button-pink">
                  Modifier
                </button>
              </div>

              <div className="checkout-saved-address-box">
                <div className="address-box-icon">
                  <MapPin size={20} />
                </div>
                <div className="address-box-body">
                  <div className="address-title-badge">
                    <strong>Maison - Saly</strong>
                    <span className="badge-default">Par défaut</span>
                  </div>
                  <p className="address-lines">
                    Route de Saly, Résidence les Palmiers<br />
                    Saly, Mbour - Sénégal
                  </p>
                </div>
              </div>

              <button type="button" className="button-add-address-outline">
                <Plus size={15} /> Ajouter une nouvelle adresse
              </button>
            </section>

            {/* 2. Mode de livraison with Map Preview */}
            <section className="checkout-panel checkout-step-panel">
              <h2>2. Mode de livraison</h2>

              <div className="checkout-delivery-options-grid">
                <div className="delivery-radio-list">
                  <label
                    className={`delivery-option-card ${delivery === 'standard' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={delivery === 'standard'}
                      onChange={() => setDelivery('standard')}
                    />
                    <div className="delivery-card-content">
                      <div className="delivery-card-title-row">
                        <strong>Livraison Standard</strong>
                        <span className="delivery-price-tag">2 000 FCFA</span>
                      </div>
                      <span className="delivery-card-desc">
                        Livraison standard Saly &amp; Mbour
                      </span>
                      <span className="delivery-area-badge">Saly &amp; Mbour</span>
                    </div>
                  </label>

                  <label
                    className={`delivery-option-card ${delivery === 'express' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={delivery === 'express'}
                      onChange={() => setDelivery('express')}
                    />
                    <div className="delivery-card-content">
                      <div className="delivery-card-title-row">
                        <strong>Livraison Express</strong>
                        <span className="delivery-price-tag">5 000 FCFA</span>
                      </div>
                      <span className="delivery-card-desc">
                        Livraison le jour même Saly &amp; Mbour
                      </span>
                      <span className="delivery-area-badge">Saly &amp; Mbour</span>
                    </div>
                  </label>
                </div>

                {/* Map Graphic with Address Search */}
                <div className="checkout-delivery-map-preview">
                  <div className="map-search-bar">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Rechercher une adresse…"
                      defaultValue="Saly Portudal"
                    />
                  </div>
                  <div className="map-embed-container">
                    <Image
                      src="/images/order-map.jpg"
                      alt="Carte de couverture Saly et Mbour"
                      fill
                      sizes="300px"
                      className="map-embed-img"
                    />
                    <div className="map-user-pin">
                      <MapPin size={16} />
                      <span>Votre adresse</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Date et heure de livraison */}
            <section className="checkout-panel checkout-step-panel">
              <h2>3. Date et heure de livraison</h2>
              <div className="checkout-fields-2col">
                <label className="checkout-field-label">
                  <span>Date de livraison</span>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input type="date" defaultValue="2024-05-10" required />
                  </div>
                </label>

                <label className="checkout-field-label">
                  <span>Créneau horaire</span>
                  <div className="input-with-icon">
                    <Clock size={16} />
                    <select defaultValue="Entre 10h et 14h">
                      <option>Entre 10h et 14h</option>
                      <option>Entre 14h et 18h</option>
                    </select>
                  </div>
                </label>
              </div>
            </section>

            {/* 4. Instructions (optionnel) */}
            <section className="checkout-panel checkout-step-panel">
              <h2>4. Instructions (optionnel)</h2>
              <input
                type="text"
                className="checkout-text-input"
                placeholder="Ex: Laisser à la réception, appeler avant l’arrivée…"
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Step 5 Mode de paiement & Récapitulatif */}
          <div className="checkout-sidebar-column">
            {/* 5. Mode de paiement */}
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>5. Mode de paiement</h2>
                <Link href="/panier" className="link-button-pink">
                  Modifier le panier
                </Link>
              </div>

              <div className="payment-methods-stack">
                {[
                  { id: 'wave', label: 'Wave', badge: 'W' },
                  { id: 'orange', label: 'Orange Money', badge: 'OM' },
                  { id: 'free', label: 'Free Money', badge: 'FM' },
                  { id: 'card', label: 'Carte bancaire (Visa, Mastercard)', badge: 'VISA' },
                  { id: 'apple', label: 'Apple Pay', badge: '' },
                  { id: 'google', label: 'Google Pay', badge: 'G' },
                  { id: 'paypal', label: 'PayPal', badge: 'P' },
                  { id: 'delivery', label: 'Paiement à la livraison', sub: 'Espèces uniquement' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`payment-method-row ${payment === item.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={item.id}
                      checked={payment === item.id}
                      onChange={() => setPayment(item.id as PaymentMethod)}
                    />
                    <span className={`payment-logo-badge ${item.id}`}>
                      {item.badge ?? '•'}
                    </span>
                    <div className="payment-label-meta">
                      <strong>{item.label}</strong>
                      {item.sub && <small>{item.sub}</small>}
                    </div>
                    {payment === item.id && (
                      <Check size={16} className="payment-check-mark" />
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* Récapitulatif de la commande */}
            <aside className="checkout-panel checkout-recap-panel">
              <h2>Récapitulatif de la commande</h2>

              <div className="recap-products-list">
                {displayItems.map(({ product, quantity, lineId, options }) => (
                  <div key={lineId} className="recap-product-row">
                    <div className="recap-product-thumb">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="recap-thumb-img"
                      />
                    </div>
                    <div className="recap-product-info">
                      <strong>{product.name}</strong>
                      <span className="recap-product-meta">
                        {options?.size && `Taille : ${options.size} • `}
                        {options?.cardMessage && 'Message personnalisé • '}
                        Quantité : {quantity}
                      </span>
                    </div>
                    <strong className="recap-product-price">
                      {formatPrice(product.price * quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="recap-totals-breakdown">
                <div className="recap-row">
                  <span>Sous-total</span>
                  <strong>{formatPrice(calculatedSubtotal)}</strong>
                </div>
                <div className="recap-row">
                  <span>Livraison ({delivery === 'standard' ? 'Standard' : 'Express'})</span>
                  <strong>{formatPrice(shipping)}</strong>
                </div>
                <div className="recap-row total-row">
                  <span>Total</span>
                  <strong className="pink-total-highlight">
                    {formatPrice(calculatedTotal)}
                  </strong>
                </div>
              </div>

              {/* Code Promo */}
              <div className="checkout-promo-box">
                <label htmlFor="promoInput" className="visually-hidden">Code promo</label>
                <input
                  id="promoInput"
                  placeholder="Entrer votre code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="promo-input-field"
                />
                <button
                  type="button"
                  className="button-pill-pink button-small"
                  onClick={() =>
                    setPromoFeedback(
                      promo
                        ? 'Code promo GOLD15 appliqué (-15% de réduction) !'
                        : 'Veuillez saisir un code promo.'
                    )
                  }
                >
                  Appliquer
                </button>
              </div>
              {promoFeedback && (
                <p className="promo-feedback-note" role="status">
                  {promoFeedback}
                </p>
              )}

              {/* Terms Checkbox */}
              <label className="terms-checkbox-label">
                <input type="checkbox" required defaultChecked />
                <span>
                  J’accepte les{' '}
                  <Link href="/conditions">Conditions Générales de Vente</Link> et la{' '}
                  <Link href="/confidentialite">Politique de confidentialité</Link>.
                </span>
              </label>

              {/* Payer Maintenant Button */}
              <button type="submit" className="button-pill-pink button-pay-now">
                <LockKeyhole size={17} /> Payer maintenant
              </button>

              {/* Security Trust Note */}
              <div className="checkout-security-guarantee">
                <ShieldCheck size={18} color="#15803D" />
                <div>
                  <strong>Paiement 100% sécurisé</strong>
                  <p>Vos informations de paiement sont cryptées et sécurisées.</p>
                </div>
              </div>

              {notice && (
                <p className="checkout-submit-notice" role="status">
                  {notice}{' '}
                  <Link href="/commande/confirmation">
                    Voir la confirmation de commande →
                  </Link>
                </p>
              )}
            </aside>
          </div>
        </form>
      </main>

      <SiteFooter />
    </>
  );
}
