'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';

interface TestimonialItem {
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  location?: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: 'Awa Diop',
    rating: 5,
    comment: 'Magnifique bouquet ! Livraison parfaite et très rapide sur Saly. Je recommande à 100% !',
    avatar: 'AD',
    location: 'Saly Portudal',
  },
  {
    name: 'Mamadou Sarr',
    rating: 5,
    comment: 'Très belle décoration florale pour notre mariage. Une équipe au top, ponctuelle et très professionnelle !',
    avatar: 'MS',
    location: 'Ngaparou',
  },
  {
    name: 'Fatou Bâ',
    rating: 5,
    comment: 'Les paniers de fruits sont d’une grande fraîcheur et présentés avec beaucoup de goût. Un vrai régal !',
    avatar: 'FB',
    location: 'Mbour',
  },
  {
    name: 'Cheikh Fall',
    rating: 5,
    comment: 'Service client exceptionnel, composition raffinée et fraîcheur remarquable. Je commande régulièrement.',
    avatar: 'CF',
    location: 'La Somone',
  },
  {
    name: 'Aminata Sow',
    rating: 5,
    comment: 'La commande en ligne est ultra simple et la livraison a été parfaitement soignée. Merci Décofleur !',
    avatar: 'AS',
    location: 'Saly Station',
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section
      className="testimonials-section content-width"
      aria-label="Avis et témoignages clients"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="testimonials-header-centered">
        <Heart size={18} className="testimonials-heart" />
        <h2>Ils nous font confiance</h2>
      </div>

      <div className="testimonial-carousel-flanked-row">
        {/* Left Chevron Button (Desktop) */}
        <button
          type="button"
          className="carousel-arrow-btn carousel-arrow-left"
          onClick={prevSlide}
          aria-label="Témoignage précédent"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Viewport for Card Slider */}
        <div
          className="testimonial-carousel-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonial-carousel-track"
            style={{
              transform: `translateX(calc(-${currentIndex} * var(--slide-width, 76%) + var(--slide-offset, 12%)))`,
            }}
          >
            {testimonials.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={idx}
                  className={`testimonial-slide ${isActive ? 'slide-active' : 'slide-inactive'}`}
                  onClick={() => {
                    if (!isActive) setCurrentIndex(idx);
                  }}
                >
                  <article className={`testimonial-card carousel-card-highlight ${isActive ? 'is-active-card' : ''}`}>
                    <div className="testimonial-top">
                      <div className="testimonial-avatar">{item.avatar}</div>
                      <div className="testimonial-author">
                        <strong>{item.name}</strong>
                        {item.location && <span className="testimonial-location">{item.location}</span>}
                        <div className="testimonial-stars" aria-label={`Note : ${item.rating} sur 5 étoiles`}>
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                          ))}
                          <span>5/5</span>
                        </div>
                      </div>
                    </div>
                    <p className="testimonial-quote">« {item.comment} »</p>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chevron Button (Desktop) */}
        <button
          type="button"
          className="carousel-arrow-btn carousel-arrow-right"
          onClick={nextSlide}
          aria-label="Témoignage suivant"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Interactive pagination dots */}
      <div className="testimonials-dots" role="tablist" aria-label="Sélectionner un avis">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={currentIndex === idx}
            aria-label={`Aller au témoignage ${idx + 1}`}
            className={`dot-btn ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </section>
  );
}
