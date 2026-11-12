'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/products';

export default function AccountFavoritesPage() {
  const { favoriteItems, toggleFavorite } = useCart();

  return (
    <>
      <div className="account-title-row">
        <div>
          <h1 className="account-title flex items-center gap-2">
            <Heart size={24} className="text-pink-600" />
            Mes favoris
          </h1>
          <p className="account-intro">Les créations que vous avez gardées de côté sur cet appareil.</p>
        </div>
      </div>

      <section className="account-panel">
        {favoriteItems.length > 0 ? (
          <div className="product-grid">
            {favoriteItems.map((item) => (
              <article className="product-card" key={item.id}>
                <div className="product-photo-wrap">
                  <Link className="product-photo-link" href={`/produits/${item.slug}`} aria-label={`Voir ${item.name}`}>
                    <Image className="product-photo" src={item.image} alt={item.name} fill sizes="(max-width: 768px) 50vw, 280px" />
                  </Link>
                  <button
                    type="button"
                    className="favorite-button selected"
                    onClick={() => toggleFavorite(item)}
                    aria-label={`Retirer ${item.name} des favoris`}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="product-card-body">
                  <Link className="product-name" href={`/produits/${item.slug}`}>
                    {item.name}
                  </Link>
                  {item.category && <span className="text-xs text-neutral-500">{item.category}</span>}
                  <div className="product-prices">
                    <strong className="current-price">{formatPrice(item.price)}</strong>
                    {item.oldPrice && <span className="old-price">{formatPrice(item.oldPrice)}</span>}
                  </div>
                  <Link href={`/produits/${item.slug}`} className="add-to-cart-pill">
                    Voir le produit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="favorites-empty py-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 mb-4">
              <Heart size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Votre liste de favoris est encore vide</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Cliquez sur le cœur d’un produit pour le retrouver ici.
            </p>
            <Link className="button button-primary inline-flex items-center gap-2" href="/boutique">
              Découvrir la boutique
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
