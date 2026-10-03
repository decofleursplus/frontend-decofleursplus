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
} from 'lucide-react';
import { products } from '@/lib/products';
import { CatalogClient } from '@/components/catalog-client';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';

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
            <div>
              <span className="eyebrow" style={{ color: '#fff' }}><Heart size={16} /> Savoir-faire floral</span>
              <h1>Événements & Mariages</h1>
              <p>Des compositions florales d’exception pour vos célébrations et réceptions sur la Petite Côte.</p>
            </div>
          </section>

          <div className="content-links">
            {[
              ['Mariages', '/mariages'],
              ['Anniversaires', '/anniversaires'],
              ['Décoration sur mesure', '/decoration'],
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

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <Link className="button-pill-pink" href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} /> Demander un devis sur mesure
            </Link>
          </div>
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
  return (
    <>
      <main className="content-width page-main">
        <section className="about-hero">
          <Image
            src="/images/boutique-equipe.jpg"
            alt="L’équipe et l’atelier floral Décofleur Plus à Saly"
            fill
            sizes="100vw"
            priority
          />
          <div className="about-hero-text">
            <span className="eyebrow" style={{ color: '#fff' }}><Sparkles size={16} /> Notre Maison Florale</span>
            <h1 style={{ color: '#fff' }}>Décofleur Plus</h1>
            <p>Nature en Élégance — Maître fleuriste à Saly Portudal, Sénégal</p>
          </div>
        </section>

        <div className="page-copy" style={{ marginTop: '28px' }}>
          <h2>Une passion née sur la Petite Côte sénégalaise</h2>
          <p>
            Implantée au cœur de <strong>Saly Portudal</strong>, la maison <strong>Décofleur Plus</strong> incarne l’art
            floral sous toutes ses facettes. Alliant raffinement contemporain et générosité de la nature tropicale, notre
            atelier imagine chaque jour des créations florales qui célèbrent les plus beaux instants de la vie.
          </p>
          <p>
            Que vous souhaitiez déclarer votre flamme avec un somptueux bouquet de roses, fleurir une réception de mariage
            prestigieuse en bord de mer, offrir une corbeille de fruits gorgés de soleil ou apporter une touche de sérénité
            avec des plantes d’intérieur d’exception, notre équipe d’artisans fleuristes met son savoir-faire à votre
            service avec passion et rigueur.
          </p>
        </div>

        <div className="about-grid">
          <article className="about-card">
            <div className="about-card-icon"><Flower2 size={24} /></div>
            <h3>Fleurs d’une fraîcheur absolue</h3>
            <p>Sélection quotidienne de fleurs fraîches garantissant un éclat et une tenue irréprochable plusieurs jours durant.</p>
          </article>

          <article className="about-card">
            <div className="about-card-icon"><Heart size={24} /></div>
            <h3>Créations sur mesure</h3>
            <p>Chaque bouquet est unique. Personnalisez votre commande avec un mot calligraphié, une carte cadeau et un emballage soigné.</p>
          </article>

          <article className="about-card">
            <div className="about-card-icon"><Truck size={24} /></div>
            <h3>Livraison soignée & ponctuelle</h3>
            <p>Service de coursiers dédiés pour acheminer vos compositions à Saly et Mbour dans des conditions optimales de fraîcheur.</p>
          </article>

          <article className="about-card">
            <div className="about-card-icon"><Star size={24} /></div>
            <h3>Paiement mobile instantané</h3>
            <p>Réglez vos commandes en toute simplicité et sécurité avec Wave, Orange Money ou par carte bancaire internationale.</p>
          </article>
        </div>

        <div className="about-cta">
          <Link className="button-pill-pink" href="/boutique">
            Découvrir notre collection <ArrowRight size={15} />
          </Link>
          <Link className="button-pill-outline" href="/contact">
            Nous rendre visite ou nous contacter <ArrowRight size={15} />
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
