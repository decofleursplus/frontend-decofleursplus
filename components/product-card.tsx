'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Star, Check } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/components/cart-provider';

export function ProductCard({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite } = useCart();
  const favorite = favorites.includes(product.id);
  const [added, setAdded] = useState(false);

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating));

  return (
    <article className="product-card">
      <div className="product-photo-wrap">
        <Link className="product-photo-link" href={`/produits/${product.slug}`} aria-label={`Voir ${product.name}`}>
          <Image
            className="product-photo"
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
          />
        </Link>
        {product.badge && (
          <span className={`product-badge ${product.badge.startsWith('-') ? 'discount' : 'new'}`}>
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className={`favorite-button ${favorite ? 'selected' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={favorite}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <Link className="product-name" href={`/produits/${product.slug}`}>
          {product.name}
        </Link>

        <div className="product-rating">
          <span className="stars">
            {stars.map((filled, i) => (
              <Star
                key={i}
                size={13}
                className={filled ? 'star-filled' : 'star-empty'}
                fill={filled ? '#F59E0B' : 'none'}
                stroke={filled ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </span>
          <span className="rating-score">{product.rating.toFixed(1)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-prices">
          <strong className="current-price">{formatPrice(product.price)}</strong>
          {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
        </div>

        <button
          type="button"
          className={`add-to-cart-pill ${added ? 'added' : ''}`}
          onClick={addToCart}
          disabled={!product.inStock}
        >
          {added ? (
            <>
              <Check size={16} /> Ajouté !
            </>
          ) : (
            'Ajouter au panier'
          )}
        </button>
      </div>
    </article>
  );
}
