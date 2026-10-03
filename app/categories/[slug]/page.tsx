import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';

const categories: Record<string, string> = {
  bouquets: 'Bouquets', roses: 'Roses', plantes: 'Plantes', 'paniers-de-fruits': 'Paniers de fruits',
  cadeaux: 'Cadeaux', mariages: 'Mariages', decoration: 'Décoration', bougies: 'Bougies',
  vases: 'Vases & Bougies', deuil: 'Deuil', anniversaires: 'Anniversaires', occasions: 'Occasions spéciales',
};
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(categories).map((slug) => ({ slug })); }

export default async function CategoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug];
  if (!category) notFound();
  return <><main className="content-width page-main"><section className="page-banner shop-banner"><Image src="/images/hero.webp" alt="Bouquet Décofleur Plus" fill sizes="100vw" /><div><h1>{category}</h1><p>Découvrez les créations Décofleur Plus pour cette catégorie.</p></div></section><div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><Link href="/boutique">Boutique</Link><span>›</span><span>{category}</span></div><CatalogClient initialCategory={category} /></main><SiteFooter /></>;
}
