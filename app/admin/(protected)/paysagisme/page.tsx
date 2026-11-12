'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trees, Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, Loader2, Upload, ExternalLink, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import type { LandscapePrestation, LandscapeProject, LandscapeProjectCategory } from '@/lib/admin/mock-data/types';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';
import {
  LANDSCAPE_CATEGORIES,
  createLandscapeProject,
  createLandscapeService,
  deleteLandscapeProject,
  deleteLandscapeService,
  getAdminLandscapeProjects,
  getAdminLandscapeServices,
  updateLandscapeProject,
  updateLandscapeService,
} from '@/lib/api/landscaping';

const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors';
const SERVICE_CATEGORIES = ['Conception', 'Création', 'Entretien', 'Toitures & Terrasses', 'Végétalisation intérieure'];
const SERVICE_IMAGES = [
  { path: '/images/paysagisme/prestation-conception.jpg', label: 'Conception' },
  { path: '/images/paysagisme/prestation-terrasses.jpg', label: 'Terrasses' },
  { path: '/images/paysagisme/prestation-exterieurs.jpg', label: 'Extérieurs' },
  { path: '/images/paysagisme/prestation-interieur.jpg', label: 'Intérieur' },
  { path: '/images/paysagisme/prestation-entretien.jpg', label: 'Entretien' },
];
const PROJECT_IMAGES = [
  { path: '/images/paysagisme/paysagisme-villas.jpg', label: 'Villa' },
  { path: '/images/paysagisme/paysagisme-hotels.jpg', label: 'Hôtel' },
  { path: '/images/paysagisme/paysagisme-bureaux.jpg', label: 'Bureaux' },
  { path: '/images/paysagisme/paysagisme-hero.jpg', label: 'Jardin' },
];
const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean);
const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

type ServiceForm = { id?: string; title: string; subtitle: string; category: string; description: string; benefits: string; features: string; image: string; isActive: boolean };
type ProjectForm = { id?: string; title: string; category: LandscapeProjectCategory; location: string; description: string; tags: string; image: string; featured: boolean; isPublished: boolean };

const NEW_SERVICE: ServiceForm = { title: '', subtitle: '', category: 'Conception', description: '', benefits: '', features: '', image: SERVICE_IMAGES[0].path, isActive: true };
const NEW_PROJECT: ProjectForm = { title: '', category: 'villas', location: '', description: '', tags: '', image: PROJECT_IMAGES[0].path, featured: false, isPublished: true };

