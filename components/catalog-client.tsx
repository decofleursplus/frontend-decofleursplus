'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';

const categories = ['Tous les produits', 'Bouquets', 'Roses', 'Plantes', 'Paniers de fruits', 'Cadeaux', 'Mariages', 'Décoration', 'Bougies', 'Vases & Bougies', 'Deuil', 'Anniversaires', 'Occasions spéciales'];
const categoryCounts: Record<string, number> = Object.fromEntries(categories.map((item) => [item, item === 'Tous les produits' ? products.length : item === 'Roses' ? products.filter((product) => product.name.includes('Rose')).length : products.filter((product) => product.category === item).length]));

export function CatalogClient({ initialQuery = '', initialCategory = '' }: { initialQuery?: string; initialCategory?: string }) {
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'Tous les produits');
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('Populaires');
  const [inStock, setInStock] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => (category === 'Tous les produits' || product.category === category || (category === 'Roses' && product.name.includes('Rose'))) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()) && product.price <= maxPrice && (!inStock || product.inStock) && (!newOnly || product.badge === 'Nouveau')); 
    if (sort === 'Prix croissant') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Prix décroissant') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [category, inStock, maxPrice, newOnly, query, sort]);

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">
        <button className="mobile-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
          <span><SlidersHorizontal size={16} /> Filtres</span><ChevronDown size={16} />
        </button>
        <div id="catalog-filters" className={`catalog-filters-content${filtersOpen ? ' is-open' : ''}`}>
        <div className="filter-panel">
          <h2>Catégories</h2>
          <ul className="category-filter-list">
            {categories.map((item) => <li key={item}><button className={category === item ? 'chosen' : ''} onClick={() => setCategory(item)}>{item}<span>{categoryCounts[item]}</span></button></li>)}
          </ul>
        </div>
        <div className="filter-panel price-filter"><h2>Prix</h2><input aria-label="Prix maximum" type="range" min="0" max="100000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div><span>0 FCFA</span><span>100 000 FCFA</span></div></div>
        <div className="filter-panel"><h2>Disponibilité</h2><label className="checkbox-row"><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /> En stock</label><label className="checkbox-row"><input type="checkbox" checked={newOnly} onChange={(event) => setNewOnly(event.target.checked)} /> Nouveaux</label></div>
        </div>
      </aside>
      <section className="catalog-results" aria-label="Résultats de la boutique">
        <div className="catalog-toolbar"><label className="catalog-search"><SlidersHorizontal size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans la boutique" aria-label="Rechercher dans la boutique" /></label><span>{visibleProducts.length} {visibleProducts.length === 1 ? 'produit affiché' : 'produits affichés'}</span><label>Trier par : <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Populaires</option><option>Prix croissant</option><option>Prix décroissant</option></select></label></div>
        {visibleProducts.length ? <ProductGrid products={visibleProducts} /> : <div className="empty-state"><h2>Aucun produit trouvé</h2><p>Essayez une autre recherche ou choisissez une autre catégorie.</p><button className="button button-outline" onClick={() => { setQuery(''); setCategory('Tous les produits'); setInStock(false); setNewOnly(false); setMaxPrice(100000); }}>Effacer les filtres</button></div>}
      </section>
    </div>
  );
}
