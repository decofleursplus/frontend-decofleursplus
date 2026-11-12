'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getMyReviews } from '@/lib/api/customer';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/products';
import { ErrorState, LoadingState, SectionHeader, formatDate, useResource } from './shared';

export function AvisSection() {
  const { data: reviews, error, loading, reload } = useResource(getMyReviews);
  return (
    <section className="account-panel">
      <SectionHeader title="Mes avis" description="Les avis que vous avez publiés sur nos créations." />
      {loading ? (
        <LoadingState label="Chargement de vos avis…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (reviews ?? []).length === 0 ? (
        <p className="py-6 text-sm text-neutral-600">
          Vous n’avez pas encore donné d’avis. Rendez-vous sur la fiche d’un produit pour partager votre expérience.{' '}
          <Link href="/boutique" className="underline">
            Voir la boutique
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {(reviews ?? []).map((r) => (
            <li key={r.id} className="flex gap-3 py-3">
              <Link href={`/produits/${r.product.slug}`} className="shrink-0">
                <Image src={r.product.image || PRODUCT_PLACEHOLDER_IMAGE} alt={r.product.name} width={56} height={56} className="rounded-lg object-cover" />
              </Link>
              <div className="min-w-0">
                <Link href={`/produits/${r.product.slug}`} className="text-sm font-semibold hover:underline">
                  {r.product.name}
                </Link>
                <div className="flex items-center gap-0.5 my-1" aria-label={`${r.rating} sur 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < r.rating ? '#F59E0B' : 'none'} stroke={i < r.rating ? '#F59E0B' : '#CBD5E1'} />
                  ))}
                  <span className="ml-2 text-[11px] text-neutral-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-xs text-neutral-700 whitespace-pre-line">{r.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
