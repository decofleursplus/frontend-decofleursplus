'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Flower2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import {
  getSubscriptionDeliveryZones,
  getSubscriptionPaymentOptions,
  getSubscriptionPlans,
  subscribeToPlan,
  type CustomerSubscription,
  type PlanConfig,
  type SubscriptionDeliveryDay,
  type SubscriptionDeliveryZone,
  type SubscriptionFrequency,
  type SubscriptionPaymentOptions,
  type SubscriptionPlan,
} from '@/lib/api/subscriptions';

type Step = 'plan' | 'details' | 'payment' | 'confirmation';
type PaymentChoice = 'CASH_ON_DELIVERY' | 'WAVE' | 'ORANGE_MONEY';
type FieldName = 'name' | 'phone' | 'email' | 'location' | 'address';

const DELIVERY_DAYS: { id: SubscriptionDeliveryDay; label: string }[] = [
  { id: 'MARDI', label: 'Mardi' },
  { id: 'VENDREDI', label: 'Vendredi' },
  { id: 'SAMEDI', label: 'Samedi' },
];

const PAYMENT_LABELS: Record<PaymentChoice, string> = {
  CASH_ON_DELIVERY: 'Espèces à la livraison',
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
};

/** Champs du formulaire correspondant aux champs validés par l'API. */
const API_FIELD_TO_FORM: Record<string, FieldName> = {
  recipientName: 'name',
  phone: 'phone',
  email: 'email',
  location: 'location',
  address: 'address',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function deliveriesPerMonth(frequency: SubscriptionFrequency) {
  return frequency === 'HEBDOMADAIRE' ? 4 : 2;
}

function monthlyPrice(plan: PlanConfig, frequency: SubscriptionFrequency) {
  return frequency === 'HEBDOMADAIRE' ? plan.monthlyPriceHebdo : plan.monthlyPriceBimensuel;
}

function formatFcfa(amount: number) {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function SubscriptionForm({
  defaultPlan = 'particulier',
}: {
  defaultPlan?: 'particulier' | 'prestige' | 'entreprise';
}) {
  const { user } = useAuth();

  // Données de référence chargées depuis l'API
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [zones, setZones] = useState<SubscriptionDeliveryZone[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<SubscriptionPaymentOptions | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = useState('');

  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>(
    defaultPlan.toUpperCase() as SubscriptionPlan
  );
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('HEBDOMADAIRE');
  const [deliveryDay, setDeliveryDay] = useState<SubscriptionDeliveryDay>('VENDREDI');
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    address: '',
    paymentPhone: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdSubscription, setCreatedSubscription] = useState<CustomerSubscription | null>(null);

  // Chaîne de promesses : les setState n'ont lieu que dans les callbacks, jamais pendant l'effet.
  const fetchReferenceData = useCallback(
    () =>
      Promise.all([getSubscriptionPlans(), getSubscriptionDeliveryZones(), getSubscriptionPaymentOptions()])
        .then(([plansRes, zonesRes, paymentsRes]) => {
          setPlans(plansRes);
          setZones(zonesRes);
          setPaymentOptions(paymentsRes);
          setSelectedPlanId((prev) => (plansRes.some((p) => p.id === prev) ? prev : (plansRes[0]?.id ?? prev)));
          setFormData((prev) => ({
            ...prev,
            location: zonesRes.some((z) => z.name === prev.location) ? prev.location : (zonesRes[0]?.name ?? ''),
          }));
          setLoadState('ready');
        })
        .catch((err: unknown) => {
          setLoadError(
            err instanceof ApiClientError ? err.message : 'Impossible de charger les formules d’abonnement pour le moment.'
          );
          setLoadState('error');
        }),
    []
  );

  const loadReferenceData = () => {
    setLoadState('loading');
    setLoadError('');
    return fetchReferenceData();
  };

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Pré-remplissage avec le compte connecté, une seule fois par utilisateur (ajustement d'état pendant le rendu).
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  const userKey = user?.id ?? null;
  if (user && userKey !== prefilledFor) {
    setPrefilledFor(userKey);
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }

  // Modes de règlement réellement proposés : ceux activés dans les paramètres de la boutique.
  const availablePayments: PaymentChoice[] = paymentOptions
    ? ([
        paymentOptions.cash ? 'CASH_ON_DELIVERY' : null,
        paymentOptions.wave ? 'WAVE' : null,
        paymentOptions.orangeMoney ? 'ORANGE_MONEY' : null,
      ].filter(Boolean) as PaymentChoice[])
    : [];
  const effectivePayment: PaymentChoice | null =
    paymentMethod && availablePayments.includes(paymentMethod)
      ? paymentMethod
      : (availablePayments[0] ?? null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];
  const monthlyTotal = selectedPlan ? monthlyPrice(selectedPlan, frequency) : 0;
  const deliveriesCount = deliveriesPerMonth(frequency);
  const dayLabel = DELIVERY_DAYS.find((d) => d.id === deliveryDay)?.label ?? '';
  const zoneNames = zones.map((z) => z.name).join(', ');

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectPlan(id: SubscriptionPlan) {
    setSelectedPlanId(id);
    setCurrentStep('details');
  }

  function validateDetails(): boolean {
    const errors: Partial<Record<FieldName, string>> = {};
    if (formData.name.trim().length < 2) errors.name = 'Indiquez le nom du destinataire.';
    if (formData.phone.replace(/\D/g, '').length < 8) {
      errors.phone = 'Indiquez un numéro de téléphone valide.';
    }
    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = 'Indiquez une adresse email valide : la confirmation y est envoyée.';
    }
    if (!formData.location) errors.location = 'Choisissez une zone de livraison.';
    if (formData.address.trim().length < 5) {
      errors.address = 'Précisez l’adresse ou les repères de livraison.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleConfirmSubscription() {
    if (!selectedPlan || !effectivePayment) return;
    if (!validateDetails()) {
      setCurrentStep('details');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const subscription = await subscribeToPlan({
        plan: selectedPlan.id,
        frequency,
        deliveryDay,
        recipientName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        location: formData.location,
        address: formData.address.trim(),
        notes: formData.notes.trim() || undefined,
        paymentMethod: effectivePayment,
        paymentPhone:
          effectivePayment === 'CASH_ON_DELIVERY'
            ? undefined
            : formData.paymentPhone.trim() || formData.phone.trim(),
      });
      setCreatedSubscription(subscription);
      setCurrentStep('confirmation');
    } catch (err) {
      if (err instanceof ApiClientError && err.details?.length) {
        // Erreurs de validation renvoyées par le serveur : on les rattache aux champs concernés.
        const errors: Partial<Record<FieldName, string>> = {};
        const others: string[] = [];
        for (const detail of err.details) {
          const field = API_FIELD_TO_FORM[detail.path];
          if (field) errors[field] = detail.message;
          else others.push(detail.message);
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setCurrentStep('details');
        }
        setSubmitError(
          others.length > 0
            ? `${err.message} : ${others.join(' ; ')}`
            : 'Certaines informations sont invalides. Corrigez les champs signalés.'
        );
      } else {
        setSubmitError(
          err instanceof ApiClientError
            ? err.message
            : 'Votre abonnement n’a pas pu être enregistré. Veuillez réessayer.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewSubscription() {
    setCreatedSubscription(null);
    setSubmitError('');
    setFormData((prev) => ({ ...prev, address: '', notes: '', paymentPhone: '' }));
    setCurrentStep('plan');
  }

  const errorBox = (message: string) => (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 my-4 text-sm text-red-600"
    >
      <AlertCircle size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );

  const fieldError = (field: FieldName) =>
    fieldErrors[field] ? (
      <span role="alert" className="mt-1 block text-xs text-red-600">
        {fieldErrors[field]}
      </span>
    ) : null;

  if (loadState === 'loading') {
    return (
      <div className="sub-flow-container" id="abonnement-tunnel">
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-stone-600" role="status">
          <Loader2 size={20} className="animate-spin" />
          <span>Chargement des formules d’abonnement…</span>
        </div>
      </div>
    );
  }

  if (loadState === 'error' || !selectedPlan) {
    return (
      <div className="sub-flow-container" id="abonnement-tunnel">
        <div className="flex flex-col items-center gap-4 py-14 px-4 text-center">
          <AlertCircle size={28} className="text-red-500" />
          <p className="text-sm text-stone-700 max-w-md">
            {loadState === 'error'
              ? loadError
              : 'Aucune formule d’abonnement n’est disponible pour le moment.'}
          </p>
          <button type="button" className="button-pill-outline sub-btn-back" onClick={loadReferenceData}>
            <RefreshCw size={16} />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-flow-container" id="abonnement-tunnel">
      {/* ── Compact Stepper Bar ── */}
      <nav className="sub-stepper" aria-label="Étapes d’abonnement">
        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'plan' ? 'active' : 'completed'}`}
          onClick={() => currentStep !== 'confirmation' && setCurrentStep('plan')}
          disabled={currentStep === 'confirmation'}
        >
          <span className="step-num">1</span>
          <span className="step-label">Formule</span>
        </button>

        <span className="stepper-sep">›</span>

        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'details' ? 'active' : currentStep === 'payment' || currentStep === 'confirmation' ? 'completed' : 'disabled'}`}
          onClick={() => currentStep === 'payment' && setCurrentStep('details')}
          disabled={currentStep === 'plan' || currentStep === 'confirmation'}
        >
          <span className="step-num">2</span>
          <span className="step-label">Livraison</span>
        </button>

        <span className="stepper-sep">›</span>

        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'payment' ? 'active' : currentStep === 'confirmation' ? 'completed' : 'disabled'}`}
          disabled={currentStep !== 'payment'}
        >
          <span className="step-num">3</span>
          <span className="step-label">Règlement</span>
        </button>

        <span className="stepper-sep">›</span>

        <div className={`sub-step-pill ${currentStep === 'confirmation' ? 'active' : 'disabled'}`}>
          <span className="step-num">4</span>
          <span className="step-label">Confirmation</span>
        </div>
      </nav>

      {/* ── ÉTAPE 1 : FORMULES (GET /subscriptions/plans) ── */}
      {currentStep === 'plan' && (
        <div className="sub-step-screen sub-plans-screen">
          <div className="sub-screen-header">
            <div className="sub-freq-toggle-wrap">
              <span className="sub-toggle-label">Rythme :</span>
              <div className="sub-freq-toggle">
                <button
                  type="button"
                  className={`sub-freq-btn ${frequency === 'HEBDOMADAIRE' ? 'active' : ''}`}
                  onClick={() => setFrequency('HEBDOMADAIRE')}
                >
                  Hebdomadaire (4 passages / mois)
                </button>
                <button
                  type="button"
                  className={`sub-freq-btn ${frequency === 'BIMENSUELLE' ? 'active' : ''}`}
                  onClick={() => setFrequency('BIMENSUELLE')}
                >
                  Bimensuel (2 passages / mois)
                </button>
              </div>
            </div>

            {/* Onglets mobiles : une formule visible à la fois */}
            <div className="sub-mobile-tabs">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`sub-mobile-tab-btn ${selectedPlan.id === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlanId(p.id)}
                >
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sub-plans-grid">
            {plans.map((p) => {
              const isSelected = selectedPlan.id === p.id;
              const isFeatured = p.id === 'PRESTIGE';

              return (
                <article
                  key={p.id}
                  data-plan={p.id}
                  className={`sub-compact-card ${isFeatured ? 'featured' : ''} ${isSelected ? 'selected mobile-visible' : 'mobile-hidden'}`}
                >
                  {p.badge && <span className="sub-card-badge">{p.badge}</span>}

                  <div className="sub-card-top">
                    <h3 className="sub-card-title">{p.name}</h3>
                    <p className="sub-card-tagline">{p.tagline}</p>
                  </div>

                  <div className="sub-card-pricing">
                    <div className="sub-price-main">
                      <strong>{monthlyPrice(p, frequency).toLocaleString('fr-FR')}</strong>
                      <span>FCFA / mois</span>
                    </div>
                    <div className="sub-price-detail">
                      soit {formatFcfa(p.perDeliveryPrice)} par livraison ({deliveriesCount} passages)
                    </div>
                  </div>

                  <div className="sub-card-specs">
                    <div className="sub-spec-row">
                      <Flower2 size={16} className="spec-icon" />
                      <span>{p.bouquetSpecs}</span>
                    </div>
                    <div className="sub-spec-row">
                      <RefreshCw size={16} className="spec-icon" />
                      <span>{p.vaseSpecs}</span>
                    </div>
                    {zones.length > 0 && (
                      <div className="sub-spec-row">
                        <Truck size={16} className="spec-icon" />
                        <span>Livraison incluse : {zoneNames}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`sub-choose-cta ${isFeatured ? 'button-pill-pink' : 'button-pill-outline'}`}
                    onClick={() => handleSelectPlan(p.id)}
                  >
                    <span>Choisir cette formule</span>
                    <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>

          <div className="sub-compact-trust-strip">
            <span>Vases fournis &amp; renouvelés</span>
            <span className="dot">·</span>
            <span>Aucun paiement en ligne à la souscription</span>
            <span className="dot">·</span>
            <span>Sans engagement : suspension ou résiliation à tout moment</span>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : COORDONNÉES & LIVRAISON ── */}
      {currentStep === 'details' && (
        <div className="sub-step-screen sub-details-screen">
          <div className="sub-active-plan-banner">
            <div className="plan-recap-left">
              <span className="recap-label">Formule sélectionnée :</span>
              <strong>{selectedPlan.name}</strong>
              <span className="recap-freq">
                ({frequency === 'HEBDOMADAIRE' ? 'Hebdomadaire · 4 passages' : 'Bimensuel · 2 passages'})
              </span>
              <span className="recap-price">{formatFcfa(monthlyTotal)} / mois</span>
            </div>
            <button type="button" className="sub-change-link" onClick={() => setCurrentStep('plan')}>
              Modifier
            </button>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (validateDetails()) {
                setSubmitError('');
                setCurrentStep('payment');
              }
            }}
            className="sub-details-form"
          >
            {submitError && errorBox(submitError)}

            <div className="sub-fields-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nom et prénom <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex : Sophie Faye"
                    className="form-input"
                    aria-invalid={!!fieldErrors.name}
                  />
                </div>
                {fieldError('name')}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Téléphone / WhatsApp <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+221 77 123 45 67"
                    className="form-input"
                    aria-invalid={!!fieldErrors.phone}
                  />
                </div>
                {fieldError('phone')}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="vous@exemple.com"
                    className="form-input"
                    aria-invalid={!!fieldErrors.email}
                  />
                </div>
                {fieldError('email')}
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Zone de livraison <span className="req">*</span>
                </label>
                {zones.length === 0 ? (
                  <span role="alert" className="block text-xs text-red-600">
                    Aucune zone de livraison n’est ouverte actuellement : la souscription en ligne est
                    indisponible.
                  </span>
                ) : (
                  <div className="input-with-icon">
                    <MapPin size={18} className="field-icon" />
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input form-select"
                    >
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.name}>
                          {zone.coverage ? `${zone.name} — ${zone.coverage}` : zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {fieldError('location')}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Jour de livraison préféré <span className="req">*</span>
                </label>
                <div className="sub-day-selector">
                  {DELIVERY_DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      className={`sub-day-pill ${deliveryDay === day.id ? 'active' : ''}`}
                      onClick={() => setDeliveryDay(day.id)}
                    >
                      {frequency === 'HEBDOMADAIRE' ? `Chaque ${day.label}` : `Un ${day.label} sur deux`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address" className="form-label">
                  Adresse précise ou repères de la villa / entreprise <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="field-icon" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ex : Villa Baobab, Route du Golf, à côté du restaurant Le Teranga"
                    className="form-input"
                    aria-invalid={!!fieldErrors.address}
                  />
                </div>
                {fieldError('address')}
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes" className="form-label">
                  Préférences florales ou consigne d’accès <span className="opt">(optionnel)</span>
                </label>
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ex : Tons pastel préférés, laisser à l’accueil..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="sub-actions-row">
              <button
                type="button"
                className="button-pill-outline sub-btn-back"
                onClick={() => setCurrentStep('plan')}
              >
                <ArrowLeft size={16} />
                <span>Retour aux offres</span>
              </button>

              <button type="submit" className="button-pill-pink sub-btn-next" disabled={zones.length === 0}>
                <span>Continuer</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ÉTAPE 3 : MODE DE RÈGLEMENT SOUHAITÉ (aucun paiement en ligne) ── */}
      {currentStep === 'payment' && (
        <div className="sub-step-screen sub-payment-screen">
          <div className="sub-active-plan-banner">
            <div className="plan-recap-left">
              <span className="recap-label">Récapitulatif :</span>
              <strong>{selectedPlan.name}</strong>
              <span className="recap-freq">
                · {frequency === 'HEBDOMADAIRE' ? `Chaque ${dayLabel}` : `Un ${dayLabel} sur deux`} · {formData.location}
              </span>
              <span className="recap-price">{formatFcfa(monthlyTotal)} / mois</span>
            </div>
            <button type="button" className="sub-change-link" onClick={() => setCurrentStep('details')}>
              Modifier coordonnées
            </button>
          </div>

          <div className="sub-payment-body">
            <h3 className="sub-payment-title">Comment souhaitez-vous régler votre abonnement ?</h3>

            <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
              <strong>Aucun paiement en ligne n’est demandé aujourd’hui.</strong> Après votre souscription,
              notre équipe vous contacte au {formData.phone} pour confirmer l’abonnement et convenir du
              règlement, selon le mode que vous indiquez ici, avant le premier passage.
            </p>

            {availablePayments.length === 0 ? (
              errorBox(
                'Aucun mode de règlement n’est disponible actuellement. Contactez-nous pour souscrire.'
              )
            ) : (
              <div className="sub-real-payment-methods">
                {availablePayments.map((method) => (
                  <label
                    key={method}
                    className={`sub-real-pay-card ${effectivePayment === method ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={effectivePayment === method}
                      onChange={() => setPaymentMethod(method)}
                      className="pay-radio"
                    />
                    {method === 'CASH_ON_DELIVERY' && (
                      <div className="pay-logo-frame cb-frame">
                        <Banknote size={24} className="text-[#193e23]" />
                      </div>
                    )}
                    {method === 'WAVE' && (
                      <div className="pay-logo-frame wave-frame">
                        <Image src="/payment/wave.png" alt="Wave" width={34} height={34} className="pay-logo-img" />
                      </div>
                    )}
                    {method === 'ORANGE_MONEY' && (
                      <div className="pay-logo-frame om-frame">
                        <Image
                          src="/payment/orange-money.svg"
                          alt="Orange Money"
                          width={30}
                          height={30}
                          className="pay-logo-img"
                        />
                      </div>
                    )}
                    <div className="pay-info">
                      <strong>{PAYMENT_LABELS[method]}</strong>
                      <span>
                        {method === 'CASH_ON_DELIVERY'
                          ? 'Règlement remis à notre livreur'
                          : 'Transfert mobile convenu avec notre équipe'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(effectivePayment === 'WAVE' || effectivePayment === 'ORANGE_MONEY') && (
              <div className="sub-pay-account-box">
                <label htmlFor="paymentPhone" className="form-label">
                  Numéro {PAYMENT_LABELS[effectivePayment]} que vous utiliserez{' '}
                  <span className="opt">(si différent de votre téléphone)</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    id="paymentPhone"
                    name="paymentPhone"
                    value={formData.paymentPhone}
                    onChange={handleInputChange}
                    placeholder={formData.phone || '+221 7X XXX XX XX'}
                    className="form-input"
                  />
                </div>
                <span className="pay-hint">
                  Ce numéro est transmis à notre équipe. Aucune demande de paiement n’est envoyée
                  automatiquement.
                </span>
              </div>
            )}

            {submitError && errorBox(submitError)}

            <div className="sub-actions-row">
              <button
                type="button"
                className="button-pill-outline sub-btn-back"
                onClick={() => setCurrentStep('details')}
                disabled={submitting}
              >
                <ArrowLeft size={16} />
                <span>Modifier coordonnées</span>
              </button>

              <button
                type="button"
                className="button-pill-pink sub-btn-next"
                onClick={handleConfirmSubscription}
                disabled={submitting || !effectivePayment}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer la souscription</span>
                    <Check size={18} />
                  </>
                )}
              </button>
            </div>

            <div className="sub-security-note">
              <ShieldCheck size={16} />
              <span>Aucun prélèvement en ligne · Sans engagement · Suspension ou résiliation à tout moment</span>
            </div>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 4 : CONFIRMATION (données renvoyées par le serveur) ── */}
      {currentStep === 'confirmation' && createdSubscription && (
        <div className="sub-step-screen sub-confirm-screen">
          <div className="sub-confirm-card">
            <div className="confirm-icon-wrap">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>

            <h2 className="confirm-title">
              Abonnement enregistré pour {createdSubscription.recipientName}
            </h2>
            <p className="confirm-subtitle">
              Aucun paiement n’a été prélevé. Notre équipe vous contacte au {createdSubscription.phone} pour
              confirmer votre abonnement et convenir du règlement avant le premier passage.
              {createdSubscription.email && (
                <> Un email récapitulatif vient d’être envoyé à {createdSubscription.email}.</>
              )}
            </p>

            <div className="sub-recap-ticket">
              <div className="recap-ticket-header">
                <span>RÉCAPITULATIF DE L’ABONNEMENT</span>
                <strong data-testid="subscription-number">N° {createdSubscription.subscriptionNumber}</strong>
              </div>

              <div className="recap-ticket-grid">
                <div className="ticket-item">
                  <span className="ticket-label">Formule :</span>
                  <strong>
                    {plans.find((p) => p.id === createdSubscription.plan)?.name ?? createdSubscription.plan}
                  </strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Rythme :</span>
                  <strong>
                    {createdSubscription.frequency === 'HEBDOMADAIRE' ? 'Hebdomadaire' : 'Bimensuel'} (
                    {createdSubscription.deliveriesPerMonth} livraisons / mois)
                  </strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Premier passage prévu :</span>
                  <strong>
                    {createdSubscription.nextDeliveryDate
                      ? formatLongDate(createdSubscription.nextDeliveryDate)
                      : 'À convenir avec notre équipe'}
                  </strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Montant :</span>
                  <strong className="text-pink" data-testid="subscription-amount">
                    {formatFcfa(createdSubscription.monthlyAmount)} / mois
                  </strong>
                </div>

                <div className="ticket-item full">
                  <span className="ticket-label">Lieu &amp; Contact :</span>
                  <span>
                    {createdSubscription.address}, {createdSubscription.location} · Tél :{' '}
                    {createdSubscription.phone}
                  </span>
                </div>

                <div className="ticket-item full">
                  <span className="ticket-label">Règlement souhaité :</span>
                  <span>
                    {PAYMENT_LABELS[createdSubscription.paymentMethod as PaymentChoice] ??
                      createdSubscription.paymentMethod}{' '}
                    (à convenir avec notre équipe)
                  </span>
                </div>
              </div>
            </div>

            <div className="confirm-actions-row">
              {user && createdSubscription.userId && (
                <Link href="/compte/abonnements" className="button-pill-pink sub-btn-action">
                  Voir mes abonnements
                </Link>
              )}

              <button type="button" className="button-pill-outline sub-btn-action" onClick={handleNewSubscription}>
                Nouvelle souscription
              </button>

              <Link href="/" className="button-pill-outline sub-btn-action">
                Retour à l’accueil
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
