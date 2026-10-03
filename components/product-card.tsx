'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/components/cart-provider';

export function ProductCard({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite } = useCart();
  const favorite = favorites.includes(product.id);
  const [added, setAdded] = useState(false);

  function addToCart() {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="product-card">
      <div className="product-photo-wrap">
        <Link className="product-photo-link" href={`/produits/${product.slug}`} aria-label={`Voir ${product.name}`}>
          <Image className="product-photo" src={product.image} alt={product.name} fill sizes="(max-width: 850px) 45vw, 240px" />
        </Link>
        {product.badge && <span className={`product-badge ${product.badge.startsWith('-') ? 'discount' : ''}`}>{product.badge}</span>}
        <button className={`favorite-button ${favorite ? 'selected' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={favorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="product-card-body">
        <Link className="product-name" href={`/produits/${product.slug}`}>{product.name}</Link>
        <div className="product-rating"><span><Star size={12} fill="currentColor" /> {product.rating.toFixed(1)}</span><small>({product.reviews} avis)</small></div>
        <div className="product-card-bottom"><strong>{formatPrice(product.price)}</strong><button className="add-icon-button" aria-label={`Ajouter ${product.name} au panier`} onClick={addToCart} disabled={!product.inStock}><ShoppingCart size={17} /></button></div>
        {added && <span className="added-feedback" role="status">Ajouté au panier</span>}
      </div>
    </article>
  );
}
