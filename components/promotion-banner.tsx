'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { getActivePromotions, type ActivePromotion } from '@/lib/api/marketing';

const DISMISS_KEY = 'decofleur-promo-dismissed';

/** Bandeau de la promotion en cours la plus avantageuse (déjà appliquée aux prix de la boutique). */
export function PromotionBanner() {
  const [promo, setPromo] = useState<ActivePromotion | null>(null);

  useEffect(() => {
    let active = true;
    getActivePromotions()
      .then((list) => {
        const best = list[0];
        if (!active || !best) return;
        let dismissed: string | null = null;
        try {
          dismissed = window.sessionStorage.getItem(DISMISS_KEY);
        } catch {
          // stockage indisponible
        }
        if (dismissed !== best.id) setPromo(best);
      })
      .catch((err) => console.warn('[Promotions] Bandeau indisponible :', err));
    return () => {
      active = false;
    };
  }, []);

  if (!promo) return null;

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, promo.id);
    } catch {
      // stockage indisponible
    }
    setPromo(null);
  };

  const scope =
    promo.targetType === 'all'
      ? 'sur toute la boutique'
      : promo.targetNames.length > 0
        ? `sur ${promo.targetNames.slice(0, 2).join(', ')}${promo.targetNames.length > 2 ? '…' : ''}`
        : 'sur une sélection';
  const until = new Date(promo.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <aside
      className="bg-gradient-to-r from-[#173f22] via-[#245e34] to-[#173f22] text-white py-2 px-4 text-xs font-sans relative z-30"
      aria-label="Promotion en cours"
    >
      <div className="content-width flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto min-w-0">
          <span className="inline-flex items-center gap-1 bg-[#c8436e] text-white px-2 py-0.5 rounded-full font-bold text-[10.5px] uppercase tracking-wider shrink-0">
            <Sparkles size={11} />
            {promo.badgeText || `-${promo.discountPercentage}%`}
          </span>
          <span className="font-medium text-white/95 truncate">
            {promo.name} : −{promo.discountPercentage} % {scope}, jusqu’au {until}
          </span>
          <Link
            href="/boutique?promo=1"
            className="hidden sm:inline-flex items-center gap-1 text-[#ffd7e2] hover:text-white font-semibold underline underline-offset-2 ml-2 shrink-0"
          >
            Voir les produits <ArrowRight size={12} />
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-white/60 hover:text-white shrink-0 p-1 rounded-md transition-colors"
          aria-label="Fermer l'annonce de promotion"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
