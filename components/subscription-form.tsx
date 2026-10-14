'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Flower2,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export interface PlanConfig {
  id: 'particulier' | 'prestige' | 'entreprise';
  name: string;
  badge?: string;
  tagline: string;
  perDeliveryPrice: number;
  monthlyPriceHebdo: number;
  monthlyPriceBimensuel: number;
  bouquetSpecs: string;
  vaseSpecs: string;
  recommendedFor: string;
  serviceCommitments: string[];
}

export const subscriptionPlans: PlanConfig[] = [
  {
    id: 'particulier',
    name: 'Particulier & Villa',
    tagline: 'Fraîcheur & poésie au quotidien',
    badge: 'Résidentiel',
    perDeliveryPrice: 25000,
    monthlyPriceHebdo: 100000,
    monthlyPriceBimensuel: 50000,
    bouquetSpecs: 'Bouquet artisanal généreux (Ø 35-40 cm) en fleurs fraîches nobles',
    vaseSpecs: 'Vase verre ou céramique prêté, garni d’eau & renouvelé',
    recommendedFor: 'Salons, salles à manger & vérandas de villas à Saly et Ngaparou',
    serviceCommitments: [
      'Fleurs fraîches coupées le matin même',
      'Vase prêté & échangé à chaque passage',
      'Sans engagement : suspension en 1 clic',
    ],
  },
  {
    id: 'prestige',
    name: 'Prestige & Réception',
    tagline: 'L’art floral dans sa plus haute expression',
    badge: 'Recommandé',
    perDeliveryPrice: 50000,
    monthlyPriceHebdo: 200000,
    monthlyPriceBimensuel: 100000,
    bouquetSpecs: 'Grande pièce maîtresse sculpturale (Ø 55-65 cm, H 65 cm)',
    vaseSpecs: 'Vase d’art contemporain de collection inclus & nettoyé',
    recommendedFor: 'Halls d’accueil, réceptions d’exception & tables de gala',
    serviceCommitments: [
      'Variétés nobles d’exception & fleurs rares',
      'Installation et mise en valeur par l’artisan',
      'Vases de collection tournants à chaque passage',
    ],
  },
  {
    id: 'entreprise',
    name: 'Entreprise & Hôtellerie',
    tagline: 'Image de marque & accueil soigné',
    badge: 'B2B & Hôtels',
    perDeliveryPrice: 22500,
    monthlyPriceHebdo: 90000,
    monthlyPriceBimensuel: 45000,
    bouquetSpecs: 'Scénographie comptoir, lobby, restaurant ou salons VIP',
    vaseSpecs: 'Contenants professionnels adaptés aux espaces de passage',
    recommendedFor: 'Hôtels, banques, restaurants, cabinets & conciergeries',
    serviceCommitments: [
      'Compositions adaptées à votre identité visuelle',
      'Facturation mensuelle entreprise & TVA déductible',
      'Assistance prioritaire 7j/7 et remplacements express',
    ],
  },
];

const senegalLocations = [
  'Saly Portudal',
  'Saly Niakhniakhal / Saly Joseph',
  'Mbour centre / Tefess / Warang',
  'Ngaparou / La Somone',
  'Dakar (Almadies, Plateau, Fann, Mermoz)',
  'Autre localité Petite Côte',
];

type Step = 'plan' | 'details' | 'payment' | 'confirmation';

