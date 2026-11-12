'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Copy,
  Edit3,
  ExternalLink,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  activateAdminEvent,
  createAdminEvent,
  deactivateAdminEvents,
  deleteAdminEvent,
  duplicateAdminEvent,
  listAdminEvents,
  toEventInput,
  updateAdminEvent,
  type EventThemeColor,
  type SeasonalEvent,
} from '@/lib/api/events';
import { EVENT_TEMPLATES } from '@/lib/events-data';
import { EditEventDialog, type EventDraft } from './edit-event-dialog';

const themeLabels: Record<EventThemeColor, { label: string; dot: string; bg: string }> = {
  emerald: { label: 'Vert Atelier', dot: '#193e23', bg: '#edf8ef' },
  ruby: { label: 'Rubis Délicat', dot: '#981b36', bg: '#fdf2f4' },
  gold: { label: 'Or Champagne', dot: '#8f621e', bg: '#fefcf8' },
  purple: { label: 'Lilas Élégant', dot: '#6b21a8', bg: '#faf5ff' },
  rose: { label: 'Rose Poudré', dot: '#be185d', bg: '#fdf2f8' },
  amber: { label: 'Ambre Boisé', dot: '#b45309', bg: '#fffbeb' },
  festive: { label: 'Carmin Fêtes', dot: '#991b1b', bg: '#fef2f2' },
  standard: { label: 'Signature Atelier', dot: '#193e23', bg: '#f4f8f4' },
};

const NEW_EVENT: EventDraft = {
  name: 'Nouvelle célébration',
  categoryLabel: 'Célébration personnalisée',
  datesLabel: 'À définir',
  headline: 'Célébrez ce moment précieux',
  headlineHighlight: 'avec nos créations d’exception',
  subheadline: 'Découvrez notre collection florale dédiée, confectionnée avec soin par nos fleuristes.',
  badge: '',
  ctaText: 'Découvrir la sélection',
  ctaLink: '/boutique',
  whatsappMessage: 'Bonjour, je souhaite commander pour cet événement spécial.',
  themeColor: 'emerald',
  bgImage: '/images/hero.jpg',
  collectionTitle: 'Créations dédiées à l’événement',
  collectionDesc: 'Des pièces artisanales sélectionnées avec amour.',
  discountNote: null,
  featuredProductIds: [],
};

