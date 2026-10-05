import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Flower2,
  Heart,
  Truck,
  ShieldCheck,
  Gift,
  Home,
  ShoppingBag,
  UtensilsCrossed,
  Headphones,
} from 'lucide-react';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { HomeFaq } from '@/components/home-faq';
import { AutoScrollStrip } from '@/components/auto-scroll-strip';

// 7 quick categories strictly from the prototype mockup
const mockupCategories = [
  { title: 'Bouquets élégants', subtitle: 'Fleurs fraîches et raffinées', href: '/bouquets', icon: Flower2 },
  { title: 'Décoration sur mesure', subtitle: 'Espaces, maisons, bureaux', href: '/decoration', icon: Home },
  { title: 'Mariages & événements', subtitle: 'Cérémonies, réceptions', href: '/mariages', icon: Heart },
  { title: 'Livraison à domicile', subtitle: 'Rapide et fiable à Saly & Mbour', href: '/livraison', icon: Truck },
  { title: 'Paniers de fruits', subtitle: 'Frais et gourmands', href: '/paniers-de-fruits', icon: ShoppingBag },
  { title: 'Cadeaux', subtitle: 'Pour toutes occasions', href: '/cadeaux', icon: Gift },
  { title: 'Location de vaisselle & matériel', subtitle: 'Pour vos réceptions', href: '/evenements', icon: UtensilsCrossed },
];

export default function HomePage() {
  // First 4 featured products as seen in prototype
  const featured = products.slice(0, 4);

  return (
    <>
      <main className="homepage-main">
        {/* 1. Hero Section with Floral Background */}
        <section className="prototype-hero hero-with-bg">
          <div className="hero-bg-media" aria-hidden="true">
            <Image
              src="/images/hero.jpg"
              alt=""
              fill
              priority
              className="hero-bg-img"
              sizes="100vw"
            />
            <div className="hero-bg-overlay" />
          </div>

          <div className="content-width hero-inner">
            <div className="hero-content-left">
              <div className="hero-eyebrow">
                <Flower2 size={16} className="eyebrow-flower" />
                <span>Bienvenue chez Décofleur Plus</span>
              </div>

              <h1 className="hero-headline">
                Des fleurs, des idées,<br />
                <span className="headline-em">des émotions</span>
              </h1>

              <p className="hero-subline">
                Fleuriste • Décoration événementielle • Paniers de fruits • Cadeaux • Location de matériel
              </p>

              <div className="hero-actions">
                <Link href="/boutique" className="button-pill-pink">
                  Découvrir nos produits <ArrowRight size={17} />
                </Link>
                <div className="hero-script-tag-inline">
                  <span>L’élégance de la nature <em>à chaque instant</em></span>
                  <Heart size={14} fill="var(--pink)" color="var(--pink)" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 7-Category Horizontal Strip */}
        <section className="category-strip-section" aria-label="Catégories principales">
          <div className="content-width">
            <AutoScrollStrip className="category-strip-container">
              {mockupCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Link href={cat.href} key={idx} className="category-strip-item">
                    <div className="category-strip-icon-circle">
                      <Icon size={20} />
                    </div>
                    <div className="category-strip-text">
                      <h2 className="cat-title">{cat.title}</h2>
                      <span className="cat-subtitle">{cat.subtitle}</span>
                    </div>
                  </Link>
                );
              })}
            </AutoScrollStrip>
          </div>
        </section>

        {/* 3. Featured Row: Events Feature on Left + Products Grid on Right */}
        <section className="featured-row-section content-width">
          {/* Left Event Banner Card */}
          <aside className="event-tall-card">
            <div className="event-tall-header">
              <h2>Événements & Mariages</h2>
              <p>Une décoration florale sur mesure pour vos plus beaux moments.</p>
              <Link href="/evenements" className="button-pill-pink button-small">
                En savoir plus <ArrowRight size={14} />
              </Link>
            </div>
            <div className="event-tall-image">
              <Image
                src="/images/mariage.jpg"
                alt="Décoration de table pour mariage par Décofleur Plus"
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
                <h2>Nos produits phares</h2>
              </div>
              <Link href="/boutique" className="view-all-link">
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>

            <ProductGrid products={featured} />
          </div>
        </section>

        {/* 4. Trust Badges & Gift Card Banner */}
        <section className="trust-and-gift-section content-width">
          {/* Left: 4 Trust Badges */}
          <div className="trust-badges-grid">
            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Truck size={20} />
              </div>
              <div className="trust-text">
                <strong>Livraison rapide</strong>
                <span>à Saly & Mbour</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <ShieldCheck size={20} />
              </div>
              <div className="trust-text">
                <strong>Paiement sécurisé</strong>
                <span>Wave & Orange Money</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Flower2 size={20} />
              </div>
              <div className="trust-text">
                <strong>Fleurs fraîches</strong>
                <span>et de qualité</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Headphones size={20} />
              </div>
              <div className="trust-text">
                <strong>Service client</strong>
                <span>à votre écoute</span>
              </div>
            </div>
          </div>

          {/* Right: Gift Card Promo Banner */}
          <div className="gift-card-banner">
            <div className="gift-banner-content">
              <div className="gift-icon-tag">
                <Gift size={24} />
              </div>
              <div>
                <h3>Offrez des émotions avec nos cartes cadeaux</h3>
                <Link href="/compte/cartes-cadeaux" className="button-pill-pink button-small">
                  Acheter une carte cadeau <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="gift-banner-image">
              <Image
                src="/images/cadeau.jpg"
                alt="Carte cadeau et coffret Décofleur Plus"
                fill
                sizes="(max-width: 900px) 100vw, 240px"
              />
            </div>
          </div>
        </section>

        {/* 5. Interactive Testimonials Carousel ("Ils nous font confiance") */}
        <TestimonialCarousel />

        {/* 6. Homepage FAQ Section */}
        <HomeFaq />
      </main>

      <SiteFooter />
    </>
  );
}
