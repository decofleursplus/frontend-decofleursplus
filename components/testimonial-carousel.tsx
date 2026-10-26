'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';

interface TestimonialItem {
  name: string;
  rating: number;
  comment: string;
  avatarImg: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: 'Awa Diop',
    rating: 5,
    comment: 'Magnifique bouquet ! Livraison parfaite et très rapide. Je recommande à 100% !',
    avatarImg: '/images/avatar-awa.png',
  },
  {
    name: 'Mamadou Sarr',
    rating: 5,
    comment: 'Très belle décoration pour notre mariage. Une équipe au top et professionnelle !',
    avatarImg: '/images/avatar-mamadou.png',
  },
  {
    name: 'Fatou Bâ',
    rating: 5,
    comment: 'Les paniers de fruits sont d’une grande fraîcheur. Un vrai régal !',
    avatarImg: '/images/avatar-fatou.png',
  },
];

export function TestimonialCarousel() {
  const [mobileIndex, setMobileIndex] = useState(0);

  return (
    <section
      className="content-width my-12"
      aria-label="Avis et témoignages clients"
    >
      {/* Header: Left-aligned with pink heart and subtle line */}
      <div className="flex items-center gap-3 mb-6">
        <Heart size={20} className="text-[#db3a6a] shrink-0 fill-transparent" strokeWidth={1.8} />
        <h2 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1b3a24] tracking-tight whitespace-nowrap">
          Ils nous font confiance
        </h2>
        <div className="h-[1px] bg-neutral-200/80 w-full ml-2" />
      </div>

      {/* Desktop 3-Card Row matching mockup */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 items-stretch">
        {testimonials.map((item, idx) => (
          <article
            key={idx}
            className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200/60">
                <Image
                  src={item.avatarImg}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <strong className="block text-[14px] font-bold text-neutral-900 font-sans leading-tight">
                  {item.name}
                </strong>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex items-center text-[#F59E0B]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400">5/5</span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-neutral-600 italic font-sans leading-relaxed">
              « {item.comment} »
            </p>
          </article>
        ))}
      </div>

      {/* Mobile Swipeable Card */}
      <div className="md:hidden">
        <article className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200/60">
              <Image
                src={testimonials[mobileIndex].avatarImg}
                alt={testimonials[mobileIndex].name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <strong className="block text-[14px] font-bold text-neutral-900 font-sans leading-tight">
                {testimonials[mobileIndex].name}
              </strong>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-neutral-400">5/5</span>
              </div>
            </div>
          </div>
          <p className="text-[13px] text-neutral-600 italic font-sans leading-relaxed">
            « {testimonials[mobileIndex].comment} »
          </p>
        </article>
      </div>

      {/* 3 Pagination dots at bottom right / center matching mockup */}
      <div className="flex items-center justify-end md:justify-end gap-2 mt-4 pr-1">
        <button
          type="button"
          aria-label="Avis 1"
          onClick={() => setMobileIndex(0)}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            mobileIndex === 0 ? 'bg-[#db3a6a] w-5' : 'bg-neutral-300 hover:bg-neutral-400'
          }`}
        />
        <button
          type="button"
          aria-label="Avis 2"
          onClick={() => setMobileIndex(1)}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            mobileIndex === 1 ? 'bg-[#2e6e3c] w-5' : 'bg-[#2e6e3c]/40 hover:bg-[#2e6e3c]'
          }`}
        />
        <button
          type="button"
          aria-label="Avis 3"
          onClick={() => setMobileIndex(2)}
          className={`w-2.5 h-2.5 rounded-full border border-[#2e6e3c] transition-all ${
            mobileIndex === 2 ? 'bg-[#2e6e3c] w-5' : 'bg-transparent'
          }`}
        />
      </div>
    </section>
  );
}
