'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { getAdminProductDto, type AdminProductDto } from '@/lib/api/admin/product-form';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<AdminProductDto | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminProductDto(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Produit indisponible.'));
  }, [id]);

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error}
      </div>
    );
  }
  if (product === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement du produit…
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="text-center py-16 space-y-3 text-sm">
        <p>Produit introuvable.</p>
        <Link href="/admin/produits" className="underline">
          Retour aux produits
        </Link>
      </div>
    );
  }
  return <ProductForm key={product.id} product={product} />;
}
