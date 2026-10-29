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
  X,
  Save,
  FileText,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { initialLandscapePrestations, initialLandscapeProjects } from '@/lib/admin/mock-data/landscaping';
import { LandscapePrestation, LandscapeProject, LandscapeProjectCategory } from '@/lib/admin/mock-data/types';

export default function AdminPaysagismePage() {
  const [activeTab, setActiveTab] = useState<'prestations' | 'realisations'>('prestations');
  const [prestations, setPrestations] = useState<LandscapePrestation[]>(initialLandscapePrestations);
  const [projects, setProjects] = useState<LandscapeProject[]>(initialLandscapeProjects);
  const [searchTerm, setSearchTerm] = useState('');

  // Prestation Drawer state
  const [isPrestationDrawerOpen, setIsPrestationDrawerOpen] = useState(false);
  const [editingPrestationId, setEditingPrestationId] = useState<string | null>(null);
  const [presTitle, setPresTitle] = useState('');
  const [presSubtitle, setPresSubtitle] = useState('');
  const [presCategory, setPresCategory] = useState('Conception');
  const [presDescription, setPresDescription] = useState('');
  const [presHighlights, setPresHighlights] = useState('');
  const [presImage, setPresImage] = useState('/images/paysagisme/prestation-conception.jpg');

  // Réalisation Drawer state
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<LandscapeProjectCategory>('villas');
  const [projLocation, setProjLocation] = useState('Saly Portudal');
  const [projDescription, setProjDescription] = useState('');
  const [projYear, setProjYear] = useState('2024');
  const [projSurface, setProjSurface] = useState('650 m²');
  const [projTags, setProjTags] = useState('Piscine, Palmiers, Gazon');
  const [projFeatured, setProjFeatured] = useState(false);
  const [projImage, setProjImage] = useState('/images/paysagisme/paysagisme-villas.jpg');

  const handleOpenPrestationDrawer = (p?: LandscapePrestation) => {
    if (p) {
      setEditingPrestationId(p.id);
      setPresTitle(p.title);
      setPresSubtitle(p.subtitle);
      setPresCategory(p.category);
      setPresDescription(p.description);
      setPresHighlights((p.benefits || []).join('\n'));
      setPresImage(p.image);
    } else {
      setEditingPrestationId(null);
      setPresTitle('');
      setPresSubtitle('Étude et aménagement sur mesure');
      setPresCategory('Conception');
      setPresDescription('Service sur mesure par nos architectes paysagistes qualifiés.');
      setPresHighlights('Étude personnalisée de votre sol\nModélisation 3D du projet\nSélection d’essences tropicales adaptées');
      setPresImage('/images/paysagisme/prestation-conception.jpg');
    }
    setIsPrestationDrawerOpen(true);
  };

  const handleSavePrestation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presTitle.trim()) {
      toast.error('Veuillez renseigner le titre de la prestation.');
      return;
    }

    const highlightsList = presHighlights.split('\n').map((h) => h.trim()).filter(Boolean);

    if (editingPrestationId) {
      setPrestations((prev) =>
        prev.map((p) =>
          p.id === editingPrestationId
            ? {
                ...p,
                title: presTitle,
                subtitle: presSubtitle,
                category: presCategory,
                description: presDescription,
                benefits: highlightsList.length > 0 ? highlightsList : p.benefits,
                image: presImage,
              }
            : p
        )
      );
      toast.success(`Prestation « ${presTitle} » modifiée avec succès !`);
    } else {
      const newP: LandscapePrestation = {
        id: `pres-${Date.now()}`,
        title: presTitle,
        subtitle: presSubtitle,
        category: presCategory,
        description: presDescription,
        benefits: highlightsList.length > 0 ? highlightsList : ['Service de qualité professionnelle'],
        image: presImage,
      };
      setPrestations([newP, ...prestations]);
      toast.success(`Prestation « ${presTitle} » ajoutée au catalogue !`);
    }

    setIsPrestationDrawerOpen(false);
  };

  const handleOpenProjectDrawer = (proj?: LandscapeProject) => {
    if (proj) {
      setEditingProjectId(proj.id);
      setProjTitle(proj.title);
      setProjCategory(proj.category);
      setProjLocation(proj.location);
      setProjDescription(proj.description);
      setProjTags(proj.tags.join(', '));
      setProjFeatured(!!proj.featured);
      setProjImage(proj.image);
    } else {
      setEditingProjectId(null);
      setProjTitle('');
      setProjCategory('villas');
      setProjLocation('Saly Portudal');
      setProjDescription('Création d’un écrin végétal contemporain avec essences locales.');
      setProjTags('Jardin tropical, Gazon synthétique, Éclairage');
      setProjFeatured(false);
      setProjImage('/images/paysagisme/paysagisme-villas.jpg');
    }
    setIsProjectDrawerOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      toast.error('Veuillez renseigner le nom de la réalisation.');
      return;
    }

    const categoryLabels: Record<LandscapeProjectCategory, string> = {
      jardins: 'Jardins & Espaces verts',
      villas: 'Villas & résidences privées',
      hotels: 'Hôtels & resorts balnéaires',
      bureaux: 'Bureaux & espaces professionnels',
      terrasses: 'Terrasses & toits végétalisés',
    };

    const tagsList = projTags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                title: projTitle,
                category: projCategory,
                categoryLabel: categoryLabels[projCategory] || 'Aménagement',
                location: projLocation,
                description: projDescription,
                tags: tagsList,
                featured: projFeatured,
                image: projImage,
              }
            : p
        )
      );
      toast.success(`Réalisation « ${projTitle} » modifiée avec succès !`);
    } else {
      const newProj: LandscapeProject = {
        id: `proj-${Date.now()}`,
        title: projTitle,
        category: projCategory,
        categoryLabel: categoryLabels[projCategory] || 'Aménagement',
        location: projLocation,
        description: projDescription,
        tags: tagsList,
        featured: projFeatured,
        image: projImage,
      };
      setProjects([newProj, ...projects]);
      toast.success(`Réalisation « ${projTitle} » ajoutée au portfolio !`);
    }

    setIsProjectDrawerOpen(false);
  };

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
          onClick={() => {
            if (activeTab === 'prestations') {
              handleOpenPrestationDrawer();
            } else {
              handleOpenProjectDrawer();
            }
          }}
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
                    onClick={() => handleOpenPrestationDrawer(prestation)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                    title="Modifier la prestation"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrestations((prev) => prev.filter((p) => p.id !== prestation.id));
                      toast.success(`Prestation « ${prestation.title} » supprimée`);
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
                    onClick={() => handleOpenProjectDrawer(project)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                    title="Modifier la réalisation"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjects((prev) => prev.filter((p) => p.id !== project.id));
                      toast.success(`Réalisation « ${project.title} » supprimée`);
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

      {/* ── Side Drawer : Ajout / Modification Prestation ── */}
      <AdminDrawer
        isOpen={isPrestationDrawerOpen}
        onClose={() => setIsPrestationDrawerOpen(false)}
        title={editingPrestationId ? 'Modifier la prestation' : 'Nouvelle prestation paysagère'}
        subtitle={editingPrestationId ? 'Mettre à jour la fiche catalogue' : 'Ajouter un service d’aménagement ou d’entretien'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsPrestationDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="prestation-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-green hover:bg-[#13321c] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Save size={16} />
              {editingPrestationId ? 'Enregistrer les modifications' : 'Créer la prestation'}
            </button>
          </div>
        }
      >
        <form id="prestation-form" onSubmit={handleSavePrestation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Titre du service <span className="text-[#c8436e]">*</span>
            </label>
            <input
              type="text"
              required
              value={presTitle}
              onChange={(e) => setPresTitle(e.target.value)}
              placeholder="Ex : Conception & Design Paysager 3D"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Sous-titre / Promesse <span className="text-[#c8436e]">*</span>
            </label>
            <input
              type="text"
              required
              value={presSubtitle}
              onChange={(e) => setPresSubtitle(e.target.value)}
              placeholder="Ex : Plans architecturaux & modélisation avant travaux"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Catégorie
              </label>
              <select
                value={presCategory}
                onChange={(e) => setPresCategory(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-white"
              >
                <option value="Conception">Conception & Plan</option>
                <option value="Création">Création de jardin</option>
                <option value="Entretien">Entretien & Arrosage</option>
                <option value="Toitures & Terrasses">Toitures & Terrasses</option>
                <option value="Végétalisation Intérieure">Intérieur & Bureaux</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Image d’illustration
              </label>
              <select
                value={presImage}
                onChange={(e) => setPresImage(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-white"
              >
                <option value="/images/paysagisme/prestation-conception.jpg">Conception 3D</option>
                <option value="/images/paysagisme/prestation-terrasses.jpg">Terrasse & Rooftop</option>
                <option value="/images/paysagisme/prestation-exterieurs.jpg">Espaces Extérieurs</option>
                <option value="/images/paysagisme/prestation-interieur.jpg">Végétalisation Intérieure</option>
                <option value="/images/paysagisme/prestation-entretien.jpg">Contrat d'entretien</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Description détaillée <span className="text-[#c8436e]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={presDescription}
              onChange={(e) => setPresDescription(e.target.value)}
              placeholder="Présentez les étapes de la prestation, l'expertise et la méthodologie..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Points forts / Avantages clés (un par ligne)
            </label>
            <textarea
              rows={3}
              value={presHighlights}
              onChange={(e) => setPresHighlights(e.target.value)}
              placeholder="Plan 3D photo-réaliste immersif&#10;Sélection d'essences adaptées au climat sénégalais&#10;Devis détaillé sous 48h"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none resize-none leading-relaxed font-mono text-xs"
            />
          </div>
        </form>
      </AdminDrawer>

      {/* ── Side Drawer : Ajout / Modification Réalisation Portfolio ── */}
      <AdminDrawer
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        title={editingProjectId ? 'Modifier la réalisation' : 'Nouvelle réalisation au portfolio'}
        subtitle={editingProjectId ? 'Mettre à jour les informations du projet' : 'Mettre en valeur un projet d’aménagement achevé'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsProjectDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="project-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-green hover:bg-[#13321c] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Save size={16} />
              {editingProjectId ? 'Enregistrer les modifications' : 'Ajouter au portfolio'}
            </button>
          </div>
        }
      >
        <form id="project-form" onSubmit={handleSaveProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Titre du projet <span className="text-[#c8436e]">*</span>
            </label>
            <input
              type="text"
              required
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              placeholder="Ex : Villa Océane – Saly Portudal"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Typologie de lieu
              </label>
              <select
                value={projCategory}
                onChange={(e) => setProjCategory(e.target.value as LandscapeProjectCategory)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-white"
              >
                <option value="villas">Villas &amp; Résidences</option>
                <option value="hotels">Hôtels &amp; Resorts</option>
                <option value="bureaux">Bureaux &amp; Sièges</option>
                <option value="terrasses">Terrasses &amp; Toits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Localisation <span className="text-[#c8436e]">*</span>
              </label>
              <input
                type="text"
                required
                value={projLocation}
                onChange={(e) => setProjLocation(e.target.value)}
                placeholder="Ex : Almadies, Dakar"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Année de réalisation
              </label>
              <input
                type="text"
                value={projYear}
                onChange={(e) => setProjYear(e.target.value)}
                placeholder="Ex : 2024"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Superficie
              </label>
              <input
                type="text"
                value={projSurface}
                onChange={(e) => setProjSurface(e.target.value)}
                placeholder="Ex : 450 m²"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Image principale du projet
            </label>
            <select
              value={projImage}
              onChange={(e) => setProjImage(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-white"
            >
              <option value="/images/paysagisme/paysagisme-villas.jpg">Jardin Villa Tropicale</option>
              <option value="/images/paysagisme/paysagisme-hotels.jpg">Resort Balnéaire & Piscine</option>
              <option value="/images/paysagisme/paysagisme-bureaux.jpg">Atrium & Bureaux Green</option>
              <option value="/images/paysagisme/prestation-terrasses.jpg">Rooftop & Pergola Végétale</option>
              <option value="/images/paysagisme/prestation-exterieurs.jpg">Allée paysagère & Palmeraie</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Tags &amp; Éléments clés (séparés par virgules)
            </label>
            <input
              type="text"
              value={projTags}
              onChange={(e) => setProjTags(e.target.value)}
              placeholder="Ex : Gazon rustique, Arrosage goutte-à-goutte, Palmiers royaux"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Description du projet <span className="text-[#c8436e]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={projDescription}
              onChange={(e) => setProjDescription(e.target.value)}
              placeholder="Détails sur l'ambiance, les contraintes du terrain, les solutions techniques mises en place..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <input
              type="checkbox"
              id="projFeatured"
              checked={projFeatured}
              onChange={(e) => setProjFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-forest-green focus:ring-forest-green"
            />
            <label htmlFor="projFeatured" className="text-xs font-semibold text-foreground cursor-pointer">
              Mettre en avant sur la page d'accueil (Projet vedette ⭐)
            </label>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
