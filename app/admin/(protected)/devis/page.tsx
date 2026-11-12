'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { FileSpreadsheet, Search, Send, Eye, Plus, Trash2, RefreshCw, Loader2, Check, X, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { LandscapeQuote, QuoteStatus } from '@/lib/admin/mock-data/types';
import {
  QUOTE_NEXT_STATUSES,
  getAdminQuotes,
  saveAdminQuoteProposal,
  sendAdminQuoteProposal,
  updateAdminQuoteStatus,
  type AdminQuotesResponse,
} from '@/lib/api/admin/quotes';
import { ApiClientError } from '@/lib/api/client';

type QuoteLine = { description: string; qty: number; unitPrice: number; total: number };

/** Cycle de vie affiché : Reçu → En cours d'étude → Devis envoyé → Accepté (ou Refusé à tout moment). */
const STATUS_META: Record<QuoteStatus, { label: string; badge: string; dot: string }> = {
  nouvelle: { label: 'Reçu / En attente', badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  en_cours: { label: 'En cours d’étude', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  devis_envoye: { label: 'Devis envoyé', badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  acceptee: { label: 'Accepté / Confirmé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  refusee: { label: 'Refusé', badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  terminee: { label: 'Converti en commande', badge: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' },
};

const LIFECYCLE: QuoteStatus[] = ['nouvelle', 'en_cours', 'devis_envoye', 'acceptee'];

const FILTER_TABS: ('all' | QuoteStatus)[] = ['all', 'nouvelle', 'en_cours', 'devis_envoye', 'acceptee', 'refusee', 'terminee'];

/** Libellé du bouton qui fait passer le devis vers ce statut */
const ACTION_LABELS: Partial<Record<QuoteStatus, string>> = {
  en_cours: 'Passer en étude',
  acceptee: 'Marquer comme accepté',
  refusee: 'Marquer comme refusé',
};

const LOCKED: QuoteStatus[] = ['acceptee', 'refusee', 'terminee'];

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiClientError ? err.message : fallback);

function StatusBadge({ status }: { status: QuoteStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/** Frise du cycle de vie : étapes franchies, étape courante, branche « refusé ». */
function StatusStepper({ status }: { status: QuoteStatus }) {
  const refused = status === 'refusee';
  const currentIndex = status === 'terminee' ? LIFECYCLE.length : LIFECYCLE.indexOf(status);
  return (
    <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar" aria-label="Avancement du devis">
      {LIFECYCLE.map((step, i) => {
        const done = !refused && currentIndex > i;
        const current = !refused && currentIndex === i;
        return (
          <li key={step} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold border ${
                done
                  ? 'bg-[#193e23] border-[#193e23] text-white'
                  : current
                    ? 'bg-white border-[#193e23] text-[#193e23] ring-2 ring-[#193e23]/20'
                    : 'bg-white border-gray-200 text-gray-400'
              }`}
              aria-current={current ? 'step' : undefined}
            >
              {done ? <Check size={12} /> : i + 1}
            </span>
            <span className={`text-[11px] sm:text-xs font-medium ${current ? 'text-[#193e23]' : done ? 'text-gray-700' : 'text-gray-400'}`}>
              {STATUS_META[step].label}
            </span>
            {i < LIFECYCLE.length - 1 && <span className={`h-px w-4 sm:w-6 ${done ? 'bg-[#193e23]' : 'bg-gray-200'}`} />}
          </li>
        );
      })}
      {refused && (
        <li className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
            <X size={12} />
          </span>
          <span className="text-xs font-semibold text-red-700">Refusé</span>
        </li>
      )}
    </ol>
  );
}

interface Draft {
  lines: QuoteLine[];
  notes: string;
  eventDate: string;
  location: string;
  budget: string;
  guests: string;
}

const draftFromQuote = (q: LandscapeQuote): Draft => ({
  lines: (q.quoteItems ?? []).map((l) => ({ ...l })),
  notes: q.notes ?? '',
  eventDate: q.desiredDate ?? '',
  location: q.location ?? '',
  budget: q.budgetRange ?? '',
  guests: q.estimatedGuests ? String(q.estimatedGuests) : '',
});

export default function AdminDevisPage() {
  const [quotes, setQuotes] = useState<LandscapeQuote[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<AdminQuotesResponse['counts'] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilterState] = useState<'all' | QuoteStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [selectedQuote, setSelectedQuote] = useState<LandscapeQuote | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState<QuoteStatus | null>(null);
  const [pendingStatus, setPendingStatus] = useState<QuoteStatus | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [justChanged, setJustChanged] = useState<QuoteStatus | null>(null);

  const setStatusFilter = (s: 'all' | QuoteStatus) => {
    setStatusFilterState(s);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useMemo(
    () => ({ status: statusFilter, search: searchTerm || undefined, page, limit: pageSize }),
    [statusFilter, searchTerm, page, pageSize]
  );
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([query, retry]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey && !refreshing;

  const applyList = (res: AdminQuotesResponse) => {
    setQuotes(res.quotes);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setCounts(res.counts);
    setLoadError(null);
  };

  useEffect(() => {
    let cancelled = false;
    getAdminQuotes(query)
      .then((res) => {
        if (!cancelled) applyList(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Erreur lors du chargement des devis'));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestKey]);

  const reloadList = async () => {
    setRefreshing(true);
    try {
      applyList(await getAdminQuotes(query));
    } catch (err) {
      toast.error(errorMessage(err, 'Erreur lors du chargement des devis'));
    } finally {
      setRefreshing(false);
    }
  };

  const allCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  // ---------- Fiche devis ----------
  const locked = selectedQuote ? LOCKED.includes(selectedQuote.status) : true;
  const dirty = useMemo(() => {
    // Un devis clôturé n'est plus modifiable : rien à enregistrer
    if (!selectedQuote || !draft || LOCKED.includes(selectedQuote.status)) return false;
    return JSON.stringify(draft) !== JSON.stringify(draftFromQuote(selectedQuote));
  }, [selectedQuote, draft]);

  const openQuoteDetail = (quote: LandscapeQuote) => {
    setSelectedQuote(quote);
    setDraft(draftFromQuote(quote));
    setJustChanged(null);
  };

  const closeDrawer = (force = false) => {
    if (dirty && !force) {
      setConfirmClose(true);
      return;
    }
    setConfirmClose(false);
    setSelectedQuote(null);
    setDraft(null);
  };

  const applyUpdated = (updated: LandscapeQuote, keepDraft = false) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setSelectedQuote(updated);
    if (!keepDraft) setDraft(draftFromQuote(updated));
  };

  const updateLine = (idx: number, patch: Partial<QuoteLine>) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            lines: d.lines.map((l, i) => {
              if (i !== idx) return l;
              const next = { ...l, ...patch };
              return { ...next, total: next.qty * next.unitPrice };
            }),
          }
        : d
    );

  const addQuoteItem = () =>
    setDraft((d) => (d ? { ...d, lines: [...d.lines, { description: '', qty: 1, unitPrice: 0, total: 0 }] } : d));
  const removeQuoteItem = (index: number) =>
    setDraft((d) => (d ? { ...d, lines: d.lines.filter((_, i) => i !== index) } : d));

  const totalQuoteAmount = (draft?.lines ?? []).reduce((acc, item) => acc + item.total, 0);
  const incompleteLines = (draft?.lines ?? []).filter((l) => l.description.trim().length < 2).length;

  const proposalPayload = () => {
    const d = draft!;
    const guests = Number(d.guests);
    return {
      items: d.lines
        .filter((it) => it.description.trim().length >= 2)
        .map((it) => ({ description: it.description.trim(), quantity: Math.max(1, Math.round(it.qty)), unitPrice: Math.max(0, it.unitPrice) })),
      adminNotes: d.notes.trim() || null,
      eventDate: d.eventDate || null,
      ...(d.location.trim().length >= 2 ? { eventLocation: d.location.trim() } : {}),
      budgetRange: d.budget.trim() || null,
      estimatedGuests: Number.isInteger(guests) && guests > 0 ? guests : null,
    };
  };

  /** Enregistre lignes, notes, date, lieu, budget (sans envoyer) et vérifie la réponse du serveur. */
  const saveProposalDraft = async (): Promise<LandscapeQuote | null> => {
    if (!selectedQuote || !draft) return null;
    if (incompleteLines > 0) {
      toast.error('Chaque ligne doit avoir une désignation (2 caractères minimum).');
      return null;
    }
    setIsSubmitting(true);
    try {
      const saved = await saveAdminQuoteProposal(selectedQuote.id, proposalPayload());
      applyUpdated(saved);
      toast.success('Modifications enregistrées', {
        description: `Total du devis : ${(saved.quoteAmount ?? 0).toLocaleString('fr-FR')} FCFA`,
      });
      return saved;
    } catch (err) {
      toast.error(errorMessage(err, 'Enregistrement impossible.'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Enregistre puis envoie la proposition au client (email + espace client). */
  const saveCommercialProposal = async () => {
    if (!selectedQuote || !draft) return;
    if (proposalPayload().items.length === 0) {
      toast.error('Ajoutez au moins une ligne chiffrée avant d’envoyer la proposition.');
      return;
    }
    if (incompleteLines > 0) {
      toast.error('Chaque ligne doit avoir une désignation (2 caractères minimum).');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveAdminQuoteProposal(selectedQuote.id, proposalPayload());
      const sent = await sendAdminQuoteProposal(selectedQuote.id);
      applyUpdated(sent);
      setJustChanged(sent.status);
      toast.success(
        `Proposition de ${(sent.quoteAmount ?? totalQuoteAmount).toLocaleString('fr-FR')} FCFA envoyée${
          sent.emailSent === false ? ' (email non délivré : le client la verra dans son espace)' : ' au client'
        }.`
      );
      void reloadList();
    } catch (err) {
      toast.error(errorMessage(err, 'Erreur lors de l’envoi de la proposition'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeStatus = async (newStatus: QuoteStatus) => {
    if (!selectedQuote) return;
    setStatusBusy(newStatus);
    try {
      const updated = await updateAdminQuoteStatus(selectedQuote.id, { status: newStatus });
      // Le brouillon en cours n'est pas perdu lors d'un changement de statut
      applyUpdated(updated, true);
      setJustChanged(updated.status);
      toast.success(`Statut mis à jour : ${STATUS_META[updated.status].label}`, {
        description: `Devis ${updated.quoteNumber || ''}`,
      });
      setPendingStatus(null);
      void reloadList();
    } catch (err) {
      toast.error(errorMessage(err, 'Erreur lors de la mise à jour du statut'));
    } finally {
      setStatusBusy(null);
    }
  };

  const nextStatuses = selectedQuote ? QUOTE_NEXT_STATUSES[selectedQuote.status] ?? [] : [];
  const canSend = selectedQuote ? ['nouvelle', 'en_cours', 'devis_envoye'].includes(selectedQuote.status) : false;

  const inputCls = 'w-full p-2 rounded-lg border border-border bg-white outline-none text-xs focus:ring-1 focus:ring-[#193e23] disabled:bg-gray-50 disabled:text-gray-500';

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Demandes de Devis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez chaque demande de sa réception à la réponse du client : étude, proposition chiffrée, acceptation ou refus.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={reloadList}
          disabled={loading || refreshing}
          className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* ── Filtres par statut (compteurs serveur) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border no-scrollbar" role="tablist">
        {FILTER_TABS.map((tab) => {
          const active = statusFilter === tab;
          const count = tab === 'all' ? allCount : counts?.[tab];
          if (tab === 'terminee' && !counts?.terminee) return null;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(tab)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                active ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab !== 'all' && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[tab].dot}`} />}
              {tab === 'all' ? 'Toutes' : STATUS_META[tab].label}
              {count !== null && count !== undefined && <span className="opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ── Recherche ── */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher par référence, client, téléphone ou lieu..."
          className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          aria-label="Rechercher un devis"
        />
        {searchInput && (
          <button type="button" aria-label="Effacer la recherche" onClick={() => setSearchInput('')} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setRetry((n) => n + 1)}>
            Réessayer
          </Button>
        </div>
      )}

      {/* ── Liste Mobile ── */}
      <div className="lg:hidden space-y-3">
        {loading && quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
            <p>Chargement des demandes de devis...</p>
          </div>
        ) : quotes.length === 0 && !loadError ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm space-y-2">
            <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-medium text-gray-700">Aucune demande de devis trouvée.</p>
          </div>
        ) : (
          quotes.map((quote) => (
            <div key={quote.id} className={`bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3 ${loading ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-[#173f22] block">{quote.quoteNumber || quote.id}</span>
                  <span className="font-semibold text-foreground text-sm">{quote.clientName}</span>
                  <span className="text-xs text-muted-foreground block">{quote.clientPhone}</span>
                </div>
                <StatusBadge status={quote.status} />
              </div>
              <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prestation</span>
                  <span className="font-semibold text-foreground">{quote.prestationType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lieu</span>
                  <span className="text-foreground">{quote.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-semibold text-[#c8436e]">{quote.quoteAmount ? `${quote.quoteAmount.toLocaleString('fr-FR')} FCFA` : '—'}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span>Reçue le</span>
                  <span>{quote.createdAt}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openQuoteDetail(quote)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#edf8ef] hover:bg-[#d8eedb] text-[#193e23] font-semibold text-xs transition-colors"
              >
                <Eye size={14} /> Traiter la demande
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Tableau Desktop ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Prestation</th>
                <th className="py-3.5 px-4">Lieu</th>
                <th className="py-3.5 px-4">Reçue le</th>
                <th className="py-3.5 px-4 text-right">Montant</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-border text-xs sm:text-sm ${loading && quotes.length > 0 ? 'opacity-60' : ''}`}>
              {loading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
                      <p className="text-xs">Chargement des demandes de devis...</p>
                    </div>
                  </td>
                </tr>
              ) : quotes.length === 0 && !loadError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-gray-300" />
                      <p className="font-medium text-gray-700">Aucune demande de devis trouvée.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#173f22]">{quote.quoteNumber || quote.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{quote.clientName}</div>
                      <div className="text-xs text-muted-foreground">{quote.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{quote.prestationType}</div>
                      {quote.spaceType && <div className="text-xs text-muted-foreground">{quote.spaceType}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{quote.location}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{quote.createdAt}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#c8436e]">
                      {quote.quoteAmount ? `${quote.quoteAmount.toLocaleString('fr-FR')} F` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openQuoteDetail(quote)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#edf8ef] hover:bg-[#d8eedb] text-[#193e23] font-semibold text-xs transition-colors"
                      >
                        <Eye size={14} /> Traiter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        itemLabel="devis"
        disabled={loading || refreshing}
      />

      {/* ── Fiche de traitement ── */}
      <AdminDrawer
        isOpen={!!selectedQuote}
        onClose={() => closeDrawer()}
        size="xl"
        title={
          selectedQuote ? (
            <span className="font-mono font-bold text-lg text-[#173f22]">{selectedQuote.quoteNumber || selectedQuote.id}</span>
          ) : (
            ''
          )
        }
        headerExtra={selectedQuote ? <StatusBadge status={selectedQuote.status} /> : undefined}
        subtitle={selectedQuote ? `Demande reçue le ${selectedQuote.createdAt} de ${selectedQuote.clientName}` : undefined}
        maxWidthClass="max-w-2xl"
        footer={
          selectedQuote && draft ? (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <span className={`text-xs ${dirty ? 'text-amber-700 font-semibold' : 'text-muted-foreground'}`}>
                {locked ? 'Devis clôturé : lecture seule' : dirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => closeDrawer()}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Fermer
                </button>
                {!locked && (
                  <button
                    type="button"
                    disabled={isSubmitting || !dirty}
                    onClick={() => void saveProposalDraft()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#193e23]/30 text-[#193e23] text-xs font-semibold hover:bg-[#edf8ef] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Enregistrer
                  </button>
                )}
                {canSend && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void saveCommercialProposal()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {selectedQuote.status === 'devis_envoye' ? 'Renvoyer au client' : 'Envoyer au client'}
                  </button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selectedQuote && draft && (
          <div className="space-y-6">
            {/* Cycle de vie + actions de statut */}
            <section className="p-4 rounded-2xl border border-border bg-white space-y-3">
              <StatusStepper status={selectedQuote.status} />
              {justChanged && (
                <p role="status" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <Check size={13} /> Statut enregistré : {STATUS_META[justChanged].label}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {nextStatuses.length === 0 && !canSend ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock size={13} /> Ce devis est clôturé, son statut ne peut plus changer.
                  </span>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground mr-1">Faire avancer :</span>
                    {nextStatuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={statusBusy !== null}
                        onClick={() => (st === 'refusee' || st === 'acceptee' ? setPendingStatus(st) : void changeStatus(st))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${STATUS_META[st].badge} hover:brightness-95`}
                      >
                        {statusBusy === st ? <Loader2 size={12} className="animate-spin" /> : <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[st].dot}`} />}
                        {st === 'en_cours' && selectedQuote.status === 'devis_envoye' ? 'Revenir en étude' : ACTION_LABELS[st] ?? STATUS_META[st].label}
                      </button>
                    ))}
                    {canSend && (
                      <span className="text-[11px] text-muted-foreground">
                        « Devis envoyé » : utilisez le bouton « Envoyer au client » après avoir chiffré la proposition.
                      </span>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Coordonnées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Client :</span>
                <span className="font-semibold text-foreground">{selectedQuote.clientName}</span>
                {selectedQuote.company && <span className="block text-xs text-muted-foreground">({selectedQuote.company})</span>}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Contact :</span>
                <a href={`tel:${selectedQuote.clientPhone}`} className="block text-foreground hover:underline">
                  {selectedQuote.clientPhone}
                </a>
                {selectedQuote.clientEmail && (
                  <a href={`mailto:${selectedQuote.clientEmail}`} className="block text-foreground hover:underline">
                    {selectedQuote.clientEmail}
                  </a>
                )}
              </div>
            </div>

            {/* Informations du projet (éditables) */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projet : {selectedQuote.prestationType}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Date souhaitée</span>
                  <input type="date" disabled={locked} value={draft.eventDate} onChange={(e) => setDraft({ ...draft, eventDate: e.target.value })} className={inputCls} />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Lieu</span>
                  <input type="text" disabled={locked} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={inputCls} />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Budget indiqué</span>
                  <input type="text" disabled={locked} value={draft.budget} placeholder="Non spécifié" onChange={(e) => setDraft({ ...draft, budget: e.target.value })} className={inputCls} />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Nombre d’invités</span>
                  <input type="number" min={1} disabled={locked} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: e.target.value })} className={inputCls} />
                </label>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Description transmise par le client</span>
                <p className="mt-1 text-sm text-foreground bg-[#faf8f5] p-4 rounded-xl border border-border leading-relaxed whitespace-pre-line">
                  {selectedQuote.description || 'Aucune description spécifique renseignée.'}
                </p>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Notes internes (non visibles par le client)</span>
                <textarea
                  value={draft.notes}
                  disabled={locked}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Échanges, relances, contraintes du chantier..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </label>
            </section>

            {selectedQuote.photos && selectedQuote.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Photos jointes</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedQuote.photos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="relative w-28 h-20 rounded-xl overflow-hidden border border-border shadow-xs">
                      <Image src={photo} alt={`Photo jointe ${i + 1}`} fill className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proposition chiffrée */}
            <section className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#173f22]">Proposition chiffrée</h4>
                {!locked && (
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#edf8ef] text-[#193e23] hover:bg-[#d8eedb] transition-colors"
                  >
                    <Plus size={14} /> Ajouter une ligne
                  </button>
                )}
              </div>

              {draft.lines.length === 0 && (
                <p className="text-xs text-muted-foreground bg-[#faf8f5] border border-dashed border-border rounded-xl p-4 text-center">
                  Aucune ligne chiffrée pour l’instant.
                </p>
              )}

              <div className="space-y-2">
                {draft.lines.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end p-2.5 rounded-xl border border-border bg-[#faf8f5]">
                    <label className="col-span-12 sm:col-span-6 space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">Désignation</span>
                      <input
                        type="text"
                        disabled={locked}
                        value={item.description}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                        placeholder="Ex. Arche florale de cérémonie"
                        className={`${inputCls} ${item.description.trim().length < 2 && !locked ? 'border-amber-300' : ''}`}
                      />
                    </label>
                    <label className="col-span-3 sm:col-span-2 space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">Qté</span>
                      <input
                        type="number"
                        min={1}
                        disabled={locked}
                        value={item.qty}
                        onChange={(e) => updateLine(idx, { qty: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                        className={`${inputCls} text-center`}
                      />
                    </label>
                    <label className="col-span-5 sm:col-span-3 space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">Prix unit. (FCFA)</span>
                      <input
                        type="number"
                        min={0}
                        disabled={locked}
                        value={item.unitPrice}
                        onChange={(e) => updateLine(idx, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                        className={`${inputCls} text-right`}
                      />
                    </label>
                    <div className="col-span-4 sm:col-span-1 flex items-center justify-end gap-1 pb-1.5">
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => removeQuoteItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                          aria-label={`Supprimer la ligne ${idx + 1}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="col-span-12 text-right text-[11px] font-semibold text-gray-600">
                      Sous-total : {item.total.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-border flex items-center justify-between">
                <span className="text-xs font-bold text-[#173f22]">Montant total</span>
                <span className="text-base font-extrabold text-[#c8436e]">{totalQuoteAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {selectedQuote.quoteAmount !== undefined && selectedQuote.quoteAmount !== totalQuoteAmount && !locked && (
                <p className="text-[11px] text-amber-700">Montant enregistré : {selectedQuote.quoteAmount.toLocaleString('fr-FR')} FCFA — enregistrez pour le mettre à jour.</p>
              )}
            </section>
          </div>
        )}
      </AdminDrawer>

      {/* Confirmation d'un statut final */}
      <Dialog open={pendingStatus !== null} onOpenChange={(open) => !open && statusBusy === null && setPendingStatus(null)}>
        <DialogContent overlayClassName="z-[10000]" className="z-[10001] sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{pendingStatus === 'refusee' ? 'Marquer ce devis comme refusé ?' : 'Confirmer l’acceptation du devis ?'}</DialogTitle>
            <DialogDescription>
              {pendingStatus === 'refusee'
                ? 'Le devis sera clôturé : il ne pourra plus être modifié ni renvoyé.'
                : 'Le devis sera clôturé comme accepté par le client : ses lignes et son montant ne pourront plus être modifiés.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={statusBusy !== null} onClick={() => setPendingStatus(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              disabled={statusBusy !== null}
              onClick={() => pendingStatus && void changeStatus(pendingStatus)}
              className={pendingStatus === 'refusee' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'}
            >
              {statusBusy !== null && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifications non enregistrées */}
      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent overlayClassName="z-[10000]" className="z-[10001] sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Modifications non enregistrées</DialogTitle>
            <DialogDescription>Vous avez modifié ce devis sans l’enregistrer. Que voulez-vous faire ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => closeDrawer(true)}>
              Fermer sans enregistrer
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                const saved = await saveProposalDraft();
                if (saved) closeDrawer(true);
              }}
              className="bg-[#193e23] hover:bg-[#12301a] text-white"
            >
              {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Enregistrer et fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
