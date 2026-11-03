import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/api/catalog';
import { products } from '@/lib/products';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';

export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
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

  // Produits similaires de la même catégorie
  let relatedProducts = [];
  try {
    const relatedRes = await getProducts({ category: product.category, limit: 5 });
    relatedProducts = relatedRes.items.filter((item) => item.slug !== product.slug).slice(0, 4);
  } catch {
    relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 4);
  }

  return (
    <>
      <main className="content-width page-main">
        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href={`/boutique?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <ProductDetail product={product} />

        <section className="related-products">
          <div className="section-heading">
            <h2>Vous pourriez aussi aimer</h2>
            <Link href="/boutique">Voir tout</Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
