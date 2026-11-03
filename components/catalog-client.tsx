'use client';

import { useEffect, useState, useTransition } from 'react';
import { ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Product } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { getProducts, getCategories, ApiCategory } from '@/lib/api/catalog';

const DEFAULT_CATEGORIES = [
  'Tous les produits',
  'Bouquets',
  'Roses',
  'Plantes',
  'Paniers de fruits',
  'Cadeaux',
  'Mariages',
  'Décoration',
  'Bougies',
  'Vases & Bougies',
  'Deuil',
  'Anniversaires',
  'Occasions spéciales',
];

export function CatalogClient({
  initialQuery = '',
  initialCategory = '',
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [category, setCategory] = useState(
    initialCategory && initialCategory !== '' ? initialCategory : 'Tous les produits',
  );
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('Populaires');
  const [inStock, setInStock] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // 1. Charger les catégories réelles au montage
  useEffect(() => {
    let active = true;
    async function loadCats() {
      try {
        const apiCats = await getCategories();
        if (active && apiCats.length > 0) {
          const names = ['Tous les produits', ...apiCats.map((c: ApiCategory) => c.name)];
          setCategoriesList(Array.from(new Set([...names, ...DEFAULT_CATEGORIES])));
        }
      } catch {
        // fallback to default
      }
    }
    loadCats();
    return () => {
      active = false;
    };
  }, []);

  // 2. Charger les produits selon les filtres
  useEffect(() => {
    let active = true;

    async function loadFilteredProducts() {
      setIsLoading(true);
      try {
        let sortParam: 'newest' | 'price_asc' | 'price_desc' | undefined = undefined;
        if (sort === 'Prix croissant') sortParam = 'price_asc';
        if (sort === 'Prix décroissant') sortParam = 'price_desc';
        if (sort === 'Plus récents') sortParam = 'newest';

        const categoryFilter =
          category === 'Tous les produits' || category === 'Roses' ? undefined : category;

        const res = await getProducts({
          category: categoryFilter,
          search: query.trim() || undefined,
          maxPrice: maxPrice < 100000 ? maxPrice : undefined,
          sort: sortParam,
          limit: 50,
        });

        if (active) {
          let items = res.items;

          // Filtres spécifiques côté client si demandés
          if (category === 'Roses') {
            items = items.filter((p) => p.name.toLowerCase().includes('rose'));
          }
          if (inStock) {
            items = items.filter((p) => p.inStock);
          }
          if (newOnly) {
            items = items.filter((p) => p.badge === 'Nouveau');
          }

          startTransition(() => {
            setProductsList(items);
          });
        }
      } catch (error) {
        console.error('Erreur chargement catalogue:', error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadFilteredProducts();
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category, query, sort, inStock, newOnly, maxPrice]);

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

        <div
          id="catalog-filters"
          className={`catalog-filters-content${filtersOpen ? ' is-open' : ''}`}
        >
          <div className="filter-panel">
            <h2>Catégories</h2>
            <ul className="category-filter-list">
              {categoriesList.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className={category === item ? 'chosen' : ''}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-panel price-filter">
            <h2>Prix max</h2>
            <input
              aria-label="Prix maximum"
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
            <div>
              <span>0 FCFA</span>
              <span>{maxPrice.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div className="filter-panel">
            <h2>Disponibilité</h2>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
              />{' '}
              En stock
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(event) => setNewOnly(event.target.checked)}
              />{' '}
              Nouveautés
            </label>
          </div>
        </div>
      </aside>

      <section className="catalog-results" aria-label="Résultats de la boutique">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <SlidersHorizontal size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher dans la boutique"
              aria-label="Rechercher dans la boutique"
            />
          </label>

          <span>
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="auth-spinner" /> Actualisation…
              </span>
            ) : (
              `${productsList.length} ${productsList.length <= 1 ? 'produit affiché' : 'produits affichés'}`
            )}
          </span>

          <label>
            Trier par :{' '}
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option>Populaires</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
              <option>Plus récents</option>
            </select>
          </label>
        </div>

        {isLoading && productsList.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="auth-spinner" color="var(--pink)" />
          </div>
        ) : productsList.length > 0 ? (
          <ProductGrid products={productsList} />
        ) : (
          <div className="empty-state">
            <h2>Aucun produit trouvé</h2>
            <p>Essayez une autre recherche ou choisissez une autre catégorie.</p>
            <button
              className="button button-outline"
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('Tous les produits');
                setInStock(false);
                setNewOnly(false);
                setMaxPrice(100000);
              }}
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
