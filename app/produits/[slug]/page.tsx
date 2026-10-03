import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products, getProduct } from '@/lib/products';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';

export const dynamicParams = false;

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <><main className="content-width page-main"><div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><Link href="/boutique">{product.category}</Link><span>›</span><span>{product.name}</span></div><ProductDetail product={product} /><section className="related-products"><div className="section-heading"><h2>Vous pourriez aussi aimer</h2><Link href="/boutique">Voir tout</Link></div><ProductGrid products={products.filter((item) => item.id !== product.id).slice(0, 4)} /></section></main><SiteFooter /></>;
}
