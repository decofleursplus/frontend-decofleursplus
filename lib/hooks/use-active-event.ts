'use client';

import { useEffect, useState } from 'react';
import { getActiveEvent, type SeasonalEvent } from '@/lib/api/events';

let cache: Promise<SeasonalEvent | null> | null = null;

/** Événement saisonnier actif (back-office), partagé par le hero et la sélection de l'accueil. */
export function useActiveEvent() {
  const [state, setState] = useState<{ event: SeasonalEvent | null; loaded: boolean }>({ event: null, loaded: false });

  useEffect(() => {
    let active = true;
    if (!cache) cache = getActiveEvent();
    cache
      .then((event) => active && setState({ event, loaded: true }))
      .catch((err) => {
        cache = null;
        console.error('[Accueil] Événement indisponible :', err);
        if (active) setState({ event: null, loaded: true });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
