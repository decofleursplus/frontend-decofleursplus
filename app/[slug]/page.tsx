import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  Flower2,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  BookOpen,
  Calendar,
  Calculator,
  Sprout,
  CheckCircle2,
  Gift,
  UtensilsCrossed,
  Building2,
} from 'lucide-react';
import { products } from '@/lib/products';
import { CatalogClient } from '@/components/catalog-client';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';
import { DevisForm } from '@/components/devis-form';

const categories: Record<string, string> = {
  bouquets: 'Bouquets',
  roses: 'Roses',
  plantes: 'Plantes',
  'paniers-de-fruits': 'Paniers de fruits',
  cadeaux: 'Cadeaux',
  mariages: 'Mariages',
  decoration: 'Décoration',
  deuil: 'Deuil',
  bougies: 'Bougies',
  vases: 'Vases & Bougies',
  occasions: 'Occasions spéciales',
  anniversaires: 'Anniversaires',
};

const contentSlugs = [
  ...Object.keys(categories),
  'recherche',
  'evenements',
  'livraison',
  'a-propos',
  'contact',
  'faq',
  'blog',
  'conditions',
  'confidentialite',
];

export const dynamicParams = false;
export function generateStaticParams() {
  return contentSlugs.map((slug) => ({ slug }));
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = categories[slug];

  if (title) return <CategoryPage title={title} slug={slug} />;
  if (slug === 'recherche') {
    return (
      <>
        <main className="content-width page-main">
          <div className="page-copy">
            <span className="eyebrow"><Sparkles size={16} /> Recherche catalogue</span>
            <h1>Trouvez votre composition florale</h1>
            <p>Recherchez un bouquet, une plante ou un cadeau parmi nos créations artisanales.</p>
          </div>
          <CatalogClient />
        </main>
        <SiteFooter />
      </>
    );
  }
  if (slug === 'evenements') {
    return (
      <>
        <main className="content-width page-main">
          <section className="page-banner shop-banner">
            <Image
              src="/images/mariage.jpg"
              alt="Décoration florale de mariage et réceptions"
              fill
              sizes="100vw"
            />
            <div className="page-banner-content">
              <span className="banner-badge"><Heart size={15} /> Savoir-faire floral</span>
              <h1>Événements & Scénographie</h1>
              <p>Des compositions florales d’exception et un accompagnement sur mesure pour vos célébrations et réceptions sur la Petite Côte.</p>
            </div>
          </section>

          <div className="content-links">
            {[
              ['Mariages & Cérémonies', '/mariages'],
              ['Anniversaires & Réceptions', '/anniversaires'],
              ['Décoration & Tables', '/decoration'],
              ['Cérémonies de deuil', '/deuil'],
            ].map(([label, href]) => (
              <Link className="content-link-card" href={href} key={href}>
                <span>{label}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>

          <div className="section-heading" style={{ marginTop: '36px' }}>
            <h2>Compositions recommandées pour vos réceptions</h2>
          </div>
          <ProductGrid products={products.filter((p) => p.category === 'Mariages' || p.category === 'Bouquets')} />

          <div style={{ marginTop: '40px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <a className="button-pill-pink" href="#devis" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} /> Demander un devis sur mesure
            </a>
          </div>

          {/* Formulaire interactif de demande de devis */}
          <DevisForm />
        </main>
        <SiteFooter />
      </>
    );
  }
  if (slug === 'livraison') return <DeliveryPage />;
  if (slug === 'a-propos') return <AboutPage />;
  if (slug === 'contact') return <ContactPage />;
  if (slug === 'faq') redirect('/#faq');
  if (slug === 'blog') return <BlogPage />;
  if (slug === 'conditions' || slug === 'confidentialite') {
    return (
      <>
        <main className="content-width page-main">
          <div className="page-copy legal-page">
            <span className="eyebrow"><ShieldCheck size={16} /> Mentions légales & Sécurité</span>
            <h1>{slug === 'conditions' ? 'Conditions Générales de Vente' : 'Politique de Confidentialité'}</h1>
            <p>
              {slug === 'conditions'
                ? 'Les présentes conditions régissent les commandes passées sur Décofleur Plus Saly. Tout achat implique l’adhésion pleine et entière aux modalités de livraison, de garantie fraîcheur et de paiement sécurisé.'
                : 'Décofleur Plus protège votre vie privée. Les informations recueillies lors de votre commande (nom, téléphone, adresse de livraison à Saly ou Mbour) sont exclusivement utilisées pour l’acheminement de vos fleurs et la confirmation par SMS ou WhatsApp.'}
            </p>
            <div className="info-card-grid" style={{ marginTop: '24px' }}>
              <article className="info-card">
                <h3>Garantie Fraîcheur</h3>
                <p>Nos fleurs sont sélectionnées et coupées le jour même de la livraison pour une tenue optimale.</p>
              </article>
              <article className="info-card">
                <h3>Paiement Sécurisé</h3>
                <p>Transactions sécurisées via Wave, Orange Money et passerelles bancaires vérifiées.</p>
              </article>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  notFound();
}

function CategoryPage({ title, slug }: { title: string; slug: string }) {
  return (
    <>
      <main className="content-width page-main">
        <section className="page-banner shop-banner">
          <Image
            src="/images/hero.jpg"
            alt={`Compositions ${title} Décofleur Plus`}
            fill
            sizes="100vw"
          />
          <div>
            <h1>{title}</h1>
            <p>Découvrez nos créations artisanales fraîches pour la catégorie {title}.</p>
          </div>
        </section>

        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href="/boutique">Boutique</Link>
          <span>›</span>
          <span>{title}</span>
        </div>

        <CatalogClient initialCategory={title} />

        <div className="category-crosslinks">
          {Object.entries(categories)
            .filter(([other]) => other !== slug)
            .slice(0, 6)
            .map(([other, label]) => (
              <Link href={`/${other}`} key={other}>
                {label}
              </Link>
            ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function DeliveryPage() {
  return (
    <>
      <main className="content-width page-main">
        <div className="page-copy">
          <span className="eyebrow"><Truck size={16} /> Service logistique à Saly & Mbour</span>
          <h1>La livraison de vos fleurs</h1>
          <p>
            Décofleur Plus livre avec soin vos bouquets, plantes et corbeilles de fruits dans toute la zone de Saly,
            Mbour, Ngaparou et La Somone. Choisissez votre créneau horaire préféré lors du checkout.
          </p>
        </div>

        <div className="info-card-grid">
          <article className="info-card">
            <h2>Livraison Standard</h2>
            <p className="price-tag">2 000 FCFA</p>
            <p>Disponible à Saly Portudal et Mbour centre. Livré sous 3h à 5h avec notification WhatsApp au destinataire.</p>
          </article>
          <article className="info-card">
            <h2>Livraison Express</h2>
            <p className="price-tag">5 000 FCFA</p>
            <p>Livraison prioritaire sous 90 minutes. Idéal pour une surprise ou une célébration de dernière minute.</p>
          </article>
          <article className="info-card">
            <h2>Retrait en Boutique</h2>
            <p className="price-tag">Gratuit</p>
            <p>Venez récupérer votre composition directement à notre boutique de Saly Portudal aux horaires d’ouverture.</p>
          </article>
        </div>

        <div className="delivery-map-card" style={{ marginTop: '30px' }}>
          <div className="delivery-map-copy">
            <h3><MapPin size={18} /> Zone de couverture</h3>
            <p>
              Notre service de livraison dessert quotidiennement : Saly Portudal, Saly Niakhniakhal, Saly Joseph,
              Mbour centre, Mbour Tefess, Warang, Ngaparou et La Somone.
            </p>
            <p className="muted-note">Pour toute autre localité au Sénégal, veuillez nous contacter avant de commander.</p>
            <Link className="button-pill-pink button-small" href="/contact">
              Nous contacter pour une livraison spéciale <ArrowRight size={14} />
            </Link>
          </div>
          <div className="delivery-map-img">
            <Image
              src="/images/order-map.jpg"
              alt="Carte de livraison à Saly et Mbour"
              fill
              sizes="(max-width: 900px) 100vw, 450px"
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function AboutPage() {
  const savoirFaire = [
    {
      num: '01',
      title: 'Art floral',
      desc: 'Bouquets d’exception, compositions sur mesure, fleurs fraîches et créations personnalisées pour chaque émotion.',
      icon: Flower2,
    },
    {
      num: '02',
      title: 'Scénographie florale',
      desc: 'Mariages, baptêmes, anniversaires, réceptions, tables, arches végétales, hôtels et décors de villas privées.',
      icon: Heart,
    },
    {
      num: '03',
      title: 'Fraises & Primeurs d’exception',
      desc: 'Fraises fraîches cultivées avec soin, fruits sélectionnés et paniers gourmands généreux.',
      icon: Star,
    },
    {
      num: '04',
      title: 'Décoration & Objets',
      desc: 'Vases raffinés, bougies parfumées, objets décoratifs et contenants élégants pour sublimer vos intérieurs.',
      icon: Sparkles,
    },
    {
      num: '05',
      title: 'Peluches & Gourmandises',
      desc: 'Peluches douces, chocolats fins et coffrets attentionnés pour composer des cadeaux inoubliables.',
      icon: Gift,
    },
    {
      num: '06',
      title: 'Paysagisme & Espaces verts',
      desc: 'Conception végétale, aménagement de jardins, terrasses de villa et entretien paysager sur la Petite Côte.',
      icon: Sprout,
    },
    {
      num: '07',
      title: 'Location événementielle',
      desc: 'Vaisselle soignée, verrerie, mobilier d’appoint et accessoires pour vos réceptions prestigieuses.',
      icon: UtensilsCrossed,
    },
    {
      num: '08',
      title: 'Solutions professionnelles',
      desc: 'Partenariats hôteliers, décoration de restaurants, villas en conciergerie et abonnements corporate.',
      icon: Building2,
    },
  ];

  const engagements = [
    'Des fleurs et produits frais sélectionnés avec une exigence quotidienne',
    'Des créations florales artisanales soignées dans le moindre détail',
    'Des solutions adaptées aux budgets et aux souhaits de chaque client',
    'Une livraison rapide et ponctuelle à Saly, Mbour et sur la Petite Côte',
    'Un accompagnement personnalisé par des artisans passionnés',
    'Des modalités de paiement simples, immédiates et sécurisées (Wave, Orange Money)',
    'Une relation de confiance et de long terme avec les particuliers et professionnels',
  ];

  return (
    <>
      <main className="content-width page-main">
        {/* Hero Banner */}
        <section className="about-hero">
          <Image
            src="/images/boutique-equipe.jpg"
            alt="L’équipe et l’atelier floral Décofleur Plus à Saly"
            fill
            sizes="100vw"
            priority
          />
          <div className="about-hero-overlay" />
          <div className="about-hero-text">
            <span className="about-hero-badge">
              <Sparkles size={15} /> Maison Florale &amp; Végétale
            </span>
            <h1>Décofleur Plus</h1>
            <p>Nature en Élégance — Saly Portudal, Petite Côte du Sénégal</p>
          </div>
        </section>

        {/* Section 1: Histoire & Héritage */}
        <div className="about-narrative-section">
          <div className="about-narrative-col">
            <span className="section-eyebrow">NOTRE HISTOIRE</span>
            <h2>Une passion née sur la Petite Côte sénégalaise</h2>
            <p>
              Implantée à <strong>Saly Portudal</strong>, la maison <strong>DécoFleur Plus</strong> est née d’une
              vocation authentique : magnifier la nature tropicale et locale en lui associant les codes de
              l’art floral contemporain le plus exigeant.
            </p>
            <p>
              L’histoire de DécoFleur Plus s’inscrit dans un héritage familial lié au commerce des fruits, des primeurs
              et au sens du produit bien sélectionné. Cette sensibilité pour la fraîcheur s’est tout naturellement
              épanouie vers l’univers floral et végétal : savoir-faire artisanal, rigueur d’assemblage et respect du végétal.
            </p>
          </div>

          <div className="about-narrative-col about-narrative-quote-box">
            <span className="quote-flourish">“</span>
            <blockquote className="about-large-quote">
              La proximité d’une maison locale, avec les standards d’une marque d’exception.
            </blockquote>
            <p className="quote-author">Maison DécoFleur Plus — Saly Portudal</p>
          </div>
        </div>

        {/* Section 2: Nos 8 Savoir-Faire */}
        <section className="about-savoir-faire-section">
          <div className="section-header-center">
            <span className="section-eyebrow">DOMAINE D’EXCELLENCE</span>
            <h2>Nos 8 domaines de savoir-faire</h2>
            <p className="section-lead-center">
              De la confection d’un bouquet intime jusqu’à la scénographie complète d’un mariage d’envergure, découvrez nos univers.
            </p>
          </div>

          <div className="savoir-faire-grid">
            {savoirFaire.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.num} className="savoir-faire-card">
                  <div className="savoir-faire-top">
                    <span className="savoir-faire-num">{item.num}</span>
                    <div className="savoir-faire-icon">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 3: Nos Engagements */}
        <section className="about-engagements-section">
          <div className="engagements-inner">
            <div className="engagements-left">
              <span className="section-eyebrow">NOS VALEURS</span>
              <h2>Les 7 engagements de DécoFleur Plus</h2>
              <p>
                Chaque composition, chaque commande et chaque partenariat repose sur un socle de valeurs partagées avec nos clients.
              </p>
              <div className="engagement-words-pills">
                <span>Qualité</span>
                <span>Fraîcheur</span>
                <span>Créativité</span>
                <span>Ponctualité</span>
                <span>Proximité</span>
                <span>Exigence</span>
              </div>
            </div>

            <div className="engagements-right">
              <ul className="engagements-list">
                {engagements.map((eng, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} className="engagement-check-icon" />
                    <span>{eng}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div className="about-cta" style={{ marginTop: '48px' }}>
          <Link className="button-pill-pink" href="/boutique">
            Découvrir notre boutique <ArrowRight size={15} />
          </Link>
          <Link className="button-pill-outline" href="/evenements#devis">
            Demander un devis sur mesure <ArrowRight size={15} />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ContactPage() {
  return (
    <>
      <main className="content-width page-main">
        <div className="page-copy">
          <span className="eyebrow"><MessageCircle size={16} /> Service client & atelier</span>
          <h1>Contactez Décofleur Plus</h1>
          <p>
            Besoin d’un conseil personnalisé pour un bouquet, d’un devis pour un événement ou d’une précision sur votre
            livraison ? Notre équipe est à votre écoute par message, téléphone ou directement sur WhatsApp.
          </p>
        </div>

        <div className="contact-layout">
          <section className="checkout-panel">
            <h2>Envoyez-nous un message</h2>
            <ContactForm />
          </section>

          <aside className="checkout-panel contact-details">
            <h2>Notre Boutique à Saly</h2>
            <p><MapPin size={18} /> Saly Portudal (Route de la Plage), Sénégal</p>
            <p><Phone size={18} /> +221 77 941 78 60</p>
            <p><Clock size={18} /> Lundi au Samedi : 8h00 – 19h30</p>
            <p><Clock size={18} /> Dimanche : 9h00 – 14h00</p>
            <p><ShieldCheck size={18} /> Paiement sécurisé Wave & Orange Money</p>

            <div style={{ marginTop: '18px' }}>
              <a
                className="button-pill-pink button-small"
                href="tel:+221779417860"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Phone size={15} /> Contacter
              </a>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <Link href="/#faq" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--pink)', fontSize: '13px', fontWeight: 600 }}>
                Consulter les questions fréquentes (FAQ) <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function BlogPage() {
  const blogArticles = [
    {
      title: 'Comment entretenir vos roses et bouquets sous le climat de Saly',
      category: 'Conseils Fleurs',
      date: '15 Septembre 2026',
      readTime: '4 min de lecture',
      excerpt: 'Découvrez nos astuces de fleuristes pour prolonger la fraîcheur de vos bouquets de fleurs coupées face à la chaleur et à l’air marin de la Petite Côte.',
      image: '/images/bouquet-detail.jpg',
    },
    {
      title: 'Mariage sur la Petite Côte : les fleurs idéales pour une cérémonie inoubliable',
      category: 'Mariages',
      date: '02 Septembre 2026',
      readTime: '6 min de lecture',
      excerpt: 'Du bouquet de mariée aux arches florales de plage, découvrez les variétés résistantes et les palettes de couleurs tendance pour célébrer votre union à Saly.',
      image: '/images/mariage.jpg',
    },
    {
      title: 'Pourquoi offrir un panier de fruits tropicaux pour vos réceptions',
      category: 'Idées Cadeaux',
      date: '20 Août 2026',
      readTime: '3 min de lecture',
      excerpt: 'Une alternative saine, élégante et gourmande aux cadeaux traditionnels. Sélection des meilleurs fruits du Sénégal pour ravir vos convives.',
      image: '/images/fruits.jpg',
    },
    {
      title: 'Les bienfaits des plantes d’intérieur dépolluantes chez vous',
      category: 'Plantes & Déco',
      date: '10 Août 2026',
      readTime: '5 min de lecture',
      excerpt: 'Monstera, Ficus et Orchidées : comment purifier l’atmosphère de votre villa ou appartement tout en créant une oasis végétale apaisante.',
      image: '/images/plante-monstera.jpg',
    },
  ];

  return (
    <>
      <main className="content-width page-main">
        <div className="page-copy">
          <span className="eyebrow"><BookOpen size={16} /> Le Journal Floral</span>
          <h1>Conseils, Inspirations & Tendances</h1>
          <p>Retrouvez nos guides d’experts fleuristes, conseils d’entretien et inspirations pour vos décors et événements.</p>
        </div>

        <div className="blog-grid">
          {blogArticles.map((art, idx) => (
            <article key={idx} className="blog-card">
              <div className="blog-card-image">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority={idx === 0}
                />
                <span className="blog-badge">{art.category}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-meta">
                  <span><Calendar size={13} /> {art.date}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <h3>{art.title}</h3>
                <p>{art.excerpt}</p>
                <Link href="/boutique" className="blog-read-more">
                  Découvrir nos compositions associées <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
