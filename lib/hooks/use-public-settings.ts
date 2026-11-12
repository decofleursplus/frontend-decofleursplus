'use client';

import { useEffect, useState } from 'react';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';

let cache: Promise<PublicShopSettings> | null = null;

/** Paramètres publics de la boutique, chargés une seule fois par visite. */
export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    if (!cache) cache = getPublicSettings();
    cache
      .then((value) => active && setSettings(value))
      .catch((err) => {
        cache = null; // nouvel essai au prochain affichage
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, error };
}
