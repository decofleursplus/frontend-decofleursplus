'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { BotanicalCorners } from '@/components/botanical-corners';

export function HeroMockup() {
  return (
    <section className="relative w-full overflow-hidden bg-[#fdfaf7]" aria-label="Bienvenue chez Décofleur Plus">
      {/* Delicate eucalyptus botanical leaves in top corners matching the mockup */}
      <BotanicalCorners />

      {/* DESKTOP BANNER (hidden on mobile) - Height ~295px strictly matching mockup */}
      <div className="hidden md:block relative w-full h-[290px] lg:h-[315px] select-none">
        {/* Background panoramic image with banquet, luxury hat box, and embedded calligraphy */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/hero-banner-v2.jpg"
            alt="DécoFleur Plus - Boîte florale signature et banquet romantique"
            fill
            priority
            className="object-cover object-[40%_center]"
            sizes="100vw"
          />
        </div>

        {/* Content Container (Left side text + Right calligraphy flourish matching mockup) */}
        <div className="content-width relative z-10 h-full flex items-center justify-between">
          <div className="max-w-[480px] pl-2 lg:pl-4">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-100/90 border border-pink-200/60 text-[#c8436e] text-[12px] font-medium w-fit mb-2.5 shadow-sm">
              <Heart size={12} className="fill-[#c8436e] text-[#c8436e]" />
              <span>Bienvenue chez Décofleur Plus</span>
            </div>

            {/* Main Title: Bicolor Green & Pink matching mockup */}
            <h1 className="font-serif text-[32px] lg:text-[38px] font-normal leading-[1.12] tracking-tight mb-2.5">
              <span className="text-[#173f22]">Des fleurs, </span>
              <span className="relative inline-block text-[#173f22]">
                des idées,
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="5"
                  viewBox="0 0 100 5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 3C30 1 70 4.5 99 2"
                    stroke="#2d6a3b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              <span className="font-serif italic font-bold text-[#c8436e]">
                des émotions
              </span>
            </h1>

            {/* Subtitle bullet points */}
            <div className="text-[12px] lg:text-[13px] leading-relaxed text-neutral-700 font-sans mb-4 space-y-0.5">
              <p>
                <span className="font-medium text-neutral-800">Fleuriste</span>
                <span className="mx-2 text-[#c8436e]">•</span>
                <span className="font-medium text-neutral-800">Décoration événementielle</span>
                <span className="mx-2 text-[#c8436e]">•</span>
                <span className="font-medium text-neutral-800">Paniers de fruits</span>
              </p>
              <p>
                <span className="font-medium text-neutral-800">Cadeaux</span>
                <span className="mx-2 text-[#c8436e]">•</span>
                <span className="font-medium text-neutral-800">Location de vaisselle et matériel</span>
              </p>
            </div>

            {/* Action button & flourish */}
            <div className="flex items-center gap-4">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#c8436e] hover:bg-[#b5355e] text-white font-medium text-[13px] shadow-sm hover:shadow transition-all duration-300"
              >
                <span>Découvrir nos produits</span>
                <ArrowRight size={14} />
              </Link>

              {/* Decorative flourish line with heart beside button */}
              <div className="flex items-center gap-1.5 text-[#c8436e]" aria-hidden="true">
                <span className="w-8 h-[1px] bg-[#c8436e]/50" />
                <Heart size={13} className="fill-[#c8436e] text-[#c8436e]" />
                <span className="w-8 h-[1px] bg-[#c8436e]/50" />
              </div>
            </div>
          </div>

          {/* Right Calligraphy Flourish (faithful to mockup, never clipped by screen border) */}
          <div className="hidden lg:flex flex-col items-center text-center pr-2 xl:pr-6 select-none pointer-events-none max-w-[270px]">
            <p
              className="font-serif italic text-[22px] xl:text-[25px] font-normal leading-[1.25] tracking-tight"
              style={{ color: '#173f22' }}
            >
              L&apos;élégance de la nature
            </p>
            <p
              className="font-serif italic font-bold text-[22px] xl:text-[25px] leading-[1.25] mt-1"
              style={{ color: '#c8436e' }}
            >
              à chaque instant
            </p>
            <div className="flex items-center justify-center gap-2 mt-2.5 text-[#c8436e]" aria-hidden="true">
              <span className="w-10 h-[1.5px] bg-[#c8436e]/60" />
              <Heart size={15} className="fill-[#c8436e] text-[#c8436e]" />
              <span className="w-10 h-[1.5px] bg-[#c8436e]/60" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BANNER (strictly matching smartphone mockup: height ~220px) */}
      <div className="md:hidden relative w-full h-[225px] overflow-hidden select-none">
        {/* Background image anchored right */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/hero-banner-mobile-hd.jpg"
            alt="DécoFleur Plus"
            fill
            priority
            className="object-cover object-right"
            sizes="100vw"
          />
        </div>

        {/* Soft gradient fade on mobile left */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(253,250,247,0.95) 0%, rgba(253,250,247,0.90) 55%, rgba(253,250,247,0.3) 72%, rgba(253,250,247,0) 100%)',
          }}
        />

        {/* Mobile Left Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 max-w-[65%]">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100/90 text-[#c8436e] text-[10px] font-medium w-fit mb-1.5">
            <Heart size={9} className="fill-[#c8436e] text-[#c8436e]" />
            <span>Bienvenue chez Décofleur Plus</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[19px] font-normal leading-[1.15] tracking-tight mb-1.5">
            <span className="text-[#173f22]">Des fleurs, </span>
            <span className="text-[#173f22] underline decoration-[#2d6a3b] decoration-2">des idées,</span><br />
            <span className="font-serif italic font-bold text-[#c8436e]">des émotions</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[10px] leading-tight text-neutral-600 font-sans mb-3 line-clamp-2">
            Fleuriste • Décoration événementielle • Paniers de fruits • Cadeaux • Location
          </p>

          {/* Button */}
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-[#c8436e] text-white font-medium text-[11px] shadow-sm w-fit"
          >
            <span>Découvrir nos produits</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
