'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, MessageSquare, RefreshCw, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import { addProductReview, getProductReviews, type ProductReview } from '@/lib/api/catalog';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialRating: number;
  initialReviewsCount: number;
}

const PAGE_SIZE = 10;

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`${value.toFixed(1)} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(value) ? '#F59E0B' : 'none'}
          stroke={i < Math.round(value) ? '#F59E0B' : '#CBD5E1'}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Avis clients du produit : lus et déposés via l'API (la note moyenne est calculée par le serveur). */
export function ProductReviews({ productId, productName, initialRating, initialReviewsCount }: ProductReviewsProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialReviewsCount);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- préremplissage avec le compte connecté
    if (user?.name && !name) setName(user.name);
  }, [user, name]);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getProductReviews(productId, { page: nextPage, limit: PAGE_SIZE });
        setReviews((prev) => (nextPage === 1 || !prev ? res.reviews : [...prev, ...res.reviews]));
        setPage(res.page);
        setTotalPages(res.totalPages);
        setRating(res.averageRating);
        setCount(res.reviewsCount);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Impossible de charger les avis.');
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement à la première ouverture
    if (isOpen && reviews === null) void load(1);
  }, [isOpen, reviews, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (name.trim().length < 2) return setFormError('Indiquez votre nom (2 caractères minimum).');
    if (comment.trim().length < 2) return setFormError('Écrivez quelques mots sur votre expérience.');
    setSubmitting(true);
    try {
      await addProductReview(productId, { rating: stars, comment, userName: name, userEmail: user?.email });
      setComment('');
      setStars(5);
      toast.success('Merci ! Votre avis est publié.');
      await load(1);
    } catch (err) {
      const detail = err instanceof ApiClientError ? err.details?.[0]?.message : undefined;
      setFormError(detail || (err instanceof Error ? err.message : 'Votre avis n’a pas pu être envoyé.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-stone-50/90 to-white hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center shrink-0">
            <MessageSquare size={17} />
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-bold text-neutral-900">Avis clients ({count})</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
              {count > 0 ? (
                <>
                  <Stars value={rating} size={12} />
                  <strong className="text-neutral-800">{rating.toFixed(1)}/5</strong>
                </>
              ) : (
                <span>Soyez le premier à donner votre avis</span>
              )}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 shrink-0 ml-2">
          {isOpen ? 'Fermer' : 'Voir les avis'}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-neutral-100 space-y-6">
          <div className="p-5 rounded-2xl border border-emerald-100/80 bg-emerald-50/30">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <Send size={15} className="text-emerald-700" />
              Donner votre avis sur « {productName} »
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-3">
              <div>
                <span className="block text-xs font-semibold text-neutral-700 mb-1.5">Votre note</span>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Note sur 5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={stars === n}
                      aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                      onClick={() => setStars(n)}
                      onMouseEnter={() => setHoverStars(n)}
                      onMouseLeave={() => setHoverStars(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        fill={n <= (hoverStars || stars) ? '#F59E0B' : 'none'}
                        stroke={n <= (hoverStars || stars) ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="review-name" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Votre prénom ou nom <span className="text-rose-500">*</span>
                </label>
                <input
                  id="review-name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="review-comment" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Votre avis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 leading-relaxed"
                />
              </div>
              {formError && (
                <p role="alert" className="text-xs font-medium text-rose-700">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173f22] text-white text-xs font-semibold hover:bg-[#12311a] disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publier mon avis
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {loadError ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <span>{loadError}</span>
                <button type="button" onClick={() => load(1)} className="inline-flex items-center gap-1 font-semibold">
                  <RefreshCw size={13} /> Réessayer
                </button>
              </div>
            ) : reviews === null ? (
              <p className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 size={14} className="animate-spin" /> Chargement des avis…
              </p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-neutral-500">Aucun avis pour le moment.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#173f22]/10 text-[#173f22] text-xs font-bold flex items-center justify-center">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900">{rev.userName}</span>
                          <span className="block text-[11px] text-neutral-400">{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>
                      <Stars value={rev.rating} size={12} />
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
            {reviews && page < totalPages && (
              <button
                type="button"
                onClick={() => load(page + 1)}
                disabled={loading}
                className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1.5"
              >
                {loading && <Loader2 size={13} className="animate-spin" />} Voir plus d’avis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
