'use client';

import { useEffect, useState } from 'react';
import { getCategories, type ApiCategory } from '@/lib/api/catalog';

let cache: Promise<ApiCategory[]> | null = null;

/** Catégories actives de la boutique (menu du header, accueil), chargées une seule fois par visite. */
export function useStoreCategories() {
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);

  useEffect(() => {
    let active = true;
    if (!cache) cache = getCategories();
    cache
      .then((list) => active && setCategories(list.filter((c) => c.isActive !== false)))
      .catch((err) => {
        cache = null;
        console.error('[Vitrine] Catégories indisponibles :', err);
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
