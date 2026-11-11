'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { getActivePromotions, ActivePromotion } from '@/lib/api/marketing';

export function PromotionBanner() {
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getActivePromotions()
      .then((data) => {
        if (data && data.length > 0) {
          setPromotions(data);
        }
      })
      .catch(() => {
        // Silently ignore
      });
  }, []);

  if (dismissed || promotions.length === 0) {
    return null;
  }

  const promo = promotions[0];

  return (
    <aside
      className="bg-gradient-to-r from-[#173f22] via-[#245e34] to-[#173f22] text-white py-2 px-4 text-xs font-sans relative z-30 transition-all duration-300"
      aria-label="Promotion active"
    >
      <div className="content-width flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-flex items-center gap-1 bg-[#c8436e] text-white px-2 py-0.5 rounded-full font-bold text-[10.5px] uppercase tracking-wider shrink-0">
            <Sparkles size={11} />
            {promo.badgeText || `-${promo.discountPercentage}%`}
          </span>
          <span className="font-medium text-white/95 truncate">
            {promo.name} : Profitez de {promo.discountPercentage}% de remise immédiate !
          </span>
          <Link
            href="/boutique"
            className="hidden sm:inline-flex items-center gap-1 text-[#ffd7e2] hover:text-white font-semibold underline underline-offset-2 ml-2 transition-colors shrink-0"
          >
            En profiter <ArrowRight size={12} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white shrink-0 p-1 rounded-md transition-colors"
          aria-label="Fermer l'annonce de promotion"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
