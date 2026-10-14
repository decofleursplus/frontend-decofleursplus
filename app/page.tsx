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
  Sparkles,
  Star,
  Sprout,
  Building2,
  Tag,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { HomeFaq } from '@/components/home-faq';

// 12 univers d’excellence DécoFleur Plus
const universCategories = [
  {
    title: 'Fleurs & Bouquets',
    subtitle: 'Fraîches & de saison',
    href: '/bouquets',
    icon: Flower2,
    tag: 'Frais',
  },
  {
    title: 'Abonnements Floraux',
    subtitle: 'Villas, hôtels & entreprises',
    href: '/abonnements',
    icon: RefreshCw,
    tag: 'Hebdo/Mois',
  },
  {
    title: 'Scénographie florale',
    subtitle: 'Événements & décors',
    href: '/evenements',
    icon: Sparkles,
    tag: 'Sur mesure',
  },
  {
    title: 'Décoration & Objets',
    subtitle: 'Vases · bougies · contenants',
    href: '/decoration',
    icon: Home,
  },
  {
    title: 'Mariages & Cérémonies',
    subtitle: 'De la cérémonie à la réception',
    href: '/mariages',
    icon: Heart,
    tag: 'Prestige',
  },
  {
    title: 'Deuil & Hommages',
    subtitle: 'Compositions de recueillement',
    href: '/deuil',
    icon: Flower2,
  },
  {
    title: 'Fraises & Primeurs',
    subtitle: 'Fraises fraîches sélectionnées',
    href: '/paniers-de-fruits',
    icon: Star,
    tag: 'Saison',
  },
  {
    title: 'Paniers de Fruits',
    subtitle: 'Gourmands & vitaminés',
    href: '/paniers-de-fruits',
    icon: ShoppingBag,
  },
  {
    title: 'Cadeaux & Coffrets',
    subtitle: 'Peluches · chocolats · douceurs',
    href: '/cadeaux',
    icon: Gift,
  },
  {
    title: 'Paysagisme & Espaces',
    subtitle: 'Aménagement végétal de villas',
    href: '/evenements',
    icon: Sprout,
  },
  {
    title: 'Location événementielle',
    subtitle: 'Vaisselle & matériel de fête',
    href: '/evenements',
    icon: UtensilsCrossed,
  },
  {
    title: 'Hôtels & Entreprises',
    subtitle: 'Partenariats & scénographie',
    href: '/evenements#devis',
    icon: Building2,
    tag: 'B2B',
  },

];

// 4 campagnes saisonnières inspirées de la maquette
const seasonalCampaigns = [
  {
    title: 'Saint-Valentin',
    badge: 'Amour & Passion',
    desc: 'Offrez des fleurs, offrez de l’amour. Somptueux cœurs de roses et coffrets précieux.',
    href: '/bouquets',
    theme: 'campaign-card-red',
    cta: 'Découvrir nos roses',
    image: '/images/campaigns/valentin.jpg',
    imageAlt: 'Roses rouges de Saint-Valentin',
  },
  {
    title: 'Fête des Mères',
    badge: 'Douceur infinie',
    desc: 'Des attentions délicates qui font chaud au cœur. Compositions pastel et mots tendres.',
    href: '/boutique',
    theme: 'campaign-card-pink',
    cta: 'Voir les créations',
    image: '/images/campaigns/meres.jpg',
    imageAlt: 'Bouquet pastel pour la Fête des Mères',
  },
  {
    title: 'Promotions du moment',
    badge: 'Jusqu’à -20 %',
    desc: 'Bénéficiez de remises exceptionnelles sur une sélection de bouquets et corbeilles de saison.',
    href: '/boutique',
    theme: 'campaign-card-green',
    cta: 'Profiter des offres',
    image: '/images/campaigns/promo.jpg',
    imageAlt: 'Promotions florales de saison',
  },
  {
    title: 'Fraises d’exception',
    badge: 'Fraîcheur garantie',
    desc: 'Fraises cueillies avec exigence et fruits du terroir sénégalais pour vos tablées raffinées.',
    href: '/paniers-de-fruits',
    theme: 'campaign-card-gold',
    cta: 'Commander nos primeurs',
    image: '/images/campaigns/fraises.jpg',
    imageAlt: 'Fraises fraîches du terroir',
  },
];

