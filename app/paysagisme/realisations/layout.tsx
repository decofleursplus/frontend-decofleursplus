import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { getBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';

export const metadata: Metadata = constructMetadata({
  title: 'Portfolio & Réalisations Paysagères au Sénégal | Décofleur Plus',
  description:
    'Explorez notre galerie de projets paysagers d’exception : jardins luxuriants de villas à Saly, patios d’hôtels de prestige et terrasses végétalisées aux Almadies et à Dakar.',
  canonical: '/paysagisme/realisations',
  image: '/images/paysagisme/villas.jpg',
  keywords: [
    'realisations paysagisme dakar',
    'photos jardins saly',
    'portfolio paysagiste senegal',
    'jardin villa almadies',
  ],
});

export default function RealisationsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Paysagisme', url: '/paysagisme' },
    { name: 'Réalisations', url: '/paysagisme/realisations' },
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/paysagisme/realisations#collection`,
    name: `Réalisations Paysagères | ${SITE_CONFIG.name}`,
    description: 'Galerie de créations de jardins et d’aménagements extérieurs de prestige au Sénégal.',
    url: `${SITE_URL}/paysagisme/realisations`,
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, collectionSchema]} />
      {children}
    </>
  );
}

