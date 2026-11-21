'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api/analytics';

/** Compte chaque page vue de la boutique (mesure d'audience anonyme, voir lib/api/analytics). */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);
  return null;
}
