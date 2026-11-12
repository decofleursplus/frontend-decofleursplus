'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Armchair,
  CalendarDays,
  ChevronDown,
  Flower2,
  Loader2,
  Package,
  RotateCcw,
  Search,
  Sliders,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/client';
import {
  getRentalCategories,
  getRentals,
  type RentalCategory,
  type RentalEquipment,
} from '@/lib/api/rentals';
import { addDaysToInputValue, dateInputFromToday, formatFcfa } from '@/lib/rental-utils';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SiteFooter } from '@/components/site-footer';
import { RentalBookingForm } from './_components/rental-booking-form';

const CATEGORY_ICONS: Record<string, typeof Armchair> = {
  mobilier: Armchair,
  vaisselle: UtensilsCrossed,
  decoration: Flower2,
  accessoires: Sliders,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export default function LocationEvenementiellePage() {
  // Filtres envoyés au serveur
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  // Période : le stock affiché est celui disponible sur ces dates (calculé par le serveur)
  const [usePeriod, setUsePeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => dateInputFromToday(1));
  const [periodEnd, setPeriodEnd] = useState(() => dateInputFromToday(2));
  // Tri et filtre d'affichage
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(true);
  const [isPriceSortOpen, setIsPriceSortOpen] = useState<boolean>(true);

  const [categories, setCategories] = useState<RentalCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<RentalEquipment[]>([]);
  // Chargement dérivé : la requête courante n'est pas encore celle qui a été chargée.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [bookingEquipment, setBookingEquipment] = useState<RentalEquipment | null>(null);

  const today = dateInputFromToday(0);
  const periodValid = !usePeriod || (periodStart >= today && periodEnd > periodStart);

  // Recherche envoyée au serveur après une courte pause de saisie
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [categoriesRetry, setCategoriesRetry] = useState(0);
  const loadCategories = () => setCategoriesRetry((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    getRentalCategories()
      .then((items) => {
        if (cancelled) return;
        setCategories(items);
        setCategoriesError(null);
      })
      .catch((err) => {
        if (!cancelled) setCategoriesError(errorMessage(err, 'Impossible de charger les catégories.'));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, categoriesRetry]);

  const requestKey = JSON.stringify([selectedCategory, search, usePeriod, periodStart, periodEnd, reloadKey]);
  const loading = periodValid && loadedKey !== requestKey;

  useEffect(() => {
    if (!periodValid) return;
    let cancelled = false;
    getRentals({
      category: selectedCategory,
      search: search || undefined,
      from: usePeriod ? periodStart : undefined,
      to: usePeriod ? periodEnd : undefined,
    })
      .then((items) => {
        if (cancelled) return;
        setEquipment(items);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(errorMessage(err, 'Impossible de charger le catalogue de location.'));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, search, usePeriod, periodStart, periodEnd, periodValid, requestKey]);

  const displayedEquipment = useMemo(() => {
    let result = [...equipment];
    if (onlyAvailable) result = result.filter((eq) => eq.availableStock > 0);
    if (sortBy === 'price-asc') result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    return result;
  }, [equipment, onlyAvailable, sortBy]);

  const tileCategories = categories.filter((c) => c.key !== 'all');
  const filtersActive =
    selectedCategory !== 'all' || searchInput !== '' || onlyAvailable || sortBy !== 'default' || usePeriod;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchInput('');
    setSearch('');
    setOnlyAvailable(false);
    setSortBy('default');
    setUsePeriod(false);
  };

  const handlePeriodStart = (value: string) => {
    setPeriodStart(value);
    if (value && periodEnd <= value) setPeriodEnd(addDaysToInputValue(value, 1));
  };

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

        {/* ── 2. Bandeau des catégories (données réelles) ── */}
        <section className="mb-10">
          {categoriesError ? (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
              <span className="flex items-center gap-2">
                <AlertCircle size={15} /> {categoriesError}
              </span>
              <button type="button" onClick={loadCategories} className="font-semibold underline">
                Réessayer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {tileCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.key] ?? Package;
                const active = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(active ? 'all' : cat.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      active
                        ? 'border-[#173f22] bg-[#f0f6f2] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#eef7f0] text-[#193e23] flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-semibold text-[#173f22]">{cat.label}</h2>
                      <span className="text-[11px] text-gray-500">
                        {cat.count} équipement{cat.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 3. Catalogue avec filtres ── */}
        <div id="catalogue" className="pt-4 scroll-mt-20">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <aside className="w-full lg:w-64 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs transition-all">
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
                    {filtersActive && <span className="w-2 h-2 rounded-full bg-[#c8436e]" title="Filtres actifs" />}
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

              {isFilterOpen && (
                <div className="space-y-5 pt-4 animate-in fade-in duration-200">
                  {/* Rechercher */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#173f22] mb-2.5">Rechercher</h3>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Nom d'équipement..."
                        aria-label="Rechercher un équipement"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50/60 focus:bg-white focus:border-[#173f22] text-xs outline-none transition-all"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => setSearchInput('')}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                          aria-label="Effacer la recherche"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Vos dates */}
                  <div className="pt-3.5 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#173f22] mb-2.5">
                      <input
                        type="checkbox"
                        checked={usePeriod}
                        onChange={(e) => setUsePeriod(e.target.checked)}
                        className="w-4 h-4 rounded text-[#c8436e] focus:ring-[#c8436e]"
                      />
                      <CalendarDays size={14} /> Disponibilité sur mes dates
                    </label>
                    {usePeriod && (
                      <div className="space-y-2 text-xs animate-in fade-in duration-200">
                        <div>
                          <label className="block text-gray-600 mb-0.5" htmlFor="period-start">Du</label>
                          <input
                            id="period-start"
                            type="date"
                            min={today}
                            value={periodStart}
                            onChange={(e) => handlePeriodStart(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-0.5" htmlFor="period-end">Au</label>
                          <input
                            id="period-end"
                            type="date"
                            min={periodStart ? addDaysToInputValue(periodStart, 1) : today}
                            value={periodEnd}
                            onChange={(e) => setPeriodEnd(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50/60 focus:bg-white outline-none"
                          />
                        </div>
                        {!periodValid && (
                          <p className="text-red-600">Choisissez une période à venir, avec une restitution après la mise à disposition.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Catégories */}
                  <div className="pt-3.5 border-t border-gray-100">
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
                        {categories.map((cat) => (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                              selectedCategory === cat.key
                                ? 'bg-[#173f22] text-white font-semibold shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                                selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {cat.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tri & disponibilité */}
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
                          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                          aria-label="Trier par prix"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50/60 focus:bg-white text-xs outline-none"
                        >
                          <option value="default">Plus récents</option>
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
                          <span>{usePeriod ? 'Disponibles sur mes dates' : 'En stock uniquement'}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {filtersActive && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={12} /> Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </aside>

            {/* ── Grille des équipements ── */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173f22]">Équipements à louer</h2>
                  <p className="text-xs text-gray-500 mt-0.5" data-testid="rental-count">
                    {loading
                      ? 'Chargement…'
                      : `${displayedEquipment.length} article${displayedEquipment.length > 1 ? 's' : ''} trouvé${displayedEquipment.length > 1 ? 's' : ''}`}
                    {usePeriod && periodValid && !loading && ' · stock affiché pour vos dates'}
                  </p>
                </div>
              </div>

              {loadError ? (
                <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-200 space-y-3">
                  <AlertCircle className="mx-auto text-red-500" size={28} />
                  <p className="text-sm text-red-700">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="px-4 py-2 rounded-full bg-[#173f22] text-white text-xs font-medium"
                  >
                    Réessayer
                  </button>
                </div>
              ) : loading && equipment.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
                  <Loader2 className="animate-spin text-[#173f22]" size={24} />
                  Chargement du catalogue de location…
                </div>
              ) : displayedEquipment.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    {filtersActive
                      ? 'Aucun équipement ne correspond à vos filtres.'
                      : 'Aucun équipement n’est proposé à la location pour le moment.'}
                  </p>
                  {filtersActive && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-full bg-[#173f22] text-white text-xs font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity ${loading ? 'opacity-60' : ''}`}
                  data-testid="rental-grid"
                >
                  {displayedEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col group"
                      data-testid="rental-card"
                    >
                      <Link href={`/location/${eq.slug}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100 block">
                        {eq.image ? (
                          <Image
                            src={eq.image}
                            alt={eq.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <Package size={40} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#193e23]">
                          {eq.categoryLabel}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              eq.availableStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {eq.availableStock > 0
                              ? `${eq.availableStock} disponible${eq.availableStock > 1 ? 's' : ''}`
                              : usePeriod
                                ? 'Indisponible sur ces dates'
                                : 'Indisponible'}
                          </span>
                        </div>
                      </Link>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-serif font-bold text-[#173f22]">
                            <Link href={`/location/${eq.slug}`} className="hover:text-[#c8436e] transition-colors">
                              {eq.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{eq.description}</p>
                          {eq.dimensions && (
                            <div className="mt-3 text-[11px] text-gray-500 font-medium">{eq.dimensions}</div>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-gray-400 block">Tarif journalier</span>
                            <div className="text-base font-extrabold text-[#c8436e]">
                              {formatFcfa(eq.pricePerDay)}
                              <span className="text-xs font-normal text-gray-500"> / jour</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Caution : {formatFcfa(eq.deposit)}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setBookingEquipment(eq)}
                              disabled={eq.availableStock <= 0}
                              className="px-4 py-2 rounded-full bg-[#173f22] hover:bg-[#12311a] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Réserver
                            </button>
                            <Link
                              href={`/location/${eq.slug}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#173f22] hover:text-[#c8436e]"
                            >
                              Voir la fiche <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Modale de réservation ── */}
        {bookingEquipment && (
          <div
            className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={`Réserver ${bookingEquipment.name}`}
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[95vh] flex flex-col">
              <div className="py-3 px-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#c8436e] font-semibold">Réservation</span>
                  <h4 className="text-base font-serif font-bold text-[#173f22] leading-tight">{bookingEquipment.name}</h4>
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
              <div className="overflow-y-auto">
                <RentalBookingForm
                  equipment={bookingEquipment}
                  initialStartDate={usePeriod && periodValid ? periodStart : undefined}
                  initialEndDate={usePeriod && periodValid ? periodEnd : undefined}
                  onReserved={() => setReloadKey((k) => k + 1)}
                  onClose={() => setBookingEquipment(null)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
