'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Armchair,
  UtensilsCrossed,
  Flower2,
  Sliders,
  Check,
  Search,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { initialRentalEquipment } from '@/lib/admin/mock-data/rentals';
import { RentalEquipment } from '@/lib/admin/mock-data/types';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SiteFooter } from '@/components/site-footer';

export default function LocationEvenementiellePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [bookingEquipment, setBookingEquipment] = useState<RentalEquipment | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(true);
  const [isPriceSortOpen, setIsPriceSortOpen] = useState<boolean>(true);

  // Reservation Form State
  const [startDate, setStartDate] = useState('2024-03-20');
  const [endDate, setEndDate] = useState('2024-03-22');
  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+221 ');
  const [clientEmail, setClientEmail] = useState('');
  const [eventLocation, setEventLocation] = useState('Saly Portudal');
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);

  // Calculate rental duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1);

  const calculateTotal = (eq: RentalEquipment) => {
    return eq.pricePerDay * diffTime * quantity;
  };

  const calculateCaution = (eq: RentalEquipment) => {
    return eq.deposit * quantity;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    const ref = `RL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationSuccess(ref);
  };

  // Filter & Sort
  const filteredEquipment = useMemo(() => {
    let result = [...initialRentalEquipment];

    if (selectedCategory !== 'all') {
      result = result.filter((eq) => eq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (eq) =>
          eq.name.toLowerCase().includes(q) ||
          eq.description.toLowerCase().includes(q) ||
          eq.categoryLabel.toLowerCase().includes(q)
      );
    }

    if (onlyAvailable) {
      result = result.filter((eq) => eq.availableStock > 0);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    }

    return result;
  }, [selectedCategory, searchQuery, onlyAvailable, sortBy]);

  const categoryCounts = useMemo(() => {
    return {
      all: initialRentalEquipment.length,
      mobilier: initialRentalEquipment.filter((e) => e.category === 'mobilier').length,
      vaisselle: initialRentalEquipment.filter((e) => e.category === 'vaisselle').length,
      decoration: initialRentalEquipment.filter((e) => e.category === 'decoration').length,
      accessoires: initialRentalEquipment.filter((e) => e.category === 'accessoires').length,
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20">
        {/* ── 1. Hero Banner Panoramique Compact (Hauteur Réduite) ── */}
        <section className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[310px] lg:min-h-[340px] flex items-center p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-md border border-[#e6ded5]">
          <Image
            src="/images/location/location-hero.jpg"
            alt="Location événementielle mobilier et décoration banquet par Décofleur Plus"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Dégradé de lisibilité haute définition */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 pointer-events-none" />

          <div className="relative z-10 max-w-xl text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight mb-3 drop-shadow-sm">
              Location Événementielle
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium leading-relaxed mb-5 max-w-lg">
              Tout le matériel pour vos cérémonies et réceptions d&apos;exception. Mobilier, vaisselle raffinée, arches florales et accessoires à Saly, Dakar et sur toute la Petite Côte.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#catalogue"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Explorer le catalogue
                <ArrowRight size={15} />
              </a>
              <Link
                href="/devis?type=evenements"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                Demander un devis
              </Link>
            </div>
          </div>

          <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 text-white/80 text-xs font-medium backdrop-blur-md bg-black/35 px-3 py-1.5 rounded-full border border-white/15">
            <span>Banquet &amp; Mariage Prestige</span>
            <span>·</span>
            <span>Livraison Saly &amp; Dakar</span>
          </div>
        </section>

        {/* ── 2. Bandeau Catégories Compact & Ergonomique (UX Améliorée) ── */}
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === 'mobilier' ? 'all' : 'mobilier')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                selectedCategory === 'mobilier'
                  ? 'border-[#173f22] bg-[#f0f6f2] shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#eef7f0] text-[#193e23] flex items-center justify-center shrink-0">
                <Armchair size={20} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-[#173f22]">Mobilier</h2>
                <span className="text-[11px] text-gray-500">Tables, chaises ({categoryCounts.mobilier})</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === 'vaisselle' ? 'all' : 'vaisselle')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                selectedCategory === 'vaisselle'
                  ? 'border-[#173f22] bg-[#f0f6f2] shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#eef7f0] text-[#193e23] flex items-center justify-center shrink-0">
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-[#173f22]">Vaisselle</h2>
                <span className="text-[11px] text-gray-500">Arts de table ({categoryCounts.vaisselle})</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === 'decoration' ? 'all' : 'decoration')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                selectedCategory === 'decoration'
                  ? 'border-[#173f22] bg-[#f0f6f2] shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#eef7f0] text-[#193e23] flex items-center justify-center shrink-0">
                <Flower2 size={20} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-[#173f22]">Décoration</h2>
                <span className="text-[11px] text-gray-500">Arches, vases ({categoryCounts.decoration})</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === 'accessoires' ? 'all' : 'accessoires')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                selectedCategory === 'accessoires'
                  ? 'border-[#173f22] bg-[#f0f6f2] shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#eef7f0] text-[#193e23] flex items-center justify-center shrink-0">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-[#173f22]">Accessoires</h2>
                <span className="text-[11px] text-gray-500">Éclairage, supports ({categoryCounts.accessoires})</span>
              </div>
            </button>
          </div>
        </section>

        {/* ── 3. Catalogue avec Aside Filtres à Gauche (UX E-commerce Professionnelle) ── */}
        <div id="catalogue" className="pt-4 scroll-mt-20">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── Aside Filtres Latéral Collapsible ── */}
            <aside className="w-full lg:w-64 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs transition-all">
              {/* En-tête rétractable de la section */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                  aria-expanded={isFilterOpen}
                >
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-[#173f22]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#173f22]">
                      Filtres &amp; Recherche
                    </span>
                    {(selectedCategory !== 'all' || searchQuery || onlyAvailable || sortBy !== 'default') && (
                      <span className="w-2 h-2 rounded-full bg-[#c8436e]" title="Filtres actifs" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-700">
                      {isFilterOpen ? 'Réduire' : 'Déplier'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 text-gray-500 group-hover:text-gray-800 ${
                        isFilterOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Contenu rétractable */}
              {isFilterOpen && (
                <div className="space-y-5 pt-4 animate-in fade-in duration-200">
                  {/* Rechercher */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#173f22] mb-2.5">
                      Rechercher
                    </h3>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nom d'équipement..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50/60 focus:bg-white focus:border-[#173f22] text-xs outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Catégories Collapsible */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="w-full flex items-center justify-between text-left mb-2.5 group cursor-pointer"
                      aria-expanded={isCategoriesOpen}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#173f22] group-hover:text-[#235832] transition-colors">
                        Catégories
                      </h3>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${
                          isCategoriesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isCategoriesOpen && (
                      <div className="space-y-1.5 text-xs animate-in fade-in duration-200">
                        {[
                          { id: 'all', label: 'Tous les équipements', count: categoryCounts.all },
                          { id: 'mobilier', label: 'Mobilier', count: categoryCounts.mobilier },
                          { id: 'vaisselle', label: 'Vaisselle & Nappes', count: categoryCounts.vaisselle },
                          { id: 'decoration', label: 'Décoration & Arches', count: categoryCounts.decoration },
                          { id: 'accessoires', label: 'Accessoires & Lumières', count: categoryCounts.accessoires },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                              selectedCategory === cat.id
                                ? 'bg-[#173f22] text-white font-semibold shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                              selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {cat.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trier par prix & Disponibilité Collapsible */}
                  <div className="pt-3.5 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsPriceSortOpen(!isPriceSortOpen)}
                      className="w-full flex items-center justify-between text-left mb-2.5 group cursor-pointer"
                      aria-expanded={isPriceSortOpen}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#173f22] group-hover:text-[#235832] transition-colors">
                        Trier par prix
                      </h3>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${
                          isPriceSortOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isPriceSortOpen && (
                      <div className="space-y-3.5 animate-in fade-in duration-200">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/60 focus:bg-white text-xs outline-none"
                        >
                          <option value="default">Recommandés</option>
                          <option value="price-asc">Prix croissant</option>
                          <option value="price-desc">Prix décroissant</option>
                        </select>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={onlyAvailable}
                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                            className="w-4 h-4 rounded text-[#c8436e] focus:ring-[#c8436e]"
                          />
                          <span>En stock immédiatement</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Réinitialiser les filtres */}
                  {(selectedCategory !== 'all' || searchQuery || onlyAvailable || sortBy !== 'default') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                        setOnlyAvailable(false);
                        setSortBy('default');
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={12} /> Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </aside>

            {/* ── Grille Principale des Équipements ── */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173f22]">
                    Équipements disponibles
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredEquipment.length} article{filteredEquipment.length > 1 ? 's' : ''} trouvé{filteredEquipment.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {filteredEquipment.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Aucun équipement ne correspond à vos filtres.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setOnlyAvailable(false);
                      setSortBy('default');
                    }}
                    className="px-4 py-2 rounded-full bg-[#173f22] text-white text-xs font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={eq.image}
                          alt={eq.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#193e23]">
                          {eq.categoryLabel}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              eq.availableStock > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {eq.availableStock > 0 ? `${eq.availableStock} en stock` : 'Rupture'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-serif font-bold text-[#173f22]">
                            {eq.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {eq.description}
                          </p>
                          <div className="mt-3 text-[11px] text-gray-500 font-medium">
                            {eq.dimensions}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between">
                          <div>
                            <span className="text-[11px] text-gray-400 block">Tarif journalier</span>
                            <div className="text-base font-extrabold text-[#c8436e]">
                              {eq.pricePerDay.toLocaleString('fr-FR')} FCFA
                              <span className="text-xs font-normal text-gray-500"> / jour</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Caution : {eq.deposit.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setBookingEquipment(eq);
                              setReservationSuccess(null);
                            }}
                            className="px-4 py-2 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-xs shadow-xs transition-colors"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Modale de Réservation Interactive avec Caution Séparée ── */}
        {bookingEquipment && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[95vh] flex flex-col">
              {/* Header Modale Réduit */}
              <div className="py-3 px-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#c8436e] font-semibold">
                    Réservation
                  </span>
                  <h4 className="text-base font-serif font-bold text-[#173f22] leading-tight">
                    {bookingEquipment.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingEquipment(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Écran de Succès */}
              {reservationSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#173f22]">
                    Demande enregistrée !
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Votre réservation <strong className="text-gray-900">{reservationSuccess}</strong> pour {quantity}x {bookingEquipment.name} a été transmise. Nos équipes vérifient la disponibilité et vous contactent sous 24h.
                  </p>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-left space-y-1 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Période :</span>
                      <span className="font-semibold text-gray-800">{diffTime} jour(s) ({startDate} au {endDate})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coût ({quantity}x) :</span>
                      <span className="font-bold text-[#c8436e]">{calculateTotal(bookingEquipment).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 text-[11px]">
                      <span className="text-gray-500">Caution (séparée) :</span>
                      <span className="font-semibold text-gray-900">{calculateCaution(bookingEquipment).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingEquipment(null);
                        setReservationSuccess(null);
                      }}
                      className="w-full py-2.5 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-xs transition-colors"
                    >
                      Fermer et continuer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="p-4 sm:p-5 overflow-y-auto no-scrollbar scrollbar-none space-y-2.5 text-xs">
                  {/* Période & Quantité */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="startDate">
                        Mise à disposition *
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="endDate">
                        Restitution *
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="quantity">
                      Quantité souhaitée (max {bookingEquipment.availableStock}) *
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min={1}
                      max={bookingEquipment.availableStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(bookingEquipment.availableStock, Number(e.target.value))))}
                      className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                    />
                  </div>

                  {/* Coordonnées Client */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h5 className="font-bold text-gray-900 text-xs">Vos coordonnées</h5>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="clientName">
                        Nom et prénom *
                      </label>
                      <input
                        id="clientName"
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex : Moussa Ndiaye"
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="clientPhone">
                          Téléphone *
                        </label>
                        <input
                          id="clientPhone"
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+221 77 123 45 67"
                          className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-0.5" htmlFor="eventLocation">
                          Lieu de réception
                        </label>
                        <input
                          id="eventLocation"
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Saly, Dakar..."
                          className="w-full py-1.5 px-3 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Récapitulatif Financier Compact */}
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-[11px]">
                    <div className="flex justify-between text-gray-600">
                      <span>Durée de location :</span>
                      <span className="font-semibold text-gray-900">{diffTime} jour(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant ({quantity}x) :</span>
                      <span className="font-extrabold text-[#c8436e]">
                        {calculateTotal(bookingEquipment).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 text-[10px]">
                      <span className="text-gray-500">Caution garantie (séparée) :</span>
                      <span className="font-semibold text-gray-900">
                        {calculateCaution(bookingEquipment).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-xs shadow-sm transition-colors active:scale-98"
                  >
                    Valider
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
