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
} from 'lucide-react';
import { initialSupplierInvoices, initialSuppliers } from '@/lib/admin/mock-data/suppliers';
import { SupplierInvoice, SupplierInvoiceStatus } from '@/lib/admin/mock-data/types';

export default function AdminFacturesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(initialSupplierInvoices);
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierInvoiceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Invoice form state
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(`FAC-2024-00${Math.floor(46 + Math.random() * 50)}`);
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSuppliers[0].id);
  const [newDate, setNewDate] = useState('14 mars 2024');
  const [newDueDate, setNewDueDate] = useState('14 avril 2024');
  const [newAmount, setNewAmount] = useState('125000');
  const [newStatus, setNewStatus] = useState<SupplierInvoiceStatus>('a_payer');

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
    const sup = initialSuppliers.find((s) => s.id === selectedSupplierId) || initialSuppliers[0];
    const created: SupplierInvoice = {
      id: newInvoiceNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      date: newDate,
      dueDate: newDueDate,
      amount: Number(newAmount) || 0,
      status: newStatus,
      notes: 'Facture enregistrée manuellement.',
    };

    setInvoices([created, ...invoices]);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: SupplierInvoiceStatus) => {
    switch (status) {
      case 'payee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Payée</span>;
      case 'a_payer':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">À payer</span>;
      case 'en_retard':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">En retard</span>;
      case 'a_verifier':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">À vérifier</span>;
      case 'contestee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Contestée</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── En-tête (Maquette Écran 10) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Factures fournisseurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez vos factures et vos paiements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-fit"
        >
          <Plus size={18} /> Ajouter une facture
        </button>
      </div>

      {/* ── Onglets de Statut (Maquette Écran 10) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'all' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Toutes (18)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('a_payer')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'a_payer' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          À payer (5)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('payee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'payee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Payées (10)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('en_retard')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'en_retard' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          En retard (2)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('contestee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'contestee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Contestées (1)
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
            placeholder="Rechercher une facture..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none"
          >
            <option value="all">Tous les fournisseurs</option>
            {initialSuppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tableau des Factures (Maquette Écran 10) ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">N° facture</th>
                <th className="py-3.5 px-5">Fournisseur</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-right">Montant</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {filteredInvoices.map((inv) => (
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
                  <td className="py-4 px-5 text-right font-bold text-[#c8436e]">
                    {inv.amount.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-4 px-5">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Détails facture ${inv.id}`)}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modale "+ Ajouter une facture" ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-border max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between bg-[#faf8f5]">
              <h3 className="font-serif font-bold text-lg text-[#173f22]">
                Ajouter une facture fournisseur
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">N° facture</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Fournisseur</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                  >
                    {initialSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Date d&apos;émission</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Date d&apos;échéance</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Montant TTC (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Statut</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SupplierInvoiceStatus)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                  >
                    <option value="a_payer">À payer</option>
                    <option value="payee">Payée</option>
                    <option value="en_retard">En retard</option>
                    <option value="a_verifier">À vérifier</option>
                    <option value="contestee">Contestée</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-semibold hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs"
                >
                  Enregistrer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
