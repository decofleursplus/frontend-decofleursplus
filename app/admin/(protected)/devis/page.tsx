'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  FileSpreadsheet,
  Search,
  Send,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { Button } from '@/components/ui/button';
import { LandscapeQuote, QuoteStatus } from '@/lib/admin/mock-data/types';
import { QUOTE_NEXT_STATUSES, getAdminQuotes, saveAdminQuoteProposal, sendAdminQuoteProposal, updateAdminQuoteStatus } from '@/lib/api/admin/quotes';
import { ApiClientError } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';

export default function AdminDevisPage() {
  const [quotes, setQuotes] = useState<LandscapeQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<LandscapeQuote | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Quote editing/creation within modal
  const [quoteItems, setQuoteItems] = useState<{ description: string; qty: number; unitPrice: number; total: number }[]>([]);

  // Chaîne de promesses : les setState n'ont lieu que dans les callbacks, jamais pendant l'effet.
  const fetchQuotes = useCallback(
    () =>
      getAdminQuotes()
        .then((res) => {
          if (res?.quotes) setQuotes(res.quotes);
        })
        .catch((err: unknown) => {
          toast.error(err instanceof ApiClientError ? err.message : 'Erreur lors du chargement des devis');
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    []
  );

  const loadQuotes = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      return fetchQuotes();
    },
    [fetchQuotes]
  );

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const openQuoteDetail = (quote: LandscapeQuote) => {
    setSelectedQuote(quote);
    setAdminNotes(quote.notes || '');
    setQuoteItems(quote.quoteItems || []);
  };

  const applyUpdated = (updated: LandscapeQuote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setSelectedQuote(updated);
    setQuoteItems(updated.quoteItems || []);
  };

  const updateQuoteStatus = async (newStatus: QuoteStatus) => {
    if (!selectedQuote) return;
    try {
      applyUpdated(await updateAdminQuoteStatus(selectedQuote.id, { status: newStatus }));
      toast.success(`Devis ${selectedQuote.quoteNumber || ''} : statut mis à jour.`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  const addQuoteItem = () => {
    setQuoteItems((prev) => [
      ...prev,
      { description: 'Nouvelle prestation florale ou paysagère', qty: 1, unitPrice: 50000, total: 50000 },
    ]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalQuoteAmount = quoteItems.reduce((acc, item) => acc + item.total, 0);

  const proposalPayload = () => ({
    items: quoteItems
      .filter((it) => it.description.trim().length >= 2)
      .map((it) => ({ description: it.description.trim(), quantity: Math.max(1, Math.round(it.qty)), unitPrice: Math.max(0, it.unitPrice) })),
    adminNotes: adminNotes.trim() || null,
  });

  /** Enregistre les lignes et les notes (sans envoyer). */
  const saveProposalDraft = async () => {
    if (!selectedQuote) return;
    setIsSubmitting(true);
    try {
      applyUpdated(await saveAdminQuoteProposal(selectedQuote.id, proposalPayload()));
      toast.success('Proposition enregistrée.');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Enregistrement impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Enregistre puis envoie la proposition au client (email + espace client). */
  const saveCommercialProposal = async () => {
    if (!selectedQuote) return;
    if (proposalPayload().items.length === 0) {
      toast.error('Ajoutez au moins une ligne chiffrée avant d’envoyer la proposition.');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveAdminQuoteProposal(selectedQuote.id, proposalPayload());
      const sent = await sendAdminQuoteProposal(selectedQuote.id);
      applyUpdated(sent);
      toast.success(
        `Proposition de ${totalQuoteAmount.toLocaleString('fr-FR')} FCFA envoyée${sent.emailSent === false ? ' (email non délivré : le client la verra dans son espace)' : ' au client'}.`,
      );
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Erreur lors de l’envoi de la proposition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesSearch =
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.prestationType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'nouvelle':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Nouvelle</span>;
      case 'en_cours':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">En cours</span>;
      case 'devis_envoye':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Devis envoyé</span>;
      case 'acceptee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Acceptée</span>;
      case 'refusee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Refusée</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Terminée</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Demandes de Devis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez et préparez les propositions commerciales pour les projets de paysagisme et d’aménagement végétal.
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadQuotes(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* ── Filtres & Onglets ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'all'
              ? 'bg-[#193e23] text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Toutes ({quotes.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('nouvelle')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'nouvelle'
              ? 'bg-[#193e23] text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Nouvelles ({quotes.filter((q) => q.status === 'nouvelle').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('en_cours')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'en_cours'
              ? 'bg-[#193e23] text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          En cours ({quotes.filter((q) => q.status === 'en_cours').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('devis_envoye')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'devis_envoye'
              ? 'bg-[#193e23] text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Devis envoyé ({quotes.filter((q) => q.status === 'devis_envoye').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('acceptee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'acceptee'
              ? 'bg-[#193e23] text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Acceptées ({quotes.filter((q) => q.status === 'acceptee').length})
        </button>
      </div>

      {/* ── Recherche ── */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence, client, lieu ou type de prestation..."
          className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* ── Liste Mobile des Devis (lg:hidden) ── */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
            <p>Chargement des demandes de devis...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm space-y-2">
            <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-medium text-gray-700">Aucune demande de devis trouvée.</p>
            <p className="text-xs text-gray-400">
              Les demandes soumises par les clients apparaîtront ici.
            </p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-[#173f22] block">
                    {quote.quoteNumber || quote.id}
                  </span>
                  <span className="font-semibold text-foreground text-sm">
                    {quote.clientName}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {quote.clientPhone}
                  </span>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(quote.status)}
                </div>
              </div>

              <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prestation</span>
                  <span className="font-semibold text-foreground">{quote.prestationType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Espace</span>
                  {quote.spaceType && <span className="text-foreground">{quote.spaceType}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lieu</span>
                  <span className="text-foreground">{quote.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground">Date de demande</span>
                  <span className="text-muted-foreground">{quote.createdAt}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openQuoteDetail(quote)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#edf8ef] hover:bg-[#d8eedb] text-[#193e23] font-semibold text-xs transition-colors shadow-2xs"
              >
                <Eye size={14} /> Traiter la demande de devis
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Tableau des Devis Desktop (hidden lg:block) ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Prestation &amp; Espace</th>
                <th className="py-3.5 px-4">Lieu</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
                      <p className="text-xs">Chargement des demandes de devis...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-gray-300" />
                      <p className="font-medium text-gray-700">Aucune demande de devis enregistrée.</p>
                      <p className="text-xs text-gray-400">
                        Les demandes transmises apparaîtront automatiquement dans ce tableau.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#173f22]">
                      {quote.quoteNumber || quote.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{quote.clientName}</div>
                      <div className="text-xs text-muted-foreground">{quote.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{quote.prestationType}</div>
                      {quote.spaceType && <div className="text-xs text-muted-foreground">{quote.spaceType}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {quote.location}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {quote.createdAt}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(quote.status)}
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

      {/* ── Side Drawer de Traitement de Devis ── */}
      <AdminDrawer
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        size="xl"
        title={
          selectedQuote ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-[#173f22]">
                {selectedQuote.quoteNumber || selectedQuote.id}
              </span>
              {getStatusBadge(selectedQuote.status)}
            </div>
          ) : ''
        }
        subtitle={
          selectedQuote
            ? `Demande reçue le ${selectedQuote.createdAt} de ${selectedQuote.clientName}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
        footer={
          selectedQuote ? (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Changer le statut :</span>
                <select
                  value=""
                  onChange={(e) => e.target.value && void updateQuoteStatus(e.target.value as QuoteStatus)}
                  disabled={(QUOTE_NEXT_STATUSES[selectedQuote.status] ?? []).length === 0}
                  aria-label="Changer le statut du devis"
                  className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">{(QUOTE_NEXT_STATUSES[selectedQuote.status] ?? []).length ? 'Choisir…' : 'Aucun changement possible'}</option>
                  {(QUOTE_NEXT_STATUSES[selectedQuote.status] ?? []).map((st) => (
                    <option key={st} value={st}>
                      {{ nouvelle: 'Nouvelle', en_cours: 'En cours d’étude', devis_envoye: 'Devis envoyé', acceptee: 'Acceptée', refusee: 'Refusée', terminee: 'Terminée' }[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void saveProposalDraft()}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || selectedQuote.status === 'acceptee' || selectedQuote.status === 'refusee'}
                  onClick={() => void saveCommercialProposal()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Envoyer au client
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {selectedQuote && (
          <div className="space-y-6">
            {/* Coordonnées Client & Chantier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Client :</span>
                <span className="font-semibold text-foreground">{selectedQuote.clientName}</span>
                {selectedQuote.company && <span className="block text-xs text-muted-foreground">({selectedQuote.company})</span>}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Contact :</span>
                <span className="block text-foreground">{selectedQuote.clientPhone}</span>
                <span className="block text-foreground">{selectedQuote.clientEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Chantier :</span>
                <span className="font-semibold text-foreground">{selectedQuote.location}</span>
                <span className="block text-xs text-muted-foreground">{selectedQuote.prestationType}{selectedQuote.spaceType ? ` · ${selectedQuote.spaceType}` : ''}</span>
              </div>
            </div>

            {/* Description & Notes */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Description du projet transmise par le client :
              </h4>
              <p className="text-sm text-foreground bg-[#faf8f5] p-4 rounded-xl border border-border leading-relaxed">
                {selectedQuote.description || 'Aucune description spécifique renseignée.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Notes internes / Suivi administrateur :
              </h4>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajouter des notes internes sur les échanges, relances ou contraintes spécifiques..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-border bg-white outline-none focus:ring-1 focus:ring-[#193e23] resize-none"
              />
            </div>

            {/* Photos soumises */}
            {selectedQuote.photos && selectedQuote.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Photographies de l&apos;espace :
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedQuote.photos.map((photo, i) => (
                    <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden border border-border shadow-xs">
                      <Image src={photo} alt="Photo client" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Préparation de la Proposition Commerciale Chiffrée */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#173f22]">
                  Préparation de la proposition commerciale
                </h4>
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#edf8ef] text-[#193e23] hover:bg-[#d8eedb] transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>

              {/* ── Version Mobile : Cartes empilées (sm:hidden) ── */}
              <div className="sm:hidden space-y-3">
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-[#faf8f5] space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Désignation</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuoteItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                          );
                        }}
                        placeholder="Description de la prestation..."
                        className="w-full p-2 rounded-lg border border-border bg-white outline-none text-xs focus:ring-1 focus:ring-forest-green"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Quantité</label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 1;
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, qty: val, total: val * it.unitPrice } : it))
                            );
                          }}
                          className="w-full p-2 rounded-lg border border-border bg-white text-center outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Prix unit. (FCFA)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, unitPrice: val, total: it.qty * val } : it))
                            );
                          }}
                          className="w-full p-2 rounded-lg border border-border bg-white text-right outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-xs font-bold text-[#c8436e]">
                        Total : {item.total.toLocaleString('fr-FR')} FCFA
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173f22]">Total Estimé :</span>
                  <span className="text-sm font-extrabold text-[#c8436e]">
                    {totalQuoteAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* ── Version Desktop : Tableau (hidden sm:block) ── */}
              <div className="hidden sm:block border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#faf8f5] text-muted-foreground">
                    <tr>
                      <th className="p-2.5 text-left">Désignation</th>
                      <th className="p-2.5 text-center w-16">Qté</th>
                      <th className="p-2.5 text-right w-28">Prix unit. (FCFA)</th>
                      <th className="p-2.5 text-right w-28">Total</th>
                      <th className="p-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quoteItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuoteItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                              );
                            }}
                            className="w-full p-1.5 rounded border border-border outline-none text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              setQuoteItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, qty: val, total: val * it.unitPrice } : it))
                              );
                            }}
                            className="w-full p-1.5 rounded border border-border text-center outline-none text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setQuoteItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, unitPrice: val, total: it.qty * val } : it))
                              );
                            }}
                            className="w-full p-1.5 rounded border border-border text-right outline-none text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold text-foreground">
                          {item.total.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeQuoteItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#faf8f5] font-bold text-xs text-[#173f22]">
                    <tr>
                      <td colSpan={3} className="p-3 text-right">Montant Total Estimé :</td>
                      <td className="p-3 text-right text-sm text-[#c8436e] font-extrabold">
                        {totalQuoteAmount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
