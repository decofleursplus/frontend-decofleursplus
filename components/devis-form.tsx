'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  UploadCloud,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { submitQuote, uploadQuoteImages, QuoteItem } from '@/lib/api/quotes';

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
  const { user } = useAuth();
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdQuote, setCreatedQuote] = useState<QuoteItem | null>(null);

  // Pré-remplir les données si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray].slice(0, 5));
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
      createdQuote?.quoteNumber ? `• Réf Devis : ${createdQuote.quoteNumber}` : null,
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      // 1. Upload des images d'inspiration si fournies
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          uploadedUrls = await uploadQuoteImages(selectedFiles);
        } catch (uploadErr) {
          console.warn("Échec partiel de l'upload d'images, poursuite du devis :", uploadErr);
        }
      }

      // 2. Soumission du devis à l'API
      const res = await submitQuote({
        eventType: formData.eventType,
        eventDate: formData.eventDate || undefined,
        location: formData.location,
        budget: formData.budget,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        inspirationImages: uploadedUrls,
      });

      if (res.success && res.quote) {
        setCreatedQuote(res.quote);
      } else {
        setErrorMessage(
          res.error || 'Une erreur est survenue lors de l’envoi de votre devis.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Impossible de joindre le serveur. Veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
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

      {createdQuote ? (
        <div className="devis-success-box" role="status">
          <CheckCircle2 size={46} className="text-emerald-600" />
          <h3>Merci pour votre demande, {formData.name || 'cher client'} !</h3>
          <p>
            Votre devis N° <strong>{createdQuote.quoteNumber}</strong> a été enregistré avec succès par notre atelier floral. Nous vous recontacterons au{' '}
            <strong>{formData.phone || 'numéro renseigné'}</strong> avec une proposition scénographique personnalisée.
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
              onClick={() => {
                setCreatedQuote(null);
                setSelectedFiles([]);
              }}
              className="button-pill-outline"
            >
              Faire une autre demande
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="devis-form-body">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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

          {/* Section 4: Vision, Précisions & Photos d'inspiration */}
          <div className="devis-section">
            <div className="devis-section-title">
              <span className="devis-step-num">4</span>
              <span>Précisions &amp; Photos d’inspiration</span>
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

            {/* Photos d'inspiration */}
            <div className="form-group full-width mt-3">
              <label className="form-label">Photos ou inspirations d’ambiance (jusqu’à 5 photos)</label>
              <div className="flex flex-col gap-2">
                <label className="border-2 border-dashed border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#173f22] transition-colors bg-neutral-50/50">
                  <UploadCloud size={24} className="text-neutral-400 mb-1" />
                  <span className="text-xs font-medium text-neutral-600">
                    Cliquez pour choisir des images (JPG, PNG, WEBP)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs"
                      >
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Footer */}
          <div className="devis-actions-wrap">
            <div className="devis-buttons-row">
              <button
                type="submit"
                className="button-pill-pink devis-btn-submit flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Envoyer ma demande de devis</span>
                  </>
                )}
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
