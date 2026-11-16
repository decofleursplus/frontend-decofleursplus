'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Loader2, Mail, Megaphone, RefreshCw, Search, Send, Smartphone, X } from 'lucide-react';
import { useAdminCan } from '@/components/admin/admin-sidebar-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getAnnouncementBar, updateAnnouncementBar } from '@/lib/api/admin/settings';
import {
  getNotificationBroadcasts,
  sendBroadcastNotification,
  type AnnouncementChannel,
  type NotificationBroadcast,
} from '@/lib/api/admin/notifications';
import { getAdminCustomers } from '@/lib/api/admin/customers';
import { ApiClientError } from '@/lib/api/client';
import type { AnnouncementBar } from '@/lib/api/settings';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';

const SEGMENTS = [
  { value: 'PARTICULIER', label: 'Particuliers' },
  { value: 'ENTREPRISE', label: 'Entreprises' },
  { value: 'VIP', label: 'Clients VIP' },
];
const MESSAGE_MAX = 160;

const errorText = (err: unknown, fallback: string) => {
  if (err instanceof ApiClientError) return err.details?.[0]?.message || err.message;
  return err instanceof Error ? err.message : fallback;
};
const dateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const targetLabel = (b: NotificationBroadcast) =>
  b.targetType === 'ALL'
    ? 'Tous les clients'
    : b.targetType === 'SEGMENT'
      ? SEGMENTS.find((s) => s.value === b.targetSegment?.toUpperCase())?.label ?? `Segment ${b.targetSegment ?? ''}`
      : `${b.targetCustomers.length} client(s) choisi(s)`;