/** Paysagisme : prestations et réalisations publiées sur la vitrine (/paysagisme). */
export default function AdminPaysagismePage() {
  const [activeTab, setActiveTab] = useState<'prestations' | 'realisations'>('prestations');
  const [services, setServices] = useState<LandscapePrestation[] | null>(null);
  const [projects, setProjects] = useState<LandscapeProject[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceForm, setServiceForm] = useState<ServiceForm | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    () =>
      Promise.all([getAdminLandscapeServices(), getAdminLandscapeProjects()])
        .then(([s, p]) => {
          setServices(s);
          setProjects(p);
          setLoadError(null);
        })
        .catch((err) => setLoadError(errorText(err, 'Impossible de charger le module paysagisme.'))),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Action impossible.'));
    } finally {
      setBusyId(null);
    }
  };

  const uploadImage = async (file: File, apply: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('La photo ne doit pas dépasser 5 Mo.');
    setUploading(true);
    try {
      const [url] = await uploadAdminMedia([file], 'products');
      if (url) apply(url);
      toast.success('Photo téléversée.');
    } catch (err) {
      toast.error(errorText(err, 'Téléversement impossible.'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm) return;
    if (serviceForm.title.trim().length < 2) return toast.error('Renseignez le titre de la prestation.');
    const payload = {
      title: serviceForm.title.trim(),
      subtitle: serviceForm.subtitle.trim(),
      category: serviceForm.category,
      description: serviceForm.description.trim(),
      benefits: lines(serviceForm.benefits),
      features: lines(serviceForm.features),
      image: serviceForm.image,
      isActive: serviceForm.isActive,
    };
    setSaving(true);
    try {
      if (serviceForm.id) await updateLandscapeService(serviceForm.id, payload);
      else await createLandscapeService(payload);
      toast.success(`Prestation « ${payload.title} » ${serviceForm.id ? 'modifiée' : 'ajoutée'}.`);
      setServiceForm(null);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm) return;
    if (projectForm.title.trim().length < 2) return toast.error('Renseignez le nom de la réalisation.');
    const payload = {
      title: projectForm.title.trim(),
      category: projectForm.category,
      location: projectForm.location.trim(),
      description: projectForm.description.trim(),
      tags: projectForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      image: projectForm.image,
      featured: projectForm.featured,
      isPublished: projectForm.isPublished,
    };
    setSaving(true);
    try {
      if (projectForm.id) await updateLandscapeProject(projectForm.id, payload);
      else await createLandscapeProject(payload);
      toast.success(`Réalisation « ${payload.title} » ${projectForm.id ? 'modifiée' : 'ajoutée au portfolio'}.`);
      setProjectForm(null);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const q = searchTerm.toLowerCase();
  const shownServices = (services ?? []).filter((s) => !q || `${s.title} ${s.category} ${s.subtitle}`.toLowerCase().includes(q));
  const shownProjects = (projects ?? []).filter((p) => !q || `${p.title} ${p.location} ${p.categoryLabel}`.toLowerCase().includes(q));

  const imagePicker = (value: string, presets: { path: string; label: string }[], apply: (url: string) => void) => (
    <div className="space-y-2">
      <div className="relative h-36 rounded-xl overflow-hidden border border-border bg-muted">
        {value && <Image src={value} alt="Aperçu" fill sizes="480px" className="object-cover" />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((img) => (
          <button
            key={img.path}
            type="button"
            onClick={() => apply(img.path)}
            className={`px-2 py-1 rounded-lg border text-[11px] ${value === img.path ? 'border-[#193e23] bg-[#edf8ef] font-semibold' : 'border-border'}`}
          >
            {img.label}
          </button>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-[#193e23] text-[11px] font-semibold text-[#193e23]"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Téléverser une photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file, apply);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Paysagisme & aménagement vert</h1>
          <p className="text-sm text-muted-foreground mt-1">Prestations et galerie de réalisations publiées sur la vitrine.</p>
        </div>
        <div className="flex gap-2">
          <Link href={activeTab === 'prestations' ? '/paysagisme/prestations' : '/paysagisme/realisations'} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold">
            Voir sur le site <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => (activeTab === 'prestations' ? setServiceForm({ ...NEW_SERVICE }) : setProjectForm({ ...NEW_PROJECT }))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white text-sm font-semibold shadow-sm"
          >
            <Plus size={18} /> {activeTab === 'prestations' ? 'Ajouter une prestation' : 'Ajouter une réalisation'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          {(['prestations', 'realisations'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${activeTab === tab ? 'bg-[#193e23] text-white border-[#193e23]' : 'bg-white border-border'}`}
            >
              {tab === 'prestations' ? `Prestations (${services?.length ?? 0})` : `Réalisations (${projects?.length ?? 0})`}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-border sm:w-72">
          <Search size={15} className="text-muted-foreground" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher…" aria-label="Rechercher" className="w-full text-xs outline-none bg-transparent" />
        </label>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <span>{loadError}</span>
          <button type="button" onClick={() => void load()} className="underline font-semibold">
            Réessayer
          </button>
        </div>
      )}

      {services === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : activeTab === 'prestations' ? (
        shownServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center text-xs text-muted-foreground">
            <Trees className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            Aucune prestation{q ? ' pour cette recherche' : ' : ajoutez la première pour l’afficher sur le site'}.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {shownServices.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
                <div className="relative h-36 bg-muted">
                  {s.image && <Image src={s.image} alt={s.title} fill sizes="400px" className="object-cover" />}
                  {!s.isActive && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px]">Masquée</span>}
                </div>
                <div className="p-4 flex-1 space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-[#c8436e]">{s.category}</span>
                  <h3 className="font-serif font-bold text-base text-[#173f22]">{s.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{s.subtitle || s.description}</p>
                </div>
                <div className="flex justify-end gap-1.5 p-3 border-t border-border">
                  <button
                    type="button"
                    disabled={busyId === s.id}
                    onClick={() => void run(s.id, () => updateLandscapeService(s.id, { isActive: !s.isActive }), s.isActive ? 'Prestation masquée.' : 'Prestation publiée.')}
                    className="p-1.5 rounded-lg border border-border"
                    aria-label={s.isActive ? `Masquer ${s.title}` : `Publier ${s.title}`}
                  >
                    {s.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setServiceForm({
                        id: s.id,
                        title: s.title,
                        subtitle: s.subtitle,
                        category: s.category,
                        description: s.description,
                        benefits: (s.benefits ?? []).join('\n'),
                        features: (s.features ?? []).join('\n'),
                        image: s.image,
                        isActive: s.isActive ?? true,
                      })
                    }
                    className="p-1.5 rounded-lg border border-border"
                    aria-label={`Modifier ${s.title}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === s.id}
                    onClick={() => window.confirm(`Supprimer « ${s.title} » ?`) && void run(s.id, () => deleteLandscapeService(s.id), 'Prestation supprimée.')}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600"
                    aria-label={`Supprimer ${s.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : shownProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-xs text-muted-foreground">
          <Trees className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          Aucune réalisation{q ? ' pour cette recherche' : ' : ajoutez la première pour alimenter la galerie du site'}.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shownProjects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="relative h-40 bg-muted">
                <Image src={p.image} alt={p.title} fill sizes="400px" className="object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {p.featured && <span className="px-2 py-0.5 rounded-full bg-amber-400 text-white text-[11px] font-semibold">À la une</span>}
                  {!p.isPublished && <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px]">Brouillon</span>}
                </div>
              </div>
              <div className="p-4 flex-1 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#c8436e]">{p.categoryLabel}</span>
                <h3 className="font-serif font-bold text-base text-[#173f22]">{p.title}</h3>
                <p className="text-muted-foreground">{p.location}</p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Heart size={12} /> {p.likesCount ?? 0}
                </p>
              </div>
              <div className="flex justify-end gap-1.5 p-3 border-t border-border">
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => void run(p.id, () => updateLandscapeProject(p.id, { featured: !p.featured }), p.featured ? 'Retirée de la une.' : 'Mise à la une.')}
                  className={`p-1.5 rounded-lg border ${p.featured ? 'border-amber-300 text-amber-600' : 'border-border'}`}
                  aria-label={p.featured ? `Retirer ${p.title} de la une` : `Mettre ${p.title} à la une`}
                >
                  <Star size={15} fill={p.featured ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => void run(p.id, () => updateLandscapeProject(p.id, { isPublished: !p.isPublished }), p.isPublished ? 'Réalisation dépubliée.' : 'Réalisation publiée.')}
                  className="p-1.5 rounded-lg border border-border"
                  aria-label={p.isPublished ? `Dépublier ${p.title}` : `Publier ${p.title}`}
                >
                  {p.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProjectForm({
                      id: p.id,
                      title: p.title,
                      category: p.category,
                      location: p.location,
                      description: p.description,
                      tags: p.tags.join(', '),
                      image: p.image,
                      featured: Boolean(p.featured),
                      isPublished: p.isPublished ?? true,
                    })
                  }
                  className="p-1.5 rounded-lg border border-border"
                  aria-label={`Modifier ${p.title}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => window.confirm(`Supprimer « ${p.title} » ?`) && void run(p.id, () => deleteLandscapeProject(p.id), 'Réalisation supprimée.')}
                  className="p-1.5 rounded-lg border border-red-200 text-red-600"
                  aria-label={`Supprimer ${p.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminDrawer
        isOpen={Boolean(serviceForm)}
        onClose={() => setServiceForm(null)}
        title={serviceForm?.id ? 'Modifier la prestation' : 'Nouvelle prestation'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button type="button" onClick={() => setServiceForm(null)} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs">
              Annuler
            </button>
            <button type="submit" form="service-form" disabled={saving || uploading} className="px-6 py-2.5 rounded-xl bg-[#193e23] text-white font-semibold text-xs disabled:opacity-60">
              {saving ? 'Enregistrement…' : serviceForm?.id ? 'Enregistrer les modifications' : 'Créer la prestation'}
            </button>
          </div>
        }
      >
        {serviceForm && (
          <form id="service-form" onSubmit={saveService} className="space-y-3 text-xs" noValidate>
            <label className="block">
              <span className="block font-semibold mb-1">Titre *</span>
              <input value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} placeholder="Ex : Conception & design paysager" className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Accroche</span>
              <input value={serviceForm.subtitle} onChange={(e) => setServiceForm({ ...serviceForm, subtitle: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Catégorie</span>
              <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className={inputClass}>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Description</span>
              <textarea rows={4} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Points forts (un par ligne)</span>
              <textarea rows={3} value={serviceForm.benefits} onChange={(e) => setServiceForm({ ...serviceForm, benefits: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Ce qui est inclus (un par ligne)</span>
              <textarea rows={3} value={serviceForm.features} onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })} className={inputClass} />
            </label>
            <span className="block font-semibold">Photo</span>
            {imagePicker(serviceForm.image, SERVICE_IMAGES, (url) => setServiceForm((f) => (f ? { ...f, image: url } : f)))}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })} /> Publiée sur le site
            </label>
          </form>
        )}
      </AdminDrawer>

      <AdminDrawer
        isOpen={Boolean(projectForm)}
        onClose={() => setProjectForm(null)}
        title={projectForm?.id ? 'Modifier la réalisation' : 'Nouvelle réalisation'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button type="button" onClick={() => setProjectForm(null)} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs">
              Annuler
            </button>
            <button type="submit" form="project-form" disabled={saving || uploading} className="px-6 py-2.5 rounded-xl bg-[#193e23] text-white font-semibold text-xs disabled:opacity-60">
              {saving ? 'Enregistrement…' : projectForm?.id ? 'Enregistrer les modifications' : 'Ajouter au portfolio'}
            </button>
          </div>
        }
      >
        {projectForm && (
          <form id="project-form" onSubmit={saveProject} className="space-y-3 text-xs" noValidate>
            <label className="block">
              <span className="block font-semibold mb-1">Nom de la réalisation *</span>
              <input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Ex : Villa Océane – Saly Portudal" className={inputClass} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block font-semibold mb-1">Catégorie</span>
                <select value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as LandscapeProjectCategory })} className={inputClass}>
                  {LANDSCAPE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block font-semibold mb-1">Lieu</span>
                <input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} placeholder="Ex : Almadies, Dakar" className={inputClass} />
              </label>
            </div>
            <label className="block">
              <span className="block font-semibold mb-1">Description</span>
              <textarea rows={4} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Mots-clés (séparés par des virgules : année, surface, essences…)</span>
              <input value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="2026, 450 m², palmiers" className={inputClass} />
            </label>
            <span className="block font-semibold">Photo principale *</span>
            {imagePicker(projectForm.image, PROJECT_IMAGES, (url) => setProjectForm((f) => (f ? { ...f, image: url } : f)))}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} /> À la une
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={projectForm.isPublished} onChange={(e) => setProjectForm({ ...projectForm, isPublished: e.target.checked })} /> Publiée sur le site
            </label>
          </form>
        )}
      </AdminDrawer>
    </div>
  );
}
