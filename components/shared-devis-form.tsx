'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  ArrowRight,
  ArrowLeft,
  X,
  Sprout,
  PartyPopper,
} from 'lucide-react';
import { submitQuote, uploadQuoteImages } from '@/lib/api/quotes';
import { useAuth } from '@/components/auth-provider';

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;

interface PhotoDraft {
  file: File;
  preview: string;
}

export type DevisServiceType = 'paysagisme' | 'evenements';

interface SharedDevisFormProps {
  initialServiceType?: DevisServiceType;
  initialPrestation?: string;
  /** Produit de la boutique à l'origine de la demande (`?produit=`) */
  initialProduct?: string;
  /** Réalisation ou inspiration citée (`?inspiration=`) */
  initialInspiration?: string;
  className?: string;
}

export function SharedDevisForm({
  initialServiceType = 'evenements',
  initialPrestation = '',
  initialProduct = '',
  initialInspiration = '',
  className = '',
}: SharedDevisFormProps) {
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState<DevisServiceType>(initialServiceType);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // Étape 1 : Coordonnées (pré-remplies pour un client connecté)
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone || '+221 ');
  const [company, setCompany] = useState('');

  // Étape 2 : Détails du Projet
  const [prestationType, setPrestationType] = useState(
    initialPrestation || (initialServiceType === 'paysagisme' ? 'Conception de jardins' : 'Mariage & Cérémonie')
  );
  const [spaceType, setSpaceType] = useState(initialServiceType === 'paysagisme' ? 'Villa' : 'Salle de réception');
  const [metricValue, setMetricValue] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [location, setLocation] = useState('Saly Portudal');
  const [budget, setBudget] = useState('500 000 - 1 500 000 FCFA');
  const [description, setDescription] = useState(() => {
    const refs = [
      initialProduct && `Inspiré de la création « ${initialProduct.replace(/-/g, ' ')} » de la boutique.`,
      initialInspiration && `Inspiré de la réalisation « ${initialInspiration} ».`,
    ].filter(Boolean);
    return refs.length ? `${refs.join('\n')}\n` : '';
  });

  // Étape 3 : Photos (envoyées au moment de la validation)
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);

  // Libère les aperçus locaux quand le formulaire disparaît
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.preview)), [photos]);

  const handleServiceChange = (type: DevisServiceType) => {
    setServiceType(type);
    if (type === 'paysagisme') {
      setPrestationType('Conception de jardins');
      setSpaceType('Villa');
    } else {
      setPrestationType('Mariage & Cérémonie');
      setSpaceType('Salle de réception');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    const rejected = files.filter((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > MAX_PHOTO_BYTES);
    const accepted = files.filter((f) => !rejected.includes(f)).slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    setPhotos((prev) => [...prev, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    setStepError(
      rejected.length
        ? `${rejected.length} fichier(s) ignoré(s) : formats JPG, PNG ou WEBP de 5 Mo maximum.`
        : photos.length + files.length > MAX_PHOTOS
          ? `${MAX_PHOTOS} photos maximum par demande.`
          : null,
    );
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) return setStepError('Indiquez votre nom complet.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setStepError('Adresse email invalide.');
    if (!PHONE_PATTERN.test(phone.trim())) return setStepError('Numéro de téléphone invalide (ex. +221 77 123 45 67).');
    setStepError(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim().length < 2 || !description.trim()) {
      return setStepError('Renseignez la localisation et une brève description de votre projet.');
    }
    if (desiredDate && new Date(desiredDate) < new Date(new Date().toDateString())) {
      return setStepError('La date souhaitée ne peut pas être dans le passé.');
    }
    setStepError(null);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStepError(null);

    try {
      const inspirationImages = photos.length ? await uploadQuoteImages(photos.map((p) => p.file)) : [];
      const guests = serviceType === 'evenements' && metricValue ? Number.parseInt(metricValue, 10) : NaN;
      const notes = [
        description.trim(),
        `Type de lieu : ${spaceType}`,
        serviceType === 'paysagisme' && metricValue ? `Surface approximative : ${metricValue} m²` : null,
        company.trim() ? `Société : ${company.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const quote = await submitQuote({
        name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        eventType: `${serviceType === 'paysagisme' ? 'Paysagisme' : 'Événement'} — ${prestationType}`,
        location: location.trim(),
        budget: budget || undefined,
        eventDate: desiredDate || undefined,
        estimatedGuests: Number.isFinite(guests) && guests > 0 ? guests : undefined,
        inspirationImages,
        notes,
      });
      setSubmittedRef(quote.quoteNumber);
      setCurrentStep(4);
    } catch (err) {
      setStepError(err instanceof Error ? err.message : 'Votre demande n’a pas pu être envoyée. Réessayez dans un instant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* ── Sélecteur de Métier (Paysagisme / Événements) si à l'étape 1 ── */}
      {currentStep < 4 && (
        <div className="flex items-center justify-center gap-2 mb-6 p-1 bg-gray-100 rounded-full w-fit mx-auto border border-gray-200">
          <button
            type="button"
            onClick={() => handleServiceChange('paysagisme')}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              serviceType === 'paysagisme'
                ? 'bg-[#173f22] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sprout size={14} />
            <span>Paysagisme &amp; Espaces Verts</span>
          </button>
          <button
            type="button"
            onClick={() => handleServiceChange('evenements')}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              serviceType === 'evenements'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PartyPopper size={14} />
            Événements &amp; Scénographie
          </button>
        </div>
      )}

      {/* ── Stepper Visuel Compact (Étapes 1, 2, 3) ── */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between mb-6 px-4 max-w-lg mx-auto relative">
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />

          {/* Étape 1 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 1
                  ? 'bg-[#173f22] text-white shadow-xs'
                  : 'bg-white text-gray-400 border border-gray-300'
              }`}
            >
              1
            </div>
            <span className={`text-[11px] font-medium ${currentStep >= 1 ? 'text-[#173f22]' : 'text-gray-400'}`}>
              Coordonnées
            </span>
          </div>

          {/* Étape 2 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 2
                  ? 'bg-[#173f22] text-white shadow-xs'
                  : 'bg-white text-gray-400 border border-gray-300'
              }`}
            >
              2
            </div>
            <span className={`text-[11px] font-medium ${currentStep >= 2 ? 'text-[#173f22]' : 'text-gray-400'}`}>
              Détails du projet
            </span>
          </div>

          {/* Étape 3 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 3
                  ? 'bg-[#173f22] text-white shadow-xs'
                  : 'bg-white text-gray-400 border border-gray-300'
              }`}
            >
              3
            </div>
            <span className={`text-[11px] font-medium ${currentStep >= 3 ? 'text-[#173f22]' : 'text-gray-400'}`}>
              Photos &amp; Plans
            </span>
          </div>
        </div>
      )}

      {/* ── Conteneur de Carte Formulaire Épuré sur Fond Blanc ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        {/* ── Étape 1 : Coordonnées ── */}
        {stepError && currentStep < 4 && (
          <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-800">
            {stepError}
          </p>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#173f22]">
                1. Vos coordonnées de contact
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Renseignez vos coordonnées pour que notre équipe vous réponde sous 24h.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="fullName">
                  Nom et prénom <span className="text-[#c8436e]">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    id="fullName"
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex : Mariama Diallo"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
                  Adresse e-mail <span className="text-[#c8436e]">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mariama@exemple.sn"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="phone">
                  Téléphone / WhatsApp <span className="text-[#c8436e]">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    id="phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="company">
                  Entreprise ou établissement (optionnel)
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom de l'hôtel, villa ou société"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-sm shadow-sm transition-all active:scale-95"
              >
                Continuer vers mon projet
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── Étape 2 : Détails du Projet (Condensée, sans checkbox d'entretien) ── */}
        {currentStep === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-4">
            <div className="border-b border-gray-100 pb-2.5">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#173f22]">
                2. Spécificités de votre projet ({serviceType === 'paysagisme' ? 'Paysagisme' : 'Événement'})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Précisez vos besoins pour nous permettre d&apos;estimer l&apos;envergure de la prestation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="prestationType">
                  Prestation souhaitée <span className="text-[#c8436e]">*</span>
                </label>
                <select
                  id="prestationType"
                  value={prestationType}
                  onChange={(e) => setPrestationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm"
                >
                  {serviceType === 'paysagisme' ? (
                    <>
                      <option value="Conception de jardins">Conception de jardins</option>
                      <option value="Terrasses et balcons">Terrasses et balcons</option>
                      <option value="Espaces extérieurs (villas)">Espaces extérieurs (villas)</option>
                      <option value="Décoration végétale intérieure">Décoration végétale intérieure</option>
                      <option value="Espaces professionnels">Espaces professionnels (hôtels, restos)</option>
                      <option value="Entretien régulier">Entretien des espaces verts</option>
                    </>
                  ) : (
                    <>
                      <option value="Mariage & Cérémonie">Mariage &amp; Cérémonie</option>
                      <option value="Fête & Anniversaire privé">Fête &amp; Anniversaire privé</option>
                      <option value="Hôtel & Restaurant">Hôtel &amp; Restaurant de plage</option>
                      <option value="Soirée d'entreprise">Soirée d&apos;entreprise</option>
                      <option value="Décoration de villa">Décoration florale de villa</option>
                      <option value="Autre événement">Autre projet sur mesure</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="spaceType">
                  Type de lieu <span className="text-[#c8436e]">*</span>
                </label>
                <select
                  id="spaceType"
                  value={spaceType}
                  onChange={(e) => setSpaceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm"
                >
                  {serviceType === 'paysagisme' ? (
                    <>
                      <option value="Villa">Villa privée</option>
                      <option value="Jardin">Jardin résidentiel</option>
                      <option value="Terrasse">Terrasse ou balcon</option>
                      <option value="Hôtel">Hôtel ou lodge</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Bureaux">Bureaux d&apos;entreprise</option>
                    </>
                  ) : (
                    <>
                      <option value="Salle de réception">Salle de réception</option>
                      <option value="Plage / Plein air">Bord de mer / Plage</option>
                      <option value="Hôtel / Domaine">Hôtel / Domaine</option>
                      <option value="Villa privée">Villa privée</option>
                      <option value="Jardin">Jardin / Domaine extérieur</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="metricValue">
                  {serviceType === 'paysagisme' ? 'Surface approx.' : 'Nombre d’invités approx.'}
                </label>
                <div className="relative">
                  <input
                    id="metricValue"
                    type="number"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    placeholder={serviceType === 'paysagisme' ? 'Ex : 150' : 'Ex : 80'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm pr-12"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-gray-400">
                    {serviceType === 'paysagisme' ? 'm²' : 'pers.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="desiredDate">
                  Date souhaitée
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    id="desiredDate"
                    type="date"
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="location">
                  Localisation du projet <span className="text-[#c8436e]">*</span>
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    id="location"
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex : Saly Portudal, Almadies Dakar, Somone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="budget">
                  Budget indicatif (optionnel)
                </label>
                <select
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm"
                >
                  <option value="Moins de 500 000 FCFA">Moins de 500 000 FCFA</option>
                  <option value="500 000 - 1 500 000 FCFA">500 000 - 1 500 000 FCFA</option>
                  <option value="1 500 000 - 5 000 000 FCFA">1 500 000 - 5 000 000 FCFA</option>
                  <option value="Plus de 5 000 000 FCFA">Plus de 5 000 000 FCFA</option>
                  <option value="À définir ensemble">À définir selon les propositions</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="description">
                  Description du projet <span className="text-[#c8436e]">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    serviceType === 'paysagisme'
                      ? 'Décrivez votre espace : style souhaité, exposition, végétaux préférés, contraintes arrosage ou sol...'
                      : 'Décrivez votre vision : thème couleur, arche florale, compositions de table, vaisselle souhaitée...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-[#173f22] outline-none text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium"
              >
                <ArrowLeft size={14} /> Retour
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95"
              >
                Étape suivante : Photos &amp; Plans
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── Étape 3 : Photos & Téléversement ── */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="border-b border-gray-100 pb-2.5">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#173f22]">
                3. Photos de votre espace ou inspirations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ajoutez des photos de votre terrain, terrasse ou inspirations pour un devis précis.
              </p>
            </div>

            <label className="border-2 border-dashed border-gray-300 hover:border-[#173f22] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-white transition-all text-center">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#173f22] flex items-center justify-center mb-2">
                <UploadCloud size={22} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                Cliquez ou glissez vos photos ici
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                JPG, PNG, WEBP (max 5 Mo)
              </span>
            </label>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {photos.map(({ preview: src }, index) => (
                  <div
                    key={src}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) avant envoi */}
                    <img src={src} alt={`Photo aperçu ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      title="Supprimer la photo"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Récapitulatif Rapide avant envoi */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Demandeur :</span>
                <span className="font-semibold text-gray-800">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service :</span>
                <span className="font-semibold text-[#173f22]">{prestationType} · {location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium"
              >
                <ArrowLeft size={14} /> Retour
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Envoyer ma demande de devis'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── Étape 4 : Confirmation Épurée (Sans bouton WhatsApp) ── */}
        {currentStep === 4 && (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#173f22] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-[#173f22]">
                Votre demande de devis est enregistrée !
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1">
                Merci {fullName}. Nos équipes étudient votre projet avec soin et vous transmettent une proposition détaillée sous 24 à 48 heures ouvrées
                {user ? ' : vous la retrouverez dans « Mes devis » de votre espace client.' : '.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-500">Numéro de dossier :</span>
                <span className="font-bold text-[#173f22]">{submittedRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service :</span>
                <span className="font-medium text-gray-800">{prestationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Localisation :</span>
                <span className="font-medium text-gray-800">{location}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setSubmittedRef(null);
                  setPhotos([]);
                  setDescription('');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
              >
                Nouvelle demande
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
