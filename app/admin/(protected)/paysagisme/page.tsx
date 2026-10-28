'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Trees,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { initialLandscapePrestations, initialLandscapeProjects } from '@/lib/admin/mock-data/landscaping';
import { LandscapePrestation, LandscapeProject } from '@/lib/admin/mock-data/types';

export default function AdminPaysagismePage() {
  const [activeTab, setActiveTab] = useState<'prestations' | 'realisations'>('prestations');
  const [prestations, setPrestations] = useState<LandscapePrestation[]>(initialLandscapePrestations);
  const [projects, setProjects] = useState<LandscapeProject[]>(initialLandscapeProjects);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrestations = prestations.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Paysagisme &amp; Aménagement Vert
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez votre catalogue de prestations paysagères et votre galerie de réalisations publiques.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Formulaire d’ajout ouvert en version interactive.')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-fit"
        >
          <Plus size={18} />
          {activeTab === 'prestations' ? 'Ajouter une prestation' : 'Ajouter une réalisation'}
        </button>
      </div>

      {/* ── Onglets de Navigation ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('prestations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'prestations'
              ? 'bg-[#193e23] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Nos prestations ({prestations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('realisations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'realisations'
              ? 'bg-[#193e23] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Portfolio des réalisations ({projects.length})
        </button>
      </div>

      {/* ── Barre de Recherche ── */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === 'prestations'
              ? 'Rechercher une prestation, catégorie...'
              : 'Rechercher une réalisation, lieu, client...'
          }
          className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* ── Vue 1 : Prestations ── */}
      {activeTab === 'prestations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrestations.map((prestation) => (
            <div
              key={prestation.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={prestation.image}
                    alt={prestation.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#193e23]">
                    {prestation.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif font-bold text-lg text-[#173f22]">
                    {prestation.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#c8436e] mt-0.5">
                    {prestation.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {prestation.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-border mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 size={14} /> Publiée sur le site
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => alert('Édition de la prestation')}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer cette prestation ?')) {
                        setPrestations((prev) => prev.filter((p) => p.id !== prestation.id));
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Vue 2 : Réalisations ── */}
      {activeTab === 'realisations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#193e23]">
                    {project.categoryLabel}
                  </div>
                  {project.featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#c8436e] text-white text-[10px] font-semibold">
                      En avant ⭐
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin size={12} className="text-[#a0254c]" /> {project.location}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#173f22]">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-border mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 size={14} /> Visible en galerie
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => alert('Édition de la réalisation')}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer cette réalisation ?')) {
                        setProjects((prev) => prev.filter((p) => p.id !== project.id));
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
