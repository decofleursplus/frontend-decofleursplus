import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Trees, Building2, SunMedium, Scissors } from 'lucide-react';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getServiceSchema } from '@/lib/seo/schema';
import { getLandscapeProjects } from '@/lib/api/landscaping';
import type { LandscapeProject } from '@/lib/admin/mock-data/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = constructMetadata({
  title: 'Paysagisme & Aménagement Vert au Sénégal | Villas & Hôtels Saly & Dakar',
  description:
    'Conception paysagère, aménagement de jardins, terrasses de villas, végétalisation d’hôtels et entretien d’espaces verts à Saly Portudal, Somone et Dakar par Décofleur Plus.',
  canonical: '/paysagisme',
  image: '/images/paysagisme/paysagisme-hero.jpg',
  keywords: [
    'paysagiste dakar',
    'paysagiste saly',
    'amenagement jardin senegal',
    'creation jardin villa saly',
    'vegetalisation terrasse dakar',
    'entretien espaces verts petite cote',
  ],
});

export default async function PaysagismePage() {
  let featuredProjects: LandscapeProject[] = [];
  try {
    featuredProjects = await getLandscapeProjects({ featured: true, limit: 3 });
  } catch {
    featuredProjects = [];
  }

  const landscapingServiceSchema = getServiceSchema({
    name: 'Paysagisme & Aménagement d’Espaces Verts',
    description:
      'Conception paysagère, création de jardins de villas, terrasses végétalisées et entretien d’espaces verts au Sénégal par Décofleur Plus.',
    url: '/paysagisme',
    image: '/images/paysagisme/paysagisme-hero.jpg',
    areaServed: ['Saly Portudal', 'Dakar', 'Somone', 'Mbour', 'Ngaparou', 'Petite-Côte'],
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Paysagisme & Aménagement Vert' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={landscapingServiceSchema} />
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
        {/* ── 1. Hero Banner Panoramique Compact (Hauteur Réduite) ── */}
        <section className="relative w-full rounded-xl overflow-hidden min-h-[280px] sm:min-h-[310px] lg:min-h-[340px] flex items-center p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-md border border-[#e6ded5]">
          <Image
            src="/images/paysagisme/hero-paysagisme.webp"
            alt="Aménagement paysager et scénographie végétale par Décofleur Plus"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dégradé doux et protecteur pour lisibilité optimale */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 pointer-events-none" />

          <div className="relative z-10 max-w-xl text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-300/40 text-xs font-semibold mb-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              Conception · Aménagement · Entretien
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight mb-3 drop-shadow-sm">
              Paysagisme &amp; Aménagement Vert
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium leading-relaxed mb-5 max-w-lg">
              Des espaces de vie plus beaux, plus verts, plus inspirants. Conception, aménagement et entretien de vos espaces extérieurs et intérieurs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/devis?type=paysagisme"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Demander une étude & un devis
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/paysagisme/prestations"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                Découvrir nos prestations
              </Link>
            </div>
          </div>

          <div className="absolute bottom-3 right-5 hidden md:flex items-center gap-2 text-white/80 text-[11px] font-medium backdrop-blur-md bg-black/35 px-3 py-1 rounded-full border border-white/15">
            <span>Villa Almadies</span>
            <span>·</span>
            <span>Dakar &amp; Saly</span>
          </div>
        </section>

        {/* ── 2. Bandeau Catégories / Services Compact (Taille Réduite) ── */}
        <section className="mb-8 sm:mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <Link
              href="/paysagisme/prestations"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae3d9] hover:border-[#173f22]/30 hover:shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#eef7f0] flex items-center justify-center text-[#193e23] shrink-0 group-hover:scale-105 transition-transform">
                <Trees size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[#173f22] truncate">Jardins &amp; parcs</h2>
                <span className="text-[10px] text-[#627765] block truncate">Création sur mesure</span>
              </div>
            </Link>

            <Link
              href="/paysagisme/prestations"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae3d9] hover:border-[#173f22]/30 hover:shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#eef7f0] flex items-center justify-center text-[#193e23] shrink-0 group-hover:scale-105 transition-transform">
                <SunMedium size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[#173f22] truncate">Terrasses &amp; balcons</h2>
                <span className="text-[10px] text-[#627765] block truncate">Végétalisation urbaine</span>
              </div>
            </Link>

            <Link
              href="/paysagisme/prestations"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae3d9] hover:border-[#173f22]/30 hover:shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#eef7f0] flex items-center justify-center text-[#193e23] shrink-0 group-hover:scale-105 transition-transform">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[#173f22] truncate">Espaces pro</h2>
                <span className="text-[10px] text-[#627765] block truncate">Hôtels, bureaux, restos</span>
              </div>
            </Link>

            <Link
              href="/paysagisme/prestations"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae3d9] hover:border-[#173f22]/30 hover:shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#eef7f0] flex items-center justify-center text-[#193e23] shrink-0 group-hover:scale-105 transition-transform">
                <Scissors size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[#173f22] truncate">Entretien &amp; suivi</h2>
                <span className="text-[10px] text-[#627765] block truncate">Soins &amp; arrosage</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── 3. Section "Nos réalisations" (Sans Eyebrow Encombrant) ── */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
                Nos réalisations
              </h2>
              <p className="text-xs sm:text-sm text-[#5f7463] mt-1">
                Conceptions paysagères d&apos;exception sur la Petite Côte et à Dakar
              </p>
            </div>
            <Link
              href="/paysagisme/realisations"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#c8436e] hover:text-[#a0254c] transition-colors"
            >
              Voir toutes nos réalisations <ArrowRight size={15} />
            </Link>
          </div>

          {featuredProjects.length > 0 ? (
            <div
              className={cn(
                'grid gap-5 lg:gap-6',
                featuredProjects.length === 1 && 'grid-cols-1 max-w-xl mx-auto',
                featuredProjects.length === 2 && 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto',
                featuredProjects.length >= 3 && 'grid-cols-1 md:grid-cols-3',
              )}
            >
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative rounded-2xl overflow-hidden border border-[#e8dfd5] shadow-2xs hover:shadow-lg transition-all aspect-[4/3]"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white">
                    {project.location ? (
                      <div className="text-[11px] text-[#f5c6cb] font-medium mb-0.5">{project.location}</div>
                    ) : null}
                    <h3 className="text-base font-serif font-bold text-white line-clamp-1">{project.title}</h3>
                    {project.description ? (
                      <p className="text-xs text-white/85 mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    ) : null}
                    <div className="mt-2 pt-2 border-t border-white/15 flex justify-end">
                      <Link
                        href="/paysagisme/realisations"
                        className="text-xs font-semibold text-[#f5c6cb] hover:text-white transition-colors"
                      >
                        Découvrir ›
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dcd3c7] bg-[#faf7f2] p-8 sm:p-12 text-center">
              <p className="text-xs sm:text-sm text-[#526655] font-medium">
                Aucune réalisation mise en avant pour le moment. Découvrez nos services ou contactez-nous.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/paysagisme/prestations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#173f22]/20 bg-white text-xs font-semibold text-[#173f22] hover:bg-[#edf8ef] transition-colors"
                >
                  Nos prestations
                </Link>
                <Link
                  href="/devis?type=paysagisme"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Demander un devis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── 4. Bannière d'Appel à l'Action & Devis (Sans Eyebrow) ── */}
        <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 text-white bg-[#14321d] mb-14 shadow-md border border-[#234c2d]">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="max-w-xl">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Un projet d&apos;aménagement ? Discutons de vos besoins.
              </h2>
              <p className="text-[#d8ebd9] text-xs sm:text-sm mt-1.5 leading-relaxed">
                Nos architectes paysagistes et jardiniers d&apos;art se déplacent à Saly, Dakar et sur toute la Petite Côte pour concevoir votre projet sur mesure.
              </p>
            </div>
            <Link
              href="/devis?type=paysagisme"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Demander un devis <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
