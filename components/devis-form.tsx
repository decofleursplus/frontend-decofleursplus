'use client';

import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Heart,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Building2,
  User,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';

const projectTypes = [
  { id: 'mariage', label: 'Mariage & Cérémonie', icon: Heart, tag: 'Populaire' },
  { id: 'anniversaire', label: 'Fête & Anniversaire privé', icon: Sparkles },
  { id: 'hotel', label: 'Hôtel, Restaurant & Plage', icon: Building2 },
  { id: 'villa', label: 'Décoration florale de Villa', icon: Home },
  { id: 'paysage', label: 'Paysagisme & Espaces verts', icon: Sprout },
  { id: 'autre', label: 'Autre projet sur mesure', icon: MessageSquare },
];

const budgetRanges = [
  'Moins de 200 000 FCFA',
  '200 000 à 500 000 FCFA',
  '500 000 à 1 500 000 FCFA',
  'Plus de 1 500 000 FCFA',
  'À définir selon la proposition',
];

const locations = [
  'Saly Portudal',
  'Saly Niakhniakhal / Saly Joseph',
  'Mbour centre / Tefess / Warang',
  'Ngaparou / La Somone',
  'Dakar & Almadies / Plateau',
  'Îles du Saloum',
  'Autre localité (Sénégal)',
];

export function DevisForm() {
  const [formData, setFormData] = useState({
    eventType: projectTypes[0].label,
    eventDate: '',
    location: locations[0],
    budget: budgetRanges[0],
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function generateWhatsAppText() {
    const lines = [
      'Bonjour DécoFleur Plus, je souhaite demander un devis sur mesure :',
      `• Projet : ${formData.eventType}`,
      formData.eventDate ? `• Date souhaitée : ${formData.eventDate}` : null,
      `• Lieu : ${formData.location}`,
      `• Budget estimé : ${formData.budget}`,
      formData.name ? `• Nom : ${formData.name}` : null,
      formData.phone ? `• Téléphone : ${formData.phone}` : null,
      formData.email ? `• Email : ${formData.email}` : null,
      formData.notes ? `• Détails : ${formData.notes}` : null,
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="devis-form-card" id="devis" aria-labelledby="devis-heading">
      {/* Header */}
      <div className="devis-header">
        <div className="devis-badge">
          <Sparkles size={15} />
          <span>Atelier Scénographie &amp; Événementiel</span>
        </div>
        <h2 id="devis-heading" className="devis-title">
          Demandez votre devis personnalisé
        </h2>
        <p className="devis-subtitle">
          Mariages, réceptions privées, hôtels, villas et aménagements paysagers sur la Petite Côte et à Dakar.
          Recevez une proposition adaptée sous 24h ouvrées ou échangez en direct sur WhatsApp.
        </p>

        <div className="devis-perks">
          <div className="devis-perk-item">
            <Clock size={15} />
            <span>Réponse sous 24h</span>
          </div>
          <div className="devis-perk-item">
            <MapPin size={15} />
            <span>Repérage à Saly &amp; Petite Côte</span>
          </div>
          <div className="devis-perk-item">
            <ShieldCheck size={15} />
            <span>Devis 100% gratuit &amp; sans engagement</span>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="devis-success-box" role="status">
          <CheckCircle2 size={46} className="text-emerald-600" />
          <h3>Merci pour votre demande, {formData.name || 'cher client'} !</h3>
          <p>
            Notre atelier floral de Saly Portudal a bien reçu votre projet. Nous vous recontacterons au{' '}
            <strong>{formData.phone || 'numéro renseigné'}</strong> avec une proposition sur mesure.
          </p>
          <div className="devis-success-actions">
            <a
              href={`https://wa.me/221779417860?text=${generateWhatsAppText()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="devis-btn-whatsapp"
            >
              <WhatsAppIcon size={18} /> Transmettre aussi sur WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="button-pill-outline"
            >
              Modifier ma demande
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="devis-form-body">
          {/* Section 1: Nature du projet */}
          <div className="devis-section">
            <div className="devis-section-title">
              <span className="devis-step-num">1</span>
              <span>Type de projet ou événement <span className="req">*</span></span>
            </div>
            <div className="devis-types-grid">
              {projectTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = formData.eventType === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`devis-type-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, eventType: t.label }))}
                  >
                    <div className="devis-type-icon">
                      <Icon size={18} />
                    </div>
                    <span className="devis-type-label">{t.label}</span>
                    {t.tag && <span className="devis-type-tag">{t.tag}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Planning & Budget */}
          <div className="devis-section">
            <div className="devis-section-title">
              <span className="devis-step-num">2</span>
              <span>Date, lieu et budget estimé</span>
            </div>
            <div className="devis-fields-grid">
              <div className="form-group">
                <label htmlFor="eventDate" className="form-label">
                  Date souhaitée de l’événement
                </label>
                <div className="input-with-icon">
                  <Calendar size={18} className="field-icon" />
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Lieu de réception ou d’intervention <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="field-icon" />
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input form-select"
                    required
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="budget" className="form-label">
                  Budget estimatif envisagé
                </label>
                <div className="input-with-icon">
                  <Coins size={18} className="field-icon" />
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    {budgetRanges.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Coordonnées de contact */}
          <div className="devis-section">
            <div className="devis-section-title">
              <span className="devis-step-num">3</span>
              <span>Vos coordonnées de contact</span>
            </div>
            <div className="devis-fields-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Votre nom complet <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Aïssatou Diop"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Numéro de téléphone / WhatsApp <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: +221 77 123 45 67"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="email" className="form-label">
                  Adresse e-mail <span className="opt">(optionnel)</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@exemple.sn"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Vision & Précisions */}
          <div className="devis-section">
            <div className="devis-section-title">
              <span className="devis-step-num">4</span>
              <span>Précisions sur votre projet</span>
            </div>
            <div className="form-group full-width">
              <label htmlFor="notes" className="form-label">
                Décrivez vos envies (thème, couleurs, nombre d’invités, inspiration…)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Décrivez vos envies : bouquet de mariée, arche fleurie, centres de table, vaisselle souhaitée, ambiance tropicale ou pastel..."
                className="form-input form-textarea"
              />
            </div>
          </div>

          {/* Actions & Footer */}
          <div className="devis-actions-wrap">
            <div className="devis-buttons-row">
              <button type="submit" className="button-pill-pink devis-btn-submit">
                <Send size={18} />
                <span>Envoyer ma demande de devis</span>
              </button>

              <a
                href={`https://wa.me/221779417860?text=${generateWhatsAppText()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="devis-btn-whatsapp"
              >
                <WhatsAppIcon size={20} />
                <span>Demander en direct sur WhatsApp</span>
              </a>
            </div>

            <div className="devis-reassurance-footer">
              <ShieldCheck size={16} />
              <span>Vos données restent strictement confidentielles · Atelier DécoFleur Plus Saly Portudal</span>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
