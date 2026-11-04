import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schema';

export const metadata: Metadata = constructMetadata({
  title: 'Prestations de Paysagisme & Aménagement d’Espaces Verts | Décofleur Plus',
  description:
    'Découvrez nos 6 prestations de paysagisme au Sénégal : création de jardins tropicaux, aménagement de terrasses de villas, végétalisation d’hôtels et bureaux, gazonnement et entretien à Saly et Dakar.',
  canonical: '/paysagisme/prestations',
  image: '/images/paysagisme/paysagisme-hero.jpg',
  keywords: [
    'prestations paysagisme dakar',
    'creation jardin villa saly',
    'amenagement terrasse senegal',
    'arrosage automatique saly',
    'entretien espaces verts senegal',
  ],
});

export default function PrestationsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Paysagisme', url: '/paysagisme' },
    { name: 'Prestations', url: '/paysagisme/prestations' },
  ]);

  const serviceSchema = getServiceSchema({
    name: 'Prestations Paysagères Décofleur Plus',
    description: 'Services professionnels d’aménagement paysager et d’entretien vert au Sénégal.',
    url: '/paysagisme/prestations',
    image: '/images/paysagisme/paysagisme-hero.jpg',
  });

  return (
    <>
      <JsonLd data={[breadcrumbSchema, serviceSchema]} />
      {children}
    </>
  );
}

