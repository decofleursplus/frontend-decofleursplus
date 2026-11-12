'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Search, Loader2, RefreshCw, Archive, MailOpen, Reply, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  getContactMessages,
  getNewsletterSubscribers,
  setContactMessageStatus,
  type ContactMessage,
  type ContactMessageStatus,
  type NewsletterSubscriber,
} from '@/lib/api/contact';

const STATUS_LABELS: Record<ContactMessageStatus, string> = { NEW: 'Non lus', READ: 'Lus', ARCHIVED: 'Archivés' };
const dateTime = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Messages du formulaire de contact et inscrits à la lettre d'information. */
export default function AdminMessagesPage() {
  const [tab, setTab] = useState<'messages' | 'newsletter'>('messages');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title text-[#1e2a1f] font-bold">Messages & newsletter</h1>
        <p className="admin-page-subtitle text-gray-500 mt-1">Demandes reçues via le formulaire de contact et liste des inscrits à la lettre d’information.</p>
      </div>
      <div className="flex gap-2">
        {(['messages', 'newsletter'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ${tab === t ? 'bg-[#24582d] text-white border-[#24582d]' : 'bg-white border-[#e7e4dd]'}`}
          >
            {t === 'messages' ? <Mail className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            {t === 'messages' ? 'Messages de contact' : 'Inscrits newsletter'}
          </button>
        ))}
      </div>
      {tab === 'messages' ? <MessagesTab /> : <NewsletterTab />}
    </div>
  );
}

function MessagesTab() {
  const [status, setStatus] = useState<ContactMessageStatus | 'all'>('NEW');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof getContactMessages>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getContactMessages({ status: status === 'all' ? undefined : status, search })
        .then((res) => {
          setData(res);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Messages indisponibles.')),
    [status, search],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const changeStatus = async (m: ContactMessage, next: ContactMessageStatus) => {
    try {
      await setContactMessageStatus(m.id, next);
      toast.success(next === 'ARCHIVED' ? 'Message archivé.' : next === 'READ' ? 'Message marqué comme lu.' : 'Message marqué comme non lu.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    }
  };

  const open = (m: ContactMessage) => {
    setOpenId(openId === m.id ? null : m.id);
    if (m.status === 'NEW') void changeStatus(m, 'READ');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {(['NEW', 'READ', 'ARCHIVED', 'all'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border shrink-0 ${status === s ? 'bg-[#c1647a] text-white border-[#c1647a]' : 'bg-white border-[#e7e4dd]'}`}
            >
              {s === 'all' ? 'Tous' : STATUS_LABELS[s]} ({data ? (s === 'all' ? data.counts.all : data.counts[s]) : 0})
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 flex-1 px-3 rounded-xl border border-[#e7e4dd] bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Nom, email, objet, contenu…" aria-label="Rechercher un message" className="w-full h-10 text-xs outline-none" />
        </label>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs font-semibold">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </button>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}
      {data === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">Aucun message{status !== 'all' ? ` ${STATUS_LABELS[status].toLowerCase()}` : ''}.</div>
      ) : (
        <ul className="space-y-2">
          {(data?.items ?? []).map((m) => (
            <li key={m.id} className={`bg-white rounded-2xl border p-4 text-xs ${m.status === 'NEW' ? 'border-[#c1647a]/40' : 'border-[#e7e4dd]'}`}>
              <button type="button" onClick={() => open(m)} className="w-full text-left flex flex-wrap items-start justify-between gap-2" aria-expanded={openId === m.id}>
                <span>
                  <strong className="text-sm">{m.name}</strong> <span className="text-gray-500">· {m.email}</span>
                  <span className="block font-semibold mt-0.5">{m.subject || 'Sans objet'}</span>
                  {openId !== m.id && <span className="block text-gray-500 line-clamp-1">{m.message}</span>}
                </span>
                <span className="text-gray-400 whitespace-nowrap">
                  {m.status === 'NEW' && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#c1647a]" aria-label="Non lu" />}
                  {dateTime(m.createdAt)}
                </span>
              </button>
              {openId === m.id && (
                <div className="mt-3 space-y-3 border-t border-[#f0ede6] pt-3">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">{m.message}</p>
                  {m.phone && <p>Téléphone : <a href={`tel:${m.phone}`} className="underline">{m.phone}</a></p>}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Votre message'}`)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#24582d] text-white font-semibold"
                    >
                      <Reply className="h-3.5 w-3.5" /> Répondre
                    </a>
                    {m.status !== 'NEW' && (
                      <button type="button" onClick={() => void changeStatus(m, 'NEW')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e7e4dd] font-semibold">
                        <MailOpen className="h-3.5 w-3.5" /> Marquer non lu
                      </button>
                    )}
                    {m.status !== 'ARCHIVED' && (
                      <button type="button" onClick={() => void changeStatus(m, 'ARCHIVED')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e7e4dd] font-semibold">
                        <Archive className="h-3.5 w-3.5" /> Archiver
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewsletterTab() {
  const [active, setActive] = useState<'true' | 'false' | 'all'>('true');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof getNewsletterSubscribers>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getNewsletterSubscribers({ search, active: active === 'all' ? undefined : active === 'true', limit: 100 })
        .then((res) => {
          setData(res);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Inscrits indisponibles.')),
    [search, active],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const exportCsv = (rows: NewsletterSubscriber[]) => {
    const csv = ['email;inscrit_le;source;actif', ...rows.map((r) => `${r.email};${r.createdAt.slice(0, 10)};${r.source};${r.isActive ? 'oui' : 'non'}`)].join('\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={active} onChange={(e) => setActive(e.target.value as typeof active)} aria-label="Filtrer les inscrits" className="h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs">
          <option value="true">Inscrits actifs</option>
          <option value="false">Désinscrits</option>
          <option value="all">Tous</option>
        </select>
        <label className="flex items-center gap-2 flex-1 px-3 rounded-xl border border-[#e7e4dd] bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Rechercher un email…" aria-label="Rechercher un inscrit" className="w-full h-10 text-xs outline-none" />
        </label>
        <button
          type="button"
          disabled={!data || data.items.length === 0}
          onClick={() => data && exportCsv(data.items)}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#24582d] text-white text-xs font-semibold disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" /> Exporter (CSV)
        </button>
      </div>
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}
      {data && <p className="text-xs text-gray-500">{data.activeCount} inscrit(s) actif(s) au total · {data.total} résultat(s) affiché(s)</p>}
      {data === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">Aucun inscrit pour ces critères.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[520px]">
            <thead className="bg-[#faf8f4] border-b border-[#e7e4dd] font-bold">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Inscrit le</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {(data?.items ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-semibold">{s.email}</td>
                  <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">{s.source}</td>
                  <td className="px-4 py-3">{s.isActive ? 'Actif' : `Désinscrit${s.unsubscribedAt ? ` le ${new Date(s.unsubscribedAt).toLocaleDateString('fr-FR')}` : ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
