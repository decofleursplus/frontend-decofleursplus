import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';
import { getCategoryBySlug } from '@/lib/api/catalog';

/** Les catégories viennent du back-office : toute nouvelle catégorie a sa page. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);

  if (!cat) {
    return constructMetadata({
      title: 'Catégorie introuvable',
      description: 'Cette catégorie n’existe pas dans notre boutique.',
      noIndex: true,
    });
  }

  const description = cat.description || `${cat.name} : découvrez notre sélection, livrée à Saly, Mbour et Dakar.`;
  return constructMetadata({
    title: `${cat.name} | Fleuriste Saly & Dakar`,
    description,
    canonical: `/categories/${cat.slug}`,
    image: cat.imageUrl || undefined,
    keywords: [cat.slug, cat.name.toLowerCase(), `fleuriste ${cat.name.toLowerCase()}`, 'livraison fleurs saly'],
  });
}

export default async function CategoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const description = cat.description || `Notre sélection ${cat.name.toLowerCase()}, composée à l’atelier.`;
  const breadcrumbs = [{ label: 'Accueil', href: '/' }, { label: 'Boutique', href: '/boutique' }, { label: cat.name }];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/categories/${cat.slug}#collection`,
    name: `${cat.name} | ${SITE_CONFIG.name}`,
    description,
    url: `${SITE_URL}/categories/${cat.slug}`,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_CONFIG.name, url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={collectionSchema} />
      <main className="content-width page-main">
        <section className="page-banner shop-banner">
          <Image src={cat.imageUrl || '/images/hero.jpg'} alt={`${cat.name} · Décofleur Plus`} fill sizes="100vw" priority />
          <div>
            <h1>{cat.name}</h1>
            <p>{description}</p>
          </div>
        </section>

        <Breadcrumbs items={breadcrumbs} className="my-4" />

        <CatalogClient
          lockedCategory={{
            slug: cat.slug,
            name: cat.name,
            subCategories: (cat.subCategories ?? []).map((s) => ({ slug: s.slug, name: s.name })),
          }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
