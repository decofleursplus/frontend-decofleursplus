'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, ShoppingBag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/api/catalog';
import type { Product } from '@/lib/products';

interface RelatedProductsPickerProps {
  /** Identifiants sélectionnés (ordre d'affichage) */
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  title?: string;
  hint?: string;
}

/** Choix de créations du catalogue publié (recherche serveur), affichées dans l'ordre de sélection. */
export function RelatedProductsPicker({ value, onChange, max = 4, title = 'Créations associées', hint }: RelatedProductsPickerProps) {
  const [selected, setSelected] = useState<Product[]>([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<{ query: string; items: Product[]; error: string | null } | null>(null);
  const searching = results?.query !== debounced;

  // Fiches des produits déjà associés (chargées une fois, par identifiant)
  const [initialIds] = useState(value);
  useEffect(() => {
    if (initialIds.length === 0) return;
    getProducts({ ids: initialIds, limit: Math.min(100, initialIds.length) })
      .then((res) => {
        const rank = (p: Product) => {
          const i = initialIds.indexOf(p.id);
          return i === -1 ? initialIds.length : i;
        };
        setSelected([...res.items].sort((a, b) => rank(a) - rank(b)));
      })
      .catch((err) => setSelectionError(err instanceof Error ? err.message : 'Produits associés indisponibles.'));
  }, [initialIds]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getProducts({ search: debounced || undefined, sort: debounced ? undefined : 'popular', limit: 20 })
      .then((res) => {
        if (!cancelled) setResults({ query: debounced, items: res.items, error: null });
      })
      .catch((err) => {
        if (!cancelled) setResults({ query: debounced, items: [], error: err instanceof Error ? err.message : 'Catalogue indisponible.' });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const selectedIds = selected.map((p) => p.id);
  const toggle = (product: Product) => {
    const isSelected = selectedIds.includes(product.id);
    if (!isSelected && selected.length >= max) return;
    const next = isSelected ? selected.filter((p) => p.id !== product.id) : [...selected, product];
    setSelected(next);
    onChange(next.map((p) => p.id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <ShoppingBag className="h-3.5 w-3.5 text-gray-400" /> {title}
        </span>
        <span className="text-[11px] text-gray-500">
          {selected.length} / {max}
        </span>
      </div>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      {selectionError && <p className="text-[11px] text-rose-600">{selectionError}</p>}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {selected.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-2">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold text-gray-900">{p.name}</span>
              <span className="text-[10px] text-gray-500">{p.price.toLocaleString('fr-FR')} FCFA</span>
            </span>
            <button
              type="button"
              onClick={() => toggle(p)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600"
              aria-label={`Retirer ${p.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {selected.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3 text-center text-[11px] italic text-gray-400">
            Aucune création associée.
          </p>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        <Input
          placeholder="Rechercher une création (ex : rose, orchidée, panier)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 border-gray-200 bg-white pl-8 text-xs"
        />
      </div>
      {results?.error && <p className="text-[11px] text-rose-600">{results.error}</p>}
      <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-gray-100 p-1" aria-busy={searching}>
        {results === null ? (
          <p className="py-4 text-center text-xs text-gray-400">Chargement du catalogue…</p>
        ) : results.items.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">{debounced ? `Aucune création ne correspond à « ${debounced} ».` : 'Aucune création publiée.'}</p>
        ) : (
          results.items.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const limitReached = !isSelected && selected.length >= max;
            return (
              <label
                key={p.id}
                className={`flex items-center justify-between gap-2 rounded-lg border p-1.5 text-xs transition-colors ${
                  isSelected
                    ? 'cursor-pointer border-emerald-200 bg-emerald-50 font-medium text-emerald-900'
                    : limitReached
                      ? 'cursor-not-allowed border-transparent opacity-50'
                      : 'cursor-pointer border-transparent text-gray-700 hover:bg-gray-50'
                } ${searching ? 'opacity-60' : ''}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-emerald-700"
                    checked={isSelected}
                    disabled={limitReached}
                    onChange={() => toggle(p)}
                  />
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-gray-200">
                    <Image src={p.image} alt="" fill className="object-cover" sizes="28px" />
                  </span>
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="shrink-0 text-[11px] text-gray-500">{p.price.toLocaleString('fr-FR')} F</span>
              </label>
            );
          })
        )}
      </div>
      {selected.length >= max && <p className="text-[11px] text-amber-700">Limite de {max} créations atteinte.</p>}
    </div>
  );
}