const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/** Marketing › Événements : événements saisonniers enregistrés en base et affichés sur l'accueil. */
export function EventManagementView() {
  const [events, setEvents] = useState<SeasonalEvent[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<EventDraft | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<SeasonalEvent | null>(null);

  const reload = () =>
    listAdminEvents()
      .then((list) => {
        setEvents(list);
        setLoadError(null);
      })
      .catch((err) => setLoadError(errorText(err, 'Impossible de charger les événements.')));

  useEffect(() => {
    listAdminEvents()
      .then(setEvents)
      .catch((err) => setLoadError(errorText(err, 'Impossible de charger les événements.')));
  }, []);

  const activeEvent = events?.find((e) => e.isActive) ?? null;

  /** Exécute une action, recharge la liste et affiche le résultat. */
  async function run(action: () => Promise<unknown>, success: string, failure: string): Promise<boolean> {
    setBusy(true);
    try {
      await action();
      await reload();
      toast.success(success);
      return true;
    } catch (err) {
      toast.error(errorText(err, failure));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const handleToggleEvent = (ev: SeasonalEvent) =>
    ev.isActive
      ? handleResetToStandard()
      : run(() => activateAdminEvent(ev.id), `Événement « ${ev.name} » en ligne sur la vitrine.`, 'Activation impossible.');

  const handleResetToStandard = () =>
    run(() => deactivateAdminEvents(), 'Vitrine remise en mode boutique standard.', 'Opération impossible.');

  const handleSaveEvent = (draft: EventDraft, activateImmediately = false) => {
    const input = toEventInput(draft);
    return run(
      async () => {
        if (draft.id) {
          await updateAdminEvent(draft.id, input);
          if (activateImmediately) await activateAdminEvent(draft.id);
        } else {
          await createAdminEvent(input, activateImmediately);
        }
      },
      activateImmediately ? `Événement « ${draft.name} » enregistré et mis en ligne.` : `Événement « ${draft.name} » enregistré.`,
      'Enregistrement impossible.',
    );
  };

  const handleCreateNewEvent = () => {
    setEditingEvent({ ...NEW_EVENT });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (ev: SeasonalEvent) =>
    run(() => duplicateAdminEvent(ev.id), `Événement « ${ev.name} » dupliqué.`, 'Duplication impossible.');

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    const target = eventToDelete;
    const ok = await run(() => deleteAdminEvent(target.id), `Événement « ${target.name} » supprimé.`, 'Suppression impossible.');
    if (ok) setEventToDelete(null);
  };

  /** Ajoute les événements types de l'atelier qui n'existent pas encore (par nom). */
  const importTemplates = () => {
    const existing = new Set((events ?? []).map((e) => e.name.toLowerCase()));
    const missing = EVENT_TEMPLATES.filter((t) => !existing.has(t.name.toLowerCase()));
    return run(
      async () => {
        for (const template of missing) await createAdminEvent(template);
      },
      `${missing.length} événement(s) type(s) ajouté(s).`,
      'Import interrompu.',
    );
  };

  // Filtrage des événements
  const filteredEvents = useMemo(() => {
    let list = events ?? [];

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'religieux') {
        list = list.filter(
          (ev) =>
            ['tabaski', 'magal', 'gamou', 'korite'].includes(ev.slug) ||
            (ev.categoryLabel || '').toLowerCase().includes('religie')
        );
      } else if (selectedCategory === 'amour') {
        list = list.filter(
          (ev) =>
            ['saint-valentin'].includes(ev.slug) ||
            (ev.categoryLabel || '').toLowerCase().includes('amour') ||
            (ev.categoryLabel || '').toLowerCase().includes('romance')
        );
      } else if (selectedCategory === 'famille') {
        list = list.filter(
          (ev) =>
            ['fete-meres', 'fete-peres', 'femmes-8mars'].includes(ev.slug) ||
            (ev.categoryLabel || '').toLowerCase().includes('famill') ||
            (ev.categoryLabel || '').toLowerCase().includes('hommage')
        );
      } else if (selectedCategory === 'saisonnier') {
        list = list.filter(
          (ev) =>
            ['noel-fetes'].includes(ev.slug) ||
            (ev.categoryLabel || '').toLowerCase().includes('saison') ||
            (ev.categoryLabel || '').toLowerCase().includes('noël') ||
            (ev.categoryLabel || '').toLowerCase().includes('noel')
        );
      }
    }

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ev) =>
          (ev.name || '').toLowerCase().includes(q) ||
          (ev.badge || '').toLowerCase().includes(q) ||
          (ev.headline || '').toLowerCase().includes(q) ||
          (ev.categoryLabel || '').toLowerCase().includes(q) ||
          (ev.datesLabel || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [events, selectedCategory, searchQuery]);

  const isStandardActive = !activeEvent;

  if (loadError && !events) {
    return (
      <div className="max-w-7xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert">
        <p className="mb-3">{loadError}</p>
        <Button variant="outline" size="sm" onClick={reload}>
          Réessayer
        </Button>
      </div>
    );
  }
  if (!events) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement des événements…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── 1. CARTE D'ÉTAT SUPÉRIEURE (Live Vitrine Status) ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isStandardActive ? (
              <Badge
                variant="outline"
                className="bg-zinc-50 text-zinc-600 border-zinc-300 font-medium text-xs gap-1.5 px-2.5 py-1 shrink-0"
              >
                <Store className="h-3.5 w-3.5 text-zinc-500" />
                Vitrine standard
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs gap-1.5 px-2.5 py-1 hover:bg-emerald-50 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                Événement en direct sur le site
              </Badge>
            )}

            <span className="text-xs text-zinc-400 shrink-0">•</span>
            <span className="text-xs text-zinc-500 font-medium whitespace-nowrap shrink-0">
              Ambiance &amp; Célébrations saisonnières
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 font-serif">
              {activeEvent ? activeEvent.name : 'Boutique Standard (Hors Événement)'}
            </h1>

            {activeEvent?.datesLabel && (
              <span className="text-xs font-medium text-zinc-500">
                ({activeEvent.datesLabel})
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl leading-relaxed">
            {activeEvent
              ? `La scénographie « ${activeEvent.name} » est actuellement projetée sur la vitrine client avec son thème chromatique et ses créations dédiées.`
              : 'Aucun événement saisonnier n’est actuellement projeté sur le site. La bannière classique de la maison est diffusée.'}
          </p>
        </div>

        {/* Actions directes du bandeau supérieur */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
          {!isStandardActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToStandard}
              disabled={busy}
              className="text-xs border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 h-9 px-3 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
              <span>Passer en boutique standard</span>
            </Button>
          )}

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-lg transition-colors h-9"
          >
            <span>Voir le site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <Button
            onClick={handleCreateNewEvent}
            className="bg-[#193e23] hover:bg-[#122e1a] text-white text-xs font-semibold h-9 px-3.5 gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nouvel événement</span>
          </Button>
        </div>
      </div>

      {/* ── 2. BARRE D'OUTILS SIMPLIFIÉE : PILULES CATÉGORIES + RECHERCHE ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pilules de catégories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
          {[
            { id: 'all', label: `Toutes (${events.length})` },
            { id: 'religieux', label: 'Fêtes religieuses' },
            { id: 'amour', label: 'Romance & Amour' },
            { id: 'famille', label: 'Fêtes familiales' },
            { id: 'saisonnier', label: 'Saisonnier & Fêtes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Champ de recherche rapide */}
        <div className="relative min-w-[220px] sm:min-w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Rechercher une fête, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. GRILLE DE CARTES ÉPURÉE ET VISUELLE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((ev) => {
          const isLive = ev.isActive;
          const theme = themeLabels[ev.themeColor || 'emerald'] || themeLabels.emerald;

          return (
            <div
              key={ev.id}
              className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isLive
                  ? 'border-[#193e23] ring-2 ring-[#193e23]/15 shadow-md'
                  : 'border-zinc-200 hover:border-zinc-300 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div>
                {/* 1. Visuel d'ambiance 16:9 avec badges superposés */}
                <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                  <Image
                    src={ev.bgImage || '/images/hero.jpg'}
                    alt={ev.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-102"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Badge en haut à gauche */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        En direct sur le site
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 backdrop-blur-xs text-zinc-700 shadow-2xs">
                        {ev.categoryLabel || 'Célébration'}
                      </span>
                    )}
                  </div>

                  {/* Menu à 3 points en haut à droite */}
                  <div className="absolute top-2.5 right-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                        aria-label="Options de la célébration"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingEvent(ev);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                          <span>Modifier</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(ev)}>
                          <Copy className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                          <span>Dupliquer</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setEventToDelete(ev)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2 text-red-500" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Dates affichées en bas de l'image */}
                  {ev.datesLabel && (
                    <div className="absolute bottom-2.5 left-3 text-white flex items-center gap-1.5 text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 text-zinc-200" />
                      <span className="drop-shadow-xs">{ev.datesLabel}</span>
                    </div>
                  )}
                </div>

                {/* 2. Corps de la carte */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-zinc-900 group-hover:text-[#193e23] transition-colors leading-snug">
                      {ev.name}
                    </h3>
                  </div>

                  {/* Accroche textuelle condensée */}
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {ev.headline} {ev.headlineHighlight}
                  </p>

                  {/* Thème couleur & badge de créations */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: theme.dot }}
                      />
                      <span className="text-zinc-600 font-medium text-[11px]">
                        {theme.label}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded">
                      {ev.featuredProductIds.length} création{ev.featuredProductIds.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Pied de carte : Switch On/Off + Bouton Modifier */}
              <div className="px-4 sm:px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isLive}
                    disabled={busy}
                    onCheckedChange={() => handleToggleEvent(ev)}
                    className={isLive ? 'bg-[#193e23]' : 'bg-zinc-200'}
                    aria-label={`Activer ou désactiver ${ev.name}`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isLive ? 'text-[#193e23] font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {isLive ? 'En ligne' : 'Inactif'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEvent(ev);
                    setIsDialogOpen(true);
                  }}
                  className="h-8 px-3 text-xs border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-medium gap-1.5"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Modifier</span>
                </Button>
              </div>
            </div>
          );
        })}

        {/* Aucun événement enregistré : proposer les événements types de l'atelier */}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-zinc-800">Aucun événement enregistré</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Ajoutez d’un clic les événements types (Tabaski, Korité, Saint-Valentin, Fête des Mères, Noël…) puis personnalisez-les, ou créez le vôtre.
            </p>
            <Button size="sm" onClick={importTemplates} disabled={busy} className="mt-2 text-xs bg-[#193e23] hover:bg-[#122e1a] text-white">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Importer les événements types
            </Button>
          </div>
        )}

        {/* État vide si aucun résultat de recherche */}
        {events.length > 0 && filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-zinc-800">
              Aucune célébration ne correspond à vos critères
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Vérifiez l’orthographe de votre recherche ou sélectionnez « Toutes » pour voir l’ensemble des événements.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs border-zinc-200"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* ── 4. MODALE CENTRÉE D'ÉDITION CLAIRE ET AÉRÉE ── */}
      <EditEventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={editingEvent}
        isLive={Boolean(editingEvent?.id && editingEvent.id === activeEvent?.id)}
        onSave={handleSaveEvent}
      />

      {/* ── 5. CONFIRMATION DE SUPPRESSION POUR ÉVÉNEMENT PERSONNALISÉ ── */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900">
              Supprimer la célébration ?
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement « {eventToDelete.name} » ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEventToDelete(null)}
                className="text-xs border-zinc-200"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={confirmDelete}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
