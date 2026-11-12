'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Star, Check } from 'lucide-react';
import { defaultVariant, formatPrice, isQuoteOnly, type Product } from '@/lib/products';
import { useCart } from '@/components/cart-provider';

export function ProductCard({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite } = useCart();
  const favorite = favorites.includes(product.id);
  const [added, setAdded] = useState(false);

  const quoteOnly = isQuoteOnly(product);
  const variant = defaultVariant(product);
  const hasChoice = product.variants.length > 1;
  const canAddDirectly = !quoteOnly && !hasChoice && Boolean(variant) && (variant?.stockQuantity ?? 0) > 0;
  // Publié mais épuisé : reste visible, badge « En rupture » et achat désactivé
  const outOfStock = !quoteOnly && !product.inStock;

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || !canAddDirectly) return;
    add(product, variant, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating));
  const actionClass = 'add-to-cart-pill';

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
          <span className={`product-badge ${product.badgeType === 'discount' ? 'discount' : 'new'}`}>{product.badge}</span>
        )}
        {outOfStock && (
          <span className="absolute left-2.5 bottom-2.5 z-[2] rounded-full bg-[#1e2a1f]/85 px-2.5 py-1 text-[11px] font-semibold text-white">
            En rupture
          </span>
        )}
        <button
          type="button"
          className={`favorite-button ${favorite ? 'selected' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
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
          {product.reviews > 0 ? (
            <>
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
            </>
          ) : (
            <span className="rating-count">Nouveau au catalogue</span>
          )}
        </div>

        <div className="product-prices">
          <strong className="current-price">
            {hasChoice && !quoteOnly ? 'Dès ' : ''}
            {formatPrice(hasChoice ? Math.min(...product.variants.map((v) => v.price)) : product.price)}
          </strong>
          {product.oldPrice && !hasChoice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
        </div>

        {quoteOnly ? (
          <Link href={`/devis?produit=${encodeURIComponent(product.slug)}`} className={actionClass}>
            Demander un devis
          </Link>
        ) : hasChoice && product.inStock ? (
          <Link href={`/produits/${product.slug}`} className={actionClass}>
            Choisir la taille
          </Link>
        ) : (
          <button type="button" className={`${actionClass} ${added ? 'added' : ''}`} onClick={addToCart} disabled={!canAddDirectly}>
            {added ? (
              <>
                <Check size={16} /> Ajouté !
              </>
            ) : canAddDirectly ? (
              'Ajouter au panier'
            ) : (
              'En rupture'
            )}
          </button>
        )}
      </div>
    </article>
  );
}
