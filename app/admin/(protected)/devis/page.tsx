'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  FileCheck,
  X,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { initialQuotes } from '@/lib/admin/mock-data/quotes';
import { LandscapeQuote, QuoteStatus } from '@/lib/admin/mock-data/types';

export default function AdminDevisPage() {
  const [quotes, setQuotes] = useState<LandscapeQuote[]>(initialQuotes);
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<LandscapeQuote | null>(null);

  // Quote editing/creation within modal
  const [quoteItems, setQuoteItems] = useState<{ description: string; qty: number; unitPrice: number; total: number }[]>([]);

  const openQuoteDetail = (quote: LandscapeQuote) => {
    setSelectedQuote(quote);
    setQuoteItems(quote.quoteItems || []);
  };

  const updateQuoteStatus = (newStatus: QuoteStatus) => {
    if (!selectedQuote) return;
    const updated = { ...selectedQuote, status: newStatus };
    setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
    setSelectedQuote(updated);
    toast.success(`Statut du devis ${selectedQuote.id} mis à jour : ${newStatus}`);
  };

  const addQuoteItem = () => {
    setQuoteItems((prev) => [
      ...prev,
      { description: 'Nouvelle prestation paysagère', qty: 1, unitPrice: 50000, total: 50000 },
    ]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalQuoteAmount = quoteItems.reduce((acc, item) => acc + item.total, 0);

  const saveCommercialProposal = () => {
    if (!selectedQuote) return;
    const updated: LandscapeQuote = {
      ...selectedQuote,
      quoteAmount: totalQuoteAmount,
      quoteItems: quoteItems,
      status: 'devis_envoye',
    };
    setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
    setSelectedQuote(updated);
    toast.success(
      `Proposition commerciale chiffrée (${totalQuoteAmount.toLocaleString('fr-FR')} FCFA) enregistrée et statut passé à "Devis envoyé" !`
    );
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

      {/* ── Tableau des Devis ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
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
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#173f22]">
                    {quote.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{quote.clientName}</div>
                    <div className="text-xs text-muted-foreground">{quote.clientPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-foreground">{quote.prestationType}</div>
                    <div className="text-xs text-muted-foreground">{quote.spaceType} ({quote.surfaceArea} m²)</div>
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
              ))}
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
              <span className="font-mono font-bold text-lg text-[#173f22]">{selectedQuote.id}</span>
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
                  value={selectedQuote.status}
                  onChange={(e) => updateQuoteStatus(e.target.value as QuoteStatus)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium outline-none cursor-pointer"
                >
                  <option value="nouvelle">Nouvelle</option>
                  <option value="en_cours">En cours</option>
                  <option value="devis_envoye">Devis envoyé</option>
                  <option value="acceptee">Acceptée</option>
                  <option value="refusee">Refusée</option>
                  <option value="terminee">Terminée</option>
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
                  onClick={saveCommercialProposal}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Send size={14} /> Enregistrer la proposition
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
                <span className="block text-xs text-muted-foreground">{selectedQuote.prestationType} · {selectedQuote.surfaceArea} m²</span>
              </div>
            </div>

            {/* Description & Photos */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Description du projet transmise par le client :
              </h4>
              <p className="text-sm text-foreground bg-[#faf8f5] p-4 rounded-xl border border-border leading-relaxed">
                {selectedQuote.description}
              </p>
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

              <div className="border border-border rounded-xl overflow-hidden">
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
