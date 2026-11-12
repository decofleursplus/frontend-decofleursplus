import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { constructMetadata } from '@/lib/seo/metadata';
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
  Calculator,
  Sprout,
  CheckCircle2,
  Gift,
  UtensilsCrossed,
  Building2,
} from 'lucide-react';
import { formatPrice } from '@/lib/products';
import { getCategories } from '@/lib/api/catalog';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { telHref, whatsappHref } from '@/lib/shop-contact';
import { SITE_CONFIG } from '@/lib/seo/config';
import { LiveProductGrid, loadZones } from '@/components/storefront/live-data';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';
import { ContactMap } from '@/components/contact-map';
import { BotanicalCorners } from '@/components/botanical-corners';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (categories[slug]) {
    const title = categories[slug];
    return constructMetadata({
      title: `${title} — Fleuriste Saly & Dakar`,
      canonical: `/categories/${slug}`,
    });
  }

  switch (slug) {
    case 'evenements':
      return constructMetadata({
        title: 'Événements & Décoration Florale | Mariages, Banquets & Cérémonies à Saly & Dakar',
        description: 'Scénographie florale haut de gamme, arches de mariage, centres de table et décors monumentaux pour vos événements de prestige au Sénégal.',
        canonical: '/evenements',
        image: '/images/mariage.jpg',
        keywords: ['decoration mariage dakar', 'arche florale saly', 'fleuriste evenementiel senegal', 'centre de table banquet'],
      });
    case 'livraison':
      return constructMetadata({
        title: 'Livraison de Fleurs à Saly, Dakar, Somone & Petite-Côte | Décofleur Plus',
        description: 'Modalités de livraison de fleurs fraîches : express 2h à Saly Portudal, le jour même à Somone et Mbour, et 24h par navette réfrigérée vers Dakar.',
        canonical: '/livraison',
        image: '/images/hero.jpg',
        keywords: ['livraison fleurs dakar', 'livraison fleurs saly', 'livraison bouquet senegal', 'livraison somone'],
      });
    case 'a-propos':
      return constructMetadata({
        title: 'À Propos de Décofleur Plus — Savoir-Faire Floral & Héritage Artisanal',
        description: 'Découvrez l’histoire de Décofleur Plus : artisanat floral de prestige, sélection rigoureuse des fleurs fraîches et passion botanique à Saly Portudal.',
        canonical: '/a-propos',
        image: '/images/boutique-equipe.jpg',
      });
    case 'contact':
      return constructMetadata({
        title: 'Contact & Atelier Floral à Saly Portudal | Décofleur Plus',
        description: 'Contactez notre atelier floral : téléphone Saly, WhatsApp Dakar, adresse Rue des Palmiers à Saly Portudal, devis gratuit et horaires d’ouverture.',
        canonical: '/contact',
      });
    case 'conditions':
      return constructMetadata({
        title: 'Conditions Générales de Vente | Décofleur Plus',
        description: 'Conditions générales de vente, engagements fraîcheur, modalités de commande et de paiement Wave & Orange Money sur Décofleur Plus.',
        canonical: '/conditions',
      });
    case 'confidentialite':
      return constructMetadata({
        title: 'Politique de Confidentialité | Décofleur Plus',
        description: 'Politique de protection des données personnelles et de confidentialité de Décofleur Plus.',
        canonical: '/confidentialite',
      });
    case 'recherche':
      return constructMetadata({
        title: 'Recherche Catalogue Floral',
        description: 'Recherchez une composition florale, un bouquet ou une plante.',
        noIndex: true,
      });
    default:
      return constructMetadata({
        title: 'Décofleur Plus',
      });
  }
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = categories[slug];

  // Redirection 301 automatique des anciennes URLs courtes vers /categories/[slug]
  if (title) {
    permanentRedirect(`/categories/${slug}`);
  }
  if (slug === 'blog') {
    permanentRedirect('/blog');
  }
  if (slug === 'faq') {
    redirect('/#faq');
  }

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
      <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
        <BotanicalCorners />
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

          <EventCategoryLinks />

          <div className="section-heading" style={{ marginTop: '36px' }}>
            <h2>Compositions recommandées pour vos réceptions</h2>
          </div>
          <LiveProductGrid limit={8} />

          <div style={{ marginTop: '48px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <Link className="button-pill-pink" href="/devis?type=evenements" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} /> Demander un devis sur mesure →
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
  if (slug === 'livraison') return <DeliveryPage />;
  if (slug === 'a-propos') return <AboutPage />;
  if (slug === 'contact') return <ContactPage settings={await getPublicSettings().catch(() => null)} />;
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
                : 'Décofleur Plus protège votre vie privée. Les informations recueillies lors de votre commande (nom, téléphone, adresse de livraison à Saly ou Mbour) sont exclusivement utilisées pour l’acheminement de vos fleurs et la confirmation de votre commande par e-mail, téléphone ou WhatsApp.'}
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

async function DeliveryPage() {
  const [zones, settings] = await Promise.all([loadZones(), getPublicSettings().catch(() => null)]);
  const deliveryZones = (zones ?? []).map((z) => ({
    zone: z.name,
    places: z.coverage || '—',
    time: `Délai indicatif : ${z.estimatedTimeHours < 24 ? `${z.estimatedTimeHours} h` : `${Math.round(z.estimatedTimeHours / 24)} jour(s)`}`,
    price: formatPrice(z.fee),
    tag: [`Express ${formatPrice(z.expressFee)}`, z.freeAbove ? `Offerte dès ${formatPrice(z.freeAbove)}` : null]
      .filter(Boolean)
      .join(' · '),
  }));
  deliveryZones.push({
    zone: 'Retrait à l’atelier',
    places: settings?.boutique.address ?? 'À notre boutique',
    time: 'Au créneau choisi lors de la commande',
    price: 'Gratuit',
    tag: 'Click & Collect',
  });

  const steps = [
    {
      step: '01',
      title: 'Sélection & Coupe du jour',
      desc: 'Tiges fraîches coupées le matin même pour garantir une tenue et un éclat floral maximal sous notre climat.',
      icon: Sprout,
    },
    {
      step: '02',
      title: 'Création artisanale & Réserve d’eau',
      desc: 'Assemblage minutieux par nos artisans avec réserve d’eau nutritive pour que le bouquet reste parfaitement hydraté.',
      icon: Flower2,
    },
    {
      step: '03',
      title: 'Photo de confirmation WhatsApp',
      desc: 'Nous vous envoyons une photo haute définition de votre composition avant le départ de notre véhicule.',
      icon: MessageCircle,
    },
    {
      step: '04',
      title: 'Transport climatisé & Remise soignée',
      desc: 'Acheminement en véhicule climatisé et remise en main propre avec le mot doux de votre choix (ou surprise anonyme).',
      icon: Truck,
    },
  ];

  const commitments = [
    {
      title: 'Transport sous climatisation',
      desc: 'Tous nos véhicules sont réfrigérés ou climatisés pour préserver les fleurs de la chaleur de la Petite Côte.',
      icon: ShieldCheck,
    },
    {
      title: 'Livraisons surprises & Hôtels',
      desc: 'Remise discrète en chambre d’hôtel ou villa avec message manuscrit calligraphié pour un effet waouh garanti.',
      icon: Heart,
    },
    {
      title: 'Notification WhatsApp immédiate',
      desc: 'Vous êtes immédiatement prévenu dès que votre composition est déposée ou remise au destinataire.',
      icon: CheckCircle2,
    },
    {
      title: 'Garantie Remplacement 24h',
      desc: 'Si la composition ne correspond pas à vos attentes à l’arrivée, nous la remplaçons gracieusement sous 24h.',
      icon: Star,
    },
  ];

  const whatsappSpecialUrl = whatsappHref(
    settings?.boutique.whatsappNumber ?? SITE_CONFIG.phoneDakar,
    'Bonjour, je souhaite organiser une livraison sur mesure ou hors zone.',
  );

  return (
    <>
      <main className="content-width page-main">
        <div className="delivery-page-container">
          {/* Hero Banner Logistique */}
          <section className="delivery-hero-card">
            <span className="delivery-hero-badge">
              <Truck size={14} /> Service Logistique DécoFleur Plus
            </span>
            <h1 className="delivery-hero-title">
              La livraison de vos fleurs &amp; primeurs d’exception
            </h1>
            <p className="delivery-hero-subtitle">
              De Saly Portudal à Mbour, Ngaparou, La Somone et Dakar : nous acheminons vos bouquets, corbeilles et plantes
              dans des conditions de fraîcheur irréprochables avec notification WhatsApp.
            </p>
            <div className="delivery-hero-quickstats">
              <span className="delivery-stat-pill">
                <Clock size={14} /> 7j/7 de 08h00 à 20h00
              </span>
              <span className="delivery-stat-pill">
                <Truck size={14} /> Véhicules climatisés
              </span>
              <span className="delivery-stat-pill">
                <ShieldCheck size={14} /> Garantie fraîcheur 100%
              </span>
            </div>
          </section>

          {/* Timeline des 4 étapes */}
          <section aria-labelledby="delivery-steps-title">
            <div className="delivery-section-heading">
              <span>EXCELLENCE OPÉRATIONNELLE</span>
              <h2 id="delivery-steps-title">Le parcours de votre bouquet, étape par étape</h2>
              <p>Un processus maîtrisé de la coupe matinale jusqu’au pas de la porte de votre destinataire.</p>
            </div>
            <div className="delivery-steps-grid">
              {steps.map((st) => {
                const IconComponent = st.icon;
                return (
                  <article key={st.step} className="delivery-step-card">
                    <div className="delivery-step-number">{st.step}</div>
                    <div className="delivery-step-icon">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="delivery-step-title">{st.title}</h3>
                    <p className="delivery-step-desc">{st.desc}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Grille des zones et tarifs */}
          <section aria-labelledby="delivery-zones-title">
            <div className="delivery-section-heading">
              <span>TARIFICATION TRANSPARENTE</span>
              <h2 id="delivery-zones-title">Zones de livraison &amp; Tarifs détaillés</h2>
              <p>Des tarifs fixes et clairs pour toute la Petite Côte et les grands axes du Sénégal.</p>
            </div>
            <div className="delivery-zones-card">
              <table className="delivery-zones-table">
                <thead>
                  <tr>
                    <th>Zone &amp; Localité</th>
                    <th>Quartiers et résidences couverts</th>
                    <th>Délai indicatif</th>
                    <th>Tarif</th>
                  </tr>
                </thead>
                <tbody>
                  {zones === null && (
                    <tr>
                      <td colSpan={4}>Les tarifs sont momentanément indisponibles : ils restent affichés au panier.</td>
                    </tr>
                  )}
                  {deliveryZones.map((z, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="zone-name">{z.zone}</span>
                        <span className="zone-tag">{z.tag}</span>
                      </td>
                      <td>{z.places}</td>
                      <td>{z.time}</td>
                      <td>
                        <span className="zone-price">{z.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nos 4 Engagements fraîcheur */}
          <section aria-labelledby="delivery-commitments-title">
            <div className="delivery-section-heading">
              <span>NOTRE PROMESSE</span>
              <h2 id="delivery-commitments-title">Des garanties pensées pour votre sérénité</h2>
              <p>Parce qu’offrir des fleurs est un geste chargé d’émotion, chaque détail compte.</p>
            </div>
            <div className="delivery-commitments-grid">
              {commitments.map((c, idx) => {
                const IconComp = c.icon;
                return (
                  <article key={idx} className="delivery-commitment-card">
                    <div className="delivery-commitment-icon">
                      <IconComp size={22} />
                    </div>
                    <h3 className="delivery-commitment-title">{c.title}</h3>
                    <p className="delivery-commitment-desc">{c.desc}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* CTA Banner de commande ou livraison spéciale */}
          <section className="delivery-cta-card">
            <div className="delivery-cta-copy">
              <h3>Besoin d’une livraison spéciale ou hors zone ?</h3>
              <p>Mariage, livraison surprise anonyme, événement d’entreprise ou localité éloignée : contactez nos fleuristes.</p>
            </div>
            <div className="delivery-cta-buttons">
              <Link href="/boutique" className="button-pill-pink">
                Commander en ligne <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappSpecialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boutique-btn boutique-btn-whatsapp"
                style={{ padding: '10px 18px', borderRadius: '9999px' }}
              >
                <MessageCircle size={16} />
                <span>Demander sur WhatsApp</span>
              </a>
            </div>
          </section>
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
          <Link className="button-pill-outline" href="/devis?type=evenements">
            Demander un devis sur mesure <ArrowRight size={15} />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

const PAYMENT_LABELS: [keyof Omit<PublicShopSettings['payments'], 'cashMaxAmount'>, string][] = [
  ['wave', 'Wave'],
  ['orangeMoney', 'Orange Money'],
  ['card', 'Carte bancaire'],
  ['cash', 'Espèces à la livraison'],
];

/** Coordonnées issues de Paramètres › Boutique ; repli sur la configuration du site si l'API ne répond pas. */
function ContactPage({ settings }: { settings: PublicShopSettings | null }) {
  const shop = settings?.boutique;
  const address = shop?.address ?? SITE_CONFIG.address.streetAddress;
  const phones = [shop?.phoneSaly ?? SITE_CONFIG.phoneSaly, shop?.phoneDakar ?? SITE_CONFIG.phoneDakar].filter(
    (p, i, all) => p && all.indexOf(p) === i,
  );
  const whatsapp = whatsappHref(
    shop?.whatsappNumber ?? SITE_CONFIG.phoneDakar,
    'Bonjour, je souhaite un renseignement ou un devis personnalisé.',
  );
  const hours = (shop?.openingHours ?? '').split('|').map((h) => h.trim()).filter(Boolean);
  const payments = settings ? PAYMENT_LABELS.filter(([key]) => settings.payments[key]).map(([, label]) => label) : [];

  return (
    <>
      <main className="content-width page-main">
        {/* Header de page */}
        <div className="page-copy contact-header-copy">
          <span className="eyebrow">
            <MessageCircle size={16} /> Écoute, conseil &amp; atelier
          </span>
          <h1>Contactez la Maison {shop?.shopName ?? 'DécoFleur Plus'}</h1>
          <p>
            Une question sur un bouquet, une commande en cours, ou un projet événementiel sur mesure à Saly ou sur la Petite Côte ?
            Notre équipe vous répond avec attention et réactivité.
          </p>
        </div>

        {/* Grille Split-Screen : Formulaire à gauche, Infos & Carte à droite */}
        <div className="contact-premium-grid">
          {/* Colonne gauche : Formulaire */}
          <section className="contact-form-card" aria-labelledby="contact-form-title">
            <div className="contact-form-header">
              <span className="text-xs font-bold uppercase tracking-wider text-[#be185d]">
                Formulaire en ligne
              </span>
              <h2 id="contact-form-title">Envoyez-nous un message</h2>
              <p>Remplissez ce formulaire : votre message est transmis directement à notre équipe, qui vous répond par email ou par téléphone.</p>
            </div>
            <ContactForm />
            <div className="contact-reassurance-row">
              <span className="reassurance-pill">
                <CheckCircle2 size={13} className="text-emerald-600" /> Devis gratuit &amp; sans engagement
              </span>
              <span className="reassurance-pill">
                <CheckCircle2 size={13} className="text-emerald-600" /> Données confidentielles
              </span>
            </div>
          </section>

          {/* Colonne droite : Coordonnées boutique & Carte interactive */}
          <aside className="contact-sidebar-column">
            {/* Carte 1 : Coordonnées */}
            <div className="contact-boutique-card">

              <h3 className="boutique-title">Atelier &amp; Boutique</h3>
              <p className="boutique-address">
                <MapPin size={17} className="text-[#246e38] shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>

              {/* Boutons d'actions directs dans la colonne boutique */}
              <div className="boutique-actions">
                {phones.map((phone) => (
                  <a key={phone} href={telHref(phone)} className="boutique-btn boutique-btn-phone">
                    <Phone size={16} />
                    <span>Appeler au {phone}</span>
                  </a>
                ))}
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="boutique-btn boutique-btn-whatsapp">
                    <MessageCircle size={16} />
                    <span>Écrire sur WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="boutique-meta-grid">
                {hours.length > 0 && (
                  <div className="boutique-meta-item">
                    <Clock size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Horaires d’ouverture</strong>
                      {hours.map((h) => (
                        <span key={h} className="block">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {shop?.contactEmail && (
                  <div className="boutique-meta-item">
                    <MessageCircle size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Email</strong>
                      <a href={`mailto:${shop.contactEmail}`} className="underline">
                        {shop.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {payments.length > 0 && (
                  <div className="boutique-meta-item">
                    <ShieldCheck size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Paiements acceptés</strong>
                      <span>{payments.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carte 2 : Carte interactive avec repère et itinéraire */}
            <ContactMap address={address} />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Liens vers les catégories réelles du catalogue (page Événements). */
async function EventCategoryLinks() {
  let categories: { slug: string; name: string }[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error('[Événements] Catégories indisponibles :', error);
  }
  return (
    <div className="content-links">
      {categories.map((c) => (
        <Link className="content-link-card" href={`/categories/${c.slug}`} key={c.slug}>
          <span>{c.name}</span>
          <ArrowRight size={16} />
        </Link>
      ))}
      <Link className="content-link-card" href="/devis?type=evenements">
        <span>Décoration événementielle sur devis</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
