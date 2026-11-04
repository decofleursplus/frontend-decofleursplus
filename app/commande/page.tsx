'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { GoogleIcon } from '@/components/icons';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';
import { getDeliveryZones, DeliveryZone, placeOrder, PlaceOrderPayload } from '@/lib/api/orders';
import { getCustomerAddresses, CustomerAddress } from '@/lib/api/customer';
import { ValidatedCoupon } from '@/lib/api/marketing';

type DeliveryMode = 'standard' | 'express';
type PaymentMethod = 'wave' | 'orange' | 'free' | 'card';

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, isAuthenticated, login, loginWithGoogle, register, logout } = useAuth();
  const router = useRouter();

  const [delivery, setDelivery] = useState<DeliveryMode>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('wave');
  const [notice, setNotice] = useState('');
  const [orderError, setOrderError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Données dynamiques de livraison & adresses
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [customAddress, setCustomAddress] = useState('Route de Saly, Résidence les Palmiers, Saly');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState<'9h-12h' | '10h-14h' | '14h-18h' | '18h-20h'>('10h-14h');
  const [instructions, setInstructions] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);

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

  // Charger les zones et les adresses sur montage
  useEffect(() => {
    getDeliveryZones()
      .then((data) => {
        if (data && data.length > 0) {
          setZones(data);
          setSelectedZoneId(data[0].id);
        }
      })
      .catch(() => {
        // Ignorer
      });

    try {
      const savedCoupon = sessionStorage.getItem('decofleur_applied_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // Ignorer
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getCustomerAddresses()
        .then((addrs) => {
          if (addrs && addrs.length > 0) {
            setAddresses(addrs);
            const def = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(def.id);
            setCustomAddress(`${def.street}, ${def.city}`);
          }
        })
        .catch(() => {
          // Ignorer
        });
    }
  }, [isAuthenticated]);

  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const baseShippingFee = selectedZone
    ? delivery === 'express'
      ? selectedZone.expressFee
      : selectedZone.fee
    : delivery === 'standard'
    ? 2000
    : 5000;

  const isFreeShipping = appliedCoupon?.freeShipping || false;
  const shipping = isFreeShipping ? 0 : baseShippingFee;

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

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount) + shipping;

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

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setOrderError('');

    if (!isAuthenticated) {
      setIsEditingAuth(true);
      setNotice(
        'Veuillez vous identifier ou créer votre compte à l’étape 1 avant de finaliser la commande.'
      );
      return;
    }

    setSubmittingOrder(true);

    const paymentMap: Record<PaymentMethod, 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARD'> = {
      wave: 'WAVE',
      orange: 'ORANGE_MONEY',
      free: 'FREE_MONEY',
      card: 'CARD',
    };

    // Mappage des items du panier vers le format attendu par le backend
    // UUID v4 regex pour vérifier si l'identifiant est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const cartSource = items.length > 0 ? items : displayItems;
    const mappedItems = cartSource.map((item) => {
      let variantId = '00000000-0000-0000-0000-000000000001';
      const p = item.product as any;
      if (p.variants && p.variants.length > 0 && uuidRegex.test(p.variants[0].id)) {
        variantId = p.variants[0].id;
      } else if (uuidRegex.test(item.product.id)) {
        variantId = item.product.id;
      }

      return {
        variantId,
        quantity: item.quantity,
        giftWrap: Boolean((item.options as any)?.giftWrap),
        cardMessage: (item.options as any)?.cardMessage || undefined,
      };
    });

    const payload: PlaceOrderPayload = {
      items: mappedItems,
      deliveryMode: delivery === 'express' ? 'EXPRESS' : 'STANDARD',
      deliveryZoneId: selectedZoneId || undefined,
      paymentMethod: paymentMap[payment] || 'WAVE',
      recipientName: user?.name || undefined,
      phone: user?.phone || undefined,
      deliveryAddress: customAddress,
      deliveryDate: deliveryDate || undefined,
      timeSlot: deliverySlot,
      notes: instructions || undefined,
      couponCode: appliedCoupon?.code || undefined,
    };

    const res = await placeOrder(payload);
    setSubmittingOrder(false);

    if (res.success && res.order) {
      // Vider le panier et nettoyer la session de coupon
      clear();
      try {
        sessionStorage.removeItem('decofleur_applied_coupon');
      } catch {
        // Ignorer
      }

      // Si NabooPay fournit une URL directe de paiement mobile money / carte
      if (res.order.checkoutUrl) {
        window.location.href = res.order.checkoutUrl;
      } else {
        router.push(`/commande/confirmation?orderNumber=${res.order.orderNumber}`);
      }
    } else {
      setOrderError(
        res.error ||
          'Une erreur est survenue lors de la création de la commande. Veuillez vérifier vos coordonnées.'
      );
    }
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

        {orderError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong>Impossible de finaliser la commande</strong>
              <p className="mt-0.5">{orderError}</p>
            </div>
          </div>
        )}

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
                {addresses.length > 0 && (
                  <Link href="/compte/adresses" className="link-button-pink">
                    Gérer mes adresses
                  </Link>
                )}
              </div>

              {addresses.length > 0 ? (
                <div className="grid gap-2 mb-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`checkout-saved-address-box cursor-pointer border rounded-xl p-3 flex items-start gap-3 transition-colors ${
                        selectedAddressId === addr.id ? 'border-[#173f22] bg-[#173f22]/5' : 'border-neutral-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setCustomAddress(`${addr.street}, ${addr.city}`);
                        }}
                        className="mt-1"
                      />
                      <div className="address-box-body flex-1">
                        <div className="address-title-badge flex items-center justify-between">
                          <strong>{addr.name}</strong>
                          {addr.isDefault && <span className="badge-default">Par défaut</span>}
                        </div>
                        <p className="address-lines text-xs text-neutral-600 mt-0.5">
                          {addr.street} · {addr.city}
                          {addr.phone && ` · ${addr.phone}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="checkout-saved-address-box">
                  <div className="address-box-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="address-box-body">
                    <div className="address-title-badge">
                      <strong>Adresse de livraison</strong>
                    </div>
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="Rue, quartier, résidence, villa..."
                      className="form-input mt-2 text-sm w-full"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 3. Mode & Zone de livraison */}
            <section className="checkout-panel checkout-step-panel">
              <h2>3. Mode et zone de livraison</h2>

              {zones.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="deliveryZone" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Sélectionnez votre zone géographique :
                  </label>
                  <select
                    id="deliveryZone"
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="form-input form-select text-sm w-full"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {formatPrice(delivery === 'express' ? z.expressFee : z.fee)}{' '}
                        {z.coverage ? `(${z.coverage})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                        <span className="delivery-price-tag">
                          {isFreeShipping ? 'Offerte' : formatPrice(selectedZone?.fee ?? 2000)}
                        </span>
                      </div>
                      <span className="delivery-card-desc">
                        Livraison en 24h-48h à {selectedZone?.name ?? 'Saly & Mbour'}
                      </span>
                      <span className="delivery-area-badge">{selectedZone?.name ?? 'Saly & Mbour'}</span>
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
                        <span className="delivery-price-tag">
                          {formatPrice(selectedZone?.expressFee ?? 5000)}
                        </span>
                      </div>
                      <span className="delivery-card-desc">
                        Livraison prioritaire le jour même
                      </span>
                      <span className="delivery-area-badge">Express prioritaire</span>
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
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
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
                      <span>{selectedZone?.name ?? 'Votre adresse'}</span>
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
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="datetime-input"
                  />
                </div>
                <div className="datetime-field">
                  <label htmlFor="deliverySlot">
                    <Clock size={15} /> Créneau horaire
                  </label>
                  <select
                    id="deliverySlot"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value as any)}
                    className="datetime-select"
                  >
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
              <h2>5. Instructions de livraison (optionnel)</h2>
              <textarea
                rows={3}
                placeholder="Ex: Laisser à la réception, appeler avant l’arrivée, message pour le portail..."
                className="checkout-instructions-textarea"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: 6. Mode de paiement + Récapitulatif */}
          <div className="checkout-summary-column">
            {/* 6. Mode de paiement */}
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>6. Mode de paiement sécurisé</h2>
                <Link href="/panier" className="link-button-pink">
                  Modifier le panier
                </Link>
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
                    <Image src="/payment/wave.png" alt="Paiement Wave Sénégal" width={22} height={32} />
                  </div>
                  <strong>Wave Sénégal</strong>
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
                    <Image src="/payment/orange-money.svg" alt="Paiement Orange Money Sénégal" width={28} height={28} />
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
                    <Image src="/payment/free-money.png" alt="Paiement Free Money Sénégal" width={42} height={32} />
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

                {appliedCoupon && (
                  <div className="cost-row text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Code promo ({appliedCoupon.code})
                    </span>
                    <span>
                      {appliedCoupon.freeShipping
                        ? 'Livraison offerte'
                        : `-${formatPrice(appliedCoupon.discountAmount)}`}
                    </span>
                  </div>
                )}

                <div className="cost-row">
                  <span>
                    Livraison ({selectedZone?.name ?? 'Saly'} · {delivery === 'standard' ? 'Standard' : 'Express'})
                  </span>
                  <span>{isFreeShipping ? 'Offerte' : formatPrice(shipping)}</span>
                </div>

                <div className="cost-row total-row">
                  <strong>Total à payer</strong>
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
              <button
                type="submit"
                className="button-pill-pink button-pay-now flex items-center justify-center gap-2"
                disabled={submittingOrder}
              >
                {submittingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Création de la commande...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    <span>Payer {formatPrice(calculatedTotal)}</span>
                  </>
                )}
              </button>

              {/* Security Trust Note */}
              <div className="checkout-security-guarantee">
                <ShieldCheck size={18} color="#15803D" />
                <div>
                  <strong>Passerelle NabooPay sécurisée</strong>
                  <p>Paiement instantané par Wave, Orange Money et Cartes.</p>
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
