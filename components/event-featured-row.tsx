'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flower2, Sparkles, Heart } from 'lucide-react';
import { products as allProducts, type Product } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import {
  type SeasonalEvent,
  getActiveSeasonalEvent,
  initialSeasonalEvents,
} from '@/lib/events-data';

export function EventFeaturedRow() {
  const [event, setEvent] = useState<SeasonalEvent>(
    initialSeasonalEvents.find((e) => e.isActive) || initialSeasonalEvents[0]
  );

  useEffect(() => {
    setEvent(getActiveSeasonalEvent());

    const handleEventChange = () => {
      setEvent(getActiveSeasonalEvent());
    };

    window.addEventListener('decofleur-event-changed', handleEventChange);
    window.addEventListener('storage', handleEventChange);

    return () => {
      window.removeEventListener('decofleur-event-changed', handleEventChange);
      window.removeEventListener('storage', handleEventChange);
    };
  }, []);

  const isSpecialEvent = event.id !== 'standard';

  // Filtrer les produits mis en avant pour cet événement
  const eventProducts: Product[] = isSpecialEvent && event.featuredProductIds?.length > 0
    ? allProducts.filter(
        (p) =>
          event.featuredProductIds.includes(p.id) ||
          event.featuredProductIds.includes(p.slug)
      )
    : allProducts.slice(0, 4);

  // S'assurer d'avoir au moins 4 produits pour une grille équilibrée
  const displayProducts =
    eventProducts.length >= 4
      ? eventProducts.slice(0, 4)
      : [
          ...eventProducts,
          ...allProducts.filter((p) => !eventProducts.some((ep) => ep.id === p.id)),
        ].slice(0, 4);

  return (
    <section className="featured-row-section content-width" aria-labelledby="featured-heading">
      {/* Left Event Banner Card */}
      <aside className="event-tall-card event-tall-card-dynamic">
        <div className="event-tall-header">
          <h2>{isSpecialEvent ? event.name : 'Événements & Mariages'}</h2>
          <p>
            {isSpecialEvent
              ? event.collectionDesc || event.subheadline
              : 'Une scénographie florale sur mesure pour célébrer vos plus beaux moments.'}
          </p>
          <Link
            href={isSpecialEvent ? event.ctaLink || '/boutique' : '/evenements'}
            className="button-pill-pink button-small"
          >
            <span>{isSpecialEvent ? 'Voir la collection' : 'En savoir plus'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="event-tall-image">
          <Image
            src={isSpecialEvent ? event.bgImage : '/images/mariage.jpg'}
            alt={isSpecialEvent ? event.name : 'Décoration florale de prestige par Décofleur Plus'}
            fill
            sizes="(max-width: 990px) 100vw, 320px"
          />
        </div>
      </aside>

      {/* Right Featured Products Grid */}
      <div className="featured-products-col">
        <div className="products-section-header">
          <div className="header-title-wrap">
            <Flower2 size={20} className="title-icon" />
            <h2 id="featured-heading">
              {isSpecialEvent
                ? event.collectionTitle || `Créations spéciales ${event.name}`
                : 'Nos créations phares'}
            </h2>
          </div>
          <Link
            href={isSpecialEvent ? event.ctaLink || '/boutique' : '/boutique'}
            className="view-all-link"
          >
            <span className="view-all-desktop">
              {isSpecialEvent ? `Toute la sélection ${event.name}` : 'Voir tout le catalogue'}
            </span>
            <span className="view-all-mobile">Voir tout</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={displayProducts} />
      </div>
    </section>
  );
}
