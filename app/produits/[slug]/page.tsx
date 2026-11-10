import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/api/catalog';
import { products } from '@/lib/products';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { getProductSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export const dynamicParams = true;

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Bouquets: 'bouquets',
  Roses: 'roses',
  Plantes: 'plantes',
  'Paniers de fruits': 'paniers-de-fruits',
  Cadeaux: 'cadeaux',
  Mariages: 'mariages',
  Décoration: 'decoration',
  Bougies: 'bougies',
  'Vases & Bougies': 'vases',
  Deuil: 'deuil',
  Anniversaires: 'anniversaires',
  'Occasions spéciales': 'occasions',
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return constructMetadata({
      title: 'Produit introuvable',
      description: 'Le produit recherché n’est pas disponible dans le catalogue Décofleur Plus.',
      noIndex: true,
    });
  }

  const categorySlug = CATEGORY_SLUG_MAP[product.category] || 'bouquets';
  const priceFormatted = `${product.price.toLocaleString('fr-FR')} FCFA`;

  return constructMetadata({
    title: `${product.name} — Fleuriste Saly & Dakar (${priceFormatted})`,
    description: `${product.description} Prix : ${priceFormatted}. Fleurs fraîches artisanales, livraison express en 2h à Saly, le jour même à Somone et 24h à Dakar.`,
    image: product.image,
    canonical: `/produits/${product.slug}`,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      `fleuriste ${product.category.toLowerCase()}`,
      'livraison fleurs saly',
      'livraison fleurs dakar',
      'roses fraîches senegal',
    ],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categorySlug = CATEGORY_SLUG_MAP[product.category] || 'bouquets';

  // Produits similaires de la même catégorie
  let relatedProducts = [];
  try {
    const relatedRes = await getProducts({ category: product.category, limit: 5 });
    relatedProducts = relatedRes.items.filter((item) => item.slug !== product.slug).slice(0, 4);
  } catch {
    relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 4);
  }

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/boutique' },
    { label: product.category, href: `/categories/${categorySlug}` },
    { label: product.name },
  ];

  return (
    <>
      <JsonLd data={getProductSchema(product)} />
      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />

        <ProductDetail product={product} />

        <section className="related-products">
          <div className="section-heading">
            <h2>Vous pourriez aussi aimer</h2>
            <Link href={`/categories/${categorySlug}`}>Voir toute la sélection {product.category}</Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
