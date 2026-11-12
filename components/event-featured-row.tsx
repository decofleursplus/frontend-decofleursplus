'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flower2, Loader2 } from 'lucide-react';
import { type Product } from '@/lib/products';
import { getFeaturedProducts, getProducts } from '@/lib/api/catalog';
import { ProductGrid } from '@/components/product-grid';
import { useActiveEvent } from '@/lib/hooks/use-active-event';

/**
 * Carte événement + 4 produits : la sélection de l'événement actif (back-office),
 * sinon les produits « phares » du catalogue.
 */
export function EventFeaturedRow() {
  const { event, loaded } = useActiveEvent();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!loaded) return;
    let active = true;
    const ids = event?.featuredProductIds ?? [];
    const request = ids.length > 0 ? getProducts({ ids, limit: 4 }).then((r) => r.items) : getFeaturedProducts(4);
    request
      .then((items) => active && setProducts(items))
      .catch((err) => {
        console.error('[Accueil] Sélection indisponible :', err);
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, [loaded, event]);

  const isSpecialEvent = Boolean(event);
  const displayProducts = (products ?? []).slice(0, 4);

  return (
    <section className="featured-row-section content-width" aria-labelledby="featured-heading">
      {/* Left Event Banner Card with Full Background Image and Frosted Blur Container */}
      <aside className="event-tall-card event-tall-card-dynamic relative overflow-hidden flex flex-col justify-start">
        {/* Full background wedding banquet image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={isSpecialEvent ? event!.bgImage : '/images/evenements/hero-side.webp'}
            alt={isSpecialEvent ? event!.name : 'Décoration florale de prestige par Décofleur Plus'}
            fill
            priority
            sizes="(max-width: 990px) 100vw, 320px"
            className="object-cover object-center"
          />
        </div>

        {/* Glassmorphic blur container for pristine readability */}
        <div className="relative z-10 m-3 sm:m-4 md:m-5 p-4 sm:p-5 md:p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-white/70 shadow-md max-w-[92%] sm:max-w-[310px]">
          <h2 className="font-serif text-[22px] sm:text-[24px] lg:text-[26px] font-medium text-[#1A341E] leading-tight mb-2">
            {isSpecialEvent ? event!.name : 'Événements & Mariages'}
          </h2>
          <p className="text-[13px] sm:text-[14px] text-neutral-700 leading-relaxed mb-4">
            {isSpecialEvent
              ? event!.collectionDesc || event!.subheadline
              : 'Une scénographie florale sur mesure pour célébrer vos plus beaux moments.'}
          </p>
          <Link
            href={isSpecialEvent ? event!.ctaLink || '/boutique' : '/evenements'}
            className="button-pill-pink button-small inline-flex items-center gap-2"
          >
            <span>{isSpecialEvent ? 'Voir la collection' : 'En savoir plus'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </aside>

      {/* Right Featured Products Grid */}
      <div className="featured-products-col">
        <div className="products-section-header">
          <div className="header-title-wrap">
            <Flower2 size={20} className="title-icon" style={{ color: 'var(--pink)' }} />
            <h2 id="featured-heading">
              {isSpecialEvent
                ? event!.collectionTitle || `Créations spéciales ${event!.name}`
                : 'Nos produits phares'}
            </h2>
          </div>
          <Link
            href={isSpecialEvent ? event!.ctaLink || '/boutique' : '/boutique'}
            className="view-all-link"
          >
            <span className="view-all-desktop">
              {isSpecialEvent ? `Toute la sélection ${event!.name}` : 'Voir tout'}
            </span>
            <span className="view-all-mobile">Voir tout</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {products === null ? (
          <div className="flex items-center justify-center min-h-[220px]" aria-busy="true">
            <Loader2 size={26} className="animate-spin text-[#24582d]" />
          </div>
        ) : displayProducts.length > 0 ? (
          <ProductGrid products={displayProducts} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-[#fbfdfb] rounded-2xl border border-[#e8efe9] h-full min-h-[220px]">
            <Flower2 size={24} className="text-[#24582d] mb-2 opacity-80" />
            <h3 className="text-base font-serif font-semibold text-[#1c2e20] mb-1">
              Nouvelle collection en cours d&apos;arrivage
            </h3>
            <p className="text-xs text-neutral-600 mb-4 max-w-sm">
              Nos artisans préparent de nouvelles créations florales exclusives. Retrouvez-les très prochainement dans la boutique.
            </p>
            <Link
              href="/boutique"
              className="text-xs font-medium text-[#24582d] underline hover:text-[#1a4221]"
            >
              Explorer notre univers
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
