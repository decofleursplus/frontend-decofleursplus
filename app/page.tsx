import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Flower2,
  Truck,
  ShieldCheck,
  Gift,
  Headphones,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { EventHero } from '@/components/event-hero';
import { EventFeaturedRow } from '@/components/event-featured-row';
import { MockupCategories } from '@/components/mockup-categories';
import { HomeFaq } from '@/components/home-faq';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';

export const revalidate = 3600;

export const metadata: Metadata = constructMetadata({
  title: 'Décofleur Plus — Fleuriste & Magasin de Décoration à Saly, Dakar & Petite-Côte',
  description:
    'Déco Fleurs Plus (Déco-Fleurs) : artisan fleuriste et magasin de décoration à Saly-Portudal et Dakar. Bouquets de roses fraîches, décoration événementielle, vases d’art, paysagisme et livraison express.',
  canonical: '/',
  keywords: [
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'fleuriste à Saly',
    'fleuriste saly',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
  ],
});

export default function HomePage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/boutique?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <main className="homepage-main">
        {/* 1. Dynamic Hero Section Coordinated with Active Event (defaults to HeroMockup) */}
        <EventHero />

        {/* 2. Catégories de la boutique (back-office) + services */}
        <MockupCategories />

        {/* 3. Section Phare : Carte Événements & Grille 4 Produits Phares */}
        <EventFeaturedRow />

        {/* 4. Badges de réassurance & bannière abonnements */}
        <section className="trust-and-gift-section content-width" aria-label="Engagements et abonnements floraux">
          {/* Left: 4 Trust Badges exact mockup */}
          <div className="trust-badges-grid">
            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Truck size={22} strokeWidth={1.7} />
              </div>
              <div className="trust-text">
                <strong>Livraison rapide</strong>
                <span>à Saly &amp; Mbour</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <ShieldCheck size={22} strokeWidth={1.7} />
              </div>
              <div className="trust-text">
                <strong>Paiement sécurisé</strong>
                <span>Wave &amp; Orange Money</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Flower2 size={22} strokeWidth={1.7} />
              </div>
              <div className="trust-text">
                <strong>Fleurs fraîches</strong>
                <span>et de qualité</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Headphones size={22} strokeWidth={1.7} />
              </div>
              <div className="trust-text">
                <strong>Service client</strong>
                <span>à votre écoute</span>
              </div>
            </div>
          </div>

          {/* Droite : bannière Abonnements floraux (fonctionnalité réelle, en remplacement des cartes cadeaux) */}
          <div className="gift-card-banner relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src="/images/gift-banner-bg.jpg"
                alt="Bouquets livrés chaque semaine par Décofleur Plus"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 550px"
                className="object-cover object-right"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, #FDECEF 0%, #FDECEF 35%, rgba(253, 236, 239, 0.85) 55%, rgba(253, 236, 239, 0.1) 85%, rgba(253, 236, 239, 0) 100%)',
                }}
              />
            </div>

            <div className="gift-banner-content relative z-10">
              <div className="gift-icon-tag">
                <Gift size={28} strokeWidth={1.6} />
              </div>
              <div>
                <h3>Des fleurs fraîches livrées chaque semaine</h3>
                <Link href="/abonnements" className="button-pill-pink button-small">
                  <span>Découvrir nos abonnements</span> <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Témoignages Clients ("Ils nous font confiance") — avis réels */}
        <TestimonialCarousel />

        {/* 6. Questions fréquentes (cible du lien /faq) */}
        <HomeFaq />
      </main>

      <SiteFooter />
    </>
  );
}
