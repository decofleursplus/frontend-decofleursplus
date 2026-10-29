'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { Great_Vibes } from 'next/font/google';
import { BotanicalCorners } from '@/components/botanical-corners';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cursive',
});

export function HeroMockup() {
  return (
    <section className="relative w-full overflow-hidden bg-[#fdfaf7]" aria-label="Bienvenue chez Décofleur Plus">
      {/* Delicate eucalyptus botanical leaves in top corners matching the mockup */}
      <BotanicalCorners />

      {/* ═══ DESKTOP HERO BANNER ═══ */}
      <div className="hidden md:block relative w-full h-[280px] lg:h-[310px] xl:h-[330px] select-none 
       bg-[url('/images/hero-banner-final.jpg')] bg-contain bg-center ">


        {/* Left gradient wash for text legibility */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(253,250,247,0.97) 0%, rgba(253,250,247,0.93) 22%, rgba(253,250,247,0.75) 35%, rgba(253,250,247,0.25) 50%, transparent 65%)',
          }}
        />

        {/* Right gradient wash for calligraphy legibility */}
        <div
          className="hidden lg:block absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(270deg, rgba(253,250,247,0.95) 0%, rgba(253,250,247,0.85) 15%, rgba(253,250,247,0.4) 28%, transparent 40%)',
          }}
        />

        {/* Content Container */}
        <div className="content-width relative z-10 h-full flex items-center justify-between">
          {/* ── Left: Headline + Button ── */}
          <div className="max-w-[460px] pl-2 lg:pl-4">
            {/* Welcome badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/90 border border-pink-200/60 text-[#c8436e] text-[12px] font-medium w-fit mb-3 shadow-sm">
              <Heart size={11} className="fill-[#c8436e] text-[#c8436e]" />
              <span>Bienvenue chez Décofleur Plus</span>
            </div>

            {/* Main heading */}
            <h1 className="font-serif text-[30px] lg:text-[36px] xl:text-[40px] font-normal leading-[1.1] tracking-tight mb-3">
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

            {/* Services subtitle */}
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

            {/* CTA Button + Flourish */}
            <div className="flex items-center gap-4">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b5355e] text-white font-medium text-[13px] shadow-md hover:shadow-lg transition-all duration-300"
              >
                <span>Découvrir nos produits</span>
                <ArrowRight size={14} />
              </Link>

              {/* Decorative flourish */}
              <div className="flex items-center gap-1.5 text-[#c8436e]" aria-hidden="true">
                <span className="w-8 h-[1px] bg-[#c8436e]/50" />
                <Heart size={13} className="fill-[#c8436e] text-[#c8436e]" />
                <span className="w-8 h-[1px] bg-[#c8436e]/50" />
              </div>
            </div>
          </div>

          {/* ── Right: Cursive Calligraphy (Great Vibes font) ── */}
          <div className={`hidden lg:flex flex-col items-center text-center pr-4 xl:pr-8 select-none pointer-events-none max-w-[300px] ${greatVibes.variable}`}>
            {/* Soft gradient wash for text legibility (no borders, no backdrop-blur) */}
            <div
              className="px-6 py-4"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(253,250,247,0.92) 0%, rgba(253,250,247,0.65) 50%, transparent 85%)',
              }}
            >
              <p
                className="text-[26px] xl:text-[30px] font-normal leading-[1.3] tracking-wide"
                style={{ fontFamily: 'var(--font-cursive), cursive', color: '#173f22' }}
              >
                L&apos;élégance de la nature
              </p>
              <p
                className="text-[26px] xl:text-[30px] font-normal leading-[1.3] mt-0.5"
                style={{ fontFamily: 'var(--font-cursive), cursive', color: '#c8436e' }}
              >
                à chaque instant
              </p>
              {/* Ornamental divider */}
              <div className="flex items-center justify-center gap-2.5 mt-3 text-[#c8436e]" aria-hidden="true">
                <span className="w-10 h-[1.5px] bg-[#c8436e]/50" />
                <Heart size={14} className="fill-[#c8436e] text-[#c8436e]" />
                <span className="w-10 h-[1.5px] bg-[#c8436e]/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE HERO BANNER ═══ */}
      <div className={`md:hidden relative w-full h-[215px] sm:h-[235px] overflow-hidden select-none ${greatVibes.variable}`}>
        {/* Background image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/hero-banner-mobile-final.jpg"
            alt="DécoFleur Plus"
            fill
            priority
            className="object-cover object-right sm:object-[80%_center]"
            sizes="100vw"
            quality={90}
          />
        </div>

        {/* Gradient fade left for text readability */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(253,250,247,0.98) 0%, rgba(253,250,247,0.94) 48%, rgba(253,250,247,0.6) 68%, rgba(253,250,247,0) 84%)',
          }}
        />

        {/* Mobile Content */}
        <div className="relative z-10 h-full flex flex-col justify-center pl-4 pr-1 max-w-[62%] sm:max-w-[58%]">
          {/* Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100/90 border border-pink-200/50 text-[#c8436e] text-[10.5px] font-medium w-fit mb-2 shadow-sm">
            <Heart size={10} className="fill-[#c8436e] text-[#c8436e]" />
            <span>Bienvenue chez Décofleur Plus</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[19px] sm:text-[22px] font-normal leading-[1.12] tracking-tight mb-2">
            <span className="text-[#173f22]">Des fleurs, </span>
            <span className="relative inline-block text-[#173f22]">
              des idées,
              <svg
                className="absolute -bottom-0.5 left-0 w-full"
                height="4"
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

          {/* Subtitle */}
          <div className="text-[10px] sm:text-[11px] leading-tight text-neutral-600 font-sans mb-3 space-y-0.5">
            <p>Fleuriste • Décoration événementielle</p>
            <p>Paniers de fruits • Cadeaux • Location</p>
          </div>

          {/* Button */}
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c8436e] hover:bg-[#b5355e] text-white font-medium text-[11px] sm:text-[12px] shadow-sm w-fit transition-colors"
          >
            <span>Découvrir nos produits</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
