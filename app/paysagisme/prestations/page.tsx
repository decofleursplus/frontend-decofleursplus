'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import { initialLandscapePrestations } from '@/lib/admin/mock-data/landscaping';
import { LandscapePrestation } from '@/lib/admin/mock-data/types';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SiteFooter } from '@/components/site-footer';

export default function PrestationsPage() {
  const [selectedPrestation, setSelectedPrestation] = useState<LandscapePrestation | null>(null);

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* ── En-tête de Section (Maquette Écran 2) ── */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#173f22] tracking-tight">
            Nos prestations
          </h1>
          <p className="text-xs sm:text-sm text-[#526655] ml-4 font-medium mt-1">
            Des solutions végétales sur mesure adaptées à tous vos espaces
          </p>
        </div>

        {/* ── Grille des 6 Prestations (Maquette Écran 2) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {initialLandscapePrestations.map((prestation) => (
            <div
              key={prestation.id}
              id={prestation.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#e8dfd5] shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e5dfd7]">
                <Image
                  src={prestation.image}
                  alt={prestation.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#193e23]">
                  {prestation.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#173f22] leading-snug">
                    {prestation.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#c8436e] mt-1">
                    {prestation.subtitle}
                  </p>
                  <p className="text-sm text-[#4b5e4f] mt-3 line-clamp-3 leading-relaxed">
                    {prestation.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0eae1] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedPrestation(prestation)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c8436e] hover:text-[#a0254c] group-hover:underline transition-colors"
                  >
                    En savoir plus <ArrowRight size={15} />
                  </button>
                  <Link
                    href={`/devis?type=paysagisme&prestation=${encodeURIComponent(prestation.title)}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f4ebe1] hover:bg-[#ebdccf] text-[#193e23] transition-colors"
                  >
                    Devis express
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bannière CTA Finale (Maquette Écran 2) ── */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-white bg-gradient-to-r from-[#173f22] to-[#254f30] shadow-lg border border-[#305f3d]">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Un projet d&apos;aménagement ? Discutons de vos besoins.
              </h2>
              <p className="text-[#d8ebd9] text-sm sm:text-base mt-2">
                Nos paysagistes conçoivent vos jardins, terrasses et espaces d’entreprise avec des végétaux sélectionnés avec soin et une garantie de reprise.
              </p>
            </div>
            <Link
              href="/devis?type=paysagisme"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-base shadow-md transition-all active:scale-95"
            >
              Demander un devis <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ── Side Drawer de Détail Prestation (Remplace la Modale) ── */}
        {selectedPrestation && (
          <div className="fixed inset-0 z-[500] flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => setSelectedPrestation(null)}
              aria-label="Fermer le volet"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-right duration-300">
              <div className="relative aspect-[16/10] w-full shrink-0">
                <Image
                  src={selectedPrestation.image}
                  alt={selectedPrestation.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedPrestation(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-[#193e23] shadow-xs">
                    {selectedPrestation.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22] mb-1">
                    {selectedPrestation.title}
                  </h2>
                  <p className="text-sm font-medium text-[#c8436e] mb-4">
                    {selectedPrestation.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-[#3d5041] leading-relaxed mb-6">
                    {selectedPrestation.description}
                  </p>

                  {selectedPrestation.benefits && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-[#173f22] uppercase tracking-wider mb-3">
                        Nos engagements &amp; points forts :
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedPrestation.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#4b5e4f]">
                            <CheckCircle2 size={16} className="text-[#193e23] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPrestation(null)}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <Link
                    href={`/devis?type=paysagisme&prestation=${encodeURIComponent(selectedPrestation.title)}`}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-medium shadow-sm transition-colors text-center"
                  >
                    Demander un devis pour cette prestation <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
