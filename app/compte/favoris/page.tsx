'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';

export default function AccountFavoritesPage() {
  const { favorites } = useCart();
  const savedProducts = products.filter((product) => favorites.includes(product.id));

  return (
    <>
      <div className="account-title-row">
        <div>
          <h1 className="account-title flex items-center gap-2">
            <Heart size={24} className="text-pink-600" />
            Mes favoris
          </h1>
          <p className="account-intro">
            Retrouvez tous vos bouquets, compositions florales et créations coups de cœur.
          </p>
        </div>
      </div>

      <section className="account-panel">
        {savedProducts.length > 0 ? (
          <ProductGrid products={savedProducts} />
        ) : (
          <div className="favorites-empty py-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 mb-4">
              <Heart size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Votre liste de favoris est encore vide</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Explorez notre catalogue et cliquez sur le cœur pour enregistrer vos bouquets et cadeaux préférés.
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
