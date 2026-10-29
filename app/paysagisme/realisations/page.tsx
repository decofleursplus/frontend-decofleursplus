'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, Heart, X, MapPin, Tag } from 'lucide-react';
import { initialLandscapeProjects } from '@/lib/admin/mock-data/landscaping';
import { LandscapeProject, LandscapeProjectCategory } from '@/lib/admin/mock-data/types';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SiteFooter } from '@/components/site-footer';

type FilterType = 'all' | LandscapeProjectCategory;

export default function RealisationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeProject, setActiveProject] = useState<LandscapeProject | null>(null);
  const [likedProjects, setLikedProjects] = useState<Record<string, boolean>>({
    'villa-almadies': true,
  });

  const filteredProjects = initialLandscapeProjects.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* ── En-tête (Maquette Écran 3, sans breadcrumbs ni encombrement) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#173f22] tracking-tight">
              Nos réalisations
            </h1>
            <p className="text-xs sm:text-sm text-[#526655] ml-4 font-medium mt-1">
              Découvrez quelques-uns de nos projets récents
            </p>
          </div>

          <Link
            href="/devis?type=paysagisme"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-sm transition-colors w-fit"
          >
            Confiez-nous votre projet <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Filtres en Pilules (Maquette Écran 3) ── */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setFilter('jardins')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'jardins'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Jardins
          </button>
          <button
            type="button"
            onClick={() => setFilter('terrasses')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'terrasses'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Terrasses &amp; balcons
          </button>
          <button
            type="button"
            onClick={() => setFilter('villas')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'villas'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Villas
          </button>
          <button
            type="button"
            onClick={() => setFilter('hotels')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'hotels'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Hôtels &amp; restaurants
          </button>
          <button
            type="button"
            onClick={() => setFilter('bureaux')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              filter === 'bureaux'
                ? 'bg-[#c8436e] text-white shadow-sm'
                : 'bg-white text-[#455848] border border-[#ded5cb] hover:bg-[#f6eee4]'
            }`}
          >
            Bureaux
          </button>
        </div>

        {/* ── Galerie Mosaïque avec Flou Protecteur sur les Textes (Image copy 2) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const isFirst = idx === 0 && filter === 'all';
            return (
              <div
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#e8dfd5] shadow-xs hover:shadow-xl transition-all duration-300 ${
                  isFirst ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`relative w-full ${isFirst ? 'aspect-[16/10] md:h-[480px]' : 'aspect-[4/3]'} overflow-hidden`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes={isFirst ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Boutons d'action rapides (Cœur & Zoom) en haut à droite */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => toggleLike(project.id, e)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        likedProjects[project.id]
                          ? 'bg-[#c8436e] text-white'
                          : 'bg-white/75 hover:bg-white text-gray-800'
                      }`}
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart size={16} fill={likedProjects[project.id] ? 'currentColor' : 'none'} />
                    </button>
                    <div className="p-2 rounded-full bg-white/75 hover:bg-white text-gray-800 backdrop-blur-md transition-colors">
                      <Eye size={16} />
                    </div>
                  </div>

                  {/* Badge Catégorie en haut à gauche */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-[#193e23] shadow-xs">
                      {project.categoryLabel}
                    </span>
                  </div>

                  {/* Textes avec Conteneur Flou Backdrop-Blur Protecteur (Image copy 2) */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3.5 sm:p-4 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 text-white transition-transform group-hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#f5c6cb] font-medium mb-1">
                      <MapPin size={13} /> {project.location}
                    </div>
                    <h3 className={`${isFirst ? 'text-xl sm:text-2xl md:text-3xl' : 'text-base sm:text-lg'} font-serif font-bold text-white leading-tight`}>
                      {project.title}
                    </h3>
                    <p className={`text-white/90 text-xs sm:text-sm mt-1 line-clamp-2 ${!isFirst ? 'hidden sm:block' : ''}`}>
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Side Drawer de Détail Réalisation (Remplace la Modale - Image copy 3) ── */}
        {activeProject && (
          <div className="fixed inset-0 z-[500] flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => setActiveProject(null)}
              aria-label="Fermer le volet"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-right duration-300">
              <div className="relative aspect-[16/10] w-full shrink-0">
                <Image
                  src={activeProject.image}
                  alt={activeProject.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-[#193e23] shadow-xs">
                    {activeProject.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#c8436e] mb-2">
                    <MapPin size={15} /> {activeProject.location}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22] mb-3">
                    {activeProject.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#3d5041] leading-relaxed mb-6">
                    {activeProject.description}
                  </p>

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#748777] mb-3">
                    Végétaux &amp; aménagement réalisés
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {activeProject.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f0f5f1] text-[#193e23] border border-[#dce9de]"
                      >
                        <Tag size={12} className="text-[#a0254c]" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveProject(null)}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <Link
                    href={`/devis?type=paysagisme&inspiration=${encodeURIComponent(activeProject.title)}`}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-medium shadow-sm transition-colors text-center"
                  >
                    S&apos;inspirer de ce projet pour mon devis <ArrowRight size={16} />
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