export default function HomePage() {
  // 4 featured products
  const featured = products.slice(0, 4);

  const whatsappScenoUrl =
    'https://wa.me/221779417860?text=' +
    encodeURIComponent('Bonjour DécoFleur Plus, je souhaite un devis pour une scénographie florale sur mesure.');

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

              <h1 className="hero-headline">
                Des fleurs, des fruits,<br />
                des idées, <span className="headline-em">des émotions&nbsp;!</span>
              </h1>



              <div className="hero-actions">
                <Link href="/boutique" className="button-pill-pink">
                  Découvrir nos créations <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Notre Univers — Grille 12 univers */}
        <section className="univers-section" id="univers" aria-labelledby="univers-title">
          <div className="content-width">
            <div className="section-header-center">
              <span className="section-eyebrow">SAVOIR-FAIRE DE LA MAISON</span>
              <h2 id="univers-title" className="univers-main-title">
                Notre univers floral &amp; végétal
              </h2>
              <p className="section-lead-center">
                Fleurs fraîches de saison, décors d’exception, primeurs vitaminés et location : explorez toutes les
                facettes de la maison DécoFleur Plus.
              </p>
            </div>

            <div className="univers-grid">
              {universCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Link href={cat.href} key={idx} className="univers-card">
                    <div className="univers-card-top">
                      <div className="univers-icon-circle">
                        <Icon size={22} />
                      </div>
                      {cat.tag && <span className="univers-badge">{cat.tag}</span>}
                    </div>
                    <div className="univers-card-text">
                      <h3 className="univers-title">{cat.title}</h3>
                      <span className="univers-subtitle">{cat.subtitle}</span>
                    </div>
                    <span className="univers-link-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Campagnes Saisonnières & Offres */}
        <section className="campaigns-section" aria-label="Campagnes et sélections spéciales">
          <div className="content-width">
            <div className="campaigns-grid">
              {seasonalCampaigns.map((camp, idx) => (
                <article key={idx} className={`campaign-card ${camp.theme}`}>
                  {/* Image fondu à gauche dans le dégradé */}
                  <div className="campaign-card-bg-wrap" aria-hidden="true">
                    <Image
                      src={camp.image}
                      alt={camp.imageAlt}
                      fill
                      sizes="(max-width: 580px) 100vw, (max-width: 990px) 50vw, 300px"
                      className="campaign-card-img"
                    />
                    <div className="campaign-card-mask" />
                  </div>

                  <div className="campaign-card-content">
                    <div className="campaign-card-top">
                      <span className="campaign-badge">{camp.badge}</span>
                    </div>
                    <div className="campaign-card-bottom">
                      <h3 className="campaign-title">{camp.title}</h3>
                      <p className="campaign-desc">{camp.desc}</p>
                      <Link href={camp.href} className="campaign-btn">
                        {camp.cta} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Featured Row: Events Feature on Left + Products Grid on Right */}
        <section className="featured-row-section content-width">
          {/* Left Event Banner Card */}
          <aside className="event-tall-card">
            <div className="event-tall-header">
              <h2>Événements &amp; Mariages</h2>
              <p>Une scénographie florale sur mesure pour célébrer vos plus beaux moments.</p>
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
                <h2>Nos créations phares</h2>
              </div>
              <Link href="/boutique" className="view-all-link">
                Voir tout le catalogue <ArrowRight size={14} />
              </Link>
            </div>

            <ProductGrid products={featured} />
          </div>
        </section>

        {/* 5. Bandeau Scénographie & Demande de Devis (Pro-Strip) */}
        <section className="scenography-strip-section" aria-labelledby="sceno-heading">
          <div className="content-width scenography-strip-inner">
            <div className="scenography-copy">
              <span className="section-eyebrow" style={{ color: 'var(--pink)' }}>
                DÉCOFLEUR PLUS · ÉVÉNEMENTIEL PRESTIGE
              </span>
              <h2 id="sceno-heading" className="scenography-title">
                Scénographie florale sur mesure
              </h2>
              <p className="scenography-desc">
                Mariages, hôtels, restaurants, réceptions de prestige et villas privées sur la Petite Côte.
                Notre équipe conçoit vos arches, centres de table, ambiances végétales et coordonne votre projet de bout en bout.
              </p>
              <div className="scenography-actions">
                <Link href="/evenements#devis" className="button-pill-pink">
                  Demander un devis sur mesure <ArrowRight size={16} />
                </Link>
                <a
                  href={whatsappScenoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-pill-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <WhatsAppIcon size={16} /> Échanger sur WhatsApp
                </a>
              </div>
            </div>

            <div className="scenography-card-box">
              <span className="scenography-card-pill">Maison artisanale</span>
              <h3>Votre événement floral clé en main</h3>
              <p>De la première esquisse à l’installation le jour J à Saly, Mbour et alentours.</p>
              <ul className="scenography-feature-list">
                <li>• Conseil personnalisé et devis clair sous 24h</li>
                <li>• Fleurs fraîches coupées le jour même</li>
                <li>• Location coordonnée de vaisselle &amp; mobilier</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Signature Brand Teaser (À Propos concis avec lien vers /a-propos) */}
        <section className="brand-signature-section content-width">
          <div className="brand-signature-card">
            <div className="brand-signature-col">
              <span className="section-eyebrow">L’HISTOIRE DE LA MAISON</span>
              <h2>L’art végétal au cœur de la Petite Côte</h2>
              <p>
                Fondée sur un héritage familial lié au commerce des produits frais et sublimée par la passion de l’art
                floral, <strong>DécoFleur Plus</strong> apporte la noblesse de la nature dans chacun de vos moments précieux à Saly Portudal.
              </p>
              <div className="brand-signature-links">
                <Link href="/a-propos" className="view-more-brand-link">
                  Découvrir notre histoire, nos 8 savoir-faire &amp; nos 7 engagements <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="brand-signature-quote-col">
              <span className="quote-mark" aria-hidden="true">“</span>
              <blockquote className="brand-quote">
                La proximité d’une maison locale, avec les standards d’une marque d’exception.
              </blockquote>
              <span className="quote-author">Maison DécoFleur Plus — Saly Portudal, Sénégal</span>
            </div>
          </div>
        </section>

        {/* 7. Trust Badges & Gift Card Banner */}
        <section className="trust-and-gift-section content-width">
          {/* Left: 4 Trust Badges */}
          <div className="trust-badges-grid">
            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Truck size={20} />
              </div>
              <div className="trust-text">
                <strong>Livraison soignée</strong>
                <span>à Saly &amp; Mbour</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <ShieldCheck size={20} />
              </div>
              <div className="trust-text">
                <strong>Paiement sécurisé</strong>
                <span>Wave &amp; Orange Money</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Flower2 size={20} />
              </div>
              <div className="trust-text">
                <strong>Fraîcheur garantie</strong>
                <span>Fleurs sélectionnées</span>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon-box">
                <Headphones size={20} />
              </div>
              <div className="trust-text">
                <strong>Service attentif</strong>
                <span>+221 77 941 78 60</span>
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

        {/* 8. Interactive Testimonials Carousel ("Ils nous font confiance") */}
        <TestimonialCarousel />

        {/* 9. Homepage FAQ Section */}
        <HomeFaq />
      </main>

      <SiteFooter />
    </>
  );
}