/** Annonces aux clients : bandeau du site, envoi d'une annonce (espace client et email) et historique. */
export default function AdminAnnouncementsPage() {
  const can = useAdminCan();
  const canWrite = can('annonces', 'write');
  const canPickClients = can('clients', 'read');
  const [historyKey, setHistoryKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title text-2xl font-bold text-[#1e2a1f]">Annonces</h1>
        <p className="admin-page-subtitle text-sm text-gray-500">
          Le bandeau affiché en haut du site, et les annonces envoyées aux clients dans leur espace et par email.
        </p>
      </div>
      <AnnouncementBarSection canWrite={canWrite} />
      {canWrite && <SendAnnouncementSection canPickClients={canPickClients} onSent={() => setHistoryKey((k) => k + 1)} />}
      <HistorySection key={historyKey} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bandeau du site
// ---------------------------------------------------------------------------

function AnnouncementBarSection({ canWrite }: { canWrite: boolean }) {
  const [bar, setBar] = useState<AnnouncementBar | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAnnouncementBar()
      .then((res) => !cancelled && setBar(res))
      .catch((err) => !cancelled && setError(errorText(err, 'Bandeau indisponible.')));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[#e7e4dd] bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-[#c1647a]" />
        <h2 className="text-sm font-bold text-[#1e2a1f]">Bandeau du site</h2>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-700">{error}</p>
      ) : !bar ? (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </p>
      ) : (
        <AnnouncementBarForm initial={bar} canWrite={canWrite} onSaved={setBar} />
      )}
    </section>
  );
}

function AnnouncementBarForm({
  initial,
  canWrite,
  onSaved,
}: {
  initial: AnnouncementBar;
  canWrite: boolean;
  onSaved: (bar: AnnouncementBar) => void;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [message, setMessage] = useState(initial.message);
  const [linkUrl, setLinkUrl] = useState(initial.linkUrl);
  const [linkLabel, setLinkLabel] = useState(initial.linkLabel);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (enabled && !message.trim()) return void toast.error('Saisissez le message du bandeau.');
    setSaving(true);
    try {
      const saved = await updateAnnouncementBar({ enabled, message: message.trim(), linkUrl: linkUrl.trim(), linkLabel: linkLabel.trim() });
      onSaved(saved);
      setLinkLabel(saved.linkLabel);
      toast.success(saved.enabled ? 'Bandeau publié sur le site.' : 'Bandeau masqué : le site affiche ses informations habituelles.');
    } catch (err) {
      toast.error(errorText(err, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <label className="flex items-center justify-between gap-3 rounded-xl bg-[#faf8f4] p-3">
        <span>
          <span className="block font-semibold text-gray-800">Afficher le bandeau</span>
          <span className="text-gray-500">Remplace les informations habituelles (lieu, livraison, paiement) en haut de toutes les pages.</span>
        </span>
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={!canWrite} aria-label="Afficher le bandeau" />
      </label>
      <label className="block space-y-1">
        <span className="font-semibold text-gray-700">Message</span>
        <Input
          value={message}
          maxLength={MESSAGE_MAX}
          disabled={!canWrite}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex : Fête des mères : commandez avant samedi midi !"
          className="h-9 bg-white text-xs"
        />
        <span className="block text-right text-[11px] text-gray-400">
          {message.length}/{MESSAGE_MAX}
        </span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-semibold text-gray-700">Lien (facultatif)</span>
          <Input
            value={linkUrl}
            disabled={!canWrite}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/boutique ou https://…"
            className="h-9 bg-white text-xs"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-gray-700">Texte du lien</span>
          <Input
            value={linkLabel}
            maxLength={40}
            disabled={!canWrite || !linkUrl.trim()}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="En savoir plus"
            className="h-9 bg-white text-xs"
          />
        </label>
      </div>
      {message.trim() && (
        <div>
          <span className="mb-1 block font-semibold text-gray-700">Aperçu</span>
          <div className="rounded-lg bg-[#193e23] px-4 py-2 text-center text-[13px] text-white">
            {message.trim()}
            {linkUrl.trim() && <span className="ml-2 font-semibold underline">{linkLabel.trim() || 'En savoir plus'}</span>}
          </div>
        </div>
      )}
      {canWrite && (
        <div className="flex justify-end">
          <Button type="button" disabled={saving} onClick={() => void save()} className="h-9 bg-[#24582d] text-xs font-semibold text-white hover:bg-[#1c4423]">
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Enregistrer le bandeau
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Envoi d'une annonce
// ---------------------------------------------------------------------------

function SendAnnouncementSection({ canPickClients, onSent }: { canPickClients: boolean; onSent: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'SEGMENT' | 'INDIVIDUAL'>('ALL');
  const [segment, setSegment] = useState('VIP');
  const [selected, setSelected] = useState<AdminCustomer[]>([]);
  const [channels, setChannels] = useState<AnnouncementChannel[]>(['IN_APP']);
  const [sending, setSending] = useState(false);

  const toggleChannel = (c: AnnouncementChannel) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const audience =
    targetType === 'ALL'
      ? 'tous les clients'
      : targetType === 'SEGMENT'
        ? (SEGMENTS.find((s) => s.value === segment)?.label ?? segment).toLowerCase()
        : `${selected.length} client(s) choisi(s)`;

  const send = async () => {
    if (!title.trim() || !message.trim()) return void toast.error('Saisissez le titre et le message.');
    if (channels.length === 0) return void toast.error('Choisissez au moins un canal.');
    if (targetType === 'INDIVIDUAL' && selected.length === 0) return void toast.error('Ajoutez au moins un client.');
    if (!window.confirm(`Envoyer l’annonce « ${title.trim()} » à ${audience} ? L’envoi est immédiat.`)) return;
    setSending(true);
    try {
      const res = await sendBroadcastNotification({
        title: title.trim(),
        message: message.trim(),
        target:
          targetType === 'ALL'
            ? { type: 'ALL' }
            : targetType === 'SEGMENT'
              ? { type: 'SEGMENT', segment }
              : { type: 'INDIVIDUAL', customerIds: selected.map((c) => c.id) },
        channels,
      });
      toast.success(
        `Annonce envoyée à ${res.recipientCount} client(s)${channels.includes('EMAIL') ? ` · ${res.emailCount} email(s) envoyé(s)` : ''}.`,
      );
      setTitle('');
      setMessage('');
      setSelected([]);
      onSent();
    } catch (err) {
      toast.error(errorText(err, 'Envoi impossible.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#e7e4dd] bg-white p-5 space-y-4 text-xs">
      <div className="flex items-center gap-2">
        <BellRing className="h-5 w-5 text-[#c1647a]" />
        <h2 className="text-sm font-bold text-[#1e2a1f]">Nouvelle annonce aux clients</h2>
      </div>
      <label className="block space-y-1">
        <span className="font-semibold text-gray-700">Titre</span>
        <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Nouvelle collection de printemps" className="h-9 bg-white text-xs" />
      </label>
      <label className="block space-y-1">
        <span className="font-semibold text-gray-700">Message</span>
        <textarea
          value={message}
          maxLength={2000}
          rows={4}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre annonce, telle que les clients la liront."
          className="w-full rounded-md border border-[#e7e4dd] bg-white px-3 py-2 text-xs"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="font-semibold text-gray-700">Destinataires</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['ALL', 'Tous les clients'],
              ['SEGMENT', 'Un segment'],
              ...(canPickClients ? [['INDIVIDUAL', 'Clients choisis']] : []),
            ] as [typeof targetType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTargetType(value)}
              className={`rounded-lg border px-3 py-1.5 font-semibold ${
                targetType === value ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d]' : 'border-[#e7e4dd] text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {targetType === 'SEGMENT' && (
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            aria-label="Segment de clients"
            className="h-9 rounded-md border border-[#e7e4dd] bg-white px-2"
          >
            {SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        {targetType === 'INDIVIDUAL' && <CustomerPicker selected={selected} onChange={setSelected} />}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-semibold text-gray-700">Canaux</legend>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={channels.includes('IN_APP')} onChange={() => toggleChannel('IN_APP')} className="mt-0.5" />
          <span>
            <Smartphone className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
            Dans l’espace client (cloche des notifications et « Mes notifications »)
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={channels.includes('EMAIL')} onChange={() => toggleChannel('EMAIL')} className="mt-0.5" />
          <span>
            <Mail className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
            Par email, aux clients qui acceptent les annonces de la boutique (réglable dans leur espace)
          </span>
        </label>
      </fieldset>

      <div className="flex justify-end">
        <Button type="button" disabled={sending} onClick={() => void send()} className="h-9 bg-[#c1647a] text-xs font-semibold text-white hover:bg-[#a85266]">
          {sending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
          Envoyer l’annonce
        </Button>
      </div>
    </section>
  );
}

function CustomerPicker({ selected, onChange }: { selected: AdminCustomer[]; onChange: (list: AdminCustomer[]) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ query: string; items: AdminCustomer[] } | null>(null);
  const term = query.trim();
  const searching = term.length >= 2 && results?.query !== term;

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      getAdminCustomers({ search: term, limit: 8 })
        .then((res) => !cancelled && setResults({ query: term, items: res.customers }))
        .catch(() => !cancelled && setResults({ query: term, items: [] }));
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term]);

  const shown = term.length >= 2 && results?.query === term ? results.items.filter((c) => !selected.some((s) => s.id === c.id)) : [];

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-[#faf8f4] px-2.5 py-1 font-medium text-gray-700">
              {c.name}
              <button type="button" aria-label={`Retirer ${c.name}`} onClick={() => onChange(selected.filter((s) => s.id !== c.id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 rounded-md border border-[#e7e4dd] bg-white px-2">
        <Search className="h-3.5 w-3.5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client (nom, email, téléphone)"
          aria-label="Rechercher un client"
          className="h-9 w-full bg-transparent text-xs outline-none"
        />
        {searching && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
      </label>
      {shown.length > 0 && (
        <ul className="divide-y divide-[#f0ede6] rounded-md border border-[#e7e4dd]">
          {shown.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...selected, c]);
                  setQuery('');
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#faf8f4]"
              >
                <span className="font-medium text-gray-800">{c.name}</span>
                <span className="text-gray-500">{c.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Historique
// ---------------------------------------------------------------------------

function HistorySection() {
  const [items, setItems] = useState<NotificationBroadcast[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getNotificationBroadcasts({ page: 1, limit: 30 })
        .then((res) => {
          setItems(res.broadcasts);
          setError(null);
        })
        .catch((err) => setError(errorText(err, 'Historique indisponible.'))),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="rounded-2xl border border-[#e7e4dd] bg-white p-5 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#1e2a1f]">Annonces envoyées</h2>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-red-700">{error}</p>
      ) : !items ? (
        <p className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Aucune annonce envoyée pour le moment.</p>
      ) : (
        <ul className="divide-y divide-[#f0ede6]">
          {items.map((b) => (
            <li key={b.id} className="space-y-1 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-gray-900">{b.title}</strong>
                <span className="text-gray-400">{dateTime(b.sentAt ?? b.createdAt)}</span>
              </div>
              <p className="line-clamp-2 text-gray-600">{b.message}</p>
              <p className="text-[11px] text-gray-500">
                {targetLabel(b)} · {b.recipientCount} client(s)
                {b.channels.includes('IN_APP') && ' · espace client'}
                {b.channels.includes('EMAIL') && ` · ${b.emailCount} email(s)`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
