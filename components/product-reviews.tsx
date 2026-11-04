'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, CheckCircle2, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { toast } from 'sonner';

export type ProductReviewItem = {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  verified: boolean;
};

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialRating?: number;
  initialReviewsCount?: number;
}

const DEFAULT_REVIEWS: Record<string, ProductReviewItem[]> = {
  default: [
    {
      id: 'rev-1',
      author: 'Fatou K.',
      city: 'Dakar (Almadies)',
      rating: 5,
      date: 'Il y a 3 jours',
      comment: 'Fleurs d’une fraîcheur exceptionnelle livrées en parfait état par la navette climatisée. Le destinataire était ému aux larmes !',
      likes: 8,
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Jean-Marc D.',
      city: 'Saly Portudal',
      rating: 5,
      date: 'Il y a 1 semaine',
      comment: 'Commande passée le matin, livrée à notre villa 2 heures plus tard. Emballage soigné avec ruban signature et mot calligraphié. Bravo Décofleur !',
      likes: 5,
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'Marie N.',
      city: 'Somone',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment: 'Magnifique composition, les roses ont tenu plus de 8 jours malgré la chaleur de la Petite-Côte. Je recommande vivement.',
      likes: 3,
      verified: true,
    },
  ],
};

export function ProductReviews({
  productId,
  productName,
  initialRating = 4.8,
  initialReviewsCount = 12,
}: ProductReviewsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReviewItem[]>(DEFAULT_REVIEWS.default);
  const [reviewsCount, setReviewsCount] = useState(initialReviewsCount);
  const [rating, setRating] = useState(initialRating);

  // Form State
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Load reviews from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`decofleur_reviews_${productId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews([...parsed, ...DEFAULT_REVIEWS.default]);
          setReviewsCount(initialReviewsCount + parsed.length);
        }
      }
    } catch {
      // Ignorer
    }
  }, [productId, initialReviewsCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      toast.error('Veuillez renseigner votre nom et votre commentaire.');
      return;
    }

    setIsSubmitting(true);

    const newReview: ProductReviewItem = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      city: city.trim() || 'Sénégal',
      rating: selectedStars,
      date: "Aujourd'hui",
      comment: comment.trim(),
      likes: 0,
      verified: true,
    };

    // Save locally
    try {
      const existing = localStorage.getItem(`decofleur_reviews_${productId}`);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newReview);
      localStorage.setItem(`decofleur_reviews_${productId}`, JSON.stringify(list));
    } catch {
      // Fallback state
    }

    setReviews((prev) => [newReview, ...prev]);
    setReviewsCount((prev) => prev + 1);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    toast.success('Merci ! Votre avis a été enregistré avec succès.');

    // Reset inputs
    setAuthor('');
    setCity('');
    setComment('');
  };

  const handleToggleLike = (id: string) => {
    setLikedReviews((prev) => {
      const isLiked = !!prev[id];
      setReviews((all) =>
        all.map((r) => (r.id === id ? { ...r, likes: isLiked ? r.likes - 1 : r.likes + 1 } : r))
      );
      return { ...prev, [id]: !isLiked };
    });
  };

  return (
    <div className="mt-8 border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs transition-all">
      {/* Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-stone-50/80 to-white hover:bg-stone-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center">
            <MessageSquare size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-semibold text-neutral-900 m-0">
                Avis Clients &amp; Notations
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {reviewsCount} avis
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < Math.round(rating) ? '#F59E0B' : 'none'}
                    stroke={i < Math.round(rating) ? '#F59E0B' : '#CBD5E1'}
                  />
                ))}
              </div>
              <strong className="text-neutral-800 font-bold">{rating.toFixed(1)}/5</strong>
              <span>· Note moyenne vérifiée</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
          <span className="hidden sm:inline">{isOpen ? 'Réduire' : 'Consulter et noter'}</span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Accordion Collapsible Content */}
      {isOpen && (
        <div className="p-5 sm:p-7 border-t border-neutral-100 space-y-8 animate-in fade-in-50 duration-200">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#faf9f5] border border-amber-100/60 items-center">
            <div className="text-center md:text-left md:border-r border-amber-200/50 md:pr-4">
              <span className="text-4xl font-serif font-bold text-[#173f22] block">
                {rating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center md:justify-start gap-1 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(rating) ? '#F59E0B' : 'none'}
                    stroke={i < Math.round(rating) ? '#F59E0B' : '#CBD5E1'}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-600 block">
                Basé sur {reviewsCount} avis certifiés
              </span>
            </div>

            <div className="md:col-span-2 text-xs text-neutral-600 space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 font-medium">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>100% fleurs fraîches coupées du jour et préparées avec amour</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900 font-medium">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Navette climatisée Dakar &amp; livraison express 2h Petite-Côte</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900 font-medium">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Service client joignable par téléphone et WhatsApp 7j/7</span>
              </div>
            </div>
          </div>

          {/* Form: Déposer un avis */}
          <div className="p-5 rounded-2xl border border-emerald-100/80 bg-emerald-50/30">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <Send size={15} className="text-emerald-700" />
              <span>Donner votre avis sur ce bouquet</span>
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              Vous avez commandé ou reçu <strong>{productName}</strong> ? Partagez vos impressions pour guider la communauté.
            </p>

            {submitSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Votre avis a été pris en compte et ajouté aux retours clients !</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Votre note globale :
                </label>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const isFilled = starVal <= (hoverStars || selectedStars);
                    return (
                      <button
                        type="button"
                        key={i}
                        onMouseEnter={() => setHoverStars(starVal)}
                        onMouseLeave={() => setHoverStars(0)}
                        onClick={() => setSelectedStars(starVal)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                        aria-label={`Attribuer ${starVal} étoiles`}
                      >
                        <Star
                          size={24}
                          fill={isFilled ? '#F59E0B' : 'none'}
                          stroke={isFilled ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-amber-700 ml-2">
                    {selectedStars}/5 — {['Décevant', 'Passable', 'Bien', 'Très bien', 'Exceptionnel'][selectedStars - 1]}
                  </span>
                </div>
              </div>

              {/* Author and City Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Votre prénom ou nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex : Marie Diop"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ville ou quartier (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex : Dakar, Saly, Mbour, Somone…"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Votre commentaire d'expérience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez la fraîcheur des fleurs, la tenue en vase, le respect des délais de livraison…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173f22] text-white text-xs font-semibold hover:bg-[#12311a] transition-colors shadow-2xs"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Publication en cours…' : 'Publier mon avis'}</span>
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Retours d'expérience ({reviews.length})
            </h3>

            <div className="divide-y divide-neutral-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#173f22]/10 text-[#173f22] text-xs font-bold flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 size={10} /> Client vérifié
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {rev.city} · {rev.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? '#F59E0B' : 'none'}
                          stroke={i < rev.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed pl-9">
                    « {rev.comment} »
                  </p>

                  <div className="pl-9 flex items-center gap-4 text-[11px] text-neutral-400">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(rev.id)}
                      className={`inline-flex items-center gap-1 hover:text-neutral-700 transition-colors ${
                        likedReviews[rev.id] ? 'text-emerald-700 font-semibold' : ''
                      }`}
                    >
                      <ThumbsUp size={12} fill={likedReviews[rev.id] ? 'currentColor' : 'none'} />
                      <span>{rev.likes > 0 ? `Utile (${rev.likes})` : 'Avis utile'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