export function SubscriptionForm({
  defaultPlan = 'particulier',
}: {
  defaultPlan?: 'particulier' | 'prestige' | 'entreprise';
}) {
  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<'particulier' | 'prestige' | 'entreprise'>(defaultPlan);
  const [frequency, setFrequency] = useState<'hebdomadaire' | 'bimensuelle'>('hebdomadaire');
  const [deliveryDay, setDeliveryDay] = useState<'Mardi' | 'Vendredi' | 'Samedi'>('Vendredi');
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'card'>('wave');
  const [mobilePlanTab, setMobilePlanTab] = useState<'particulier' | 'prestige' | 'entreprise'>(defaultPlan);

  const [orderId, setOrderId] = useState('284910');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: senegalLocations[0],
    address: '',
    paymentPhone: '',
    notes: '',
  });

  const selectedPlan = subscriptionPlans.find((p) => p.id === selectedPlanId) || subscriptionPlans[0];
  const monthlyTotal = frequency === 'hebdomadaire' ? selectedPlan.monthlyPriceHebdo : selectedPlan.monthlyPriceBimensuel;
  const deliveriesCount = frequency === 'hebdomadaire' ? 4 : 2;

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectPlan(id: 'particulier' | 'prestige' | 'entreprise') {
    setSelectedPlanId(id);
    setMobilePlanTab(id);
    setCurrentStep('details');
  }

  return (
    <div className="sub-flow-container" id="abonnement-tunnel">
      {/* ── Compact Stepper Bar ── */}
      <nav className="sub-stepper" aria-label="Étapes d’abonnement">
        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'plan' ? 'active' : 'completed'}`}
          onClick={() => setCurrentStep('plan')}
        >
          <span className="step-num">1</span>
          <span className="step-label">Formule</span>
        </button>

        <span className="stepper-sep">›</span>

        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'details' ? 'active' : currentStep === 'payment' || currentStep === 'confirmation' ? 'completed' : 'disabled'}`}
          onClick={() => currentStep !== 'plan' && setCurrentStep('details')}
          disabled={currentStep === 'plan'}
        >
          <span className="step-num">2</span>
          <span className="step-label">Livraison</span>
        </button>

        <span className="stepper-sep">›</span>

        <button
          type="button"
          className={`sub-step-pill ${currentStep === 'payment' ? 'active' : currentStep === 'confirmation' ? 'completed' : 'disabled'}`}
          onClick={() => (currentStep === 'payment' || currentStep === 'confirmation') && setCurrentStep('payment')}
          disabled={currentStep === 'plan' || currentStep === 'details'}
        >
          <span className="step-num">3</span>
          <span className="step-label">Paiement</span>
        </button>

        <span className="stepper-sep">›</span>

        <div className={`sub-step-pill ${currentStep === 'confirmation' ? 'active' : 'disabled'}`}>
          <span className="step-num">4</span>
          <span className="step-label">Confirmation</span>
        </div>
      </nav>

      {/* ── STEP 1: COMPACT OFFERS (ABOVE THE FOLD) ── */}
      {currentStep === 'plan' && (
        <div className="sub-step-screen sub-plans-screen">
          <div className="sub-screen-header">
            <div className="sub-freq-toggle-wrap">
              <span className="sub-toggle-label">Rythme :</span>
              <div className="sub-freq-toggle">
                <button
                  type="button"
                  className={`sub-freq-btn ${frequency === 'hebdomadaire' ? 'active' : ''}`}
                  onClick={() => setFrequency('hebdomadaire')}
                >
                  Hebdomadaire (4 passages / mois)
                </button>
                <button
                  type="button"
                  className={`sub-freq-btn ${frequency === 'bimensuelle' ? 'active' : ''}`}
                  onClick={() => setFrequency('bimensuelle')}
                >
                  Bimensuel (2 passages / mois)
                </button>
              </div>
            </div>

            {/* Mobile Tab Switcher for ultra-compact mobile view */}
            <div className="sub-mobile-tabs">
              {subscriptionPlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`sub-mobile-tab-btn ${mobilePlanTab === p.id ? 'active' : ''}`}
                  onClick={() => {
                    setMobilePlanTab(p.id);
                    setSelectedPlanId(p.id);
                  }}
                >
                  <span>{p.id === 'particulier' ? 'Villa' : p.id === 'prestige' ? 'Prestige ⭐' : 'Entreprise'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Compact Plan Columns */}
          <div className="sub-plans-grid">
            {subscriptionPlans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const isMobileActive = mobilePlanTab === p.id;
              const price = frequency === 'hebdomadaire' ? p.monthlyPriceHebdo : p.monthlyPriceBimensuel;

              return (
                <article
                  key={p.id}
                  className={`sub-compact-card ${p.id === 'prestige' ? 'featured' : ''} ${isSelected ? 'selected' : ''} ${isMobileActive ? 'mobile-visible' : 'mobile-hidden'}`}
                >
                  {p.badge && <span className="sub-card-badge">{p.badge}</span>}

                  <div className="sub-card-top">
                    <h3 className="sub-card-title">{p.name}</h3>
                    <p className="sub-card-tagline">{p.tagline}</p>
                  </div>

                  <div className="sub-card-pricing">
                    <div className="sub-price-main">
                      <strong>{price.toLocaleString('fr-FR')}</strong>
                      <span>FCFA / mois</span>
                    </div>
                    <div className="sub-price-detail">
                      soit {p.perDeliveryPrice.toLocaleString('fr-FR')} FCFA par livraison ({deliveriesCount} passages)
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
                    <div className="sub-spec-row">
                      <Truck size={16} className="spec-icon" />
                      <span>Livraison soignée incluse à Saly, Mbour, Ngaparou, Somone &amp; Dakar</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`sub-choose-cta ${p.id === 'prestige' ? 'button-pill-pink' : 'button-pill-outline'}`}
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
            <span>Fleurs fraîches sélectionnées le matin</span>
            <span className="dot">·</span>
            <span>Sans engagement (pause ou arrêt en 1 clic)</span>
          </div>
        </div>
      )}

      {/* ── STEP 2: COORDONNÉES & LIVRAISON (COMPACT 100VH) ── */}
      {currentStep === 'details' && (
        <div className="sub-step-screen sub-details-screen">
          {/* Active plan summary banner */}
          <div className="sub-active-plan-banner">
            <div className="plan-recap-left">
              <span className="recap-label">Formule sélectionnée :</span>
              <strong>{selectedPlan.name}</strong>
              <span className="recap-freq">
                ({frequency === 'hebdomadaire' ? 'Hebdomadaire · 4 passages' : 'Bimensuel · 2 passages'})
              </span>
              <span className="recap-price">{monthlyTotal.toLocaleString('fr-FR')} FCFA / mois</span>
            </div>
            <button
              type="button"
              className="sub-change-link"
              onClick={() => setCurrentStep('plan')}
            >
              Modifier
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.name || !formData.phone || !formData.address) return;
              if (!formData.paymentPhone) {
                setFormData((prev) => ({ ...prev, paymentPhone: prev.phone }));
              }
              setCurrentStep('payment');
            }}
            className="sub-details-form"
          >
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
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex : Sophie Faye"
                    className="form-input"
                  />
                </div>
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
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+221 77 123 45 67"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Zone de livraison <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="field-icon" />
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input form-select"
                  >
                    {senegalLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Jour de livraison préféré <span className="req">*</span>
                </label>
                <div className="sub-day-selector">
                  {(['Mardi', 'Vendredi', 'Samedi'] as const).map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`sub-day-pill ${deliveryDay === day ? 'active' : ''}`}
                      onClick={() => setDeliveryDay(day)}
                    >
                      Chaque {day}
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
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ex : Villa Baobab, Route du Golf, à côté du restaurant Le Teranga, Saly"
                    className="form-input"
                  />
                </div>
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
                  placeholder="Ex : Tons pastel préférés, code portail 1234, laisser à l’accueil..."
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

              <button type="submit" className="button-pill-pink sub-btn-next">
                <span>Passer au paiement</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP 3: PAIEMENT AVEC VRAIS LOGOS MOBILE MONEY (COMPACT 100VH) ── */}
      {currentStep === 'payment' && (
        <div className="sub-step-screen sub-payment-screen">
          <div className="sub-active-plan-banner">
            <div className="plan-recap-left">
              <span className="recap-label">Récapitulatif :</span>
              <strong>{selectedPlan.name}</strong>
              <span className="recap-freq">· Chaque {deliveryDay}</span>
              <span className="recap-price">{monthlyTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <button
              type="button"
              className="sub-change-link"
              onClick={() => setCurrentStep('details')}
            >
              Modifier coordonnées
            </button>
          </div>

          <div className="sub-payment-body">
            <h3 className="sub-payment-title">Choisissez votre mode de paiement sécurisé</h3>

            {/* Official logos payment cards */}
            <div className="sub-real-payment-methods">
              {/* 1. WAVE SÉNÉGAL */}
              <label
                className={`sub-real-pay-card ${paymentMethod === 'wave' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('wave')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wave"
                  checked={paymentMethod === 'wave'}
                  onChange={() => setPaymentMethod('wave')}
                  className="pay-radio"
                />
                <div className="pay-logo-frame wave-frame">
                  <Image
                    src="/payment/wave.png"
                    alt="Wave"
                    width={34}
                    height={34}
                    className="pay-logo-img"
                  />
                </div>
                <div className="pay-info">
                  <strong>Wave Sénégal</strong>
                  <span>Paiement mobile instantané (0% frais)</span>
                </div>
              </label>

              {/* 2. ORANGE MONEY */}
              <label
                className={`sub-real-pay-card ${paymentMethod === 'orange_money' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('orange_money')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="orange_money"
                  checked={paymentMethod === 'orange_money'}
                  onChange={() => setPaymentMethod('orange_money')}
                  className="pay-radio"
                />
                <div className="pay-logo-frame om-frame">
                  <Image
                    src="/payment/orange-money.svg"
                    alt="Orange Money"
                    width={30}
                    height={30}
                    className="pay-logo-img"
                  />
                </div>
                <div className="pay-info">
                  <strong>Orange Money</strong>
                  <span>Validation par code ou notification push</span>
                </div>
              </label>

              {/* 3. CARTE BANCAIRE */}
              <label
                className={`sub-real-pay-card ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="pay-radio"
                />
                <div className="pay-logo-frame cb-frame">
                  <Image
                    src="/payment/visa.svg"
                    alt="Visa"
                    width={32}
                    height={18}
                    className="pay-logo-img"
                  />
                  <Image
                    src="/payment/mastercard.svg"
                    alt="Mastercard"
                    width={26}
                    height={18}
                    className="pay-logo-img"
                  />
                </div>
                <div className="pay-info">
                  <strong>Carte Bancaire</strong>
                  <span>Visa &amp; Mastercard via passerelle bancaire</span>
                </div>
              </label>
            </div>

            {/* Mobile Money Account Number Field */}
            {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
              <div className="sub-pay-account-box">
                <label htmlFor="paymentPhone" className="form-label">
                  Numéro de compte {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} pour le prélèvement :
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    id="paymentPhone"
                    name="paymentPhone"
                    value={formData.paymentPhone || formData.phone}
                    onChange={handleInputChange}
                    placeholder="+221 7X XXX XX XX"
                    className="form-input"
                  />
                </div>
                <span className="pay-hint">
                  {paymentMethod === 'wave'
                    ? 'Une demande de paiement Wave sera émise sur ce numéro.'
                    : 'Un code de confirmation Orange Money vous sera transmis par SMS.'}
                </span>
              </div>
            )}

            <div className="sub-actions-row">
              <button
                type="button"
                className="button-pill-outline sub-btn-back"
                onClick={() => setCurrentStep('details')}
              >
                <ArrowLeft size={16} />
                <span>Modifier coordonnées</span>
              </button>

              <button
                type="button"
                className="button-pill-pink sub-btn-next"
                onClick={() => setCurrentStep('confirmation')}
              >
                <span>Confirmer</span>
                <Check size={18} />
              </button>
            </div>

            <div className="sub-security-note">
              <ShieldCheck size={16} />
              <span>Paiement sécurisé · Aucun engagement · Annulable en un clic à tout moment</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: CONFIRMATION & RÉCAPITULATIF (COMPACT 100VH) ── */}
      {currentStep === 'confirmation' && (
        <div className="sub-step-screen sub-confirm-screen">
          <div className="sub-confirm-card">
            <div className="confirm-icon-wrap">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>

            <h2 className="confirm-title">
              Abonnement confirmé {formData.name ? `pour ${formData.name}` : ''}
            </h2>
            <p className="confirm-subtitle">
              Votre souscription est enregistrée. Votre premier vase garni sera préparé par nos artisans fleuristes de Saly.
            </p>

            {/* Recap Ticket Compact */}
            <div className="sub-recap-ticket">
              <div className="recap-ticket-header">
                <span>RÉCAPITULATIF DE L’ABONNEMENT</span>
                <strong>N° ABO-{orderId}</strong>
              </div>

              <div className="recap-ticket-grid">
                <div className="ticket-item">
                  <span className="ticket-label">Formule :</span>
                  <strong>{selectedPlan.name}</strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Rythme :</span>
                  <strong>{frequency === 'hebdomadaire' ? 'Hebdomadaire (4 livraisons / mois)' : 'Bimensuel (2 livraisons / mois)'}</strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Premier passage :</span>
                  <strong>Chaque {deliveryDay}</strong>
                </div>

                <div className="ticket-item">
                  <span className="ticket-label">Montant :</span>
                  <strong className="text-pink">{monthlyTotal.toLocaleString('fr-FR')} FCFA / mois</strong>
                </div>

                <div className="ticket-item full">
                  <span className="ticket-label">Lieu &amp; Contact :</span>
                  <span>{formData.address || 'Adresse à préciser'}, {formData.location} · Tél : {formData.phone || 'Non renseigné'}</span>
                </div>

                <div className="ticket-item full">
                  <span className="ticket-label">Règlement :</span>
                  <span>
                    {paymentMethod === 'wave' && 'Wave Sénégal (0% de frais)'}
                    {paymentMethod === 'orange_money' && 'Orange Money Sénégal'}
                    {paymentMethod === 'card' && 'Carte Bancaire sécurisée'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions sans bouton WhatsApp */}
            <div className="confirm-actions-row">
              <button
                type="button"
                className="button-pill-outline sub-btn-action"
                onClick={() => {
                  setCurrentStep('plan');
                  setSelectedPlanId('particulier');
                }}
              >
                Nouvelle souscription
              </button>

              <Link href="/" className="button-pill-pink sub-btn-action">
                Retour à l’accueil
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
