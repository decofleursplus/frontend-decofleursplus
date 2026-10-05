'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  UserRound,
  Mail,
  Phone,
  UserCheck,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { GoogleIcon } from '@/components/icons';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';

type DeliveryMode = 'standard' | 'express';
type PaymentMethod =
  | 'wave'
  | 'orange'
  | 'free'
  | 'card';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { user, isAuthenticated, login, loginWithGoogle, register, logout } = useAuth();
  const router = useRouter();

  const [delivery, setDelivery] = useState<DeliveryMode>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('wave');
  const [notice, setNotice] = useState('');

  // Step 1: Auth state
  const [isEditingAuth, setIsEditingAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('auth');
    }
    return false;
  });
  const [authTab, setAuthTab] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'register') return 'register';
    }
    return 'login';
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('+221 77 123 45 67');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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

  async function handleGoogleLogin() {
    setAuthLoading(true);
    setAuthError('');
    await loginWithGoogle();
    setIsEditingAuth(false);
    setAuthLoading(false);
  }

  async function handleEmailLogin() {
    if (!authEmail.trim()) {
      setAuthError('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    await login(authEmail, authPassword);
    setIsEditingAuth(false);
    setAuthLoading(false);
  }

  async function handleRegister() {
    if (!authName.trim() || !authEmail.trim() || !authPhone.trim()) {
      setAuthError('Veuillez renseigner votre nom, e-mail et numéro de téléphone.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    await register({
      name: authName,
      email: authEmail,
      phone: authPhone,
      password: authPassword,
    });
    setIsEditingAuth(false);
    setAuthLoading(false);
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      setIsEditingAuth(true);
      setNotice(
        'Veuillez vous identifier ou créer votre compte à l’étape 1 avant de finaliser la commande.'
      );
      return;
    }
    router.push('/commande/confirmation');
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
          {/* LEFT COLUMN: Steps 1, 2, 3, 4, 5 */}
          <div className="checkout-steps-column">
            {/* 1. Identification & Compte Client */}
            {isAuthenticated && !isEditingAuth ? (
              <section className="checkout-panel checkout-step-panel checkout-step-verified">
                <div className="step-panel-heading">
                  <div className="step-heading-left">
                    <div className="step-badge-check" aria-label="Étape validée">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <h2>1. Identification &amp; Compte client</h2>
                  </div>
                  <div className="auth-step-actions-row">
                    <button
                      type="button"
                      className="link-button-pink"
                      onClick={() => setIsEditingAuth(true)}
                    >
                      Changer de compte
                    </button>
                    <span className="bullet-sep">•</span>
                    <button
                      type="button"
                      className="link-button-muted"
                      onClick={() => {
                        logout();
                        setIsEditingAuth(true);
                      }}
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>

                <div className="checkout-auth-verified-card">
                  <div className="auth-avatar-circle">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'FB'}
                  </div>
                  <div className="auth-verified-info">
                    <div className="auth-verified-name-row">
                      <strong>{user?.name}</strong>
                      <span className="badge-verified-client">
                        <UserCheck size={12} /> Compte vérifié
                      </span>
                    </div>
                    <p className="auth-verified-contact">
                      <span>{user?.email}</span>
                      {user?.phone && (
                        <>
                          <span className="bullet-sep">•</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="checkout-panel checkout-step-panel checkout-step-active">
                <div className="step-panel-heading">
                  <div className="step-heading-left">
                    <span className="step-num-badge">1</span>
                    <h2>1. Identification &amp; Compte client</h2>
                  </div>
                  {isAuthenticated && (
                    <button
                      type="button"
                      className="link-button-pink"
                      onClick={() => setIsEditingAuth(false)}
                    >
                      Conserver {user?.name?.split(' ')[0]}
                    </button>
                  )}
                </div>

                <p className="step-panel-intro">
                  Connectez-vous ou créez votre compte client pour cumuler vos points fidélité et suivre votre livraison en temps réel.
                </p>

                {/* Segmented Switcher */}
                <div className="checkout-auth-tabs">
                  <button
                    type="button"
                    className={`checkout-auth-tab ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError('');
                    }}
                  >
                    <UserRound size={15} /> J’ai déjà un compte (Connexion)
                  </button>
                  <button
                    type="button"
                    className={`checkout-auth-tab ${authTab === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError('');
                    }}
                  >
                    <Plus size={15} /> Nouveau client (Créer un compte)
                  </button>
                </div>

                {/* Prominent Google Quick Login */}
                <div className="checkout-google-row">
                  <button
                    type="button"
                    className="btn-google-auth"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                  >
                    <GoogleIcon size={20} />
                    <span>
                      {authTab === 'login'
                        ? 'Se connecter avec Google'
                        : "S'inscrire rapidement avec Google"}
                    </span>
                  </button>
                </div>

                <div className="auth-separator">
                  <span>ou avec votre adresse e-mail</span>
                </div>

                {authTab === 'login' ? (
                  <div className="checkout-auth-fields">
                    <div className="form-group">
                      <label htmlFor="chk-email">
                        <Mail size={13} /> Adresse e-mail
                      </label>
                      <input
                        id="chk-email"
                        type="email"
                        placeholder="ex. fatou.ba@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="chk-pwd">
                        <LockKeyhole size={13} /> Mot de passe
                      </label>
                      <input
                        id="chk-pwd"
                        type="password"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                      />
                    </div>

                    <div className="checkout-auth-actions">
                      <button
                        type="button"
                        className="button-pill-pink button-small"
                        onClick={handleEmailLogin}
                        disabled={authLoading}
                      >
                        Se connecter et continuer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="checkout-auth-fields">
                    <div className="checkout-auth-row-2">
                      <div className="form-group">
                        <label htmlFor="chk-reg-name">
                          <UserRound size={13} /> Nom complet
                        </label>
                        <input
                          id="chk-reg-name"
                          type="text"
                          placeholder="ex. Fatou Ba"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="chk-reg-phone">
                          <Phone size={13} /> Téléphone (Sénégal)
                        </label>
                        <input
                          id="chk-reg-phone"
                          type="tel"
                          placeholder="+221 77 123 45 67"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="checkout-auth-row-2">
                      <div className="form-group">
                        <label htmlFor="chk-reg-email">
                          <Mail size={13} /> Adresse e-mail
                        </label>
                        <input
                          id="chk-reg-email"
                          type="email"
                          placeholder="ex. fatou.ba@email.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="chk-reg-pwd">
                          <LockKeyhole size={13} /> Mot de passe (min. 8 car.)
                        </label>
                        <input
                          id="chk-reg-pwd"
                          type="password"
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="auth-terms-small">
                      <input type="checkbox" defaultChecked />
                      <span>
                        J’accepte la création de mon compte client Décofleur Plus et la politique de confidentialité.
                      </span>
                    </label>

                    <div className="checkout-auth-actions">
                      <button
                        type="button"
                        className="button-pill-pink button-small"
                        onClick={handleRegister}
                        disabled={authLoading}
                      >
                        Créer mon compte et continuer
                      </button>
                    </div>
                  </div>
                )}

                {authError && <p className="auth-error-badge">{authError}</p>}
              </section>
            )}

            {/* 2. Adresse de livraison */}
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>2. Adresse de livraison</h2>
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

            {/* 3. Mode de livraison with Map Preview */}
            <section className="checkout-panel checkout-step-panel">
              <h2>3. Mode de livraison</h2>

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
                      placeholder="Rechercher une adresse..."
                      defaultValue="Saly Portudal"
                      readOnly
                    />
                  </div>
                  <div className="map-embed-container">
                    <Image
                      src="/images/order-map.jpg"
                      alt="Carte de livraison Saly & Mbour"
                      fill
                      className="map-embed-img"
                    />
                    <div className="map-user-pin">
                      <MapPin size={13} />
                      <span>Votre adresse</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Date et heure de livraison */}
            <section className="checkout-panel checkout-step-panel">
              <h2>4. Date et heure de livraison</h2>
              <div className="delivery-datetime-grid">
                <div className="datetime-field">
                  <label htmlFor="deliveryDate">
                    <Calendar size={15} /> Date de livraison
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    defaultValue="2024-05-10"
                    className="datetime-input"
                  />
                </div>
                <div className="datetime-field">
                  <label htmlFor="deliverySlot">
                    <Clock size={15} /> Créneau horaire
                  </label>
                  <select id="deliverySlot" defaultValue="10h-14h" className="datetime-select">
                    <option value="9h-12h">Matinée (09h00 - 12h00)</option>
                    <option value="10h-14h">Entre 10h et 14h (Recommandé)</option>
                    <option value="14h-18h">Après-midi (14h00 - 18h00)</option>
                    <option value="18h-20h">Soirée (18h00 - 20h00)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 5. Instructions (optionnel) */}
            <section className="checkout-panel checkout-step-panel">
              <h2>5. Instructions (optionnel)</h2>
              <textarea
                rows={3}
                placeholder="Ex: Laisser à la réception, appeler avant l’arrivée, message pour le portail..."
                className="checkout-instructions-textarea"
                defaultValue="Ex: Laisser à la réception, appeler avant l'arrivée..."
              />
            </section>
          </div>

          {/* RIGHT COLUMN: 6. Mode de paiement + Récapitulatif */}
          <div className="checkout-summary-column">
            {/* 6. Mode de paiement */}
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>6. Mode de paiement</h2>
                <button type="button" className="link-button-pink">
                  Modifier le panier
                </button>
              </div>

              <div className="checkout-payment-methods-list">
                {/* Wave */}
                <label className={`payment-method-row ${payment === 'wave' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wave"
                    checked={payment === 'wave'}
                    onChange={() => setPayment('wave')}
                  />
                  <div className="payment-brand-badge wave">
                    <Image src="/payment/wave.png" alt="" width={22} height={32} />
                  </div>
                  <strong>Wave</strong>
                </label>

                {/* Orange Money */}
                <label className={`payment-method-row ${payment === 'orange' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="orange"
                    checked={payment === 'orange'}
                    onChange={() => setPayment('orange')}
                  />
                  <div className="payment-brand-badge orange">
                    <Image src="/payment/orange-money.svg" alt="" width={28} height={28} />
                  </div>
                  <strong>Orange Money</strong>
                </label>

                {/* Free Money */}
                <label className={`payment-method-row ${payment === 'free' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="free"
                    checked={payment === 'free'}
                    onChange={() => setPayment('free')}
                  />
                  <div className="payment-brand-badge free">
                    <Image src="/payment/free-money.png" alt="" width={42} height={32} />
                  </div>
                  <strong>Free Money</strong>
                </label>

                {/* Carte bancaire */}
                <label className={`payment-method-row ${payment === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={payment === 'card'}
                    onChange={() => setPayment('card')}
                  />
                  <div className="payment-brand-badge card">
                    <Image src="/payment/visa.svg" alt="Visa" width={27} height={18} />
                    <Image src="/payment/mastercard.svg" alt="Mastercard" width={24} height={18} />
                  </div>
                  <div className="payment-method-text">
                    <strong>Carte bancaire</strong>
                    <span className="payment-subtext">Visa, Mastercard</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Récapitulatif de la commande */}
            <aside className="checkout-panel checkout-order-summary">
              <h2>Récapitulatif de la commande</h2>

              {/* Items List */}
              <div className="checkout-items-list">
                {displayItems.map((item) => (
                  <div key={item.lineId} className="checkout-item-row">
                    <div className="checkout-item-thumb">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="item-thumb-img"
                      />
                    </div>
                    <div className="checkout-item-info">
                      <strong>{item.product.name}</strong>
                      <span className="item-meta-desc">
                        {item.options?.size && <span>Taille : {item.options.size}</span>}
                        {item.options?.cardMessage && <span>Message : {item.options.cardMessage}</span>}
                      </span>
                      <div className="checkout-item-footer">
                        <span className="item-qty-tag">Quantité : {item.quantity}</span>
                        <strong className="item-price-tag">
                          {formatPrice(item.product.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="checkout-cost-breakdown">
                <div className="cost-row">
                  <span>Sous-total</span>
                  <span>{formatPrice(calculatedSubtotal)}</span>
                </div>
                <div className="cost-row">
                  <span>Livraison ({delivery === 'standard' ? 'Saly' : 'Express'})</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="cost-row total-row">
                  <strong>Total</strong>
                  <strong className="total-amount-highlight">
                    {formatPrice(calculatedTotal)}
                  </strong>
                </div>
              </div>

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
                  {notice}
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
