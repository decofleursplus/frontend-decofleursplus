'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  FileCheck,
  X,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { initialSupplierOrders, initialSuppliers } from '@/lib/admin/mock-data/suppliers';
import { SupplierOrder, SupplierOrderStatus } from '@/lib/admin/mock-data/types';

export default function AdminApprovisionnementsPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>(initialSupplierOrders);
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierOrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New order state
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSuppliers[0].id);
  const [orderItems, setOrderItems] = useState<{ name: string; qty: number; unitPrice: number; total: number }[]>([
    { name: 'Roses rouges (Tige longue)', qty: 100, unitPrice: 500, total: 50000 },
    { name: 'Lys blanc royal', qty: 50, unitPrice: 1200, total: 60000 },
  ]);
  const [notes, setNotes] = useState('Approvisionnement prioritaire pour les commandes de la semaine.');

  const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0);

  const handleAddItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { name: 'Feuillage eucalyptus', qty: 25, unitPrice: 600, total: 15000 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = initialSuppliers.find((s) => s.id === selectedSupplierId) || initialSuppliers[0];
    const newOrder: SupplierOrder = {
      id: `CF-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      date: 'Aujourd’hui',
      expectedDate: 'Dans 3 jours',
      items: orderItems.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: it.name,
        orderedQty: it.qty,
        receivedQty: 0,
        unitPrice: it.unitPrice,
        total: it.total,
        status: 'en_attente',
      })),
      subtotal: subtotal,
      deliveryFee: 0,
      total: subtotal,
      status: 'envoyee',
      notes: notes,
    };

    setOrders([newOrder, ...orders]);
    setIsNewOrderModalOpen(false);
    alert(`Commande ${newOrder.id} créée avec succès et bon de commande généré !`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  const getStatusBadge = (status: SupplierOrderStatus) => {
    switch (status) {
      case 'envoyee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Envoyée</span>;
      case 'validee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Validée</span>;
      case 'en_cours':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">En cours</span>;
      case 'receptionnee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Réceptionnée</span>;
      case 'annulee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">Annulée</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Brouillon</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── En-tête (Maquette Écran 8) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Commande fournisseurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créez et suivez vos commandes d&apos;approvisionnement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-fit"
        >
          <Plus size={18} /> Nouvelle commande
        </button>
      </div>

      {/* ── Onglets de Statut avec Compteurs (Maquette Écran 8) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'all' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Toutes (24)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('brouillon')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'brouillon' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Brouillon (4)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('a_valider')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'a_valider' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          À valider (3)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('envoyee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'envoyee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Envoyées (5)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('receptionnee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'receptionnee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Réceptionnées (10)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('annulee')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            statusFilter === 'annulee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Annulées (2)
        </button>
      </div>

      {/* ── Recherche & Filtres Déroulants (Maquette Écran 8) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une commande..."
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

      {/* ── Tableau des Commandes (Maquette Écran 8) ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">N° commande</th>
                <th className="py-3.5 px-5">Fournisseur</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-right">Montant</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#173f22]">
                    <Link
                      href={`/admin/approvisionnements/reception/${order.id}`}
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <Boxes size={14} className="text-[#c8436e]" />
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-4 px-5 font-semibold text-foreground">
                    {order.supplierName}
                  </td>
                  <td className="py-4 px-5 text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-[#c8436e]">
                    {order.total.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-4 px-5">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/approvisionnements/reception/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#edf8ef] hover:bg-[#d8eedb] text-[#193e23] font-semibold text-xs transition-colors"
                        title="Vérifier la réception des produits"
                      >
                        <Eye size={13} /> Réception
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modale "+ Nouvelle commande" ── */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-border max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between bg-[#faf8f5]">
              <h3 className="font-serif font-bold text-lg text-[#173f22]">
                Créer une commande d&apos;approvisionnement
              </h3>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Fournisseur destinataire</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none text-xs"
                >
                  {initialSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.categories.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold text-muted-foreground">Lignes de commande</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[#c8436e] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} /> Ajouter un produit
                  </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#faf8f5] text-muted-foreground">
                      <tr>
                        <th className="p-2 text-left">Produit</th>
                        <th className="p-2 text-center w-16">Qté</th>
                        <th className="p-2 text-right w-24">Prix unit.</th>
                        <th className="p-2 text-right w-24">Total</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrderItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, name: val } : it))
                                );
                              }}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 1;
                                setOrderItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, qty: val, total: val * it.unitPrice } : it))
                                );
                              }}
                              className="w-full p-1 border rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setOrderItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, unitPrice: val, total: it.qty * val } : it))
                                );
                              }}
                              className="w-full p-1 border rounded text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-bold">
                            {item.total.toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#faf8f5] font-bold text-xs">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right">Montant estimé :</td>
                        <td className="p-2.5 text-right text-sm text-[#c8436e] font-extrabold">
                          {subtotal.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Notes &amp; Instructions de livraison</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-semibold hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs"
                >
                  Générer et transmettre le bon de commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
