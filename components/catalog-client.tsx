'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, Loader2, Flower2, RefreshCw, Search } from 'lucide-react';
import type { Product } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { getProducts, getCategories, type ApiCategory, type ProductSort } from '@/lib/api/catalog';

const PAGE_SIZE = 24;
const PRICE_MAX = 200000;

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'popular', label: 'Populaires' },
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom (A → Z)' },
];

export interface CatalogClientProps {
  /** Page catégorie : la catégorie est imposée, seules ses sous-catégories sont proposées. */
  lockedCategory?: { slug: string; name: string; subCategories?: { slug: string; name: string }[] };
}

export function CatalogClient(props: CatalogClientProps) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={32} className="auth-spinner" color="var(--pink)" />
        </div>
      }
    >
      <CatalogInner {...props} />
    </Suspense>
  );
}

function CatalogInner({ lockedCategory }: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // L'URL est la source de vérité de la recherche et de la catégorie (lien du header, partage, retour arrière)
  const urlQuery = searchParams.get('q') ?? '';
  const category = lockedCategory?.slug ?? searchParams.get('category') ?? '';
  const subCategory = searchParams.get('sous-categorie') ?? '';

  const [queryInput, setQueryInput] = useState(urlQuery);
  const [sort, setSort] = useState<ProductSort>('popular');
  const [inStock, setInStock] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [onSale, setOnSale] = useState(searchParams.get('promo') === '1');
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Recherche lancée depuis le header pendant qu'on est déjà sur la page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation du champ avec l'URL
    setQueryInput(urlQuery);
  }, [urlQuery]);

  const updateUrl = useCallback(
    (changes: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Saisie : l'URL est mise à jour après une courte pause
  useEffect(() => {
    if (queryInput.trim() === urlQuery.trim()) return;
    const timer = window.setTimeout(() => updateUrl({ q: queryInput.trim() }), 350);
    return () => window.clearTimeout(timer);
  }, [queryInput, urlQuery, updateUrl]);

  useEffect(() => {
    if (lockedCategory) return;
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('[Boutique] Catégories indisponibles :', err));
  }, [lockedCategory]);

  const load = useCallback(
    async (nextPage: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({
          category: category || undefined,
          subCategory: subCategory || undefined,
          search: urlQuery.trim() || undefined,
          maxPrice: maxPrice < PRICE_MAX ? maxPrice : undefined,
          inStock,
          newOnly,
          onSale,
          sort,
          page: nextPage,
          limit: PAGE_SIZE,
        });
        if (id !== requestId.current) return; // une requête plus récente est en cours
        setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err.message : 'Le catalogue est momentanément indisponible.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [category, subCategory, urlQuery, maxPrice, inStock, newOnly, onSale, sort],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), 150);
    return () => window.clearTimeout(timer);
  }, [load]);

  const hasFilters = Boolean(urlQuery || subCategory || inStock || newOnly || onSale || maxPrice < PRICE_MAX || (!lockedCategory && category));
  const resetFilters = () => {
    setInStock(false);
    setNewOnly(false);
    setOnSale(false);
    setMaxPrice(PRICE_MAX);
    setQueryInput('');
    updateUrl({ q: '', 'sous-categorie': '', ...(lockedCategory ? {} : { category: '' }) });
  };

  const categoryButtons = lockedCategory
    ? [{ slug: '', name: `Tout « ${lockedCategory.name} »` }, ...(lockedCategory.subCategories ?? [])]
    : [{ slug: '', name: 'Tous les produits' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];
  const activeButton = lockedCategory ? subCategory : category;

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">
        <button
          className="mobile-filter-toggle"
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <span>
            <SlidersHorizontal size={16} /> Filtres
          </span>
          <ChevronDown size={16} />
        </button>

        <div id="catalog-filters" className={`catalog-filters-content${filtersOpen ? ' is-open' : ''}`}>
          {categoryButtons.length > 1 && (
            <div className="filter-panel">
              <h2>{lockedCategory ? 'Sous-catégories' : 'Catégories'}</h2>
              <ul className="category-filter-list">
                {categoryButtons.map((item) => (
                  <li key={item.slug || 'all'}>
                    <button
                      type="button"
                      className={activeButton === item.slug ? 'chosen' : ''}
                      aria-pressed={activeButton === item.slug}
                      onClick={() =>
                        updateUrl(lockedCategory ? { 'sous-categorie': item.slug } : { category: item.slug, 'sous-categorie': '' })
                      }
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="filter-panel price-filter">
            <h2>Prix max</h2>
            <input
              aria-label="Prix maximum"
              type="range"
              min="5000"
              max={PRICE_MAX}
              step="5000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
            <div>
              <span>5 000 FCFA</span>
              <span>{maxPrice < PRICE_MAX ? `${maxPrice.toLocaleString('fr-FR')} FCFA` : 'Sans limite'}</span>
            </div>
          </div>

          <div className="filter-panel">
            <h2>Affiner</h2>
            <label className="checkbox-row">
              <input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /> En stock
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={newOnly} onChange={(event) => setNewOnly(event.target.checked)} /> Nouveautés
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={onSale} onChange={(event) => setOnSale(event.target.checked)} /> En promotion
            </label>
          </div>
        </div>
      </aside>

      <section className="catalog-results" aria-label="Résultats de la boutique" aria-busy={loading}>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={15} />
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Rechercher dans la boutique"
              aria-label="Rechercher dans la boutique"
            />
          </label>

          <span aria-live="polite">
            {loading && items.length === 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="auth-spinner" /> Chargement…
              </span>
            ) : (
              `${total} ${total <= 1 ? 'produit' : 'produits'}`
            )}
          </span>

          <label>
            Trier par :{' '}
            <select value={sort} onChange={(event) => setSort(event.target.value as ProductSort)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div className="text-center py-14 px-6 rounded-3xl border border-rose-200 bg-rose-50/60 my-6">
            <p className="text-sm font-medium text-rose-900 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => load(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#24582d] text-white text-sm font-medium"
            >
              <RefreshCw size={15} /> Réessayer
            </button>
          </div>
        ) : loading && items.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="auth-spinner" color="var(--pink)" />
          </div>
        ) : items.length > 0 ? (
          <>
            <ProductGrid products={items} />
            {page < totalPages && (
              <div className="flex justify-center py-6">
                <button
                  type="button"
                  onClick={() => load(page + 1)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Voir plus de produits ({total - items.length} restants)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state text-center py-16 px-6 bg-[#fbfdfb] rounded-3xl border border-[#e8efe9] my-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#f0f7f1] text-[#24582d] flex items-center justify-center">
              <Flower2 size={28} />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1c2e20] mb-2">
              {hasFilters ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit dans cette sélection pour le moment'}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
              {hasFilters
                ? 'Essayez d’élargir vos critères, ou demandez-nous une composition sur mesure.'
                : 'Nos fleuristes peuvent réaliser une composition sur mesure pour vous.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#24582d] text-white text-sm font-medium hover:bg-[#1a4221]"
                >
                  Effacer les filtres
                </button>
              )}
              <Link
                href="/devis"
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Demander un devis sur mesure
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
