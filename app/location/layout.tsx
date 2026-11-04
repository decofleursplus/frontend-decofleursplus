import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { getBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';

export const metadata: Metadata = constructMetadata({
  title: 'Location de Matériel Événementiel, Mobilier & Vaisselle | Saly & Dakar',
  description:
    'Service de location d’équipements et vaisselle pour mariages, réceptions et événements au Sénégal : tables rondes, chaises Chiavari, nappage, vaisselle et décoration florale.',
  canonical: '/location',
  image: '/images/location/location-hero.jpg',
  keywords: [
    'location materiel evenementiel dakar',
    'location vaisselle saly',
    'location chaise chiavari senegal',
    'location mobilier reception saly',
    'location decoration mariage dakar',
  ],
});

export default function LocationLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Location Événementielle', url: '/location' },
  ]);

  const rentalCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/location#catalog`,
    name: `Catalogue de Location Événementielle | ${SITE_CONFIG.name}`,
    description: 'Mobilier, vaisselle, nappage et décors pour réceptions et banquets au Sénégal.',
    url: `${SITE_URL}/location`,
    provider: {
      '@id': `${SITE_URL}/#florist`,
    },
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, rentalCatalogSchema]} />
      {children}
    </>
  );
}

