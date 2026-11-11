import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/api/catalog';
import type { Product } from '@/lib/products';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { getProductSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return constructMetadata({
      title: 'Produit introuvable',
      description: 'Le produit recherché n’est pas disponible dans le catalogue Décofleur Plus.',
      noIndex: true,
    });
  }

  const priceFormatted = `${product.price.toLocaleString('fr-FR')} FCFA`;
  return constructMetadata({
    title: `${product.name} — ${product.category || 'Fleuriste'} Saly & Dakar (${priceFormatted})`,
    description: `${product.description} Prix : ${priceFormatted}.`,
    image: product.image,
    canonical: `/produits/${product.slug}`,
    keywords: [product.name.toLowerCase(), product.category.toLowerCase(), 'fleuriste saly', 'livraison fleurs dakar'],
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Produits de la même catégorie ; une erreur ici ne doit pas empêcher d'afficher la fiche
  let relatedProducts: Product[] = [];
  if (product.categorySlug) {
    try {
      const related = await getProducts({ category: product.categorySlug, limit: 5, sort: 'popular' });
      relatedProducts = related.items.filter((item) => item.id !== product.id).slice(0, 4);
    } catch (error) {
      console.error('[Produit] Produits similaires indisponibles :', error);
    }
  }

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/boutique' },
    ...(product.categorySlug ? [{ label: product.category, href: `/categories/${product.categorySlug}` }] : []),
    { label: product.name },
  ];

  return (
    <>
      <JsonLd data={getProductSchema(product)} />
      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />

        <ProductDetail product={product} />

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <div className="section-heading">
              <h2>Vous pourriez aussi aimer</h2>
              {product.categorySlug && (
                <Link href={`/categories/${product.categorySlug}`}>Voir toute la sélection {product.category}</Link>
              )}
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
