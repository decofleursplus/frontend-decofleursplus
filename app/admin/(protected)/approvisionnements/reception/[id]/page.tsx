'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Save,
  FileText,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { initialSupplierOrders } from '@/lib/admin/mock-data/suppliers';
import { SupplierOrderItem } from '@/lib/admin/mock-data/types';

export default function AdminReceptionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const order = initialSupplierOrders.find((o) => o.id === resolvedParams.id) || initialSupplierOrders[0];

  const [items, setItems] = useState<SupplierOrderItem[]>(order.items);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleQtyChange = (itemId: string, newReceivedQty: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const validQty = Math.max(0, newReceivedQty);
        let newStatus: 'complete' | 'partielle' | 'en_attente' = 'en_attente';
        if (validQty >= it.orderedQty) newStatus = 'complete';
        else if (validQty > 0) newStatus = 'partielle';

        return {
          ...it,
          receivedQty: validQty,
          status: newStatus,
        };
      })
    );
  };

  const handleSaveReception = () => {
    setSavedSuccess(true);
    toast.success(`Réception #${order.id} enregistrée ! Stocks mis à jour.`);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const isAllComplete = items.every((i) => i.status === 'complete');
  const isPartielle = items.some((i) => i.status === 'partielle') || (!isAllComplete && items.some((i) => i.receivedQty > 0));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/approvisionnements" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft size={14} /> Commandes fournisseurs
        </Link>
        <span>›</span>
        <span className="font-semibold text-foreground">Réception #{order.id}</span>
      </div>

      {/* ── En-tête de Réception (Maquette Écran 9) ── */}
      <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#173f22]">
              Réception #{order.id}
            </h1>
            {isAllComplete ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Complète
              </span>
            ) : isPartielle ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Partielle
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                En attente
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/approvisionnements"
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Voir la commande
            </Link>
          </div>
        </div>

        {/* Méta-données Fournisseur, Date, Montant (Maquette Écran 9) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 size={16} className="text-[#c8436e]" />
            <span>Fournisseur : <strong className="text-foreground">{order.supplierName}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} className="text-[#c8436e]" />
            <span>Date : <strong className="text-foreground">{order.date}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground sm:justify-end">
            <span>Total : <strong className="text-foreground text-sm font-bold text-[#c8436e]">{order.total.toLocaleString('fr-FR')} FCFA</strong></span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} />
          Réception enregistrée avec succès ! Les stocks de la boutique ont été automatiquement incrémentés.
        </div>
      )}

      {/* ── Liste Mobile (lg:hidden) ── */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-foreground text-sm leading-snug">
                {item.name}
              </span>
              {item.status === 'complete' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  <CheckCircle2 size={12} /> Complète
                </span>
              ) : item.status === 'partielle' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 shrink-0">
                  <AlertTriangle size={12} /> Partielle
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 shrink-0">
                  <Clock size={12} /> En attente
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Qté commandée</span>
                <span className="font-mono font-bold text-foreground">{item.orderedQty}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Prix achat</span>
                <span className="font-mono font-bold text-muted-foreground">{item.unitPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-dashed border-border/80">
              <label className="text-xs font-semibold text-[#173f22] flex items-center gap-1.5">
                <Pencil size={12} className="text-[#c8436e]" />
                Qté reçue :
              </label>
              <div className="relative inline-flex items-center">
                <input
                  type="number"
                  min={0}
                  value={item.receivedQty}
                  onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                  className="w-28 pl-3 pr-8 py-2 rounded-xl border border-[#c4d6c7] bg-white text-center font-bold text-sm outline-none focus:ring-2 focus:ring-[#193e23]/20 focus:border-[#193e23] shadow-2xs transition-all"
                  title="Modifier la quantité reçue"
                />
                <Pencil size={12} className="absolute right-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tableau de Réception Desktop (hidden lg:block) ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">Produit</th>
                <th className="py-3.5 px-5 text-center">Qté commandée</th>
                <th className="py-3.5 px-5 text-center">
                  <span className="inline-flex items-center gap-1.5 justify-center text-[#173f22] font-bold" title="Colonne éditable directement">
                    Qté reçue
                    <Pencil size={13} className="text-[#c8436e]" />
                  </span>
                </th>
                <th className="py-3.5 px-5 text-right">Prix achat</th>
                <th className="py-3.5 px-5 text-center">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-foreground">
                    {item.name}
                  </td>
                  <td className="py-4 px-5 text-center font-mono font-medium">
                    {item.orderedQty}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <input
                        type="number"
                        min={0}
                        value={item.receivedQty}
                        onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                        className="w-24 pl-3 pr-7 py-1.5 rounded-lg border border-[#c4d6c7] bg-white text-center font-bold text-xs outline-none focus:ring-2 focus:ring-[#193e23]/20 focus:border-[#193e23] shadow-2xs transition-all"
                        title="Modifier la quantité reçue"
                      />
                      <Pencil size={11} className="absolute right-2 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-medium text-muted-foreground">
                    {item.unitPrice.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-4 px-5 text-center">
                    {item.status === 'complete' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={12} /> Complète
                      </span>
                    ) : item.status === 'partielle' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle size={12} /> Partielle
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        <Clock size={12} /> En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Boutons d'Action (Responsive) ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-white shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Link
          href="/admin/approvisionnements"
          className="px-5 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted transition-colors text-center"
        >
          Retour aux commandes
        </Link>
        <button
          type="button"
          onClick={handleSaveReception}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-bold shadow-sm transition-colors active:scale-95"
        >
          <Save size={16} /> Enregistrer la réception
        </button>
      </div>
    </div>
  );
}
