'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';

export default function FavoritesPage() {
  const { favorites } = useCart();
  const savedProducts = products.filter((product) => favorites.includes(product.id));
  return <><main className="content-width page-main"><div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><span>Mes favoris</span></div><div className="section-heading favorites-heading"><h1><Heart size={22} /> Mes favoris</h1></div>{savedProducts.length ? <ProductGrid products={savedProducts} /> : <section className="favorites-empty"><Heart size={28} /><h2>Votre liste est encore vide</h2><p>Enregistrez les bouquets et cadeaux qui vous plaisent pour les retrouver ici.</p><Link className="button button-primary" href="/boutique">Découvrir la boutique</Link></section>}</main><SiteFooter /></>;
}
