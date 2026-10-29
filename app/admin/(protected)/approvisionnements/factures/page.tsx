'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Eye,
  X,
  Building2,
  Calendar,
  CreditCard,
  Download,
  ShoppingBag,
  ReceiptText,
  FileText,
  Phone,
  Mail,
  User,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { initialSupplierInvoices, initialSuppliers } from '@/lib/admin/mock-data/suppliers';
import { SupplierInvoice, SupplierInvoiceStatus } from '@/lib/admin/mock-data/types';

export default function AdminFacturesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(initialSupplierInvoices);
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierInvoiceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Side Drawer : Ajouter une facture
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(`FAC-2024-00${Math.floor(46 + Math.random() * 50)}`);
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSuppliers[0].id);
  const [newDate, setNewDate] = useState('14 mars 2024');
  const [newDueDate, setNewDueDate] = useState('14 avril 2024');
  const [newAmount, setNewAmount] = useState('125000');
  const [newStatus, setNewStatus] = useState<SupplierInvoiceStatus>('a_payer');
  const [newNotes, setNewNotes] = useState('');

  // Side Drawer : Détails de la facture
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [detailStatus, setDetailStatus] = useState<SupplierInvoiceStatus>('a_payer');
  const [detailNotes, setDetailNotes] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || inv.supplierId === supplierFilter;
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceNumber.trim()) {
      toast.error('Veuillez renseigner un numéro de facture.');
      return;
    }

    const sup = initialSuppliers.find((s) => s.id === selectedSupplierId) || initialSuppliers[0];
    const created: SupplierInvoice = {
      id: newInvoiceNumber.trim(),
      supplierId: sup.id,
      supplierName: sup.name,
      date: newDate,
      dueDate: newDueDate,
      amount: Number(newAmount) || 0,
      status: newStatus,
      notes: newNotes.trim() || 'Facture enregistrée manuellement.',
    };

    setInvoices([created, ...invoices]);
    setIsAddDrawerOpen(false);
    toast.success(`Facture « ${created.id} » créée avec succès pour ${created.supplierName} !`);

    // Reset du formulaire
    setNewInvoiceNumber(`FAC-2024-00${Math.floor(50 + Math.random() * 50)}`);
    setNewAmount('125000');
    setNewNotes('');
  };

  const handleOpenDetails = (inv: SupplierInvoice) => {
    setSelectedInvoice(inv);
    setDetailStatus(inv.status);
    setDetailNotes(inv.notes || '');
  };

  const handleSaveInvoiceDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === selectedInvoice.id
          ? { ...i, status: detailStatus, notes: detailNotes }
          : i
      )
    );
    toast.success(`Facture ${selectedInvoice.id} mise à jour avec succès.`);
    setSelectedInvoice(null);
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;
    setDetailStatus('payee');
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === selectedInvoice.id
          ? { ...i, status: 'payee', notes: detailNotes || 'Facture acquittée intégralement.' }
          : i
      )
    );
    toast.success(`Facture ${selectedInvoice.id} marquée comme payée !`);
    setSelectedInvoice((prev) => (prev ? { ...prev, status: 'payee' } : null));
  };

  const getStatusBadge = (status: SupplierInvoiceStatus) => {
    switch (status) {
      case 'payee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Payée
          </span>
        );
      case 'a_payer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> À payer
          </span>
        );
      case 'en_retard':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle size={12} /> En retard
          </span>
        );
      case 'a_verifier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <AlertTriangle size={12} /> À vérifier
          </span>
        );
      case 'contestee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <XCircle size={12} /> Contestée
          </span>
        );
      default:
        return null;
    }
  };

  // Récupérer le fournisseur lié à la facture sélectionnée
  const currentSupplier = selectedInvoice
    ? initialSuppliers.find((s) => s.id === selectedInvoice.supplierId)
    : null;

  return (
    <div className="space-y-6">
      {/* ── En-tête (Maquette Écran 10) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Factures fournisseurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez vos factures, échéances et règlements fournisseurs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto cursor-pointer"
        >
          <Plus size={18} /> Ajouter une facture
        </button>
      </div>

      {/* ── Sous-navigation du Module Approvisionnements ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <Link
          href="/admin/approvisionnements"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2 shrink-0"
        >
          <ShoppingBag size={16} />
          Bons de commande
        </Link>
        <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#193e23] text-white shadow-xs flex items-center gap-2 shrink-0">
          <Receipt size={16} />
          Factures fournisseurs ({invoices.length})
        </span>
      </div>

      {/* ── Onglets de Statut avec Compteurs Dynamiques ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            statusFilter === 'all' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Toutes ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('a_payer')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            statusFilter === 'a_payer' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          À payer ({invoices.filter((i) => i.status === 'a_payer').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('payee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            statusFilter === 'payee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Payées ({invoices.filter((i) => i.status === 'payee').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('en_retard')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            statusFilter === 'en_retard' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          En retard ({invoices.filter((i) => i.status === 'en_retard').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('contestee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            statusFilter === 'contestee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Contestées ({invoices.filter((i) => i.status === 'contestee').length})
        </button>
      </div>

      {/* ── Recherche & Filtres ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par n° de facture ou nom de fournisseur..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none cursor-pointer"
          >
            <option value="all">Tous les fournisseurs</option>
            {initialSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Liste Mobile (lg:hidden) ── */}
      <div className="lg:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
            Aucune facture ne correspond aux critères sélectionnés.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-[#173f22] block">
                    {inv.id}
                  </span>
                  <span className="font-semibold text-foreground text-xs">
                    {inv.supplierName}
                  </span>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(inv.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Émission</span>
                  <span className="text-foreground font-medium">{inv.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Échéance</span>
                  <span className="text-foreground font-medium">{inv.dueDate}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Montant TTC</span>
                  <span className="font-bold text-[#c8436e] text-sm">
                    {inv.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDetails(inv)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-[#173f22] bg-white hover:bg-muted/60 transition-all cursor-pointer shadow-2xs"
              >
                <Eye size={14} /> Consulter la facture & détails
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Tableau des Factures Desktop (hidden lg:block) ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">N° facture</th>
                <th className="py-3.5 px-5">Fournisseur</th>
                <th className="py-3.5 px-5">Date d&apos;émission</th>
                <th className="py-3.5 px-5">Échéance</th>
                <th className="py-3.5 px-5 text-right">Montant TTC</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Aucune facture ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#173f22]">
                      {inv.id}
                    </td>
                    <td className="py-4 px-5 font-semibold text-foreground">
                      {inv.supplierName}
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">
                      {inv.date}
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-[#c8436e]">
                      {inv.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-[#173f22] bg-white hover:bg-muted/60 hover:border-[#173f22]/30 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye size={13} />
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Side Drawer 1 : Ajouter une facture ── */}
      <AdminDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        size="lg"
        title="Ajouter une facture fournisseur"
        subtitle="Enregistrez une nouvelle facture reçue d'un partenaire"
        icon={<Receipt size={22} />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="add-invoice-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} /> Enregistrer la facture
            </button>
          </>
        }
      >
        <form id="add-invoice-form" onSubmit={handleAddInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                N° de facture <span className="text-[#c8436e]">*</span>
              </label>
              <input
                type="text"
                required
                value={newInvoiceNumber}
                onChange={(e) => setNewInvoiceNumber(e.target.value)}
                placeholder="Ex : FAC-2024-0087"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Fournisseur <span className="text-[#c8436e]">*</span>
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none cursor-pointer"
              >
                {initialSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Date d&apos;émission <span className="text-[#c8436e]">*</span>
              </label>
              <input
                type="text"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="Ex : 14 mars 2024"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Date d&apos;échéance <span className="text-[#c8436e]">*</span>
              </label>
              <input
                type="text"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                placeholder="Ex : 14 avril 2024"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Montant TTC (FCFA) <span className="text-[#c8436e]">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Ex : 125000"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Statut initial
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as SupplierInvoiceStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none cursor-pointer"
              >
                <option value="a_payer">À payer</option>
                <option value="payee">Payée</option>
                <option value="en_retard">En retard</option>
                <option value="a_verifier">À vérifier</option>
                <option value="contestee">Contestée</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Notes ou instructions de règlement
            </label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Précisez les conditions de paiement (ex : virement Wave Pro, chèque, à réception)..."
              className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none resize-none leading-relaxed"
            />
          </div>
        </form>
      </AdminDrawer>

      {/* ── Side Drawer 2 : Détails de la facture ── */}
      {selectedInvoice && (
        <AdminDrawer
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          size="xl"
          title={`Facture ${selectedInvoice.id}`}
          subtitle={`${selectedInvoice.supplierName} · Émise le ${selectedInvoice.date}`}
          icon={<ReceiptText size={22} />}
          headerExtra={getStatusBadge(detailStatus)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="submit"
                form="invoice-details-form"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173f22] hover:bg-[#102d18] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Save size={16} /> Enregistrer les modifications
              </button>
            </>
          }
        >
          <form id="invoice-details-form" onSubmit={handleSaveInvoiceDetails} className="space-y-5 text-xs">
            {/* Bloc Montant & Actions rapides de paiement */}
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Montant total dû :</span>
                <span className="text-xl font-bold text-[#c8436e]">
                  {selectedInvoice.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Date d&apos;émission</span>
                  <span className="font-semibold text-foreground">{selectedInvoice.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Date d&apos;échéance</span>
                  <span className="font-semibold text-foreground">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              {detailStatus !== 'payee' && (
                <button
                  type="button"
                  onClick={handleMarkAsPaid}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Check size={14} /> Marquer la facture comme payée
                </button>
              )}
            </div>

            {/* Bloc Modification du Statut */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Statut de la facture
              </label>
              <select
                value={detailStatus}
                onChange={(e) => setDetailStatus(e.target.value as SupplierInvoiceStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none cursor-pointer"
              >
                <option value="a_payer">À payer (en attente de règlement)</option>
                <option value="payee">Payée (acquittée)</option>
                <option value="en_retard">En retard (échéance dépassée)</option>
                <option value="a_verifier">À vérifier (incohérence / litige mineur)</option>
                <option value="contestee">Contestée (marchandise non reçue ou prix erroné)</option>
              </select>
            </div>

            {/* Bloc Informations Fournisseur */}
            <div className="p-4 rounded-2xl border border-border space-y-2.5">
              <h4 className="text-xs font-bold text-[#173f22] flex items-center gap-1.5">
                <Building2 size={14} className="text-[#c8436e]" />
                Partenaire fournisseur
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">{selectedInvoice.supplierName}</p>
                {currentSupplier && (
                  <>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <User size={13} className="text-muted-foreground shrink-0" />
                      <span>{currentSupplier.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone size={13} className="text-muted-foreground shrink-0" />
                      <span>{currentSupplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Mail size={13} className="text-muted-foreground shrink-0" />
                      <span>{currentSupplier.email}</span>
                    </div>
                  </>
                )}
              </div>

              {selectedInvoice.orderId && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Commande associée :</span>
                  <Link
                    href={`/admin/approvisionnements/reception/${selectedInvoice.orderId}`}
                    className="font-mono font-bold text-forest-green hover:underline flex items-center gap-1"
                  >
                    {selectedInvoice.orderId}
                  </Link>
                </div>
              )}
            </div>

            {/* Bloc Notes & Modalités de règlement */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Notes internes &amp; Références de paiement
              </label>
              <textarea
                rows={3}
                value={detailNotes}
                onChange={(e) => setDetailNotes(e.target.value)}
                placeholder="Ajoutez des détails sur la transaction (ex: Réf virement Wave #WV-98234, chèque remis en main propre...)"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Bloc Téléchargement / Export */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-[#173f22]" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Bordereau comptable</p>
                  <p className="text-[11px] text-muted-foreground">Format PDF certifié Décofleur Plus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.info(`Téléchargement de la facture ${selectedInvoice.id} en cours...`)}
                className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} /> PDF
              </button>
            </div>
          </form>
        </AdminDrawer>
      )}
    </div>
  );
}
