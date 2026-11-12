'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Calendar,
  Check,
  Clock,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  UserCheck,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';
import { ApiClientError } from '@/lib/api/client';
import {
  getDeliveryZones,
  placeOrder,
  TIME_SLOTS,
  type DeliveryMode,
  type DeliveryZone,
  type OrderPaymentMethod,
  type TimeSlot,
} from '@/lib/api/orders';
import { createCustomerAddress, getCustomerAddresses, type CustomerAddress } from '@/lib/api/customer';
import { useCartQuote, useCheckoutPrefs } from '@/lib/hooks/use-cart-quote';
import { usePublicSettings } from '@/lib/hooks/use-public-settings';

const NEW_ADDRESS = 'nouvelle';

const SLOT_LABELS: Record<TimeSlot, string> = {
  '9h-12h': 'Matinée (9h – 12h)',
  '10h-14h': 'Fin de matinée (10h – 14h)',
  '14h-18h': 'Après-midi (14h – 18h)',
  '18h-20h': 'Soirée (18h – 20h)',
};

type PaymentOption = { method: OrderPaymentMethod; label: string; sub?: string; logo: React.ReactNode };

const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function hoursLabel(hours: number) {
  if (hours <= 0) return 'dans la journée';
  if (hours < 24) return `en ${hours} h environ`;
  const days = Math.round(hours / 24);
  return `sous ${days} jour${days > 1 ? 's' : ''}`;
}

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { settings, error: settingsError } = usePublicSettings();
  const { prefs, ready: prefsReady, update } = useCheckoutPrefs();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[] | null>(null);
  const [addressChoice, setAddressChoice] = useState<string>(NEW_ADDRESS);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [contactPhone, setContactPhone] = useState('');
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(todayIso);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('10h-14h');
  const [instructions, setInstructions] = useState('');
  const [payment, setPayment] = useState<OrderPaymentMethod | ''>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && items.length > 0 && !placed) router.push('/connexion?redirect=/commande');
  }, [authLoading, isAuthenticated, items.length, router, placed]);

  useEffect(() => {
    getDeliveryZones()
      .then(setZones)
      .catch((err) => setZonesError(err instanceof Error ? err.message : 'Zones de livraison indisponibles.'));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    getCustomerAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setAddressChoice(def.id);
      })
      .catch(() => setAddresses([]));
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- préremplissage avec le profil
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user, contactPhone]);

  const mode = prefs.deliveryMode;
  const zone = zones.find((z) => z.id === prefs.deliveryZoneId) ?? null;
  const needsZone = mode !== 'PICKUP';

  const { quote, loading: quoting, error: quoteError, lineProblems, couponError, fieldErrors: quoteFieldErrors } = useCartQuote({
    lines: items,
    deliveryMode: mode,
    deliveryZoneId: prefs.deliveryZoneId || undefined,
    couponCode: prefs.couponCode || undefined,
    enabled: prefsReady && (!needsZone || Boolean(prefs.deliveryZoneId)),
  });

  const paymentOptions = useMemo<PaymentOption[]>(() => {
    const p = settings?.payments;
    const options: PaymentOption[] = [];
    if (!p || p.wave)
      options.push({ method: 'WAVE', label: 'Wave', logo: <Image src="/payment/wave.png" alt="" width={22} height={32} /> });
    if (!p || p.orangeMoney)
      options.push({ method: 'ORANGE_MONEY', label: 'Orange Money', logo: <Image src="/payment/orange-money.svg" alt="" width={28} height={28} /> });
    options.push({ method: 'FREE_MONEY', label: 'Free Money', logo: <Image src="/payment/free-money.png" alt="" width={42} height={32} /> });
    if (!p || p.card)
      options.push({
        method: 'CARD',
        label: 'Carte bancaire',
        sub: 'Visa, Mastercard',
        logo: (
          <>
            <Image src="/payment/visa.svg" alt="" width={27} height={18} />
            <Image src="/payment/mastercard.svg" alt="" width={24} height={18} />
          </>
        ),
      });
    const cashCeiling = p?.cashMaxAmount ?? null;
    const cashAllowed = (!p || p.cash) && !(cashCeiling && quote && quote.totalAmount > cashCeiling);
    if (cashAllowed)
      options.push({
        method: 'CASH_ON_DELIVERY',
        label: mode === 'PICKUP' ? 'Paiement au retrait' : 'Paiement à la livraison',
        sub: mode === 'PICKUP' ? 'En boutique, au retrait' : 'En espèces au livreur',
        logo: <Banknote size={22} />,
      });
    return options;
  }, [settings, quote, mode]);

  const cashCeilingNote =
    settings?.payments.cash && settings.payments.cashMaxAmount && quote && quote.totalAmount > settings.payments.cashMaxAmount
      ? `Paiement à la livraison possible jusqu’à ${formatPrice(settings.payments.cashMaxAmount)}.`
      : null;

  useEffect(() => {
    if (payment && !paymentOptions.some((o) => o.method === payment)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- le moyen choisi n'est plus proposé
      setPayment('');
    }
  }, [payment, paymentOptions]);

  const selectedAddress = addresses?.find((a) => a.id === addressChoice) ?? null;
  const errorFor = (path: string) => fieldErrors[path] ?? quoteFieldErrors[path];

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (needsZone && !prefs.deliveryZoneId) errors.deliveryZoneId = 'Choisissez votre zone de livraison.';
    const deliveryAddress =
      mode === 'PICKUP' ? undefined : selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : [street.trim(), city.trim()].filter(Boolean).join(', ');
    if (needsZone && !selectedAddress && (street.trim().length < 3 || !city.trim()))
      errors.deliveryAddress = 'Indiquez l’adresse complète (rue / quartier et ville).';
    if (!contactPhone.trim() && !user?.phone) errors.phone = 'Un numéro de téléphone est requis pour vous joindre.';
    if (forSomeoneElse && recipientName.trim().length < 2) errors.recipientName = 'Indiquez le nom du destinataire.';
    if (forSomeoneElse && !recipientPhone.trim()) errors.recipientPhone = 'Indiquez le téléphone du destinataire.';
    if (!payment) errors.paymentMethod = 'Choisissez un moyen de paiement.';
    if (!acceptTerms) errors.terms = 'Vous devez accepter les conditions générales de vente.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setOrderError('Certaines informations sont manquantes ou incorrectes.');
      return;
    }

    setSubmitting(true);
    try {
      if (needsZone && !selectedAddress && saveAddress) {
        try {
          await createCustomerAddress({
            name: (addresses?.length ?? 0) === 0 ? 'Domicile' : `Adresse ${(addresses?.length ?? 0) + 1}`,
            street: street.trim(),
            city: city.trim(),
            phone: contactPhone.trim() || user?.phone || '',
            isDefault: (addresses?.length ?? 0) === 0,
          });
        } catch (err) {
          // L'adresse n'est qu'un confort : la commande continue, l'erreur est signalée
          console.warn('[Commande] Adresse non enregistrée :', err);
        }
      }

      const order = await placeOrder({
        items: items.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
          giftWrap: l.giftWrap || undefined,
          cardMessage: l.cardMessage.trim() || undefined,
        })),
        deliveryMode: mode,
        deliveryZoneId: needsZone ? prefs.deliveryZoneId : undefined,
        couponCode: quote?.appliedCoupon?.code,
        paymentMethod: payment as OrderPaymentMethod,
        phone: contactPhone.trim() || undefined,
        recipientName: forSomeoneElse ? recipientName.trim() : undefined,
        recipientPhone: forSomeoneElse ? recipientPhone.trim() : undefined,
        deliveryAddress,
        deliveryDate: deliveryDate || undefined,
        timeSlot,
        notes: instructions.trim() || undefined,
      });

      setPlaced(true);
      clear();
      update({ couponCode: '' });
      if (order.checkoutUrl) window.location.href = order.checkoutUrl;
      else router.push(`/commande/confirmation?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      const details: Record<string, string> = {};
      if (err instanceof ApiClientError) for (const d of err.details ?? []) if (d.path) details[d.path] = d.message;
      setFieldErrors(details);
      setOrderError(err instanceof Error ? err.message : 'La commande n’a pas pu être créée.');
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !placed) {
    return (
      <>
        <main className="content-width page-main checkout-page">
          <div className="checkout-heading">
            <h1>Finaliser ma commande</h1>
          </div>
          <div className="empty-checkout-card text-center py-16 px-6 max-w-xl mx-auto bg-white rounded-3xl border border-[#e8efe9] shadow-sm my-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0f7f1] text-[#24582d] flex items-center justify-center">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1c2e20] mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Ajoutez des articles depuis la boutique pour passer commande.</p>
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#24582d] text-white font-medium hover:bg-[#1a4221]"
            >
              Découvrir la boutique
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!isAuthenticated || placed) {
    return (
      <>
        <main className="content-width page-main checkout-page py-20 text-center">
          <Loader2 className="animate-spin mx-auto text-[#24582d] mb-4" size={32} />
          <p className="text-gray-600">{placed ? 'Commande enregistrée, redirection…' : 'Redirection vers la connexion…'}</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const fieldError = (path: string) =>
    errorFor(path) ? (
      <p className="text-xs font-medium text-red-600 mt-1" role="alert">
        {errorFor(path)}
      </p>
    ) : null;

  const hasLineProblems = Object.keys(lineProblems).length > 0;

  return (
    <>
      <main className="content-width page-main checkout-page">
        <nav className="breadcrumbs" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href="/panier">Panier</Link>
          <span>›</span>
          <span>Commande</span>
        </nav>

        <div className="checkout-heading">
          <h1>Finaliser ma commande</h1>
          <p>Vérifiez la livraison et choisissez votre moyen de paiement.</p>
        </div>

        {orderError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3" role="alert">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong>Impossible de finaliser la commande</strong>
              <p className="mt-0.5">{orderError}</p>
            </div>
          </div>
        )}

        <form className="checkout-layout-grid" onSubmit={submitOrder} noValidate>
          <div className="checkout-steps-column">
            <section className="checkout-panel checkout-step-panel checkout-step-verified">
              <div className="step-panel-heading">
                <div className="step-heading-left">
                  <div className="step-badge-check">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <h2>1. Vos coordonnées</h2>
                </div>
                <div className="auth-step-actions-row">
                  <button
                    type="button"
                    className="link-button-pink"
                    onClick={() => {
                      logout();
                      router.push('/connexion?redirect=/commande');
                    }}
                  >
                    Changer de compte
                  </button>
                </div>
              </div>
              <div className="checkout-auth-verified-card">
                <div className="auth-avatar-circle">{user?.name ? user.name.slice(0, 2).toUpperCase() : 'DF'}</div>
                <div className="auth-verified-info">
                  <div className="auth-verified-name-row">
                    <strong>{user?.name}</strong>
                    <span className="badge-verified-client">
                      <UserCheck size={12} /> Connecté
                    </span>
                  </div>
                  <p className="auth-verified-contact">
                    <span>{user?.email}</span>
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="contactPhone" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Téléphone pour vous joindre *
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="form-input text-sm w-full"
                />
                {fieldError('phone')}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={forSomeoneElse} onChange={(e) => setForSomeoneElse(e.target.checked)} />
                La commande est pour quelqu’un d’autre (cadeau)
              </label>
              {forSomeoneElse && (
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label htmlFor="recipientName" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nom du destinataire *
                    </label>
                    <input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="form-input text-sm w-full" />
                    {fieldError('recipientName')}
                  </div>
                  <div>
                    <label htmlFor="recipientPhone" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Téléphone du destinataire *
                    </label>
                    <input id="recipientPhone" type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="form-input text-sm w-full" />
                    {fieldError('recipientPhone')}
                  </div>
                </div>
              )}
            </section>

            <section className="checkout-panel checkout-step-panel">
              <h2>2. Mode de livraison</h2>
              <div className="delivery-radio-list">
                {(
                  [
                    ['STANDARD', 'Livraison standard', zone ? formatPrice(zone.fee) : 'Selon la zone', zone ? `Livrée ${hoursLabel(zone.estimatedTimeHours)}` : 'À domicile ou au bureau'],
                    ['EXPRESS', 'Livraison express', zone ? formatPrice(zone.expressFee) : 'Selon la zone', 'Prioritaire, au plus vite'],
                    ['PICKUP', 'Retrait en boutique', 'Gratuit', settings?.boutique.address ?? 'À notre atelier'],
                  ] as [DeliveryMode, string, string, string][]
                ).map(([value, title, price, desc]) => (
                  <label key={value} className={`delivery-option-card ${mode === value ? 'selected' : ''}`}>
                    <input type="radio" name="delivery" value={value} checked={mode === value} onChange={() => update({ deliveryMode: value })} />
                    <div className="delivery-card-content">
                      <div className="delivery-card-title-row">
                        <strong className="inline-flex items-center gap-1.5">
                          {value === 'PICKUP' && <Store size={14} />} {title}
                        </strong>
                        <span className="delivery-price-tag">{price}</span>
                      </div>
                      <span className="delivery-card-desc">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {needsZone && (
                <div className="mt-4">
                  <label htmlFor="deliveryZone" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Zone de livraison *
                  </label>
                  {zonesError ? (
                    <p className="text-sm text-red-600">{zonesError}</p>
                  ) : (
                    <select
                      id="deliveryZone"
                      value={prefs.deliveryZoneId}
                      onChange={(e) => update({ deliveryZoneId: e.target.value })}
                      className="form-input form-select text-sm w-full"
                    >
                      <option value="">Choisir votre zone…</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                          {z.coverage ? ` (${z.coverage})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {zone?.freeAbove && mode === 'STANDARD' && (
                    <p className="text-xs text-neutral-500 mt-1">Livraison standard offerte dès {formatPrice(zone.freeAbove)} d’achat.</p>
                  )}
                  {fieldError('deliveryZoneId')}
                </div>
              )}
            </section>

            {needsZone && (
              <section className="checkout-panel checkout-step-panel">
                <div className="step-panel-heading">
                  <h2>3. Adresse de livraison</h2>
                  {addresses && addresses.length > 0 && (
                    <Link href="/compte/adresses" className="link-button-pink">
                      Gérer mes adresses
                    </Link>
                  )}
                </div>
                <div className="grid gap-2">
                  {(addresses ?? []).map((addr) => (
                    <label
                      key={addr.id}
                      className={`cursor-pointer border rounded-xl p-3 flex items-start gap-3 ${
                        addressChoice === addr.id ? 'border-[#173f22] bg-[#173f22]/5' : 'border-neutral-200'
                      }`}
                    >
                      <input type="radio" name="address" checked={addressChoice === addr.id} onChange={() => setAddressChoice(addr.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm">{addr.name}</strong>
                          {addr.isDefault && <span className="badge-default">Par défaut</span>}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {addr.street} · {addr.city}
                          {addr.phone && ` · ${addr.phone}`}
                        </p>
                      </div>
                    </label>
                  ))}
                  <label
                    className={`cursor-pointer border rounded-xl p-3 flex items-start gap-3 ${
                      addressChoice === NEW_ADDRESS ? 'border-[#173f22] bg-[#173f22]/5' : 'border-neutral-200'
                    }`}
                  >
                    <input type="radio" name="address" checked={addressChoice === NEW_ADDRESS} onChange={() => setAddressChoice(NEW_ADDRESS)} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <strong className="text-sm inline-flex items-center gap-1.5">
                        <MapPin size={14} /> {addresses && addresses.length > 0 ? 'Une autre adresse' : 'Adresse de livraison'}
                      </strong>
                      {addressChoice === NEW_ADDRESS && (
                        <>
                          <input
                            aria-label="Rue, quartier, résidence"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Rue, quartier, résidence, villa…"
                            className="form-input text-sm w-full"
                          />
                          <input
                            aria-label="Ville"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ville (ex. Saly, Mbour, Dakar)"
                            className="form-input text-sm w-full"
                          />
                          <label className="flex items-center gap-2 text-xs">
                            <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                            Enregistrer cette adresse dans mon compte
                          </label>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {fieldError('deliveryAddress')}
              </section>
            )}

            <section className="checkout-panel checkout-step-panel">
              <h2>{needsZone ? '4' : '3'}. {needsZone ? 'Date et heure de livraison' : 'Date et heure de retrait'}</h2>
              <div className="delivery-datetime-grid">
                <div className="datetime-field">
                  <label htmlFor="deliveryDate">
                    <Calendar size={15} /> Date
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    min={todayIso()}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="datetime-input"
                  />
                  {fieldError('deliveryDate')}
                </div>
                <div className="datetime-field">
                  <label htmlFor="deliverySlot">
                    <Clock size={15} /> Créneau
                  </label>
                  <select id="deliverySlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value as TimeSlot)} className="datetime-select">
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {SLOT_LABELS[slot]}
                      </option>
                    ))}
                  </select>
                  {fieldError('timeSlot')}
                </div>
              </div>
            </section>

            <section className="checkout-panel checkout-step-panel">
              <h2>{needsZone ? '5' : '4'}. Instructions (facultatif)</h2>
              <textarea
                rows={3}
                maxLength={2000}
                placeholder="Ex : appeler avant l’arrivée, code du portail…"
                className="checkout-instructions-textarea"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </section>
          </div>

          <div className="checkout-summary-column">
            <section className="checkout-panel checkout-step-panel">
              <div className="step-panel-heading">
                <h2>Moyen de paiement</h2>
                <Link href="/panier" className="link-button-pink">
                  Modifier le panier
                </Link>
              </div>
              {Boolean(settingsError) && <p className="text-xs text-amber-700 mb-2">Impossible de vérifier les moyens de paiement actifs.</p>}
              <div className="checkout-payment-methods-list" role="radiogroup" aria-label="Moyen de paiement">
                {paymentOptions.map((opt) => (
                  <label key={opt.method} className={`payment-method-row ${payment === opt.method ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={opt.method} checked={payment === opt.method} onChange={() => setPayment(opt.method)} />
                    <div className="payment-brand-badge">{opt.logo}</div>
                    <div className="payment-method-text">
                      <strong>{opt.label}</strong>
                      {opt.sub && <span className="payment-subtext">{opt.sub}</span>}
                    </div>
                  </label>
                ))}
              </div>
              {cashCeilingNote && <p className="text-xs text-neutral-500 mt-2">{cashCeilingNote}</p>}
              {fieldError('paymentMethod')}
            </section>

            <aside className="checkout-panel checkout-order-summary" aria-busy={quoting}>
              <h2>Récapitulatif</h2>
              <div className="checkout-items-list">
                {items.map((line) => {
                  const quoted = quote?.items.find((q) => q.variantId === line.variantId);
                  const problem = lineProblems[line.variantId];
                  return (
                    <div key={line.lineId} className="checkout-item-row">
                      <div className="checkout-item-thumb">
                        <Image src={line.image} alt={line.name} width={64} height={64} className="item-thumb-img" />
                      </div>
                      <div className="checkout-item-info">
                        <strong>{line.name}</strong>
                        <span className="item-meta-desc">
                          {line.variantName && line.variantName !== 'Standard' && <span>Taille : {line.variantName}</span>}
                          {line.giftWrap && <span>Emballage cadeau</span>}
                          {line.cardMessage && <span>Carte : « {line.cardMessage} »</span>}
                        </span>
                        {problem && <span className="text-xs text-red-600 font-semibold">{problem.message}</span>}
                        <div className="checkout-item-footer">
                          <span className="item-qty-tag">Quantité : {line.quantity}</span>
                          <strong className="item-price-tag">
                            {quoted ? formatPrice(quoted.totalPrice + quoted.extrasPrice) : '—'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-cost-breakdown">
                {quote ? (
                  <>
                    <div className="cost-row">
                      <span>Sous-total</span>
                      <span>{formatPrice(quote.subtotal)}</span>
                    </div>
                    {quote.extrasAmount > 0 && (
                      <div className="cost-row">
                        <span>Options cadeau</span>
                        <span>{formatPrice(quote.extrasAmount)}</span>
                      </div>
                    )}
                    {quote.appliedCoupon && (
                      <div className="cost-row text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Tag size={13} /> Code {quote.appliedCoupon.code}
                        </span>
                        <span>{quote.discountAmount > 0 ? `−${formatPrice(quote.discountAmount)}` : 'Livraison offerte'}</span>
                      </div>
                    )}
                    <div className="cost-row">
                      <span>{mode === 'PICKUP' ? 'Retrait en boutique' : `Livraison (${quote.deliveryZone?.name ?? '—'})`}</span>
                      <span>{quote.deliveryFee === 0 ? 'Offerte' : formatPrice(quote.deliveryFee)}</span>
                    </div>
                    <div className="cost-row total-row">
                      <strong>Total à payer</strong>
                      <strong className="total-amount-highlight">{formatPrice(quote.totalAmount)}</strong>
                    </div>
                  </>
                ) : needsZone && !prefs.deliveryZoneId ? (
                  <p className="text-sm text-neutral-600">Choisissez votre zone de livraison pour afficher le total.</p>
                ) : quoting ? (
                  <p className="text-sm text-neutral-600 flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Calcul du total…
                  </p>
                ) : hasLineProblems ? (
                  <p className="text-sm text-red-600">
                    Certains articles ne sont plus disponibles en quantité suffisante. <Link href="/panier" className="underline">Corriger le panier</Link>
                  </p>
                ) : quoteError ? (
                  <p className="text-sm text-red-600" role="alert">
                    {quoteError}
                  </p>
                ) : null}
                {couponError && (
                  <p className="text-xs text-red-600 mt-1">
                    Code « {prefs.couponCode} » non appliqué : {couponError}
                  </p>
                )}
              </div>

              <label className="terms-checkbox-label">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                <span>
                  J’accepte les <Link href="/conditions">Conditions Générales de Vente</Link> et la{' '}
                  <Link href="/confidentialite">Politique de confidentialité</Link>.
                </span>
              </label>
              {fieldError('terms')}

              <button
                type="submit"
                className="button-pill-pink button-pay-now flex items-center justify-center gap-2"
                disabled={submitting || !quote || hasLineProblems}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Création de la commande…</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    <span>
                      {!quote
                        ? 'Commander'
                        : payment === 'CASH_ON_DELIVERY' || !payment
                          ? `Confirmer la commande (${formatPrice(quote.totalAmount)})`
                          : `Payer ${formatPrice(quote.totalAmount)}`}
                    </span>
                  </>
                )}
              </button>

              <div className="checkout-security-guarantee">
                <ShieldCheck size={18} color="#15803D" />
                <div>
                  <strong>{payment === 'CASH_ON_DELIVERY' ? 'Paiement à la réception' : 'Paiement en ligne NabooPay'}</strong>
                  <p>
                    {payment === 'CASH_ON_DELIVERY'
                      ? 'Vous réglez directement lors de la remise de votre commande.'
                      : 'Vous serez redirigé vers la page de paiement sécurisée.'}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
