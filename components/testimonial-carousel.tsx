'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { getFeaturedReviews, type FeaturedReview } from '@/lib/api/catalog';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

function ReviewCard({ review }: { review: FeaturedReview }) {
  return (
    <article className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full hover:shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-shadow">
      <div>
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-full shrink-0 bg-[#173f22] text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">
            {initials(review.authorName)}
          </div>
          <div>
            <strong className="block text-[14px] font-bold text-neutral-900 font-sans leading-tight">{review.authorName}</strong>
            <div className="flex items-center gap-1.5 mt-0.5" aria-label={`${review.rating} sur 5`}>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} fill={i < review.rating ? '#F59E0B' : 'none'} color={i < review.rating ? '#F59E0B' : '#CBD5E1'} />
                ))}
              </div>
              <span className="text-[11px] font-medium text-neutral-400">{review.rating}/5</span>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-neutral-600 italic font-sans leading-relaxed">« {review.comment} »</p>
      </div>
      <Link href={`/produits/${review.product.slug}`} className="mt-3 text-[11px] font-semibold text-[#2e6e3c] hover:underline">
        À propos de : {review.product.name}
      </Link>
    </article>
  );
}

/** « Ils nous font confiance » : avis réellement déposés par les clients (la section est masquée s'il n'y en a pas). */
export function TestimonialCarousel() {
  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    let active = true;
    getFeaturedReviews(6)
      .then((list) => active && setReviews(list))
      .catch((err) => console.error('[Accueil] Avis indisponibles :', err));
    return () => {
      active = false;
    };
  }, []);

  if (reviews.length === 0) return null;
  const current = reviews[Math.min(mobileIndex, reviews.length - 1)];

  return (
    <section className="content-width my-12" aria-label="Avis et témoignages clients">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={20} className="text-[#db3a6a] shrink-0 fill-transparent" strokeWidth={1.8} />
        <h2 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1b3a24] tracking-tight whitespace-nowrap">Ils nous font confiance</h2>
        <div className="h-[1px] bg-neutral-200/80 w-full ml-2" />
      </div>

      <div className="hidden md:grid md:grid-cols-3 gap-5 items-stretch">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <div className="md:hidden">
        <ReviewCard review={current} />
        {reviews.length > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4 pr-1">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                aria-label={`Avis ${index + 1}`}
                aria-current={index === mobileIndex}
                onClick={() => setMobileIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === mobileIndex ? 'bg-[#db3a6a] w-5' : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
