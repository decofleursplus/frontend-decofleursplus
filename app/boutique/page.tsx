import type { Metadata } from 'next';
import Image from 'next/image';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';

export const metadata: Metadata = constructMetadata({
  title: 'Boutique Florale en Ligne — Bouquets, Plantes & Cadeaux à Saly & Dakar',
  description:
    'Achetez en ligne vos bouquets de roses, plantes tropicales, corbeilles de fruits et cadeaux raffinés. Livraison rapide à Saly Portudal, Somone, Mbour et Dakar.',
  canonical: '/boutique',
  keywords: [
    'boutique fleuriste senegal',
    'acheter fleurs dakar',
    'fleurs en ligne saly',
    'livraison fleurs senegal',
    'bouquet de roses',
    'plantes tropicales dakar',
  ],
});

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique' },
  ];

  const boutiqueSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/boutique#collection`,
    name: `Boutique Florale | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: `${SITE_URL}/boutique`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_CONFIG.name,
      url: SITE_URL,
    },
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={boutiqueSchema} />
      <BotanicalCorners />
      <main className="content-width page-main">
        <section className="page-banner shop-banner">
          <Image
            src="/images/hero.jpg"
            alt="Atelier et créations florales Décofleur Plus à Saly"
            fill
            sizes="100vw"
            priority
          />
          <div>
            <h1>Notre boutique florale</h1>
            <p>
              Découvrez notre collection de fleurs fraîches, plantes, corbeilles de fruits et décorations{' '}
              <br />
              pour sublimer tous vos instants précieux au Sénégal.
            </p>
          </div>
        </section>

        <Breadcrumbs items={breadcrumbs} className="my-4" />

        <CatalogClient initialQuery={params.q ?? ''} initialCategory={params.category ?? ''} />
      </main>
      <SiteFooter />
    </div>
  );
}
