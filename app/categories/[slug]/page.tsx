import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';

const categories: Record<string, { title: string; description: string; image: string }> = {
  bouquets: {
    title: 'Bouquets Élégants',
    description: 'Découvrez notre collection de bouquets de fleurs fraîches confectionnés à la main par nos artisans fleuristes à Saly Portudal. Livraison rapide à Dakar et Petite-Côte.',
    image: '/images/bouquet-detail.jpg',
  },
  roses: {
    title: 'Roses Fraîches',
    description: 'Sélection de roses fraîches haut de gamme, roses rouges passion, roses pâles et compositions romantiques livrées avec soin à domicile.',
    image: '/images/product-rose-elegance.jpg',
  },
  plantes: {
    title: 'Plantes Vertes & Végétal d’Intérieur',
    description: 'Plantes vertes tropicales, monsteras, orchidées et végétaux d’intérieur purifiants pour villas, appartements et bureaux au Sénégal.',
    image: '/images/plante-monstera.jpg',
  },
  'paniers-de-fruits': {
    title: 'Paniers de Fruits Tropicaux',
    description: 'Corbeilles gourmandes de fruits frais du Sénégal (mangues, ananas, papayes, agrumes) et fleurs fraîches, présentées dans des corbeilles artisanales.',
    image: '/images/product-fruit-tropical.jpg',
  },
  cadeaux: {
    title: 'Coffrets Cadeaux & Attentions',
    description: 'Idées cadeaux raffinées alliant fleurs, parfums, douceurs et cartes calligraphiées pour célébrer vos proches avec élégance.',
    image: '/images/cadeau.jpg',
  },
  mariages: {
    title: 'Mariages & Cérémonies',
    description: 'Décoration florale de mariage d’exception : arches florales sur la plage, centres de table de banquet, bouquets de mariée et boutonnières.',
    image: '/images/product-table-wedding.jpg',
  },
  decoration: {
    title: 'Décoration sur Mesure',
    description: 'Scénographie végétale et décoration florale sur mesure pour villas de luxe, hôtels, restaurants et événements privés sur la Petite-Côte.',
    image: '/images/mariage.jpg',
  },
  bougies: {
    title: 'Bougies & Senteurs',
    description: 'Bougies parfumées artisanales et senteurs délicates pour sublimer l’atmosphère de votre intérieur en harmonie avec nos bouquets.',
    image: '/images/hero.jpg',
  },
  vases: {
    title: 'Vases & Contenants d’Art',
    description: 'Vases contemporains, céramiques et contenants sélectionnés pour sublimer la tenue et le port de vos bouquets floraux.',
    image: '/images/hero.jpg',
  },
  deuil: {
    title: 'Cérémonies de Deuil & Hommage',
    description: 'Compositions florales de recueillement, couronnes, coussins et gerbes de fleurs blanches livrées avec respect et discrétion.',
    image: '/images/hero.jpg',
  },
  anniversaires: {
    title: 'Fleurs pour Anniversaires',
    description: 'Bouquets festifs et créations colorées pour souhaiter un joyeux anniversaire avec livraison surprise à Saly, Dakar et Mbour.',
    image: '/images/bouquet-detail.jpg',
  },
  occasions: {
    title: 'Occasions Spéciales',
    description: 'Créations d’exception pour la Saint-Valentin, fête des mères, félicitations, remerciements et grands événements au Sénégal.',
    image: '/images/bouquet-detail.jpg',
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories[slug];

  if (!cat) {
    return constructMetadata({
      title: 'Catégorie introuvable',
      description: 'Cette catégorie n’existe pas dans notre boutique.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${cat.title} | Fleuriste Saly & Dakar`,
    description: cat.description,
    canonical: `/categories/${slug}`,
    image: cat.image,
    keywords: [
      slug,
      cat.title.toLowerCase(),
      `fleuriste ${slug}`,
      'livraison fleurs saly',
      'livraison fleurs dakar',
      'fleurs senegal',
    ],
  });
}

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categories[slug];
  if (!cat) notFound();

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/boutique' },
    { label: cat.title },
  ];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/categories/${slug}#collection`,
    name: `${cat.title} | ${SITE_CONFIG.name}`,
    description: cat.description,
    url: `${SITE_URL}/categories/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_CONFIG.name,
      url: SITE_URL,
    },
  };

  return (
    <>
      <JsonLd data={collectionSchema} />
      <main className="content-width page-main">
        <section className="page-banner shop-banner">
          <Image
            src={cat.image || '/images/hero.jpg'}
            alt={`${cat.title} · Décofleur Plus`}
            fill
            sizes="100vw"
            priority
          />
          <div>
            <h1>{cat.title}</h1>
            <p>{cat.description}</p>
          </div>
        </section>

        <Breadcrumbs items={breadcrumbs} className="my-4" />

        <CatalogClient initialCategory={cat.title} />
      </main>
      <SiteFooter />
    </>
  );
}
